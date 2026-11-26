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
