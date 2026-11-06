# Godot 4 game generator

Godot is an isolated game export target. Its Tatemono files use `@arkzen:godot:*`
YAML blocks and are parsed by this generator, not the web/native Tatemono parser.
No backend or frontend stack is built, and `arkzen.json`'s active stacks are
left unchanged.

Generate the included game Tatemono with:

```powershell
node mizumi.js export godot-game godot
```

The project is written to `projects/godot/godot-game/`. The command also works
without an explicit stack (`node mizumi.js export godot-game`) and can be
selected in the export wizard. Godot Tatemono are discovered from their
`@arkzen:godot:project` block and do not need to be registered as web modules.

The generator emits `project.godot`, scene files, generated GDScript for the
declared player and camera behaviors, input setup, asset copies, and Godot
export presets. Optional missing textures use simple placeholder visuals;
required missing assets stop generation. Regenerating an existing output
replaces it, matching the web, mobile, and desktop export behavior. Generation
is staged first; if generation fails before replacement, the existing project
remains untouched. Close Godot before regenerating if Windows reports that the
output folder is locked.

At export time, every regular file under the Tatemono's `assets/` directory is
copied into the generated project. Loose files are grouped by type
(`images/`, `audio/`, `fonts/`, `models/`, `videos/`, or `data/`); files already
inside one of those folders keep their relative path. DSL asset references are
rewritten to the generated `res://assets/...` paths. Source assets are copied,
not moved, and this Godot-only step does not change web or mobile asset handling.

Open the generated `project.godot` in Godot 4. To build a platform release,
install Godot export templates and any required platform tools. The game target
does not convert or execute the web version of a Tatemono.
