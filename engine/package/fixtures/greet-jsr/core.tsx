/* @arkzen:meta
name: greet-jsr
version: 1.0.0
description: Greeting helpers on JSR
auth: false
*/

/* @arkzen:pkg:project
name: greet
kind: library
license: MIT
targets: [jsr]
*/

/* @arkzen:pkg:target:jsr
name: "@demo/greet"
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
