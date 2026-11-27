/* @arkzen:meta
name: term-cli-features
version: 2.1.0
description: A command line program that uses every command feature
auth: false
*/

/* @arkzen:term:project
name: features
binary: features
mode: cli
runtimes: [ts]
license: MIT
default_command: status
*/

/* @arkzen:term:runtime:ts
framework: commander
*/

/* @arkzen:term:command:status
description: Show the program status
output: json
examples:
  - cmd: status
    expect_stdout: '/"ok": true/'
*/

/* @arkzen:term:command:sum
description: Add whole numbers together
args:
  - name: numbers
    type: int
    required: true
    variadic: true
examples:
  - cmd: sum 1 2 3
    expect_stdout: "6"
  - cmd: sum 1 x
    expect_exit: 1
    expect_stderr: Expected a whole number
*/

/* @arkzen:term:command:greet
description: Greet someone
args:
  - name: name
    type: string
    default: world
flags:
  - name: shout
    short: s
    type: bool
  - name: times
    short: n
    type: int
    default: 1
  - name: tag
    type: string
    repeatable: true
  - name: style
    type: choice
    choices: [plain, fancy]
    default: plain
    env: GREET_STYLE
  - name: color
    type: bool
    default: true
examples:
  - cmd: greet
    expect_stdout: "hello, world"
  - cmd: greet --shout Ada
    expect_stdout: "HELLO, ADA"
  - cmd: greet -n 2 --tag a --tag b Ada
    expect_stdout: "tags: a,b"
  - cmd: greet --no-color
    expect_stdout: "color: false"
*/

/* @arkzen:term:command:upper
description: Print standard input in capitals
stdin: true
*/

/* @arkzen:term:command:fail
description: Exit with a code
flags:
  - name: code
    short: c
    type: int
    default: 3
exit_codes:
  0: nothing went wrong
  3: the default failure
examples:
  - cmd: fail
    expect_exit: 3
  - cmd: fail --code 7
    expect_exit: 7
*/

/* @arkzen:term:command:die
description: Stop with ctx.exit
examples:
  - cmd: die
    expect_exit: 4
    expect_stderr: boom
*/

/* @arkzen:term:command:old
description: An old command
hidden: true
deprecated: use status instead
examples:
  - cmd: old
    expect_stdout: old
    expect_stderr: deprecated
*/

/* @arkzen:term:command:deploy
description: Deploy to an environment
flags:
  - name: env
    type: choice
    choices: [staging, prod]
    required: true
exit_codes:
  0: deployed
  1: usage error
examples:
  - cmd: deploy --env prod
    expect_stdout: "deploying to prod"
  - cmd: deploy
    expect_exit: 1
    expect_stderr: required option
*/

/* @arkzen:term:command:people
description: List people
output: table
examples:
  - cmd: people
    expect_stdout: '/name +age/'
  - cmd: people --json
    expect_stdout: '/"name": "Ada"/'
*/

/* @arkzen:term:command:db
description: Database tools
builtin: help
*/

/* @arkzen:term:command:db.migrate
description: Run migrations
aliases: [m]
flags:
  - name: dry-run
    type: bool
examples:
  - cmd: db migrate --dry-run
    expect_stdout: "migrate dry=true"
  - cmd: db m
    expect_stdout: "migrate dry=false"
*/

/* @arkzen:term:command:db.seed
description: Seed data
builtin: help
*/

/* @arkzen:term:command:db.seed.run
description: Run the seeds
examples:
  - cmd: db seed run
    expect_stdout: seeded
*/

/* @arkzen:term:handler:ts:status */
export default function status({ out }) {
  out.data({ ok: true, version: '2.1.0' })
}
/* @arkzen:term:handler:ts:status:end */

/* @arkzen:term:handler:ts:sum */
export default function sum({ args, out }) {
  out.line(String(args.numbers.reduce((a, b) => a + b, 0)))
}
/* @arkzen:term:handler:ts:sum:end */

/* @arkzen:term:handler:ts:greet */
import { shout } from '../scripts/text.js'

export default function greet({ args, flags, out }) {
  const base = `hello, ${args.name}`
  const text = flags.shout ? shout(base) : base
  for (let i = 0; i < flags.times; i++) out.line(text)
  if (flags.tag.length > 0) out.line(`tags: ${flags.tag.join(',')}`)
  out.line(`style: ${flags.style}`)
  out.line(`color: ${flags.color}`)
}
/* @arkzen:term:handler:ts:greet:end */

/* @arkzen:term:handler:ts:upper */
export default async function upper({ stdin, out }) {
  out.write((await stdin.read()).toUpperCase())
}
/* @arkzen:term:handler:ts:upper:end */

/* @arkzen:term:handler:ts:fail */
export default function fail({ flags }) {
  return flags.code
}
/* @arkzen:term:handler:ts:fail:end */

/* @arkzen:term:handler:ts:die */
export default function die({ err, exit }) {
  err.line('boom')
  exit(4)
}
/* @arkzen:term:handler:ts:die:end */

/* @arkzen:term:handler:ts:old */
export default function old({ out }) {
  out.line('old')
}
/* @arkzen:term:handler:ts:old:end */

/* @arkzen:term:handler:ts:deploy */
export default function deploy({ flags, out }) {
  out.line(`deploying to ${flags.env}`)
}
/* @arkzen:term:handler:ts:deploy:end */

/* @arkzen:term:handler:ts:people */
export default function people({ out }) {
  out.data([{ name: 'Ada', age: 36 }, { name: 'Grace', age: 45 }])
}
/* @arkzen:term:handler:ts:people:end */

/* @arkzen:term:handler:ts:db.migrate */
export default function migrate({ flags, out }) {
  out.line(`migrate dry=${flags.dryRun}`)
}
/* @arkzen:term:handler:ts:db.migrate:end */

/* @arkzen:term:handler:ts:db.seed.run */
export default function seedRun({ out }) {
  out.line('seeded')
}
/* @arkzen:term:handler:ts:db.seed.run:end */

/* @arkzen:term:script:ts:text */
export const shout = (text: string): string => text.toUpperCase()
/* @arkzen:term:script:ts:text:end */

/* @arkzen:term:test:ts:text */
import test from 'node:test'
import assert from 'node:assert/strict'
import { shout } from '../src/scripts/text.js'

test('shout makes capitals', () => {
  assert.equal(shout('ada'), 'ADA')
})
/* @arkzen:term:test:ts:text:end */
