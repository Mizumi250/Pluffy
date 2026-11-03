use serde_json::Value;
use std::collections::HashSet;

pub fn is_valid_name(name: &str) -> bool {
    let mut chars = name.chars();
    matches!(chars.next(), Some(first) if first.is_ascii_lowercase() || first.is_ascii_digit())
        && chars.all(|character| {
            character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
        })
}

pub fn validate_payload(payload: &Value) -> Vec<String> {
    let mut errors = Vec::new();
    let Some(payload) = payload.as_object() else {
        return vec!["Request body must be a JSON object".to_owned()];
    };
    let payload_value = Value::Object(payload.clone());

    match payload.get("name").and_then(Value::as_str) {
        None => errors.push("Missing \"name\"".to_owned()),
        Some(name) if !is_valid_name(name) => errors.push(format!(
            "Invalid tatemono name \"{name}\" (lowercase letters, digits, dashes)"
        )),
        _ => {}
    }
    if let Some(variant) = payload.get("backendVariant") {
        match variant.as_str() {
            Some("rs") => {}
            Some(other) => errors.push(format!(
                "Payload was parsed for the :{other} variant but this backend (rust) reads :rs. Switch the active backend and let the watcher rebuild."
            )),
            None => errors.push("\"backendVariant\" must be a string".to_owned()),
        }
    }

    if let Some(databases) = payload.get("databases").filter(|value| !value.is_null()) {
        match databases.as_array() {
            Some(databases) => validate_databases(databases, &mut errors),
            None => errors.push("\"databases\" must be an array".to_owned()),
        }
    }
    if let Some(apis) = payload.get("apis").filter(|value| !value.is_null()) {
        match apis.as_array() {
            Some(apis) => {
                for (index, api) in apis.iter().enumerate() {
                    if api.get("model").and_then(Value::as_str).filter(|s| !s.is_empty()).is_none()
                        || api.get("controller").and_then(Value::as_str).filter(|s| !s.is_empty()).is_none() {
                        errors.push(format!("api block {index} needs model and controller"));
                        continue;
                    }
                    if let Some(prefix) = api.get("prefix").filter(|value| !value.is_null()) {
                        match prefix.as_str() {
                            Some(prefix) if prefix.is_empty() || valid_route_path(prefix) => {}
                            Some(prefix) => errors.push(format!("Invalid API prefix \"{prefix}\"")),
                            None => errors.push(format!("API prefix in block {index} must be a string")),
                        }
                    }
                    if let Some(middleware) = api.get("middleware").filter(|value| !value.is_null()) {
                        match middleware.as_array() {
                            Some(items) if items.iter().all(Value::is_string) => {}
                            Some(_) => errors.push(format!(
                                "API middleware in block {index} must contain only strings"
                            )),
                            None => errors.push(format!(
                                "API middleware in block {index} must be an array"
                            )),
                        }
                    }
                    let endpoints = api.get("endpoints");
                    if let Some(endpoints) = endpoints.filter(|value| !value.is_null()) {
                        let Some(endpoints) = endpoints.as_object() else {
                            errors.push(format!("API endpoints in block {index} must be an object"));
                            continue;
                        };
                        for (name, endpoint) in endpoints {
                            let Some(endpoint) = endpoint.as_object() else {
                                errors.push(format!("API endpoint \"{name}\" must be an object"));
                                continue;
                            };
                            if let Some(method) = endpoint.get("method").filter(|value| !value.is_null()) {
                                match method.as_str() {
                                    Some(method) if matches!(method, "GET" | "POST" | "PUT" | "PATCH" | "DELETE") => {}
                                    Some(method) => errors.push(format!(
                                        "Unsupported HTTP method \"{method}\" for API endpoint \"{name}\""
                                    )),
                                    None => errors.push(format!(
                                        "HTTP method for API endpoint \"{name}\" must be a string"
                                    )),
                                }
                            }
                            if let Some(route) = endpoint.get("route").filter(|value| !value.is_null()) {
                                match route.as_str() {
                                    Some(route) if valid_route_path(route) => {}
                                    Some(route) => errors.push(format!(
                                        "Invalid route \"{route}\" for API endpoint \"{name}\""
                                    )),
                                    None => errors.push(format!(
                                        "Route for API endpoint \"{name}\" must be a string"
                                    )),
                                }
                            }
                            if let Some(kind) = endpoint.get("type").filter(|value| !value.is_null()) {
                                if !kind.is_string() {
                                    errors.push(format!(
                                        "Type for API endpoint \"{name}\" must be a string"
                                    ));
                                }
                            }
                            if let Some(validation) = endpoint.get("validation").filter(|value| !value.is_null()) {
                                match validation.as_object() {
                                    Some(rules) if rules.values().all(Value::is_string) => {}
                                    Some(_) => errors.push(format!(
                                        "Validation rules for API endpoint \"{name}\" must be strings"
                                    )),
                                    None => errors.push(format!(
                                        "Validation rules for API endpoint \"{name}\" must be an object"
                                    )),
                                }
                            }
                        }
                    }
                    let has_crud = endpoints
                        .and_then(Value::as_object)
                        .map(|endpoints| {
                            endpoints
                                .keys()
                                .any(|name| matches!(name.as_str(), "index" | "show" | "store" | "update" | "destroy"))
                        })
                        .unwrap_or(true);
                    if has_crud {
                        let table = super::database::table_for_model(&payload_value, api);
                        if table.is_none() {
                            errors.push(format!(
                                "API block {index} needs a matching database table for model \"{}\"",
                                api["model"].as_str().unwrap_or_default()
                            ));
                        }
                    }
                }
            }
            None => errors.push("\"apis\" must be an array".to_owned()),
        }
    }
    errors
}

fn valid_route_path(path: &str) -> bool {
    path.starts_with('/')
        && !path.contains('?')
        && !path.contains('#')
        && path.split('/').skip(1).all(|segment| {
            if segment.is_empty() {
                return true;
            }
            if segment.starts_with('{') || segment.ends_with('}') {
                let Some(parameter) = segment.strip_prefix('{').and_then(|value| value.strip_suffix('}')) else {
                    return false;
                };
                let parameter = parameter.strip_suffix('?').unwrap_or(parameter);
                is_identifier(parameter)
            } else {
                segment != "."
                    && segment != ".."
                    && !segment.contains('{')
                    && !segment.contains('}')
            }
        })
        && path.chars().all(|character| !character.is_control())
}

fn validate_databases(databases: &[Value], errors: &mut Vec<String>) {
    let mut tables = HashSet::new();
    for (index, database) in databases.iter().enumerate() {
        let Some(database) = database.as_object() else {
            errors.push(format!("database block {index} must be an object"));
            continue;
        };
        let table = database.get("table").and_then(Value::as_str);
        match table {
            None => errors.push("database block without a table".to_owned()),
            Some(table) if !is_identifier(table) => {
                errors.push(format!("Invalid database table name \"{table}\""));
            }
            Some(table) if !tables.insert(table) => {
                errors.push(format!("Duplicate database table \"{table}\""));
            }
            _ => {}
        }

        if let Some(columns) = database.get("columns") {
            let Some(columns) = columns.as_object() else {
                errors.push(format!("database block {index} columns must be an object"));
                continue;
            };
            for (name, config) in columns {
                if !is_identifier(name) {
                    errors.push(format!("Invalid column name \"{name}\""));
                }
                let Some(config) = config.as_object() else {
                    errors.push(format!("Column \"{name}\" configuration must be an object"));
                    continue;
                };
                if let Some(kind) = config.get("type") {
                    match kind.as_str() {
                        Some(kind) if supported_type(kind) => {}
                        Some(kind) => errors.push(format!(
                            "Unsupported SQLite column type \"{kind}\" for \"{name}\""
                        )),
                        None => errors.push(format!("Column \"{name}\" type must be a string")),
                    }
                }
                if let Some(default) = config.get("default") {
                    if !(default.is_string() || default.is_number() || default.is_boolean() || default.is_null()) {
                        errors.push(format!("Column \"{name}\" default must be a scalar value"));
                    }
                }
                if let Some(foreign) = config.get("foreign") {
                    match foreign.as_str() {
                        Some(reference) => {
                            let mut parts = reference.split('.');
                            let table = parts.next().unwrap_or_default();
                            let column = parts.next().unwrap_or("id");
                            if !is_identifier(table)
                                || !is_identifier(column)
                                || parts.next().is_some()
                            {
                                errors.push(format!(
                                    "Invalid foreign key reference \"{reference}\" for column \"{name}\""
                                ));
                            }
                        }
                        None => errors.push(format!(
                            "Column \"{name}\" foreign reference must be a string"
                        )),
                    }
                }
                if let Some(action) = config.get("onDelete") {
                    match action.as_str() {
                        Some("cascade" | "restrict" | "set null" | "no action") => {}
                        Some(action) => errors.push(format!(
                            "Unsupported foreign key action \"{action}\" for column \"{name}\""
                        )),
                        None => errors.push(format!(
                            "Column \"{name}\" onDelete must be a string"
                        )),
                    }
                }
            }
        }
    }
}

fn supported_type(kind: &str) -> bool {
    matches!(
        kind,
        "integer"
            | "bigInteger"
            | "foreignId"
            | "string"
            | "text"
            | "longText"
            | "decimal"
            | "float"
            | "boolean"
            | "date"
            | "datetime"
            | "timestamp"
            | "json"
            | "uuid"
    )
}

pub fn is_identifier(value: &str) -> bool {
    let mut chars = value.chars();
    matches!(chars.next(), Some(first) if first.is_ascii_alphabetic() || first == '_')
        && chars.all(|character| character.is_ascii_alphanumeric() || character == '_')
}
