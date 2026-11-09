import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { validateGameFreeFiles, writeGameFreeFiles } from '../free-files.js'

const ENGINE_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const requireFromNext = createRequire(path.join(ENGINE_DIR, 'frontend', 'nextjs', 'package.json'))
const { load: parseYaml } = requireFromNext('js-yaml')

const NODE_TYPES = new Set([
  'Node', 'Node2D', 'Node3D', 'WorldEnvironment', 'DirectionalLight3D',
  'MeshInstance3D', 'StaticBody3D', 'CharacterBody3D', 'CollisionShape3D',
  'Camera3D', 'Sprite3D', 'AnimatedSprite3D',
])
const MESH_TYPES = new Set(['PlaneMesh', 'BoxMesh', 'CapsuleMesh', 'SphereMesh', 'CylinderMesh'])
const SHAPE_TYPES = new Set(['BoxShape3D', 'CapsuleShape3D', 'SphereShape3D'])
const ASSET_CATEGORY_BY_EXTENSION = new Map([
  ...['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp', '.tif', '.tiff'].map(ext => [ext, 'images']),
  ...['.wav', '.ogg', '.mp3', '.aac', '.flac', '.m4a'].map(ext => [ext, 'audio']),
  ...['.woff', '.woff2', '.ttf', '.otf', '.fnt'].map(ext => [ext, 'fonts']),
  ...['.glb', '.gltf', '.obj', '.fbx', '.dae', '.blend'].map(ext => [ext, 'models']),
  ...['.mp4', '.webm', '.mov'].map(ext => [ext, 'videos']),
  ...['.json', '.xml', '.yaml', '.yml', '.toml', '.csv'].map(ext => [ext, 'data']),
])
const ASSET_CATEGORIES = new Set(['images', 'audio', 'fonts', 'models', 'videos', 'data'])
const EXPORT_PLATFORMS = {
  windows: { name: 'Windows Desktop', extension: '.exe' },
  linux: { name: 'Linux', extension: '.x86_64' },
  macos: { name: 'macOS', extension: '.zip' },
  web: { name: 'Web', extension: '.zip' },
}

function assert(condition, message) {
  if (!condition) throw new Error(`[Godot generator] ${message}`)
}

function readYamlBlock(body, label) {
  try {
    const value = parseYaml(body)
    assert(value && typeof value === 'object' && !Array.isArray(value), `${label} must contain a YAML mapping`)
    return value
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('[Godot generator]')) throw error
    throw new Error(`[Godot generator] Invalid YAML in ${label}: ${error.message}`)
  }
}

function parseTatemono(source, tatemonoPath) {
  const lines = source.split(/\r?\n/)
  const blocks = new Map()
  const repeated = new Map()

  for (let index = 0; index < lines.length; index += 1) {
    const opening = lines[index].match(/^\s*\/\* @arkzen:(godot:[a-z0-9:-]+)\s*$/)
    if (!opening) continue

    const marker = opening[1]
    let closingIndex = index + 1
    while (closingIndex < lines.length && lines[closingIndex].trim() !== '*/') closingIndex += 1
    assert(closingIndex < lines.length, `@arkzen:${marker} is missing its opening-comment terminator`)
    assert(lines[closingIndex + 1]?.trim() === `/* @arkzen:${marker}:end */`, `@arkzen:${marker} must close with /* @arkzen:${marker}:end */`)

    const value = readYamlBlock(lines.slice(index + 1, closingIndex).join('\n'), `@arkzen:${marker}`)
    if (marker.startsWith('godot:scene:')) {
      const entries = repeated.get(marker) ?? []
      entries.push(value)
      repeated.set(marker, entries)
    } else {
      assert(!blocks.has(marker), `Duplicate @arkzen:${marker} block`)
      blocks.set(marker, value)
    }
    index = closingIndex + 1
  }

  const metaMatch = source.match(/^\s*\/\* @arkzen:meta\r?\n([\s\S]*?)^\s*\*\/\s*$/m)
  assert(metaMatch, 'A YAML @arkzen:meta block is required')
  const meta = readYamlBlock(metaMatch[1], '@arkzen:meta')
  const expectedName = path.basename(path.dirname(tatemonoPath))
  assert(meta.name === expectedName, `@arkzen:meta name "${meta.name}" must match Tatemono folder "${expectedName}"`)
  assert(/^[a-z0-9][a-z0-9-]*$/.test(meta.name), 'Tatemono name may contain only lowercase letters, digits, and hyphens')

  const project = blocks.get('godot:project')
  assert(project, 'A @arkzen:godot:project block is required')
  assert(typeof project.name === 'string' && project.name.trim(), '@arkzen:godot:project name must be a non-empty string')
  assert(/^4(?:\.\d+|\.x)$/.test(String(project.godot_version)), 'godot_version must be 4.x or a Godot 4 minor version')
  assert(['gl_compatibility', 'mobile', 'forward_plus'].includes(project.renderer), 'renderer must be gl_compatibility, mobile, or forward_plus')
  assert(isResPath(project.main_scene, '.tscn'), 'main_scene must be a res:// path ending in .tscn')
  for (const key of ['width', 'height']) {
    if (project.window?.[key] !== undefined) {
      assert(Number.isInteger(project.window[key]) && project.window[key] > 0, `window.${key} must be a positive integer`)
    }
  }

  const sceneBlocks = []
  for (const [marker, values] of repeated) {
    if (marker.startsWith('godot:scene:')) sceneBlocks.push(...values)
  }
  assert(sceneBlocks.length > 0, 'At least one @arkzen:godot:scene:<name> block is required')
  const scenes = new Map()
  for (const scene of sceneBlocks) {
    assert(isResPath(scene.path, '.tscn'), 'Every Godot scene needs a safe res:// .tscn path')
    assert(scene.root && typeof scene.root === 'object' && NODE_TYPES.has(scene.root.type), `Scene "${scene.path}" has an unsupported root node type`)
    assert(!scenes.has(scene.path), `Duplicate Godot scene path "${scene.path}"`)
    validateNodeConfig(scene.root, `scene ${scene.path} root`)
    for (const node of scene.nodes ?? []) validateNodeConfig(node, `scene ${scene.path}`)
    for (const component of scene.components ?? []) validateNodeConfig(component, `scene ${scene.path}`)
    scenes.set(scene.path, scene)
  }
  assert(scenes.has(project.main_scene), `main_scene "${project.main_scene}" has no matching scene block`)
  for (const scene of scenes.values()) {
    walkNodeConfigs(scene, node => {
      if (node.instance) assert(scenes.has(node.instance), `Scene instance "${node.instance}" is not declared`)
    })
  }

  const behaviors = new Map()
  for (const [marker, behavior] of blocks) {
    if (!marker.startsWith('godot:behavior:')) continue
    const name = marker.slice('godot:behavior:'.length)
    assert(['player', 'camera'].includes(name), `Unsupported generated behavior "${name}"`)
    assert(behavior.language === 'gdscript', `Behavior "${name}" must use gdscript`)
    assert(isResPath(behavior.script, '.gd'), `Behavior "${name}" script must be a safe res:// .gd path`)
    assert(!behaviors.has(name), `Duplicate behavior "${name}"`)
    behaviors.set(name, behavior)
  }
  assert(behaviors.has('player'), 'A @arkzen:godot:behavior:player block is required')
  assert(behaviors.has('camera'), 'A @arkzen:godot:behavior:camera block is required')
  assert(behaviors.get('player').extends === 'CharacterBody3D', 'Player behavior must extend CharacterBody3D')
  assert(behaviors.get('player').scene !== project.main_scene, 'Player scene must be different from the main scene')

  const exportConfig = blocks.get('godot:export')
  assert(exportConfig?.presets && Object.keys(exportConfig.presets).length > 0, '@arkzen:godot:export must declare at least one preset')
  for (const [preset, settings] of Object.entries(exportConfig.presets)) {
    assert(EXPORT_PLATFORMS[preset], `Unsupported Godot export preset "${preset}"`)
    assert(settings && typeof settings.runnable === 'boolean', `Export preset "${preset}" must set runnable to true or false`)
  }
  const multiplayerConfig = blocks.get('godot:multiplayer')
  if (multiplayerConfig) {
    assert(typeof multiplayerConfig === 'object' && !Array.isArray(multiplayerConfig), '@arkzen:godot:multiplayer must be a mapping')
    assert(multiplayerConfig.enabled === undefined || multiplayerConfig.enabled === true, '@arkzen:godot:multiplayer can only be declared with enabled: true')
    const port = multiplayerConfig.port ?? 24567
    const maxClients = multiplayerConfig.max_clients ?? 8
    const syncRate = multiplayerConfig.sync_rate ?? 20
    const defaultAddress = multiplayerConfig.default_address ?? '127.0.0.1'
    assert(Number.isInteger(port) && port >= 1024 && port <= 65535, 'Godot multiplayer port must be an integer from 1024 to 65535')
    assert(Number.isInteger(maxClients) && maxClients >= 1 && maxClients <= 64, 'Godot multiplayer max_clients must be an integer from 1 to 64')
    assert(Number.isInteger(syncRate) && syncRate >= 1 && syncRate <= 60, 'Godot multiplayer sync_rate must be an integer from 1 to 60')
    assert(typeof defaultAddress === 'string' && defaultAddress.trim().length > 0, 'Godot multiplayer default_address must be a non-empty string')
    assert(exportConfig.presets.web?.runnable !== true, 'Godot ENet multiplayer does not support Web exports; set the web preset runnable: false or remove it')
    Object.assign(multiplayerConfig, { port, max_clients: maxClients, sync_rate: syncRate, default_address: defaultAddress })
  }

  const input = blocks.get('godot:input') ?? { actions: {} }
  assert(input.actions && typeof input.actions === 'object' && !Array.isArray(input.actions), '@arkzen:godot:input actions must be a mapping')
  for (const [actionName, action] of Object.entries(input.actions)) {
    assert(/^[a-z][a-z0-9_]*$/.test(actionName), `Invalid input action name "${actionName}"`)
    assert(action && typeof action === 'object' && !Array.isArray(action), `Input action "${actionName}" must be a mapping`)
    assert(Array.isArray(action.keys) && action.keys.length > 0 && action.keys.every(key => typeof key === 'string'), `Input action "${actionName}" must list one or more keys`)
  }
  for (const actionName of behaviors.get('player').movement?.input ?? []) {
    assert(input.actions[actionName], `Player behavior refers to undeclared input action "${actionName}"`)
  }
  if (behaviors.get('player').movement?.run_action) {
    assert(input.actions[behaviors.get('player').movement.run_action], `Player behavior refers to undeclared run action "${behaviors.get('player').movement.run_action}"`)
  }
  if (behaviors.get('player').movement?.jump_action) {
    assert(input.actions[behaviors.get('player').movement.jump_action], `Player behavior refers to undeclared jump action "${behaviors.get('player').movement.jump_action}"`)
  }

  const assets = parseAssets(blocks.get('godot:assets') ?? {})
  const world = blocks.get('godot:world') ?? {}
  if (Object.keys(world).length > 0) {
    for (const key of ['tile_size', 'grid_width', 'grid_depth', 'block_height', 'world_margin']) {
      assert(Number.isFinite(world[key]) && world[key] > 0, `Godot world ${key} must be a positive number`)
    }
    assert(Number.isInteger(world.seed) && world.seed >= 0, 'Godot world seed must be a non-negative integer')
    assert(world.props && typeof world.props === 'object', 'Godot world props must be a mapping')
    assert(world.npcs && typeof world.npcs === 'object', 'Godot world npcs must be a mapping')
    if (world.npcs.count !== undefined) assert(Number.isInteger(world.npcs.count) && world.npcs.count >= 0, 'Godot world npcs.count must be a non-negative integer')
    if (world.npcs.spawn_range !== undefined) assert(Number.isFinite(world.npcs.spawn_range) && world.npcs.spawn_range >= 0, 'Godot world npcs.spawn_range must be non-negative')
    if (world.npcs.interact_radius !== undefined) assert(Number.isFinite(world.npcs.interact_radius) && world.npcs.interact_radius > 0, 'Godot world npcs.interact_radius must be positive')
    if (world.npcs.speed !== undefined) assert(Number.isFinite(world.npcs.speed) && world.npcs.speed >= 0, 'Godot world npcs.speed must be non-negative')
    if (world.npcs.wander_min !== undefined) assert(Number.isFinite(world.npcs.wander_min) && world.npcs.wander_min > 0, 'Godot world npcs.wander_min must be positive')
    if (world.npcs.wander_max !== undefined) assert(Number.isFinite(world.npcs.wander_max) && world.npcs.wander_max >= (world.npcs.wander_min ?? 1), 'Godot world npcs.wander_max must be at least wander_min')
    if (world.npcs.interact_action !== undefined) {
      assert(typeof world.npcs.interact_action === 'string' && input.actions[world.npcs.interact_action], 'Godot world npcs.interact_action must reference a declared input action')
    }
    if (world.dialogues !== undefined) {
      assert(Array.isArray(world.dialogues) && world.dialogues.every(lines => Array.isArray(lines) && lines.every(line => typeof line === 'string')), 'Godot world dialogues must be a list of lists of strings')
    }
    for (const [name, prop] of Object.entries(world.props)) {
      assert(Number.isInteger(prop.count) && prop.count >= 0, `World prop "${name}" count must be a non-negative integer`)
      assert(Number.isFinite(prop.size) && prop.size > 0, `World prop "${name}" size must be positive`)
      assert(typeof prop.collision === 'boolean', `World prop "${name}" collision must be true or false`)
      assert(assets.has(prop.texture), `World prop "${name}" references undeclared texture "${prop.texture}"`)
    }
    const visuals = world.visuals ?? {}
    assert(visuals && typeof visuals === 'object' && !Array.isArray(visuals), 'Godot world visuals must be a mapping')
    const sky = visuals.sky ?? {}
    assert(sky && typeof sky === 'object' && !Array.isArray(sky), 'Godot world visuals.sky must be a mapping')
    if (sky.gradient_texture !== undefined) {
      assert(typeof sky.gradient_texture === 'string' && assets.has(sky.gradient_texture), 'Godot world sky.gradient_texture must reference a declared texture')
    }
    if (sky.cloud_layers !== undefined) {
      assert(Array.isArray(sky.cloud_layers) && sky.cloud_layers.length <= 3, 'Godot world sky.cloud_layers must list at most three textures')
      assert(sky.cloud_layers.every(name => typeof name === 'string' && assets.has(name)), 'Godot world sky.cloud_layers must reference declared textures')
    }
    for (const key of ['zenith_color', 'horizon_color']) {
      if (sky[key] !== undefined) assert(/^#[0-9a-f]{6}$/i.test(sky[key]), `Godot world sky.${key} must be a #RRGGBB color`)
    }
    if (sky.cloud_speed !== undefined) assert(Number.isFinite(sky.cloud_speed) && sky.cloud_speed >= 0 && sky.cloud_speed <= 1, 'Godot world sky.cloud_speed must be between 0 and 1')
    for (const [key, min, max] of [
      ['sun_azimuth', -360, 360],
      ['sun_elevation', -90, 90],
      ['ray_strength', 0, 2],
    ]) {
      if (sky[key] !== undefined) assert(Number.isFinite(sky[key]) && sky[key] >= min && sky[key] <= max, `Godot world sky.${key} must be between ${min} and ${max}`)
    }
    const fog = visuals.fog ?? {}
    assert(fog && typeof fog === 'object' && !Array.isArray(fog), 'Godot world visuals.fog must be a mapping')
    if (fog.color !== undefined) assert(/^#[0-9a-f]{6}$/i.test(fog.color), 'Godot world fog.color must be a #RRGGBB color')
    if (fog.density !== undefined) assert(Number.isFinite(fog.density) && fog.density >= 0, 'Godot world fog.density must be non-negative')
    if (fog.volumetric !== undefined) assert(typeof fog.volumetric === 'boolean', 'Godot world fog.volumetric must be true or false')
    if (fog.volumetric_density !== undefined) assert(Number.isFinite(fog.volumetric_density) && fog.volumetric_density >= 0, 'Godot world fog.volumetric_density must be non-negative')
    const lighting = visuals.lighting ?? {}
    assert(lighting && typeof lighting === 'object' && !Array.isArray(lighting), 'Godot world visuals.lighting must be a mapping')
    if (lighting.ambient_color !== undefined) assert(/^#[0-9a-f]{6}$/i.test(lighting.ambient_color), 'Godot world lighting.ambient_color must be a #RRGGBB color')
    if (lighting.ambient_energy !== undefined) assert(Number.isFinite(lighting.ambient_energy) && lighting.ambient_energy >= 0, 'Godot world lighting.ambient_energy must be non-negative')
    const postProcessing = visuals.post_processing ?? {}
    assert(postProcessing && typeof postProcessing === 'object' && !Array.isArray(postProcessing), 'Godot world visuals.post_processing must be a mapping')
    if (postProcessing.glow !== undefined) assert(typeof postProcessing.glow === 'boolean', 'Godot world post_processing.glow must be true or false')
    for (const key of ['ssao', 'ssil', 'ssr']) {
      if (postProcessing[key] !== undefined) assert(typeof postProcessing[key] === 'boolean', `Godot world post_processing.${key} must be true or false`)
    }
    if (postProcessing.tonemap !== undefined) assert(['linear', 'reinhardt', 'filmic', 'aces'].includes(postProcessing.tonemap), 'Godot world post_processing.tonemap must be linear, reinhardt, filmic, or aces')
    for (const key of ['glow_intensity', 'bloom', 'ssao_radius', 'ssao_intensity', 'ssil_radius', 'ssil_intensity', 'ssr_depth_tolerance']) {
      if (postProcessing[key] !== undefined) assert(Number.isFinite(postProcessing[key]) && postProcessing[key] >= 0, `Godot world post_processing.${key} must be non-negative`)
    }
    if (postProcessing.ssr_max_steps !== undefined) assert(Number.isInteger(postProcessing.ssr_max_steps) && postProcessing.ssr_max_steps > 0, 'Godot world post_processing.ssr_max_steps must be a positive integer')
    if (project.renderer !== 'forward_plus' && (fog.volumetric || postProcessing.ssao || postProcessing.ssil || postProcessing.ssr || postProcessing.glow)) {
      assert(false, 'Godot volumetric fog, SSAO, SSIL, SSR, and glow require renderer: forward_plus')
    }
  }
  for (const scene of scenes.values()) {
    walkNodeConfigs(scene, node => {
      if (node.texture) assert(assets.has(node.texture), `Scene references undeclared texture asset "${node.texture}"`)
      if (node.material?.albedo) assert(assets.has(node.material.albedo), `Scene references undeclared albedo asset "${node.material.albedo}"`)
    })
  }

  return {
    meta,
    project,
    scenes,
    input,
    assets,
    behaviors,
    exportConfig,
    multiplayer: multiplayerConfig ?? null,
    world: buildWorldData(world),
  }
}

function isResPath(value, extension) {
  return typeof value === 'string'
    && value.startsWith('res://')
    && value.endsWith(extension)
    && !value.includes('..')
    && !value.includes('\\')
}

function validateNodeConfig(config, context) {
  assert(config && typeof config === 'object' && !Array.isArray(config), `${context} node must be a mapping`)
  if (config.instance) {
    assert(isResPath(config.instance, '.tscn'), `${context} instance must be a safe res:// .tscn path`)
    return
  }
  assert(NODE_TYPES.has(config.type), `${context} uses unsupported node type "${config.type}"`)
  assert(!config.mesh || MESH_TYPES.has(config.mesh.type), `${context} uses unsupported mesh type "${config.mesh?.type}"`)
  assert(!config.shape || SHAPE_TYPES.has(config.shape.type), `${context} uses unsupported collision shape "${config.shape?.type}"`)
  if (config.type === 'AnimatedSprite3D') {
    const animation = config.animation
    assert(animation && Number.isInteger(animation.columns) && animation.columns > 0, `${context} AnimatedSprite3D needs a positive animation.columns`)
    assert(Number.isInteger(animation.rows) && animation.rows > 0, `${context} AnimatedSprite3D needs a positive animation.rows`)
    assert(Array.isArray(animation.directions) && animation.directions.length > 0, `${context} AnimatedSprite3D needs animation.directions`)
    for (const key of ['idle_row_offset', 'walk_row_offset', 'run_row_offset']) {
      if (animation[key] === undefined && key === 'run_row_offset') continue
      const offset = animation[key] ?? 0
      assert(Number.isInteger(offset) && offset >= 0 && offset + animation.directions.length <= animation.rows, `${context} AnimatedSprite3D ${key} exceeds the sprite sheet rows`)
    }
    if (animation.run_frames_per_second !== undefined) {
      assert(Number.isFinite(animation.run_frames_per_second) && animation.run_frames_per_second > 0, `${context} AnimatedSprite3D run_frames_per_second must be positive`)
    }
  }
  if (config.children) {
    assert(Array.isArray(config.children), `${context} children must be a list`)
    for (const child of config.children) validateNodeConfig(child, context)
  }
  if (config.nodes) {
    assert(Array.isArray(config.nodes), `${context} nodes must be a list`)
    for (const child of config.nodes) validateNodeConfig(child, context)
  }
  if (config.components) {
    assert(Array.isArray(config.components), `${context} components must be a list`)
    for (const child of config.components) validateNodeConfig(child, context)
  }
}

function walkNodeConfigs(scene, visit) {
  const walk = config => {
    visit(config)
    for (const field of ['children', 'nodes', 'components']) {
      for (const child of config[field] ?? []) walk(child)
    }
  }
  walk(scene.root)
  for (const node of scene.nodes ?? []) walk(node)
  for (const component of scene.components ?? []) walk(component)
}

function buildWorldData(world) {
  if (!world || Object.keys(world).length === 0) return null
  const tileSize = world.tile_size
  const worldWidth = world.grid_width * tileSize
  const worldDepth = world.grid_depth * tileSize
  const halfWidth = worldWidth / 2 - world.world_margin
  const halfDepth = worldDepth / 2 - world.world_margin
  let seed = world.seed
  const rand = () => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff
    return (seed >>> 0) / 0xffffffff
  }
  const props = []
  for (const [type, definition] of Object.entries(world.props ?? {})) {
    for (let index = 0; index < definition.count; index += 1) {
      props.push({
        type,
        texture: definition.texture,
        x: -halfWidth + rand() * halfWidth * 2,
        z: -halfDepth + rand() * halfDepth * 2,
        size: definition.size,
        collision: definition.collision,
        radius: definition.collision_radius,
      })
    }
  }
  const npcs = []
  let npcSeed = world.seed + 1
  const npcRand = () => {
    npcSeed = (npcSeed * 1664525 + 1013904223) & 0xffffffff
    return (npcSeed >>> 0) / 0xffffffff
  }
  const npcCount = world.npcs?.count ?? 0
  const npcSpawnRange = world.npcs?.spawn_range ?? 14
  for (let index = 0; index < npcCount; index += 1) {
    const angle = (index / npcCount) * Math.PI * 2
    const distance = 3 + npcRand() * npcSpawnRange
    npcs.push({
      index,
      x: Math.cos(angle) * distance,
      z: Math.sin(angle) * distance,
      dialogueIndex: index % (world.dialogues?.length ?? 1),
    })
  }
  return {
    ...world,
    worldWidth,
    worldDepth,
    halfWidth,
    halfDepth,
    props,
    npcs,
    npcSettings: world.npcs ?? {},
  }
}

function parseAssets(assetConfig) {
  const assets = new Map()
  for (const group of ['textures', 'audio', 'fonts', 'models']) {
    const entries = assetConfig[group] ?? {}
    assert(entries && typeof entries === 'object' && !Array.isArray(entries), `Asset ${group} must be a mapping`)
    for (const [name, settings] of Object.entries(entries)) {
      assert(/^[a-z][a-z0-9_]*$/.test(name), `Invalid asset name "${name}"`)
      assert(settings && typeof settings.source === 'string', `Asset "${name}" must specify source`)
      assert(settings.optional === undefined || typeof settings.optional === 'boolean', `Asset "${name}" optional must be true or false`)
      const source = settings.source.replace(/\\/g, '/')
      assert(source.startsWith('assets/') && !source.split('/').includes('..'), `Asset "${name}" source must stay inside the Tatemono assets/ directory`)
      assets.set(name, { ...settings, source, kind: group })
    }
  }
  return assets
}

function arrangeAssetPath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/')
  const segments = normalized.split('/')
  const firstSegment = segments[0].toLowerCase()
  const category = ASSET_CATEGORY_BY_EXTENSION.get(path.extname(normalized).toLowerCase()) ?? 'other'
  if (ASSET_CATEGORIES.has(firstSegment)) return normalized
  return [category, ...segments].join('/')
}

function copyAndArrangeAssets(tatemonoDir, outputDir) {
  const sourceRoot = path.join(tatemonoDir, 'assets')
  const mapping = new Map()
  const destinations = new Set()
  let copied = 0

  if (!fs.existsSync(sourceRoot)) return { mapping, copied }
  assert(fs.lstatSync(sourceRoot).isDirectory(), 'Tatemono assets path must be a directory')

  const walk = (directory, relativeDirectory = '') => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.name.startsWith('.')) continue
      const sourcePath = path.join(directory, entry.name)
      const relativePath = path.join(relativeDirectory, entry.name)
      const stat = fs.lstatSync(sourcePath)
      assert(!stat.isSymbolicLink(), `Asset symlinks are not supported: ${relativePath}`)
      if (stat.isDirectory()) {
        walk(sourcePath, relativePath)
        continue
      }
      assert(stat.isFile(), `Asset must be a regular file: ${relativePath}`)
      const arrangedPath = arrangeAssetPath(relativePath)
      const destinationKey = arrangedPath.toLowerCase()
      assert(!destinations.has(destinationKey), `Multiple assets map to the same generated path: assets/${arrangedPath}`)
      destinations.add(destinationKey)
      const outputPath = path.join(outputDir, 'assets', ...arrangedPath.split('/'))
      fs.mkdirSync(path.dirname(outputPath), { recursive: true })
      fs.copyFileSync(sourcePath, outputPath)
      mapping.set(`assets/${relativePath.split(path.sep).join('/')}`, `res://assets/${arrangedPath}`)
      copied += 1
    }
  }

  walk(sourceRoot)
  return { mapping, copied }
}

function godotString(value) {
  return JSON.stringify(String(value))
}

function godotValue(value) {
  if (Array.isArray(value)) return `[${value.map(godotValue).join(', ')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value).map(([key, item]) => `${godotString(key)}: ${godotValue(item)}`).join(', ')}}`
  }
  if (typeof value === 'string') return godotString(value)
  if (value === null) return 'null'
  return String(value)
}

function projectFile(project, multiplayer) {
  const lines = [
    'config_version=5',
    '',
    '[application]',
    '',
    `config/name=${godotString(project.name)}`,
    `run/main_scene=${godotString(project.main_scene)}`,
    '',
    '[display]',
    '',
    `window/size/viewport_width=${project.display?.viewport_width ?? 640}`,
    `window/size/viewport_height=${project.display?.viewport_height ?? 360}`,
    `window/size/window_width_override=${project.window?.width ?? 1280}`,
    `window/size/window_height_override=${project.window?.height ?? 720}`,
    `window/size/resizable=${project.window?.resizable === false ? 'false' : 'true'}`,
  ]
  if (project.display?.stretch_mode) lines.push(`window/stretch/mode=${godotString(project.display.stretch_mode)}`)
  if (multiplayer) lines.push('', '[autoload]', '', 'PluffMultiplayer="*res://scripts/multiplayer.gd"')
  lines.push('', '[rendering]', '', `renderer/rendering_method=${godotString(project.renderer)}`)
  if (project.display?.pixel_art) lines.push('textures/default_filters/use_nearest_mipmap_filter=false')
  return `${lines.join('\n')}\n`
}

function sceneFile(scene, scriptPath) {
  const rootProperties = Object.entries(scene.root.properties ?? {}).map(([key, value]) => {
    if (['position', 'rotation_degrees', 'scale'].includes(key) && Array.isArray(value) && value.length === 3) {
      return `${key} = Vector3(${value.join(', ')})`
    }
    return `${key} = ${godotValue(value)}`
  })
  return [
    '[gd_scene load_steps=2 format=3]',
    '',
    `[ext_resource type="Script" path=${godotString(scriptPath)} id="1_script"]`,
    '',
    `[node name=${godotString(scene.root.name ?? 'Root')} type=${godotString(scene.root.type)}]`,
    'script = ExtResource("1_script")',
    ...rootProperties,
    '',
  ].join('\n')
}

const SKY_BACKGROUND_SHADER = `shader_type sky;

uniform vec4 zenith_color : source_color = vec4(0.08, 0.30, 0.68, 1.0);
uniform vec4 horizon_color : source_color = vec4(0.69, 0.90, 0.98, 1.0);
uniform sampler2D sky_gradient : source_color, repeat_enable, filter_linear;
uniform float gradient_opacity = 0.0;
uniform sampler2D cloud_layer_0 : source_color, repeat_enable, filter_linear;
uniform sampler2D cloud_layer_1 : source_color, repeat_enable, filter_linear;
uniform sampler2D cloud_layer_2 : source_color, repeat_enable, filter_linear;
uniform float cloud_opacity_0 = 0.0;
uniform float cloud_opacity_1 = 0.0;
uniform float cloud_opacity_2 = 0.0;
uniform float cloud_speed = 0.004;
uniform float sun_azimuth = -0.610865;
uniform float sun_elevation = 0.610865;
uniform float ray_strength = 0.2;

void sky() {
	vec2 sky_uv = vec2(atan(EYEDIR.x, -EYEDIR.z) / TAU + 0.5, 0.5 - asin(clamp(EYEDIR.y, -1.0, 1.0)) / PI);
	float sky_height = max(EYEDIR.y, 0.0);
	float horizon_haze = exp(-abs(EYEDIR.y) * 5.0);
	vec3 sky_color = mix(horizon_color.rgb, zenith_color.rgb, smoothstep(0.0, 0.85, sky_height));
	sky_color = mix(sky_color, horizon_color.rgb, horizon_haze * 0.18);
	vec3 gradient = texture(sky_gradient, sky_uv).rgb;
	sky_color = mix(sky_color, gradient, gradient_opacity);
	if (!AT_CUBEMAP_PASS) {
		vec2 cloud_uv_0 = vec2(sky_uv.x * 0.85 + TIME * cloud_speed * 0.12, sky_uv.y);
		vec2 cloud_uv_1 = vec2(sky_uv.x + TIME * cloud_speed * 0.35, sky_uv.y * 0.9);
		vec2 cloud_uv_2 = vec2(sky_uv.x * 1.2 + TIME * cloud_speed, sky_uv.y * 1.05);
		vec4 cloud_0 = texture(cloud_layer_0, cloud_uv_0);
		vec4 cloud_1 = texture(cloud_layer_1, cloud_uv_1);
		vec4 cloud_2 = texture(cloud_layer_2, cloud_uv_2);
		sky_color = mix(sky_color, cloud_0.rgb, cloud_0.a * cloud_opacity_0);
		sky_color = mix(sky_color, cloud_1.rgb, cloud_1.a * cloud_opacity_1);
		sky_color = mix(sky_color, cloud_2.rgb, cloud_2.a * cloud_opacity_2);
	}
	float sun_elevation_visibility = smoothstep(-0.02, 0.12, sin(sun_elevation));
	vec2 sun_uv = vec2(fract(0.5 + sun_azimuth / TAU), 0.5 - sun_elevation / PI);
	vec2 sun_delta = sky_uv - sun_uv;
	sun_delta.x = mod(sun_delta.x + 0.5, 1.0) - 0.5;
	float sun_distance = length(sun_delta);
	float sun_disc = (1.0 - smoothstep(0.006, 0.013, sun_distance)) * sun_elevation_visibility;
	float sun_halo = exp(-sun_distance * 25.0) * sun_elevation_visibility * 0.22;
	float ray_angle = atan(sun_delta.y, sun_delta.x);
	float ray_spokes = pow(0.5 + 0.5 * cos(ray_angle * 14.0 + sin(ray_angle * 3.0) * 1.4), 12.0);
	float sun_rays = ray_spokes * exp(-sun_distance * 15.0) * smoothstep(0.008, 0.04, sun_distance) * ray_strength * sun_elevation_visibility;
	vec3 sunlight = LIGHT0_ENABLED ? LIGHT0_COLOR * LIGHT0_ENERGY : vec3(1.0, 0.78, 0.56);
	sky_color += sunlight * (sun_disc * 3.0 + sun_halo + sun_rays);
	COLOR = sky_color;
}`

const SOFT_SHADOW_SHADER = `shader_type spatial;
render_mode unshaded, cull_disabled;

void fragment() {
	float distance_from_center = distance(UV, vec2(0.5));
	float alpha = (1.0 - smoothstep(0.12, 0.5, distance_from_center)) * 0.34;
	ALBEDO = vec3(0.06, 0.09, 0.055);
	ALPHA = alpha;
}`

function jsonConstant(value) {
  return JSON.stringify(JSON.stringify(value))
}

function mainScript(scene, input, assets, cameraBehavior, world, multiplayer, playerScenePath, playerNodeName) {
  const behaviorByNode = cameraBehavior.node ? { [cameraBehavior.node]: cameraBehavior.script } : {}
  const childNodes = scene.nodes ?? scene.root.children ?? scene.components ?? []
  return `extends ${scene.root.type}

const NODES_JSON = ${jsonConstant(childNodes)}
const INPUT_JSON = ${jsonConstant(input.actions)}
const ASSETS_JSON = ${jsonConstant(Object.fromEntries([...assets].map(([key, item]) => [key, item.target])))}
const BEHAVIORS_JSON = ${jsonConstant(behaviorByNode)}
const WORLD_JSON = ${jsonConstant(world ?? {})}
const NETWORK_ENABLED := ${multiplayer ? 'true' : 'false'}
const PLAYER_SCENE_PATH := ${godotString(playerScenePath ?? '')}
const PLAYER_NODE_NAME := ${godotString(playerNodeName ?? '')}
const SHADOW_SHADER_SOURCE := ${godotString(SOFT_SHADOW_SHADER)}
var _world_data: Dictionary = {}
var _npc_states: Array[Dictionary] = []
var _minimap: Control
var _player_marker: ColorRect
var _npc_markers: Array[ColorRect] = []
var _dialogue_panel: PanelContainer
var _dialogue_prompt: Label
var _dialogue_name: Label
var _dialogue_text: Label
var _dialogue_open := false
var _active_npc: Dictionary = {}
var _dialogue_line := 0

func _ready() -> void:
\t_world_data = JSON.parse_string(WORLD_JSON)
\t_setup_input()
\t_spawn_ethereane_world()
\tvar nodes: Array = JSON.parse_string(NODES_JSON)
\tfor node_config in nodes:
\t\t_spawn_node(node_config, self)
${multiplayer ? `\t_create_multiplayer_ui()
\tPluffMultiplayer.configure_scene(self)
` : ''}

func _process(delta: float) -> void:
\t_update_npcs(delta)
\t_update_interaction()
\t_update_minimap()
${multiplayer ? `func configure_network_host() -> void:
\tvar player := get_node_or_null(PLAYER_NODE_NAME)
\tif player == null:
\t\tpush_error("Unable to find the configured player instance for multiplayer hosting")
\t\treturn
\tplayer.name = "Player_1"
\tplayer.configure_network(1)
\t_set_network_camera_target(player)
\tif _network_status_label != null:
\t\t_network_status_label.text = "Hosting on port %d — share your address" % PluffMultiplayer.port

func prepare_network_client() -> void:
\tvar player := get_node_or_null(PLAYER_NODE_NAME)
\tif player != null:
\t\tplayer.name = "Player_1"
\t\tplayer.configure_network(1)
\t\tplayer.visible = true
\t\tplayer.set_physics_process(true)
\t_set_network_camera_target(null)

func restore_singleplayer_after_network_error() -> void:
\tvar player: Node3D
\tif multiplayer.has_multiplayer_peer():
\t\tplayer = get_node_or_null("Player_%d" % multiplayer.get_unique_id()) as Node3D
\tif player == null:
\t\tplayer = get_node_or_null("Player_1") as Node3D
\tif player == null:
\t\tplayer = get_node_or_null(PLAYER_NODE_NAME) as Node3D
\tfor child in get_children():
\t\tif child.name.begins_with("Player_") and child != player:
\t\t\tchild.queue_free()
\tif player != null:
\t\tplayer.name = PLAYER_NODE_NAME
\t\tif player.has_method("configure_singleplayer"):
\t\t\tplayer.configure_singleplayer()
\t\tplayer.visible = true
\t\tplayer.set_physics_process(true)
\t\t_set_network_camera_target(player)

func _on_network_peer_connected(peer_id: int) -> void:
\tvar spawn_position := Vector3(float(peer_id % 3) * 1.5, 0.5, float(peer_id % 2) * 1.5)
\tspawn_network_player(1, Vector3.ZERO)
\trpc("spawn_network_player", 1, Vector3.ZERO)
\tvar existing_peers: Array[int] = []
\tfor connected_peer in multiplayer.get_peers():
\t\tif connected_peer != 1 and not existing_peers.has(connected_peer):
\t\t\texisting_peers.append(connected_peer)
\tfor existing_peer in existing_peers:
\t\tif existing_peer != peer_id:
\t\t\tvar existing_position := Vector3.ZERO if existing_peer == 1 else Vector3(float(existing_peer % 3) * 1.5, 0.5, float(existing_peer % 2) * 1.5)
\t\t\trpc_id(peer_id, "spawn_network_player", existing_peer, existing_position)
\tspawn_network_player(peer_id, spawn_position)
\trpc("spawn_network_player", peer_id, spawn_position)

func _on_network_peer_disconnected(peer_id: int) -> void:
\tif peer_id == 1 and not multiplayer.is_server():
\t\treturn
\tremove_network_player(peer_id)
\tif multiplayer.has_multiplayer_peer():
\t\trpc("remove_network_player", peer_id)

@rpc("authority", "call_remote", "reliable")
func spawn_network_player(peer_id: int, spawn_position: Vector3) -> void:
\tvar player_name := "Player_%d" % peer_id
\tvar player := get_node_or_null(player_name)
\tif player == null:
\t\tvar packed_scene := load(PLAYER_SCENE_PATH) as PackedScene
\t\tif packed_scene == null:
\t\t\tpush_error("Unable to load multiplayer player scene: " + PLAYER_SCENE_PATH)
\t\t\treturn
\t\tplayer = packed_scene.instantiate()
\t\tplayer.name = player_name
\t\tadd_child(player)
\t\tplayer.configure_network(peer_id)
\t\tplayer.global_position = spawn_position
\tplayer.visible = true
\tplayer.set_physics_process(true)
\tif peer_id == multiplayer.get_unique_id():
\t\t_set_network_camera_target(player)

@rpc("authority", "call_remote", "reliable")
func remove_network_player(peer_id: int) -> void:
\tvar player := get_node_or_null("Player_%d" % peer_id)
\tif player != null:
\t\tplayer.queue_free()

func _set_network_camera_target(target: Node3D) -> void:
\tvar camera := find_child(${godotString(cameraBehavior.node)}, true, false)
\tif camera != null and camera.has_method("set_target"):
\t\tcamera.set_target(target)

var _network_status_label: Label

func _create_multiplayer_ui() -> void:
\tvar layer := CanvasLayer.new()
\tlayer.name = "MultiplayerUI"
\tadd_child(layer)
\tvar panel := PanelContainer.new()
\tpanel.position = Vector2(16, 16)
\tlayer.add_child(panel)
\tvar layout := VBoxContainer.new()
\tpanel.add_child(layout)
\tvar address := LineEdit.new()
\taddress.placeholder_text = "Host address"
\taddress.text = ${godotString(multiplayer.default_address)}
\taddress.custom_minimum_size.x = 220
\tlayout.add_child(address)
\tvar buttons := HBoxContainer.new()
\tlayout.add_child(buttons)
\tvar host_button := Button.new()
\thost_button.text = "Host"
\thost_button.pressed.connect(func(): PluffMultiplayer.host_game())
\tbuttons.add_child(host_button)
\tvar join_button := Button.new()
\tjoin_button.text = "Join"
\tjoin_button.pressed.connect(func(): PluffMultiplayer.join_game(address.text))
\tbuttons.add_child(join_button)
\tvar leave_button := Button.new()
\tleave_button.text = "Leave"
\tleave_button.pressed.connect(func(): PluffMultiplayer.leave_game())
\tbuttons.add_child(leave_button)
\t_network_status_label = Label.new()
\t_network_status_label.text = "Single-player"
\tlayout.add_child(_network_status_label)
\tPluffMultiplayer.status_changed.connect(_set_network_status)

func _set_network_status(message: String) -> void:
\tif _network_status_label != null:
\t\t_network_status_label.text = message

` : ''}
func _get_game_player() -> Node3D:
\tif NETWORK_ENABLED and multiplayer.has_multiplayer_peer():
\t\treturn get_node_or_null("Player_%d" % multiplayer.get_unique_id()) as Node3D
\treturn get_node_or_null(PLAYER_NODE_NAME if NETWORK_ENABLED else "Player") as Node3D

func _setup_input() -> void:
\tvar actions: Dictionary = JSON.parse_string(INPUT_JSON)
\tfor action_name in actions:
\t\tvar action: Dictionary = actions[action_name]
\t\tif not InputMap.has_action(action_name):
\t\t\tInputMap.add_action(action_name, float(action.get("deadzone", 0.2)))
\t\tfor key_name in action.get("keys", []):
\t\t\tvar event := InputEventKey.new()
\t\t\tevent.physical_keycode = OS.find_keycode_from_string(_key_name(str(key_name)))
\t\t\tInputMap.action_add_event(action_name, event)

func _key_name(value: String) -> String:
\tvar aliases := {"LEFT": "Left", "RIGHT": "Right", "UP": "Up", "DOWN": "Down", "ENTER": "Enter", "SHIFT": "Shift", "SPACE": "Space"}
\treturn aliases.get(value.to_upper(), value)

func _spawn_ethereane_world() -> void:
\tvar world: Dictionary = JSON.parse_string(WORLD_JSON)
\tif world.is_empty():
\t\treturn
\tvar assets: Dictionary = JSON.parse_string(ASSETS_JSON)
\tvar tile_size := float(world.get("tile_size", 1))
\tvar grid_width := int(world.get("grid_width", 100))
\tvar grid_depth := int(world.get("grid_depth", 64))
\tvar block_height := float(world.get("block_height", 0.6))
\tvar grass_meshes: Array[Vector3] = []
\tvar plain_meshes: Array[Vector3] = []
\tfor row in range(grid_depth):
\t\tfor column in range(grid_width):
\t\t\tvar large := sin(column * 0.13 + row * 0.17) * cos(column * 0.07 - row * 0.11)
\t\t\tvar medium := sin(column * 0.31 + row * 0.29) * 0.4
\t\t\tvar small := sin(column * 0.61 + row * 0.53) * 0.2
\t\t\tvar noise := large + medium + small
\t\t\tvar x := (column - grid_width / 2.0) * tile_size + tile_size / 2.0
\t\t\tvar z := (row - grid_depth / 2.0) * tile_size + tile_size / 2.0
\t\t\tif noise > 0:
\t\t\t\tplain_meshes.append(Vector3(x, -block_height / 2.0, z))
\t\t\telse:
\t\t\t\tgrass_meshes.append(Vector3(x, -block_height / 2.0, z))
\t_create_tiled_ground("GrassBlocks", grass_meshes, tile_size, block_height, assets.get("ground", ""), assets.get("plain_ground", ""), false)
\t_create_tiled_ground("PlainGrassBlocks", plain_meshes, tile_size, block_height, assets.get("plain_ground", ""), assets.get("plain_ground", ""), true)
\tvar collision_body := StaticBody3D.new()
\tcollision_body.name = "WorldCollision"
\tadd_child(collision_body)
\tvar collision := CollisionShape3D.new()
\tcollision.name = "GroundCollision"
\tvar collision_shape := BoxShape3D.new()
\tcollision_shape.size = Vector3(float(world.get("worldWidth", 100)), 0.2, float(world.get("worldDepth", 64)))
\tcollision.shape = collision_shape
\tcollision.position.y = -0.1
\tcollision_body.add_child(collision)
\tvar prop_nodes := Node3D.new()
\tprop_nodes.name = "WorldProps"
\tadd_child(prop_nodes)
\tfor prop_variant in world.get("props", []):
\t\tvar prop := Sprite3D.new()
\t\tprop.name = "Prop_" + str(prop_variant.get("type", "bush")) + "_" + str(prop_variant.get("x", 0)).replace(".", "_")
\t\tvar texture_path := str(assets.get(str(prop_variant.get("texture", "")), ""))
\t\tif not texture_path.is_empty() and ResourceLoader.exists(texture_path):
\t\t\tprop.texture = load(texture_path) as Texture2D
\t\t\tprop.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\t\tprop.shaded = true
\t\tprop.pixel_size = float(prop_variant.get("size", 0.85)) / 32.0
\t\tprop.billboard = BaseMaterial3D.BILLBOARD_ENABLED
\t\tprop.position = Vector3(float(prop_variant.get("x", 0)), float(prop_variant.get("size", 0.85)) / 2.0, float(prop_variant.get("z", 0)))
\t\tprop_nodes.add_child(prop)
\tvar npc_nodes := Node3D.new()
\tnpc_nodes.name = "NPCs"
\tadd_child(npc_nodes)
\tfor npc_variant in world.get("npcs", []):
\t\tvar npc := AnimatedSprite3D.new()
\t\tnpc.name = "NPC_" + str(int(npc_variant.get("index", 0)))
\t\tnpc.position = Vector3(float(npc_variant.get("x", 0)), 0.75, float(npc_variant.get("z", 0)))
\t\t_create_world_character(npc, assets.get("player_sheet", ""))
\t\tnpc_nodes.add_child(npc)
\t\t_npc_states.append({
\t\t\t"node": npc,
\t\t\t"position": Vector2(npc.position.x, npc.position.z),
\t\t\t"velocity": Vector2.ZERO,
\t\t\t"wander_time": 0.0,
\t\t\t"dialogue_index": int(npc_variant.get("dialogueIndex", 0)),
\t\t\t"direction": "down",
\t\t})
\t_setup_hud(world)

func _create_sky(world: Dictionary, assets: Dictionary) -> Sky:
\tvar visuals: Dictionary = world.get("visuals", {})
\tvar sky: Dictionary = visuals.get("sky", {})
\tvar shader := Shader.new()
\tshader.code = ${godotString(SKY_BACKGROUND_SHADER)}
\tvar material := ShaderMaterial.new()
\tmaterial.shader = shader
\tmaterial.set_shader_parameter("zenith_color", Color(str(sky.get("zenith_color", "#1565c0"))))
\tmaterial.set_shader_parameter("horizon_color", Color(str(sky.get("horizon_color", "#e1f5fe"))))
\tmaterial.set_shader_parameter("cloud_speed", float(sky.get("cloud_speed", 0.004)))
\tmaterial.set_shader_parameter("sun_azimuth", deg_to_rad(float(sky.get("sun_azimuth", -35.0))))
\tmaterial.set_shader_parameter("sun_elevation", deg_to_rad(float(sky.get("sun_elevation", 35.0))))
\tmaterial.set_shader_parameter("ray_strength", float(sky.get("ray_strength", 0.2)))
\tvar gradient_name := str(sky.get("gradient_texture", ""))
\tif assets.has(gradient_name):
\t\tvar gradient_path := str(assets[gradient_name])
\t\tvar gradient_texture := load(gradient_path) as Texture2D
\t\tif gradient_texture == null:
\t\t\tpush_error("Unable to load Godot sky gradient: " + gradient_path)
\t\telse:
\t\t\tmaterial.set_shader_parameter("sky_gradient", gradient_texture)
\t\t\tmaterial.set_shader_parameter("gradient_opacity", 0.22)
\tvar cloud_names: Array = sky.get("cloud_layers", [])
\tvar cloud_opacities := [0.72, 0.66, 0.6]
\tfor index in range(mini(cloud_names.size(), 3)):
\t\tvar texture_name := str(cloud_names[index])
\t\tvar texture_path := str(assets.get(texture_name, ""))
\t\tif texture_path.is_empty():
\t\t\tcontinue
\t\tvar cloud_texture := load(texture_path) as Texture2D
\t\tif cloud_texture == null:
\t\t\tpush_error("Unable to load Godot sky cloud texture '%s': %s" % [texture_name, texture_path])
\t\telse:
\t\t\tmaterial.set_shader_parameter("cloud_layer_%d" % index, cloud_texture)
\t\t\tmaterial.set_shader_parameter("cloud_opacity_%d" % index, cloud_opacities[index])
\tvar sky_resource := Sky.new()
\tsky_resource.sky_material = material
\tsky_resource.process_mode = Sky.PROCESS_MODE_REALTIME
\treturn sky_resource

func _setup_hud(world: Dictionary) -> void:
\tvar layer := CanvasLayer.new()
\tlayer.name = "GameHUD"
\tadd_child(layer)
\tvar map := Control.new()
\tmap.name = "Minimap"
\tmap.set_anchors_preset(Control.PRESET_TOP_RIGHT)
\tmap.offset_left = -108.0
\tmap.offset_right = -12.0
\tmap.offset_top = 12.0
\tmap.offset_bottom = 72.0
\tmap.mouse_filter = Control.MOUSE_FILTER_IGNORE
\tlayer.add_child(map)
\t_minimap = map
\tvar map_background := ColorRect.new()
\tmap_background.color = Color(0.035, 0.09, 0.055, 0.82)
\tmap_background.size = Vector2(96, 60)
\tmap.add_child(map_background)
\t_player_marker = _create_map_marker(map, Color("#ffffff"), Vector2(5, 5))
\tfor _npc in world.get("npcs", []):
\t\t_npc_markers.append(_create_map_marker(map, Color("#ffc85a"), Vector2(3, 3)))
\t_dialogue_prompt = Label.new()
\t_dialogue_prompt.text = ""
\t_dialogue_prompt.horizontal_alignment = HORIZONTAL_ALIGNMENT_CENTER
\t_dialogue_prompt.add_theme_color_override("font_color", Color("#ffffff"))
\t_dialogue_prompt.add_theme_font_size_override("font_size", 16)
\t_dialogue_prompt.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
\t_dialogue_prompt.offset_left = -180.0
\t_dialogue_prompt.offset_right = 180.0
\t_dialogue_prompt.offset_top = -184.0
\t_dialogue_prompt.offset_bottom = -156.0
\tlayer.add_child(_dialogue_prompt)
\t_dialogue_panel = PanelContainer.new()
\t_dialogue_panel.name = "DialoguePanel"
\t_dialogue_panel.visible = false
\t_dialogue_panel.set_anchors_preset(Control.PRESET_CENTER_BOTTOM)
\t_dialogue_panel.offset_left = -250.0
\t_dialogue_panel.offset_right = 250.0
\t_dialogue_panel.offset_top = -146.0
\t_dialogue_panel.offset_bottom = -66.0
\tvar panel_style := StyleBoxFlat.new()
\tpanel_style.bg_color = Color(0.035, 0.055, 0.09, 0.94)
\tpanel_style.border_color = Color(0.7, 0.86, 0.76, 0.8)
\tpanel_style.set_border_width_all(2)
\tpanel_style.set_corner_radius_all(8)
\t_dialogue_panel.add_theme_stylebox_override("panel", panel_style)
\tlayer.add_child(_dialogue_panel)
\tvar dialogue_box := VBoxContainer.new()
\tdialogue_box.add_theme_constant_override("separation", 6)
\t_dialogue_panel.add_child(dialogue_box)
\t_dialogue_name = Label.new()
\t_dialogue_name.add_theme_color_override("font_color", Color("#a8d8a8"))
\t_dialogue_name.add_theme_font_size_override("font_size", 12)
\tdialogue_box.add_child(_dialogue_name)
\t_dialogue_text = Label.new()
\t_dialogue_text.autowrap_mode = TextServer.AUTOWRAP_WORD_SMART
\t_dialogue_text.add_theme_color_override("font_color", Color("#eeeeee"))
\t_dialogue_text.add_theme_font_size_override("font_size", 15)
\tdialogue_box.add_child(_dialogue_text)
\tfor npc in _npc_states:
\t\tvar sprite := npc["node"] as AnimatedSprite3D
\t\t_create_ground_shadow(sprite, -0.73)

func _create_ground_shadow(parent: Node3D, local_y: float) -> void:
\tvar shadow := MeshInstance3D.new()
\tshadow.name = "GroundShadow"
\tvar shadow_mesh := PlaneMesh.new()
\tshadow_mesh.size = Vector2(0.9, 0.9)
\tshadow.mesh = shadow_mesh
\tshadow.rotation_degrees.x = -90.0
\tshadow.position = Vector3(0, local_y, 0)
\tvar shadow_shader := Shader.new()
\tshadow_shader.code = SHADOW_SHADER_SOURCE
\tvar shadow_material := ShaderMaterial.new()
\tshadow_material.shader = shadow_shader
\tshadow.material_override = shadow_material
\tshadow.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
\tparent.add_child(shadow)

func _create_map_marker(parent: Control, color: Color, marker_size: Vector2) -> ColorRect:
\tvar marker := ColorRect.new()
\tmarker.color = color
\tmarker.size = marker_size
\tmarker.mouse_filter = Control.MOUSE_FILTER_IGNORE
\tparent.add_child(marker)
\treturn marker

func _update_minimap() -> void:
\tif _player_marker == null:
\t\treturn
\tvar player := _get_game_player()
\tif player == null:
\t\treturn
\tvar world_width := float(_world_data.get("worldWidth", 100.0))
\tvar world_depth := float(_world_data.get("worldDepth", 64.0))
\t_player_marker.position = Vector2(
\t\t4.0 + (player.global_position.x + world_width / 2.0) / world_width * 88.0,
\t\t4.0 + (player.global_position.z + world_depth / 2.0) / world_depth * 52.0
\t)
\tfor index in range(mini(_npc_markers.size(), _npc_states.size())):
\t\tvar npc_node := _npc_states[index]["node"] as Node3D
\t\t_npc_markers[index].position = Vector2(
\t\t\t4.0 + (npc_node.global_position.x + world_width / 2.0) / world_width * 88.0,
\t\t\t4.0 + (npc_node.global_position.z + world_depth / 2.0) / world_depth * 52.0
\t\t)

func _update_npcs(delta: float) -> void:
\tif _npc_states.is_empty():
\t\treturn
\tvar half_width := float(_world_data.get("halfWidth", 48.0))
\tvar half_depth := float(_world_data.get("halfDepth", 30.0))
\tvar npc_config: Dictionary = _world_data.get("npcSettings", {})
\tvar speed := float(npc_config.get("speed", 0.025)) * 60.0
\tvar wait_min := float(npc_config.get("wander_min", 60)) / 60.0
\tvar wait_max := float(npc_config.get("wander_max", 240)) / 60.0
\tfor state in _npc_states:
\t\tvar npc := state["node"] as AnimatedSprite3D
\t\tif _dialogue_open:
\t\t\tcontinue
\t\tstate["wander_time"] = float(state["wander_time"]) - delta
\t\tif float(state["wander_time"]) <= 0.0:
\t\t\tstate["wander_time"] = randf_range(wait_min, maxf(wait_min, wait_max))
\t\t\tstate["velocity"] = Vector2.ZERO if randf() < 0.25 else Vector2.RIGHT.rotated(randf() * TAU)
\t\tvar velocity: Vector2 = state["velocity"]
\t\tif velocity.length_squared() > 0.0:
\t\t\tvar next_position: Vector2 = state["position"] + velocity * speed * delta
\t\t\tnext_position.x = clampf(next_position.x, -half_width, half_width)
\t\t\tnext_position.y = clampf(next_position.y, -half_depth, half_depth)
\t\t\tstate["position"] = next_position
\t\t\tnpc.position.x = next_position.x
\t\t\tnpc.position.z = next_position.y
\t\t\tstate["direction"] = _camera_facing_direction(velocity)
\t\t\tif npc.sprite_frames != null:
\t\t\t\tnpc.play("walk_" + str(state["direction"]))
\t\telse:
\t\t\tif npc.sprite_frames != null:
\t\t\t\tnpc.play("idle_" + str(state["direction"]))

func _direction_name(direction: Vector2) -> String:
\tif absf(direction.x) > absf(direction.y):
\t\treturn "right" if direction.x > 0.0 else "left"
\treturn "down" if direction.y > 0.0 else "up"

func _camera_facing_direction(direction: Vector2) -> String:
\tvar camera := get_viewport().get_camera_3d()
\tif camera == null:
\t\treturn _direction_name(direction)
\tvar forward := -camera.global_basis.z
\tvar right := camera.global_basis.x
\tforward.y = 0.0
\tright.y = 0.0
\tif forward.length_squared() <= 0.0001 or right.length_squared() <= 0.0001:
\t\treturn _direction_name(direction)
\tvar movement := Vector3(direction.x, 0.0, direction.y)
\tvar forward_dot := movement.dot(forward.normalized())
\tvar right_dot := movement.dot(right.normalized())
\tif absf(right_dot) >= absf(forward_dot):
\t\treturn "right" if right_dot > 0.0 else "left"
\treturn "up" if forward_dot > 0.0 else "down"

func _update_interaction() -> void:
\tif _dialogue_prompt == null:
\t\treturn
\tvar player := _get_game_player()
\tif player == null:
\t\treturn
\tvar npc_config: Dictionary = _world_data.get("npcSettings", {})
\tif _dialogue_open:
\t\tif Input.is_action_just_pressed(str(npc_config.get("interact_action", "interact"))):
\t\t\t_advance_dialogue()
\t\treturn
\tvar nearest: Dictionary = {}
\tvar nearest_distance := float(npc_config.get("interact_radius", 1.2))
\tfor state in _npc_states:
\t\tvar npc := state["node"] as Node3D
\t\tvar distance := Vector2(player.global_position.x - npc.global_position.x, player.global_position.z - npc.global_position.z).length()
\t\tif distance < nearest_distance:
\t\t\tnearest = state
\t\t\tnearest_distance = distance
\t_active_npc = nearest
\t_dialogue_prompt.visible = not nearest.is_empty()
\tif not nearest.is_empty():
\t\tvar interact_action := str(npc_config.get("interact_action", "interact"))
\t\tvar input_actions: Dictionary = JSON.parse_string(INPUT_JSON)
\t\tvar action_keys: Array = input_actions.get(interact_action, {}).get("keys", ["E"])
\t\t_dialogue_prompt.text = "Press %s to talk" % str(action_keys[0]).to_upper()
\t\tif Input.is_action_just_pressed(interact_action):
\t\t\t_dialogue_open = true
\t\t\t_dialogue_panel.visible = true
\t\t\t_dialogue_prompt.visible = false
\t\t\t_dialogue_line = 0
\t\t\t_dialogue_name.text = "Wanderer %02d" % int(nearest["node"].name.trim_prefix("NPC_"))
\t\t\tvar talking_player := _get_game_player()
\t\t\tif talking_player != null:
\t\t\t\ttalking_player.set_physics_process(false)
\t\t\t_advance_dialogue(false)

func _advance_dialogue(advance: bool = true) -> void:
\tvar dialogues: Array = _world_data.get("dialogues", [])
\tvar dialogue_index := int(_active_npc.get("dialogue_index", 0))
\tvar lines: Array = dialogues[dialogue_index] if dialogue_index < dialogues.size() else []
\tif advance:
\t\t_dialogue_line += 1
\tif _dialogue_line >= lines.size():
\t\t_dialogue_open = false
\t\t_dialogue_panel.visible = false
\t\tvar talking_player := _get_game_player()
\t\tif talking_player != null:
\t\t\ttalking_player.set_physics_process(true)
\t\treturn
\t_dialogue_text.text = str(lines[_dialogue_line])

func _create_tiled_ground(node_name: String, positions: Array[Vector3], tile_size: float, block_height: float, texture_path: String, fallback_path: String, plain: bool) -> void:
\tif positions.is_empty():
\t\treturn
\tvar holder := MultiMeshInstance3D.new()
\tholder.name = node_name
\tvar multi_mesh := MultiMesh.new()
\tmulti_mesh.transform_format = MultiMesh.TRANSFORM_3D
\tmulti_mesh.instance_count = positions.size()
\tvar box := BoxMesh.new()
\tbox.size = Vector3(tile_size, block_height, tile_size)
\tmulti_mesh.mesh = box
\tvar material := StandardMaterial3D.new()
\tmaterial.albedo_color = Color(0.72, 1.0, 0.78)
\tmaterial.roughness = 0.76
\tvar selected_path := texture_path
\tif selected_path.is_empty():
\t\tselected_path = fallback_path
\tif not selected_path.is_empty() and ResourceLoader.exists(selected_path):
\t\tmaterial.albedo_texture = load(selected_path) as Texture2D
\telse:
\t\tmaterial.albedo_color = Color("#3d913e") if not plain else Color("#69a94e")
\tmaterial.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\tmaterial.specular_mode = BaseMaterial3D.SPECULAR_SCHLICK_GGX
\tholder.material_override = material
\tholder.multimesh = multi_mesh
\tfor index in range(positions.size()):
\t\tmulti_mesh.set_instance_transform(index, Transform3D(Basis.IDENTITY, positions[index]))
\tadd_child(holder)

func _create_world_character(sprite: AnimatedSprite3D, texture_path: String) -> void:
\tif texture_path.is_empty() or not ResourceLoader.exists(texture_path):
\t\tvar fallback := MeshInstance3D.new()
\t\tfallback.name = "SpriteFallback"
\t\tvar capsule := CapsuleMesh.new()
\t\tcapsule.radius = 0.25
\t\tcapsule.height = 0.9
\t\tfallback.mesh = capsule
\t\tvar material := StandardMaterial3D.new()
\t\tmaterial.albedo_color = Color(0.35, 0.75, 0.48)
\t\tfallback.material_override = material
\t\tfallback.position.y = 0.45
\t\tsprite.add_child(fallback)
\t\treturn
\tvar texture := load(texture_path) as Texture2D
\tvar columns := 6
\tvar rows := 8
\tvar frame_width := texture.get_width() / columns
\tvar frame_height := texture.get_height() / rows
\tvar frames := SpriteFrames.new()
\tframes.remove_animation("default")
\tfor direction_index in range(4):
\t\tvar direction: String = ["down", "left", "right", "up"][direction_index]
\t\tvar idle_name := "idle_" + direction
\t\tvar walk_name := "walk_" + direction
\t\tframes.add_animation(idle_name)
\t\tframes.add_animation(walk_name)
\t\tframes.set_animation_speed(idle_name, 4)
\t\tframes.set_animation_speed(walk_name, 8)
\t\tframes.set_animation_loop(idle_name, true)
\t\tframes.set_animation_loop(walk_name, true)
\t\tvar idle_row := direction_index
\t\tvar walk_row := direction_index + 4
\t\tfor column in range(4):
\t\t\t_sprite_frame(frames, idle_name, texture, column, idle_row, frame_width, frame_height)
\t\tfor column in range(columns):
\t\t\t_sprite_frame(frames, walk_name, texture, column, walk_row, frame_width, frame_height)
\tsprite.sprite_frames = frames
\tsprite.pixel_size = 0.03125
\tsprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
\tsprite.shaded = true
\tsprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\tsprite.play("idle_down")

func _spawn_node(config: Dictionary, parent: Node) -> Node:
\tvar node: Node
\tif config.has("instance"):
\t\tvar packed := load(str(config.instance)) as PackedScene
\t\tif packed == null:
\t\t\tpush_error("Unable to load Godot scene: " + str(config.instance))
\t\t\treturn null
\t\tnode = packed.instantiate()
\telse:
\t\tnode = ClassDB.instantiate(str(config.get("type", "Node3D"))) as Node
\t\tif node == null:
\t\t\tpush_error("Unable to create Godot node: " + str(config.get("type")))
\t\t\treturn null
\t\tnode.name = str(config.get("name", node.name))
\t\t_apply_properties(node, config.get("properties", {}))
\t\t_apply_mesh(node, config.get("mesh", {}))
\t\t_apply_shape(node, config.get("shape", {}))
\t\t_apply_material(node, config.get("material", {}))
\t\t_apply_world_environment(node)
\t\t_apply_sprite(node, config)
\tvar behaviors: Dictionary = JSON.parse_string(BEHAVIORS_JSON)
\tif behaviors.has(str(config.get("name", ""))):
\t\tnode.set_script(load(str(behaviors[str(config.get("name", ""))])))
\tparent.add_child(node)
\tfor field in ["components", "children", "nodes"]:
\t\tfor child_config in config.get(field, []):
\t\t\t_spawn_node(child_config, node)
\treturn node

func _apply_properties(node: Node, properties: Dictionary) -> void:
\tfor key in properties:
\t\tvar value = properties[key]
\t\tif key in ["position", "rotation_degrees", "scale"] and value is Array and value.size() == 3:
\t\t\tvalue = Vector3(value[0], value[1], value[2])
\t\telif key == "light_color" and value is String:
\t\t\tvalue = Color(value)
\t\telif key == "projection" and node is Camera3D:
\t\t\tvalue = Camera3D.PROJECTION_ORTHOGONAL if value == "orthogonal" else Camera3D.PROJECTION_PERSPECTIVE
\t\telif key == "billboard" and node is SpriteBase3D:
\t\t\tvalue = BaseMaterial3D.BILLBOARD_ENABLED if value == "enabled" else BaseMaterial3D.BILLBOARD_DISABLED
\t\telif key == "texture_filter" and node is SpriteBase3D:
\t\t\tvalue = BaseMaterial3D.TEXTURE_FILTER_NEAREST if value == "nearest" else BaseMaterial3D.TEXTURE_FILTER_LINEAR
\t\tif _has_property(node, str(key)):
\t\t\tnode.set(str(key), value)
\t\telse:
\t\t\tpush_warning("Ignoring unsupported property '%s' on %s" % [key, node.get_class()])

func _has_property(node: Object, property_name: String) -> bool:
\tfor property_info in node.get_property_list():
\t\tif property_info.name == property_name:
\t\t\treturn true
\treturn false

func _apply_mesh(node: Node, config: Dictionary) -> void:
\tif config.is_empty() or not node is MeshInstance3D:
\t\treturn
\tvar mesh := ClassDB.instantiate(str(config.get("type", ""))) as Mesh
\tif mesh == null:
\t\tpush_error("Unable to create mesh: " + str(config.get("type")))
\t\treturn
\tfor key in config:
\t\tif key == "type" or not _has_property(mesh, str(key)):
\t\t\tcontinue
\t\tvar value = config[key]
\t\tif key == "size" and value is Array and value.size() == 2:
\t\t\tvalue = Vector2(value[0], value[1])
\t\tmesh.set(str(key), value)
\tnode.mesh = mesh

func _apply_shape(node: Node, config: Dictionary) -> void:
\tif config.is_empty() or not node is CollisionShape3D:
\t\treturn
\tvar shape := ClassDB.instantiate(str(config.get("type", ""))) as Shape3D
\tif shape == null:
\t\tpush_error("Unable to create collision shape: " + str(config.get("type")))
\t\treturn
\tfor key in config:
\t\tif key != "type" and _has_property(shape, str(key)):
\t\t\tvar value = config[key]
\t\t\tif key == "size" and value is Array and value.size() == 3:
\t\t\t\tvalue = Vector3(value[0], value[1], value[2])
\t\t\tshape.set(str(key), value)
\tnode.shape = shape

func _apply_material(node: Node, config: Dictionary) -> void:
\tif config.is_empty() or not node is MeshInstance3D:
\t\treturn
\tvar material := StandardMaterial3D.new()
\tvar assets: Dictionary = JSON.parse_string(ASSETS_JSON)
\tvar texture_path := str(assets.get(str(config.get("albedo", "")), ""))
\tif not texture_path.is_empty() and ResourceLoader.exists(texture_path):
\t\tmaterial.albedo_texture = load(texture_path) as Texture2D
\telse:
\t\tmaterial.albedo_color = Color(0.24, 0.43, 0.20)
\tif config.get("uv_scale") is Array and config.uv_scale.size() == 3:
\t\tmaterial.uv1_scale = Vector3(config.uv_scale[0], config.uv_scale[1], config.uv_scale[2])
\tmaterial.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\tnode.material_override = material

func _apply_world_environment(node: Node) -> void:
\tif not node is WorldEnvironment:
\t\treturn
\tvar world: Dictionary = JSON.parse_string(WORLD_JSON)
\tvar visuals: Dictionary = world.get("visuals", {})
\tvar sky: Dictionary = visuals.get("sky", {})
\tvar fog: Dictionary = visuals.get("fog", {})
\tvar lighting: Dictionary = visuals.get("lighting", {})
\tvar post_processing: Dictionary = visuals.get("post_processing", {})
\tvar environment := Environment.new()
\tenvironment.background_mode = Environment.BG_SKY
\tenvironment.sky = _create_sky(world, JSON.parse_string(ASSETS_JSON))
\tenvironment.ambient_light_source = Environment.AMBIENT_SOURCE_SKY
\tenvironment.ambient_light_color = Color(str(lighting.get("ambient_color", "#ffffff")))
\tenvironment.ambient_light_energy = float(lighting.get("ambient_energy", 0.75))
\tenvironment.fog_enabled = float(fog.get("density", 0.008)) > 0.0
\tenvironment.fog_light_color = Color(str(fog.get("color", "#e1f5fe")))
\tenvironment.fog_density = float(fog.get("density", 0.008))
\tenvironment.fog_sky_affect = 0.0
\tenvironment.fog_depth_begin = 8.0
\tenvironment.fog_depth_end = 180.0
\tenvironment.fog_depth_curve = 1.2
\tenvironment.volumetric_fog_enabled = bool(fog.get("volumetric", false))
\tenvironment.volumetric_fog_density = float(fog.get("volumetric_density", 0.012))
\tenvironment.volumetric_fog_albedo = Color(str(fog.get("color", "#e1f5fe")))
\tenvironment.volumetric_fog_anisotropy = 0.82
\tenvironment.volumetric_fog_ambient_inject = 0.0
\tenvironment.volumetric_fog_length = 96.0
\tenvironment.volumetric_fog_detail_spread = 2.0
\tvar post_tonemap := str(post_processing.get("tonemap", "aces"))
\tenvironment.tonemap_mode = {
\t\t"linear": Environment.TONE_MAPPER_LINEAR,
\t\t"reinhardt": Environment.TONE_MAPPER_REINHARDT,
\t\t"filmic": Environment.TONE_MAPPER_FILMIC,
\t\t"aces": Environment.TONE_MAPPER_ACES,
\t}.get(post_tonemap, Environment.TONE_MAPPER_ACES)
\tenvironment.ssao_enabled = bool(post_processing.get("ssao", false))
\tenvironment.ssao_radius = float(post_processing.get("ssao_radius", 1.5))
\tenvironment.ssao_intensity = float(post_processing.get("ssao_intensity", 1.0))
\tenvironment.ssao_power = 1.35
\tenvironment.ssao_detail = 0.5
\tenvironment.ssao_horizon = 0.08
\tenvironment.ssil_enabled = bool(post_processing.get("ssil", false))
\tenvironment.ssil_radius = float(post_processing.get("ssil_radius", 5.0))
\tenvironment.ssil_intensity = float(post_processing.get("ssil_intensity", 0.6))
\tenvironment.ssr_enabled = bool(post_processing.get("ssr", false))
\tenvironment.ssr_max_steps = int(post_processing.get("ssr_max_steps", 96))
\tenvironment.ssr_depth_tolerance = float(post_processing.get("ssr_depth_tolerance", 0.2))
\tenvironment.ssr_fade_in = 0.12
\tenvironment.ssr_fade_out = 2.5
\tenvironment.glow_enabled = bool(post_processing.get("glow", false))
\tfor level in range(1, 7):
\t\tenvironment.set("glow_levels/%d" % level, true)
\tenvironment.glow_intensity = float(post_processing.get("glow_intensity", 0.45))
\tenvironment.glow_bloom = float(post_processing.get("bloom", 0.12))
\tnode.environment = environment

func _apply_sprite(node: Node, config: Dictionary) -> void:
\tif node is Sprite3D and not node is AnimatedSprite3D:
\t\tvar assets: Dictionary = JSON.parse_string(ASSETS_JSON)
\t\tvar texture_path := str(assets.get(str(config.get("texture", "")), ""))
\t\tif not texture_path.is_empty() and ResourceLoader.exists(texture_path):
\t\t\tnode.texture = load(texture_path) as Texture2D
\t\t\tnode.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\t\treturn
\tif not node is AnimatedSprite3D:
\t\treturn
\tvar assets: Dictionary = JSON.parse_string(ASSETS_JSON)
\tvar texture_path := str(assets.get(str(config.get("texture", "")), ""))
\tif texture_path.is_empty() or not ResourceLoader.exists(texture_path):
\t\tvar fallback := MeshInstance3D.new()
\t\tfallback.name = "SpriteFallback"
\t\tvar capsule := CapsuleMesh.new()
\t\tcapsule.radius = 0.25
\t\tcapsule.height = 0.9
\t\tfallback.mesh = capsule
\t\tvar material := StandardMaterial3D.new()
\t\tmaterial.albedo_color = Color(0.35, 0.75, 0.48)
\t\tfallback.material_override = material
\t\tfallback.position.y = 0.45
\t\tnode.add_child(fallback)
\t\treturn
\tvar animation: Dictionary = config.get("animation", {})
\tvar sprite_frames := SpriteFrames.new()
\tsprite_frames.remove_animation("default")
\tvar texture := load(texture_path) as Texture2D
\tvar columns := int(animation.get("columns", 1))
\tvar rows := int(animation.get("rows", 1))
\tvar frame_width := texture.get_width() / columns
\tvar frame_height := texture.get_height() / rows
\tfor direction_index in range(animation.get("directions", []).size()):
\t\tvar direction: String = animation.directions[direction_index]
\t\tvar idle_name := "idle_" + direction
\t\tvar walk_name := "walk_" + direction
\t\tsprite_frames.add_animation(idle_name)
\t\tsprite_frames.add_animation(walk_name)
\t\tsprite_frames.set_animation_speed(walk_name, float(animation.get("frames_per_second", 8)))
\t\tsprite_frames.set_animation_loop(walk_name, true)
\t\tvar idle_row := int(animation.get("idle_row_offset", 0)) + direction_index
\t\tvar walk_row := int(animation.get("walk_row_offset", 0)) + direction_index
\t\t_sprite_frame(sprite_frames, idle_name, texture, 0, idle_row, frame_width, frame_height)
\t\tfor column in range(columns):
\t\t\t_sprite_frame(sprite_frames, walk_name, texture, column, walk_row, frame_width, frame_height)
\tnode.sprite_frames = sprite_frames
\tnode.pixel_size = float(config.get("pixel_size", 0.025))
\tnode.billboard = BaseMaterial3D.BILLBOARD_ENABLED if config.get("billboard", "enabled") == "enabled" else BaseMaterial3D.BILLBOARD_DISABLED
\tnode.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST

func _sprite_frame(frames: SpriteFrames, animation: String, texture: Texture2D, column: int, row: int, width: int, height: int) -> void:
\tvar atlas := AtlasTexture.new()
\tatlas.atlas = texture
\tatlas.region = Rect2(column * width, row * height, width, height)
\tframes.add_frame(animation, atlas)
`
}

function playerScript(behavior, playerScene, assets, world, multiplayer) {
  const movement = behavior.movement
  const playerComponents = playerScene.components ?? playerScene.root.components ?? playerScene.root.children ?? []
  assert(Array.isArray(movement?.input) && movement.input.length === 4, 'Player behavior movement.input must list left, right, up, and down actions')
  assert(movement.input.every(name => /^[a-z][a-z0-9_]*$/.test(name)), 'Player behavior input actions must be valid action names')
  assert(Number.isFinite(movement.speed) && movement.speed > 0, 'Player behavior movement.speed must be a positive number')
  assert(movement.camera_relative === undefined || typeof movement.camera_relative === 'boolean', 'Player behavior camera_relative must be true or false')
  assert(movement.normalize_diagonal === undefined || typeof movement.normalize_diagonal === 'boolean', 'Player behavior normalize_diagonal must be true or false')
  assert(['project_default', 'none'].includes(movement.gravity), 'Player behavior gravity must be project_default or none')
  assert(movement.run_action === undefined || typeof movement.run_action === 'string', 'Player behavior run_action must be an input action name')
  assert(movement.run_multiplier === undefined || (Number.isFinite(movement.run_multiplier) && movement.run_multiplier > 0), 'Player behavior run_multiplier must be positive')
  assert(movement.jump_action === undefined || (typeof movement.jump_action === 'string' && movement.jump_action.length > 0), 'Player behavior jump_action must be a non-empty input action name')
  assert(movement.jump_velocity === undefined || (Number.isFinite(movement.jump_velocity) && movement.jump_velocity > 0), 'Player behavior jump_velocity must be positive')
  assert(movement.jump_action === undefined || movement.gravity === 'project_default', 'Player jumping requires movement.gravity: project_default')
  assert(movement.jump_velocity === undefined || movement.jump_action !== undefined, 'Player movement.jump_velocity requires movement.jump_action')
  for (const key of ['acceleration', 'deceleration']) {
    if (movement[key] !== undefined) assert(Number.isFinite(movement[key]) && movement[key] > 0, `Player behavior movement.${key} must be positive`)
  }
  assert(behavior.animation?.moving === 'walk_{direction}' && behavior.animation?.idle === 'idle_{direction}', 'Player animation must use walk_{direction} and idle_{direction}')
  assert(behavior.animation?.facing_priority === 'dominant_axis', 'Player facing_priority must be dominant_axis')
  const [left, right, up, down] = movement.input.map(godotString)
  return `extends CharacterBody3D

const MOVE_SPEED := ${movement.speed}
const MOVE_RUN_MULTIPLIER := ${movement.run_multiplier ?? 1}
const MOVE_ACCELERATION := ${movement.acceleration ?? 0}
const MOVE_DECELERATION := ${movement.deceleration ?? 0}
const JUMP_VELOCITY := ${movement.jump_velocity ?? 0}
const CAMERA_RELATIVE := ${movement.camera_relative === true ? 'true' : 'false'}
const ACTION_LEFT := ${left}
const ACTION_RIGHT := ${right}
const ACTION_UP := ${up}
const ACTION_DOWN := ${down}
const ACTION_RUN := ${godotString(movement.run_action ?? '')}
const ACTION_JUMP := ${godotString(movement.jump_action ?? '')}
const COMPONENTS_JSON := ${jsonConstant(playerComponents)}
const ASSETS_JSON := ${jsonConstant(Object.fromEntries([...assets].map(([key, item]) => [key, item.target])))}
const WORLD_JSON := ${jsonConstant(world ?? {})}
${multiplayer ? `const NETWORK_SYNC_INTERVAL := ${1 / multiplayer.sync_rate}
var _network_enabled := false
var _network_owner_peer_id := 1
var _network_input := Vector2.ZERO
var _network_running := false
var _network_facing := "down"
var _network_jump_requested := false
var _network_last_input_msec := 0
var _network_sync_elapsed := 0.0
var _network_target_position := Vector3.ZERO
var _network_target_valid := false` : ''}
const SHADOW_SHADER_SOURCE := ${godotString(SOFT_SHADOW_SHADER)}

var _facing := "down"
@onready var _sprite = get_node_or_null("Sprite")

func _ready() -> void:
\tfor config in JSON.parse_string(COMPONENTS_JSON):
\t\t_create_component(config, self)
\t_sprite = get_node_or_null("Sprite")
\t_create_ground_shadow()

${multiplayer ? `func configure_network(owner_peer_id: int) -> void:
\t_network_enabled = true
\t_network_owner_peer_id = owner_peer_id
\t_network_target_position = global_position
\t_network_target_valid = true
\t_network_sync_elapsed = -0.5
\tset_multiplayer_authority(1)
\tset_physics_process(true)
\tvisible = true

func configure_singleplayer() -> void:
\t_network_enabled = false
\t_network_owner_peer_id = 1
\t_network_input = Vector2.ZERO
\t_network_jump_requested = false
\t_network_target_valid = false

func _process(delta: float) -> void:
\tif _network_enabled and multiplayer.has_multiplayer_peer() and not multiplayer.is_server() and _network_target_valid:
\t\tglobal_position = global_position.lerp(_network_target_position, minf(delta * 15.0, 1.0))

@rpc("any_peer", "call_remote", "unreliable")
func _receive_network_input(direction: Vector2, running: bool, facing: String) -> void:
\tif not multiplayer.is_server() or multiplayer.get_remote_sender_id() != _network_owner_peer_id or _network_owner_peer_id == 1:
\t\treturn
\t_network_input = direction.limit_length(1.0)
\t_network_running = running
\t_network_facing = facing
\t_network_last_input_msec = Time.get_ticks_msec()

@rpc("any_peer", "call_remote", "reliable")
func _request_network_jump() -> void:
\tif multiplayer.is_server() and multiplayer.get_remote_sender_id() == _network_owner_peer_id and _network_owner_peer_id != 1:
\t\t_network_jump_requested = true

@rpc("authority", "call_remote", "unreliable")
func _apply_network_state(position: Vector3, facing: String, animation_name: String) -> void:
\tif multiplayer.is_server():
\t\treturn
\t_network_target_position = position
\t_network_target_valid = true
\t_facing = facing
\t_play_animation(animation_name)

` : ''}
func _physics_process(delta: float) -> void:
\tif _network_enabled and not multiplayer.has_multiplayer_peer():
\t\tconfigure_singleplayer()
\tvar input := Input.get_vector(ACTION_LEFT, ACTION_RIGHT, ACTION_UP, ACTION_DOWN)
\tvar direction := Vector3(input.x, 0.0, input.y)
\tvar is_running := ACTION_RUN != "" and Input.is_action_pressed(ACTION_RUN)
${multiplayer ? `\tif _network_enabled:
\t\tif multiplayer.is_server():
\t\t\tif _network_owner_peer_id != 1:
\t\t\t\tif Time.get_ticks_msec() - _network_last_input_msec > 250:
\t\t\t\t\t_network_input = Vector2.ZERO
\t\t\t\t\t_network_running = false
\t\t\t\tinput = _network_input
\t\t\t\tdirection = Vector3(input.x, 0.0, input.y)
\t\t\t\tis_running = _network_running
\t\telse:
\t\t\tif _network_owner_peer_id != multiplayer.get_unique_id():
\t\t\t\treturn
\t\t\tif CAMERA_RELATIVE:
\t\t\t\tdirection = _camera_relative_direction(input)
\t\t\tif direction.length_squared() > 0.0 and ${movement.normalize_diagonal === false ? 'false' : 'true'}:
\t\t\t\tdirection = direction.normalized()
\t\t\trpc_id(1, "_receive_network_input", Vector2(direction.x, direction.z), is_running, _direction_for_input(input))
\t\t\tif ACTION_JUMP != "" and Input.is_action_just_pressed(ACTION_JUMP):
\t\t\t\trpc_id(1, "_request_network_jump")
\t\t\treturn
` : ''}\tif CAMERA_RELATIVE${multiplayer ? ' and not (_network_enabled and multiplayer.is_server() and _network_owner_peer_id != 1)' : ''}:
\t\tvar camera := get_viewport().get_camera_3d()
\t\tif camera != null:
\t\t\tvar forward := -camera.global_basis.z
\t\t\tvar right := camera.global_basis.x
\t\t\tforward.y = 0.0
\t\t\tright.y = 0.0
\t\t\tif forward.length_squared() > 0.0001 and right.length_squared() > 0.0001:
\t\t\t\tdirection = right.normalized() * input.x - forward.normalized() * input.y
\tif direction.length_squared() > 0.0 and ${movement.normalize_diagonal === false ? 'false' : 'true'}:
\t\tdirection = direction.normalized()
\tvar current_speed := MOVE_SPEED
\tif is_running:
\t\tcurrent_speed *= MOVE_RUN_MULTIPLIER
${movement.acceleration !== undefined || movement.deceleration !== undefined ? `\tvar target_horizontal := Vector2(direction.x * current_speed, direction.z * current_speed)
\tvar current_horizontal := Vector2(velocity.x, velocity.z)
\tvar horizontal_rate := MOVE_ACCELERATION if direction.length_squared() > 0.0 else MOVE_DECELERATION
\tif horizontal_rate > 0.0:
\t\tcurrent_horizontal = current_horizontal.move_toward(target_horizontal, horizontal_rate * delta)
\telse:
\t\tcurrent_horizontal = target_horizontal
\tvelocity.x = current_horizontal.x
\tvelocity.z = current_horizontal.y
` : '\tvelocity.x = direction.x * current_speed\n\tvelocity.z = direction.z * current_speed\n'}${movement.jump_action ? (multiplayer ? '\tif is_on_floor() and ((_network_enabled and multiplayer.is_server() and _network_owner_peer_id != 1 and _network_jump_requested) or (_network_owner_peer_id == 1 and Input.is_action_just_pressed(ACTION_JUMP)) or (not _network_enabled and Input.is_action_just_pressed(ACTION_JUMP))):\n\t\tvelocity.y = JUMP_VELOCITY\n\t_network_jump_requested = false\n' : '\tif is_on_floor() and Input.is_action_just_pressed(ACTION_JUMP):\n\t\tvelocity.y = JUMP_VELOCITY\n') : ''}${movement.gravity === 'project_default' ? '\tif not is_on_floor():\n\t\tvelocity.y -= float(ProjectSettings.get_setting("physics/3d/default_gravity")) * delta\n\telif velocity.y < 0.0:\n\t\tvelocity.y = 0.0\n' : ''}
\tif direction.length_squared() > 0.0:
\t\tif _network_enabled and multiplayer.is_server() and _network_owner_peer_id != 1:
\t\t\t_facing = _network_facing
\t\telse:
\t\t\t_facing = _direction_for_input(input) if CAMERA_RELATIVE else _direction_for(direction)
\t\t_play_animation(("run_" if is_running else "walk_") + _facing)
\telse:
\t\t_play_animation("idle_" + _facing)
\tmove_and_slide()
\tvar world: Dictionary = JSON.parse_string(WORLD_JSON)
\tif not world.is_empty():
\t\tglobal_position.x = clampf(global_position.x, -float(world.get("halfWidth", 48)), float(world.get("halfWidth", 48)))
\t\tglobal_position.z = clampf(global_position.z, -float(world.get("halfDepth", 30)), float(world.get("halfDepth", 30)))
\t\tfor prop_variant in world.get("props", []):
\t\t\tif bool(prop_variant.get("collision", false)):
\t\t\t\tvar prop_position := Vector3(float(prop_variant.get("x", 0)), 0.0, float(prop_variant.get("z", 0)))
\t\t\t\tvar prop_delta := Vector2(global_position.x - prop_position.x, global_position.z - prop_position.z)
\t\t\t\tvar minimum_distance := 0.28 + float(prop_variant.get("radius", 0.32))
\t\t\t\tif prop_delta.length() > 0.0001 and prop_delta.length() < minimum_distance:
\t\t\t\t\tvar push := prop_delta.normalized() * (minimum_distance - prop_delta.length())
\t\t\t\t\tglobal_position.x += push.x
\t\t\t\t\tglobal_position.z += push.y
${multiplayer ? `\tif _network_enabled and multiplayer.is_server():
\t\t_network_sync_elapsed += delta
\t\tif _network_sync_elapsed >= NETWORK_SYNC_INTERVAL:
\t\t\t_network_sync_elapsed = 0.0
\t\t\tvar animation_name := ("run_" if is_running else "walk_") + _facing if direction.length_squared() > 0.0 else "idle_" + _facing
\t\t\trpc("_apply_network_state", global_position, _facing, animation_name)
` : ''}

func _play_animation(animation_name: String) -> void:
\tif _sprite != null and _sprite.sprite_frames != null and _sprite.sprite_frames.has_animation(animation_name):
\t\t_sprite.play(animation_name)

func _create_ground_shadow() -> void:
\tvar shadow := MeshInstance3D.new()
\tshadow.name = "GroundShadow"
\tvar shadow_mesh := PlaneMesh.new()
\tshadow_mesh.size = Vector2(0.9, 0.9)
\tshadow.mesh = shadow_mesh
\tshadow.rotation_degrees.x = -90.0
\tshadow.position.y = -0.48
\tvar shadow_shader := Shader.new()
\tshadow_shader.code = SHADOW_SHADER_SOURCE
\tvar shadow_material := ShaderMaterial.new()
\tshadow_material.shader = shadow_shader
\tshadow.material_override = shadow_material
\tshadow.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF
\tadd_child(shadow)

func _direction_for(direction: Vector3) -> String:
\tif absf(direction.x) > absf(direction.z):
\t\treturn "right" if direction.x > 0.0 else "left"
\treturn "down" if direction.z > 0.0 else "up"

func _direction_for_input(input: Vector2) -> String:
\tif absf(input.x) > absf(input.y):
\t\treturn "right" if input.x > 0.0 else "left"
\treturn "down" if input.y > 0.0 else "up"

func _camera_relative_direction(input: Vector2) -> Vector3:
\tvar direction := Vector3(input.x, 0.0, input.y)
\tvar camera := get_viewport().get_camera_3d()
\tif camera == null:
\t\treturn direction
\tvar forward := -camera.global_basis.z
\tvar right := camera.global_basis.x
\tforward.y = 0.0
\tright.y = 0.0
\tif forward.length_squared() > 0.0001 and right.length_squared() > 0.0001:
\t\treturn right.normalized() * input.x - forward.normalized() * input.y
\treturn direction

func _create_component(config: Dictionary, parent: Node) -> Node:
\tvar component := ClassDB.instantiate(str(config.get("type", ""))) as Node
\tif component == null:
\t\tpush_error("Unable to create player component: " + str(config.get("type")))
\t\treturn null
\tcomponent.name = str(config.get("name", component.get_class()))
\tparent.add_child(component)
\tif component is Node3D:
\t\tvar position: Array = config.get("position", [0.0, 0.0, 0.0])
\t\tcomponent.position = Vector3(position[0], position[1], position[2])
\tif component is CollisionShape3D:
\t\tvar shape_config: Dictionary = config.get("shape", {})
\t\tvar shape := ClassDB.instantiate(str(shape_config.get("type", ""))) as Shape3D
\t\tif shape == null:
\t\t\tpush_error("Unable to create player collision shape")
\t\telse:
\t\t\tfor key in shape_config:
\t\t\t\tif key != "type":
\t\t\t\t\tvar value = shape_config[key]
\t\t\t\t\tif key == "size" and value is Array and value.size() == 3:
\t\t\t\t\t\tvalue = Vector3(value[0], value[1], value[2])
\t\t\t\t\tshape.set(str(key), value)
\t\t\tcomponent.shape = shape
\telif component is AnimatedSprite3D:
\t\t_setup_sprite(component, config)
\tfor child in config.get("children", []):
\t\t_create_component(child, component)
\treturn component

func _setup_sprite(component: AnimatedSprite3D, config: Dictionary) -> void:
\tvar assets: Dictionary = JSON.parse_string(ASSETS_JSON)
\tvar texture_path := str(assets.get(str(config.get("texture", "")), ""))
\tif texture_path.is_empty() or not ResourceLoader.exists(texture_path):
\t\tvar fallback := MeshInstance3D.new()
\t\tfallback.name = "SpriteFallback"
\t\tvar capsule := CapsuleMesh.new()
\t\tcapsule.radius = 0.25
\t\tcapsule.height = 0.9
\t\tfallback.mesh = capsule
\t\tvar material := StandardMaterial3D.new()
\t\tmaterial.albedo_color = Color(0.35, 0.75, 0.48)
\t\tfallback.material_override = material
\t\tfallback.position.y = 0.45
\t\tcomponent.add_child(fallback)
\t\treturn
\tvar animation: Dictionary = config.get("animation", {})
\tvar columns := int(animation.get("columns", 1))
\tvar texture := load(texture_path) as Texture2D
\tvar frame_width := texture.get_width() / columns
\tvar frame_height := texture.get_height() / int(animation.get("rows", 1))
\tvar frames := SpriteFrames.new()
\tframes.remove_animation("default")
\tfor direction_index in range(animation.get("directions", []).size()):
\t\tvar direction: String = animation.directions[direction_index]
\t\tvar idle_name := "idle_" + direction
\t\tvar walk_name := "walk_" + direction
\t\tvar run_name := "run_" + direction
\t\tframes.add_animation(idle_name)
\t\tframes.add_animation(walk_name)
\t\tframes.add_animation(run_name)
\t\tframes.set_animation_speed(walk_name, float(animation.get("frames_per_second", 8)))
\t\tframes.set_animation_speed(run_name, float(animation.get("run_frames_per_second", float(animation.get("frames_per_second", 8)) * 1.65)))
\t\tframes.set_animation_loop(walk_name, true)
\t\tframes.set_animation_loop(run_name, true)
\t\tvar run_row := int(animation.get("run_row_offset", animation.get("walk_row_offset", 0))) + direction_index
\t\t_add_atlas_frame(frames, idle_name, texture, 0, int(animation.get("idle_row_offset", 0)) + direction_index, frame_width, frame_height)
\t\tfor column in range(columns):
\t\t\t_add_atlas_frame(frames, walk_name, texture, column, int(animation.get("walk_row_offset", 0)) + direction_index, frame_width, frame_height)
\t\t\t_add_atlas_frame(frames, run_name, texture, column, run_row, frame_width, frame_height)
\tcomponent.sprite_frames = frames
\tcomponent.pixel_size = float(config.get("pixel_size", 0.025))
\tcomponent.billboard = BaseMaterial3D.BILLBOARD_ENABLED
\tcomponent.shaded = bool(config.get("shaded", true))
\tcomponent.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST

func _add_atlas_frame(frames: SpriteFrames, animation: String, texture: Texture2D, column: int, row: int, width: int, height: int) -> void:
\tvar atlas := AtlasTexture.new()
\tatlas.atlas = texture
\tatlas.region = Rect2(column * width, row * height, width, height)
\tframes.add_frame(animation, atlas)
`
}

function cameraScript(behavior) {
  assert(Array.isArray(behavior.follow?.offset) && behavior.follow.offset.length === 3, 'Camera behavior follow.offset must contain three numbers')
  assert(Array.isArray(behavior.look_at?.target_offset) && behavior.look_at.target_offset.length === 3, 'Camera behavior look_at.target_offset must contain three numbers')
  assert(typeof behavior.target === 'string' && behavior.target.length > 0, 'Camera behavior target must be a NodePath')
  assert(['orthogonal', 'perspective'].includes(behavior.projection), 'Camera projection must be orthogonal or perspective')
  assert([...behavior.follow.offset, ...behavior.look_at.target_offset].every(Number.isFinite), 'Camera offsets must contain only numbers')
  const offset = `Vector3(${behavior.follow.offset.join(', ')})`
  const lookOffset = `Vector3(${behavior.look_at.target_offset.join(', ')})`
  const smoothing = Number(behavior.follow.smoothing)
  assert(Number.isFinite(smoothing) && smoothing > 0, 'Camera behavior smoothing must be positive')
  const zoom = behavior.zoom ?? {}
  assert(zoom && typeof zoom === 'object' && !Array.isArray(zoom), 'Camera behavior zoom must be a mapping')
  const minDistance = zoom.min_distance ?? 1.1
  const maxDistance = zoom.max_distance ?? 9.0
  const zoomStep = zoom.step ?? 0.14
  const mouseSensitivity = zoom.mouse_sensitivity ?? 0.0055
  const minPitch = zoom.min_pitch ?? 0.4
  const maxPitch = zoom.max_pitch ?? 1.45
  assert(Number.isFinite(minDistance) && minDistance > 0, 'Camera zoom.min_distance must be positive')
  assert(Number.isFinite(maxDistance) && maxDistance >= minDistance, 'Camera zoom.max_distance must be at least min_distance')
  assert(Number.isFinite(zoomStep) && zoomStep > 0, 'Camera zoom.step must be positive')
  assert(Number.isFinite(mouseSensitivity) && mouseSensitivity > 0, 'Camera zoom.mouse_sensitivity must be positive')
  assert(Number.isFinite(minPitch) && minPitch >= 0, 'Camera zoom.min_pitch must be non-negative')
  assert(Number.isFinite(maxPitch) && maxPitch <= Math.PI, 'Camera zoom.max_pitch must not exceed PI')
  assert(maxPitch > minPitch, 'Camera zoom.max_pitch must be greater than min_pitch')
  return `extends Camera3D

const TARGET_PATH := ${godotString(behavior.target)}
const FOLLOW_OFFSET := ${offset}
const LOOK_OFFSET := ${lookOffset}
const SMOOTHING := ${smoothing}
const MIN_DISTANCE := ${minDistance}
const MAX_DISTANCE := ${maxDistance}
const ZOOM_STEP := ${zoomStep}
const MOUSE_SENSITIVITY := ${mouseSensitivity}
const MIN_PITCH := ${minPitch}
const MAX_PITCH := ${maxPitch}

@onready var _target: Node3D = get_node_or_null(TARGET_PATH) as Node3D

func _ready() -> void:
\tprojection = Camera3D.PROJECTION_ORTHOGONAL if ${behavior.projection === 'orthogonal' ? 'true' : 'false'} else Camera3D.PROJECTION_PERSPECTIVE
\tfar = 500.0
\tif projection == Camera3D.PROJECTION_PERSPECTIVE:
\t\tfov = 50.0

func set_target(target: Node3D) -> void:
\t_target = target

var _yaw := 0.0
var _pitch := 0.75
var _distance := clampf(FOLLOW_OFFSET.length(), MIN_DISTANCE, MAX_DISTANCE)
var _dragging := false
var _last_mouse := Vector2.ZERO

func _unhandled_input(event: InputEvent) -> void:
\tif event is InputEventMouseButton:
\t\tvar button_event := event as InputEventMouseButton
\t\tif button_event.button_index == MOUSE_BUTTON_WHEEL_UP:
\t\t\t_distance = clampf(_distance - ZOOM_STEP, MIN_DISTANCE, MAX_DISTANCE)
\t\telif button_event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
\t\t\t_distance = clampf(_distance + ZOOM_STEP, MIN_DISTANCE, MAX_DISTANCE)
\tif event is InputEventMouseMotion:
\t\tvar motion := event as InputEventMouseMotion
\t\tif Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
\t\t\t_yaw -= motion.relative.x * MOUSE_SENSITIVITY
\t\t\t_pitch = clampf(_pitch - motion.relative.y * MOUSE_SENSITIVITY, MIN_PITCH, MAX_PITCH)

func _process(delta: float) -> void:
\tif _target == null:
\t\treturn
\tvar sin_pitch := sin(_pitch)
\tvar desired_position := _target.global_position + Vector3(
\t\tsin_pitch * sin(_yaw) * _distance,
\t\tcos(_pitch) * _distance + float(LOOK_OFFSET.y),
\t\tsin_pitch * cos(_yaw) * _distance
\t)
\tglobal_position = global_position.lerp(desired_position, clampf(SMOOTHING, 0.01, 1.0))
\tlook_at(_target.global_position + LOOK_OFFSET, Vector3.UP)
`
}

function multiplayerScript(config) {
  return `extends Node

signal status_changed(message: String)

const PORT := ${config.port}
const MAX_CLIENTS := ${config.max_clients}
var port := PORT
var _peer: ENetMultiplayerPeer

func _ready() -> void:
\tmultiplayer.peer_connected.connect(_on_peer_connected)
\tmultiplayer.peer_disconnected.connect(_on_peer_disconnected)
\tmultiplayer.connected_to_server.connect(_on_connected_to_server)
\tmultiplayer.connection_failed.connect(_on_connection_failed)
\tmultiplayer.server_disconnected.connect(_on_server_disconnected)

func configure_scene(scene: Node) -> void:
\tif scene == null:
\t\tpush_error("Multiplayer scene is not available")

func host_game() -> void:
\tleave_game(false)
\t_peer = ENetMultiplayerPeer.new()
\tvar error := _peer.create_server(PORT, MAX_CLIENTS)
\tif error != OK:
\t\t_peer = null
\t\tpush_error("Unable to host ENet multiplayer game: " + error_string(error))
\t\tstatus_changed.emit("Host failed: " + error_string(error))
\t\treturn
\tport = PORT
\tmultiplayer.multiplayer_peer = _peer
\tvar scene := get_tree().current_scene
\tif scene != null and scene.has_method("configure_network_host"):
\t\tscene.configure_network_host()
\tstatus_changed.emit("Hosting on port %d — share your address" % PORT)

func join_game(address: String) -> void:
\tvar host := address.strip_edges()
\tif host.is_empty():
\t\tstatus_changed.emit("Enter a host address")
\t\treturn
\tleave_game(false)
\t_peer = ENetMultiplayerPeer.new()
\tvar error := _peer.create_client(host, PORT)
\tif error != OK:
\t\t_peer = null
\t\tpush_error("Unable to join ENet multiplayer game: " + error_string(error))
\t\tstatus_changed.emit("Join failed: " + error_string(error))
\t\treturn
\tmultiplayer.multiplayer_peer = _peer
\tvar scene := get_tree().current_scene
\tif scene != null and scene.has_method("prepare_network_client"):
\t\tscene.prepare_network_client()
\tstatus_changed.emit("Connecting to %s:%d..." % [host, PORT])

func leave_game(show_status: bool = true) -> void:
\tvar scene := get_tree().current_scene
\tif scene != null and scene.has_method("restore_singleplayer_after_network_error"):
\t\tscene.restore_singleplayer_after_network_error()
\tif multiplayer.multiplayer_peer != null:
\t\tmultiplayer.multiplayer_peer.close()
\tmultiplayer.multiplayer_peer = null
\t_peer = null
\tif show_status:
\t\tstatus_changed.emit("Single-player")

func _on_peer_connected(peer_id: int) -> void:
\tif not multiplayer.is_server():
\t\treturn
\tvar scene := get_tree().current_scene
\tif scene != null and scene.has_method("_on_network_peer_connected"):
\t\tscene.call_deferred("_on_network_peer_connected", peer_id)

func _on_peer_disconnected(peer_id: int) -> void:
\tvar scene := get_tree().current_scene
\tif scene != null and scene.has_method("_on_network_peer_disconnected"):
\t\tscene.call_deferred("_on_network_peer_disconnected", peer_id)
\tstatus_changed.emit("Player %d disconnected" % peer_id)

func _on_connected_to_server() -> void:
\tstatus_changed.emit("Connected — ready to play")

func _on_connection_failed() -> void:
\tpush_warning("Godot multiplayer connection failed")
\tleave_game(false)
\tstatus_changed.emit("Connection failed")

func _on_server_disconnected() -> void:
\tpush_warning("Godot multiplayer server disconnected")
\tleave_game(false)
\tstatus_changed.emit("Host disconnected")
`
}

function exportPresets(config, projectName) {
  const entries = []
  let index = 0
  for (const [key, settings] of Object.entries(config.presets)) {
    if (!settings.runnable) continue
    const platform = EXPORT_PLATFORMS[key]
    const slug = key === 'macos' ? 'macos' : key
    const options = {
      windows: ['binary_format/embed_pck=true', 'codesign/enable=false', 'custom_template/debug=""', 'custom_template/release=""'],
      linux: ['binary_format/embed_pck=false', 'custom_template/debug=""', 'custom_template/release=""'],
      macos: ['binary_format/architecture="universal"', 'codesign/enable=false', 'custom_template/debug=""', 'custom_template/release=""'],
      web: ['variant/extensions_support=false', 'vram_texture_compression/for_desktop=true', 'custom_template/debug=""', 'custom_template/release=""'],
    }[key]
    entries.push(
      `[preset.${index}]`,
      `name=${godotString(platform.name)}`,
      `platform=${godotString(platform.name)}`,
      'runnable=true',
      'dedicated_server=false',
      'custom_features=""',
      'export_filter="all_resources"',
      'include_filter=""',
      'exclude_filter=""',
      `export_path=${godotString(`build/${slug}/${projectName}${platform.extension}`)}`,
      'encryption_include_filters=""',
      'encryption_exclude_filters=""',
      'encrypt_pck=false',
      'encrypt_directory=false',
      '',
      `[preset.${index}.options]`,
      ...options,
      '',
    )
    index += 1
  }
  return entries.join('\n')
}

function exportGuide(config, projectName) {
  const platforms = Object.entries(config.presets)
    .filter(([, settings]) => settings.runnable)
    .map(([key]) => `- ${EXPORT_PLATFORMS[key].name}`)
  return `# Godot exports

Generated export presets:

${platforms.join('\n')}

Install the matching Godot export templates, then export from **Project > Export**
or use the Godot editor's command line:

\`\`\`sh
godot --headless --path . --editor --quit
godot --headless --path . --export-debug "Windows Desktop" build/windows/${path.basename(projectName).replace(/[^A-Za-z0-9_-]/g, '-')}.exe
\`\`\`

Platform presets are project configuration; the Godot export templates and any
platform-specific signing tools must be installed separately.
`
}

function registerAssets(assets, copiedAssets) {
  const missingOptional = []
  for (const [name, asset] of assets) {
    asset.target = copiedAssets.mapping.get(asset.source)
    if (!asset.target) {
      if (asset.optional) {
        missingOptional.push(asset.source)
        continue
      }
      throw new Error(`[Godot generator] Required asset "${name}" does not exist under ${asset.source}`)
    }
  }
  return missingOptional
}

export function generateGodotProject({ tatemonoPath, outputDir }) {
  const absoluteTatemonoPath = path.resolve(tatemonoPath)
  const absoluteOutputPath = path.resolve(outputDir)
  const tatemonoDir = path.dirname(absoluteTatemonoPath)
  assert(fs.existsSync(absoluteTatemonoPath), `Tatemono file does not exist: ${absoluteTatemonoPath}`)
  assert(path.basename(absoluteTatemonoPath) === 'core.tsx', 'Godot generation expects a Tatemono core.tsx file')
  const source = fs.readFileSync(absoluteTatemonoPath, 'utf8')
  const model = parseTatemono(source, absoluteTatemonoPath)
  validateGameFreeFiles(source, 'Godot generator')

  const outputScenes = [...model.scenes.values()]
  const playerBehavior = model.behaviors.get('player')
  const playerSceneInstances = []
  walkNodeConfigs(model.scenes.get(model.project.main_scene), node => {
    if (node.instance === playerBehavior.scene) playerSceneInstances.push(node)
  })
  if (model.multiplayer) {
    assert(playerSceneInstances.length === 1, 'Godot multiplayer requires exactly one player scene instance in the main scene')
    model.multiplayer.player_node = playerSceneInstances[0].name ?? 'Player'
  }
  const scriptPaths = new Set([playerBehavior.script, model.behaviors.get('camera').script, 'res://scripts/main.gd'])
  if (model.multiplayer) scriptPaths.add('res://scripts/multiplayer.gd')
  const sceneByPath = model.scenes
  for (const [name, behavior] of model.behaviors) {
    if (name === 'player') assert(sceneByPath.has(behavior.scene), `Player behavior scene "${behavior.scene}" is not declared`)
    if (name === 'camera') assert(behavior.node, 'Camera behavior must specify the scene node name with node:')
  }
  assert(model.behaviors.get('player').script !== 'res://scripts/main.gd', 'Player script path conflicts with the generated main script')
  assert(model.behaviors.get('camera').script !== 'res://scripts/main.gd', 'Camera script path conflicts with the generated main script')
  assert(model.behaviors.get('camera').script !== model.behaviors.get('player').script, 'Player and camera behaviors must use different script paths')
  for (const scene of outputScenes) {
    if (scene.path === model.project.main_scene || scene.path === playerBehavior.scene) continue
    const generatedScript = `res://scripts/${path.posix.basename(scene.path, '.tscn')}.gd`
    assert(!scriptPaths.has(generatedScript), `Generated scene script path conflicts with another script: ${generatedScript}`)
    scriptPaths.add(generatedScript)
  }
  const mainScene = model.scenes.get(model.project.main_scene)
  const camera = model.behaviors.get('camera')
  let cameraFound = false
  walkNodeConfigs(mainScene, node => {
    if (node.name === camera.node) cameraFound = true
  })
  assert(cameraFound, `Camera behavior node "${camera.node}" was not found in the main scene`)

  fs.mkdirSync(path.dirname(absoluteOutputPath), { recursive: true })
  const stagingDir = fs.mkdtempSync(path.join(path.dirname(absoluteOutputPath), `.${path.basename(absoluteOutputPath)}-staging-`))
  try {
    const copiedAssets = copyAndArrangeAssets(tatemonoDir, stagingDir)
    const missingOptional = registerAssets(model.assets, copiedAssets)
    fs.mkdirSync(path.join(stagingDir, 'scenes'), { recursive: true })
    fs.mkdirSync(path.join(stagingDir, 'scripts'), { recursive: true })
    fs.writeFileSync(path.join(stagingDir, 'project.godot'), projectFile(model.project, model.multiplayer), 'utf8')

    for (const scene of outputScenes) {
      const scriptPath = scene.path === model.project.main_scene
        ? 'res://scripts/main.gd'
        : model.behaviors.get('player').scene === scene.path
          ? model.behaviors.get('player').script
          : `res://scripts/${path.posix.basename(scene.path, '.tscn')}.gd`
      const target = path.join(stagingDir, ...scene.path.slice('res://'.length).split('/'))
      fs.mkdirSync(path.dirname(target), { recursive: true })
      fs.writeFileSync(target, sceneFile(scene, scriptPath), 'utf8')
      if (scene.path !== model.project.main_scene && scene.path !== model.behaviors.get('player').scene) {
        const sceneScriptPath = path.join(stagingDir, ...scriptPath.slice('res://'.length).split('/'))
        fs.mkdirSync(path.dirname(sceneScriptPath), { recursive: true })
        fs.writeFileSync(sceneScriptPath, mainScript(scene, model.input, model.assets, camera, model.world), 'utf8')
      }
    }

    const mainScriptPath = path.join(stagingDir, ...playerBehavior.script.slice('res://'.length).split('/'))
    const mainSceneScriptPath = path.join(stagingDir, 'scripts', 'main.gd')
    const cameraScriptPath = path.join(stagingDir, ...camera.script.slice('res://'.length).split('/'))
    fs.writeFileSync(mainSceneScriptPath, mainScript(mainScene, model.input, model.assets, camera, model.world, model.multiplayer, playerBehavior.scene, model.multiplayer?.player_node), 'utf8')
    fs.writeFileSync(mainScriptPath, playerScript(playerBehavior, model.scenes.get(playerBehavior.scene), model.assets, model.world, model.multiplayer), 'utf8')
    fs.writeFileSync(cameraScriptPath, cameraScript(camera), 'utf8')
    if (model.multiplayer) {
      fs.writeFileSync(path.join(stagingDir, 'scripts', 'multiplayer.gd'), multiplayerScript(model.multiplayer), 'utf8')
    }
    fs.writeFileSync(path.join(stagingDir, 'export_presets.cfg'), exportPresets(model.exportConfig, model.project.name), 'utf8')

    const missingList = missingOptional.length
      ? `\nOptional assets not present; placeholder visuals are generated when required:\n${missingOptional.map(file => `- \`${file}\``).join('\n')}\n`
      : ''
    fs.writeFileSync(path.join(stagingDir, 'PLUFF_EXPORT.md'), `${exportGuide(model.exportConfig, model.project.name)}${missingList}`, 'utf8')

    // @arkzen:file blocks go last so they can add to or replace anything generated above.
    const freeFiles = writeGameFreeFiles(source, stagingDir, 'Godot generator')

    try {
      if (fs.existsSync(absoluteOutputPath)) {
        fs.rmSync(absoluteOutputPath, { recursive: true, force: true })
      }
      fs.renameSync(stagingDir, absoluteOutputPath)
    } catch (error) {
      if (error?.code === 'EBUSY' || error?.code === 'EPERM') {
        throw new Error(`[Godot generator] Output is locked by a running Godot editor. Close all Godot windows using this project, then regenerate: ${absoluteOutputPath}`)
      }
      throw error
    }

    return {
      outputDir: absoluteOutputPath,
      scenes: outputScenes.map(scene => scene.path),
      scripts: [...scriptPaths],
      missingOptionalAssets: missingOptional,
      copiedAssetCount: copiedAssets.copied,
      freeFiles,
    }
  } catch (error) {
    fs.rmSync(stagingDir, { recursive: true, force: true })
    throw error
  }
}
