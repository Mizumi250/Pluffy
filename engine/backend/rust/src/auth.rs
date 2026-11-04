use axum::http::StatusCode;
use bcrypt::{hash, verify, DEFAULT_COST};
use rusqlite::{params, Connection, OptionalExtension, Transaction};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use std::path::Path;

#[derive(Clone, Debug, PartialEq)]
pub struct User {
    pub id: i64,
    pub name: String,
    pub email: String,
    pub role: String,
    pub email_verified_at: Option<String>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}

impl User {
    pub fn json(&self) -> Value {
        json!({
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "email_verified_at": self.email_verified_at,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        })
    }
}

pub fn prepare_module(database_dir: &Path, module: &str, payload: &Value) -> Result<bool, String> {
    if payload.get("auth").and_then(Value::as_bool) != Some(true) {
        return Ok(false);
    }
    let mut connection = open_database(database_dir, module)?;
    let transaction = connection
        .transaction()
        .map_err(|error| format!("Could not start auth schema transaction: {error}"))?;
    ensure_auth_tables(&transaction)?;
    seed_users(&transaction, payload.get("authSeed"))?;
    transaction
        .commit()
        .map_err(|error| format!("Could not commit auth schema transaction: {error}"))?;
    Ok(true)
}

pub fn is_auth_path(module: &str, path: &str) -> bool {
    path.starts_with(&format!("/api/{module}/auth/"))
}

pub fn handle_auth_route(
    database_dir: &Path,
    module: &str,
    method: &str,
    path: &str,
    body: &Value,
    authorization: Option<&str>,
) -> Option<(StatusCode, Value)> {
    let prefix = format!("/api/{module}/auth/");
    let action = path.strip_prefix(&prefix)?;
    let expected_method = match action {
        "register" | "login" | "logout" => "POST",
        "me" => "GET",
        _ => return Some((StatusCode::NOT_FOUND, json!({"message": "Not Found"}))),
    };
    if !method.eq_ignore_ascii_case(expected_method) {
        return Some((
            StatusCode::METHOD_NOT_ALLOWED,
            json!({"message": "Method not allowed"}),
        ));
    }
    if matches!(action, "register" | "login") && !body.is_object() {
        return Some((
            StatusCode::BAD_REQUEST,
            json!({"message": "Request body must be a JSON object"}),
        ));
    }

    let response = match action {
        "register" => register(database_dir, module, body),
        "login" => login(database_dir, module, body),
        "me" => with_authenticated_user(database_dir, module, authorization, |_, user| {
            Ok((StatusCode::OK, user.json()))
        }),
        "logout" => logout(database_dir, module, authorization),
        _ => unreachable!(),
    };
    Some(response.unwrap_or_else(|message| {
        (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": message}),
        )
    }))
}

pub fn bearer_is_authenticated(
    database_dir: &Path,
    module: &str,
    authorization: Option<&str>,
) -> Result<bool, String> {
    let Some(token) = parse_bearer(authorization) else {
        return Ok(false);
    };
    let connection = open_database(database_dir, module)?;
    Ok(resolve_user(&connection, &token).map(|_| true)?)
}

pub fn authenticated_user(
    database_dir: &Path,
    module: &str,
    authorization: Option<&str>,
) -> Result<Option<User>, String> {
    let Some(token) = parse_bearer(authorization) else {
        return Ok(None);
    };
    let connection = open_database(database_dir, module)?;
    Ok(resolve_user(&connection, &token)?.map(|(user, _)| user))
}

pub fn update_user_role(
    database_dir: &Path,
    module: &str,
    user_id: i64,
    role: &str,
) -> Result<Option<User>, String> {
    if !matches!(role, "admin" | "user") {
        return Err(format!("Unsupported role \"{role}\""));
    }
    let connection = open_database(database_dir, module)?;
    let updated_at = timestamp(&connection)?;
    connection
        .execute(
            r#"UPDATE "users" SET "role"=?1,"updated_at"=?2 WHERE "id"=?3"#,
            params![role, updated_at, user_id],
        )
        .map_err(|error| format!("Unable to update auth user role: {error}"))?;
    get_user(&connection, user_id)
}

fn open_database(database_dir: &Path, module: &str) -> Result<Connection, String> {
    let path = database_dir.join(format!("{module}.sqlite"));
    Connection::open(&path)
        .map_err(|error| format!("Could not open auth database {}: {error}", path.display()))
}

fn ensure_auth_tables(transaction: &Transaction<'_>) -> Result<(), String> {
    transaction
        .execute_batch(
            r#"
            CREATE TABLE IF NOT EXISTS "users" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT NOT NULL,
                "email" TEXT NOT NULL,
                "email_verified_at" TEXT NULL,
                "password" TEXT NOT NULL,
                "role" TEXT NOT NULL DEFAULT 'user',
                "remember_token" TEXT NULL,
                "created_at" TEXT NULL,
                "updated_at" TEXT NULL
            );
            CREATE TABLE IF NOT EXISTS "personal_access_tokens" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "tokenable_type" TEXT NOT NULL,
                "tokenable_id" INTEGER NOT NULL,
                "name" TEXT NOT NULL,
                "token" TEXT NOT NULL UNIQUE,
                "abilities" TEXT NULL,
                "last_used_at" TEXT NULL,
                "expires_at" TEXT NULL,
                "created_at" TEXT NULL,
                "updated_at" TEXT NULL
            );
            "#,
        )
        .map_err(|error| format!("Could not create auth tables: {error}"))?;

    for (column, definition) in [
        ("name", r#""name" TEXT NOT NULL DEFAULT ''"#),
        ("email", r#""email" TEXT NOT NULL DEFAULT ''"#),
        ("email_verified_at", r#""email_verified_at" TEXT NULL"#),
        ("password", r#""password" TEXT NOT NULL DEFAULT ''"#),
        ("role", r#""role" TEXT NOT NULL DEFAULT 'user'"#),
        ("remember_token", r#""remember_token" TEXT NULL"#),
        ("created_at", r#""created_at" TEXT NULL"#),
        ("updated_at", r#""updated_at" TEXT NULL"#),
    ] {
        let exists = transaction
            .query_row(
                "SELECT EXISTS(SELECT 1 FROM pragma_table_info('users') WHERE name = ?1)",
                [column],
                |row| row.get::<_, bool>(0),
            )
            .map_err(|error| format!("Could not inspect auth user column {column}: {error}"))?;
        if !exists {
            transaction
                .execute(
                    &format!("ALTER TABLE \"users\" ADD COLUMN {definition}"),
                    [],
                )
                .map_err(|error| format!("Could not add auth user column {column}: {error}"))?;
        }
    }
    transaction
        .execute(
            r#"CREATE UNIQUE INDEX IF NOT EXISTS "users_email_unique" ON "users" ("email")"#,
            [],
        )
        .map_err(|error| format!("Could not ensure unique auth email addresses: {error}"))?;
    Ok(())
}

fn seed_users(transaction: &Transaction<'_>, seed: Option<&Value>) -> Result<(), String> {
    let Some(seed) = seed.filter(|seed| !seed.is_null()) else {
        return Ok(());
    };
    let Some(users) = seed.get("users") else {
        return Ok(());
    };
    let users = users
        .as_array()
        .ok_or_else(|| "authSeed.users must be an array".to_owned())?;
    for (index, user) in users.iter().enumerate() {
        let user = user
            .as_object()
            .ok_or_else(|| format!("authSeed user {} must be an object", index + 1))?;
        let email = user
            .get("email")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .trim();
        if email.is_empty() {
            continue;
        }
        let name = user
            .get("name")
            .and_then(Value::as_str)
            .filter(|name| !name.is_empty())
            .unwrap_or(email);
        let password = user
            .get("password")
            .and_then(Value::as_str)
            .filter(|password| !password.is_empty())
            .unwrap_or("password");
        let role = user
            .get("role")
            .and_then(Value::as_str)
            .filter(|role| !role.is_empty())
            .unwrap_or("user");
        let password_hash = hash_password(password).map_err(|error| {
            format!(
                "Could not hash auth seed user {} password: {error}",
                index + 1
            )
        })?;
        let now = timestamp(transaction)?;
        transaction
            .execute(
                r#"INSERT INTO "users" ("name","email","password","role","created_at","updated_at")
                   VALUES (?1,?2,?3,?4,?5,?5)
                   ON CONFLICT("email") DO UPDATE SET
                       "name"=excluded."name",
                       "password"=excluded."password",
                       "role"=excluded."role",
                       "updated_at"=excluded."updated_at""#,
                params![name, email, password_hash, role, now],
            )
            .map_err(|error| format!("Could not seed auth user {email:?}: {error}"))?;
    }
    Ok(())
}

fn register(
    database_dir: &Path,
    module: &str,
    body: &Value,
) -> Result<(StatusCode, Value), String> {
    let Some(input) = body.as_object() else {
        return Ok(validation_error("name", "The name field is required."));
    };
    let name = input
        .get("name")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let email = input
        .get("email")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let password = input
        .get("password")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let confirmation = input
        .get("password_confirmation")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let mut errors = Map::new();
    let trimmed_name = name.trim();
    if trimmed_name.is_empty() {
        push_error(&mut errors, "name", "The name field is required.");
    } else if trimmed_name.chars().count() > 255 {
        push_error(
            &mut errors,
            "name",
            "The name may not be greater than 255 characters.",
        );
    }
    if !valid_email(email) {
        push_error(
            &mut errors,
            "email",
            "The email must be a valid email address.",
        );
    }
    if password.chars().count() < 8 {
        push_error(
            &mut errors,
            "password",
            "The password must be at least 8 characters.",
        );
    }
    if password.len() > 72 {
        push_error(
            &mut errors,
            "password",
            "The password must not exceed 72 bytes.",
        );
    }
    if confirmation != password {
        push_error(
            &mut errors,
            "password",
            "The password confirmation does not match.",
        );
    }
    if !errors.is_empty() {
        return Ok((
            StatusCode::UNPROCESSABLE_ENTITY,
            json!({"message": "The given data was invalid.", "errors": errors}),
        ));
    }

    let password_hash =
        hash_password(password).map_err(|error| format!("Unable to hash password: {error}"))?;
    let connection = open_database(database_dir, module)?;
    let now = timestamp(&connection)?;
    let inserted = connection.execute(
        r#"INSERT INTO "users" ("name","email","password","role","created_at","updated_at")
           VALUES (?1,?2,?3,'user',?4,?4)"#,
        params![trimmed_name, email.trim(), password_hash, now],
    );
    if let Err(error) = inserted {
        if is_constraint_error(&error) {
            return Ok(validation_error(
                "email",
                "The email has already been taken.",
            ));
        }
        return Err(format!("Unable to create user: {error}"));
    }
    let user_id = connection.last_insert_rowid();
    let user = get_user(&connection, user_id)?
        .ok_or_else(|| "Unable to retrieve created user".to_owned())?;
    write_token(&connection, &user, StatusCode::CREATED)
}

fn login(database_dir: &Path, module: &str, body: &Value) -> Result<(StatusCode, Value), String> {
    let email = body
        .get("email")
        .and_then(Value::as_str)
        .unwrap_or_default()
        .trim();
    let password = body
        .get("password")
        .and_then(Value::as_str)
        .unwrap_or_default();
    if !valid_email(email) || password.is_empty() {
        return Ok(validation_error(
            "email",
            "The provided credentials are incorrect.",
        ));
    }
    let connection = open_database(database_dir, module)?;
    let credentials = connection
        .query_row(
            r#"SELECT "id","name","email","role","email_verified_at","created_at","updated_at","password"
               FROM "users" WHERE "email"=?1"#,
            [email],
            |row| {
                Ok((
                    User {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        email: row.get(2)?,
                        role: row.get(3)?,
                        email_verified_at: row.get(4)?,
                        created_at: row.get(5)?,
                        updated_at: row.get(6)?,
                    },
                    row.get::<_, String>(7)?,
                ))
            },
        )
        .optional()
        .map_err(|error| format!("Unable to read user credentials: {error}"))?;
    let Some((user, password_hash)) = credentials else {
        return Ok(validation_error(
            "email",
            "The provided credentials are incorrect.",
        ));
    };
    if !verify_password(password, &password_hash) {
        return Ok(validation_error(
            "email",
            "The provided credentials are incorrect.",
        ));
    }
    connection
        .execute(
            r#"DELETE FROM "personal_access_tokens" WHERE "tokenable_id"=?1 AND "tokenable_type"='user'"#,
            [user.id],
        )
        .map_err(|error| format!("Unable to replace access token: {error}"))?;
    write_token(&connection, &user, StatusCode::OK)
}

fn logout(
    database_dir: &Path,
    module: &str,
    authorization: Option<&str>,
) -> Result<(StatusCode, Value), String> {
    let Some(token) = parse_bearer(authorization) else {
        return Ok(unauthenticated());
    };
    let connection = open_database(database_dir, module)?;
    let Some((user, token_id)) = resolve_user(&connection, &token)? else {
        return Ok(unauthenticated());
    };
    connection
        .execute(
            r#"DELETE FROM "personal_access_tokens" WHERE "id"=?1 AND "tokenable_id"=?2"#,
            params![token_id, user.id],
        )
        .map_err(|error| format!("Unable to revoke access token: {error}"))?;
    Ok((
        StatusCode::OK,
        json!({"message": "Logged out successfully"}),
    ))
}

fn with_authenticated_user(
    database_dir: &Path,
    module: &str,
    authorization: Option<&str>,
    action: impl FnOnce(&Connection, User) -> Result<(StatusCode, Value), String>,
) -> Result<(StatusCode, Value), String> {
    let Some(token) = parse_bearer(authorization) else {
        return Ok(unauthenticated());
    };
    let connection = open_database(database_dir, module)?;
    let Some((user, _)) = resolve_user(&connection, &token)? else {
        return Ok(unauthenticated());
    };
    action(&connection, user)
}

fn resolve_user(connection: &Connection, token: &str) -> Result<Option<(User, i64)>, String> {
    let Some((token_id, raw_token)) = split_token(token)? else {
        return Ok(None);
    };
    let token_hash = hash_token(raw_token);
    let result = connection
        .query_row(
            r#"SELECT u."id",u."name",u."email",u."role",u."email_verified_at",u."created_at",u."updated_at",t."id"
               FROM "personal_access_tokens" t
               JOIN "users" u ON u."id"=t."tokenable_id"
               WHERE t."token"=?1 AND t."tokenable_type"='user'
                 AND (t."expires_at" IS NULL OR t."expires_at">?2)
                 AND (?3 IS NULL OR t."id"=?3)"#,
            params![token_hash, timestamp(connection)?, token_id],
            |row| {
                Ok((
                    User {
                        id: row.get(0)?,
                        name: row.get(1)?,
                        email: row.get(2)?,
                        role: row.get(3)?,
                        email_verified_at: row.get(4)?,
                        created_at: row.get(5)?,
                        updated_at: row.get(6)?,
                    },
                    row.get(7)?,
                ))
            },
        )
        .optional()
        .map_err(|error| format!("Unable to resolve authenticated user: {error}"))?;
    Ok(result)
}

fn write_token(
    connection: &Connection,
    user: &User,
    status: StatusCode,
) -> Result<(StatusCode, Value), String> {
    let raw_token = random_token()?;
    let token_hash = hash_token(&raw_token);
    let now = timestamp(connection)?;
    connection
        .execute(
            r#"INSERT INTO "personal_access_tokens"
               ("tokenable_type","tokenable_id","name","token","abilities","created_at","updated_at")
               VALUES ('user',?1,'arkzen-token',?2,'["*"]',?3,?3)"#,
            params![user.id, token_hash, now],
        )
        .map_err(|error| format!("Unable to persist access token: {error}"))?;
    let token_id = connection.last_insert_rowid();
    Ok((
        status,
        json!({"user": user.json(), "token": format!("{token_id}|{raw_token}")}),
    ))
}

fn get_user(connection: &Connection, id: i64) -> Result<Option<User>, String> {
    connection
        .query_row(
            r#"SELECT "id","name","email","role","email_verified_at","created_at","updated_at"
               FROM "users" WHERE "id"=?1"#,
            [id],
            |row| {
                Ok(User {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    email: row.get(2)?,
                    role: row.get(3)?,
                    email_verified_at: row.get(4)?,
                    created_at: row.get(5)?,
                    updated_at: row.get(6)?,
                })
            },
        )
        .optional()
        .map_err(|error| format!("Unable to retrieve auth user: {error}"))
}

fn timestamp(connection: &Connection) -> Result<String, String> {
    connection
        .query_row("SELECT strftime('%Y-%m-%dT%H:%M:%fZ','now')", [], |row| {
            row.get(0)
        })
        .map_err(|error| format!("Unable to read current time: {error}"))
}

fn parse_bearer(header: Option<&str>) -> Option<String> {
    let value = header?.trim();
    let (scheme, token) = value.split_once(' ')?;
    if !scheme.eq_ignore_ascii_case("bearer") {
        return None;
    }
    let token = token.trim();
    (!token.is_empty()).then(|| token.to_owned())
}

fn split_token(token: &str) -> Result<Option<(Option<i64>, &str)>, String> {
    if let Some((id, raw)) = token.split_once('|') {
        let Ok(id) = id.parse::<i64>() else {
            return Ok(None);
        };
        if id < 1 || raw.is_empty() {
            return Ok(None);
        }
        Ok(Some((Some(id), raw)))
    } else if token.is_empty() {
        Ok(None)
    } else {
        Ok(Some((None, token)))
    }
}

fn hash_token(token: &str) -> String {
    let digest = Sha256::digest(token.as_bytes());
    digest.iter().map(|byte| format!("{byte:02x}")).collect()
}

fn random_token() -> Result<String, String> {
    let mut bytes = [0_u8; 20];
    getrandom::getrandom(&mut bytes)
        .map_err(|error| format!("Unable to generate access token: {error}"))?;
    Ok(bytes.iter().map(|byte| format!("{byte:02x}")).collect())
}

fn hash_password(password: &str) -> Result<String, bcrypt::BcryptError> {
    hash(password, DEFAULT_COST)
}

fn verify_password(password: &str, encoded: &str) -> bool {
    verify(password, encoded).unwrap_or(false)
}

pub(crate) fn valid_email(value: &str) -> bool {
    let value = value.trim();
    if value.is_empty() || value.chars().any(char::is_whitespace) {
        return false;
    }
    let mut parts = value.split('@');
    let Some(local) = parts.next() else {
        return false;
    };
    let Some(domain) = parts.next() else {
        return false;
    };
    let local_valid = local.split('.').all(|part| {
        !part.is_empty()
            && part.chars().all(|character| {
                character.is_ascii_alphanumeric() || "!#$%&'*+-/=?^_`{|}~".contains(character)
            })
    });
    let domain_valid = domain.split('.').all(|part| {
        !part.is_empty()
            && !part.starts_with('-')
            && !part.ends_with('-')
            && part
                .chars()
                .all(|character| character.is_ascii_alphanumeric() || character == '-')
    });
    local_valid && domain_valid && parts.next().is_none()
}

fn is_constraint_error(error: &rusqlite::Error) -> bool {
    matches!(
        error,
        rusqlite::Error::SqliteFailure(code, _)
            if code.code == rusqlite::ErrorCode::ConstraintViolation
    )
}

fn push_error(errors: &mut Map<String, Value>, field: &str, message: &str) {
    let messages = errors
        .entry(field.to_owned())
        .or_insert_with(|| Value::Array(Vec::new()));
    if let Value::Array(messages) = messages {
        messages.push(Value::String(message.to_owned()));
    }
}

fn validation_error(field: &str, message: &str) -> (StatusCode, Value) {
    let mut errors = Map::new();
    push_error(&mut errors, field, message);
    (
        StatusCode::UNPROCESSABLE_ENTITY,
        json!({"message": "The given data was invalid.", "errors": errors}),
    )
}

fn unauthenticated() -> (StatusCode, Value) {
    (
        StatusCode::UNAUTHORIZED,
        json!({"message": "Unauthenticated."}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    fn prepare(directory: &Path, module: &str) {
        std::fs::create_dir_all(directory).unwrap();
        let payload = json!({
            "auth": true,
            "authSeed": {"users": [{
                "name": "Seeded User",
                "email": "seed@example.test",
                "password": "secure-password",
                "role": "admin"
            }]}
        });
        assert!(prepare_module(directory, module, &payload).unwrap());
    }

    fn auth_request(
        directory: &Path,
        module: &str,
        method: &str,
        action: &str,
        body: &Value,
    ) -> (StatusCode, Value) {
        handle_auth_route(
            directory,
            module,
            method,
            &format!("/api/{module}/auth/{action}"),
            body,
            None,
        )
        .unwrap()
    }

    fn bearer_header(token: &str) -> String {
        let mut header = String::from("Bear");
        header.push_str("er ");
        header.push_str(token);
        header
    }

    #[test]
    fn auth_seed_upserts_users_with_bcrypt_hashes() {
        let directory = tempdir().unwrap();
        prepare(directory.path(), "sample");
        let connection = open_database(directory.path(), "sample").unwrap();
        let (stored_password, role, count): (String, String, i64) = connection
            .query_row(
                r#"SELECT "password","role",(SELECT COUNT(*) FROM "users") FROM "users" WHERE "email"=?1"#,
                ["seed@example.test"],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .unwrap();
        assert_ne!(stored_password, "secure-password");
        assert!(verify_password("secure-password", &stored_password));
        assert_eq!(role, "admin");
        assert_eq!(count, 1);
        drop(connection);
        let changed_seed = json!({
            "auth": true,
            "authSeed": {"users": [{
                "name": "Updated Seed",
                "email": "seed@example.test",
                "password": "updated-password",
                "role": "user"
            }]}
        });
        prepare_module(directory.path(), "sample", &changed_seed).unwrap();
        let connection = open_database(directory.path(), "sample").unwrap();
        let (count, name, role): (i64, String, String) = connection
            .query_row(
                "SELECT (SELECT COUNT(*) FROM users),name,role FROM users WHERE email=?1",
                ["seed@example.test"],
                |row| Ok((row.get(0)?, row.get(1)?, row.get(2)?)),
            )
            .unwrap();
        assert_eq!(count, 1);
        assert_eq!(name, "Updated Seed");
        assert_eq!(role, "user");
        let updated_password: String = connection
            .query_row(
                "SELECT password FROM users WHERE email=?1",
                ["seed@example.test"],
                |row| row.get(0),
            )
            .unwrap();
        assert!(verify_password("updated-password", &updated_password));
    }

    #[test]
    fn registration_login_me_and_logout_use_hashed_bearer_tokens() {
        let directory = tempdir().unwrap();
        prepare(directory.path(), "sample");
        let (status, response) = auth_request(
            directory.path(),
            "sample",
            "POST",
            "register",
            &json!({
                "name": "New User",
                "email": "new@example.test",
                "password": "password-123",
                "password_confirmation": "password-123"
            }),
        );
        assert_eq!(status, StatusCode::CREATED);
        let token = response["token"].as_str().unwrap().to_owned();
        assert_eq!(token.split_once('|').unwrap().1.len(), 40);
        assert_eq!(response["user"]["role"], "user");
        assert!(
            bearer_is_authenticated(directory.path(), "sample", Some(&bearer_header(&token)))
                .unwrap()
        );
        prepare(directory.path(), "other");
        assert!(
            !bearer_is_authenticated(directory.path(), "other", Some(&bearer_header(&token)))
                .unwrap()
        );
        let connection = open_database(directory.path(), "sample").unwrap();
        let stored_token: String = connection
            .query_row(
                "SELECT token FROM personal_access_tokens WHERE tokenable_id=?1",
                [response["user"]["id"].as_i64().unwrap()],
                |row| row.get(0),
            )
            .unwrap();
        assert_eq!(stored_token, hash_token(token.split_once('|').unwrap().1));
        assert_ne!(stored_token, token);
        drop(connection);

        let (status, me) = handle_auth_route(
            directory.path(),
            "sample",
            "GET",
            "/api/sample/auth/me",
            &Value::Null,
            Some(&bearer_header(&token)),
        )
        .unwrap();
        assert_eq!(status, StatusCode::OK);
        assert_eq!(me["email"], "new@example.test");
        let logout = handle_auth_route(
            directory.path(),
            "sample",
            "POST",
            "/api/sample/auth/logout",
            &Value::Null,
            Some(&bearer_header(&token)),
        )
        .unwrap();
        assert_eq!(logout.0, StatusCode::OK);
        assert!(
            !bearer_is_authenticated(directory.path(), "sample", Some(&bearer_header(&token)))
                .unwrap()
        );
    }

    #[test]
    fn login_replaces_prior_tokens_and_me_returns_seed_user() {
        let directory = tempdir().unwrap();
        prepare(directory.path(), "sample");
        let first = auth_request(
            directory.path(),
            "sample",
            "POST",
            "login",
            &json!({"email": "seed@example.test", "password": "secure-password"}),
        );
        assert_eq!(first.0, StatusCode::OK);
        let old_token = first.1["token"].as_str().unwrap().to_owned();
        let second = auth_request(
            directory.path(),
            "sample",
            "POST",
            "login",
            &json!({"email": "seed@example.test", "password": "secure-password"}),
        );
        assert_eq!(second.0, StatusCode::OK);
        assert!(!bearer_is_authenticated(
            directory.path(),
            "sample",
            Some(&bearer_header(&old_token))
        )
        .unwrap());
        let new_token = second.1["token"].as_str().unwrap();
        let (status, user) = with_authenticated_user(
            directory.path(),
            "sample",
            Some(&bearer_header(new_token)),
            |_, user| Ok((StatusCode::OK, user.json())),
        )
        .unwrap();
        assert_eq!(status, StatusCode::OK);
        assert_eq!(user["email"], "seed@example.test");
        assert_eq!(user["role"], "admin");
    }

    #[test]
    fn auth_routes_validate_inputs_and_are_scoped_to_the_module() {
        let directory = tempdir().unwrap();
        prepare(directory.path(), "sample");
        let (status, error) = auth_request(
            directory.path(),
            "sample",
            "POST",
            "register",
            &json!({
                "name": "",
                "email": "bad",
                "password": "short",
                "password_confirmation": "different"
            }),
        );
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert!(error["errors"]["email"].is_array());
        assert_eq!(
            handle_auth_route(
                directory.path(),
                "other",
                "GET",
                "/api/other/auth/me",
                &Value::Null,
                None
            )
            .unwrap()
            .0,
            StatusCode::UNAUTHORIZED
        );
        assert_eq!(
            handle_auth_route(
                directory.path(),
                "sample",
                "POST",
                "/api/sample/auth/me",
                &Value::Null,
                None
            )
            .unwrap()
            .0,
            StatusCode::METHOD_NOT_ALLOWED
        );
    }
}
