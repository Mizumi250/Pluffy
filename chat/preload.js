'use strict'
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('pluffy', {
  platform: process.platform,
  listSessions: (q) => ipcRenderer.invoke('sessions:list', q),
  createSession: () => ipcRenderer.invoke('sessions:create'),
  renameSession: (id, title) => ipcRenderer.invoke('sessions:rename', id, title),
  deleteSession: (id) => ipcRenderer.invoke('sessions:delete', id),
  getMessages: (id) => ipcRenderer.invoke('messages:get', id),
  send: (sessionId, text) => ipcRenderer.invoke('chat:send', sessionId, text),
  stop: (sessionId) => ipcRenderer.invoke('chat:stop', sessionId),
  stopTerminal: (id) => ipcRenderer.invoke('term:stop', id),
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (s) => ipcRenderer.invoke('settings:set', s),
  health: () => ipcRenderer.invoke('server:health'),
  commands: () => ipcRenderer.invoke('commands:list'),
  onEvent: (cb) => {
    const h = (_e, evt) => cb(evt)
    ipcRenderer.on('evt', h)
    return () => ipcRenderer.removeListener('evt', h)
  },
})