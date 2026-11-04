use pluff_rust_backend::{app, realtime_app, AppState, Config};
use tokio::net::TcpListener;
use tower_http::trace::TraceLayer;
use tracing_subscriber::EnvFilter;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::dotenv().ok();
    tracing_subscriber::fmt()
        .with_env_filter(
            EnvFilter::try_from_default_env().unwrap_or_else(|_| EnvFilter::new("info")),
        )
        .init();

    let config = Config::from_env()?;
    let address = format!("{}:{}", config.host, config.port);
    let realtime_port = std::env::var("REVERB_PORT")
        .unwrap_or_else(|_| "8080".to_owned())
        .parse::<u16>()
        .map_err(|error| format!("REVERB_PORT must be a valid TCP port: {error}"))?;
    let realtime_address = format!("{}:{realtime_port}", config.host);
    let state = AppState::open(config)?;
    let realtime_listener = TcpListener::bind(&realtime_address).await?;
    let realtime_state = state.clone();
    tokio::spawn(async move {
        if let Err(error) = axum::serve(realtime_listener, realtime_app(realtime_state)).await {
            tracing::error!("Rust realtime server stopped: {error}");
        }
    });
    tracing::info!("Rust realtime (Pusher protocol) listening on ws://{realtime_address}");
    let application = app(state).layer(TraceLayer::new_for_http());
    let listener = TcpListener::bind(&address).await?;
    tracing::info!("Rust backend listening on http://{address}");
    axum::serve(listener, application)
        .with_graceful_shutdown(shutdown_signal())
        .await?;
    Ok(())
}

async fn shutdown_signal() {
    let ctrl_c = async {
        tokio::signal::ctrl_c()
            .await
            .expect("failed to install Ctrl+C handler");
    };

    #[cfg(unix)]
    let terminate = async {
        tokio::signal::unix::signal(tokio::signal::unix::SignalKind::terminate())
            .expect("failed to install termination signal handler")
            .recv()
            .await;
    };

    #[cfg(not(unix))]
    let terminate = std::future::pending::<()>();

    tokio::select! {
        _ = ctrl_c => {},
        _ = terminate => {},
    }
}
