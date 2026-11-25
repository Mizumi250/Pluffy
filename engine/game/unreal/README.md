# Unreal Engine generator

Turns a tatemono with `@arkzen:unreal:*` blocks into an Unreal Engine 5 C++ project.

```sh
node mizumi.js export unreal-scene-starter unreal      # -> projects/unreal/unreal-scene-starter/
```

Generate-only: Unreal Editor is not needed to generate, but is needed to open, compile, play and package.
The DSL reference is the "APPENDIX - UNREAL ENGINE GAME DSL" in `PLUFF_GUIDELINES_v14.md`.

## Files

| File | Role |
| --- | --- |
| `generator.js` | Parse and validate the blocks, convert scenes to JSON, write the project. |
| `transform.js` | DSL axes (meters, Y-up) to Unreal (centimeters, Z-up) and Euler to quaternion. Pure and unit tested. |
| `cpp.js` | Source templates: `.Target.cs`, `.Build.cs`, game mode, character, components. |
| `*.test.js` | `node --test "engine/game/**/*.test.js"` |

Shared parsing, validation and staging helpers live in `engine/game/common/`.

## Design

Unreal levels and Blueprints are binary, so nothing binary is generated. The project starts in the engine's
empty `/Engine/Maps/Entry`, and `PluffGameMode` reads `Content/PluffScenes/<scene>.json` and spawns everything.
The generator does all unit and axis conversion, so the C++ only reads finished Unreal-space numbers.

## Verify on a machine with Unreal (not yet done)

The C++ is written against the public UE5 API but has not been compiled by Pluff. If something fails, these are the
likeliest spots, in order:

1. `SetFogInscatteringColor` (`UExponentialHeightFogComponent`) and `SetLightColor` on `USkyLightComponent`: names have shifted between UE5 releases.
2. The `Color` parameter of `/Engine/BasicShapes/BasicShapeMaterial`: if shapes render gray, the parameter has a different name.
3. `/Engine/Maps/Entry` as the start map: if it is missing, save an empty map in the editor and set `default_map: /Game/Maps/<name>`.
4. Staging `Content/PluffScenes` (`DirectoriesToAlwaysStageAsNonUFS` in `DefaultGame.ini`) and cooking `/Engine/BasicShapes/*` in packaged builds.
