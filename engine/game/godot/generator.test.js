import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateGodotProject } from './generator.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', '..')
const TATEMONO_PATH = path.join(ROOT_DIR, 'tatemonos', 'godot-game', 'core.tsx')

function withTempDir(run) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluff-godot-test-'))
  try {
    run(tempDir)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

function copyTatemonoAssets(targetDir) {
  fs.cpSync(path.join(path.dirname(TATEMONO_PATH), 'assets'), targetDir, { recursive: true })
}

test('generates a Godot project from the Godot DSL blocks', () => {
  withTempDir(tempDir => {
    const outputDir = path.join(tempDir, 'project')
    const result = generateGodotProject({ tatemonoPath: TATEMONO_PATH, outputDir })

    assert.deepEqual(result.scenes, ['res://scenes/main.tscn', 'res://scenes/player.tscn'])
    assert.match(fs.readFileSync(path.join(outputDir, 'project.godot'), 'utf8'), /run\/main_scene="res:\/\/scenes\/main\.tscn"/)
    assert.match(fs.readFileSync(path.join(outputDir, 'project.godot'), 'utf8'), /renderer\/rendering_method="forward_plus"/)
    assert.match(fs.readFileSync(path.join(outputDir, 'project.godot'), 'utf8'), /PluffMultiplayer="\*res:\/\/scripts\/multiplayer\.gd"/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'multiplayer.gd'), 'utf8'), /create_server\(PORT, MAX_CLIENTS\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'multiplayer.gd'), 'utf8'), /create_client\(host, PORT\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _create_multiplayer_ui/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func spawn_network_player/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scenes', 'player.tscn'), 'utf8'), /CharacterBody3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _physics_process/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _receive_network_input/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _apply_network_state/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /const CAMERA_RELATIVE := true/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /"run_" if is_running else "walk_"/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /const ACTION_JUMP := "jump"/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /const JUMP_VELOCITY := 6\.5/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /var current_horizontal := Vector2\(velocity\.x, velocity\.z\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /current_horizontal\.move_toward\(target_horizontal, horizontal_rate \* delta\)/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /velocity\.x = direction\.x \* current_speed/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /Input\.is_action_just_pressed\(ACTION_JUMP\)/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /run_frames_per_second/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /run_row_offset/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _direction_for_input/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _create_component/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'camera_follow.gd'), 'utf8'), /func _process/)
    assert.match(fs.readFileSync(path.join(outputDir, 'export_presets.cfg'), 'utf8'), /platform="Windows Desktop"/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /var direction :=/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /var delta :=/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /var prop_delta :=/)
    assert.equal(result.missingOptionalAssets.length, 0)
    assert.equal(result.copiedAssetCount, 9)
    assert.ok(fs.existsSync(path.join(outputDir, 'assets', 'images', 'character1.png')))
    assert.ok(fs.existsSync(path.join(outputDir, 'assets', 'images', 'tile-grass.png')))
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /node\.texture = load\(texture_path\) as Texture2D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _apply_world_environment/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /grid_width/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /_spawn_ethereane_world/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /WorldProps/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _create_world_character/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _create_sky\(/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /shader_type sky/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /ray_spokes/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /Environment\.BG_SKY/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /Environment\.AMBIENT_SOURCE_SKY/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /Sky\.PROCESS_MODE_REALTIME/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /SkyDome|depth_draw_never/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /sun_azimuth/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /volumetric_fog_enabled/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /ssao_enabled/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /ssil_enabled/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /ssr_enabled/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /TONE_MAPPER_ACES/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /glow_levels\/%d/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _update_npcs/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _update_interaction/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _update_minimap/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /sprite\.pixel_size = 0\.03125/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /sprite\.shaded = true/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /_dialogue_text\.add_theme_font_size_override/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /(?<!_)dialogue_text\./)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /npcSettings/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _create_ground_shadow/)
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /PlaneShape3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /BoxShape3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /component\.name = str\(config\.get/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'camera_follow.gd'), 'utf8'), /far = 500\.0/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'camera_follow.gd'), 'utf8'), /const MAX_DISTANCE := 7\.5/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'camera_follow.gd'), 'utf8'), /MOUSE_BUTTON_WHEEL_UP/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'camera_follow.gd'), 'utf8'), /MOUSE_BUTTON_RIGHT/)
  })
})

test('keeps immediate horizontal movement when acceleration options are omitted', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'instant-movement-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: instant-movement-game')
      .replace(/  acceleration: 18\r?\n  deceleration: 24\r?\n/, '')
    const tatemonoPath = path.join(fixtureDir, 'core.tsx')
    fs.writeFileSync(tatemonoPath, source)

    generateGodotProject({ tatemonoPath, outputDir: path.join(tempDir, 'output') })

    const playerScript = fs.readFileSync(path.join(tempDir, 'output', 'scripts', 'player.gd'), 'utf8')
    assert.match(playerScript, /velocity\.x = direction\.x \* current_speed/)
    assert.match(playerScript, /velocity\.z = direction\.z \* current_speed/)
    assert.doesNotMatch(playerScript, /var target_horizontal :=/)
  })
})

test('rejects undeclared jump actions and invalid camera zoom ranges', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'invalid-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: invalid-game')
    const tatemonoPath = path.join(fixtureDir, 'core.tsx')
    const outputDir = path.join(tempDir, 'output')

    fs.writeFileSync(tatemonoPath, source.replace('jump_action: jump', 'jump_action: missing_jump'))
    assert.throws(
      () => generateGodotProject({ tatemonoPath, outputDir }),
      /Player behavior refers to undeclared jump action "missing_jump"/
    )
    assert.equal(fs.existsSync(outputDir), false)

    fs.writeFileSync(tatemonoPath, source.replace('max_distance: 7.5', 'max_distance: 0.5'))
    assert.throws(
      () => generateGodotProject({ tatemonoPath, outputDir }),
      /Camera zoom\.max_distance must be at least min_distance/
    )
    assert.equal(fs.existsSync(outputDir), false)
  })
})

test('keeps multiplayer opt-in when its DSL block is absent', () => {
    withTempDir(tempDir => {
      const fixtureDir = path.join(tempDir, 'singleplayer-game')
      fs.mkdirSync(fixtureDir)
      copyTatemonoAssets(path.join(fixtureDir, 'assets'))
      const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
        .replace('name: godot-game', 'name: singleplayer-game')
        .replace(/\/\* @arkzen:godot:multiplayer\r?\n[\s\S]*?\/\* @arkzen:godot:multiplayer:end \*\/\r?\n/, '')
      const tatemonoPath = path.join(fixtureDir, 'core.tsx')
      const outputDir = path.join(tempDir, 'output')
      fs.writeFileSync(tatemonoPath, source)

      generateGodotProject({ tatemonoPath, outputDir })

      assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'project.godot'), 'utf8'), /PluffMultiplayer/)
      assert.equal(fs.existsSync(path.join(outputDir, 'scripts', 'multiplayer.gd')), false)
      assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /func _create_multiplayer_ui/)
    })
  })

test('rejects invalid ENet multiplayer settings and Web exports', () => {
    withTempDir(tempDir => {
      const fixtureDir = path.join(tempDir, 'invalid-multiplayer-game')
      fs.mkdirSync(fixtureDir)
      copyTatemonoAssets(path.join(fixtureDir, 'assets'))
      const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
        .replace('name: godot-game', 'name: invalid-multiplayer-game')
      const tatemonoPath = path.join(fixtureDir, 'core.tsx')
      const outputDir = path.join(tempDir, 'output')

      fs.writeFileSync(tatemonoPath, source.replace('port: 24567', 'port: 80'))
      assert.throws(
        () => generateGodotProject({ tatemonoPath, outputDir }),
        /multiplayer port must be an integer from 1024 to 65535/
      )
      assert.equal(fs.existsSync(outputDir), false)

      fs.writeFileSync(tatemonoPath, source.replace(/web:\r?\n    runnable: false/, 'web:\n    runnable: true'))
      assert.throws(
        () => generateGodotProject({ tatemonoPath, outputDir }),
        /ENet multiplayer does not support Web exports/
      )
      assert.equal(fs.existsSync(outputDir), false)
    })
  })

test('requires Forward+ for volumetric and screen-space effects', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'compatibility-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: compatibility-game')
      .replace('renderer: forward_plus', 'renderer: gl_compatibility')
    fs.writeFileSync(path.join(fixtureDir, 'core.tsx'), source)

    assert.throws(
      () => generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir: path.join(tempDir, 'output') }),
      /volumetric fog, SSAO, SSIL, SSR, and glow require renderer: forward_plus/
    )
    assert.equal(fs.existsSync(path.join(tempDir, 'output')), false)
  })
})

test('rejects undeclared textures in Godot visual settings', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'unsafe-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: unsafe-game')
      .replace('cloud_layers: [sky_layer_1, sky_layer_2, sky_layer_3]', 'cloud_layers: [missing_sky_texture]')
    fs.writeFileSync(path.join(fixtureDir, 'core.tsx'), source)

    assert.throws(
      () => generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir: path.join(tempDir, 'output') }),
      /Godot world sky\.cloud_layers must reference declared textures/
    )
    assert.equal(fs.existsSync(path.join(tempDir, 'output')), false)
  })
})

test('regenerates an existing project and replaces its previous output', () => {
  withTempDir(tempDir => {
    const outputDir = path.join(tempDir, 'project')
    fs.mkdirSync(outputDir)
    fs.writeFileSync(path.join(outputDir, 'user-note.txt'), 'preserve me')

    const result = generateGodotProject({ tatemonoPath: TATEMONO_PATH, outputDir })

    assert.ok(fs.existsSync(path.join(outputDir, 'project.godot')))
    assert.equal(fs.existsSync(path.join(outputDir, 'user-note.txt')), false)
    assert.deepEqual(fs.readdirSync(tempDir), ['project'])
  })
})

test('copies declared assets into the generated res:// layout', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'godot-game')
    const sourceAssets = path.join(fixtureDir, 'assets')
    const outputDir = path.join(tempDir, 'project')
    copyTatemonoAssets(sourceAssets)
    fs.copyFileSync(TATEMONO_PATH, path.join(fixtureDir, 'core.tsx'))
    const audioBytes = Buffer.from('audio fixture')
    const dataBytes = Buffer.from('unreferenced data fixture')
    fs.writeFileSync(path.join(sourceAssets, 'ambient.wav'), audioBytes)
    fs.writeFileSync(path.join(sourceAssets, 'unreferenced.json'), dataBytes)

    const result = generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir })

    assert.deepEqual(fs.readFileSync(path.join(outputDir, 'assets', 'images', 'tile-grass.png')), fs.readFileSync(path.join(sourceAssets, 'images', 'tile-grass.png')))
    assert.deepEqual(fs.readFileSync(path.join(outputDir, 'assets', 'audio', 'ambient.wav')), audioBytes)
    assert.deepEqual(fs.readFileSync(path.join(outputDir, 'assets', 'data', 'unreferenced.json')), dataBytes)
    assert.equal(result.copiedAssetCount, 11)
  })
})

test('rejects a Godot scene path that escapes the generated project', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'unsafe-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: unsafe-game')
      .replace('path: res://scenes/main.tscn', 'path: res://../outside.tscn')
    fs.writeFileSync(path.join(fixtureDir, 'core.tsx'), source)

    assert.throws(
      () => generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir: path.join(tempDir, 'output') }),
      /safe res:\/\/ \.tscn path/
    )
    assert.equal(fs.existsSync(path.join(tempDir, 'output')), false)
  })
})

test('removes a partial export after a required asset is missing', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'unsafe-game')
    fs.mkdirSync(fixtureDir)
    copyTatemonoAssets(path.join(fixtureDir, 'assets'))
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8')
      .replace('name: godot-game', 'name: unsafe-game')
      .replace('assets/images/character1.png', 'assets/images/missing.png')
    fs.writeFileSync(path.join(fixtureDir, 'core.tsx'), source)
    const outputDir = path.join(tempDir, 'output')

    assert.throws(
      () => generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir }),
      /Required asset "player_sheet" does not exist under assets\/images\/missing\.png/
    )
    assert.equal(fs.existsSync(outputDir), false)
  })
})

test('preserves the existing project if regeneration fails', () => {
  withTempDir(tempDir => {
    const fixtureDir = path.join(tempDir, 'unsafe-game')
    fs.mkdirSync(fixtureDir)
    const source = fs.readFileSync(TATEMONO_PATH, 'utf8').replace('name: godot-game', 'name: unsafe-game')
    fs.writeFileSync(path.join(fixtureDir, 'core.tsx'), source)
    const outputDir = path.join(tempDir, 'output')
    fs.mkdirSync(outputDir)
    fs.writeFileSync(path.join(outputDir, 'user-note.txt'), 'keep this project')

    assert.throws(
      () => generateGodotProject({ tatemonoPath: path.join(fixtureDir, 'core.tsx'), outputDir }),
      /Required asset "player_sheet" does not exist/
    )
    assert.equal(fs.readFileSync(path.join(outputDir, 'user-note.txt'), 'utf8'), 'keep this project')
    assert.equal(fs.readdirSync(tempDir).filter(name => name.startsWith('.output-staging-')).length, 0)
  })
})
