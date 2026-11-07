# Unity game generator

Unity is a standalone export target. Unity Tatemono live in
`tatemonos/<name>/core.tsx` and do not depend on Pluffy's active web stack or
backend. The generator supports two modes:

- **Runner mode** — a configurable 2D dinosaur runner:

  ```powershell
  node mizumi.js export dino-runner unity
  ```

- **Scene mode** — Unity-native declarative 2D/3D scene graphs with objects,
  built-in components, environment settings, and platform build targets:

  ```powershell
  node mizumi.js export unity-scene-starter unity
  ```

Generated projects are written to `projects/unity/<name>/`. Scene mode supports
primitive meshes, sprites and imported models, cameras, directional/point/spot
lights, color/emission materials, ambient light and fog, 2D/3D colliders and
rigidbodies, keyboard character controls, camera follow, rotation, and audio
sources. The starter example is `tatemonos/unity-scene-starter/core.tsx`.

Scene nodes are instantiated when the Unity scene starts, so open the configured
main scene and press Play to see the generated hierarchy. The generated editor
build methods cover the targets declared in `@arkzen:unity:export`; required
Unity platform modules must be installed. The included GameCI workflow builds
the first target and requires the `UNITY_LICENSE` repository secret.

The scene DSL is a validated base rather than arbitrary Unity scripting. UI
canvases, custom C# scripts, Animator state machines, post-processing/shader
graphs, and multiplayer are not implemented yet. Multiplayer is the next
separate capability area. See the Unity appendix in
`PLUFF_GUIDELINES_v14.md` for exact blocks, schemas, and validation rules.

Unity Editor is not installed on every development machine. Generator tests
verify files and DSL validation, but importing and building the generated
project still requires Unity Editor or a licensed CI runner.
