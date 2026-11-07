# Pluff Tatemono for VS Code

Highlights Tatemono files across every Pluff web, mobile, desktop, and backend target, embeds the appropriate language grammar in DSL bodies, and provides snippets for Tatemono blocks with matching closing markers.

## What is highlighted

- Tatemono DSL tags, section names, backend variants, and Expo/RN import markers have distinct colors.
- Web blocks use TSX highlighting for Next.js, React/Vite, TanStack Start, Astro, and React/Inertia. Astro renders the authored React/TSX as islands, so the source block is TSX rather than an `.astro` template.
- Native blocks use TSX highlighting for Expo and bare React Native; Lynx blocks use TSX with ReactLynx elements.
- Web/native/Lynx style blocks use CSS highlighting.
- YAML metadata and configuration headers use YAML highlighting.
- `:php`, `:ts`, `:py`, `:java`, `:cs`, `:go`, and `:rs` backend bodies use PHP, TypeScript, Python, Java, C#, Go, and Rust grammars respectively.
- Mail templates use HTML highlighting; notification bodies use their backend's language grammar.
- Godot and Unity game DSL blocks embed YAML highlighting throughout the block body, through the closing `*/`. Their opening and matching `:end` markers are highlighted as game DSL tags.
- Completions cover the current Godot project/world/input/assets/scene/behavior/multiplayer/export blocks and Unity runner and scene-mode project/game/visuals/controls/scene/environment/assets/export blocks.
- Parent-chained layouts use their YAML-header form, and Rust module snippets use the required separator-line form.
- Tauri and Electron shells render the selected web stack, so their Tatemono UI uses the same TSX/CSS highlighting as that web target.

The DSL tags intentionally identify a target family (`web`, `native`, or `desktop`), not an individual web framework. The same web block can be consumed by any of the five web generators, so web completions stay framework-neutral; the generators provide their own router and runtime adapters.

The matching language extension must be installed for embedded syntax coloring (for example, Rust Analyzer for Rust, and the Microsoft C# extension for C#). VS Code's built-in grammars are used where available.

## Try it in this repository

1. Open the Pluffy repository in VS Code.
2. Open **Run and Debug** and run **Launch Pluff Tatemono Extension**.
3. In the Extension Development Host window, open a `tatemonos/<name>/core.tsx` file.

Use completion after `/* @arkzen:` to select a DSL block snippet. Block snippets insert the correct block shape, a body placeholder, and the matching closing tag. Completing an already typed opener preserves it and adds the appropriate body/separator/closer. Backend snippets are labeled with their variant and language.

## Install

Package the `vscode-extension` folder as a VS Code extension and install the generated VSIX, or use the development launch configuration above.
