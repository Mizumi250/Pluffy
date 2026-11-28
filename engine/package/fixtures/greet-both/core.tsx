/* @arkzen:meta
name: greet-both
version: 1.0.0
description: The same greeting helper for npm and PyPI
auth: false
*/

/* @arkzen:pkg:project
name: greet-both
kind: library
license: MIT
author: Ana
targets: [npm, pypi]
*/

/* @arkzen:pkg:target:npm
name: "@demo/greet-both"
*/

/* @arkzen:pkg:target:pypi
name: demo-greet-both
requires_python: ">=3.9"
*/

/* @arkzen:pkg:source:ts:index
entry: true
*/
export function greet(name: string): string {
  return `Hello, ${name}`
}
/* @arkzen:pkg:source:ts:index:end */

/* @arkzen:pkg:source:py:index
entry: true
*/
def greet(name: str) -> str:
    return f"Hello, {name}"
/* @arkzen:pkg:source:py:index:end */

/* @arkzen:pkg:exports
entries:
  ".": index
*/

/* @arkzen:pkg:verify
import: [greet]
*/
