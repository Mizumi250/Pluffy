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
  winControl: (action) => ipcRenderer.send('win:ctl', action),
  setTheme: (mode) => ipcRenderer.send('theme:set', mode),
  repoInfo: call('repo:info'),
  repoRun: call('repo:run'),
  openVSCode: call('open:vscode'),
  openCmd: call('open:cmd'),
  openChat: call('open:chat'),
  openFolder: call('open:folder'),
  tmAssets: call('tm:assets'),
  tmLint: call('tm:lint'),
  tmOutline: call('tm:outline'),
  tmComplete: call('tm:complete'),
  tmHover: call('tm:hover'),
  tmCatalog: call('tm:catalog'),
  tmCandidates: call('tm:candidates'),
  tmPlan: call('tm:plan'),
  tmFiles: call('tm:files'),
  tmRead: call('tm:read'),
  tmWrite: call('tm:write'),
  tmWatch: call('tm:watch'),
  tmReveal: call('tm:reveal'),
  tmVSCode: call('tm:vscode'),
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
