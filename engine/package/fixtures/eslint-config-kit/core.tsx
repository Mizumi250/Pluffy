/* @arkzen:meta
name: eslint-config-kit
version: 1.0.0
description: Shared lint and TypeScript config
auth: false
*/

/* @arkzen:pkg:project
name: config
kind: config
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: "@demo/config"
*/

/* @arkzen:pkg:source:ts:base
ext: js
*/
export const rules = { 'no-unused-vars': 'warn', eqeqeq: 'error' }
export default [{ files: ['**/*.ts'], rules }]
/* @arkzen:pkg:source:ts:base:end */

/* @arkzen:pkg:source:ts:tsconfig
path: tsconfig.base.json
*/
{
  "compilerOptions": { "strict": true, "target": "ES2022", "module": "ESNext" }
}
/* @arkzen:pkg:source:ts:tsconfig:end */

/* @arkzen:pkg:exports
entries:
  ".": base
  "./tsconfig": tsconfig
*/

/* @arkzen:pkg:verify
import: [rules]
*/
