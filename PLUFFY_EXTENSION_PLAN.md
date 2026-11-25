# Pluffy Browser Extension Plan (WXT)

Status: plan only. Nothing in this document has been implemented. Written 2026-11-25 from a session that read the Pluffy repo (github.com/Mizumi250/Pluffy) and tested WXT, Next.js and Astro in a sandbox.

All DSL names, header keys and `ext.*` helper names below are PROPOSALS. Facts taken from the repo or from tests are marked "verified". Everything else is a design choice or an unverified assumption, and is listed in section 11.

---

## 1. Decision summary

1. Add a new stack category `extension` with ONE stack: `wxt`. Plasmo is not added.
2. The extension is written inside the normal tatemono (`core.tsx`) with new `@arkzen:ext:*` blocks, the same way `web:error:404` is written once and emitted per stack.
3. A tatemono can be extension-only, or can hold web and/or native pages as well. All of them share one `database`, `api` and login.
4. The WXT stack lives at `engine/frontend/wxt/` with its own `package.json` and `node_modules`, like `tauri` and `electron`.
5. Surfaces are React on Vite (WXT is Vite based). The extension does NOT render through Next.js, Astro, TanStack Start or react-inertia.
6. Not a wrapper. Electron and Tauri load the running web app. A Manifest V3 extension cannot.
7. The website and the extension are independent stacks. A Next.js site and a WXT extension can come from the same tatemono. They meet at the API, auth and shared blocks, not at the framework.

Why not Plasmo (verified on npm and in 2026 comparisons): latest npm release 0.90.5 published 2025-05-17, Parcel based, 347 open issues in one Oct 2026 snapshot, described as maintenance mode, and sources say Parcel blocks Tailwind v4 (Pluffy's Vite stacks use `@tailwindcss/vite`).

---

## 2. Verified findings (what the repo actually does)

| # | Finding | How verified |
|---|---|---|
| 1 | Game tatemonos FAIL in the web parser. `unreal-scene-starter` gives 3 "Missing closing tag" errors (project, environment, export). `godot-game` fails with "At least one page is required". The watcher (`vite-watcher.ts` `rebuildAllFromRoot`) builds every folder containing `@arkzen:meta`, never skips games, and just logs the failure. `validateDslTags` also writes an error JSON for the UI overlay. | Ran the real `parseTatemono` from `engine/shared/arkzen/engine-core/parser.ts` under tsx |
| 2 | `free-demo` (only meta + file blocks) and `hello-native` (zero web pages) parse OK. `validatePages` has a precedent exemption: `content.includes('/* @arkzen:file:')`. | Same run, plus reading `validatePages` |
| 3 | `validateDslTags` takes the tag prefix from `(web\|native\|desktop):`. Any other family (`ext`, `godot`, `unreal`) is treated as a non-YAML block and demands a `:end */` marker unless it is in `YAML_ONLY_TAGS`. Code blocks need `*/` on the opening line, except layout tags (`isLayoutTag`) which may have a multi-line YAML opener. | Read `parser.ts` lines ~2123 to 2260 |
| 4 | Guideline Section 3 rule 7: web, Expo/RN and Lynx blocks can coexist in one `core.tsx`. The `multi` scaffold template does this. The only "do not mix" rule is between godot, unity and unreal. | Read guideline Section 3, `scaffold.js` TEMPLATES |
| 5 | The error DSL pattern: parser reads `errorHandlers` once, each stack router emits its own file: `nextjs/arkzen/core/router.ts` (`generateNotFoundFile`), `react-vite/.../vite-router.ts`, `astro/.../astro-router.ts` (`generateNotFoundPage`), `tanstack-start/.../tanstack-router.ts`. | grep + read |
| 6 | Electron loads `DEV_URL` (default `http://localhost:3000`). Desktop export reuses `buildViteTatemono` (react-vite renderer). Frame blocks (`desktop:frame:electron|tauri`) are host-side code in the host's language, written out verbatim. | Read `electron/main.js`, `export.js` |
| 7 | Games: generators in `engine/game/<name>/`, output `projects/<engine>/<tat>/` (`/projects` is gitignored), early branch in `export.js` (`if (activeStack === 'unreal') {... process.exit(0)}`), wired in `mizumi.js`, `scaffold.js`, VS Code extension. Games borrow `js-yaml` via `createRequire` from `engine/frontend/nextjs/package.json` (fragile: `mizumi deps prune` deletes inactive stacks' `node_modules`). | Read `engine/game/common/index.js`, `export.js`, `mizumi.js` |
| 8 | `shared-sync.ts` copies `engine-core` files (`parser.ts`, `backend-bridge.ts`, `validator.ts`, `backends.ts`, `file-writer.ts`, `shared-sync.ts`) plus `hooks`, `lib`, `stores` into every stack's `arkzen/core/`; web-only `components`, `layouts`; never `adapters/router.ts`, `Link.tsx`. Guideline quirk #10: parser/validator/backends changes must be synced to the frontend copies. | Read `shared-sync.ts`, guideline 28B |
| 9 | Web `authStore.ts`: relative URL `/api/<slug>/auth`, token in zustand `persist` (localStorage) plus `document.cookie` (`arkzen-auth-<slug>`), slug from `window.__ARKZEN_TATEMONO__`. Native has its own store with absolute base `EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'`. | Read both `authStore.ts` files |
| 10 | CORS: Express uses open `cors()`. Laravel `bootstrap/app.php` has no CORS setup and `config/` has no `cors.php` (only `reverb.php` with `allowed_origins => ['*']`). Web dev goes through the Vite proxy and native fetch ignores CORS, so cross-origin browser calls are probably untested. Whether Laravel allows `chrome-extension://` origins is UNVERIFIED (no PHP here). | Read configs |
| 11 | Stack configs: Next.js has no `output: 'export'` and has `proxy.ts`; Astro is `output: 'server'` with the node adapter; TanStack Start is SSR (`tanstackStart()` plugin, no SPA/prerender setting); react-inertia needs Laravel to render `app.blade.php` with `@inertia`; react-vite is a static SPA. | Read configs |
| 12 | Each stack has its own `node_modules` under `engine/frontend/<stack>/`. `mizumi deps install <stack>` and `deps prune` manage them. | Read `mizumi.js` |

---

## 3. Test log (sandbox, Node v22.23.5)

| Test | Result |
|---|---|
| Next.js 16.4.6, minimal app, `output: 'export'` | Builds. `out/index.html` has 9 script tags, 3 inline. MV3 CSP blocks inline scripts. |
| Astro 7.4.13, `output: 'static'`, one React island with `client:load` | Builds. 2 script tags, both inline. |
| WXT 0.21.5 (Vite 8.3.8) + `@wxt-dev/module-react`, React popup + `defineBackground` | Builds in about 230 ms. Manifest generated automatically (action popup, service worker). `popup.html` has 1 script tag, 0 inline. Popup chunk about 220 kB (React). |
| `wxt build -b firefox` | Builds into `.output/firefox-mv2`. Firefox defaults to Manifest V2 in this version, so MV3 must be passed explicitly (`--mv3`). |
| Not tested | TanStack Start static output, any real browser load, inline-script extraction, CORS, WXT content-script UI, WXT messaging. |

npm facts: WXT latest 0.21.5 (2026-10-26), peer `vite ^6.3.4 || ^7 || ^8`, `node >=22`, MIT. Plasmo latest 0.90.5 (2025-05-17), Parcel based, MIT.

---

## 4. Architecture

### 4.1 Where things live

```
engine/
  frontend/
    wxt/                      NEW stack (category: extension)
      package.json            wxt, react, react-dom, @wxt-dev/module-react, tailwind, zustand ...
      wxt.config.ts           base config, manifest assembled by the engine
      arkzen.ts               watcher (same role as other stacks' arkzen.ts)
      arkzen/core/            synced files + ext emitter (ext-router.ts)
      entrypoints/            GENERATED, do not edit
  shared/arkzen/
    engine-core/              parser.ts, validator.ts: ext parsing + validation
    extension-core/           NEW runtime helper, synced into the wxt stack
projects/extension/<tat>/     export output (gitignored)
tatemonos/<tat>/core.tsx      the source of truth
tatemonos/<tat>/assets/       icons and static files
```

### 4.2 Data flow

1. Watcher or export reads `core.tsx`.
2. `parseTatemono` parses `ext:*` blocks into `parsed.ext` (new field, mirrors `errorHandlers`).
3. The wxt stack's `ext-router.ts` writes WXT file-convention entrypoints and `wxt.config.ts` manifest data.
4. `wxt build` (or `wxt` dev, `wxt zip`) produces `.output/<browser>-mv<n>/`.
5. Backend blocks are built by the existing backend bridge, unchanged.

### 4.3 Stack and commands (proposed)

- `node mizumi.js extension wxt` switches the extension stack (mirrors `web|app|desktop <stack>`).
- `node mizumi.js deps install wxt`, `deps prune` include it.
- `node mizumi.js export <tat> extension` writes `projects/extension/<tat>/` and the zip files.
- `node mizumi.js new <n> --template=extension` scaffolds an extension tatemono.
- The category plumbing should copy how `desktop` is stored and switched (the exact `arkzen.json` field was NOT checked; verify).

### 4.4 node_modules rule

Do not borrow packages from another stack. The wxt stack has its own `node_modules`, installed and pruned like the others. Surfaces are generated inside the wxt stack folder, so their imports resolve there.

---

## 5. DSL reference

### 5.1 Block shapes (existing, from guideline Section 3D)

- Shape A: YAML only. Opening line has no `*/`, closed by a bare `*/`. No `:end`.
- Shape B: YAML in the opening comment, `*/`, body, then `:end */`.
- Shape C: code block. `*/` on the same opening line, body, `:end */`.

Proposed rule for `ext:*` code blocks: use Shape B whenever a header is needed and Shape C when not. `:end */` is always required. Parser work: add an `isLayoutTag`-style exemption so a multi-line opener is allowed for ext code blocks.

### 5.2 Twelve new blocks

| # | Marker | Shape | Repeat | Purpose | WXT mapping |
|---|---|---|---|---|---|
| 1 | `@arkzen:ext:project` | A | once | Manifest identity, permissions, targets, API base | `wxt.config.ts` `manifest` |
| 2 | `@arkzen:ext:popup` | B or C | once | Toolbar popup UI (TSX) | `entrypoints/popup/` |
| 3 | `@arkzen:ext:sidepanel` | B or C | once | Side panel UI (TSX) | `entrypoints/sidepanel/` (Firefox `sidebar_action`) |
| 4 | `@arkzen:ext:page:<name>` | B | yes | Full-tab page, role decides which kind (TSX) | options, newtab, history, bookmarks, devtools, sandbox, unlisted pages |
| 5 | `@arkzen:ext:content:<name>` | B | yes | Content script, `where` in header, `what` in body | `entrypoints/<name>.content/` |
| 6 | `@arkzen:ext:background` | B or C | once | Service worker code (TS) | `entrypoints/background.ts` |
| 7 | `@arkzen:ext:script:<name>` | C | yes | Shared TS module for background, content and pages | shared module in the wxt stack |
| 8 | `@arkzen:ext:commands` | A | once | Keyboard shortcuts | manifest `commands` |
| 9 | `@arkzen:ext:menus` | A | once | Context menu items | manifest permission plus generated registration code |
| 10 | `@arkzen:ext:rules` | A | once | declarativeNetRequest rulesets | rules JSON plus manifest `declarative_net_request` (WXT handling of this not checked) |
| 11 | `@arkzen:ext:locale:<code>` | A | yes | i18n messages | `_locales/<code>/messages.json` |
| 12 | `@arkzen:ext:export` | A | once | Browser targets, manifest version per target, zip options | `wxt build -b`, `wxt zip` |

### 5.3 Header keys per block (proposed)

**`ext:project`** (YAML)
- `name`, `short_name`, `version` (default `meta.version`), `description` (default `meta.description`), `author`, `homepage_url`
- `icons`: map of size to a file under `assets/`
- `action`: `default_title`, `default_icon`
- `default_locale`, `minimum_chrome_version`
- `permissions[]`, `optional_permissions[]`, `host_permissions[]`, `optional_host_permissions[]`
- `content_security_policy` (extension pages), `web_accessible_resources[]`, `externally_connectable`
- `omnibox_keyword`
- `identity` / `oauth2`: `client_id`, `scopes[]`
- `targets[]`: `chrome`, `edge`, `firefox`, `safari`
- `firefox`: `id`, `strict_min_version`
- `api`: `base_url`, `dev_base_url` (engine adds the host to `host_permissions` automatically)
- `manifest_extra`: object deep-merged into the final manifest (escape hatch for rare APIs: `input_ime`, `tts_engine`, `file_handlers`, `declarative_content`, and so on)

**`ext:popup`** header: `width`, `height`, `title`.

**`ext:sidepanel`** header: `title`, `open_on_action_click` (bool).

**`ext:page:<name>`** header:
- `role`: `options` | `newtab` | `history` | `bookmarks` | `devtools` | `devtools-panel` | `sandbox` | `offscreen` | `standalone`
- `title`
- `open_in_tab` (options)
- `panel_title`, `panel_icon` (devtools-panel)
- `reasons[]`, `justification` (offscreen)

**`ext:content:<name>`** header:
- `matches[]`, `exclude_matches[]`, `run_at` (`document_start|document_end|document_idle`), `all_frames`, `match_about_blank`
- `world`: `ISOLATED` | `MAIN` (MAIN covers page-world injection, so there is no separate injected-script block)
- `mode`: `ui` | `script`
- `ui` (mode `ui` only): `position` (`inline|overlay|modal`), `anchor` (CSS selector), `append` (`first|last|before|after|replace`), `isolate` (`shadow|iframe|none`), `z_index`
- `style`: name of a `web:style:Name` block to inject into the shadow root
- Body in `ui` mode is a TSX component. Body in `script` mode is TS. WXT supports integrated, shadow-root and iframe content UIs per its docs (not tested here).

**`ext:background`** header: `type` (`module`), `persistent` (Firefox MV2 only).

**`ext:commands`** (YAML list): `id`, `key` (and per-OS keys), `description`, `global`. Special id `_execute_action`. Handlers are registered in the background with `ext.commands.on(id, fn)`.

**`ext:menus`** (YAML list): `id`, `title`, `contexts[]`, `parent`, `type`, `document_url_patterns[]`. Handlers: `ext.menus.on(id, fn)`. Permission `contextMenus` is added automatically.

**`ext:rules`** (YAML): `rulesets: [{ id, enabled, rules: [...] }]`.

**`ext:locale:<code>`** (YAML): `messages: { key: { message, description, placeholders } }`. Requires `default_locale` in `ext:project`.

**`ext:export`** (YAML): `browsers[]`, `manifest_version` (per browser, default 3, Firefox passes `--mv3`), `zip` (bool), `sources_zip` (bool, Firefox needs source), `name_suffix` (dev builds).

### 5.4 Coverage: what folds into what

- devtools page and panel, offscreen document, sandbox, newtab/history/bookmarks overrides, options page, standalone tab: all `ext:page` `role:`.
- page-world script injection: `ext:content` with `world: MAIN`.
- Firefox sidebar: `ext:sidepanel`, emitted as `sidebar_action` for Firefox.
- omnibox, web accessible resources, CSP, externally connectable, identity, minimum browser version: `ext:project` keys.
- Everything else in the manifest: `manifest_extra`, or `@arkzen:file` for raw files.
- Not covered: Safari packaging (needs Xcode converter), niche APIs without a block.

### 5.5 v1 subset

`ext:project`, `ext:popup`, `ext:background`, `ext:page`, `ext:export`. Then `sidepanel`, `content`, `script`, `commands`, `menus`. Last: `rules`, `locale`.

### 5.6 Example: extension-only tatemono

```tsx
/* @arkzen:meta
name: tab-notes
version: 1.0.0
description: Notes in the toolbar popup
auth: false
*/

/* @arkzen:ext:project
name: Tab Notes
permissions: [storage]
targets: [chrome, firefox]
*/

/* @arkzen:ext:popup
width: 360
height: 480
*/
export default function Popup() {
  return <main>Hello</main>
}
/* @arkzen:ext:popup:end */

/* @arkzen:ext:export
browsers: [chrome, firefox]
zip: true
*/
```

### 5.7 Example: web page and extension in one tatemono

```tsx
/* @arkzen:meta
name: notes-suite
version: 1.0.0
description: Web app and extension sharing one login
auth: true
*/

/* @arkzen:database:notes
table: notes
...
*/

/* @arkzen:api:notes
...
*/

/* @arkzen:web:page:index */
export default function Page() { return <main>Web</main> }
/* @arkzen:web:page:index:end */

/* @arkzen:ext:project
name: Notes Suite
permissions: [storage]
api:
  base_url: https://example.com
  dev_base_url: http://localhost:8000
*/

/* @arkzen:ext:sidepanel */
export default function Panel() { return <main>Panel</main> }
/* @arkzen:ext:sidepanel:end */
```

---

## 6. Existing DSL: reused as is

`@arkzen:meta`, `database`, `api`, `routes`, `endpoint`, `handler`, `policy`, `middleware`, `realtime`, `events`, `listener`, `jobs`, `notifications`, `mail`, `console`, `file`, the `tatemonos/<n>/assets/` folder, and for shared UI: `web:components`, `web:style`, `web:style:Name`, `web:animation`, `web:script`.

Constraint for shared UI: web components that import the router adapter (`@/arkzen/core/adapters`, `Link`) cannot run in an extension surface, because extension surfaces have no router and `adapters/router.ts` is never synced across stacks. Add a validator warning when an ext surface imports a component that uses the adapter. How many existing components qualify was NOT checked.

## 7. Existing DSL that needs extension support (new features on old blocks)

| Block | Change | Status |
|---|---|---|
| `@arkzen:file` | New path prefix `{extension}` pointing into `engine/frontend/wxt/` (like `{frontend}`, `{app}`, `{desktop}`, `{backend}`), including `public/` for static files. Add to the off-limits list rules in `file-writer.ts`. | Proposed |
| `@arkzen:oauth` | Extension cannot receive the web hash handoff. Needs `chrome.identity.launchWebAuthFlow` and the redirect URL from `browser.identity.getRedirectURL()`. Backend needs an allowlist of redirect URIs per target. Add a key such as `targets: [web, extension]`. | Design needed |
| `@arkzen:realtime` | Pusher client works in popup, side panel and pages. Not in the MV3 service worker in v1 (workers are killed when idle). Later option: offscreen document. | Limit, not a key |
| `@arkzen:notifications` | Candidate: a `browser` channel that raises `chrome.notifications` from the background when a broadcast arrives. | Candidate, later |
| `@arkzen:jobs` / `console` | Candidate: map schedules to `chrome.alarms` for extension-local jobs. | Candidate, later |
| `@arkzen:meta` | No change. An extension tatemono is detected by the presence of `ext:*` blocks. | Decided |

Backend engine features (not DSL keys):
- CORS allowlist for `chrome-extension://<id>` and `moz-extension://<id>` origins on every backend, configured by an env var set at export. Laravel is unverified (finding 10).
- `ext.api` calls the API with an absolute base, so `host_permissions` must include it.

---

## 8. Runtime helper: `extension-core` (proposed, synced into the wxt stack)

| Helper | Purpose |
|---|---|
| `ext.api` | `arkzenFetch` / `arkzenGet` compatible wrapper with an absolute base from a build env var (WXT exposes `import.meta.env.WXT_*`; whether `VITE_*` also works was not checked) |
| `ext.auth` | `useAuthStore` equivalent. Token in extension storage (`storage.local`), not cookies or localStorage. Sets the tatemono slug itself instead of `window.__ARKZEN_TATEMONO__`. |
| `ext.storage` | Thin wrapper over `@wxt-dev/storage` |
| `ext.messages` | Typed send/listen between popup, side panel, pages, content and background. Kept as our own helper because sources disagree on whether WXT has built-in messaging. |
| `ext.commands.on`, `ext.menus.on`, `ext.omnibox.on`, `ext.alarms` | Handler registration used inside `ext:background` |

The shared `stores/authStore.ts` (relative URLs, cookie, `window` slug) cannot be reused as is. Mirror the native approach: a platform-specific store.

`shared-sync.ts` needs a new stack set for `wxt`: sync `engine-core` files, `hooks`, `lib`, the extension auth store from `extension-core`, and the web components that pass the constraint in section 6. Note `useWebSocket` reads `process.env.NEXT_PUBLIC_REVERB_*` and is patched per stack in export; the wxt stack needs its own env prefix.

---

## 9. Engine work list (file by file)

**Parser and validation (engine-core, then sync to every stack)**
- `parser.ts`: add ext parsers (project, popup, sidepanel, page, content, background, script, commands, menus, rules, locale, export); `ParsedTatemono.ext`; register tags in `CODE_BLOCK_TAGS` / `YAML_ONLY_TAGS`; add `ext` to the tag-prefix regex; multi-line opener exemption; `validatePages` exemption when ext surfaces exist.
- `validator.ts`: validate every ext block (unique names, allowed roles, valid `matches`, icons exist, `default_locale` present when locales exist, no router-adapter imports in ext surfaces).
- Update each stack's `arkzen/types/index.ts` (`ArkzenExt*` types). The parser imports `../types`.
- Verify web stacks no longer error on ext tatemonos (finding 1 shows game tatemonos still error today).

**New stack**
- `engine/frontend/wxt/` (package.json, wxt.config.ts, arkzen.ts watcher, `arkzen/core/ext-router.ts`).
- `engine/shared/arkzen/extension-core/`.
- `shared-sync.ts`: wxt stack handling.

**CLI and export**
- `mizumi.js`: `extension <stack>` command, deps install/prune, stack list, menu entries, export wiring, `new` template. Backend display metadata lives here too.
- `export.js`: extension branch (own early branch like Unreal, or a stack mode), `--backend` handling, writes `projects/extension/<tat>/`, zips.
- `scaffold.js`: BLOCKS entries for each ext block, `SHAPE_A_TAGS`, family parsing (`head === 'ext'`), `extension` template, cross-checks.
- `gui/renderer/menu.js`: game entries exist there, add extension entries.
- `setup.js`: install path for the wxt stack.

**Editor tooling**
- `vscode-extension/extension.js` (tag regex around line 342), `lib/snippets.js`, `lib/scaffold.mjs`, `syntaxes/tatemono.tmLanguage.json`.

**Docs and AI data**
- `PLUFF_GUIDELINES_v14.md`: new Part, Section 1B stack table, quick lookup table, Section 3 order list, Section 30 file prefixes.
- `PLUFF_DSL_CATALOG.md`, `README.md`, `PLUFFY_RUN_GUIDE.md` (new section like 6.x), `FUTURE_PLANS.md` (Phase 3 status).
- `scan.js`, `tatemono-index.js`, `descriptions.json`: the AI training data and index need extension examples after the DSL is stable.

**Tests**
- `node --test` files for the ext parser, validator and emitter, in the style of `engine/game/unreal/generator.test.js`.

---

## 10. Phased plan

**Phase 0: research (DONE).** Findings in sections 2 and 3.

**Phase 1: register the `ext` family.**
Work: parser, validator, types, scaffold, VS Code tag regex, sync.
Done when: an extension-only `core.tsx` parses with zero errors in the web watcher; existing tatemonos parse exactly as before; `node mizumi.js check` accepts it.

**Phase 2: stack skeleton and hand-built reference.**
Work: create `engine/frontend/wxt/`; hand-write the entrypoints a tatemono should produce (popup plus background) as the known-good target.
Done when: you load the built output unpacked in Chrome and the popup opens. (The sandbox that wrote this plan could not run a browser.)

**Phase 3: emitter v1.**
Blocks: `ext:project`, `ext:popup`, `ext:background`, `ext:page`, `ext:export`. Chrome only, no backend, zip output.
Work: `ext-router.ts`, `export.js` branch, `mizumi.js export <tat> extension`, tests.
Done when: `ext-tab-notes` exports to a zip that installs in Chrome.

**Phase 4: more surfaces and Firefox.**
Blocks: `ext:sidepanel`, `ext:content` (ui and script), `ext:script`, `ext:commands`, `ext:menus`. Firefox build with `--mv3`.
Done when: `ext-page-overlay` works on a real page in Chrome and Firefox.

**Phase 5: backend and shared UI.**
Work: `extension-core` (`ext.api`, `ext.auth`, `ext.storage`, `ext.messages`), `{extension}` file prefix, host permission auto-add, CORS allowlist. Test Laravel first, then Express, then run the conformance vectors for the other five backends.
Done when: `ext-side-journal` logs in and reads/writes data through the backend from an installed extension.

**Phase 6: remaining blocks and features.**
Blocks: `ext:rules`, `ext:locale`. Features: `oauth` for extension targets, realtime in surfaces, `notifications` `browser` channel (candidate), `jobs` to alarms (candidate).

**Phase 7: tooling and docs.**
Work: scaffold template, menu entries, VS Code snippets and syntax, guideline Part, catalog, README, run guide, `FUTURE_PLANS.md`, AI training data.

**Example tatemonos to ship**
1. `ext-tab-notes`: popup plus storage, no backend.
2. `ext-page-overlay`: content script with UI overlay.
3. `ext-side-journal`: side panel plus backend plus auth.
4. `notes-suite`: web page and extension in one tatemono sharing one login.

---

## 11. Risks and unverified items

- WXT is 0.x (0.21.5). Pin the version and expect breaking changes between minors.
- WXT needs Node 22 or newer. Check against what `setup.js` and `PLUFFY_RUN_GUIDE.md` require today.
- Firefox builds default to MV2 in this WXT version. The export must pass `--mv3` explicitly.
- Laravel CORS for extension origins: unverified (needs PHP). Express is open.
- Whether each stack's router emits `web:components` for a tatemono with no web pages: unverified. Only matters for sharing components with extension surfaces.
- How many existing web components avoid the router adapter: unverified.
- Exact `arkzen.json` storage for categories (copy the `desktop` pattern): unverified.
- WXT `import.meta.env` prefix for the API base (`WXT_*` confirmed by docs I read, `VITE_*` unchecked).
- Messaging: sources disagree on whether WXT has built-in messaging, so `ext.messages` is ours.
- WXT content-script UI types and declarativeNetRequest handling: from docs and memory, untested.
- OAuth redirect design for extensions is open.
- Nothing has been loaded in a real browser. Treat generated output as unverified until Phase 2 and 3 pass in Chrome.
- Safari is out of scope (needs Xcode converter).
- Chrome Web Store review: remote hosts need justification, no remote code. Not researched.

---

## 12. What the planning session did and did not read

Read fully: `README.md`, `FUTURE_PLANS.md`, `PLUFF_DSL_CATALOG.md`.
Read in the guideline (`PLUFF_GUIDELINES_v14.md`, 295 KB): Sections 1, 1B, 1C, 1D, 1G, 3, 3D, 4, 19C, 26B, 28B, 30, and the start of the Unreal appendix.
Read in code: `parser.ts` (tag validation, `validatePages`, `parseTatemono`), `vite-builder.ts`, `vite-watcher.ts`, `electron/main.js`, `export.js` (game branch and desktop section), `shared-sync.ts` header, both `authStore.ts` files, `engine/game/common/index.js`, parts of `engine/game/unreal/generator.js`, `scaffold.js` templates, stack configs (Next, Astro, TanStack, Vite).
NOT read: guideline Sections 2C to 2F (design rules), 1E/1F (backend bodies), Godot and Unity appendices, Section 28 examples, Part H index; backend READMEs; Tauri Rust code; `setup.js` and `start.js` internals; most tatemono fixtures.

---

## 13. Start here in the next session

Paste this into the new Claude session along with the repo URL:

> Read `PLUFFY_EXTENSION_PLAN.md` (this file), then read `engine/shared/arkzen/engine-core/parser.ts` (`validateDslTags`, `validatePages`, `parseTatemono`), `engine/frontend/react-vite/arkzen/core/vite-router.ts` and `shared-sync.ts`. Do Phase 1 only: register the `ext` family so an extension-only `core.tsx` parses with zero errors and existing tatemonos are unchanged. Show complete files, not diffs. Do not start the wxt stack yet.

Constraints Mizumi has stated for this work: direct and decisive answers instead of option lists, complete file outputs instead of snippets or diffs, no unsolicited feature suggestions, read the actual source files before suggesting fixes, no em dashes.
