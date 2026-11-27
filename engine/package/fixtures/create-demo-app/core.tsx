/* @arkzen:meta
name: create-demo-app
version: 1.0.0
description: Starter project
auth: false
*/

/* @arkzen:pkg:project
name: create-demo-app
kind: template
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: create-demo-app
*/

/* @arkzen:pkg:template
bin: create-demo-app
variables:
  - name: description
    prompt: Short description
    default: A demo project
ignore:
  - "*.log"
post_install:
  - cd into the new folder
  - npm install
*/
