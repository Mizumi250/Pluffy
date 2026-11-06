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
    assert.match(fs.readFileSync(path.join(outputDir, 'scenes', 'player.tscn'), 'utf8'), /CharacterBody3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /func _physics_process/)
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
    assert.doesNotMatch(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /PlaneShape3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'main.gd'), 'utf8'), /BoxShape3D/)
    assert.match(fs.readFileSync(path.join(outputDir, 'scripts', 'player.gd'), 'utf8'), /component\.name = str\(config\.get/)
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
