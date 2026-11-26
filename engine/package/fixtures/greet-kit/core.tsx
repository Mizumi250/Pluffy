/* @arkzen:meta
name: greet-kit
version: 1.0.0
description: Small greeting helpers
auth: false
*/

/* @arkzen:pkg:project
name: greet
kind: library
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: "@demo/greet"
access: public
*/

/* @arkzen:pkg:source:ts:index
entry: true
*/
export function greet(name: string): string {
  return `Hello, ${name}`
}
/* @arkzen:pkg:source:ts:index:end */

/* @arkzen:pkg:exports
entries:
  ".": index
formats: [esm, cjs, dts]
*/

/* @arkzen:pkg:verify
import: [greet]
type_check: true
*/
