import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readTatemono } from './read.js'
import { buildModel, camel } from './model.js'

test('camel turns dashes, underscores and dots into camelCase', () => {
  assert.equal(camel('dry-run'), 'dryRun')
  assert.equal(camel('my_arg'), 'myArg')
  assert.equal(camel('plain'), 'plain')
  assert.equal(camel('a-b-c'), 'aBC')
})

test('the todo fixture becomes the expected model', async () => {
  const read = await readTatemono('term-todo-cli')
  assert.equal(read.valid, true)
  const m = buildModel(read.parsed)
  assert.equal(m.project.binary, 'todo')
  assert.equal(m.project.version, '1.0.0')
  assert.equal(m.project.defaultCommand, 'list')
  assert.deepEqual(m.commands.map(c => c.name), ['add', 'list', 'tag', 'tag.add', 'version'])
  const tag = m.commandTree.find(c => c.name === 'tag')
  assert.deepEqual(tag.children.map(c => c.name), ['tag.add'])
  assert.equal(tag.builtin, 'help')
  assert.equal(m.commands.find(c => c.name === 'version').builtin, 'version')
  assert.deepEqual(Object.keys(m.handlers.ts), ['add', 'list', 'tag.add'])
  assert.equal(m.handlers.ts.list.async, true)
  assert.equal(m.runtimes.ts.framework, 'commander')
  assert.equal(m.runtimes.ts.minVersion, '20')
})

test('arguments and flags get defaults and camelCase props', async () => {
  const read = await readTatemono('term-cli-features')
  const m = buildModel(read.parsed)
  const greet = m.commands.find(c => c.name === 'greet')
  assert.deepEqual(greet.args.map(a => [a.name, a.default, a.required]), [['name', 'world', false]])
  const tag = greet.flags.find(f => f.name === 'tag')
  assert.equal(tag.repeatable, true)
  assert.equal(greet.flags.find(f => f.name === 'style').env, 'GREET_STYLE')
  const migrate = m.commands.find(c => c.name === 'db.migrate')
  assert.equal(migrate.flags[0].prop, 'dryRun')
  assert.deepEqual(migrate.aliases, ['m'])
  assert.equal(m.commands.find(c => c.name === 'db.seed.run').path.length, 3)
  const old = m.commands.find(c => c.name === 'old')
  assert.equal(old.hidden, true)
  assert.equal(old.deprecated, 'use status instead')
})

test('a runtime with no block still gets the default framework', async () => {
  const read = await readTatemono('term-create-site')
  const m = buildModel(read.parsed)
  assert.equal(m.runtimes.ts.framework, 'commander')
  assert.equal(m.runtimes.ts.explicit, false)
})
