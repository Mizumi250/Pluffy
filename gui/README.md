# Pluffy Studio (gui/)

A GUI skin over the Pluffy CLI. The CLI is still the engine: every card builds a
`node mizumi.js ...` command and types it into a real terminal you can see.

- **Home**: every mizumi.js command as a card or form (live command preview)
- **Tatemono workspace**: pick a tatemono in the sidebar and it opens in its own editor
  - Monaco, highlighted with the Pluff Tatemono extension's own TextMate grammar
  - the same problems as `mizumi check` (live), completions, hover docs and folding, all taken from the extension
  - a block timeline (click to jump), an **Add block** dialog that uses the same rules as `mizumi block`
  - tabs for the other files in the folder, Save / Auto-save, a warning before unsaved edits are dropped,
    and live reload when the CLI, an AI or VS Code changes the file on disk
  - Check, Export, Screenshot and OpenAPI for that tatemono; Export pre-selects Godot/Unity/Unreal for game tatemonos
- **Terminal dock**: real shell (node-pty + xterm.js), one tab per command
- **Extensions**: the bundled `pluff-tatemono` .vsix installs into your VS Code; import any other .vsix
- **Engine**: bundled Pluffy snapshot, unpacked to Documents/Pluffy; one-click update from GitHub
- **Top bar**: VS Code, CMD and Chat buttons. Engine work (generators, the CLI itself) belongs in VS Code; this app is for tatemonos.

## The editor and the .vsix

`lib/tatemono.js` reads the newest `vscode-extension/*.vsix` (a zip) and loads the grammar, language configuration,
`scaffold.mjs` (linter, block scanner, block builders) and `snippets.js` (completions) straight out of it, so the app and
VS Code can never disagree. If the engine's `vscode-extension/` sources differ from the packaged .vsix, the sources win and
the Extensions page says so; rebuild the .vsix with `npx @vscode/vsce package` in `vscode-extension/` to sync them.
The editor bundle (Monaco + Shiki) is built into `renderer/dist/` by `npm run build`, which `npm start` runs for you.
Edit `renderer/editor-src.js`, then rebuild.

## Design

Soft and flat. Ink `#212121`, surface `#fbfbfd`, primary `#f99e9e`, secondary `#f3ebe9`. Rounded corners everywhere,
no borders or outlines (depth comes from surface tone and gentle shadows), small quiet buttons, one icon set
(Lucide, `node scripts/gen-icons.js` to add icons), Zen Maru Gothic for headings, system UI face for chrome,
mono for code. Primary buttons carry ink text, not white, because coral on white would not be readable.

## Run it (put this folder in the repo as `gui/`)

    cd gui
    npm install
    npm start

Inside the repo, the app uses the live repo (never overwritten). Set `PLUFFY_ROOT=<path>` to use another.

## Build an installer

    npm run dist            # clones the latest Pluffy from GitHub, bundles it, builds the installer
    npm run bundle:local    # bundle this repo instead (then: npx electron-builder)

Add `build/icon.png` (512x512) for a custom app icon.

## Needs on the user's machine

Node.js and npm (mizumi.js runs on them), git. VS Code with the `code` command for the Extensions page and the
VS Code button (the tatemono editor itself needs no VS Code).

## Notes

- Updating the engine keeps your tatemonos, `arkzen.json` and `.mizumi-ai.json`.
- Chat opens in its own window (same exe, `--pluffy-chat`). Embedding it in the main window means
  exporting a `createChat()` from chat/main.js: small refactor, not done yet.
- Without node-pty the app falls back to piped output (no interactive shell).
