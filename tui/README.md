# Pluffy TUI

The GUI's menu in your terminal, with falling cherry blossom petals. Like `gui/`, it is only a skin:
every card runs `node mizumi.js ...`, so the CLI stays the engine. No dependencies, works on Termux, SSH and Windows Terminal.

```
node mizumi.js tui            # or: node tui/main.js
node mizumi.js tui --no-petals
node tui/main.js --snapshot=110x34   # print one frame as text
```

## Layout
- **Groups** (left) and **cards** (middle): the same list the GUI shows. It is read straight from `gui/renderer/menu.js`, so a new GUI card shows up here too (a short built-in list is used if `gui/` is missing). Studio-only repo cards are left out.
- **Output** (bottom): commands run as tabs and stream live. `start` keeps running while you browse.
- Cards with a form (✎) ask for their fields first. Guided commands (classic menu, guided block, deps menu, review, publish, AI options) get the real terminal, then return here.

## Keys
`↑↓` select · `←→` or `1-5` group · `⏎` run · `[` `]` switch tab · `x` stop or close tab · `PgUp/PgDn` scroll output · `p` petals · `q` quit

## Layout of this folder
`main.js` screen and keys · `lib/screen.js` cell renderer · `lib/petals.js` animation · `lib/forms.js` input forms · `lib/runner.js` process tabs · `lib/menu.js` card list
