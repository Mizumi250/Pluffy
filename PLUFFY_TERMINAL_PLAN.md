# Pluffy CLI / TUI Development Plan

Status: plan only. Nothing here is implemented. Written 2026-11-25 from a session that read the Pluffy repo (github.com/Mizumi250/Pluffy), the full DSL catalog and `FUTURE_PLANS.md`, and checked current framework status on npm, PyPI and crates.io.

This is Phase 5 of `FUTURE_PLANS.md`. That file only lists four bullets: "Introduce standalone CLI generation", "Introduce interactive Terminal User Interface (TUI) generation", "Allow generated terminal applications to operate independently", "Enable optional integration with Pluffy's existing ecosystem". This document is the design.

All DSL names, header keys and CLI commands below are PROPOSALS. "Verified" means read in the repo, run in the sandbox, or checked against a registry. Everything else is a design choice or an unverified assumption, listed in section 13.

Scope: the FULL scope Mizumi asked for, not filtered into versions. Section 12 gives a work order, which is order only.

Decision from Mizumi: no integration with the rest of Pluffy for now. Each project is an exportable standalone project. The generated code has no Pluffy imports and no Pluffy runtime. (The roadmap's optional integration bullet is out of this document.)

---

## 1. What this is

A tatemono describes a terminal program. Pluffy generates a runnable, independent project in the chosen language. One family covers both CLI and TUI.

- CLI: runs, prints, exits (flags, subcommands, pipes, prompts).
- TUI: takes over the screen and reacts to keys and mouse until you quit.
- A TUI is a CLI with an interactive mode, so they share the command model, config, packaging and tests. Pluffy's own `mizumi.js` already works this way (verified): commands such as `export` and `start`, plus interactive pickers. The root `package.json` has no dependencies, and the picker is hand-written ANSI plus `readline` (`mizumi.js` lines 35, 55, 309, 330).
- `@arkzen:console` is NOT this. It declares Artisan-style commands for a backend (guideline Section 17, variants `php` and `ts`), not standalone programs.

Design rule: declarative parts are shared across languages (commands, args, flags, prompts, data, screens, keymaps, theme, config). Code bodies are written per language, the same way backend bodies work ("A YAML-only declaration is shared where supported; a code body belongs to its backend variant", catalog). TUI frameworks differ too much to share screen code: a React tree (Ink), an immediate-mode draw loop (Ratatui), an Elm-style model (Bubble Tea) and a widget class tree (Textual) are different paradigms.

---

## 2. Can a TUI do app-like and game-like things

Yes (from knowledge). Full applications exist: lazygit, k9s, btop, vim. Games are a classic terminal genre: roguelikes, text adventures, puzzle and card games, arcade games.

Real limits:
- The screen is a grid of character cells, not pixels. Images need terminal graphics protocols that only some terminals support.
- Input arrives as escape sequences. Key-release events are not universal, so fast real-time games are harder than turn-based or tick-based ones.
- Terminals differ in color depth, Unicode width handling and mouse support.

So the DSL supports both event-driven screens and a tick-loop mode for games and animations.

---

## 3. Projects it can create

Every project below can be created as plain code. The levels say how much Pluffy generates.

**CLI projects**
1. Single-purpose utility (converter, renamer, formatter)
2. Multi-command tool with subcommands
3. Scaffolder or generator (asks questions, writes files)
4. Task runner or automation
5. Data tool (CSV and JSON processors, filters)
6. API or HTTP client
7. Pipe filter (stdin to stdout)
8. Installer, setup wizard or config tool
9. Service controller (start, stop, status, watchers)
10. Shell helpers (completions, prompt, git hooks)
11. Prompt wizard (questions, selects, confirms, then exit)

**TUI projects**
12. Dashboard or monitor
13. File manager or browser
14. Editor or viewer (text, hex, markdown)
15. Data explorer (table and database browsers)
16. Dev console (git client, log viewer, test runner UI, REST client)
17. Record manager (forms and tables for notes, todos, inventory, kanban)
18. Productivity tools (calendar, timers, habit tracker)
19. Chat, mail and RSS clients
20. Learning tools (quizzes, tutorials, terminal slide decks)
21. REPL or custom shell
22. Visualizers (ASCII animations, screensavers)
23. Games (roguelikes, text adventures, puzzle, card and arcade games)
24. Hybrid: a CLI with an optional TUI mode

| Level | Projects | What the DSL does |
|---|---|---|
| Fully declared | 2, 3, 11, 17 | Commands, args, flags, prompt steps, and fields for forms and tables with local file storage are declared in YAML. Pluffy generates the whole program. |
| Scaffold plus your code | 1, 4 to 10, 12 to 16, 18 to 24 | Pluffy generates the command model, entry point, build and packaging. You write handlers and screens in the runtime's language. |
| Not promised | Media and audio players, SSH-served apps | They need native audio libraries or server setup that one export cannot guarantee. |

The record manager (17) is the Pluffy-specific idea: a standalone terminal app generated from field declarations, data in a local file, no backend.

---

## 4. Runtimes (languages and frameworks)

Runtimes follow the languages Pluffy already has. The runtime id is the language code used for backend variants in the catalog: `ts`, `py`, `rs`, `go`, `java`, `cs`, `php`.

| Lang | TUI framework | CLI parsing | Status |
|---|---|---|---|
| `ts` | Ink 8.0.0 (React renderer, node >=22, published 2026-10-03) | commander 15.1.0 (node >=22.12.0, 2026-11-07) | checked on npm |
| `py` | Textual 8.2.8 (2026-06-30) | Typer 0.29.2 (2026-11-18), Click 8.5.1 | checked on PyPI |
| `rs` | Ratatui 0.30.2 (2026-06-19) with crossterm 0.29.0 (2025-04-05) | clap 4.6.10 (2026-11-24) | checked on crates.io |
| `go` | Bubble Tea | Cobra | NOT checked (GitHub API returned nothing); from knowledge |
| `java` | per ecosystem | per ecosystem | NOT checked |
| `cs` | per ecosystem | per ecosystem | NOT checked |
| `php` | per ecosystem | per ecosystem | NOT checked |

Choices and exclusions:
- `ts` uses Ink because it renders React, which keeps the TSX bodies Pluffy already uses. This matches how Lynx is a separate renderer using TSX in the catalog.
- OpenTUI (`@opentui/core` 0.9.9, published 2026-11-23) is excluded for now: pre-1.0 and requires node >=26.4.0. The repo is active (pushed 2026-11-25, about 13.9k stars).
- `blessed` is excluded: last published 2015-09-03.
- Pin pre-1.0 and fast-moving packages.
- Java, C# and PHP get CLI parsing by default. Their TUI frameworks are not checked, so TUI for those languages is declared in scope but marked unverified until a framework is chosen and tested.

Single-binary output: Go and Rust produce native binaries (from knowledge). TypeScript can bundle to one executable through Node's single executable support or Bun's compile (from knowledge, untested). Python needs a bundler (untested).

---

## 5. Verified findings (repo)

| # | Finding | How verified |
|---|---|---|
| 1 | Unknown DSL families fail in the web parser. Game tatemonos fail `parseTatemono` today and `validateDslTags` writes an error JSON for the UI overlay. The watcher builds every folder with `@arkzen:meta`, logs the failure and moves on. A new `term` family hits the same problem unless the parser knows it. | Ran the real `parser.ts` under tsx (earlier session) |
| 2 | `validatePages` has a precedent exemption for tatemonos with no pages (`content.includes('/* @arkzen:file:')`). `free-demo` and `hello-native` parse OK. | Read and ran |
| 3 | The tag regex only recognises prefixes `web`, `native`, `desktop`. Other families need `:end` unless listed in `YAML_ONLY_TAGS`. | Read `parser.ts` |
| 4 | Catalog patterns for per-language code: `endpoint:<backend>:name`, `handler:<backend>:name`, `policy:<backend>:method`, with codes `php ts py java cs go rs`. Frames are code in the target's own language (`desktop:frame:electron` JS, `desktop:frame:tauri` Rust). | Read `PLUFF_DSL_CATALOG.md` |
| 5 | Existing identity and export blocks per target: `godot:project`, `unity:project`, `unreal:project`, `godot:export`, `unreal:export`; assets: `godot:assets`, `unity:assets`. | Read catalog |
| 6 | `export.js` has per-target early branches (Unreal precedent). `mizumi.js export <tat> <stack>` is the entry point. `mizumi publish` only pushes an exported `projects/` folder to GitHub. `start.js` launches long-running processes, not terminal programs. | Read |
| 7 | `engine/game/common/` helpers borrow `js-yaml` from `engine/frontend/nextjs/package.json` through `createRequire`. This breaks when `mizumi deps prune` removes Next's `node_modules`, and would break an exported standalone project. | Read `common/index.js`, `mizumi.js` |
| 8 | `shared-sync.ts` copies `engine-core` files plus `hooks`, `lib`, `stores` into every stack's `arkzen/core/`. Parser, validator and type changes must be synced to every stack. | Read `shared-sync.ts`, guideline 28B |
| 9 | Toolchains in the author's sandbox: node v22.23.5, python3. Not present: cargo, go, java, dotnet, php. Reachable registries: npm, PyPI, crates.io. | `which`, network config |

Nothing for this phase has been built or run. No TUI or CLI framework was installed in the sandbox for this plan. The framework versions in section 4 come from registry metadata only.

---

## 6. Architecture

### 6.1 Where things live

```
engine/terminal/
  common/            command model, prompt model, data model, theme, keymap, verify harness, completions, man pages
  ts/                Ink + commander
  py/                Textual + Typer
  rs/                Ratatui + clap
  go/                Bubble Tea + Cobra
  java/  cs/  php/   per ecosystem
  package.json       OWN tool dependencies (js-yaml, archive helpers)
engine/shared/arkzen/engine-core/    parser.ts, validator.ts: term parsing and validation
projects/terminal/<tat>/<lang>/      export output (gitignored)
tatemonos/<tat>/core.tsx             source of truth
tatemonos/<tat>/assets/              levels, templates, art, wordlists
```

Why `engine/terminal/` at the root of `engine/`: switchable stacks sit inside a category folder (`frontend/`, `backend/`). Standalone target families get their own top-level folder, next to `engine/game/` and `engine/package/`.

### 6.2 Rules

1. The exported project has no Pluffy imports and no Pluffy runtime. It builds with the language's own toolchain.
2. Tools use their own `engine/terminal/package.json`. Never borrow from a stack (finding 7).
3. Runtime is chosen per tatemono (`runtimes:` in `term:project`), not globally. No `arkzen.json` key.
4. A tatemono may target several runtimes. Declarative blocks feed all of them. Code blocks are per language, so a runtime listed without its code blocks gets generated defaults where the project is fully declared, and a validation error where code is required.
5. Every program is non-interactive safe: when stdin or stdout is not a terminal, a TUI falls back to the CLI path or prints help, and prompts accept their answers as flags (from knowledge of terminal conventions; generated by the engine).
6. Output honours `NO_COLOR`, and supports `--json` where a command declares `output: json`.

### 6.3 Data flow

1. Watcher or export reads `core.tsx`.
2. `parseTatemono` parses `term:*` blocks into `parsed.term` (new field, same idea as `errorHandlers`).
3. For each runtime in `runtimes:`, the matching generator writes the project folder.
4. It builds with the language toolchain.
5. The verify runner runs the program (section 10).
6. Packaging writes the requested distribution formats.

### 6.4 Commands (proposed)

- `node mizumi.js export <tat> terminal [--lang=<code>]` writes `projects/terminal/<tat>/<lang>/`, builds and verifies.
- `node mizumi.js deps install terminal` installs `engine/terminal/package.json`.
- `node mizumi.js new <name> --template=cli|tui|records|game` scaffolds a terminal tatemono.
- `node start.js --only=terminal` runs a rebuild watcher for a dev loop (TUI programs need a real terminal, so the watcher rebuilds and the user launches the program).

---

## 7. DSL reference

### 7.1 Patterns taken from the existing catalog

| Existing pattern | Reused as |
|---|---|
| `godot:project`, `unity:project`, `unreal:project` | `term:project` |
| `godot:export`, `unreal:export` | `term:export` |
| `godot:assets`, `unity:assets` | `term:assets` |
| `handler:<backend>:name`, `endpoint:<backend>:name` (codes `php ts py java cs go rs`) | `term:handler:<lang>:<name>`, `term:view:<lang>:<name>`, `term:script:<lang>:<name>`, `term:test:<lang>:<name>` |
| `web:script:name` (named helper module) | `term:script:<lang>:<name>` |
| `web:style`, `native:config`, `web:config` | `term:theme`, `term:config` |
| `database[:identifier]`, `jobs[:backend]:identifier` (optional identifier) | `term:*:<name>` identifiers |
| `desktop:frame:*` (per-target code in the target's language) | per-language view blocks |
| `@arkzen:file:id` | reused unchanged for any extra file |

Naming: one new family prefix, `term`, covering both CLI and TUI. It does not clash with `@arkzen:console`.

### 7.2 Shapes (existing, guideline Section 3D)

- Shape A: YAML only. Opening line has no `*/`, closed by a bare `*/`. No `:end`.
- Shape B: YAML header in the opening comment, `*/`, body, then `:end */`.
- Shape C: code block with `*/` on the same opening line, body, `:end */`.

Code blocks use Shape B when they need a header and Shape C when they do not. `:end */` is always required. Parser work: the same multi-line opener exemption that layout tags have.

### 7.3 Seventeen new markers

**YAML only (Shape A), 12**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 1 | `@arkzen:term:project` | once | Identity, mode, runtimes, terminal behavior |
| 2 | `@arkzen:term:runtime:<lang>` | per language | Framework and build settings for one language |
| 3 | `@arkzen:term:config` | once | Config file, env vars, defaults |
| 4 | `@arkzen:term:theme` | once | Colors, styles, borders, fallbacks |
| 5 | `@arkzen:term:keymap[:name]` | per scope | Key and mouse bindings |
| 6 | `@arkzen:term:command:<name>` | per command | CLI command: args, flags, output, examples |
| 7 | `@arkzen:term:prompt:<name>` | per wizard | Interactive question flow |
| 8 | `@arkzen:term:screen:<name>` | per screen | Declared TUI screen: layout and widgets |
| 9 | `@arkzen:term:data:<name>` | per collection | Records with fields and local storage |
| 10 | `@arkzen:term:loop:<name>` | per loop | Tick loop for games and animations |
| 11 | `@arkzen:term:assets` | once | Bundled files and templates |
| 12 | `@arkzen:term:export` | once | Platforms, formats, completions, man page |

**Code (Shape B or C), 5**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 13 | `@arkzen:term:handler:<lang>:<name>` | per command | Command handler code |
| 14 | `@arkzen:term:view:<lang>:<name>` | per view | Custom screen, widget or loop code |
| 15 | `@arkzen:term:script:<lang>:<name>` | per module | Shared helper module |
| 16 | `@arkzen:term:test:<lang>:<name>` | per file | Test code |
| 17 | `@arkzen:term:readme` | once | README markdown body |

`<lang>` is one of `ts`, `py`, `rs`, `go`, `java`, `cs`, `php`.
Command names may be dotted for subcommands, for example `db.migrate` for `tool db migrate`.

### 7.4 Header keys per block (proposed)

**`term:project`**
- `name`, `binary` (executable name, lowercase, no spaces), `version` (default `meta.version`), `description` (default `meta.description`), `author`, `license` (SPDX id), `homepage`
- `mode`: `cli` | `tui` | `hybrid`
- `runtimes[]`: language codes to generate
- `default_command` (command run when no subcommand is given, hybrid uses it to choose TUI)
- Terminal behavior: `alt_screen` (bool), `mouse` (bool), `min_size` (`{ width, height }`), `color` (`auto|16|256|truecolor|none`), `unicode` (`auto|ascii`), `title`
- `tui_flag`: flag name that starts TUI mode in a hybrid program (default `--tui`)

**`term:runtime:<lang>`**
- `framework`: `ink`, `commander`, `textual`, `typer`, `click`, `ratatui`, `clap`, `bubbletea`, `cobra`, and others per language
- `tui` (bool): use the TUI framework or CLI parsing only
- `dependencies`, `dev_dependencies`: in the language's own naming
- `min_version` (node, python, rustc, go, java, dotnet, php)
- `bundle`: `none` | `single_binary` | `zipapp` (per language support)
- `edition`, `features`, `module_path`, `package_name` for languages that need them

**`term:config`**
- `file` (name), `format` (`toml` | `json` | `yaml`), `location` (`xdg` | `home` | `cwd`), `env_prefix`
- `defaults` (object), `schema` (field types)
- `flags_override` (bool): flags override file and env, in that order of precedence

**`term:theme`**
- `palette`: named colors as hex or ANSI names
- `roles`: `primary`, `secondary`, `muted`, `success`, `warning`, `error`, `border`, `focus`, `selection`, each pointing at a palette color, optional bold, dim, underline
- `border`: `rounded` | `single` | `double` | `ascii`
- `fallback`: map to 16 colors for terminals without truecolor

**`term:keymap[:name]`**
- `scope` (screen name or `global`)
- `actions`: map of action id to key list, for example `quit: [q, ctrl+c]`
- `vim` (bool): add hjkl style navigation
- `mouse`: `click`, `scroll`, `drag` toggles
- `help` (bool): generate a help overlay from the actions

**`term:command:<name>`**
- `description`, `aliases[]`, `hidden`, `deprecated`
- `args[]`: `name`, `type` (`string|int|float|bool|path|choice`), `required`, `variadic`, `choices`, `default`, `description`
- `flags[]`: `name`, `short`, `type`, `default`, `env`, `required`, `repeatable`, `choices`, `description`
- `stdin` (bool): reads piped input; `output`: `text` | `json` | `table` | `lines`
- `prompt`: name of a `term:prompt` run before the handler when args are missing
- `exit_codes`: map of code to meaning
- `examples[]`: `cmd`, `expect_exit`, `expect_stdout` (substring or regex), `expect_stderr`. These double as generated smoke tests.
- `builtin`: `help` | `version` | `completion` | `none`. A command with `builtin` needs no handler block.

**`term:prompt:<name>`**
- `steps[]`: `id`, `type` (`text|password|number|confirm|select|multiselect|path|autocomplete|editor`), `message`, `default`, `choices`, `required`, `validate` (regex, min, max, length), `when` (condition on earlier step ids)
- `result`: name the answers object is passed under
- `fallback`: how each step is supplied when not interactive (flags or env)

**`term:screen:<name>`**
- `title`, `layout`: `rows` | `columns` | `grid` | `split` | `stack` | `tabs`, `size` weights
- `panes[]`: `widget`, `data` (a `term:data` name or a state key), `columns`, `bind`, `focus` order, `keymap` scope, `refresh` (seconds)
- Widget kinds in the DSL: `table`, `list`, `text`, `input`, `form`, `tabs`, `progress`, `gauge`, `log`, `tree`, `markdown`, `modal`, `status`
- `on_start`, `on_key` hooks name a `term:view` or handler for custom behavior
- Mapping of each widget to each framework is the largest open design item (section 13).

**`term:data:<name>`**
- `storage`: `json` | `jsonl` | `sqlite`, `file`, `location`
- `fields[]`: `name`, `type` (`string|text|int|float|bool|date|choice|tags`), `required`, `default`, `choices`, `searchable`, `sortable`, `display` (label, width, format), `validate`
- `id`: `auto` | field name; `sort` default; `soft_delete` (bool)
- `seed[]`: initial records
- Generates load, save, search, sort and validation for the runtime. `sqlite` needs a library per runtime and is unverified.

**`term:loop:<name>`**
- `tick_rate` (updates per second), `render`: `full` | `diff`, `size` (`{ width, height }`), `input`: `events` | `poll`
- `seed`: number or `random`; `pause_key`; `save_file`; `fixed_timestep` (bool)
- Logic comes from a `term:view` block with `kind: loop`.

**`term:assets`**
- `include[]` (globs under `tatemonos/<name>/assets/`), `embed` (bool: compile into the binary or ship beside it), `dest`
- `templates[]`: `source`, `target`, `variables[]` for scaffolder programs (placeholders written as `{{name}}`)

**`term:export`**
- `platforms[]`: `linux-x64`, `linux-arm64`, `macos-x64`, `macos-arm64`, `windows-x64`
- `formats[]`: `source`, `single_binary`, `archive` (tar.gz or zip), `npm_bin`, `pip`, `cargo_install`, `go_install`
- `completions[]`: `bash`, `zsh`, `fish`, `powershell`; `man_page` (bool); `embed_version` (bool)
- Cross-compilation is runtime dependent (Go and Rust natively, from knowledge; others need the target OS).

**`term:handler:<lang>:<name>`**
- Header optional: `command` (defaults to `<name>`), `async` (bool)
- Body is code in that language. It receives parsed `args`, `flags` and helpers for output, logging and exit (the helper object is generated per runtime, proposed as `ctx` with `out`, `err`, `exit`).

**`term:view:<lang>:<name>`**
- Header: `kind`: `screen` | `widget` | `loop`, `screen` (screen name to attach to)
- `loop` contract (proposed, per runtime): `init()`, `update(state, input, dt)`, `draw(state, frame)`
- Body is a TSX component for `ts` (Ink), a Rust render function for `rs` (Ratatui), a Model, Update, View triple for `go` (Bubble Tea), and a Widget or Screen class for `py` (Textual).

**`term:script:<lang>:<name>`** shared helper module, importable by handlers and views.

**`term:test:<lang>:<name>`** test file; the generator wires the language's test runner and runs it during verify.

**`term:readme`** body is markdown. If omitted, a README is generated from `description`, commands and install steps.

### 7.5 Existing DSL reused unchanged

- `@arkzen:meta` (name, version, description). A terminal tatemono is detected by `term:*` blocks.
- `@arkzen:file:id` for extra files. Optional new `{terminal}` path prefix starting inside the exported project (same idea as `{frontend}` and `{backend}`).
- The `assets/` folder convention.

### 7.6 Which blocks each project level uses

| Block | Fully declared CLI | Fully declared TUI | Scaffold plus code |
|---|---|---|---|
| project, runtime, export | R | R | R |
| command | R | O (for a hybrid CLI side) | R for CLI parts |
| prompt | O | O | O |
| screen, data, keymap | X | R | O |
| theme, config | O | O | O |
| handler | X (builtin or generated) | X | R per command |
| view | X | X | R for custom screens, widgets, loops |
| loop | X | X | R for games and animations |
| assets | O (scaffolder templates) | O | O |
| script, test, readme | O | O | O |

R = required, O = optional, X = not used.

### 7.7 Validator rules (proposed)

- Command names are unique; dotted subcommand paths resolve to a parent; flag names and short flags are unique per command.
- Types and `choices` agree; `required` args do not follow optional ones.
- Every non-`builtin` command has a handler block for each listed runtime unless the project is fully declared.
- Handler, view, script and test `<lang>` must appear in `runtimes`.
- Screens reference existing `term:data`, `term:keymap` scopes and `term:view` names; widget kinds are in the allowed set.
- A `term:loop` has a matching `term:view kind: loop` for every runtime that uses it.
- `term:data` field names and types are valid; `sqlite` storage warns when the runtime library is not chosen.
- `binary` is lowercase with no spaces; `version` is semver; `license` is a valid SPDX id.
- Theme colors are valid hex or ANSI names; `border` values are valid.
- `export.platforms` are valid for the runtime; warn when cross-compiling is not supported for it.
- Warn when a runtime's toolchain is not installed: that runtime will build only where possible and verify as UNVERIFIED.
- Reject any generated-code path that would import from Pluffy (rule 1).

---

## 8. Examples (illustrative, not compiled)

### 8.1 Multi-command CLI with a TypeScript handler

```tsx
/* @arkzen:meta
name: todo-cli
version: 1.0.0
description: Command line todo list
auth: false
*/

/* @arkzen:term:project
name: todo
binary: todo
mode: cli
runtimes: [ts]
license: MIT
*/

/* @arkzen:term:runtime:ts
framework: commander
*/

/* @arkzen:term:command:add
description: Add a todo item
args:
  - name: title
    type: string
    required: true
flags:
  - name: priority
    short: p
    type: choice
    choices: [low, normal, high]
    default: normal
examples:
  - cmd: add "buy milk"
    expect_exit: 0
*/

/* @arkzen:term:handler:ts:add */
export default async function add({ args, flags, out }) {
  out.line(`added: ${args.title} (${flags.priority})`)
}
/* @arkzen:term:handler:ts:add:end */
```

### 8.2 Prompt-only scaffolder

```tsx
/* @arkzen:term:project
name: create-site
binary: create-site
mode: cli
runtimes: [ts]
*/

/* @arkzen:term:prompt:site
steps:
  - id: name
    type: text
    message: Project name
    required: true
  - id: style
    type: select
    message: Pick a style
    choices: [plain, dark]
*/

/* @arkzen:term:command:create
description: Create a new site
prompt: site
*/

/* @arkzen:term:assets
templates:
  - source: templates/index.html
    target: "{{name}}/index.html"
    variables: [name, style]
*/
```

### 8.3 Fully declared record manager (TUI)

```tsx
/* @arkzen:term:project
name: shelf
binary: shelf
mode: tui
runtimes: [ts, rs]
mouse: true
*/

/* @arkzen:term:data:books
storage: json
file: books.json
fields:
  - name: title
    type: string
    required: true
    searchable: true
  - name: author
    type: string
  - name: read
    type: bool
    default: false
*/

/* @arkzen:term:screen:main
layout: split
panes:
  - widget: table
    data: books
    columns: [title, author, read]
    keymap: main
  - widget: form
    data: books
*/

/* @arkzen:term:keymap:main
actions:
  new: [n]
  edit: [e, enter]
  delete: [d]
  search: ["/"]
  quit: [q, ctrl+c]
*/
```

### 8.4 Game loop

```tsx
/* @arkzen:term:loop:snake
tick_rate: 12
size:
  width: 40
  height: 20
input: events
seed: random
*/

/* @arkzen:term:view:ts:snake
kind: loop
*/
export function init() {
  return { snake: [{ x: 5, y: 5 }], dir: 'right' }
}
export function update(state, input, dt) {
  return state
}
export function draw(state, frame) {}
/* @arkzen:term:view:ts:snake:end */
```

---

## 9. Engine work list

**Parser and validation (engine-core, then sync to every stack)**
- `parser.ts`: add `term` to the tag-prefix regex; register YAML-only tags (`project`, `runtime`, `config`, `theme`, `keymap`, `command`, `prompt`, `screen`, `data`, `loop`, `assets`, `export`) and code tags (`handler`, `view`, `script`, `test`, `readme`); multi-line opener exemption for Shape B; `parsed.term`; `validatePages` exemption when `term:*` blocks exist.
- `validator.ts`: the rules in 7.7.
- Each stack's `arkzen/types/index.ts`: `ArkzenTerm*` types (the parser imports `../types`).
- Check that the web watcher no longer logs errors for terminal tatemonos (finding 1).
- Do this in the same pass as the `ext` and `pkg` families. It is the same change.

**New engine folder**
- `engine/terminal/common/`: command model, prompt model, data model (load, save, search, sort, validate), theme and keymap resolution, completion and man page generators, verify harness.
- One folder per language (section 6.1), each with a generator and `node --test` tests in the style of `engine/game/unreal/generator.test.js`.
- `engine/terminal/package.json` for tool dependencies, installed by `deps install terminal`.
- Reuse the helper ideas from `engine/game/common/` (YAML reading, validators, asset lookup, staged replace) without importing from a stack's `node_modules`.

**Generators**
- Command model to each language's argument parser (commander, Typer, clap, Cobra, and so on).
- Prompt model to each language's prompt library or a generated plain-readline prompt.
- Declared screens to each framework's widgets (the widget mapping table is a design deliverable, section 13).
- Data model to a storage module per language.
- Loop model to a tick loop per runtime.

**CLI and export**
- `export.js`: `terminal` branch. `mizumi.js`: export wiring, menu, `deps install terminal`, `new --template`. Check how `cmdPublish` and `publishProject` treat the nested `projects/terminal/` folder (games share `projects/<engine>/`).
- `start.js`: `--only=terminal` rebuild watcher.
- `scaffold.js`: `BLOCKS` entries, `SHAPE_A_TAGS`, family parsing for `term`, templates `cli`, `tui`, `records`, `game`, cross-checks.
- `file-writer.ts`: optional `{terminal}` prefix.
- `gui/renderer/menu.js`: entries (game entries exist there).

**Editor tooling and docs**
- `vscode-extension/extension.js` (tag regex around line 342), `lib/snippets.js`, `lib/scaffold.mjs`, `syntaxes/tatemono.tmLanguage.json`.
- `PLUFF_GUIDELINES_v14.md` new Part, quick lookup table and Section 3 order list; `PLUFF_DSL_CATALOG.md`, `README.md`, `PLUFFY_RUN_GUIDE.md`, `FUTURE_PLANS.md` status.
- `scan.js`, `tatemono-index.js`, `descriptions.json`: AI training data and index need terminal examples once the DSL is stable.

---

## 10. Verification policy

- Every export builds with the language toolchain, then runs.
- CLI: run `--help` and `--version`, run each command's `examples` and check exit code and output, run generated and user tests.
- TUI: run the program inside a pseudo-terminal of the declared size, wait for the first frame, send a quit key, and check that it exits cleanly with no crash. Optional screen text snapshots. Python's standard library has a `pty` module that can drive this on Linux and macOS (from knowledge); Windows pseudo-terminal support is unverified.
- Non-interactive check: run with stdin and stdout not attached to a terminal and confirm the fallback path works.
- If a toolchain is missing, the export still writes the project where it can, marks it UNVERIFIED in the report, and never claims it passed.
- Verify the exported project builds and runs with no Pluffy files present.

---

## 11. Out of scope

- Media and audio players, SSH-served apps: not promised (they need native libraries or server setup a single export cannot guarantee).
- Image display through terminal graphics protocols: terminal dependent, not modeled in the DSL beyond referencing a file.
- Integration with the rest of Pluffy (backends, SDK packages, auth): deliberately excluded by Mizumi's decision. The roadmap's optional integration bullet is not part of this plan.
- Languages Pluffy does not have.

Distribution note: the exported project can be published by hand with the ecosystem's own tools, or later through the package system's `kind: cli`. The package plan (`PLUFFY_PACKAGE_PLAN.md`) listed the CLI boundary as an open item. Resolution: terminal programs are authored with `term:*` and distributed through `term:export formats`. The package system may publish the same output later, but there is no dependency in either direction.

---

## 12. Work order (order only, everything above is in scope)

1. Register the `term` family in the parser, validator, types, scaffold and VS Code, together with `ext` and `pkg`. Done when a terminal tatemono parses with zero web-watcher errors and existing tatemonos parse exactly as before.
2. `engine/terminal/common/` plus the `ts` CLI generator (commander), with build, `--help`, examples and tests verified. This runtime can be tested in the author's sandbox (node 22 present).
3. Prompts and declared TUI screens on `ts` with Ink, verified in a pseudo-terminal. Needs node 22 or newer (Ink 8 and commander 15 both require it).
4. `term:data` record manager, `term:loop`, themes, keymaps, config.
5. `py` runtime (Typer and Textual; python3 is present in the sandbox), then `rs`, `go`, and the other languages one at a time, each only after its toolchain is available to run the verify step.
6. Export formats: single binaries, archives, completions, man pages, platform matrix.
7. Tooling and docs: scaffold templates, menus, VS Code, guideline Part, catalog, README, run guide, `FUTURE_PLANS.md`, AI training data.

---

## 13. Risks and unverified items

- Nothing has been built or run for this phase. Framework versions come from registry metadata only.
- The widget mapping from the DSL widget set (`table`, `list`, `form`, `tabs`, `gauge`, `log`, `tree`, `markdown`, `modal`, and so on) to each framework is the largest open design item. Ink may need community components for tables or forms (not checked), Ratatui and Textual have built-in widgets (from knowledge), and Bubble Tea relies on a companion widget library (from knowledge).
- Bubble Tea, Cobra and all Java, C# and PHP framework choices are not checked.
- Ink 8 requires node 22 or newer, commander 15 requires 22.12 or newer, OpenTUI requires 26.4 or newer. Check against what `setup.js` and `PLUFFY_RUN_GUIDE.md` require today.
- Ink, Ratatui, Textual, Typer and clap versions move fast. Pin them.
- Single binary bundling for `ts` and `py` is untested.
- Pseudo-terminal verification is unverified on Windows.
- Key-release input, Unicode width and color depth differ across terminals, which affects games.
- `sqlite` storage in `term:data` needs a library per runtime and is unverified.
- Cross-compilation from one machine is runtime dependent and untested.
- `mizumi publish` and `projects/terminal/` nesting is unchecked.
- The `ctx` helper object, the loop contract and all header keys are proposals.

---

## 14. What the planning session did and did not read

Read fully: `FUTURE_PLANS.md`, `PLUFF_DSL_CATALOG.md` (149 lines). Read in the earlier sessions: `README.md`, `PLUFF_GUIDELINES_v14.md` Sections 1, 1B, 1C, 1D, 1G, 3, 3D, 4, 19C, 26B, 28B, 30, `parser.ts` tag validation, `validatePages` and `parseTatemono`, `shared-sync.ts`, `start.js` (header and spawn sections), the `mizumi.js` command list and `cmdPublish`, `engine/game/common/index.js`.
Read this session: the `mizumi.js` picker (lines 35 to 58, 309 to 334), the root `package.json`, the guideline's `@arkzen:console` section headings, `chat.js` header.
Checked on registries: ink, `@opentui/core`, `@opentui/react`, blessed, commander (npm); textual, typer, click (PyPI); ratatui, clap, crossterm (crates.io); GitHub activity for OpenTUI.
NOT read: guideline Section 17 body, Sections 2C to 2F, 1E, 1F and the game appendices, the backend generators, the Tauri Rust code, `export.js` beyond the earlier game and desktop sections.
NOT checked: Bubble Tea, Cobra, and every Java, C# and PHP terminal framework.

---

## 15. Start here in the next session

Paste this into the new Claude session along with the repo URL:

> Read `PLUFFY_TERMINAL_PLAN.md`, `PLUFFY_PACKAGE_PLAN.md` and `PLUFFY_EXTENSION_PLAN.md`, then read `engine/shared/arkzen/engine-core/parser.ts` (`validateDslTags`, `validatePages`, `parseTatemono`) and `shared-sync.ts`. Do step 1 only: register the `ext`, `pkg` and `term` families so tatemonos containing them parse with zero errors in the web watcher and existing tatemonos are unchanged. Show complete files, not diffs.

Constraints Mizumi has stated for this work: direct and decisive answers instead of option lists, complete file outputs instead of snippets or diffs, no unsolicited feature suggestions, read the actual source files before suggesting fixes, no em dashes. Mizumi wants the full scope listed, not split into versions, and wants terminal projects standalone with no Pluffy integration for now.

---

## 16. Progress log

### Step 1 (done): register the `term` family

Built on commit `5dc818c0b`, after the package session registered `pkg` (parser `v18.0`). The parser header note for `term` is `v19.0`.

Changed:
- `engine/shared/arkzen/engine-core/parser.ts`: new `parseTerm()`, `term` added to the tag lists, `ParsedTatemono.term`, page requirement waived for term tatemonos.
- `engine/shared/arkzen/engine-core/validator.ts`: new `validateTerm()` with every rule in section 7.7, wired into `validateTatemono`. Adds `child_process` for the toolchain check.
- `arkzen/types/index.ts` in the 8 frontend stacks: `ArkzenTerm` and friends, `term?` on `ParsedTatemono`. Types are not synced by `shared-sync`, so these are the only files under `engine/frontend` that changed. The per-stack `parser.ts` and `validator.ts` copies are regenerated by `shared-sync`.
- `scaffold.js`: 17 `term:*` blocks, templates `cli`, `tui`, `records`, `game`, dotted command names, tag parsing and lint for term. The tag scanner now ends a `term:` header at a `*/` that starts its own line, the same rule `ext:` uses, because globs such as `**/*.txt` contain `*/`. `vscode-extension/lib/scaffold.mjs` regenerated, `extension.js` has a two line change.
- New: `engine/terminal/` (own `package.json`, `scripts/sync-shared.mjs`, 127 tests), four fixtures `tatemonos/term-todo-cli`, `term-create-site`, `term-shelf`, `term-snake`.

Decisions made while building (header keys the plan left open):
- `term:keymap` scope defaults to the block name, or `global` for an unnamed keymap.
- `term:prompt` `when` is a mapping of an earlier step id to the value it must have. `fallback` is a mapping of step id to `{ flag, env }`.
- `term:screen` `size` is a list of positive weights, one per pane. Pane `focus` is a positive integer order, unique per screen.
- `term:view` with `kind: widget` needs `screen:`. `kind: screen` may name one. `kind: loop` uses the view name as the `term:loop` name.
- A command needs no handler when it has a `builtin`, or when it has a `prompt` and the project declares `assets.templates`. Every other command needs a handler for each listed runtime.
- A tui project needs at least one screen, a `kind: screen` view or a loop. A hybrid project also needs a command.
- A pure `cli` project cannot use a TUI framework, and a pure `tui` project cannot use a CLI-only framework.
- Unknown header keys are warnings, not errors.
- An SPDX id outside a built-in list of common ids is a warning.

Verified against the latest repo: all 68 tatemonos in `tatemonos/` parse to byte-identical results and get identical validator output, and the 13 that failed before still fail the same way. `mizumi check` output is unchanged for existing tatemonos. The 127 tests pass. `parser.ts` and `validator.ts` type-check clean in nextjs, react-vite, expo and react-native. `astro`, `lynx`, `react-inertia` and `tanstack-start` already had type errors before this step (same counts), none involve term. The four templates generate valid tatemonos.

Not verified: no web watcher or builder was run against a term tatemono (they treat it as a page-less tatemono, the same path `ext-tab-notes` takes). Not run on Windows. No generator exists yet.

Next: step 2, `engine/terminal/common` (the `ctx` helper contract, config and data handling, the pseudo-terminal test harness) and the `ts` commander generator.

### Step 2 (done): command line programs in TypeScript

Built on commit `ab1bcc49e`. Nothing outside `engine/terminal/` and the fixture changed, so the shared parser, validator, scaffold and stacks are untouched.

New:
- `engine/terminal/cli.js` with `build`, `verify`, `check`, `deps`.
- `engine/terminal/common/`: `read.js` (loads the real parser and validator through tsx), `model.js` (command tree, defaults), `run.js`, `shell.js`, `verify.js` (the CLI verification harness).
- `engine/terminal/ts/`: `generator.js`, `build.js`, `checks.js`, `templates/runtime.ts`, `templates/examples.test.ts`.
- Fixture `tatemonos/term-cli-features` (every command feature). `tatemonos/term-todo-cli` is built too.
- 50 tests: model, shell splitting, generator output, the verifier failing on broken programs, and an end to end build.

What `build` does for a `mode: cli` project with a `ts` runtime: generates the project, runs `npm install` and `tsc`, checks that the code imports only its own files, Node and declared packages, runs `--help`, `--version`, every command's `--help` and every command example, runs a non-interactive pass (no TTY, `NO_COLOR`, `TERM=dumb`, no escape codes), then runs the project's own `npm test`.

Decisions made while building:
- `ctx` is `{ command, args, flags, out, err, stdin, env, exit }`. Names are camelCase. A handler may return a number to set the exit code.
- A switch that is not given is `false`. A flag that is on by default also gets a `--no-<name>` form. A repeatable flag is an array.
- A command that declares `output` also gets `--json`. `out.data(value)` prints in the declared kind (json, table, lines, text).
- `expect_stdout` and `expect_stderr`: a value written as `/pattern/` is a regular expression (no flags), anything else is a substring. `expect_exit` defaults to 0.
- A command with `prompt` is refused (prompts are step 3). `mode: tui` and `mode: hybrid` are refused. A `builtin: completion` command is left out with a warning. `config`, `assets` and `export` are reported as declared but not generated.
- Pinned versions: commander 15.1.0, `typescript ^5.9`, `@types/node ^22`. `engines.node` is at least 22.12.0 because commander 15 needs it, and a lower `min_version` is raised with a warning.
- The generated code never mentions Pluffy, not even in a comment.

Verified: 177 tests pass (127 from step 1, 50 new), including a real `npm install` and `tsc` build of two fixtures with every verification step passing. The verifier has tests that feed it wrong programs (wrong version, wrong exit code, missing output, colors, a crash, a hang) and check it reports FAIL. `mizumi check` is clean on the new fixture.

Not verified: Windows. The npm registry was reachable here, so the offline skip path has not run. No terminal UI exists yet. `mizumi.js` and `export.js` are not wired to the terminal engine, so use `node engine/terminal/cli.js build <tatemono>` for now.

Next: step 3, prompts (`term:prompt`, scaffolders with `assets.templates`) and declared TUI screens on `ts` with Ink, plus the pseudo-terminal test harness.

### Step 3 (done, first half): prompts, scaffolders, assets and the pseudo-terminal harness

Built on commit `21d05d4d5`. Nothing outside `engine/terminal/` and two fixtures changed.

Work order change: step 3 in section 12 also lists declared TUI screens on Ink. They are NOT in this step. The declared `table` and `form` widgets read `term:data`, and screens need keymaps, both of which are step 4, so screens built now could not show anything. The Ink screens move to step 4 together with the record manager. Prompts, scaffolders, assets and the pseudo-terminal harness, which step 3 also needed, are done here.

New:
- `engine/terminal/common/pty.js` and `pty_driver.py`: run a program in a pseudo-terminal of a given size and play a script (`expect` text, `send` keys). Python standard library only. Linux and macOS.
- `engine/terminal/common/glob.js`, model fields for prompts and assets.
- `engine/terminal/ts/templates/prompts.ts`, `scaffold.ts`, `assets.ts` (copied into generated projects), and generator support for them.
- `verifyPrompts` in `common/verify.js`: three automatic checks per prompt command.
- Fixtures `tatemonos/term-cli-prompts` (every question type) and an updated `term-create-site` (examples).
- 38 more tests (88 in `engine/terminal`, 215 with step 1).

Decisions made while building:
- Prompts use `@inquirer/prompts` 8.8.1 (pinned). It needs Node 22.13 or newer, so `engines.node` is raised to `>=22.13.0` for a project with prompts (22.12.0 otherwise).
- A step's value comes from, in order: a command argument or flag with the step's name, the flag named in `fallback`, the environment variable named in `fallback`, a question in a terminal, then `default`. A required step with none of these stops with `missing value for "<id>": pass --flag or set ENV`.
- `fallback.flag` becomes a flag on the command. `--no-input` is added to every prompt command. `--force` is added to a scaffolder.
- `result` is the name the answers have on ctx (default `answers`). `Handler` takes `ctx: any`, so a handler can destructure it.
- `validate`: `regex` for strings, `min`/`max` for numbers and for the length of strings and lists, `length` for an exact length.
- A scaffolder is a command with a `prompt`, no handler, and `assets.templates`. Every template is written. Two scaffolders in one project are refused. Placeholders are `{{name}}`, replaced only for the names a template lists in `variables`. Targets are relative to the current folder, may not leave it, and never overwrite without `--force`. Binary files are copied unchanged.
- `assets.embed: true` compiles the files into `src/assets.ts` as base64. Otherwise they are copied to `assets.dest` (default `assets`) and added to `files`.
- The generator refuses an output folder that is not empty and was not made by it, or that overlaps the tatemono folder, because a rebuild deletes the old output.
- Verification runs every command in a fresh empty temp folder.
- Prompt checks: without a terminal the program names the missing input (or runs on defaults); in a terminal the first question appears and Ctrl+C exits with 130; when every question has a default, pressing Enter through all of them completes. A prompt that needs a typed answer, an editor, or a command with required arguments is reported UNVERIFIED for that check.

Verified: 215 tests pass, including real `npm install` and `tsc` builds of five projects, scripted interactive sessions through the pseudo-terminal (every question type, validation errors and fixing them, `when`, the editor, Ctrl+C mid-way, `--no-input`, an environment variable), a scaffolder writing real files, overwrite refusal and `--force`, a template trying to leave the folder, and a binary file embedded and copied byte for byte. The end to end suite ran three times in a row with the same result. The verifier has tests that feed it wrong programs.

Not verified: Windows (the pseudo-terminal harness is not supported there). `autocomplete` ignores `default` in a terminal (the search list has no default), the first match is chosen on Enter. `editor` was tested with `EDITOR=true`, not a real editor. Terminal screens do not exist yet.

Next: step 4, the Ink TUI: declared screens and widgets, `term:data` record manager, keymaps, themes, `term:loop`, `term:config`. It reuses the pseudo-terminal harness.
