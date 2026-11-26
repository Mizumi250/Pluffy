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
title: Tab Notes
*/
import { useEffect, useState } from 'react'
import { storage } from 'wxt/utils/storage'

const noteItem = storage.defineItem<string>('local:note', { fallback: '' })

export default function Popup() {
  const [note, setNote] = useState('')
  const [saved, setSaved] = useState(true)

  useEffect(() => {
    noteItem.getValue().then(setNote)
  }, [])

  useEffect(() => {
    if (saved) return
    const timer = setTimeout(() => {
      noteItem.setValue(note).then(() => setSaved(true))
    }, 400)
    return () => clearTimeout(timer)
  }, [note, saved])

  return (
    <main className="flex h-full flex-col gap-2 bg-white p-3 text-sm text-neutral-900">
      <label htmlFor="note" className="font-medium">
        Tab Notes
      </label>
      <textarea
        id="note"
        className="grow resize-none rounded border border-neutral-300 p-2 outline-none focus:border-neutral-900"
        value={note}
        placeholder="Write a note..."
        onChange={(e) => {
          setNote(e.target.value)
          setSaved(false)
        }}
      />
      <span className="text-xs text-neutral-500">{saved ? 'Saved' : 'Saving...'}</span>
    </main>
  )
}
/* @arkzen:ext:popup:end */

/* @arkzen:ext:background
type: module
*/
import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'

const noteItem = storage.defineItem<string>('local:note', { fallback: '' })

async function refreshBadge(note: string) {
  await browser.action.setBadgeText({ text: note.trim() ? '•' : '' })
}

noteItem.getValue().then(refreshBadge)
noteItem.watch(refreshBadge)
/* @arkzen:ext:background:end */

/* @arkzen:ext:export
browsers: [chrome, firefox]
zip: true
*/
