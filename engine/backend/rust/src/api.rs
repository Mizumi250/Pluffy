use crate::db::{
    types::{Value as SqlValue, ValueRef},
    Connection, OptionalExtension,
};
use serde_json::{json, Map, Value};
use std::{
    collections::HashMap,
    fs,
    path::{Path, PathBuf},
};

pub struct MatchedRoute {
    pub name: String,
    pub endpoint: Value,
    pub table: String,
    pub schema: Value,
    pub model: String,
    pub middleware: Vec<Value>,
    pub supported: bool,
}

pub fn match_route(module: &Value, method: &str, path: &str) -> Option<MatchedRoute> {
    for api in module.get("apis")?.as_array()? {
        let model = api.get("model").and_then(Value::as_str)?;
        let table = super::database::table_for_model(module, api);
        let schema = table
            .and_then(|table| {
                module["databases"]
                    .as_array()?
                    .iter()
                    .find(|database| database["table"].as_str() == Some(table))
                    .cloned()
            })
            .unwrap_or_else(|| json!({}));
        let table = table.unwrap_or_default();
        let prefix = api
            .get("prefix")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .unwrap_or_else(|| {
                format!(
                    "/api/{}/{}",
                    module["name"].as_str().unwrap_or_default(),
                    pluralize(&snake(model))
                )
            });
        let middleware = api
            .get("middleware")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();

        if let Some(endpoints) = api
            .get("endpoints")
            .and_then(Value::as_object)
            .filter(|endpoints| !endpoints.is_empty())
        {
            for (name, endpoint) in endpoints {
                let Some(endpoint_object) = endpoint.as_object() else {
                    continue;
                };
                let default_method = default_method(name).unwrap_or("GET");
                let route_method = endpoint_object
                    .get("method")
                    .and_then(Value::as_str)
                    .unwrap_or(default_method);
                let default_path = default_path(name).unwrap_or("/");
                let endpoint_path = endpoint_object
                    .get("route")
                    .and_then(Value::as_str)
                    .unwrap_or(default_path);
                let route = join_path(&prefix, endpoint_path);
                if route_method.eq_ignore_ascii_case(method) && match_path(&route, path) {
                    let mut route_middleware = middleware.clone();
                    route_middleware.extend(
                        endpoint_object
                            .get("middleware")
                            .and_then(Value::as_array)
                            .into_iter()
                            .flatten()
                            .cloned(),
                    );
                    return Some(MatchedRoute {
                        name: name.clone(),
                        endpoint: endpoint.clone(),
                        table: table.to_owned(),
                        schema: schema.clone(),
                        model: model.to_owned(),
                        middleware: route_middleware,
                        supported: supported_endpoint(name, endpoint, model)
                            && (is_emulated_endpoint(name, endpoint, model)
                                || !endpoint.get("body").and_then(Value::as_str).is_some_and(
                                    |body| !crate::generator::is_comment_only_body(body),
                                ))
                            && validation_supported(endpoint_object.get("validation")),
                    });
                }
            }
        } else {
            for name in ["index", "show", "store", "update", "destroy"] {
                if default_method(name).is_some_and(|route_method| route_method == method)
                    && match_path(&join_path(&prefix, default_path(name).unwrap()), path)
                {
                    return Some(MatchedRoute {
                        name: name.to_owned(),
                        endpoint: json!({}),
                        table: table.to_owned(),
                        schema: schema.clone(),
                        model: model.to_owned(),
                        middleware,
                        supported: true,
                    });
                }
            }
        }
    }
    for group in module
        .get("customRoutes")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let middleware = group
            .get("middleware")
            .and_then(Value::as_array)
            .cloned()
            .unwrap_or_default();
        for route in group
            .get("routes")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
        {
            let route_method = route.get("method").and_then(Value::as_str).unwrap_or("GET");
            let route_path = route.get("route").and_then(Value::as_str).unwrap_or("/");
            let Some(handler) = route.get("handler").and_then(Value::as_str) else {
                continue;
            };
            if !route_method.eq_ignore_ascii_case(method) || !match_path(route_path, path) {
                continue;
            }
            let name = format!("handler:{handler}");
            return Some(MatchedRoute {
                name: name.clone(),
                endpoint: route.clone(),
                table: String::new(),
                schema: json!({}),
                model: String::new(),
                middleware: middleware.clone(),
                supported: false,
            });
        }
    }
    None
}

pub fn route_count(module: &Value) -> usize {
    let api_count: usize = module
        .get("apis")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .map(
            |api| match api.get("endpoints").and_then(Value::as_object) {
                Some(endpoints) if !endpoints.is_empty() => endpoints
                    .iter()
                    .filter(|(name, _)| is_crud_name(name))
                    .count(),
                _ => 5,
            },
        )
        .sum();
    api_count
        + module
            .get("customRoutes")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
            .map(|group| {
                group
                    .get("routes")
                    .and_then(Value::as_array)
                    .map_or(0, Vec::len)
            })
            .sum::<usize>()
}

pub fn warnings(module: &Value) -> Vec<String> {
    let mut warnings = Vec::new();
    for api in module
        .get("apis")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        if api
            .get("middleware")
            .and_then(Value::as_array)
            .is_some_and(|middleware| {
                middleware
                    .iter()
                    .any(|middleware| match middleware.as_str() {
                        Some("requireJson") => false,
                        Some("auth") | Some("auth:sanctum") => {
                            module.get("auth").and_then(Value::as_bool) != Some(true)
                        }
                        Some(value) if value.starts_with("role:") => {
                            module.get("auth").and_then(Value::as_bool) != Some(true)
                        }
                        _ => true,
                    })
            })
        {
            warnings.push(format!(
                "API {} declares middleware; matched routes return 501 until Rust middleware execution is implemented",
                api["model"].as_str().unwrap_or("unknown")
            ));
        }
        for (name, endpoint) in api
            .get("endpoints")
            .and_then(Value::as_object)
            .into_iter()
            .flatten()
        {
            if endpoint
                .get("body")
                .and_then(Value::as_str)
                .is_some_and(super::generator::has_executable_body)
            {
                warnings.push(format!("Endpoint {name} uses a generated Rust :rs handler"));
            } else if !supported_endpoint(name, endpoint, api["model"].as_str().unwrap_or_default())
            {
                warnings.push(format!(
                    "Endpoint {name} has no supported generic CRUD implementation"
                ));
            } else if endpoint
                .get("type")
                .and_then(Value::as_str)
                .is_some_and(|kind| {
                    !matches!(kind, "index" | "show" | "store" | "update" | "destroy")
                        && !(kind == "event_fire" && name == "store")
                        && !(kind == "mail_send" && name == "store")
                        && !(kind == "job_dispatch" && name == "store")
                        && !(kind.starts_with("role_")
                            && matches!(
                                kind,
                                "role_admin_only"
                                    | "role_user_only"
                                    | "role_promote"
                                    | "role_demote"
                            ))
                        && !(kind == "notification_trigger" && name == "store")
                        && !(kind == "command_run" && name == "store")
                })
            {
                warnings.push(format!(
                    "Endpoint {name} uses a non-CRUD type; requests return 501"
                ));
            } else if !validation_supported(endpoint.get("validation")) {
                warnings.push(format!(
                    "Endpoint {name} uses unsupported validation rules; requests return 501"
                ));
            }
        }
    }
    for group in module
        .get("customRoutes")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
    {
        let has_unsupported_middleware = group
            .get("middleware")
            .and_then(Value::as_array)
            .is_some_and(|middleware| {
                middleware
                    .iter()
                    .any(|middleware| match middleware.as_str() {
                        Some("requireJson") => false,
                        Some("auth") | Some("auth:sanctum") => {
                            module.get("auth").and_then(Value::as_bool) != Some(true)
                        }
                        _ => true,
                    })
            });
        if has_unsupported_middleware {
            warnings.push(format!(
                "Custom route group {} declares middleware that returns 501 in the Rust engine",
                group["controller"].as_str().unwrap_or("unknown")
            ));
        }
        for route in group
            .get("routes")
            .and_then(Value::as_array)
            .into_iter()
            .flatten()
        {
            let handler = route
                .get("handler")
                .and_then(Value::as_str)
                .unwrap_or_default();
            if route
                .get("body")
                .and_then(Value::as_str)
                .is_some_and(super::generator::has_executable_body)
            {
                warnings.push(format!(
                    "Custom route handler {handler} uses a generated Rust :rs body"
                ));
            } else if route
                .get("body")
                .and_then(Value::as_str)
                .is_some_and(|body| !body.trim().is_empty())
            {
                warnings.push(format!(
                    "Custom route handler {handler} has no executable Rust :rs body and returns 501"
                ));
            }
        }
    }
    for (field, label) in [
        ("jobs", "Job"),
        ("notifications", "Notification"),
        ("mails", "Mail"),
        ("consoles", "Console"),
    ] {
        if module
            .get(field)
            .and_then(Value::as_array)
            .is_some_and(|sections| !sections.is_empty())
        {
            warnings.push(format!(
                "{label} DSL is registered but is not executed by the Rust engine"
            ));
        }
    }
    for field in ["middlewareSnippets", "policySnippets"] {
        if module
            .get(field)
            .and_then(Value::as_object)
            .is_some_and(|snippets| !snippets.is_empty())
        {
            warnings.push(format!(
                "{field} are registered but are not executed by the Rust engine"
            ));
        }
    }
    warnings.sort();
    warnings.dedup();
    warnings
}

fn is_crud_name(name: &str) -> bool {
    matches!(name, "index" | "show" | "store" | "update" | "destroy")
}

fn supported_endpoint(name: &str, endpoint: &Value, model: &str) -> bool {
    let kind = endpoint.get("type").and_then(Value::as_str);
    is_emulated_endpoint(name, endpoint, model)
        || matches!(
            kind,
            Some("upload" | "upload_index" | "upload_destroy" | "upload_url")
        )
        || (is_crud_name(name)
            && kind.is_none_or(|kind| {
                matches!(
                    kind,
                    "index" | "show" | "store" | "update" | "destroy" | "broadcast"
                ) && (kind != "broadcast" || name == "store")
                    || (kind == "event_fire" && name == "store")
                    || (kind == "mail_send" && name == "store")
                    || (kind == "job_dispatch" && name == "store")
            }))
}

fn is_emulated_endpoint(name: &str, endpoint: &Value, model: &str) -> bool {
    let kind = endpoint.get("type").and_then(Value::as_str);
    if matches!(
        kind,
        Some(
            "role_admin_only"
                | "role_user_only"
                | "role_promote"
                | "role_demote"
                | "notification_trigger"
                | "command_run"
        )
    ) {
        return true;
    }
    if model == "Notification" && matches!(name, "index" | "store" | "destroy" | "readAll") {
        return true;
    }
    if name == "destroy"
        && endpoint["route"] == "/runs"
        && endpoint["response"]["value"] == "Runs cleared"
    {
        return true;
    }
    false
}

fn valid_unique_argument(argument: &str) -> bool {
    if argument.is_empty() {
        return true;
    }
    let parts: Vec<_> = argument.split(',').collect();
    matches!(parts.len(), 1 | 2)
        && parts
            .iter()
            .all(|part| super::engine::is_identifier(part.trim()))
}

fn validation_supported(validation: Option<&Value>) -> bool {
    validation
        .and_then(Value::as_object)
        .map(|rules| {
            rules.values().all(|rule| {
                rule.as_str().is_some_and(|rule| {
                    rule.split('|').all(|rule| {
                        let (name, argument) = rule.split_once(':').unwrap_or((rule, ""));
                        let valid_rule = matches!(
                            name,
                            "required"
                                | "sometimes"
                                | "nullable"
                                | "file"
                                | "image"
                                | "mimes"
                                | "mimetypes"
                                | "string"
                                | "integer"
                                | "numeric"
                                | "boolean"
                                | "array"
                                | "email"
                                | "in"
                                | "unique"
                                | "max"
                                | "min"
                        );
                        valid_rule
                            && if matches!(name, "max" | "min") {
                                argument.parse::<f64>().is_ok()
                            } else if name == "in" {
                                !argument.is_empty()
                                    && argument.split(',').all(|option| !option.is_empty())
                            } else if name == "unique" {
                                valid_unique_argument(argument)
                            } else {
                                argument.is_empty()
                            }
                    })
                })
            })
        })
        .unwrap_or(validation.is_none())
}

fn default_method(name: &str) -> Option<&'static str> {
    match name {
        "index" | "show" => Some("GET"),
        "store" => Some("POST"),
        "update" => Some("PUT"),
        "destroy" => Some("DELETE"),
        _ => None,
    }
}

fn default_path(name: &str) -> Option<&'static str> {
    match name {
        "index" | "store" => Some("/"),
        "show" | "update" | "destroy" => Some("/{id}"),
        _ => None,
    }
}

fn join_path(prefix: &str, route: &str) -> String {
    let prefix = prefix.trim_end_matches('/');
    let route = route.trim_start_matches('/');
    if prefix.is_empty() {
        format!("/{route}")
    } else if route.is_empty() {
        prefix.to_owned()
    } else {
        format!("{prefix}/{route}")
    }
}

fn match_path(pattern: &str, path: &str) -> bool {
    let pattern_segments: Vec<_> = pattern.trim_matches('/').split('/').collect();
    let path_segments: Vec<_> = path.trim_matches('/').split('/').collect();
    if pattern_segments.len() != path_segments.len() {
        return false;
    }
    pattern_segments
        .iter()
        .zip(path_segments)
        .all(|(pattern, value)| {
            (pattern.starts_with('{') && pattern.ends_with('}')) || *pattern == value
        })
}

pub fn execute(
    database_dir: &Path,
    slug: &str,
    table: &str,
    action: &str,
    endpoint: &Value,
    schema: &Value,
    model: &str,
    path: &str,
    body: &Value,
    query_string: &str,
) -> (axum::http::StatusCode, Value) {
    let connection = match open_connection(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => return internal_error(error),
    };
    match action {
        "index" => index(&connection, table, endpoint, schema, query_string),
        "show" => with_id(
            &connection,
            table,
            endpoint,
            schema,
            model,
            path,
            "show",
            body,
        ),
        "store" => store(&connection, table, endpoint, schema, body),
        "update" => with_id(
            &connection,
            table,
            endpoint,
            schema,
            model,
            path,
            "update",
            body,
        ),
        "destroy" => with_id(
            &connection,
            table,
            endpoint,
            schema,
            model,
            path,
            "destroy",
            body,
        ),
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Endpoint {action} is not implemented by the Rust engine")}),
        ),
    }
}

struct MultipartUpload {
    filename: String,
    content_type: String,
    data: Vec<u8>,
}

fn parse_multipart(boundary: Option<&str>, bytes: &[u8]) -> Result<Vec<MultipartUpload>, String> {
    let boundary = boundary.ok_or_else(|| "Missing multipart boundary".to_owned())?;
    let marker = format!("--{boundary}");
    let mut parts = Vec::new();
    for part in bytes.split(marker.as_bytes()) {
        if part.len() < 4 {
            continue;
        }
        let mut body = &part[..];
        if let Some(rest) = body.strip_prefix(b"\r\n") {
            body = rest;
        } else if let Some(rest) = body.strip_prefix(b"\n") {
            body = rest;
        }
        let Some((headers, content)) = body.split_once(b"\r\n\r\n") else {
            continue;
        };
        let headers_text = String::from_utf8_lossy(headers);
        let disposition = headers_text
            .lines()
            .find(|line| {
                line.to_ascii_lowercase()
                    .starts_with("content-disposition:")
            })
            .unwrap_or_default();
        let field_name = disposition
            .split(';')
            .find_map(|item| {
                let item = item.trim();
                item.strip_prefix("name=\"")
                    .and_then(|value| value.strip_suffix('"'))
            })
            .unwrap_or_default();
        if field_name != "files" && !field_name.starts_with("files") {
            continue;
        }
        let filename = disposition
            .split(';')
            .find_map(|item| {
                let item = item.trim();
                item.strip_prefix("filename=\"")
                    .and_then(|value| value.strip_suffix('"'))
            })
            .unwrap_or_default();
        if filename.is_empty() {
            continue;
        }
        let content_type = headers_text
            .lines()
            .find(|line| line.to_ascii_lowercase().starts_with("content-type:"))
            .and_then(|line| {
                line.split_once(':')
                    .map(|(_, value)| value.trim().to_owned())
            })
            .unwrap_or_else(|| "application/octet-stream".to_owned());
        let mut data = content.to_vec();
        if data.ends_with(b"\r\n") {
            data.truncate(data.len() - 2);
        }
        parts.push(MultipartUpload {
            filename: filename.to_owned(),
            content_type,
            data,
        });
    }
    if parts.is_empty() {
        return Err("The files field is required".to_owned());
    }
    Ok(parts)
}

pub fn execute_upload(
    database_dir: &Path,
    slug: &str,
    table: &str,
    kind: &str,
    id: &str,
    bytes: &[u8],
    content_type: Option<&str>,
    user_id: Option<i64>,
    public_root: &Path,
) -> (axum::http::StatusCode, Value) {
    let connection = match open_connection(database_dir, slug) {
        Ok(value) => value,
        Err(error) => return internal_error(error),
    };
    match kind {
        "upload_index" => {
            let sql = format!("SELECT * FROM {} ORDER BY \"id\" DESC", quote(table));
            let mut statement = match connection.prepare(&sql) {
                Ok(value) => value,
                Err(error) => return internal_error(format!("Unable to read records: {error}")),
            };
            let rows = match statement.query_map([], |row| row_to_json(row, &json!({}))) {
                Ok(value) => value,
                Err(error) => return internal_error(format!("Unable to read records: {error}")),
            };
            let mut records = Vec::new();
            for row in rows {
                if let Ok(mut record) = row {
                    enrich_rust_upload(&mut record);
                    records.push(record);
                }
            }
            (
                axum::http::StatusCode::OK,
                json!({"data": records, "count": records.len()}),
            )
        }
        "upload_url" => {
            let mut statement = match connection.prepare(&format!(
                "SELECT \"disk_path\" FROM {} WHERE \"id\" = ?",
                quote(table)
            )) {
                Ok(value) => value,
                Err(error) => return internal_error(error.to_string()),
            };
            let disk_path = match statement.query_row([SqlValue::Text(id.to_owned())], |row| {
                row.get::<_, String>(0)
            }) {
                Ok(value) => value,
                Err(rusqlite::Error::QueryReturnedNoRows) => {
                    return (
                        axum::http::StatusCode::NOT_FOUND,
                        json!({"message":"Record not found"}),
                    )
                }
                Err(error) => return internal_error(error.to_string()),
            };
            let url = rust_upload_url(&disk_path);
            (
                axum::http::StatusCode::OK,
                json!({"data":{"url":url},"url":url}),
            )
        }
        "upload_destroy" => {
            let mut statement = match connection.prepare(&format!(
                "SELECT \"disk_path\" FROM {} WHERE \"id\" = ?",
                quote(table)
            )) {
                Ok(value) => value,
                Err(error) => return internal_error(error.to_string()),
            };
            let disk_path = match statement.query_row([SqlValue::Text(id.to_owned())], |row| {
                row.get::<_, String>(0)
            }) {
                Ok(value) => value,
                Err(rusqlite::Error::QueryReturnedNoRows) => {
                    return (
                        axum::http::StatusCode::NOT_FOUND,
                        json!({"message":"Record not found"}),
                    )
                }
                Err(error) => return internal_error(error.to_string()),
            };
            match fs::remove_file(public_root.join(&disk_path)) {
                Ok(_) => {}
                Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
                Err(error) => {
                    return internal_error(format!("Unable to delete uploaded file: {error}"));
                }
            }
            match connection.execute(
                &format!("DELETE FROM {} WHERE \"id\" = ?", quote(table)),
                [SqlValue::Text(id.to_owned())],
            ) {
                Ok(0) => (
                    axum::http::StatusCode::NOT_FOUND,
                    json!({"message":"Record not found"}),
                ),
                Ok(_) => (
                    axum::http::StatusCode::OK,
                    json!({"message":"File deleted"}),
                ),
                Err(error) => internal_error(format!("Unable to delete record: {error}")),
            }
        }
        "upload" => {
            let boundary = content_type.and_then(|value| {
                value.split(';').find_map(|part| {
                    let part = part.trim();
                    part.strip_prefix("boundary=")
                        .map(|value| value.trim_matches('"'))
                })
            });
            let parts = match parse_multipart(boundary, bytes) {
                Ok(value) => value,
                Err(error) => {
                    return (
                        axum::http::StatusCode::BAD_REQUEST,
                        json!({"message":error}),
                    )
                }
            };
            let columns = column_names(&connection, table).unwrap_or_default();
            let mut created = Vec::new();
            for part in parts {
                if part.data.len() > 10 * 1024 * 1024 {
                    return (
                        axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                        json!({"message":"The file may not be greater than 10240 kilobytes.","errors":{"files":["The file may not be greater than 10240 kilobytes."]}}),
                    );
                }
                let original = Path::new(&part.filename)
                    .file_name()
                    .and_then(|value| value.to_str())
                    .unwrap_or("file")
                    .replace(['"', '\\'], "_");
                let ext = Path::new(&original)
                    .extension()
                    .and_then(|value| value.to_str())
                    .unwrap_or_default()
                    .to_ascii_lowercase();
                let mut random = [0u8; 16];
                if let Err(error) = getrandom::getrandom(&mut random) {
                    return internal_error(format!(
                        "Unable to generate uploaded file name: {error}"
                    ));
                }
                let stored_name = format!(
                    "{}{}",
                    random
                        .iter()
                        .map(|byte| format!("{byte:02x}"))
                        .collect::<String>(),
                    if ext.is_empty() {
                        String::new()
                    } else {
                        format!(".{ext}")
                    }
                );
                let disk_path = format!("arkzen/{slug}/{stored_name}");
                let full = public_root.join(&disk_path);
                if let Err(error) = fs::create_dir_all(full.parent().unwrap_or(public_root)) {
                    return internal_error(format!("Unable to create upload directory: {error}"));
                }
                if let Err(error) = fs::write(&full, &part.data) {
                    return internal_error(format!("Unable to store uploaded file: {error}"));
                }
                let mime_type = if part.content_type.is_empty() {
                    "application/octet-stream".to_owned()
                } else {
                    part.content_type
                };
                let is_image = mime_type.starts_with("image/");
                let mut fields = HashMap::from([
                    ("original_name", Value::String(original)),
                    ("stored_name", Value::String(stored_name)),
                    ("mime_type", Value::String(mime_type)),
                    ("size_bytes", Value::from(part.data.len() as i64)),
                    ("disk_path", Value::String(disk_path)),
                    ("is_image", Value::Bool(is_image)),
                ]);
                if let Some(user_id) = user_id {
                    if columns.iter().any(|column| column == "user_id") {
                        fields.insert("user_id", Value::from(user_id));
                    }
                }
                let names: Vec<_> = fields
                    .keys()
                    .filter(|name| columns.iter().any(|column| column == *name))
                    .cloned()
                    .collect();
                let placeholders = names
                    .iter()
                    .enumerate()
                    .map(|(index, _)| format!("?{}", index + 1))
                    .collect::<Vec<_>>()
                    .join(", ");
                let sql = format!(
                    "INSERT INTO {} ({}) VALUES ({})",
                    quote(table),
                    names
                        .iter()
                        .map(|name| quote(name))
                        .collect::<Vec<_>>()
                        .join(", "),
                    placeholders
                );
                let params: Vec<_> = names.iter().map(|name| sql_value(&fields[name])).collect();
                match connection.execute(&sql, crate::db::params_from_iter(params)) {
                    Ok(_) => {}
                    Err(error) => {
                        let _ = fs::remove_file(&full);
                        return internal_error(format!("Unable to create record: {error}"));
                    }
                }
                let id = connection.last_insert_rowid();
                let mut record = json!({"id": id});
                for name in &names {
                    if let Some(value) = fields.get(name) {
                        record[name] = value.clone();
                    }
                }
                enrich_rust_upload(&mut record);
                created.push(record);
            }
            (axum::http::StatusCode::CREATED, json!({"data":created}))
        }
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message":"Upload operation is not implemented"}),
        ),
    }
}

fn rust_upload_url(disk_path: &str) -> String {
    if disk_path.starts_with("/storage/") {
        disk_path.to_owned()
    } else {
        format!("/storage/{}", disk_path.trim_start_matches('/'))
    }
}

fn enrich_rust_upload(record: &mut Value) {
    if let Some(object) = record.as_object_mut() {
        let disk = object
            .get("disk_path")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .to_owned();
        let url = rust_upload_url(&disk);
        object.insert("url".to_owned(), Value::String(url.clone()));
        let image = object
            .get("is_image")
            .and_then(Value::as_bool)
            .unwrap_or(false);
        object.insert(
            "image_url".to_owned(),
            if image {
                Value::String(url)
            } else {
                Value::Null
            },
        );
    }
}

pub fn execute_upload_download(
    database_dir: &Path,
    slug: &str,
    table: &str,
    id: &str,
    public_root: &Path,
) -> axum::response::Response {
    let connection = match open_connection(database_dir, slug) {
        Ok(value) => value,
        Err(error) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message":error})),
            )
                .into_response()
        }
    };
    let mut statement = match connection.prepare(&format!(
        "SELECT \"disk_path\",\"stored_name\",\"mime_type\",\"original_name\" FROM {} WHERE \"id\" = ?",
        quote(table)
    )) {
        Ok(value) => value,
        Err(error) => return (axum::http::StatusCode::INTERNAL_SERVER_ERROR, Json(json!({"message":error.to_string()}))).into_response(),
    };
    let row = match statement.query_row([SqlValue::Text(id.to_owned())], |row| {
        Ok((
            row.get::<_, String>(0)?,
            row.get::<_, String>(1)?,
            row.get::<_, String>(2)?,
            row.get::<_, String>(3)?,
        ))
    }) {
        Ok(value) => value,
        Err(rusqlite::Error::QueryReturnedNoRows) => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                Json(json!({"message":"Record not found"})),
            )
                .into_response()
        }
        Err(error) => {
            return (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({"message":error.to_string()})),
            )
                .into_response()
        }
    };
    let (disk_path, stored_name, mut mime_type, original_name) = row;
    let full = public_root.join(&disk_path);
    let bytes = match fs::read(&full) {
        Ok(value) => value,
        Err(_) => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                Json(json!({"message":"Not Found"})),
            )
                .into_response()
        }
    };
    if mime_type.is_empty() {
        mime_type = match Path::new(&stored_name)
            .extension()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase()
            .as_str()
        {
            "png" => "image/png",
            "jpg" | "jpeg" => "image/jpeg",
            "gif" => "image/gif",
            "webp" => "image/webp",
            "txt" => "text/plain; charset=utf-8",
            "pdf" => "application/pdf",
            _ => "application/octet-stream",
        }
        .to_owned();
    }
    let name = Path::new(&original_name)
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or(&stored_name)
        .replace(['"', '\\'], "_");
    let disposition = if mime_type.starts_with("image/") {
        "inline"
    } else {
        "attachment"
    };
    let mut response = bytes.into_response();
    response.headers_mut().insert(
        header::CONTENT_TYPE,
        mime_type
            .parse()
            .unwrap_or_else(|_| header::HeaderValue::from_static("application/octet-stream")),
    );
    response.headers_mut().insert(
        header::CONTENT_DISPOSITION,
        format!("{disposition}; filename=\"{name}\"")
            .parse()
            .unwrap_or_else(|_| header::HeaderValue::from_static("attachment; filename=\"file\"")),
    );
    response
}

fn open_connection(database_dir: &Path, slug: &str) -> Result<Connection, String> {
    crate::db::open_module(database_dir, slug)
}

fn index(
    connection: &Connection,
    table: &str,
    endpoint: &Value,
    definition: &Value,
    query_string: &str,
) -> (axum::http::StatusCode, Value) {
    let table_sql = quote(table);
    if !table_exists(connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let columns = column_names(connection, table).unwrap_or_default();
    let mut clauses = Vec::new();
    let mut values = Vec::new();
    let query: HashMap<String, String> = form_urlencoded::parse(query_string.as_bytes())
        .into_owned()
        .collect();
    if let Some(configured) = endpoint.get("query").and_then(Value::as_object) {
        for field in configured.keys() {
            if matches!(field.as_str(), "per_page" | "page" | "search")
                || !columns.iter().any(|column| column == field)
            {
                continue;
            }
            if let Some(value) = query.get(field) {
                clauses.push(format!("{} = ?", quote(field)));
                values.push(sql_value(&Value::String(value.clone())));
            }
        }
    }
    if endpoint
        .get("query")
        .and_then(Value::as_object)
        .is_some_and(|query| query.contains_key("search"))
    {
        if let Some(search) = query.get("search").filter(|search| !search.is_empty()) {
            let searchable: Vec<_> = ["name", "title", "description"]
                .into_iter()
                .filter(|field| columns.iter().any(|column| column == field))
                .collect();
            if !searchable.is_empty() {
                clauses.push(format!(
                    "({})",
                    searchable
                        .iter()
                        .map(|field| format!("{} LIKE ?", quote(field)))
                        .collect::<Vec<_>>()
                        .join(" OR ")
                ));
                for _ in searchable {
                    values.push(SqlValue::Text(format!("%{search}%")));
                }
            }
        }
    }
    if definition["softDeletes"].as_bool() == Some(true)
        && columns.iter().any(|column| column == "deleted_at")
    {
        clauses.push("\"deleted_at\" IS NULL".to_owned());
    }
    let where_clause = if clauses.is_empty() {
        String::new()
    } else {
        format!(" WHERE {}", clauses.join(" AND "))
    };
    let total_sql = format!("SELECT COUNT(*) FROM {table_sql}{where_clause}");
    let total = match connection.query_row(
        &total_sql,
        crate::db::params_from_iter(values.clone()),
        |row| row.get::<_, i64>(0),
    ) {
        Ok(total) => total,
        Err(error) => return internal_error(format!("Could not count {table}: {error}")),
    };
    let response_type = endpoint["response"]["type"].as_str().unwrap_or_default();
    let page = query
        .get("page")
        .and_then(|value| value.parse::<u32>().ok())
        .unwrap_or(1)
        .max(1);
    let configured_page_size = endpoint["query"]["per_page"]
        .as_str()
        .and_then(|value| value.strip_prefix("default:"))
        .and_then(|value| value.parse::<u32>().ok())
        .unwrap_or(15);
    let per_page = query
        .get("per_page")
        .and_then(|value| value.parse::<u32>().ok())
        .unwrap_or(configured_page_size)
        .clamp(1, 100);
    let offset = (u64::from(page - 1) * u64::from(per_page)).min(i64::MAX as u64) as i64;
    let mut sql = format!("SELECT * FROM {table_sql}{where_clause}");
    if columns.iter().any(|column| column == "created_at") {
        sql.push_str(" ORDER BY \"created_at\" DESC");
    } else if columns.iter().any(|column| column == "id") {
        sql.push_str(" ORDER BY \"id\" DESC");
    }
    if response_type != "array" {
        sql.push_str(" LIMIT ? OFFSET ?");
        values.push(SqlValue::Integer(per_page as i64));
        values.push(SqlValue::Integer(offset));
    }
    let rows = match read_rows(connection, &sql, values, definition) {
        Ok(rows) => rows,
        Err(error) => return internal_error(format!("Could not list {table}: {error}")),
    };
    if response_type == "paginated" {
        let last_page = ((total.max(0) as u64 + u64::from(per_page) - 1) / u64::from(per_page))
            .max(1)
            .min(u64::from(u32::MAX)) as u32;
        (
            axum::http::StatusCode::OK,
            json!({
                "data": rows,
                "current_page": page,
                "last_page": last_page,
                "per_page": per_page,
                "total": total
            }),
        )
    } else if response_type == "array" {
        (axum::http::StatusCode::OK, json!(rows))
    } else {
        (axum::http::StatusCode::OK, json!({"data": rows}))
    }
}

fn store(
    connection: &Connection,
    table: &str,
    endpoint: &Value,
    definition: &Value,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    if !table_exists(connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let Some(body) = body.as_object() else {
        return validation_error(vec!["Request body must be a JSON object".to_owned()]);
    };
    let schema_columns = column_names(connection, table).unwrap_or_default();
    if let Some(response) = validate_fields(endpoint, body, schema_columns.clone(), true) {
        return response;
    }
    if let Some(response) = validate_unique_values(connection, table, endpoint, body, None) {
        return response;
    }
    let mut fields = writable_fields(body, schema_columns.clone());
    if definition["timestamps"].as_bool() != Some(false) {
        if schema_columns.iter().any(|field| field == "created_at") {
            fields.push(("created_at".to_owned(), Value::Null));
        }
        if schema_columns.iter().any(|field| field == "updated_at") {
            fields.push(("updated_at".to_owned(), Value::Null));
        }
    }
    let sql = if fields.is_empty() {
        format!("INSERT INTO {} DEFAULT VALUES", quote(table))
    } else {
        let names = fields
            .iter()
            .map(|(name, _)| quote(name))
            .collect::<Vec<_>>()
            .join(", ");
        let values = fields
            .iter()
            .map(|(name, value)| {
                if value.is_null() && matches!(name.as_str(), "created_at" | "updated_at") {
                    "CURRENT_TIMESTAMP".to_owned()
                } else {
                    "?".to_owned()
                }
            })
            .collect::<Vec<_>>()
            .join(", ");
        format!("INSERT INTO {} ({names}) VALUES ({values})", quote(table))
    };
    let params: Vec<_> = fields
        .iter()
        .filter(|(name, value)| {
            !(value.is_null() && matches!(name.as_str(), "created_at" | "updated_at"))
        })
        .map(|(_, value)| sql_value(value))
        .collect();
    let row_id = match connection.execute(&sql, crate::db::params_from_iter(params)) {
        Ok(_) => connection.last_insert_rowid(),
        Err(error) if is_constraint_error(&error) => {
            return validation_error(vec![format!(
                "The submitted values violate a constraint on {table}."
            )])
        }
        Err(error) => return internal_error(format!("Could not create {table} record: {error}")),
    };
    let row = match find_row(connection, table, &row_id.to_string(), definition, false) {
        Ok(Some(row)) => row,
        Ok(None) => return internal_error("Created row could not be read back".to_owned()),
        Err(error) => {
            return internal_error(format!("Could not read created {table} record: {error}"))
        }
    };
    (axum::http::StatusCode::CREATED, row)
}

fn with_id(
    connection: &Connection,
    table: &str,
    endpoint: &Value,
    definition: &Value,
    model: &str,
    path: &str,
    action: &str,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    let id = match route_id(path) {
        Some(id) => id,
        None => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                json!({"message": "Not Found"}),
            )
        }
    };
    if !table_exists(connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let columns = column_names(connection, table).unwrap_or_default();
    let soft_deletes = definition["softDeletes"].as_bool() == Some(true)
        && columns.iter().any(|field| field == "deleted_at");
    match action {
        "show" => match find_row(connection, table, &id, definition, soft_deletes) {
            Ok(Some(row)) => (axum::http::StatusCode::OK, row),
            Ok(None) => (
                axum::http::StatusCode::NOT_FOUND,
                json!({"message": "Not Found"}),
            ),
            Err(error) => internal_error(format!("Could not find {table} record: {error}")),
        },
        "update" => {
            let Some(body) = body.as_object() else {
                return validation_error(vec!["Request body must be a JSON object".to_owned()]);
            };
            if let Some(response) = validate_fields(endpoint, body, columns.clone(), false) {
                return response;
            }
            if let Some(response) =
                validate_unique_values(connection, table, endpoint, body, Some(&id))
            {
                return response;
            }
            let fields = writable_fields(body, columns.clone());
            if fields.is_empty() {
                return validation_error(vec![
                    "Request body must contain at least one updatable field".to_owned(),
                ]);
            }
            let mut assignments: Vec<String> = fields
                .iter()
                .map(|(name, _)| format!("{} = ?", quote(name)))
                .collect();
            let mut values: Vec<SqlValue> =
                fields.iter().map(|(_, value)| sql_value(value)).collect();
            if columns.iter().any(|field| field == "updated_at") {
                assignments.push("\"updated_at\" = CURRENT_TIMESTAMP".to_owned());
            }
            values.push(sql_value(&Value::String(id.clone())));
            let sql = format!(
                "UPDATE {} SET {} WHERE \"id\" = ?{}",
                quote(table),
                assignments.join(", "),
                if soft_deletes {
                    " AND \"deleted_at\" IS NULL"
                } else {
                    ""
                }
            );
            match connection.execute(&sql, crate::db::params_from_iter(values)) {
                Ok(0) => (
                    axum::http::StatusCode::NOT_FOUND,
                    json!({"message": "Not Found"}),
                ),
                Ok(_) => match find_row(connection, table, &id, definition, soft_deletes) {
                    Ok(Some(row)) => (axum::http::StatusCode::OK, row),
                    Ok(None) => (
                        axum::http::StatusCode::NOT_FOUND,
                        json!({"message": "Not Found"}),
                    ),
                    Err(error) => {
                        internal_error(format!("Could not read updated {table} record: {error}"))
                    }
                },
                Err(error) if is_constraint_error(&error) => validation_error(vec![format!(
                    "The submitted values violate a constraint on {table}."
                )]),
                Err(error) => internal_error(format!("Could not update {table} record: {error}")),
            }
        }
        "destroy" => {
            let sql = if soft_deletes {
                format!("UPDATE {} SET \"deleted_at\" = CURRENT_TIMESTAMP WHERE \"id\" = ? AND \"deleted_at\" IS NULL", quote(table))
            } else {
                format!("DELETE FROM {} WHERE \"id\" = ?", quote(table))
            };
            match connection.execute(&sql, [SqlValue::Text(id)]) {
                Ok(0) => (
                    axum::http::StatusCode::NOT_FOUND,
                    json!({"message": "Not Found"}),
                ),
                Ok(_) => {
                    let message = endpoint["response"]["value"]
                        .as_str()
                        .map(str::to_owned)
                        .unwrap_or_else(|| format!("{model} deleted successfully"));
                    (axum::http::StatusCode::OK, json!({"message": message}))
                }
                Err(error) => internal_error(format!("Could not delete {table} record: {error}")),
            }
        }
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": "Not implemented"}),
        ),
    }
}

fn validate_unique_values(
    connection: &Connection,
    table: &str,
    endpoint: &Value,
    body: &Map<String, Value>,
    except_id: Option<&str>,
) -> Option<(axum::http::StatusCode, Value)> {
    let Some(rules) = endpoint["validation"].as_object() else {
        return None;
    };
    for (field, rule_set) in rules {
        let Some(value) = body.get(field) else {
            continue;
        };
        if value.is_null() {
            continue;
        }
        let Some(rule_set) = rule_set.as_str() else {
            continue;
        };
        for rule in rule_set.split('|').filter(|rule| {
            rule.split_once(':')
                .map_or(*rule == "unique", |(name, _)| name == "unique")
        }) {
            let Some((unique_table, unique_column)) = unique_rule_target(rule, table, field) else {
                return Some(validation_error(vec![format!(
                    "The unique rule for {field} has an unsupported table or column."
                )]));
            };
            if !table_exists(connection, &unique_table) {
                return Some(validation_error(vec![format!(
                    "The unique rule for {field} references unknown table {unique_table}."
                )]));
            }
            let unique_columns = match column_names(connection, &unique_table) {
                Ok(columns) => columns,
                Err(error) => {
                    return Some(internal_error(format!(
                        "Could not inspect {unique_table} uniqueness rule: {error}"
                    )))
                }
            };
            if !unique_columns.iter().any(|column| column == &unique_column) {
                return Some(validation_error(vec![format!(
                    "The unique rule for {field} references unknown column {unique_column}."
                )]));
            }
            let excludes_current = unique_table == table
                && unique_column == field.as_str()
                && except_id.is_some()
                && unique_columns.iter().any(|column| column == "id");
            let mut sql = format!(
                "SELECT 1 FROM {} WHERE {} = ?1",
                quote(&unique_table),
                quote(&unique_column)
            );
            if excludes_current {
                sql.push_str(" AND \"id\" != ?2");
            }
            sql.push_str(" LIMIT 1");
            let mut parameters = vec![sql_value(value)];
            if let Some(id) = except_id.filter(|_| excludes_current) {
                parameters.push(SqlValue::Text(id.to_owned()));
            }
            let exists = match connection
                .query_row(&sql, crate::db::params_from_iter(parameters), |row| {
                    row.get::<_, i64>(0)
                })
                .optional()
            {
                Ok(Some(_)) => true,
                Ok(None) => false,
                Err(error) => {
                    return Some(internal_error(format!(
                        "Could not validate uniqueness of {unique_table}.{unique_column}: {error}"
                    )))
                }
            };
            if exists {
                return Some(validation_error(vec![format!(
                    "The {field} field must be unique."
                )]));
            }
        }
    }
    None
}

fn unique_rule_target(rule: &str, table: &str, field: &str) -> Option<(String, String)> {
    let (_, argument) = rule.split_once(':').unwrap_or((rule, ""));
    if argument.is_empty() {
        return Some((table.to_owned(), field.to_owned()));
    }
    let mut parts = argument.split(',');
    let table = parts.next()?.trim();
    let column = parts.next().map(str::trim).unwrap_or(field);
    if parts.next().is_some()
        || !super::engine::is_identifier(table)
        || !super::engine::is_identifier(column)
    {
        return None;
    }
    Some((table.to_owned(), column.to_owned()))
}

fn validate_fields(
    endpoint: &Value,
    body: &Map<String, Value>,
    columns: Vec<String>,
    creating: bool,
) -> Option<(axum::http::StatusCode, Value)> {
    let errors = endpoint["validation"]
        .as_object()
        .map(|rules| {
            rules
                .iter()
                .filter_map(|(field, rule)| {
                    validate_rule(field, body.get(field), rule.as_str().unwrap_or_default())
                })
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if !errors.is_empty() {
        return Some(validation_error(errors));
    }
    let writable: Vec<_> = columns
        .into_iter()
        .filter(|field| {
            !matches!(
                field.as_str(),
                "id" | "created_at" | "updated_at" | "deleted_at"
            )
        })
        .collect();
    let unknown: Vec<_> = body
        .keys()
        .filter(|field| !writable.iter().any(|column| column == *field))
        .cloned()
        .collect();
    if !unknown.is_empty() {
        return Some(validation_error(
            unknown
                .iter()
                .map(|field| format!("The {field} field is not fillable."))
                .collect(),
        ));
    }
    if creating && body.is_empty() {
        return Some(validation_error(vec![
            "Request body must contain at least one field".to_owned(),
        ]));
    }
    None
}

fn validate_rule(field: &str, value: Option<&Value>, rule: &str) -> Option<String> {
    let rules: Vec<_> = rule.split('|').collect();
    if rules.contains(&"sometimes") && value.is_none() {
        return None;
    }
    if rules.contains(&"required")
        && value.map_or(true, |value| {
            value.is_null() || value.as_str().is_some_and(|value| value.trim().is_empty())
        })
    {
        return Some(format!("The {field} field is required."));
    }
    let Some(value) = value else { return None };
    if value.is_null() && rules.contains(&"nullable") {
        return None;
    }
    for rule in rules {
        let (name, argument) = rule.split_once(':').unwrap_or((rule, ""));
        let invalid = match name {
            "required" | "sometimes" | "nullable" | "unique" => false,
            "string" => !value.is_string(),
            "integer" => {
                !(value.is_i64()
                    || value
                        .as_str()
                        .is_some_and(|value| value.parse::<i64>().is_ok()))
            }
            "numeric" => {
                !(value.is_number()
                    || value
                        .as_str()
                        .is_some_and(|value| value.parse::<f64>().is_ok()))
            }
            "boolean" => !(value.is_boolean() || matches!(value.as_i64(), Some(0 | 1))),
            "array" => !(value.is_array() || value.is_object()),
            "email" => !value
                .as_str()
                .is_some_and(|email| email.contains('@') && email.contains('.')),
            "in" => {
                let value = value
                    .as_str()
                    .map(str::to_owned)
                    .unwrap_or_else(|| value.to_string());
                !argument.split(',').any(|option| option == value)
            }
            "max" => exceeds_limit(value, argument),
            "min" => below_limit(value, argument),
            _ => {
                return Some(format!(
                    "Validation rule \"{name}\" is not supported by the Rust engine."
                ))
            }
        };
        if invalid {
            return Some(format!(
                "The {field} field failed the {name} validation rule."
            ));
        }
    }
    None
}

fn exceeds_limit(value: &Value, argument: &str) -> bool {
    let limit = argument.parse::<f64>().unwrap_or(f64::INFINITY);
    value
        .as_str()
        .map(|value| value.chars().count() as f64 > limit)
        .or_else(|| value.as_array().map(|value| value.len() as f64 > limit))
        .or_else(|| value.as_f64().map(|value| value > limit))
        .unwrap_or(false)
}

fn below_limit(value: &Value, argument: &str) -> bool {
    let limit = argument.parse::<f64>().unwrap_or(f64::NEG_INFINITY);
    value
        .as_str()
        .map(|value| (value.chars().count() as f64) < limit)
        .or_else(|| value.as_array().map(|value| (value.len() as f64) < limit))
        .or_else(|| value.as_f64().map(|value| value < limit))
        .unwrap_or(false)
}

fn writable_fields(body: &Map<String, Value>, columns: Vec<String>) -> Vec<(String, Value)> {
    body.iter()
        .filter(|(field, _)| {
            columns.iter().any(|column| column == *field)
                && !matches!(
                    field.as_str(),
                    "id" | "created_at" | "updated_at" | "deleted_at"
                )
        })
        .map(|(field, value)| (field.clone(), value.clone()))
        .collect()
}

fn find_row(
    connection: &Connection,
    table: &str,
    id: &str,
    definition: &Value,
    exclude_deleted: bool,
) -> crate::db::Result<Option<Value>> {
    let sql = format!(
        "SELECT * FROM {} WHERE \"id\" = ?{}",
        quote(table),
        if exclude_deleted {
            " AND \"deleted_at\" IS NULL"
        } else {
            ""
        }
    );
    let mut statement = connection.prepare(&sql)?;
    let mut rows = statement.query([id])?;
    rows.next()?
        .map(|row| row_to_json(row, definition))
        .transpose()
}

fn read_rows(
    connection: &Connection,
    sql: &str,
    values: Vec<SqlValue>,
    definition: &Value,
) -> crate::db::Result<Vec<Value>> {
    let mut statement = connection.prepare(sql)?;
    let rows = statement.query_map(crate::db::params_from_iter(values), |row| {
        row_to_json(row, definition)
    })?;
    rows.collect()
}

fn row_to_json(row: &crate::db::Row, definition: &Value) -> crate::db::Result<Value> {
    let mut object = Map::new();
    let columns = row.as_ref().column_names().to_vec();
    for (index, name) in columns.iter().enumerate() {
        let kind = definition["columns"][*name]["type"]
            .as_str()
            .unwrap_or_default();
        let value = match row.get_ref(index)? {
            ValueRef::Null => Value::Null,
            ValueRef::Integer(value) if kind == "boolean" => json!(value != 0),
            ValueRef::Integer(value) => json!(value),
            ValueRef::Real(value) => json!(value),
            ValueRef::Text(b"0") if kind == "boolean" => json!(false),
            ValueRef::Text(b"1") if kind == "boolean" => json!(true),
            ValueRef::Text(value) if kind == "json" => serde_json::from_slice(value)
                .unwrap_or_else(|_| Value::String(String::from_utf8_lossy(value).into_owned())),
            ValueRef::Text(value) => json!(String::from_utf8_lossy(value).into_owned()),
            ValueRef::Blob(value) => json!(String::from_utf8_lossy(value).into_owned()),
        };
        object.insert((*name).to_owned(), value);
    }
    Ok(Value::Object(object))
}

fn table_exists(connection: &Connection, table: &str) -> bool {
    connection.table_exists(table)
}

fn column_names(connection: &Connection, table: &str) -> crate::db::Result<Vec<String>> {
    connection.table_columns(table)
}

fn route_id(path: &str) -> Option<String> {
    path.trim_end_matches('/')
        .rsplit('/')
        .next()
        .filter(|value| !value.is_empty())
        .map(str::to_owned)
}

fn quote(identifier: &str) -> String {
    format!("\"{}\"", identifier.replace('"', "\"\""))
}

fn sql_value(value: &Value) -> SqlValue {
    match value {
        Value::Null => SqlValue::Null,
        Value::Bool(value) => SqlValue::Integer(i64::from(*value)),
        Value::Number(value) => value
            .as_i64()
            .map(SqlValue::Integer)
            .or_else(|| value.as_f64().map(SqlValue::Real))
            .unwrap_or(SqlValue::Null),
        Value::String(value) => SqlValue::Text(value.clone()),
        Value::Array(_) | Value::Object(_) => SqlValue::Text(value.to_string()),
    }
}

fn validation_error(errors: Vec<String>) -> (axum::http::StatusCode, Value) {
    let status = axum::http::StatusCode::UNPROCESSABLE_ENTITY;
    (
        status,
        json!({"message": "Validation failed", "errors": errors}),
    )
}

fn internal_error(message: String) -> (axum::http::StatusCode, Value) {
    (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        json!({"message": message}),
    )
}

fn is_constraint_error(error: &crate::db::Error) -> bool {
    error.is_constraint_violation()
}

fn snake(name: &str) -> String {
    let mut output = String::new();
    for (index, character) in name.chars().enumerate() {
        if character.is_ascii_uppercase() {
            if index > 0 {
                output.push('_');
            }
            output.push(character.to_ascii_lowercase());
        } else {
            output.push(character);
        }
    }
    output
}

fn pluralize(value: &str) -> String {
    if let Some(stem) = value.strip_suffix('y') {
        format!("{stem}ies")
    } else if value.ends_with('s') {
        format!("{value}es")
    } else {
        format!("{value}s")
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn parses_multipart_files_field_for_uploads() {
        let body = b"--AAA\r\nContent-Disposition: form-data; name=\"files\"; filename=\"note.txt\"\r\nContent-Type: text/plain\r\n\r\nhello upload\r\n--AAA--\r\n";
        let parts = parse_multipart(Some("AAA"), body).unwrap();
        assert_eq!(parts.len(), 1);
        assert_eq!(parts[0].filename, "note.txt");
        assert_eq!(parts[0].content_type, "text/plain");
        assert_eq!(parts[0].data, b"hello upload");
    }

    fn module() -> Value {
        json!({
            "name": "sample",
            "databases": [{"table": "notes"}],
            "apis": [{
                "model": "Note",
                "controller": "NoteController",
                "prefix": "/api/sample/notes",
                "endpoints": {
                    "index": {"method": "GET", "route": "/", "response": {"type": "paginated"}},
                    "show": {"method": "GET", "route": "/{id}"},
                    "store": {"method": "POST", "route": "/"},
                    "update": {"method": "PUT", "route": "/{id}"},
                    "destroy": {"method": "DELETE", "route": "/{id}"}
                }
            }]
        })
    }

    #[test]
    fn matches_declared_api_prefix_and_parameterized_routes() {
        let matched = match_route(&module(), "GET", "/api/sample/notes/42").unwrap();
        assert_eq!(matched.name, "show");
        assert_eq!(matched.table, "notes");
        assert_eq!(
            match_route(&module(), "POST", "/api/sample/notes/42").is_none(),
            true
        );
    }

    #[test]
    fn broadcast_store_uses_generic_create_and_is_supported() {
        let mut module = module();
        module["apis"][0]["endpoints"]["store"]["type"] = json!("broadcast");
        module["apis"][0]["endpoints"]["store"]["validation"] =
            json!({"content": "required|string|max:500"});
        module["apis"][0]["model"] = json!("Message");
        module["apis"][0]["prefix"] = json!("/api/sample/messages");
        module["databases"][0] = json!({
            "table": "messages",
            "columns": {
                "content": {"type": "string", "nullable": false},
                "channel_type": {"type": "string", "nullable": true}
            }
        });

        let matched = match_route(&module, "POST", "/api/sample/messages").unwrap();
        assert_eq!(matched.name, "store");
        assert!(matched.supported);
        assert_eq!(matched.endpoint["type"], "broadcast");

        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "databases": [matched.schema.clone()]
        });
        super::super::database::apply_schema(directory.path(), "sample", &payload).unwrap();
        let (status, record) = execute(
            directory.path(),
            "sample",
            &matched.table,
            &matched.name,
            &matched.endpoint,
            &matched.schema,
            &matched.model,
            "/api/sample/messages",
            &json!({"content": "hello", "channel_type": "public"}),
            "",
        );
        assert_eq!(status, axum::http::StatusCode::CREATED);
        assert_eq!(record["content"], "hello");
        assert_eq!(record["channel_type"], "public");
    }

    #[test]
    fn event_fire_store_is_supported_by_event_dispatch() {
        let mut module = module();
        module["apis"][0]["endpoints"]["store"]["type"] = json!("event_fire");
        module["apis"][0]["endpoints"]["store"]["validation"] =
            json!({"event": "required|string", "payload": "nullable|array"});

        let matched = match_route(&module, "POST", "/api/sample/notes").unwrap();
        assert_eq!(matched.name, "store");
        assert!(matched.supported);
        assert_eq!(matched.endpoint["type"], "event_fire");
    }

    #[test]
    fn mail_send_store_is_supported_by_mail_dispatch() {
        let mut module = module();
        module["apis"][0]["endpoints"]["store"]["type"] = json!("mail_send");
        module["apis"][0]["endpoints"]["store"]["validation"] =
            json!({"mail": "required|string", "to": "required|email", "data": "array"});

        let matched = match_route(&module, "POST", "/api/sample/notes").unwrap();
        assert_eq!(matched.name, "store");
        assert!(matched.supported);
        assert_eq!(matched.endpoint["type"], "mail_send");
    }

    #[test]
    fn job_dispatch_store_is_supported_by_job_dispatch() {
        let mut module = module();
        module["apis"][0]["endpoints"]["store"]["type"] = json!("job_dispatch");
        module["apis"][0]["endpoints"]["store"]["validation"] = json!({"job": "required|string"});

        let matched = match_route(&module, "POST", "/api/sample/notes").unwrap();
        assert_eq!(matched.name, "store");
        assert!(matched.supported);
        assert_eq!(matched.endpoint["type"], "job_dispatch");
    }

    #[test]
    fn comment_only_rust_body_keeps_generic_crud_support() {
        use base64::{engine::general_purpose::STANDARD, Engine};

        let mut module = module();
        module["apis"][0]["endpoints"]["index"]["body"] =
            json!(STANDARD.encode("// Generic CRUD handles this endpoint."));

        let matched = match_route(&module, "GET", "/api/sample/notes").unwrap();
        assert!(matched.supported);
    }

    #[test]
    fn creates_reads_updates_and_deletes_records() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "databases": [{
                "table": "notes",
                "timestamps": true,
                "columns": {
                    "title": {"type": "string"},
                    "body": {"type": "text", "nullable": true},
                    "pinned": {"type": "boolean", "default": false}
                }
            }]
        });
        super::super::database::apply_schema(directory.path(), "sample", &payload).unwrap();
        let connection = open_connection(directory.path(), "sample").unwrap();
        let endpoint = json!({"validation":{"title":"required|string|max:40"}});
        let definition = &payload["databases"][0];
        let (status, created) = store(
            &connection,
            "notes",
            &endpoint,
            definition,
            &json!({"title":"First","body":"hello"}),
        );
        assert_eq!(status, axum::http::StatusCode::CREATED);
        assert_eq!(created["title"], "First");
        assert_eq!(created["pinned"], false);
        let id = created["id"].as_i64().unwrap().to_string();

        let (status, listed) = index(
            &connection,
            "notes",
            &json!({"response":{"type":"paginated"}}),
            definition,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(listed["total"], 1);
        assert_eq!(listed["data"][0]["id"], created["id"]);

        let path = format!("/api/sample/notes/{id}");
        let (status, updated) = with_id(
            &connection,
            "notes",
            &json!({}),
            definition,
            "Note",
            &path,
            "update",
            &json!({"title":"Updated"}),
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(updated["title"], "Updated");

        let (status, deleted) = with_id(
            &connection,
            "notes",
            &json!({"response":{"value":"Gone"}}),
            definition,
            "Note",
            &path,
            "destroy",
            &Value::Null,
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(deleted["message"], "Gone");
        let (status, missing) = with_id(
            &connection,
            "notes",
            &json!({}),
            definition,
            "Note",
            &path,
            "show",
            &Value::Null,
        );
        assert_eq!(status, axum::http::StatusCode::NOT_FOUND);
        assert_eq!(missing["message"], "Not Found");
    }

    #[test]
    fn unknown_validation_rules_are_explicit_errors() {
        assert!(
            validate_rule("name", Some(&json!("x")), "required|alpha_dash")
                .unwrap()
                .contains("not supported")
        );
    }

    #[test]
    fn in_and_unique_rules_are_enforced_for_crud() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "sample",
            "databases": [{
                "table": "users",
                "columns": {
                    "email": {"type": "string", "nullable": false},
                    "role": {"type": "string", "nullable": false}
                },
                "seeder": {
                    "data": [{"email": "existing@example.test", "role": "learner"}]
                }
            }]
        });
        super::super::database::apply_schema(directory.path(), "sample", &payload).unwrap();
        let connection = open_connection(directory.path(), "sample").unwrap();
        let endpoint = json!({
            "validation": {
                "email": "required|email|unique:users,email",
                "role": "required|in:learner,teacher"
            }
        });

        let (status, duplicate) = store(
            &connection,
            "users",
            &endpoint,
            &payload["databases"][0],
            &json!({"email": "existing@example.test", "role": "learner"}),
        );
        assert_eq!(status, axum::http::StatusCode::UNPROCESSABLE_ENTITY);
        assert!(duplicate["errors"][0]
            .as_str()
            .unwrap()
            .contains("must be unique"));

        let (status, invalid_role) = store(
            &connection,
            "users",
            &endpoint,
            &payload["databases"][0],
            &json!({"email": "new@example.test", "role": "admin"}),
        );
        assert_eq!(status, axum::http::StatusCode::UNPROCESSABLE_ENTITY);
        assert!(invalid_role["errors"][0]
            .as_str()
            .unwrap()
            .contains("in validation"));

        let (status, created) = store(
            &connection,
            "users",
            &endpoint,
            &payload["databases"][0],
            &json!({"email": "new@example.test", "role": "teacher"}),
        );
        assert_eq!(status, axum::http::StatusCode::CREATED);
        let id = created["id"].as_i64().unwrap().to_string();
        let (status, updated) = with_id(
            &connection,
            "users",
            &endpoint,
            &payload["databases"][0],
            "User",
            &format!("/api/sample/users/{id}"),
            "update",
            &json!({"email": "new@example.test", "role": "teacher"}),
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(updated["email"], "new@example.test");
    }

    #[test]
    fn warnings_only_report_unimplemented_middleware_and_dsl_sections() {
        let supported_middleware = json!({
            "apis": [{
                "model": "Ping",
                "middleware": ["requireJson"],
                "endpoints": {}
            }]
        });
        assert!(warnings(&supported_middleware).is_empty());
        let supported_auth = json!({
            "auth": true,
            "apis": [{
                "model": "Private",
                "middleware": ["auth:sanctum", "requireJson"],
                "endpoints": {}
            }]
        });
        assert!(warnings(&supported_auth).is_empty());
        let supported_event = json!({
            "events": ["user-signed-up:\\n  listeners: [SendWelcomeEmail]"],
            "apis": [{
                "model": "EventLog",
                "prefix": "/api/events-test",
                "endpoints": {
                    "store": {
                        "type": "event_fire",
                        "method": "POST",
                        "route": "/fire",
                        "validation": {
                            "event": "required|string",
                            "payload": "nullable|array"
                        }
                    }
                }
            }]
        });
        assert!(warnings(&supported_event).is_empty());

        let unsupported = json!({
            "apis": [{
                "model": "Private",
                "middleware": ["auth"],
                "endpoints": {}
            }],
            "jobs": ["job-test"]
        });
        let warnings = warnings(&unsupported);
        assert!(warnings
            .iter()
            .any(|warning| warning.contains("middleware")));
        assert!(warnings.iter().any(|warning| warning.contains("Job DSL")));
    }
}
