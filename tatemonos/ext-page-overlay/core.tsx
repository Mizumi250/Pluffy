/* @arkzen:meta
name: ext-page-overlay
version: 1.0.0
description: Word count overlay for any page
auth: false
*/

/* @arkzen:ext:project
name: Page Overlay
description: A word count overlay you can toggle on any page
targets: [chrome, firefox]
firefox:
  id: page-overlay@pluffy.example
  data_collection_permissions:
    required: [none]
*/

/* @arkzen:ext:content:overlay
matches: ["https://*/*", "http://*/*"]
run_at: document_idle
mode: ui
ui:
  position: overlay
  anchor: body
  append: last
  isolate: shadow
  z_index: 2147483000
*/
import { useEffect, useState } from 'react'
import { browser } from 'wxt/browser'
import { countWords } from '@ext/words'

export default function Overlay() {
  const [visible, setVisible] = useState(true)
  const [words, setWords] = useState(() => countWords(document.body.innerText))

  useEffect(() => {
    const onMessage = (message: unknown) => {
      if ((message as { type?: string } | null)?.type === 'toggle-overlay') setVisible((v) => !v)
    }
    browser.runtime.onMessage.addListener(onMessage)
    return () => browser.runtime.onMessage.removeListener(onMessage)
  }, [])

  if (!visible) return null

  return (
    <div className="fixed right-4 bottom-4 flex items-center gap-3 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 shadow-lg">
      <span>
        <strong>{words.toLocaleString()}</strong> words on this page
      </span>
      <button
        className="rounded-full border border-neutral-300 px-3 py-1 text-xs hover:bg-neutral-100"
        onClick={() => setWords(countWords(document.body.innerText))}
      >
        Recount
      </button>
    </div>
  )
}
/* @arkzen:ext:content:overlay:end */

/* @arkzen:ext:script:words */
export function countWords(text: string): number {
  const trimmed = text.trim()
  return trimmed === '' ? 0 : trimmed.split(/\s+/).length
}
/* @arkzen:ext:script:words:end */

/* @arkzen:ext:commands
- id: toggle-overlay
  key: Alt+Shift+O
  description: Show or hide the word count overlay
*/

/* @arkzen:ext:menus
- id: toggle-overlay-menu
  title: Toggle word count overlay
  contexts: [page]
*/

/* @arkzen:ext:sidepanel
title: Page Overlay
open_on_action_click: true
*/
export default function Panel() {
  return (
    <main className="flex h-full flex-col gap-3 bg-white p-4 text-sm text-neutral-900">
      <h1 className="text-base font-semibold">Page Overlay</h1>
      <p>A word count sits in the bottom right corner of every web page.</p>
      <ul className="list-disc pl-5">
        <li>Press Alt+Shift+O to hide or show it.</li>
        <li>Or right click the page and choose "Toggle word count overlay".</li>
        <li>Press Recount after the page changes.</li>
      </ul>
    </main>
  )
}
/* @arkzen:ext:sidepanel:end */

/* @arkzen:ext:background */
import { browser } from 'wxt/browser'

async function toggleOverlay(tab?: { id?: number }) {
  if (tab?.id === undefined) return
  try {
    await browser.tabs.sendMessage(tab.id, { type: 'toggle-overlay' })
  } catch {
    // pages without the overlay (browser pages, the store) have no receiver
  }
}

ext.commands.on('toggle-overlay', toggleOverlay)
ext.menus.on('toggle-overlay-menu', (_info, tab) => toggleOverlay(tab))
/* @arkzen:ext:background:end */

/* @arkzen:ext:export
browsers: [chrome, firefox]
zip: true
*/
