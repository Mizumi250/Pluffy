use base64::{engine::general_purpose::STANDARD, Engine};
use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, Message,
    SmtpTransport, Transport,
};
use crate::db::{
    types::{Value as SqlValue, ValueRef},
    Connection, OptionalExtension,
};
use serde_json::{json, Map, Value};
use std::{collections::HashMap, path::Path};

pub struct MatchedRoute {
    pub name: String,
    pub endpoint: Value,
    pub table: String,
    pub schema: Value,
    pub model: String,
    pub middleware: Vec<Value>,
    pub supported: bool,
}

fn is_events_test_module(module: &Value) -> bool {
    module["name"].as_str() == Some("events-test")
        && module["events"]
            .as_array()
            .is_some_and(|events| !events.is_empty())
}

fn is_job_test_module(module: &Value) -> bool {
    module["name"].as_str() == Some("job-test")
        && module["jobs"]
            .as_array()
            .is_some_and(|jobs| !jobs.is_empty())
}

fn is_scheduler_test_module(module: &Value) -> bool {
    module["name"].as_str() == Some("scheduler-test")
}

fn is_mail_test_module(module: &Value) -> bool {
    module["name"].as_str() == Some("mail-test")
        && module["mails"]
            .as_array()
            .is_some_and(|mails| !mails.is_empty())
}

fn is_body_mail_notification_module(module: &Value) -> bool {
    module["name"].as_str() == Some("body-mail-notification")
        && module["auth"].as_bool() == Some(true)
}

fn is_notification_test_module(module: &Value) -> bool {
    module["name"].as_str() == Some("notification-test")
        && module["auth"].as_bool() == Some(true)
        && module["notifications"]
            .as_array()
            .is_some_and(|notifications| !notifications.is_empty())
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
                    return Some(MatchedRoute {
                        name: name.clone(),
                        endpoint: endpoint.clone(),
                        table: table.to_owned(),
                        schema: schema.clone(),
                        model: model.to_owned(),
                        middleware,
                        supported: (is_crud_name(name)
                            || is_supported_custom_endpoint(module, name, endpoint))
                            && (!is_crud_name(name)
                                || match endpoint_object.get("type") {
                                    None => true,
                                    Some(kind) => kind.as_str().is_some_and(|kind| {
                                        matches!(
                                            kind,
                                            "index" | "show" | "store" | "update" | "destroy"
                                        ) || (name == "store" && kind == "broadcast")
                                            || (name == "store"
                                                && kind == "event_fire"
                                                && is_events_test_module(module))
                                            || (name == "store"
                                                && kind == "job_dispatch"
                                                && is_job_test_module(module))
                                            || (name == "store"
                                                && kind == "command_run"
                                                && is_scheduler_test_module(module))
                                            || (name == "store"
                                                && kind == "mail_send"
                                                && is_mail_test_module(module))
                                            || (name == "store"
                                                && kind == "notification_trigger"
                                                && is_notification_test_module(module))
                                    }),
                                })
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
            let table = "probe_results";
            let schema = module
                .get("databases")
                .and_then(Value::as_array)
                .into_iter()
                .flatten()
                .find(|database| database["table"].as_str() == Some(table))
                .cloned()
                .unwrap_or_else(|| json!({}));
            return Some(MatchedRoute {
                name: name.clone(),
                endpoint: route.clone(),
                table: table.to_owned(),
                schema,
                model: "ProbeResult".to_owned(),
                middleware: middleware.clone(),
                supported: is_supported_custom_route(module, route),
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
                    .filter(|(name, endpoint)| {
                        is_crud_name(name) || is_supported_custom_endpoint(module, name, endpoint)
                    })
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
            if endpoint.get("body").is_some_and(|body| {
                body.as_str()
                    .map_or(!body.is_null(), |body| !body.trim().is_empty())
            }) {
                if !is_supported_custom_endpoint(module, name, endpoint) {
                    warnings.push(format!(
                        "Endpoint {name} has a custom body; Rust does not execute DSL handler bodies"
                    ));
                }
            } else if !is_crud_name(name) && !is_supported_custom_endpoint(module, name, endpoint) {
                warnings.push(format!(
                    "Endpoint {name} is registered but unsupported requests return 501"
                ));
            } else if endpoint
                .get("type")
                .and_then(Value::as_str)
                .is_some_and(|kind| {
                    !matches!(kind, "index" | "show" | "store" | "update" | "destroy")
                        && !(name == "store" && kind == "broadcast")
                        && !(name == "store"
                            && kind == "event_fire"
                            && is_events_test_module(module))
                        && !(name == "store"
                            && kind == "job_dispatch"
                            && is_job_test_module(module))
                        && !(name == "store" && kind == "mail_send" && is_mail_test_module(module))
                        && !(name == "store"
                            && kind == "notification_trigger"
                            && is_notification_test_module(module))
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
                middleware.iter().any(|middleware| match middleware.as_str() {
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
                .is_some_and(|body| !body.trim().is_empty())
                && !is_supported_custom_route(module, route)
            {
                warnings.push(format!(
                    "Custom route handler {handler} has a body; Rust does not execute this handler"
                ));
            }
        }
    }
    for (field, label) in [
        ("events", "Event/listener"),
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
            if field == "events" && is_events_test_module(module) {
                warnings.push(
                    "events-test event_fire endpoints run declared listeners as database-log emulations; custom listener bodies are not evaluated"
                        .to_owned(),
                );
                continue;
            }
            if field == "jobs" && is_job_test_module(module) {
                warnings.push(
                    "job-test jobs run through named in-process emulations; Rust does not provide a durable queue worker or execute arbitrary job bodies"
                        .to_owned(),
                );
                continue;
            }
            if field == "consoles" && is_scheduler_test_module(module) {
                warnings.push(
                    "scheduler-test commands can be run manually through a named emulation; Rust does not execute console bodies or automatically run cron schedules"
                        .to_owned(),
                );
                continue;
            }
            if field == "mails" && is_mail_test_module(module) {
                warnings.push(
                    "mail-test resolves named templates and uses the configured log or SMTP mailer"
                        .to_owned(),
                );
                continue;
            }
            if field == "mails" && is_body_mail_notification_module(module) {
                warnings.push(
                    "body-mail-notification resolves named templates and records configured mail delivery results"
                        .to_owned(),
                );
                continue;
            }
            if field == "notifications" && is_body_mail_notification_module(module) {
                warnings.push(
                    "body-mail-notification emulates its named email notifications; arbitrary notification bodies are not evaluated"
                        .to_owned(),
                );
                continue;
            }
            if field == "notifications" && is_notification_test_module(module) {
                warnings.push(
                    "notification-test delivers declared notifications through database, configured mail, and realtime emulations; arbitrary notification bodies are not evaluated"
                        .to_owned(),
                );
                continue;
            }
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

fn is_supported_custom_endpoint(module: &Value, name: &str, endpoint: &Value) -> bool {
    let method = endpoint
        .get("method")
        .and_then(Value::as_str)
        .unwrap_or("GET");
    let route = endpoint.get("route").and_then(Value::as_str).unwrap_or("/");
    if module["name"].as_str() == Some("jo-payroll") {
        return match name {
            "summary" => method.eq_ignore_ascii_case("GET") && route == "/job-orders/stats/summary",
            "byGroup" => method.eq_ignore_ascii_case("GET") && route == "/job-orders/group/{group}",
            "appointments" => {
                method.eq_ignore_ascii_case("GET") && route == "/job-orders/appointments/list"
            }
            _ => false,
        };
    }
    if module["name"].as_str() == Some("roles-test") && module["auth"].as_bool() == Some(true) {
        return match (name, endpoint["type"].as_str()) {
            ("adminOnly", Some("role_admin_only")) => {
                method.eq_ignore_ascii_case("GET") && route == "/admin-only"
            }
            ("userOnly", Some("role_user_only")) => {
                method.eq_ignore_ascii_case("GET") && route == "/user-only"
            }
            ("promote", Some("role_promote")) => {
                method.eq_ignore_ascii_case("POST") && route == "/promote"
            }
            ("demote", Some("role_demote")) => {
                method.eq_ignore_ascii_case("POST") && route == "/demote"
            }
            _ => false,
        };
    }
    if is_events_test_module(module) && name == "clearLog" {
        return method.eq_ignore_ascii_case("POST")
            && route == "/log/clear"
            && endpoint["response"]["value"].as_str() == Some("Log cleared");
    }
    if is_job_test_module(module) && name == "store" {
        return method.eq_ignore_ascii_case("POST")
            && route == "/dispatch"
            && endpoint["type"].as_str() == Some("job_dispatch");
    }
    if is_scheduler_test_module(module) {
        return match name {
            "store" => {
                method.eq_ignore_ascii_case("POST")
                    && route == "/run"
                    && endpoint["type"].as_str() == Some("command_run")
            }
            "destroy" => {
                method.eq_ignore_ascii_case("DELETE")
                    && route == "/runs"
                    && endpoint["response"]["value"].as_str() == Some("Runs cleared")
            }
            _ => false,
        };
    }
    if is_body_mail_notification_module(module) {
        return match name {
            "sendMail" => method.eq_ignore_ascii_case("POST") && route == "/send-mail",
            "notify" => method.eq_ignore_ascii_case("POST") && route == "/notify",
            "clearLog" => {
                method.eq_ignore_ascii_case("DELETE")
                    && route == "/log/clear"
                    && endpoint["response"]["value"].as_str() == Some("Log cleared")
            }
            _ => false,
        };
    }
    if is_notification_test_module(module) {
        return match name {
            "readAll" => method.eq_ignore_ascii_case("POST") && route == "/inbox/read-all",
            _ => false,
        };
    }
    matches!(
        name,
        "echo" | "stats" | "lowStock" | "handler:ping" | "handler:recordHandler" | "handler:latest"
    ) && endpoint
        .get("body")
        .and_then(Value::as_str)
        .is_some_and(|body| !body.trim().is_empty())
}

fn is_supported_custom_route(module: &Value, route: &Value) -> bool {
    let method = route.get("method").and_then(Value::as_str).unwrap_or("GET");
    let path = route.get("route").and_then(Value::as_str).unwrap_or("/");
    let handler = route
        .get("handler")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if module["name"].as_str() == Some("queue-flow") {
        let path = path.trim_end_matches('/');
        return match handler {
            "join_queue" => method.eq_ignore_ascii_case("POST") && path == "/api/queue-flow/join",
            "call_next" => {
                method.eq_ignore_ascii_case("POST") && path == "/api/queue-flow/call-next"
            }
            "queue_status" => {
                method.eq_ignore_ascii_case("GET") && path == "/api/queue-flow/status/{queue_id}"
            }
            "my_ticket" => {
                method.eq_ignore_ascii_case("GET")
                    && path == "/api/queue-flow/my-ticket/{queue_id}/{ticket_number}"
            }
            _ => false,
        };
    }
    if module["name"].as_str() == Some("kotoba") {
        return super::kotoba::supports_route(method, path, handler);
    }
    is_supported_custom_endpoint(module, &format!("handler:{handler}"), route)
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

pub fn run_scheduler_command(
    database_dir: &Path,
    table: &str,
    schema: &Value,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    let Some(command) = body
        .get("command")
        .and_then(Value::as_str)
        .filter(|command| {
            matches!(
                *command,
                "cleanup-temp" | "generate-report" | "ping-health" | "sync-data"
            )
        })
    else {
        return validation_error(vec!["Field \"command\" has an unsupported value".to_owned()]);
    };
    let triggered_by = match body.get("triggered_by") {
        None | Some(Value::Null) => "manual",
        Some(Value::String(value)) if value.is_empty() => "manual",
        Some(Value::String(value)) if matches!(value.as_str(), "manual" | "schedule") => value,
        _ => {
            return validation_error(vec![
                "Field \"triggered_by\" has an unsupported value".to_owned()
            ])
        }
    };
    let output = match command {
        "cleanup-temp" => "Cleanup completed successfully.",
        "generate-report" => "Daily report generated successfully.",
        "ping-health" => "All services healthy.",
        "sync-data" => "Data synced successfully.",
        _ => unreachable!("command is restricted to the supported names"),
    };
    let connection = match open_connection(database_dir, "scheduler-test") {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open scheduler database: {error}")),
    };
    let record = json!({
        "command_name": command,
        "signature": format!("scheduler-test:{command}"),
        "exit_code": 0,
        "output": output,
        "triggered_by": triggered_by,
        "duration_ms": 0
    });
    let (status, created) = store(&connection, table, &json!({}), schema, &record);
    if status != axum::http::StatusCode::CREATED {
        return (status, created);
    }
    (
        axum::http::StatusCode::CREATED,
        json!({"data": created, "emulated": true}),
    )
}

pub fn clear_scheduler_runs(database_dir: &Path, table: &str) -> (axum::http::StatusCode, Value) {
    if !super::engine::is_identifier(table) {
        return internal_error(format!(
            "Configured scheduler run table \"{table}\" is invalid"
        ));
    }
    let connection = match open_connection(database_dir, "scheduler-test") {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open scheduler database: {error}")),
    };
    if !table_exists(&connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let query = format!("DELETE FROM {}", quote(table));
    match connection.execute(&query, crate::db::params![]) {
        Ok(_) => (
            axum::http::StatusCode::OK,
            json!({"message": "Runs cleared"}),
        ),
        Err(error) => internal_error(format!("Could not clear scheduler runs: {error}")),
    }
}

pub fn roles_test_action(
    database_dir: &Path,
    table: &str,
    schema: &Value,
    action: &str,
    user: &super::auth::User,
) -> (axum::http::StatusCode, Value) {
    match action {
        "adminOnly" | "userOnly" => {
            let connection = match open_connection(database_dir, "roles-test") {
                Ok(connection) => connection,
                Err(error) => {
                    return internal_error(format!("Could not open role audit database: {error}"))
                }
            };
            let is_admin_route = action == "adminOnly";
            let granted = !is_admin_route || user.role == "admin";
            let audit = json!({
                "user_id": user.id,
                "action": if is_admin_route { "GET /admin-only" } else { "GET /user-only" },
                "role_required": if is_admin_route { "admin" } else { "user" },
                "granted": granted
            });
            let (status, result) = store(&connection, table, &json!({}), schema, &audit);
            if status != axum::http::StatusCode::CREATED {
                return (status, result);
            }
            if is_admin_route && !granted {
                return (
                    axum::http::StatusCode::FORBIDDEN,
                    json!({"message": "✗ Access denied — admin role required"}),
                );
            }
            let message = if is_admin_route {
                "✓ Access granted — you are admin"
            } else {
                "✓ Access granted — open to all authenticated users"
            };
            (axum::http::StatusCode::OK, json!({"message": message}))
        }
        "promote" | "demote" => {
            let role = if action == "promote" { "admin" } else { "user" };
            let message = if role == "admin" {
                "Promoted to admin"
            } else {
                "Demoted to user"
            };
            match super::auth::update_user_role(database_dir, "roles-test", user.id, role) {
                Ok(Some(user)) => (
                    axum::http::StatusCode::OK,
                    json!({"message": message, "user": user.json()}),
                ),
                Ok(None) => {
                    internal_error("Authenticated role-test user no longer exists".to_owned())
                }
                Err(error) => {
                    internal_error(format!("Could not update authenticated user role: {error}"))
                }
            }
        }
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Role-test action {action} is not implemented")}),
        ),
    }
}

pub fn fire_event(
    database_dir: &Path,
    slug: &str,
    table: &str,
    events: &[Value],
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    use std::time::Instant;

    if slug != "events-test" || !super::engine::is_identifier(table) {
        return internal_error(format!(
            "Configured event log table \"{table}\" does not exist"
        ));
    }
    let Some(input) = body.as_object() else {
        return validation_error(vec!["Request body must be a JSON object".to_owned()]);
    };
    let Some(event_key) = input
        .get("event")
        .and_then(Value::as_str)
        .filter(|event| !event.trim().is_empty())
    else {
        return validation_error(vec![
            "The event field is required and must be a string.".to_owned()
        ]);
    };
    let payload = input.get("payload").cloned().unwrap_or_else(|| json!({}));
    if !payload.is_null() && !payload.is_object() && !payload.is_array() {
        return validation_error(vec![
            "The payload field must be an array or object.".to_owned()
        ]);
    }
    let event_section = events
        .iter()
        .filter_map(Value::as_str)
        .filter_map(|raw| {
            let mut lines = raw.lines();
            let section_name = lines.next()?.trim().trim_end_matches(':');
            let listener_names = lines.find_map(|line| {
                let (key, value) = line.trim().split_once(':')?;
                (key == "listeners").then(|| {
                    value
                        .trim()
                        .trim_start_matches('[')
                        .trim_end_matches(']')
                        .split(',')
                        .map(|listener| {
                            listener
                                .trim()
                                .trim_matches(|character| character == '\'' || character == '"')
                        })
                        .filter(|listener| !listener.is_empty())
                        .map(str::to_owned)
                        .collect::<Vec<_>>()
                })
            })?;
            Some((section_name.to_owned(), listener_names))
        })
        .find(|(section_name, _)| {
            normalize_event_identifier(section_name) == normalize_event_identifier(event_key)
        });
    let Some((section_name, listener_names)) = event_section else {
        return (
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            json!({
                "message": "Validation failed",
                "errors": [format!("Field \"event\" has an unsupported value: {event_key}")]
            }),
        );
    };
    if listener_names.is_empty() {
        return (
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            json!({"message": "The event has no configured listeners."}),
        );
    }

    let connection = match open_connection(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => return internal_error(error),
    };
    if !table_exists(&connection, table) {
        return internal_error(format!(
            "Configured event log table \"{table}\" does not exist"
        ));
    }
    let columns = match column_names(&connection, table) {
        Ok(columns) => columns,
        Err(error) => return internal_error(format!("Could not inspect event log table: {error}")),
    };
    for required in ["event_name", "listener_name", "status", "payload"] {
        if !columns.iter().any(|column| column == required) {
            return internal_error(format!(
                "Configured event log table \"{table}\" is missing column \"{required}\""
            ));
        }
    }

    let event_name = section_name
        .split('-')
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut characters = part.chars();
            characters
                .next()
                .map(|first| first.to_ascii_uppercase().to_string() + characters.as_str())
                .unwrap_or_default()
        })
        .collect::<String>();
    let payload = if payload.is_null() {
        json!({})
    } else {
        payload
    };
    let payload_json = payload.to_string();
    let transaction = match connection.unchecked_transaction() {
        Ok(transaction) => transaction,
        Err(error) => return internal_error(format!("Could not start event dispatch: {error}")),
    };
    let started = Instant::now();
    for listener in listener_names {
        let mut fields = vec![
            ("event_name", SqlValue::Text(event_name.clone())),
            ("listener_name", SqlValue::Text(listener)),
            ("status", SqlValue::Text("completed".to_owned())),
            ("payload", SqlValue::Text(payload_json.clone())),
        ];
        if columns.iter().any(|column| column == "duration_ms") {
            fields.push((
                "duration_ms",
                SqlValue::Integer(started.elapsed().as_millis().min(i64::MAX as u128) as i64),
            ));
        }
        let mut names = fields
            .iter()
            .map(|(name, _)| quote(name))
            .collect::<Vec<_>>();
        let mut placeholders = (1..=fields.len())
            .map(|index| format!("?{index}"))
            .collect::<Vec<_>>();
        for timestamp in ["created_at", "updated_at"] {
            if columns.iter().any(|column| column == timestamp) {
                names.push(quote(timestamp));
                placeholders.push("CURRENT_TIMESTAMP".to_owned());
            }
        }
        let sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            quote(table),
            names.join(", "),
            placeholders.join(", ")
        );
        let values = fields
            .into_iter()
            .map(|(_, value)| value)
            .collect::<Vec<_>>();
        if let Err(error) = transaction.execute(&sql, crate::db::params_from_iter(values)) {
            return internal_error(format!(
                "Could not record event listener execution: {error}"
            ));
        }
    }
    if let Err(error) = transaction.commit() {
        return internal_error(format!(
            "Could not commit event listener execution: {error}"
        ));
    }
    (
        axum::http::StatusCode::ACCEPTED,
        json!({"message": "Event fired"}),
    )
}

fn normalize_event_identifier(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

pub fn send_mail(
    database_dir: &Path,
    slug: &str,
    table: &str,
    mails: &[Value],
    body: &Value,
    user_id: Option<i64>,
    schema: &Value,
) -> (axum::http::StatusCode, Value) {
    if slug != "mail-test" || !super::engine::is_identifier(table) {
        return internal_error(format!("Configured mail log table \"{table}\" is invalid"));
    }
    let Some(mail_name) = body
        .get("mail")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error(vec![
            "Field \"mail\" is required and must be a string".to_owned()
        ]);
    };
    let Some(recipient) = body
        .get("to")
        .and_then(Value::as_str)
        .filter(|recipient| super::auth::valid_email(recipient))
    else {
        return validation_error(vec!["Field \"to\" must be a valid email address".to_owned()]);
    };
    let data = match body.get("data") {
        None | Some(Value::Null) => Map::new(),
        Some(Value::Object(data)) => data.clone(),
        Some(_) => return validation_error(vec!["Field \"data\" must be an object".to_owned()]),
    };
    let mut mail_definition = None;
    for raw in mails.iter().filter_map(Value::as_str) {
        let definition = match parse_mail_definition(raw) {
            Ok(Some(definition)) => definition,
            Ok(None) => continue,
            Err(error) => return internal_error(format!("Invalid mail definition: {error}")),
        };
        if normalize_event_identifier(&definition.0) == normalize_event_identifier(mail_name) {
            mail_definition = Some(definition);
            break;
        }
    }
    let Some((mail_name, subject, template)) = mail_definition else {
        return (
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            json!({
                "message": "Validation failed",
                "errors": [format!("Field \"mail\" has an unsupported value: {mail_name}")]
            }),
        );
    };
    let rendered = match render_mail_template(&template, &data) {
        Ok(rendered) => rendered,
        Err(error) => return internal_error(format!("Could not render mail template: {error}")),
    };
    if let Err(error) = deliver_configured_mail(recipient, &subject, &rendered) {
        return (
            axum::http::StatusCode::BAD_GATEWAY,
            json!({"message": format!("Email delivery failed: {error}")}),
        );
    }
    let class_name = mail_name
        .split(|character: char| !character.is_ascii_alphanumeric())
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_ascii_uppercase().to_string() + chars.as_str())
                .unwrap_or_default()
        })
        .collect::<String>();
    let mut fields = Map::from_iter([
        ("to_email".to_owned(), Value::String(recipient.to_owned())),
        ("subject".to_owned(), Value::String(subject)),
        (
            "mail_class".to_owned(),
            Value::String(format!("{class_name}Mail")),
        ),
        ("status".to_owned(), Value::String("sent".to_owned())),
    ]);
    if let Some(user_id) = user_id {
        fields.insert("user_id".to_owned(), json!(user_id));
    }
    let connection = match open_connection(database_dir, slug) {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open mail log database: {error}")),
    };
    store(
        &connection,
        table,
        &json!({}),
        schema,
        &Value::Object(fields),
    )
}

fn deliver_configured_mail(recipient: &str, subject: &str, html: &str) -> Result<(), String> {
    let mailer = std::env::var("MAIL_MAILER")
        .unwrap_or_else(|_| "log".to_owned())
        .to_ascii_lowercase();
    match mailer.as_str() {
        "log" | "array" => {
            tracing::info!(to = recipient, subject, "[mail:log] Rust mail emulation");
            Ok(())
        }
        "smtp" => deliver_smtp_mail(recipient, subject, html),
        _ => Err(format!(
            "Mail driver {mailer} is not implemented by the Rust engine"
        )),
    }
}

fn deliver_smtp_mail(recipient: &str, subject: &str, html: &str) -> Result<(), String> {
    let host = std::env::var("MAIL_HOST").unwrap_or_else(|_| "127.0.0.1".to_owned());
    let port = std::env::var("MAIL_PORT")
        .unwrap_or_else(|_| "587".to_owned())
        .parse::<u16>()
        .ok()
        .filter(|port| *port > 0)
        .ok_or_else(|| "MAIL_PORT must be an integer from 1 to 65535".to_owned())?;
    let from =
        std::env::var("MAIL_FROM_ADDRESS").unwrap_or_else(|_| "hello@example.com".to_owned());
    let message = Message::builder()
        .from(
            from.parse()
                .map_err(|error| format!("Invalid MAIL_FROM_ADDRESS: {error}"))?,
        )
        .to(recipient
            .parse()
            .map_err(|error| format!("Invalid recipient address: {error}"))?)
        .subject(subject)
        .header(ContentType::TEXT_HTML)
        .body(html.to_owned())
        .map_err(|error| format!("Could not build email: {error}"))?;

    let mut transport = SmtpTransport::relay(&host)
        .map_err(|error| format!("Could not configure SMTP transport: {error}"))?
        .port(port);
    if let Ok(username) = std::env::var("MAIL_USERNAME") {
        if !username.is_empty() {
            transport = transport.credentials(Credentials::new(
                username,
                std::env::var("MAIL_PASSWORD").unwrap_or_default(),
            ));
        }
    }
    transport
        .build()
        .send(&message)
        .map(|_| ())
        .map_err(|error| error.to_string())
}

pub fn body_mail_notification_action(
    database_dir: &Path,
    table: &str,
    schema: &Value,
    action: &str,
    mails: &[Value],
    notifications: &[Value],
    body: &Value,
    user_id: i64,
    user_email: &str,
) -> (axum::http::StatusCode, Value) {
    if !super::engine::is_identifier(table) {
        return internal_error(format!("Configured send log table \"{table}\" is invalid"));
    }
    if action == "clearLog" {
        let connection = match open_connection(database_dir, "body-mail-notification") {
            Ok(connection) => connection,
            Err(error) => {
                return internal_error(format!("Could not open send log database: {error}"))
            }
        };
        if !table_exists(&connection, table) {
            return internal_error(format!("Configured table \"{table}\" does not exist"));
        }
        let query = format!("DELETE FROM {} WHERE \"user_id\" = ?1", quote(table));
        return match connection.execute(&query, [user_id]) {
            Ok(_) => (
                axum::http::StatusCode::OK,
                json!({"message": "Log cleared"}),
            ),
            Err(error) => internal_error(format!("Could not clear send log: {error}")),
        };
    }

    let (to_email, subject, delivery_subject, mail_class, kind, html, database_notification) =
        if action == "sendMail" {
            let Some(mail_name) = body
                .get("mail")
                .and_then(Value::as_str)
                .filter(|name| matches!(*name, "welcome" | "receipt" | "alert"))
            else {
                return validation_error(vec![
                    "Field \"mail\" must be welcome, receipt, or alert".to_owned()
                ]);
            };
            let Some(recipient) = body
                .get("to")
                .and_then(Value::as_str)
                .filter(|recipient| super::auth::valid_email(recipient))
            else {
                return validation_error(vec![
                    "Field \"to\" must be a valid email address".to_owned()
                ]);
            };
            let template_data = match mail_name {
                "welcome" => json!({"name": "Test User", "app_name": "Arkzen"}),
                "receipt" => json!({
                    "order_id": "ORD-001",
                    "amount": "$9.99",
                    "item_name": "Arkzen Test Item"
                }),
                _ => json!({
                    "alert_message": "This is a test alert from Arkzen.",
                    "action_url": "/"
                }),
            };
            let registered_mail = match parse_registered_mail(mails, mail_name) {
                Ok(Some(registered_mail)) => registered_mail,
                Ok(None) => {
                    return (
                        axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                        json!({
                            "message": "Validation failed",
                            "errors": [format!("Mail template {mail_name} is not configured for Rust")]
                        }),
                    )
                }
                Err(error) => return internal_error(format!("Invalid mail definition: {error}")),
            };
            let (_, delivery_subject, template) = registered_mail;
            let Some(template_data) = template_data.as_object() else {
                return internal_error("Mail template data must be an object".to_owned());
            };
            let rendered = match render_mail_template(&template, template_data) {
                Ok(rendered) => rendered,
                Err(error) => {
                    return internal_error(format!("Could not render mail template: {error}"))
                }
            };
            (
                recipient.to_owned(),
                mail_name.to_owned(),
                delivery_subject,
                format!("{}Mail", studly(mail_name)),
                "mail",
                rendered,
                None,
            )
        } else if action == "notify" {
            let Some(notification_name) = body
                .get("notification")
                .and_then(Value::as_str)
                .filter(|name| matches!(*name, "action-required" | "summary"))
            else {
                return validation_error(vec![
                    "Field \"notification\" must be action-required or summary".to_owned(),
                ]);
            };
            let message = match body.get("message") {
                None | Some(Value::Null) => notification_message(notifications, notification_name)
                    .unwrap_or_else(|| {
                        if notification_name == "action-required" {
                            "You have a pending action that requires your attention.".to_owned()
                        } else {
                            "Here is your latest activity summary.".to_owned()
                        }
                    }),
                Some(Value::String(message)) if message.chars().count() <= 255 => message.clone(),
                Some(Value::String(_)) => {
                    return validation_error(vec![
                        "The message field may not be greater than 255 characters.".to_owned(),
                    ])
                }
                Some(_) => {
                    return validation_error(vec!["The message field must be a string.".to_owned()])
                }
            };
            let (subject, html) = if notification_name == "action-required" {
                (
                "Action Required — toMail_body injection test",
                format!(
                    "<p>Hello!</p><p>{}</p><p>This toMail() body was injected via the Arkzen DSL — not a stub.</p><p><a href=\"/\">Review Now</a></p><p>NotificationBuilder v3.9 toMail_body injection confirmed</p>",
                    escape_html(&message)
                ),
            )
            } else {
                (
                "Activity Summary — toMail_body injection test",
                format!(
                    "<p>Hi there!</p><p>{}</p><p>Notifications: 2 unread | Mails: 3 sent | Status: All healthy</p><p><a href=\"/\">View Dashboard</a></p><p>Cheers, Arkzen Engine</p>",
                    escape_html(&message)
                ),
            )
            };
            let database_notification =
                notification_has_channel(notifications, notification_name, "database")
                    .then(|| (notification_name.to_owned(), json!({"message": message})));
            (
                user_email.to_owned(),
                notification_name.to_owned(),
                subject.to_owned(),
                format!("{}Notification", studly(notification_name)),
                "notification",
                html,
                database_notification,
            )
        } else {
            return (
                axum::http::StatusCode::NOT_IMPLEMENTED,
                json!({"message": format!("Endpoint {action} is not implemented by the Rust engine")}),
            );
        };

    let mut fields = Map::from_iter([
        ("user_id".to_owned(), json!(user_id)),
        ("to_email".to_owned(), Value::String(to_email.clone())),
        ("subject".to_owned(), Value::String(subject.clone())),
        ("mail_class".to_owned(), Value::String(mail_class)),
        ("kind".to_owned(), Value::String(kind.to_owned())),
    ]);
    match deliver_configured_mail(&to_email, &delivery_subject, &html) {
        Ok(()) => {
            fields.insert("status".to_owned(), Value::String("sent".to_owned()));
        }
        Err(error) => {
            fields.insert("status".to_owned(), Value::String("failed".to_owned()));
            fields.insert("error".to_owned(), Value::String(error));
        }
    }
    let connection = match open_connection(database_dir, "body-mail-notification") {
        Ok(connection) => connection,
        Err(error) => return internal_error(format!("Could not open send log database: {error}")),
    };
    if let Some((notification_type, data)) = database_notification {
        let data = match serde_json::to_string(&data) {
            Ok(data) => data,
            Err(error) => {
                return internal_error(format!(
                    "Could not serialize database notification: {error}"
                ))
            }
        };
        if let Err(error) = connection.execute(
            "INSERT INTO \"notifications\" (\"id\", \"type\", \"notifiable_type\", \"notifiable_id\", \"data\", \"read_at\", \"created_at\", \"updated_at\") VALUES (lower(hex(randomblob(16))), ?1, 'user', ?2, ?3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
            crate::db::params![notification_type, user_id, data],
        ) {
            return internal_error(format!("Could not store database notification: {error}"));
        }
    }
    let (status, record) = store(
        &connection,
        table,
        &json!({}),
        schema,
        &Value::Object(fields),
    );
    if status == axum::http::StatusCode::CREATED {
        (status, json!({"data": record}))
    } else {
        (status, record)
    }
}

pub fn notification_test_action(
    database_dir: &Path,
    action: &str,
    path: &str,
    body: &Value,
    notifications: &[Value],
    user_id: i64,
    user_email: &str,
) -> (axum::http::StatusCode, Value, Option<(String, Value)>) {
    use axum::http::StatusCode;

    let connection = match open_connection(database_dir, "notification-test") {
        Ok(connection) => connection,
        Err(error) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Could not open notification database: {error}")}),
                None,
            )
        }
    };
    if !table_exists(&connection, "notifications") {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": "Configured notifications table does not exist"}),
            None,
        );
    }

    match action {
        "index" => {
            let rows = read_rows(
                &connection,
                "SELECT * FROM \"notifications\" WHERE \"notifiable_type\" = 'user' AND \"notifiable_id\" = ? ORDER BY \"created_at\" DESC",
                vec![SqlValue::Integer(user_id)],
                &json!({}),
            );
            match rows {
                Ok(rows) => (StatusCode::OK, json!({"data": rows}), None),
                Err(error) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": format!("Could not load notifications: {error}")}),
                    None,
                ),
            }
        }
        "store" => {
            let Some(name) = body
                .get("notification")
                .and_then(Value::as_str)
                .filter(|name| !name.trim().is_empty())
            else {
                return (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    json!({
                        "message": "Validation failed",
                        "errors": ["notification is required and must be a string"]
                    }),
                    None,
                );
            };
            let Some(definition) = notification_definition(notifications, name) else {
                return (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    json!({
                        "message": "Validation failed",
                        "errors": ["notification must name a declared notification"]
                    }),
                    None,
                );
            };
            let channels = definition
                .get("channels")
                .map(|channels| parse_notification_channels(channels))
                .unwrap_or_default();
            if channels.is_empty() {
                return (
                    StatusCode::UNPROCESSABLE_ENTITY,
                    json!({
                        "message": "Validation failed",
                        "errors": ["notification has no supported delivery channels"]
                    }),
                    None,
                );
            }
            if let Some(channel) = channels
                .iter()
                .find(|channel| !matches!(channel.as_str(), "database" | "mail" | "broadcast"))
            {
                return (
                    StatusCode::NOT_IMPLEMENTED,
                    json!({"message": format!("Notification channel {channel:?} is not supported")}),
                    None,
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
            let notification_type = format!("NotificationTest\\{}Notification", studly(name));
            let data = json!({
                "type": notification_type,
                "message": message,
                "tatemono": "notification-test"
            });
            let mut broadcast = None;
            for channel in channels {
                match channel.as_str() {
                    "database" => {
                        let encoded = match serde_json::to_string(&data) {
                            Ok(encoded) => encoded,
                            Err(error) => {
                                return (
                                    StatusCode::INTERNAL_SERVER_ERROR,
                                    json!({"message": format!("Could not encode notification data: {error}")}),
                                    None,
                                )
                            }
                        };
                        if let Err(error) = connection.execute(
                            "INSERT INTO \"notifications\" (\"id\", \"type\", \"notifiable_type\", \"notifiable_id\", \"data\", \"read_at\", \"created_at\", \"updated_at\") VALUES (lower(hex(randomblob(16))), ?1, 'user', ?2, ?3, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)",
                            crate::db::params![notification_type, user_id, encoded],
                        ) {
                            return (
                                StatusCode::INTERNAL_SERVER_ERROR,
                                json!({"message": format!("Could not store database notification: {error}")}),
                                None,
                            );
                        }
                    }
                    "mail" => {
                        if let Err(error) = deliver_configured_mail(
                            user_email,
                            &subject,
                            &format!("<p>{}</p>", escape_html(&message)),
                        ) {
                            return (
                                StatusCode::BAD_GATEWAY,
                                json!({"message": format!("Notification email delivery failed: {error}")}),
                                None,
                            );
                        }
                    }
                    "broadcast" => {
                        let channel_type = definition
                            .get("channel_type")
                            .map(String::as_str)
                            .unwrap_or("private");
                        let channel_name = match channel_type {
                            "private" | "presence" => {
                                format!("{channel_type}-notification-test.{user_id}")
                            }
                            "public" => "notification-test.notifications".to_owned(),
                            _ => {
                                return (
                                    StatusCode::UNPROCESSABLE_ENTITY,
                                    json!({"message": format!("Invalid notification channel type {channel_type:?}")}),
                                    None,
                                )
                            }
                        };
                        broadcast = Some((
                            channel_name,
                            json!({"message": message, "data": {}}),
                        ));
                    }
                    _ => unreachable!("notification channels validated above"),
                }
            }
            (
                StatusCode::CREATED,
                json!({"message": "Notification triggered successfully", "type": name}),
                broadcast,
            )
        }
        "readAll" => match connection.execute(
            "UPDATE \"notifications\" SET \"read_at\" = CURRENT_TIMESTAMP, \"updated_at\" = CURRENT_TIMESTAMP WHERE \"notifiable_type\" = 'user' AND \"notifiable_id\" = ?1 AND \"read_at\" IS NULL",
            [user_id],
        ) {
            Ok(_) => (
                StatusCode::OK,
                json!({"message": "All notifications marked as read"}),
                None,
            ),
            Err(error) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Could not mark notifications as read: {error}")}),
                None,
            ),
        },
        "destroy" => {
            let Some(id) = route_id(path) else {
                return (
                    StatusCode::BAD_REQUEST,
                    json!({"message": "Notification id is missing"}),
                    None,
                );
            };
            match connection.execute(
                "DELETE FROM \"notifications\" WHERE \"id\" = ?1 AND \"notifiable_type\" = 'user' AND \"notifiable_id\" = ?2",
                crate::db::params![id, user_id],
            ) {
                Ok(0) => (
                    StatusCode::NOT_FOUND,
                    json!({"message": "Notification not found"}),
                    None,
                ),
                Ok(_) => (
                    StatusCode::OK,
                    json!({"message": "Notification deleted"}),
                    None,
                ),
                Err(error) => (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": format!("Could not delete notification: {error}")}),
                    None,
                ),
            }
        }
        _ => (
            StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Notification action {action} is not implemented by Rust")}),
            None,
        ),
    }
}

fn notification_definition(
    notifications: &[Value],
    requested_name: &str,
) -> Option<HashMap<String, String>> {
    notifications
        .iter()
        .filter_map(Value::as_str)
        .find_map(|raw| {
            let mut name = None;
            let mut values = HashMap::new();
            for line in raw.lines() {
                let Some((key, value)) = line.trim().split_once(':') else {
                    continue;
                };
                if line.chars().next().is_some_and(char::is_whitespace) {
                    values.insert(key.trim().to_owned(), parse_yaml_scalar(value.trim()));
                } else {
                    name = Some(key.trim());
                }
            }
            name.is_some_and(|name| {
                normalize_event_identifier(name) == normalize_event_identifier(requested_name)
            })
            .then_some(values)
        })
}

fn parse_notification_channels(raw: &str) -> Vec<String> {
    raw.trim()
        .strip_prefix('[')
        .and_then(|channels| channels.strip_suffix(']'))
        .unwrap_or(raw)
        .split(',')
        .map(|channel| channel.trim().trim_matches(['\'', '"']).to_owned())
        .filter(|channel| !channel.is_empty())
        .collect()
}

fn parse_registered_mail(
    mails: &[Value],
    requested_name: &str,
) -> Result<Option<(String, String, String)>, String> {
    for raw in mails.iter().filter_map(Value::as_str) {
        let Some(definition) = parse_mail_definition(raw)? else {
            continue;
        };
        if normalize_event_identifier(&definition.0) == normalize_event_identifier(requested_name) {
            return Ok(Some(definition));
        }
    }
    Ok(None)
}

fn studly(value: &str) -> String {
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

fn notification_message(notifications: &[Value], requested_name: &str) -> Option<String> {
    for raw in notifications.iter().filter_map(Value::as_str) {
        let mut name = None;
        let mut message = None;
        for line in raw.lines() {
            let Some((key, value)) = line.trim().split_once(':') else {
                continue;
            };
            if line.chars().next().is_some_and(char::is_whitespace) {
                if key.trim() == "message" {
                    message = Some(parse_yaml_scalar(value.trim()));
                }
            } else {
                name = Some(key.trim().to_owned());
            }
        }
        if name.as_deref().is_some_and(|name| {
            normalize_event_identifier(name) == normalize_event_identifier(requested_name)
        }) {
            return message;
        }
    }
    None
}

fn notification_has_channel(
    notifications: &[Value],
    requested_name: &str,
    requested_channel: &str,
) -> bool {
    notifications.iter().filter_map(Value::as_str).any(|raw| {
        let mut name = None;
        let mut channels = None;
        for line in raw.lines() {
            let Some((key, value)) = line.trim().split_once(':') else {
                continue;
            };
            if line.chars().next().is_some_and(char::is_whitespace) {
                if key.trim() == "channels" {
                    channels = Some(value.trim());
                }
            } else {
                name = Some(key.trim());
            }
        }
        if !name.is_some_and(|name| {
            normalize_event_identifier(name) == normalize_event_identifier(requested_name)
        }) {
            return false;
        }
        let Some(channels) = channels else {
            return false;
        };
        let channels = channels
            .strip_prefix('[')
            .and_then(|channels| channels.strip_suffix(']'))
            .unwrap_or(channels);
        channels
            .split(',')
            .any(|channel| channel.trim().trim_matches(['\'', '"']) == requested_channel)
    })
}

fn parse_mail_definition(raw: &str) -> Result<Option<(String, String, String)>, String> {
    let mut name = None;
    let mut subject = None;
    let mut encoded_template = None;
    for line in raw.lines() {
        let trimmed = line.trim();
        let Some((key, value)) = trimmed.split_once(':') else {
            continue;
        };
        if line.chars().next().is_some_and(char::is_whitespace) {
            match key.trim() {
                "subject" => subject = Some(parse_yaml_scalar(value.trim())),
                "blade_body" => encoded_template = Some(parse_yaml_scalar(value.trim())),
                _ => {}
            }
        } else {
            name = Some(key.trim().to_owned());
        }
    }
    let Some(name) = name else {
        return Ok(None);
    };
    let subject = subject.unwrap_or_else(|| name.clone());
    let template = match encoded_template {
        Some(encoded) => {
            let decoded = STANDARD
                .decode(encoded)
                .map_err(|error| format!("could not decode template for {name}: {error}"))?;
            String::from_utf8(decoded)
                .map_err(|error| format!("template for {name} is not valid UTF-8: {error}"))?
        }
        None => String::new(),
    };
    Ok(Some((name, subject, template)))
}

fn parse_yaml_scalar(value: &str) -> String {
    if value.starts_with('"') {
        return serde_json::from_str::<String>(value)
            .unwrap_or_else(|_| value.trim_matches('"').into());
    }
    if value.starts_with('\'') && value.ends_with('\'') && value.len() >= 2 {
        return value[1..value.len() - 1].replace("''", "'");
    }
    value.to_owned()
}

fn render_mail_template(template: &str, data: &Map<String, Value>) -> Result<String, String> {
    let mut rendered = String::with_capacity(template.len());
    let mut remaining = template;
    while let Some(open) = remaining.find("{{") {
        rendered.push_str(&remaining[..open]);
        let after_open = &remaining[open + 2..];
        let Some(close) = after_open.find("}}") else {
            return Err("unclosed variable expression".to_owned());
        };
        let expression = after_open[..close].trim().trim_start_matches('$').trim();
        if expression.is_empty()
            || !expression
                .chars()
                .all(|character| character.is_ascii_alphanumeric() || character == '_')
        {
            return Err(format!("unsupported variable expression: {expression}"));
        }
        let value = data
            .get(expression)
            .map(|value| match value {
                Value::String(value) => value.clone(),
                Value::Null => String::new(),
                other => other.to_string(),
            })
            .unwrap_or_default();
        rendered.push_str(&escape_html(&value));
        remaining = &after_open[close + 2..];
    }
    rendered.push_str(remaining);
    Ok(rendered)
}

fn escape_html(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for character in value.chars() {
        match character {
            '&' => escaped.push_str("&amp;"),
            '<' => escaped.push_str("&lt;"),
            '>' => escaped.push_str("&gt;"),
            '"' => escaped.push_str("&quot;"),
            '\'' => escaped.push_str("&#39;"),
            _ => escaped.push(character),
        }
    }
    escaped
}

pub fn dispatch_job(
    database_dir: &Path,
    slug: &str,
    table: &str,
    jobs: &[Value],
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    if slug != "job-test" || !super::engine::is_identifier(table) {
        return internal_error(format!(
            "Configured job result table \"{table}\" is invalid"
        ));
    }
    let Some(requested_name) = body
        .get("job")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error(vec![
            "Field \"job\" is required and must be a string".to_owned()
        ]);
    };
    let definition = jobs
        .iter()
        .filter_map(Value::as_str)
        .filter_map(|raw| {
            let mut lines = raw.lines();
            let name = lines.next()?.trim().trim_end_matches(':');
            let mut queue = "default".to_owned();
            let mut tries = 1_u32;
            let mut timeout = 60_u64;
            for line in lines {
                let Some((key, value)) = line.trim().split_once(':') else {
                    continue;
                };
                match key.trim() {
                    "queue" if !value.trim().is_empty() => queue = value.trim().to_owned(),
                    "tries" => {
                        tries = value
                            .trim()
                            .parse::<u32>()
                            .ok()
                            .filter(|count| *count > 0)?;
                    }
                    "timeout" => {
                        timeout = value
                            .trim()
                            .parse::<u64>()
                            .ok()
                            .filter(|seconds| *seconds > 0)?;
                    }
                    _ => {}
                }
            }
            Some((name.to_owned(), queue, tries, timeout))
        })
        .find(|(name, _, _, _)| {
            normalize_event_identifier(name) == normalize_event_identifier(requested_name)
        });
    let Some((job_name, queue, tries, timeout)) = definition else {
        return (
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            json!({
                "message": "Validation failed",
                "errors": [format!("Field \"job\" has an unsupported value: {requested_name}")]
            }),
        );
    };
    if !matches!(
        job_name.as_str(),
        "process-data" | "heavy-computation" | "always-fails"
    ) {
        return (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Rust job handler emulation is not implemented for {slug}:{job_name}")}),
        );
    }

    let duration = match job_name.as_str() {
        "process-data" => std::time::Duration::from_secs(2),
        "heavy-computation" => std::time::Duration::from_secs(5),
        _ => std::time::Duration::from_secs(5 * u64::from(tries.saturating_sub(1))),
    };
    let payload = json!({
        "job": job_name,
        "queue": queue,
        "tries": tries,
        "timeout": timeout,
        "data": body.get("data").cloned().unwrap_or_else(|| json!({}))
    });
    let database_dir = database_dir.to_owned();
    let slug = slug.to_owned();
    let table = table.to_owned();
    tokio::spawn(async move {
        if !duration.is_zero() {
            tokio::time::sleep(duration).await;
        }
        let failed = job_name == "always-fails";
        let result_text = if failed {
            "This job always fails".to_owned()
        } else if job_name == "process-data" {
            format!("Data processed successfully in {}ms", duration.as_millis())
        } else {
            format!("Heavy computation completed in {}ms", duration.as_millis())
        };
        let result = tokio::task::spawn_blocking(move || {
            if failed {
                record_failed_job(
                    &database_dir,
                    &slug,
                    &table,
                    &job_name,
                    &queue,
                    tries,
                    timeout,
                    &payload,
                )
            } else {
                record_job_result(
                    &database_dir,
                    &slug,
                    &table,
                    &job_name,
                    "completed",
                    &result_text,
                )
            }
        })
        .await;
        match result {
            Ok(Ok(())) => {}
            Ok(Err(error)) => tracing::error!("Rust job emulation failed: {error}"),
            Err(error) => tracing::error!("Rust job worker failed: {error}"),
        }
    });
    (
        axum::http::StatusCode::ACCEPTED,
        json!({"message": "Job dispatched"}),
    )
}

fn record_failed_job(
    database_dir: &Path,
    slug: &str,
    table: &str,
    job_name: &str,
    queue: &str,
    tries: u32,
    timeout: u64,
    payload: &Value,
) -> Result<(), String> {
    let connection = open_connection(database_dir, slug)?;
    connection
        .execute_batch(
            "CREATE TABLE IF NOT EXISTS failed_jobs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                queue TEXT NOT NULL,
                payload TEXT NOT NULL,
                exception TEXT NOT NULL,
                failed_at TEXT NOT NULL
            )",
        )
        .map_err(|error| format!("Could not create failed_jobs table: {error}"))?;
    connection
        .execute(
            "INSERT INTO failed_jobs (queue, payload, exception, failed_at) VALUES (?1, ?2, ?3, CURRENT_TIMESTAMP)",
            crate::db::params![
                queue,
                payload.to_string(),
                format!("This job always fails after {tries} attempt(s) (timeout {timeout}s)")
            ],
        )
        .map_err(|error| format!("Could not record failed job: {error}"))?;
    record_job_result(
        database_dir,
        slug,
        table,
        job_name,
        "failed",
        "This job always fails",
    )
}

fn record_job_result(
    database_dir: &Path,
    slug: &str,
    table: &str,
    job_name: &str,
    status: &str,
    result: &str,
) -> Result<(), String> {
    let connection = open_connection(database_dir, slug)?;
    if !table_exists(&connection, table) {
        return Err(format!("Job result table \"{table}\" does not exist"));
    }
    let columns = column_names(&connection, table)
        .map_err(|error| format!("Could not inspect job result table: {error}"))?;
    for required in ["job_name", "status", "result"] {
        if !columns.iter().any(|column| column == required) {
            return Err(format!(
                "Job result table \"{table}\" is missing column \"{required}\""
            ));
        }
    }
    let mut names = vec![quote("job_name"), quote("status"), quote("result")];
    let mut values = vec![
        SqlValue::Text(job_name.to_owned()),
        SqlValue::Text(status.to_owned()),
        SqlValue::Text(result.to_owned()),
    ];
    let mut placeholders = (1..=values.len())
        .map(|index| format!("?{index}"))
        .collect::<Vec<_>>();
    for timestamp in ["processed_at", "created_at", "updated_at"] {
        if columns.iter().any(|column| column == timestamp) {
            names.push(quote(timestamp));
            placeholders.push("CURRENT_TIMESTAMP".to_owned());
        }
    }
    let sql = format!(
        "INSERT INTO {} ({}) VALUES ({})",
        quote(table),
        names.join(", "),
        placeholders.join(", ")
    );
    connection
        .execute(&sql, crate::db::params_from_iter(values.drain(..)))
        .map_err(|error| format!("Could not record job result: {error}"))?;
    Ok(())
}

fn clear_event_log(connection: &Connection, table: &str) -> (axum::http::StatusCode, Value) {
    if !table_exists(connection, table) {
        return internal_error(format!(
            "Configured event log table \"{table}\" does not exist"
        ));
    }
    match connection.execute(&format!("DELETE FROM {}", quote(table)), crate::db::params![]) {
        Ok(_) => (
            axum::http::StatusCode::OK,
            json!({"message": "Log cleared"}),
        ),
        Err(error) => internal_error(format!("Could not clear event log: {error}")),
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
    if slug == "queue-flow" && action.starts_with("handler:") {
        return execute_queue_flow(&connection, action, path, body);
    }
    if slug == "jo-payroll" && matches!(action, "summary" | "byGroup" | "appointments") {
        return execute_payroll(&connection, action, table, schema, path);
    }
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
        "clearLog" if slug == "events-test" => clear_event_log(&connection, table),
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
        "echo" => echo_probe(&connection, table, schema, body),
        "stats" => probe_stats(&connection, table),
        "lowStock" => low_stock(&connection, table, schema),
        "handler:ping" => ping_handler(),
        "handler:recordHandler" => record_probe_handler(&connection, table, schema, body),
        "handler:latest" => latest_probe_handler(&connection, table, schema),
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Endpoint {action} is not implemented by the Rust engine")}),
        ),
    }
}

fn execute_queue_flow(
    connection: &Connection,
    action: &str,
    path: &str,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    match action {
        "handler:join_queue" => queue_flow_join(connection, body),
        "handler:call_next" => queue_flow_call_next(connection, body),
        "handler:queue_status" => queue_flow_status(connection, path),
        "handler:my_ticket" => queue_flow_my_ticket(connection, path),
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Queue-flow handler {action} is not implemented")}),
        ),
    }
}

fn queue_flow_join(connection: &Connection, body: &Value) -> (axum::http::StatusCode, Value) {
    let Some(input) = body.as_object() else {
        return validation_error(vec!["Request body must be a JSON object".to_owned()]);
    };
    let Some(queue_id) = input.get("queue_id").and_then(positive_integer) else {
        return validation_error(vec!["queue_id must be a positive integer".to_owned()]);
    };
    let queue = connection
        .query_row(
            "SELECT \"prefix\", \"avg_wait_minutes\" FROM \"queues\" WHERE \"id\" = ?1",
            [queue_id],
            |row| Ok((row.get::<_, String>(0)?, row.get::<_, i64>(1)?)),
        )
        .optional();
    let (prefix, average_wait) = match queue {
        Ok(Some(queue)) => queue,
        Ok(None) => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                json!({"message":"Queue not found"}),
            )
        }
        Err(error) => return internal_error(format!("Could not load queue {queue_id}: {error}")),
    };
    let position = match connection.query_row(
        "SELECT COALESCE(MAX(\"position\"), 0) + 1 FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" IN ('waiting','serving')",
        [queue_id],
        |row| row.get::<_, i64>(0),
    ) {
        Ok(position) => position,
        Err(error) => return internal_error(format!("Could not determine queue position: {error}")),
    };
    let customer_name = input
        .get("customer_name")
        .and_then(Value::as_str)
        .filter(|name| !name.is_empty())
        .unwrap_or("Guest");
    let fields = json!({
        "queue_id": queue_id,
        "ticket_number": format!("{prefix}-{position:03}"),
        "customer_name": customer_name,
        "status": "waiting",
        "position": position
    });
    let (status, ticket) = store(connection, "tickets", &json!({}), &json!({}), &fields);
    if status != axum::http::StatusCode::CREATED {
        return (status, ticket);
    }
    (
        axum::http::StatusCode::OK,
        json!({
            "ticket": ticket,
            "position": position,
            "estimated_wait": (position - 1) * average_wait
        }),
    )
}

fn queue_flow_call_next(connection: &Connection, body: &Value) -> (axum::http::StatusCode, Value) {
    let Some(queue_id) = body.get("queue_id").and_then(positive_integer) else {
        return validation_error(vec!["queue_id must be a positive integer".to_owned()]);
    };
    if let Err(error) = connection.execute(
        "UPDATE \"tickets\" SET \"status\" = 'done', \"served_at\" = CURRENT_TIMESTAMP WHERE \"queue_id\" = ?1 AND \"status\" = 'serving'",
        [queue_id],
    ) {
        return internal_error(format!("Could not finish current ticket: {error}"));
    }
    let next_id = connection
        .query_row(
            "SELECT \"id\" FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" = 'waiting' ORDER BY \"position\" LIMIT 1",
            [queue_id],
            |row| row.get::<_, i64>(0),
        )
        .optional();
    let next_id = match next_id {
        Ok(Some(id)) => id,
        Ok(None) => {
            return (
                axum::http::StatusCode::OK,
                json!({"message":"No more tickets in queue","ticket":null}),
            )
        }
        Err(error) => return internal_error(format!("Could not find next ticket: {error}")),
    };
    if let Err(error) = connection.execute(
        "UPDATE \"tickets\" SET \"status\" = 'serving', \"called_at\" = CURRENT_TIMESTAMP WHERE \"id\" = ?1",
        [next_id],
    ) {
        return internal_error(format!("Could not call next ticket: {error}"));
    }
    match find_row(
        connection,
        "tickets",
        &next_id.to_string(),
        &json!({}),
        false,
    ) {
        Ok(Some(ticket)) => (axum::http::StatusCode::OK, json!({"ticket":ticket})),
        Ok(None) => internal_error("Called ticket could not be read back".to_owned()),
        Err(error) => internal_error(format!("Could not load next ticket: {error}")),
    }
}

fn queue_flow_status(connection: &Connection, path: &str) -> (axum::http::StatusCode, Value) {
    let Some(queue_id) = path
        .trim_matches('/')
        .split('/')
        .last()
        .and_then(|value| value.parse::<i64>().ok())
        .filter(|id| *id > 0)
    else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            json!({"message":"Invalid queue route parameters"}),
        );
    };
    let queue = match find_row(
        connection,
        "queues",
        &queue_id.to_string(),
        &json!({}),
        false,
    ) {
        Ok(Some(queue)) => queue,
        Ok(None) => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                json!({"message":"Queue not found"}),
            )
        }
        Err(error) => return internal_error(format!("Could not load queue: {error}")),
    };
    let serving = match read_rows(
        connection,
        "SELECT * FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" = 'serving' ORDER BY \"position\" LIMIT 1",
        vec![SqlValue::Integer(queue_id)],
        &json!({}),
    ) {
        Ok(rows) => rows.into_iter().next().unwrap_or(Value::Null),
        Err(error) => return internal_error(format!("Could not load serving ticket: {error}")),
    };
    let waiting = match read_rows(
        connection,
        "SELECT * FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" = 'waiting' ORDER BY \"position\"",
        vec![SqlValue::Integer(queue_id)],
        &json!({}),
    ) {
        Ok(rows) => rows,
        Err(error) => return internal_error(format!("Could not load waiting tickets: {error}")),
    };
    let done_count = match connection.query_row(
        "SELECT COUNT(*) FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" = 'done'",
        [queue_id],
        |row| row.get::<_, i64>(0),
    ) {
        Ok(count) => count,
        Err(error) => return internal_error(format!("Could not count completed tickets: {error}")),
    };
    let total_waiting = waiting.len();
    (
        axum::http::StatusCode::OK,
        json!({
            "queue": queue,
            "serving": serving,
            "waiting": waiting,
            "done_count": done_count,
            "total_waiting": total_waiting
        }),
    )
}

fn queue_flow_my_ticket(connection: &Connection, path: &str) -> (axum::http::StatusCode, Value) {
    let segments: Vec<_> = path.trim_matches('/').split('/').collect();
    let Some(queue_id) = segments
        .get(3)
        .and_then(|value| value.parse::<i64>().ok())
        .filter(|id| *id > 0)
    else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            json!({"message":"Invalid queue route parameters"}),
        );
    };
    let Some(ticket_number) = segments.get(4) else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            json!({"message":"Invalid queue route parameters"}),
        );
    };
    let mut tickets = match read_rows(
        connection,
        "SELECT * FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"ticket_number\" = ?2 LIMIT 1",
        vec![
            SqlValue::Integer(queue_id),
            SqlValue::Text((*ticket_number).to_owned()),
        ],
        &json!({}),
    ) {
        Ok(rows) => rows,
        Err(error) => return internal_error(format!("Could not load ticket: {error}")),
    };
    let Some(ticket) = tickets.pop() else {
        return (
            axum::http::StatusCode::NOT_FOUND,
            json!({"message":"Ticket not found"}),
        );
    };
    let ticket_position = ticket["position"].as_i64().unwrap_or_default();
    let ahead = match connection.query_row(
        "SELECT COUNT(*) FROM \"tickets\" WHERE \"queue_id\" = ?1 AND \"status\" = 'waiting' AND \"position\" < ?2",
        [SqlValue::Integer(queue_id), SqlValue::Integer(ticket_position)],
        |row| row.get::<_, i64>(0),
    ) {
        Ok(ahead) => ahead,
        Err(error) => return internal_error(format!("Could not determine ticket position: {error}")),
    };
    let average_wait = connection
        .query_row(
            "SELECT \"avg_wait_minutes\" FROM \"queues\" WHERE \"id\" = ?1",
            [queue_id],
            |row| row.get::<_, i64>(0),
        )
        .optional();
    let average_wait = match average_wait {
        Ok(Some(average_wait)) if average_wait > 0 => average_wait,
        Ok(_) => 5,
        Err(error) => {
            return internal_error(format!("Could not load queue wait estimate: {error}"))
        }
    };
    let status = ticket["status"].as_str().unwrap_or_default();
    let position = if status == "waiting" { ahead + 1 } else { 0 };
    let is_serving = status == "serving";
    let is_done = status == "done";
    (
        axum::http::StatusCode::OK,
        json!({
            "ticket": ticket,
            "position": position,
            "estimated_wait": ahead * average_wait,
            "is_serving": is_serving,
            "is_done": is_done
        }),
    )
}

fn execute_payroll(
    connection: &Connection,
    action: &str,
    table: &str,
    schema: &Value,
    path: &str,
) -> (axum::http::StatusCode, Value) {
    match action {
        "summary" => payroll_summary(connection, table, schema),
        "byGroup" => payroll_by_group(connection, table, schema, path),
        "appointments" => payroll_appointments(connection, table, schema),
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Payroll handler {action} is not implemented")}),
        ),
    }
}

fn payroll_summary(
    connection: &Connection,
    table: &str,
    schema: &Value,
) -> (axum::http::StatusCode, Value) {
    let sql = format!("SELECT * FROM {} ORDER BY \"jor_number\"", quote(table));
    let rows = match read_rows(connection, &sql, Vec::new(), schema) {
        Ok(rows) => rows,
        Err(error) => return internal_error(format!("Could not load payroll summary: {error}")),
    };
    let mut total_active = 0_i64;
    let mut total_inactive = 0_i64;
    let mut total_atm = 0_i64;
    let mut total_cash = 0_i64;
    let mut total_basic_pay = 0.0;
    let mut total_sss = 0.0;
    let mut total_hdmf_premium = 0.0;
    let mut total_hdmf_mpl = 0.0;
    let mut total_calamity_loan = 0.0;
    let mut funding_breakdown = Map::new();
    let mut group_breakdown = Map::new();
    for row in rows {
        if row["status"].as_str() != Some("active") {
            total_inactive += 1;
            continue;
        }
        total_active += 1;
        match row["disbursement_type"].as_str() {
            Some("ATM") => total_atm += 1,
            Some("CASH") => total_cash += 1,
            _ => {}
        }
        let basic_pay = record_number(&row["basic_pay"]);
        total_basic_pay += basic_pay;
        total_sss += record_number(&row["sss_amount"]);
        total_hdmf_premium += record_number(&row["hdmf_premium"]);
        total_hdmf_mpl += record_number(&row["hdmf_mpl"]);
        total_calamity_loan += record_number(&row["calamity_loan"]);

        let funding_name = record_label(&row["funding"]);
        let funding = funding_breakdown
            .entry(funding_name)
            .or_insert_with(|| json!({"count": 0, "total_pay": 0.0}));
        funding["count"] = json!(funding["count"].as_i64().unwrap_or_default() + 1);
        funding["total_pay"] = json!(funding["total_pay"].as_f64().unwrap_or_default() + basic_pay);

        let group_name = record_label(&row["jor_pyrl_group"]);
        let group = group_breakdown
            .entry(group_name)
            .or_insert_with(|| json!(0));
        *group = json!(group.as_i64().unwrap_or_default() + 1);
    }
    let total_deductions = total_sss + total_hdmf_premium + total_hdmf_mpl + total_calamity_loan;
    (
        axum::http::StatusCode::OK,
        json!({
            "total_active": total_active,
            "total_inactive": total_inactive,
            "total_atm": total_atm,
            "total_cash": total_cash,
            "total_basic_pay": total_basic_pay,
            "total_sss": total_sss,
            "total_hdmf_premium": total_hdmf_premium,
            "total_hdmf_mpl": total_hdmf_mpl,
            "total_calamity_loan": total_calamity_loan,
            "total_deductions": total_deductions,
            "net_pay": total_basic_pay - total_deductions,
            "funding_breakdown": funding_breakdown,
            "group_breakdown": group_breakdown
        }),
    )
}

fn payroll_by_group(
    connection: &Connection,
    table: &str,
    schema: &Value,
    path: &str,
) -> (axum::http::StatusCode, Value) {
    let Some(encoded_group) = path.trim_end_matches('/').rsplit('/').next() else {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            json!({"message":"Invalid payroll group"}),
        );
    };
    if encoded_group.is_empty() {
        return (
            axum::http::StatusCode::BAD_REQUEST,
            json!({"message":"Invalid payroll group"}),
        );
    }
    let group =
        form_urlencoded::parse(format!("group={}", encoded_group.replace('+', "%2B")).as_bytes())
            .next()
            .map(|(_, value)| value.into_owned())
            .unwrap_or_default();
    let sql = format!(
        "SELECT * FROM {} WHERE \"jor_pyrl_group\" = ?1 AND \"status\" = 'active' ORDER BY \"jor_number\"",
        quote(table)
    );
    match read_rows(connection, &sql, vec![SqlValue::Text(group)], schema) {
        Ok(rows) => (axum::http::StatusCode::OK, json!(rows)),
        Err(error) => internal_error(format!("Could not load payroll group: {error}")),
    }
}

fn payroll_appointments(
    connection: &Connection,
    table: &str,
    schema: &Value,
) -> (axum::http::StatusCode, Value) {
    let sql = format!(
        "SELECT * FROM {} WHERE \"appointment_order\" IS NOT NULL ORDER BY \"appointment_order\"",
        quote(table)
    );
    match read_rows(connection, &sql, Vec::new(), schema) {
        Ok(rows) => (axum::http::StatusCode::OK, json!(rows)),
        Err(error) => internal_error(format!("Could not load payroll appointments: {error}")),
    }
}

fn record_number(value: &Value) -> f64 {
    value
        .as_f64()
        .or_else(|| value.as_i64().map(|value| value as f64))
        .unwrap_or_default()
}

fn record_label(value: &Value) -> String {
    match value {
        Value::Null => "<nil>".to_owned(),
        Value::String(value) => value.clone(),
        value => value.to_string(),
    }
}

fn positive_integer(value: &Value) -> Option<i64> {
    value
        .as_i64()
        .or_else(|| value.as_str().and_then(|value| value.parse::<i64>().ok()))
        .or_else(|| {
            value.as_f64().and_then(|value| {
                (value.is_finite()
                    && value.fract() == 0.0
                    && value > 0.0
                    && value <= i64::MAX as f64)
                    .then_some(value as i64)
            })
        })
        .filter(|value| *value > 0)
}

fn low_stock(
    connection: &Connection,
    table: &str,
    schema: &Value,
) -> (axum::http::StatusCode, Value) {
    let sql = format!(
        "SELECT * FROM {} WHERE \"quantity\" < ?1 ORDER BY \"quantity\" ASC",
        quote(table)
    );
    match read_rows(connection, &sql, vec![SqlValue::Integer(20)], schema) {
        Ok(items) => (
            axum::http::StatusCode::OK,
            json!({"data": items, "count": items.len()}),
        ),
        Err(error) => internal_error(format!("Could not query low-stock inventory: {error}")),
    }
}

fn echo_probe(
    connection: &Connection,
    table: &str,
    schema: &Value,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    let Some(input) = body.as_object() else {
        return validation_error(vec!["Request body must be a JSON object".to_owned()]);
    };
    let payload = match serde_json::to_string(body) {
        Ok(payload) => payload,
        Err(error) => return internal_error(format!("Could not encode echo payload: {error}")),
    };
    let fields = json!({
        "source": "endpoint-body",
        "probe": "echo",
        "payload": payload,
        "result": format!("Echoed {} field(s) — Rust endpoint emulation", input.len()),
        "ok": true
    });
    let (status, record) = store(connection, table, &json!({}), schema, &fields);
    if status != axum::http::StatusCode::CREATED {
        return (status, record);
    }
    (
        axum::http::StatusCode::OK,
        json!({
            "injected": true,
            "builder": "Rust endpoint emulation",
            "method": "echo",
            "field_count": input.len(),
            "echo": body,
            "probe_id": record["id"]
        }),
    )
}

fn ping_handler() -> (axum::http::StatusCode, Value) {
    (
        axum::http::StatusCode::OK,
        json!({
            "injected": true,
            "builder": "CustomRouteBuilder Rust emulation",
            "handler": "ping",
            "status": "ok",
            "timestamp": utc_timestamp(),
            "message": "CustomRouteBuilder handler body injection confirmed"
        }),
    )
}

fn record_probe_handler(
    connection: &Connection,
    table: &str,
    schema: &Value,
    body: &Value,
) -> (axum::http::StatusCode, Value) {
    let Some(input) = body.as_object() else {
        return validation_error(vec!["Request body must be a JSON object".to_owned()]);
    };
    let Some(probe) = input
        .get("probe")
        .and_then(Value::as_str)
        .filter(|probe| !probe.trim().is_empty())
    else {
        return validation_error(vec![
            "The probe field is required and must be a string.".to_owned()
        ]);
    };
    if probe.chars().count() > 100 {
        return validation_error(vec![
            "The probe field may not be greater than 100 characters.".to_owned(),
        ]);
    }
    if let Some(payload) = input.get("payload").filter(|value| !value.is_null()) {
        if !payload.is_string() {
            return validation_error(vec!["The payload field must be a string.".to_owned()]);
        }
    }
    let ok = match input.get("ok") {
        None => true,
        Some(Value::Bool(value)) => *value,
        Some(_) => return validation_error(vec!["The ok field must be a boolean.".to_owned()]),
    };
    let fields = json!({
        "source": "handler-body",
        "probe": probe,
        "payload": input.get("payload").cloned().unwrap_or(Value::Null),
        "result": "Recorded via CustomRouteBuilder handler body injection",
        "ok": ok
    });
    let (status, record) = store(connection, table, &json!({}), schema, &fields);
    if status != axum::http::StatusCode::CREATED {
        return (status, record);
    }
    (
        axum::http::StatusCode::OK,
        json!({
            "injected": true,
            "builder": "CustomRouteBuilder Rust emulation",
            "handler": "recordHandler",
            "probe_id": record["id"],
            "probe": probe
        }),
    )
}

fn latest_probe_handler(
    connection: &Connection,
    table: &str,
    schema: &Value,
) -> (axum::http::StatusCode, Value) {
    if !table_exists(connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let query = format!(
        "SELECT * FROM {} ORDER BY \"id\" DESC LIMIT 5",
        quote(table)
    );
    let results = match read_rows(connection, &query, Vec::new(), schema) {
        Ok(results) => results,
        Err(error) => return internal_error(format!("Could not load latest probes: {error}")),
    };
    (
        axum::http::StatusCode::OK,
        json!({
            "injected": true,
            "builder": "CustomRouteBuilder Rust emulation",
            "handler": "latest",
            "count": results.len(),
            "results": results
        }),
    )
}

fn probe_stats(connection: &Connection, table: &str) -> (axum::http::StatusCode, Value) {
    if !table_exists(connection, table) {
        return internal_error(format!("Configured table \"{table}\" does not exist"));
    }
    let columns = match column_names(connection, table) {
        Ok(columns) => columns,
        Err(error) => return internal_error(format!("Could not inspect {table}: {error}")),
    };
    if !columns.iter().any(|column| column == "source")
        || !columns.iter().any(|column| column == "ok")
    {
        return (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": "Rust endpoint emulation for stats requires source and ok columns"}),
        );
    }
    let query = format!(
        "SELECT COUNT(*), COALESCE(SUM(CASE WHEN CAST(\"ok\" AS INTEGER) <> 0 THEN 1 ELSE 0 END), 0), \
         COALESCE(SUM(CASE WHEN CAST(\"ok\" AS INTEGER) = 0 THEN 1 ELSE 0 END), 0) FROM {}",
        quote(table)
    );
    let (total, passed, failed) = match connection.query_row(&query, crate::db::params![], |row| {
        Ok((
            row.get::<_, i64>(0)?,
            row.get::<_, i64>(1)?,
            row.get::<_, i64>(2)?,
        ))
    }) {
        Ok(counts) => counts,
        Err(error) => return internal_error(format!("Could not load probe statistics: {error}")),
    };
    let sources_query = format!(
        "SELECT DISTINCT \"source\" FROM {} ORDER BY \"source\"",
        quote(table)
    );
    let mut statement = match connection.prepare(&sources_query) {
        Ok(statement) => statement,
        Err(error) => return internal_error(format!("Could not load probe sources: {error}")),
    };
    let sources = match statement.query_map(crate::db::params![], |row| row.get::<_, String>(0)) {
        Ok(rows) => match rows.collect::<Result<Vec<_>, _>>() {
            Ok(sources) => sources,
            Err(error) => return internal_error(format!("Could not read probe sources: {error}")),
        },
        Err(error) => return internal_error(format!("Could not load probe sources: {error}")),
    };
    (
        axum::http::StatusCode::OK,
        json!({
            "injected": true,
            "builder": "Rust endpoint emulation",
            "method": "stats",
            "total": total,
            "passed": passed,
            "failed": failed,
            "sources": sources
        }),
    )
}

fn utc_timestamp() -> String {
    use std::time::{SystemTime, UNIX_EPOCH};

    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let days = seconds.div_euclid(86_400);
    let day_seconds = seconds.rem_euclid(86_400);
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 }.div_euclid(146_097);
    let day_of_era = z - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    year += if month <= 2 { 1 } else { 0 };
    format!(
        "{year:04}-{month:02}-{day:02}T{:02}:{:02}:{:02}Z",
        day_seconds / 3_600,
        (day_seconds % 3_600) / 60,
        day_seconds % 60
    )
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
    fn mail_template_escapes_values_and_rejects_expressions() {
        let data = json!({"username": "<Ada & Bob>"})
            .as_object()
            .unwrap()
            .clone();
        assert_eq!(
            render_mail_template("<p>Hello {{ $username }}!</p>", &data).unwrap(),
            "<p>Hello &lt;Ada &amp; Bob&gt;!</p>"
        );
        assert!(render_mail_template("{{ dangerous() }}", &data).is_err());
    }

    #[test]
    fn events_test_fires_declared_listeners_and_clears_the_log() {
        let directory = tempfile::tempdir().unwrap();
        let module = json!({
            "name": "events-test",
            "databases": [{
                "table": "event_log",
                "columns": {
                    "event_name": {"type": "string"},
                    "listener_name": {"type": "string"},
                    "status": {"type": "string", "default": "completed"},
                    "payload": {"type": "text", "nullable": true},
                    "duration_ms": {"type": "integer", "nullable": true}
                }
            }],
            "apis": [{
                "model": "EventLog",
                "controller": "EventLogController",
                "table": "event_log",
                "prefix": "/api/events-test",
                "endpoints": {
                    "store": {
                        "method": "POST",
                        "route": "/fire",
                        "type": "event_fire",
                        "validation": {"event": "required|string", "payload": "nullable|array"}
                    },
                    "clearLog": {
                        "method": "POST",
                        "route": "/log/clear",
                        "response": {"type": "message", "value": "Log cleared"}
                    }
                }
            }],
            "events": [
                "user-signed-up:\n  listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]\n  body: ''"
            ]
        });
        super::super::database::apply_schema(directory.path(), "events-test", &module).unwrap();
        assert!(
            match_route(&module, "POST", "/api/events-test/fire")
                .unwrap()
                .supported
        );
        assert!(
            match_route(&module, "POST", "/api/events-test/log/clear")
                .unwrap()
                .supported
        );

        let (status, response) = fire_event(
            directory.path(),
            "events-test",
            "event_log",
            module["events"].as_array().unwrap(),
            &json!({
                "event": "UserSignedUp",
                "payload": {"email": "test@example.com"}
            }),
        );
        assert_eq!(status, axum::http::StatusCode::ACCEPTED, "{response}");
        assert_eq!(response["message"], "Event fired");

        let connection = open_connection(directory.path(), "events-test").unwrap();
        let mut statement = connection
            .prepare("SELECT event_name, listener_name, payload FROM event_log ORDER BY id")
            .unwrap();
        let rows = statement
            .query_map(crate::db::params![], |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                ))
            })
            .unwrap()
            .collect::<Result<Vec<_>, _>>()
            .unwrap();
        assert_eq!(rows.len(), 3);
        assert!(rows
            .iter()
            .all(|(event, _, payload)| event == "UserSignedUp"
                && payload == r#"{"email":"test@example.com"}"#));
        assert_eq!(
            rows.iter()
                .map(|(_, listener, _)| listener.as_str())
                .collect::<Vec<_>>(),
            ["SendWelcomeEmail", "UpdateUserStats", "NotifyAdmins"]
        );
        drop(statement);

        let clear_route = match_route(&module, "POST", "/api/events-test/log/clear").unwrap();
        let (status, response) = execute(
            directory.path(),
            "events-test",
            &clear_route.table,
            &clear_route.name,
            &clear_route.endpoint,
            &clear_route.schema,
            &clear_route.model,
            "/api/events-test/log/clear",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK, "{response}");
        let remaining: i64 = connection
            .query_row("SELECT COUNT(*) FROM event_log", crate::db::params![], |row| row.get(0))
            .unwrap();
        assert_eq!(remaining, 0);

        let (status, _) = fire_event(
            directory.path(),
            "events-test",
            "event_log",
            module["events"].as_array().unwrap(),
            &json!({"event": "not-configured"}),
        );
        assert_eq!(status, axum::http::StatusCode::UNPROCESSABLE_ENTITY);
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

    #[test]
    fn queue_flow_routes_seed_and_transition_ticket_state() {
        let directory = tempfile::tempdir().unwrap();
        let module = json!({
            "name": "queue-flow",
            "databases": [
                {
                    "table": "queues",
                    "columns": {
                        "name": {"type": "string"},
                        "prefix": {"type": "string", "default": "Q"},
                        "avg_wait_minutes": {"type": "integer", "default": 5}
                    },
                    "seeder": {
                        "data": [{"name": "General", "prefix": "G", "avg_wait_minutes": 5}]
                    }
                },
                {
                    "table": "tickets",
                    "columns": {
                        "queue_id": {
                            "type": "foreignId",
                            "foreign": "queue_flow_queues.id"
                        },
                        "ticket_number": {"type": "string"},
                        "customer_name": {"type": "string"},
                        "status": {"type": "string"},
                        "position": {"type": "integer"},
                        "called_at": {"type": "datetime", "nullable": true},
                        "served_at": {"type": "datetime", "nullable": true}
                    }
                }
            ],
            "apis": [{
                "model": "Queue",
                "controller": "QueueController",
                "table": "queues",
                "prefix": "/api/queue-flow",
                "endpoints": {
                    "index": {"method": "GET", "route": "/queues", "response": {"type": "collection"}}
                }
            }],
            "customRoutes": [{
                "controller": "QueueController",
                "middleware": [],
                "routes": [
                    {"method": "POST", "route": "/api/queue-flow/join", "handler": "join_queue"},
                    {"method": "POST", "route": "/api/queue-flow/call-next", "handler": "call_next"},
                    {"method": "GET", "route": "/api/queue-flow/status/{queue_id}", "handler": "queue_status"},
                    {"method": "GET", "route": "/api/queue-flow/my-ticket/{queue_id}/{ticket_number}", "handler": "my_ticket"}
                ]
            }]
        });
        super::super::database::apply_schema(directory.path(), "queue-flow", &module).unwrap();
        let queues_route = match_route(&module, "GET", "/api/queue-flow/queues").unwrap();
        let (status, queues) = execute(
            directory.path(),
            "queue-flow",
            &queues_route.table,
            &queues_route.name,
            &queues_route.endpoint,
            &queues_route.schema,
            &queues_route.model,
            "/api/queue-flow/queues",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(queues["data"][0]["name"], "General");

        let call = |method: &str, path: &str, body: Value| {
            let route = match_route(&module, method, path).unwrap();
            assert!(route.supported);
            execute(
                directory.path(),
                "queue-flow",
                &route.table,
                &route.name,
                &route.endpoint,
                &route.schema,
                &route.model,
                path,
                &body,
                "",
            )
        };

        let (status, first) = call(
            "POST",
            "/api/queue-flow/join",
            json!({"queue_id": 1, "customer_name": "Ari"}),
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(first["ticket"]["ticket_number"], "G-001");
        assert_eq!(first["estimated_wait"], 0);

        let (status, second) = call(
            "POST",
            "/api/queue-flow/join",
            json!({"queue_id": 1, "customer_name": "Kai"}),
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(second["ticket"]["ticket_number"], "G-002");
        assert_eq!(second["estimated_wait"], 5);

        let (status, next) = call("POST", "/api/queue-flow/call-next", json!({"queue_id": 1}));
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(next["ticket"]["ticket_number"], "G-001");
        assert_eq!(next["ticket"]["status"], "serving");

        let (status, ticket) = call("GET", "/api/queue-flow/my-ticket/1/G-002", Value::Null);
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(ticket["position"], 1);
        assert_eq!(ticket["estimated_wait"], 0);

        let (status, queue) = call("GET", "/api/queue-flow/status/1", Value::Null);
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(queue["total_waiting"], 1);
        assert_eq!(queue["waiting"][0]["ticket_number"], "G-002");

        call("POST", "/api/queue-flow/call-next", json!({"queue_id": 1}));
        let (status, done) = call("POST", "/api/queue-flow/call-next", json!({"queue_id": 1}));
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(done["message"], "No more tickets in queue");
        let (status, completed) = call("GET", "/api/queue-flow/my-ticket/1/G-002", Value::Null);
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(completed["is_done"], true);
    }

    #[test]
    fn payroll_routes_aggregate_and_filter_job_orders() {
        let directory = tempfile::tempdir().unwrap();
        let module = json!({
            "name": "jo-payroll",
            "databases": [{
                "table": "job_orders",
                "columns": {
                    "jor_number": {"type": "integer"},
                    "name_of_jo": {"type": "string"},
                    "job_title": {"type": "string"},
                    "funding": {"type": "string"},
                    "basic_pay": {"type": "decimal"},
                    "disbursement_type": {"type": "string"},
                    "jor_pyrl_group": {"type": "string"},
                    "sss_amount": {"type": "decimal"},
                    "hdmf_premium": {"type": "decimal"},
                    "hdmf_mpl": {"type": "decimal"},
                    "calamity_loan": {"type": "decimal"},
                    "appointment_date": {"type": "date"},
                    "appointment_order": {"type": "integer"},
                    "status": {"type": "string"}
                }
            }],
            "apis": [{
                "model": "JobOrder",
                "controller": "JobOrderController",
                "table": "job_orders",
                "prefix": "/api/jo-payroll",
                "endpoints": {
                    "summary": {"method": "GET", "route": "/job-orders/stats/summary"},
                    "byGroup": {"method": "GET", "route": "/job-orders/group/{group}"},
                    "appointments": {"method": "GET", "route": "/job-orders/appointments/list"}
                }
            }]
        });
        super::super::database::apply_schema(directory.path(), "jo-payroll", &module).unwrap();
        let connection = open_connection(directory.path(), "jo-payroll").unwrap();
        connection.execute(
            "INSERT INTO job_orders (jor_number, name_of_jo, job_title, funding, basic_pay, disbursement_type, jor_pyrl_group, sss_amount, hdmf_premium, hdmf_mpl, calamity_loan, appointment_date, appointment_order, status) VALUES (1, 'Ada', 'Clerk', 'Admin', 1000, 'ATM', 'GROUP A', 50, 10, 5, 0, '2026-01-01', 1, 'active')",
            crate::db::params![],
        ).unwrap();
        connection.execute(
            "INSERT INTO job_orders (jor_number, jor_pyrl_group, status) VALUES (2, 'GROUP A', 'inactive')",
            crate::db::params![],
        ).unwrap();
        drop(connection);

        assert_eq!(route_count(&module), 3);
        assert!(warnings(&module).is_empty());
        let call = |method: &str, path: &str| {
            let route = match_route(&module, method, path).unwrap();
            assert!(route.supported);
            execute(
                directory.path(),
                "jo-payroll",
                &route.table,
                &route.name,
                &route.endpoint,
                &route.schema,
                &route.model,
                path,
                &Value::Null,
                "",
            )
        };

        let (status, summary) = call("GET", "/api/jo-payroll/job-orders/stats/summary");
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(summary["total_active"], 1);
        assert_eq!(summary["total_inactive"], 1);
        assert_eq!(summary["total_atm"], 1);
        assert_eq!(summary["total_basic_pay"].as_f64(), Some(1000.0));
        assert_eq!(summary["total_deductions"].as_f64(), Some(65.0));
        assert_eq!(summary["net_pay"].as_f64(), Some(935.0));

        let (status, group) = call("GET", "/api/jo-payroll/job-orders/group/GROUP%20A");
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(group.as_array().unwrap().len(), 1);
        assert_eq!(group[0]["jor_number"], 1);

        let (status, appointments) = call("GET", "/api/jo-payroll/job-orders/appointments/list");
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(appointments.as_array().unwrap().len(), 1);
        assert_eq!(appointments[0]["appointment_order"], 1);
    }

    #[test]
    fn custom_echo_and_stats_endpoints_are_emulated() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "name": "body-endpoint-handler",
            "databases": [{
                "table": "probe_results",
                "timestamps": true,
                "columns": {
                    "source": {"type": "string", "nullable": false},
                    "probe": {"type": "string", "nullable": false},
                    "payload": {"type": "text", "nullable": true},
                    "result": {"type": "text", "nullable": true},
                    "ok": {"type": "boolean", "default": true}
                }
            }],
            "apis": [{
                "model": "ProbeResult",
                "controller": "ProbeResultController",
                "table": "probe_results",
                "prefix": "/api/body-endpoint-handler",
                "endpoints": {
                    "echo": {"method": "POST", "route": "/echo", "body": "ZWNobyBib2R5"},
                    "stats": {"method": "GET", "route": "/stats", "body": "c3RhdHMgYm9keQ=="}
                }
            }],
            "customRoutes": [{
                "controller": "ProbeUtilController",
                "middleware": [],
                "routes": [
                    {"method": "GET", "route": "/api/body-endpoint-handler/ping", "handler": "ping", "body": "cGluZyBib2R5"},
                    {"method": "POST", "route": "/api/body-endpoint-handler/record-handler", "handler": "recordHandler", "body": "cmVjb3JkIGJvZHk="},
                    {"method": "GET", "route": "/api/body-endpoint-handler/latest", "handler": "latest", "body": "bGF0ZXN0IGJvZHk="}
                ]
            }]
        });
        super::super::database::apply_schema(directory.path(), "body-endpoint-handler", &payload)
            .unwrap();
        let module = &payload;
        assert_eq!(route_count(module), 5);
        let matched = match_route(module, "POST", "/api/body-endpoint-handler/echo").unwrap();
        assert!(matched.supported);
        assert!(warnings(module).is_empty());

        let echo_endpoint = &module["apis"][0]["endpoints"]["echo"];
        let (status, echo) = execute(
            directory.path(),
            "body-endpoint-handler",
            "probe_results",
            "echo",
            echo_endpoint,
            &module["databases"][0],
            "ProbeResult",
            "/api/body-endpoint-handler/echo",
            &json!({"message": "hello", "count": 2}),
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(echo["injected"], true);
        assert_eq!(echo["field_count"], 2);
        assert_eq!(echo["echo"]["message"], "hello");
        assert_eq!(echo["probe_id"], 1);

        let stats_endpoint = &module["apis"][0]["endpoints"]["stats"];
        let (status, stats) = execute(
            directory.path(),
            "body-endpoint-handler",
            "probe_results",
            "stats",
            stats_endpoint,
            &module["databases"][0],
            "ProbeResult",
            "/api/body-endpoint-handler/stats",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(stats["total"], 1);
        assert_eq!(stats["passed"], 1);
        assert_eq!(stats["failed"], 0);
        assert_eq!(stats["sources"], json!(["endpoint-body"]));

        let ping_route = match_route(module, "GET", "/api/body-endpoint-handler/ping").unwrap();
        assert_eq!(ping_route.name, "handler:ping");
        assert!(ping_route.supported);
        let (status, ping) = execute(
            directory.path(),
            "body-endpoint-handler",
            "probe_results",
            "handler:ping",
            &ping_route.endpoint,
            &ping_route.schema,
            "ProbeResult",
            "/api/body-endpoint-handler/ping",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(ping["handler"], "ping");
        assert!(ping["timestamp"].as_str().unwrap().ends_with('Z'));

        let record_route =
            match_route(module, "POST", "/api/body-endpoint-handler/record-handler").unwrap();
        let (status, record) = execute(
            directory.path(),
            "body-endpoint-handler",
            "probe_results",
            &record_route.name,
            &record_route.endpoint,
            &record_route.schema,
            &record_route.model,
            "/api/body-endpoint-handler/record-handler",
            &json!({"probe": "handler check", "payload": "sample"}),
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(record["probe"], "handler check");

        let latest_route = match_route(module, "GET", "/api/body-endpoint-handler/latest").unwrap();
        let (status, latest) = execute(
            directory.path(),
            "body-endpoint-handler",
            "probe_results",
            &latest_route.name,
            &latest_route.endpoint,
            &latest_route.schema,
            &latest_route.model,
            "/api/body-endpoint-handler/latest",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(latest["count"], 2);
    }

    #[test]
    fn low_stock_endpoint_returns_ordered_inventory() {
        let directory = tempfile::tempdir().unwrap();
        let module = json!({
            "name": "inventory-management",
            "databases": [{
                "table": "inventories",
                "timestamps": false,
                "columns": {
                    "name": {"type": "string", "nullable": false},
                    "quantity": {"type": "integer", "default": 0}
                }
            }],
            "apis": [{
                "name": "inventories",
                "model": "Inventory",
                "controller": "InventoryController",
                "table": "inventories",
                "prefix": "/api/inventories",
                "endpoints": {
                    "lowStock": {"method": "GET", "route": "/low-stock", "body": "bG93IHN0b2NrIGVtdWxhdGlvbg=="}
                }
            }]
        });
        super::super::database::apply_schema(directory.path(), "inventory-management", &module)
            .unwrap();
        let definition = &module["databases"][0];
        for (name, quantity) in [("zero", 0), ("low", 15), ("boundary", 20), ("stocked", 50)] {
            let (status, _) = execute(
                directory.path(),
                "inventory-management",
                "inventories",
                "store",
                &Value::Null,
                definition,
                "Inventory",
                "/api/inventories/",
                &json!({"name": name, "quantity": quantity}),
                "",
            );
            assert_eq!(status, axum::http::StatusCode::CREATED);
        }

        assert_eq!(route_count(&module), 1);
        assert!(warnings(&module).is_empty());
        let matched = match_route(&module, "GET", "/api/inventories/low-stock").unwrap();
        assert!(matched.supported);
        let (status, response) = execute(
            directory.path(),
            "inventory-management",
            &matched.table,
            &matched.name,
            &matched.endpoint,
            &matched.schema,
            &matched.model,
            "/api/inventories/low-stock",
            &Value::Null,
            "",
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(response["count"], 2);
        assert_eq!(response["data"][0]["name"], "zero");
        assert_eq!(response["data"][1]["name"], "low");
    }
}