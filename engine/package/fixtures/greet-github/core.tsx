/* @arkzen:meta
name: greet-github
version: 1.0.0
description: Greeting helpers on GitHub Packages
auth: false
*/

/* @arkzen:pkg:project
name: greet
kind: library
license: MIT
repository: https://github.com/demo/greet-github
targets: [github]
*/

/* @arkzen:pkg:target:github
owner: Demo
name: greet
*/

/* @arkzen:pkg:source:ts:index
entry: true
*/
export function greet(name: string): string {
  return `Hello, ${name}`
}
/* @arkzen:pkg:source:ts:index:end */

/* @arkzen:pkg:verify
import: [greet]
*/

/* @arkzen:pkg:exports
entries:
  ".": index
*/
