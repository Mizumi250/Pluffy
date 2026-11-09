import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import { fileURLToPath } from 'node:url'
import { generateGodotProject } from './godot/generator.js'
import { generateUnityProject } from './unity/generator.js'
import { writeGameFreeFiles } from './free-files.js'

const ROOT_DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const GODOT_DIR = path.join(ROOT_DIR, 'tatemonos', 'godot-game')
const DINO_DIR = path.join(ROOT_DIR, 'tatemonos', 'dino-runner')
const SCENE_DIR = path.join(ROOT_DIR, 'tatemonos', 'unity-scene-starter')

const block = (id, filePath, body) => `\n/* @arkzen:file:${id}\npath: ${filePath}\n*/\n${body}\n/* @arkzen:file:${id}:end */\n`

function withTempDir(run) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluff-free-test-'))
  try {
    run(tempDir)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

// Copies a real tatemono folder (core.tsx + assets) into tempDir and appends extra blocks.
function fixture(tempDir, sourceDir, extra = '') {
  const name = path.basename(sourceDir)
  const target = path.join(tempDir, name)
  fs.cpSync(sourceDir, target, { recursive: true })
  const corePath = path.join(target, 'core.tsx')
  fs.writeFileSync(corePath, fs.readFileSync(corePath, 'utf8') + extra)
  return corePath
}

test('Godot: free files are written into the generated project', () => {
  withTempDir(tempDir => {
    const corePath = fixture(tempDir, GODOT_DIR,
      block('enemy', 'scripts/enemy.gd', 'extends Node\nfunc hello():\n\tpass') +
      block('level', '/data/levels/one.json', '{"tiles": []}'))
    const outputDir = path.join(tempDir, 'out')
    const result = generateGodotProject({ tatemonoPath: corePath, outputDir })

    assert.deepEqual(result.freeFiles.written, ['scripts/enemy.gd', 'data/levels/one.json'])
    assert.deepEqual(result.freeFiles.overridden, [])
    assert.equal(fs.readFileSync(path.join(outputDir, 'scripts', 'enemy.gd'), 'utf8'), 'extends Node\nfunc hello():\n\tpass\n')
    assert.equal(fs.readFileSync(path.join(outputDir, 'data', 'levels', 'one.json'), 'utf8'), '{"tiles": []}\n')
    assert.ok(fs.existsSync(path.join(outputDir, 'project.godot')), 'generated files are still there')
  })
})

test('Godot: a free file replaces a generated file and is reported as overridden', () => {
  withTempDir(tempDir => {
    const corePath = fixture(tempDir, GODOT_DIR, block('guide', 'PLUFF_EXPORT.md', '# my own export notes'))
    const outputDir = path.join(tempDir, 'out')
    const result = generateGodotProject({ tatemonoPath: corePath, outputDir })

    assert.deepEqual(result.freeFiles.overridden, ['PLUFF_EXPORT.md'])
    assert.equal(fs.readFileSync(path.join(outputDir, 'PLUFF_EXPORT.md'), 'utf8'), '# my own export notes\n')
  })
})

test('Godot: removing a block removes its file on the next export (no manifest needed)', () => {
  withTempDir(tempDir => {
    const outputDir = path.join(tempDir, 'out')
    const withBlock = fixture(tempDir, GODOT_DIR, block('enemy', 'scripts/enemy.gd', 'extends Node'))
    generateGodotProject({ tatemonoPath: withBlock, outputDir })
    assert.ok(fs.existsSync(path.join(outputDir, 'scripts', 'enemy.gd')))

    const source = fs.readFileSync(withBlock, 'utf8')
    fs.writeFileSync(withBlock, source.slice(0, source.indexOf('\n/* @arkzen:file:enemy')))
    const result = generateGodotProject({ tatemonoPath: withBlock, outputDir })
    assert.deepEqual(result.freeFiles.written, [])
    assert.ok(!fs.existsSync(path.join(outputDir, 'scripts', 'enemy.gd')))
  })
})

test('Godot: an invalid free file fails before anything is generated', () => {
  withTempDir(tempDir => {
    const outputDir = path.join(tempDir, 'out')
    const corePath = fixture(tempDir, GODOT_DIR,
      block('escape', '../outside.txt', 'x') +
      block('token', '{frontend}/public/a.txt', 'x') +
      block('drive', 'C:/a.txt', 'x') +
      block('git', '.git/config', 'x') +
      block('envfile', '.env', 'x') +
      block('one', 'same.txt', 'x') +
      block('two', 'SAME.txt', 'x'))
    assert.throws(
      () => generateGodotProject({ tatemonoPath: corePath, outputDir }),
      error => {
        for (const part of ['".." is not allowed', 'not available in game projects', 'drive letters', '".git" is off limits', '".env" is off limits', 'already writes']) {
          assert.ok(error.message.includes(part), `missing: ${part}\n${error.message}`)
        }
        return true
      },
    )
    assert.ok(!fs.existsSync(outputDir), 'no output folder is created')
    assert.ok(!fs.existsSync(path.join(tempDir, 'outside.txt')))
  })
})

test('Godot: nothing is written when one block is invalid (all or nothing)', () => {
  withTempDir(tempDir => {
    const projectDir = path.join(tempDir, 'project')
    fs.mkdirSync(path.join(projectDir, 'folder'), { recursive: true })
    const source = block('good', 'good.txt', 'ok') + block('bad', 'folder', 'x')
    assert.throws(() => writeGameFreeFiles(source, projectDir), /is a folder/)
    assert.ok(!fs.existsSync(path.join(projectDir, 'good.txt')))
  })
})

test('Unity runner template: free files are written', () => {
  withTempDir(tempDir => {
    const corePath = fixture(tempDir, DINO_DIR, block('enemy', 'Assets/Scripts/Enemy.cs', 'public class Enemy {}'))
    const outputDir = path.join(tempDir, 'out')
    const result = generateUnityProject({ tatemonoPath: corePath, outputDir })

    assert.deepEqual(result.freeFiles.written, ['Assets/Scripts/Enemy.cs'])
    assert.equal(fs.readFileSync(path.join(outputDir, 'Assets', 'Scripts', 'Enemy.cs'), 'utf8'), 'public class Enemy {}\n')
    assert.ok(fs.existsSync(path.join(outputDir, 'Packages', 'manifest.json')))
  })
})

test('Unity scene mode: free files are written and can replace generated files', () => {
  withTempDir(tempDir => {
    const corePath = fixture(tempDir, SCENE_DIR,
      block('enemy', 'Assets/Scripts/Enemy.cs', 'public class Enemy {}') +
      block('readme', 'README.md', '# mine'))
    const outputDir = path.join(tempDir, 'out')
    const result = generateUnityProject({ tatemonoPath: corePath, outputDir })

    assert.deepEqual(result.freeFiles.written, ['Assets/Scripts/Enemy.cs', 'README.md'])
    assert.deepEqual(result.freeFiles.overridden, ['README.md'])
    assert.equal(fs.readFileSync(path.join(outputDir, 'README.md'), 'utf8'), '# mine\n')
  })
})

test('Unity: an invalid free file keeps the previous output untouched', () => {
  withTempDir(tempDir => {
    const outputDir = path.join(tempDir, 'out')
    const good = fixture(tempDir, DINO_DIR)
    generateUnityProject({ tatemonoPath: good, outputDir })
    const marker = path.join(outputDir, 'keep-me.txt')
    fs.writeFileSync(marker, 'previous output')

    fs.appendFileSync(good, block('escape', '../outside.txt', 'x'))
    assert.throws(() => generateUnityProject({ tatemonoPath: good, outputDir }), /"\.\." is not allowed/)
    assert.equal(fs.readFileSync(marker, 'utf8'), 'previous output')
  })
})

test('tatemonos without file blocks behave exactly as before', () => {
  withTempDir(tempDir => {
    const godot = generateGodotProject({ tatemonoPath: fixture(tempDir, GODOT_DIR), outputDir: path.join(tempDir, 'g') })
    const unity = generateUnityProject({ tatemonoPath: fixture(tempDir, DINO_DIR), outputDir: path.join(tempDir, 'u') })
    assert.deepEqual(godot.freeFiles, { written: [], overridden: [] })
    assert.deepEqual(unity.freeFiles, { written: [], overridden: [] })
  })
})
