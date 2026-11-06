# Proper Mobile and Desktop Screenshot Plan

## Goal

Capture every active page of the web, mobile, and desktop applications into the root `Shots/` directory automatically, with results that accurately represent each platform rather than substituting a resized web viewport for a native app.

The existing screenshot runner must remain responsible for stale-output cleanup and manifest generation. Each platform implementation should produce its own true platform screenshots and report failures without leaving outdated files.

## Current State

### Web

Web pages currently use Chrome or Chromium through `puppeteer-core`.

This provides:

- Real browser rendering
- Desktop viewport screenshots
- Full-page PNG output
- Basic fake authentication state
- Automatic route capture from `arkzen.json`

Remaining work:

- Wait for network requests and platform-specific loading states
- Verify that screenshots contain real backend data
- Retry route navigation after frontend compilation
- Replace fake authentication with a generated or seeded test account when appropriate
- Capture responsive viewport variants when needed

### Expo Web

Expo currently falls back to capturing an Expo Web server through Chromium.

This captures a browser rendering of the Expo Web app at a mobile-sized viewport. It does not verify or capture the native Expo shell.

### React Native

React Native currently falls back to Android Debug Bridge (`adb`) framebuffer screenshots.

Current limitations:

- Requires an Android emulator or connected device
- Does not automatically open every app route reliably
- Does not perform deep navigation or interactions
- Cannot capture real pages without navigation configuration
- Does not support iOS
- Does not expose DOM selectors or accessible state for navigation verification

### Lynx

Lynx native screenshots are not currently implemented beyond the Android fallback path.

Current limitations:

- No verified Lynx app launch command
- No route registry integration
- No Android or iOS capture implementation
- No navigation automation
- No screenshot readiness checks

### Electron

Electron currently captures the web URL through Chromium rather than Electron's native window.

This misses native-window behavior such as:

- OS title bar and native decoration
- Native menu state
- Electron preload APIs
- Electron-specific IPC behavior
- Native window size and display scaling

### Tauri

Tauri currently falls back to Chromium with the desktop viewport.

This misses native-window behavior such as:

- OS-specific title bar and decorations
- Tauri window configuration
- Native API plugins and platform integration
- Display scaling and native WebView rendering
- Platform-specific screenshot output

## Required Architecture

### 1. Platform-specific driver interface

Replace a single web-oriented capture implementation with explicit platform drivers:

- `WebScreenshotDriver`
- `ExpoWebScreenshotDriver`
- `ReactNativeAndroidScreenshotDriver`
- `ReactNativeIosScreenshotDriver`
- `LynxAndroidScreenshotDriver`
- `LynxIosScreenshotDriver`
- `ElectronScreenshotDriver`
- `TauriScreenshotDriver`

Every driver should implement:

- Platform availability check
- Runtime readiness check
- App launch
- Route or page navigation
- Authentication setup
- Screenshot capture
- Capture verification
- App cleanup or reset
- Structured success and failure reporting

### 2. Route and navigation manifest

Do not infer routes only from module names and page names.

Generate or reuse a platform-neutral manifest containing:

- Module name
- Page name
- Web route
- Expo route
- React Native route or deep link
- Lynx route or deep link
- Electron route behavior
- Tauri route behavior
- Authentication requirement
- Required seed data
- Loading selectors
- Expected page text or element
- Optional interaction steps

The manifest should be generated from `arkzen.json` and the Tatemono page definitions when possible.

### 3. Backend readiness

Before page capture begins:

- Wait for every required backend process to report healthy
- Confirm migrations and application initialization are complete
- Confirm seed data is available when the page requests it
- Verify generated API routes can respond
- Confirm authentication endpoints and test accounts are usable
- Wait for queue or worker-backed content only if that content is included in capture requirements

Screen capture must be blocked rather than allowed to produce false success when a required backend is unavailable.

## Mobile Implementation

### Expo

Add two distinct modes:

#### Expo Web

- Use Chromium for browser rendering
- Preserve separate mobile viewport capture at a specified device profile
- Wait for Expo's app shell and route readiness
- Capture the Expo Router route directly
- Verify route display before saving

#### Expo Native

- Start Expo with an Android emulator or connected device
- Open the application using an Expo deep link
- Capture through the Android emulator or device
- Navigate through Expo Router with a supported deep-link manifest
- Add iOS simulator support on macOS using a simulator launch command and screenshot API
- Capture device frames only when a real frame is explicitly requested

### React Native

Add Android support:

- Build or start the configured React Native app
- Start Metro or the native Gradle build
- Wait for app startup
- Launch through a generated deep link for each page
- Unlock or authenticate the app
- Wait for the page's loading selector or text
- Capture a native screenshot
- Reset navigation before the next page

Add iOS support:

- Start the simulator application
- Install or launch the correct React Native target
- Navigate through deep links
- Capture through `xcrun simctl io booted screenshot`
- Support device scale profiles

### Lynx

Investigate the generated Lynx application launch, route, and emulator conventions first.

Then add:

- Android emulator launch and deep-link navigation
- iOS simulator support where supported
- Lynx page readiness detection
- Native screenshot capture
- Structured route verification

Until route support is verified, native Lynx pages must be reported as unavailable rather than silently capturing the Android home screen or an unrelated app.

## Desktop Implementation

### Electron

Implement Electron-native capture inside the Electron application or a dedicated screenshot mode.

Options to verify:

- Electron's `webContents.capturePage()`
- Electron's `win.webContents.capturePage()`
- Playwright Electron support
- OS-level screenshot capture for native-window decorations

The capture process should:

- Locate the Electron BrowserWindow
- Navigate to the correct web route inside that window
- Wait for app readiness
- Capture the actual BrowserWindow contents
- Optionally capture OS-native window decorations
- Resize windows according to declared desktop profiles
- Close page state safely after each route

Electron IPC should expose only the minimal screenshot control API needed to run automation, gated behind a development or test-only environment.

### Tauri

Add Tauri-native automation through a dedicated development/test interface.

Required verification work:

- Determine whether Playwright or WebDriver can control the configured WebView
- Determine platform availability for Windows WebView2, macOS WebKit, and Linux WebKitGTK
- Define an OS-native window capture fallback
- Add a Tauri development command to navigate and report readiness
- Capture the real WebView or complete native window according to the selected profile

Do not label Chromium viewport captures as Tauri screenshots.

## Authentication

The screenshot runner needs deterministic authentication for protected pages.

Preferred implementation:

- Create a dedicated screenshot test account during controlled test setup
- Use the real login endpoint or app authentication flow
- Store the real platform token or session
- Reset the account between capture runs
- Verify `/auth/me` or the platform equivalent
- Capture protected pages only after authentication succeeds

The fake local-storage, cookie, and `/auth/me` interception currently used by Chromium should be limited to browser tests that cannot use the real authentication flow. It must not be represented as native mobile or desktop authentication.

## Data Stability

Screenshots must represent controlled data.

Add:

- Deterministic seed data reset before capture
- Isolated screenshot database or test schema
- Stable timestamps, user names, account balances, and generated values
- Fixed browser locale, timezone, and viewport device scale
- Stable image dimensions and output paths
- Cleanup of temporary uploaded files and generated documents

Seed mutations from one screenshot run should not leak into later runs.

## Output Structure

Keep stale cleanup destructive only within root `Shots/`, and preserve unrelated project files.

Proposed structure:

```text
Shots/
  shots.json
  web/
    nextjs/
      auth-test/
        dashboard.png
  mobile/
    expo/
      ios/
        auth-test/
          dashboard.png
      android/
        auth-test/
          dashboard.png
    react-native/
      android/
        auth-test/
          dashboard.png
    lynx/
      ...
  desktop/
    electron/
      windows/
        auth-test/
          dashboard.png
    tauri/
      windows/
        auth-test/
          dashboard.png
```

The manifest should include:

- Driver name
- Platform and OS
- Device profile
- Application route
- Source page route
- Backend used
- Capture method
- Image dimensions
- Authentication mode
- Backend readiness result
- Success or failure
- Timestamp
- Retry or navigation error

## Verification Rules

A screenshot is successful only when:

- The target application launched
- The backend and required data were ready
- The requested route was opened
- Authentication requirements passed
- The page stopped loading
- The expected route or page marker appeared
- The platform driver captured the requested image
- The final PNG can be read and is above a minimum size threshold

Capture must report failure for:

- Emulator or device unavailable
- App build failure
- Metro or native server failure
- WebView runtime unavailable
- Deep-link failure
- Authentication failure
- Missing route
- Missing page marker
- Backend timeout
- Image verification failure

Do not record an image as successful merely because Chrome navigated to a URL or `adb screencap` returned bytes.

## Implementation Phases

### Phase 1: Manifest and Route Verification

- Add a screenshot route manifest
- Detect supported and unsupported platform drivers
- Record route, auth, loading, and expected-page metadata
- Stop fake route captures on unsupported native targets

### Phase 2: Real Web and Expo Web Improvements

- Add stable viewport profiles
- Add real backend data verification
- Improve route readiness and page markers
- Add browser failure screenshots with structured errors

### Phase 3: Electron Native Capture

- Add Playwright Electron or `capturePage()` support
- Add native Electron window launch
- Navigate the actual BrowserWindow
- Capture real Electron dimensions and contents

### Phase 4: Tauri Native Capture

- Verify supported automation and WebDriver options
- Add WebView navigation
- Add native WebView or OS-window capture
- Report platform-specific limitations clearly

### Phase 5: Expo and React Native Native Capture

- Add Android deep-link navigation
- Add iOS simulator support
- Add test authentication
- Add native screenshot verification

### Phase 6: Lynx Native Capture

- Identify the correct emulator, build, launch, route, and screenshot interfaces
- Implement Android first if supported
- Implement iOS only after verified tooling exists
- Integrate route metadata and authentication

### Phase 7: CI and Maintenance

- Run captures on dedicated hardware or managed emulators
- Cache native build artifacts
- Detect stale routes and missing page definitions
- Upload failures and screenshots as CI artifacts
- Alert when image dimensions, dimensions, routes, or page markers change unexpectedly

## Acceptance Criteria

The implementation will be complete when:

- Every active web page has a verified browser screenshot
- Every supported Expo page has Expo Web and native capture where tooling exists
- Every supported React Native page has Android and iOS capture where tooling exists
- Every supported Lynx page has platform-specific capture where tooling exists
- Electron screenshots contain the real Electron window or explicitly labeled BrowserWindow contents
- Tauri screenshots contain the real Tauri WebView or explicitly labeled WebView contents
- Protected pages are genuinely authenticated
- Screenshots are backed by ready backend services and stable seeded data
- Stale screenshots are removed
- Unsupported captures fail clearly instead of silently returning misleading images
