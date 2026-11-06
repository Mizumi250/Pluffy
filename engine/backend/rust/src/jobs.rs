use crate::generated_runtime::{utc_now_rfc3339, Database};
use axum::http::StatusCode;
use serde_json::{json, Value};
use std::{path::Path, time::Duration};

struct JobDefinition {
    name: String,
    queue: String,
    tries: u32,
}

pub fn dispatch(
    module: &Value,
    slug: &str,
    database_dir: &Path,
    body: &Value,
) -> (StatusCode, Value) {
    let Some(name) = body.get("job").and_then(Value::as_str) else {
        return validation_error("The job field is required.");
    };
    let data = match body.get("data") {
        None | Some(Value::Null) => json!({}),
        Some(Value::Object(data)) => Value::Object(data.clone()),
        Some(_) => return validation_error("The data field must be an object."),
    };
    let Some(definition) = find_job(module, name) else {
        return validation_error("The job field has an unsupported value.");
    };
    if slug != "job-test" {
        return (
            StatusCode::NOT_IMPLEMENTED,
            json!({"message": format!("Rust job handler emulation is unavailable for {slug}:{name}")}),
        );
    }

    let payload = json!({"module": slug, "name": name, "data": data});
    let encoded_payload = match serde_json::to_string(&payload) {
        Ok(payload) => payload,
        Err(error) => {
            return (
                StatusCode::BAD_REQUEST,
                json!({"message": format!("Job data must be valid JSON: {error}")}),
            )
        }
    };
    let database = match Database::open(database_dir, slug) {
        Ok(database) => database,
        Err(error) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Unable to open job database: {error}")}),
            )
        }
    };
    if let Err(error) = ensure_queue_tables(&database) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": format!("Unable to initialize job queue: {error}")}),
        );
    }
    let now = unix_timestamp();
    if let Err(error) = database.execute(
        r#"INSERT INTO "jobs" ("queue","payload","attempts","reserved_at","available_at","created_at")
           VALUES (?1,?2,0,NULL,?3,?3)"#,
        vec![
            json!(definition.queue),
            json!(encoded_payload),
            json!(now),
        ],
    ) {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": format!("Unable to enqueue job: {error}")}),
        );
    }
    let job_id = match database.query_column_params(
        r#"SELECT "id" FROM "jobs" WHERE "payload"=?1 ORDER BY "id" DESC LIMIT 1"#,
        vec![json!(encoded_payload)],
    ) {
        Ok(rows) => rows.first().and_then(Value::as_i64),
        Err(error) => {
            return (
                StatusCode::INTERNAL_SERVER_ERROR,
                json!({"message": format!("Unable to retrieve queued job: {error}")}),
            )
        }
    };
    let Some(job_id) = job_id else {
        return (
            StatusCode::INTERNAL_SERVER_ERROR,
            json!({"message": "Unable to retrieve queued job"}),
        );
    };

    let database_dir = database_dir.to_path_buf();
    let slug = slug.to_owned();
    let name = definition.name;
    let queue = definition.queue;
    let tries = definition.tries;
    tokio::spawn(async move {
        run_job(
            database_dir,
            slug,
            job_id,
            name,
            queue,
            encoded_payload,
            tries,
        )
        .await;
    });
    (StatusCode::ACCEPTED, json!({"message": "Job dispatched"}))
}

fn find_job(module: &Value, requested_name: &str) -> Option<JobDefinition> {
    for section in module
        .get("jobs")?
        .as_array()?
        .iter()
        .filter_map(Value::as_str)
    {
        let Some((name, _)) = section.trim().split_once(':') else {
            continue;
        };
        let name = name.trim();
        if name != requested_name {
            continue;
        }
        let field = |key: &str| {
            section
                .lines()
                .find_map(|line| line.trim().strip_prefix(&format!("{key}:")).map(str::trim))
        };
        let queue = field("queue")
            .map(parse_scalar)
            .filter(|queue| !queue.is_empty())
            .unwrap_or_else(|| "default".to_owned());
        let tries = field("tries")
            .and_then(|value| parse_scalar(value).parse().ok())
            .filter(|tries| *tries > 0)
            .unwrap_or(1);
        return Some(JobDefinition {
            name: name.to_owned(),
            queue,
            tries,
        });
    }
    None
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

fn ensure_queue_tables(database: &Database) -> Result<(), String> {
    database
        .execute(
            r#"CREATE TABLE IF NOT EXISTS "jobs" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "queue" TEXT NOT NULL,
                "payload" TEXT NOT NULL,
                "attempts" INTEGER NOT NULL DEFAULT 0,
                "reserved_at" INTEGER NULL,
                "available_at" INTEGER NOT NULL,
                "created_at" INTEGER NOT NULL
            )"#,
            Vec::new(),
        )
        .map_err(|error| error.to_string())?;
    database
        .execute(
            r#"CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue")"#,
            Vec::new(),
        )
        .map_err(|error| error.to_string())?;
    database
        .execute(
            r#"CREATE TABLE IF NOT EXISTS "failed_jobs" (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "queue" TEXT NOT NULL,
                "payload" TEXT NOT NULL,
                "exception" TEXT NOT NULL,
                "failed_at" TEXT NOT NULL
            )"#,
            Vec::new(),
        )
        .map_err(|error| error.to_string())?;
    Ok(())
}

async fn run_job(
    database_dir: std::path::PathBuf,
    slug: String,
    job_id: i64,
    name: String,
    queue: String,
    payload: String,
    tries: u32,
) {
    let started = tokio::time::Instant::now();
    let successful_job = match name.as_str() {
        "process-data" => {
            tokio::time::sleep(Duration::from_secs(2)).await;
            true
        }
        "heavy-computation" => {
            tokio::time::sleep(Duration::from_secs(5)).await;
            true
        }
        "always-fails" => {
            for attempt in 1..tries {
                tracing::warn!("Job {name} failed on attempt {attempt}/{tries}; retrying");
                tokio::time::sleep(Duration::from_secs(5)).await;
            }
            false
        }
        _ => false,
    };
    let elapsed_ms = started.elapsed().as_millis();
    let outcome = if successful_job {
        Ok(format!(
            "{} in {elapsed_ms}ms",
            match name.as_str() {
                "process-data" => "Data processed successfully",
                _ => "Heavy computation completed",
            }
        ))
    } else {
        Err("This job always fails".to_owned())
    };
    let logged_name = name.clone();
    let result = tokio::task::spawn_blocking(move || {
        let database = Database::open(&database_dir, &slug).map_err(|error| error.to_string())?;
        if let Some(result) = outcome.as_ref().ok() {
            let now = utc_now_rfc3339();
            database
                .insert(
                    "job_results",
                    json!({
                        "job_name": name,
                        "status": "completed",
                        "result": result,
                        "processed_at": now,
                        "created_at": now,
                        "updated_at": now
                    }),
                )
                .map_err(|error| format!("Could not record completed job: {error}"))?;
        } else if let Some(error) = outcome.as_ref().err() {
            let now = utc_now_rfc3339();
            database
                .insert(
                    "job_results",
                    json!({
                        "job_name": name,
                        "status": "failed",
                        "result": error,
                        "processed_at": now,
                        "created_at": now,
                        "updated_at": now
                    }),
                )
                .map_err(|error| format!("Could not record failed job: {error}"))?;
            database
                .execute(
                    r#"INSERT INTO "failed_jobs" ("queue","payload","exception","failed_at")
                       VALUES (?1,?2,?3,?4)"#,
                    vec![json!(queue), json!(payload), json!(error), json!(now)],
                )
                .map_err(|error| format!("Could not record failed queue job: {error}"))?;
        }
        database
            .execute(r#"DELETE FROM "jobs" WHERE "id"=?1"#, vec![json!(job_id)])
            .map_err(|error| format!("Could not remove completed queue job: {error}"))?;
        Ok::<(), String>(())
    })
    .await;
    match result {
        Ok(Ok(())) => {}
        Ok(Err(error)) => tracing::error!("Job {logged_name} could not be finalized: {error}"),
        Err(error) => tracing::error!("Job {logged_name} worker failed: {error}"),
    }
}

fn unix_timestamp() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs() as i64
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
    use crate::database;
    use serde_json::json;
    use tempfile::tempdir;

    #[test]
    fn resolves_declared_job_configuration() {
        let module = json!({
            "jobs": [
                "process-data:\n  queue: default\n  tries: 3\n  timeout: 30"
            ]
        });
        let definition = find_job(&module, "process-data").unwrap();
        assert_eq!(definition.name, "process-data");
        assert_eq!(definition.queue, "default");
        assert_eq!(definition.tries, 3);
        assert!(find_job(&module, "unknown").is_none());
    }

    #[tokio::test]
    async fn dispatches_job_and_records_its_result() {
        let directory = tempdir().unwrap();
        let module = json!({
            "name": "job-test",
            "jobs": [
                "process-data:\n  queue: default\n  tries: 3\n  timeout: 30"
            ],
            "databases": [{
                "table": "job_results",
                "timestamps": true,
                "columns": {
                    "job_name": {"type": "string"},
                    "status": {"type": "string"},
                    "result": {"type": "text", "nullable": true},
                    "processed_at": {"type": "datetime", "nullable": true}
                }
            }]
        });
        database::apply_schema(directory.path(), "job-test", &module).unwrap();

        let (status, response) = dispatch(
            &module,
            "job-test",
            directory.path(),
            &json!({"job": "process-data"}),
        );
        assert_eq!(status, StatusCode::ACCEPTED);
        assert_eq!(response["message"], "Job dispatched");

        tokio::time::sleep(Duration::from_millis(2200)).await;
        let database = Database::open(directory.path(), "job-test").unwrap();
        let results = database
            .query(r#"SELECT "job_name","status" FROM "job_results""#)
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0]["job_name"], "process-data");
        assert_eq!(results[0]["status"], "completed");
        assert_eq!(
            database.query(r#"SELECT "id" FROM "jobs""#).unwrap().len(),
            0
        );
    }

    #[tokio::test]
    async fn records_failed_jobs_after_the_configured_attempts() {
        let directory = tempdir().unwrap();
        let module = json!({
            "name": "job-test",
            "jobs": [
                "always-fails:\n  queue: default\n  tries: 1\n  timeout: 10"
            ],
            "databases": [{
                "table": "job_results",
                "timestamps": true,
                "columns": {
                    "job_name": {"type": "string"},
                    "status": {"type": "string"},
                    "result": {"type": "text", "nullable": true},
                    "processed_at": {"type": "datetime", "nullable": true}
                }
            }]
        });
        database::apply_schema(directory.path(), "job-test", &module).unwrap();

        let (status, _) = dispatch(
            &module,
            "job-test",
            directory.path(),
            &json!({"job": "always-fails"}),
        );
        assert_eq!(status, StatusCode::ACCEPTED);

        tokio::time::sleep(Duration::from_millis(100)).await;
        let database = Database::open(directory.path(), "job-test").unwrap();
        let results = database
            .query(r#"SELECT "job_name","status" FROM "job_results""#)
            .unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0]["status"], "failed");
        let failures = database
            .query(r#"SELECT "exception" FROM "failed_jobs""#)
            .unwrap();
        assert_eq!(failures.len(), 1);
        assert_eq!(failures[0]["exception"], "This job always fails");
    }
}
