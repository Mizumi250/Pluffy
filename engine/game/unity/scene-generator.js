import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

const ENGINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const requireFromNext = createRequire(path.join(ENGINE_DIR, 'frontend', 'nextjs', 'package.json'))
const { load: parseYaml } = requireFromNext('js-yaml')

const SCENE_TYPES = new Set([
  'empty', 'cube', 'sphere', 'capsule', 'cylinder', 'plane', 'quad',
  'sprite', 'model', 'camera', 'light',
])
const COMPONENT_TYPES = new Set([
  'box_collider', 'sphere_collider', 'capsule_collider', 'rigidbody',
  'character_controller', 'rotate', 'camera_follow', 'audio_source',
  'box_collider_2d', 'circle_collider_2d', 'rigidbody_2d',
  'top_down_controller_2d', 'platform_controller_2d',
])
const EXPORT_TARGETS = {
  windows: { target: 'StandaloneWindows64', extension: '.exe' },
  linux: { target: 'StandaloneLinux64', extension: '.x86_64' },
  macos: { target: 'StandaloneOSX', extension: '.app' },
  webgl: { target: 'WebGL', extension: '' },
}
const ASSET_EXTENSIONS = new Set([
  '.png', '.jpg', '.jpeg', '.tga', '.bmp', '.psd', '.gif', '.tif', '.tiff',
  '.svg', '.wav', '.mp3', '.ogg', '.aiff', '.flac',
  '.fbx', '.obj', '.dae', '.gltf', '.glb', '.blend',
])
const SCRIPT_GUID = '88a93e9b5b9743e7ad6efab895b7d199'

function assert(condition, message) {
  if (!condition) throw new Error(`[Unity scene generator] ${message}`)
}

function yamlBlock(source, marker, required = false) {
  const escaped = marker.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const matches = [...source.matchAll(new RegExp(`^\\s*\\/\\* @arkzen:${escaped}\\r?\\n([\\s\\S]*?)^\\s*\\*\\/\\s*$`, 'gm'))]
  assert(matches.length <= 1, `Duplicate @arkzen:${marker} block`)
  if (required) assert(matches.length === 1, `A @arkzen:${marker} block is required`)
  if (!matches.length) return null
  try {
    const value = parseYaml(matches[0][1])
    assert(value && typeof value === 'object' && !Array.isArray(value), `@arkzen:${marker} must contain a YAML mapping`)
    return value
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('[Unity scene generator]')) throw error
    throw new Error(`[Unity scene generator] Invalid YAML in @arkzen:${marker}: ${error.message}`)
  }
}

function sceneBlocks(source) {
  const lines = source.split(/\r?\n/)
  const scenes = []
  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^\s*\/\* @arkzen:unity:scene:([a-z][a-z0-9_-]*)\s*$/)
    if (!opening) continue
    const [, name] = opening
    let closing = index + 1
    while (closing < lines.length && lines[closing].trim() !== '*/') closing += 1
    assert(closing < lines.length, `@arkzen:unity:scene:${name} is missing its comment terminator`)
    assert(lines[closing + 1]?.trim() === `/* @arkzen:unity:scene:${name}:end */`, `@arkzen:unity:scene:${name} must close with /* @arkzen:unity:scene:${name}:end */`)
    let value
    try {
      value = parseYaml(lines.slice(index + 1, closing).join('\n'))
    } catch (error) {
      throw new Error(`[Unity scene generator] Invalid YAML in @arkzen:unity:scene:${name}: ${error.message}`)
    }
    assert(value && typeof value === 'object' && !Array.isArray(value), `@arkzen:unity:scene:${name} must contain a YAML mapping`)
    scenes.push({ name, ...value })
    index = closing + 1
  }
  return scenes
}

function validateVector(value, label, fallback, allowZero = true) {
  if (value === undefined) return fallback
  assert(Array.isArray(value) && value.length === 3 && value.every(Number.isFinite), `${label} must be a three-number array`)
  if (!allowZero) assert(value.some(number => number !== 0), `${label} cannot be [0, 0, 0]`)
  return value
}

function validatePositiveVector(value, label, fallback) {
  const vector = validateVector(value, label, fallback)
  assert(vector.every(number => number > 0), `${label} values must be positive`)
  return vector
}

function validateVector2(value, label, fallback, allowZero = true) {
  if (value === undefined) return fallback
  assert(Array.isArray(value) && value.length === 2 && value.every(Number.isFinite), `${label} must be a two-number array`)
  if (!allowZero) assert(value.some(number => number !== 0), `${label} cannot be [0, 0]`)
  return value
}

function validatePositiveVector2(value, label, fallback) {
  const vector = validateVector2(value, label, fallback)
  assert(vector.every(number => number > 0), `${label} values must be positive`)
  return vector
}

function validateNumber(value, label, fallback, minimum = 0) {
  if (value === undefined) return fallback
  assert(Number.isFinite(value) && value >= minimum, `${label} must be a number greater than or equal to ${minimum}`)
  return value
}

function validateNegativeNumber(value, label, fallback) {
  if (value === undefined) return fallback
  assert(Number.isFinite(value) && value < 0, `${label} must be a negative number`)
  return value
}

function validateAssetName(value, assets, label, extensions) {
  if (value === undefined) return
  assert(typeof value === 'string' && assets.has(value), `${label} must reference a declared Unity asset`)
  assert(extensions.has(path.extname(assets.get(value)).toLowerCase()), `${label} references an unsupported asset type`)
}

function validateNode(node, context, assets, names, targets, depth = 0) {
  assert(depth <= 32, `${context} exceeds the 32-level hierarchy limit`)
  assert(node && typeof node === 'object' && !Array.isArray(node), `${context} must be a mapping`)
  const allowed = [
    'name', 'type', 'position', 'rotation', 'scale', 'color', 'emission',
    'sprite', 'model', 'main', 'projection', 'field_of_view', 'orthographic_size',
    'light_type', 'intensity', 'range', 'spot_angle', 'shadows', 'components', 'children',
  ]
  for (const key of Object.keys(node)) assert(allowed.includes(key), `${context} has unsupported key "${key}"`)
  assert(typeof node.name === 'string' && node.name.trim(), `${context}.name must be a non-empty string`)
  assert(!names.has(node.name), `${context} duplicates object name "${node.name}"`)
  names.add(node.name)
  assert(SCENE_TYPES.has(node.type), `${context}.type must be one of ${[...SCENE_TYPES].join(', ')}`)
  node.position = validateVector(node.position, `${context}.position`, [0, 0, 0])
  node.rotation = validateVector(node.rotation, `${context}.rotation`, [0, 0, 0])
  node.scale = validateVector(node.scale, `${context}.scale`, [1, 1, 1], false)
  if (node.color !== undefined) assert(typeof node.color === 'string' && /^#[\da-f]{6}$/i.test(node.color), `${context}.color must be #RRGGBB`)
  if (node.emission !== undefined) assert(typeof node.emission === 'string' && /^#[\da-f]{6}$/i.test(node.emission), `${context}.emission must be #RRGGBB`)

  if (node.type === 'sprite') validateAssetName(node.sprite, assets, `${context}.sprite`, new Set(['.png', '.jpg', '.jpeg', '.tga', '.bmp', '.gif', '.tif', '.tiff', '.svg']))
  else assert(node.sprite === undefined, `${context}.sprite is only supported by sprite objects`)
  if (node.type === 'model') validateAssetName(node.model, assets, `${context}.model`, new Set(['.fbx', '.obj', '.dae', '.gltf', '.glb', '.blend']))
  else assert(node.model === undefined, `${context}.model is only supported by model objects`)

  if (node.type === 'camera') {
    assert(node.main === undefined || typeof node.main === 'boolean', `${context}.main must be true or false`)
    node.projection ??= 'perspective'
    assert(['perspective', 'orthographic'].includes(node.projection), `${context}.projection must be perspective or orthographic`)
    node.field_of_view = validateNumber(node.field_of_view, `${context}.field_of_view`, 60, 1)
    assert(node.field_of_view <= 179, `${context}.field_of_view cannot exceed 179`)
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
    assert(node.spot_angle <= 179, `${context}.spot_angle cannot exceed 179`)
    node.shadows ??= true
    assert(typeof node.shadows === 'boolean', `${context}.shadows must be true or false`)
  } else {
    for (const key of ['light_type', 'intensity', 'range', 'spot_angle', 'shadows']) assert(node[key] === undefined, `${context}.${key} is only supported by light objects`)
  }

  node.components ??= []
  assert(Array.isArray(node.components), `${context}.components must be a list`)
  for (const component of node.components) {
    assert(component && typeof component === 'object' && !Array.isArray(component), `${context} component must be a mapping`)
    assert(COMPONENT_TYPES.has(component.type), `${context} has unsupported component "${component.type}"`)
    const componentKeys = new Set([
      'type', 'size', 'center', 'radius', 'height', 'mass', 'use_gravity',
      'is_kinematic', 'speed', 'jump_height', 'gravity', 'keys', 'axis',
      'target', 'offset', 'smooth_speed', 'clip', 'volume', 'loop',
      'play_on_awake', 'body_type', 'gravity_scale', 'jump_velocity', 'camera_relative',
    ])
    for (const key of Object.keys(component)) assert(componentKeys.has(key), `${context} component "${component.type}" has unsupported key "${key}"`)
    if (component.type === 'box_collider') {
      component.size = validatePositiveVector(component.size, `${context}.box_collider.size`, [1, 1, 1])
      component.center = validateVector(component.center, `${context}.box_collider.center`, [0, 0, 0])
    } else if (component.type === 'sphere_collider') {
      component.radius = validateNumber(component.radius, `${context}.sphere_collider.radius`, 0.5, 0.001)
      component.center = validateVector(component.center, `${context}.sphere_collider.center`, [0, 0, 0])
    } else if (component.type === 'capsule_collider') {
      component.radius = validateNumber(component.radius, `${context}.capsule_collider.radius`, 0.5, 0.001)
      component.height = validateNumber(component.height, `${context}.capsule_collider.height`, 2, 0.001)
      component.center = validateVector(component.center, `${context}.capsule_collider.center`, [0, 0, 0])
    } else if (component.type === 'rigidbody') {
      component.mass = validateNumber(component.mass, `${context}.rigidbody.mass`, 1, 0.001)
      component.use_gravity ??= true
      component.is_kinematic ??= false
      assert(typeof component.use_gravity === 'boolean' && typeof component.is_kinematic === 'boolean', `${context}.rigidbody flags must be booleans`)
    } else if (component.type === 'character_controller') {
      component.speed = validateNumber(component.speed, `${context}.character_controller.speed`, 5, 0.001)
      component.jump_height = validateNumber(component.jump_height, `${context}.character_controller.jump_height`, 1.5)
      component.gravity = validateNegativeNumber(component.gravity, `${context}.character_controller.gravity`, -20)
      component.camera_relative ??= false
      assert(typeof component.camera_relative === 'boolean', `${context}.character_controller.camera_relative must be true or false`)
      component.keys ??= { forward: 'W', backward: 'S', left: 'A', right: 'D', jump: 'Space' }
      assert(component.keys && typeof component.keys === 'object' && !Array.isArray(component.keys), `${context}.character_controller.keys must be a mapping`)
      for (const action of ['forward', 'backward', 'left', 'right', 'jump']) {
        component[action] = component.keys[action] ?? { forward: 'W', backward: 'S', left: 'A', right: 'D', jump: 'Space' }[action]
        assert(['W', 'A', 'S', 'D', 'Space', 'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow', 'LeftShift', 'Return'].includes(component[action]), `${context}.character_controller.keys.${action} is not a supported Unity key`)
      }
    } else if (component.type === 'rotate') {
      component.axis = validateVector(component.axis, `${context}.rotate.axis`, [0, 1, 0], false)
      component.speed = validateNumber(component.speed, `${context}.rotate.speed`, 45)
    } else if (component.type === 'camera_follow') {
      assert(typeof component.target === 'string' && component.target.trim(), `${context}.camera_follow.target must be an object name`)
      component.offset = validateVector(component.offset, `${context}.camera_follow.offset`, [0, 4, -7])
      component.smooth_speed = validateNumber(component.smooth_speed, `${context}.camera_follow.smooth_speed`, 8)
      targets.push({ from: context, target: component.target })
    } else if (component.type === 'audio_source') {
      assert(typeof component.clip === 'string', `${context}.audio_source.clip is required`)
      validateAssetName(component.clip, assets, `${context}.audio_source.clip`, new Set(['.wav', '.mp3', '.ogg', '.aiff', '.flac']))
      component.volume = validateNumber(component.volume, `${context}.audio_source.volume`, 1)
      assert(component.volume <= 1, `${context}.audio_source.volume cannot exceed 1`)
      component.loop ??= false
      component.play_on_awake ??= false
      assert(typeof component.loop === 'boolean' && typeof component.play_on_awake === 'boolean', `${context}.audio_source flags must be booleans`)
    } else if (component.type === 'box_collider_2d') {
      component.size = validatePositiveVector2(component.size, `${context}.box_collider_2d.size`, [1, 1])
      component.offset = validateVector2(component.offset, `${context}.box_collider_2d.offset`, [0, 0])
    } else if (component.type === 'circle_collider_2d') {
      component.radius = validateNumber(component.radius, `${context}.circle_collider_2d.radius`, 0.5, 0.001)
      component.offset = validateVector2(component.offset, `${context}.circle_collider_2d.offset`, [0, 0])
    } else if (component.type === 'rigidbody_2d') {
      component.body_type ??= 'dynamic'
      assert(['dynamic', 'kinematic', 'static'].includes(component.body_type), `${context}.rigidbody_2d.body_type must be dynamic, kinematic, or static`)
      component.gravity_scale = validateNumber(component.gravity_scale, `${context}.rigidbody_2d.gravity_scale`, 1)
    } else if (component.type === 'top_down_controller_2d') {
      component.speed = validateNumber(component.speed, `${context}.top_down_controller_2d.speed`, 5, 0.001)
      component.keys ??= { up: 'W', down: 'S', left: 'A', right: 'D' }
      assert(component.keys && typeof component.keys === 'object' && !Array.isArray(component.keys), `${context}.top_down_controller_2d.keys must be a mapping`)
      for (const action of ['up', 'down', 'left', 'right']) {
        component[action] = component.keys[action] ?? { up: 'W', down: 'S', left: 'A', right: 'D' }[action]
        assert(['W', 'A', 'S', 'D', 'UpArrow', 'DownArrow', 'LeftArrow', 'RightArrow'].includes(component[action]), `${context}.top_down_controller_2d.keys.${action} is not a supported Unity key`)
      }
    } else if (component.type === 'platform_controller_2d') {
      component.speed = validateNumber(component.speed, `${context}.platform_controller_2d.speed`, 5, 0.001)
      component.jump_velocity = validateNumber(component.jump_velocity, `${context}.platform_controller_2d.jump_velocity`, 8, 0.001)
      component.keys ??= { left: 'A', right: 'D', jump: 'Space' }
      assert(component.keys && typeof component.keys === 'object' && !Array.isArray(component.keys), `${context}.platform_controller_2d.keys must be a mapping`)
      for (const action of ['left', 'right', 'jump']) {
        component[action] = component.keys[action] ?? { left: 'A', right: 'D', jump: 'Space' }[action]
        assert(['A', 'D', 'Space', 'UpArrow', 'LeftArrow', 'RightArrow', 'W'].includes(component[action]), `${context}.platform_controller_2d.keys.${action} is not a supported Unity key`)
      }
    }
  }

  for (const component of node.components) {
    if (['top_down_controller_2d', 'platform_controller_2d'].includes(component.type)) {
      assert(node.type === 'sprite', `${context} ${component.type} requires a sprite object`)
      assert(node.components.some(item => item.type === 'rigidbody_2d'), `${context} ${component.type} requires a rigidbody_2d component`)
      assert(node.components.some(item => item.type === 'box_collider_2d' || item.type === 'circle_collider_2d'), `${context} ${component.type} requires a 2D collider`)
      const body = node.components.find(item => item.type === 'rigidbody_2d')
      if (component.type === 'top_down_controller_2d') {
        assert(body.body_type === 'kinematic' || body.gravity_scale === 0, `${context} top_down_controller_2d requires a kinematic body or gravity_scale: 0`)
      } else {
        assert(body.body_type === 'dynamic', `${context} platform_controller_2d requires a dynamic rigidbody_2d`)
      }
    }
    if (['box_collider_2d', 'circle_collider_2d', 'rigidbody_2d'].includes(component.type)) {
      assert(node.type === 'sprite' || node.type === 'empty', `${context} ${component.type} requires a sprite or empty object`)
    }
  }
  node.children ??= []
  assert(Array.isArray(node.children), `${context}.children must be a list`)
  for (const child of node.children) validateNode(child, `${context}.${child?.name ?? 'child'}`, assets, names, targets, depth + 1)
}

function parseSceneTatemono(source, tatemonoPath) {
  const meta = yamlBlock(source, 'meta', true)
  assert(meta.name === path.basename(path.dirname(tatemonoPath)), `@arkzen:meta name "${meta.name}" must match its Tatemono folder`)
  assert(/^[a-z0-9][a-z0-9-]*$/.test(meta.name), '@arkzen:meta name must use lowercase letters, digits, or hyphens')
  const project = yamlBlock(source, 'unity:project', true)
  const projectKeys = new Set(['mode', 'unity_version', 'name', 'main_scene', 'width', 'height'])
  for (const key of Object.keys(project)) assert(projectKeys.has(key), `@arkzen:unity:project has unsupported key "${key}"`)
  assert(project.mode === 'scene', 'General Unity scene projects must set mode: scene in @arkzen:unity:project')
  assert(typeof project.name === 'string' && project.name.trim(), '@arkzen:unity:project name must be non-empty')
  assert(typeof project.unity_version === 'string' && /^\d+\.\d+\.\d+[abfp]\d+$/.test(project.unity_version), 'unity_version must be an explicit Unity Editor version')
  project.width ??= 1280
  project.height ??= 720
  for (const key of ['width', 'height']) assert(Number.isInteger(project[key]) && project[key] > 0, `${key} must be a positive integer`)
  const safeMainScene = typeof project.main_scene === 'string' && /^Assets\/Scenes\/[a-zA-Z0-9_-]+\.unity$/.test(project.main_scene)
  assert(safeMainScene, 'main_scene must be a relative Assets/Scenes/*.unity path')

  const assetsConfig = yamlBlock(source, 'unity:assets')
  const assets = new Map()
  for (const [name, entry] of Object.entries(assetsConfig ?? {})) {
    assert(/^[a-z][a-z0-9_-]*$/.test(name), `Invalid Unity asset name "${name}"`)
    const assetSource = typeof entry === 'string' ? entry : entry?.source
    assert(typeof assetSource === 'string', `Unity asset "${name}" must have a source path`)
    const normalized = assetSource.replace(/\\/g, '/')
    assert(normalized.startsWith('assets/') && !normalized.split('/').includes('..'), `Unity asset "${name}" must stay under assets/`)
    assert(ASSET_EXTENSIONS.has(path.posix.extname(normalized).toLowerCase()), `Unity asset "${name}" has an unsupported file extension`)
    assets.set(name, normalized)
  }

  const targets = []
  const scenes = sceneBlocks(source)
  assert(scenes.length > 0, 'At least one @arkzen:unity:scene:<name> block is required')
  const scenePaths = new Set()
  for (const scene of scenes) {
    assert(Object.keys(scene).every(key => ['name', 'path', 'nodes'].includes(key)), `Scene "${scene.name}" only supports path and nodes`)
    assert(/^[a-z][a-z0-9_-]*$/.test(scene.name), `Invalid Unity scene name "${scene.name}"`)
    scene.path ??= `Assets/Scenes/${scene.name[0].toUpperCase()}${scene.name.slice(1)}.unity`
    assert(/^Assets\/Scenes\/[a-zA-Z0-9_-]+\.unity$/.test(scene.path), `Scene "${scene.name}" path must be a safe Assets/Scenes/*.unity path`)
    assert(!scenePaths.has(scene.path), `Duplicate Unity scene path "${scene.path}"`)
    scenePaths.add(scene.path)
    assert(Array.isArray(scene.nodes) && scene.nodes.length > 0, `Scene "${scene.name}" must declare nodes`)
    const names = new Set()
    const sceneTargets = []
    for (const node of scene.nodes) validateNode(node, `scene ${scene.name} node`, assets, names, sceneTargets)
    const cameras = []
    const collectCameras = nodes => {
      for (const node of nodes) {
        if (node.type === 'camera') cameras.push(node)
        collectCameras(node.children ?? [])
      }
    }
    collectCameras(scene.nodes)
    assert(cameras.length > 0, `Scene "${scene.name}" needs a camera`)
    assert(cameras.filter(camera => camera.main).length === 1, `Scene "${scene.name}" must have exactly one camera with main: true`)
    for (const { from, target } of sceneTargets) {
      assert(names.has(target), `${from} refers to missing camera-follow target "${target}"`)
    }
    targets.push(...sceneTargets)
  }
  assert(scenePaths.has(project.main_scene), `main_scene "${project.main_scene}" must match a declared scene path`)

  const environment = yamlBlock(source, 'unity:environment') ?? {}
  const environmentKeys = ['ambient_color', 'ambient_intensity', 'fog_enabled', 'fog_color', 'fog_density']
  for (const key of Object.keys(environment)) assert(environmentKeys.includes(key), `unity:environment has unsupported key "${key}"`)
  for (const key of ['ambient_color', 'fog_color']) {
    if (environment[key] !== undefined) assert(typeof environment[key] === 'string' && /^#[\da-f]{6}$/i.test(environment[key]), `unity:environment.${key} must be #RRGGBB`)
  }
  environment.ambient_intensity = validateNumber(environment.ambient_intensity, 'unity:environment.ambient_intensity', 1)
  environment.fog_enabled ??= false
  assert(typeof environment.fog_enabled === 'boolean', 'unity:environment.fog_enabled must be true or false')
  environment.fog_density = validateNumber(environment.fog_density, 'unity:environment.fog_density', 0.01, 0.0001)

  const exportConfig = yamlBlock(source, 'unity:export') ?? { targets: ['windows'] }
  assert(Object.keys(exportConfig).every(key => key === 'targets'), '@arkzen:unity:export only supports targets')
  assert(Array.isArray(exportConfig.targets) && exportConfig.targets.length > 0, 'unity:export.targets must list at least one target')
  assert(new Set(exportConfig.targets).size === exportConfig.targets.length, 'unity:export.targets cannot contain duplicates')
  for (const target of exportConfig.targets) assert(Object.hasOwn(EXPORT_TARGETS, target), `Unsupported Unity build target "${target}"`)

  const mainScene = scenes.find(scene => scene.path === project.main_scene)
  return { meta, project, assets, scenes, environment, exportConfig, mainScene, mode: 'scene' }
}

function hashGuid(value) {
  return crypto.createHash('md5').update(value).digest('hex')
}

function unitySceneFile() {
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1 &1000
GameObject:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  serializedVersion: 6
  m_Component:
  - component: {fileID: 1001}
  - component: {fileID: 1002}
  m_Layer: 0
  m_Name: Pluff Scene Bootstrap
  m_TagString: Untagged
  m_IsActive: 1
--- !u!4 &1001
Transform:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  serializedVersion: 2
  m_LocalPosition: {x: 0, y: 0, z: 0}
  m_LocalRotation: {x: 0, y: 0, z: 0, w: 1}
  m_LocalScale: {x: 1, y: 1, z: 1}
  m_Children: []
  m_Father: {fileID: 0}
--- !u!114 &1002
MonoBehaviour:
  m_ObjectHideFlags: 0
  m_CorrespondingSourceObject: {fileID: 0}
  m_PrefabInstance: {fileID: 0}
  m_PrefabAsset: {fileID: 0}
  m_GameObject: {fileID: 1000}
  m_Enabled: 1
  m_EditorHideFlags: 0
  m_Script: {fileID: 11500000, guid: ${SCRIPT_GUID}, type: 3}
  m_Name:
  m_EditorClassIdentifier:
  sceneKey: main
`
}

function sceneMeta(guid) {
  return `fileFormatVersion: 2\nguid: ${guid}\nDefaultImporter:\n  externalObjects: {}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`
}

function scriptMeta(guid) {
  return `fileFormatVersion: 2\nguid: ${guid}\nMonoImporter:\n  externalObjects: {}\n  serializedVersion: 2\n  defaultReferences: []\n  executionOrder: 0\n  icon: {instanceID: 0}\n  userData:\n  assetBundleName:\n  assetBundleVariant:\n`
}

function resolveSceneAsset(tatemonoDir, source, name) {
  const assetsRoot = path.join(tatemonoDir, 'assets')
  assert(fs.existsSync(assetsRoot) && fs.lstatSync(assetsRoot).isDirectory() && !fs.lstatSync(assetsRoot).isSymbolicLink(), 'Tatemono assets/ must be a regular directory')
  const relative = source.slice('assets/'.length)
  const segments = relative.split('/')
  let current = assetsRoot
  for (let index = 0; index < segments.length; index += 1) {
    current = path.join(current, segments[index])
    assert(fs.existsSync(current), `Required Unity asset "${name}" does not exist: ${source}`)
    const stat = fs.lstatSync(current)
    assert(!stat.isSymbolicLink(), `Unity asset "${name}" cannot use symbolic links: ${source}`)
    if (index < segments.length - 1) assert(stat.isDirectory(), `Invalid Unity asset directory in "${source}"`)
    else assert(stat.isFile(), `Required Unity asset "${name}" must be a regular file: ${source}`)
  }
  return current
}

function runtimeScript() {
  return `using System;
using System.Collections.Generic;
using UnityEngine;

[Serializable] public sealed class PluffSceneData { public int width, height; public PluffNodeData[] nodes; public PluffEnvironmentData environment; }
[Serializable] public sealed class PluffEnvironmentData { public string ambient_color; public float ambient_intensity; public bool fog_enabled; public string fog_color; public float fog_density; }
[Serializable] public sealed class PluffNodeData
{
    public string name, type, color, emission, sprite, model, projection, light_type;
    public float[] position, rotation, scale;
    public bool main, shadows;
    public float field_of_view, orthographic_size, intensity, range, spot_angle;
    public PluffComponentData[] components;
    public PluffNodeData[] children;
}
[Serializable] public sealed class PluffComponentData
{
    public string type, target, clip, body_type;
    public float[] size, center, axis, offset;
    public float radius, height, mass, speed, jump_height, gravity, smooth_speed, volume, gravity_scale, jump_velocity;
    public bool use_gravity, is_kinematic, loop, play_on_awake, camera_relative;
    public string forward, backward, left, right, up, down, jump;
}

public sealed class PluffSceneBootstrap : MonoBehaviour
{
    public string sceneKey = "main";
    readonly Dictionary<string, Transform> objects = new Dictionary<string, Transform>();
    readonly List<PluffCameraFollow> followers = new List<PluffCameraFollow>();

    void Start()
    {
        TextAsset json = Resources.Load<TextAsset>("pluff_scenes/" + sceneKey);
        if (json == null) { Debug.LogError("Missing Unity scene DSL data: " + sceneKey); return; }
        PluffSceneData scene = JsonUtility.FromJson<PluffSceneData>(json.text);
        Screen.SetResolution(scene.width, scene.height, false);
        Application.targetFrameRate = 60;
        ApplyEnvironment(scene.environment);
        foreach (PluffNodeData node in scene.nodes) BuildNode(node, transform);
        foreach (PluffCameraFollow follow in followers)
        {
            if (!objects.TryGetValue(follow.targetName, out Transform target))
                Debug.LogError("Camera follow target not found: " + follow.targetName);
            else follow.target = target;
        }
    }

    void ApplyEnvironment(PluffEnvironmentData environment)
    {
        if (environment == null) return;
        if (ColorUtility.TryParseHtmlString(environment.ambient_color ?? "#808080", out Color ambient))
            RenderSettings.ambientMode = UnityEngine.Rendering.AmbientMode.Flat;
        RenderSettings.ambientLight = ambient;
        RenderSettings.ambientIntensity = environment.ambient_intensity;
        RenderSettings.fog = environment.fog_enabled;
        if (ColorUtility.TryParseHtmlString(environment.fog_color ?? "#808080", out Color fog)) RenderSettings.fogColor = fog;
        RenderSettings.fogMode = FogMode.Exponential;
        RenderSettings.fogDensity = environment.fog_density;
    }

    void BuildNode(PluffNodeData data, Transform parent)
    {
        GameObject gameObject = CreateObject(data);
        bool declaredCollider = data.components != null && Array.Exists(data.components, item =>
            item.type == "box_collider" || item.type == "sphere_collider" || item.type == "capsule_collider");
        Collider primitiveCollider = gameObject.GetComponent<Collider>();
        if (primitiveCollider != null && (!declaredCollider || !ColliderMatches(primitiveCollider, data.components)))
            Destroy(primitiveCollider);
        gameObject.name = data.name;
        Transform item = gameObject.transform;
        item.SetParent(parent, false);
        item.localPosition = Vector3From(data.position, Vector3.zero);
        item.localEulerAngles = Vector3From(data.rotation, Vector3.zero);
        item.localScale = Vector3From(data.scale, Vector3.one);
        objects[data.name] = item;

        Renderer renderer = gameObject.GetComponent<Renderer>();
        if (renderer != null && !(renderer is SpriteRenderer))
        {
            Material material = new Material(Shader.Find("Standard"));
            if (ColorUtility.TryParseHtmlString(data.color ?? "#FFFFFF", out Color color)) material.color = color;
            if (!String.IsNullOrEmpty(data.emission))
            {
                if (ColorUtility.TryParseHtmlString(data.emission, out Color emission))
                {
                    material.EnableKeyword("_EMISSION");
                    material.SetColor("_EmissionColor", emission);
                }
            }
            renderer.material = material;
        }
        ApplyComponents(gameObject, data.components);
        if (data.children != null) foreach (PluffNodeData child in data.children) BuildNode(child, item);
    }

    static bool ColliderMatches(Collider collider, PluffComponentData[] components)
    {
        if (components == null) return false;
        foreach (PluffComponentData item in components)
        {
            if (item.type == "box_collider" && collider is BoxCollider) return true;
            if (item.type == "sphere_collider" && collider is SphereCollider) return true;
            if (item.type == "capsule_collider" && collider is CapsuleCollider) return true;
        }
        return false;
    }

    GameObject CreateObject(PluffNodeData data)
    {
        switch (data.type)
        {
            case "cube": return GameObject.CreatePrimitive(PrimitiveType.Cube);
            case "sphere": return GameObject.CreatePrimitive(PrimitiveType.Sphere);
            case "capsule": return GameObject.CreatePrimitive(PrimitiveType.Capsule);
            case "cylinder": return GameObject.CreatePrimitive(PrimitiveType.Cylinder);
            case "plane": return GameObject.CreatePrimitive(PrimitiveType.Plane);
            case "quad": return GameObject.CreatePrimitive(PrimitiveType.Quad);
            case "sprite":
            {
                GameObject item = new GameObject(data.name);
                SpriteRenderer sprite = item.AddComponent<SpriteRenderer>();
                sprite.sprite = Resources.Load<Sprite>(data.sprite);
                if (sprite.sprite == null) Debug.LogError("Missing or unsupported sprite asset: " + data.sprite);
                if (ColorUtility.TryParseHtmlString(data.color ?? "#FFFFFF", out Color tint)) sprite.color = tint;
                return item;
            }
            case "model":
            {
                GameObject prefab = Resources.Load<GameObject>(data.model);
                if (prefab == null) { Debug.LogError("Missing or unsupported model asset: " + data.model); return new GameObject(data.name); }
                return Instantiate(prefab);
            }
            case "camera":
            {
                GameObject item = new GameObject(data.name);
                Camera camera = item.AddComponent<Camera>();
                camera.orthographic = data.projection == "orthographic";
                camera.fieldOfView = data.field_of_view;
                camera.orthographicSize = data.orthographic_size;
                if (ColorUtility.TryParseHtmlString(data.color ?? "#87CEEB", out Color background)) camera.backgroundColor = background;
                camera.clearFlags = CameraClearFlags.SolidColor;
                if (data.main) item.tag = "MainCamera";
                return item;
            }
            case "light":
            {
                GameObject item = new GameObject(data.name);
                Light light = item.AddComponent<Light>();
                light.type = data.light_type == "point" ? LightType.Point : data.light_type == "spot" ? LightType.Spot : LightType.Directional;
                light.intensity = data.intensity;
                light.range = data.range;
                light.spotAngle = data.spot_angle;
                light.shadows = data.shadows ? LightShadows.Soft : LightShadows.None;
                if (ColorUtility.TryParseHtmlString(data.color ?? "#FFFFFF", out Color tint)) light.color = tint;
                return item;
            }
            default: return new GameObject(data.name);
        }
    }

    void ApplyComponents(GameObject gameObject, PluffComponentData[] components)
    {
        if (components == null) return;
        foreach (PluffComponentData data in components)
        {
            switch (data.type)
            {
                case "box_collider":
                {
                    BoxCollider collider = gameObject.GetComponent<BoxCollider>() ?? gameObject.AddComponent<BoxCollider>();
                    collider.size = Vector3From(data.size, Vector3.one);
                    collider.center = Vector3From(data.center, Vector3.zero);
                    break;
                }
                case "sphere_collider":
                {
                    SphereCollider collider = gameObject.GetComponent<SphereCollider>() ?? gameObject.AddComponent<SphereCollider>();
                    collider.radius = data.radius;
                    collider.center = Vector3From(data.center, Vector3.zero);
                    break;
                }
                case "capsule_collider":
                {
                    CapsuleCollider collider = gameObject.GetComponent<CapsuleCollider>() ?? gameObject.AddComponent<CapsuleCollider>();
                    collider.radius = data.radius;
                    collider.height = data.height;
                    collider.center = Vector3From(data.center, Vector3.zero);
                    break;
                }
                case "rigidbody":
                {
                    Rigidbody body = gameObject.AddComponent<Rigidbody>();
                    body.mass = data.mass;
                    body.useGravity = data.use_gravity;
                    body.isKinematic = data.is_kinematic;
                    break;
                }
                case "character_controller":
                {
                    CharacterController controller = gameObject.AddComponent<CharacterController>();
                    PluffCharacterController movement = gameObject.AddComponent<PluffCharacterController>();
                    movement.controller = controller;
                    movement.speed = data.speed;
                    movement.jumpHeight = data.jump_height;
                    movement.gravity = data.gravity;
                    movement.cameraRelative = data.camera_relative;
                    movement.forwardKey = Enum.Parse<KeyCode>(data.forward);
                    movement.backwardKey = Enum.Parse<KeyCode>(data.backward);
                    movement.leftKey = Enum.Parse<KeyCode>(data.left);
                    movement.rightKey = Enum.Parse<KeyCode>(data.right);
                    movement.jumpKey = Enum.Parse<KeyCode>(data.jump);
                    break;
                }
                case "rotate":
                {
                    PluffRotate rotate = gameObject.AddComponent<PluffRotate>();
                    rotate.axis = Vector3From(data.axis, Vector3.up);
                    rotate.speed = data.speed;
                    break;
                }
                case "camera_follow":
                {
                    PluffCameraFollow follow = gameObject.AddComponent<PluffCameraFollow>();
                    follow.targetName = data.target;
                    follow.offset = Vector3From(data.offset, new Vector3(0, 4, -7));
                    follow.smoothSpeed = data.smooth_speed;
                    followers.Add(follow);
                    break;
                }
                case "audio_source":
                {
                    AudioSource audio = gameObject.AddComponent<AudioSource>();
                    audio.clip = Resources.Load<AudioClip>(data.clip);
                    audio.volume = data.volume;
                    audio.loop = data.loop;
                    audio.playOnAwake = data.play_on_awake;
                    if (audio.clip == null) Debug.LogError("Missing or unsupported audio asset: " + data.clip);
                    break;
                }
                case "box_collider_2d":
                {
                    BoxCollider2D collider = gameObject.AddComponent<BoxCollider2D>();
                    collider.size = Vector2From(data.size, Vector2.one);
                    collider.offset = Vector2From(data.offset, Vector2.zero);
                    break;
                }
                case "circle_collider_2d":
                {
                    CircleCollider2D collider = gameObject.AddComponent<CircleCollider2D>();
                    collider.radius = data.radius;
                    collider.offset = Vector2From(data.offset, Vector2.zero);
                    break;
                }
                case "rigidbody_2d":
                {
                    Rigidbody2D body = gameObject.AddComponent<Rigidbody2D>();
                    body.bodyType = data.body_type == "kinematic" ? RigidbodyType2D.Kinematic : data.body_type == "static" ? RigidbodyType2D.Static : RigidbodyType2D.Dynamic;
                    body.gravityScale = data.gravity_scale;
                    break;
                }
                case "top_down_controller_2d":
                {
                    PluffTopDownController2D movement = gameObject.AddComponent<PluffTopDownController2D>();
                    movement.body = gameObject.GetComponent<Rigidbody2D>();
                    movement.speed = data.speed;
                    movement.upKey = Enum.Parse<KeyCode>(data.up);
                    movement.downKey = Enum.Parse<KeyCode>(data.down);
                    movement.leftKey = Enum.Parse<KeyCode>(data.left);
                    movement.rightKey = Enum.Parse<KeyCode>(data.right);
                    break;
                }
                case "platform_controller_2d":
                {
                    PluffPlatformController2D movement = gameObject.AddComponent<PluffPlatformController2D>();
                    movement.body = gameObject.GetComponent<Rigidbody2D>();
                    movement.speed = data.speed;
                    movement.jumpVelocity = data.jump_velocity;
                    movement.leftKey = Enum.Parse<KeyCode>(data.left);
                    movement.rightKey = Enum.Parse<KeyCode>(data.right);
                    movement.jumpKey = Enum.Parse<KeyCode>(data.jump);
                    break;
                }
            }
        }
    }

    static Vector3 Vector3From(float[] values, Vector3 fallback)
    {
        return values != null && values.Length == 3 ? new Vector3(values[0], values[1], values[2]) : fallback;
    }

    static Vector2 Vector2From(float[] values, Vector2 fallback)
    {
        return values != null && values.Length == 2 ? new Vector2(values[0], values[1]) : fallback;
    }
}

public sealed class PluffRotate : MonoBehaviour
{
    public Vector3 axis = Vector3.up;
    public float speed = 45;
    void Update() { transform.Rotate(axis, speed * Time.deltaTime, Space.Self); }
}

public sealed class PluffCameraFollow : MonoBehaviour
{
    public string targetName;
    public Transform target;
    public Vector3 offset = new Vector3(0, 4, -7);
    public float smoothSpeed = 8;
    void LateUpdate()
    {
        if (target == null) return;
        transform.position = Vector3.Lerp(transform.position, target.position + offset, smoothSpeed * Time.deltaTime);
        transform.LookAt(target);
    }
}

public sealed class PluffCharacterController : MonoBehaviour
{
    public CharacterController controller;
    public float speed = 5, jumpHeight = 1.5f, gravity = -20;
    public bool cameraRelative;
    public KeyCode forwardKey = KeyCode.W, backwardKey = KeyCode.S, leftKey = KeyCode.A, rightKey = KeyCode.D, jumpKey = KeyCode.Space;
    float verticalSpeed;
    void Update()
    {
        if (controller.isGrounded)
        {
            verticalSpeed = -1;
            if (Input.GetKeyDown(jumpKey)) verticalSpeed = Mathf.Sqrt(jumpHeight * -2 * gravity);
        }
        verticalSpeed += gravity * Time.deltaTime;
        Vector3 direction = new Vector3((Input.GetKey(rightKey) ? 1 : 0) - (Input.GetKey(leftKey) ? 1 : 0), 0,
            (Input.GetKey(forwardKey) ? 1 : 0) - (Input.GetKey(backwardKey) ? 1 : 0));
        if (cameraRelative && Camera.main != null)
        {
            Vector3 forward = Camera.main.transform.forward;
            forward.y = 0;
            forward.Normalize();
            Vector3 right = Camera.main.transform.right;
            right.y = 0;
            right.Normalize();
            direction = right * direction.x + forward * direction.z;
        }
        direction = direction.normalized;
        controller.Move((direction * speed + Vector3.up * verticalSpeed) * Time.deltaTime);
    }
}

public sealed class PluffTopDownController2D : MonoBehaviour
{
    public Rigidbody2D body;
    public float speed = 5;
    public KeyCode upKey = KeyCode.W, downKey = KeyCode.S, leftKey = KeyCode.A, rightKey = KeyCode.D;
    void FixedUpdate()
    {
        Vector2 direction = new Vector2((Input.GetKey(rightKey) ? 1 : 0) - (Input.GetKey(leftKey) ? 1 : 0),
            (Input.GetKey(upKey) ? 1 : 0) - (Input.GetKey(downKey) ? 1 : 0)).normalized;
        body.linearVelocity = direction * speed;
    }
}

public sealed class PluffPlatformController2D : MonoBehaviour
{
    public Rigidbody2D body;
    public float speed = 5, jumpVelocity = 8;
    public KeyCode leftKey = KeyCode.A, rightKey = KeyCode.D, jumpKey = KeyCode.Space;
    bool jumpRequested;
    void Update() { if (Input.GetKeyDown(jumpKey)) jumpRequested = true; }
    void FixedUpdate()
    {
        Vector2 velocity = body.linearVelocity;
        velocity.x = ((Input.GetKey(rightKey) ? 1 : 0) - (Input.GetKey(leftKey) ? 1 : 0)) * speed;
        if (jumpRequested && body.IsTouchingLayers()) velocity.y = jumpVelocity;
        jumpRequested = false;
        body.linearVelocity = velocity;
    }
}
`
}

function buildScript(model) {
  const methods = model.exportConfig.targets.map(target => {
    const config = EXPORT_TARGETS[target]
    const ext = config.extension
    const targetName = target[0].toUpperCase() + target.slice(1)
    const executable = `${model.meta.name}${ext}`
    return `    public static void Build${targetName}() => Build(BuildTarget.${config.target}, "Build/${target}/${executable}");`
  }).join('\n')
  return `using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

public static class PluffBuild
{
${methods}

    static void Build(BuildTarget target, string relativeOutput)
    {
        string output = Path.GetFullPath(relativeOutput);
        Directory.CreateDirectory(Path.GetDirectoryName(output));
        BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
        {
            scenes = new[] { ${model.scenes.map(scene => `"${scene.path}"`).join(', ')} },
            locationPathName = output,
            target = target,
            options = BuildOptions.None
        });
        if (report.summary.result != BuildResult.Succeeded)
            throw new System.Exception("Unity build failed: " + report.summary.result);
        Debug.Log("Pluff build created: " + output);
    }
}
`
}

function buildSettings(model) {
  const scenes = model.scenes.map(scene => {
    const guid = hashGuid(`scene:${scene.path}`)
    return `  - enabled: 1\n    path: ${scene.path}\n    guid: ${guid}`
  }).join('\n')
  return `%YAML 1.1
%TAG !u! tag:unity3d.com,2011:
--- !u!1045 &1
EditorBuildSettings:
  m_ObjectHideFlags: 0
  serializedVersion: 2
  m_Scenes:
${scenes}
  m_configObjects: {}
`
}

function workflowFile(model) {
  const firstTarget = model.exportConfig.targets[0]
  const target = EXPORT_TARGETS[firstTarget]
  return `name: Unity build

on:
  workflow_dispatch:
  push:
    paths:
      - "Assets/**"
      - "Packages/**"
      - "ProjectSettings/**"
      - ".github/workflows/unity-build.yml"

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: game-ci/unity-builder@v4
        env:
          UNITY_LICENSE: \${{ secrets.UNITY_LICENSE }}
        with:
          projectPath: .
          unityVersion: ${model.project.unity_version}
          targetPlatform: ${target.target}
          buildsPath: build
      - uses: actions/upload-artifact@v4
        with:
          name: ${model.meta.name}-${firstTarget}
          path: build
`
}

export function writeUnitySceneProject(model, tatemonoDir, outputDir) {
  const assetsDir = path.join(outputDir, 'Assets')
  const resourcesDir = path.join(assetsDir, 'Resources')
  const sceneDataDir = path.join(resourcesDir, 'pluff_scenes')
  const scenesDir = path.join(assetsDir, 'Scenes')
  const scriptsDir = path.join(assetsDir, 'Scripts')
  const editorDir = path.join(assetsDir, 'Editor')
  for (const directory of [sceneDataDir, scenesDir, scriptsDir, editorDir, path.join(outputDir, 'Packages'), path.join(outputDir, 'ProjectSettings'), path.join(outputDir, '.github', 'workflows')]) fs.mkdirSync(directory, { recursive: true })

  for (const [name, source] of model.assets) {
    const sourcePath = resolveSceneAsset(tatemonoDir, source, name)
    const destination = path.join(resourcesDir, `${name}${path.extname(sourcePath)}`)
    fs.mkdirSync(path.dirname(destination), { recursive: true })
    fs.copyFileSync(sourcePath, destination)
  }

  for (const scene of model.scenes) {
    const key = scene.name
    fs.writeFileSync(path.join(sceneDataDir, `${key}.json`), JSON.stringify({
      width: model.project.width,
      height: model.project.height,
      nodes: scene.nodes,
      environment: model.environment,
    }, null, 2) + '\n', 'utf8')
    const outputScene = path.join(outputDir, ...scene.path.split('/'))
    fs.mkdirSync(path.dirname(outputScene), { recursive: true })
    const guid = hashGuid(`scene:${scene.path}`)
    fs.writeFileSync(outputScene, unitySceneFile().replace('sceneKey: main', `sceneKey: ${key}`), 'utf8')
    fs.writeFileSync(`${outputScene}.meta`, sceneMeta(guid), 'utf8')
  }

  fs.writeFileSync(path.join(scriptsDir, 'PluffSceneBootstrap.cs'), runtimeScript(), 'utf8')
  fs.writeFileSync(path.join(scriptsDir, 'PluffSceneBootstrap.cs.meta'), scriptMeta(SCRIPT_GUID), 'utf8')
  fs.writeFileSync(path.join(editorDir, 'PluffBuild.cs'), buildScript(model), 'utf8')
  fs.writeFileSync(path.join(editorDir, 'PluffBuild.cs.meta'), scriptMeta(hashGuid('pluff-build-script')), 'utf8')
  const dependencies = { 'com.unity.modules.physics': '1.0.0', 'com.unity.modules.physics2d': '1.0.0' }
  if ([...model.assets.values()].some(asset => path.extname(asset).toLowerCase() === '.svg')) dependencies['com.unity.vectorgraphics'] = '2.0.0-preview.25'
  fs.writeFileSync(path.join(outputDir, 'Packages', 'manifest.json'), JSON.stringify({ dependencies }, null, 2) + '\n', 'utf8')
  fs.writeFileSync(path.join(outputDir, 'ProjectSettings', 'ProjectVersion.txt'), `m_EditorVersion: ${model.project.unity_version}\n`, 'utf8')
  fs.writeFileSync(path.join(outputDir, 'ProjectSettings', 'EditorBuildSettings.asset'), buildSettings(model), 'utf8')
  fs.writeFileSync(path.join(outputDir, '.gitignore'), 'Library/\nTemp/\nObj/\nBuild/\nLogs/\nUserSettings/\n.vs/\n*.csproj\n*.sln\n', 'utf8')
  fs.writeFileSync(path.join(outputDir, 'README.md'), `# ${model.project.name}

Generated Unity ${model.project.unity_version} scene-based game.

Open this folder in Unity Hub, let Unity import the assets, and open
\`${model.project.main_scene}\`. Press Play to instantiate the scene graph
declared in \`Resources/pluff_scenes/\`. The hierarchy, primitive meshes,
materials, cameras, lights, colliders, rigidbodies, character controller,
camera follow, rotation, and audio sources are generated from the Tatemono DSL.
Built-in 2D Rigidbody/Collider components, top-down and platformer controls,
and sprite assets are supported alongside 3D physics and controllers.

Export targets: ${model.exportConfig.targets.join(', ')}. Use
\`PluffBuild.Build${model.exportConfig.targets[0][0].toUpperCase()}${model.exportConfig.targets[0].slice(1)}\`
from Unity batch mode to build the first target.

The generated project includes a GameCI workflow. Add the Unity license as the
repository secret \`UNITY_LICENSE\` before using it.
`, 'utf8')
  fs.writeFileSync(path.join(outputDir, '.github', 'workflows', 'unity-build.yml'), workflowFile(model), 'utf8')
  return { scene: model.project.main_scene, copiedAssetCount: model.assets.size }
}

export function parseUnitySceneTatemono(source, tatemonoPath) {
  return parseSceneTatemono(source, tatemonoPath)
}
