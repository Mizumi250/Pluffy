//! Database abstraction used by every runtime module.
//!
//! The Rust backend historically talked to `rusqlite` directly. This module keeps the
//! same small, rusqlite-shaped API (`execute`, `query_row`, `prepare`, `query_map`,
//! `transaction`, `params!` ...) but dispatches to either SQLite or PostgreSQL
//! depending on `ARKZEN_DB_DRIVER`, so the engine code stays dialect-neutral.
//!
//! PostgreSQL specifics handled here:
//! * `?` / `?N` placeholders are rewritten to `$N`;
//! * a few SQLite-only SQL spellings are translated (`AUTOINCREMENT`, `INTEGER`,
//!   `CURRENT_TIMESTAMP`, `LIKE`, `INSERT OR IGNORE`, ...);
//! * parameters are sent in text format so PostgreSQL applies SQLite-like leniency
//!   (`'5'` into a bigint column, `1` into a text column, ...);
//! * `last_insert_rowid()` is emulated with `RETURNING "id"`.

use crate::database::{DatabaseConfig, DatabaseDriver};
use bytes::{BufMut, BytesMut};
use postgres::types::{Format, FromSql as PgFromSql, IsNull, ToSql as PgToSql, Type};
use std::cell::{Cell, RefCell};
use std::collections::HashMap;
use std::fmt;
use std::ops::Deref;
use std::path::Path;

// ---------------------------------------------------------------------------
// Values
// ---------------------------------------------------------------------------

#[derive(Clone, Debug, PartialEq)]
pub enum Value {
    Null,
    Integer(i64),
    Real(f64),
    Text(String),
    Blob(Vec<u8>),
}

#[derive(Clone, Copy, Debug, PartialEq)]
pub enum ValueRef<'a> {
    Null,
    Integer(i64),
    Real(f64),
    Text(&'a [u8]),
    Blob(&'a [u8]),
}

impl Value {
    fn as_ref(&self) -> ValueRef<'_> {
        match self {
            Value::Null => ValueRef::Null,
            Value::Integer(v) => ValueRef::Integer(*v),
            Value::Real(v) => ValueRef::Real(*v),
            Value::Text(v) => ValueRef::Text(v.as_bytes()),
            Value::Blob(v) => ValueRef::Blob(v),
        }
    }
}

pub mod types {
    pub use super::{Value, ValueRef};
}

// ---------------------------------------------------------------------------
// Errors
// ---------------------------------------------------------------------------

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
enum ErrorKind {
    NoRows,
    Constraint,
    Other,
}

#[derive(Clone, Debug)]
pub struct Error {
    message: String,
    kind: ErrorKind,
}

pub type Result<T> = std::result::Result<T, Error>;

impl Error {
    fn other(message: impl Into<String>) -> Self {
        Self {
            message: message.into(),
            kind: ErrorKind::Other,
        }
    }

    fn no_rows() -> Self {
        Self {
            message: "Query returned no rows".to_owned(),
            kind: ErrorKind::NoRows,
        }
    }

    /// True for unique / foreign key / not-null / check violations on either driver.
    pub fn is_constraint_violation(&self) -> bool {
        self.kind == ErrorKind::Constraint
    }

    pub fn is_no_rows(&self) -> bool {
        self.kind == ErrorKind::NoRows
    }
}

impl fmt::Display for Error {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        f.write_str(&self.message)
    }
}

impl std::error::Error for Error {}

impl From<rusqlite::Error> for Error {
    fn from(error: rusqlite::Error) -> Self {
        let kind = match &error {
            rusqlite::Error::QueryReturnedNoRows => ErrorKind::NoRows,
            rusqlite::Error::SqliteFailure(code, _)
                if code.code == rusqlite::ErrorCode::ConstraintViolation =>
            {
                ErrorKind::Constraint
            }
            _ => ErrorKind::Other,
        };
        Self {
            message: error.to_string(),
            kind,
        }
    }
}

impl From<postgres::Error> for Error {
    fn from(error: postgres::Error) -> Self {
        let kind = match error.code() {
            Some(state) if state.code().starts_with("23") => ErrorKind::Constraint,
            _ => ErrorKind::Other,
        };
        let message = match error.as_db_error() {
            Some(db) => db.message().to_owned(),
            None => error.to_string(),
        };
        Self { message, kind }
    }
}

pub trait OptionalExtension<T> {
    fn optional(self) -> Result<Option<T>>;
}

impl<T> OptionalExtension<T> for Result<T> {
    fn optional(self) -> Result<Option<T>> {
        match self {
            Ok(value) => Ok(Some(value)),
            Err(error) if error.is_no_rows() => Ok(None),
            Err(error) => Err(error),
        }
    }
}

// ---------------------------------------------------------------------------
// Parameters
// ---------------------------------------------------------------------------

pub trait ToSql {
    fn to_sql_value(&self) -> Value;
}

impl ToSql for Value {
    fn to_sql_value(&self) -> Value {
        self.clone()
    }
}
impl ToSql for i64 {
    fn to_sql_value(&self) -> Value {
        Value::Integer(*self)
    }
}
impl ToSql for i32 {
    fn to_sql_value(&self) -> Value {
        Value::Integer(i64::from(*self))
    }
}
impl ToSql for u32 {
    fn to_sql_value(&self) -> Value {
        Value::Integer(i64::from(*self))
    }
}
impl ToSql for u64 {
    fn to_sql_value(&self) -> Value {
        match i64::try_from(*self) {
            Ok(value) => Value::Integer(value),
            Err(_) => Value::Real(*self as f64),
        }
    }
}
impl ToSql for usize {
    fn to_sql_value(&self) -> Value {
        (*self as u64).to_sql_value()
    }
}
impl ToSql for f64 {
    fn to_sql_value(&self) -> Value {
        Value::Real(*self)
    }
}
impl ToSql for bool {
    fn to_sql_value(&self) -> Value {
        Value::Integer(i64::from(*self))
    }
}
impl ToSql for str {
    fn to_sql_value(&self) -> Value {
        Value::Text(self.to_owned())
    }
}
impl ToSql for String {
    fn to_sql_value(&self) -> Value {
        Value::Text(self.clone())
    }
}
impl<T: ToSql + ?Sized> ToSql for &T {
    fn to_sql_value(&self) -> Value {
        (**self).to_sql_value()
    }
}
impl<T: ToSql> ToSql for Option<T> {
    fn to_sql_value(&self) -> Value {
        match self {
            Some(value) => value.to_sql_value(),
            None => Value::Null,
        }
    }
}

pub trait Params {
    fn into_values(self) -> Vec<Value>;
}

impl<T: ToSql, const N: usize> Params for [T; N] {
    fn into_values(self) -> Vec<Value> {
        self.iter().map(ToSql::to_sql_value).collect()
    }
}
impl<T: ToSql, const N: usize> Params for &[T; N] {
    fn into_values(self) -> Vec<Value> {
        self.iter().map(ToSql::to_sql_value).collect()
    }
}
impl<T: ToSql> Params for &[T] {
    fn into_values(self) -> Vec<Value> {
        self.iter().map(ToSql::to_sql_value).collect()
    }
}
impl<T: ToSql> Params for Vec<T> {
    fn into_values(self) -> Vec<Value> {
        self.iter().map(ToSql::to_sql_value).collect()
    }
}

pub struct ParamsFromIter<I>(I);

pub fn params_from_iter<I>(iter: I) -> ParamsFromIter<I>
where
    I: IntoIterator,
    I::Item: ToSql,
{
    ParamsFromIter(iter)
}

impl<I> Params for ParamsFromIter<I>
where
    I: IntoIterator,
    I::Item: ToSql,
{
    fn into_values(self) -> Vec<Value> {
        self.0.into_iter().map(|item| item.to_sql_value()).collect()
    }
}

#[macro_export]
macro_rules! params {
    () => {
        &[] as &[&dyn $crate::db::ToSql; 0]
    };
    ($($param:expr),+ $(,)?) => {
        &[$(&$param as &dyn $crate::db::ToSql),+]
    };
}
#[allow(unused_imports)]
pub use params;

// ---------------------------------------------------------------------------
// Rows
// ---------------------------------------------------------------------------

pub trait FromSql: Sized {
    fn column_value(value: ValueRef<'_>) -> Result<Self>;
}

fn type_error(expected: &str, value: ValueRef<'_>) -> Error {
    Error::other(format!(
        "Invalid column type {value:?}, expected {expected}"
    ))
}

impl FromSql for i64 {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        match value {
            ValueRef::Integer(v) => Ok(v),
            ValueRef::Text(v) => std::str::from_utf8(v)
                .ok()
                .and_then(|text| text.trim().parse().ok())
                .ok_or_else(|| type_error("integer", value)),
            _ => Err(type_error("integer", value)),
        }
    }
}
impl FromSql for i32 {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        i32::try_from(i64::column_value(value)?).map_err(|_| type_error("i32", value))
    }
}
impl FromSql for u32 {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        u32::try_from(i64::column_value(value)?).map_err(|_| type_error("u32", value))
    }
}
impl FromSql for u64 {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        u64::try_from(i64::column_value(value)?).map_err(|_| type_error("u64", value))
    }
}
impl FromSql for usize {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        usize::try_from(i64::column_value(value)?).map_err(|_| type_error("usize", value))
    }
}
impl FromSql for f64 {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        match value {
            ValueRef::Real(v) => Ok(v),
            ValueRef::Integer(v) => Ok(v as f64),
            _ => Err(type_error("real", value)),
        }
    }
}
impl FromSql for bool {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        match value {
            ValueRef::Integer(v) => Ok(v != 0),
            ValueRef::Text(b"1") | ValueRef::Text(b"true") | ValueRef::Text(b"t") => Ok(true),
            ValueRef::Text(b"0") | ValueRef::Text(b"false") | ValueRef::Text(b"f") => Ok(false),
            _ => Err(type_error("bool", value)),
        }
    }
}
impl FromSql for String {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        match value {
            ValueRef::Text(v) => Ok(String::from_utf8_lossy(v).into_owned()),
            _ => Err(type_error("text", value)),
        }
    }
}
impl FromSql for Value {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        Ok(match value {
            ValueRef::Null => Value::Null,
            ValueRef::Integer(v) => Value::Integer(v),
            ValueRef::Real(v) => Value::Real(v),
            ValueRef::Text(v) => Value::Text(String::from_utf8_lossy(v).into_owned()),
            ValueRef::Blob(v) => Value::Blob(v.to_vec()),
        })
    }
}
impl<T: FromSql> FromSql for Option<T> {
    fn column_value(value: ValueRef<'_>) -> Result<Self> {
        match value {
            ValueRef::Null => Ok(None),
            other => T::column_value(other).map(Some),
        }
    }
}

pub trait RowIndex {
    fn position(&self, columns: &[String]) -> Result<usize>;
}

impl RowIndex for usize {
    fn position(&self, _: &[String]) -> Result<usize> {
        Ok(*self)
    }
}

impl RowIndex for &str {
    fn position(&self, columns: &[String]) -> Result<usize> {
        columns
            .iter()
            .position(|name| name == self)
            .ok_or_else(|| Error::other(format!("Invalid column name: {self}")))
    }
}

/// A fully materialised result row.
#[derive(Clone, Debug)]
pub struct Row {
    columns: std::rc::Rc<Vec<String>>,
    values: Vec<Value>,
}

impl Row {
    pub fn get<I: RowIndex, T: FromSql>(&self, index: I) -> Result<T> {
        T::column_value(self.get_ref(index)?)
    }

    pub fn get_ref<I: RowIndex>(&self, index: I) -> Result<ValueRef<'_>> {
        let position = index.position(&self.columns)?;
        self.values
            .get(position)
            .map(Value::as_ref)
            .ok_or_else(|| Error::other(format!("Column index {position} out of range")))
    }

    pub fn column_names(&self) -> Vec<&str> {
        self.columns.iter().map(String::as_str).collect()
    }
}

impl AsRef<Row> for Row {
    fn as_ref(&self) -> &Row {
        self
    }
}

pub struct Rows {
    rows: Vec<Row>,
    position: usize,
}

impl Rows {
    #[allow(clippy::should_implement_trait)]
    pub fn next(&mut self) -> Result<Option<&Row>> {
        let row = self.rows.get(self.position);
        if row.is_some() {
            self.position += 1;
        }
        Ok(row)
    }
}

pub struct Statement<'c> {
    connection: &'c Connection,
    sql: String,
    columns: std::rc::Rc<Vec<String>>,
}

impl Statement<'_> {
    pub fn column_names(&self) -> Vec<&str> {
        self.columns.iter().map(String::as_str).collect()
    }

    pub fn query<P: Params>(&mut self, params: P) -> Result<Rows> {
        let rows = self.connection.fetch(&self.sql, &params.into_values())?;
        Ok(Rows { rows, position: 0 })
    }

    pub fn query_map<T, P, F>(
        &mut self,
        params: P,
        mut mapper: F,
    ) -> Result<std::vec::IntoIter<Result<T>>>
    where
        P: Params,
        F: FnMut(&Row) -> Result<T>,
    {
        let rows = self.connection.fetch(&self.sql, &params.into_values())?;
        Ok(rows.iter().map(&mut mapper).collect::<Vec<_>>().into_iter())
    }

    pub fn execute<P: Params>(&mut self, params: P) -> Result<usize> {
        self.connection.run(&self.sql, &params.into_values())
    }
}

// ---------------------------------------------------------------------------
// Connection
// ---------------------------------------------------------------------------

enum Inner {
    Sqlite(rusqlite::Connection),
    Postgres(RefCell<postgres::Client>),
}

pub struct Connection {
    inner: Inner,
    last_insert_id: Cell<i64>,
    serial_tables: RefCell<HashMap<String, bool>>,
}

#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ForeignKey {
    pub constraint: String,
    pub column: String,
    pub target_table: String,
    pub target_column: String,
}

impl Connection {
    pub fn driver(&self) -> DatabaseDriver {
        match self.inner {
            Inner::Sqlite(_) => DatabaseDriver::Sqlite,
            Inner::Postgres(_) => DatabaseDriver::Postgres,
        }
    }

    pub fn is_postgres(&self) -> bool {
        self.driver() == DatabaseDriver::Postgres
    }

    fn new(inner: Inner) -> Self {
        Self {
            inner,
            last_insert_id: Cell::new(0),
            serial_tables: RefCell::new(HashMap::new()),
        }
    }

    /// Opens a standalone SQLite file (used by SQLite-only helpers and tests).
    pub fn open(path: impl AsRef<Path>) -> Result<Self> {
        let connection = rusqlite::Connection::open(path.as_ref())?;
        connection.busy_timeout(std::time::Duration::from_secs(5))?;
        connection.pragma_update(None, "foreign_keys", "ON")?;
        Ok(Self::new(Inner::Sqlite(connection)))
    }

    fn open_postgres(config: &DatabaseConfig, database: &str) -> Result<Self> {
        let client = pg_client(config, database)?;
        Ok(Self::new(Inner::Postgres(RefCell::new(client))))
    }

    /// Escape hatch for SQLite-only code paths (schema migrations, tests).
    pub fn sqlite(&self) -> Option<&rusqlite::Connection> {
        match &self.inner {
            Inner::Sqlite(connection) => Some(connection),
            Inner::Postgres(_) => None,
        }
    }

    pub fn last_insert_rowid(&self) -> i64 {
        match &self.inner {
            Inner::Sqlite(connection) => connection.last_insert_rowid(),
            Inner::Postgres(_) => self.last_insert_id.get(),
        }
    }

    pub fn execute<P: Params>(&self, sql: &str, params: P) -> Result<usize> {
        self.run(sql, &params.into_values())
    }

    pub fn execute_batch(&self, sql: &str) -> Result<()> {
        match &self.inner {
            Inner::Sqlite(connection) => Ok(connection.execute_batch(sql)?),
            Inner::Postgres(client) => {
                let translated = translate_postgres(sql);
                Ok(client.borrow_mut().batch_execute(&translated)?)
            }
        }
    }

    pub fn query_row<T, P, F>(&self, sql: &str, params: P, mapper: F) -> Result<T>
    where
        P: Params,
        F: FnOnce(&Row) -> Result<T>,
    {
        let rows = self.fetch(sql, &params.into_values())?;
        match rows.first() {
            Some(row) => mapper(row),
            None => Err(Error::no_rows()),
        }
    }

    pub fn prepare(&self, sql: &str) -> Result<Statement<'_>> {
        let columns = match &self.inner {
            Inner::Sqlite(connection) => {
                let statement = connection.prepare(sql)?;
                statement
                    .column_names()
                    .iter()
                    .map(|name| (*name).to_owned())
                    .collect()
            }
            Inner::Postgres(client) => {
                let translated = translate_postgres(sql);
                let statement = client.borrow_mut().prepare(&translated)?;
                statement
                    .columns()
                    .iter()
                    .map(|column| column.name().to_owned())
                    .collect()
            }
        };
        Ok(Statement {
            connection: self,
            sql: sql.to_owned(),
            columns: std::rc::Rc::new(columns),
        })
    }

    pub fn transaction(&self) -> Result<Transaction<'_>> {
        self.execute_batch("BEGIN")?;
        Ok(Transaction {
            connection: self,
            finished: Cell::new(false),
        })
    }

    pub fn unchecked_transaction(&self) -> Result<Transaction<'_>> {
        self.transaction()
    }

    /// SQLite enforces foreign keys per connection; PostgreSQL always does.
    pub fn enable_foreign_keys(&self, enabled: bool) -> Result<()> {
        match &self.inner {
            Inner::Sqlite(connection) => Ok(connection.pragma_update(
                None,
                "foreign_keys",
                if enabled { "ON" } else { "OFF" },
            )?),
            Inner::Postgres(_) => Ok(()),
        }
    }

    // ----- dialect-neutral introspection -----------------------------------

    pub fn table_exists(&self, table: &str) -> bool {
        let sql = match self.driver() {
            DatabaseDriver::Sqlite => {
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1"
            }
            DatabaseDriver::Postgres => {
                "SELECT 1 FROM information_schema.tables \
                 WHERE table_schema = current_schema() AND table_name = ?1"
            }
        };
        self.query_row(sql, [table], |_| Ok(())).is_ok()
    }

    pub fn table_columns(&self, table: &str) -> Result<Vec<String>> {
        match self.driver() {
            DatabaseDriver::Sqlite => {
                let mut statement = self.prepare(&format!(
                    "PRAGMA table_info(\"{}\")",
                    table.replace('"', "\"\"")
                ))?;
                statement
                    .query_map(params![], |row| row.get::<_, String>(1))?
                    .collect()
            }
            DatabaseDriver::Postgres => {
                let mut statement = self.prepare(
                    "SELECT column_name FROM information_schema.columns \
                     WHERE table_schema = current_schema() AND table_name = ?1 \
                     ORDER BY ordinal_position",
                )?;
                statement
                    .query_map([table], |row| row.get::<_, String>(0))?
                    .collect()
            }
        }
    }

    pub fn has_column(&self, table: &str, column: &str) -> Result<bool> {
        Ok(self.table_columns(table)?.iter().any(|name| name == column))
    }

    /// Foreign keys declared on `table` (PostgreSQL only; SQLite uses PRAGMAs directly).
    pub fn postgres_foreign_keys(&self, table: &str) -> Result<Vec<ForeignKey>> {
        let mut statement = self.prepare(
            "SELECT con.conname, att.attname, ref.relname, refatt.attname \
             FROM pg_constraint con \
             JOIN pg_class rel ON rel.oid = con.conrelid \
             JOIN pg_namespace ns ON ns.oid = rel.relnamespace \
             JOIN pg_class ref ON ref.oid = con.confrelid \
             JOIN LATERAL unnest(con.conkey, con.confkey) AS k(local_key, ref_key) ON true \
             JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = k.local_key \
             JOIN pg_attribute refatt ON refatt.attrelid = con.confrelid AND refatt.attnum = k.ref_key \
             WHERE con.contype = 'f' AND ns.nspname = current_schema() AND rel.relname = ?1",
        )?;
        statement
            .query_map([table], |row| {
                Ok(ForeignKey {
                    constraint: row.get(0)?,
                    column: row.get(1)?,
                    target_table: row.get(2)?,
                    target_column: row.get(3)?,
                })
            })?
            .collect()
    }

    /// UTC timestamp formatted like `2026-01-02T03:04:05.678Z`.
    pub fn now_iso(&self) -> Result<String> {
        let sql = match self.driver() {
            DatabaseDriver::Sqlite => "SELECT strftime('%Y-%m-%dT%H:%M:%fZ','now')",
            DatabaseDriver::Postgres => {
                "SELECT to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS.MS\"Z\"')"
            }
        };
        self.query_row(sql, params![], |row| row.get(0))
    }

    // ----- execution --------------------------------------------------------

    fn run(&self, sql: &str, values: &[Value]) -> Result<usize> {
        match &self.inner {
            Inner::Sqlite(connection) => {
                let params = rusqlite::params_from_iter(values.iter().map(to_rusqlite));
                Ok(connection.prepare_cached(sql)?.execute(params)?)
            }
            Inner::Postgres(client) => {
                let translated = translate_postgres(sql);
                let params: Vec<PgParam<'_>> = values.iter().map(PgParam).collect();
                let refs: Vec<&(dyn PgToSql + Sync)> =
                    params.iter().map(|p| p as &(dyn PgToSql + Sync)).collect();
                if let Some(table) = self.insert_target_with_serial_id(&translated) {
                    let returning = format!("{translated} RETURNING \"id\"");
                    let rows = client.borrow_mut().query(returning.as_str(), &refs)?;
                    if let Some(row) = rows.last() {
                        if let Ok(Some(id)) = row.try_get::<_, Option<i64>>(0) {
                            self.last_insert_id.set(id);
                        }
                    }
                    let _ = table;
                    return Ok(rows.len());
                }
                Ok(client.borrow_mut().execute(translated.as_str(), &refs)? as usize)
            }
        }
    }

    fn fetch(&self, sql: &str, values: &[Value]) -> Result<Vec<Row>> {
        match &self.inner {
            Inner::Sqlite(connection) => {
                let mut statement = connection.prepare_cached(sql)?;
                let columns = std::rc::Rc::new(
                    statement
                        .column_names()
                        .iter()
                        .map(|name| (*name).to_owned())
                        .collect::<Vec<_>>(),
                );
                let params = rusqlite::params_from_iter(values.iter().map(to_rusqlite));
                let mut rows = statement.query(params)?;
                let mut output = Vec::new();
                while let Some(row) = rows.next()? {
                    let mut cells = Vec::with_capacity(columns.len());
                    for index in 0..columns.len() {
                        cells.push(match row.get_ref(index)? {
                            rusqlite::types::ValueRef::Null => Value::Null,
                            rusqlite::types::ValueRef::Integer(v) => Value::Integer(v),
                            rusqlite::types::ValueRef::Real(v) => Value::Real(v),
                            rusqlite::types::ValueRef::Text(v) => {
                                Value::Text(String::from_utf8_lossy(v).into_owned())
                            }
                            rusqlite::types::ValueRef::Blob(v) => Value::Blob(v.to_vec()),
                        });
                    }
                    output.push(Row {
                        columns: columns.clone(),
                        values: cells,
                    });
                }
                Ok(output)
            }
            Inner::Postgres(client) => {
                let translated = translate_postgres(sql);
                let params: Vec<PgParam<'_>> = values.iter().map(PgParam).collect();
                let refs: Vec<&(dyn PgToSql + Sync)> =
                    params.iter().map(|p| p as &(dyn PgToSql + Sync)).collect();
                let rows = client.borrow_mut().query(translated.as_str(), &refs)?;
                let mut output = Vec::with_capacity(rows.len());
                let mut columns: Option<std::rc::Rc<Vec<String>>> = None;
                for row in &rows {
                    let names = columns.get_or_insert_with(|| {
                        std::rc::Rc::new(
                            row.columns()
                                .iter()
                                .map(|column| column.name().to_owned())
                                .collect(),
                        )
                    });
                    let mut cells = Vec::with_capacity(row.len());
                    for index in 0..row.len() {
                        cells.push(pg_value(row, index)?);
                    }
                    output.push(Row {
                        columns: names.clone(),
                        values: cells,
                    });
                }
                Ok(output)
            }
        }
    }

    /// Returns the table of an `INSERT` whose table has an integer `id` column, which
    /// lets `execute` capture `last_insert_rowid()` through `RETURNING "id"`.
    fn insert_target_with_serial_id(&self, sql: &str) -> Option<String> {
        let table = insert_table(sql)?;
        if contains_keyword(sql, "RETURNING") {
            return None;
        }
        if let Some(known) = self.serial_tables.borrow().get(&table) {
            return known.then(|| table.clone());
        }
        let has_id = self
            .query_row(
                "SELECT 1 FROM information_schema.columns \
                 WHERE table_schema = current_schema() AND table_name = ?1 \
                 AND column_name = 'id' AND data_type IN ('bigint', 'integer', 'smallint')",
                [table.as_str()],
                |_| Ok(()),
            )
            .is_ok();
        self.serial_tables
            .borrow_mut()
            .insert(table.clone(), has_id);
        has_id.then_some(table)
    }
}

fn to_rusqlite(value: &Value) -> rusqlite::types::Value {
    match value {
        Value::Null => rusqlite::types::Value::Null,
        Value::Integer(v) => rusqlite::types::Value::Integer(*v),
        Value::Real(v) => rusqlite::types::Value::Real(*v),
        Value::Text(v) => rusqlite::types::Value::Text(v.clone()),
        Value::Blob(v) => rusqlite::types::Value::Blob(v.clone()),
    }
}

pub struct Transaction<'a> {
    connection: &'a Connection,
    finished: Cell<bool>,
}

impl Transaction<'_> {
    pub fn commit(self) -> Result<()> {
        self.finished.set(true);
        self.connection.execute_batch("COMMIT")
    }

    pub fn rollback(self) -> Result<()> {
        self.finished.set(true);
        self.connection.execute_batch("ROLLBACK")
    }
}

impl Deref for Transaction<'_> {
    type Target = Connection;
    fn deref(&self) -> &Connection {
        self.connection
    }
}

impl Drop for Transaction<'_> {
    fn drop(&mut self) {
        if !self.finished.get() {
            let _ = self.connection.execute_batch("ROLLBACK");
        }
    }
}

// ---------------------------------------------------------------------------
// Opening / creating / dropping module databases
// ---------------------------------------------------------------------------

fn sqlite_path(database_dir: &Path, slug: &str) -> std::path::PathBuf {
    database_dir.join(format!("{slug}.sqlite"))
}

/// Opens the isolated database of tatemono `slug` using the configured driver.
pub fn open_module(database_dir: &Path, slug: &str) -> std::result::Result<Connection, String> {
    let config = DatabaseConfig::from_env()?;
    match config.driver {
        DatabaseDriver::Sqlite => {
            let path = sqlite_path(database_dir, slug);
            Connection::open(&path).map_err(|error| {
                format!(
                    "Could not open isolated database {}: {error}",
                    path.display()
                )
            })
        }
        DatabaseDriver::Postgres => {
            let name = config.postgres_database_name(slug)?;
            Connection::open_postgres(&config, &name)
                .map_err(|error| format!("Could not open PostgreSQL database {name}: {error}"))
        }
    }
}

/// Makes sure the isolated database exists (creating the PostgreSQL database if needed)
/// and returns a human readable location for build logs.
pub fn ensure_module_database(
    database_dir: &Path,
    slug: &str,
) -> std::result::Result<(Connection, String), String> {
    let config = DatabaseConfig::from_env()?;
    match config.driver {
        DatabaseDriver::Sqlite => {
            std::fs::create_dir_all(database_dir).map_err(|error| {
                format!("Could not create isolated database directory: {error}")
            })?;
            let path = sqlite_path(database_dir, slug);
            let connection = open_module(database_dir, slug)?;
            Ok((connection, path.display().to_string()))
        }
        DatabaseDriver::Postgres => {
            let name = config.postgres_database_name(slug)?;
            let mut admin = pg_client(&config, "postgres").map_err(|error| {
                format!("Could not connect to PostgreSQL to create {name}: {error}")
            })?;
            let exists = admin
                .query_opt("SELECT 1 FROM pg_database WHERE datname = $1", &[&name])
                .map_err(|error| format!("Could not look up PostgreSQL database {name}: {error}"))?
                .is_some();
            if !exists {
                admin
                    .batch_execute(&format!("CREATE DATABASE {}", pg_quote(&name)))
                    .map_err(|error| {
                        format!("Could not create PostgreSQL database {name}: {error}")
                    })?;
            }
            drop(admin);
            let connection = open_module(database_dir, slug)?;
            Ok((
                connection,
                format!("postgresql://{}:{}/{name}", config.host, config.port),
            ))
        }
    }
}

/// Deletes the isolated database of `slug` (SQLite file or PostgreSQL database).
pub fn remove_module_database(database_dir: &Path, slug: &str) -> std::result::Result<(), String> {
    let config = DatabaseConfig::from_env()?;
    match config.driver {
        DatabaseDriver::Sqlite => {
            for suffix in ["", "-wal", "-shm", "-journal"] {
                let path = database_dir.join(format!("{slug}.sqlite{suffix}"));
                match std::fs::remove_file(&path) {
                    Ok(()) => {}
                    Err(error) if error.kind() == std::io::ErrorKind::NotFound => {}
                    Err(error) => return Err(error.to_string()),
                }
            }
            Ok(())
        }
        DatabaseDriver::Postgres => {
            let name = config.postgres_database_name(slug)?;
            let mut admin = pg_client(&config, "postgres")
                .map_err(|error| format!("Could not connect to PostgreSQL: {error}"))?;
            admin
                .execute(
                    "SELECT pg_terminate_backend(pid) FROM pg_stat_activity \
                     WHERE datname = $1 AND pid <> pg_backend_pid()",
                    &[&name],
                )
                .map_err(|error| error.to_string())?;
            admin
                .batch_execute(&format!("DROP DATABASE IF EXISTS {}", pg_quote(&name)))
                .map_err(|error| error.to_string())
        }
    }
}

fn pg_quote(name: &str) -> String {
    format!("\"{}\"", name.replace('"', "\"\""))
}

fn pg_client(
    config: &DatabaseConfig,
    database: &str,
) -> std::result::Result<postgres::Client, Error> {
    let mut builder = postgres::Config::new();
    builder
        .host(&config.host)
        .port(config.port)
        .dbname(database)
        .connect_timeout(std::time::Duration::from_secs(10));
    if !config.username.is_empty() {
        builder.user(&config.username);
    } else {
        builder.user("postgres");
    }
    if !config.password.is_empty() {
        builder.password(&config.password);
    }
    let mode = std::env::var("DB_SSLMODE")
        .unwrap_or_default()
        .to_ascii_lowercase();
    builder.ssl_mode(match mode.as_str() {
        "disable" => postgres::config::SslMode::Disable,
        "require" | "verify-ca" | "verify-full" => postgres::config::SslMode::Require,
        _ => postgres::config::SslMode::Prefer,
    });
    let mut client = builder.connect(postgres::NoTls)?;
    client.batch_execute("SET standard_conforming_strings = on; SET TIME ZONE 'UTC'")?;
    Ok(client)
}

// ---------------------------------------------------------------------------
// PostgreSQL parameter / value codecs
// ---------------------------------------------------------------------------

/// Sends every parameter in PostgreSQL *text* format so the server converts it to
/// whatever type the statement expects, mirroring SQLite's flexible typing.
#[derive(Debug)]
struct PgParam<'a>(&'a Value);

impl PgToSql for PgParam<'_> {
    fn to_sql(
        &self,
        ty: &Type,
        out: &mut BytesMut,
    ) -> std::result::Result<IsNull, Box<dyn std::error::Error + Sync + Send>> {
        match self.0 {
            Value::Null => return Ok(IsNull::Yes),
            Value::Integer(v) => out.put_slice(v.to_string().as_bytes()),
            Value::Real(v) => {
                let text = if v.is_nan() {
                    "NaN".to_owned()
                } else if v.is_infinite() {
                    if *v > 0.0 { "Infinity" } else { "-Infinity" }.to_owned()
                } else {
                    v.to_string()
                };
                out.put_slice(text.as_bytes());
            }
            Value::Text(v) => {
                if v.contains('\0') {
                    return Err("PostgreSQL text values cannot contain NUL bytes".into());
                }
                out.put_slice(v.as_bytes());
            }
            Value::Blob(v) => {
                if *ty == Type::BYTEA {
                    out.put_slice(b"\\x");
                    for byte in v {
                        out.put_slice(format!("{byte:02x}").as_bytes());
                    }
                } else {
                    out.put_slice(String::from_utf8_lossy(v).as_bytes());
                }
            }
        }
        Ok(IsNull::No)
    }

    fn accepts(_: &Type) -> bool {
        true
    }

    fn encode_format(&self, _ty: &Type) -> Format {
        Format::Text
    }

    postgres::types::to_sql_checked!();
}

struct RawColumn(Vec<u8>);

impl<'a> PgFromSql<'a> for RawColumn {
    fn from_sql(
        _: &Type,
        raw: &'a [u8],
    ) -> std::result::Result<Self, Box<dyn std::error::Error + Sync + Send>> {
        Ok(Self(raw.to_vec()))
    }

    fn accepts(_: &Type) -> bool {
        true
    }
}

fn pg_value(row: &postgres::Row, index: usize) -> Result<Value> {
    let ty = row.columns()[index].type_().clone();
    let Some(raw) = row.try_get::<_, Option<RawColumn>>(index)? else {
        return Ok(Value::Null);
    };
    let raw = raw.0;
    let array = |size: usize| -> Result<&[u8]> {
        raw.get(..size)
            .ok_or_else(|| Error::other(format!("Malformed PostgreSQL {} value", ty.name())))
    };
    Ok(match ty {
        Type::BOOL => Value::Integer(i64::from(array(1)?[0] != 0)),
        Type::INT2 => Value::Integer(i64::from(i16::from_be_bytes(array(2)?.try_into().unwrap()))),
        Type::INT4 => Value::Integer(i64::from(i32::from_be_bytes(array(4)?.try_into().unwrap()))),
        Type::INT8 => Value::Integer(i64::from_be_bytes(array(8)?.try_into().unwrap())),
        Type::OID => Value::Integer(i64::from(u32::from_be_bytes(array(4)?.try_into().unwrap()))),
        Type::FLOAT4 => Value::Real(f64::from(f32::from_be_bytes(array(4)?.try_into().unwrap()))),
        Type::FLOAT8 => Value::Real(f64::from_be_bytes(array(8)?.try_into().unwrap())),
        Type::BYTEA => Value::Blob(raw),
        Type::NUMERIC => decode_numeric(&raw)?,
        Type::DATE => {
            let days = i32::from_be_bytes(array(4)?.try_into().unwrap());
            Value::Text(format_date(i64::from(days) + 10_957))
        }
        Type::TIMESTAMP | Type::TIMESTAMPTZ => {
            let micros = i64::from_be_bytes(array(8)?.try_into().unwrap());
            Value::Text(format_timestamp(micros, ty == Type::TIMESTAMPTZ))
        }
        Type::JSONB => {
            Value::Text(String::from_utf8_lossy(raw.get(1..).unwrap_or_default()).into_owned())
        }
        Type::UUID => {
            let hex: String = array(16)?
                .iter()
                .map(|byte| format!("{byte:02x}"))
                .collect();
            Value::Text(format!(
                "{}-{}-{}-{}-{}",
                &hex[0..8],
                &hex[8..12],
                &hex[12..16],
                &hex[16..20],
                &hex[20..32]
            ))
        }
        // text, varchar, bpchar, name, json, char, unknown ... are plain UTF-8 on the wire
        _ => Value::Text(String::from_utf8_lossy(&raw).into_owned()),
    })
}

fn decode_numeric(raw: &[u8]) -> Result<Value> {
    if raw.len() < 8 {
        return Err(Error::other("Malformed PostgreSQL numeric value"));
    }
    let digits = i16::from_be_bytes([raw[0], raw[1]]) as usize;
    let weight = i16::from_be_bytes([raw[2], raw[3]]) as i32;
    let sign = u16::from_be_bytes([raw[4], raw[5]]);
    let scale = u16::from_be_bytes([raw[6], raw[7]]) as usize;
    if sign == 0xC000 {
        return Ok(Value::Real(f64::NAN));
    }
    let mut groups = Vec::with_capacity(digits);
    for index in 0..digits {
        let at = 8 + index * 2;
        let pair = raw
            .get(at..at + 2)
            .ok_or_else(|| Error::other("Malformed PostgreSQL numeric value"))?;
        groups.push(i16::from_be_bytes([pair[0], pair[1]]));
    }
    let mut integer = String::new();
    for position in 0..=weight.max(0) {
        let group = if weight >= 0 {
            groups.get(position as usize).copied().unwrap_or(0)
        } else {
            0
        };
        if integer.is_empty() {
            integer.push_str(&group.to_string());
        } else {
            integer.push_str(&format!("{group:04}"));
        }
    }
    if integer.is_empty() {
        integer.push('0');
    }
    let mut fraction = String::new();
    // groups after the integer part, with leading zero groups when weight < -1
    let mut index = (weight + 1).max(0) as usize;
    for _ in 0..(-(weight + 1)).max(0) {
        fraction.push_str("0000");
    }
    while index < groups.len() {
        fraction.push_str(&format!("{:04}", groups[index]));
        index += 1;
    }
    fraction.truncate(scale);
    while fraction.len() < scale {
        fraction.push('0');
    }
    let negative = sign == 0x4000;
    let text = if scale == 0 {
        format!("{}{integer}", if negative { "-" } else { "" })
    } else {
        format!("{}{integer}.{fraction}", if negative { "-" } else { "" })
    };
    if scale == 0 {
        if let Ok(value) = text.parse::<i64>() {
            return Ok(Value::Integer(value));
        }
    }
    text.parse::<f64>()
        .map(Value::Real)
        .map_err(|_| Error::other("Malformed PostgreSQL numeric value"))
}

fn format_date(days_since_epoch: i64) -> String {
    let z = days_since_epoch + 719_468;
    let era = z.div_euclid(146_097);
    let doe = z.rem_euclid(146_097);
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = if mp < 10 { mp + 3 } else { mp - 9 };
    let year = if month <= 2 { year + 1 } else { year };
    format!("{year:04}-{month:02}-{day:02}")
}

fn format_timestamp(micros_since_2000: i64, with_zone: bool) -> String {
    let micros = micros_since_2000 + 10_957 * 86_400 * 1_000_000;
    let days = micros.div_euclid(86_400 * 1_000_000);
    let rest = micros.rem_euclid(86_400 * 1_000_000);
    let seconds = rest / 1_000_000;
    let fraction = rest % 1_000_000;
    let mut text = format!(
        "{} {:02}:{:02}:{:02}",
        format_date(days),
        seconds / 3_600,
        (seconds % 3_600) / 60,
        seconds % 60
    );
    if fraction != 0 {
        text.push_str(format!(".{fraction:06}").trim_end_matches('0'));
    }
    if with_zone {
        text.push_str("+00");
    }
    text
}

// ---------------------------------------------------------------------------
// SQL translation (SQLite spelling -> PostgreSQL)
// ---------------------------------------------------------------------------

const POSTGRES_NOW: &str = "to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD HH24:MI:SS')";

/// Rewrites the handful of SQLite-only spellings the engine emits.
pub fn translate_postgres(sql: &str) -> String {
    let bytes = sql.as_bytes();
    let mut output = String::with_capacity(sql.len() + 16);
    let mut index = 0;
    // SQLite numbers a bare `?` one above the highest parameter number seen so far.
    let mut highest_parameter = 0usize;
    let mut insert_or_ignore = false;
    while index < bytes.len() {
        let byte = bytes[index];
        match byte {
            b'\'' | b'"' => {
                // quoted string / identifier, copied verbatim ('' and "" escapes included)
                let quote = byte;
                let start = index;
                index += 1;
                while index < bytes.len() {
                    if bytes[index] == quote {
                        if bytes.get(index + 1) == Some(&quote) {
                            index += 2;
                            continue;
                        }
                        index += 1;
                        break;
                    }
                    index += 1;
                }
                output.push_str(&sql[start..index]);
            }
            b'-' if bytes.get(index + 1) == Some(&b'-') => {
                let start = index;
                while index < bytes.len() && bytes[index] != b'\n' {
                    index += 1;
                }
                output.push_str(&sql[start..index]);
            }
            b'/' if bytes.get(index + 1) == Some(&b'*') => {
                let start = index;
                index += 2;
                while index + 1 < bytes.len() && !(bytes[index] == b'*' && bytes[index + 1] == b'/')
                {
                    index += 1;
                }
                index = (index + 2).min(bytes.len());
                output.push_str(&sql[start..index]);
            }
            b'?' => {
                let start = index + 1;
                let mut end = start;
                while end < bytes.len() && bytes[end].is_ascii_digit() {
                    end += 1;
                }
                if end > start {
                    output.push('$');
                    output.push_str(&sql[start..end]);
                    if let Ok(number) = sql[start..end].parse::<usize>() {
                        highest_parameter = highest_parameter.max(number);
                    }
                } else {
                    highest_parameter += 1;
                    output.push_str(&format!("${highest_parameter}"));
                }
                index = end;
            }
            b if b.is_ascii_alphabetic() || b == b'_' => {
                let start = index;
                while index < bytes.len()
                    && (bytes[index].is_ascii_alphanumeric() || bytes[index] == b'_')
                {
                    index += 1;
                }
                let word = &sql[start..index];
                match word.to_ascii_uppercase().as_str() {
                    "INTEGER" => {
                        if let Some(skip) = serial_suffix(&sql[index..]) {
                            output.push_str("BIGSERIAL PRIMARY KEY");
                            index += skip;
                        } else {
                            output.push_str("BIGINT");
                        }
                    }
                    "REAL" => output.push_str("DOUBLE PRECISION"),
                    "BLOB" => output.push_str("BYTEA"),
                    "DATETIME" => output.push_str("TEXT"),
                    "CURRENT_TIMESTAMP" => output.push_str(&format!("({POSTGRES_NOW})")),
                    "LIKE" => output.push_str("ILIKE"),
                    "INSERT" => {
                        let rest = &sql[index..];
                        let trimmed = rest.trim_start();
                        let upper = trimmed.to_ascii_uppercase();
                        if upper.starts_with("OR IGNORE") {
                            insert_or_ignore = true;
                            output.push_str("INSERT");
                            index += rest.len() - trimmed.len() + "OR IGNORE".len();
                        } else {
                            output.push_str(word);
                        }
                    }
                    _ => output.push_str(word),
                }
            }
            _ => {
                let ch = sql[index..].chars().next().unwrap();
                output.push(ch);
                index += ch.len_utf8();
            }
        }
    }
    if insert_or_ignore && !contains_keyword(&output, "CONFLICT") {
        let trimmed = output.trim_end().trim_end_matches(';').to_owned();
        output = format!("{trimmed} ON CONFLICT DO NOTHING");
    }
    output
}

/// Matches the ` PRIMARY KEY AUTOINCREMENT` suffix of `INTEGER PRIMARY KEY AUTOINCREMENT`.
fn serial_suffix(rest: &str) -> Option<usize> {
    let upper = rest.to_ascii_uppercase();
    let mut cursor = 0;
    for expected in ["PRIMARY", "KEY", "AUTOINCREMENT"] {
        let trimmed = upper[cursor..].trim_start();
        cursor = upper.len() - trimmed.len();
        if !trimmed.starts_with(expected) {
            return None;
        }
        cursor += expected.len();
    }
    Some(cursor)
}

fn contains_keyword(sql: &str, keyword: &str) -> bool {
    let upper = sql.to_ascii_uppercase();
    upper.match_indices(keyword).any(|(at, _)| {
        let before = upper[..at].chars().next_back();
        let after = upper[at + keyword.len()..].chars().next();
        !before.is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
            && !after.is_some_and(|c| c.is_ascii_alphanumeric() || c == '_')
    })
}

/// Extracts the (unquoted) table name of `INSERT [OR ...] INTO <table> ...`.
fn insert_table(sql: &str) -> Option<String> {
    let trimmed = sql.trim_start();
    if !trimmed.get(..6)?.eq_ignore_ascii_case("INSERT") {
        return None;
    }
    let upper = trimmed.to_ascii_uppercase();
    let into = upper.find("INTO")? + 4;
    let rest = trimmed[into..].trim_start();
    if let Some(quoted) = rest.strip_prefix('"') {
        let end = quoted.find('"')?;
        return Some(quoted[..end].to_owned());
    }
    let end = rest
        .find(|c: char| !(c.is_ascii_alphanumeric() || c == '_'))
        .unwrap_or(rest.len());
    (end > 0).then(|| rest[..end].to_owned())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn translates_placeholders_and_sqlite_spellings() {
        assert_eq!(
            translate_postgres("SELECT * FROM t WHERE a = ?1 AND b = ?2 AND c = ?1"),
            "SELECT * FROM t WHERE a = $1 AND b = $2 AND c = $1"
        );
        assert_eq!(
            translate_postgres("SELECT '?' , \"a?b\" FROM t WHERE x LIKE ? LIMIT ? OFFSET ?"),
            "SELECT '?' , \"a?b\" FROM t WHERE x ILIKE $1 LIMIT $2 OFFSET $3"
        );
        assert_eq!(
            translate_postgres(
                "CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, n INTEGER, r REAL)"
            ),
            "CREATE TABLE t (id BIGSERIAL PRIMARY KEY, n BIGINT, r DOUBLE PRECISION)"
        );
        assert_eq!(
            translate_postgres("INSERT OR IGNORE INTO t (a) VALUES (?)"),
            "INSERT INTO t (a) VALUES ($1) ON CONFLICT DO NOTHING"
        );
        assert_eq!(
            translate_postgres("SELECT ?1 FROM t WHERE a = ? AND b = ?"),
            "SELECT $1 FROM t WHERE a = $2 AND b = $3"
        );
        assert!(translate_postgres("UPDATE t SET at = CURRENT_TIMESTAMP").contains("to_char(now()"));
        assert_eq!(
            translate_postgres("-- LIKE ?\nSELECT 1"),
            "-- LIKE ?\nSELECT 1"
        );
    }

    #[test]
    fn finds_insert_tables() {
        assert_eq!(
            insert_table("INSERT INTO \"users\" (a) VALUES ($1)").as_deref(),
            Some("users")
        );
        assert_eq!(
            insert_table("insert into jobs(a) values (1)").as_deref(),
            Some("jobs")
        );
        assert_eq!(insert_table("SELECT 1"), None);
    }

    #[test]
    fn formats_postgres_dates() {
        assert_eq!(format_date(10_957), "2000-01-01");
        assert_eq!(format_timestamp(0, true), "2000-01-01 00:00:00+00");
    }

    #[test]
    fn sqlite_wrapper_round_trips_values() {
        let directory = tempfile::tempdir().unwrap();
        let connection = Connection::open(directory.path().join("t.sqlite")).unwrap();
        connection
            .execute_batch(
                "CREATE TABLE t (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, n REAL)",
            )
            .unwrap();
        connection
            .execute("INSERT INTO t (name, n) VALUES (?1, ?2)", params!["a", 1.5])
            .unwrap();
        assert_eq!(connection.last_insert_rowid(), 1);
        let name: String = connection
            .query_row("SELECT name FROM t WHERE id = ?1", [1], |row| row.get(0))
            .unwrap();
        assert_eq!(name, "a");
        assert!(connection
            .query_row("SELECT name FROM t WHERE id = 9", params![], |row| row
                .get::<_, String>(
                0
            ))
            .optional()
            .unwrap()
            .is_none());
        assert!(connection.table_exists("t"));
        assert_eq!(connection.table_columns("t").unwrap(), ["id", "name", "n"]);
    }
}
