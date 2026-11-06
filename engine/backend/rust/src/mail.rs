use crate::{
    auth,
    generated_runtime::{utc_now_rfc3339, Database},
};
use axum::http::StatusCode;
use base64::{engine::general_purpose::STANDARD, Engine};
use lettre::{
    message::header::ContentType, transport::smtp::authentication::Credentials, Message,
    SmtpTransport, Transport,
};
use serde_json::{json, Value};
use std::{env, path::Path};

struct MailDefinition {
    name: String,
    subject: String,
    template: String,
}

pub fn send_mail(
    module: &Value,
    slug: &str,
    table: &str,
    columns: &Value,
    database_dir: &Path,
    body: &Value,
    authorization: Option<&str>,
    mailer: &str,
) -> (StatusCode, Value) {
    let Some(mail_name) = body
        .get("mail")
        .and_then(Value::as_str)
        .filter(|name| !name.trim().is_empty())
    else {
        return validation_error("The mail field is required.");
    };
    let Some(to) = body.get("to").and_then(Value::as_str) else {
        return validation_error("The to field must be a valid email address.");
    };
    if !valid_email(to) {
        return validation_error("The to field must be a valid email address.");
    }
    let data = match body.get("data") {
        None | Some(Value::Null) => serde_json::Map::new(),
        Some(Value::Object(data)) => data.clone(),
        Some(_) => return validation_error("The data field must be an object."),
    };

    let definition = match find_mail(module, mail_name) {
        Ok(Some(definition)) => definition,
        Ok(None) => return validation_error("The mail field has an unsupported value."),
        Err(error) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Could not load mail definition: {error}")}),
            )
        }
    };
    let rendered = match render_template(&definition.template, &data) {
        Ok(rendered) => rendered,
        Err(error) => {
            return (
                StatusCode::UNPROCESSABLE_ENTITY,
                json!({"message": format!("Could not render mail template: {error}")}),
            )
        }
    };
    if let Err(error) = deliver(mailer, to, &definition.subject, &rendered) {
        return (
            StatusCode::BAD_GATEWAY,
            json!({"message": format!("Email delivery failed: {error}")}),
        );
    }

    let user_id = if module.get("auth").and_then(Value::as_bool) == Some(true) {
        match auth::authenticated_user(database_dir, slug, authorization) {
            Ok(user) => user.map(|user| user.id),
            Err(error) => {
                return (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    json!({"message": format!("Unable to resolve authenticated user: {error}")}),
                )
            }
        }
    } else {
        None
    };
    let mut record = json!({
        "to_email": to,
        "subject": definition.subject,
        "mail_class": class_name(&definition.name),
        "status": "sent"
    });
    let declared_columns = columns.get("columns").unwrap_or(columns);
    if declared_columns.get("user_id").is_some() {
        record["user_id"] = user_id.map_or(Value::Null, |id| json!(id));
    }
    let now = utc_now_rfc3339();
    let timestamps = columns.get("timestamps").and_then(Value::as_bool) != Some(false);
    if timestamps || declared_columns.get("created_at").is_some() {
        record["created_at"] = json!(now);
    }
    if timestamps || declared_columns.get("updated_at").is_some() {
        record["updated_at"] = json!(now);
    }

    let database = match Database::open(database_dir, slug) {
        Ok(database) => database,
        Err(error) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Could not open mail log database: {error}")}),
            )
        }
    };
    match database.insert(table, record) {
        Ok(record) => (StatusCode::CREATED, record),
        Err(error) => (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": format!("Could not record mail delivery: {error}")}),
        ),
    }
}

fn find_mail(module: &Value, requested_name: &str) -> Result<Option<MailDefinition>, String> {
    let mut found = None;
    for section in module
        .get("mails")
        .and_then(Value::as_array)
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
    {
        let Some(definition) = parse_mail(section)? else {
            continue;
        };
        if normalize_identifier(&definition.name) == normalize_identifier(requested_name) {
            if found.is_some() {
                return Err(format!("Duplicate mail definition for {requested_name}"));
            }
            found = Some(definition);
        }
    }
    Ok(found)
}

fn parse_mail(section: &str) -> Result<Option<MailDefinition>, String> {
    let Some((name, _)) = section.trim().split_once(':') else {
        return Ok(None);
    };
    let field = |key: &str| {
        section
            .lines()
            .find_map(|line| line.trim().strip_prefix(&format!("{key}:")).map(str::trim))
    };
    let subject = field("subject")
        .map(parse_scalar)
        .unwrap_or_else(|| name.trim().to_owned());
    let template = match field("blade_body") {
        Some(encoded) => {
            let encoded = parse_scalar(encoded);
            let bytes = STANDARD.decode(encoded).map_err(|error| {
                format!("Invalid template encoding for {}: {error}", name.trim())
            })?;
            String::from_utf8(bytes)
                .map_err(|error| format!("Template for {} is not UTF-8: {error}", name.trim()))?
        }
        None => String::new(),
    };
    Ok(Some(MailDefinition {
        name: name.trim().to_owned(),
        subject,
        template,
    }))
}

fn parse_scalar(value: &str) -> String {
    value
        .strip_prefix('"')
        .and_then(|value| value.strip_suffix('"'))
        .or_else(|| {
            value
                .strip_prefix('\'')
                .and_then(|value| value.strip_suffix('\''))
        })
        .unwrap_or(value)
        .to_owned()
}

fn render_template(
    template: &str,
    data: &serde_json::Map<String, Value>,
) -> Result<String, String> {
    let mut rendered = String::with_capacity(template.len());
    let mut remaining = template;
    while let Some(open) = remaining.find("{{") {
        rendered.push_str(&remaining[..open]);
        let after_open = &remaining[open + 2..];
        let Some(close) = after_open.find("}}") else {
            return Err("Template contains an unclosed variable expression".to_owned());
        };
        let expression = after_open[..close].trim().trim_start_matches('$');
        if expression.is_empty()
            || !expression
                .chars()
                .all(|character| character.is_ascii_alphanumeric() || character == '_')
        {
            return Err(format!("Unsupported template expression: {expression}"));
        }
        if let Some(value) = data.get(expression) {
            rendered.push_str(&escape_html(&display_value(value)));
        }
        remaining = &after_open[close + 2..];
    }
    rendered.push_str(remaining);
    Ok(rendered)
}

fn display_value(value: &Value) -> String {
    match value {
        Value::Null => String::new(),
        Value::String(value) => value.clone(),
        _ => value.to_string(),
    }
}

fn escape_html(value: &str) -> String {
    let mut escaped = String::with_capacity(value.len());
    for character in value.chars() {
        escaped.push_str(match character {
            '&' => "&amp;",
            '<' => "&lt;",
            '>' => "&gt;",
            '"' => "&quot;",
            '\'' => "&#39;",
            _ => {
                escaped.push(character);
                continue;
            }
        });
    }
    escaped
}

pub(crate) fn deliver(mailer: &str, to: &str, subject: &str, html: &str) -> Result<(), String> {
    if subject.contains('\r') || subject.contains('\n') {
        return Err("Mail subject contains invalid header characters".to_owned());
    }
    match mailer.trim().to_ascii_lowercase().as_str() {
        "" | "log" => {
            tracing::info!("[mail:log] to={to} subject={subject:?}");
            Ok(())
        }
        "smtp" => send_smtp(to, subject, html),
        other => Err(format!("Unsupported MAIL_MAILER {other:?}")),
    }
}

fn send_smtp(to: &str, subject: &str, html: &str) -> Result<(), String> {
    let host = env::var("MAIL_HOST").unwrap_or_else(|_| "127.0.0.1".to_owned());
    let port = env::var("MAIL_PORT")
        .unwrap_or_else(|_| "587".to_owned())
        .parse::<u16>()
        .map_err(|_| "MAIL_PORT must be an integer from 1 to 65535".to_owned())?;
    if port == 0 {
        return Err("MAIL_PORT must be an integer from 1 to 65535".to_owned());
    }
    let from = env::var("MAIL_FROM_ADDRESS").unwrap_or_else(|_| "hello@example.com".to_owned());
    let message = Message::builder()
        .from(
            from.parse()
                .map_err(|error| format!("Invalid MAIL_FROM_ADDRESS: {error}"))?,
        )
        .to(to
            .parse()
            .map_err(|error| format!("Invalid recipient: {error}"))?)
        .subject(subject)
        .header(ContentType::TEXT_HTML)
        .body(html.to_owned())
        .map_err(|error| format!("Could not build email: {error}"))?;

    let mut transport = SmtpTransport::relay(&host)
        .map_err(|error| format!("Could not configure SMTP transport: {error}"))?
        .port(port);
    if let Ok(username) = env::var("MAIL_USERNAME") {
        if !username.trim().is_empty() {
            transport = transport.credentials(Credentials::new(
                username,
                env::var("MAIL_PASSWORD").unwrap_or_default(),
            ));
        }
    }
    transport
        .build()
        .send(&message)
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn valid_email(value: &str) -> bool {
    let Some((local, domain)) = value.split_once('@') else {
        return false;
    };
    !local.is_empty()
        && !domain.is_empty()
        && !value.chars().any(char::is_whitespace)
        && !domain.contains('@')
        && domain.contains('.')
        && !domain.starts_with('.')
        && !domain.ends_with('.')
}

fn class_name(value: &str) -> String {
    value
        .split(['-', '_', ' '])
        .filter(|part| !part.is_empty())
        .map(|part| {
            let mut chars = part.chars();
            chars
                .next()
                .map(|first| first.to_uppercase().collect::<String>() + chars.as_str())
                .unwrap_or_default()
        })
        .collect()
}

fn normalize_identifier(value: &str) -> String {
    value
        .chars()
        .filter(|character| character.is_ascii_alphanumeric())
        .flat_map(char::to_lowercase)
        .collect()
}

fn validation_error(message: &str) -> (StatusCode, Value) {
    (
        StatusCode::UNPROCESSABLE_ENTITY,
        json!({"message": "Validation failed", "errors": [message]}),
    )
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;
    use std::path::Path;

    #[test]
    fn parses_and_renders_encoded_tatemono_template() {
        let template = STANDARD.encode("<p>Welcome, {{ $username }}!</p>");
        let module = json!({
            "mails": [format!(
                "welcome-mail:\n  subject: \"Welcome to Arkzen\"\n  blade_body: '{template}'"
            )]
        });
        let definition = find_mail(&module, "welcome-mail").unwrap().unwrap();
        let rendered = render_template(
            &definition.template,
            &json!({"username": "<Ada>"}).as_object().unwrap().clone(),
        )
        .unwrap();

        assert_eq!(definition.subject, "Welcome to Arkzen");
        assert_eq!(rendered, "<p>Welcome, &lt;Ada&gt;!</p>");
    }

    #[test]
    fn logs_mail_and_returns_created_mail_log() {
        let directory = tempfile::tempdir().unwrap();
        let schema = json!({
            "databases": [{
                "table": "mail_logs",
                "timestamps": true,
                "columns": {
                    "user_id": {"type": "integer", "nullable": true},
                    "to_email": {"type": "string"},
                    "subject": {"type": "string"},
                    "mail_class": {"type": "string"},
                    "status": {"type": "string"},
                    "error": {"type": "text", "nullable": true}
                }
            }]
        });
        crate::database::apply_schema(directory.path(), "mail-test", &schema).unwrap();
        let module = json!({
            "auth": false,
            "mails": [
                format!(
                    "welcome-mail:\n  subject: \"Welcome\"\n  blade_body: '{}'",
                    STANDARD.encode("<p>Hello {{ $username }}</p>")
                )
            ]
        });
        let schema = schema["databases"][0].clone();
        let (status, record) = send_mail(
            &module,
            "mail-test",
            "mail_logs",
            &schema,
            directory.path(),
            &json!({
                "mail": "welcome-mail",
                "to": "ada@example.com",
                "data": {"username": "Ada"}
            }),
            None,
            "log",
        );
        assert_eq!(status, StatusCode::CREATED);
        assert_eq!(record["mail_class"], "WelcomeMail");
        assert_eq!(record["status"], "sent");
        assert_eq!(record["to_email"], "ada@example.com");
        assert!(record["created_at"].as_str().is_some());

        let database = Database::open(directory.path(), "mail-test").unwrap();
        assert_eq!(database.query("SELECT * FROM mail_logs").unwrap().len(), 1);
    }

    #[test]
    fn rejects_unknown_mail_and_invalid_input() {
        let module = json!({"mails": []});
        let (status, _) = send_mail(
            &module,
            "mail-test",
            "mail_logs",
            &json!({}),
            Path::new("."),
            &json!({"mail": "missing", "to": "ada@example.com"}),
            None,
            "log",
        );
        assert_eq!(status, StatusCode::UNPROCESSABLE_ENTITY);
    }
}
