# Pluff Tatemono

VS Code support for [Pluffy](https://github.com/Mizumi250/Pluffy) Tatemono files
(`tatemonos/<name>/core.tsx` and `*.tatemono`).

## What you get

| Feature | How it works |
|---|---|
| **Highlighting** | Block markers, inline layout lines, and embedded YAML / TSX / PHP / Python / Java / C# / Go / Rust / CSS bodies. |
| **Snippets** | Every block: backend variants, shared YAML-only forms (`jobs`, `console`, `notifications`, `mail`), `oauth`, `realtime` channel and event, frames, Godot, Unity and Unreal. Type `/* @arkzen:`. |
| **Smart completion** | Closing `:end` tags, layout lines (`+auth`, `+guest`, `+auth:<layout>`, layouts declared in the file), OAuth provider names. |
| **Live linting** | The same rules as `node mizumi.js check`, shown as you type, in Problems and the status bar. |
| **Quick fixes** | Add a missing `:end`, set `auth: true` for `oauth`, rename a block to the "Did you mean" suggestion (opener and closer together). |
| **Outline and folding** | Every block appears in the Outline view and folds. |
| **Hover** | Block description, variants and layout-line meaning. |
| **Go to definition** | Page layout line to layout, `parent:` to parent layout, routes `handler:` to its body, `listeners:` to the listener body, endpoint body to its api key and back. |
| **Add Block…** | Command-palette or right-click picker over every block builder in `scaffold.js`, with variant, name and cross-checks. Inserts into the editor buffer (undoable). |

## Commands

`Pluffy: Add Block…`, `Check This Tatemono`, `Check All Tatemonos in Workspace`,
`New Tatemono (mizumi new)` (opens a terminal in the repo), `Show Which scaffold.js Is Used`.

## Settings

| Setting | Default | |
|---|---|---|
| `pluffy.lint.enable` | `true` | Live diagnostics. |
| `pluffy.backend` | `auto` | Active backend variant (`php`, `ts`, `py`, `java`, `cs`, `go`, `rs`). Enables the "missing variant body" warnings and preselects the variant in Add Block. |
| `pluffy.useWorkspaceScaffold` | `true` | If the open folder has its own `scaffold.js`, use its linter/scanner so the editor follows your newest rules. |

## One implementation, no drift

The extension bundles `lib/scaffold.mjs`, a copy of the repo's `scaffold.js`.
After you change `scaffold.js`, refresh the bundle and rebuild:

```bash
cd vscode-extension
npm run package        # syncs ../scaffold.js, then builds the .vsix
```

`scripts/sync-scaffold.js` appends the few exports the extension needs
(`BLOCKS`, `normalizeName`, `crossCheck`, ...) to the bundled copy, so
`scaffold.js` itself needs no change. When you open the Pluffy repo, the
workspace `scaffold.js` is used for linting automatically.

## Build and install

```bash
npm run package
code --install-extension pluff-tatemono-0.3.0.vsix
```
