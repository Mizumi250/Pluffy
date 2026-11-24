'use strict'
const { contextBridge, ipcRenderer } = require('electron')
const call = (ch) => (...a) => ipcRenderer.invoke(ch, ...a)

contextBridge.exposeInMainWorld('pluffy', {
  platform: process.platform,
  ready: call('engine:ready'),
  env: call('env:check'),
  lists: call('lists:get'),
  hasPty: call('term:hasPty'),
  termCreate: call('term:create'),
  termWrite: (id, data) => ipcRenderer.send('term:write', id, data),
  termResize: (id, c, r) => ipcRenderer.send('term:resize', id, c, r),
  termCli: call('term:cli'),
  termKill: call('term:kill'),
  openVSCode: call('open:vscode'),
  openCmd: call('open:cmd'),
  openChat: call('open:chat'),
  openFolder: call('open:folder'),
  editorStart: call('editor:start'),
  editorStop: call('editor:stop'),
  extList: call('ext:list'),
  extImport: call('ext:import'),
  extInstall: call('ext:install'),
  extFolder: call('ext:folder'),
  engineInfo: call('engine:info'),
  engineUpdate: call('engine:update'),
  engineResync: call('engine:resync'),
  onEvent: (cb) => {
    const h = (_e, evt) => cb(evt)
    ipcRenderer.on('evt', h)
    return () => ipcRenderer.removeListener('evt', h)
  },
})
