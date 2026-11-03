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
    if let Some(auth) = payload.get("auth").filter(|value| !value.is_null()) {
        if !auth.is_boolean() {
            errors.push("\"auth\" must be a boolean".to_owned());
        }
    }
    if let Some(seed) = payload.get("authSeed").filter(|value| !value.is_null()) {
        let users = if let Some(seed) = seed.as_object() {
            match seed.get("users").filter(|value| !value.is_null()) {
                None => &[][..],
                Some(users) => match users.as_array() {
                    Some(users) => users.as_slice(),
                    None => {
                        errors.push("authSeed.users must be an array".to_owned());
                        &[][..]
                    }
                },
            }
        } else {
            errors.push("\"authSeed\" must be an object".to_owned());
            &[][..]
        };
        if !users.is_empty() && payload.get("auth").and_then(Value::as_bool) != Some(true) {
            errors.push("authSeed requires auth to be enabled".to_owned());
        }
        for (index, user) in users.iter().enumerate() {
            let Some(user) = user.as_object() else {
                errors.push(format!("authSeed user {} must be an object", index + 1));
                continue;
            };
            for field in ["name", "email", "password", "role"] {
                if user
                    .get(field)
                    .is_some_and(|value| !value.is_null() && !value.is_string())
                {
                    errors.push(format!(
                        "authSeed user {} field \"{field}\" must be a string",
                        index + 1
                    ));
                }
            }
            if payload.get("auth").and_then(Value::as_bool) == Some(true) {
                if let Some(email) = user.get("email").and_then(Value::as_str) {
                    if !email.trim().is_empty() && !super::auth::valid_email(email) {
                        errors.push(format!("Invalid auth seed email at row {}", index + 1));
                    }
                }
            }
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
                    if api
                        .get("model")
                        .and_then(Value::as_str)
                        .filter(|s| !s.is_empty())
                        .is_none()
                        || api
                            .get("controller")
                            .and_then(Value::as_str)
                            .filter(|s| !s.is_empty())
                            .is_none()
                    {
                        errors.push(format!("api block {index} needs model and controller"));
                        continue;
                    }
                    if let Some(prefix) = api.get("prefix").filter(|value| !value.is_null()) {
                        match prefix.as_str() {
                            Some(prefix) if prefix.is_empty() || valid_route_path(prefix) => {}
                            Some(prefix) => errors.push(format!("Invalid API prefix \"{prefix}\"")),
                            None => {
                                errors.push(format!("API prefix in block {index} must be a string"))
                            }
                        }
                    }
                    if let Some(middleware) = api.get("middleware").filter(|value| !value.is_null())
                    {
                        match middleware.as_array() {
                            Some(items) if items.iter().all(Value::is_string) => {}
                            Some(_) => errors.push(format!(
                                "API middleware in block {index} must contain only strings"
                            )),
                            None => errors
                                .push(format!("API middleware in block {index} must be an array")),
                        }
                    }
                    let endpoints = api.get("endpoints");
                    if let Some(endpoints) = endpoints.filter(|value| !value.is_null()) {
                        let Some(endpoints) = endpoints.as_object() else {
                            errors
                                .push(format!("API endpoints in block {index} must be an object"));
                            continue;
                        };
                        for (name, endpoint) in endpoints {
                            let Some(endpoint) = endpoint.as_object() else {
                                errors.push(format!("API endpoint \"{name}\" must be an object"));
                                continue;
                            };
                            if let Some(method) =
                                endpoint.get("method").filter(|value| !value.is_null())
                            {
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
                            if let Some(route) =
                                endpoint.get("route").filter(|value| !value.is_null())
                            {
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
                            if let Some(kind) =
                                endpoint.get("type").filter(|value| !value.is_null())
                            {
                                if !kind.is_string() {
                                    errors.push(format!(
                                        "Type for API endpoint \"{name}\" must be a string"
                                    ));
                                }
                            }
                            if let Some(validation) =
                                endpoint.get("validation").filter(|value| !value.is_null())
                            {
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
                            endpoints.keys().any(|name| {
                                matches!(
                                    name.as_str(),
                                    "index" | "show" | "store" | "update" | "destroy"
                                )
                            })
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
                let Some(parameter) = segment
                    .strip_prefix('{')
                    .and_then(|value| value.strip_suffix('}'))
                else {
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
                    if !(default.is_string()
                        || default.is_number()
                        || default.is_boolean()
                        || default.is_null())
                    {
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
                        None => errors.push(format!("Column \"{name}\" onDelete must be a string")),
                    }
                }
            }
        }

        if let Some(seeder) = database.get("seeder").filter(|value| !value.is_null()) {
            let Some(seeder) = seeder.as_object() else {
                errors.push(format!(
                    "Seeder in database block {index} must be an object"
                ));
                continue;
            };
            let Some(rows) = seeder.get("data").filter(|rows| !rows.is_null()) else {
                continue;
            };
            let Some(rows) = rows.as_array() else {
                errors.push(format!(
                    "Seeder data in database block {index} must be an array"
                ));
                continue;
            };
            let columns = database.get("columns").and_then(Value::as_object);
            let has_primary = columns.is_some_and(|columns| {
                columns
                    .values()
                    .any(|column| column["primary"].as_bool() == Some(true))
            });
            let timestamps = database.get("timestamps").and_then(Value::as_bool) != Some(false);
            for (row_index, row) in rows.iter().enumerate() {
                let Some(row) = row.as_object() else {
                    errors.push(format!(
                        "Seed row {} in database block {index} must be an object",
                        row_index + 1
                    ));
                    continue;
                };
                for (column, value) in row {
                    if !is_identifier(column) {
                        errors.push(format!(
                            "Invalid seed column \"{column}\" in table \"{}\"",
                            table.unwrap_or("")
                        ));
                        continue;
                    }
                    let declared = columns.is_some_and(|columns| columns.contains_key(column));
                    let generated_id = column == "id" && !has_primary;
                    let generated_timestamp =
                        timestamps && matches!(column.as_str(), "created_at" | "updated_at");
                    if !declared && !generated_id && !generated_timestamp {
                        errors.push(format!(
                            "Seed column \"{column}\" is not declared in table \"{}\"",
                            table.unwrap_or("")
                        ));
                    }
                    if !(value.is_string()
                        || value.is_number()
                        || value.is_boolean()
                        || value.is_null())
                    {
                        errors.push(format!(
                            "Invalid seed value for {}.{} at row {}: expected a scalar",
                            table.unwrap_or(""),
                            column,
                            row_index + 1
                        ));
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

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn validates_seed_columns_and_scalar_values() {
        let valid = json!({
            "name": "seeded-app",
            "backendVariant": "rs",
            "databases": [{
                "table": "items",
                "columns": {"title": {"type": "string"}},
                "seeder": {
                    "data": [{
                        "id": 7,
                        "title": "Keyboard",
                        "created_at": "2026-11-04T00:00:00Z"
                    }]
                }
            }]
        });
        assert!(validate_payload(&valid).is_empty());

        let invalid = json!({
            "name": "seeded-app",
            "databases": [{
                "table": "items",
                "columns": {"title": {"type": "string"}},
                "seeder": {
                    "data": [
                        {"unknown": "value"},
                        {"title": {"nested": "object"}},
                        "not-an-object"
                    ]
                }
            }]
        });
        let errors = validate_payload(&invalid);
        assert!(errors.iter().any(|error| error.contains("not declared")));
        assert!(errors
            .iter()
            .any(|error| error.contains("expected a scalar")));
        assert!(errors
            .iter()
            .any(|error| error.contains("must be an object")));
    }

    #[test]
    fn validates_auth_seed_requirements_and_emails() {
        let disabled = json!({
            "name": "auth-sample",
            "authSeed": {"users": [{"email": "valid@example.test"}]}
        });
        assert!(validate_payload(&disabled)
            .iter()
            .any(|error| error == "authSeed requires auth to be enabled"));

        let invalid_email = json!({
            "name": "auth-sample",
            "auth": true,
            "authSeed": {"users": [{"email": "not-an-email"}]}
        });
        assert!(validate_payload(&invalid_email)
            .iter()
            .any(|error| error == "Invalid auth seed email at row 1"));

        let valid = json!({
            "name": "auth-sample",
            "auth": true,
            "authSeed": {"users": [{"name": "Seed", "email": "seed@example.test", "password": "secure"}]}
        });
        assert!(validate_payload(&valid).is_empty());
    }
}
