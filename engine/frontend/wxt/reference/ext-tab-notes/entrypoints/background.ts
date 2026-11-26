import { defineBackground } from 'wxt/utils/define-background'
import { browser } from 'wxt/browser'
import { storage } from 'wxt/utils/storage'

export default defineBackground({
  type: 'module',
  main() {
    const noteItem = storage.defineItem<string>('local:note', { fallback: '' })

    async function refreshBadge(note: string) {
      await browser.action.setBadgeText({ text: note.trim() ? '•' : '' })
    }

    noteItem.getValue().then(refreshBadge)
    noteItem.watch(refreshBadge)
  },
})
