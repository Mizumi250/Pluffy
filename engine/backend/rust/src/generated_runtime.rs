use crate::db::{self, Connection};
use axum::http::StatusCode;
use serde_json::{json, Map, Value};
use std::{
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};

pub struct RequestContext {
    body: Value,
    path: String,
    query: String,
    user: Option<crate::auth::User>,
    database_dir: PathBuf,
}

impl RequestContext {
    pub fn new(
        body: Value,
        path: String,
        query: String,
        user: Option<crate::auth::User>,
        database_dir: PathBuf,
    ) -> Self {
        Self {
            body,
            path,
            query,
            user,
            database_dir,
        }
    }

    pub fn json_object(&self) -> Result<Map<String, Value>, HandlerError> {
        self.body
            .as_object()
            .cloned()
            .ok_or_else(|| HandlerError("Request body must be a JSON object".to_owned()))
    }

    pub fn body(&self) -> &Value {
        &self.body
    }

    pub fn path(&self) -> &str {
        &self.path
    }

    pub fn query(&self) -> &str {
        &self.query
    }

    pub fn user(&self) -> Option<&crate::auth::User> {
        self.user.as_ref()
    }

    pub fn database_dir(&self) -> &Path {
        &self.database_dir
    }
}

pub struct Database {
    connection: Connection,
}

impl Database {
    pub fn open(database_dir: &Path, module: &str) -> Result<Self, HandlerError> {
        let connection = db::open_module(database_dir, module).map_err(HandlerError)?;
        Ok(Self { connection })
    }

    pub fn query(&self, sql: &str) -> Result<Vec<Value>, HandlerError> {
        self.query_params(sql, Vec::new())
    }

    pub fn query_params(&self, sql: &str, params: Vec<Value>) -> Result<Vec<Value>, HandlerError> {
        let mut statement = self.connection.prepare(sql)?;
        let columns = statement
            .column_names()
            .into_iter()
            .map(str::to_owned)
            .collect::<Vec<_>>();
        let params = params.iter().map(json_to_sql_value).collect::<Vec<_>>();
        let rows = statement.query_map(db::params_from_iter(params), |row| {
            let mut value = Map::new();
            for (index, column) in columns.iter().enumerate() {
                let raw: db::types::Value = row.get(index)?;
                value.insert(column.clone(), sql_value_to_json(raw));
            }
            Ok(Value::Object(value))
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(HandlerError::from)
    }

    pub fn query_column(&self, sql: &str) -> Result<Vec<Value>, HandlerError> {
        self.query_column_params(sql, Vec::new())
    }

    pub fn query_column_params(
        &self,
        sql: &str,
        params: Vec<Value>,
    ) -> Result<Vec<Value>, HandlerError> {
        let mut statement = self.connection.prepare(sql)?;
        let params = params.iter().map(json_to_sql_value).collect::<Vec<_>>();
        let rows = statement.query_map(db::params_from_iter(params), |row| {
            let value: db::types::Value = row.get(0)?;
            Ok(sql_value_to_json(value))
        })?;
        rows.collect::<Result<Vec<_>, _>>()
            .map_err(HandlerError::from)
    }

    pub fn execute(&self, sql: &str, params: Vec<Value>) -> Result<usize, HandlerError> {
        let params = params.iter().map(json_to_sql_value).collect::<Vec<_>>();
        self.connection
            .execute(sql, db::params_from_iter(params))
            .map_err(HandlerError::from)
    }

    pub fn last_insert_rowid(&self) -> i64 {
        self.connection.last_insert_rowid()
    }

    pub fn query_row(&self, sql: &str) -> Result<(i64, i64, i64), HandlerError> {
        self.connection
            .query_row(sql, db::params![], |row| {
                Ok((
                    row.get::<_, Option<i64>>(0)?.unwrap_or_default(),
                    row.get::<_, Option<i64>>(1)?.unwrap_or_default(),
                    row.get::<_, Option<i64>>(2)?.unwrap_or_default(),
                ))
            })
            .map_err(HandlerError::from)
    }

    pub fn insert(&self, table: &str, values: Value) -> Result<Value, HandlerError> {
        if !crate::engine::is_identifier(table) {
            return Err(HandlerError(format!("Invalid table name: {table}")));
        }
        let fields = values
            .as_object()
            .ok_or_else(|| HandlerError("Insert values must be a JSON object".to_owned()))?;
        if fields.is_empty()
            || fields
                .keys()
                .any(|field| !crate::engine::is_identifier(field))
        {
            return Err(HandlerError("Invalid insert fields".to_owned()));
        }

        let columns = fields.keys().cloned().collect::<Vec<_>>();
        let placeholders = vec!["?"; columns.len()].join(", ");
        let quoted_columns = columns
            .iter()
            .map(|column| format!("\"{column}\""))
            .collect::<Vec<_>>()
            .join(", ");
        let sql_values = columns
            .iter()
            .map(|column| json_to_sql_value(&fields[column]))
            .collect::<Vec<_>>();
        self.connection.execute(
            &format!("INSERT INTO \"{table}\" ({quoted_columns}) VALUES ({placeholders})"),
            sql_values,
        )?;

        let id = self.connection.last_insert_rowid();
        self.connection
            .query_row(
                &format!("SELECT * FROM \"{table}\" WHERE id = ?"),
                [id],
                |row| {
                    let mut record = Map::new();
                    for column in row.column_names() {
                        let raw: db::types::Value = row.get(column)?;
                        record.insert(column.to_owned(), sql_value_to_json(raw));
                    }
                    Ok(Value::Object(record))
                },
            )
            .map_err(HandlerError::from)
    }
}

pub struct ResponseContext;

impl ResponseContext {
    pub fn json(
        &self,
        status: StatusCode,
        payload: Value,
    ) -> Result<HandlerResponse, HandlerError> {
        Ok(HandlerResponse { status, payload })
    }

    pub fn validation_error(&self, message: &str) -> Result<HandlerResponse, HandlerError> {
        self.json(
            StatusCode::UNPROCESSABLE_ENTITY,
            json!({"message": "Validation failed", "errors": [message]}),
        )
    }
}

pub struct HandlerResponse {
    pub status: StatusCode,
    pub payload: Value,
}

#[derive(Debug)]
pub struct HandlerError(pub String);

impl std::fmt::Display for HandlerError {
    fn fmt(&self, formatter: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        formatter.write_str(&self.0)
    }
}

impl std::error::Error for HandlerError {}

impl From<db::Error> for HandlerError {
    fn from(error: db::Error) -> Self {
        Self(error.to_string())
    }
}

impl From<serde_json::Error> for HandlerError {
    fn from(error: serde_json::Error) -> Self {
        Self(error.to_string())
    }
}

impl From<std::io::Error> for HandlerError {
    fn from(error: std::io::Error) -> Self {
        Self(error.to_string())
    }
}

pub struct ValidationError;

impl ValidationError {
    pub fn required(field: &str) -> HandlerError {
        HandlerError(format!("{field} is required"))
    }
}

pub fn utc_now_rfc3339() -> String {
    let seconds = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64;
    let days = seconds.div_euclid(86_400);
    let day_seconds = seconds.rem_euclid(86_400);
    let z = days + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    let year = year + i64::from(month <= 2);
    format!(
        "{year:04}-{month:02}-{day:02}T{:02}:{:02}:{:02}Z",
        day_seconds / 3_600,
        (day_seconds % 3_600) / 60,
        day_seconds % 60
    )
}

fn sql_value_to_json(value: db::types::Value) -> Value {
    match value {
        db::types::Value::Null => Value::Null,
        db::types::Value::Integer(value) => json!(value),
        db::types::Value::Real(value) => json!(value),
        db::types::Value::Text(value) => Value::String(value),
        db::types::Value::Blob(value) => json!(value),
    }
}

fn json_to_sql_value(value: &Value) -> db::types::Value {
    match value {
        Value::Null => db::types::Value::Null,
        Value::Bool(value) => db::types::Value::Integer(i64::from(*value)),
        Value::Number(value) => value
            .as_i64()
            .map(db::types::Value::Integer)
            .or_else(|| value.as_f64().map(db::types::Value::Real))
            .unwrap_or(db::types::Value::Null),
        Value::String(value) => db::types::Value::Text(value.clone()),
        Value::Array(_) | Value::Object(_) => db::types::Value::Text(value.to_string()),
    }
}
