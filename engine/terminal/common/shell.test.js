import { test } from 'node:test'
import assert from 'node:assert/strict'
import { splitArgs, matchesExpectation } from './shell.js'

test('splitArgs splits on spaces and keeps quoted text together', () => {
  assert.deepEqual(splitArgs('add "buy milk"'), ['add', 'buy milk'])
  assert.deepEqual(splitArgs("add 'it is $HOME'"), ['add', 'it is $HOME'])
  assert.deepEqual(splitArgs('  a   b  '), ['a', 'b'])
  assert.deepEqual(splitArgs(''), [])
})

test('splitArgs handles escapes and empty quoted arguments', () => {
  assert.deepEqual(splitArgs('say "a \\"quoted\\" word"'), ['say', 'a "quoted" word'])
  assert.deepEqual(splitArgs('a\\ b c'), ['a b', 'c'])
  assert.deepEqual(splitArgs('x "" y'), ['x', '', 'y'])
  assert.deepEqual(splitArgs('--name="Ada Lovelace"'), ['--name=Ada Lovelace'])
})

test('splitArgs rejects an unterminated quote', () => {
  assert.throws(() => splitArgs('add "oops'), /unterminated/)
})

test('matchesExpectation: substring by default, regular expression between slashes', () => {
  assert.equal(matchesExpectation('added: milk', 'added'), true)
  assert.equal(matchesExpectation('added: milk', 'removed'), false)
  assert.equal(matchesExpectation('{"ok": true}', '/"ok": (true|false)/'), true)
  assert.equal(matchesExpectation('abc', '/^b/'), false)
  assert.equal(matchesExpectation('a/b', '/'), true, 'a lone slash is a substring')
})
