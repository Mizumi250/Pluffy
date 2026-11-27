/* @arkzen:meta
name: term-todo-cli
version: 1.0.0
description: Command line todo list
auth: false
*/

/* @arkzen:term:project
name: todo
binary: todo
mode: cli
runtimes: [ts]
license: MIT
default_command: list
*/

/* @arkzen:term:runtime:ts
framework: commander
min_version: 20
*/

/* @arkzen:term:config
file: todo.json
format: json
location: xdg
env_prefix: TODO_
defaults:
  priority: normal
schema:
  priority: string
flags_override: true
*/

/* @arkzen:term:command:add
description: Add a todo item
args:
  - name: title
    type: string
    required: true
flags:
  - name: priority
    short: p
    type: choice
    choices: [low, normal, high]
    default: normal
    env: TODO_PRIORITY
examples:
  - cmd: add "buy milk"
    expect_exit: 0
    expect_stdout: added
*/

/* @arkzen:term:command:list
description: List todo items
aliases: [ls]
flags:
  - name: all
    short: a
    type: bool
    default: false
output: table
*/

/* @arkzen:term:command:tag
description: Manage tags
builtin: help
*/

/* @arkzen:term:command:tag.add
description: Add a tag to an item
args:
  - name: id
    type: int
    required: true
  - name: tag
    type: string
    required: true
*/

/* @arkzen:term:command:version
description: Print the version
builtin: version
*/

/* @arkzen:term:handler:ts:add */
export default async function add({ args, flags, out }) {
  out.line(`added: ${args.title} (${flags.priority})`)
}
/* @arkzen:term:handler:ts:add:end */

/* @arkzen:term:handler:ts:list
async: true
*/
export default async function list({ flags, out }) {
  out.line(flags.all ? 'all items' : 'open items')
}
/* @arkzen:term:handler:ts:list:end */

/* @arkzen:term:handler:ts:tag.add
command: tag.add
*/
export default function tagAdd({ args, out }) {
  out.line(`tagged ${args.id} with ${args.tag}`)
}
/* @arkzen:term:handler:ts:tag.add:end */

/* @arkzen:term:script:ts:format */
export const bullet = (text: string) => `- ${text}`
/* @arkzen:term:script:ts:format:end */

/* @arkzen:term:test:ts:add */
import test from 'node:test'
import assert from 'node:assert/strict'
test('bullet text', () => {
  assert.equal(`- a`, '- a')
})
/* @arkzen:term:test:ts:add:end */

/* @arkzen:term:export
platforms: [linux-x64]
formats: [source, archive, npm_bin]
completions: [bash, zsh]
man_page: true
embed_version: true
*/

/* @arkzen:term:readme */
# todo

A small command line todo list.

Run `todo add "buy milk"` to add an item.
/* @arkzen:term:readme:end */
