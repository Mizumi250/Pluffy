mod api;
mod auth;
mod database;
mod db;
mod emulations;
mod engine;
mod events;
mod generated_runtime;
mod generator;
mod jobs;
mod mail;
mod realtime;

mod generated_registry {
    include!(concat!(env!("OUT_DIR"), "/generated_registry.rs"));
}

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
        // Validates DB_PORT / ARKZEN_DB_PREFIX for the configured driver (sqlite or pgsql).
        database::DatabaseConfig::from_env()?;
        let port = env::var("PORT")
            .unwrap_or_else(|_| "8000".to_owned())
            .parse::<u16>()
            .map_err(|error| format!("PORT must be a valid TCP port: {error}"))?;
        let secret =
            env::var("ARKZEN_ENGINE_SECRET").unwrap_or_else(|_| "arkzen-engine-secret".to_owned());
        if secret.trim().is_empty() {
            return Err("ARKZEN_ENGINE_SECRET must not be empty".to_owned());
        }
        let repository_root = match env::var_os("PLUFF_ROOT") {
            Some(root) => {
                let root = PathBuf::from(root).canonicalize().map_err(|error| {
                    format!("PLUFF_ROOT must be an existing directory: {error}")
                })?;
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
    realtime: realtime::RealtimeHub,
}

impl AppState {
    pub fn open(config: Config) -> Result<Self, String> {
        std::fs::create_dir_all(&config.module_dir)
            .map_err(|error| format!("Could not create module registry directory: {error}"))?;
        std::fs::create_dir_all(&config.database_dir)
            .map_err(|error| format!("Could not create database directory: {error}"))?;
        let modules = load_modules(&config.module_dir)?;
        let realtime = realtime::RealtimeHub::new(
            env::var("REVERB_APP_KEY").unwrap_or_else(|_| "arkzen-key".to_owned()),
            env::var("REVERB_APP_SECRET").unwrap_or_else(|_| "arkzen-secret".to_owned()),
        );
        Ok(Self {
            config: Arc::new(config),
            modules: Arc::new(RwLock::new(modules)),
            operations: Arc::new(Mutex::new(())),
            realtime,
        })
    }
}

fn load_modules(directory: &Path) -> Result<BTreeMap<String, Value>, String> {
    let mut modules = BTreeMap::new();
    let entries = std::fs::read_dir(directory)
        .map_err(|error| format!("Could not read persistent module registry: {error}"))?;
    for entry in entries {
        let entry =
            entry.map_err(|error| format!("Could not read module registry entry: {error}"))?;
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
            return Err(format!(
                "Module file {} has an invalid name",
                path.display()
            ));
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
        .route("/arkzen/expo-registry", get(expo_registry))
        .route("/arkzen/build", post(build))
        .route("/arkzen/remove", post(remove))
        .route("/app/:app_key", get(realtime::websocket))
        .fallback(dispatch)
        .with_state(state)
        .layer(cors)
}

pub fn realtime_app(state: AppState) -> Router {
    Router::new()
        .route("/app/:app_key", get(realtime::websocket))
        .with_state(state)
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

fn is_json_content_type(content_type: Option<&str>) -> bool {
    let media_type = content_type
        .and_then(|value| value.split(';').next())
        .map(str::trim)
        .unwrap_or_default()
        .to_ascii_lowercase();
    media_type == "application/json" || media_type.ends_with("+json")
}

async fn expo_registry(axum::extract::State(state): axum::extract::State<AppState>) -> Response {
    let empty = json!({ "engine": "1.0.0", "project": "expo", "modules": [] });
    let Some(root) = &state.config.repository_root else {
        return Json(empty).into_response();
    };
    let path = root
        .join("engine")
        .join("frontend")
        .join("expo")
        .join("expo-registry.json");
    let contents = match std::fs::read_to_string(&path) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Json(empty).into_response()
        }
        Err(error) => {
            return internal_error(format!("Could not read {}: {error}", path.display()))
                .into_response()
        }
    };
    match serde_json::from_str::<Value>(&contents) {
        Ok(Value::Object(mut object)) => {
            object.entry("modules").or_insert_with(|| json!([]));
            Json(Value::Object(object)).into_response()
        }
        Ok(_) => {
            internal_error("Expo registry must contain a JSON object".to_owned()).into_response()
        }
        Err(error) => {
            internal_error(format!("Could not parse {}: {error}", path.display())).into_response()
        }
    }
}

async fn registry(axum::extract::State(state): axum::extract::State<AppState>) -> Response {
    let mut response = if let Some(root) = &state.config.repository_root {
        let path = root.join("arkzen.json");
        let canonical_path = match path.canonicalize() {
            Ok(path) => path,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => PathBuf::new(),
            Err(error) => {
                return internal_error(format!("Could not resolve {}: {error}", path.display()))
                    .into_response()
            }
        };
        if !canonical_path.as_os_str().is_empty() && !canonical_path.starts_with(root) {
            return internal_error("Root arkzen.json resolves outside PLUFF_ROOT".to_owned())
                .into_response();
        }
        if canonical_path.as_os_str().is_empty() {
            json!({})
        } else {
            match std::fs::read_to_string(&canonical_path) {
                Ok(contents) => match serde_json::from_str::<Value>(&contents) {
                    Ok(Value::Object(object)) => Value::Object(object),
                    Ok(_) => {
                        return internal_error("Root arkzen.json must contain an object".to_owned())
                            .into_response()
                    }
                    Err(error) => {
                        return internal_error(format!(
                            "Could not parse {}: {error}",
                            canonical_path.display()
                        ))
                        .into_response()
                    }
                },
                Err(error) => {
                    return internal_error(format!(
                        "Could not read {}: {error}",
                        canonical_path.display()
                    ))
                    .into_response()
                }
            }
        }
    } else {
        json!({})
    };

    let object = response
        .as_object_mut()
        .expect("registry response is an object");
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
                target.extend(
                    source
                        .iter()
                        .map(|(key, value)| (key.clone(), value.clone())),
                );
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
    let authorization = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let content_type = request
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
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
        if path == format!("/api/{slug}/auth/broadcasting/auth") {
            if method != Method::POST {
                return (
                    StatusCode::METHOD_NOT_ALLOWED,
                    Json(json!({"message": "Method not allowed"})),
                )
                    .into_response();
            }
            if module.get("auth").and_then(Value::as_bool) != Some(true) {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({"message": "Unauthenticated."})),
                )
                    .into_response();
            }
            let socket_id = body
                .get("socket_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let channel = body
                .get("channel_name")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let authorization = authorization.clone();
            let database_dir = state.config.database_dir.clone();
            let hub = state.realtime.clone();
            let auth_module = module.clone();
            let result = tokio::task::spawn_blocking(move || {
                hub.authorize_channel(
                    &auth_module,
                    &socket_id,
                    &channel,
                    authorization.as_deref(),
                    &database_dir,
                )
            })
            .await;
            return match result {
                Ok((status, payload)) => (status, Json(payload)).into_response(),
                Err(error) => {
                    internal_error(format!("Broadcast authorization worker failed: {error}"))
                        .into_response()
                }
            };
        }
        if module.get("auth").and_then(Value::as_bool) == Some(true)
            && auth::is_auth_path(&slug, &path)
        {
            let database_dir = state.config.database_dir.clone();
            let auth_module = slug.clone();
            let auth_method = method.to_string();
            let auth_path = path.clone();
            let auth_body = body.clone();
            let auth_authorization = authorization.clone();
            let result = tokio::task::spawn_blocking(move || {
                auth::handle_auth_route(
                    &database_dir,
                    &auth_module,
                    &auth_method,
                    &auth_path,
                    &auth_body,
                    auth_authorization.as_deref(),
                )
            })
            .await;
            return match result {
                Ok(Some((status, payload))) => (status, Json(payload)).into_response(),
                Ok(None) => {
                    (StatusCode::NOT_FOUND, Json(json!({"message": "Not Found"}))).into_response()
                }
                Err(error) => {
                    internal_error(format!("Auth worker failed: {error}")).into_response()
                }
            };
        }
        if let Some(route) = api::match_route(&module, method.as_str(), &path) {
            let mut broadcast_target = None;
            let mut body_for_db = body.clone();
            if realtime::broadcast_api_type(&route.endpoint) {
                let channel_type = body
                    .get("channel_type")
                    .and_then(Value::as_str)
                    .filter(|value| !value.trim().is_empty())
                    .unwrap_or("public");
                let mut user_id = None;
                if module.get("auth").and_then(Value::as_bool) == Some(true) {
                    let database_dir = state.config.database_dir.clone();
                    let auth_module = slug.clone();
                    let auth_header = authorization.clone();
                    let result = tokio::task::spawn_blocking(move || {
                        auth::authenticated_user(
                            &database_dir,
                            &auth_module,
                            auth_header.as_deref(),
                        )
                    })
                    .await;
                    match result {
                        Ok(Ok(user)) => user_id = user.map(|user| user.id),
                        Ok(Err(error)) => {
                            return internal_error(format!(
                                "Unable to resolve broadcast user: {error}"
                            ))
                            .into_response()
                        }
                        Err(error) => {
                            return internal_error(format!("Broadcast user worker failed: {error}"))
                                .into_response()
                        }
                    }
                }
                if matches!(channel_type, "private" | "presence") && user_id.is_none() {
                    return (
                        StatusCode::UNAUTHORIZED,
                        Json(json!({"message": "Unauthenticated."})),
                    )
                        .into_response();
                }
                broadcast_target =
                    realtime::resolve_broadcast_target(&module, channel_type, user_id);
                if broadcast_target.is_none() {
                    return (
                        StatusCode::UNPROCESSABLE_ENTITY,
                        Json(json!({"message": format!("No {channel_type} broadcast channel is configured.")})),
                    )
                        .into_response();
                }
                if route.schema["columns"].get("user_id").is_some() {
                    if let Some(input) = body_for_db.as_object_mut() {
                        input.insert(
                            "user_id".to_owned(),
                            user_id.map_or(Value::Null, |id| json!(id)),
                        );
                    }
                }
            }
            let mut authenticated_user = None;
            for middleware in &route.middleware {
                match middleware.as_str() {
                    Some("auth") | Some("auth:sanctum") => {
                        if module.get("auth").and_then(Value::as_bool) != Some(true) {
                            return (
                                StatusCode::NOT_IMPLEMENTED,
                                Json(json!({
                                    "message": "Authentication middleware is not enabled for this module"
                                })),
                            )
                                .into_response();
                        }
                        let database_dir = state.config.database_dir.clone();
                        let auth_module = slug.clone();
                        let authorization = authorization.clone();
                        let result = tokio::task::spawn_blocking(move || {
                            auth::authenticated_user(
                                &database_dir,
                                &auth_module,
                                authorization.as_deref(),
                            )
                        })
                        .await;
                        match result {
                            Ok(Ok(Some(user))) => authenticated_user = Some(user),
                            Ok(Ok(None)) => {
                                return (
                                    StatusCode::UNAUTHORIZED,
                                    Json(json!({"message": "Unauthenticated."})),
                                )
                                    .into_response();
                            }
                            Ok(Err(error)) => {
                                return internal_error(format!(
                                    "Unable to load authenticated user: {error}"
                                ))
                                .into_response()
                            }
                            Err(error) => {
                                return internal_error(format!(
                                    "Authenticated user worker failed: {error}"
                                ))
                                .into_response()
                            }
                        }
                    }
                    Some(required_role) if required_role.starts_with("role:") => {
                        if authenticated_user.is_none() {
                            let database_dir = state.config.database_dir.clone();
                            let auth_module = slug.clone();
                            let authorization = authorization.clone();
                            let result = tokio::task::spawn_blocking(move || {
                                auth::authenticated_user(
                                    &database_dir,
                                    &auth_module,
                                    authorization.as_deref(),
                                )
                            })
                            .await;
                            match result {
                                Ok(Ok(user)) => authenticated_user = user,
                                Ok(Err(error)) => {
                                    return internal_error(format!(
                                        "Unable to load authenticated user: {error}"
                                    ))
                                    .into_response()
                                }
                                Err(error) => {
                                    return internal_error(format!(
                                        "Authenticated user worker failed: {error}"
                                    ))
                                    .into_response()
                                }
                            }
                        }
                        let required_role = required_role.trim_start_matches("role:");
                        if !authenticated_user
                            .as_ref()
                            .is_some_and(|user| user.role == required_role)
                        {
                            return (
                                StatusCode::FORBIDDEN,
                                Json(json!({"message": format!("Role {required_role} required")})),
                            )
                                .into_response();
                        }
                    }
                    Some("requireJson") if !is_json_content_type(content_type.as_deref()) => {
                        return (
                            StatusCode::UNSUPPORTED_MEDIA_TYPE,
                            Json(json!({
                                "message": "Content-Type: application/json is required for this endpoint.",
                                "hint": "Set the Content-Type header to application/json"
                            })),
                        )
                            .into_response();
                    }
                    Some("requireJson") => {}
                    _ => {
                        return (
                            StatusCode::NOT_IMPLEMENTED,
                            Json(json!({"message": format!("Middleware {} is not implemented by the Rust engine", middleware)})),
                        )
                            .into_response();
                    }
                }
            }
            if emulations::supports(&route) {
                let database_dir = state.config.database_dir.clone();
                let emulation_module = module.clone();
                let emulation_slug = slug.clone();
                let emulation_route = route;
                let emulation_path = path.clone();
                let emulation_body = body.clone();
                let user = authenticated_user;
                let realtime_hub = state.realtime.clone();
                let result = tokio::task::spawn_blocking(move || {
                    emulations::execute(
                        &emulation_module,
                        &emulation_slug,
                        &database_dir,
                        &emulation_route,
                        &emulation_path,
                        &emulation_body,
                        user.as_ref(),
                        &realtime_hub,
                    )
                })
                .await;
                return match result {
                    Ok(Some((status, payload))) => (status, Json(payload)).into_response(),
                    Ok(None) => (
                        StatusCode::NOT_IMPLEMENTED,
                        Json(json!({"message": "Rust emulation route was not handled"})),
                    )
                        .into_response(),
                    Err(error) => {
                        internal_error(format!("Emulation worker failed: {error}")).into_response()
                    }
                };
            }
            if route.endpoint["type"] == "event_fire" && route.name == "store" {
                let database_dir = state.config.database_dir.clone();
                let slug_for_event = slug.clone();
                let module_for_event = module.clone();
                let body_for_event = body.clone();
                let result = tokio::task::spawn_blocking(move || {
                    events::fire_event(
                        &module_for_event,
                        &slug_for_event,
                        &database_dir,
                        &body_for_event,
                    )
                })
                .await;
                return match result {
                    Ok((status, payload)) => (status, Json(payload)).into_response(),
                    Err(error) => internal_error(format!("Event dispatch worker failed: {error}"))
                        .into_response(),
                };
            }
            if route.endpoint["type"] == "mail_send" && route.name == "store" {
                let database_dir = state.config.database_dir.clone();
                let slug_for_mail = slug.clone();
                let module_for_mail = module.clone();
                let table = route.table.clone();
                let schema = route.schema.clone();
                let body_for_mail = body.clone();
                let authorization_for_mail = authorization.clone();
                let mailer = env::var("MAIL_MAILER").unwrap_or_else(|_| "log".to_owned());
                let result = tokio::task::spawn_blocking(move || {
                    mail::send_mail(
                        &module_for_mail,
                        &slug_for_mail,
                        &table,
                        &schema,
                        &database_dir,
                        &body_for_mail,
                        authorization_for_mail.as_deref(),
                        &mailer,
                    )
                })
                .await;
                return match result {
                    Ok((status, payload)) => (status, Json(payload)).into_response(),
                    Err(error) => internal_error(format!("Mail delivery worker failed: {error}"))
                        .into_response(),
                };
            }
            if route.endpoint["type"] == "job_dispatch" && route.name == "store" {
                let (status, payload) =
                    jobs::dispatch(&module, &slug, &state.config.database_dir, &body);
                return (status, Json(payload)).into_response();
            }
            if !route.supported {
                if route.endpoint.get("body").and_then(Value::as_str).is_some()
                    || route.name.starts_with("handler:")
                {
                    let handler = if route.name.starts_with("handler:") {
                        route.name.clone()
                    } else {
                        format!("endpoint:{}", route.name)
                    };
                    let database_dir = state.config.database_dir.clone();
                    let user = if module.get("auth").and_then(Value::as_bool) == Some(true) {
                        let auth_module = slug.clone();
                        let authorization = authorization.clone();
                        let auth_database_dir = database_dir.clone();
                        match tokio::task::spawn_blocking(move || {
                            auth::authenticated_user(
                                &auth_database_dir,
                                &auth_module,
                                authorization.as_deref(),
                            )
                        })
                        .await
                        {
                            Ok(Ok(user)) => user,
                            Ok(Err(error)) => {
                                return internal_error(format!(
                                    "Unable to resolve generated-handler user: {error}"
                                ))
                                .into_response()
                            }
                            Err(error) => {
                                return internal_error(format!(
                                    "Generated-handler user worker failed: {error}"
                                ))
                                .into_response()
                            }
                        }
                    } else {
                        None
                    };
                    let generated = generated_registry::dispatch(
                        &slug,
                        &handler,
                        generated_runtime::RequestContext::new(
                            body.clone(),
                            path.clone(),
                            query_string.clone(),
                            user,
                            database_dir.clone(),
                        ),
                        match generated_runtime::Database::open(&database_dir, &slug) {
                            Ok(database) => database,
                            Err(error) => {
                                return internal_error(format!(
                                    "Could not open database for generated handler: {error}"
                                ))
                                .into_response()
                            }
                        },
                        generated_runtime::ResponseContext,
                    );
                    if let Some(result) = generated {
                        return match result {
                            Ok(response) => {
                                (response.status, Json(response.payload)).into_response()
                            }
                            Err(error) => internal_error(format!(
                                "Generated handler {handler} failed: {error}"
                            ))
                            .into_response(),
                        };
                    }
                    return (
                        StatusCode::NOT_IMPLEMENTED,
                        Json(json!({
                            "message": format!("No compiled Rust handler is registered for {handler}")
                        })),
                    )
                        .into_response();
                }
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
            let body_for_db = body_for_db.clone();
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
                Ok((status, payload)) => {
                    if status == StatusCode::CREATED {
                        if let Some(target) = broadcast_target {
                            state
                                .realtime
                                .broadcast_to(&target.channel, &target.event, &payload);
                        }
                    }
                    (status, Json(payload)).into_response()
                }
                Err(error) => internal_error(format!("API worker failed: {error}")).into_response(),
            };
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({"message": "Not Found"}))).into_response()
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
    if let Err(error) = generator::validate_payload_sources(&payload) {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "success": false,
                "message": "Invalid Rust handler source",
                "errors": [error],
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
    let restart_module_dir = module_dir.clone();
    let build_result = tokio::task::spawn_blocking(move || {
        let generated_path = module_dir
            .join("generated")
            .join(format!("{build_name}.rs"));
        let registration_path = module_dir.join(format!("{build_name}.json"));
        let previous_generated = read_optional_file(&generated_path)?;
        let previous_registration = read_optional_file(&registration_path)?;
        let result = (|| {
            let mut steps = database::apply_schema(&database_dir, &build_name, &build_payload)?;
            if auth::prepare_module(&database_dir, &build_name, &build_payload)? {
                steps.push("Auth users and access tokens ready".to_owned());
            }
            let generated = generator::write_module(&module_dir, &build_payload)?;
            if generated {
                steps.push("Rust handler sources updated from Tatemono :rs bodies".to_owned());
            }
            persist_module(&module_dir, &build_name, &build_payload)?;
            steps.push("Module registration persisted".to_owned());
            if generated && env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1") {
                steps.push("Rust handler compilation scheduled after module builds settle".to_owned());
            }
            Ok::<_, String>((steps, generated))
        })();
        if let Err(error) = result {
            let restore_generated = restore_optional_file(&generated_path, previous_generated);
            let restore_registration =
                restore_optional_file(&registration_path, previous_registration);
            return match (restore_generated, restore_registration) {
                (Ok(()), Ok(())) => Err(error),
                (generated, registration) => Err(format!(
                    "{error}; restoring previous generated build failed: generated source: {}; registration: {}",
                    generated.err().unwrap_or_else(|| "ok".to_owned()),
                    registration.err().unwrap_or_else(|| "ok".to_owned())
                )),
            };
        }
        result
    })
    .await;
    let (mut schema_steps, generated_sources_changed) = match build_result {
        Ok(Ok(result)) => result,
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
    if generated_sources_changed && env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1") {
        schedule_rust_restart(restart_module_dir);
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
    let database_dir = state.config.database_dir.clone();
    let module_name = name.to_owned();
    let generated_path = state
        .config
        .module_dir
        .join("generated")
        .join(format!("{name}.rs"));
    let restart = env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1");
    let generated_source_exists = generated_path.exists();
    let removal = tokio::task::spawn_blocking(move || {
        remove_file_if_exists(&module_path)
            .map_err(|error| format!("Could not remove module registration: {error}"))?;
        // SQLite: deletes the .sqlite file (+ wal/shm/journal). PostgreSQL: drops the isolated database.
        db::remove_module_database(&database_dir, &module_name)
            .map_err(|error| format!("Could not remove isolated database: {error}"))?;
        remove_file_if_exists(&generated_path)
            .map_err(|error| format!("Could not remove generated Rust source: {error}"))?;
        Ok(())
    })
    .await;
    match removal {
        Ok(Ok(())) => {}
        Ok(Err(error)) => return internal_error(error),
        Err(error) => return internal_error(format!("Removal worker failed: {error}")),
    }
    state.modules.write().await.remove(name);
    if restart && generated_source_exists {
        schedule_rust_restart(state.config.module_dir.clone());
    }

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
        Json(
            json!({"success": false, "message": "Invalid JSON request body", "errors": [message]}),
        ),
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

fn read_optional_file(path: &Path) -> Result<Option<Vec<u8>>, String> {
    match std::fs::read(path) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("Could not read {}: {error}", path.display())),
    }
}

fn restore_optional_file(path: &Path, previous: Option<Vec<u8>>) -> Result<(), String> {
    match previous {
        Some(contents) => std::fs::write(path, contents)
            .map_err(|error| format!("Could not restore {}: {error}", path.display())),
        None => remove_file_if_exists(path)
            .map_err(|error| format!("Could not remove {}: {error}", path.display())),
    }
}

fn remove_file_if_exists(path: &Path) -> std::io::Result<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

fn compile_generated_rust(module_dir: &Path) -> Result<(), String> {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR")).join("Cargo.toml");
    let cargo = env::var_os("CARGO").unwrap_or_else(|| "cargo".into());
    let output = std::process::Command::new(cargo)
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .arg("check")
        .arg("--lib")
        .arg("--manifest-path")
        .arg(&manifest)
        .env("ARKZEN_MODULE_DIR", module_dir)
        .env(
            "CARGO_TARGET_DIR",
            Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("target")
                .join("generated-check"),
        )
        .output()
        .map_err(|error| format!("Could not start Rust generated-handler build: {error}"))?;
    if !output.status.success() {
        let details = String::from_utf8_lossy(&output.stderr);
        let details = details.trim();
        let details = details
            .chars()
            .rev()
            .take(8_000)
            .collect::<String>()
            .chars()
            .rev()
            .collect::<String>();
        return Err(format!(
            "Generated Rust handlers did not pass cargo check: {details}"
        ));
    }
    Ok(())
}

fn schedule_rust_restart(module_dir: PathBuf) {
    static RESTART_GENERATION: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let generation = RESTART_GENERATION.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(3));
        if RESTART_GENERATION.load(std::sync::atomic::Ordering::SeqCst) != generation {
            return;
        }
        match compile_generated_rust(&module_dir) {
            Ok(())
                if RESTART_GENERATION.load(std::sync::atomic::Ordering::SeqCst) == generation =>
            {
                tracing::info!("Generated Rust handlers compiled; restarting to load them");
                std::process::exit(75);
            }
            Ok(()) => {}
            Err(error) => tracing::error!("{error}"),
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        http::Request,
    };
    use serde_json::json;
    use tower::ServiceExt;

    fn test_state(root: &Path) -> AppState {
        AppState::open(Config {
            host: "127.0.0.1".to_owned(),
            port: 0,
            secret: "test-secret".to_owned(),
            module_dir: root.join("modules"),
            database_dir: root.join("databases"),
            repository_root: None,
        })
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
            .body(
                body.map(|value| Body::from(value.to_owned()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    async fn request_with_bearer(
        state: AppState,
        method: Method,
        uri: &str,
        authorization: Option<&str>,
        body: Option<&str>,
    ) -> (StatusCode, Value) {
        let mut builder = Request::builder()
            .method(method)
            .uri(uri)
            .header(header::CONTENT_TYPE, "application/json");
        if let Some(authorization) = authorization {
            builder = builder.header(header::AUTHORIZATION, authorization);
        }
        let request = builder
            .body(
                body.map(|value| Body::from(value.to_owned()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    fn bearer_header(token: &str) -> String {
        let mut header = String::from("Bear");
        header.push_str("er ");
        header.push_str(token);
        header
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
        assert!(body["errors"][0]
            .as_str()
            .unwrap()
            .contains("Invalid tatemono name"));

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
        assert!(!directory
            .path()
            .join("databases/bad-schema.sqlite")
            .exists());
    }

    #[tokio::test]
    async fn auth_seeded_module_supports_auth_routes_and_bearer_middleware() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        let payload = json!({
            "name": "auth-sample",
            "backendVariant": "rs",
            "auth": true,
            "authSeed": {"users": [{
                "name": "Seeded Admin",
                "email": "admin@example.test",
                "password": "secure-password",
                "role": "admin"
            }]},
            "databases": [{
                "table": "profiles",
                "columns": {"label": {"type": "string"}}
            }],
            "apis": [{
                "model": "Profile",
                "controller": "ProfileController",
                "prefix": "/api/auth-sample/private",
                "middleware": ["auth"],
                "endpoints": {"index": {"method": "GET", "route": "/"}}
            }]
        })
        .to_string();
        let (status, build) = request(
            state.clone(),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(&payload),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{build}");

        let (status, response) = request(
            state.clone(),
            Method::POST,
            "/api/auth-sample/auth/login",
            None,
            Some(r#"{"email":"admin@example.test","password":"secure-password"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{response}");
        assert_eq!(response["user"]["role"], "admin");
        let token = response["token"].as_str().unwrap();

        let (status, body) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/auth/me",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
        assert_eq!(body["email"], "admin@example.test");

        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/private/",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, body) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/private/",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
        assert!(body["data"].is_array());

        let (status, body) = request_with_bearer(
            state,
            Method::POST,
            "/api/auth-sample/auth/logout",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
    }

    #[tokio::test]
    async fn role_notification_and_scheduler_test_emulations_match_go_behavior() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        let payload = json!({
            "name": "roles-test",
            "backendVariant": "rs",
            "auth": true,
            "authSeed": {"users": [
                {"name": "Admin User", "email": "admin@roles-test.test", "password": "password123", "role": "admin"},
                {"name": "Regular User", "email": "user@roles-test.test", "password": "password123", "role": "user"}
            ]},
            "notifications": [
                "database-ping:\n  channels: [database]\n  message: \"You have a new database notification\"\n  subject: \"Database Ping\""
            ],
            "consoles": [
                "cleanup-temp:\n  schedule: '0 * * * *'",
                "generate-report:",
                "ping-health:",
                "sync-data:"
            ],
            "databases": [
                {
                    "table": "role_audit_logs",
                    "columns": {
                        "user_id": {"type": "integer", "nullable": true},
                        "action": {"type": "string"},
                        "role_required": {"type": "string"},
                        "granted": {"type": "boolean"}
                    },
                    "timestamps": true
                },
                {
                    "table": "command_runs",
                    "columns": {
                        "command_name": {"type": "string", "nullable": false},
                        "signature": {"type": "string", "nullable": false},
                        "exit_code": {"type": "integer", "default": 0},
                        "output": {"type": "text"},
                        "triggered_by": {"type": "string", "default": "manual"},
                        "duration_ms": {"type": "integer"}
                    }
                }
            ],
            "apis": [
                {
                    "model": "RoleAuditLog",
                    "controller": "RoleAuditLogController",
                    "prefix": "/api/roles-test",
                    "middleware": ["auth"],
                    "table": "role_audit_logs",
                    "endpoints": {
                        "index": {"method": "GET", "route": "/logs", "response": {"type": "collection"}},
                        "adminOnly": {"method": "GET", "route": "/admin-only", "type": "role_admin_only"},
                        "userOnly": {"method": "GET", "route": "/user-only", "type": "role_user_only"},
                        "promote": {"method": "POST", "route": "/promote", "type": "role_promote"},
                        "demote": {"method": "POST", "route": "/demote", "type": "role_demote"}
                    }
                },
                {
                    "model": "Notification",
                    "controller": "NotificationController",
                    "prefix": "/api/notification-test",
                    "middleware": ["auth"],
                    "endpoints": {
                        "index": {"method": "GET", "route": "/inbox", "response": {"type": "collection"}},
                        "store": {"method": "POST", "route": "/trigger", "type": "notification_trigger", "validation": {"notification": "required|string"}},
                        "destroy": {"method": "DELETE", "route": "/inbox/{id}", "response": {"type": "message", "value": "Notification deleted"}},
                        "readAll": {"method": "POST", "route": "/inbox/read-all", "response": {"type": "message", "value": "All notifications marked as read"}}
                    }
                },
                {
                    "model": "CommandRun",
                    "controller": "CommandRunController",
                    "prefix": "/api/scheduler-test",
                    "endpoints": {
                        "index": {"method": "GET", "route": "/runs", "response": {"type": "paginated"}},
                        "store": {"method": "POST", "route": "/run", "type": "command_run", "validation": {"command": "required|string", "triggered_by": "sometimes|string"}},
                        "destroy": {"method": "DELETE", "route": "/runs", "response": {"type": "message", "value": "Runs cleared"}}
                    }
                }
            ]
        });
        let (status, build) = request(
            state.clone(),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(&payload.to_string()),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{build}");

        async fn login(state: AppState, email: &str) -> String {
            let (status, response) = request(
                state,
                Method::POST,
                "/api/roles-test/auth/login",
                None,
                Some(&format!(
                    r#"{{"email":"{email}","password":"password123"}}"#
                )),
            )
            .await;
            assert_eq!(status, StatusCode::OK, "{response}");
            response["token"].as_str().unwrap().to_owned()
        }
        let admin_token = login(state.clone(), "admin@roles-test.test").await;
        let user_token = login(state.clone(), "user@roles-test.test").await;

        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, response) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN, "{response}");
        assert!(response["message"]
            .as_str()
            .unwrap()
            .contains("admin role required"));
        let (status, response) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&admin_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{response}");

        let (status, promoted) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/roles-test/promote",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{promoted}");
        assert_eq!(promoted["user"]["role"], "admin");
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, demoted) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/roles-test/demote",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{demoted}");
        assert_eq!(demoted["user"]["role"], "user");
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN);

        let (status, notification) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/notification-test/trigger",
            Some(&bearer_header(&user_token)),
            Some(r#"{"notification":"database-ping"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::CREATED, "{notification}");
        let (status, inbox) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/notification-test/inbox",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{inbox}");
        assert_eq!(inbox["data"].as_array().unwrap().len(), 1);
        assert!(inbox["data"][0]["data"]
            .as_str()
            .unwrap()
            .contains("You have a new database notification"));
        let notification_id = inbox["data"][0]["id"].as_str().unwrap().to_owned();
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/notification-test/inbox/read-all",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, read_inbox) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/notification-test/inbox",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert!(read_inbox["data"][0]["read_at"].is_string());
        let (status, deleted) = request_with_bearer(
            state.clone(),
            Method::DELETE,
            &format!("/api/notification-test/inbox/{notification_id}"),
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{deleted}");

        let (status, command) = request(
            state.clone(),
            Method::POST,
            "/api/scheduler-test/run",
            Some("test-secret"),
            Some(r#"{"command":"generate-report","triggered_by":"schedule"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::CREATED, "{command}");
        assert_eq!(command["data"]["signature"], "roles-test:generate-report");
        let (status, invalid) = request(
            state.clone(),
            Method::POST,
            "/api/scheduler-test/run",
            Some("test-secret"),
            Some(r#"{"command":"arbitrary shell"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY, "{invalid}");
        let (status, cleared) = request(
            state,
            Method::DELETE,
            "/api/scheduler-test/runs",
            Some("test-secret"),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{cleared}");
        assert_eq!(cleared["message"], "Runs cleared");
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
        let (status, body) = request(state, Method::GET, "/arkzen/registry", None, None).await;
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
        let (status, body) = request(state.clone(), Method::GET, "/api/custom/1", None, None).await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"].as_str().unwrap().contains("middleware"));

        state.modules.write().await.get_mut("custom").unwrap()["apis"][0]["middleware"] = json!([]);
        let (status, body) = request(state, Method::GET, "/api/custom/1", None, None).await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"]
            .as_str()
            .unwrap()
            .contains("No compiled Rust handler"));
    }

    #[tokio::test]
    async fn require_json_middleware_rejects_missing_content_type() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        state.modules.write().await.insert(
            "middleware-test".to_owned(),
            json!({
                "name": "middleware-test",
                "databases": [{"table": "ping_logs", "columns": {"message": {"type": "string"}}}],
                "apis": [{
                    "model": "PingLog",
                    "controller": "PingLogController",
                    "table": "ping_logs",
                    "prefix": "/api/middleware-test",
                    "middleware": ["requireJson"],
                    "endpoints": {
                        "store": {"method": "POST", "route": "/ping"}
                    }
                }]
            }),
        );
        let request = Request::builder()
            .method(Method::POST)
            .uri("/api/middleware-test/ping")
            .body(Body::from(r#"{"message":"blocked"}"#))
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let body: Value = serde_json::from_slice(&body).unwrap();
        assert!(body["message"]
            .as_str()
            .unwrap()
            .contains("application/json"));
    }
}mod api;
mod auth;
mod database;
mod db;
mod emulations;
mod engine;
mod events;
mod generated_runtime;
mod generator;
mod jobs;
mod mail;
mod realtime;

mod generated_registry {
    include!(concat!(env!("OUT_DIR"), "/generated_registry.rs"));
}

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
        // Validates DB_PORT / ARKZEN_DB_PREFIX for the configured driver (sqlite or pgsql).
        database::DatabaseConfig::from_env()?;
        let port = env::var("PORT")
            .unwrap_or_else(|_| "8000".to_owned())
            .parse::<u16>()
            .map_err(|error| format!("PORT must be a valid TCP port: {error}"))?;
        let secret =
            env::var("ARKZEN_ENGINE_SECRET").unwrap_or_else(|_| "arkzen-engine-secret".to_owned());
        if secret.trim().is_empty() {
            return Err("ARKZEN_ENGINE_SECRET must not be empty".to_owned());
        }
        let repository_root = match env::var_os("PLUFF_ROOT") {
            Some(root) => {
                let root = PathBuf::from(root).canonicalize().map_err(|error| {
                    format!("PLUFF_ROOT must be an existing directory: {error}")
                })?;
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
    realtime: realtime::RealtimeHub,
}

impl AppState {
    pub fn open(config: Config) -> Result<Self, String> {
        std::fs::create_dir_all(&config.module_dir)
            .map_err(|error| format!("Could not create module registry directory: {error}"))?;
        std::fs::create_dir_all(&config.database_dir)
            .map_err(|error| format!("Could not create database directory: {error}"))?;
        let modules = load_modules(&config.module_dir)?;
        let realtime = realtime::RealtimeHub::new(
            env::var("REVERB_APP_KEY").unwrap_or_else(|_| "arkzen-key".to_owned()),
            env::var("REVERB_APP_SECRET").unwrap_or_else(|_| "arkzen-secret".to_owned()),
        );
        Ok(Self {
            config: Arc::new(config),
            modules: Arc::new(RwLock::new(modules)),
            operations: Arc::new(Mutex::new(())),
            realtime,
        })
    }
}

fn load_modules(directory: &Path) -> Result<BTreeMap<String, Value>, String> {
    let mut modules = BTreeMap::new();
    let entries = std::fs::read_dir(directory)
        .map_err(|error| format!("Could not read persistent module registry: {error}"))?;
    for entry in entries {
        let entry =
            entry.map_err(|error| format!("Could not read module registry entry: {error}"))?;
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
            return Err(format!(
                "Module file {} has an invalid name",
                path.display()
            ));
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
        .route("/arkzen/expo-registry", get(expo_registry))
        .route("/arkzen/build", post(build))
        .route("/arkzen/remove", post(remove))
        .route("/app/:app_key", get(realtime::websocket))
        .fallback(dispatch)
        .with_state(state)
        .layer(cors)
}

pub fn realtime_app(state: AppState) -> Router {
    Router::new()
        .route("/app/:app_key", get(realtime::websocket))
        .with_state(state)
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

fn is_json_content_type(content_type: Option<&str>) -> bool {
    let media_type = content_type
        .and_then(|value| value.split(';').next())
        .map(str::trim)
        .unwrap_or_default()
        .to_ascii_lowercase();
    media_type == "application/json" || media_type.ends_with("+json")
}

async fn expo_registry(axum::extract::State(state): axum::extract::State<AppState>) -> Response {
    let empty = json!({ "engine": "1.0.0", "project": "expo", "modules": [] });
    let Some(root) = &state.config.repository_root else {
        return Json(empty).into_response();
    };
    let path = root
        .join("engine")
        .join("frontend")
        .join("expo")
        .join("expo-registry.json");
    let contents = match std::fs::read_to_string(&path) {
        Ok(contents) => contents,
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => {
            return Json(empty).into_response()
        }
        Err(error) => {
            return internal_error(format!("Could not read {}: {error}", path.display()))
                .into_response()
        }
    };
    match serde_json::from_str::<Value>(&contents) {
        Ok(Value::Object(mut object)) => {
            object.entry("modules").or_insert_with(|| json!([]));
            Json(Value::Object(object)).into_response()
        }
        Ok(_) => {
            internal_error("Expo registry must contain a JSON object".to_owned()).into_response()
        }
        Err(error) => {
            internal_error(format!("Could not parse {}: {error}", path.display())).into_response()
        }
    }
}

async fn registry(axum::extract::State(state): axum::extract::State<AppState>) -> Response {
    let mut response = if let Some(root) = &state.config.repository_root {
        let path = root.join("arkzen.json");
        let canonical_path = match path.canonicalize() {
            Ok(path) => path,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => PathBuf::new(),
            Err(error) => {
                return internal_error(format!("Could not resolve {}: {error}", path.display()))
                    .into_response()
            }
        };
        if !canonical_path.as_os_str().is_empty() && !canonical_path.starts_with(root) {
            return internal_error("Root arkzen.json resolves outside PLUFF_ROOT".to_owned())
                .into_response();
        }
        if canonical_path.as_os_str().is_empty() {
            json!({})
        } else {
            match std::fs::read_to_string(&canonical_path) {
                Ok(contents) => match serde_json::from_str::<Value>(&contents) {
                    Ok(Value::Object(object)) => Value::Object(object),
                    Ok(_) => {
                        return internal_error("Root arkzen.json must contain an object".to_owned())
                            .into_response()
                    }
                    Err(error) => {
                        return internal_error(format!(
                            "Could not parse {}: {error}",
                            canonical_path.display()
                        ))
                        .into_response()
                    }
                },
                Err(error) => {
                    return internal_error(format!(
                        "Could not read {}: {error}",
                        canonical_path.display()
                    ))
                    .into_response()
                }
            }
        }
    } else {
        json!({})
    };

    let object = response
        .as_object_mut()
        .expect("registry response is an object");
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
                target.extend(
                    source
                        .iter()
                        .map(|(key, value)| (key.clone(), value.clone())),
                );
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
    let authorization = request
        .headers()
        .get(header::AUTHORIZATION)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
    let content_type = request
        .headers()
        .get(header::CONTENT_TYPE)
        .and_then(|value| value.to_str().ok())
        .map(str::to_owned);
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
        if path == format!("/api/{slug}/auth/broadcasting/auth") {
            if method != Method::POST {
                return (
                    StatusCode::METHOD_NOT_ALLOWED,
                    Json(json!({"message": "Method not allowed"})),
                )
                    .into_response();
            }
            if module.get("auth").and_then(Value::as_bool) != Some(true) {
                return (
                    StatusCode::UNAUTHORIZED,
                    Json(json!({"message": "Unauthenticated."})),
                )
                    .into_response();
            }
            let socket_id = body
                .get("socket_id")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let channel = body
                .get("channel_name")
                .and_then(Value::as_str)
                .unwrap_or_default()
                .to_owned();
            let authorization = authorization.clone();
            let database_dir = state.config.database_dir.clone();
            let hub = state.realtime.clone();
            let auth_module = module.clone();
            let result = tokio::task::spawn_blocking(move || {
                hub.authorize_channel(
                    &auth_module,
                    &socket_id,
                    &channel,
                    authorization.as_deref(),
                    &database_dir,
                )
            })
            .await;
            return match result {
                Ok((status, payload)) => (status, Json(payload)).into_response(),
                Err(error) => {
                    internal_error(format!("Broadcast authorization worker failed: {error}"))
                        .into_response()
                }
            };
        }
        if module.get("auth").and_then(Value::as_bool) == Some(true)
            && auth::is_auth_path(&slug, &path)
        {
            let database_dir = state.config.database_dir.clone();
            let auth_module = slug.clone();
            let auth_method = method.to_string();
            let auth_path = path.clone();
            let auth_body = body.clone();
            let auth_authorization = authorization.clone();
            let result = tokio::task::spawn_blocking(move || {
                auth::handle_auth_route(
                    &database_dir,
                    &auth_module,
                    &auth_method,
                    &auth_path,
                    &auth_body,
                    auth_authorization.as_deref(),
                )
            })
            .await;
            return match result {
                Ok(Some((status, payload))) => (status, Json(payload)).into_response(),
                Ok(None) => {
                    (StatusCode::NOT_FOUND, Json(json!({"message": "Not Found"}))).into_response()
                }
                Err(error) => {
                    internal_error(format!("Auth worker failed: {error}")).into_response()
                }
            };
        }
        if let Some(route) = api::match_route(&module, method.as_str(), &path) {
            let mut broadcast_target = None;
            let mut body_for_db = body.clone();
            if realtime::broadcast_api_type(&route.endpoint) {
                let channel_type = body
                    .get("channel_type")
                    .and_then(Value::as_str)
                    .filter(|value| !value.trim().is_empty())
                    .unwrap_or("public");
                let mut user_id = None;
                if module.get("auth").and_then(Value::as_bool) == Some(true) {
                    let database_dir = state.config.database_dir.clone();
                    let auth_module = slug.clone();
                    let auth_header = authorization.clone();
                    let result = tokio::task::spawn_blocking(move || {
                        auth::authenticated_user(
                            &database_dir,
                            &auth_module,
                            auth_header.as_deref(),
                        )
                    })
                    .await;
                    match result {
                        Ok(Ok(user)) => user_id = user.map(|user| user.id),
                        Ok(Err(error)) => {
                            return internal_error(format!(
                                "Unable to resolve broadcast user: {error}"
                            ))
                            .into_response()
                        }
                        Err(error) => {
                            return internal_error(format!("Broadcast user worker failed: {error}"))
                                .into_response()
                        }
                    }
                }
                if matches!(channel_type, "private" | "presence") && user_id.is_none() {
                    return (
                        StatusCode::UNAUTHORIZED,
                        Json(json!({"message": "Unauthenticated."})),
                    )
                        .into_response();
                }
                broadcast_target =
                    realtime::resolve_broadcast_target(&module, channel_type, user_id);
                if broadcast_target.is_none() {
                    return (
                        StatusCode::UNPROCESSABLE_ENTITY,
                        Json(json!({"message": format!("No {channel_type} broadcast channel is configured.")})),
                    )
                        .into_response();
                }
                if route.schema["columns"].get("user_id").is_some() {
                    if let Some(input) = body_for_db.as_object_mut() {
                        input.insert(
                            "user_id".to_owned(),
                            user_id.map_or(Value::Null, |id| json!(id)),
                        );
                    }
                }
            }
            let mut authenticated_user = None;
            for middleware in &route.middleware {
                match middleware.as_str() {
                    Some("auth") | Some("auth:sanctum") => {
                        if module.get("auth").and_then(Value::as_bool) != Some(true) {
                            return (
                                StatusCode::NOT_IMPLEMENTED,
                                Json(json!({
                                    "message": "Authentication middleware is not enabled for this module"
                                })),
                            )
                                .into_response();
                        }
                        let database_dir = state.config.database_dir.clone();
                        let auth_module = slug.clone();
                        let authorization = authorization.clone();
                        let result = tokio::task::spawn_blocking(move || {
                            auth::authenticated_user(
                                &database_dir,
                                &auth_module,
                                authorization.as_deref(),
                            )
                        })
                        .await;
                        match result {
                            Ok(Ok(Some(user))) => authenticated_user = Some(user),
                            Ok(Ok(None)) => {
                                return (
                                    StatusCode::UNAUTHORIZED,
                                    Json(json!({"message": "Unauthenticated."})),
                                )
                                    .into_response();
                            }
                            Ok(Err(error)) => {
                                return internal_error(format!(
                                    "Unable to load authenticated user: {error}"
                                ))
                                .into_response()
                            }
                            Err(error) => {
                                return internal_error(format!(
                                    "Authenticated user worker failed: {error}"
                                ))
                                .into_response()
                            }
                        }
                    }
                    Some(required_role) if required_role.starts_with("role:") => {
                        if authenticated_user.is_none() {
                            let database_dir = state.config.database_dir.clone();
                            let auth_module = slug.clone();
                            let authorization = authorization.clone();
                            let result = tokio::task::spawn_blocking(move || {
                                auth::authenticated_user(
                                    &database_dir,
                                    &auth_module,
                                    authorization.as_deref(),
                                )
                            })
                            .await;
                            match result {
                                Ok(Ok(user)) => authenticated_user = user,
                                Ok(Err(error)) => {
                                    return internal_error(format!(
                                        "Unable to load authenticated user: {error}"
                                    ))
                                    .into_response()
                                }
                                Err(error) => {
                                    return internal_error(format!(
                                        "Authenticated user worker failed: {error}"
                                    ))
                                    .into_response()
                                }
                            }
                        }
                        let required_role = required_role.trim_start_matches("role:");
                        if !authenticated_user
                            .as_ref()
                            .is_some_and(|user| user.role == required_role)
                        {
                            return (
                                StatusCode::FORBIDDEN,
                                Json(json!({"message": format!("Role {required_role} required")})),
                            )
                                .into_response();
                        }
                    }
                    Some("requireJson") if !is_json_content_type(content_type.as_deref()) => {
                        return (
                            StatusCode::UNSUPPORTED_MEDIA_TYPE,
                            Json(json!({
                                "message": "Content-Type: application/json is required for this endpoint.",
                                "hint": "Set the Content-Type header to application/json"
                            })),
                        )
                            .into_response();
                    }
                    Some("requireJson") => {}
                    _ => {
                        return (
                            StatusCode::NOT_IMPLEMENTED,
                            Json(json!({"message": format!("Middleware {} is not implemented by the Rust engine", middleware)})),
                        )
                            .into_response();
                    }
                }
            }
            if emulations::supports(&route) {
                let database_dir = state.config.database_dir.clone();
                let emulation_module = module.clone();
                let emulation_slug = slug.clone();
                let emulation_route = route;
                let emulation_path = path.clone();
                let emulation_body = body.clone();
                let user = authenticated_user;
                let realtime_hub = state.realtime.clone();
                let result = tokio::task::spawn_blocking(move || {
                    emulations::execute(
                        &emulation_module,
                        &emulation_slug,
                        &database_dir,
                        &emulation_route,
                        &emulation_path,
                        &emulation_body,
                        user.as_ref(),
                        &realtime_hub,
                    )
                })
                .await;
                return match result {
                    Ok(Some((status, payload))) => (status, Json(payload)).into_response(),
                    Ok(None) => (
                        StatusCode::NOT_IMPLEMENTED,
                        Json(json!({"message": "Rust emulation route was not handled"})),
                    )
                        .into_response(),
                    Err(error) => {
                        internal_error(format!("Emulation worker failed: {error}")).into_response()
                    }
                };
            }
            if route.endpoint["type"] == "event_fire" && route.name == "store" {
                let database_dir = state.config.database_dir.clone();
                let slug_for_event = slug.clone();
                let module_for_event = module.clone();
                let body_for_event = body.clone();
                let result = tokio::task::spawn_blocking(move || {
                    events::fire_event(
                        &module_for_event,
                        &slug_for_event,
                        &database_dir,
                        &body_for_event,
                    )
                })
                .await;
                return match result {
                    Ok((status, payload)) => (status, Json(payload)).into_response(),
                    Err(error) => internal_error(format!("Event dispatch worker failed: {error}"))
                        .into_response(),
                };
            }
            if route.endpoint["type"] == "mail_send" && route.name == "store" {
                let database_dir = state.config.database_dir.clone();
                let slug_for_mail = slug.clone();
                let module_for_mail = module.clone();
                let table = route.table.clone();
                let schema = route.schema.clone();
                let body_for_mail = body.clone();
                let authorization_for_mail = authorization.clone();
                let mailer = env::var("MAIL_MAILER").unwrap_or_else(|_| "log".to_owned());
                let result = tokio::task::spawn_blocking(move || {
                    mail::send_mail(
                        &module_for_mail,
                        &slug_for_mail,
                        &table,
                        &schema,
                        &database_dir,
                        &body_for_mail,
                        authorization_for_mail.as_deref(),
                        &mailer,
                    )
                })
                .await;
                return match result {
                    Ok((status, payload)) => (status, Json(payload)).into_response(),
                    Err(error) => internal_error(format!("Mail delivery worker failed: {error}"))
                        .into_response(),
                };
            }
            if route.endpoint["type"] == "job_dispatch" && route.name == "store" {
                let (status, payload) =
                    jobs::dispatch(&module, &slug, &state.config.database_dir, &body);
                return (status, Json(payload)).into_response();
            }
            if !route.supported {
                if route.endpoint.get("body").and_then(Value::as_str).is_some()
                    || route.name.starts_with("handler:")
                {
                    let handler = if route.name.starts_with("handler:") {
                        route.name.clone()
                    } else {
                        format!("endpoint:{}", route.name)
                    };
                    let database_dir = state.config.database_dir.clone();
                    let user = if module.get("auth").and_then(Value::as_bool) == Some(true) {
                        let auth_module = slug.clone();
                        let authorization = authorization.clone();
                        let auth_database_dir = database_dir.clone();
                        match tokio::task::spawn_blocking(move || {
                            auth::authenticated_user(
                                &auth_database_dir,
                                &auth_module,
                                authorization.as_deref(),
                            )
                        })
                        .await
                        {
                            Ok(Ok(user)) => user,
                            Ok(Err(error)) => {
                                return internal_error(format!(
                                    "Unable to resolve generated-handler user: {error}"
                                ))
                                .into_response()
                            }
                            Err(error) => {
                                return internal_error(format!(
                                    "Generated-handler user worker failed: {error}"
                                ))
                                .into_response()
                            }
                        }
                    } else {
                        None
                    };
                    let generated = generated_registry::dispatch(
                        &slug,
                        &handler,
                        generated_runtime::RequestContext::new(
                            body.clone(),
                            path.clone(),
                            query_string.clone(),
                            user,
                            database_dir.clone(),
                        ),
                        match generated_runtime::Database::open(&database_dir, &slug) {
                            Ok(database) => database,
                            Err(error) => {
                                return internal_error(format!(
                                    "Could not open database for generated handler: {error}"
                                ))
                                .into_response()
                            }
                        },
                        generated_runtime::ResponseContext,
                    );
                    if let Some(result) = generated {
                        return match result {
                            Ok(response) => {
                                (response.status, Json(response.payload)).into_response()
                            }
                            Err(error) => internal_error(format!(
                                "Generated handler {handler} failed: {error}"
                            ))
                            .into_response(),
                        };
                    }
                    return (
                        StatusCode::NOT_IMPLEMENTED,
                        Json(json!({
                            "message": format!("No compiled Rust handler is registered for {handler}")
                        })),
                    )
                        .into_response();
                }
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
            let body_for_db = body_for_db.clone();
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
                Ok((status, payload)) => {
                    if status == StatusCode::CREATED {
                        if let Some(target) = broadcast_target {
                            state
                                .realtime
                                .broadcast_to(&target.channel, &target.event, &payload);
                        }
                    }
                    (status, Json(payload)).into_response()
                }
                Err(error) => internal_error(format!("API worker failed: {error}")).into_response(),
            };
        }
    }
    (StatusCode::NOT_FOUND, Json(json!({"message": "Not Found"}))).into_response()
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
    if let Err(error) = generator::validate_payload_sources(&payload) {
        return (
            StatusCode::UNPROCESSABLE_ENTITY,
            Json(json!({
                "success": false,
                "message": "Invalid Rust handler source",
                "errors": [error],
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
    let restart_module_dir = module_dir.clone();
    let build_result = tokio::task::spawn_blocking(move || {
        let generated_path = module_dir
            .join("generated")
            .join(format!("{build_name}.rs"));
        let registration_path = module_dir.join(format!("{build_name}.json"));
        let previous_generated = read_optional_file(&generated_path)?;
        let previous_registration = read_optional_file(&registration_path)?;
        let result = (|| {
            let mut steps = database::apply_schema(&database_dir, &build_name, &build_payload)?;
            if auth::prepare_module(&database_dir, &build_name, &build_payload)? {
                steps.push("Auth users and access tokens ready".to_owned());
            }
            let generated = generator::write_module(&module_dir, &build_payload)?;
            if generated {
                steps.push("Rust handler sources updated from Tatemono :rs bodies".to_owned());
            }
            persist_module(&module_dir, &build_name, &build_payload)?;
            steps.push("Module registration persisted".to_owned());
            if generated && env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1") {
                steps.push("Rust handler compilation scheduled after module builds settle".to_owned());
            }
            Ok::<_, String>((steps, generated))
        })();
        if let Err(error) = result {
            let restore_generated = restore_optional_file(&generated_path, previous_generated);
            let restore_registration =
                restore_optional_file(&registration_path, previous_registration);
            return match (restore_generated, restore_registration) {
                (Ok(()), Ok(())) => Err(error),
                (generated, registration) => Err(format!(
                    "{error}; restoring previous generated build failed: generated source: {}; registration: {}",
                    generated.err().unwrap_or_else(|| "ok".to_owned()),
                    registration.err().unwrap_or_else(|| "ok".to_owned())
                )),
            };
        }
        result
    })
    .await;
    let (mut schema_steps, generated_sources_changed) = match build_result {
        Ok(Ok(result)) => result,
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
    if generated_sources_changed && env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1") {
        schedule_rust_restart(restart_module_dir);
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
    let database_dir = state.config.database_dir.clone();
    let module_name = name.to_owned();
    let generated_path = state
        .config
        .module_dir
        .join("generated")
        .join(format!("{name}.rs"));
    let restart = env::var("ARKZEN_RUST_AUTORESTART").as_deref() == Ok("1");
    let generated_source_exists = generated_path.exists();
    let removal = tokio::task::spawn_blocking(move || {
        remove_file_if_exists(&module_path)
            .map_err(|error| format!("Could not remove module registration: {error}"))?;
        // SQLite: deletes the .sqlite file (+ wal/shm/journal). PostgreSQL: drops the isolated database.
        db::remove_module_database(&database_dir, &module_name)
            .map_err(|error| format!("Could not remove isolated database: {error}"))?;
        remove_file_if_exists(&generated_path)
            .map_err(|error| format!("Could not remove generated Rust source: {error}"))?;
        Ok(())
    })
    .await;
    match removal {
        Ok(Ok(())) => {}
        Ok(Err(error)) => return internal_error(error),
        Err(error) => return internal_error(format!("Removal worker failed: {error}")),
    }
    state.modules.write().await.remove(name);
    if restart && generated_source_exists {
        schedule_rust_restart(state.config.module_dir.clone());
    }

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
        Json(
            json!({"success": false, "message": "Invalid JSON request body", "errors": [message]}),
        ),
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

fn read_optional_file(path: &Path) -> Result<Option<Vec<u8>>, String> {
    match std::fs::read(path) {
        Ok(contents) => Ok(Some(contents)),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(None),
        Err(error) => Err(format!("Could not read {}: {error}", path.display())),
    }
}

fn restore_optional_file(path: &Path, previous: Option<Vec<u8>>) -> Result<(), String> {
    match previous {
        Some(contents) => std::fs::write(path, contents)
            .map_err(|error| format!("Could not restore {}: {error}", path.display())),
        None => remove_file_if_exists(path)
            .map_err(|error| format!("Could not remove {}: {error}", path.display())),
    }
}

fn remove_file_if_exists(path: &Path) -> std::io::Result<()> {
    match std::fs::remove_file(path) {
        Ok(()) => Ok(()),
        Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(()),
        Err(error) => Err(error),
    }
}

fn compile_generated_rust(module_dir: &Path) -> Result<(), String> {
    let manifest = Path::new(env!("CARGO_MANIFEST_DIR")).join("Cargo.toml");
    let cargo = env::var_os("CARGO").unwrap_or_else(|| "cargo".into());
    let output = std::process::Command::new(cargo)
        .current_dir(env!("CARGO_MANIFEST_DIR"))
        .arg("check")
        .arg("--lib")
        .arg("--manifest-path")
        .arg(&manifest)
        .env("ARKZEN_MODULE_DIR", module_dir)
        .env(
            "CARGO_TARGET_DIR",
            Path::new(env!("CARGO_MANIFEST_DIR"))
                .join("target")
                .join("generated-check"),
        )
        .output()
        .map_err(|error| format!("Could not start Rust generated-handler build: {error}"))?;
    if !output.status.success() {
        let details = String::from_utf8_lossy(&output.stderr);
        let details = details.trim();
        let details = details
            .chars()
            .rev()
            .take(8_000)
            .collect::<String>()
            .chars()
            .rev()
            .collect::<String>();
        return Err(format!(
            "Generated Rust handlers did not pass cargo check: {details}"
        ));
    }
    Ok(())
}

fn schedule_rust_restart(module_dir: PathBuf) {
    static RESTART_GENERATION: std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
    let generation = RESTART_GENERATION.fetch_add(1, std::sync::atomic::Ordering::SeqCst) + 1;
    std::thread::spawn(move || {
        std::thread::sleep(std::time::Duration::from_secs(3));
        if RESTART_GENERATION.load(std::sync::atomic::Ordering::SeqCst) != generation {
            return;
        }
        match compile_generated_rust(&module_dir) {
            Ok(())
                if RESTART_GENERATION.load(std::sync::atomic::Ordering::SeqCst) == generation =>
            {
                tracing::info!("Generated Rust handlers compiled; restarting to load them");
                std::process::exit(75);
            }
            Ok(()) => {}
            Err(error) => tracing::error!("{error}"),
        }
    });
}

#[cfg(test)]
mod tests {
    use super::*;
    use axum::{
        body::{to_bytes, Body},
        http::Request,
    };
    use serde_json::json;
    use tower::ServiceExt;

    fn test_state(root: &Path) -> AppState {
        AppState::open(Config {
            host: "127.0.0.1".to_owned(),
            port: 0,
            secret: "test-secret".to_owned(),
            module_dir: root.join("modules"),
            database_dir: root.join("databases"),
            repository_root: None,
        })
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
            .body(
                body.map(|value| Body::from(value.to_owned()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    async fn request_with_bearer(
        state: AppState,
        method: Method,
        uri: &str,
        authorization: Option<&str>,
        body: Option<&str>,
    ) -> (StatusCode, Value) {
        let mut builder = Request::builder()
            .method(method)
            .uri(uri)
            .header(header::CONTENT_TYPE, "application/json");
        if let Some(authorization) = authorization {
            builder = builder.header(header::AUTHORIZATION, authorization);
        }
        let request = builder
            .body(
                body.map(|value| Body::from(value.to_owned()))
                    .unwrap_or_else(Body::empty),
            )
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        let status = response.status();
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        (status, serde_json::from_slice(&body).unwrap())
    }

    fn bearer_header(token: &str) -> String {
        let mut header = String::from("Bear");
        header.push_str("er ");
        header.push_str(token);
        header
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
        assert!(body["errors"][0]
            .as_str()
            .unwrap()
            .contains("Invalid tatemono name"));

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
        assert!(!directory
            .path()
            .join("databases/bad-schema.sqlite")
            .exists());
    }

    #[tokio::test]
    async fn auth_seeded_module_supports_auth_routes_and_bearer_middleware() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        let payload = json!({
            "name": "auth-sample",
            "backendVariant": "rs",
            "auth": true,
            "authSeed": {"users": [{
                "name": "Seeded Admin",
                "email": "admin@example.test",
                "password": "secure-password",
                "role": "admin"
            }]},
            "databases": [{
                "table": "profiles",
                "columns": {"label": {"type": "string"}}
            }],
            "apis": [{
                "model": "Profile",
                "controller": "ProfileController",
                "prefix": "/api/auth-sample/private",
                "middleware": ["auth"],
                "endpoints": {"index": {"method": "GET", "route": "/"}}
            }]
        })
        .to_string();
        let (status, build) = request(
            state.clone(),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(&payload),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{build}");

        let (status, response) = request(
            state.clone(),
            Method::POST,
            "/api/auth-sample/auth/login",
            None,
            Some(r#"{"email":"admin@example.test","password":"secure-password"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{response}");
        assert_eq!(response["user"]["role"], "admin");
        let token = response["token"].as_str().unwrap();

        let (status, body) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/auth/me",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
        assert_eq!(body["email"], "admin@example.test");

        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/private/",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, body) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/auth-sample/private/",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
        assert!(body["data"].is_array());

        let (status, body) = request_with_bearer(
            state,
            Method::POST,
            "/api/auth-sample/auth/logout",
            Some(&bearer_header(token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{body}");
    }

    #[tokio::test]
    async fn role_notification_and_scheduler_test_emulations_match_go_behavior() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        let payload = json!({
            "name": "roles-test",
            "backendVariant": "rs",
            "auth": true,
            "authSeed": {"users": [
                {"name": "Admin User", "email": "admin@roles-test.test", "password": "password123", "role": "admin"},
                {"name": "Regular User", "email": "user@roles-test.test", "password": "password123", "role": "user"}
            ]},
            "notifications": [
                "database-ping:\n  channels: [database]\n  message: \"You have a new database notification\"\n  subject: \"Database Ping\""
            ],
            "consoles": [
                "cleanup-temp:\n  schedule: '0 * * * *'",
                "generate-report:",
                "ping-health:",
                "sync-data:"
            ],
            "databases": [
                {
                    "table": "role_audit_logs",
                    "columns": {
                        "user_id": {"type": "integer", "nullable": true},
                        "action": {"type": "string"},
                        "role_required": {"type": "string"},
                        "granted": {"type": "boolean"}
                    },
                    "timestamps": true
                },
                {
                    "table": "command_runs",
                    "columns": {
                        "command_name": {"type": "string", "nullable": false},
                        "signature": {"type": "string", "nullable": false},
                        "exit_code": {"type": "integer", "default": 0},
                        "output": {"type": "text"},
                        "triggered_by": {"type": "string", "default": "manual"},
                        "duration_ms": {"type": "integer"}
                    }
                }
            ],
            "apis": [
                {
                    "model": "RoleAuditLog",
                    "controller": "RoleAuditLogController",
                    "prefix": "/api/roles-test",
                    "middleware": ["auth"],
                    "table": "role_audit_logs",
                    "endpoints": {
                        "index": {"method": "GET", "route": "/logs", "response": {"type": "collection"}},
                        "adminOnly": {"method": "GET", "route": "/admin-only", "type": "role_admin_only"},
                        "userOnly": {"method": "GET", "route": "/user-only", "type": "role_user_only"},
                        "promote": {"method": "POST", "route": "/promote", "type": "role_promote"},
                        "demote": {"method": "POST", "route": "/demote", "type": "role_demote"}
                    }
                },
                {
                    "model": "Notification",
                    "controller": "NotificationController",
                    "prefix": "/api/notification-test",
                    "middleware": ["auth"],
                    "endpoints": {
                        "index": {"method": "GET", "route": "/inbox", "response": {"type": "collection"}},
                        "store": {"method": "POST", "route": "/trigger", "type": "notification_trigger", "validation": {"notification": "required|string"}},
                        "destroy": {"method": "DELETE", "route": "/inbox/{id}", "response": {"type": "message", "value": "Notification deleted"}},
                        "readAll": {"method": "POST", "route": "/inbox/read-all", "response": {"type": "message", "value": "All notifications marked as read"}}
                    }
                },
                {
                    "model": "CommandRun",
                    "controller": "CommandRunController",
                    "prefix": "/api/scheduler-test",
                    "endpoints": {
                        "index": {"method": "GET", "route": "/runs", "response": {"type": "paginated"}},
                        "store": {"method": "POST", "route": "/run", "type": "command_run", "validation": {"command": "required|string", "triggered_by": "sometimes|string"}},
                        "destroy": {"method": "DELETE", "route": "/runs", "response": {"type": "message", "value": "Runs cleared"}}
                    }
                }
            ]
        });
        let (status, build) = request(
            state.clone(),
            Method::POST,
            "/arkzen/build",
            Some("test-secret"),
            Some(&payload.to_string()),
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{build}");

        async fn login(state: AppState, email: &str) -> String {
            let (status, response) = request(
                state,
                Method::POST,
                "/api/roles-test/auth/login",
                None,
                Some(&format!(
                    r#"{{"email":"{email}","password":"password123"}}"#
                )),
            )
            .await;
            assert_eq!(status, StatusCode::OK, "{response}");
            response["token"].as_str().unwrap().to_owned()
        }
        let admin_token = login(state.clone(), "admin@roles-test.test").await;
        let user_token = login(state.clone(), "user@roles-test.test").await;

        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            None,
            None,
        )
        .await;
        assert_eq!(status, StatusCode::UNAUTHORIZED);
        let (status, response) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN, "{response}");
        assert!(response["message"]
            .as_str()
            .unwrap()
            .contains("admin role required"));
        let (status, response) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&admin_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{response}");

        let (status, promoted) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/roles-test/promote",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{promoted}");
        assert_eq!(promoted["user"]["role"], "admin");
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, demoted) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/roles-test/demote",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{demoted}");
        assert_eq!(demoted["user"]["role"], "user");
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/roles-test/admin-only",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::FORBIDDEN);

        let (status, notification) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/notification-test/trigger",
            Some(&bearer_header(&user_token)),
            Some(r#"{"notification":"database-ping"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::CREATED, "{notification}");
        let (status, inbox) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/notification-test/inbox",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{inbox}");
        assert_eq!(inbox["data"].as_array().unwrap().len(), 1);
        assert!(inbox["data"][0]["data"]
            .as_str()
            .unwrap()
            .contains("You have a new database notification"));
        let notification_id = inbox["data"][0]["id"].as_str().unwrap().to_owned();
        let (status, _) = request_with_bearer(
            state.clone(),
            Method::POST,
            "/api/notification-test/inbox/read-all",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        let (status, read_inbox) = request_with_bearer(
            state.clone(),
            Method::GET,
            "/api/notification-test/inbox",
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK);
        assert!(read_inbox["data"][0]["read_at"].is_string());
        let (status, deleted) = request_with_bearer(
            state.clone(),
            Method::DELETE,
            &format!("/api/notification-test/inbox/{notification_id}"),
            Some(&bearer_header(&user_token)),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{deleted}");

        let (status, command) = request(
            state.clone(),
            Method::POST,
            "/api/scheduler-test/run",
            Some("test-secret"),
            Some(r#"{"command":"generate-report","triggered_by":"schedule"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::CREATED, "{command}");
        assert_eq!(command["data"]["signature"], "roles-test:generate-report");
        let (status, invalid) = request(
            state.clone(),
            Method::POST,
            "/api/scheduler-test/run",
            Some("test-secret"),
            Some(r#"{"command":"arbitrary shell"}"#),
        )
        .await;
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY, "{invalid}");
        let (status, cleared) = request(
            state,
            Method::DELETE,
            "/api/scheduler-test/runs",
            Some("test-secret"),
            None,
        )
        .await;
        assert_eq!(status, StatusCode::OK, "{cleared}");
        assert_eq!(cleared["message"], "Runs cleared");
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
        let (status, body) = request(state, Method::GET, "/arkzen/registry", None, None).await;
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
        let (status, body) = request(state.clone(), Method::GET, "/api/custom/1", None, None).await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"].as_str().unwrap().contains("middleware"));

        state.modules.write().await.get_mut("custom").unwrap()["apis"][0]["middleware"] = json!([]);
        let (status, body) = request(state, Method::GET, "/api/custom/1", None, None).await;
        assert_eq!(status, StatusCode::NOT_IMPLEMENTED);
        assert!(body["message"]
            .as_str()
            .unwrap()
            .contains("No compiled Rust handler"));
    }

    #[tokio::test]
    async fn require_json_middleware_rejects_missing_content_type() {
        let directory = tempfile::tempdir().unwrap();
        let state = test_state(directory.path());
        state.modules.write().await.insert(
            "middleware-test".to_owned(),
            json!({
                "name": "middleware-test",
                "databases": [{"table": "ping_logs", "columns": {"message": {"type": "string"}}}],
                "apis": [{
                    "model": "PingLog",
                    "controller": "PingLogController",
                    "table": "ping_logs",
                    "prefix": "/api/middleware-test",
                    "middleware": ["requireJson"],
                    "endpoints": {
                        "store": {"method": "POST", "route": "/ping"}
                    }
                }]
            }),
        );
        let request = Request::builder()
            .method(Method::POST)
            .uri("/api/middleware-test/ping")
            .body(Body::from(r#"{"message":"blocked"}"#))
            .unwrap();
        let response = app(state).oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::UNSUPPORTED_MEDIA_TYPE);
        let body = to_bytes(response.into_body(), usize::MAX).await.unwrap();
        let body: Value = serde_json::from_slice(&body).unwrap();
        assert!(body["message"]
            .as_str()
            .unwrap()
            .contains("application/json"));
    }
}