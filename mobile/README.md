# Pluffy Mobile

A remote for Pluffy. The engine (`mizumi.js`) and your tatemonos stay on the laptop. This app starts commands there, streams their output, and edits files, over your network.

## 1. On the laptop

```
node mizumi.js bridge
```

It prints the addresses and a 6 digit PIN. The PIN works once and expires after 10 minutes. Options: `--port=7471`, `--host=0.0.0.0`, `--devices` (list paired phones), `--revoke=<id|all>`.

## 2. Build the app

Needs Node 22.13 or newer.

```
cd mobile
npm install
npx expo install --fix
npx expo start
```

`expo install --fix` swaps the loose versions in package.json for the ones that match your Expo SDK. Open it with Expo Go (the Expo Go version must match SDK 58) or a dev build.

## 3. Connect

Enter the laptop address (for example `192.168.1.20:7471`) and the PIN. The phone and laptop must reach each other: same Wi-Fi, or a private network such as Tailscale. The link is plain HTTP, so do not expose the port to the internet.

## What it does

- Tasks: every command you start, live output with colors, stop, copy, rerun.
- Commands: the same cards as Pluffy Studio. Forms show the exact command that will run.
- Tatemonos: list, check, export, screenshot, OpenAPI docs, and a text editor for files. Saving refuses to overwrite a newer laptop version without asking.
- Laptop: ping, system details, active stacks, push and pull the repo, paired phones, theme.
- Offline: the last menu stays visible, commands that need the laptop are disabled, and the app retries on its own.

## Not in the phone app

Monaco extras (completions, hover, quick fixes), Extensions and .vsix, Engine update, an interactive terminal, and opening VS Code, CMD or Chat. Guided commands that need a real terminal (`block`, `deps`, `publish`, `ai`, `review`, and plain `mizumi`) are marked laptop only.

## Design

Follows the Pluffy design rules: flat surfaces, 8px spacing, 44px touch targets, status shown as icon plus word, coral never the only carrier of meaning, no emoji icons, petals only on the connect and empty screens and off with reduced motion. `npm run contrast` checks the color tokens against WCAG.

To use the Zen Maru Gothic display font, add it with `expo-font` and call `setDisplay('ZenMaruGothic-Bold')` from the theme context. Without it the app uses the system font.
