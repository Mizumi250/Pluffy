/* @arkzen:meta
name: ui-kit
version: 0.3.0
description: Button component package
auth: false
*/

/* @arkzen:web:components:Button */
import React from 'react'

export const Button = ({ children }: { children?: React.ReactNode }) => (
  <button className="px-4 py-2 rounded-xl bg-neutral-900 text-white">{children}</button>
)
/* @arkzen:web:components:Button:end */

/* @arkzen:web:style:Button */
.ui-button { border-radius: 12px; }
/* @arkzen:web:style:Button:end */

/* @arkzen:pkg:project:ui
name: ui
kind: components
license: MIT
targets: [npm]
*/

/* @arkzen:pkg:target:npm
package: ui
name: "@demo/ui"
peer_dependencies:
  react: ">=18"
*/

/* @arkzen:pkg:exports:ui
entries:
  ".": { from: "web:components:Button" }
  "./styles.css": { from: "web:style:Button" }
*/
