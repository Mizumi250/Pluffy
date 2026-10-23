#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde_json::Value;
use std::error::Error;
use std::fs;
use std::path::{Path, PathBuf};
use tauri::{LogicalSize, Manager, Size};

#[derive(Default)]
struct DesktopWindowOptions {
    width: Option<u32>,
    height: Option<u32>,
    min_width: Option<u32>,
    min_height: Option<u32>,
    resizable: Option<bool>,
    fullscreenable: Option<bool>,
    title: Option<String>,
}

fn registry_path() -> PathBuf {
    let manifest_dir = Path::new(env!("CARGO_MANIFEST_DIR"));
    let standalone_config = manifest_dir.join("desktop-config.json");
    if standalone_config.exists() {
        return standalone_config;
    }

    manifest_dir.join("../../../../arkzen.json")
}

fn load_window_options(path: &Path) -> Result<DesktopWindowOptions, Box<dyn Error>> {
    if !path.exists() {
        return Ok(DesktopWindowOptions::default());
    }

    let registry: Value = serde_json::from_str(&fs::read_to_string(path)?)?;
    let modules = registry
        .get("modules")
        .and_then(Value::as_array)
        .ok_or("Invalid Arkzen registry: `modules` must be an array")?;

    let mut configured_modules = modules
        .iter()
        .filter(|module| {
            module.get("status").and_then(Value::as_str) == Some("active")
                && module
                    .get("desktopConfig")
                    .and_then(|config| config.get("window"))
                    .and_then(Value::as_object)
                    .is_some()
        })
        .collect::<Vec<_>>();
    configured_modules.sort_by(|left, right| {
        left.get("name")
            .and_then(Value::as_str)
            .unwrap_or_default()
            .cmp(
                right
                    .get("name")
                    .and_then(Value::as_str)
                    .unwrap_or_default(),
            )
    });

    let mut selected = serde_json::Map::new();
    let mut conflicts = Vec::new();
    for module in configured_modules {
        let name = module
            .get("name")
            .and_then(Value::as_str)
            .ok_or("Invalid Arkzen registry: desktop-configured module is missing `name`")?;
        let window = module
            .get("desktopConfig")
            .and_then(|config| config.get("window"))
            .and_then(Value::as_object)
            .ok_or("Invalid Arkzen registry: `desktopConfig.window` must be an object")?;
        let mut has_conflict = false;

        for (key, value) in window {
            if let Some(existing) = selected.get(key) {
                if existing != value {
                    has_conflict = true;
                }
            } else {
                selected.insert(key.clone(), value.clone());
            }
        }

        if has_conflict {
            conflicts.push(name.to_owned());
        }
    }

    if !conflicts.is_empty() {
        eprintln!(
            "[Tauri] Conflicting desktop window settings; alphabetically earlier settings \
             take precedence. Conflicting Tatemonos: {}",
            conflicts.join(", ")
        );
    }

    let integer = |key: &str| -> Result<Option<u32>, Box<dyn Error>> {
        selected
            .get(key)
            .map(|value| {
                value
                    .as_u64()
                    .filter(|number| *number > 0)
                    .and_then(|number| u32::try_from(number).ok())
                    .ok_or_else(|| {
                        format!("Invalid desktop window `{key}`: expected a positive integer")
                            .into()
                    })
            })
            .transpose()
    };
    let boolean = |key: &str| -> Result<Option<bool>, Box<dyn Error>> {
        selected
            .get(key)
            .map(|value| {
                value
                    .as_bool()
                    .ok_or_else(|| {
                        format!("Invalid desktop window `{key}`: expected a boolean").into()
                    })
            })
            .transpose()
    };
    let title = selected
        .get("title")
        .map(|value| {
            value
                .as_str()
                .filter(|title| !title.trim().is_empty())
                .map(str::to_owned)
                .ok_or_else(|| {
                    "Invalid desktop window `title`: expected a non-empty string".into()
                })
        })
        .transpose()?;

    Ok(DesktopWindowOptions {
        width: integer("width")?,
        height: integer("height")?,
        min_width: integer("min_width")?,
        min_height: integer("min_height")?,
        resizable: boolean("resizable")?,
        fullscreenable: boolean("fullscreenable")?,
        title,
    })
}

fn apply_window_options(
    window: &tauri::WebviewWindow,
    options: DesktopWindowOptions,
) -> Result<(), Box<dyn Error>> {
    if options.width.is_some() || options.height.is_some() {
        let current = window
            .inner_size()?
            .to_logical::<f64>(window.scale_factor()?);
        window.set_size(Size::Logical(LogicalSize::new(
            options.width.map_or(current.width, f64::from),
            options.height.map_or(current.height, f64::from),
        )))?;
    }
    if options.min_width.is_some() || options.min_height.is_some() {
        window.set_min_size(Some(Size::Logical(LogicalSize::new(
            options.min_width.map_or(800.0, f64::from),
            options.min_height.map_or(600.0, f64::from),
        ))))?;
    }
    if let Some(resizable) = options.resizable {
        window.set_resizable(resizable)?;
    }
    if let Some(title) = options.title {
        window.set_title(&title)?;
    }
    if options.fullscreenable == Some(false) {
        eprintln!(
            "[Tauri] `fullscreenable: false` cannot be enforced portably by Tauri; \
             the platform's fullscreen controls may remain available."
        );
    }
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .setup(|app| -> Result<(), Box<dyn Error>> {
            let window = app
                .get_webview_window("main")
                .ok_or("Tauri main window was not created")?;
            let options = load_window_options(&registry_path())?;
            apply_window_options(&window, options)?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("failed to run Pluff Tauri desktop shell");
}
