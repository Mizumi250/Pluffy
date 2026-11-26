'use strict'
// Light / dark. Loaded in <head> so the right colors are on screen before the first paint.
// The choice is kept in localStorage; with no choice yet it follows the system.
;(function () {
  const KEY = 'pluffy-theme'
  const root = document.documentElement
  const listeners = []
  const saved = () => { try { return localStorage.getItem(KEY) } catch { return null } }
  const system = () => (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  const get = () => (root.dataset.theme === 'dark' ? 'dark' : 'light')
  function apply(mode, persist) {
    root.dataset.theme = mode
    if (persist) { try { localStorage.setItem(KEY, mode) } catch { /* not fatal */ } }
    for (const cb of listeners) cb(mode)
  }
  apply(saved() || system(), false)
  window.theme = {
    get,
    set: (mode) => apply(mode === 'dark' ? 'dark' : 'light', true),
    toggle: () => apply(get() === 'dark' ? 'light' : 'dark', true),
    onChange: (cb) => { listeners.push(cb) },
  }
})()
