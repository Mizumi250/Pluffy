// Tests for the runtime helpers, against a mocked chrome API. Run: npm test
import { test } from 'node:test'
import assert from 'node:assert/strict'

type Listener = (...args: any[]) => unknown
const listeners = { command: [] as Listener[], menuClick: [] as Listener[], installed: [] as Listener[] }
const calls: string[] = []
const created: unknown[] = []
let panelBehavior: unknown

// wxt/browser reads globalThis.chrome when it is first imported, so the mock has to exist before the import.
;(globalThis as any).chrome = {
  runtime: { id: 'test-ext', onInstalled: { addListener: (f: Listener) => listeners.installed.push(f) } },
  commands: { onCommand: { addListener: (f: Listener) => listeners.command.push(f) } },
  contextMenus: {
    onClicked: { addListener: (f: Listener) => listeners.menuClick.push(f) },
    removeAll: async () => { calls.push('removeAll') },
    create: (item: unknown) => { calls.push('create'); created.push(item) },
  },
  sidePanel: { setPanelBehavior: async (o: unknown) => { panelBehavior = o } },
}
const { ext, registerMenus, openSidePanelOnActionClick } = await import('./ext')

test('ext.commands.on: runs the handler only for its own command, with the tab', () => {
  const seen: unknown[] = []
  ext.commands.on('toggle', tab => { seen.push(tab) })
  ext.commands.on('other', () => { seen.push('other ran') })
  for (const l of listeners.command) l('toggle', { id: 7 })
  for (const l of listeners.command) l('unrelated', { id: 8 })
  assert.deepEqual(seen, [{ id: 7 }])
})

test('ext.menus.on: matches menuItemId as a string, passes info and tab', () => {
  const seen: unknown[] = []
  ext.menus.on('save', (info, tab) => { seen.push([info.menuItemId, tab]) })
  for (const l of listeners.menuClick) l({ menuItemId: 'save' }, { id: 1 })
  for (const l of listeners.menuClick) l({ menuItemId: 'nope' }, { id: 2 })
  assert.deepEqual(seen, [['save', { id: 1 }]])
})

test('registerMenus: on install it removes old items first, then creates in the given order', async () => {
  registerMenus([{ id: 'root', title: 'Root' }, { id: 'child', title: 'Child', parentId: 'root' }])
  assert.equal(listeners.installed.length, 1)
  assert.deepEqual(calls, [], 'nothing happens until the extension is installed')
  await listeners.installed[0]!({ reason: 'install' })
  assert.deepEqual(calls, ['removeAll', 'create', 'create'])
  assert.deepEqual(created, [{ id: 'root', title: 'Root' }, { id: 'child', title: 'Child', parentId: 'root' }])
})

test('openSidePanelOnActionClick: asks Chrome to open the panel from the toolbar icon', () => {
  openSidePanelOnActionClick()
  assert.deepEqual(panelBehavior, { openPanelOnActionClick: true })
})

test('openSidePanelOnActionClick: does nothing, and does not throw, without chrome.sidePanel (Firefox)', () => {
  const real = (globalThis as any).chrome.sidePanel
  delete (globalThis as any).chrome.sidePanel
  try {
    assert.doesNotThrow(() => openSidePanelOnActionClick())
  } finally {
    ;(globalThis as any).chrome.sidePanel = real
  }
})
