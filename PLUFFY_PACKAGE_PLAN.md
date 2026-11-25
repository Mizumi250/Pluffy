# Pluffy Package Development Plan

Status: plan only. Nothing here is implemented. Written 2026-11-25 from a session that read the Pluffy repo (github.com/Mizumi250/Pluffy), read the full DSL catalog, and tested npm packaging in a sandbox.

This is Phase 4 of `FUTURE_PLANS.md`. That file only says "Introduce standalone package generation" and "Allow Tatemono to produce reusable and independent software packages", with no design. This document is the design.

All DSL names, header keys and CLI commands below are PROPOSALS. "Verified" means read in the repo or run in the sandbox. Everything else is a design choice or an unverified assumption, listed in section 12.

The scope in this document is the FULL scope Mizumi asked for: everything that suits Pluffy, not filtered into versions. Section 11 gives a work order, which is order only, not scope.

---

## 1. What a package is (settled in discussion)

A package is a named, versioned bundle of files plus a manifest, published to a registry so another project can install it. The manifest (`package.json`, `pyproject.toml`, `Cargo.toml`, `pom.xml`, `composer.json`, `.csproj`, `go.mod`) says what it is, what it needs, and how to use it.

- A package has no syntax of its own. It is ordinary code in the language of its ecosystem. The language decides the registry.
- Library, framework, components and SDK describe what is inside. All of them can be packages. React and Next.js are both npm packages. Verified: the installed `react` 19.3.1 is plain JavaScript with zero JSX; `next` 16.4.6 is 3,486 `.js` files, has a `bin` entry (`next`), and ships a Rust compiler (SWC) as separate prebuilt binary packages (`@next/swc-linux-x64-gnu`, 97 MB).
- JSX and TSX are compiled to plain JavaScript before publishing.
- Pluffy has three possible roles toward a package: consume (install one, as `deps install` does), orchestrate (drive its command, as export drives a stack build), and produce (write a new one). Phase 4 is the third role, which is new.
- A package is built, tested and packed. It is not run. `start.js` launches long-running processes (backends, frontends, queue worker). A library has nothing to run because another program imports it.

What Pluffy adds for packages: manifest, folder layout, build setup, derived code (SDK, types, validators) and verification. It does not replace writing the code.

---

## 2. Scope

### 2.1 Languages and registries in scope

A language is in scope when Pluffy already has it and a toolchain can build, pack and verify it.

| Language | DSL code | Registry | Pluffy already has it via |
|---|---|---|---|
| TypeScript / JavaScript | `ts` | npm, JSR (TypeScript-first, from knowledge), GitHub Packages | the whole engine |
| Python | `py` | PyPI | FastAPI backend |
| Rust | `rs` | crates.io | Rust backend |
| Go | `go` | Go modules (a git tag, no upload) | Go backend |
| Java | `java` | Maven Central | Spring Boot backend |
| C# | `cs` | NuGet | ASP.NET backend |
| PHP | `php` | Packagist (Composer) | Laravel backends |

The language codes match the backend variant codes already used in the catalog: "Backend-specific code variants use `php`, `ts`, `py`, `java`, `cs`, `go`, or `rs`".

Out of scope, with reasons:
- RubyGems, pub.dev, Hex, Swift Package Manager, CRAN, CPAN: Pluffy has no language for them.
- Native bindings and toolchain packages: they need prebuilt binaries per operating system, which one machine cannot verify.
- Container images and installers: the Docker export (`export-docker.js`) and the desktop target already cover these.

### 2.2 Package kinds in scope

| Kind | Produced by | Languages |
|---|---|---|
| `library` (covers frameworks, polyfills, test utilities, meta-packages; types-only is a build flag) | you write the code | all |
| `components` | you write TSX, or reuse `web:components` | npm, JSR |
| `plugin` | you write the code | per host tool (Vite, ESLint, Tailwind, Laravel, Maven, Gradle) |
| `config` | your files | mostly npm |
| `template` | your files | all |
| `assets` | your files | all |
| `cli` | you write the code | all (shares scope with Phase 5, CLI/TUI) |
| `backend` | generated from the tatemono's `database`, `api`, `routes`, `events`, `jobs` blocks | all seven backends |
| `sdk` | generated from `api` and `routes` blocks | all |
| `types` | generated from `database` and `api` blocks | all |
| `validators` | generated from `database` and `api` validation rules | all |
| `openapi` | the OpenAPI 3.1 spec as a package | all |

The Pluffy-specific kinds are `backend`, `sdk`, `types`, `validators` and `openapi`, because they come from what a tatemono already declares. Because they are derived, they can be emitted in every language. Authored kinds are per language by nature, so their code blocks are written in the target language.

---

## 3. Verified findings

| # | Finding | How verified |
|---|---|---|
| 1 | Unknown DSL families fail in the web parser. Game tatemonos (`unreal-scene-starter`, `godot-game`) fail `parseTatemono` today, and `validateDslTags` writes an error JSON for the UI overlay. The watcher builds every folder with `@arkzen:meta`, logs the failure and moves on. A new `pkg` family hits the same problem unless the parser knows it. | Ran the real `parser.ts` under tsx (earlier session) |
| 2 | `validatePages` has a precedent exemption for tatemonos with no pages: `content.includes('/* @arkzen:file:')`. `free-demo` and `hello-native` parse OK. | Read and ran |
| 3 | The tag regex only recognises the prefixes `web`, `native`, `desktop`. Other families (`ext`, `godot`, `unreal`, `pkg`) need `:end` unless listed in `YAML_ONLY_TAGS`. | Read `parser.ts` |
| 4 | `arkzen.json` stores categories as `activeStack`, `activeAppStack`, `activeDesktopStack` (also `activeBackend`). Packages have no framework to switch, so they need no key. The extension plan's open item is settled: it uses `activeExtensionStack`. | Read `arkzen.json`, `start.js` |
| 5 | `start.js` spawns long-running processes (backend in its own language, frontends, queue worker) with `--only=` and `--skip=` flags. It does not run libraries. | Read `start.js` |
| 6 | `export.js` has per-target early branches (Unreal precedent). `mizumi.js export <tat> <stack>` is the entry point. `mizumi publish` only pushes an exported `projects/` folder to GitHub. | Read both |
| 7 | `export-openapi.js` (518 lines) turns a tatemono's `database`, `api`, `routes` and `meta.auth` blocks into an OpenAPI 3.1 spec plus a Swagger UI page, from the same parsed output the backends use. Never throws, returns `{ok, reason}`. | Read header |
| 8 | Validation rules already exist in seven languages with 177 shared test vectors (`engine/backend/conformance/validation-vectors.json`). Handler-body APIs are per language by design. | Read `BACKEND_PARITY_CHECKLIST.md` |
| 9 | `engine/game/common/` helpers borrow `js-yaml` from `engine/frontend/nextjs/package.json` through `createRequire`. This breaks when `mizumi deps prune` removes Next's `node_modules`, and would also break a published package. | Read `common/index.js`, `mizumi.js` |
| 10 | `shared-sync.ts` copies `engine-core` files, `hooks`, `lib`, `stores` into every stack's `arkzen/core/` and never copies the router adapters. Stack folders hold generated files that the watcher rewrites. | Read `shared-sync.ts` |
| 11 | Toolchains present in the sandbox: node, python3. Not present: php, composer, cargo, go, java, dotnet. Reachable registries from the sandbox: npm, PyPI, crates.io (others are not on its allowlist). | `which`, network config |

---

## 4. Test log (sandbox, Node v22.23.5)

| Test | Result |
|---|---|
| tsdown 0.23.7 library build without `tsconfig.json` | Fails: "The `tsgo` generator requires a tsconfig file". A `tsconfig.json` is required for type output. |
| Same library with `tsconfig.json`, `--format esm,cjs --dts` | Builds in about 310 ms. Outputs `dist/index.mjs`, `index.cjs`, `index.d.mts`, `index.d.cts`. |
| `npm pack --dry-run` | 5 files: the four dist files plus `package.json`. |
| Hand-written manifest pointing at `dist/index.js` and `dist/index.d.ts`, then install the packed `.tgz` in a fresh project and import | FAILS with `ERR_MODULE_NOT_FOUND`: `dist/index.js` does not exist. The build produced `.mjs`, the manifest said `.js`. |
| tsup vs tsdown on npm | tsup 9.0.0: its README says "not actively maintained anymore", points to tsdown. tsdown 0.23.7 (published 2026-11-06) is Rolldown based and pre-1.0. |
| Not tested | Python, Rust, Go, Java, C#, PHP packaging; Vite library mode; SDK generation; any generator code in this plan. |

The failed import is the main design lesson: the manifest must be written from the real build output, and every package must be installed from its packed archive into a throwaway project and imported before export reports success.

---

## 5. Architecture

### 5.1 Where things live

```
engine/package/
  common/            shared: kind skeletons, manifest writers, verify runner, license texts
  npm/               TypeScript/JavaScript (also emits JSR and GitHub Packages variants)
  pypi/
  crates/
  go/
  maven/
  nuget/
  packagist/
  package.json       OWN tool dependencies (tsdown, js-yaml, zip/tar helpers)
engine/shared/arkzen/engine-core/    parser.ts, validator.ts: pkg parsing and validation
projects/package/<tat>/<id>/<registry>/    output (gitignored)
tatemonos/<tat>/core.tsx             source of truth
tatemonos/<tat>/assets/              files for assets and template kinds
```

Why `engine/package/` at the root of `engine/`: switchable stacks sit inside a category folder (`frontend/`, `backend/`). Standalone target families get their own top-level folder, next to `engine/game/`.

Why it is NOT inside `engine/frontend/` or `engine/backend/`: stack folders get rewritten by watchers, pruned by `deps prune` and synced by `shared-sync.ts`. A package built there can leak stack internals, depend on pruned files, or be overwritten. Packages are built in `projects/package/` only.

### 5.2 Rules

1. Tools are built with their own `engine/package/package.json`. Never borrow packages from a stack (finding 9).
2. A package may only import what its own manifest declares. Verification enforces this.
3. Reuse the tools, not the stack folders. Component packages use Vite library mode with their own devDependencies, not the `react-vite` stack.
4. The language is chosen per tatemono and per package (`targets:` in `pkg:project`), not globally. No `arkzen.json` key.
5. Derived kinds can be emitted for many languages from one declaration. Authored kinds are one language per source block.
6. Publishing stays manual. Pluffy never stores tokens and never publishes on its own. Credentials come from the user's environment (`.npmrc`, `~/.pypirc`, and so on).

### 5.3 Data flow

1. Watcher or export reads `core.tsx`.
2. `parseTatemono` parses `pkg:*` blocks into `parsed.pkg` (new field, same idea as `errorHandlers`).
3. For each package id and each target registry, the matching generator writes the package folder.
4. The generator builds with the ecosystem's standard toolchain.
5. It packs the archive (`.tgz`, wheel plus sdist, `.crate`, jar, `.nupkg`, zip).
6. The verify runner installs the archive into a throwaway project and imports it. If the toolchain is missing, verification is skipped and the result is marked UNVERIFIED, never "passed".

### 5.4 Toolchains and commands (proposed)

| Registry | Build | Pack | Verify consumer |
|---|---|---|---|
| npm | tsdown (Vite library mode for `components`) | `npm pack` | fresh project, `npm i <tgz>`, import ESM and CJS, type-check a consumer file |
| JSR | `deno publish --dry-run` | same | import from the local package |
| PyPI | hatchling or `uv build` | wheel plus sdist | fresh venv, `pip install`, import |
| crates.io | `cargo build` | `cargo package` | `cargo publish --dry-run`, consumer crate with a path dependency |
| Go | `go build ./...`, `go vet` | module zip layout | consumer module with a `replace` directive |
| Maven | `mvn package` | jar | local install, consumer pom |
| NuGet | `dotnet pack` | `.nupkg` | local feed, consumer project |
| Packagist | `composer validate` | zip | path repository, install, autoload test |

Only the npm row has been tested. The rest are from knowledge.

Commands:
- `node mizumi.js export <tat> package [--id=<id>] [--target=<registry>]` writes `projects/package/<tat>/...`, packs and verifies.
- `node mizumi.js deps install package` installs `engine/package/package.json`.
- `node mizumi.js new <name> --template=package` scaffolds a package tatemono.
- `node start.js --only=package` runs a rebuild watcher (for example `tsdown --watch`) for a dev loop. Libraries are not run.

---

## 6. DSL reference

### 6.1 Patterns taken from the existing catalog

| Existing pattern | Reused as |
|---|---|
| `godot:project`, `unity:project`, `unreal:project`: identity block per target | `pkg:project` |
| `godot:export`, `unreal:export`: per-target export settings | `pkg:target:<registry>` |
| `godot:assets`, `unity:assets`: asset declaration | `pkg:assets` |
| `endpoint:<backend>:name`, `handler:<backend>:name`: code written in a backend's language, codes `php ts py java cs go rs` | `pkg:source:<lang>:<name>`, `pkg:test:<lang>:<name>` |
| `desktop:frame:electron` (JS), `desktop:frame:tauri` (Rust): code in the target's own language | same idea: source blocks per language |
| `database[:identifier]`, `api[:identifier]`, `jobs[:backend]:identifier`: optional identifier | `pkg:*[:id]` |
| `@arkzen:file:id` with `{frontend}`, `{app}`, `{desktop}`, `{backend}` prefixes | new `{package}` prefix |
| YAML-only declaration shared across targets, code body per variant | derived kinds are YAML-only, `languages:` list |
| `web:components`, `web:style`, `web:script` | reused for `components` packages through `pkg:exports from:` |
| Inline declarations are not standalone blocks | none needed |

Naming: `pkg` is a new family prefix like `web`, `native`, `desktop`, `godot`. The catalog already has `@arkzen:module:rs` (a Rust module snippet for the Rust backend), so the backend-module kind uses `pkg:backend` to avoid a clash.

### 6.2 Shapes (existing, guideline Section 3D)

- Shape A: YAML only. Opening line has no `*/`, closed by a bare `*/`. No `:end`.
- Shape B: YAML header in the opening comment, `*/`, body, then `:end */`.
- Shape C: code block with `*/` on the same opening line, body, `:end */`.

`pkg:source`, `pkg:test` and `pkg:readme` use Shape B when they need a header and Shape C when they do not. `:end */` is always required. Parser work: the same multi-line opener exemption that layout tags have.

### 6.3 Sixteen new markers

**YAML only (Shape A), 13**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 1 | `@arkzen:pkg:project[:id]` | per package | Identity: name, version, kind, license, targets |
| 2 | `@arkzen:pkg:target:<registry>` | per registry | Registry-specific manifest fields, dependencies, publish settings |
| 3 | `@arkzen:pkg:exports[:id]` | per package | Public surface: entry points, subpaths, binaries |
| 4 | `@arkzen:pkg:build[:id]` | per package | Build tool and options |
| 5 | `@arkzen:pkg:verify[:id]` | per package | Verification checks |
| 6 | `@arkzen:pkg:sdk[:id]` | per package | Derived API client |
| 7 | `@arkzen:pkg:types[:id]` | per package | Derived type definitions |
| 8 | `@arkzen:pkg:validators[:id]` | per package | Derived validators |
| 9 | `@arkzen:pkg:openapi[:id]` | per package | OpenAPI spec as a package |
| 10 | `@arkzen:pkg:backend[:id]` | per package | Installable backend module |
| 11 | `@arkzen:pkg:assets[:id]` | per package | Bundled assets |
| 12 | `@arkzen:pkg:template[:id]` | per package | Starter / scaffolder |
| 13 | `@arkzen:pkg:plugin[:id]` | per package | Host-tool plugin settings |

**Code (Shape B or C), 3**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 14 | `@arkzen:pkg:source:<lang>:<name>` | per file | One source file of the package, in that language |
| 15 | `@arkzen:pkg:test:<lang>:<name>` | per file | One test file |
| 16 | `@arkzen:pkg:readme[:id]` | per package | README markdown body |

`<registry>` is one of `npm`, `jsr`, `pypi`, `crates`, `go`, `maven`, `nuget`, `packagist`, `github`.
`<lang>` is one of `ts`, `py`, `rs`, `go`, `java`, `cs`, `php`.
`[:id]` names a package when a tatemono makes more than one. With one package it can be omitted. Other blocks refer to a package with `package: <id>`.

### 6.4 Header keys per block (proposed)

**`pkg:project[:id]`**
- `name`, `version` (default `meta.version`), `description` (default `meta.description`)
- `kind`: `library` | `components` | `plugin` | `config` | `template` | `assets` | `cli` | `backend` | `sdk` | `types` | `validators` | `openapi`
- `license` (SPDX id), `author`, `repository`, `homepage`, `bugs`, `keywords[]`
- `targets[]`: registries to build for
- `visibility`: `public` | `private`
- `workspace_only` (bool): internal package that is never published
- `runtime`: minimum language and runtime versions (node, python, rustc, go, java, dotnet, php)

**`pkg:target:<registry>`**
- `package`: which package id this belongs to
- `name`: the registry name (scoped or vendor-prefixed where required)
- `dependencies`, `dev_dependencies`, `peer_dependencies`, `optional_dependencies`: written in the registry's own naming
- registry keys:
  - npm and jsr: `scope`, `access`, `tag`, `provenance`, `side_effects`, `engines`
  - pypi: `requires_python`, `classifiers[]`, `extras`, `entry_points`
  - crates: `edition`, `features`, `categories[]`, `rust_version`
  - go: `module_path`, `major_version`
  - maven: `group_id`, `artifact_id`, `packaging`, `java_version`, `signing`
  - nuget: `target_frameworks[]`, `authors`, `tags[]`
  - packagist: `vendor`, `php`, `autoload` (PSR-4 map), `laravel_providers[]`
  - github: `owner`, `registry_type`
- Never holds tokens or passwords. The validator rejects secret-like keys.

**`pkg:exports[:id]`**
- `entries`: map of subpath to a source name or a reference, for example `".": index` or `"./button": { from: "web:components:Button" }`
- `formats[]`: `esm`, `cjs`, `dts` (npm), others per ecosystem
- `bin`: map of command name to source name (kind `cli`)
- `types_only` (bool)

**`pkg:build[:id]`**
- `tool` (default per registry), `target`, `external[]`, `sourcemap`, `minify`, `clean`, `include[]` (files shipped), `tsconfig` overrides, `side_effects`, `bundle_css`

**`pkg:verify[:id]`**
- `install` (bool, default true), `import[]` (symbols the consumer must import), `type_check` (bool), `tests` (bool), `pack_contents[]` (files that must be in the archive), `max_size`, `license_check`, `consumers[]` (module systems or runtimes to test)

**`pkg:sdk[:id]`**
- `languages[]`, `client_name`, `base_url_env`, `auth` (`bearer` | `none`), `include[]` / `exclude[]` (api identifiers), `style` (`class` | `functions`), `retries`, `pagination`
- Source: `api` and `routes` blocks, `meta.auth`, through the same parsed output `export-openapi.js` uses

**`pkg:types[:id]`**
- `languages[]`, `include[]`, `naming`, `nullable_style`, `enums`, `from`: `database` | `api` | `both`

**`pkg:validators[:id]`**
- `languages[]`, `include[]`, `messages` (locale), `emit_vectors` (bool, ships the conformance vectors as tests)

**`pkg:openapi[:id]`**
- `server_url`, `backend` (response shapes differ slightly per backend), `include_docs_html` (bool)

**`pkg:backend[:id]`**
- `backend`: `laravel` | `express` | `fastapi` | `go` | `rust` | `spring-boot` | `aspnet`
- `include[]`: for example `database:notes`, `api:notes`, `routes`, `events`, `jobs`
- `mount`: route prefix, `migrations`: `bundled` | `separate`, `auth`: `host` | `bundled`, `config[]`: keys the host app sets

**`pkg:assets[:id]`**
- `include[]` (globs under `tatemonos/<name>/assets/`), `dest`, `index` (generate an index module mapping names to paths), `optimize` (for example SVG)

**`pkg:template[:id]`**
- `variables[]` (name, prompt, default), `ignore[]`, `post_install[]` (hints only), `bin` (command name for `npm create` style scaffolders)
- Template files come from `@arkzen:file` with `{package}` paths or from `tatemonos/<name>/assets/`

**`pkg:plugin[:id]`**
- `host`: `vite` | `eslint` | `tailwind` | `laravel` | `maven` | `gradle` | others
- `peer_range`, `name_prefix` (naming convention enforced, for example `vite-plugin-`), `entry` (exported function or class)
- `laravel` host: `provider` class, `auto_discover` (writes `extra.laravel.providers` in `composer.json`)

**`pkg:source:<lang>:<name>`**
- Header keys: `package`, `path` (default by language convention), `ext` (`ts`, `tsx`, `js`, `jsx` for the `ts` language), `entry` (bool)
- Default paths: `ts` to `src/<name>.ts`; `py` to `src/<pkg>/<name>.py`; `rs` to `src/<name>.rs`; `go` to `<name>.go`; `java` to `src/main/java/<group path>/<Name>.java`; `cs` to `<Name>.cs`; `php` to `src/<Name>.php`
- Body is code in that language, written verbatim.

**`pkg:test:<lang>:<name>`**
- Same header keys as `source`. Body is a test file. The generator wires the ecosystem's test runner (vitest or node test, pytest, `cargo test`, `go test`, JUnit, xunit, PHPUnit) and runs it during verify.

**`pkg:readme[:id]`**
- Body is markdown. If omitted, a minimal README is generated from `description` and the install command.

### 6.5 Existing DSL reused unchanged

- `@arkzen:meta`: name, version, description. No change; a package tatemono is detected by `pkg:*` blocks.
- Derived-kind inputs: `database`, `api`, `routes`, `events`, `listener`, `jobs` (read, never changed).
- Component packages: `web:components:Name`, `web:style:Name`, `web:script:name` are exported through `pkg:exports from:`.
- `assets/` folder convention.

### 6.6 New features on existing DSL

| Block | Change |
|---|---|
| `@arkzen:file` | New path prefix `{package}`, starting inside the package folder so the file ships in the archive. Add it to the prefix handling in `file-writer.ts` and the guideline's file-prefix list. |
| `@arkzen:web:components` | Validator rule for exported components: no imports from `@/arkzen/core/...` or the router adapter (`Link`, router adapter), because published packages cannot depend on stack internals. |
| `@arkzen:console` | No change. Backend console commands are not package CLIs. A CLI package uses `kind: cli` with `pkg:exports bin:`. The boundary with Phase 5 is open (section 12). |

### 6.7 Which blocks each kind uses

R = required, O = optional, X = not used.

| Kind | project | target | exports | build | source | test | sdk/types/validators/openapi | backend | assets | template | plugin | readme |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| library | R | R | R | O | R | O | X | X | X | X | X | O |
| components | R | R | R | O | O (or `from: web:components`) | O | X | X | O | X | X | O |
| plugin | R | R | R | O | R | O | X | X | X | X | R | O |
| config | R | R | R | X | O | X | X | X | X | X | X | O |
| template | R | R | X | X | X | X | X | X | O | R | X | O |
| assets | R | R | R | X | X | X | X | X | R | X | X | O |
| cli | R | R | R (with `bin`) | O | R | O | X | X | X | X | X | O |
| backend | R | R | X | O | O | O | X | R | X | X | X | O |
| sdk | R | R | O | O | O | O | R (`sdk`) | X | X | X | X | O |
| types | R | R | O | O | X | X | R (`types`) | X | X | X | X | O |
| validators | R | R | O | O | X | O | R (`validators`) | X | X | X | X | O |
| openapi | R | R | O | X | X | X | R (`openapi`) | X | X | X | X | O |

### 6.8 Validator rules (proposed)

- Package ids are unique; every `package:` reference resolves; with one package, `package:` can be omitted.
- `kind` and blocks agree with the table in 6.7.
- Source `<lang>` must match the target registry: npm and jsr need `ts`; pypi `py`; crates `rs`; go `go`; maven `java`; nuget `cs`; packagist `php`. `github` follows the package's language.
- Derived blocks reference existing `database` and `api` identifiers.
- Names follow registry rules: npm scope and lowercase, PyPI name normalisation, crate names, Go module path, Maven `groupId:artifactId`, NuGet id, Packagist `vendor/name` lowercase.
- `version` is valid semver (PEP 440 for PyPI is translated); `license` is a valid SPDX id.
- No secrets in any `pkg:*` block (keys named token, password, secret, key are rejected).
- Component exports pass the stack-import rule in 6.6.
- Warn when a target's toolchain is not installed: that target will build only if possible and verify as UNVERIFIED.

---

## 7. Examples

### 7.1 Authored TypeScript library on npm

```tsx
/* @arkzen:meta
name: greet-kit
version: 1.0.0
description: Small greeting helpers
auth: false
*/

/* @arkzen:pkg:project
name: greet
kind: library
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: "@demo/greet"
access: public
*/

/* @arkzen:pkg:source:ts:index
entry: true
*/
export function greet(name: string): string {
  return `Hello, ${name}`
}
/* @arkzen:pkg:source:ts:index:end */

/* @arkzen:pkg:exports
entries:
  ".": index
formats: [esm, cjs, dts]
*/

/* @arkzen:pkg:verify
import: [greet]
type_check: true
*/
```

### 7.2 Derived SDK in two languages from the tatemono's own API

```tsx
/* @arkzen:pkg:project:notes-sdk
name: notes-sdk
kind: sdk
license: MIT
targets: [npm, pypi]
*/

/* @arkzen:pkg:sdk:notes-sdk
languages: [ts, py]
include: [notes]
auth: bearer
*/

/* @arkzen:pkg:target:npm
package: notes-sdk
name: "@demo/notes-sdk"
*/

/* @arkzen:pkg:target:pypi
package: notes-sdk
name: demo-notes-sdk
requires_python: ">=3.10"
*/
```

The same tatemono still holds the `database:notes` and `api:notes` blocks the SDK is generated from.

### 7.3 Component library reusing existing web blocks

```tsx
/* @arkzen:pkg:project:ui
name: ui
kind: components
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
package: ui
name: "@demo/ui"
peer_dependencies:
  react: ">=18"
*/

/* @arkzen:pkg:exports:ui
entries:
  ".": { from: "web:components:Button" }
  "./styles.css": { from: "web:style:Button" }
*/
```

### 7.4 Laravel backend module on Packagist

```tsx
/* @arkzen:pkg:project:notes-module
name: notes-module
kind: backend
license: MIT
targets: [packagist]
*/

/* @arkzen:pkg:backend:notes-module
backend: laravel
include: [database:notes, api:notes]
mount: /notes
auth: host
*/

/* @arkzen:pkg:target:packagist
package: notes-module
vendor: demo
name: demo/notes-module
php: "^8.2"
*/
```

The generator for `pkg:backend` is the least certain part of this plan (section 12).

---

## 8. Engine work list

**Parser and validation (engine-core, then sync to every stack)**
- `parser.ts`: add `pkg` to the tag-prefix regex; register YAML-only tags (`project`, `target`, `exports`, `build`, `verify`, `sdk`, `types`, `validators`, `openapi`, `backend`, `assets`, `template`, `plugin`) and code tags (`source`, `test`, `readme`); multi-line opener exemption for Shape B; `parsed.pkg`; `validatePages` exemption when `pkg:*` blocks exist.
- `validator.ts`: the rules in 6.8.
- Each stack's `arkzen/types/index.ts`: `ArkzenPkg*` types (the parser imports `../types`).
- Check that the web watcher no longer logs errors for package tatemonos (finding 1).
- Do this in the same pass as the extension's `ext` family. It is the same change.

**New engine folder**
- `engine/package/common/` (kind skeletons, manifest writers, verify runner, license text generator, toolchain detection).
- One folder per registry (section 5.1), each with a generator and `node --test` tests in the style of `engine/game/unreal/generator.test.js`.
- `engine/package/package.json` for tool dependencies, installed by `deps install package`.
- Reuse the helper ideas from `engine/game/common/` (YAML reading, validators, asset lookup, staged replace) but do not import from a stack's `node_modules`.

**Derived generators**
- `sdk`: reuse the parsed output and `export-openapi.js` logic (or consume `openapi.json`), emit a client per language.
- `types`: from `database` columns and relations and `api` responses.
- `validators`: port from the existing per-language validators and ship `validation-vectors.json` as tests.
- `openapi`: wrap the existing exporter.
- `backend`: new, depends on each backend generator's module output (not read).

**CLI and export**
- `export.js`: `package` branch.
- `mizumi.js`: export wiring, menu, `deps install package`, `new --template=package`. Check how `cmdPublish` and `publishProject` treat the nested `projects/package/` folder (games share `projects/<engine>/`).
- `start.js`: `--only=package` watcher.
- `scaffold.js`: `BLOCKS` entries, `SHAPE_A_TAGS`, family parsing for `pkg`, `package` template, cross-checks.
- `file-writer.ts`: `{package}` prefix.
- `gui/renderer/menu.js`: entries (game entries exist there).

**Editor tooling and docs**
- `vscode-extension/extension.js` (tag regex around line 342), `lib/snippets.js`, `lib/scaffold.mjs`, `syntaxes/tatemono.tmLanguage.json`.
- `PLUFF_GUIDELINES_v14.md` new Part, quick lookup table and Section 3 order list; `PLUFF_DSL_CATALOG.md`, `README.md`, `PLUFFY_RUN_GUIDE.md`, `FUTURE_PLANS.md` status.
- `scan.js`, `tatemono-index.js`, `descriptions.json`: AI training data and index need package examples once the DSL is stable.

---

## 9. Verification policy

- Every package is built, packed, installed from the archive into a throwaway project and imported before export reports success.
- The consumer project is isolated and connected to nothing. That isolation is what caught the `.mjs` manifest bug.
- If a toolchain is missing, the export still writes the package where it can, marks it UNVERIFIED in the report, and never claims it passed.
- Playground (optional dev loop): the active web stack can import a package through a dev-only Vite alias to the package source. Nothing is written permanently into `engine/frontend/`.
- SDK packages talk HTTP to `http://localhost:8000`, so they work against whichever backend `start.js` is serving.

---

## 10. Packaging facts to rely on (from knowledge unless marked tested)

- npm: manifest `exports` must match real build output (tested). `files` controls the archive. `peerDependencies` for React-based component packages.
- PyPI: `pyproject.toml`, `src/<name>/` layout, wheel plus sdist.
- crates.io: `Cargo.toml`, `src/lib.rs` for libraries and `src/main.rs` for programs, `cargo package`.
- Go: `go.mod`; a release is a git tag, there is no upload.
- Maven: `pom.xml`, `src/main/java/...`, groupId plus artifactId, signing for Central.
- NuGet: `.csproj`, `dotnet pack`.
- Packagist: `composer.json` with PSR-4 `autoload`; Laravel packages declare providers under `extra.laravel.providers`.

---

## 11. Work order (order only, everything above is in scope)

1. Register the `pkg` family in the parser, validator, types, scaffold and VS Code, together with `ext`. Done when a package-only tatemono parses with zero web-watcher errors and existing tatemonos parse exactly as before.
2. `engine/package/common/` plus the `npm` generator for authored `library`, with the full build, pack, install and import verify. This is the only registry whose toolchain can be tested in the author's current sandbox.
3. Derived kinds on npm: `sdk`, `types`, `validators`, `openapi`.
4. Remaining npm kinds: `components`, `config`, `template`, `assets`, `plugin`, `cli`, plus JSR and GitHub Packages variants.
5. Other registries, one at a time, each only after its toolchain is available to run the verify step: PyPI, crates.io, Go, Maven, NuGet, Packagist.
6. `backend` kind, per backend.
7. Tooling and docs: scaffold template, menus, VS Code, guideline Part, catalog, README, run guide, `FUTURE_PLANS.md`, AI training data.

---

## 12. Risks and unverified items

- Only the npm path is tested. Python, Rust, Go, Java, C# and PHP packaging steps are from knowledge.
- The sandbox has only node and python3, so those toolchains must be present on the user's machine to verify.
- `pkg:backend` depends on how each backend generator emits its per-tatemono modules (for example `fastapi/pluff/generated/*`, `express/src/generated/*`). Those generators were not read. Feasibility is unconfirmed, and so is whether a module can mount into a host app cleanly.
- `sdk`, `types` and `validators` generators are unwritten. `export-openapi.js` was read only at the header.
- tsdown is pre-1.0 (0.23.7). Pin the version.
- The boundary between package `kind: cli` and Phase 5 (CLI/TUI) is open. Decide whether a CLI is a package kind or its own target before building either.
- `mizumi publish` lists `projects/` folders; how it handles `projects/package/<tat>/` is unchecked.
- License text generation and SPDX validation need a data source; not designed.
- JSR support is from knowledge only.
- Name rules and version translation (semver to PEP 440 and others) are not tested.

---

## 13. What the planning session did and did not read

Read fully: `FUTURE_PLANS.md`, `PLUFF_DSL_CATALOG.md` (149 lines), and, in the earlier extension session, `README.md` and `PLUFF_GUIDELINES_v14.md` Sections 1, 1B, 1C, 1D, 1G, 3, 3D, 4, 19C, 26B, 28B, 30.
Read in code: `parser.ts` tag validation and `parseTatemono`, `start.js` (header and spawn sections), the `mizumi.js` command list and `cmdPublish`, `export-openapi.js` header, `BACKEND_PARITY_CHECKLIST.md`, `engine/game/common/index.js`, `shared-sync.ts`.
Tested: npm packaging with tsdown, installing and importing a packed archive, the installed `react` and `next` packages.
NOT read: the backend generators, `export.js` beyond the earlier game and desktop sections, guideline Sections 2C to 2F, 1E, 1F and the game appendices, the Tauri Rust code.

---

## 14. Start here in the next session

Paste this into the new Claude session along with the repo URL:

> Read `PLUFFY_PACKAGE_PLAN.md` and `PLUFFY_EXTENSION_PLAN.md`, then read `engine/shared/arkzen/engine-core/parser.ts` (`validateDslTags`, `validatePages`, `parseTatemono`) and `shared-sync.ts`. Do step 1 only: register the `ext` and `pkg` families so tatemonos containing them parse with zero errors in the web watcher and existing tatemonos are unchanged. Show complete files, not diffs.

Constraints Mizumi has stated for this work: direct and decisive answers instead of option lists, complete file outputs instead of snippets or diffs, no unsolicited feature suggestions, read the actual source files before suggesting fixes, no em dashes. Mizumi wants the full scope listed, not split into versions.
