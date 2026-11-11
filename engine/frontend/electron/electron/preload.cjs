// ARKZEN ELECTRON — preload bridge (only attached when a Tatemono declares
// @arkzen:desktop:frame:electron). Exposes window.arkzenHost to the web app:
//
//   arkzenHost.platform                    → 'electron'
//   arkzenHost.onCommand((id, payload) => …) → host → web (menu / tray / shortcut)
//   arkzenHost.emit(channel, payload)      → web → host (received by ctx.onEvent)
//
// It must stay CommonJS: Electron preload scripts run sandboxed.
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('arkzenHost', {
  platform: 'electron',
  onCommand(handler) {
    const listener = (_event, id, payload) => handler(id, payload)
    ipcRenderer.on('arkzen:command', listener)
    return () => ipcRenderer.removeListener('arkzen:command', listener)
  },
  emit(channel, payload) {
    ipcRenderer.send('arkzen:event', { channel, payload })
  },
})
