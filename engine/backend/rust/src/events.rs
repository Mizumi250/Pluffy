use crate::generated_runtime::{Database, RequestContext, ResponseContext};
use axum::http::StatusCode;
use serde_json::{json, Value};
use std::path::Path;

pub fn fire_event(
    module: &Value,
    slug: &str,
    database_dir: &Path,
    body: &Value,
) -> (StatusCode, Value) {
    let Some(event_name) = body
        .get("event")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error("The event field is required.");
    };
    let payload = match body.get("payload") {
        None | Some(Value::Null) => json!({}),
        Some(Value::Object(payload)) => Value::Object(payload.clone()),
        Some(_) => return validation_error("The payload field must be an object."),
    };

    let event = module
        .get("events")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .filter_map(parse_event)
        .find(|(name, _)| normalize_identifier(name) == normalize_identifier(event_name));
    let Some((registered_name, listeners)) = event else {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            json!({
                "message": "Validation failed",
                "errors": ["The event field has an unsupported value."]
            }),
        );
    };
    if listeners.is_empty() {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            json!({
                "message": "Validation failed",
                "errors": [format!("Event {registered_name} has no registered listeners.")]
            }),
        );
    }

    for listener in &listeners {
        let handler = format!("listener:{listener}");
        let database = match Database::open(database_dir, slug) {
            Ok(database) => database,
            Err(error) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": format!("Could not open database for event listener {listener}: {error}")}),
                )
            }
        };
        let request = RequestContext::new(
            json!({"payload": payload.clone()}),
            String::new(),
            String::new(),
            None,
            database_dir.to_path_buf(),
        );
        let Some(result) =
            crate::generated_registry::dispatch(slug, &handler, request, database, ResponseContext)
        else {
            return (
                StatusCode::NOT_IMPLEMENTED,
                json!({"message": format!("No compiled Rust listener is registered for {listener}")}),
            );
        };
        match result {
            Ok(response) if response.status.is_success() => {}
            Ok(response) => {
                return (
                    response.status,
                    json!({"message": format!(
                        "Event listener {listener} returned HTTP {}",
                        response.status.as_u16()
                    )}),
                )
            }
            Err(error) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": format!("Event listener {listener} failed: {error}")}),
                )
            }
        }
    }

    (
        StatusCode::ACCEPTED,
        json!({"message": "Event fired", "event": event_name, "listeners": listeners}),
    )
}

fn parse_event(section: &str) -> Option<(String, Vec<String>)> {
    let (name, _) = section.trim().split_once(':')?;
    let listeners = section
        .lines()
        .find_map(|line| line.trim().strip_prefix("listeners:"))?
        .trim()
        .strip_prefix('[')?
        .strip_suffix(']')?
        .split(',')
        .map(|listener| listener.trim().trim_matches(['\'', '"']).to_owned())
        .filter(|listener| !listener.is_empty())
        .collect();
    Some((name.trim().to_owned(), listeners))
}

fn normalize_identifier(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

fn validation_error(message: &str) -> (StatusCode, Value) {
    (
        StatusCode::UNPROCESSABLE_ENTITY,
        json!({"message": "Validation failed", "errors": [message]}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_unknown_event_names() {
        let module = json!({
            "events": [
                "user-signed-up:\n  listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]\n  body: ''"
            ]
        });
        let (status, response) = fire_event(
            &module,
            "sample",
            Path::new("."),
            &json!({"event": "missing"}),
        );
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert!(response["errors"][0]
            .as_str()
            .unwrap()
            .contains("unsupported"));
    }

    #[test]
    fn parses_event_sections() {
        assert_eq!(
            parse_event(
                "order-placed:\n  listeners: [ProcessPayment, UpdateInventory]\n  body: ''"
            ),
            Some((
                "order-placed".to_owned(),
                vec!["ProcessPayment".to_owned(), "UpdateInventory".to_owned()]
            ))
        );
    }

    #[test]
    fn repeated_fires_write_timestamped_listener_rows() {
        let directory = tempfile::tempdir().unwrap();
        let schema = json!({
            "databases": [{
                "table": "event_log",
                "timestamps": true,
                "columns": {
                    "event_name": {"type": "string", "nullable": false},
                    "listener_name": {"type": "string", "nullable": false},
                    "status": {"type": "string"},
                    "payload": {"type": "text", "nullable": true},
                    "duration_ms": {"type": "integer", "nullable": true}
                }
            }]
        });
        crate::database::apply_schema(directory.path(), "events-test", &schema).unwrap();

        let module = json!({
            "events": [
                "user-signed-up:\n  listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]"
            ]
        });
        let body = json!({"event": "user-signed-up", "payload": {"user_id": 1}});
        let (first_status, _) = fire_event(&module, "events-test", directory.path(), &body);
        let (second_status, _) = fire_event(&module, "events-test", directory.path(), &body);

        assert_eq!(first_status, StatusCode::ACCEPTED);
        assert_eq!(second_status, StatusCode::ACCEPTED);

        let database = Database::open(directory.path(), "events-test").unwrap();
        let rows = database
            .query("SELECT created_at, listener_name FROM event_log")
            .unwrap();
        assert_eq!(rows.len(), 6);
        for listener in ["SendWelcomeEmail", "UpdateUserStats", "NotifyAdmins"] {
            let listener_rows: Vec<_> = rows
                .iter()
                .filter(|row| row["listener_name"] == listener)
                .collect();
            assert_eq!(listener_rows.len(), 2);
            assert!(listener_rows
                .iter()
                .all(|row| row["created_at"].as_str().is_some()));
        }
    }
}
