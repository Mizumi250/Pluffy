/* @arkzen:meta
name: ext-tab-notes
version: 1.0.0
description: Notes in the toolbar popup
auth: false
*/

/* @arkzen:ext:project
name: Tab Notes
permissions: [storage]
targets: [chrome, firefox]
*/

/* @arkzen:ext:popup
width: 360
height: 480
*/
export default function Popup() {
  return <main>Hello</main>
}
/* @arkzen:ext:popup:end */

/* @arkzen:ext:export
browsers: [chrome, firefox]
zip: true
*/
