mod api;
mod database;
mod engine;

use axum::{
    body::Body,
    http::{header, HeaderMap, Method, StatusCode},
    response::{IntoResponse, Response},
    routing::{get, post},
    Json, Router,
};
use serde::Serialize;
use serde_json::{json, Value};
use std::{
    collections::BTreeMap,
    env,
    path::{Path, PathBuf},
    sync::Arc,
};
use tokio::sync::{Mutex, RwLock};
use tower_http::cors::{Any, CorsLayer};

pub use engine::validate_payload;

#[derive(Clone, Debug)]
pub struct Config {
    pub host: String,
    pub port: u16,
    pub secret: String,
    pub module_dir: PathBuf,
    pub database_dir: PathBuf,
    pub repository_root: Option<PathBuf>,
}

impl Config {
    pub fn from_env() -> Result<Self, String> {
        let port = env::var("PORT")
            .unwrap_or_else(|_| "8000".to_owned())
            .parse::<u16>()
            .map_err(|error| format!("PORT must be a valid TCP port: {error}"))?;
        let secret = env::var("ARKZEN_ENGINE_SECRET")
            .unwrap_or_else(|_| "arkzen-engine-secret".to_owned());
        if secret.trim().is_empty() {
            return Err("ARKZEN_ENGINE_SECRET must not be empty".to_owned());
        }
        let repository_root = match env::var_os("PLUFF_ROOT") {
            Some(root) => {
                let root = PathBuf::from(root)
                    .canonicalize()
                    .map_err(|error| format!("PLUFF_ROOT must be an existing directory: {error}"))?;
                if !root.is_dir() {
                    return Err("PLUFF_ROOT must point to a directory".to_owned());
                }
                Some(root)
            }
            None => discover_repository_root(),
        };

        Ok(Self {
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_owned()),
            port,
            secret,
            module_dir: env::var_os("ARKZEN_MODULE_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from("storage").join("arkzen-modules")),
            database_dir: env::var_os("ARKZEN_DATABASE_DIR")
                .map(PathBuf::from)
                .unwrap_or_else(|| PathBuf::from("database").join("arkzen")),
            repository_root,
        })
    }

    pub fn with_data_dirs(
        mut self,
        module_dir: impl Into<PathBuf>,
        database_dir: impl Into<PathBuf>,
    ) -> Self {
        self.module_dir = module_dir.into();
        self.database_dir = database_dir.into();
        self
    }
}

#[derive(Clone)]
pub struct AppState {
    config: Arc<Config>,
    modules: Arc<RwLock<BTreeMap<String, Value>>>,
    operations: Arc<Mutex<()>>,
}

impl AppState {
    pub fn open(config: Config) -> Result<Self, String> {
        std::fs::create_dir_all(&config.module_dir)
            .map_err(|error| format!("Could not create module registry directory: {error}"))?;
        std::fs::create_dir_all(&config.database_dir)
            .map_err(|error| format!("Could not create database directory: {error}"))?;
        let modules = load_modules(&config.module_dir)?;
        Ok(Self {
            config: Arc::new(config),
            modules: Arc::new(RwLock::new(modules)),
            operations: Arc::new(Mutex::new(())),
        })
    }
}

fn load_modules(directory: &Path) -> Result<BTreeMap<String, Value>, String> {
    let mut modules = BTreeMap::new();
    let entries = std::fs::read_dir(directory)
        .map_err(|error| format!("Could not read persistent module registry: {error}"))?;
    for entry in entries {
        let entry = entry.map_err(|error| format!("Could not read module registry entry: {error}"))?;
        let path = entry.path();
        if path.extension().and_then(|extension| extension.to_str()) != Some("json") {
            continue;
        }
        let text = std::fs::read_to_string(&path)
            .map_err(|error| format!("Could not read module file {}: {error}", path.display()))?;
        let module: Value = serde_json::from_str(&text)
            .map_err(|error| format!("Invalid module file {}: {error}", path.display()))?;
        let name = module
            .get("name")
            .and_then(Value::as_str)
            .ok_or_else(|| format!("Module file {} has no string name", path.display()))?;
        if !engine::is_valid_name(name) {
            return Err(format!("Module file {} has an invalid name", path.display()));
        }
        modules.insert(name.to_owned(), module);
    }
    Ok(modules)
}

pub fn app(state: AppState) -> Router {
    let engine_secret_header = "x-arkzen-secret"
        .parse::<axum::http::HeaderName>()
        .expect("static header name is valid");
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::PATCH,
            Method::DELETE,
            Method::OPTIONS,
        ])
        .allow_headers([header::CONTENT_TYPE, header::ACCEPT, engine_secret_header]);

    Router::new()
        .route("/arkzen/health", get(health))
        .route("/arkzen/registry", get(registry))
        .route("/arkzen/build", post(build))
        .route("/arkzen/remove", post(remove))
        .fallback(dispatch)
        .with_state(state)
        .layer(cors)
}

fn discover_repository_root() -> Option<PathBuf> {
    let mut current = env::current_dir().ok()?.canonicalize().ok()?;
    loop {
        if current.join("arkzen.json").is_file() {
            return Some(current);
        }
        if !current.pop() {
            return None;
        }
    }
}

async fn registry(
    axum::extract::State(state): axum::extract::State<AppState>,
) -> Response {
    let mut response = if let Some(root) = &state.config.repository_root {
        let path = root.join("arkzen.json");
        let canonical_path = match path.canonicalize() {
            Ok(path) => path,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => PathBuf::new(),
            Err(error) => return internal_error(format!("Could not resolve {}: {error}", path.display())).into_response(),
        };
        if !canonical_path.as_os_str().is_empty() && !canonical_path.starts_with(root) {
            return internal_error("Root arkzen.json resolves outside PLUFF_ROOT".to_owned()).into_response();
        }
        if canonical_path.as_os_str().is_empty() {
            json!({})
        } else {
        match std::fs::read_to_string(&canonical_path) {
            Ok(contents) => match serde_json::from_str::<Value>(&contents) {
                Ok(Value::Object(object)) => Value::Object(object),
                Ok(_) => return internal_error("Root arkzen.json must contain an object".to_owned()).into_response(),
                Err(error) => return internal_error(format!("Could not parse {}: {error}", canonical_path.display())).into_response(),
            },
            Err(error) => return internal_error(format!("Could not read {}: {error}", canonical_path.display())).into_response(),
        }
        }
    } else {
        json!({})
    };

    let object = response.as_object_mut().expect("registry response is an object");
    let project = state
        .config
        .repository_root
        .as_ref()
        .and_then(|root| root.file_name())
        .and_then(|name| name.to_str())
        .unwrap_or("pluff");
    for (field, fallback) in [
        ("project", project),
        ("activeStack", "nextjs"),
        ("activeBackend", "rust"),
        ("activeDatabase", "sqlite"),
    ] {
        if !object.get(field).is_some_and(Value::is_string) {
            object.insert(field.to_owned(), json!(fallback));
        }
    }

    let mut modules = BTreeMap::<String, Value>::new();
    if let Some(root_modules) = object.get("modules").and_then(Value::as_array) {
        for module in root_modules {
            if let Some(name) = module.get("name").and_then(Value::as_str) {
                modules.insert(name.to_owned(), module.clone());
            }
        }
    }
    for (name, payload) in state.modules.read().await.iter() {
        let mut module = json!({
            "name": name,
            "version": payload.get("version").and_then(Value::as_str).unwrap_or("1.0.0"),
            "status": "active",
            "backend": ["Rust"],
            "pages": [],
            "auth": payload.get("auth").and_then(Value::as_bool).unwrap_or(false)
        });
        if let Some(existing) = modules.remove(name) {
            if let (Some(target), Some(source)) = (module.as_object_mut(), existing.as_object()) {
                target.extend(source.iter().map(|(key, value)| (key.clone(), value.clone())));
            }
        }
        modules.insert(name.clone(), module);
    }
    object.insert(
        "modules".to_owned(),
        Value::Array(modules.into_values().collect()),
    );
    Json(response).into_response()
}

async fn dispatch(
    axum::extract::State(state): axum::extract::State<AppState>,
    request: axum::http::Request<Body>,
) -> Response {
    let method = request.method().clone();
    let path = request.uri().path().to_owned();
    let query_string = request.uri().query().unwrap_or_default().to_owned();
    let body_bytes = match axum::body::to_bytes(request.into_body(), 2 * 1024 * 1024).await {
        Ok(body) => body,
        Err(error) => {
            return (
                StatusCode::BAD_REQUEST,
                Json(json!({"message": format!("Could not read request body: {error}")})),
            )
                .into_response()
        }
    };
    let body: Value = if body_bytes.is_empty() {
        Value::Null
    } else {
        match serde_json::from_slice(&body_bytes) {
            Ok(Value::Object(body)) => Value::Object(body),
            Ok(_) => {
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({"message": "Request body must be a JSON object"})),
                )
                    .into_response()
            }
            Err(error) => {
                return (
                    StatusCode::BAD_REQUEST,
                    Json(json!({"message": format!("Invalid JSON request body: {error}")})),
                )
                    .into_response()
            }
        }
    };

    let _operation = state.operations.lock().await;
    let modules = state.modules.read().await.clone();
    for (slug, module) in modules {
        if let Some(route) = api::match_route(&module, method.as_str(), &path) {
            if !route.middleware.is_empty() {
                return (
                    StatusCode::NOT_IMPLEMENTED,
                    Json(json!({"message": "API middleware execution is not implemented by the Rust engine"})),
                )
                    .into_response();
            }
            if route.endpoint.get("body").is_some_and(|body| {
                body.as_str().map_or(!body.is_null(), |body| !body.trim().is_empty())
            }) {
                return (
                    StatusCode::NOT_IMPLEMENTED,
                    Json(json!({"message": "Custom endpoint body execution is not implemented by the Rust engine"})),
                )
                    .into_response();
            }
            if !route.supported {
                return (
                    StatusCode::NOT_IMPLEMENTED,
                    Json(json!({"message": format!("Endpoint {} is not implemented by the Rust engine", route.name)})),
                )
                    .into_response();
            }
            let database_dir = state.config.database_dir.clone();
            let action = route.name.clone();
            let endpoint = route.endpoint.clone();
            let table = route.table.clone();
            let schema = route.schema.clone();
            let model_name = route.model.clone();
            let slug_for_db = slug.clone();
            let body_for_db = body.clone();
            let query_for_db = query_string.clone();
            let result = tokio::task::spawn_blocking(move || {
                api::execute(
                    &database_dir,
                    &slug_for_db,
                    &table,
                    &action,
                    &endpoint,
                    &schema,
                    &model_name,
                    &path,
                    &body_for_db,
                    &query_for_db,
                )
            })
            .await;
            return match result {
                Ok((status, payload)) => (status, Json(payload)).into_response(),
                Err(error) => internal_error(format!("API worker failed: {error}")).into_response(),
            };
        }
    }
    (
        StatusCode::NOT_FOUND,
        Json(json!({"message": "Not Found"})),
    )
        .into_response()
}

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    engine: &'static str,
    backend: &'static str,
    variant: &'static str,
    version: &'static str,
}

async fn health() -> Json<HealthResponse> {
    Json(HealthResponse {
        status: "ok",
        engine: "Pluff Rust Backend Engine",
        backend: "rust",
        variant: "rs",
        version: env!("CARGO_PKG_VERSION"),
    })
}

async fn build(
    axum::extract::State(state): axum::extract::State<AppState>,
    headers: HeaderMap,
    body: Result<Json<Value>, axum::extract::rejection::JsonRejection>,
) -> (StatusCode, Json<Value>) {
    if let Some(response) = authenticate(&state, &headers) {
        return response;
    }
    let payload = match body {
        Ok(Json(payload)) => payload,
        Err(error) => return bad_json(error.body_text()),
    };

    let errors = validate_payload(&payload);
    if !errors.is_empty() {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "success": false,
                "message": "Validation failed",
                "errors": errors,
                "steps": []
            })),
        );
    }

    let _operation = state.operations.lock().await;
    let name = payload["name"].as_str().expect("validated module name");
    let build_name = name.to_owned();
    let build_payload = payload.clone();
    let database_dir = state.config.database_dir.clone();
    let module_dir = state.config.module_dir.clone();
    let build_result = tokio::task::spawn_blocking(move || {
        let mut steps = database::apply_schema(&database_dir, &build_name, &build_payload)?;
        persist_module(&module_dir, &build_name, &build_payload)?;
        steps.push("Module registration persisted".to_owned());
        Ok::<_, String>(steps)
    })
    .await;
    let mut schema_steps = match build_result {
        Ok(Ok(steps)) => steps,
        Ok(Err(error)) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                Json(json!({
                    "success": false,
                    "message": "Build failed",
                    "errors": [error],
                    "steps": []
                })),
            );
        }
        Err(error) => return internal_error(format!("Build worker failed: {error}")),
    };
    state
        .modules
        .write()
        .await
        .insert(name.to_owned(), payload.clone());
    let route_count = api::route_count(&payload);
    if route_count > 0 {
        schema_steps.push(format!("Registered {route_count} API routes"));
    }

    let table_names: Vec<&str> = payload["databases"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(|database| database["table"].as_str())
        .collect();
    let warnings = api::warnings(&payload);
    (
        StatusCode::OK,
        Json(json!({
            "success": true,
            "message": "Build complete",
            "steps": schema_steps,
            "errors": [],
            "warnings": warnings,
            "registry": {
                "name": name,
                "tables": table_names
            }
        })),
    )
}

async fn remove(
    axum::extract::State(state): axum::extract::State<AppState>,
    headers: HeaderMap,
    body: Result<Json<Value>, axum::extract::rejection::JsonRejection>,
) -> (StatusCode, Json<Value>) {
    if let Some(response) = authenticate(&state, &headers) {
        return response;
    }
    let payload = match body {
        Ok(Json(payload)) => payload,
        Err(error) => return bad_json(error.body_text()),
    };
    let Some(name) = payload.get("name").and_then(Value::as_str) else {
        return validation_error(vec!["Missing \"name\"".to_owned()]);
    };
    if !engine::is_valid_name(name) {
        return validation_error(vec![format!(
            "Invalid tatemono name \"{name}\" (lowercase letters, digits, dashes)"
        )]);
    }

    let _operation = state.operations.lock().await;
    let module_path = state.config.module_dir.join(format!("{name}.json"));
    let database_path = state.config.database_dir.join(format!("{name}.sqlite"));
    let removal = tokio::task::spawn_blocking(move || {
        remove_file_if_exists(&module_path)
            .map_err(|error| format!("Could not remove module registration: {error}"))?;
        remove_file_if_exists(&database_path)
            .map_err(|error| format!("Could not remove isolated database: {error}"))
    })
    .await;
    match removal {
        Ok(Ok(())) => {}
        Ok(Err(error)) => return internal_error(error),
        Err(error) => return internal_error(format!("Removal worker failed: {error}")),
    }
    state.modules.write().await.remove(name);

    (
        StatusCode::OK,
        Json(json!({
            "success": true,
            "message": format!("Removed {name}"),
            "steps": ["Module registration removed", "Isolated database removed"],
            "errors": []
        })),
    )
}

fn authenticate(state: &AppState, headers: &HeaderMap) -> Option<(StatusCode, Json<Value>)> {
    let supplied = headers
        .get("x-arkzen-secret")
        .and_then(|value| value.to_str().ok());
    if supplied == Some(state.config.secret.as_str()) {
        None
    } else {
        Some((
            StatusCode::FORBIDDEN,
            Json(json!({"message": "Invalid engine secret."})),
        ))
    }
}

fn bad_json(message: String) -> (StatusCode, Json<Value>) {
    (
        StatusCode::BAD_REQUEST,
        Json(json!({"success": false, "message": "Invalid JSON request body", "errors": [message]})),
    )
}

fn validation_error(errors: Vec<String>) -> (StatusCode, Json<Value>) {
    (
        StatusCode::UNPROCESSABLE_ENTITY,
        Json(json!({"success": false, "message": "Validation failed", "errors": errors})),
    )
}

fn internal_error(message: String) -> (StatusCode, Json<Value>) {
    (
        StatusCode::INTERNAL_SERVER_ERROR,
        Json(json!({"success": false, "message": "Engine operation failed", "errors": [message]})),
    )
}

fn persist_module(directory: &Path, name: &str, payload: &Value) -> Result<(), String> {
    let path = directory.join(format!("{name}.json"));
    let contents = serde_json::to_vec_pretty(payload)
        .map_err(|error| format!("Could not serialize module registration: {error}"))?;
    std::fs::write(&path, contents)
        .map_err(|error| format!("Could not persist module registration: {error}"))
}

fn remove_file_if_exists(path: &Path) -> std::io::Result<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{body::{to_bytes, Body}, http::Request};
    use serde_json::json;
    use tower::ServiceExt;

    fn test_state(root: &Path) -> AppState {
        AppState::open(
            Config {
                host: "127.0.0.1".to_owned(),
                port: 0,
                secret: "test-secret".to_owned(),
                module_dir: root.join("modules"),
                database_dir: root.join("databases"),
                repository_root: None,
            },
        )
        .unwrap()
    }

    async fn request(
        state: AppState,
        method: Method,
        uri: &str,
        secret: Option<&str>,
        body: Option<&str>,
    ) -> (StatusCode, Value) {
        let mut builder = Request::builder().method(method).uri(uri);
        if let Some(secret) = secret {
            builder = builder.header("x-arkzen-secret", secret);
        }
        let request = builder
            .header(header::CONTENT_TYPE, "application/json")
            .body(body.map(|value| Body::from(value.to_owned())).unwrap_or_else(Body::empty))
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    #[tokio::test]
    async fn health_is_public_and_identifies_the_engine() {
        let directory = tempfile::tempdir().unwrap();
        let (status, body) = request(
            test_state(directory.path()),
            Method::GET,
            "/arkzen/health",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body["status"], "ok");
        assert_eq!(body["backend"], "rust");
        assert_eq!(body["variant"], "rs");
    }

    #[tokio::test]
    async fn build_requires_secret_and_validates_payload() {
        let directory = tempfile::tempdir().unwrap();
        let (status, body) = request(
            test_state(directory.path()),
            Method::POST,
            "/arkzen/build",
            None,
            Some(r#"{"name":"valid-module"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN);
        assert_eq!(body["message"], "Invalid engine secret.");

        let (status, body) = request(
            test_state(directory.path()),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(r#"{"name":"../unsafe"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert_eq!(body["success"], false);
        assert!(body["errors"][0].as_str().unwrap().contains("Invalid tatemono name"));

        let (status, body) = request(
            test_state(directory.path()),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(
                r#"{"name":"bad-schema","backendVariant":"py","databases":[{"table":"tasks;drop"}]}"#,
            ),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
        assert!(body["errors"]
            .as_array()
            .unwrap()
            .iter()
            .any(|error| error.as_str().unwrap().contains("backend (rust) reads :rs")));
        assert!(!directory.path().join("databases/bad-schema.sqlite").exists());
    }

    #[tokio::test]
    async fn build_persists_registration_and_isolated_database_then_remove_cleans_up() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        let payload = json!({
            "name": "todo-app",
            "backendVariant": "rs",
            "databases": [{
                "table": "todos",
                "columns": {
                    "title": {"type": "string"},
                    "completed": {"type": "boolean", "default": false}
                }
            }],
            "apis": [{
                "model": "Todo",
                "controller": "TodoController",
                "prefix": "/api/todo-app/todos",
                "middleware": [],
                "endpoints": {
                    "index": {"method": "GET", "route": "/", "response": {"type": "paginated"}},
                    "show": {"method": "GET", "route": "/{id}"},
                    "store": {"method": "POST", "route": "/", "validation": {"title": "required|string|max:40"}},
                    "update": {"method": "PUT", "route": "/{id}"},
                    "destroy": {"method": "DELETE", "route": "/{id}", "response": {"value": "Todo removed"}}
                }
            }]
        })
        .to_string();
        let (status, body) = request(
            state.clone(),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(&payload),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body["success"], true);
        assert_eq!(body["registry"]["name"], "todo-app");
        assert!(directory.path().join("modules/todo-app.json").is_file());
        assert!(directory.path().join("databases/todo-app.sqlite").is_file());
        assert!(body["steps"]
            .as_array()
            .unwrap()
            .iter()
            .any(|step| step.as_str().unwrap().contains("Registered 5 API routes")));

        let (status, created) = request(
            state.clone(),
            Method::POST,
            "/api/todo-app/todos",
            None,
            Some(r#"{"title":"Test CRUD"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(created["title"], "Test CRUD");
        let id = created["id"].as_i64().unwrap();

        let (status, listed) = request(
            state.clone(),
            Method::GET,
            "/api/todo-app/todos?page=1",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(listed["total"], 1);
        assert_eq!(listed["data"][0]["id"], id);

        let (status, updated) = request(
            state.clone(),
            Method::PUT,
            &format!("/api/todo-app/todos/{id}"),
            None,
            Some(r#"{"title":"Updated"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(updated["title"], "Updated");

        let (status, deleted) = request(
            state.clone(),
            Method::DELETE,
            &format!("/api/todo-app/todos/{id}"),
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(deleted["message"], "Todo removed");
        let (status, missing) = request(
            state.clone(),
            Method::GET,
            &format!("/api/todo-app/todos/{id}"),
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::NOT_FOUND);
        assert_eq!(missing["message"], "Not Found");

        let restored = test_state(directory.path());
        assert!(restored.modules.read().await.contains_key("todo-app"));
        let (status, restored_list) = request(
            restored.clone(),
            Method::GET,
            "/api/todo-app/todos",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(restored_list["total"], 0);

        let (status, body) = request(
            restored,
            Method::POST,
            "/arkzen/remove",
            Some("test-secret"),
            Some(r#"{"name":"todo-app"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body["success"], true);
        assert!(!directory.path().join("modules/todo-app.json").exists());
        assert!(!directory.path().join("databases/todo-app.sqlite").exists());
    }

    #[tokio::test]
    async fn malformed_json_has_an_explicit_client_error() {
        let directory = tempfile::tempdir().unwrap();
        let (status, body) = request(
            test_state(directory.path()),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some("{"),
        )
        .await;
        assert_eq!(status, StatusCode::BAD_REQUEST);
        assert_eq!(body["message"], "Invalid JSON request body");
        assert!(!body["errors"].as_array().unwrap().is_empty());
    }

    #[tokio::test]
    async fn registry_merges_root_project_config_and_persisted_modules() {
        let directory = tempfile::tempdir().unwrap();
        let root = directory.path().join("project");
        std::fs::create_dir_all(&root).unwrap();
        std::fs::write(
            root.join("arkzen.json"),
            r#"{"project":"sample","activeStack":"nextjs","activeBackend":"rust","activeDatabase":"sqlite","modules":[{"name":"from-root"}]}"#,
        )
        .unwrap();
        let mut config = test_state(directory.path()).config.as_ref().clone();
        config.repository_root = Some(root);
        let state = AppState::open(config).unwrap();
        state.modules.write().await.insert(
            "built-module".to_owned(),
            json!({"name":"built-module","auth":true}),
        );
        let (status, body) = request(
            state,
            Method::GET,
            "/arkzen/registry",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert_eq!(body["project"], "sample");
        assert_eq!(body["activeBackend"], "rust");
        assert_eq!(body["modules"].as_array().unwrap().len(), 2);
        assert_eq!(body["modules"][0]["name"], "built-module");
        assert_eq!(body["modules"][0]["auth"], true);
    }

    #[tokio::test]
    async fn custom_handlers_and_middleware_return_not_implemented() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        state.modules.write().await.insert(
            "custom".to_owned(),
            json!({
                "name": "custom",
                "apis": [{
                    "model": "Custom",
                    "controller": "CustomController",
                    "prefix": "/api/custom",
                    "middleware": ["auth"],
                    "endpoints": {
                        "show": {"method": "GET", "route": "/{id}", "body": "custom-code"}
                    }
                }]
            }),
        );
        let (status, body) = request(
            state.clone(),
            Method::GET,
            "/api/custom/1",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"].as_str().unwrap().contains("middleware"));

        state.modules.write().await.get_mut("custom").unwrap()["apis"][0]["middleware"] =
            json!([]);
        let (status, body) = request(
            state,
            Method::GET,
            "/api/custom/1",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"].as_str().unwrap().contains("Custom endpoint body"));
    }
}
