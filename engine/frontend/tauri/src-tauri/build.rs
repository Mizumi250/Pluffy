// ============================================================
// ARKZEN TAURI — build script v2.0
//
// 1. Runs tauri_build::build() exactly as before.
// 2. Writes $OUT_DIR/arkzen_frame.rs — the glue for
//    @arkzen:desktop:frame:tauri blocks (v15.0).
//
// A frame body is Rust that defines
//
//     pub fn frame(app: &mut tauri::App) -> Result<(), Box<dyn std::error::Error>>
//
// Each body is placed in its own module and `frame` is called from the shell's
// setup hook (main.rs → arkzen_frame::run). Inside a body these are in scope:
//
//     tauri, Manager, Emitter, Error        (use them without importing)
//     command(app_handle, "id", json_value) (emits "arkzen:command" to the web app)
//
// Opt-in: with no frame block the generated file only contains an empty
// `run`, so the shell behaves exactly as before.
//
// Where frames come from (first match wins):
//   1. desktop-frame.rs next to Cargo.toml  — written by export.js for a
//      single exported Tatemono.
//   2. the active Tatemonos listed in the root arkzen.json. If "desktopPrimary"
//      is set only that Tatemono's frame is used; otherwise every frame runs in
//      alphabetical order and a cargo warning says so.
//
// Nothing here can fail the build: unreadable registry or source files are
// reported as cargo warnings and treated as "no frame".
// ============================================================

use std::env;
use std::fs;
use std::path::{Path, PathBuf};

const OPEN_TAG: &str = "/* @arkzen:desktop:frame:tauri";
const CLOSE_TAG: &str = "/* @arkzen:desktop:frame:tauri:end */";

struct Frame {
    name: String,
    body: String,
}

/// Returns the frame body from a tatemono source, or None when it declares none.
fn extract_frame(source: &str) -> Option<String> {
    let mut search_from = 0;
    let open_at = loop {
        let at = search_from + source[search_from..].find(OPEN_TAG)?;
        let next = source[at + OPEN_TAG.len()..].chars().next();
        // Opening tag only: followed by whitespace or "*/", never ":end".
        if matches!(next, Some(c) if c.is_whitespace() || c == '*') {
            break at;
        }
        search_from = at + OPEN_TAG.len();
    };
    let opening_end = open_at + source[open_at..].find("*/")? + 2;
    let close_at = opening_end + source[opening_end..].find(CLOSE_TAG)?;
    let body = source[opening_end..close_at].trim();
    if body.is_empty() {
        None
    } else {
        Some(body.to_owned())
    }
}

/// `jo-payroll` -> `frame_jo_payroll` (a valid Rust module name).
fn module_ident(name: &str) -> String {
    let cleaned: String = name
        .chars()
        .map(|c| if c.is_ascii_alphanumeric() { c.to_ascii_lowercase() } else { '_' })
        .collect();
    format!("frame_{cleaned}")
}

fn render(frames: &[Frame]) -> String {
    let mut out = String::new();
    out.push_str(
        "// ARKZEN GENERATED — Tauri frame glue (build.rs). DO NOT EDIT.\n\
         #[allow(unused_imports)]\n\
         use std::error::Error;\n\
         #[allow(unused_imports)]\n\
         use tauri::{Emitter, Manager};\n\n\
         /// Sends a command id to the web app (event \"arkzen:command\", payload { id, payload }).\n\
         #[allow(dead_code)]\n\
         pub fn command(app: &tauri::AppHandle, id: &str, payload: serde_json::Value) {\n\
         \x20   let _ = app.emit(\"arkzen:command\", serde_json::json!({ \"id\": id, \"payload\": payload }));\n\
         }\n\n",
    );

    for frame in frames {
        out.push_str(&format!(
            "// Source: tatemonos/{name}/core.tsx — @arkzen:desktop:frame:tauri\n\
             #[allow(dead_code, unused_imports)]\n\
             mod {ident} {{\n\
             \x20   use super::*;\n\n{body}\n}}\n\n",
            name = frame.name,
            ident = module_ident(&frame.name),
            body = frame.body,
        ));
    }

    if frames.is_empty() {
        out.push_str(
            "pub fn run(_app: &mut tauri::App) -> Result<(), Box<dyn Error>> {\n    Ok(())\n}\n",
        );
    } else {
        out.push_str("pub fn run(app: &mut tauri::App) -> Result<(), Box<dyn Error>> {\n");
        for frame in frames {
            out.push_str(&format!("    {}::frame(app)?;\n", module_ident(&frame.name)));
        }
        out.push_str("    Ok(())\n}\n");
    }
    out
}

fn discover(manifest_dir: &Path) -> Vec<Frame> {
    // 1. Exported single-tatemono shell.
    let standalone = manifest_dir.join("desktop-frame.rs");
    println!("cargo:rerun-if-changed={}", standalone.display());
    if standalone.exists() {
        return match fs::read_to_string(&standalone) {
            Ok(body) if !body.trim().is_empty() => vec![Frame {
                name: "exported".to_owned(),
                body: body.trim().to_owned(),
            }],
            Ok(_) => Vec::new(),
            Err(error) => {
                println!("cargo:warning=[Arkzen] could not read desktop-frame.rs: {error}");
                Vec::new()
            }
        };
    }

    // 2. The engine registry (same location main.rs reads at runtime).
    let project_root: PathBuf = manifest_dir.join("../../../..");
    let registry_path = project_root.join("arkzen.json");
    println!("cargo:rerun-if-changed={}", registry_path.display());
    let text = match fs::read_to_string(&registry_path) {
        Ok(text) => text,
        Err(_) => return Vec::new(), // no registry: nothing to discover
    };
    let registry: serde_json::Value = match serde_json::from_str(text.trim_start_matches('\u{feff}')) {
        Ok(value) => value,
        Err(error) => {
            println!("cargo:warning=[Arkzen] arkzen.json is not valid JSON, skipping frames: {error}");
            return Vec::new();
        }
    };

    let mut frames = Vec::new();
    let modules = registry.get("modules").and_then(|m| m.as_array());
    for module in modules.into_iter().flatten() {
        if module.get("status").and_then(|s| s.as_str()) != Some("active") {
            continue;
        }
        let Some(name) = module.get("name").and_then(|n| n.as_str()) else { continue };
        let mut candidates = Vec::new();
        if let Some(file_path) = module.get("filePath").and_then(|p| p.as_str()) {
            candidates.push(project_root.join(file_path));
        }
        candidates.push(project_root.join("tatemonos").join(name).join("core.tsx"));
        let Some(source_path) = candidates.into_iter().find(|p| p.exists()) else { continue };
        println!("cargo:rerun-if-changed={}", source_path.display());
        let Ok(source) = fs::read_to_string(&source_path) else { continue };
        if let Some(body) = extract_frame(&source) {
            frames.push(Frame { name: name.to_owned(), body });
        }
    }
    frames.sort_by(|a, b| a.name.cmp(&b.name));

    match registry.get("desktopPrimary").and_then(|p| p.as_str()) {
        Some(primary) if !primary.is_empty() => {
            if !frames.iter().any(|f| f.name == primary) && !frames.is_empty() {
                println!(
                    "cargo:warning=[Arkzen] desktopPrimary \"{primary}\" has no @arkzen:desktop:frame:tauri block; no frame will run."
                );
            }
            frames.retain(|f| f.name == primary);
        }
        _ if frames.len() > 1 => {
            let names: Vec<&str> = frames.iter().map(|f| f.name.as_str()).collect();
            println!(
                "cargo:warning=[Arkzen] Several Tatemonos declare @arkzen:desktop:frame:tauri ({}); all run in alphabetical order. Set \"desktopPrimary\" in arkzen.json to choose one.",
                names.join(", ")
            );
        }
        _ => {}
    }
    frames
}

fn main() {
    let manifest_dir = PathBuf::from(env::var("CARGO_MANIFEST_DIR").expect("CARGO_MANIFEST_DIR"));
    let out_dir = PathBuf::from(env::var("OUT_DIR").expect("OUT_DIR"));

    let frames = discover(&manifest_dir);
    fs::write(out_dir.join("arkzen_frame.rs"), render(&frames)).expect("write arkzen_frame.rs");

    tauri_build::build()
}
