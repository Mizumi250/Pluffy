/* @arkzen:meta
name: demo-cli
version: 1.0.0
description: A tiny command line tool
auth: false
*/

/* @arkzen:pkg:project
name: demo-cli
kind: cli
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: "@demo/cli"
*/

/* @arkzen:pkg:source:ts:main
*/
const args = process.argv.slice(2)
if (args.includes('--version')) {
  console.log('1.0.0')
} else if (args.includes('--help') || args.length === 0) {
  console.log('Usage: demo [--version] [--help] [name]')
} else {
  console.log(`Hello, ${args[0]}`)
}
/* @arkzen:pkg:source:ts:main:end */

/* @arkzen:pkg:exports
bin:
  demo: main
*/

/* @arkzen:pkg:verify
run:
  - args: ["--version"]
    contains: "1.0.0"
  - args: ["--help"]
    contains: "Usage"
  - args: ["Ana"]
    contains: "Hello, Ana"
*/
