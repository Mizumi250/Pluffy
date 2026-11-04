use crate::{auth, AppState};
use axum::{
    extract::{
        ws::{Message, WebSocket, WebSocketUpgrade},
        Path, State,
    },
    http::StatusCode,
    response::IntoResponse,
};
use serde_json::{json, Map, Value};
use sha2::{Digest, Sha256};
use std::{
    collections::{HashMap, HashSet},
    sync::{
        atomic::{AtomicU64, Ordering},
        Arc, Mutex,
    },
    time::{SystemTime, UNIX_EPOCH},
};
use tokio::sync::mpsc::{unbounded_channel, UnboundedSender};

static NEXT_SOCKET_ID: AtomicU64 = AtomicU64::new(1);

#[derive(Clone)]
pub(crate) struct RealtimeHub {
    app_key: String,
    app_secret: String,
    inner: Arc<Mutex<HubInner>>,
}

#[derive(Default)]
struct HubInner {
    clients: HashMap<String, Client>,
    channels: HashMap<String, HashSet<String>>,
}

struct Client {
    sender: UnboundedSender<Message>,
    channels: HashSet<String>,
    presence: HashMap<String, Value>,
}

#[derive(Clone, Debug)]
struct RealtimeSection {
    name: String,
    values: HashMap<String, String>,
}

#[derive(Clone, Debug, PartialEq, Eq)]
pub(crate) struct BroadcastTarget {
    pub channel: String,
    pub event: String,
}

impl RealtimeHub {
    pub(crate) fn new(app_key: String, app_secret: String) -> Self {
        Self {
            app_key,
            app_secret,
            inner: Arc::new(Mutex::new(HubInner::default())),
        }
    }

    fn app_key(&self) -> &str {
        &self.app_key
    }

    fn sign_channel(&self, socket_id: &str, channel: &str, channel_data: Option<&str>) -> String {
        let message = match channel_data {
            Some(data) => format!("{socket_id}:{channel}:{data}"),
            None => format!("{socket_id}:{channel}"),
        };
        format!(
            "{}:{}",
            self.app_key,
            hex(&hmac_sha256(self.app_secret.as_bytes(), message.as_bytes()))
        )
    }

    pub(crate) fn authorize_channel(
        &self,
        module: &Value,
        socket_id: &str,
        channel: &str,
        authorization: Option<&str>,
        database_dir: &std::path::Path,
    ) -> (StatusCode, Value) {
        if socket_id.trim().is_empty() || channel.trim().is_empty() {
            return (
                StatusCode::UNPROCESSABLE_ENTITY,
                json!({"message": "Missing socket_id or channel_name."}),
            );
        }
        let Some(authorization) = authorization else {
            return (
                StatusCode::UNAUTHORIZED,
                json!({"message": "Unauthenticated."}),
            );
        };
        let user = match auth::authenticated_user(
            database_dir,
            module["name"].as_str().unwrap_or_default(),
            Some(authorization),
        ) {
            Ok(Some(user)) => user,
            Ok(None) => {
                return (
                    StatusCode::UNAUTHORIZED,
                    json!({"message": "Unauthenticated."}),
                )
            }
            Err(error) => {
                tracing::error!("Unable to resolve user for broadcast authorization: {error}");
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": "Unable to resolve authenticated user"}),
                );
            }
        };

        let Some(channel_type) = channel_type(channel) else {
            return (
                StatusCode::FORBIDDEN,
                json!({"message": "Invalid channel or unauthorized."}),
            );
        };
        let channel_name = &channel[channel_type.len() + 1..];
        let authorized =
            notification_channel_authorized(module, channel_type, channel_name, user.id)
                || realtime_sections(module).into_iter().any(|section| {
                    if section.values.get("type").map(String::as_str) != Some(channel_type) {
                        return false;
                    }
                    let Some((matches, captures)) = match_channel(&section.name, channel_name)
                    else {
                        return false;
                    };
                    if !matches {
                        return false;
                    }
                    match section
                        .values
                        .get("auth")
                        .map(String::as_str)
                        .unwrap_or("authenticated")
                    {
                        "owner" => captures
                            .first()
                            .is_some_and(|id| id == &user.id.to_string()),
                        "admin" => user.role == "admin",
                        _ => true,
                    }
                });
        if !authorized {
            return (
                StatusCode::FORBIDDEN,
                json!({"message": "Invalid channel or unauthorized."}),
            );
        }

        let channel_data = (channel_type == "presence").then(|| {
            json!({
                "user_id": user.id,
                "user_info": { "name": if user.name.is_empty() { user.email.clone() } else { user.name.clone() } }
            }).to_string()
        });
        let signature = self.sign_channel(socket_id, channel, channel_data.as_deref());
        let mut response = json!({"auth": signature});
        if let Some(channel_data) = channel_data {
            response["channel_data"] = Value::String(channel_data);
        }
        (StatusCode::OK, response)
    }

    pub(crate) fn broadcast_to(&self, channel: &str, event: &str, data: &Value) {
        let Ok(inner) = self.inner.lock() else {
            tracing::error!("Realtime hub lock poisoned while broadcasting");
            return;
        };
        let Some(subscribers) = inner.channels.get(channel) else {
            return;
        };
        let message = pusher_message(event, data, Some(channel));
        for socket_id in subscribers {
            if let Some(client) = inner.clients.get(socket_id) {
                let _ = client.sender.send(Message::Text(message.clone()));
            }
        }
    }
}

pub(crate) async fn websocket(
    State(state): State<AppState>,
    Path(app_key): Path<String>,
    upgrade: WebSocketUpgrade,
) -> impl IntoResponse {
    if app_key != state.realtime.app_key() {
        return StatusCode::NOT_FOUND.into_response();
    }
    upgrade
        .on_upgrade(move |socket| handle_socket(socket, state.realtime))
        .into_response()
}

async fn handle_socket(mut socket: WebSocket, hub: RealtimeHub) {
    let socket_id = new_socket_id();
    let (sender, mut receiver) = unbounded_channel::<Message>();
    if let Ok(mut inner) = hub.inner.lock() {
        inner.clients.insert(
            socket_id.clone(),
            Client {
                sender: sender.clone(),
                channels: HashSet::new(),
                presence: HashMap::new(),
            },
        );
    } else {
        tracing::error!("Realtime hub lock poisoned while adding a client");
        return;
    }
    let established = pusher_message(
        "pusher:connection_established",
        &json!({"socket_id": socket_id, "activity_timeout": 30}),
        None,
    );
    if sender.send(Message::Text(established)).is_err() {
        remove_client(&hub, &socket_id);
        return;
    }

    loop {
        tokio::select! {
            outgoing = receiver.recv() => match outgoing {
                Some(message) => if socket.send(message).await.is_err() { break; },
                None => break,
            },
            incoming = socket.recv() => match incoming {
                Some(Ok(Message::Text(text))) => handle_client_message(&hub, &socket_id, text.as_str()),
                Some(Ok(Message::Close(_))) | None | Some(Err(_)) => break,
                Some(Ok(Message::Ping(payload))) => {
                    if socket.send(Message::Pong(payload)).await.is_err() { break; }
                }
                Some(Ok(Message::Pong(_))) | Some(Ok(Message::Binary(_))) => {}
            }
        }
    }
    remove_client(&hub, &socket_id);
}

fn handle_client_message(hub: &RealtimeHub, socket_id: &str, text: &str) {
    let Ok(message) = serde_json::from_str::<Value>(text) else {
        return;
    };
    let event = message
        .get("event")
        .and_then(Value::as_str)
        .unwrap_or_default();
    let data = match message.get("data") {
        Some(Value::String(encoded)) => {
            serde_json::from_str::<Value>(encoded).unwrap_or(Value::Null)
        }
        Some(value) => value.clone(),
        None => Value::Null,
    };
    match event {
        "pusher:ping" => send_to_client(hub, socket_id, "pusher:pong", &json!({}), None),
        "pusher:subscribe" => subscribe(hub, socket_id, &data),
        "pusher:unsubscribe" => {
            if let Some(channel) = data.get("channel").and_then(Value::as_str) {
                unsubscribe(hub, socket_id, channel);
            }
        }
        _ => {}
    }
}

fn subscribe(hub: &RealtimeHub, socket_id: &str, data: &Value) {
    let Some(channel) = data
        .get("channel")
        .and_then(Value::as_str)
        .filter(|channel| !channel.is_empty())
    else {
        return;
    };
    let is_private = channel.starts_with("private-");
    let is_presence = channel.starts_with("presence-");
    let channel_data = data.get("channel_data").and_then(Value::as_str);
    if (is_private || is_presence)
        && !data
            .get("auth")
            .and_then(Value::as_str)
            .is_some_and(|provided| {
                constant_time_eq(
                    provided,
                    &hub.sign_channel(
                        socket_id,
                        channel,
                        if is_presence { channel_data } else { None },
                    ),
                )
            })
    {
        send_to_client(
            hub,
            socket_id,
            "pusher:error",
            &json!({"code": 4009, "message": "Connection is unauthorized"}),
            Some(channel),
        );
        return;
    }

    let presence_info = if is_presence {
        channel_data.and_then(|data| serde_json::from_str::<Value>(data).ok())
    } else {
        None
    };
    let Ok(mut inner) = hub.inner.lock() else {
        tracing::error!("Realtime hub lock poisoned while subscribing");
        return;
    };
    let Some(client) = inner.clients.get_mut(socket_id) else {
        return;
    };
    client.channels.insert(channel.to_owned());
    if let Some(info) = presence_info.clone() {
        client.presence.insert(channel.to_owned(), info);
    }
    inner
        .channels
        .entry(channel.to_owned())
        .or_default()
        .insert(socket_id.to_owned());

    if is_presence {
        let (members, others) = presence_members(&inner, channel);
        if let Some(client) = inner.clients.get(socket_id) {
            let _ = client.sender.send(Message::Text(pusher_message(
                "pusher_internal:subscription_succeeded",
                &members,
                Some(channel),
            )));
        }
        if let Some(info) = presence_info {
            let message = pusher_message("pusher_internal:member_added", &info, Some(channel));
            for other_id in others {
                if let Some(other) = inner.clients.get(&other_id) {
                    let _ = other.sender.send(Message::Text(message.clone()));
                }
            }
        }
    } else if let Some(client) = inner.clients.get(socket_id) {
        let _ = client.sender.send(Message::Text(pusher_message(
            "pusher_internal:subscription_succeeded",
            &json!({}),
            Some(channel),
        )));
    }
}

fn unsubscribe(hub: &RealtimeHub, socket_id: &str, channel: &str) {
    let Ok(mut inner) = hub.inner.lock() else {
        tracing::error!("Realtime hub lock poisoned while unsubscribing");
        return;
    };
    let presence = inner.clients.get_mut(socket_id).and_then(|client| {
        client.channels.remove(channel);
        client.presence.remove(channel)
    });
    if let Some(subscribers) = inner.channels.get_mut(channel) {
        subscribers.remove(socket_id);
        if subscribers.is_empty() {
            inner.channels.remove(channel);
        }
    }
    if let Some(info) = presence {
        let user_id = info.get("user_id").cloned().unwrap_or(Value::Null);
        let targets = inner.channels.get(channel).cloned().unwrap_or_default();
        let message = pusher_message(
            "pusher_internal:member_removed",
            &json!({"user_id": user_id}),
            Some(channel),
        );
        for target in targets {
            if let Some(client) = inner.clients.get(&target) {
                let _ = client.sender.send(Message::Text(message.clone()));
            }
        }
    }
}

fn remove_client(hub: &RealtimeHub, socket_id: &str) {
    let Ok(mut inner) = hub.inner.lock() else {
        tracing::error!("Realtime hub lock poisoned while removing a client");
        return;
    };
    let Some(client) = inner.clients.remove(socket_id) else {
        return;
    };
    for channel in client.channels {
        let presence = client.presence.get(&channel);
        if let Some(subscribers) = inner.channels.get_mut(&channel) {
            subscribers.remove(socket_id);
            if subscribers.is_empty() {
                inner.channels.remove(&channel);
            }
        }
        if let Some(info) = presence {
            let message = pusher_message(
                "pusher_internal:member_removed",
                &json!({"user_id": info.get("user_id").cloned().unwrap_or(Value::Null)}),
                Some(&channel),
            );
            for target in inner.channels.get(&channel).cloned().unwrap_or_default() {
                if let Some(client) = inner.clients.get(&target) {
                    let _ = client.sender.send(Message::Text(message.clone()));
                }
            }
        }
    }
}

fn presence_members(inner: &HubInner, channel: &str) -> (Value, Vec<String>) {
    let mut ids = Vec::new();
    let mut hash = Map::new();
    let subscribers = inner.channels.get(channel).cloned().unwrap_or_default();
    for socket_id in &subscribers {
        let Some(info) = inner
            .clients
            .get(socket_id)
            .and_then(|client| client.presence.get(channel))
        else {
            continue;
        };
        let Some(user_id) = info.get("user_id") else {
            continue;
        };
        let id = user_id.to_string().trim_matches('"').to_owned();
        ids.push(id.clone());
        hash.insert(id, info.get("user_info").cloned().unwrap_or(Value::Null));
    }
    (
        json!({"presence": {"count": ids.len(), "ids": ids, "hash": hash}}),
        subscribers.into_iter().collect(),
    )
}

fn send_to_client(
    hub: &RealtimeHub,
    socket_id: &str,
    event: &str,
    data: &Value,
    channel: Option<&str>,
) {
    let Ok(inner) = hub.inner.lock() else {
        tracing::error!("Realtime hub lock poisoned while sending a message");
        return;
    };
    if let Some(client) = inner.clients.get(socket_id) {
        let _ = client
            .sender
            .send(Message::Text(pusher_message(event, data, channel)));
    }
}

fn pusher_message(event: &str, data: &Value, channel: Option<&str>) -> String {
    let mut envelope = json!({
        "event": event,
        "data": data.to_string(),
    });
    if let Some(channel) = channel {
        envelope["channel"] = Value::String(channel.to_owned());
    }
    envelope.to_string()
}

pub(crate) fn resolve_broadcast_target(
    module: &Value,
    requested_type: &str,
    user_id: Option<i64>,
) -> Option<BroadcastTarget> {
    if !matches!(requested_type, "public" | "private" | "presence") {
        return None;
    }
    for section in realtime_sections(module) {
        if section.values.get("type").map(String::as_str) != Some(requested_type) {
            continue;
        }
        let Some(channel) = section.values.get("channel") else {
            continue;
        };
        let Some(event_channel) = substitute_user_id(channel, user_id) else {
            continue;
        };
        let channel = match requested_type {
            "public" => event_channel,
            _ => format!("{requested_type}-{event_channel}"),
        };
        return Some(BroadcastTarget {
            channel,
            event: format!("{}.{}", module["name"].as_str()?, section.name),
        });
    }
    None
}

pub(crate) fn broadcast_api_type(endpoint: &Value) -> bool {
    endpoint.get("type").and_then(Value::as_str) == Some("broadcast")
}

fn channel_type(channel: &str) -> Option<&'static str> {
    if channel.starts_with("private-") {
        Some("private")
    } else if channel.starts_with("presence-") {
        Some("presence")
    } else {
        None
    }
}

fn realtime_sections(module: &Value) -> Vec<RealtimeSection> {
    let mut sections = Vec::new();
    for raw in module
        .get("realtimes")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
    {
        let mut name = None;
        let mut values = HashMap::new();
        for line in raw.lines() {
            let trimmed = line.trim();
            if trimmed.is_empty() || trimmed == "body: ''" {
                continue;
            }
            let Some((key, value)) = trimmed.split_once(':') else {
                continue;
            };
            if line.chars().next().is_some_and(char::is_whitespace) {
                values.insert(
                    key.trim().to_owned(),
                    value
                        .trim()
                        .trim_matches(|character| character == '\'' || character == '"')
                        .to_owned(),
                );
            } else {
                if let Some(previous) = name.replace(key.trim().to_owned()) {
                    sections.push(RealtimeSection {
                        name: previous,
                        values: std::mem::take(&mut values),
                    });
                }
            }
        }
        if let Some(name) = name {
            sections.push(RealtimeSection { name, values });
        }
    }
    sections
}

fn notification_channel_authorized(
    module: &Value,
    channel_type: &str,
    channel_name: &str,
    user_id: i64,
) -> bool {
    let Some(name) = module["name"].as_str() else {
        return false;
    };
    if module["auth"].as_bool() != Some(true) {
        return false;
    }

    let owner_channel_type_exists = module["notifications"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
        .any(|raw| {
            let mut section_type = None;
            let mut is_section = false;
            for line in raw.lines() {
                let Some((key, value)) = line.trim().split_once(':') else {
                    continue;
                };
                if line.chars().next().is_some_and(char::is_whitespace) {
                    if key.trim() == "channel_type" {
                        section_type = Some(value.trim().trim_matches(['\'', '"']));
                    }
                } else {
                    is_section = true;
                }
            }
            is_section
                && section_type.unwrap_or("private") == channel_type
                && matches!(channel_type, "private" | "presence")
        });
    if !owner_channel_type_exists {
        return false;
    }

    let pattern = format!("{name}.{{id}}");
    match_channel(&pattern, channel_name)
        .and_then(|(matches, captures)| matches.then(|| captures.into_iter().next()).flatten())
        .is_some_and(|owner_id| owner_id == user_id.to_string())
}

fn match_channel(pattern: &str, channel: &str) -> Option<(bool, Vec<String>)> {
    let pattern_segments: Vec<_> = pattern.split('.').collect();
    let channel_segments: Vec<_> = channel.split('.').collect();
    if pattern_segments.len() != channel_segments.len() {
        return Some((false, Vec::new()));
    }
    let mut captures = Vec::new();
    for (pattern, value) in pattern_segments.iter().zip(channel_segments) {
        if pattern.starts_with('{') && pattern.ends_with('}') {
            captures.push(value.to_owned());
        } else if *pattern != value {
            return Some((false, Vec::new()));
        }
    }
    Some((true, captures))
}

fn substitute_user_id(channel: &str, user_id: Option<i64>) -> Option<String> {
    if channel.contains("{id}") {
        Some(channel.replace("{id}", &user_id?.to_string()))
    } else {
        Some(channel.to_owned())
    }
}

fn new_socket_id() -> String {
    let epoch = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis();
    format!("{epoch}.{}", NEXT_SOCKET_ID.fetch_add(1, Ordering::Relaxed))
}

fn hmac_sha256(key: &[u8], message: &[u8]) -> [u8; 32] {
    let mut normalized = [0_u8; 64];
    if key.len() > normalized.len() {
        normalized[..32].copy_from_slice(&Sha256::digest(key));
    } else {
        normalized[..key.len()].copy_from_slice(key);
    }
    let mut inner = Vec::with_capacity(normalized.len() + message.len());
    let mut outer = Vec::with_capacity(normalized.len() + 32);
    for byte in normalized {
        inner.push(byte ^ 0x36);
        outer.push(byte ^ 0x5c);
    }
    inner.extend_from_slice(message);
    outer.extend_from_slice(&Sha256::digest(inner));
    Sha256::digest(outer).into()
}

fn hex(bytes: &[u8]) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    let mut encoded = String::with_capacity(bytes.len() * 2);
    for byte in bytes {
        encoded.push(DIGITS[(byte >> 4) as usize] as char);
        encoded.push(DIGITS[(byte & 0x0f) as usize] as char);
    }
    encoded
}

fn constant_time_eq(left: &str, right: &str) -> bool {
    let left = left.as_bytes();
    let right = right.as_bytes();
    let mut difference = left.len() ^ right.len();
    for index in 0..left.len().max(right.len()) {
        difference |= usize::from(
            left.get(index).copied().unwrap_or(0) ^ right.get(index).copied().unwrap_or(0),
        );
    }
    difference == 0
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_channel_rules_and_resolves_all_three_broadcast_targets() {
        let module = json!({
            "name": "broadcast-test",
            "realtimes": [
                "message-sent-public:\n  channel: broadcast-test-public\n  type: public\n  body: ''",
                "message-sent-private:\n  channel: broadcast-test.{id}\n  type: private\n  body: ''",
                "message-sent-presence:\n  channel: broadcast-test-presence\n  type: presence\n  body: ''",
                "broadcast-test.{id}:\n  type: private\n  body: ''"
            ]
        });
        assert_eq!(
            resolve_broadcast_target(&module, "public", None),
            Some(BroadcastTarget {
                channel: "broadcast-test-public".to_owned(),
                event: "broadcast-test.message-sent-public".to_owned(),
            })
        );
        assert_eq!(
            resolve_broadcast_target(&module, "private", Some(42)),
            Some(BroadcastTarget {
                channel: "private-broadcast-test.42".to_owned(),
                event: "broadcast-test.message-sent-private".to_owned(),
            })
        );
        assert_eq!(
            resolve_broadcast_target(&module, "presence", Some(42)),
            Some(BroadcastTarget {
                channel: "presence-broadcast-test-presence".to_owned(),
                event: "broadcast-test.message-sent-presence".to_owned(),
            })
        );
        assert_eq!(resolve_broadcast_target(&module, "private", None), None);
        assert_eq!(resolve_broadcast_target(&module, "unknown", None), None);
    }

    #[test]
    fn channel_signatures_match_hmac_sha256_protocol() {
        let hub = RealtimeHub::new("arkzen-key".to_owned(), "arkzen-secret".to_owned());
        let signature = hub.sign_channel("123.456", "private-broadcast-test.7", None);
        assert!(signature.starts_with("arkzen-key:"));
        assert_eq!(
            hex(&hmac_sha256(
                b"key",
                b"The quick brown fox jumps over the lazy dog"
            )),
            "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8"
        );
    }
}
