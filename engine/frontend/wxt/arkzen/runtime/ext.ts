// Runtime helpers for generated extension code. Imported by entrypoints/background.ts as '@/arkzen/runtime/ext'.
//
// `ext` is the object the DSL talks about: ext.commands.on(id, fn) for @arkzen:ext:commands and
// ext.menus.on(id, fn) for @arkzen:ext:menus. Handlers are registered at the top level of the background
// script on purpose, because a Manifest V3 service worker only wakes for listeners that exist when it starts.
//
// registerMenus and openSidePanelOnActionClick are called by generated code, not by tatemono authors.
import { browser, type Browser } from 'wxt/browser'

type Tab       = Browser.tabs.Tab
type MenuClick = Browser.contextMenus.OnClickData

export interface ExtMenuItem {
  id:                   string
  title?:               string
  contexts?:            string[]
  parentId?:            string
  type?:                string
  documentUrlPatterns?: string[]
}

export const ext = {
  commands: {
    /** Runs `handler` when the command `id` from @arkzen:ext:commands is triggered. */
    on(id: string, handler: (tab?: Tab) => void | Promise<void>): void {
      browser.commands.onCommand.addListener((command, tab) => {
        if (command === id) void handler(tab)
      })
    },
  },
  menus: {
    /** Runs `handler` when the menu item `id` from @arkzen:ext:menus is clicked. */
    on(id: string, handler: (info: MenuClick, tab?: Tab) => void | Promise<void>): void {
      browser.contextMenus.onClicked.addListener((info, tab) => {
        if (String(info.menuItemId) === id) void handler(info, tab)
      })
    },
  },
}

/**
 * Creates the menu items when the extension is installed or updated.
 * Items are removed first, because Chrome rejects a second create with the same id after an update.
 * `items` must list a parent before its children.
 */
export function registerMenus(items: ExtMenuItem[]): void {
  browser.runtime.onInstalled.addListener(async () => {
    await browser.contextMenus.removeAll()
    for (const item of items) browser.contextMenus.create(item as Browser.contextMenus.CreateProperties)
  })
}

/** Chrome only. Firefox has no chrome.sidePanel, its sidebar is opened from the sidebar button. */
export function openSidePanelOnActionClick(): void {
  const panel = (browser as unknown as {
    sidePanel?: { setPanelBehavior?: (options: { openPanelOnActionClick: boolean }) => Promise<void> }
  }).sidePanel
  void panel?.setPanelBehavior?.({ openPanelOnActionClick: true })
}
