// Regression tests for the ext rules in scaffold.js (the linter behind `mizumi check` and the VS Code extension).
import { test } from 'node:test'
import assert from 'node:assert/strict'
import * as path from 'node:path'
import { pathToFileURL } from 'node:url'

const scaffold = await import(pathToFileURL(path.resolve(import.meta.dirname, '..', '..', '..', '..', '..', 'scaffold.js')).href)

const META = `/* @arkzen:meta\nname: case\nversion: 1.0.0\ndescription: test\nauth: false\n*/\n`
const PROJECT = `/* @arkzen:ext:project\nname: Case\n*/\n`

test('a match pattern containing */ inside the header does not end the header', () => {
  const src = META + PROJECT + `/* @arkzen:ext:content:overlay
matches: ["https://*/*", "*://*/*"]
mode: script
*/
console.log('hi')
/* @arkzen:ext:content:overlay:end */
`
  const result = scaffold.lintSource(src, { slug: 'case' })
  assert.deepEqual(result.errors, [])
})

test('a content block without mode is still reported', () => {
  const src = META + PROJECT + `/* @arkzen:ext:content:overlay
matches: ["https://*/*"]
*/
console.log('hi')
/* @arkzen:ext:content:overlay:end */
`
  const result = scaffold.lintSource(src, { slug: 'case' })
  assert.ok(result.errors.some((e: { message?: string } | string) => String(typeof e === 'string' ? e : e.message ?? JSON.stringify(e)).includes('needs mode')), JSON.stringify(result.errors))
})
