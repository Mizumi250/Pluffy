# Pluffy Studio (gui/)

A GUI skin over the Pluffy CLI. The CLI is still the engine: every card builds a
`node mizumi.js ...` command and types it into a real terminal you can see.

- **Home**: every mizumi.js command as a card or form (live command preview)
- **Tatemono workspace**: pick a tatemono in the sidebar and it opens in its own editor
  - Monaco, highlighted with the Pluff Tatemono extension's own TextMate grammar
  - the same problems as `mizumi check` (live), completions, hover docs and folding, all taken from the extension
  - go to definition (F12 / Ctrl+click) for layouts, handlers, listeners and endpoints, and quick fixes (lightbulb / Ctrl+.): add the missing closing marker, set `auth: true`, rename a block to the suggested name
  - a Backend picker in the editor footer (the extension's `pluffy.backend`): lint warns about blocks with no body for that backend, and Add block preselects it. Auto = no backend checks, like `mizumi check`
  - a block timeline (click to jump), an **Add block** dialog that uses the same rules as `mizumi block`
  - tabs for the other files in the folder, Save / Auto-save, a warning before unsaved edits are dropped,
    and live reload when the CLI, an AI or VS Code changes the file on disk
  - Check, Export, Screenshot and OpenAPI for that tatemono; Export pre-selects Godot/Unity/Unreal for game tatemonos
- **Terminal dock**: real shell (node-pty + xterm.js), one tab per command
- **Extensions**: the bundled `pluff-tatemono` .vsix installs into your VS Code; import any other .vsix
- **Engine**: bundled Pluffy snapshot, unpacked to Documents/Pluffy; one-click update from GitHub
- **Repo**: Install, Push, Pull and Uninstall cards (the same four commands as `mz.cmd`), on Home and on the Engine page. They always work on `Documents/Pluffy`. Output shows in a text-only terminal tab. Pull asks you to type YES and Uninstall asks you to type DELETE.
- **Window**: the red / yellow / green dots are drawn by the app (frameless window; a Mac keeps its own). A sun / moon button in the top bar switches light and dark.
- **Top bar**: VS Code, CMD and Chat buttons. Engine work (generators, the CLI itself) belongs in VS Code; this app is for tatemonos.

## The editor and the .vsix

`lib/tatemono.js` reads the newest `vscode-extension/*.vsix` (a zip) and loads the grammar, language configuration,
`scaffold.mjs` (linter, block scanner, block builders) and `snippets.js` (completions) straight out of it, so the app and
VS Code can never disagree. If the engine's `vscode-extension/` sources differ from the packaged .vsix, the sources win and
the Extensions page says so; rebuild the .vsix with `npx @vscode/vsce package` in `vscode-extension/` to sync them.
The editor bundle (Monaco + Shiki) is built into `renderer/dist/` by `npm run build`, which `npm start` runs for you.
Edit `renderer/editor-src.js`, then rebuild.

## Design

Soft and flat. Dark mode keeps the same pink: plum surfaces `#2a2025` on `#1e171b`, rose ink `#f3e4e8`, same coral primary. The choice is saved, and with no choice yet the app follows the system. Light palette: ink `#212121`, surface `#fbfbfd`, primary `#f99e9e`, secondary `#f3ebe9`. Rounded corners everywhere,
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

The app icon is the cherry blossom mark: `build/icon.svg` is the source, `build/icon.png` (512x512) and `build/icon.ico` are what the installer, the window and the Start menu use. Reinstall after changing them, Windows caches Start menu icons.

## Needs on the user's machine

Node.js and npm (mizumi.js runs on them), git. VS Code with the `code` command for the Extensions page and the
VS Code button (the tatemono editor itself needs no VS Code).

## Repo commands

`Install repo` runs `git clone` into `Documents/Pluffy`. If that folder already holds the copy this app unpacked (no `.git`),
it is linked to GitHub in place instead: engine files become GitHub's, while `tatemonos/`, `arkzen.json` and `.mizumi-ai.json`
stay as they are. `Push repo` is `git add -A`, commit, push. `Pull repo` is `git fetch` and `git reset --hard origin/<branch>`.
`Uninstall repo` closes the app's terminals and file watcher, then deletes the folder. The code is in `lib/repo.js`.

## Notes

- Updating the engine keeps your tatemonos, `arkzen.json` and `.mizumi-ai.json`.
- Chat opens in its own window (same exe, `--pluffy-chat`). Embedding it in the main window means
  exporting a `createChat()` from chat/main.js: small refactor, not done yet.
- Without node-pty (or if `conpty.node` is missing or built for another Electron) the app falls back to piped output, with the reason printed in the terminal tab. Fix it with `npm run fix-pty` in `gui/`.
