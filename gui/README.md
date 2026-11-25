# Pluffy Studio (gui/)

A GUI skin over the Pluffy CLI. The CLI is still the engine: every card builds a
`node mizumi.js ...` command and types it into a real terminal you can see.

- **Home**: every mizumi.js command as a card or form (live command preview)
- **Terminal dock**: real shell (node-pty + xterm.js), one tab per command, light sakura theme
- **Editor**: real VS Code in the app (`code serve-web`), so .vsix extensions run
- **Extensions**: the bundled `pluff-tatemono` .vsix installs on first run; import any other .vsix
- **Engine**: bundled Pluffy snapshot, unpacked to Documents/Pluffy; one-click update from GitHub
- **Top bar**: VS Code, CMD and Chat buttons

## Design

Built against PLUFF_GUIDELINES Section 2C (Design Rule #3, a named product is the brief) and 2D:
Qoder's structure (collapsible sidebar with New + searchable list + account menu, sparse centre, status bar),
one flat sakura accent (#c93d6e), no gradients, glass, glow, emoji or decorative shadows, one icon set
(Lucide, `node scripts/gen-icons.js` to add icons), Zen Maru Gothic for headings, system UI face for chrome,
mono for commands, one 6px radius. Copy says what each command does. No em dashes.

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

Node.js and npm (mizumi.js runs on them), git. VS Code with the `code` command for the Editor tab,
Extensions and the VS Code button.

## Notes

- Updating the engine keeps your tatemonos, `arkzen.json` and `.mizumi-ai.json`.
- Chat opens in its own window (same exe, `--pluffy-chat`). Embedding it in the main window means
  exporting a `createChat()` from chat/main.js: small refactor, not done yet.
- Without node-pty the app falls back to piped output (no interactive shell).
