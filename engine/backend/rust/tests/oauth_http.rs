//! HTTP-level test: the real router, build endpoint and database, with only the provider HTTP mocked.
//!   cd engine/backend/rust && cargo test --test oauth_http
use axum::{
    body::{to_bytes, Body},
    http::{header, Method, Request, StatusCode},
};
use pluff_rust_backend::{app, AppState, Config};
use serde_json::{json, Value};
use std::sync::Arc;
use tower::ServiceExt;

const SLUG: &str = "oauth-http";

async fn send(state: &AppState, method: Method, uri: &str, headers: &[(&str, &str)], content_type: &str, body: &str) -> (StatusCode, axum::http::HeaderMap, Vec<u8>) {
    let mut builder = Request::builder().method(method).uri(uri).header(header::CONTENT_TYPE, content_type);
    for (k, v) in headers {
        builder = builder.header(*k, *v);
    }
    let response = app(state.clone()).oneshot(builder.body(Body::from(body.to_owned())).unwrap()).await.unwrap();
    let (status, headers) = (response.status(), response.headers().clone());
    (status, headers, to_bytes(response.into_body(), usize::MAX).await.unwrap().to_vec())
}

#[tokio::test]
async fn oauth_routes_work_through_the_router() {
    for (k, v) in [
        ("OAUTH_STATE_SECRET", "http-test-secret"),
        ("OAUTH_REDIRECT_BASE", "http://app.test"),
        ("OAUTH_FRONTEND_URL", "http://web.test"),
        ("OAUTH_GOOGLE_CLIENT_ID", "g-id"),
        ("OAUTH_GOOGLE_CLIENT_SECRET", "g-secret"),
    ] {
        std::env::set_var(k, v);
    }
    pluff_rust_backend::oauth::set_http_hook(Some(Arc::new(|_, url, _, _| {
        if url.starts_with("https://oauth2.googleapis.com/token") {
            (200, json!({"access_token": "at"}).to_string())
        } else if url.starts_with("https://openidconnect.googleapis.com") {
            (200, json!({"sub": "g-http", "email": "web@example.com", "email_verified": true, "name": "Web User"}).to_string())
        } else {
            (404, "{}".to_owned())
        }
    })));

    let dir = tempfile::tempdir().unwrap();
    let state = AppState::open(Config {
        host: "127.0.0.1".to_owned(),
        port: 0,
        secret: "test-secret".to_owned(),
        module_dir: dir.path().join("modules"),
        database_dir: dir.path().join("databases"),
        repository_root: None,
    })
    .unwrap();

    let payload = json!({
        "name": SLUG, "backendVariant": "rs", "auth": true, "databases": [], "apis": [],
        "oauth": {"providers": ["google", "discord"], "redirect": "/dashboard", "errorRedirect": "/login", "linkVerifiedEmail": true}
    })
    .to_string();
    let (status, _, body) = send(&state, Method::POST, "/arkzen/build", &[("x-arkzen-secret", "test-secret")], "application/json", &payload).await;
    assert_eq!(status, StatusCode::OK, "{}", String::from_utf8_lossy(&body));

    // providers list
    let (status, _, body) = send(&state, Method::GET, &format!("/api/{SLUG}/auth/oauth/providers"), &[], "application/json", "").await;
    assert_eq!(status, StatusCode::OK);
    let list: Value = serde_json::from_slice(&body).unwrap();
    assert_eq!(list["providers"][0], json!({"id": "google", "name": "Google", "enabled": true}));
    assert_eq!(list["providers"][1]["enabled"], false);

    // redirect: 302 + state cookie
    let (status, headers, _) = send(&state, Method::GET, &format!("/api/{SLUG}/auth/oauth/google/redirect"), &[], "application/json", "").await;
    assert_eq!(status, StatusCode::FOUND);
    let location = headers[header::LOCATION].to_str().unwrap().to_owned();
    assert!(location.starts_with("https://accounts.google.com/o/oauth2/v2/auth?"));
    let cookie = headers[header::SET_COOKIE].to_str().unwrap().split(';').next().unwrap().to_owned();
    let state_param = url_param(&location, "state");

    // callback as a form-encoded POST (what Apple sends): must not be rejected by the JSON body parser
    let form = format!("code=abc&state={state_param}");
    let (status, headers, _) = send(&state, Method::POST, &format!("/api/{SLUG}/auth/oauth/google/callback"), &[("cookie", &cookie)], "application/x-www-form-urlencoded", &form).await;
    assert_eq!(status, StatusCode::FOUND);
    let done = headers[header::LOCATION].to_str().unwrap().to_owned();
    assert!(done.starts_with("http://web.test/dashboard#"), "{done}");
    let token = url_param(&done, "arkzen_oauth_token");

    // the issued token is a normal bearer token for the existing /me route
    let bearer = format!("Bearer {token}");
    let (status, _, body) = send(&state, Method::GET, &format!("/api/{SLUG}/auth/me"), &[("authorization", &bearer)], "application/json", "").await;
    assert_eq!(status, StatusCode::OK, "{}", String::from_utf8_lossy(&body));
    assert_eq!(serde_json::from_slice::<Value>(&body).unwrap()["email"], "web@example.com");

    // callback without the cookie is refused and mints nothing
    let (status, headers, _) = send(&state, Method::GET, &format!("/api/{SLUG}/auth/oauth/google/callback?code=abc&state={state_param}"), &[], "application/json", "").await;
    assert_eq!(status, StatusCode::FOUND);
    let refused = headers[header::LOCATION].to_str().unwrap();
    assert!(refused.contains("arkzen_oauth_error") && !refused.contains("arkzen_oauth_token"));

    // a provider that is not declared is a 404; password login keeps working
    let (status, _, _) = send(&state, Method::GET, &format!("/api/{SLUG}/auth/oauth/github/redirect"), &[], "application/json", "").await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    let register = json!({"name": "Pw", "email": "pw@example.com", "password": "hunter2hunter2", "password_confirmation": "hunter2hunter2"}).to_string();
    let (status, _, _) = send(&state, Method::POST, &format!("/api/{SLUG}/auth/register"), &[], "application/json", &register).await;
    assert_eq!(status, StatusCode::CREATED);

    // a module that never declared oauth does not expose the routes
    let plain = json!({"name": "plain-app", "backendVariant": "rs", "auth": true, "databases": [], "apis": []}).to_string();
    send(&state, Method::POST, "/arkzen/build", &[("x-arkzen-secret", "test-secret")], "application/json", &plain).await;
    let (status, _, _) = send(&state, Method::GET, "/api/plain-app/auth/oauth/providers", &[], "application/json", "").await;
    assert_eq!(status, StatusCode::NOT_FOUND);
    pluff_rust_backend::oauth::set_http_hook(None);
}

fn url_param(url: &str, key: &str) -> String {
    let query = url.split_once('#').map(|p| p.1).unwrap_or_else(|| url.split_once('?').unwrap().1);
    form_urlencoded::parse(query.as_bytes()).find(|(k, _)| k == key).unwrap().1.into_owned()
}
