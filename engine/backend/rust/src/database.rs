use rusqlite::{Connection, Transaction};
use serde_json::Value;
use std::path::Path;

pub fn apply_schema(directory: &Path, name: &str, payload: &Value) -> Result<Vec<String>, String> {
    std::fs::create_dir_all(directory)
        .map_err(|error| format!("Could not create isolated database directory: {error}"))?;
    let path = directory.join(format!("{name}.sqlite"));
    let mut connection = Connection::open(&path)
        .map_err(|error| format!("Could not open isolated database {}: {error}", path.display()))?;
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
    }
    transaction
        .commit()
        .map_err(|error| format!("Could not commit schema changes: {error}"))?;
    Ok(steps)
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

fn create_table(transaction: &Transaction<'_>, table: &str, definition: &Value) -> Result<(), String> {
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
        let sql = format!(
            "CREATE TABLE {table_name} ({})",
            declarations.join(", ")
        );
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
                .execute(&format!("ALTER TABLE {table_name} ADD COLUMN {declaration}"), [])
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
                    .map_err(|error| format!("Could not add unique index for {table}.{name}: {error}"))?;
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
}
