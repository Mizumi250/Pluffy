// ============================================================
// PLUFF UNREAL GENERATOR v1.0 (scene mode)
//
// Turns a tatemono that uses the @arkzen:unreal:* blocks into an Unreal Engine 5 C++
// project under projects/unreal/<name>/. Generate-only: Unreal Editor is needed to open,
// compile, play and package the project (see engine/game/unreal/README.md).
//
// Shared parsing/validation/staging helpers live in ../common/index.js.
// ============================================================

import fs from 'node:fs'
import path from 'node:path'
import {
  assertOutputIsSeparate,
  createAssert,
  createValidators,
  hashHex,
  readNamedYamlBlocks,
  readYamlBlock,
  stageAndReplace,
} from '../common/index.js'
import { validateGameFreeFiles, writeGameFreeFiles } from '../free-files.js'
import {
  buildCs,
  characterHeader,
  characterSource,
  componentsHeader,
  componentsSource,
  editorTargetCs,
  gameModeHeader,
  gameModeSource,
  moduleHeader,
  moduleSource,
  targetCs,
} from './cpp.js'
import {
  CM_PER_METER,
  clean,
  rotationToUnrealQuaternion,
  toUnrealAxis,
  toUnrealPosition,
  toUnrealScale,
} from './transform.js'

const assert = createAssert('Unreal generator')
const {
  validateVector,
  validatePositiveVector,
  validateNumber,
  validateNegativeNumber,
  validateColor,
} = createValidators(assert)

const MESH_TYPES = new Set(['cube', 'sphere', 'cylinder', 'cone', 'plane'])
const NODE_TYPES = new Set(['empty', ...MESH_TYPES, 'camera', 'light'])
const COMPONENT_TYPES = new Set(['physics', 'character_controller', 'rotate', 'camera_follow'])
const NODE_KEYS = new Set([
  'name', 'type', 'position', 'rotation', 'scale', 'color', 'emission',
  'main', 'projection', 'field_of_view', 'orthographic_size',
  'light_type', 'intensity', 'range', 'spot_angle', 'shadows',
  'components', 'children',
])
const COMPONENT_KEYS = new Set([
  'type', 'mass', 'use_gravity', 'speed', 'jump_height', 'gravity', 'camera_relative', 'keys',
  'axis', 'target', 'offset', 'smooth_speed',
])
// Unreal FKey names.
const KEY_NAMES = ['W', 'A', 'S', 'D', 'SpaceBar', 'Up', 'Down', 'Left', 'Right', 'LeftShift', 'Enter']
const DEFAULT_KEYS = { forward: 'W', backward: 'S', left: 'A', right: 'D', jump: 'SpaceBar' }
const EXPORT_TARGETS = {
  windows: { platform: 'Win64', script: 'package-windows.bat', engineHint: 'C:\\Program Files\\Epic Games\\UE_<version>' },
  linux: { platform: 'Linux', script: 'package-linux.sh', engineHint: '/opt/UnrealEngine' },
  macos: { platform: 'Mac', script: 'package-macos.sh', engineHint: '/Users/Shared/Epic Games/UE_<version>' },
}
const CONFIGURATIONS = { development: 'Development', shipping: 'Shipping' }
// Module names that would collide with engine modules.
const RESERVED_MODULE_NAMES = new Set([
  'Engine', 'Core', 'CoreUObject', 'Slate', 'SlateCore', 'Json', 'InputCore', 'Renderer',
  'RenderCore', 'RHI', 'UnrealEd', 'Launch', 'Landscape', 'Projects', 'Networking', 'Sockets',
])
const MAX_DEPTH = 32

function pascal(name) {
  return name.split(/[^a-z0-9]+/i).filter(Boolean).map(part => part[0].toUpperCase() + part.slice(1)).join('')
}

function moduleNameFor(tatemonoName) {
  let moduleName = pascal(tatemonoName)
  if (/^\d/.test(moduleName)) moduleName = `Pluff${moduleName}`
  return moduleName
}

function validateNode(node, context, state, depth = 0, topLevel = true) {
  assert(depth <= MAX_DEPTH, `${context} exceeds the ${MAX_DEPTH}-level hierarchy limit`)
  assert(node && typeof node === 'object' && !Array.isArray(node), `${context} must be a mapping`)
  for (const key of Object.keys(node)) assert(NODE_KEYS.has(key), `${context} has unsupported key "${key}"`)
  assert(typeof node.name === 'string' && node.name.trim(), `${context}.name must be a non-empty string`)
  assert(!state.names.has(node.name), `${context} duplicates object name "${node.name}"`)
  state.names.add(node.name)
  assert(NODE_TYPES.has(node.type), `${context}.type must be one of ${[...NODE_TYPES].join(', ')}`)
  node.position = validateVector(node.position, `${context}.position`, [0, 0, 0])
  node.rotation = validateVector(node.rotation, `${context}.rotation`, [0, 0, 0])
  node.scale = validateVector(node.scale, `${context}.scale`, [1, 1, 1], false)
  validateColor(node.color, `${context}.color`)
  validateColor(node.emission, `${context}.emission`)
  if (node.emission !== undefined) {
    assert(MESH_TYPES.has(node.type), `${context}.emission is only supported by mesh objects (${[...MESH_TYPES].join(', ')})`)
  }

  if (node.type === 'camera') {
    assert(node.main === undefined || typeof node.main === 'boolean', `${context}.main must be true or false`)
    node.projection ??= 'perspective'
    assert(['perspective', 'orthographic'].includes(node.projection), `${context}.projection must be perspective or orthographic`)
    node.field_of_view = validateNumber(node.field_of_view, `${context}.field_of_view`, 60, 5)
    assert(node.field_of_view <= 170, `${context}.field_of_view cannot exceed 170`)
    node.orthographic_size = validateNumber(node.orthographic_size, `${context}.orthographic_size`, 5, 0.01)
  } else {
    for (const key of ['main', 'projection', 'field_of_view', 'orthographic_size']) assert(node[key] === undefined, `${context}.${key} is only supported by camera objects`)
  }

  if (node.type === 'light') {
    node.light_type ??= 'directional'
    assert(['directional', 'point', 'spot'].includes(node.light_type), `${context}.light_type must be directional, point, or spot`)
    node.intensity = validateNumber(node.intensity, `${context}.intensity`, 1)
    node.range = validateNumber(node.range, `${context}.range`, 10, 0.01)
    node.spot_angle = validateNumber(node.spot_angle, `${context}.spot_angle`, 30, 1)
    assert(node.spot_angle <= 160, `${context}.spot_angle cannot exceed 160`)
    node.shadows ??= true
    assert(typeof node.shadows === 'boolean', `${context}.shadows must be true or false`)
  } else {
    for (const key of ['light_type', 'intensity', 'range', 'spot_angle', 'shadows']) assert(node[key] === undefined, `${context}.${key} is only supported by light objects`)
  }

  node.components ??= []
  assert(Array.isArray(node.components), `${context}.components must be a list`)
  const seenComponents = new Set()
  for (const component of node.components) {
    assert(component && typeof component === 'object' && !Array.isArray(component), `${context} component must be a mapping`)
    assert(COMPONENT_TYPES.has(component.type), `${context} has unsupported component "${component.type}" (supported: ${[...COMPONENT_TYPES].join(', ')})`)
    assert(!seenComponents.has(component.type), `${context} declares component "${component.type}" more than once`)
    seenComponents.add(component.type)
    for (const key of Object.keys(component)) assert(COMPONENT_KEYS.has(key), `${context} component "${component.type}" has unsupported key "${key}"`)

    if (component.type === 'physics') {
      assert(MESH_TYPES.has(node.type), `${context} physics requires a mesh object (${[...MESH_TYPES].join(', ')})`)
      assert(topLevel, `${context} physics objects must be top-level (not children)`)
      component.mass = validateNumber(component.mass, `${context}.physics.mass`, 1, 0.001)
      component.use_gravity ??= true
      assert(typeof component.use_gravity === 'boolean', `${context}.physics.use_gravity must be true or false`)
    } else if (component.type === 'character_controller') {
      assert(MESH_TYPES.has(node.type) || node.type === 'empty', `${context} character_controller requires a mesh or empty object`)
      assert(topLevel, `${context} the character_controller object must be top-level (not a child)`)
      assert(!state.hasCharacter, `${context} a scene can only have one character_controller`)
      state.hasCharacter = true
      component.speed = validateNumber(component.speed, `${context}.character_controller.speed`, 5, 0.001)
      component.jump_height = validateNumber(component.jump_height, `${context}.character_controller.jump_height`, 1.5)
      component.gravity = validateNegativeNumber(component.gravity, `${context}.character_controller.gravity`, -20)
      component.camera_relative ??= false
      assert(typeof component.camera_relative === 'boolean', `${context}.character_controller.camera_relative must be true or false`)
      component.keys ??= {}
      assert(component.keys && typeof component.keys === 'object' && !Array.isArray(component.keys), `${context}.character_controller.keys must be a mapping`)
      for (const action of Object.keys(component.keys)) assert(Object.hasOwn(DEFAULT_KEYS, action), `${context}.character_controller.keys has unsupported action "${action}"`)
      for (const action of Object.keys(DEFAULT_KEYS)) {
        component.keys[action] ??= DEFAULT_KEYS[action]
        assert(KEY_NAMES.includes(component.keys[action]), `${context}.character_controller.keys.${action} must be one of ${KEY_NAMES.join(', ')}`)
      }
    } else if (component.type === 'rotate') {
      component.axis = validateVector(component.axis, `${context}.rotate.axis`, [0, 1, 0], false)
      component.speed = validateNumber(component.speed, `${context}.rotate.speed`, 45)
    } else if (component.type === 'camera_follow') {
      assert(node.type === 'camera', `${context} camera_follow requires a camera object`)
      assert(typeof component.target === 'string' && component.target.trim(), `${context}.camera_follow.target must be an object name`)
      component.offset = validateVector(component.offset, `${context}.camera_follow.offset`, [0, 4, -7])
      component.smooth_speed = validateNumber(component.smooth_speed, `${context}.camera_follow.smooth_speed`, 8)
      state.targets.push({ from: context, target: component.target })
    }
  }
  assert(!(seenComponents.has('physics') && seenComponents.has('character_controller')), `${context} cannot combine physics and character_controller`)
  assert(!(seenComponents.has('rotate') && (seenComponents.has('physics') || seenComponents.has('character_controller'))), `${context} rotate cannot be combined with physics or character_controller`)

  if (node.type === 'camera') state.cameras.push(node)

  node.children ??= []
  assert(Array.isArray(node.children), `${context}.children must be a list`)
  for (const child of node.children) validateNode(child, `${context}.${child?.name ?? 'child'}`, state, depth + 1, false)
}

export function parseUnrealTatemono(source, tatemonoPath) {
  const meta = readYamlBlock(source, 'meta', { assert, required: true })
  assert(meta.name === path.basename(path.dirname(tatemonoPath)), `@arkzen:meta name "${meta.name}" must match its Tatemono folder`)
  assert(/^[a-z0-9][a-z0-9-]*$/.test(meta.name), '@arkzen:meta name must use lowercase letters, digits, or hyphens')
  const moduleName = moduleNameFor(meta.name)
  assert(!RESERVED_MODULE_NAMES.has(moduleName), `Tatemono name "${meta.name}" would create an Unreal module called "${moduleName}", which clashes with an engine module; pick another name`)

  const project = readYamlBlock(source, 'unreal:project', { assert, required: true })
  const projectKeys = new Set(['mode', 'unreal_version', 'name', 'main_scene', 'width', 'height', 'default_map'])
  for (const key of Object.keys(project)) assert(projectKeys.has(key), `@arkzen:unreal:project has unsupported key "${key}"`)
  assert(project.mode === undefined || project.mode === 'scene', '@arkzen:unreal:project mode must be "scene" (the only Unreal mode)')
  assert(typeof project.name === 'string' && project.name.trim(), '@arkzen:unreal:project name must be non-empty')
  assert(typeof project.unreal_version === 'string', '@arkzen:unreal:project unreal_version must be a quoted string such as "5.6" (an unquoted 5.10 would be read as 5.1)')
  assert(/^5\.\d+$/.test(project.unreal_version), '@arkzen:unreal:project unreal_version must look like "5.6" (Unreal Engine 5 only)')
  project.width ??= 1280
  project.height ??= 720
  for (const key of ['width', 'height']) assert(Number.isInteger(project[key]) && project[key] > 0, `@arkzen:unreal:project ${key} must be a positive integer`)
  project.default_map ??= '/Engine/Maps/Entry'
  assert(typeof project.default_map === 'string' && /^\/(Game|Engine)\/[A-Za-z0-9_\-/]+(\.[A-Za-z0-9_-]+)?$/.test(project.default_map), '@arkzen:unreal:project default_map must be an Unreal asset path such as /Engine/Maps/Entry or /Game/Maps/Main')

  const scenes = readNamedYamlBlocks(source, 'unreal:scene', { assert })
  assert(scenes.length > 0, 'At least one @arkzen:unreal:scene:<name> block is required')
  const sceneNames = new Set()
  const aspect = project.width / project.height
  for (const scene of scenes) {
    assert(Object.keys(scene).every(key => ['name', 'nodes'].includes(key)), `Scene "${scene.name}" only supports nodes`)
    assert(!sceneNames.has(scene.name), `Duplicate Unreal scene "${scene.name}"`)
    sceneNames.add(scene.name)
    assert(Array.isArray(scene.nodes) && scene.nodes.length > 0, `Scene "${scene.name}" must declare nodes`)
    const state = { names: new Set(), targets: [], cameras: [], hasCharacter: false }
    for (const node of scene.nodes) validateNode(node, `scene ${scene.name} node`, state)
    assert(state.cameras.length > 0, `Scene "${scene.name}" needs a camera`)
    assert(state.cameras.filter(camera => camera.main).length === 1, `Scene "${scene.name}" must have exactly one camera with main: true`)
    for (const { from, target } of state.targets) assert(state.names.has(target), `${from} refers to missing camera-follow target "${target}"`)
  }
  project.main_scene ??= scenes[0].name
  assert(sceneNames.has(project.main_scene), `main_scene "${project.main_scene}" must match a declared scene name`)

  const environment = readYamlBlock(source, 'unreal:environment', { assert }) ?? {}
  const environmentKeys = ['ambient_color', 'ambient_intensity', 'fog_enabled', 'fog_color', 'fog_density']
  for (const key of Object.keys(environment)) assert(environmentKeys.includes(key), `unreal:environment has unsupported key "${key}"`)
  validateColor(environment.ambient_color, 'unreal:environment.ambient_color')
  validateColor(environment.fog_color, 'unreal:environment.fog_color')
  environment.ambient_intensity = validateNumber(environment.ambient_intensity, 'unreal:environment.ambient_intensity', 1)
  environment.fog_enabled ??= false
  assert(typeof environment.fog_enabled === 'boolean', 'unreal:environment.fog_enabled must be true or false')
  environment.fog_density = validateNumber(environment.fog_density, 'unreal:environment.fog_density', 0.02, 0.0001)

  const exportConfig = readYamlBlock(source, 'unreal:export', { assert }) ?? { targets: ['windows'] }
  assert(Object.keys(exportConfig).every(key => ['targets', 'configuration'].includes(key)), '@arkzen:unreal:export only supports targets and configuration')
  assert(Array.isArray(exportConfig.targets) && exportConfig.targets.length > 0, 'unreal:export.targets must list at least one target')
  assert(new Set(exportConfig.targets).size === exportConfig.targets.length, 'unreal:export.targets cannot contain duplicates')
  for (const target of exportConfig.targets) assert(Object.hasOwn(EXPORT_TARGETS, target), `Unsupported Unreal package target "${target}" (supported: ${Object.keys(EXPORT_TARGETS).join(', ')})`)
  exportConfig.configuration ??= 'development'
  assert(Object.hasOwn(CONFIGURATIONS, exportConfig.configuration), `unreal:export.configuration must be one of ${Object.keys(CONFIGURATIONS).join(', ')}`)

  return { meta, project, moduleName, scenes, environment, exportConfig, aspect, mode: 'scene' }
}

// ---- scene JSON (Unreal space) -------------------------------------------------------------

function convertComponent(component) {
  if (component.type === 'physics') {
    return { type: 'physics', mass: component.mass, use_gravity: component.use_gravity }
  }
  if (component.type === 'character_controller') {
    const gravityScale = clean(Math.abs(component.gravity) / 9.81)
    return {
      type: 'character_controller',
      speed_cm: clean(component.speed * CM_PER_METER),
      jump_height_cm: clean(component.jump_height * CM_PER_METER),
      gravity_scale: gravityScale,
      camera_relative: component.camera_relative,
      keys: { ...component.keys },
    }
  }
  if (component.type === 'rotate') {
    return { type: 'rotate', axis: toUnrealAxis(component.axis), degrees_per_second: component.speed }
  }
  return {
    type: 'camera_follow',
    target: component.target,
    offset_cm: toUnrealPosition(component.offset),
    smooth_speed: component.smooth_speed,
  }
}

function convertNode(node, aspect) {
  const out = {
    name: node.name,
    type: node.type,
    location: toUnrealPosition(node.position),
    rotation: rotationToUnrealQuaternion(node.rotation),
    scale: toUnrealScale(node.scale),
  }
  if (node.color !== undefined) out.color = node.color.toLowerCase()
  if (node.emission !== undefined) out.emission = node.emission.toLowerCase()
  if (node.type === 'camera') {
    out.main = node.main === true
    out.projection = node.projection
    if (node.projection === 'orthographic') out.ortho_width = clean(2 * node.orthographic_size * aspect * CM_PER_METER)
    else out.field_of_view = node.field_of_view
  }
  if (node.type === 'light') {
    out.light_type = node.light_type
    out.intensity = node.intensity
    out.shadows = node.shadows
    if (node.light_type !== 'directional') out.range_cm = clean(node.range * CM_PER_METER)
    // Unreal's cone angle is measured from the axis, the DSL value is the full cone.
    if (node.light_type === 'spot') out.spot_angle = clean(node.spot_angle / 2)
  }
  out.components = node.components.map(convertComponent)
  out.children = node.children.map(child => convertNode(child, aspect))
  return out
}

export function buildSceneJson(model, scene) {
  const environment = {}
  const env = model.environment
  if (env.ambient_color !== undefined || env.ambient_intensity !== 1) {
    environment.ambient = { color: (env.ambient_color ?? '#ffffff').toLowerCase(), intensity: env.ambient_intensity }
  }
  if (env.fog_enabled) {
    environment.fog = { density: env.fog_density }
    if (env.fog_color !== undefined) environment.fog.color = env.fog_color.toLowerCase()
  }
  return {
    scene: scene.name,
    environment,
    nodes: scene.nodes.map(node => convertNode(node, model.aspect)),
  }
}

// ---- project files -----------------------------------------------------------------------

function projectGuid(model) {
  const hex = hashHex(`pluff-unreal:${model.meta.name}`).toUpperCase()
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`
}

function uprojectFile(model) {
  return JSON.stringify({
    FileVersion: 3,
    EngineAssociation: model.project.unreal_version,
    Category: '',
    Description: `Generated by Pluff from tatemonos/${model.meta.name}/core.tsx`,
    Modules: [{ Name: model.moduleName, Type: 'Runtime', LoadingPhase: 'Default', AdditionalDependencies: ['Engine'] }],
  }, null, 4) + '\n'
}

function defaultEngineIni(model) {
  return `; Generated by Pluff. Regenerating the project overwrites this file.
[URL]
GameName=${model.moduleName}

[/Script/EngineSettings.GameMapsSettings]
GameDefaultMap=${model.project.default_map}
EditorStartupMap=${model.project.default_map}
GlobalDefaultGameMode=/Script/${model.moduleName}.PluffGameMode
`
}

function defaultGameIni(model) {
  return `; Generated by Pluff. Regenerating the project overwrites this file.
[/Script/EngineSettings.GeneralProjectSettings]
ProjectID=${projectGuid(model)}
ProjectName=${model.project.name}

[/Script/UnrealEd.ProjectPackagingSettings]
+DirectoriesToAlwaysStageAsNonUFS=(Path="PluffScenes")
`
}

function defaultGameUserSettingsIni(model) {
  return `; Generated by Pluff.
[/Script/Engine.GameUserSettings]
ResolutionSizeX=${model.project.width}
ResolutionSizeY=${model.project.height}
LastUserConfirmedResolutionSizeX=${model.project.width}
LastUserConfirmedResolutionSizeY=${model.project.height}
FullscreenMode=2
LastConfirmedFullscreenMode=2
`
}

function packageScript(model, targetName) {
  const target = EXPORT_TARGETS[targetName]
  const configuration = CONFIGURATIONS[model.exportConfig.configuration]
  const uproject = `${model.moduleName}.uproject`
  const archive = `Build/${targetName}`
  if (target.script.endsWith('.bat')) {
    return `@echo off
rem Packages this project with Unreal Automation Tool (${target.platform}, ${configuration}).
rem Set UE_ROOT to your Unreal Engine install first, for example: set UE_ROOT=${target.engineHint}
if "%UE_ROOT%"=="" (
  echo Set UE_ROOT to your Unreal Engine ${model.project.unreal_version} folder first.
  exit /b 1
)
call "%UE_ROOT%\\Engine\\Build\\BatchFiles\\RunUAT.bat" BuildCookRun -project="%~dp0..\\${uproject}" -noP4 -platform=${target.platform} -clientconfig=${configuration} -build -cook -stage -pak -archive -archivedirectory="%~dp0..\\Build\\${targetName}"
`
  }
  return `#!/usr/bin/env sh
# Packages this project with Unreal Automation Tool (${target.platform}, ${configuration}).
# Set UE_ROOT to your Unreal Engine install first, for example: export UE_ROOT="${target.engineHint}"
set -e
if [ -z "$UE_ROOT" ]; then
  echo "Set UE_ROOT to your Unreal Engine ${model.project.unreal_version} folder first." >&2
  exit 1
fi
HERE="$(cd "$(dirname "$0")" && pwd)"
"$UE_ROOT/Engine/Build/BatchFiles/RunUAT.sh" BuildCookRun -project="$HERE/../${uproject}" -noP4 -platform=${target.platform} -clientconfig=${configuration} -build -cook -stage -pak -archive -archivedirectory="$HERE/../${archive}"
`
}

function readmeFile(model) {
  const sceneList = model.scenes.map(scene => `\`${scene.name}\``).join(', ')
  const scripts = model.exportConfig.targets.map(target => `\`Scripts/${EXPORT_TARGETS[target].script}\``).join(', ')
  return `# ${model.project.name}

Generated by Pluff from \`tatemonos/${model.meta.name}/core.tsx\` for Unreal Engine ${model.project.unreal_version}.

## Open it

1. Install Unreal Engine ${model.project.unreal_version} (Epic Games Launcher) and the C++ toolchain it asks for
   (Visual Studio with "Game development with C++" on Windows, Xcode on macOS).
2. Double-click \`${model.moduleName}.uproject\`. Unreal offers to build the C++ module; accept.
3. Press **Play**. The scene is built at startup from \`Content/PluffScenes/${model.project.main_scene}.json\`.

## How it works

Unreal levels and Blueprints are binary files, so Pluff does not generate them. The project starts in
\`${model.project.default_map}\` and a small C++ runtime (\`Source/${model.moduleName}/PluffGameMode.cpp\`)
reads the scene JSON and spawns the meshes, lights, camera, player and fog.

- Scenes: ${sceneList}. Start another one with \`-PluffScene=<name>\` on the command line.
- Coordinates in the tatemono are meters, Y-up. The generator converts them to Unreal's centimeters, Z-up.
- Colors are applied through the engine's \`BasicShapeMaterial\` ("Color" parameter). \`emission\` adds a small point light.
- Gravity, jump height and speed on the player are converted to Unreal character-movement values.

## Package it

${scripts} call Unreal Automation Tool. Set \`UE_ROOT\` to your engine folder first. Output goes to \`Build/<target>/\`.

## Regenerating

\`node mizumi.js export ${model.meta.name} unreal\` rebuilds this folder from the tatemono and replaces it.
Keep hand edits in \`@arkzen:file\` blocks inside the tatemono so they survive regeneration.

## Limits (Phase 1)

No imported models, textures or audio, no UI, animation or multiplayer, no Blueprint output, and no CI workflow.
This project was generated without running Unreal Editor; if the C++ module fails to compile on your engine
version, the error points at a line in \`Source/${model.moduleName}/\`.
`
}

export function writeUnrealProject(model, outputDir) {
  const module = model.moduleName
  const sourceDir = path.join(outputDir, 'Source', module)
  const configDir = path.join(outputDir, 'Config')
  const scenesDir = path.join(outputDir, 'Content', 'PluffScenes')
  const scriptsDir = path.join(outputDir, 'Scripts')
  for (const directory of [sourceDir, configDir, scenesDir, scriptsDir]) fs.mkdirSync(directory, { recursive: true })

  const write = (target, contents, mode) => {
    fs.writeFileSync(target, contents, 'utf8')
    if (mode) fs.chmodSync(target, mode)
  }

  write(path.join(outputDir, `${module}.uproject`), uprojectFile(model))
  write(path.join(configDir, 'DefaultEngine.ini'), defaultEngineIni(model))
  write(path.join(configDir, 'DefaultGame.ini'), defaultGameIni(model))
  write(path.join(configDir, 'DefaultGameUserSettings.ini'), defaultGameUserSettingsIni(model))

  write(path.join(outputDir, 'Source', `${module}.Target.cs`), targetCs(module))
  write(path.join(outputDir, 'Source', `${module}Editor.Target.cs`), editorTargetCs(module))
  write(path.join(sourceDir, `${module}.Build.cs`), buildCs(module))
  write(path.join(sourceDir, `${module}.h`), moduleHeader(module))
  write(path.join(sourceDir, `${module}.cpp`), moduleSource(module))
  write(path.join(sourceDir, 'PluffComponents.h'), componentsHeader(module))
  write(path.join(sourceDir, 'PluffComponents.cpp'), componentsSource(module))
  write(path.join(sourceDir, 'PluffCharacter.h'), characterHeader(module))
  write(path.join(sourceDir, 'PluffCharacter.cpp'), characterSource(module))
  write(path.join(sourceDir, 'PluffGameMode.h'), gameModeHeader(module))
  write(path.join(sourceDir, 'PluffGameMode.cpp'), gameModeSource(module, model.project.main_scene))

  for (const scene of model.scenes) {
    write(path.join(scenesDir, `${scene.name}.json`), JSON.stringify(buildSceneJson(model, scene), null, 2) + '\n')
  }
  for (const target of model.exportConfig.targets) {
    const script = EXPORT_TARGETS[target].script
    write(path.join(scriptsDir, script), packageScript(model, target), script.endsWith('.sh') ? 0o755 : undefined)
  }

  write(path.join(outputDir, '.gitignore'), 'Binaries/\nBuild/\nDerivedDataCache/\nIntermediate/\nSaved/\n.vs/\n.idea/\n*.sln\n*.suo\n*.xcworkspace\n')
  write(path.join(outputDir, 'README.md'), readmeFile(model))
  return { scene: model.project.main_scene, scenes: model.scenes.map(scene => scene.name) }
}

export function generateUnrealProject({ tatemonoPath, outputDir }) {
  const absoluteTatemonoPath = path.resolve(tatemonoPath)
  const absoluteOutputPath = path.resolve(outputDir)
  assert(fs.existsSync(absoluteTatemonoPath) && fs.statSync(absoluteTatemonoPath).isFile(), `Tatemono file does not exist: ${absoluteTatemonoPath}`)
  assert(path.basename(absoluteTatemonoPath) === 'core.tsx', 'Unreal generation expects a Tatemono core.tsx file')
  const tatemonoDir = path.dirname(absoluteTatemonoPath)
  assertOutputIsSeparate(assert, tatemonoDir, absoluteTatemonoPath, absoluteOutputPath, 'Unreal')

  const source = fs.readFileSync(absoluteTatemonoPath, 'utf8')
  const model = parseUnrealTatemono(source, absoluteTatemonoPath)
  validateGameFreeFiles(source, 'Unreal generator')
  const { generated, freeFiles } = stageAndReplace(absoluteOutputPath, stagingDir => {
    const generated = writeUnrealProject(model, stagingDir)
    // @arkzen:file blocks go last so they can add to or replace anything generated above.
    const freeFiles = writeGameFreeFiles(source, stagingDir, 'Unreal generator')
    return { generated, freeFiles }
  })

  return {
    outputDir: absoluteOutputPath,
    scene: generated.scene,
    scenes: generated.scenes,
    moduleName: model.moduleName,
    unrealVersion: model.project.unreal_version,
    freeFiles,
  }
}
