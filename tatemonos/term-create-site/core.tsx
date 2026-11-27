/* @arkzen:meta
name: term-create-site
version: 1.0.0
description: Prompt-only site scaffolder
auth: false
*/

/* @arkzen:term:project
name: create-site
binary: create-site
mode: cli
runtimes: [ts]
*/

/* @arkzen:term:prompt:site
steps:
  - id: name
    type: text
    message: Project name
    required: true
    validate:
      regex: "^[a-z][a-z0-9-]*$"
  - id: style
    type: select
    message: Pick a style
    choices: [plain, dark]
    default: plain
  - id: title
    type: text
    message: Page title
    when:
      style: dark
result: answers
fallback:
  name:
    flag: --name
    env: SITE_NAME
  style:
    flag: --style
*/

/* @arkzen:term:command:create
description: Create a new site
prompt: site
*/

/* @arkzen:term:assets
templates:
  - source: templates/index.html
    target: "{{name}}/index.html"
    variables: [name, style, title]
*/
