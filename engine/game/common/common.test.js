import assert from 'node:assert/strict'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import {
  createAssert,
  createValidators,
  hashHex,
  isWithin,
  readNamedYamlBlocks,
  readYamlBlock,
  resolveAssetFile,
  stageAndReplace,
} from './index.js'

const check = createAssert('Test generator')

function withTempDir(run) {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'pluff-common-test-'))
  try {
    run(tempDir)
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }
}

test('createAssert prefixes failures with the generator label', () => {
  check(true, 'never thrown')
  assert.throws(() => check(false, 'broken'), /^Error: \[Test generator\] broken$/)
})

test('readYamlBlock reads one block and enforces required and duplicate rules', () => {
  const source = '/* @arkzen:demo:project\nname: x\ncount: 3\n*/\n'
  assert.deepEqual(readYamlBlock(source, 'demo:project', { assert: check, required: true }), { name: 'x', count: 3 })
  assert.equal(readYamlBlock(source, 'demo:missing', { assert: check }), null)
  assert.throws(() => readYamlBlock(source, 'demo:missing', { assert: check, required: true }), /A @arkzen:demo:missing block is required/)
  assert.throws(() => readYamlBlock(source + source, 'demo:project', { assert: check }), /Duplicate @arkzen:demo:project block/)
  assert.throws(() => readYamlBlock('/* @arkzen:demo:list\n- a\n- b\n*/\n', 'demo:list', { assert: check }), /must contain a YAML mapping/)
  assert.throws(() => readYamlBlock('/* @arkzen:demo:bad\nname: [unclosed\n*/\n', 'demo:bad', { assert: check }), /\[Test generator\] Invalid YAML in @arkzen:demo:bad/)
})

test('readNamedYamlBlocks needs the :end marker and returns names in order', () => {
  const good = [
    '/* @arkzen:demo:scene:first', 'nodes: [1]', '*/', '/* @arkzen:demo:scene:first:end */',
    '/* @arkzen:demo:scene:second', 'nodes: [2]', '*/', '/* @arkzen:demo:scene:second:end */',
  ].join('\n')
  const blocks = readNamedYamlBlocks(good, 'demo:scene', { assert: check })
  assert.deepEqual(blocks.map(block => block.name), ['first', 'second'])
  assert.deepEqual(blocks[1].nodes, [2])
  const noEnd = '/* @arkzen:demo:scene:first\nnodes: [1]\n*/\n'
  assert.throws(() => readNamedYamlBlocks(noEnd, 'demo:scene', { assert: check }), /must close with \/\* @arkzen:demo:scene:first:end \*\//)
  assert.deepEqual(readNamedYamlBlocks('nothing here', 'demo:scene', { assert: check }), [])
})

test('validators accept good values, apply fallbacks and reject bad ones', () => {
  const v = createValidators(check)
  assert.deepEqual(v.validateVector(undefined, 'p', [0, 0, 0]), [0, 0, 0])
  assert.deepEqual(v.validateVector([1, 2, 3], 'p', [0, 0, 0]), [1, 2, 3])
  assert.throws(() => v.validateVector([1, 2], 'p', []), /p must be a three-number array/)
  assert.throws(() => v.validateVector([0, 0, 0], 'p', [], false), /p cannot be \[0, 0, 0\]/)
  assert.throws(() => v.validatePositiveVector([1, -1, 1], 's', []), /s values must be positive/)
  assert.throws(() => v.validateVector2([1, 2, 3], 'o', []), /o must be a two-number array/)
  assert.equal(v.validateNumber(undefined, 'n', 7), 7)
  assert.throws(() => v.validateNumber(-1, 'n', 0), /n must be a number greater than or equal to 0/)
  assert.throws(() => v.validateNegativeNumber(2, 'g', -1), /g must be a negative number/)
  assert.doesNotThrow(() => v.validateColor('#A1b2C3', 'c'))
  assert.doesNotThrow(() => v.validateColor(undefined, 'c'))
  assert.throws(() => v.validateColor('red', 'c'), /c must be #RRGGBB/)
})

test('hashHex is deterministic and isWithin is strict', () => {
  assert.equal(hashHex('a'), hashHex('a'))
  assert.notEqual(hashHex('a'), hashHex('b'))
  assert.equal(hashHex('a').length, 32)
  assert.equal(isWithin('/a/b', '/a/b/c'), true)
  assert.equal(isWithin('/a/b', '/a/b'), false)
  assert.equal(isWithin('/a/b', '/a/c'), false)
  assert.equal(isWithin('/a/b', '/a/b-sibling'), false)
})

test('resolveAssetFile finds regular files and rejects missing files and symlinks', () => {
  withTempDir(tempDir => {
    fs.mkdirSync(path.join(tempDir, 'assets', 'img'), { recursive: true })
    fs.writeFileSync(path.join(tempDir, 'assets', 'img', 'a.png'), 'x')
    fs.symlinkSync(path.join(tempDir, 'assets', 'img', 'a.png'), path.join(tempDir, 'assets', 'link.png'))
    assert.equal(resolveAssetFile(check, tempDir, 'assets/img/a.png', 'a', 'Demo asset'), path.join(tempDir, 'assets', 'img', 'a.png'))
    assert.throws(() => resolveAssetFile(check, tempDir, 'assets/img/nope.png', 'nope', 'Demo asset'), /Required Demo asset "nope" does not exist/)
    assert.throws(() => resolveAssetFile(check, tempDir, 'assets/link.png', 'link', 'Demo asset'), /Demo asset "link" cannot use symbolic links/)
    assert.throws(() => resolveAssetFile(check, tempDir, 'assets/img', 'dir', 'Demo asset'), /must be a regular file/)
  })
})

test('stageAndReplace swaps in new output and keeps old output when the build fails', () => {
  withTempDir(tempDir => {
    const output = path.join(tempDir, 'out')
    fs.mkdirSync(output)
    fs.writeFileSync(path.join(output, 'old.txt'), 'old')

    const value = stageAndReplace(output, stagingDir => {
      fs.writeFileSync(path.join(stagingDir, 'new.txt'), 'new')
      return 42
    })
    assert.equal(value, 42)
    assert.equal(fs.existsSync(path.join(output, 'old.txt')), false)
    assert.equal(fs.readFileSync(path.join(output, 'new.txt'), 'utf8'), 'new')

    assert.throws(() => stageAndReplace(output, stagingDir => {
      fs.writeFileSync(path.join(stagingDir, 'half.txt'), 'half')
      throw new Error('build failed')
    }), /build failed/)
    assert.equal(fs.readFileSync(path.join(output, 'new.txt'), 'utf8'), 'new')
    assert.equal(fs.existsSync(path.join(output, 'half.txt')), false)
    assert.deepEqual(fs.readdirSync(tempDir).sort(), ['out'])
  })
})
