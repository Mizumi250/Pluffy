# Pluffy Frontend Extension Plan (non-React web, native mobile, native desktop)

Status: plan only. Nothing in this document has been implemented. Written 2026-11-25 from a session that read the Pluffy repo (github.com/Mizumi250/Pluffy), the three existing plans (`PLUFFY_EXTENSION_PLAN.md`, `PLUFFY_PACKAGE_PLAN.md`, `PLUFFY_TERMINAL_PLAN.md`), `FUTURE_PLANS.md`, the DSL catalog, and checked framework versions on npm.

This is NOT a phase of `FUTURE_PLANS.md` yet. It widens what the existing `web`, `app` and `desktop` categories can produce. It is separate from Phase 6 (Operating System).

All DSL names, header keys and CLI commands below are PROPOSALS. "Verified" means read in the repo or checked against a registry. Everything else is a design choice or an unverified assumption, listed in section 12.

Scope: the FULL scope Mizumi asked for, not filtered into versions. Section 10 gives a work order, which is order only.

---

## 1. Decision summary

Today every UI Pluffy generates is React written in TypeScript: 5 web stacks, 3 app stacks (Expo, bare React Native, Lynx), 2 desktop wrappers (Tauri, Electron) that load the web stack. The backends already have 7 languages. This plan gives the UI side the same freedom.

1. **Part A, non-React web.** New web stacks for other frameworks. They stay in the `web` category and live in `engine/frontend/<stack>/` like the existing ones. Page and component bodies are written in the framework's own syntax, using namespaced blocks that copy the Lynx precedent (`web:page:vue:name`).
2. **Part B, native mobile.** Kotlin with Jetpack Compose for Android, Swift with SwiftUI for iOS. Not wrappers, not React. They are generate-only export targets with their own generators in `engine/native/`, the same pattern as the game engines.
3. **Part C, native desktop.** Two stacks: Compose Desktop (Kotlin, runs on Windows, macOS and Linux) and SwiftUI for macOS (Swift). Kotlin pages are shared between Android and Compose Desktop, Swift pages between iOS and macOS.
4. **No neutral UI language.** Pluffy will not invent a framework-neutral UI description that compiles to every toolkit. Declarative parts are shared (database, api, auth, routes, meta, assets). UI bodies are written per toolkit. This matches how backend bodies and Lynx already work.
5. **Shared data layer.** Every new target talks to the existing backends over HTTP and uses the same `database`, `api`, `routes` and auth blocks. No backend change is required for the UI side.
6. **Existing React tatemonos are not translated.** A tatemono must provide pages for the framework of the active stack, or the validator says so. Automatic React to Vue or Kotlin conversion is out of scope.
7. **Standalone toolchains.** Each new stack uses its own tools and its own dependencies. Nothing borrows packages from another stack.

Not chosen, with reasons, in section 11.

---

## 2. Verified findings (repo)

| # | Finding | How verified |
|---|---|---|
| 1 | The stack table in guideline Section 1B lists 5 web stacks (`nextjs`, `react-vite`, `tanstack-start`, `astro`, `react-inertia`), 3 app stacks (`expo`, `react-native`, `lynx`), 2 desktop stacks (`tauri`, `electron`). Every web and app stack is React or ReactLynx. | Read guideline 1B, `engine/frontend/` listing |
| 2 | Lynx is the precedent for a separate renderer inside a category. Its blocks live under a `:lynx:` namespace (`native:page:lynx:name`, `native:layout:lynx:name`, `native:components:lynx:name`, `native:style:lynx`, `native:error:404:lynx`, `native:animation:lynx`, `native:script:lynx`), are self-contained, and carry no Expo/RN import pair. The parser has one parse function per Lynx block and `ParsedTatemono` has nine dedicated Lynx fields. | Read `parser.ts` lines ~870 to 1135, `engine/frontend/lynx/arkzen/types/index.ts` |
| 3 | Frames are the precedent for per-target host code in the target's own language: `native:frame:expo\|rn\|lynx` (TSX), `desktop:frame:electron` (JavaScript), `desktop:frame:tauri` (Rust). Web stacks do not use frames. | Read DSL catalog and guideline 19C |
| 4 | Electron loads `DESKTOP_DEV_URL` (default `http://localhost:3000`). Tauri has `devUrl: http://localhost:3000` and `frontendDist: ../../react-vite/dist`, so the Tauri production bundle is hard wired to the react-vite stack. | Read `electron/main.js`, `tauri.conf.json` |
| 5 | `desktop:config` holds only window settings (`width`, `height`, `min_width`, `min_height`, `resizable`, `fullscreenable`, `title`). Menus, tray and host events go in the frame blocks. | Read guideline Section 1D |
| 6 | `arkzen.json` stores `activeStack`, `activeAppStack`, `activeDesktopStack`, `activeBackend`, `activeDatabase`. `mizumi.js` reads these to switch stacks and to build the export menu. | Ran a read of `arkzen.json`, grep `mizumi.js` |
| 7 | `engine/shared/arkzen/web-core/` holds `adapters/router.ts`, `hooks` (`useQuery`, `useMutation`, `useWebSocket`, `useCRDT`), `lib`, `stores/authStore.ts`, plus web components and layouts. `shared-sync.ts` copies these into each stack. The auth store imports React. A Vue or Svelte stack cannot take these files as they are. | Listed folders, grep for `from 'react'` |
| 8 | Games are the precedent for generate-only targets: generators in `engine/game/<engine>/`, output in `projects/<engine>/<tat>/`, an early branch in `export.js`, wired in `mizumi.js` and `scaffold.js`. They have no watcher and no `arkzen.json` key. | Read in earlier sessions, listed `engine/game/` |
| 9 | `a2ui-lab` and `mobile-sdui` are not framework-neutral UI descriptions. `a2ui-lab` is a React web page with registered screens. `mobile-sdui` is a React Native screen that renders button definitions stored in the database. Neither gives Pluffy a neutral UI language to reuse. | Read both `core.tsx` files |
| 10 | The native authStore is separate from the web one: it uses an absolute base URL (`EXPO_PUBLIC_ARKZEN_BACKEND_URL`, default `http://localhost:8000`) instead of the Vite proxy and relative URLs. Native clients already reach the backends directly. | Read in the extension session |
| 11 | The Lynx native bridge (`ArkzenBridge`) is declared but its native side does not exist; wrappers no-op with a warning. Real native code for it has never been written in this repo. | Read `native-bridge.ts` |
| 12 | Parser changes must be synced to every stack because `shared-sync.ts` copies `engine-core` into each stack's `arkzen/core/`. The `ext` family is already partly in the parser (`ArkzenExt` type, v17.0 comments), so this work must be done on top of the current `parser.ts`, not the version these plans were written against. | Read `types/index.ts`, `parser.ts` header |
| 13 | The guideline says Node.js LTS is required. No minimum major version is stated in `PLUFFY_RUN_GUIDE.md`. | grep run guide |

---

## 3. Registry check (npm, 2026-11-25)

| Package | Latest | Published | Node engine |
|---|---|---|---|
| vue | 3.5.46 | 2026-11-20 | not stated |
| nuxt | 4.7.0 | 2026-11-23 | ^22.22.3, ^24.15.0 or >=26 |
| svelte | 5.59.1 | 2026-11-20 | >=18 |
| @sveltejs/kit | 3.4.0 | 2026-11-18 | >=22.17 |
| @angular/core | 22.3.0 | 2026-11-18 | ^22.22.3, ^24.15.0 or >=26 |
| solid-js | 2.0.4 | 2026-11-25 | >=22.12 |
| @solidjs/start | 2.2.3 | 2026-11-16 | >=24 |
| vite | 8.3.8 | 2026-11-11 | ^20.19 or >=22.12 |
| @vitejs/plugin-vue | 6.0.11 | 2026-11-12 | ^20.19 or >=22.12 |
| @sveltejs/vite-plugin-svelte | 7.3.2 | 2026-11-23 | ^20.19, ^22.12 or >=24 |
| lit | 3.3.3 | 2026-05-14 | not stated |
| preact | 11.2.0 | 2026-11-06 | not stated |

Notes:
- solid-js 2.0.4 was published the same day this plan was written. Treat Solid as the least settled of the group.
- Nuxt, Angular and SolidStart need a newer Node than the other tools. This must be checked against `setup.js`.
- Kotlin, Compose, Gradle, Swift and Xcode versions were NOT checked. Maven Central and Google Maven are not on the sandbox network allowlist, and Swift packages are not on npm.
- Nothing in this table was installed or built. Versions come from registry metadata only.

---

## 4. Architecture

### 4.1 Where things live

```
engine/
  frontend/
    vue/  nuxt/  svelte/  sveltekit/  angular/  solid/  html/     Part A, new web stacks
      package.json        OWN dependencies, own node_modules
      arkzen.ts           watcher (same role as other stacks)
      arkzen/core/        synced engine-core files + this stack's router emitter
  native/
    common/               shared: asset copy, theme tokens, route table, api client spec, verify runner
    android/              Part B: Kotlin + Compose generator
    ios/                  Part B: Swift + SwiftUI generator
    compose-desktop/      Part C: Kotlin + Compose Desktop generator
    macos/                Part C: Swift + SwiftUI (macOS) generator
    package.json          OWN tool dependencies (js-yaml, archive helpers)
  shared/arkzen/engine-core/    parser.ts, validator.ts: new blocks
projects/android/<tat>/  projects/ios/<tat>/  projects/compose-desktop/<tat>/  projects/macos/<tat>/    output (gitignored)
tatemonos/<tat>/core.tsx      source of truth
tatemonos/<tat>/assets/       icons, images, fonts
```

Why the split:
- Non-React web stacks use Vite and a dev server, so they belong with the other web stacks and use the same watcher model.
- Kotlin and Swift projects are built by Gradle and Xcode, not by a Node dev server. They follow the game pattern: a Node generator writes a project, the native toolchain builds it.
- Stacks inside `engine/frontend/` are rewritten by watchers and pruned by `deps prune`. Native projects are generated into `projects/` only.

### 4.2 Data flow

Part A (web):
1. Watcher reads `core.tsx`.
2. `parseTatemono` parses framework blocks into `parsed.webFrameworks[<fw>]` (see 5.2).
3. The stack's router emitter writes routes, pages, layouts, components and styles in that framework.
4. Vite (or the framework CLI) builds. The Vite proxy sends `/api` to the backend exactly as the React stacks do.

Parts B and C (native):
1. Export reads `core.tsx` and `parseTatemono`.
2. The generator in `engine/native/<target>/` writes a full Kotlin or Swift project.
3. Gradle or Xcode builds it. The verify step runs the build (section 9).
4. Backend blocks are built by the existing backend bridge, unchanged.

### 4.3 Commands (proposed)

- `node mizumi.js web <stack>` accepts the new web stacks (`vue`, `nuxt`, `svelte`, `sveltekit`, `angular`, `solid`, `html`).
- `node mizumi.js deps install <stack>` and `deps prune` include them.
- `node mizumi.js export <tat> android|ios|compose-desktop|macos` writes `projects/<target>/<tat>/`.
- `node mizumi.js deps install native` installs `engine/native/package.json`.
- `node mizumi.js new <n> --template=vue|svelte|android|ios|...` scaffolds a tatemono for that target.
- The native targets are NOT values of `activeAppStack` or `activeDesktopStack`. They are export targets like Godot, Unity and Unreal, because they have no Node dev server to run. Decision, see section 12 for the question it leaves open.

### 4.4 node_modules rule

Each new web stack has its own `node_modules`, installed and pruned like the others. The native generators use `engine/native/package.json`. Do not borrow `js-yaml` from `engine/frontend/nextjs/package.json` the way `engine/game/common/` does (that breaks after `deps prune`).

---

## 5. Part A: non-React web

### 5.1 Stacks in scope

| Stack id | Framework | Counterpart | Output kind |
|---|---|---|---|
| `vue` | Vue 3 + Vite | `react-vite` | static SPA |
| `nuxt` | Nuxt 4 | `nextjs` | SSR |
| `svelte` | Svelte 5 + Vite | `react-vite` | static SPA |
| `sveltekit` | SvelteKit | `nextjs` | SSR |
| `angular` | Angular | none | SPA |
| `solid` | SolidJS + Vite | `react-vite` | static SPA |
| `html` | plain HTML, CSS, JS, no framework | none | static pages |

Possible candidate, not decided: Inertia with Vue or Svelte for the Laravel monolith (`react-inertia` is React only). The Inertia project supports those adapters from knowledge; not checked.

### 5.2 DSL design: copy the Lynx precedent, but without field explosion

Lynx added nine fields to `ParsedTatemono`, one per block type. Six frameworks would add fifty. Instead one map:

```ts
webFrameworks?: Record<'vue'|'nuxt'|'svelte'|'sveltekit'|'angular'|'solid'|'html', {
  pages: ArkzenPage[]
  layouts: ArkzenSection[]
  components: ArkzenSection[]
  styleGlobal?: ArkzenSection
  styles: ArkzenSection[]
  errorHandlers: ArkzenErrorHandler[]
  script?: ArkzenSection
  scripts: ArkzenSection[]
  animation?: ArkzenSection
}>
```

Markers (React stays unprefixed, exactly as `native:page:name` is Expo/RN and `native:page:lynx:name` is Lynx):

| Marker | Purpose |
|---|---|
| `@arkzen:web:page:<fw>:<n>` | A page in that framework |
| `@arkzen:web:layout:<fw>:<n>` | Reusable layout |
| `@arkzen:web:components:<fw>:<n>` | Reusable components |
| `@arkzen:web:style:<fw>` and `@arkzen:web:style:<fw>:<n>` | Global and scoped CSS |
| `@arkzen:web:error:404:<fw>` and `500:<fw>` | Error UI |
| `@arkzen:web:script:<fw>` and `<fw>:<n>` | Helper modules |
| `@arkzen:web:animation:<fw>` | Animation setup |

Shapes follow guideline 3D (A, B, C). Code blocks need `:end */`. The page inline layout line works the same way (`/* @arkzen:web:page:<fw>:layout:guest */`).

Page bodies use the framework's own syntax:
- `vue`, `nuxt`: a single file component (`<script setup>`, `<template>`, `<style>`).
- `svelte`, `sveltekit`: a Svelte component.
- `solid`: TSX using Solid primitives (not React hooks).
- `angular`: a standalone component class with its template.
- `html`: an HTML body plus optional script.

Reserved page names: `vue`, `nuxt`, `svelte`, `sveltekit`, `angular`, `solid`, `html`, plus the existing `layout`. A React page named `vue` would otherwise look like a Vue block. The same risk already exists for `lynx` and is not checked there.

### 5.3 What is shared and what is not

Shared and unchanged: `meta`, `meta:web`, `web:config`, `database`, `api`, `routes`, `endpoint`, `handler`, `policy`, `middleware`, `realtime`, `events`, `jobs`, `notifications`, `mail`, `console`, `oauth`, `file`, the `assets/` folder.

Not shareable from `web-core` (React):
- `components`, `layouts`, `adapters/router.ts`, `Link`.
- `hooks`: `useQuery`, `useMutation`, `useWebSocket`, `useCRDT` use React. Each new stack needs framework equivalents (composables for Vue, stores or runes for Svelte, signals for Solid, services for Angular).
- `stores/authStore.ts` imports React. Each stack needs its own auth store with the same contract: relative URL `/api/<slug>/auth`, token plus cookie `arkzen-auth-<slug>`, slug from `window.__ARKZEN_TATEMONO__`.
- `lib/cache.ts` and `lib/dsl-style-emitter.ts`: not checked for React coupling.

Sync rule: `shared-sync.ts` gets a per-stack set. Non-React stacks receive `engine-core` files and the framework-neutral `lib` files only.

### 5.4 Desktop wrappers with other web stacks

- Electron loads a URL, so it works with any web stack in dev (verified).
- Tauri `frontendDist` points at `react-vite/dist`. To wrap a non-React stack, that path must come from the active web stack. Change needed in `tauri.conf.json` handling (section 8).

### 5.5 Example (illustrative, not compiled)

```tsx
/* @arkzen:web:page:vue:index */
<script setup lang="ts">
import { ref, onMounted } from 'vue'
const items = ref<{ id: number; name: string }[]>([])
onMounted(async () => {
  const res = await fetch('/api/notes-demo/notes')
  items.value = (await res.json()).data
})
</script>
<template>
  <main>
    <h1>Notes</h1>
    <ul><li v-for="n in items" :key="n.id">{{ n.name }}</li></ul>
  </main>
</template>
/* @arkzen:web:page:vue:index:end */
```

---

## 6. Part B: native mobile (Kotlin and Swift)

### 6.1 Targets

| Target | Language | UI toolkit | Build tool | Runs on |
|---|---|---|---|---|
| `android` | Kotlin | Jetpack Compose | Gradle | Android |
| `ios` | Swift | SwiftUI | Xcode (`xcodebuild`) | iOS |

Java is not a UI language here. Compose is Kotlin only. Java and the old View system are excluded (section 11). Java stays in Pluffy as a backend language.

### 6.2 DSL: namespace by toolkit language, frames by target

Pages, layouts and components are shared between a mobile target and its desktop counterpart, so the namespace is the toolkit language, like `lynx` is a toolkit:

| Marker | Purpose |
|---|---|
| `@arkzen:native:page:kotlin:<n>` | Compose screen (feeds `android` and `compose-desktop`) |
| `@arkzen:native:page:swift:<n>` | SwiftUI screen (feeds `ios` and `macos`) |
| `@arkzen:native:layout:kotlin:<n>`, `:swift:<n>` | Reusable screen wrapper |
| `@arkzen:native:components:kotlin:<n>`, `:swift:<n>` | Reusable components |
| `@arkzen:native:style:kotlin`, `:swift` | Theme tokens (colors, typography, shapes) |
| `@arkzen:native:error:404:kotlin`, `:swift` (and `500`) | Error screens |
| `@arkzen:native:script:kotlin:<n>`, `:swift:<n>` | Helper files |
| `@arkzen:native:frame:android` | Kotlin: `NavHost`, app bar, bottom bar, status bar |
| `@arkzen:native:frame:ios` | Swift: `NavigationStack`, `TabView`, toolbar |

Frames follow the existing rule: opt-in, per target, written in that target's language, and a tatemono with no frame block gets default chrome.

Header keys on page blocks (proposed): `route` (default from the page name), `targets` (`[android]`, `[desktop]`, or both, default all that the namespace feeds), `guard` (`auth` or `guest`, like the web `+auth`/`+guest`).

`@arkzen:native:config` and `@arkzen:meta:native` are reused for label, theme colors and identifiers. Expo-only keys under `meta:native` (`expo:` map) are ignored. New `android:` and `ios:` maps carry `application_id`, `bundle_id`, `version_code`, `min_sdk`, `deployment_target`, `orientation`. Exact keys not designed.

### 6.3 Generated project (proposed)

Android: Gradle Kotlin DSL project, one `Activity`, Compose navigation graph built from the page routes, theme from `native:style:kotlin`, an API client module from the tatemono's `api` and `routes` blocks, an auth store using DataStore, assets copied from `assets/`. Project output in `projects/android/<tat>/`.

iOS: Xcode project (or Swift Package plus project file), `App` entry, `NavigationStack` router, theme from `native:style:swift`, API client, auth store with Keychain, assets copied into an asset catalog. Output in `projects/ios/<tat>/`.

API access: both clients use an absolute base URL from a build setting (like `EXPO_PUBLIC_ARKZEN_BACKEND_URL`), the same endpoints, same token header as the native authStore (finding 10). Android emulator reaches the host at `10.0.2.2` instead of `localhost` (from knowledge), so the dev base URL must be per target.

Realtime (Reverb, Pusher protocol): needs a client library per language. Not chosen, not checked.

### 6.4 What Pluffy writes and what you write

- Generated: project skeleton, navigation, theme, API client, auth, asset wiring, route table.
- Written by you: every screen and component body, in Kotlin or Swift.
- Not generated: platform services such as push notifications, camera, files, background work. They are code in `native:script:*` blocks. The Lynx bridge shows this gap already exists (finding 11).

### 6.5 Example (illustrative, not compiled)

```tsx
/* @arkzen:native:page:kotlin:index */
@Composable
fun IndexScreen(api: Api) {
  var items by remember { mutableStateOf(listOf<Note>()) }
  LaunchedEffect(Unit) { items = api.notes.list() }
  LazyColumn { items(items) { Text(it.name) } }
}
/* @arkzen:native:page:kotlin:index:end */
```

---

## 7. Part C: native desktop

### 7.1 Targets

| Target | Language | UI toolkit | Runs on | Shares pages with |
|---|---|---|---|---|
| `compose-desktop` | Kotlin | Compose for Desktop (JVM) | Windows, macOS, Linux | `android` |
| `macos` | Swift | SwiftUI (macOS) | macOS | `ios` |

Honest note on `compose-desktop`: Compose draws its own widgets with Skia (from knowledge). It is native code with no web view and no Electron, but it does not use each OS's own widget set. This decision gives all three desktop OSes from Kotlin that Part B already needs. A Windows-only WinUI or a Linux GTK or Qt stack is not added (section 11). Mizumi should confirm this tradeoff (section 12).

### 7.2 DSL

- Pages, layouts, components, styles: the same `native:*:kotlin` and `native:*:swift` blocks as Part B. A page without a `targets` key feeds both its mobile and desktop target. Platform differences use `targets` or a check inside the code.
- `@arkzen:desktop:frame:compose` (Kotlin): window, menu bar, tray, shortcuts.
- `@arkzen:desktop:frame:macos` (Swift): `Scene`, `Commands`, menu bar extra.
- `@arkzen:desktop:config` is reused for window size, min size, title, resizable and fullscreen. Mapping to Compose `Window` and SwiftUI `WindowGroup` is straightforward for those seven keys (from knowledge, untested).

### 7.3 Packaging

- Compose Desktop: Gradle packaging for `.msi`, `.dmg`, `.deb` (from knowledge). Building each format needs that OS.
- macOS: `.app` through `xcodebuild`, `.dmg` by a separate step. Needs a Mac.
- Signing and notarization are out of scope. Pluffy does not store credentials (same rule as the package plan).

---

## 8. Engine work list (file by file)

**Parser and validation (engine-core, then sync to every stack)**
- `parser.ts`: add `web:<kind>:<fw>` parsing into `webFrameworks`; add `native:<kind>:kotlin` and `native:<kind>:swift`; add `desktop:frame:compose|macos` and `native:frame:android|ios`; register them in `CODE_BLOCK_TAGS`; reserved page name check; `validatePages` rule that the active stack's framework has at least one page.
- `validator.ts`: unique names, valid `targets`, reserved names, a warning when the active stack's framework has no pages while other frameworks do, a warning when a page imports a framework-specific module from another framework.
- Each stack's `arkzen/types/index.ts`: `ArkzenWebFramework`, `ArkzenNativeKotlin`, `ArkzenNativeSwift` types.
- Do this in the same pass as the `ext`, `pkg` and `term` families. It is the same parser change. Start from the current `parser.ts`, where `ext` already exists.

**Part A**
- One folder per stack in `engine/frontend/` with `package.json`, config, `arkzen.ts` watcher, and `arkzen/core/<fw>-router.ts` emitter. Model on `react-vite/arkzen/core/vite-router.ts` for the Vite-based ones.
- Framework equivalents of `useQuery`, `useMutation`, `useWebSocket`, auth store.
- `shared-sync.ts`: per-stack sets (finding 7).
- `mizumi.js`: accept the new stacks in `web <stack>`, `deps`, stacks list, export menu, `setup.js` install path, `new --template`.
- `export.js`: web export for each new stack (static build for SPA stacks, server build for Nuxt and SvelteKit).
- Tauri: `frontendDist` follows the active web stack.
- `export-docker.js` and `export-openapi.js`: check what they assume about the web stack (not read).

**Parts B and C**
- `engine/native/common/` and one generator folder per target, each with `node --test` tests in the style of `engine/game/unreal/generator.test.js`.
- `export.js`: early branches per target (Unreal precedent).
- `mizumi.js`: export wiring, `new --template`, `deps install native`, menu entries. Check how `cmdPublish` treats `projects/<target>/` (games share this layout).
- `scaffold.js`: `BLOCKS` entries, `SHAPE_A_TAGS`, family parsing for the new namespaces, templates, cross-checks.
- `file-writer.ts`: optional `{android}`, `{ios}`, `{compose}`, `{macos}` prefixes for `@arkzen:file`, and a `{vue}`-style prefix per new web stack, added to the off-limits rules.
- `gui/renderer/menu.js`: entries. Coordinate with the desktop app session, which is changing the same GUI.

**Editor tooling and docs**
- `vscode-extension/extension.js` (tag regex), `lib/snippets.js`, `lib/scaffold.mjs`, `syntaxes/tatemono.tmLanguage.json` (embed Vue, Svelte, Kotlin and Swift grammars for the new blocks).
- `PLUFF_GUIDELINES_v14.md`: Section 1B stack table, a new Part, quick lookup table, Section 3 order list, Section 30 file prefixes.
- `PLUFF_DSL_CATALOG.md`, `README.md`, `PLUFFY_RUN_GUIDE.md` (toolchain section), `FUTURE_PLANS.md`.
- `scan.js`, `tatemono-index.js`, `descriptions.json`: AI training data needs Vue, Svelte, Kotlin and Swift examples once the DSL is stable.

**Fixtures to ship (one per target)**
`vue-notes`, `svelte-notes`, `nuxt-notes`, `angular-notes`, `solid-notes`, `html-notes`, `android-notes`, `ios-notes`, `compose-desktop-notes`, `macos-notes`. Each uses the same `database:notes` and `api:notes` so the data layer is the identical test across targets.

---

## 9. Verification policy

- Part A: build with the framework's own build command and load the output. A Vite-based stack must serve `/api` through the proxy and a page must fetch data from a running backend. Non-React stacks must not import anything from `web-core` React files.
- Part B and C: run `gradle assembleDebug` (Android and Compose Desktop) or `xcodebuild` (iOS and macOS). Optional emulator or simulator run is out of reach on most machines.
- If a toolchain is missing, the export still writes the project where it can, marks it UNVERIFIED in the report, and never claims it passed. The sandbox that wrote this plan has no JDK, Gradle, Android SDK or Xcode.
- iOS and macOS can only be verified on a Mac.
- Generated native projects must build with no Pluffy files present (same rule as terminal plan).

---

## 10. Work order (order only, everything above is in scope)

1. Register the new block families in the parser, validator, types, scaffold and VS Code, in the same pass as `ext`, `pkg` and `term`. Done when a tatemono with `web:page:vue:*` blocks parses with zero errors in all existing stacks and existing tatemonos parse exactly as before.
2. `vue` stack (Vite), with framework equivalents of hooks and auth. Closest to `react-vite`, so it proves the model. Done when `vue-notes` runs against the Laravel and Express backends.
3. `svelte`, then `solid`, then `html`.
4. `nuxt` and `sveltekit` (SSR stacks), then `angular`.
5. Tauri `frontendDist` follows the active web stack.
6. `android` generator (Kotlin and Compose). Gradle is the most testable native toolchain on Linux and Windows.
7. `compose-desktop`, reusing the Kotlin blocks from step 6.
8. `ios` and `macos` generators, each only once a Mac is available to run the verify step.
9. Tooling and docs: scaffold templates, menus, VS Code, guideline Part, catalog, README, run guide, `FUTURE_PLANS.md`, AI training data.

---

## 11. Out of scope and not chosen

- Flutter and Dart: a separate ecosystem with its own language. Not in Pluffy today.
- Kotlin Multiplatform and Compose Multiplatform as one stack for Android and iOS: not chosen because Mizumi asked for actual native. Revisit if the Swift generator proves too costly.
- Java UI (Android Views, Swing, JavaFX): Compose is Kotlin only, and Views are the older system. Java stays a backend language.
- .NET MAUI, WinUI, WPF, Avalonia, Qt, GTK: each adds a toolkit and a verification path. Windows and Linux are covered by Compose Desktop for now.
- Preact: React compatible, so existing React blocks mostly apply. Not checked.
- Qwik, htmx, Lit as separate stacks: not checked, or not a full app framework. `html` covers framework-free pages.
- Translating existing React tatemonos to other frameworks automatically.
- A framework-neutral UI language (section 1, decision 4).
- Store submission, code signing, notarization, app store metadata.

---

## 12. Risks and unverified items

- Nothing in this plan has been built or run. All framework versions are registry metadata only.
- Kotlin, Compose, Gradle, Swift and Xcode versions were not checked, and no JDK, Gradle, Android SDK or Xcode is available in the sandbox.
- Solid 2.0.4 was published the day this plan was written. Expect breaking changes.
- Nuxt, Angular and SolidStart need Node 22.22 or 24 and newer. Check against `setup.js` before promising them.
- Block names `web:page:<fw>:<n>` can clash with a React page named like a framework. The reserved list covers it. The same risk for `lynx` pages is unchecked.
- How many existing web components, hooks and stores are React only and how much of `lib` is neutral: not fully checked.
- `lib/cache.ts` and `lib/dsl-style-emitter.ts` React coupling: not checked.
- Tauri `frontendDist` change and whether Tauri can wrap SSR stacks (Nuxt, SvelteKit): unverified. Tauri production needs static output.
- `export-docker.js` and `export-openapi.js` assumptions about the web stack were not read.
- Reverb realtime client on Kotlin and Swift: not chosen.
- Compose Desktop is Skia drawn, not OS widgets (from knowledge). Mizumi must confirm this counts as native desktop for Pluffy.
- Native stacks as export targets and not `activeAppStack` values means no live dev loop from `mizumi.js start`. Decide whether that is acceptable.
- Android emulator host address (`10.0.2.2`) and iOS App Transport Security rules for `http://localhost` are from knowledge, untested.
- The `native:meta` keys for `android:` and `ios:` are not designed.
- The desktop app session is changing `gui/` in parallel. Menu changes in this plan may conflict.
- The extension, package and terminal plans also change `parser.ts`. One pass should cover all four plans.

---

## 13. What the planning session did and did not read

Read fully: `FUTURE_PLANS.md`, `PLUFFY_EXTENSION_PLAN.md`, `PLUFFY_PACKAGE_PLAN.md`, `PLUFFY_TERMINAL_PLAN.md`, `PLUFF_DSL_CATALOG.md`.
Read in the guideline (`PLUFF_GUIDELINES_v14.md`): Section 1B (stack table, CLI), Section 1D (desktop config), and the version notes that describe frames.
Read in code: `parser.ts` (Lynx parsing, native import resolution, frame list, `ParsedTatemono` fields via `types/index.ts`), `arkzen.json`, `mizumi.js` (stack switching lines), `electron/main.js` and `tauri.conf.json` (dev URL and dist path), `lynx/arkzen/core/native-bridge.ts`, folder listings of `engine/frontend`, `engine/shared/arkzen/web-core` and `engine/game`, `tatemonos/a2ui-lab/core.tsx` and `tatemonos/mobile-sdui/core.tsx` (headers and structure).
Checked on npm: the packages in section 3.
NOT read: guideline Sections 2C to 2F, 19C body, 1E, 1F, game appendices; `export.js` beyond earlier sessions; backend generators; `shared-sync.ts` body; the Expo and react-native stack internals; `export-docker.js`; `export-openapi.js`; `setup.js` Node requirement; `gui/`.
NOT checked: Kotlin, Compose, Gradle, Swift, Xcode and Android tooling versions; Inertia Vue and Svelte adapters; Preact, Qwik, htmx.

---

## 14. Start here in the next session

Paste this into the new Claude session along with the repo URL:

> Read `PLUFFY_FRONTEND_EXTEND_PLAN.md`, `PLUFFY_EXTENSION_PLAN.md`, `PLUFFY_PACKAGE_PLAN.md` and `PLUFFY_TERMINAL_PLAN.md`, then read the CURRENT `engine/shared/arkzen/engine-core/parser.ts` (`validateDslTags`, `validatePages`, `parseTatemono`, the Lynx parse functions and the frame list), `engine/frontend/lynx/arkzen/types/index.ts` and `shared-sync.ts`. Do work order step 1 only: register the new web framework, Kotlin and Swift block families so tatemonos containing them parse with zero errors in every stack and existing tatemonos are unchanged. Show complete files, not diffs.

Constraints Mizumi has stated for this work: direct and decisive answers instead of option lists, complete file outputs instead of snippets or diffs, no unsolicited feature suggestions, read the actual source files before suggesting fixes, no em dashes. Mizumi wants the full scope listed, not split into versions, and wants the native targets to be actual native, not React.
