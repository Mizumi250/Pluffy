/* @arkzen:meta
name: term-cli-prompts
version: 1.0.0
description: A command line program that asks every kind of question
auth: false
*/

/* @arkzen:term:project
name: survey
binary: survey
mode: cli
runtimes: [ts]
license: MIT
*/

/* @arkzen:term:runtime:ts
framework: commander
*/

/* @arkzen:term:prompt:survey
result: profile
steps:
  - id: name
    type: text
    message: Your name
    required: true
    validate:
      regex: "^[a-z]+$"
  - id: secret
    type: password
    message: A secret word
  - id: age
    type: number
    message: Your age
    default: 30
    validate:
      min: 0
      max: 120
  - id: ok
    type: confirm
    message: Do you agree
    default: true
  - id: color
    type: select
    message: Pick a color
    choices: [red, green, blue]
    default: green
  - id: extra
    type: text
    message: Why red
    when:
      color: red
  - id: tags
    type: multiselect
    message: Pick tags
    choices: [a, b, c]
  - id: where
    type: path
    message: Where to look
    default: "."
  - id: lang
    type: autocomplete
    message: Pick a language
    choices: [ts, py, rs, go]
    default: ts
  - id: notes
    type: editor
    message: Notes
    when:
      ok: false
fallback:
  name:
    flag: --name
    env: SURVEY_NAME
  secret:
    env: SURVEY_SECRET
  age:
    flag: --age
  ok:
    flag: --ok
  color:
    flag: --color
  extra:
    flag: --why
  tags:
    flag: --tags
  where:
    flag: --where
  lang:
    flag: --lang
*/

/* @arkzen:term:command:survey
description: Ask a few questions
prompt: survey
examples:
  - cmd: survey --name ada --age 36 --color blue --tags a,b --ok
    expect_stdout: '/"color": "blue"/'
  - cmd: survey --name ada --color red --why bored
    expect_stdout: '/"extra": "bored"/'
  - cmd: survey --name ada
    expect_stdout: '/"age": 30/'
  - cmd: survey --name ada --no-ok
    expect_stdout: '/"ok": false/'
  - cmd: survey
    expect_exit: 1
    expect_stderr: missing value for "name"
  - cmd: survey --name BAD
    expect_exit: 1
    expect_stderr: does not match
  - cmd: survey --name ada --age 200
    expect_exit: 1
    expect_stderr: must be at most 120
  - cmd: survey --name ada --color purple
    expect_exit: 1
    expect_stderr: Allowed choices
*/

/* @arkzen:term:handler:ts:survey */
export default function survey({ profile, out }) {
  out.json({ ...profile, secret: profile.secret ? '***' : undefined })
}
/* @arkzen:term:handler:ts:survey:end */
