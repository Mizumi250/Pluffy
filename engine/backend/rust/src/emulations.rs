use crate::{
    api::MatchedRoute,
    auth::{self, User},
    db::{types::ValueRef, Connection},
    mail, realtime,
};
use axum::http::StatusCode;
use serde_json::{json, Map, Value};
use std::{collections::HashMap, path::Path};

pub fn supports(route: &MatchedRoute) -> bool {
    let endpoint_type = route.endpoint["type"].as_str().unwrap_or_default();
    matches!(
        endpoint_type,
        "role_admin_only"
            | "role_user_only"
            | "role_promote"
            | "role_demote"
            | "notification_trigger"
            | "command_run"
    ) || (route.model == "Notification"
        && matches!(route.name.as_str(), "index" | "destroy" | "readAll"))
        || (route.name == "destroy"
            && route.endpoint["response"]["value"] == "Runs cleared"
            && route.endpoint["route"] == "/runs")
}

pub fn execute(
    module: &Value,
    slug: &str,
    database_dir: &Path,
    route: &MatchedRoute,
    path: &str,
    body: &Value,
    user: Option<&User>,
    realtime_hub: &realtime::RealtimeHub,
) -> Option<(StatusCode, Value)> {
    let endpoint_type = route.endpoint["type"].as_str().unwrap_or_default();
    match endpoint_type {
        "role_admin_only" | "role_user_only" | "role_promote" | "role_demote" => {
            Some(role_action(database_dir, slug, route, user))
        }
        "notification_trigger" => Some(notification_action(
            module,
            slug,
            database_dir,
            route,
            path,
            body,
            user,
            realtime_hub,
        )),
        "command_run" => Some(command_run(module, slug, database_dir, body)),
        _ if route.model == "Notification" => Some(notification_action(
            module,
            slug,
            database_dir,
            route,
            path,
            body,
            user,
            realtime_hub,
        )),
        _ if route.name == "destroy"
            && route.endpoint["response"]["value"] == "Runs cleared"
            && route.endpoint["route"] == "/runs" =>
        {
            Some(clear_command_runs(database_dir, slug, route))
        }
        _ => None,
    }
}

fn role_action(
    database_dir: &Path,
    slug: &str,
    route: &MatchedRoute,
    user: Option<&User>,
) -> (StatusCode, Value) {
    let Some(user) = user else {
        return (
            StatusCode::UNAUTHORIZED,
            json!({"message": "Unauthenticated."}),
        );
    };
    match route.endpoint["type"].as_str().unwrap_or_default() {
        "role_admin_only" => {
            let granted = user.role == "admin";
            if let Err(error) = record_role_access(
                database_dir,
                slug,
                user.id,
                "GET /admin-only",
                "admin",
                granted,
            ) {
                return internal_error(format!("Unable to record role access: {error}"));
            }
            if granted {
                (
                    StatusCode::OK,
                    json!({"message": "✓ Access granted — you are admin"}),
                )
            } else {
                (
                    StatusCode::FORBIDDEN,
                    json!({"message": "✗ Access denied — admin role required"}),
                )
            }
        }
        "role_user_only" => {
            if let Err(error) =
                record_role_access(database_dir, slug, user.id, "GET /user-only", "user", true)
            {
                return internal_error(format!("Unable to record role access: {error}"));
            }
            (
                StatusCode::OK,
                json!({"message": "✓ Access granted — open to all authenticated users"}),
            )
        }
        kind @ ("role_promote" | "role_demote") => {
            let role = if kind == "role_promote" {
                "admin"
            } else {
                "user"
            };
            match auth::update_user_role(database_dir, slug, user.id, role) {
                Ok(Some(updated)) => (
                    StatusCode::OK,
                    json!({
                        "message": if role == "admin" { "Promoted to admin" } else { "Demoted to user" },
                        "user": updated.json()
                    }),
                ),
                Ok(None) => (StatusCode::NOT_FOUND, json!({"message": "User not found"})),
                Err(error) => internal_error(format!("Unable to update user role: {error}")),
            }
        }
        _ => unreachable!("role action type checked by caller"),
    }
}

fn record_role_access(
    database_dir: &Path,
    slug: &str,
    user_id: i64,
    action: &str,
    required_role: &str,
    granted: bool,
) -> Result<(), String> {
    let connection = crate::db::open_module(database_dir, slug)?;
    let now = connection.now_iso().map_err(|error| error.to_string())?;
    connection
        .execute(
            r#"INSERT INTO "role_audit_logs"
                ("user_id", "action", "role_required", "granted", "created_at", "updated_at")
                VALUES (?1, ?2, ?3, ?4, ?5, ?5)"#,
            crate::db::params![user_id, action, required_role, granted, now],
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn notification_action(
    module: &Value,
    slug: &str,
    database_dir: &Path,
    route: &MatchedRoute,
    path: &str,
    body: &Value,
    user: Option<&User>,
    realtime_hub: &realtime::RealtimeHub,
) -> (StatusCode, Value) {
    let Some(user) = user else {
        return (
            StatusCode::UNAUTHORIZED,
            json!({"message": "Unauthenticated."}),
        );
    };
    let connection = match crate::db::open_module(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => {
            return internal_error(format!("Unable to open notification database: {error}"))
        }
    };
    match route.name.as_str() {
        "index" => {
            let mut statement = match connection.prepare(
                r#"SELECT * FROM "notifications"
                    WHERE "notifiable_type" = 'user' AND "notifiable_id" = ?1
                    ORDER BY "created_at" DESC"#,
            ) {
                Ok(statement) => statement,
                Err(error) => {
                    return internal_error(format!("Unable to load notifications: {error}"))
                }
            };
            let column_names: Vec<String> = statement
                .column_names()
                .into_iter()
                .map(str::to_owned)
                .collect();
            let mut rows = match statement.query([user.id]) {
                Ok(rows) => rows,
                Err(error) => {
                    return internal_error(format!("Unable to load notifications: {error}"))
                }
            };
            let mut records = Vec::new();
            loop {
                let row = match rows.next() {
                    Ok(Some(row)) => row,
                    Ok(None) => break,
                    Err(error) => {
                        return internal_error(format!("Unable to read notifications: {error}"))
                    }
                };
                let mut record = Map::new();
                for (index, name) in column_names.iter().enumerate() {
                    match row.get_ref(index) {
                        Ok(value) => {
                            record.insert(name.clone(), sql_value_to_json(value));
                        }
                        Err(error) => {
                            return internal_error(format!("Unable to read notifications: {error}"))
                        }
                    }
                }
                records.push(Value::Object(record));
            }
            (StatusCode::OK, json!({"data": records}))
        }
        "store" => trigger_notification(module, slug, &connection, body, user, realtime_hub),
        "destroy" => {
            let id = path.rsplit('/').next().unwrap_or_default();
            match connection.execute(
                r#"DELETE FROM "notifications"
                    WHERE "id" = ?1 AND "notifiable_type" = 'user' AND "notifiable_id" = ?2"#,
                crate::db::params![id, user.id],
            ) {
                Ok(0) => (
                    StatusCode::NOT_FOUND,
                    json!({"message": "Notification not found"}),
                ),
                Ok(_) => (
                    StatusCode::OK,
                    json!({"message": response_message(route, "Notification deleted")}),
                ),
                Err(error) => internal_error(format!("Unable to delete notification: {error}")),
            }
        }
        "readAll" => {
            let now = match connection.now_iso() {
                Ok(now) => now,
                Err(error) => {
                    return internal_error(format!("Unable to mark notifications as read: {error}"))
                }
            };
            match connection.execute(
                r#"UPDATE "notifications" SET "read_at" = ?1, "updated_at" = ?1
                    WHERE "notifiable_type" = 'user' AND "notifiable_id" = ?2 AND "read_at" IS NULL"#,
                crate::db::params![now, user.id],
            ) {
                Ok(_) => (
                    StatusCode::OK,
                    json!({"message": response_message(route, "All notifications marked as read")}),
                ),
                Err(error) => internal_error(format!("Unable to mark notifications as read: {error}")),
            }
        }
        _ => (
            StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Notification action {} is not implemented", route.name)}),
        ),
    }
}

fn trigger_notification(
    module: &Value,
    slug: &str,
    connection: &Connection,
    body: &Value,
    user: &User,
    realtime_hub: &realtime::RealtimeHub,
) -> (StatusCode, Value) {
    let Some(name) = body
        .get("notification")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error("notification is required and must be a string");
    };
    let Some(definition) = notification_definitions(module)
        .into_iter()
        .find(|(section, _)| section == name)
        .map(|(_, values)| values)
    else {
        return validation_error("notification must name a declared notification");
    };
    let channels = definition
        .get("channels")
        .map(|channels| {
            channels
                .trim_matches(|character| matches!(character, '[' | ']'))
                .split(',')
                .map(|channel| channel.trim().trim_matches(['\'', '"']).to_owned())
                .filter(|channel| !channel.is_empty())
                .collect::<Vec<_>>()
        })
        .unwrap_or_default();
    if channels.is_empty() {
        return validation_error("notification has no supported delivery channels");
    }
    if let Some(channel) = channels
        .iter()
        .find(|channel| !matches!(channel.as_str(), "database" | "mail" | "broadcast"))
    {
        return (
            StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Notification channel {channel:?} is not supported")}),
        );
    }
    let message = definition
        .get("message")
        .filter(|message| !message.is_empty())
        .cloned()
        .unwrap_or_else(|| name.to_owned());
    let subject = definition
        .get("subject")
        .filter(|subject| !subject.is_empty())
        .cloned()
        .unwrap_or_else(|| name.to_owned());
    let class = format!("{}Notification", pascal_case(name));
    let data = json!({
        "type": format!("NotificationTest\\{class}"),
        "message": message,
        "tatemono": module["name"].as_str().unwrap_or(slug)
    });
    let now = match connection.now_iso() {
        Ok(now) => now,
        Err(error) => {
            return internal_error(format!("Unable to create notification timestamp: {error}"))
        }
    };
    for channel in channels {
        match channel.as_str() {
            "database" => {
                let id = match new_uuid() {
                    Ok(id) => id,
                    Err(error) => {
                        return internal_error(format!("Unable to create notification id: {error}"))
                    }
                };
                if let Err(error) = connection.execute(
                    r#"INSERT INTO "notifications"
                        ("id", "type", "notifiable_type", "notifiable_id", "data", "read_at", "created_at", "updated_at")
                        VALUES (?1, ?2, 'user', ?3, ?4, NULL, ?5, ?5)"#,
                    crate::db::params![
                        id,
                        data["type"].as_str().unwrap_or_default(),
                        user.id,
                        data.to_string(),
                        now
                    ],
                ) {
                    return internal_error(format!("Unable to store database notification: {error}"));
                }
            }
            "mail" => {
                let html = format!("<p>{}</p>", escape_html(&message));
                let mailer = std::env::var("MAIL_MAILER").unwrap_or_else(|_| "log".to_owned());
                if let Err(error) = mail::deliver(&mailer, &user.email, &subject, &html) {
                    return (
                        StatusCode::BAD_GATEWAY,
                        json!({"message": format!("Notification email delivery failed: {error}")}),
                    );
                }
            }
            "broadcast" => {
                let channel_type = definition
                    .get("channel_type")
                    .map(String::as_str)
                    .unwrap_or("private");
                let channel = match channel_type {
                    "public" => "notification-test.notifications".to_owned(),
                    "private" | "presence" => {
                        format!("{channel_type}-notification-test.{}", user.id)
                    }
                    _ => return validation_error("notification channel_type is unsupported"),
                };
                realtime_hub.broadcast_to(
                    &channel,
                    "notification-test.notification",
                    &json!({"message": message, "data": {}}),
                );
            }
            _ => unreachable!("channels validated above"),
        }
    }
    (
        StatusCode::CREATED,
        json!({"message": "Notification triggered successfully", "type": name}),
    )
}

fn notification_definitions(module: &Value) -> Vec<(String, HashMap<String, String>)> {
    module["notifications"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .filter_map(|raw| {
            let mut name = None;
            let mut values = HashMap::new();
            for line in raw.lines() {
                let trimmed = line.trim();
                let Some((key, value)) = trimmed.split_once(':') else {
                    continue;
                };
                if line.chars().next().is_some_and(char::is_whitespace) {
                    values.insert(
                        key.trim().to_owned(),
                        value
                            .trim()
                            .trim_matches(|character| character == '\'' || character == '"')
                            .to_owned(),
                    );
                } else {
                    name = Some(key.trim().to_owned());
                }
            }
            name.map(|name| (name, values))
        })
        .collect()
}

fn command_run(
    module: &Value,
    slug: &str,
    database_dir: &Path,
    body: &Value,
) -> (StatusCode, Value) {
    let Some(name) = body
        .get("command")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error("Field \"command\" has an unsupported value");
    };
    let declared = module["consoles"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .any(|raw| raw.lines().any(|line| line.trim() == format!("{name}:")));
    if !declared {
        return validation_error("Field \"command\" has an unsupported value");
    }
    let triggered_by = body
        .get("triggered_by")
        .and_then(Value::as_str)
        .filter(|value| !value.is_empty())
        .unwrap_or("manual");
    if !matches!(triggered_by, "manual" | "schedule") {
        return validation_error("Field \"triggered_by\" has an unsupported value");
    }
    let Some(output) = command_output(name) else {
        return validation_error("Field \"command\" has no supported Rust command emulation");
    };
    let connection = match crate::db::open_module(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open command database: {error}")),
    };
    let now = match connection.now_iso() {
        Ok(now) => now,
        Err(error) => {
            return internal_error(format!("Could not create command timestamp: {error}"))
        }
    };
    let result = connection.execute(
        r#"INSERT INTO "command_runs"
            ("command_name", "signature", "exit_code", "output", "triggered_by", "duration_ms", "created_at", "updated_at")
            VALUES (?1, ?2, 0, ?3, ?4, 0, ?5, ?5)"#,
        crate::db::params![name, format!("{slug}:{name}"), output, triggered_by, now],
    );
    if let Err(error) = result {
        return internal_error(format!("Could not record command run: {error}"));
    }
    let id = connection.last_insert_rowid();
    let mut statement = match connection.prepare(r#"SELECT * FROM "command_runs" WHERE "id" = ?1"#)
    {
        Ok(statement) => statement,
        Err(error) => return internal_error(format!("Could not load command run: {error}")),
    };
    let names = statement
        .column_names()
        .into_iter()
        .map(str::to_owned)
        .collect::<Vec<_>>();
    let mut rows = match statement.query([id]) {
        Ok(rows) => rows,
        Err(error) => return internal_error(format!("Could not load command run: {error}")),
    };
    let Some(row) = (match rows.next() {
        Ok(row) => row,
        Err(error) => return internal_error(format!("Could not load command run: {error}")),
    }) else {
        return internal_error("Command run was inserted but could not be reloaded".to_owned());
    };
    let mut record = Map::new();
    for (index, name) in names.iter().enumerate() {
        match row.get_ref(index) {
            Ok(value) => {
                record.insert(name.clone(), sql_value_to_json(value));
            }
            Err(error) => return internal_error(format!("Could not read command run: {error}")),
        }
    }
    (
        StatusCode::CREATED,
        json!({"data": record, "emulated": true}),
    )
}

fn clear_command_runs(
    database_dir: &Path,
    slug: &str,
    route: &MatchedRoute,
) -> (StatusCode, Value) {
    let connection = match crate::db::open_module(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open command database: {error}")),
    };
    match connection.execute(r#"DELETE FROM "command_runs""#, crate::db::params![]) {
        Ok(_) => (
            StatusCode::OK,
            json!({"message": response_message(route, "Runs cleared")}),
        ),
        Err(error) => internal_error(format!("Could not clear command runs: {error}")),
    }
}

fn command_output(name: &str) -> Option<&'static str> {
    match name {
        "cleanup-temp" => Some("Cleanup completed successfully."),
        "generate-report" => Some("Daily report generated successfully."),
        "ping-health" => Some("All services healthy."),
        "sync-data" => Some("Data synced successfully."),
        _ => None,
    }
}

fn response_message(route: &MatchedRoute, fallback: &str) -> String {
    route.endpoint["response"]["value"]
        .as_str()
        .unwrap_or(fallback)
        .to_owned()
}

fn sql_value_to_json(value: ValueRef<'_>) -> Value {
    match value {
        ValueRef::Null => Value::Null,
        ValueRef::Integer(value) => json!(value),
        ValueRef::Real(value) => json!(value),
        ValueRef::Text(value) => Value::String(String::from_utf8_lossy(value).into_owned()),
        ValueRef::Blob(value) => Value::String(base64::Engine::encode(
            &base64::engine::general_purpose::STANDARD,
            value,
        )),
    }
}

fn pascal_case(value: &str) -> String {
    value
        .split(|character: char| !character.is_ascii_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_ascii_uppercase().to_string() + chars.as_str())
                .unwrap_or_default()
        })
        .collect()
}

fn new_uuid() -> Result<String, String> {
    let mut bytes = [0u8; 16];
    getrandom::getrandom(&mut bytes).map_err(|error| error.to_string())?;
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    let hex = bytes
        .iter()
        .map(|byte| format!("{byte:02x}"))
        .collect::<String>();
    Ok(format!(
        "{}-{}-{}-{}-{}",
        &hex[0..8],
        &hex[8..12],
        &hex[12..16],
        &hex[16..20],
        &hex[20..32]
    ))
}

fn escape_html(value: &str) -> String {
    value
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
        .replace('\'', "&#39;")
}

fn validation_error(message: &str) -> (StatusCode, Value) {
    (
        StatusCode::UNPROCESSABLE_ENTITY,
        json!({"message": "Validation failed", "errors": [message]}),
    )
}

fn internal_error(message: String) -> (StatusCode, Value) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        json!({"message": message}),
    )
}
