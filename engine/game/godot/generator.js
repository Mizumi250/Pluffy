import fs from 'node:fs'
import path from 'node:path'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'

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

  const assets = parseAssets(blocks.get('godot:assets') ?? {})
  const world = blocks.get('godot:world') ?? {}
  if (Object.keys(world).length > 0) {
    for (const key of ['tile_size', 'grid_width', 'grid_depth', 'block_height', 'world_margin']) {
      assert(Number.isFinite(world[key]) && world[key] > 0, `Godot world ${key} must be a positive number`)
    }
    assert(Number.isInteger(world.seed) && world.seed >= 0, 'Godot world seed must be a non-negative integer')
    assert(world.props && typeof world.props === 'object', 'Godot world props must be a mapping')
    assert(world.npcs && typeof world.npcs === 'object', 'Godot world npcs must be a mapping')
    for (const [name, prop] of Object.entries(world.props)) {
      assert(Number.isInteger(prop.count) && prop.count >= 0, `World prop "${name}" count must be a non-negative integer`)
      assert(Number.isFinite(prop.size) && prop.size > 0, `World prop "${name}" size must be positive`)
      assert(typeof prop.collision === 'boolean', `World prop "${name}" collision must be true or false`)
      assert(assets.has(prop.texture), `World prop "${name}" references undeclared texture "${prop.texture}"`)
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
    for (const key of ['idle_row_offset', 'walk_row_offset']) {
      const offset = animation[key] ?? 0
      assert(Number.isInteger(offset) && offset >= 0 && offset + animation.directions.length <= animation.rows, `${context} AnimatedSprite3D ${key} exceeds the sprite sheet rows`)
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

function projectFile(project) {
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

function jsonConstant(value) {
  return JSON.stringify(JSON.stringify(value))
}

function mainScript(scene, input, assets, cameraBehavior, world) {
  const behaviorByNode = cameraBehavior.node ? { [cameraBehavior.node]: cameraBehavior.script } : {}
  const childNodes = scene.nodes ?? scene.root.children ?? scene.components ?? []
  return `extends ${scene.root.type}

const NODES_JSON = ${jsonConstant(childNodes)}
const INPUT_JSON = ${jsonConstant(input.actions)}
const ASSETS_JSON = ${jsonConstant(Object.fromEntries([...assets].map(([key, item]) => [key, item.target])))}
const BEHAVIORS_JSON = ${jsonConstant(behaviorByNode)}
const WORLD_JSON = ${jsonConstant(world ?? {})}

func _ready() -> void:
\t_setup_input()
\t_spawn_ethereane_world()
\tvar nodes: Array = JSON.parse_string(NODES_JSON)
\tfor node_config in nodes:
\t\t_spawn_node(node_config, self)

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
\tvar selected_path := texture_path
\tif selected_path.is_empty():
\t\tselected_path = fallback_path
\tif not selected_path.is_empty() and ResourceLoader.exists(selected_path):
\t\tmaterial.albedo_texture = load(selected_path) as Texture2D
\telse:
\t\tmaterial.albedo_color = Color("#7cae50") if not plain else Color("#92bc5a")
\tmaterial.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\tholder.material_override = material
\tholder.multimesh = multi_mesh
\tfor index in range(positions.size()):
\t\tmulti_mesh.set_instance_transform(index, Transform3D(Basis.IDENTITY, positions[index]))
\tadd_child(holder)

func _create_world_character(sprite: AnimatedSprite3D, texture_path: String) -> void:
\tif texture_path.is_empty() or not ResourceLoader.exists(texture_path):
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
\t\tframes.add_animation(direction)
\t\tframes.set_animation_speed(direction, 1)
\t\tframes.set_animation_loop(direction, false)
\t\tvar atlas := AtlasTexture.new()
\t\tatlas.atlas = texture
\t\tatlas.region = Rect2(0, direction_index * frame_height, frame_width, frame_height)
\t\tframes.add_frame(direction, atlas)
\tsprite.sprite_frames = frames
\tsprite.pixel_size = 0.025
\tsprite.billboard = BaseMaterial3D.BILLBOARD_ENABLED
\tsprite.texture_filter = BaseMaterial3D.TEXTURE_FILTER_NEAREST
\tsprite.play("down")

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
\tvar environment := Environment.new()
\tenvironment.background_mode = Environment.BG_COLOR
\tenvironment.background_color = Color("#84b2cc")
\tenvironment.ambient_light_source = Environment.AMBIENT_SOURCE_COLOR
\tenvironment.ambient_light_color = Color.WHITE
\tenvironment.ambient_light_energy = 0.75
\tenvironment.fog_enabled = true
\tenvironment.fog_light_color = Color("#e1f5fe")
\tenvironment.fog_density = 0.008
\tenvironment.fog_sky_affect = 1.0
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

function playerScript(behavior, playerScene, assets, world) {
  const movement = behavior.movement
  const playerComponents = playerScene.components ?? playerScene.root.components ?? playerScene.root.children ?? []
  assert(Array.isArray(movement?.input) && movement.input.length === 4, 'Player behavior movement.input must list left, right, up, and down actions')
  assert(movement.input.every(name => /^[a-z][a-z0-9_]*$/.test(name)), 'Player behavior input actions must be valid action names')
  assert(Number.isFinite(movement.speed) && movement.speed > 0, 'Player behavior movement.speed must be a positive number')
  assert(movement.normalize_diagonal === undefined || typeof movement.normalize_diagonal === 'boolean', 'Player behavior normalize_diagonal must be true or false')
  assert(['project_default', 'none'].includes(movement.gravity), 'Player behavior gravity must be project_default or none')
  assert(movement.run_action === undefined || typeof movement.run_action === 'string', 'Player behavior run_action must be an input action name')
  assert(movement.run_multiplier === undefined || (Number.isFinite(movement.run_multiplier) && movement.run_multiplier > 0), 'Player behavior run_multiplier must be positive')
  assert(behavior.animation?.moving === 'walk_{direction}' && behavior.animation?.idle === 'idle_{direction}', 'Player animation must use walk_{direction} and idle_{direction}')
  assert(behavior.animation?.facing_priority === 'dominant_axis', 'Player facing_priority must be dominant_axis')
  const [left, right, up, down] = movement.input.map(godotString)
  return `extends CharacterBody3D

const MOVE_SPEED := ${movement.speed}
const MOVE_RUN_MULTIPLIER := ${movement.run_multiplier ?? 1}
const ACTION_LEFT := ${left}
const ACTION_RIGHT := ${right}
const ACTION_UP := ${up}
const ACTION_DOWN := ${down}
const ACTION_RUN := ${godotString(movement.run_action ?? '')}
const COMPONENTS_JSON := ${jsonConstant(playerComponents)}
const ASSETS_JSON := ${jsonConstant(Object.fromEntries([...assets].map(([key, item]) => [key, item.target])))}
const WORLD_JSON := ${jsonConstant(world ?? {})}

var _facing := "down"
@onready var _sprite = get_node_or_null("Sprite")

func _ready() -> void:
\tfor config in JSON.parse_string(COMPONENTS_JSON):
\t\t_create_component(config, self)
\t_sprite = get_node_or_null("Sprite")

func _physics_process(delta: float) -> void:
\tvar input := Input.get_vector(ACTION_LEFT, ACTION_RIGHT, ACTION_UP, ACTION_DOWN)
\tvar direction := Vector3(input.x, 0.0, input.y)
\tif direction.length_squared() > 0.0 and ${movement.normalize_diagonal === false ? 'false' : 'true'}:
\t\tdirection = direction.normalized()
\tvar current_speed := MOVE_SPEED
\tif ACTION_RUN != "" and Input.is_action_pressed(ACTION_RUN):
\t\tcurrent_speed *= MOVE_RUN_MULTIPLIER
\tvelocity.x = direction.x * current_speed
\tvelocity.z = direction.z * current_speed
${movement.gravity === 'project_default' ? '\tif not is_on_floor():\n\t\tvelocity.y -= float(ProjectSettings.get_setting("physics/3d/default_gravity")) * delta\n\telif velocity.y < 0.0:\n\t\tvelocity.y = 0.0\n' : ''}
\tif direction.length_squared() > 0.0:
\t\t_facing = _direction_for(direction)
\t\t_play_animation("walk_" + _facing)
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

func _play_animation(animation_name: String) -> void:
\tif _sprite != null and _sprite.sprite_frames != null and _sprite.sprite_frames.has_animation(animation_name):
\t\t_sprite.play(animation_name)

func _direction_for(direction: Vector3) -> String:
\tif absf(direction.x) > absf(direction.z):
\t\treturn "right" if direction.x > 0.0 else "left"
\treturn "down" if direction.z > 0.0 else "up"

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
\t\tframes.add_animation(idle_name)
\t\tframes.add_animation(walk_name)
\t\tframes.set_animation_speed(walk_name, float(animation.get("frames_per_second", 8)))
\t\tframes.set_animation_loop(walk_name, true)
\t\t_add_atlas_frame(frames, idle_name, texture, 0, int(animation.get("idle_row_offset", 0)) + direction_index, frame_width, frame_height)
\t\tfor column in range(columns):
\t\t\t_add_atlas_frame(frames, walk_name, texture, column, int(animation.get("walk_row_offset", 0)) + direction_index, frame_width, frame_height)
\tcomponent.sprite_frames = frames
\tcomponent.pixel_size = float(config.get("pixel_size", 0.025))
\tcomponent.billboard = BaseMaterial3D.BILLBOARD_ENABLED
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
  return `extends Camera3D

const TARGET_PATH := ${godotString(behavior.target)}
const FOLLOW_OFFSET := ${offset}
const LOOK_OFFSET := ${lookOffset}
const SMOOTHING := ${smoothing}

@onready var _target: Node3D = get_node_or_null(TARGET_PATH) as Node3D

func _ready() -> void:
\tprojection = Camera3D.PROJECTION_ORTHOGONAL if ${behavior.projection === 'orthogonal' ? 'true' : 'false'} else Camera3D.PROJECTION_PERSPECTIVE
\tif projection == Camera3D.PROJECTION_PERSPECTIVE:
\t\tfov = 50.0

var _yaw := 0.0
var _pitch := 0.75
var _distance := clampf(FOLLOW_OFFSET.length(), 1.1, 9.0)
var _dragging := false
var _last_mouse := Vector2.ZERO

func _unhandled_input(event: InputEvent) -> void:
\tif event is InputEventMouseButton:
\t\tvar button_event := event as InputEventMouseButton
\t\tif button_event.button_index == MOUSE_BUTTON_WHEEL_UP:
\t\t\t_distance = clampf(_distance - 0.14, 1.1, 9.0)
\t\telif button_event.button_index == MOUSE_BUTTON_WHEEL_DOWN:
\t\t\t_distance = clampf(_distance + 0.14, 1.1, 9.0)
\tif event is InputEventMouseMotion:
\t\tvar motion := event as InputEventMouseMotion
\t\tif Input.is_mouse_button_pressed(MOUSE_BUTTON_RIGHT):
\t\t\t_yaw -= motion.relative.x * 0.0055
\t\t\t_pitch = clampf(_pitch - motion.relative.y * 0.0055, 0.4, 1.45)

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

  const outputScenes = [...model.scenes.values()]
  const playerBehavior = model.behaviors.get('player')
  const scriptPaths = new Set([playerBehavior.script, model.behaviors.get('camera').script, 'res://scripts/main.gd'])
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
    fs.writeFileSync(path.join(stagingDir, 'project.godot'), projectFile(model.project), 'utf8')

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
    fs.writeFileSync(mainSceneScriptPath, mainScript(mainScene, model.input, model.assets, camera, model.world), 'utf8')
    fs.writeFileSync(mainScriptPath, playerScript(playerBehavior, model.scenes.get(playerBehavior.scene), model.assets, model.world), 'utf8')
    fs.writeFileSync(cameraScriptPath, cameraScript(camera), 'utf8')
    fs.writeFileSync(path.join(stagingDir, 'export_presets.cfg'), exportPresets(model.exportConfig, model.project.name), 'utf8')

    const missingList = missingOptional.length
      ? `\nOptional assets not present; placeholder visuals are generated when required:\n${missingOptional.map(file => `- \`${file}\``).join('\n')}\n`
      : ''
    fs.writeFileSync(path.join(stagingDir, 'PLUFF_EXPORT.md'), `${exportGuide(model.exportConfig, model.project.name)}${missingList}`, 'utf8')

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
    }
  } catch (error) {
    fs.rmSync(stagingDir, { recursive: true, force: true })
    throw error
  }
}
