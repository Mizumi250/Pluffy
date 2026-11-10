use base64::{engine::general_purpose::STANDARD, Engine};
use serde_json::Value;
use std::{collections::BTreeMap, fs, path::Path};

pub fn write_module(module_dir: &Path, payload: &Value) -> Result<bool, String> {
    let name = payload["name"]
        .as_str()
        .ok_or_else(|| "Missing module name while generating Rust handlers".to_owned())?;
    let generated_dir = module_dir.join("generated");
    fs::create_dir_all(&generated_dir)
        .map_err(|error| format!("Could not create generated Rust source directory: {error}"))?;

    let mut handlers = BTreeMap::new();
    for api in payload["apis"].as_array().into_iter().flatten() {
        for (endpoint_name, endpoint) in api["endpoints"].as_object().into_iter().flatten() {
            if let Some(body) = endpoint.get("body").and_then(Value::as_str) {
                if let Some(body) = decode_body(body, &format!("endpoint {endpoint_name}"))? {
                    handlers.insert(format!("endpoint:{endpoint_name}"), body);
                }
            }
        }
    }
    for route in payload["customRoutes"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["routes"].as_array().into_iter().flatten())
    {
        let Some(handler) = route["handler"].as_str() else {
            continue;
        };
        if let Some(body) = route.get("body").and_then(Value::as_str) {
            if let Some(body) = decode_body(body, &format!("handler {handler}"))? {
                handlers.insert(format!("handler:{handler}"), body);
            }
        }
    }
    handlers.extend(job_handlers(payload)?);
    handlers.extend(console_handlers(payload)?);
    handlers.extend(event_listener_handlers(payload)?);

    let prelude = payload["rustPrelude"]
        .as_str()
        .filter(|source| !only_comments_or_whitespace(source));
    let path = generated_dir.join(format!("{name}.rs"));
    if handlers.is_empty() && prelude.is_none() {
        match fs::remove_file(&path) {
            Ok(()) => return Ok(true),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(false),
            Err(error) => {
                return Err(format!(
                    "Could not remove stale generated Rust source for {name}: {error}"
                ))
            }
        }
    }

    let mut source = String::from(
        "use crate::generated_runtime::{Database, HandlerError, HandlerResponse, RequestContext, ResponseContext, ValidationError, utc_now_rfc3339};\n\
         use axum::http::StatusCode;\n\
         use serde_json::{json, Map, Value};\n\n\
         ",
    );
    if let Some(prelude) = prelude {
        source.push_str(prelude);
        source.push_str("\n\n");
    }
    source.push_str(
        "pub fn dispatch(handler: &str, request: RequestContext, database: Database, response: ResponseContext) -> Result<HandlerResponse, HandlerError> {\n\
             match handler {\n",
    );
    for (handler, body) in handlers {
        source.push_str(&format!("        {handler:?} => {{\n{body}\n        }},\n"));
    }
    source.push_str(
        "        _ => Err(HandlerError(format!(\"Generated handler not found: {}\", handler))),\n\
             }\n\
         }\n",
    );
    if fs::read_to_string(&path).is_ok_and(|existing| existing == source) {
        return Ok(false);
    }
    fs::write(&path, source)
        .map_err(|error| format!("Could not write generated Rust handlers for {name}: {error}"))?;
    Ok(true)
}

pub fn validate_payload_sources(payload: &Value) -> Result<(), String> {
    if let Some(source) = payload["rustPrelude"].as_str() {
        if source.trim().is_empty() {
            return Err("Rust module source block must not be empty".to_owned());
        }
    }
    for api in payload["apis"].as_array().into_iter().flatten() {
        for (endpoint_name, endpoint) in api["endpoints"].as_object().into_iter().flatten() {
            if let Some(body) = endpoint.get("body").and_then(Value::as_str) {
                decode_body(body, &format!("endpoint {endpoint_name}"))?;
            }
        }
    }
    for route in payload["customRoutes"]
        .as_array()
        .into_iter()
        .flatten()
        .flat_map(|group| group["routes"].as_array().into_iter().flatten())
    {
        if let (Some(handler), Some(body)) = (
            route["handler"].as_str(),
            route.get("body").and_then(Value::as_str),
        ) {
            decode_body(body, &format!("handler {handler}"))?;
        }
    }
    job_handlers(payload)?;
    console_handlers(payload)?;
    event_listener_handlers(payload)?;
    Ok(())
}

fn console_handlers(payload: &Value) -> Result<BTreeMap<String, String>, String> {
    let mut handlers = BTreeMap::new();
    for (index, section) in payload["consoles"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .enumerate()
    {
        let Some((name, _)) = section.trim().split_once(':') else {
            continue;
        };
        let name = name.trim();
        let Some(encoded_body) = section
            .lines()
            .find_map(|line| line.trim().strip_prefix("body:").map(str::trim))
        else {
            continue;
        };
        let encoded_body = encoded_body.trim_matches(['\'', '"']);
        if let Some(body) =
            decode_body(encoded_body, &format!("console {name} in block {index}"))?
        {
            let key = format!("console:{name}");
            if handlers
                .insert(key, body.clone())
                .is_some_and(|existing| existing != body)
            {
                return Err(format!("Rust console {name} has conflicting source bodies"));
            }
        }
    }
    Ok(handlers)
}

fn job_handlers(payload: &Value) -> Result<BTreeMap<String, String>, String> {
    let mut handlers = BTreeMap::new();
    for (index, section) in payload["jobs"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .enumerate()
    {
        let Some((name, _)) = section.trim().split_once(':') else {
            continue;
        };
        let name = name.trim();
        let Some(encoded_body) = section
            .lines()
            .find_map(|line| line.trim().strip_prefix("body:").map(str::trim))
        else {
            continue;
        };
        let encoded_body = encoded_body.trim_matches(['\'', '"']);
        if let Some(body) = decode_body(encoded_body, &format!("job {name} in block {index}"))? {
            let key = format!("job:{name}");
            if handlers
                .insert(key, body.clone())
                .is_some_and(|existing| existing != body)
            {
                return Err(format!("Rust job {name} has conflicting source bodies"));
            }
        }
    }
    Ok(handlers)
}

fn event_listener_handlers(payload: &Value) -> Result<BTreeMap<String, String>, String> {
    let mut handlers = BTreeMap::new();
    for (index, section) in payload["events"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .enumerate()
    {
        let Some(encoded_bodies) = section
            .lines()
            .find_map(|line| line.trim().strip_prefix("listener_bodies:").map(str::trim))
        else {
            continue;
        };
        let encoded_bodies = encoded_bodies.trim_matches(['\'', '"']);
        let bodies = STANDARD.decode(encoded_bodies).map_err(|error| {
            format!("Invalid listener-body map for Rust event {index}: {error}")
        })?;
        let bodies: serde_json::Map<String, Value> =
            serde_json::from_slice(&bodies).map_err(|error| {
                format!("Invalid listener-body map for Rust event {index}: {error}")
            })?;
        for (listener, encoded_body) in bodies {
            let Some(encoded_body) = encoded_body.as_str() else {
                return Err(format!(
                    "Rust listener body for {listener} must be a base64 string"
                ));
            };
            if let Some(body) = decode_body(encoded_body, &format!("listener {listener}"))? {
                let key = format!("listener:{listener}");
                if handlers
                    .insert(key, body.clone())
                    .is_some_and(|existing| existing != body)
                {
                    return Err(format!(
                        "Rust listener {listener} has conflicting source bodies"
                    ));
                }
            }
        }
    }
    Ok(handlers)
}

fn decode_body(body: &str, label: &str) -> Result<Option<String>, String> {
    let decoded = STANDARD
        .decode(body)
        .map_err(|error| format!("Invalid base64 source for Rust {label}: {error}"))?;
    let source = String::from_utf8(decoded)
        .map_err(|error| format!("Rust source for {label} is not valid UTF-8: {error}"))?;
    if only_comments_or_whitespace(&source) {
        return Ok(None);
    }
    Ok(Some(source))
}

pub fn has_executable_body(body: &str) -> bool {
    STANDARD
        .decode(body)
        .ok()
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .is_some_and(|source| !only_comments_or_whitespace(&source))
}

pub fn is_comment_only_body(body: &str) -> bool {
    STANDARD
        .decode(body)
        .ok()
        .and_then(|bytes| String::from_utf8(bytes).ok())
        .is_some_and(|source| only_comments_or_whitespace(&source))
}

fn only_comments_or_whitespace(source: &str) -> bool {
    let mut in_block_comment = false;
    for line in source.lines() {
        let mut remaining = line.trim();
        loop {
            if remaining.is_empty() {
                break;
            }
            if in_block_comment {
                if let Some((_, rest)) = remaining.split_once("*/") {
                    remaining = rest.trim();
                    in_block_comment = false;
                    continue;
                }
                break;
            }
            if remaining.starts_with("//") {
                break;
            }
            if let Some(rest) = remaining.strip_prefix("/*") {
                in_block_comment = true;
                remaining = rest.trim();
                continue;
            }
            return false;
        }
    }
    true
}

#[cfg(test)]
mod tests {
    use super::*;
    use base64::Engine as _;
    use serde_json::json;

    #[test]
    fn generates_endpoint_and_custom_route_source_from_rs_bodies() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "apis": [{
                "endpoints": {
                    "echo": {
                        "body": STANDARD.encode("response.json(StatusCode::OK, json!({\"from_tatemono\": true}))")
                    }
                }
            }],
            "customRoutes": [{
                "routes": [
                    {
                        "handler": "ping",
                        "body": STANDARD.encode("response.json(StatusCode::OK, json!({\"handler\": \"ping\"}))")
                    },
                    {
                        "handler": "empty",
                        "body": STANDARD.encode("// Tatemono placeholder")
                    }
                ]
            }]
        });

        assert!(write_module(directory.path(), &payload).unwrap());
        let source = fs::read_to_string(directory.path().join("generated/sample.rs")).unwrap();
        assert!(source.contains("\"endpoint:echo\""));
        assert!(source.contains("\"handler:ping\""));
        assert!(source.contains("from_tatemono"));
        assert!(!source.contains("\"handler:empty\""));
    }

    #[test]
    fn includes_tatemono_module_source_before_handlers() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "rustPrelude": "mod shared { pub fn answer() -> i32 { 42 } }",
            "apis": [{
                "endpoints": {
                    "echo": {
                        "body": STANDARD.encode("response.json(StatusCode::OK, json!({\"value\": shared::answer()}))")
                    }
                }
            }]
        });

        assert!(write_module(directory.path(), &payload).unwrap());
        let source = fs::read_to_string(directory.path().join("generated/sample.rs")).unwrap();
        assert!(source.contains("mod shared { pub fn answer() -> i32 { 42 } }"));
        assert!(source.find("mod shared").unwrap() < source.find("pub fn dispatch").unwrap());
    }

    #[test]
    fn generates_listener_handlers_from_tatemono_event_sources() {
        let directory = tempfile::tempdir().unwrap();
        let listener_source = r#"
database.insert("event_log", json!({"listener_name": "Listener"}))?;
response.json(StatusCode::OK, json!({"message": "Listener completed"}))
"#;
        let listener_bodies = json!({
            "Listener": STANDARD.encode(listener_source)
        });
        let encoded_listener_bodies =
            STANDARD.encode(serde_json::to_vec(&listener_bodies).unwrap());
        let payload = json!({
            "name": "sample",
            "events": [format!(
                "sample-event:\n  listeners: [Listener]\n  listener_bodies: '{}'",
                encoded_listener_bodies
            )]
        });

        assert!(event_listener_handlers(&payload)
            .unwrap()
            .contains_key("listener:Listener"));
        assert!(write_module(directory.path(), &payload).unwrap());
        let source = fs::read_to_string(directory.path().join("generated/sample.rs")).unwrap();
        assert!(source.contains("\"listener:Listener\""), "{source}");
        assert!(source.contains("database.insert(\"event_log\""));
    }

    #[test]
    fn generates_rust_job_handlers_from_tatemono_job_sources() {
        let directory = tempfile::tempdir().unwrap();
        let job_source = r#"
database.insert("job_results", json!({"status": "completed"}))?;
response.json(StatusCode::OK, json!({"message": "Job completed"}))
"#;
        let payload = json!({
            "name": "sample",
            "jobs": [format!(
                "sample-job:\n  queue: default\n  body: '{}'",
                STANDARD.encode(job_source)
            )]
        });

        assert!(job_handlers(&payload).unwrap().contains_key("job:sample-job"));
        assert!(write_module(directory.path(), &payload).unwrap());
        let source = fs::read_to_string(directory.path().join("generated/sample.rs")).unwrap();
        assert!(source.contains("\"job:sample-job\""), "{source}");
        assert!(source.contains("database.insert(\"job_results\""));
    }

    #[test]
    fn generates_rust_console_handlers_from_tatemono_console_sources() {
        let directory = tempfile::tempdir().unwrap();
        let console_source = r#"
let record = database.insert("command_runs", json!({"command_name": "sample"}))?;
response.json(StatusCode::CREATED, json!({"data": record}))
"#;
        let payload = json!({
            "name": "sample",
            "consoles": [format!(
                "sample-command:\n  signature: sample:command\n  body: '{}'",
                STANDARD.encode(console_source)
            )]
        });

        assert!(console_handlers(&payload)
            .unwrap()
            .contains_key("console:sample-command"));
        assert!(write_module(directory.path(), &payload).unwrap());
        let source = fs::read_to_string(directory.path().join("generated/sample.rs")).unwrap();
        assert!(source.contains("\"console:sample-command\""), "{source}");
        assert!(source.contains("database.insert(\"command_runs\""));
    }

    #[test]
    fn rejects_invalid_encoded_rust_bodies() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "apis": [{"endpoints": {"echo": {"body": "not-base64!"}}}]
        });

        let error = write_module(directory.path(), &payload).unwrap_err();
        assert!(error.contains("Invalid base64 source for Rust endpoint echo"));
    }
}
