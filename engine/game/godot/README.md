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

The included game uses Godot's Forward+ renderer for an ACES-tonemapped sky
background with a shader sun and rays, animated cloud layers, restrained
volumetric fog and light scattering, bloom, SSAO, and screen-space reflections.
Because the sky is a real Godot sky background rather than a large mesh, it
cannot cover or clip the player. Directional shadows and lighting-aware
character/prop sprites add depth; the camera uses a close third-person follow
distance. These effects need a GPU supported by
Godot's Forward+ renderer. The low-resolution source art remains pixel-art, so
the rendering adds cinematic light and atmosphere rather than changing the art
into photorealistic assets.

The world DSL can configure sky, fog, lighting, and post-processing. The
generated world also adds soft character shadows, wandering animated NPCs,
keyboard dialogue, and a live minimap. Player movement can be camera-relative
so keyboard directions follow the orbiting camera, matching the web game's
controls. Optional player movement fields add a declared jump action with
project-default gravity, configurable jump velocity, and independent
acceleration/deceleration rates. The camera behavior supports bounded mouse
wheel zoom and right-button orbit; `zoom` settings control the distance limits,
zoom step, mouse sensitivity, and pitch bounds.

At export time, every regular file under the Tatemono's `assets/` directory is
copied into the generated project. Loose files are grouped by type
(`images/`, `audio/`, `fonts/`, `models/`, `videos/`, or `data/`); files already
inside one of those folders keep their relative path. DSL asset references are
rewritten to the generated `res://assets/...` paths. Source assets are copied,
not moved, and this Godot-only step does not change web or mobile asset handling.

Open the generated `project.godot` in Godot 4. To build a platform release,
install Godot export templates and any required platform tools. The game target
does not convert or execute the web version of a Tatemono.

An optional `@arkzen:godot:multiplayer` block enables generated ENet Host/Join/
Leave controls and server-simulated co-op player movement. It requires exactly
one player-scene instance in the main scene and disables the Web export preset,
which does not support this ENet setup. This is direct-IP networking, not
matchmaking or a relay; internet hosts may need to allow/forward the configured
UDP port. See the Godot appendix in `PLUFF_GUIDELINES_v14.md` for the DSL shape
and limits.
