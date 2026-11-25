# Changelog

## Unreleased

- New: Unreal Engine blocks (`unreal:project`, `unreal:scene:<name>`, `unreal:environment`, `unreal:export`): snippets, grammar, outline and Add Block. Bundled `scaffold.mjs` re-synced.

## 0.3.0

- New: live diagnostics from the bundled `scaffold.js` linter (same rules as `mizumi check`, including the favicon-exists check), status bar item, Check This/All commands.
- New: **Add Block…** command using every `scaffold.js` block builder (variant picker, name normalisation, cross-checks, "would add errors" guard).
- New: quick fixes (missing `:end`, `oauth` needs `auth: true`, rename to "Did you mean").
- New: outline, folding, hover and go-to-definition (layouts, `parent:`, handlers, listeners, endpoints).
- New: `@arkzen:oauth` snippet, grammar scope and provider-name completion.
- New: shared YAML-only snippets for `jobs`, `console`, `notifications`, `mail`; `realtime` broadcast-event snippet.
- New: layout-line completion (`+auth`, `+guest`, `+auth:<layout>`, file-declared layouts) and layout-line snippets for web, native and Lynx.
- Improved: richer YAML snippets for `meta` (+ `auth_seed`), `meta:web` (og, twitter, pwa), `meta:native` (full expo), `web:config`, `native:config`, `desktop:config`.
- Page snippet now uses the `+guest` / `+auth` guard form.
- `scripts/sync-scaffold.js` keeps the bundled scaffold in step with the repo.

## 0.2.0

- Highlighting, snippets and closing-tag completion.
