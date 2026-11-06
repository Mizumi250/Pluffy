use std::{env, fs, path::PathBuf};

fn main() {
    let manifest_dir =
        PathBuf::from(env::var_os("CARGO_MANIFEST_DIR").expect("Cargo sets CARGO_MANIFEST_DIR"));
    let module_dir = env::var_os("ARKZEN_MODULE_DIR")
        .map(PathBuf::from)
        .map(|path| {
            if path.is_absolute() {
                path
            } else {
                manifest_dir.join(path)
            }
        })
        .unwrap_or_else(|| manifest_dir.join("storage").join("arkzen-modules"));
    let generated_dir = module_dir.join("generated");
    println!("cargo:rerun-if-env-changed=ARKZEN_MODULE_DIR");
    println!("cargo:rerun-if-changed={}", generated_dir.display());

    let output = PathBuf::from(env::var_os("OUT_DIR").expect("Cargo sets OUT_DIR"))
        .join("generated_registry.rs");
    let mut registry = String::new();
    let mut modules = Vec::new();
    if let Ok(entries) = fs::read_dir(&generated_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.extension().and_then(|extension| extension.to_str()) != Some("rs") {
                continue;
            }
            let Some(name) = path
                .file_stem()
                .and_then(|stem| stem.to_str())
                .map(str::to_owned)
            else {
                continue;
            };
            if !name.chars().all(|character| {
                character.is_ascii_lowercase() || character.is_ascii_digit() || character == '-'
            }) {
                continue;
            }
            let identifier = format!("generated_{}", name.replace('-', "_"));
            registry.push_str(&format!(
                "#[path = {:?}]\nmod {identifier};\n",
                path.canonicalize()
                    .unwrap_or_else(|_| path.clone())
                    .to_string_lossy()
                    .as_ref()
            ));
            modules.push((name, identifier));
            println!("cargo:rerun-if-changed={}", path.display());
        }
    }
    registry.push_str(
        "\npub fn dispatch(slug: &str, handler: &str, request: crate::generated_runtime::RequestContext, database: crate::generated_runtime::Database, response: crate::generated_runtime::ResponseContext) -> Option<Result<crate::generated_runtime::HandlerResponse, crate::generated_runtime::HandlerError>> {\n\
             match slug {\n",
    );
    for (name, identifier) in modules {
        registry.push_str(&format!(
            "        {name:?} => Some({identifier}::dispatch(handler, request, database, response)),\n"
        ));
    }
    registry.push_str("        _ => None,\n    }\n}\n");
    fs::write(output, registry).expect("write generated Rust module registry");
}
