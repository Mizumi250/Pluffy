/* @arkzen:meta
name: vite-plugin-demo
version: 1.0.0
description: A Vite plugin
auth: false
*/

/* @arkzen:pkg:project
name: vite-plugin-demo
kind: plugin
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
name: vite-plugin-demo
*/

/* @arkzen:pkg:plugin
host: vite
peer_range: "^5.0.0 || ^6.0.0"
entry: default
*/

/* @arkzen:pkg:source:ts:index
entry: true
*/
export interface DemoOptions {
  banner?: string
}

export default function demo(options: DemoOptions = {}) {
  return {
    name: 'vite-plugin-demo',
    transform(code: string, id: string) {
      if (!id.endsWith('.js')) return null
      return { code: `/* ${options.banner ?? 'demo'} */\n${code}`, map: null }
    },
  }
}
/* @arkzen:pkg:source:ts:index:end */

/* @arkzen:pkg:exports
entries:
  ".": index
*/
