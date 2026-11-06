use crate::db::{types::Value as SqlValue, Connection, Transaction};
use serde_json::{Map, Value};
use std::collections::HashSet;
use std::path::Path;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum DatabaseDriver {
    Sqlite,
    Postgres,
}

impl DatabaseDriver {
    pub fn from_setting(value: Option<&str>) -> Self {
        let normalized = value.map(|value| value.trim().to_ascii_lowercase());
        if matches!(
            normalized.as_deref(),
            Some("pgsql" | "postgres" | "postgresql")
        ) {
            Self::Postgres
        } else {
            Self::Sqlite
        }
    }

    pub fn as_str(self) -> &'static str {
        match self {
            Self::Sqlite => "sqlite",
            Self::Postgres => "pgsql",
        }
    }
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct DatabaseConfig {
    pub driver: DatabaseDriver,
    pub prefix: String,
    pub host: String,
    pub port: u16,
    pub username: String,
    pub password: String,
}

impl DatabaseConfig {
    pub fn from_env() -> Result<Self, String> {
        let port = std::env::var("DB_PORT")
            .unwrap_or_else(|_| "5432".to_owned())
            .parse::<u16>()
            .map_err(|error| format!("DB_PORT must be a valid TCP port: {error}"))?;
        let config = Self {
            driver: DatabaseDriver::from_setting(std::env::var("ARKZEN_DB_DRIVER").ok().as_deref()),
            prefix: std::env::var("ARKZEN_DB_PREFIX").unwrap_or_else(|_| "pluff".to_owned()),
            host: std::env::var("DB_HOST").unwrap_or_else(|_| "127.0.0.1".to_owned()),
            port,
            username: std::env::var("DB_USERNAME").unwrap_or_default(),
            password: std::env::var("DB_PASSWORD").unwrap_or_default(),
        };
        validate_pg_identifier(&config.prefix)?;
        Ok(config)
    }

    pub fn postgres_database_name(&self, slug: &str) -> Result<String, String> {
        validate_pg_identifier(slug)?;
        Ok(format!(
            "{}_{}",
            self.prefix.to_ascii_lowercase(),
            slug.replace('-', "_").to_ascii_lowercase()
        ))
    }
}

fn validate_pg_identifier(value: &str) -> Result<(), String> {
    if value.is_empty()
        || !value
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || byte == b'_' || byte == b'-')
    {
        return Err(format!(
            "Invalid PostgreSQL identifier component \"{value}\""
        ));
    }
    Ok(())
}

fn postgres_column_type(sqlite_type: &str) -> String {
    sqlite_type
        .replace("INTEGER PRIMARY KEY AUTOINCREMENT", "BIGSERIAL PRIMARY KEY")
        .replace("INTEGER PRIMARY KEY", "BIGINT PRIMARY KEY")
}

pub fn apply_schema(directory: &Path, name: &str, payload: &Value) -> Result<Vec<String>, String> {
    let (connection, location) = crate::db::ensure_module_database(directory, name)?;
    let postgres = connection.is_postgres();

    let databases = payload["databases"].as_array().cloned().unwrap_or_default();
    let tables: HashSet<&str> = databases
        .iter()
        .filter_map(|definition| definition["table"].as_str())
        .collect();
    let module_prefix = format!("{}_", name.replace('-', "_"));
    let transaction = connection
        .transaction()
        .map_err(|error| format!("Could not start schema transaction: {error}"))?;
    let mut steps = vec![format!("Isolated database ready: {location}")];
    for definition in &databases {
        let table = definition["table"]
            .as_str()
            .ok_or_else(|| "Validated database table name was missing".to_owned())?;
        create_table(&transaction, table, definition, &module_prefix, &tables)?;
        steps.push(format!("Schema ready: {table}"));
    }
    if postgres {
        // PostgreSQL requires referenced tables to exist, so constraints are added once
        // every table of the module has been created.
        for definition in &databases {
            let table = definition["table"]
                .as_str()
                .ok_or_else(|| "Validated database table name was missing".to_owned())?;
            ensure_postgres_foreign_keys(&transaction, table, definition, &module_prefix, &tables)?;
        }
    }

    for definition in &databases {
        let table = definition["table"]
            .as_str()
            .ok_or_else(|| "Validated database table name was missing".to_owned())?;
        let rows = definition["seeder"]["data"]
            .as_array()
            .filter(|rows| !rows.is_empty());
        if let Some(rows) = rows {
            seed_table(&transaction, table, definition, rows)?;
            steps.push(format!("Seeded {} rows: {table} (reset)", rows.len()));
        }
    }
    if payload["notifications"]
        .as_array()
        .is_some_and(|notifications| !notifications.is_empty())
    {
        ensure_notification_table(&transaction)?;
        steps.push("Notification table ready: notifications".to_owned());
    }
    transaction
        .commit()
        .map_err(|error| format!("Could not commit schema changes: {error}"))?;
    Ok(steps)
}

fn ensure_postgres_foreign_keys(
    transaction: &Transaction<'_>,
    table: &str,
    definition: &Value,
    module_prefix: &str,
    tables: &HashSet<&str>,
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    let existing = transaction
        .postgres_foreign_keys(table)
        .map_err(|error| format!("Could not inspect foreign keys for {table}: {error}"))?;
    for (column, config) in definition["columns"].as_object().into_iter().flatten() {
        let Some(reference) = config["foreign"].as_str() else {
            continue;
        };
        let (target_table, target_column) =
            resolved_foreign_reference(reference, module_prefix, tables)?;
        let matching = existing.iter().filter(|key| &key.column == column);
        let mut satisfied = false;
        for key in matching {
            if key.target_table == target_table && key.target_column == target_column {
                satisfied = true;
            } else {
                transaction
                    .execute(
                        &format!(
                            "ALTER TABLE {table_name} DROP CONSTRAINT {}",
                            quote_identifier(&key.constraint)?
                        ),
                        crate::db::params![],
                    )
                    .map_err(|error| {
                        format!("Could not replace foreign key {}: {error}", key.constraint)
                    })?;
            }
        }
        if satisfied {
            continue;
        }
        let constraint = quote_identifier(&format!("{table}_{column}_foreign"))?;
        let action = foreign_key_action(config)?;
        transaction
            .execute(
                &format!(
                    "ALTER TABLE {table_name} ADD CONSTRAINT {constraint} FOREIGN KEY ({}) \
                     REFERENCES {}({}) ON DELETE {action}",
                    quote_identifier(column)?,
                    quote_identifier(&target_table)?,
                    quote_identifier(target_column)?
                ),
                crate::db::params![],
            )
            .map_err(|error| {
                format!("Could not add foreign key {table}.{column} -> {target_table}.{target_column}: {error}")
            })?;
    }
    Ok(())
}

fn foreign_key_action(config: &Value) -> Result<&'static str, String> {
    let on_delete = config["onDelete"].as_str().unwrap_or("cascade");
    match on_delete.to_ascii_lowercase().as_str() {
        "cascade" => Ok("CASCADE"),
        "restrict" => Ok("RESTRICT"),
        "set null" => Ok("SET NULL"),
        "no action" => Ok("NO ACTION"),
        _ => Err(format!("Unsupported foreign key action \"{on_delete}\"")),
    }
}

fn ensure_notification_table(transaction: &Transaction<'_>) -> Result<(), String> {
    transaction
        .execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS "notifications" (
                "id" TEXT PRIMARY KEY NOT NULL,
                "type" TEXT NOT NULL,
                "notifiable_type" TEXT NOT NULL,
                "notifiable_id" INTEGER NOT NULL,
                "data" TEXT NOT NULL,
                "read_at" TEXT NULL,
                "created_at" TEXT NULL,
                "updated_at" TEXT NULL
            );
            CREATE INDEX IF NOT EXISTS "notifications_notifiable_index"
                ON "notifications" ("notifiable_type", "notifiable_id");
            "#,
        )
        .map_err(|error| format!("Could not configure notification table: {error}"))
}

fn seed_table(
    transaction: &Transaction<'_>,
    table: &str,
    definition: &Value,
    rows: &[Value],
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    transaction
        .execute(&format!("DELETE FROM {table_name}"), crate::db::params![])
        .map_err(|error| format!("Could not reset seeded table {table}: {error}"))?;

    if transaction.is_postgres() {
        reset_postgres_sequence(transaction, table, true)?;
    } else {
        let sequence_exists = transaction
            .query_row(
                "SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'",
                crate::db::params![],
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
    if transaction.is_postgres() {
        // Explicit ids in seed rows do not advance the serial sequence.
        reset_postgres_sequence(transaction, table, false)?;
    }
    Ok(())
}

/// Restarts (`restart = true`) or realigns a table's serial sequence with `MAX(id)`.
fn reset_postgres_sequence(
    transaction: &Transaction<'_>,
    table: &str,
    restart: bool,
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    let sequence: Option<String> = transaction
        .query_row(
            "SELECT pg_get_serial_sequence(?1, 'id')",
            [table_name.as_str()],
            |row| row.get(0),
        )
        .map_err(|error| format!("Could not inspect sequence for {table}: {error}"))?;
    let Some(sequence) = sequence else {
        return Ok(());
    };
    let statement = if restart {
        "SELECT setval(?1, 1, false)".to_owned()
    } else {
        format!("SELECT setval(?1, COALESCE((SELECT MAX(\"id\") FROM {table_name}), 0) + 1, false)")
    };
    transaction
        .query_row(&statement, [sequence.as_str()], |_| Ok(()))
        .map_err(|error| format!("Could not reset sequence for {table}: {error}"))
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
            .execute(
                &format!("INSERT INTO {table_name} DEFAULT VALUES"),
                crate::db::params![],
            )
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
        .execute(&sql, crate::db::params_from_iter(parameters))
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
                    Err(_) => Ok(SqlValue::Real(value as f64)),
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
    let requested = api.get("table").and_then(Value::as_str);
    let has_notifications = payload["notifications"]
        .as_array()
        .is_some_and(|notifications| !notifications.is_empty());
    if has_notifications && (requested == Some("notifications") || api["model"] == "Notification") {
        return Some("notifications");
    }

    let databases = payload.get("databases")?.as_array()?;
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
    module_prefix: &str,
    tables: &HashSet<&str>,
) -> Result<(), String> {
    let postgres = transaction.is_postgres();
    let table_name = quote_identifier(table)?;
    let columns = definition["columns"].as_object();
    let declarations = table_declarations(definition, module_prefix, tables, postgres)?;

    let exists = transaction.table_exists(table);
    if !exists {
        let sql = format!("CREATE TABLE {table_name} ({})", declarations.join(", "));
        transaction
            .execute(&sql, crate::db::params![])
            .map_err(|error| format!("Could not create table {table}: {error}"))?;
    } else {
        if !postgres
            && has_mismatched_foreign_key(transaction, table, definition, module_prefix, tables)?
        {
            migrate_table_foreign_keys(transaction, table, &declarations)?;
        }
        let existing = transaction
            .table_columns(table)
            .map_err(|error| format!("Could not inspect table {table}: {error}"))?;
        for (name, config) in columns.into_iter().flat_map(|columns| columns.iter()) {
            if existing.iter().any(|column| column == name) {
                continue;
            }
            let declaration = added_column_declaration(name, config, postgres)?;
            transaction
                .execute(
                    &format!("ALTER TABLE {table_name} ADD COLUMN {declaration}"),
                    crate::db::params![],
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
                        crate::db::params![],
                    )
                    .map_err(|error| {
                        format!("Could not add unique index for {table}.{name}: {error}")
                    })?;
            }
        }
    }
    Ok(())
}

fn table_declarations(
    definition: &Value,
    module_prefix: &str,
    tables: &HashSet<&str>,
    postgres: bool,
) -> Result<Vec<String>, String> {
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
            declarations.push(column_declaration(
                name,
                config,
                module_prefix,
                tables,
                postgres,
            )?);
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
    Ok(declarations)
}

fn resolved_foreign_reference<'a>(
    reference: &'a str,
    module_prefix: &str,
    tables: &HashSet<&str>,
) -> Result<(String, &'a str), String> {
    let mut parts = reference.split('.');
    let table = parts.next().unwrap_or_default();
    let column = parts.next().unwrap_or("id");
    if table.is_empty() || parts.next().is_some() {
        return Err(format!("Invalid foreign key reference \"{reference}\""));
    }
    let physical_table = table
        .strip_prefix(module_prefix)
        .filter(|candidate| tables.contains(candidate))
        .unwrap_or(table);
    Ok((physical_table.to_owned(), column))
}

fn has_mismatched_foreign_key(
    transaction: &Transaction<'_>,
    table: &str,
    definition: &Value,
    module_prefix: &str,
    tables: &HashSet<&str>,
) -> Result<bool, String> {
    let table_name = quote_identifier(table)?;
    let mut statement = transaction
        .prepare(&format!("PRAGMA foreign_key_list({table_name})"))
        .map_err(|error| format!("Could not inspect foreign keys for {table}: {error}"))?;
    let foreign_keys = statement
        .query_map(crate::db::params![], |row| {
            Ok((
                row.get::<_, String>(2)?,
                row.get::<_, String>(3)?,
                row.get::<_, String>(4)?,
            ))
        })
        .map_err(|error| format!("Could not inspect foreign keys for {table}: {error}"))?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| format!("Could not inspect foreign keys for {table}: {error}"))?;

    for (column, config) in definition["columns"].as_object().into_iter().flatten() {
        let Some(reference) = config["foreign"].as_str() else {
            continue;
        };
        let (expected_table, expected_column) =
            resolved_foreign_reference(reference, module_prefix, tables)?;
        if foreign_keys.iter().any(|(target, from, to)| {
            from == column && (target != &expected_table || to != expected_column)
        }) {
            return Ok(true);
        }
    }
    Ok(false)
}

fn migrate_table_foreign_keys(
    transaction: &Transaction<'_>,
    table: &str,
    declarations: &[String],
) -> Result<(), String> {
    let table_name = quote_identifier(table)?;
    let temporary_table = format!("{table}__arkzen_migration");
    let temporary_name = quote_identifier(&temporary_table)?;
    let existing_columns = table_columns(transaction, &table_name, table)?;
    let index_and_trigger_sql = {
        let mut statement = transaction
            .prepare(
                "SELECT sql FROM sqlite_master \
                 WHERE tbl_name = ?1 AND type IN ('index', 'trigger') AND sql IS NOT NULL",
            )
            .map_err(|error| format!("Could not inspect indexes for {table}: {error}"))?;
        let rows = statement
            .query_map([table], |row| row.get::<_, String>(0))
            .map_err(|error| format!("Could not inspect indexes for {table}: {error}"))?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(|error| format!("Could not inspect indexes for {table}: {error}"))?
    };

    transaction
        .execute(
            &format!(
                "CREATE TABLE {temporary_name} ({})",
                declarations.join(", ")
            ),
            crate::db::params![],
        )
        .map_err(|error| format!("Could not prepare foreign-key migration for {table}: {error}"))?;
    let new_columns = table_columns(transaction, &temporary_name, &temporary_table)?;
    if existing_columns
        .iter()
        .any(|column| !new_columns.contains(column))
    {
        return Err(format!(
            "Cannot migrate foreign keys for {table}: existing columns differ from the declared schema"
        ));
    }
    let columns = existing_columns
        .iter()
        .map(|column| quote_identifier(column))
        .collect::<Result<Vec<_>, _>>()?;
    transaction
        .execute(
            &format!(
                "INSERT INTO {temporary_name} ({}) SELECT {} FROM {table_name}",
                columns.join(", "),
                columns.join(", ")
            ),
            crate::db::params![],
        )
        .map_err(|error| {
            format!("Could not preserve {table} rows during foreign-key migration: {error}")
        })?;
    transaction
        .execute(&format!("DROP TABLE {table_name}"), crate::db::params![])
        .map_err(|error| {
            format!("Could not replace {table} during foreign-key migration: {error}")
        })?;
    transaction
        .execute(
            &format!("ALTER TABLE {temporary_name} RENAME TO {table_name}"),
            crate::db::params![],
        )
        .map_err(|error| format!("Could not finish foreign-key migration for {table}: {error}"))?;
    for sql in index_and_trigger_sql {
        transaction
            .execute(&sql, crate::db::params![])
            .map_err(|error| {
                format!("Could not restore an index or trigger for {table}: {error}")
            })?;
    }
    Ok(())
}

fn table_columns(
    transaction: &Transaction<'_>,
    quoted_table: &str,
    table: &str,
) -> Result<Vec<String>, String> {
    let mut statement = transaction
        .prepare(&format!("PRAGMA table_info({quoted_table})"))
        .map_err(|error| format!("Could not inspect columns for {table}: {error}"))?;
    let rows = statement
        .query_map(crate::db::params![], |row| row.get(1))
        .map_err(|error| format!("Could not inspect columns for {table}: {error}"))?;
    let columns = rows
        .collect::<Result<_, _>>()
        .map_err(|error| format!("Could not inspect columns for {table}: {error}"))?;
    Ok(columns)
}

/// Logical column type. SQLite keeps its historical affinities (booleans are stored in
/// TEXT columns); PostgreSQL uses integer columns for booleans so `flag = 0` works.
fn column_sql_type(kind: &str, postgres: bool) -> &'static str {
    match kind {
        "integer" | "bigInteger" | "foreignId" => "INTEGER",
        "decimal" | "float" => "REAL",
        "boolean" if postgres => "INTEGER",
        _ => "TEXT",
    }
}

fn added_column_declaration(name: &str, config: &Value, postgres: bool) -> Result<String, String> {
    let kind = config["type"].as_str().unwrap_or("string");
    let sql_type = column_sql_type(kind, postgres);
    let mut declaration = format!("{} {sql_type}", quote_identifier(name)?);
    if let Some(default) = config.get("default") {
        declaration.push_str(" DEFAULT ");
        declaration.push_str(&sql_literal(default, sql_type, postgres)?);
    }
    Ok(declaration)
}

fn column_declaration(
    name: &str,
    config: &Value,
    module_prefix: &str,
    tables: &HashSet<&str>,
    postgres: bool,
) -> Result<String, String> {
    let name = quote_identifier(name)?;
    let kind = config["type"].as_str().unwrap_or("string");
    let primary = config["primary"].as_bool() == Some(true);
    let auto_increment = config["autoIncrement"].as_bool() != Some(false);
    let sql_type = column_sql_type(kind, postgres);
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
        let (table, column) = resolved_foreign_reference(reference, module_prefix, tables)?;
        let action = foreign_key_action(config)?;
        if !postgres {
            declaration.push_str(&format!(
                " REFERENCES {}({})",
                quote_identifier(&table)?,
                quote_identifier(column)?
            ));
            declaration.push_str(" ON DELETE ");
            declaration.push_str(action);
        }
    }
    if let Some(default) = config.get("default") {
        declaration.push_str(" DEFAULT ");
        declaration.push_str(&sql_literal(default, sql_type, postgres)?);
    }
    Ok(declaration)
}

fn quote_identifier(identifier: &str) -> Result<String, String> {
    if !super::engine::is_identifier(identifier) {
        return Err(format!("Invalid SQLite identifier \"{identifier}\""));
    }
    Ok(format!("\"{identifier}\""))
}

fn sql_literal(value: &Value, sql_type: &str, postgres: bool) -> Result<String, String> {
    let quote_text = |text: String| format!("'{}'", text.replace('\'', "''"));
    match value {
        Value::String(value) => Ok(quote_text(value.clone())),
        // PostgreSQL refuses numeric defaults on TEXT columns; SQLite coerces them.
        Value::Number(value) if postgres && sql_type == "TEXT" => Ok(quote_text(value.to_string())),
        Value::Number(value) => Ok(value.to_string()),
        Value::Bool(value) if postgres && sql_type == "TEXT" => {
            Ok(quote_text(if *value { "1" } else { "0" }.to_owned()))
        }
        Value::Bool(value) => Ok(if *value { "1" } else { "0" }.to_owned()),
        Value::Null => Ok("NULL".to_owned()),
        _ => Err("Database default must be a scalar value".to_owned()),
    }
}
#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    #[test]
    fn database_driver_defaults_to_sqlite_and_accepts_postgres_aliases() {
        assert_eq!(DatabaseDriver::from_setting(None), DatabaseDriver::Sqlite);
        assert_eq!(
            DatabaseDriver::from_setting(Some("sqlite")),
            DatabaseDriver::Sqlite
        );
        assert_eq!(
            DatabaseDriver::from_setting(Some("pgsql")),
            DatabaseDriver::Postgres
        );
        for alias in ["postgres", "postgresql", "PgSQL", " pgsql "] {
            assert_eq!(
                DatabaseDriver::from_setting(Some(alias)),
                DatabaseDriver::Postgres
            );
        }
        assert_eq!(
            DatabaseDriver::from_setting(Some("mysql")),
            DatabaseDriver::Sqlite
        );
    }

    #[test]
    fn postgres_database_names_match_laravel_isolation_convention() {
        let config = DatabaseConfig {
            driver: DatabaseDriver::Postgres,
            prefix: "Pluff".to_owned(),
            host: "db.example".to_owned(),
            port: 5433,
            username: "pluff".to_owned(),
            password: "secret".to_owned(),
        };
        assert_eq!(
            config.postgres_database_name("todo-app").unwrap(),
            "pluff_todo_app"
        );
        assert!(config.postgres_database_name("bad/name").is_err());
        assert!(validate_pg_identifier("bad prefix").is_err());
    }

    #[test]
    fn postgres_schema_dialect_uses_serial_primary_keys() {
        assert_eq!(
            postgres_column_type("INTEGER PRIMARY KEY AUTOINCREMENT"),
            "BIGSERIAL PRIMARY KEY"
        );
        assert_eq!(
            postgres_column_type("INTEGER PRIMARY KEY"),
            "BIGINT PRIMARY KEY"
        );
        assert_eq!(postgres_column_type("TEXT NOT NULL"), "TEXT NOT NULL");
    }

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
            .query_map(crate::db::params![], |row| row.get(1))
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
            .execute(
                "INSERT INTO tasks (title) VALUES ('first')",
                crate::db::params![],
            )
            .unwrap();
        let done: i64 = connection
            .query_row("SELECT done FROM tasks", crate::db::params![], |row| {
                row.get(0)
            })
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
            .query_row(
                "SELECT COUNT(*) FROM inventories",
                crate::db::params![],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(count, 2);
        connection
            .execute(
                "INSERT INTO inventories (name, quantity) VALUES ('Temporary', 1)",
                crate::db::params![],
            )
            .unwrap();
        connection
            .execute(
                "INSERT INTO audit_logs (event) VALUES ('keep')",
                crate::db::params![],
            )
            .unwrap();
        drop(connection);

        apply_schema(directory.path(), "inventory", &payload).unwrap();
        let connection = Connection::open(directory.path().join("inventory.sqlite")).unwrap();
        let (count, highest_id): (i64, i64) = connection
            .query_row(
                "SELECT COUNT(*), MAX(id) FROM inventories",
                crate::db::params![],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();
        assert_eq!((count, highest_id), (2, 2));
        let preserved_logs: i64 = connection
            .query_row(
                "SELECT COUNT(*) FROM audit_logs",
                crate::db::params![],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(preserved_logs, 1);
        let created_at: String = connection
            .query_row(
                "SELECT created_at FROM inventories WHERE name = 'Keyboard'",
                crate::db::params![],
                |row| row.get(0),
            )
            .unwrap();
        assert!(!created_at.is_empty());
    }

    #[test]
    fn resolves_module_prefixed_foreign_keys_and_migrates_existing_tables() {
        let directory = tempfile::tempdir().unwrap();
        let path = directory.path().join("queue-flow.sqlite");
        let connection = Connection::open(&path).unwrap();
        connection
            .execute_batch(
                r#"
                PRAGMA foreign_keys = OFF;
                CREATE TABLE queues (id INTEGER PRIMARY KEY, name TEXT NOT NULL);
                INSERT INTO queues (id, name) VALUES (1, 'General');
                CREATE TABLE tickets (
                    id INTEGER PRIMARY KEY,
                    queue_id INTEGER NOT NULL REFERENCES queue_flow_queues(id) ON DELETE CASCADE,
                    ticket_number TEXT NOT NULL,
                    created_at TEXT,
                    updated_at TEXT
                );
                INSERT INTO tickets (id, queue_id, ticket_number) VALUES (7, 1, 'G-007');
                "#,
            )
            .unwrap();
        drop(connection);

        let payload = json!({
            "databases": [{
                "table": "queues",
                "columns": {"name": {"type": "string", "nullable": false}}
            }, {
                "table": "tickets",
                "columns": {
                    "queue_id": {
                        "type": "foreignId",
                        "foreign": "queue_flow_queues.id",
                        "nullable": false
                    },
                    "ticket_number": {"type": "string", "nullable": false}
                }
            }]
        });
        apply_schema(directory.path(), "queue-flow", &payload).unwrap();

        let connection = Connection::open(path).unwrap();
        connection.enable_foreign_keys(true).unwrap();
        let foreign_key: (String, String) = connection
            .query_row(
                "SELECT \"table\", \"from\" FROM pragma_foreign_key_list('tickets')",
                crate::db::params![],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();
        assert_eq!(foreign_key, ("queues".to_owned(), "queue_id".to_owned()));
        let ticket: (i64, String) = connection
            .query_row(
                "SELECT queue_id, ticket_number FROM tickets WHERE id = 7",
                crate::db::params![],
                |row| Ok((row.get(0)?, row.get(1)?)),
            )
            .unwrap();
        assert_eq!(ticket, (1, "G-007".to_owned()));
        connection
            .execute(
                "INSERT INTO tickets (queue_id, ticket_number) VALUES (1, 'G-008')",
                crate::db::params![],
            )
            .unwrap();
    }
}
