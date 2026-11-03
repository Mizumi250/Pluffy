use rusqlite::{
    types::{Value as SqlValue, ValueRef},
    Connection,
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

pub fn match_route(module: &Value, method: &str, path: &str) -> Option<MatchedRoute> {
    for api in module.get("apis")?.as_array()? {
        let model = api.get("model").and_then(Value::as_str)?;
        let table = super::database::table_for_model(module, api);
        let schema = table
            .and_then(|table| module["databases"].as_array()?.iter()
                .find(|database| database["table"].as_str() == Some(table))
                .cloned())
            .unwrap_or_else(|| json!({}));
        let table = table.unwrap_or_default();
        let prefix = api
            .get("prefix")
            .and_then(Value::as_str)
            .map(str::to_owned)
            .unwrap_or_else(|| format!("/api/{}/{}", module["name"].as_str().unwrap_or_default(), pluralize(&snake(model))));
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
                        supported: is_crud_name(name)
                            && match endpoint_object.get("type") {
                                None => true,
                                Some(kind) => kind.as_str().is_some_and(|kind| {
                                    matches!(kind, "index" | "show" | "store" | "update" | "destroy")
                                }),
                            }
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
    None
}

pub fn route_count(module: &Value) -> usize {
    let Some(apis) = module.get("apis").and_then(Value::as_array) else {
        return 0;
    };
    apis.iter()
        .map(|api| match api.get("endpoints").and_then(Value::as_object) {
            Some(endpoints) if !endpoints.is_empty() => {
                endpoints.keys().filter(|name| is_crud_name(name)).count()
            }
            _ => 5,
        })
        .sum()
}

pub fn warnings(module: &Value) -> Vec<String> {
    let mut warnings = Vec::new();
    for api in module.get("apis").and_then(Value::as_array).into_iter().flatten() {
        if api
            .get("middleware")
            .and_then(Value::as_array)
            .is_some_and(|middleware| !middleware.is_empty())
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
                .is_some_and(|body| body.as_str().map_or(!body.is_null(), |body| !body.trim().is_empty()))
            {
                warnings.push(format!(
                    "Endpoint {name} has a custom body; Rust does not execute DSL handler bodies"
                ));
            } else if !is_crud_name(name) {
                warnings.push(format!(
                    "Endpoint {name} is registered but unsupported requests return 501"
                ));
            } else if endpoint
                .get("type")
                .and_then(Value::as_str)
                .is_some_and(|kind| !matches!(kind, "index" | "show" | "store" | "update" | "destroy"))
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
    warnings.sort();
    warnings.dedup();
    warnings
}

fn is_crud_name(name: &str) -> bool {
    matches!(name, "index" | "show" | "store" | "update" | "destroy")
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
                                | "email"
                                | "max"
                                | "min"
                        );
                        valid_rule
                            && if matches!(name, "max" | "min") {
                                argument.parse::<f64>().is_ok()
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
        "show" => with_id(&connection, table, endpoint, schema, model, path, "show", body),
        "store" => store(&connection, table, endpoint, schema, body),
        "update" => with_id(&connection, table, endpoint, schema, model, path, "update", body),
        "destroy" => with_id(&connection, table, endpoint, schema, model, path, "destroy", body),
        _ => (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Endpoint {action} is not implemented by the Rust engine")}),
        ),
    }
}

fn open_connection(database_dir: &Path, slug: &str) -> Result<Connection, String> {
    let path = database_dir.join(format!("{slug}.sqlite"));
    let connection = Connection::open(path).map_err(|error| error.to_string())?;
    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|error| error.to_string())?;
    connection
        .pragma_update(None, "foreign_keys", "ON")
        .map_err(|error| error.to_string())?;
    Ok(connection)
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
    let total = match connection.query_row(&total_sql, rusqlite::params_from_iter(values.clone()), |row| row.get::<_, i64>(0)) {
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
        let last_page = ((total.max(0) as u64 + u64::from(per_page) - 1)
            / u64::from(per_page))
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
        let names = fields.iter().map(|(name, _)| quote(name)).collect::<Vec<_>>().join(", ");
        let values = fields
            .iter()
            .map(|(name, value)| if value.is_null() && matches!(name.as_str(), "created_at" | "updated_at") {
                "CURRENT_TIMESTAMP".to_owned()
            } else {
                "?".to_owned()
            })
            .collect::<Vec<_>>()
            .join(", ");
        format!("INSERT INTO {} ({names}) VALUES ({values})", quote(table))
    };
    let params: Vec<_> = fields
        .iter()
        .filter(|(name, value)| !(value.is_null() && matches!(name.as_str(), "created_at" | "updated_at")))
        .map(|(_, value)| sql_value(value))
        .collect();
    let row_id = match connection.execute(&sql, rusqlite::params_from_iter(params)) {
        Ok(_) => connection.last_insert_rowid(),
        Err(error) if is_constraint_error(&error) => {
            return validation_error(vec![format!("The submitted values violate a constraint on {table}.")])
        }
        Err(error) => return internal_error(format!("Could not create {table} record: {error}")),
    };
    let row = match find_row(connection, table, &row_id.to_string(), definition, false) {
        Ok(Some(row)) => row,
        Ok(None) => return internal_error("Created row could not be read back".to_owned()),
        Err(error) => return internal_error(format!("Could not read created {table} record: {error}")),
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
        None => return (axum::http::StatusCode::NOT_FOUND, json!({"message": "Not Found"})),
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
            Ok(None) => (axum::http::StatusCode::NOT_FOUND, json!({"message": "Not Found"})),
            Err(error) => internal_error(format!("Could not find {table} record: {error}")),
        },
        "update" => {
            let Some(body) = body.as_object() else {
                return validation_error(vec!["Request body must be a JSON object".to_owned()]);
            };
            if let Some(response) = validate_fields(endpoint, body, columns.clone(), false) {
                return response;
            }
            let fields = writable_fields(body, columns.clone());
            if fields.is_empty() {
                return validation_error(vec!["Request body must contain at least one updatable field".to_owned()]);
            }
            let mut assignments: Vec<String> = fields.iter()
                .map(|(name, _)| format!("{} = ?", quote(name)))
                .collect();
            let mut values: Vec<SqlValue> = fields.iter().map(|(_, value)| sql_value(value)).collect();
            if columns.iter().any(|field| field == "updated_at") {
                assignments.push("\"updated_at\" = CURRENT_TIMESTAMP".to_owned());
            }
            values.push(sql_value(&Value::String(id.clone())));
            let sql = format!(
                "UPDATE {} SET {} WHERE \"id\" = ?{}",
                quote(table),
                assignments.join(", "),
                if soft_deletes { " AND \"deleted_at\" IS NULL" } else { "" }
            );
            match connection.execute(&sql, rusqlite::params_from_iter(values)) {
                Ok(0) => (axum::http::StatusCode::NOT_FOUND, json!({"message": "Not Found"})),
                Ok(_) => match find_row(connection, table, &id, definition, soft_deletes) {
                    Ok(Some(row)) => (axum::http::StatusCode::OK, row),
                    Ok(None) => (axum::http::StatusCode::NOT_FOUND, json!({"message": "Not Found"})),
                    Err(error) => internal_error(format!("Could not read updated {table} record: {error}")),
                },
                Err(error) if is_constraint_error(&error) => {
                    validation_error(vec![format!("The submitted values violate a constraint on {table}.")])
                }
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
                Ok(0) => (axum::http::StatusCode::NOT_FOUND, json!({"message": "Not Found"})),
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
        _ => (axum::http::StatusCode::NOT_IMPLEMENTED, json!({"message": "Not implemented"})),
    }
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
        .filter(|field| !matches!(field.as_str(), "id" | "created_at" | "updated_at" | "deleted_at"))
        .collect();
    let unknown: Vec<_> = body
        .keys()
        .filter(|field| !writable.iter().any(|column| column == *field))
        .cloned()
        .collect();
    if !unknown.is_empty() {
        return Some(validation_error(
            unknown.iter().map(|field| format!("The {field} field is not fillable.")).collect(),
        ));
    }
    if creating && body.is_empty() {
        return Some(validation_error(vec!["Request body must contain at least one field".to_owned()]));
    }
    None
}

fn validate_rule(field: &str, value: Option<&Value>, rule: &str) -> Option<String> {
    let rules: Vec<_> = rule.split('|').collect();
    if rules.contains(&"sometimes") && value.is_none() {
        return None;
    }
    if rules.contains(&"required") && value.map_or(true, Value::is_null) {
        return Some(format!("The {field} field is required."));
    }
    let Some(value) = value else { return None };
    if value.is_null() && rules.contains(&"nullable") {
        return None;
    }
    for rule in rules {
        let (name, argument) = rule.split_once(':').unwrap_or((rule, ""));
        let invalid = match name {
            "required" | "sometimes" | "nullable" => false,
            "string" => !value.is_string(),
            "integer" => !(value.is_i64() || value.as_str().is_some_and(|value| value.parse::<i64>().is_ok())),
            "numeric" => !(value.is_number() || value.as_str().is_some_and(|value| value.parse::<f64>().is_ok())),
            "boolean" => !(value.is_boolean() || matches!(value.as_i64(), Some(0 | 1))),
            "email" => !value.as_str().is_some_and(|email| email.contains('@') && email.contains('.')),
            "max" => exceeds_limit(value, argument),
            "min" => below_limit(value, argument),
            _ => return Some(format!("Validation rule \"{name}\" is not supported by the Rust engine.")),
        };
        if invalid {
            return Some(format!("The {field} field failed the {name} validation rule."));
        }
    }
    None
}

fn exceeds_limit(value: &Value, argument: &str) -> bool {
    let limit = argument.parse::<f64>().unwrap_or(f64::INFINITY);
    value.as_str().map(|value| value.chars().count() as f64 > limit)
        .or_else(|| value.as_array().map(|value| value.len() as f64 > limit))
        .or_else(|| value.as_f64().map(|value| value > limit))
        .unwrap_or(false)
}

fn below_limit(value: &Value, argument: &str) -> bool {
    let limit = argument.parse::<f64>().unwrap_or(f64::NEG_INFINITY);
    value.as_str().map(|value| (value.chars().count() as f64) < limit)
        .or_else(|| value.as_array().map(|value| (value.len() as f64) < limit))
        .or_else(|| value.as_f64().map(|value| value < limit))
        .unwrap_or(false)
}

fn writable_fields(body: &Map<String, Value>, columns: Vec<String>) -> Vec<(String, Value)> {
    body.iter()
        .filter(|(field, _)| {
            columns.iter().any(|column| column == *field)
                && !matches!(field.as_str(), "id" | "created_at" | "updated_at" | "deleted_at")
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
) -> rusqlite::Result<Option<Value>> {
    let sql = format!(
        "SELECT * FROM {} WHERE \"id\" = ?{}",
        quote(table),
        if exclude_deleted { " AND \"deleted_at\" IS NULL" } else { "" }
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
) -> rusqlite::Result<Vec<Value>> {
    let mut statement = connection.prepare(sql)?;
    let rows = statement.query_map(rusqlite::params_from_iter(values), |row| row_to_json(row, definition))?;
    rows.collect()
}

fn row_to_json(row: &rusqlite::Row<'_>, definition: &Value) -> rusqlite::Result<Value> {
    let mut object = Map::new();
    let columns = row.as_ref().column_names().to_vec();
    for (index, name) in columns.iter().enumerate() {
        let kind = definition["columns"][*name]["type"].as_str().unwrap_or_default();
        let value = match row.get_ref(index)? {
            ValueRef::Null => Value::Null,
            ValueRef::Integer(value) if kind == "boolean" => json!(value != 0),
            ValueRef::Integer(value) => json!(value),
            ValueRef::Real(value) => json!(value),
            ValueRef::Text(value) if kind == "json" => serde_json::from_slice(value).unwrap_or_else(|_| {
                Value::String(String::from_utf8_lossy(value).into_owned())
            }),
            ValueRef::Text(value) => json!(String::from_utf8_lossy(value).into_owned()),
            ValueRef::Blob(value) => json!(String::from_utf8_lossy(value).into_owned()),
        };
        object.insert((*name).to_owned(), value);
    }
    Ok(Value::Object(object))
}

fn table_exists(connection: &Connection, table: &str) -> bool {
    connection
        .query_row(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [table],
            |_| Ok(()),
        )
        .is_ok()
}

fn column_names(connection: &Connection, table: &str) -> rusqlite::Result<Vec<String>> {
    let mut statement = connection.prepare(&format!("PRAGMA table_info({})", quote(table)))?;
    let columns = statement.query_map([], |row| row.get(1))?;
    columns.collect()
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
    (status, json!({"message": "Validation failed", "errors": errors}))
}

fn internal_error(message: String) -> (axum::http::StatusCode, Value) {
    (
        axum::http::StatusCode::INTERNAL_SERVER_ERROR,
        json!({"message": message}),
    )
}

fn is_constraint_error(error: &rusqlite::Error) -> bool {
    matches!(
        error,
        rusqlite::Error::SqliteFailure(code, _)
            if code.code == rusqlite::ErrorCode::ConstraintViolation
    )
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
    fn matches_declared_api_prefix_and_parameterized_routes() {
        let matched = match_route(&module(), "GET", "/api/sample/notes/42").unwrap();
        assert_eq!(matched.name, "show");
        assert_eq!(matched.table, "notes");
        assert_eq!(match_route(&module(), "POST", "/api/sample/notes/42").is_none(), true);
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
        let (status, created) = store(&connection, "notes", &endpoint, &json!({"title":"First","body":"hello"}));
        assert_eq!(status, axum::http::StatusCode::CREATED);
        assert_eq!(created["title"], "First");
        assert_eq!(created["pinned"], false);
        let id = created["id"].as_i64().unwrap().to_string();

        let (status, listed) = index(&connection, "notes", &json!({"response":{"type":"paginated"}}), "");
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(listed["total"], 1);
        assert_eq!(listed["data"][0]["id"], created["id"]);

        let (status, updated) = with_id(&connection, "notes", &json!({}), &format!("/api/sample/notes/{id}"), "update", &json!({"title":"Updated"}));
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(updated["title"], "Updated");

        let (status, deleted) = with_id(&connection, "notes", &json!({"response":{"value":"Gone"}}), &format!("/api/sample/notes/{id}"), "destroy", &Value::Null);
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(deleted["message"], "Gone");
        let (status, missing) = with_id(&connection, "notes", &json!({}), &format!("/api/sample/notes/{id}"), "show", &Value::Null);
        assert_eq!(status, axum::http::StatusCode::NOT_FOUND);
        assert_eq!(missing["message"], "Not Found");
    }

    #[test]
    fn unknown_validation_rules_are_explicit_errors() {
        assert!(validate_rule("name", Some(&json!("x")), "required|alpha_dash").unwrap().contains("not supported"));
    }
}
