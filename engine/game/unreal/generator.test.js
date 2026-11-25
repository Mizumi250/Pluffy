import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateUnrealProject } from './generator.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')
const readSource = name => fs.readFileSync(path.join(TATEMONOS_DIR, name, 'core.tsx'), 'utf8')

function withTempDir(run) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluff-unreal-test-'))
  try {
    run(tempDir)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function createFixture(tempDir, name, source) {
  const fixtureDir = path.join(tempDir, name)
  fs.mkdirSync(fixtureDir, { recursive: true })
  const tatemonoPath = path.join(fixtureDir, 'core.tsx')
  fs.writeFileSync(tatemonoPath, source.replace(/^name: .+$/m, `name: ${name}`))
  return tatemonoPath
}

function generate(tempDir, name, source, outputName = 'project') {
  const tatemonoPath = createFixture(tempDir, name, source)
  const outputDir = path.join(tempDir, outputName)
  const result = generateUnrealProject({ tatemonoPath, outputDir })
  return { result, outputDir }
}

const readJson = file => JSON.parse(fs.readFileSync(file, 'utf8'))
const text = (outputDir, ...parts) => fs.readFileSync(path.join(outputDir, ...parts), 'utf8')

test('generates a complete Unreal C++ project for the scene starter', () => {
  withTempDir(tempDir => {
    const { result, outputDir } = generate(tempDir, 'unreal-scene-starter', readSource('unreal-scene-starter'))
    assert.equal(result.moduleName, 'UnrealSceneStarter')
    assert.equal(result.unrealVersion, '5.6')
    assert.equal(result.scene, 'main')
    assert.deepEqual(result.scenes, ['main'])

    for (const file of [
      'UnrealSceneStarter.uproject',
      'Config/DefaultEngine.ini', 'Config/DefaultGame.ini', 'Config/DefaultGameUserSettings.ini',
      'Content/PluffScenes/main.json',
      'Source/UnrealSceneStarter.Target.cs', 'Source/UnrealSceneStarterEditor.Target.cs',
      'Source/UnrealSceneStarter/UnrealSceneStarter.Build.cs',
      'Source/UnrealSceneStarter/UnrealSceneStarter.cpp', 'Source/UnrealSceneStarter/UnrealSceneStarter.h',
      'Source/UnrealSceneStarter/PluffGameMode.h', 'Source/UnrealSceneStarter/PluffGameMode.cpp',
      'Source/UnrealSceneStarter/PluffCharacter.h', 'Source/UnrealSceneStarter/PluffCharacter.cpp',
      'Source/UnrealSceneStarter/PluffComponents.h', 'Source/UnrealSceneStarter/PluffComponents.cpp',
      'Scripts/package-windows.bat', 'Scripts/package-linux.sh', '.gitignore', 'README.md',
    ]) assert.ok(fs.existsSync(path.join(outputDir, file)), `${file} should exist`)

    const uproject = readJson(path.join(outputDir, 'UnrealSceneStarter.uproject'))
    assert.equal(uproject.EngineAssociation, '5.6')
    assert.equal(uproject.Modules[0].Name, 'UnrealSceneStarter')

    const engineIni = text(outputDir, 'Config', 'DefaultEngine.ini')
    assert.match(engineIni, /GameDefaultMap=\/Engine\/Maps\/Entry/)
    assert.match(engineIni, /GlobalDefaultGameMode=\/Script\/UnrealSceneStarter\.PluffGameMode/)
    assert.match(text(outputDir, 'Config', 'DefaultGame.ini'), /DirectoriesToAlwaysStageAsNonUFS=\(Path="PluffScenes"\)/)
    assert.match(text(outputDir, 'Config', 'DefaultGame.ini'), /^ProjectID=[0-9A-F]{8}(-[0-9A-F]{4}){3}-[0-9A-F]{12}$/m)
    assert.match(text(outputDir, 'Config', 'DefaultGameUserSettings.ini'), /ResolutionSizeX=1280/)

    assert.match(text(outputDir, 'Source', 'UnrealSceneStarter', 'PluffGameMode.h'), /class UNREALSCENESTARTER_API APluffGameMode/)
    assert.match(text(outputDir, 'Source', 'UnrealSceneStarter', 'PluffGameMode.cpp'), /MainSceneKey = TEXT\("main"\)/)
    assert.match(text(outputDir, 'Source', 'UnrealSceneStarter', 'UnrealSceneStarter.cpp'), /IMPLEMENT_PRIMARY_GAME_MODULE\(FDefaultGameModuleImpl, UnrealSceneStarter, "UnrealSceneStarter"\)/)
    assert.match(text(outputDir, 'Source', 'UnrealSceneStarter', 'UnrealSceneStarter.Build.cs'), /"Json"/)
    assert.match(text(outputDir, 'Source', 'UnrealSceneStarter.Target.cs'), /class UnrealSceneStarterTarget : TargetRules/)
    assert.match(text(outputDir, 'Source', 'UnrealSceneStarterEditor.Target.cs'), /TargetType\.Editor/)

    assert.match(text(outputDir, 'Scripts', 'package-windows.bat'), /-platform=Win64 -clientconfig=Development/)
    assert.match(text(outputDir, 'Scripts', 'package-linux.sh'), /RunUAT\.sh/)
    if (process.platform !== 'win32') assert.ok(fs.statSync(path.join(outputDir, 'Scripts', 'package-linux.sh')).mode & 0o100, 'shell script is executable')
    assert.equal(fs.existsSync(path.join(outputDir, '.github')), false, 'Phase 1 ships no CI workflow')
    assert.equal(fs.existsSync(path.join(outputDir, 'Scripts', 'package-macos.sh')), false, 'only declared targets get scripts')
  })
})

test('scene JSON is converted to Unreal space (centimeters, Z-up, quaternions)', () => {
  withTempDir(tempDir => {
    const { outputDir } = generate(tempDir, 'unreal-scene-starter', readSource('unreal-scene-starter'))
    const scene = readJson(path.join(outputDir, 'Content', 'PluffScenes', 'main.json'))
    assert.equal(scene.scene, 'main')
    assert.deepEqual(scene.environment.ambient, { color: '#a9c7d7', intensity: 0.8 })
    assert.deepEqual(scene.environment.fog, { density: 0.008, color: '#c5e0dc' })

    const byName = Object.fromEntries(scene.nodes.map(node => [node.name, node]))
    assert.deepEqual(byName.Ground.location, [0, 0, -50])
    assert.deepEqual(byName.Ground.scale, [20, 20, 1])
    assert.equal(byName.Ground.color, '#456b46')

    const player = byName.Player
    assert.deepEqual(player.location, [0, 0, 100])
    assert.deepEqual(player.scale, [1, 1, 2])
    const controller = player.components[0]
    assert.equal(controller.type, 'character_controller')
    assert.equal(controller.speed_cm, 500)
    assert.equal(controller.jump_height_cm, 160)
    assert.ok(Math.abs(controller.gravity_scale - 20 / 9.81) < 1e-5)
    assert.equal(controller.camera_relative, true)
    assert.deepEqual(controller.keys, { forward: 'W', backward: 'S', left: 'A', right: 'D', jump: 'SpaceBar' })

    assert.deepEqual(byName.Beacon.location, [100, 200, 100])
    assert.equal(byName.Beacon.emission, '#168a7d')
    assert.deepEqual(byName.Beacon.components[0], { type: 'rotate', axis: [0, 0, 1], degrees_per_second: 35 })

    assert.equal(byName.Sun.light_type, 'directional')
    assert.equal(byName.Sun.intensity, 1.2)
    assert.equal(byName.Sun.range_cm, undefined)
    assert.equal(byName.Sun.rotation.length, 4)

    const camera = byName.MainCamera
    assert.equal(camera.main, true)
    assert.equal(camera.field_of_view, 60)
    assert.deepEqual(camera.components[0], { type: 'camera_follow', target: 'Player', offset_cm: [-700, 0, 400], smooth_speed: 8 })
  })
})

test('physics playground: physics bodies, point light and defaults', () => {
  withTempDir(tempDir => {
    const { outputDir, result } = generate(tempDir, 'unreal-physics-playground', readSource('unreal-physics-playground'))
    assert.equal(result.scene, 'arena')
    assert.match(text(outputDir, 'Source', 'UnrealPhysicsPlayground', 'PluffGameMode.cpp'), /MainSceneKey = TEXT\("arena"\)/)
    const scene = readJson(path.join(outputDir, 'Content', 'PluffScenes', 'arena.json'))
    const byName = Object.fromEntries(scene.nodes.map(node => [node.name, node]))
    assert.deepEqual(byName.CrateBottom.components[0], { type: 'physics', mass: 20, use_gravity: true })
    assert.deepEqual(byName.FloatingOrb.components[0], { type: 'physics', mass: 1, use_gravity: false })
    assert.equal(byName.LampPost.light_type, 'point')
    assert.equal(byName.LampPost.range_cm, 1400)
    assert.equal(byName.LampPost.shadows, false)
    assert.equal(byName.LampPost.color, '#ffd9a0')
    assert.equal(byName.MainCamera.field_of_view, 70)
    assert.equal(scene.environment.fog, undefined)
    assert.ok(Math.abs(byName.Player.components[0].gravity_scale - 25 / 9.81) < 1e-5)
    assert.ok(fs.existsSync(path.join(outputDir, 'Scripts', 'package-macos.sh')))
  })
})

test('sky garden: orthographic camera, children, spot light', () => {
  withTempDir(tempDir => {
    const { outputDir } = generate(tempDir, 'unreal-sky-garden', readSource('unreal-sky-garden'))
    const scene = readJson(path.join(outputDir, 'Content', 'PluffScenes', 'garden.json'))
    const byName = Object.fromEntries(scene.nodes.map(node => [node.name, node]))
    const camera = byName.TopCamera
    assert.equal(camera.projection, 'orthographic')
    assert.equal(camera.field_of_view, undefined)
    assert.ok(Math.abs(camera.ortho_width - 2 * 9 * (1280 / 720) * 100) < 1e-3)
    assert.equal(byName.Pinwheel.type, 'empty')
    assert.deepEqual(byName.Pinwheel.children.map(child => child.name), ['BladeNorth', 'BladeSouth', 'BladeEast', 'BladeWest'])
    assert.deepEqual(byName.Pinwheel.children[0].location, [100, 0, 0])
    assert.equal(byName.LanternSpot.light_type, 'spot')
    assert.equal(byName.LanternSpot.spot_angle, 35)
    assert.equal(byName.LanternSpot.range_cm, 800)
  })
})

test('every shipped Unreal tatemono generates', () => {
  const names = fs.readdirSync(TATEMONOS_DIR).filter(name => name.startsWith('unreal-'))
  assert.ok(names.length >= 3, 'at least three Unreal tatemonos ship with Pluff')
  for (const name of names) {
    withTempDir(tempDir => {
      const result = generateUnrealProject({ tatemonoPath: path.join(TATEMONOS_DIR, name, 'core.tsx'), outputDir: path.join(tempDir, 'out') })
      assert.ok(fs.existsSync(path.join(tempDir, 'out', `${result.moduleName}.uproject`)), name)
    })
  }
})

test('regeneration replaces the whole folder and a failed run keeps the old output', () => {
  withTempDir(tempDir => {
    const source = readSource('unreal-scene-starter')
    const { outputDir } = generate(tempDir, 'unreal-scene-starter', source)
    fs.writeFileSync(path.join(outputDir, 'stale.txt'), 'old')
    generate(tempDir, 'unreal-scene-starter', source)
    assert.equal(fs.existsSync(path.join(outputDir, 'stale.txt')), false)

    const broken = source.replace('type: cylinder', 'type: dodecahedron')
    assert.throws(() => generate(tempDir, 'unreal-scene-starter', broken), /type must be one of/)
    assert.ok(fs.existsSync(path.join(outputDir, 'UnrealSceneStarter.uproject')))
    assert.deepEqual(fs.readdirSync(tempDir).sort(), ['project', 'unreal-scene-starter'])
  })
})

test('@arkzen:file blocks are written last and can replace generated files', () => {
  withTempDir(tempDir => {
    const extra = `
/* @arkzen:file:extra-note
path: Source/Notes.txt
*/
hand written
/* @arkzen:file:extra-note:end */

/* @arkzen:file:settings
path: Config/DefaultGameUserSettings.ini
*/
[/Script/Engine.GameUserSettings]
ResolutionSizeX=800
/* @arkzen:file:settings:end */
`
    const { result, outputDir } = generate(tempDir, 'unreal-scene-starter', readSource('unreal-scene-starter') + extra)
    assert.deepEqual(result.freeFiles.written.sort(), ['Config/DefaultGameUserSettings.ini', 'Source/Notes.txt'])
    assert.deepEqual(result.freeFiles.overridden, ['Config/DefaultGameUserSettings.ini'])
    assert.match(text(outputDir, 'Source', 'Notes.txt'), /hand written/)
    assert.match(text(outputDir, 'Config', 'DefaultGameUserSettings.ini'), /ResolutionSizeX=800/)
  })
})

test('module names come from the tatemono name', () => {
  withTempDir(tempDir => {
    const source = readSource('unreal-scene-starter')
    assert.equal(generate(tempDir, 'unreal-scene-starter', source).result.moduleName, 'UnrealSceneStarter')
  })
  withTempDir(tempDir => {
    const { result, outputDir } = generate(tempDir, '3d-demo', readSource('unreal-scene-starter'))
    assert.equal(result.moduleName, 'Pluff3dDemo')
    assert.ok(fs.existsSync(path.join(outputDir, 'Pluff3dDemo.uproject')))
    assert.match(text(outputDir, 'Source', 'Pluff3dDemo', 'PluffGameMode.h'), /PLUFF3DDEMO_API/)
  })
  withTempDir(tempDir => {
    assert.throws(() => generate(tempDir, 'engine', readSource('unreal-scene-starter')), /clashes with an engine module/)
  })
})

test('several scenes: main_scene defaults to the first and every scene gets a JSON file', () => {
  withTempDir(tempDir => {
    const source = readSource('unreal-scene-starter')
      .replace('main_scene: main\n', '')
      .replace('/* @arkzen:unreal:export', `/* @arkzen:unreal:scene:menu
nodes:
  - name: Backdrop
    type: plane
  - name: MenuCamera
    type: camera
    main: true
    position: [0, 3, -5]
*/
/* @arkzen:unreal:scene:menu:end */

/* @arkzen:unreal:export`)
    const { result, outputDir } = generate(tempDir, 'unreal-scene-starter', source)
    assert.equal(result.scene, 'main')
    assert.deepEqual(result.scenes, ['main', 'menu'])
    assert.ok(fs.existsSync(path.join(outputDir, 'Content', 'PluffScenes', 'menu.json')))
  })
})

const invalidCases = [
  ['unquoted unreal_version', s => s.replace('unreal_version: "5.6"', 'unreal_version: 5.6'), /unreal_version must be a quoted string/],
  ['non-5 unreal_version', s => s.replace('unreal_version: "5.6"', 'unreal_version: "4.27"'), /must look like "5\.6"/],
  ['unknown project key', s => s.replace('width: 1280', 'width: 1280\nfps: 60'), /@arkzen:unreal:project has unsupported key "fps"/],
  ['non-scene mode', s => s.replace('mode: scene', 'mode: runner'), /mode must be "scene"/],
  ['bad default_map', s => s.replace('width: 1280', 'width: 1280\ndefault_map: ../escape'), /default_map must be an Unreal asset path/],
  ['unknown main_scene', s => s.replace('main_scene: main', 'main_scene: nope'), /main_scene "nope" must match a declared scene name/],
  ['missing project block', s => s.replace(/\/\* @arkzen:unreal:project[\s\S]*?\*\/\n/, ''), /A @arkzen:unreal:project block is required/],
  ['missing scene blocks', s => s.replace(/\/\* @arkzen:unreal:scene:main\n[\s\S]*?:end \*\/\n/, ''), /At least one @arkzen:unreal:scene:<name> block is required/],
  ['scene without :end', s => s.replace('/* @arkzen:unreal:scene:main:end */\n', ''), /must close with \/\* @arkzen:unreal:scene:main:end \*\//],
  ['unsupported node type', s => s.replace('type: sphere', 'type: capsule'), /type must be one of empty, cube, sphere, cylinder, cone, plane, camera, light/],
  ['duplicate node name', s => s.replace('name: Beacon', 'name: Ground'), /duplicates object name "Ground"/],
  ['bad position', s => s.replace('position: [2, 1, 1]', 'position: [2, 1]'), /position must be a three-number array/],
  ['zero scale', s => s.replace('scale: [0.6, 0.6, 0.6]', 'scale: [0, 0, 0]'), /scale cannot be \[0, 0, 0\]/],
  ['bad color', s => s.replace('color: "#56d9c2"', 'color: teal'), /color must be #RRGGBB/],
  ['unknown node key', s => s.replace('main: true', 'main: true\n    tag: hero'), /has unsupported key "tag"/],
  ['emission on non-mesh', s => s.replace('rotation: [45, -30, 0]', 'rotation: [45, -30, 0]\n    emission: "#ffffff"'), /emission is only supported by mesh objects/],
  ['light key on mesh', s => s.replace('name: Ground\n    type: cube', 'name: Ground\n    type: cube\n    intensity: 2'), /intensity is only supported by light objects/],
  ['camera key on mesh', s => s.replace('name: Ground\n    type: cube', 'name: Ground\n    type: cube\n    field_of_view: 90'), /field_of_view is only supported by camera objects/],
  ['unsupported component', s => s.replace('type: rotate', 'type: rigidbody'), /unsupported component "rigidbody"/],
  ['unsupported component key', s => s.replace('smooth_speed: 8', 'smooth_speed: 8\n        lag: 2'), /component "camera_follow" has unsupported key "lag"/],
  ['no camera', s => s.replace(/  - name: MainCamera[\s\S]*?smooth_speed: 8\n/, ''), /needs a camera/],
  ['no main camera', s => s.replace('main: true', 'main: false'), /exactly one camera with main: true/],
  ['two main cameras', s => s.replace('  - name: Sun', '  - name: SecondCamera\n    type: camera\n    main: true\n  - name: Sun'), /exactly one camera with main: true/],
  ['follow target missing', s => s.replace('target: Player', 'target: Nobody'), /missing camera-follow target "Nobody"/],
  ['camera_follow on a mesh', s => s.replace('type: rotate\n        axis: [0, 1, 0]\n        speed: 35', 'type: camera_follow\n        target: Player'), /camera_follow requires a camera object/],
  ['two player controllers', s => s.replace('  - name: Sun', '  - name: Player2\n    type: cylinder\n    components:\n      - type: character_controller\n  - name: Sun'), /can only have one character_controller/],
  ['unsupported key name', s => s.replace('jump: SpaceBar', 'jump: Space'), /keys\.jump must be one of W, A, S, D, SpaceBar/],
  ['unsupported key action', s => s.replace('jump: SpaceBar', 'jump: SpaceBar\n          crouch: S'), /keys has unsupported action "crouch"/],
  ['positive gravity', s => s.replace('speed: 5\n        jump_height', 'speed: 5\n        gravity: 9.8\n        jump_height'), /gravity must be a negative number/],
  ['rotate with character', s => s.replace('        camera_relative: true', '        camera_relative: true\n      - type: rotate'), /rotate cannot be combined with physics or character_controller/],
  ['duplicate component', s => s.replace('  - name: Sun', '  - name: Spinner\n    type: cube\n    components:\n      - type: rotate\n      - type: rotate\n  - name: Sun'), /declares component "rotate" more than once/],
  ['physics on a light', s => s.replace('shadows: true', 'shadows: true\n    components:\n      - type: physics'), /physics requires a mesh object/],
  ['physics on a child', s => s.replace('  - name: Sun', '  - name: Holder\n    type: empty\n    children:\n      - name: Crate\n        type: cube\n        components:\n          - type: physics\n  - name: Sun'), /physics objects must be top-level/],
  ['bad light type', s => s.replace('light_type: directional', 'light_type: area'), /light_type must be directional, point, or spot/],
  ['unknown environment key', s => s.replace('fog_density: 0.008', 'fog_density: 0.008\nbloom: 1'), /unreal:environment has unsupported key "bloom"/],
  ['bad export target', s => s.replace('targets: [windows, linux]', 'targets: [windows, webgl]'), /Unsupported Unreal package target "webgl"/],
  ['duplicate export target', s => s.replace('targets: [windows, linux]', 'targets: [windows, windows]'), /cannot contain duplicates/],
  ['bad export configuration', s => s.replace('targets: [windows, linux]', 'targets: [windows]\nconfiguration: debug'), /configuration must be one of development, shipping/],
  ['unknown export key', s => s.replace('targets: [windows, linux]', 'targets: [windows]\nsign: true'), /only supports targets and configuration/],
]

for (const [label, mutate, expected] of invalidCases) {
  test(`rejects: ${label}`, () => {
    withTempDir(tempDir => {
      const source = mutate(readSource('unreal-scene-starter'))
      assert.notEqual(source, readSource('unreal-scene-starter'), 'the mutation must change the source')
      assert.throws(() => generate(tempDir, 'unreal-scene-starter', source), expected)
      assert.equal(fs.existsSync(path.join(tempDir, 'project')), false, 'nothing is written when validation fails')
    })
  })
}

test('refuses an output folder inside the tatemono folder', () => {
  withTempDir(tempDir => {
    const tatemonoPath = createFixture(tempDir, 'unreal-scene-starter', readSource('unreal-scene-starter'))
    assert.throws(() => generateUnrealProject({ tatemonoPath, outputDir: path.join(tempDir, 'unreal-scene-starter', 'out') }), /cannot be inside the source Tatemono folder/)
    assert.throws(() => generateUnrealProject({ tatemonoPath, outputDir: tempDir }), /cannot contain the source Tatemono file/)
  })
})

test('requires a core.tsx file whose meta name matches its folder', () => {
  withTempDir(tempDir => {
    const wrongFile = path.join(tempDir, 'unreal-scene-starter', 'other.tsx')
    fs.mkdirSync(path.dirname(wrongFile), { recursive: true })
    fs.writeFileSync(wrongFile, readSource('unreal-scene-starter'))
    assert.throws(() => generateUnrealProject({ tatemonoPath: wrongFile, outputDir: path.join(tempDir, 'out') }), /expects a Tatemono core\.tsx file/)
    const folder = path.join(tempDir, 'renamed')
    fs.mkdirSync(folder)
    fs.writeFileSync(path.join(folder, 'core.tsx'), readSource('unreal-scene-starter'))
    assert.throws(() => generateUnrealProject({ tatemonoPath: path.join(folder, 'core.tsx'), outputDir: path.join(tempDir, 'out') }), /must match its Tatemono folder/)
  })
})
