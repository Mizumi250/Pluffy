# Pluffy Run Guide

How to run every stack in Pluffy, step by step. Everything here comes from reading `start.js`, `setup.js`, `mizumi.js`, `arkzen.json` and each stack's `package.json` in the repo.

Pluffy has four kinds of targets plus a backend and a database:

| Kind | Stacks |
|---|---|
| Web | nextjs, react-vite, react-inertia, astro, tanstack-start |
| App (mobile) | expo, react-native, lynx |
| Desktop | tauri, electron |
| Game | godot, unity, unreal |
| Backend | laravel, express, fastapi, spring-boot, aspnet, go, rust |
| Database | sqlite, postgresql |

Current defaults in `arkzen.json`: web `react-vite`, app `lynx`, desktop `tauri`, backend `laravel`, database `sqlite`.

---

## 0. Things every stack needs

1. **Node.js and npm.** Install the LTS version from https://nodejs.org. Check with `node -v` and `npm -v`.
2. **Git.** Check with `git --version`.
3. **Clone the repo.**
   ```bash
   git clone https://github.com/Mizumi250/Pluffy
   cd Pluffy
   ```
4. **Install the engine.** Run this once. It checks your tools, then installs the active web stack, app stack, desktop stack and backend.
   ```bash
   node setup.js
   ```
   If a tool is missing, it prints which one and stops. Install it and run again.
5. **Start everything that is configured.**
   ```bash
   node mizumi.js start
   ```
   Or use the interactive menu:
   ```bash
   node mizumi.js
   ```

### Ports used

| Port | What |
|---|---|
| 3000 | Web dev server (all web stacks except react-inertia) |
| 5173 | Web dev server for react-inertia |
| 8000 | Backend (all backends) |
| 8080 | Reverb realtime server (Laravel only) |

### Pick what to start

```bash
node mizumi.js start --only=web          # web only
node mizumi.js start --only=web,app      # web and app
node mizumi.js start --only=app          # app only
node mizumi.js start --skip=desktop      # everything except desktop
```

Desktop shells wrap the web dev server, so starting desktop always starts web too.

### Switch stacks

```bash
node mizumi.js web <stack>        # nextjs, react-vite, react-inertia, astro, tanstack-start
node mizumi.js app <stack>        # expo, react-native, lynx
node mizumi.js desktop <stack>    # tauri, electron
node mizumi.js backend <name>     # laravel, express, fastapi, spring-boot, aspnet, go, rust
node mizumi.js db <sqlite|postgresql>
node mizumi.js stack              # show what is active now
node mizumi.js stacks             # list all stacks
```

### Install or remove one stack's packages

```bash
node mizumi.js deps install <stack>
node mizumi.js deps uninstall <stack>
node mizumi.js deps prune         # delete deps of unused stacks
```

---

## 1. App stacks (mobile)

All three app stacks start a watcher (`npm run dev` inside the stack folder) that syncs the shared core and rebuilds when you save a tatemono. The backend runs on port 8000 beside it.

### 1.1 Expo

**Phone setup (Android)**

1. Open the **Play Store** on your phone.
2. Search for **Expo Go** and install it.
3. Open Expo Go once so it is ready.
4. Make sure your phone and your computer are on the **same Wi-Fi network**.

The Expo version in this repo is SDK 58 (`expo ~58.0.23`). The Expo Go app on your phone must support SDK 58. If Expo Go says the project is incompatible, update Expo Go from the Play Store.

**iPhone:** install **Expo Go** from the App Store instead.

**Computer setup**

```bash
node mizumi.js app expo
node setup.js
node mizumi.js start --only=app
```

**What happens**

- `start.js` runs `npx expo start --clear --lan`.
- It finds your computer's LAN IP and sets `EXPO_PUBLIC_ARKZEN_BACKEND_URL=http://<your-ip>:8000` for the app, so the phone can reach your backend. It skips this if you already set that variable yourself in `engine/frontend/expo/.env`.
- A QR code appears in the terminal.

**On the phone**

1. Open Expo Go.
2. Tap **Scan QR code**.
3. Scan the QR from the terminal.
4. The app loads and reloads when you save.

**Run on an Android emulator instead**

```bash
cd engine/frontend/expo
npm run expo:android
```

Needs Android Studio with an emulator created. See section 5.

**Run on an iOS simulator** (Mac only)

```bash
cd engine/frontend/expo
npm run expo:ios
```

**If the QR scan connects but the app never loads**

- Phone and computer are on different networks, or the router blocks device to device traffic (common on public or school Wi-Fi). Use a phone hotspot with the computer connected to it.
- Windows Firewall is blocking Node. Allow Node.js on private networks.

### 1.2 React Native (bare)

This one has no Expo Go shortcut. It builds a real native app, so it needs the full Android toolchain.

**Computer setup**

1. Install **Android Studio** (https://developer.android.com/studio).
2. In Android Studio, open **SDK Manager** and install the Android SDK and platform tools.
3. Create an emulator in **Device Manager**, or plug in a phone with USB debugging on.
4. Install **JDK 17**.
5. Set `ANDROID_HOME` to your SDK folder and add `platform-tools` to PATH.
6. Check the device is seen:
   ```bash
   adb devices
   ```

**Run it**

```bash
node mizumi.js app react-native
node setup.js
node mizumi.js start --only=app
```

`start.js` only starts Metro (`npx react-native start`) here. Open a **second terminal** and launch the app:

```bash
cd engine/frontend/react-native
npm run android
```

**iOS** (Mac only, needs Xcode and CocoaPods):

```bash
cd engine/frontend/react-native
npm run ios
```

**Backend on an Android emulator or USB phone.** The app defaults to `http://localhost:8000`, and `localhost` on a device is the device itself. Forward the port:

```bash
adb reverse tcp:8000 tcp:8000
```

Run that again each time the device reconnects.

### 1.3 Lynx

**Phone setup**

1. Install the **LynxExplorer** app on your phone. I could not confirm from the repo where it is published. Get it from the official Lynx docs at https://lynxjs.org so you install the right build.
2. Phone and computer on the same Wi-Fi.

**Computer setup**

```bash
node mizumi.js app lynx
node setup.js
node mizumi.js start --only=app
```

**What happens**

- For Lynx, `npm run dev` already starts the Rspeedy dev server (`rspeedy dev`) with the watcher. `start.js` does not start a second bundler, because that would clash on the port.
- A QR code appears in the terminal.

**On the phone**

1. Open LynxExplorer.
2. Scan the QR code from the terminal.

To build without the dev server:

```bash
cd engine/frontend/lynx
npm run build
npm run preview
```

---

## 2. Desktop stacks

Desktop shells wrap the web dev server. Web starts automatically.

### 2.1 Tauri

**Computer setup**

1. Install **Rust** from https://rustup.rs. Check with `rustc --version` and `cargo --version`.
2. **Windows:** install the **Microsoft C++ Build Tools** (Desktop development with C++) and make sure **WebView2** is installed. WebView2 ships with Windows 11 and recent Windows 10.
3. **Linux:** install the WebKitGTK and build packages listed in the Tauri docs (https://tauri.app/start/prerequisites/).
4. **macOS:** install Xcode Command Line Tools: `xcode-select --install`.

**Run it**

```bash
node mizumi.js desktop tauri
node setup.js
node mizumi.js start --only=desktop
```

`start.js` writes a temporary `tauri.runtime.conf.json`, runs `npm run dev -- --config tauri.runtime.conf.json` in `engine/frontend/tauri`, and removes the temp file when Tauri exits. The first run compiles the Rust side and takes several minutes.

**Build an installer**

```bash
cd engine/frontend/tauri
npm run build
```

### 2.2 Electron

**Computer setup:** Node.js only.

```bash
node mizumi.js desktop electron
node setup.js
node mizumi.js start --only=desktop
```

`start.js` runs `npm run dev` (which is `electron .`) in `engine/frontend/electron`.

**Build an installer**

```bash
cd engine/frontend/electron
npm run build
```

---

## 3. Web stacks

For all of them:

```bash
node mizumi.js web <stack>
node setup.js
node mizumi.js start --only=web
```

Then open the URL below.

| Stack | URL | Notes |
|---|---|---|
| nextjs | http://localhost:3000 | Runs `next dev --webpack` |
| react-vite | http://localhost:3000 | Runs `vite --port 3000 --host 0.0.0.0` |
| astro | http://localhost:3000 | Runs `astro dev --port 3000` |
| tanstack-start | http://localhost:3000 | Runs `vite dev --port 3000` |
| react-inertia | http://localhost:5173 | Uses its own Laravel (`laravel-inertia`). Starts Vite in the backend folder plus a builder watcher. Needs PHP and Composer. |

Build for production (inside `engine/frontend/<stack>`):

```bash
npm run build
```

---

## 4. Backends

Only one backend is active at a time. Switch with `node mizumi.js backend <name>`, then install its packages and start.

```bash
node mizumi.js backend <name>
node mizumi.js deps install <name>
node mizumi.js start
```

Each backend copies its `.env.example` to `.env` on first start if no `.env` exists. All of them listen on port 8000.

| Backend | Install first | Install packages | Runs as |
|---|---|---|---|
| laravel | PHP 8.3+, Composer | `node mizumi.js deps install laravel` | `php artisan serve --port=8000`, plus queue worker and Reverb |
| express | Node.js | `node mizumi.js deps install express` | `npx tsx src/server.ts` |
| fastapi | Python 3 | `node mizumi.js deps install fastapi` (creates `.venv`) | `python -m uvicorn pluff.server:app --port 8000` |
| spring-boot | JDK 17+, Maven | `node mizumi.js deps install spring-boot` | `mvn compile`, then `java -cp ... dev.pluff.Server` |
| aspnet | .NET SDK (project targets net10.0) | `node mizumi.js deps install aspnet` | `dotnet run --project Pluff.AspNet.csproj` |
| go | Go (go.mod says 1.27) | `node mizumi.js deps install go` | Go server built from `engine/backend/go` |
| rust | Rust and Cargo | `node mizumi.js deps install rust` | Cargo build and run from `engine/backend/rust` |

Notes from the code:

- **Spring Boot** is marked work in progress. If the entry point class is missing after compiling, `start.js` says so and exits.
- **Rust on Windows:** `start.js` looks for the MSVC linker, and falls back to the GNU toolchain if MinGW GCC is found. If Cargo is not found it stops with an error.
- **Laravel** is the only backend that also starts a queue worker and Reverb (port 8080).
- **FastAPI** also starts a worker (`python -m pluff.worker`) for queue and scheduler.

### Switch the database

```bash
node mizumi.js db sqlite
node mizumi.js db postgresql
```

SQLite gives each tatemono its own file. PostgreSQL gives each tatemono its own database, so you need a running PostgreSQL server and credentials in the backend `.env`.

---

## 5. Android Studio emulator (needed for React Native, optional for Expo)

1. Install Android Studio.
2. Open **More Actions, then Virtual Device Manager**.
3. **Create Device**, pick a Pixel model, pick a recent system image, finish.
4. Press play on the device to boot it.
5. Check from a terminal:
   ```bash
   adb devices
   ```
   You should see an `emulator-xxxx` entry.

---

## 6. Game targets

Games are isolated exports. They do not use the active web, app or backend stacks.

### 6.1 Godot 4

1. Install **Godot 4** from https://godotengine.org.
2. Generate the project:
   ```bash
   node mizumi.js export godot-game godot
   ```
3. The output goes to `projects/godot/godot-game/`.
4. Open `project.godot` in Godot 4 and press play.
5. The included game uses the Forward+ renderer, so it needs a GPU that supports it.
6. For platform builds, install Godot export templates in the editor.

### 6.2 Unity

1. Install **Unity Hub**, then a Unity Editor version through it.
2. Generate a project:
   ```bash
   node mizumi.js export dino-runner unity
   node mizumi.js export unity-scene-starter unity
   ```
3. The output goes to `projects/unity/<name>/`.
4. Add the folder in Unity Hub and open it.
5. Open the configured main scene and press **Play**.
6. Platform builds need the matching Unity platform modules installed.

### 6.3 Unreal Engine

1. Install **Unreal Engine 5** from the Epic Games Launcher, plus the C++ toolchain it asks for (Visual Studio with "Game development with C++" on Windows, Xcode on macOS).
2. Generate a project:
   ```bash
   node mizumi.js export unreal-scene-starter unreal
   node mizumi.js export unreal-physics-playground unreal
   ```
3. The output goes to `projects/unreal/<n>/`.
4. Open the `.uproject` file. Unreal offers to build the C++ module; accept, then press **Play**.
5. To package a build, set `UE_ROOT` to your engine folder and run a script from the project's `Scripts/` folder.
6. Generation does not need Unreal installed. Pluff has not compiled the generated C++ against your engine version, so report any compile error with the file and line it names.

---

## 7. Export a finished tatemono

```bash
node mizumi.js export                                  # wizard
node mizumi.js export <name> <stack>                   # direct
node mizumi.js export <name> <stack> --backend=<name>  # pick the backend
node mizumi.js export <name> <stack> --backend=none    # frontend only
node mizumi.js export <name> <stack> --docker          # add Dockerfile and compose (web stacks only)
node mizumi.js publish <name>                          # push projects/<name> to GitHub
```

Exports land in `projects/`.

---

## 8. Common errors and fixes

| Message | Fix |
|---|---|
| `Engine not set up yet. Run: node setup.js` | Run `node setup.js`. |
| `Web stack packages not installed` | `node mizumi.js deps install <stack>` |
| `App stack packages not installed` | `node setup.js` |
| `Laravel packages missing (vendor/autoload.php)` | `node mizumi.js deps install laravel` |
| `Cargo was not found` | Install Rust from rustup.rs and reopen your terminal. |
| `Unknown platform` | Use only `web`, `app` or `desktop` in `--only` and `--skip`. |
| `--only=app requested but no app stack is set` | `node mizumi.js app expo` (or react-native, lynx). |
| Expo QR opens but the app cannot reach the backend | Same Wi-Fi for both, allow Node through the firewall, check that the backend is on port 8000. |
| React Native app cannot reach the backend | `adb reverse tcp:8000 tcp:8000` |
| Port already in use | Close the old dev server. Lynx especially breaks if two Rspeedy servers start. |
