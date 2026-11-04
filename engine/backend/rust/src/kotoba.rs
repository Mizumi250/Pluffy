use crate::auth::User;
use rusqlite::{
    params_from_iter,
    types::{Value as SqlValue, ValueRef},
    Connection,
};
use serde_json::{json, Map, Value};
use std::{collections::BTreeMap, path::Path, time::SystemTime};

pub fn supported_handler(name: &str) -> bool {
    matches!(
        name,
        "me" | "update_me"
            | "bump"
            | "notify"
            | "community_seed"
            | "home"
            | "feed"
            | "create_post"
            | "delete_post"
            | "toggle_like"
            | "list_comments"
            | "add_comment"
            | "accept_correction"
            | "list_lessons"
            | "complete_lesson"
            | "list_cards"
            | "add_card"
            | "review_card"
            | "delete_card"
            | "partners"
            | "view_profile"
            | "toggle_follow"
            | "list_conversations"
            | "start_conversation"
            | "list_messages"
            | "send_message"
            | "correct_message"
            | "list_circles"
            | "create_circle"
            | "toggle_join"
            | "list_alerts"
            | "read_alerts"
            | "progress"
    )
}

pub fn supports_route(method: &str, path: &str, handler: &str) -> bool {
    let expected = match handler {
        "me" => ("GET", "/api/kotoba/me"),
        "update_me" => ("PUT", "/api/kotoba/me"),
        "home" => ("GET", "/api/kotoba/home"),
        "bump" => ("POST", "/api/kotoba/activity"),
        "notify" => ("POST", "/api/kotoba/internal/notify"),
        "community_seed" => ("POST", "/api/kotoba/internal/seed"),
        "feed" => ("GET", "/api/kotoba/feed"),
        "create_post" => ("POST", "/api/kotoba/posts"),
        "delete_post" => ("DELETE", "/api/kotoba/posts/{id}"),
        "toggle_like" => ("POST", "/api/kotoba/posts/{id}/like"),
        "list_comments" => ("GET", "/api/kotoba/posts/{id}/comments"),
        "add_comment" => ("POST", "/api/kotoba/posts/{id}/comments"),
        "accept_correction" => ("POST", "/api/kotoba/comments/{id}/accept"),
        "list_lessons" => ("GET", "/api/kotoba/lessons"),
        "complete_lesson" => ("POST", "/api/kotoba/lessons/{id}/complete"),
        "list_cards" => ("GET", "/api/kotoba/vocab"),
        "add_card" => ("POST", "/api/kotoba/vocab"),
        "review_card" => ("POST", "/api/kotoba/vocab/{id}/review"),
        "delete_card" => ("DELETE", "/api/kotoba/vocab/{id}"),
        "partners" => ("GET", "/api/kotoba/partners"),
        "view_profile" => ("GET", "/api/kotoba/profile/{id}"),
        "toggle_follow" => ("POST", "/api/kotoba/follow/{id}"),
        "list_conversations" => ("GET", "/api/kotoba/conversations"),
        "start_conversation" => ("POST", "/api/kotoba/conversations"),
        "list_messages" => ("GET", "/api/kotoba/messages"),
        "send_message" => ("POST", "/api/kotoba/messages"),
        "correct_message" => ("POST", "/api/kotoba/messages/{id}/correct"),
        "list_circles" => ("GET", "/api/kotoba/circles"),
        "create_circle" => ("POST", "/api/kotoba/circles"),
        "toggle_join" => ("POST", "/api/kotoba/circles/{id}/join"),
        "list_alerts" => ("GET", "/api/kotoba/alerts"),
        "read_alerts" => ("POST", "/api/kotoba/alerts/read"),
        "progress" => ("GET", "/api/kotoba/progress"),
        _ => return false,
    };
    method.eq_ignore_ascii_case(expected.0) && path == expected.1
}

pub fn execute(
    database_dir: &Path,
    action: &str,
    path: &str,
    query: &str,
    body: &Value,
    user: &User,
) -> (axum::http::StatusCode, Value) {
    use axum::http::StatusCode;

    if !supported_handler(action) {
        return (
            StatusCode::NOT_IMPLEMENTED,
            json!({"message":"Unknown Kotoba handler"}),
        );
    }
    let connection = match open_connection(database_dir) {
        Ok(connection) => connection,
        Err(error) => return fail(StatusCode::INTERNAL_SERVER_ERROR, error),
    };
    let input = body.as_object().cloned().unwrap_or_default();
    let id = path_id(path).unwrap_or_default();
    let result = match action {
        "me" => me(&connection, user),
        "update_me" => update_me(&connection, user, &input),
        "bump" => bump(&connection, user, &input),
        "notify" => notify(&connection, &input),
        "community_seed" => seed_community(&connection),
        "home" => home(&connection, user),
        "feed" => feed(&connection, user, query),
        "create_post" => create_post(&connection, user, &input),
        "delete_post" => delete_post(&connection, user, id),
        "toggle_like" => toggle_like(&connection, user, id),
        "list_comments" => list_comments(&connection, id),
        "add_comment" => add_comment(&connection, user, id, &input),
        "accept_correction" => accept_correction(&connection, user, id),
        "list_lessons" => list_lessons(&connection, user),
        "complete_lesson" => complete_lesson(&connection, user, id, &input),
        "list_cards" => list_cards(&connection, user, query),
        "add_card" => add_card(&connection, user, &input),
        "review_card" => review_card(&connection, user, id, &input),
        "delete_card" => delete_card(&connection, user, id),
        "partners" => partners(&connection, user),
        "view_profile" => view_profile(&connection, user, id),
        "toggle_follow" => toggle_follow(&connection, user, id),
        "list_conversations" => list_conversations(&connection, user),
        "start_conversation" => start_conversation(&connection, user, &input),
        "list_messages" => list_messages(&connection, user, query),
        "send_message" => send_message(&connection, user, &input),
        "correct_message" => correct_message(&connection, user, id, &input),
        "list_circles" => list_circles(&connection, user, query),
        "create_circle" => create_circle(&connection, user, &input),
        "toggle_join" => toggle_join(&connection, user, id),
        "list_alerts" => list_alerts(&connection, user),
        "read_alerts" => read_alerts(&connection, user),
        "progress" => progress(&connection, user),
        _ => unreachable!("handler was checked above"),
    };
    match result {
        Ok((status, payload)) => (status, payload),
        Err((status, message)) => fail(status, message),
    }
}

type HandlerResult = Result<(axum::http::StatusCode, Value), (axum::http::StatusCode, String)>;

fn fail(
    status: axum::http::StatusCode,
    message: impl Into<String>,
) -> (axum::http::StatusCode, Value) {
    (status, json!({"message": message.into()}))
}

fn err(
    status: axum::http::StatusCode,
    message: impl Into<String>,
) -> (axum::http::StatusCode, String) {
    (status, message.into())
}

fn open_connection(database_dir: &Path) -> Result<Connection, String> {
    let connection = Connection::open(database_dir.join("kotoba.sqlite"))
        .map_err(|error| format!("Could not open Kotoba database: {error}"))?;
    connection
        .busy_timeout(std::time::Duration::from_secs(5))
        .map_err(|error| format!("Could not configure Kotoba database: {error}"))?;
    connection
        .pragma_update(None, "foreign_keys", "ON")
        .map_err(|error| format!("Could not enable Kotoba foreign keys: {error}"))?;
    Ok(connection)
}

fn sql_value(value: &Value) -> SqlValue {
    match value {
        Value::Null => SqlValue::Null,
        Value::Bool(value) => SqlValue::Integer(if *value { 1 } else { 0 }),
        Value::Number(value) => value
            .as_i64()
            .map(SqlValue::Integer)
            .or_else(|| value.as_f64().map(SqlValue::Real))
            .unwrap_or(SqlValue::Null),
        Value::String(value) => SqlValue::Text(value.clone()),
        Value::Array(_) | Value::Object(_) => SqlValue::Text(value.to_string()),
    }
}

fn from_sql(value: ValueRef<'_>) -> Value {
    match value {
        ValueRef::Null => Value::Null,
        ValueRef::Integer(value) => json!(value),
        ValueRef::Real(value) => json!(value),
        ValueRef::Text(value) => Value::String(String::from_utf8_lossy(value).into_owned()),
        ValueRef::Blob(value) => Value::String(String::from_utf8_lossy(value).into_owned()),
    }
}

fn rows(connection: &Connection, sql: &str, values: &[Value]) -> Result<Vec<Value>, String> {
    let mut statement = connection.prepare(sql).map_err(|error| error.to_string())?;
    let names = statement
        .column_names()
        .iter()
        .map(|name| (*name).to_owned())
        .collect::<Vec<_>>();
    let values = values.iter().map(sql_value).collect::<Vec<_>>();
    let mut result = Vec::new();
    let mut cursor = statement
        .query(params_from_iter(values.iter()))
        .map_err(|error| error.to_string())?;
    while let Some(row) = cursor.next().map_err(|error| error.to_string())? {
        let mut object = Map::new();
        for (index, name) in names.iter().enumerate() {
            object.insert(
                name.clone(),
                from_sql(row.get_ref(index).map_err(|error| error.to_string())?),
            );
        }
        result.push(Value::Object(object));
    }
    Ok(result)
}

fn first(connection: &Connection, sql: &str, values: &[Value]) -> Result<Option<Value>, String> {
    Ok(rows(connection, sql, values)?.into_iter().next())
}

fn columns(connection: &Connection, table: &str) -> Result<Vec<String>, String> {
    if !matches!(
        table,
        "profiles"
            | "posts"
            | "comments"
            | "likes"
            | "follows"
            | "missions"
            | "lessons"
            | "lesson_results"
            | "vocab_cards"
            | "conversations"
            | "messages"
            | "circles"
            | "circle_members"
            | "alerts"
    ) {
        return Err(format!("Unknown Kotoba table {table}"));
    }
    let mut statement = connection
        .prepare(&format!("PRAGMA table_info(\"{table}\")"))
        .map_err(|error| error.to_string())?;
    let columns = statement
        .query_map([], |row| row.get::<_, String>(1))
        .map_err(|error| error.to_string())?
        .collect::<Result<Vec<_>, _>>()
        .map_err(|error| error.to_string())?;
    Ok(columns)
}

fn insert(connection: &Connection, table: &str, values: Value) -> Result<Value, String> {
    let schema = columns(connection, table)?;
    let input = values
        .as_object()
        .ok_or_else(|| "Insert values must be a JSON object".to_owned())?;
    let mut fields = input
        .iter()
        .filter(|(name, _)| schema.iter().any(|column| column == *name))
        .map(|(name, value)| (name.clone(), value.clone()))
        .collect::<BTreeMap<_, _>>();
    if schema.iter().any(|name| name == "created_at") {
        fields.entry("created_at".to_owned()).or_insert(Value::Null);
    }
    if schema.iter().any(|name| name == "updated_at") {
        fields.insert("updated_at".to_owned(), Value::Null);
    }
    let names = fields.keys().cloned().collect::<Vec<_>>();
    if names.is_empty() {
        connection
            .execute(&format!("INSERT INTO \"{table}\" DEFAULT VALUES"), [])
            .map_err(|error| error.to_string())?;
    } else {
        let quoted = names
            .iter()
            .map(|name| format!("\"{name}\""))
            .collect::<Vec<_>>()
            .join(",");
        let mut parameters = Vec::new();
        let mut expressions = Vec::new();
        for name in &names {
            if fields[name].is_null() && matches!(name.as_str(), "created_at" | "updated_at") {
                expressions.push("CURRENT_TIMESTAMP".to_owned());
            } else {
                parameters.push(sql_value(&fields[name]));
                expressions.push(format!("?{}", parameters.len()));
            }
        }
        connection
            .execute(
                &format!(
                    "INSERT INTO \"{table}\" ({quoted}) VALUES ({})",
                    expressions.join(",")
                ),
                params_from_iter(parameters.iter()),
            )
            .map_err(|error| error.to_string())?;
    }
    let id = connection.last_insert_rowid();
    first(
        connection,
        &format!("SELECT * FROM \"{table}\" WHERE \"id\"=?1"),
        &[json!(id)],
    )?
    .ok_or_else(|| format!("Inserted {table} row {id} could not be loaded"))
}

fn update(connection: &Connection, table: &str, id: i64, values: Value) -> Result<(), String> {
    let schema = columns(connection, table)?;
    let input = values
        .as_object()
        .ok_or_else(|| "Update values must be a JSON object".to_owned())?;
    let mut fields = input
        .iter()
        .filter(|(name, _)| name.as_str() != "id" && schema.iter().any(|column| column == *name))
        .map(|(name, value)| (name.clone(), value.clone()))
        .collect::<BTreeMap<_, _>>();
    if schema.iter().any(|name| name == "updated_at") {
        fields.insert("updated_at".to_owned(), Value::Null);
    }
    if fields.is_empty() {
        return Ok(());
    }
    let mut clauses = Vec::new();
    let mut parameters = Vec::new();
    for (name, value) in fields {
        if value.is_null() && name == "updated_at" {
            clauses.push("\"updated_at\"=CURRENT_TIMESTAMP".to_owned());
        } else {
            clauses.push(format!("\"{name}\"=?{}", parameters.len() + 1));
            parameters.push(sql_value(&value));
        }
    }
    clauses.push(format!("\"id\"=?{}", parameters.len() + 1));
    parameters.push(SqlValue::Integer(id));
    connection
        .execute(
            &format!(
                "UPDATE \"{table}\" SET {} WHERE \"id\"=?{}",
                clauses[..clauses.len() - 1].join(","),
                parameters.len()
            ),
            params_from_iter(parameters.iter()),
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

fn path_id(path: &str) -> Option<i64> {
    path.split('/').filter_map(|part| part.parse().ok()).last()
}

fn query_value(query: &str, name: &str) -> Option<String> {
    form_urlencoded::parse(query.as_bytes())
        .find_map(|(key, value)| (key == name).then(|| value.into_owned()))
}

fn text(value: Option<&Value>) -> &str {
    value.and_then(Value::as_str).unwrap_or_default()
}

fn int(value: Option<&Value>) -> i64 {
    value
        .and_then(|value| value.as_i64().or_else(|| value.as_str()?.parse().ok()))
        .unwrap_or_default()
}

fn number(value: Option<&Value>) -> f64 {
    value
        .and_then(|value| value.as_f64().or_else(|| value.as_str()?.parse().ok()))
        .unwrap_or_default()
}

fn truthy(value: Option<&Value>) -> bool {
    value.is_some_and(|value| value == true || value.as_i64().is_some_and(|number| number != 0))
}

fn profile(connection: &Connection, user: &User) -> Result<Value, String> {
    if let Some(profile) = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )? {
        return Ok(profile);
    }
    insert(
        connection,
        "profiles",
        json!({"user_id":user.id,"display_name":user.name,"avatar_color":"#121212"}),
    )
}

fn now_day() -> String {
    let seconds = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs());
    let days = (seconds / 86_400) as i64;
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let day_of_era = z - era * 146_097;
    let year_of_era =
        (day_of_era - day_of_era / 1_460 + day_of_era / 36_524 - day_of_era / 146_096) / 365;
    let mut year = year_of_era + era * 400;
    let day_of_year = day_of_era - (365 * year_of_era + year_of_era / 4 - year_of_era / 100);
    let month_prime = (5 * day_of_year + 2) / 153;
    let day = day_of_year - (153 * month_prime + 2) / 5 + 1;
    let month = month_prime + if month_prime < 10 { 3 } else { -9 };
    year += if month <= 2 { 1 } else { 0 };
    format!("{year:04}-{month:02}-{day:02}")
}

fn me(connection: &Connection, user: &User) -> HandlerResult {
    seed_data(connection)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let profile = profile(connection, user)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    Ok((
        axum::http::StatusCode::OK,
        json!({
            "data": profile,
            "user": {"id":user.id,"name":user.name,"email":user.email}
        }),
    ))
}

fn update_me(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let profile = profile(connection, user)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let mut updates = Map::new();
    for name in [
        "display_name",
        "bio",
        "native_lang",
        "learning_lang",
        "level",
        "country",
        "interests",
        "daily_goal",
        "onboarded",
    ] {
        if let Some(value) = body.get(name) {
            updates.insert(name.to_owned(), value.clone());
        }
    }
    if updates.is_empty() {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Provide at least one profile field to update",
        ));
    }
    update(
        connection,
        "profiles",
        int(profile.get("id")),
        Value::Object(updates),
    )
    .map_err(|_| {
        err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Could not update learner profile",
        )
    })?;
    let updated = first(
        connection,
        "SELECT * FROM profiles WHERE id=?1",
        &[profile["id"].clone()],
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            "Updated profile could not be loaded",
        )
    })?;
    Ok((axum::http::StatusCode::OK, json!({"data":updated})))
}

fn bump(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let (xp, words, messages) = (
        int(body.get("xp")),
        int(body.get("words")),
        int(body.get("messages")),
    );
    if xp < 0 || words < 0 || messages < 0 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Activity amounts cannot be negative",
        ));
    }
    let current = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Learner profile not found",
        )
    })?;
    let today = now_day();
    let previous = current["last_active"].as_str().unwrap_or_default();
    let streak = if previous == today {
        int(current.get("streak"))
    } else if previous == format_day_offset(-1) {
        int(current.get("streak")) + 1
    } else {
        1
    };
    update(
        connection,
        "profiles",
        int(current.get("id")),
        json!({
            "xp":int(current.get("xp"))+xp,"words_written":int(current.get("words_written"))+words,
            "messages_sent":int(current.get("messages_sent"))+messages,"streak":streak,
            "best_streak":int(current.get("best_streak")).max(streak),"last_active":today
        }),
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let profile = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    Ok((
        axum::http::StatusCode::OK,
        json!({"data":profile,"xp_awarded":xp}),
    ))
}

fn format_day_offset(offset: i64) -> String {
    let seconds = SystemTime::now()
        .duration_since(SystemTime::UNIX_EPOCH)
        .map_or(0, |duration| duration.as_secs()) as i64;
    let days = seconds / 86_400 + offset;
    let z = days + 719_468;
    let era = if z >= 0 { z } else { z - 146_096 } / 146_097;
    let doe = z - era * 146_097;
    let yoe = (doe - doe / 1_460 + doe / 36_524 - doe / 146_096) / 365;
    let mut year = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let day = doy - (153 * mp + 2) / 5 + 1;
    let month = mp + if mp < 10 { 3 } else { -9 };
    year += if month <= 2 { 1 } else { 0 };
    format!("{year:04}-{month:02}-{day:02}")
}

fn notify(connection: &Connection, body: &Map<String, Value>) -> HandlerResult {
    let target = int(body.get("user_id"));
    let kind = text(body.get("kind"));
    let message = text(body.get("text"));
    if target <= 0 || kind.is_empty() || message.is_empty() || message.chars().count() > 500 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Alert kind and text are required",
        ));
    }
    let row = insert(
        connection,
        "alerts",
        json!({"user_id":target,"kind":kind,"text":message,"ref":body.get("ref"),"is_read":false}),
    )
    .map_err(|error| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not create alert: {error}"),
        )
    })?;
    Ok((axum::http::StatusCode::OK, json!({"data":row})))
}

fn seed_community(connection: &Connection) -> HandlerResult {
    let seeded = seed_data(connection)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    Ok((axum::http::StatusCode::OK, json!({"seeded":seeded})))
}

fn seed_data(connection: &Connection) -> Result<bool, String> {
    let count: i64 = connection
        .query_row("SELECT COUNT(*) FROM posts", [], |row| row.get(0))
        .map_err(|error| error.to_string())?;
    if count > 0 {
        return Ok(false);
    }
    let seeds = [
        (
            "aiko@kotoba.app",
            "Aiko Tanaka",
            "ja",
            "en",
            "A2",
            "Japan",
            "#7a3b34",
            240,
            12,
        ),
        (
            "mateo@kotoba.app",
            "Mateo Rivera",
            "es",
            "en",
            "B1",
            "Mexico",
            "#3f6b4f",
            180,
            6,
        ),
        (
            "sofia@kotoba.app",
            "Sofia Laurent",
            "en",
            "ja",
            "A2",
            "Canada",
            "#4a4a4a",
            320,
            21,
        ),
    ];
    let mut profiles = BTreeMap::new();
    for (email, name, native, learning, level, country, color, xp, streak) in seeds {
        if let Some(auth_user) = first(
            connection,
            "SELECT id FROM users WHERE email=?1",
            &[json!(email)],
        )? {
            let uid = int(auth_user.get("id"));
            let current = first(
                connection,
                "SELECT id FROM profiles WHERE user_id=?1",
                &[json!(uid)],
            )?;
            let attrs = json!({"user_id":uid,"display_name":name,"native_lang":native,"learning_lang":learning,"level":level,"country":country,"avatar_color":color,"xp":xp,"streak":streak,"best_streak":streak,"last_active":now_day(),"onboarded":true});
            let p = if let Some(row) = current {
                update(connection, "profiles", int(row.get("id")), attrs)?;
                first(
                    connection,
                    "SELECT * FROM profiles WHERE id=?1",
                    &[row["id"].clone()],
                )?
                .ok_or("seeded profile disappeared")?
            } else {
                insert(connection, "profiles", attrs)?
            };
            profiles.insert(email, p);
        }
    }
    if profiles.is_empty() {
        return Ok(false);
    }
    if count == 0 {
        let posts=[
            ("aiko@kotoba.app","en","moment","Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!","",4),
            ("mateo@kotoba.app","en","moment","Today I learned a new word: serendipity. It means finding something good by luck.","",7),
            ("sofia@kotoba.app","ja","moment","きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。","It is raining today. I will read a book while drinking coffee.",5),
            ("mateo@kotoba.app","es","question","Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.","Question for you all: what is your favorite food? Mine are tacos al pastor.",3),
            ("aiko@kotoba.app","ja","moment","こんにちは！わたしは アイコです。にほんの おおさかから きました。","Hello! I am Aiko. I came from Osaka, Japan.",9),
        ];
        let mut ids = Vec::new();
        for (email, lang, kind, content, translation, likes) in posts {
            if let Some(profile) = profiles.get(email) {
                let post = insert(
                    connection,
                    "posts",
                    json!({"user_id":profile["user_id"],"author_name":profile["display_name"],"author_color":profile["avatar_color"],"author_native":profile["native_lang"],"lang":lang,"kind":kind,"body":content,"translation":if translation.is_empty(){Value::Null}else{json!(translation)},"likes_count":likes,"comments_count":0,"corrections_count":0}),
                )?;
                ids.push(post);
            }
        }
        if let (Some(post), Some(author)) = (ids.first(), profiles.get("sofia@kotoba.app")) {
            let _ = insert(
                connection,
                "comments",
                json!({"post_id":post["id"],"user_id":author["user_id"],"author_name":author["display_name"],"author_color":author["avatar_color"],"body":"Nice story! A few small fixes:","is_correction":true,"corrected":"Yesterday I went to the park with my friend. We ate ice cream and it was delicious!","explanation":"Use the past tense: go becomes went and eat becomes ate."}),
            )?;
            connection
                .execute(
                    "UPDATE posts SET comments_count=1, corrections_count=1 WHERE id=?1",
                    [int(post.get("id"))],
                )
                .map_err(|error| error.to_string())?;
        }
    }
    let circle_count: i64 = connection
        .query_row("SELECT COUNT(*) FROM circles", [], |row| row.get(0))
        .map_err(|error| error.to_string())?;
    if circle_count == 0 {
        for (name, emoji, lang, level, description, email) in [
            (
                "English Morning Club",
                "sun",
                "en",
                "A2",
                "Short daily check-ins in English. Be kind and correct gently.",
                "sofia@kotoba.app",
            ),
            (
                "Japanese for Beginners",
                "flower",
                "ja",
                "A1",
                "Hiragana, greetings and first sentences. Ask anything.",
                "aiko@kotoba.app",
            ),
            (
                "Spanish Cafe Talk",
                "coffee",
                "es",
                "A2",
                "Relaxed conversation practice over virtual coffee.",
                "mateo@kotoba.app",
            ),
        ] {
            if let Some(owner) = profiles.get(email) {
                let circle = insert(
                    connection,
                    "circles",
                    json!({"name":name,"emoji":emoji,"lang":lang,"level":level,"description":description,"owner_id":owner["user_id"],"members_count":1}),
                )?;
                insert(
                    connection,
                    "circle_members",
                    json!({"circle_id":circle["id"],"user_id":owner["user_id"]}),
                )?;
                insert(
                    connection,
                    "messages",
                    json!({"circle_id":circle["id"],"sender_id":owner["user_id"],"sender_name":owner["display_name"],"sender_color":owner["avatar_color"],"body":format!("Welcome to {name}! Introduce yourself in your target language."),"lang":lang}),
                )?;
            }
        }
    }
    Ok(count == 0)
}

fn home(connection: &Connection, user: &User) -> HandlerResult {
    seed_data(connection)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let profile = profile(connection, user)
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let lang = text(profile.get("learning_lang"));
    let mission = first(
        connection,
        "SELECT * FROM missions WHERE lang IN (?1,'any') ORDER BY position LIMIT 1",
        &[json!(lang)],
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    let lesson=first(connection,"SELECT * FROM lessons WHERE lang=?1 AND id NOT IN (SELECT lesson_id FROM lesson_results WHERE user_id=?2) ORDER BY position LIMIT 1",&[json!(lang),json!(user.id)])
        .map_err(|error|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,error))?;
    let due = count(
        connection,
        "SELECT COUNT(*) FROM vocab_cards WHERE user_id=?1 AND (due_date IS NULL OR due_date<=?2)",
        &[json!(user.id), json!(now_day())],
    );
    let unread = count(
        connection,
        "SELECT COUNT(*) FROM alerts WHERE user_id=?1 AND is_read=0",
        &[json!(user.id)],
    );
    let posts = count(
        connection,
        "SELECT COUNT(*) FROM posts WHERE user_id=?1 AND date(created_at)=date('now')",
        &[json!(user.id)],
    );
    let messages = count(
        connection,
        "SELECT COUNT(*) FROM messages WHERE sender_id=?1 AND date(created_at)=date('now')",
        &[json!(user.id)],
    );
    let lessons = count(
        connection,
        "SELECT COUNT(*) FROM lesson_results WHERE user_id=?1 AND date(updated_at)=date('now')",
        &[json!(user.id)],
    );
    let circles = count(
        connection,
        "SELECT COUNT(*) FROM circle_members WHERE user_id=?1",
        &[json!(user.id)],
    );
    let help = count(
        connection,
        "SELECT COUNT(*) FROM posts WHERE corrections_count=0 AND user_id<>?1 AND lang=?2",
        &[json!(user.id), profile["native_lang"].clone()],
    );
    let mission_done=mission.as_ref().is_some_and(|row| count(connection,"SELECT COUNT(*) FROM posts WHERE user_id=?1 AND mission_id=?2 AND date(created_at)=date('now')",&[json!(user.id),row["id"].clone()])>0);
    Ok((
        axum::http::StatusCode::OK,
        json!({"profile":profile,"mission":mission,"mission_done":mission_done,"due":due,"next_lesson":lesson,"unread":unread,"today_activity":posts+messages+lessons,"help_needed":help,"circles":circles}),
    ))
}

fn count(connection: &Connection, sql: &str, values: &[Value]) -> i64 {
    let params = values.iter().map(sql_value).collect::<Vec<_>>();
    connection
        .query_row(sql, params_from_iter(params.iter()), |row| row.get(0))
        .unwrap_or_default()
}

fn feed(connection: &Connection, user: &User, query: &str) -> HandlerResult {
    let mut sql=String::from("SELECT p.*, EXISTS(SELECT 1 FROM likes l WHERE l.post_id=p.id AND l.user_id=?1) AS liked FROM posts p");
    let mut values = vec![json!(user.id)];
    let mut clauses = Vec::new();
    match query_value(query, "scope").as_deref() {
        Some("mine") => {
            clauses.push("p.user_id=?".to_owned());
            values.push(json!(user.id));
        }
        Some("following") => {
            clauses.push("(p.user_id IN (SELECT following_id FROM follows WHERE follower_id=?) OR p.user_id=?)".to_owned());
            values.push(json!(user.id));
            values.push(json!(user.id));
        }
        Some("help") => {
            let p = first(
                connection,
                "SELECT native_lang FROM profiles WHERE user_id=?1",
                &[json!(user.id)],
            )
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
            .unwrap_or(Value::Null);
            clauses.push("p.user_id<>? AND p.corrections_count=0 AND p.lang=?".to_owned());
            values.push(json!(user.id));
            values.push(p["native_lang"].clone());
        }
        _ => {}
    }
    for (key, column) in [("lang", "p.lang"), ("mission_id", "p.mission_id")] {
        if let Some(value) = query_value(query, key).filter(|v| !v.is_empty()) {
            clauses.push(format!("{column}=?"));
            values.push(json!(value));
        }
    }
    if !clauses.is_empty() {
        sql.push_str(" WHERE ");
        sql.push_str(&clauses.join(" AND "));
    }
    sql.push_str(" ORDER BY p.id DESC LIMIT 40");
    let data = rows(connection, &sql, &values).map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not load community feed: {e}"),
        )
    })?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn create_post(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let content = text(body.get("body")).trim();
    let lang = text(body.get("lang"));
    let kind = body
        .get("kind")
        .and_then(Value::as_str)
        .filter(|v| !v.is_empty())
        .unwrap_or("moment");
    let translation = text(body.get("translation"));
    if content.is_empty()
        || content.chars().count() > 1500
        || lang.is_empty()
        || lang.len() > 8
        || !matches!(kind, "moment" | "question" | "mission")
        || translation.chars().count() > 1500
    {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Post fields are invalid",
        ));
    }
    let p = profile(connection, user)
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let post=insert(connection,"posts",json!({"user_id":user.id,"author_name":p["display_name"],"author_color":p["avatar_color"],"author_native":p["native_lang"],"lang":lang,"kind":kind,"mission_id":if int(body.get("mission_id"))>0{json!(int(body.get("mission_id")))}else{Value::Null},"body":content,"translation":translation,"likes_count":0,"comments_count":0,"corrections_count":0}))
        .map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not create post: {e}")))?;
    let words = content.split_whitespace().count() as i64;
    let xp = if kind == "mission" { 20 } else { 10 };
    let _ = update(
        connection,
        "profiles",
        int(p.get("id")),
        json!({"xp":int(p.get("xp"))+xp,"words_written":int(p.get("words_written"))+words.max(1)}),
    );
    Ok((
        axum::http::StatusCode::CREATED,
        json!({"data":post,"liked":false}),
    ))
}

fn delete_post(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let post = first(connection, "SELECT * FROM posts WHERE id=?1", &[json!(id)])
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    if post
        .as_ref()
        .is_none_or(|p| int(p.get("user_id")) != user.id)
    {
        return Err(err(axum::http::StatusCode::NOT_FOUND, "Post not found"));
    }
    connection
        .execute("DELETE FROM posts WHERE id=?1", [id])
        .map_err(|e| {
            err(
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                format!("Could not delete post: {e}"),
            )
        })?;
    Ok((
        axum::http::StatusCode::OK,
        json!({"message":"Post deleted"}),
    ))
}

fn toggle_like(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let post = first(connection, "SELECT * FROM posts WHERE id=?1", &[json!(id)])
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
        .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Post not found"))?;
    let like = first(
        connection,
        "SELECT id FROM likes WHERE post_id=?1 AND user_id=?2",
        &[json!(id), json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let liked = like.is_none();
    if let Some(row) = like {
        connection
            .execute("DELETE FROM likes WHERE id=?1", [int(row.get("id"))])
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        connection
            .execute(
                "UPDATE posts SET likes_count=MAX(0,likes_count-1) WHERE id=?1",
                [id],
            )
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    } else {
        insert(connection, "likes", json!({"post_id":id,"user_id":user.id}))
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
        connection
            .execute(
                "UPDATE posts SET likes_count=likes_count+1 WHERE id=?1",
                [id],
            )
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        if int(post.get("user_id")) != user.id {
            let p = profile(connection, user)
                .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
            let _ = insert(
                connection,
                "alerts",
                json!({"user_id":post["user_id"],"kind":"like","text":format!("{} liked your post",text(p.get("display_name"))),"ref":id,"is_read":false}),
            );
        }
    }
    let likes = count(
        connection,
        "SELECT likes_count FROM posts WHERE id=?1",
        &[json!(id)],
    );
    Ok((
        axum::http::StatusCode::OK,
        json!({"liked":liked,"likes_count":likes}),
    ))
}

fn list_comments(connection: &Connection, id: i64) -> HandlerResult {
    let data = rows(
        connection,
        "SELECT * FROM comments WHERE post_id=?1 ORDER BY id",
        &[json!(id)],
    )
    .map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not load comments: {e}"),
        )
    })?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn add_comment(
    connection: &Connection,
    user: &User,
    id: i64,
    body: &Map<String, Value>,
) -> HandlerResult {
    let post = first(connection, "SELECT * FROM posts WHERE id=?1", &[json!(id)])
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
        .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Post not found"))?;
    let content = text(body.get("body")).trim();
    let corrected = text(body.get("corrected"));
    let explanation = text(body.get("explanation"));
    if content.is_empty()
        || content.chars().count() > 1000
        || corrected.chars().count() > 1500
        || explanation.chars().count() > 1000
    {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Comment fields are invalid",
        ));
    }
    let p = profile(connection, user)
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let correction = truthy(body.get("is_correction")) && !corrected.trim().is_empty();
    let comment=insert(connection,"comments",json!({"post_id":id,"user_id":user.id,"author_name":p["display_name"],"author_color":p["avatar_color"],"body":content,"is_correction":correction,"corrected":corrected,"explanation":explanation,"accepted":false}))
        .map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not create comment: {e}")))?;
    connection.execute("UPDATE posts SET comments_count=comments_count+1,corrections_count=corrections_count+?1 WHERE id=?2",rusqlite::params![if correction { 1 } else { 0 },id]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e.to_string()))?;
    let (kind, xp, notice) = if correction {
        (
            "correction",
            15,
            format!("{} corrected your post", text(p.get("display_name"))),
        )
    } else {
        (
            "comment",
            5,
            format!("{} commented on your post", text(p.get("display_name"))),
        )
    };
    let _ = insert(
        connection,
        "alerts",
        json!({"user_id":post["user_id"],"kind":kind,"text":notice,"ref":id,"is_read":false}),
    );
    if let Some(pr) = first(
        connection,
        "SELECT id,xp FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    {
        let _ = update(
            connection,
            "profiles",
            int(pr.get("id")),
            json!({"xp":int(pr.get("xp"))+xp}),
        );
    }
    Ok((axum::http::StatusCode::CREATED, json!({"data":comment})))
}

fn accept_correction(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let comment = first(
        connection,
        "SELECT * FROM comments WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Correction not found"))?;
    let post = first(
        connection,
        "SELECT * FROM posts WHERE id=?1",
        &[comment["post_id"].clone()],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Post not found"))?;
    if int(post.get("user_id")) != user.id {
        return Err(err(
            axum::http::StatusCode::FORBIDDEN,
            "Only the post author can accept a correction",
        ));
    }
    if !truthy(comment.get("is_correction")) || text(comment.get("corrected")).trim().is_empty() {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "This comment has no proposed correction",
        ));
    }
    update(connection, "comments", id, json!({"accepted":true}))
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    update(connection,"posts",int(post.get("id")),json!({"body":comment["corrected"],"corrections_count":int(post.get("corrections_count"))+1})).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e))?;
    let mut updated_post = post;
    if let Some(fields) = updated_post.as_object_mut() {
        fields.insert("body".to_owned(), comment["corrected"].clone());
        fields.insert(
            "corrections_count".to_owned(),
            json!(int(fields.get("corrections_count")) + 1),
        );
    }
    Ok((
        axum::http::StatusCode::OK,
        json!({"message":"Correction accepted","post":updated_post}),
    ))
}

fn list_lessons(connection: &Connection, user: &User) -> HandlerResult {
    let p = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Learner profile not found",
        )
    })?;
    let mut data = rows(
        connection,
        "SELECT * FROM lessons WHERE lang=?1 AND level=?2 ORDER BY position",
        &[p["learning_lang"].clone(), p["level"].clone()],
    )
    .map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not load lessons: {e}"),
        )
    })?;
    for lesson in &mut data {
        let result = first(
            connection,
            "SELECT * FROM lesson_results WHERE user_id=?1 AND lesson_id=?2",
            &[json!(user.id), lesson["id"].clone()],
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
        lesson["result"] = result.unwrap_or(Value::Null);
    }
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn complete_lesson(
    connection: &Connection,
    user: &User,
    id: i64,
    body: &Map<String, Value>,
) -> HandlerResult {
    let score = int(body.get("score"));
    if !(0..=100).contains(&score) {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Score must be between 0 and 100",
        ));
    }
    let lesson = first(
        connection,
        "SELECT * FROM lessons WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Lesson not found"))?;
    let old = first(
        connection,
        "SELECT * FROM lesson_results WHERE user_id=?1 AND lesson_id=?2",
        &[json!(user.id), json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let first_attempt = old.is_none();
    let best = old
        .as_ref()
        .map_or(score, |r| int(r.get("best")).max(score));
    if let Some(row) = old {
        update(
            connection,
            "lesson_results",
            int(row.get("id")),
            json!({"score":score,"best":best}),
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    } else {
        insert(
            connection,
            "lesson_results",
            json!({"user_id":user.id,"lesson_id":id,"score":score,"best":best}),
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    }
    let xp = if first_attempt {
        ((int(lesson.get("xp")).max(1) as f64) * (score as f64 / 100.0).max(0.4)).round() as i64
    } else {
        5
    };
    if let Some(p) = first(
        connection,
        "SELECT id,xp FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    {
        update(
            connection,
            "profiles",
            int(p.get("id")),
            json!({"xp":int(p.get("xp"))+xp}),
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    }
    let mut cards_added = 0;
    if let Ok(content) = serde_json::from_str::<Value>(text(lesson.get("content"))) {
        if let Some(pairs) = content.get("v").and_then(Value::as_array) {
            for pair in pairs {
                let Some(items) = pair.as_array() else {
                    continue;
                };
                if items.len() < 2 {
                    continue;
                }
                let term = text(items.first());
                if term.is_empty() {
                    continue;
                }
                let exists = first(
                    connection,
                    "SELECT id FROM vocab_cards WHERE user_id=?1 AND lang=?2 AND term=?3",
                    &[json!(user.id), lesson["lang"].clone(), json!(term)],
                )
                .ok()
                .flatten();
                if exists.is_none()&&insert(connection,"vocab_cards",json!({"user_id":user.id,"lang":lesson["lang"],"term":term,"meaning":items[1],"source":"lesson","due_date":now_day()})).is_ok(){cards_added+=1;}
            }
        }
    }
    Ok((
        axum::http::StatusCode::OK,
        json!({"xp":xp,"cards_added":cards_added,"first":first_attempt}),
    ))
}

fn list_cards(connection: &Connection, user: &User, query: &str) -> HandlerResult {
    let mut sql = String::from("SELECT * FROM vocab_cards WHERE user_id=?1");
    let mut values = vec![json!(user.id)];
    let lang = query_value(query, "lang").filter(|v| !v.is_empty());
    if let Some(lang) = &lang {
        sql.push_str(" AND lang=?");
        values.push(json!(lang));
    }
    let mut count_sql = "SELECT COUNT(*) FROM vocab_cards WHERE user_id=?1".to_owned();
    let mut count_values = vec![json!(user.id)];
    if let Some(lang) = &lang {
        count_sql.push_str(" AND lang=?2");
        count_values.push(json!(lang));
    }
    let total = count(connection, &count_sql, &count_values);
    let due_count = count(
        connection,
        &format!(
            "{count_sql} AND (due_date IS NULL OR due_date<=?{})",
            count_values.len() + 1
        ),
        &[count_values.clone(), vec![json!(now_day())]].concat(),
    );
    if query_value(query, "due").as_deref() == Some("1") {
        sql.push_str(" AND (due_date IS NULL OR due_date<=?)");
        values.push(json!(now_day()));
    }
    if let Some(search) = query_value(query, "q").filter(|v| !v.is_empty()) {
        sql.push_str(" AND (term LIKE ? OR meaning LIKE ?)");
        values.push(json!(format!("%{search}%")));
        values.push(json!(format!("%{search}%")));
    }
    sql.push_str(" ORDER BY due_date,id LIMIT 200");
    let data = rows(connection, &sql, &values).map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not load vocabulary cards: {e}"),
        )
    })?;
    Ok((
        axum::http::StatusCode::OK,
        json!({"data":data,"total":total,"due_count":due_count}),
    ))
}

fn add_card(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let term = text(body.get("term")).trim();
    let meaning = text(body.get("meaning")).trim();
    let lang = text(body.get("lang"));
    if term.is_empty() || meaning.is_empty() || lang.is_empty() || lang.len() > 8 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Term, meaning, and a valid language code are required",
        ));
    }
    let existing = first(
        connection,
        "SELECT * FROM vocab_cards WHERE user_id=?1 AND lang=?2 AND term=?3",
        &[json!(user.id), json!(lang), json!(term)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let created = existing.is_none();
    let card = if let Some(row) = existing {
        row
    } else {
        insert(connection,"vocab_cards",json!({"user_id":user.id,"term":term,"meaning":meaning,"lang":lang,"example":body.get("example"),"source":body.get("source").filter(|v|!v.is_null()).unwrap_or(&json!("manual")),"interval_days":0,"ease":2.5,"reps":0,"lapses":0,"due_date":now_day()})).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not add vocabulary card: {e}")))?
    };
    Ok((
        if created {
            axum::http::StatusCode::CREATED
        } else {
            axum::http::StatusCode::OK
        },
        json!({"data":card,"created":created}),
    ))
}

fn review_card(
    connection: &Connection,
    user: &User,
    id: i64,
    body: &Map<String, Value>,
) -> HandlerResult {
    let card = first(
        connection,
        "SELECT * FROM vocab_cards WHERE id=?1 AND user_id=?2",
        &[json!(id), json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Vocabulary card not found",
        )
    })?;
    let grade = body
        .get("grade")
        .map(|value| int(Some(value)))
        .unwrap_or(2)
        .clamp(0, 3);
    let mut ease = number(card.get("ease"));
    if ease == 0.0 {
        ease = 2.5
    }
    let mut interval = int(card.get("interval_days"));
    let mut reps = int(card.get("reps"));
    let mut lapses = int(card.get("lapses"));
    if grade == 0 {
        reps = 0;
        lapses += 1;
        ease = (ease - 0.2).max(1.3);
        interval = 0;
    } else {
        reps += 1;
        interval = match reps {
            1 => {
                if grade == 3 {
                    3
                } else {
                    1
                }
            }
            2 => {
                if grade == 1 {
                    2
                } else if grade == 3 {
                    7
                } else {
                    4
                }
            }
            _ => ((interval as f64)
                * (if grade == 1 {
                    1.2
                } else if grade == 3 {
                    ease * 1.3
                } else {
                    ease
                }))
            .round()
            .max(1.0) as i64,
        };
        if grade == 1 {
            ease = (ease - 0.15).max(1.3)
        } else if grade == 3 {
            ease += 0.15
        }
    }
    let due = if grade == 0 {
        now_day()
    } else {
        format_day_offset(interval)
    };
    update(
        connection,
        "vocab_cards",
        id,
        json!({"ease":ease,"interval_days":interval,"reps":reps,"lapses":lapses,"due_date":due}),
    )
    .map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not review vocabulary card: {e}"),
        )
    })?;
    let updated = first(
        connection,
        "SELECT * FROM vocab_cards WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .unwrap_or(Value::Null);
    if let Some(p) = first(
        connection,
        "SELECT id,xp FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .ok()
    .flatten()
    {
        let _ = update(
            connection,
            "profiles",
            int(p.get("id")),
            json!({"xp":int(p.get("xp"))+2}),
        );
    }
    Ok((axum::http::StatusCode::OK, json!({"data":updated})))
}

fn delete_card(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let changed = connection
        .execute(
            "DELETE FROM vocab_cards WHERE id=?1 AND user_id=?2",
            rusqlite::params![id, user.id],
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
    if changed == 0 {
        return Err(err(
            axum::http::StatusCode::NOT_FOUND,
            "Vocabulary card not found",
        ));
    }
    Ok((
        axum::http::StatusCode::OK,
        json!({"message":"Vocabulary card deleted"}),
    ))
}

fn partners(connection: &Connection, user: &User) -> HandlerResult {
    let p = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Learner profile not found",
        )
    })?;
    let data=rows(connection,"SELECT p.*, EXISTS(SELECT 1 FROM follows f WHERE f.follower_id=?1 AND f.following_id=p.user_id) AS following FROM profiles p WHERE p.user_id<>?2 AND p.learning_lang=?3 ORDER BY p.xp DESC LIMIT 40",&[json!(user.id),json!(user.id),p["native_lang"].clone()]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not load language partners: {e}")))?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn view_profile(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let p = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Learner profile not found",
        )
    })?;
    let following = count(
        connection,
        "SELECT COUNT(*) FROM follows WHERE follower_id=?1 AND following_id=?2",
        &[json!(user.id), json!(id)],
    ) > 0;
    let followers = count(
        connection,
        "SELECT COUNT(*) FROM follows WHERE following_id=?1",
        &[json!(id)],
    );
    let posts = rows(
        connection,
        "SELECT * FROM posts WHERE user_id=?1 ORDER BY created_at DESC LIMIT 30",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((
        axum::http::StatusCode::OK,
        json!({"profile":p,"posts":posts,"is_following":following,"followers_count":followers}),
    ))
}

fn toggle_follow(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    if id == user.id {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "You cannot follow yourself",
        ));
    }
    if first(
        connection,
        "SELECT id FROM profiles WHERE user_id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .is_none()
    {
        return Err(err(
            axum::http::StatusCode::NOT_FOUND,
            "Learner profile not found",
        ));
    }
    let existing = first(
        connection,
        "SELECT id FROM follows WHERE follower_id=?1 AND following_id=?2",
        &[json!(user.id), json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    if let Some(row) = existing {
        connection
            .execute("DELETE FROM follows WHERE id=?1", [int(row.get("id"))])
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        Ok((axum::http::StatusCode::OK, json!({"following":false})))
    } else {
        insert(
            connection,
            "follows",
            json!({"follower_id":user.id,"following_id":id}),
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
        let _ = insert(
            connection,
            "alerts",
            json!({"user_id":id,"kind":"follow","text":format!("{} started following you.",user.name),"ref":user.id,"is_read":false}),
        );
        Ok((axum::http::StatusCode::OK, json!({"following":true})))
    }
}

fn list_conversations(connection: &Connection, user: &User) -> HandlerResult {
    let data = rows(
        connection,
        "SELECT * FROM conversations WHERE user_a=?1 OR user_b=?2 ORDER BY last_at DESC,id DESC",
        &[json!(user.id), json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn start_conversation(
    connection: &Connection,
    user: &User,
    body: &Map<String, Value>,
) -> HandlerResult {
    let partner = int(body.get("user_id"));
    if partner <= 0 || partner == user.id {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "A valid conversation partner is required",
        ));
    }
    let (a, b) = if user.id < partner {
        (user.id, partner)
    } else {
        (partner, user.id)
    };
    let row = if let Some(row) = first(
        connection,
        "SELECT * FROM conversations WHERE user_a=?1 AND user_b=?2",
        &[json!(a), json!(b)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    {
        row
    } else {
        insert(connection, "conversations", json!({"user_a":a,"user_b":b}))
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    };
    Ok((axum::http::StatusCode::CREATED, json!({"data":row})))
}

fn list_messages(connection: &Connection, user: &User, query: &str) -> HandlerResult {
    let conversation = query_value(query, "conversation_id");
    let circle = query_value(query, "circle_id");
    let after = query_value(query, "after_id")
        .and_then(|v| v.parse::<i64>().ok())
        .unwrap_or(0);
    let (sql, mut args) = if let Some(id) = conversation {
        let cid = id.parse::<i64>().unwrap_or_default();
        if count(
            connection,
            "SELECT COUNT(*) FROM conversations WHERE id=?1 AND (user_a=?2 OR user_b=?3)",
            &[json!(cid), json!(user.id), json!(user.id)],
        ) == 0
        {
            return Err(err(
                axum::http::StatusCode::FORBIDDEN,
                "You are not a member of this conversation",
            ));
        }
        (
            "SELECT * FROM messages WHERE conversation_id=?1 AND id>?2 ORDER BY id DESC LIMIT 100"
                .to_owned(),
            vec![json!(cid), json!(after)],
        )
    } else if let Some(id) = circle {
        let cid = id.parse::<i64>().unwrap_or_default();
        if count(
            connection,
            "SELECT COUNT(*) FROM circle_members WHERE circle_id=?1 AND user_id=?2",
            &[json!(cid), json!(user.id)],
        ) == 0
        {
            return Err(err(
                axum::http::StatusCode::FORBIDDEN,
                "You are not a member of this circle",
            ));
        }
        (
            "SELECT * FROM messages WHERE circle_id=?1 AND id>?2 ORDER BY id DESC LIMIT 100"
                .to_owned(),
            vec![json!(cid), json!(after)],
        )
    } else {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "A conversation_id or circle_id is required",
        ));
    };
    let mut data = rows(connection, &sql, &args)
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    data.reverse();
    args.clear();
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn send_message(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let content = text(body.get("body")).trim();
    let lang = text(body.get("lang"));
    let conversation = int(body.get("conversation_id"));
    let circle = int(body.get("circle_id"));
    if content.is_empty() || content.chars().count() > 2000 || lang.len() > 8 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Message must be 1–2000 characters and specify one conversation or circle",
        ));
    }
    let (scope, conversation_id, circle_id) = if conversation > 0 {
        if count(
            connection,
            "SELECT COUNT(*) FROM conversations WHERE id=?1 AND (user_a=?2 OR user_b=?3)",
            &[json!(conversation), json!(user.id), json!(user.id)],
        ) == 0
        {
            return Err(err(
                axum::http::StatusCode::FORBIDDEN,
                "You are not a member of this conversation",
            ));
        }
        ("dm", json!(conversation), Value::Null)
    } else if circle > 0 {
        if count(
            connection,
            "SELECT COUNT(*) FROM circle_members WHERE circle_id=?1 AND user_id=?2",
            &[json!(circle), json!(user.id)],
        ) == 0
        {
            return Err(err(
                axum::http::StatusCode::FORBIDDEN,
                "You are not a member of this circle",
            ));
        }
        ("circle", Value::Null, json!(circle))
    } else {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "conversation_id or circle_id required",
        ));
    };
    let p = profile(connection, user)
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let message=insert(connection,"messages",json!({"conversation_id":conversation_id,"circle_id":circle_id,"sender_id":user.id,"sender_name":p["display_name"],"sender_color":p["avatar_color"],"body":content,"lang":lang})).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not send message: {e}")))?;
    if conversation > 0 {
        let preview = content.chars().take(200).collect::<String>();
        connection.execute("UPDATE conversations SET last_message=?1,last_at=CURRENT_TIMESTAMP,updated_at=CURRENT_TIMESTAMP WHERE id=?2",rusqlite::params![preview,conversation]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e.to_string()))?;
    }
    let words = content.split_whitespace().count() as i64;
    let _ = update(
        connection,
        "profiles",
        int(p.get("id")),
        json!({"xp":int(p.get("xp"))+3,"words_written":int(p.get("words_written"))+words.max(1),"messages_sent":int(p.get("messages_sent"))+1}),
    );
    let mut data = message;
    if let Some(object) = data.as_object_mut() {
        object.insert("scope".into(), json!(scope));
    }
    Ok((axum::http::StatusCode::CREATED, json!({"data":data})))
}

fn correct_message(
    connection: &Connection,
    user: &User,
    id: i64,
    body: &Map<String, Value>,
) -> HandlerResult {
    let mut message = first(
        connection,
        "SELECT * FROM messages WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Message not found"))?;
    if int(message.get("sender_id")) == user.id {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "You cannot correct your own message",
        ));
    }
    let corrected = text(body.get("corrected")).trim();
    let note = text(body.get("note"));
    if corrected.is_empty() || corrected.chars().count() > 2000 || note.chars().count() > 500 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Correction is required and note must be at most 500 characters",
        ));
    }
    let mut scope = "dm";
    let permitted = if let Some(cid) = message.get("conversation_id").filter(|v| !v.is_null()) {
        count(
            connection,
            "SELECT COUNT(*) FROM conversations WHERE id=?1 AND (user_a=?2 OR user_b=?2)",
            &[cid.clone(), json!(user.id)],
        ) > 0
    } else if let Some(cid) = message.get("circle_id").filter(|v| !v.is_null()) {
        scope = "circle";
        count(
            connection,
            "SELECT COUNT(*) FROM circle_members WHERE circle_id=?1 AND user_id=?2",
            &[cid.clone(), json!(user.id)],
        ) > 0
    } else {
        false
    };
    if !permitted {
        return Err(err(axum::http::StatusCode::FORBIDDEN, "Not allowed"));
    }
    update(
        connection,
        "messages",
        id,
        json!({"corrected":corrected,"note":note,"corrected_by":user.id}),
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    message = first(
        connection,
        "SELECT * FROM messages WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .unwrap_or(Value::Null);
    if let Some(object) = message.as_object_mut() {
        object.insert("scope".into(), json!(scope));
        object.insert("updated".into(), json!(true));
    }
    let p = profile(connection, user)
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let _ = insert(
        connection,
        "alerts",
        json!({"user_id":message["sender_id"],"kind":"correction","text":format!("{} suggested a correction in chat",text(p.get("display_name"))),"ref":id,"is_read":false}),
    );
    if let Some(profile) = first(
        connection,
        "SELECT id,xp FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?
    {
        update(
            connection,
            "profiles",
            int(profile.get("id")),
            json!({"xp":int(profile.get("xp"))+10}),
        )
        .map_err(|error| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, error))?;
    }
    Ok((axum::http::StatusCode::OK, json!({"data":message})))
}

fn list_circles(connection: &Connection, user: &User, query: &str) -> HandlerResult {
    let lang = query_value(query, "lang");
    let (sql, values) = if let Some(lang) = lang {
        ("SELECT c.*, EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id=c.id AND m.user_id=?1) AS joined FROM circles c WHERE c.lang=?2 ORDER BY c.members_count DESC,c.id DESC LIMIT 60".to_owned(),vec![json!(user.id),json!(lang)])
    } else {
        ("SELECT c.*, EXISTS(SELECT 1 FROM circle_members m WHERE m.circle_id=c.id AND m.user_id=?1) AS joined FROM circles c ORDER BY c.members_count DESC,c.id DESC LIMIT 60".to_owned(),vec![json!(user.id)])
    };
    let data = rows(connection, &sql, &values).map_err(|e| {
        err(
            axum::http::StatusCode::INTERNAL_SERVER_ERROR,
            format!("Could not load circles: {e}"),
        )
    })?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn create_circle(connection: &Connection, user: &User, body: &Map<String, Value>) -> HandlerResult {
    let name = text(body.get("name")).trim();
    let lang = text(body.get("lang"));
    let level = body
        .get("level")
        .and_then(Value::as_str)
        .filter(|v| !v.is_empty())
        .unwrap_or("A1");
    if name.is_empty() || name.chars().count() > 80 || lang.is_empty() || lang.len() > 8 {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Circle name and language are required",
        ));
    }
    if !["A1", "A2", "B1", "B2", "C1", "C2"].contains(&level) {
        return Err(err(
            axum::http::StatusCode::UNPROCESSABLE_ENTITY,
            "Invalid language level",
        ));
    }
    let circle=insert(connection,"circles",json!({"name":name,"emoji":body.get("emoji").filter(|v|!v.is_null()).unwrap_or(&json!("message-circle")),"lang":lang,"level":level,"description":body.get("description"),"owner_id":user.id,"members_count":1})).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,format!("Could not create circle: {e}")))?;
    insert(
        connection,
        "circle_members",
        json!({"circle_id":circle["id"],"user_id":user.id}),
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((
        axum::http::StatusCode::CREATED,
        json!({"data":circle,"joined":true}),
    ))
}

fn toggle_join(connection: &Connection, user: &User, id: i64) -> HandlerResult {
    let circle = first(
        connection,
        "SELECT * FROM circles WHERE id=?1",
        &[json!(id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| err(axum::http::StatusCode::NOT_FOUND, "Circle not found"))?;
    let member = first(
        connection,
        "SELECT * FROM circle_members WHERE circle_id=?1 AND user_id=?2",
        &[json!(id), json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    let joined = member.is_none();
    if let Some(member) = member {
        if int(circle.get("owner_id")) == user.id {
            return Err(err(
                axum::http::StatusCode::UNPROCESSABLE_ENTITY,
                "Owners cannot leave their own circle",
            ));
        }
        connection
            .execute(
                "DELETE FROM circle_members WHERE id=?1",
                [int(member.get("id"))],
            )
            .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        connection.execute("UPDATE circles SET members_count=MAX(1,members_count-1),updated_at=CURRENT_TIMESTAMP WHERE id=?1",[id]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e.to_string()))?;
    } else {
        insert(
            connection,
            "circle_members",
            json!({"circle_id":id,"user_id":user.id}),
        )
        .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
        connection.execute("UPDATE circles SET members_count=members_count+1,updated_at=CURRENT_TIMESTAMP WHERE id=?1",[id]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e.to_string()))?;
    }
    let members = count(
        connection,
        "SELECT members_count FROM circles WHERE id=?1",
        &[json!(id)],
    );
    Ok((
        axum::http::StatusCode::OK,
        json!({"joined":joined,"members_count":members}),
    ))
}

fn list_alerts(connection: &Connection, user: &User) -> HandlerResult {
    let data = rows(
        connection,
        "SELECT * FROM alerts WHERE user_id=?1 ORDER BY id DESC LIMIT 40",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?;
    Ok((axum::http::StatusCode::OK, json!({"data":data})))
}

fn read_alerts(connection: &Connection, user: &User) -> HandlerResult {
    let updated=connection.execute("UPDATE alerts SET is_read=1,updated_at=CURRENT_TIMESTAMP WHERE user_id=?1 AND is_read=0",[user.id]).map_err(|e|err(axum::http::StatusCode::INTERNAL_SERVER_ERROR,e.to_string()))?;
    Ok((
        axum::http::StatusCode::OK,
        json!({"message":"Alerts marked as read","updated":updated}),
    ))
}

fn progress(connection: &Connection, user: &User) -> HandlerResult {
    let profile = first(
        connection,
        "SELECT * FROM profiles WHERE user_id=?1",
        &[json!(user.id)],
    )
    .map_err(|e| err(axum::http::StatusCode::INTERNAL_SERVER_ERROR, e))?
    .ok_or_else(|| {
        err(
            axum::http::StatusCode::NOT_FOUND,
            "Could not load learner profile",
        )
    })?;
    let today = now_day();
    let mut series = Vec::new();
    for offset in (0..14).rev() {
        let date = if offset == 0 {
            today.clone()
        } else {
            format_day_offset(-offset)
        };
        let value=count(connection,"SELECT (SELECT COUNT(*) FROM posts WHERE user_id=?1 AND date(created_at)=?2)+(SELECT COUNT(*) FROM messages WHERE sender_id=?1 AND date(created_at)=?2)+(SELECT COUNT(*) FROM lesson_results WHERE user_id=?1 AND date(updated_at)=?2)",&[json!(user.id),json!(date)]);
        series.push(json!({"date":date,"count":value}));
    }
    let posts = count(
        connection,
        "SELECT COUNT(*) FROM posts WHERE user_id=?1",
        &[json!(user.id)],
    );
    let xp = int(profile.get("xp"));
    let stats = json!({"cards":count(connection,"SELECT COUNT(*) FROM vocab_cards WHERE user_id=?1",&[json!(user.id)]),"mastered":count(connection,"SELECT COUNT(*) FROM vocab_cards WHERE user_id=?1 AND reps>=4",&[json!(user.id)]),"lessons":count(connection,"SELECT COUNT(*) FROM lesson_results WHERE user_id=?1",&[json!(user.id)]),"posts":posts,"corrections_given":count(connection,"SELECT COUNT(*) FROM comments WHERE user_id=?1 AND is_correction=1",&[json!(user.id)]),"corrections_received":count(connection,"SELECT COUNT(*) FROM comments WHERE is_correction=1 AND post_id IN (SELECT id FROM posts WHERE user_id=?1)",&[json!(user.id)]),"corrections_accepted":count(connection,"SELECT COUNT(*) FROM comments WHERE is_correction=1 AND accepted=1 AND post_id IN (SELECT id FROM posts WHERE user_id=?1)",&[json!(user.id)]),"words_written":profile["words_written"],"messages_sent":profile["messages_sent"]});
    Ok((
        axum::http::StatusCode::OK,
        json!({"profile":profile,"series":series,"stats":stats,"level":xp/100+1,"level_progress":xp%100}),
    ))
}

#[cfg(test)]
mod tests {
    use super::{execute, supported_handler, supports_route};
    use crate::auth::User;
    use rusqlite::Connection;
    use serde_json::json;

    #[test]
    fn every_kotoba_handler_has_a_matching_route() {
        let routes = [
            ("GET", "/api/kotoba/me", "me"),
            ("PUT", "/api/kotoba/me", "update_me"),
            ("POST", "/api/kotoba/activity", "bump"),
            ("POST", "/api/kotoba/internal/notify", "notify"),
            ("POST", "/api/kotoba/internal/seed", "community_seed"),
            ("GET", "/api/kotoba/home", "home"),
            ("GET", "/api/kotoba/feed", "feed"),
            ("POST", "/api/kotoba/posts", "create_post"),
            ("DELETE", "/api/kotoba/posts/{id}", "delete_post"),
            ("POST", "/api/kotoba/posts/{id}/like", "toggle_like"),
            ("GET", "/api/kotoba/posts/{id}/comments", "list_comments"),
            ("POST", "/api/kotoba/posts/{id}/comments", "add_comment"),
            (
                "POST",
                "/api/kotoba/comments/{id}/accept",
                "accept_correction",
            ),
            ("GET", "/api/kotoba/lessons", "list_lessons"),
            (
                "POST",
                "/api/kotoba/lessons/{id}/complete",
                "complete_lesson",
            ),
            ("GET", "/api/kotoba/vocab", "list_cards"),
            ("POST", "/api/kotoba/vocab", "add_card"),
            ("POST", "/api/kotoba/vocab/{id}/review", "review_card"),
            ("DELETE", "/api/kotoba/vocab/{id}", "delete_card"),
            ("GET", "/api/kotoba/partners", "partners"),
            ("GET", "/api/kotoba/profile/{id}", "view_profile"),
            ("POST", "/api/kotoba/follow/{id}", "toggle_follow"),
            ("GET", "/api/kotoba/conversations", "list_conversations"),
            ("POST", "/api/kotoba/conversations", "start_conversation"),
            ("GET", "/api/kotoba/messages", "list_messages"),
            ("POST", "/api/kotoba/messages", "send_message"),
            (
                "POST",
                "/api/kotoba/messages/{id}/correct",
                "correct_message",
            ),
            ("GET", "/api/kotoba/circles", "list_circles"),
            ("POST", "/api/kotoba/circles", "create_circle"),
            ("POST", "/api/kotoba/circles/{id}/join", "toggle_join"),
            ("GET", "/api/kotoba/alerts", "list_alerts"),
            ("POST", "/api/kotoba/alerts/read", "read_alerts"),
            ("GET", "/api/kotoba/progress", "progress"),
        ];

        assert_eq!(routes.len(), 33);
        for (method, path, handler) in routes {
            assert!(supported_handler(handler), "{handler} is not registered");
            assert!(
                supports_route(method, path, handler),
                "{method} {path} does not match {handler}"
            );
            assert!(
                !supports_route("PATCH", path, handler),
                "{handler} unexpectedly accepts PATCH"
            );
        }
    }

    #[test]
    fn vocabulary_handlers_create_list_and_review_cards() {
        let directory = tempfile::tempdir().expect("create temporary database directory");
        let connection = Connection::open(directory.path().join("kotoba.sqlite"))
            .expect("create Kotoba database");
        connection
            .execute_batch(
                "CREATE TABLE vocab_cards (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    term TEXT NOT NULL,
                    meaning TEXT NOT NULL,
                    lang TEXT NOT NULL,
                    example TEXT,
                    source TEXT,
                    interval_days INTEGER NOT NULL DEFAULT 0,
                    ease REAL NOT NULL DEFAULT 2.5,
                    reps INTEGER NOT NULL DEFAULT 0,
                    lapses INTEGER NOT NULL DEFAULT 0,
                    due_date TEXT,
                    created_at TEXT,
                    updated_at TEXT
                );",
            )
            .expect("create vocabulary schema");
        drop(connection);

        let user = User {
            id: 7,
            name: "Learner".to_owned(),
            email: "learner@example.test".to_owned(),
            role: "user".to_owned(),
            email_verified_at: None,
            created_at: None,
            updated_at: None,
        };
        let (status, created) = execute(
            directory.path(),
            "add_card",
            "/api/kotoba/vocab",
            "",
            &json!({"term":"こんにちは","meaning":"hello","lang":"ja"}),
            &user,
        );
        assert_eq!(status, axum::http::StatusCode::CREATED);
        let card_id = created["data"]["id"].as_i64().expect("created card id");

        let (status, listed) = execute(
            directory.path(),
            "list_cards",
            "/api/kotoba/vocab",
            "lang=ja&due=1",
            &json!({}),
            &user,
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(listed["total"], 1);
        assert_eq!(listed["due_count"], 1);
        assert_eq!(listed["data"].as_array().map(Vec::len), Some(1));

        let (status, reviewed) = execute(
            directory.path(),
            "review_card",
            &format!("/api/kotoba/vocab/{card_id}/review"),
            "",
            &json!({"grade":3}),
            &user,
        );
        assert_eq!(status, axum::http::StatusCode::OK);
        assert_eq!(reviewed["data"]["reps"], 1);
        assert_eq!(reviewed["data"]["interval_days"], 3);
    }
}
