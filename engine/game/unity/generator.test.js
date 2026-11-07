import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateUnityProject } from './generator.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const TATEMONO_PATH = path.join(ROOT_DIR, 'tatemonos', 'dino-runner', 'core.tsx')

function withTempDir(run) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluff-unity-test-'))
  try {
    run(tempDir)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function createFixture(tempDir, name = 'dino-runner', source = fs.readFileSync(TATEMONO_PATH, 'utf8')) {
  const fixtureDir = path.join(tempDir, name)
  fs.mkdirSync(path.join(fixtureDir, 'assets'), { recursive: true })
  fs.copyFileSync(path.join(path.dirname(TATEMONO_PATH), 'assets', 'dino.svg'), path.join(fixtureDir, 'assets', 'dino.svg'))
  fs.copyFileSync(path.join(path.dirname(TATEMONO_PATH), 'assets', 'cactus.svg'), path.join(fixtureDir, 'assets', 'cactus.svg'))
  const tatemonoPath = path.join(fixtureDir, 'core.tsx')
  fs.writeFileSync(tatemonoPath, source.replace('name: dino-runner', `name: ${name}`))
  return tatemonoPath
}

test('generates a Unity project with SVG sprites and a playable runner', () => {
  withTempDir(tempDir => {
    const tatemonoPath = createFixture(tempDir)
    const outputDir = path.join(tempDir, 'project')

    const result = generateUnityProject({ tatemonoPath, outputDir })

    assert.equal(result.scene, 'Assets/Scenes/Main.unity')
    assert.equal(result.unityVersion, '6000.0.38f1')
    assert.equal(result.copiedAssetCount, 2)
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Scenes', 'Main.unity')))
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Resources', 'dino.svg')))
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Resources', 'cactus.svg')))
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8'), /KeyCode\.Space/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8'), /Resources\.Load<Sprite>\("dino"\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8'), /camera\.orthographicSize = 5f/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8'), /KeyCode\.R/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8'), /new Color\(0\.2000f, 0\.5412f, 0\.3098f, 1f\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Packages', 'manifest.json'), 'utf8'), /com\.unity\.vectorgraphics/)
    assert.match(fs.readFileSync(path.join(outputDir, 'ProjectSettings', 'EditorBuildSettings.asset'), 'utf8'), /Assets\/Scenes\/Main\.unity/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Scenes', 'Main.unity'), 'utf8'), /7f5a48c11a654fd1a5b60123456789ab/)
    assert.match(fs.readFileSync(path.join(outputDir, '.github', 'workflows', 'unity-build.yml'), 'utf8'), /secrets\.UNITY_LICENSE/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs'), 'utf8'), /BuildPipeline\.BuildPlayer/)

    fs.writeFileSync(path.join(outputDir, 'stale-file.txt'), 'old output')
    generateUnityProject({ tatemonoPath, outputDir })
    assert.equal(fs.existsSync(path.join(outputDir, 'stale-file.txt')), false)
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Scenes', 'Main.unity')))
  })
})

test('keeps existing runner visuals and pointer controls when optional blocks are absent', () => {
  withTempDir(tempDir => {
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace(/\/\* @arkzen:unity:visuals\r?\n[\s\S]*?\r?\n\*\/\r?\n\r?\n/, '')
      .replace(/\/\* @arkzen:unity:controls\r?\n[\s\S]*?\r?\n\*\/\r?\n\r?\n/, '')
    const tatemonoPath = createFixture(tempDir, 'default-runner', source)
    const outputDir = path.join(tempDir, 'project')

    generateUnityProject({ tatemonoPath, outputDir })

    const runner = fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'DinoRunner.cs'), 'utf8')
    assert.match(runner, /camera\.orthographicSize = 5f/)
    assert.match(runner, /Input\.GetKeyDown\(KeyCode\.R\) \|\| Input\.GetMouseButtonDown\(0\)/)
    assert.match(runner, /Input\.GetKeyDown\(KeyCode\.Space\) \|\| Input\.GetMouseButtonDown\(0\)/)
  })
})

test('rejects invalid runner settings and undeclared assets', () => {
  withTempDir(tempDir => {
    const invalidVersion = fs.readFileSync(TATEMONO_PATH, 'utf8').replace('unity_version: 6000.0.38f1', 'unity_version: 6.x')
    const invalidPath = createFixture(tempDir, 'invalid-game', invalidVersion)
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidPath, outputDir: path.join(tempDir, 'version-output') }), /unity_version must be an explicit/)

    const invalidJump = fs.readFileSync(TATEMONO_PATH, 'utf8').replace('jump_key: Space', 'jump_key: SPACE')
    fs.writeFileSync(invalidPath, invalidJump.replace('name: dino-runner', 'name: invalid-game'))
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidPath, outputDir: path.join(tempDir, 'jump-output') }), /jump_key must be one of/)

    const missingSprite = fs.readFileSync(TATEMONO_PATH, 'utf8').replace('dinosaur: dino', 'dinosaur: missing')
    fs.writeFileSync(invalidPath, missingSprite.replace('name: dino-runner', 'name: invalid-game'))
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidPath, outputDir: path.join(tempDir, 'asset-output') }), /undeclared dinosaur asset/)
    assert.equal(fs.existsSync(path.join(tempDir, 'asset-output')), false)
  })
})

test('rejects invalid Unity visual and control settings', () => {
  withTempDir(tempDir => {
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
    const invalidColor = createFixture(tempDir, 'invalid-color', source.replace('#b3e0f5', 'blue'))
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidColor, outputDir: path.join(tempDir, 'invalid-color-output') }), /background_color must be a #RRGGBB color/)

    const invalidCamera = createFixture(tempDir, 'invalid-camera', source.replace('camera_size: 5', 'camera_size: 0'))
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidCamera, outputDir: path.join(tempDir, 'invalid-camera-output') }), /camera_size must be a positive number/)

    const invalidControls = createFixture(tempDir, 'invalid-controls', source.replace('restart_key: R', 'restart_key: SPACE'))
    assert.throws(() => generateUnityProject({ tatemonoPath: invalidControls, outputDir: path.join(tempDir, 'invalid-controls-output') }), /restart_key must be one of/)
  })
})

test('requires Unity SVG assets to exist and preserves an existing output on failure', () => {
  withTempDir(tempDir => {
    const tatemonoPath = createFixture(tempDir, 'missing-asset')
    const outputDir = path.join(tempDir, 'project')
    fs.mkdirSync(outputDir)
    fs.writeFileSync(path.join(outputDir, 'keep.txt'), 'existing project')
    fs.rmSync(path.join(path.dirname(tatemonoPath), 'assets', 'cactus.svg'))

    assert.throws(
      () => generateUnityProject({ tatemonoPath, outputDir }),
      /Required SVG asset "cactus" does not exist/
    )
    assert.equal(fs.readFileSync(path.join(outputDir, 'keep.txt'), 'utf8'), 'existing project')
    assert.equal(fs.readdirSync(tempDir).filter(name => name.startsWith('.project-staging-')).length, 0)
  })
})

test('generates a general Unity scene project with native objects, lighting, behaviors, and build targets', () => {
  withTempDir(tempDir => {
    const tatemonoDir = path.join(tempDir, 'scene-game')
    fs.mkdirSync(tatemonoDir, { recursive: true })
    const tatemonoPath = path.join(tatemonoDir, 'core.tsx')
    fs.writeFileSync(tatemonoPath, `/* @arkzen:meta
name: scene-game
version: 1.0.0
description: Unity scene game
auth: false
*/

/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: Scene Game
main_scene: Assets/Scenes/Main.unity
width: 1280
height: 720
*/

/* @arkzen:unity:environment
ambient_color: "#aabbcc"
ambient_intensity: 0.8
fog_enabled: true
fog_color: "#ddeeff"
fog_density: 0.02
*/

/* @arkzen:unity:scene:main
path: Assets/Scenes/Main.unity
nodes:
  - name: Ground
    type: plane
    position: [0, -0.5, 0]
    color: "#338a4f"
    components:
      - type: box_collider
        size: [10, 0.1, 10]
  - name: Player
    type: capsule
    position: [0, 1, 0]
    components:
      - type: character_controller
        speed: 6
        jump_height: 2
        gravity: -9.81
        camera_relative: true
      - type: rotate
        axis: [0, 1, 0]
        speed: 10
  - name: Sun
    type: light
    light_type: directional
    intensity: 1.2
    shadows: true
  - name: MainCamera
    type: camera
    main: true
    position: [0, 4, -7]
    components:
      - type: camera_follow
        target: Player
        offset: [0, 4, -7]
*/
/* @arkzen:unity:scene:main:end */

/* @arkzen:unity:export
targets: [windows, linux, webgl]
*/
`)

    const outputDir = path.join(tempDir, 'project')
    const result = generateUnityProject({ tatemonoPath, outputDir })

    assert.equal(result.scene, 'Assets/Scenes/Main.unity')
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Scenes', 'Main.unity')))
    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Resources', 'pluff_scenes', 'main.json')))
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Resources', 'pluff_scenes', 'main.json'), 'utf8'), /"type": "character_controller"/)
    const runtime = fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'PluffSceneBootstrap.cs'), 'utf8')
    assert.match(runtime, /GameObject\.CreatePrimitive/)
    assert.match(runtime, /RenderSettings\.fog/)
    assert.match(runtime, /movement\.cameraRelative = data\.camera_relative/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs'), 'utf8'), /BuildWindows\(\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs'), 'utf8'), /BuildLinux\(\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'Assets', 'Editor', 'PluffBuild.cs'), 'utf8'), /BuildWebgl\(\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'ProjectSettings', 'EditorBuildSettings.asset'), 'utf8'), /Assets\/Scenes\/Main\.unity/)
  })
})

test('rejects invalid general Unity scene references, components, and build targets', () => {
  withTempDir(tempDir => {
    const tatemonoDir = path.join(tempDir, 'scene-game')
    fs.mkdirSync(tatemonoDir, { recursive: true })
    const tatemonoPath = path.join(tatemonoDir, 'core.tsx')
    const source = `/* @arkzen:meta
name: scene-game
version: 1.0.0
description: Unity scene game
auth: false
*/
/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: Scene Game
main_scene: Assets/Scenes/Main.unity
*/
/* @arkzen:unity:scene:main
path: Assets/Scenes/Main.unity
nodes:
  - name: MainCamera
    type: camera
    main: true
  - name: CameraRig
    type: empty
    components:
      - type: camera_follow
        target: MissingTarget
*/
/* @arkzen:unity:scene:main:end */
`
    fs.writeFileSync(tatemonoPath, source)
    assert.throws(() => generateUnityProject({ tatemonoPath, outputDir: path.join(tempDir, 'invalid') }), /missing camera-follow target/)

    fs.writeFileSync(tatemonoPath, source.replace('MissingTarget', 'Anything').replace('type: camera_follow', 'type: unknown_behavior'))
    assert.throws(() => generateUnityProject({ tatemonoPath, outputDir: path.join(tempDir, 'invalid-component') }), /unsupported component/)

    fs.writeFileSync(tatemonoPath, source.replace('target: MissingTarget', 'target: MainCamera') + '\n/* @arkzen:unity:export\ntargets: [unsupported]\n*/\n')
    assert.throws(() => generateUnityProject({ tatemonoPath, outputDir: path.join(tempDir, 'invalid-target') }), /Unsupported Unity build target/)
  })
})

test('generates Unity 2D physics and platformer/top-down controls from scene components', () => {
  withTempDir(tempDir => {
    const tatemonoDir = path.join(tempDir, 'scene-2d')
    fs.mkdirSync(path.join(tatemonoDir, 'assets'), { recursive: true })
    fs.copyFileSync(path.join(path.dirname(TATEMONO_PATH), 'assets', 'dino.svg'), path.join(tatemonoDir, 'assets', 'player.svg'))
    const tatemonoPath = path.join(tatemonoDir, 'core.tsx')
    fs.writeFileSync(tatemonoPath, `/* @arkzen:meta
name: scene-2d
version: 1.0.0
description: Unity 2D scene
auth: false
*/
/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: 2D Scene
main_scene: Assets/Scenes/Main.unity
*/
/* @arkzen:unity:assets
player_art:
  source: assets/player.svg
*/
/* @arkzen:unity:scene:main
path: Assets/Scenes/Main.unity
nodes:
  - name: MainCamera
    type: camera
    main: true
    projection: orthographic
    orthographic_size: 5
  - name: Player
    type: sprite
    sprite: player_art
    components:
      - type: rigidbody_2d
      - type: box_collider_2d
        size: [0.8, 1]
      - type: platform_controller_2d
        speed: 6
        jump_velocity: 9
  - name: Wanderer
    type: sprite
    sprite: player_art
    components:
      - type: rigidbody_2d
        body_type: kinematic
        gravity_scale: 0
      - type: circle_collider_2d
        radius: 0.4
      - type: top_down_controller_2d
        speed: 2
*/
/* @arkzen:unity:scene:main:end */
`)

    const outputDir = path.join(tempDir, 'project')
    generateUnityProject({ tatemonoPath, outputDir })

    assert.ok(fs.existsSync(path.join(outputDir, 'Assets', 'Resources', 'player_art.svg')))
    assert.match(fs.readFileSync(path.join(outputDir, 'Packages', 'manifest.json'), 'utf8'), /com\.unity\.vectorgraphics/)
    const runtime = fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'PluffSceneBootstrap.cs'), 'utf8')
    assert.match(runtime, /BoxCollider2D/)
    assert.match(runtime, /Rigidbody2D/)
    assert.match(runtime, /PluffPlatformController2D/)
    assert.match(runtime, /PluffTopDownController2D/)
  })
})
