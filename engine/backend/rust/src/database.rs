use rusqlite::{types::Value as SqlValue, Connection, Transaction};
use serde_json::{Map, Value};
use std::path::Path;

pub fn apply_schema(directory: &Path, name: &str, payload: &Value) -> Result<Vec<String>, String> {
    std::fs::create_dir_all(directory)
        .map_err(|error| format!("Could not create isolated database directory: {error}"))?;
    let path = directory.join(format!("{name}.sqlite"));
    let mut connection = Connection::open(&path).map_err(|error| {
        format!(
            "Could not open isolated database {}: {error}",
            path.display()
        )
    })?;
    connection
        .pragma_update(None, "foreign_keys", "ON")
        .map_err(|error| format!("Could not enable SQLite foreign keys: {error}"))?;

    let databases = payload["databases"].as_array().cloned().unwrap_or_default();
    let transaction = connection
        .transaction()
        .map_err(|error| format!("Could not start schema transaction: {error}"))?;
    let mut steps = vec![format!("Isolated database ready: {}", path.display())];
    for definition in &databases {
        let table = definition["table"]
            .as_str()
            .ok_or_else(|| "Validated database table name was missing".to_owned())?;
        create_table(&transaction, table, definition)?;
        steps.push(format!("Schema ready: {table}"));
        let rows = definition["seeder"]["data"]
            .as_array()
            .filter(|rows| !rows.is_empty());
        if let Some(rows) = rows {
            seed_table(&transaction, table, definition, rows)?;
            steps.push(format!("Seeded {} rows: {table} (reset)", rows.len()));
        }
    }
    transaction
        .commit()
        .map_err(|error| format!("Could not commit schema changes: {error}"))?;
    Ok(steps)
}

fn seed_table(
    transaction: &Transaction<'_>,
    table: &str,
    definition: &Value,
    rows: &[Value],
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    transaction
        .execute(&format!("DELETE FROM {table_name}"), [])
        .map_err(|error| format!("Could not reset seeded table {table}: {error}"))?;

    let sequence_exists = transaction
        .query_row(
            "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'",
            [],
            |row| row.get::<_, i64>(0),
        )
        .map_err(|error| format!("Could not inspect SQLite sequences: {error}"))?
        > 0;
    if sequence_exists {
        transaction
            .execute("DELETE FROM sqlite_sequence WHERE name = ?1", [table])
            .map_err(|error| {
                format!("Could not reset auto-increment sequence for {table}: {error}")
            })?;
    }

    let timestamps = definition["timestamps"].as_bool() != Some(false);
    for (row_index, row) in rows.iter().enumerate() {
        let Some(row) = row.as_object() else {
            return Err(format!(
                "Seed row {} for {table} must be an object",
                row_index + 1
            ));
        };
        seed_row(transaction, table, row, timestamps)
            .map_err(|error| format!("Could not seed {table} row {}: {error}", row_index + 1))?;
    }
    Ok(())
}

fn seed_row(
    transaction: &Transaction<'_>,
    table: &str,
    row: &Map<String, Value>,
    timestamps: bool,
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    let mut fields: Vec<(String, Option<Value>)> = row
        .iter()
        .map(|(name, value)| (name.clone(), Some(value.clone())))
        .collect();
    if timestamps {
        for name in ["created_at", "updated_at"] {
            if !row.contains_key(name) {
                fields.push((name.to_owned(), None));
            }
        }
    }
    if fields.is_empty() {
        transaction
            .execute(&format!("INSERT INTO {table_name} DEFAULT VALUES"), [])
            .map_err(|error| error.to_string())?;
        return Ok(());
    }

    let mut parameters = Vec::with_capacity(fields.len());
    let mut placeholders = Vec::with_capacity(fields.len());
    let mut columns = Vec::with_capacity(fields.len());
    for (name, value) in fields {
        columns.push(quote_identifier(&name)?);
        if value.is_none() && timestamps && matches!(name.as_str(), "created_at" | "updated_at") {
            placeholders.push("CURRENT_TIMESTAMP".to_owned());
        } else {
            placeholders.push("?".to_owned());
            let Some(value) = value.as_ref() else {
                return Err(format!("Missing generated timestamp value for {name}"));
            };
            parameters.push(seed_sql_value(value)?);
        }
    }
    let sql = format!(
        "INSERT INTO {table_name} ({}) VALUES ({})",
        columns.join(", "),
        placeholders.join(", ")
    );
    transaction
        .execute(&sql, rusqlite::params_from_iter(parameters))
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn seed_sql_value(value: &Value) -> Result<SqlValue, String> {
    match value {
        Value::Null => Ok(SqlValue::Null),
        Value::Bool(value) => Ok(SqlValue::Integer(if *value { 1 } else { 0 })),
        Value::Number(value) => {
            if let Some(value) = value.as_i64() {
                Ok(SqlValue::Integer(value))
            } else if let Some(value) = value.as_u64() {
                match i64::try_from(value) {
                    Ok(value) => Ok(SqlValue::Integer(value)),
                    Err(_) => value
                        .as_f64()
                        .map(SqlValue::Real)
                        .ok_or_else(|| "Seed number is not supported by SQLite".to_owned()),
                }
            } else if let Some(value) = value.as_f64() {
                Ok(SqlValue::Real(value))
            } else {
                Err("Seed number is not supported by SQLite".to_owned())
            }
        }
        Value::String(value) => Ok(SqlValue::Text(value.clone())),
        Value::Array(_) | Value::Object(_) => Err("Seed values must be JSON scalars".to_owned()),
    }
}

pub fn table_for_model<'a>(payload: &'a Value, api: &'a Value) -> Option<&'a str> {
    let databases = payload.get("databases")?.as_array()?;
    let requested = api.get("table").and_then(Value::as_str);
    if let Some(table) = requested {
        return databases
            .iter()
            .any(|database| database["table"].as_str() == Some(table))
            .then_some(table);
    }

    let model = api.get("model")?.as_str()?;
    let normalized = model_to_table(model);
    let pluralized = pluralize(&normalized);
    databases
        .iter()
        .filter_map(|database| database["table"].as_str())
        .find(|table| {
            *table == normalized.as_str()
                || *table == pluralized.as_str()
                || normalized.strip_suffix('s') == Some(*table)
        })
        .or_else(|| {
            if databases.len() == 1 {
                databases.first()?.get("table")?.as_str()
            } else {
                None
            }
        })
}

fn model_to_table(model: &str) -> String {
    let mut result = String::new();
    for (index, character) in model.chars().enumerate() {
        if character.is_ascii_uppercase() {
            if index > 0 {
                result.push('_');
            }
            result.push(character.to_ascii_lowercase());
        } else {
            result.push(character);
        }
    }
    result
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

fn create_table(
    transaction: &Transaction<'_>,
    table: &str,
    definition: &Value,
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    let columns = definition["columns"].as_object();
    let has_primary = columns
        .map(|columns| {
            columns
                .values()
                .any(|column| column["primary"].as_bool() == Some(true))
        })
        .unwrap_or(false);
    let mut declarations = Vec::new();

    if !has_primary {
        declarations.push("\"id\" INTEGER PRIMARY KEY AUTOINCREMENT".to_owned());
    }
    if let Some(columns) = columns {
        for (name, config) in columns {
            declarations.push(column_declaration(name, config)?);
        }
    }
    if definition["timestamps"].as_bool() != Some(false) {
        if !columns.is_some_and(|columns| columns.contains_key("created_at")) {
            declarations.push("\"created_at\" TEXT".to_owned());
        }
        if !columns.is_some_and(|columns| columns.contains_key("updated_at")) {
            declarations.push("\"updated_at\" TEXT".to_owned());
        }
    }
    if definition["softDeletes"].as_bool() == Some(true)
        && !columns.is_some_and(|columns| columns.contains_key("deleted_at"))
    {
        declarations.push("\"deleted_at\" TEXT".to_owned());
    }

    let exists = transaction
        .query_row(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [table],
            |_| Ok(()),
        )
        .is_ok();
    if !exists {
        let sql = format!("CREATE TABLE {table_name} ({})", declarations.join(", "));
        transaction
            .execute(&sql, [])
            .map_err(|error| format!("Could not create table {table}: {error}"))?;
    } else {
        let mut statement = transaction
            .prepare(&format!("PRAGMA table_info({table_name})"))
            .map_err(|error| format!("Could not inspect table {table}: {error}"))?;
        let existing: Vec<String> = statement
            .query_map([], |row| row.get(1))
            .map_err(|error| format!("Could not inspect table {table}: {error}"))?
            .collect::<Result<_, _>>()
            .map_err(|error| format!("Could not inspect table {table}: {error}"))?;
        for (name, config) in columns.into_iter().flat_map(|columns| columns.iter()) {
            if existing.iter().any(|column| column == name) {
                continue;
            }
            let declaration = added_column_declaration(name, config)?;
            transaction
                .execute(
                    &format!("ALTER TABLE {table_name} ADD COLUMN {declaration}"),
                    [],
                )
                .map_err(|error| format!("Could not add column {name} to {table}: {error}"))?;
            if config["unique"].as_bool() == Some(true) {
                let index_name = quote_identifier(&format!("{table}_{name}_unique"))?;
                transaction
                    .execute(
                        &format!(
                            "CREATE UNIQUE INDEX IF NOT EXISTS {index_name} ON {table_name} ({})",
                            quote_identifier(name)?
                        ),
                        [],
                    )
                    .map_err(|error| {
                        format!("Could not add unique index for {table}.{name}: {error}")
                    })?;
            }
        }
    }
    Ok(())
}

fn added_column_declaration(name: &str, config: &Value) -> Result<String, String> {
    let kind = config["type"].as_str().unwrap_or("string");
    let sql_type = match kind {
        "integer" | "bigInteger" | "foreignId" => "INTEGER",
        "decimal" | "float" => "REAL",
        _ => "TEXT",
    };
    let mut declaration = format!("{} {sql_type}", quote_identifier(name)?);
    if let Some(default) = config.get("default") {
        declaration.push_str(" DEFAULT ");
        declaration.push_str(&sql_literal(default)?);
    }
    Ok(declaration)
}

fn column_declaration(name: &str, config: &Value) -> Result<String, String> {
    let name = quote_identifier(name)?;
    let kind = config["type"].as_str().unwrap_or("string");
    let primary = config["primary"].as_bool() == Some(true);
    let auto_increment = config["autoIncrement"].as_bool() != Some(false);
    let sql_type = match kind {
        "integer" | "bigInteger" | "foreignId" => "INTEGER",
        "decimal" | "float" => "REAL",
        _ => "TEXT",
    };
    let mut declaration = if primary && auto_increment && sql_type == "INTEGER" {
        format!("{name} INTEGER PRIMARY KEY AUTOINCREMENT")
    } else if primary {
        format!("{name} {sql_type} PRIMARY KEY")
    } else {
        format!("{name} {sql_type}")
    };
    if !primary && config["nullable"].as_bool() != Some(true) {
        declaration.push_str(" NOT NULL");
    }
    if config["unique"].as_bool() == Some(true) {
        declaration.push_str(" UNIQUE");
    }
    if let Some(reference) = config["foreign"].as_str() {
        let mut parts = reference.split('.');
        let table = parts.next().unwrap_or_default();
        let column = parts.next().unwrap_or("id");
        if parts.next().is_some() {
            return Err(format!("Invalid foreign key reference \"{reference}\""));
        }
        declaration.push_str(&format!(
            " REFERENCES {}({})",
            quote_identifier(table)?,
            quote_identifier(column)?
        ));
        let on_delete = config["onDelete"].as_str().unwrap_or("cascade");
        let action = match on_delete.to_ascii_lowercase().as_str() {
            "cascade" => "CASCADE",
            "restrict" => "RESTRICT",
            "set null" => "SET NULL",
            "no action" => "NO ACTION",
            _ => return Err(format!("Unsupported foreign key action \"{on_delete}\"")),
        };
        declaration.push_str(" ON DELETE ");
        declaration.push_str(action);
    }
    if let Some(default) = config.get("default") {
        declaration.push_str(" DEFAULT ");
        declaration.push_str(&sql_literal(default)?);
    }
    Ok(declaration)
}

fn quote_identifier(identifier: &str) -> Result<String, String> {
    if !super::engine::is_identifier(identifier) {
        return Err(format!("Invalid SQLite identifier \"{identifier}\""));
    }
    Ok(format!("\"{identifier}\""))
}

fn sql_literal(value: &Value) -> Result<String, String> {
    match value {
        Value::String(value) => Ok(format!("'{}'", value.replace('\'', "''"))),
        Value::Number(value) => Ok(value.to_string()),
        Value::Bool(value) => Ok(if *value { "1" } else { "0" }.to_owned()),
        Value::Null => Ok("NULL".to_owned()),
        _ => Err("SQLite default must be a scalar value".to_owned()),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn creates_isolated_schema_and_applies_timestamps_and_defaults() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "databases": [{
                "table": "tasks",
                "columns": {
                    "title": {"type": "string"},
                    "done": {"type": "boolean", "default": false},
                    "notes": {"type": "text", "nullable": true}
                }
            }]
        });

        apply_schema(directory.path(), "tasks-app", &payload).unwrap();
        let connection = Connection::open(directory.path().join("tasks-app.sqlite")).unwrap();
        let columns: Vec<String> = connection
            .prepare("PRAGMA table_info(\"tasks\")")
            .unwrap()
            .query_map([], |row| row.get(1))
            .unwrap()
            .collect::<Result<_, _>>()
            .unwrap();
        assert_eq!(
            columns,
            vec![
                "id".to_owned(),
                "title".to_owned(),
                "done".to_owned(),
                "notes".to_owned(),
                "created_at".to_owned(),
                "updated_at".to_owned()
            ]
        );
        connection
            .execute("INSERT INTO tasks (title) VALUES ('first')", [])
            .unwrap();
        let done: i64 = connection
            .query_row("SELECT done FROM tasks", [], |row| row.get(0))
            .unwrap();
        assert_eq!(done, 0);
        assert!(!directory.path().join("other.sqlite").exists());
    }

    #[test]
    fn rebuild_resets_declared_seed_rows_and_auto_increment_ids() {
        let directory = tempfile::tempdir().unwrap();
        let payload = json!({
            "databases": [{
                "table": "inventories",
                "columns": {
                    "name": {"type": "string", "nullable": false},
                    "quantity": {"type": "integer", "nullable": false}
                },
                "seeder": {
                    "count": 2,
                    "data": [
                        {"name": "Keyboard", "quantity": 5},
                        {"name": "Desk", "quantity": 20}
                    ]
                }
            }, {
                "table": "audit_logs",
                "columns": {
                    "event": {"type": "string", "nullable": false}
                }
            }]
        });
        let first = apply_schema(directory.path(), "inventory", &payload).unwrap();
        assert!(first
            .iter()
            .any(|step| step == "Seeded 2 rows: inventories (reset)"));

        let connection = Connection::open(directory.path().join("inventory.sqlite")).unwrap();
        let count: i64 = connection
            .query_row("SELECT COUNT(*) FROM inventories", [], |row| row.get(0))
            .unwrap();
        assert_eq!(count, 2);
        connection
            .execute(
                "INSERT INTO inventories (name, quantity) VALUES ('Temporary', 1)",
                [],
            )
            .unwrap();
        connection
            .execute("INSERT INTO audit_logs (event) VALUES ('keep')", [])
            .unwrap();
        drop(connection);

        apply_schema(directory.path(), "inventory", &payload).unwrap();
        let connection = Connection::open(directory.path().join("inventory.sqlite")).unwrap();
        let (count, highest_id): (i64, i64) = connection
            .query_row("SELECT COUNT(*), MAX(id) FROM inventories", [], |row| {
                Ok((row.get(0)?, row.get(1)?))
            })
            .unwrap();
        assert_eq!((count, highest_id), (2, 2));
        let preserved_logs: i64 = connection
            .query_row("SELECT COUNT(*) FROM audit_logs", [], |row| row.get(0))
            .unwrap();
        assert_eq!(preserved_logs, 1);
        let created_at: String = connection
            .query_row(
                "SELECT created_at FROM inventories WHERE name = 'Keyboard'",
                [],
                |row| row.get(0),
            )
            .unwrap();
        assert!(!created_at.is_empty());
    }
}
