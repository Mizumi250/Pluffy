# ARKZEN ROADMAP — v9.5 to v11

## Current Status — v9.0 ✓ COMPLETE

**What's done:**
- 5 frontend stacks: Next.js, React+Vite, TanStack Start, Astro, React+Inertia
- 21 backend builders, full DSL pipeline
- 25 active tatemonos
- Per-tatemono isolated SQLite, Sanctum auth, Reverb real-time
- PWA support (`@arkzen:config` pwa block)
- Sitemap + robots.txt auto-generated on build
- Stack switching via `node arkzen.js switch <stack>`
- Export pipeline (`node export.js <tatemono>`)

**Stack-agnostic adapters** — `useArkzenRouter()` / `useArkzenPathname()` resolve to the correct router per stack. Tatemono syntax is identical across all 5 stacks.

---

## v9.5 — Expo Go (Mobile Web-to-Native Bridge)

**Goal:** Add Expo Go as a 6th stack. Same tatemono DSL, same Laravel backend, mobile-first output runnable instantly via the Expo Go app — no build toolchain required.

**Why Expo Go first, not bare React Native:**
- Runs on Termux today — no Android SDK, no Xcode, no emulator needed
- Instant preview via QR code on physical device
- Managed workflow = zero native config
- Battle-tested transition path: Expo Go → Expo bare → bare React Native

### What Changes

| | Web Stacks | Expo Go (v9.5) |
|--|------------|----------------|
| Pages | `.tsx` React components | React Native Screen components |
| Routing | File-based / React Router / TanStack | Expo Router (file-based, same mental model) |
| Styling | Tailwind / CSS | `StyleSheet.create()` + inline styles |
| Navigation | `useArkzenRouter()` adapter | `useArkzenRouter()` adapter → Expo Router |
| Auth storage | Cookies / localStorage | `expo-secure-store` |
| Real-time | Browser WebSocket | React Native compatible WebSocket |
| Backend | Laravel 13 (unchanged) | Laravel 13 (unchanged) |
| DSL syntax | Same | Same |

### New DSL Behavior for `native` Stacks

Tatemono syntax stays identical. The engine detects the active stack and generates accordingly:

- `@arkzen:page:name` → generates a React Native Screen instead of a web page
- `@arkzen:layout:name` → generates a React Native layout with bottom tab / stack nav
- `@arkzen:components:*` → generates React Native components (View, Text, Pressable, FlatList)
- `@arkzen:style` / `@arkzen:style:name` → generates `StyleSheet.create()` objects
- `@arkzen:animation` → Reanimated 2 / Moti instead of GSAP / Framer Motion

### Stack Registration

```bash
node arkzen.js switch expo
```

```json
// arkzen.json
{
  "stacks": {
    "expo": "engine/frontend/expo"
  }
}
```

### Engine Changes

**New:** `engine/frontend/expo/`
- Expo Router file structure (`app/` directory)
- `arkzen/core/adapters/router.ts` → Expo Router adapter
- `arkzen/core/stores/authStore.ts` → `expo-secure-store` token storage
- `arkzen/core/components/` → React Native equivalents (no DOM)

**New builders / adapter updates:**
- `ExpoPageBuilder` — generates Screen files from `@arkzen:page` blocks
- `ExpoLayoutBuilder` — generates Expo Router layouts from `@arkzen:layout` blocks
- `ExpoComponentBuilder` — generates RN components from `@arkzen:components` blocks
- `ExpoStyleBuilder` — converts style blocks to `StyleSheet.create()`
- `ExpoAnimationBuilder` — Reanimated 2 / Moti output

**Unchanged:**
- All backend builders (AuthBuilder, ControllerBuilder, etc.)
- All YAML blocks (`@arkzen:database`, `@arkzen:api`, `@arkzen:routes`, etc.)
- `export.js` pipeline — exports a standalone Expo project

### Start Script for Expo

```bash
node start.js
# → Starts Laravel + queue + Reverb as normal
# → Starts Expo (npx expo start) instead of Next.js/Vite
# → QR code in terminal → scan with Expo Go app
```

### Success Criteria
- [ ] `node arkzen.js switch expo` works
- [ ] `node start.js` spawns Expo alongside Laravel
- [ ] Tatemono with `@arkzen:page` generates valid RN screens
- [ ] `@arkzen:layout` generates working bottom tab navigation
- [ ] Auth flow (login → token → dashboard) works via `expo-secure-store`
- [ ] `arkzenFetch` hits Laravel API correctly from device
- [ ] Real-time (Reverb WebSocket) works on device
- [ ] `node export.js <tatemono>` produces a standalone Expo project
- [ ] Runs on Termux without Android SDK

---

## v10 — React Native (Bare Workflow)

**Goal:** Full bare React Native stack — no Expo managed workflow. Direct Android SDK / Xcode builds. Same tatemono DSL.

**Why after Expo Go:**
- Expo Go covers 90% of use cases instantly
- Bare RN is needed for: custom native modules, Bluetooth, NFC, background services, production app store builds with full control
- v9.5 Expo foundation is reused — bare RN shares most of the same JS layer

### What's Added Over v9.5

| Feature | Expo Go (v9.5) | Bare React Native (v10) |
|---------|---------------|------------------------|
| Native modules | Expo SDK only | Any npm native package |
| Build | Expo Go app (no build) | Android Studio / Xcode |
| App Store | Expo EAS Build | Direct gradle / xcodebuild |
| Bluetooth, NFC | Limited | Full access |
| Background services | Limited | Full access |
| Push notifications | Expo Notifications | Firebase FCM / APNs direct |
| Termux support | ✓ Full | ⚠ Partial (Android build needs SDK) |

### Stack Registration

```bash
node arkzen.js switch native
```

`engine/frontend/react-native/` (already exists as partial foundation from v9).

### Engine Changes

**Reuses from v9.5 Expo:**
- All component, layout, page, style, animation builders (same RN output)
- `arkzenFetch` adapter
- Auth store (`SecureStore` or equivalent)

**New for bare RN:**
- `android/` and `ios/` project structure generation
- `metro.config.js` generation
- Native module linking config
- `react-native.config.js`
- Firebase push notification wiring

### Success Criteria
- [ ] `node arkzen.js switch native` works
- [ ] `node start.js` spawns Metro bundler alongside Laravel
- [ ] Same tatemono generates valid bare RN project
- [ ] `node export.js <tatemono>` produces a bare RN project buildable with Android Studio
- [ ] Auth, API, real-time all work
- [ ] Custom native modules can be added to exported project

---

## v11 — Desktop (Tauri + Electron)

**Goal:** Two desktop stacks — Tauri and Electron. Same tatemono DSL, same Laravel backend, native desktop output for Windows / macOS / Linux.

### Tauri Stack (`tauri`)

**Why Tauri:**
- 10–50MB bundle vs 150–200MB Electron
- Rust backend = significantly better performance and memory
- Webview-based (no bundled Chromium)
- Growing ecosystem, modern choice

```bash
node arkzen.js switch tauri
```

**Architecture:**
```
Tatemono DSL
  → React 18 + Vite (webview renderer)
  → Tauri Rust core (system APIs, window management)
  → Laravel 13 (same API backend)
```

**Engine additions:**
- `engine/frontend/tauri/` — Vite + React renderer inside Tauri shell
- `TauriBuilder` — generates `tauri.conf.json`, Rust command stubs, IPC bindings
- `@arkzen:desktop:command` block (new, optional) — define Tauri Rust commands from tatemono
- `useArkzenRouter()` adapter → Tauri-compatible (hash router or memory router)
- `arkzenFetch` → hits Laravel API (same as web stacks)

**New optional DSL block:**
```tsx
/* @arkzen:desktop:command
name: read_file
input: { path: string }
output: { content: string }
*/
// Rust body injected here
let content = std::fs::read_to_string(&input.path)?;
Ok(content)
/* @arkzen:desktop:command:end */
```

### Electron Stack (`electron`)

**Why Electron:**
- Proven in production (VS Code, Discord, Slack, Figma)
- Massive ecosystem, Node.js main process
- Easier for teams without Rust experience
- Best compatibility across platforms

```bash
node arkzen.js switch electron
```

**Architecture:**
```
Tatemono DSL
  → React 18 + Webpack (renderer process)
  → Electron main process (Node.js, IPC, native APIs)
  → Laravel 13 (same API backend)
```

**Engine additions:**
- `engine/frontend/electron/` — React renderer + Electron main process
- `ElectronBuilder` — generates `main.js`, `preload.js`, IPC channel stubs, `electron-builder.json`
- `@arkzen:desktop:ipc` block (new, optional) — define IPC channels from tatemono
- `useArkzenRouter()` adapter → hash router (Electron renderer)
- `arkzenFetch` → hits Laravel API

**New optional DSL block:**
```tsx
/* @arkzen:desktop:ipc
channel: read-file
direction: invoke
*/
// Node.js body in main process
const { filePath } = args
const content = require('fs').readFileSync(filePath, 'utf-8')
return content
/* @arkzen:desktop:ipc:end */
```

### Tauri vs Electron Comparison

| | Tauri | Electron |
|--|-------|----------|
| Bundle size | 10–50MB | 150–200MB |
| Memory usage | 30–80MB | 100–200MB |
| Backend language | Rust | Node.js |
| Learning curve | Medium (Rust) | Low (Node.js) |
| Performance | Excellent | Good |
| Ecosystem | Growing | Massive |
| Production examples | Growing list | VS Code, Discord, Slack |
| Termux build | ⚠ Needs Rust toolchain | ⚠ Needs Node build tools |
| Recommended for | New projects, performance-critical | Teams with Node expertise |

### Success Criteria (both stacks)
- [ ] `node arkzen.js switch tauri` / `electron` works
- [ ] `node start.js` starts desktop app in dev mode + Laravel
- [ ] Tatemono pages render correctly in desktop window
- [ ] Auth, API, real-time all work (same Laravel backend)
- [ ] `node export.js <tatemono>` produces a buildable desktop project
- [ ] Optional `@arkzen:desktop:*` blocks generate native IPC / command stubs
- [ ] Cross-platform build config generated (Windows + macOS + Linux)

---

## Version Timeline

| Version | New Stacks | Key Focus | Status |
|---------|------------|-----------|--------|
| **v9.0** | nextjs, react-vite, tanstack-start, astro, react-inertia | Multi-stack web | ✓ Complete |
| **v9.5** | expo | Expo Go — mobile via Termux, no SDK | Planned |
| **v10** | native | Bare React Native — full SDK builds | Planned |
| **v11** | tauri, electron | Desktop — Windows / macOS / Linux | Planned |

**All versions:** same tatemono DSL syntax, same Laravel backend, same builder pipeline architecture.

---

## What Never Changes

Across every version — v9.5, v10, v11 — these stay identical:

- `@arkzen:meta`, `@arkzen:database`, `@arkzen:api`, `@arkzen:routes`, `@arkzen:middleware`, `@arkzen:jobs`, `@arkzen:events`, `@arkzen:notifications`, `@arkzen:mail`, `@arkzen:console`, `@arkzen:realtime` — all YAML blocks unchanged
- All 21 backend builders — unchanged
- Laravel 13 backend — unchanged
- Export pipeline — extended per stack, same command
- `arkzen.json` registry — gains new stack entries
- `node arkzen.js switch <stack>` — same CLI

The frontend output format changes per stack. The DSL that drives it does not.