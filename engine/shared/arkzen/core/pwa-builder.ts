// ============================================================
// ARKZEN ENGINE — SHARED PWA BUILDER v1.0
// Framework-agnostic PWA generation logic shared across all
// web stacks (Next.js, React+Vite, React+Inertia, etc.)
//
// Exports:
//   parsePWAConfig()        — parse @arkzen:meta pwa block
//   generateManifest()      — web app manifest JSON
//   generateServiceWorker() — SW with offline + IndexedDB sync
//   generatePWAHook()       — usePWA React hook (works any stack)
//   generateOfflinePageJSX()— offline page JSX body (stack wraps it)
//   generateSWRegistration()— SW registration snippet
//
// NOT exported here (stack-specific):
//   generatePWAFiles() — each stack ships its own version that
//   writes to the correct folder structure and injects into
//   layout.tsx (nextjs) or index.html (vite)
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono } from './parser'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ArkzenPWAConfig {
  name:             string
  short_name:       string
  description:      string
  theme_color:      string
  background_color: string
  display:          'standalone' | 'fullscreen' | 'minimal-ui' | 'browser'
  orientation?:     'portrait' | 'landscape' | 'any'
  start_url:        string
  offline:          boolean
  icons?: { src: string; sizes: string; type: string }[]
}

// ─── Parse PWA config from @arkzen:meta pwa block ────────────────────────────

export function parsePWAConfig(tatName: string, meta: any): ArkzenPWAConfig | null {
  if (!meta.pwa) return null
  const p = meta.pwa as Record<string, any>
  return {
    name:             String(p.name             ?? meta.label ?? tatName),
    short_name:       String(p.short_name       ?? tatName),
    description:      String(p.description      ?? meta.description ?? ''),
    theme_color:      String(p.theme_color      ?? '#0a0a0a'),
    background_color: String(p.background_color ?? '#ffffff'),
    display:         (p.display                 ?? 'standalone') as ArkzenPWAConfig['display'],
    orientation:     (p.orientation             ?? 'any') as ArkzenPWAConfig['orientation'],
    start_url:        String(p.start_url        ?? `/${tatName}`),
    offline:          Boolean(p.offline         ?? true),
    icons: p.icons ?? [
      { src: `/tatemonos/${tatName}/icon-192.png`,  sizes: '192x192', type: 'image/png' },
      { src: `/tatemonos/${tatName}/icon-512.png`,  sizes: '512x512', type: 'image/png' },
      { src: `/tatemonos/${tatName}/icon-mask.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

// ─── Phase 4: Web App Manifest ────────────────────────────────────────────────

export function generateManifest(tatName: string, pwa: ArkzenPWAConfig): string {
  return JSON.stringify({
    name:             pwa.name,
    short_name:       pwa.short_name,
    description:      pwa.description,
    start_url:        pwa.start_url,
    display:          pwa.display,
    orientation:      pwa.orientation ?? 'any',
    theme_color:      pwa.theme_color,
    background_color: pwa.background_color,
    scope:            `/${tatName}`,
    lang:             'en',
    icons:            pwa.icons,
    categories:       ['productivity', 'utilities'],
    prefer_related_applications: false,
  }, null, 2)
}

// ─── Phase 1+2+3: Service Worker ─────────────────────────────────────────────

export function generateServiceWorker(tatName: string, pwa: ArkzenPWAConfig): string {
  const cacheName  = `arkzen-${tatName}-v1`
  const offlinePage = `/${tatName}/offline`

  return `// ============================================================
// ARKZEN SERVICE WORKER — ${tatName}
// Phase 1: Offline page + asset caching
// Phase 2: IndexedDB mutation queue
// Phase 3: Background sync for offline mutations
// Auto-generated — do not edit directly
// ============================================================

const CACHE_NAME  = '${cacheName}'
const OFFLINE_URL = '${offlinePage}'

const PRECACHE_URLS = [
  '${pwa.start_url}',
  '${offlinePage}',
  '/tatemonos/${tatName}/icon-192.png',
  '/tatemonos/${tatName}/icon-512.png',
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE_URLS.map(url => new Request(url, { cache: 'reload' })))
           .catch(() => Promise.resolve())
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request))
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
          return response
        })
        .catch(() =>
          caches.match(request).then(cached => cached || caches.match(OFFLINE_URL))
        )
    )
    return
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(response => {
        if (response.ok) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone))
        }
        return response
      }).catch(() => cached || new Response('', { status: 408 }))
    })
  )
})

async function handleApiRequest(request) {
  if (request.method === 'GET') {
    try {
      const response = await fetch(request)
      if (response.ok) {
        const clone = response.clone()
        const cache = await caches.open(CACHE_NAME)
        cache.put(request, clone)
      }
      return response
    } catch {
      const cached = await caches.match(request)
      return cached || new Response(
        JSON.stringify({ error: 'offline', cached: false }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method)) {
    try {
      return await fetch(request)
    } catch {
      const body = await request.clone().text()
      await queueMutation({
        id: crypto.randomUUID(),
        url: request.url,
        method: request.method,
        headers: Object.fromEntries(request.headers.entries()),
        body,
        timestamp: Date.now(),
        tatemono: '${tatName}',
      })
      return new Response(
        JSON.stringify({ queued: true, message: 'Saved offline. Will sync when connected.' }),
        { status: 202, headers: { 'Content-Type': 'application/json' } }
      )
    }
  }

  return fetch(request)
}

const DB_NAME    = 'arkzen-sync-queue'
const DB_VERSION = 1
const STORE_NAME = 'mutations'

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' })
        store.createIndex('tatemono', 'tatemono', { unique: false })
        store.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function queueMutation(mutation) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).add(mutation)
    tx.oncomplete = resolve
    tx.onerror    = (e) => reject(e.target.error)
  })
}

async function getPendingMutations(tatemono) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx  = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).index('tatemono').getAll(IDBKeyRange.only(tatemono))
    req.onsuccess = (e) => resolve(e.target.result)
    req.onerror   = (e) => reject(e.target.error)
  })
}

async function deleteMutation(id) {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(id)
    tx.oncomplete = resolve
    tx.onerror    = (e) => reject(e.target.error)
  })
}

self.addEventListener('sync', (event) => {
  if (event.tag === 'arkzen-sync-${tatName}') {
    event.waitUntil(flushMutationQueue())
  }
})

self.addEventListener('online', () => { flushMutationQueue() })

async function flushMutationQueue() {
  const mutations = await getPendingMutations('${tatName}')
  if (!mutations.length) return
  console.log('[Arkzen SW] Flushing', mutations.length, 'queued mutations...')
  for (const mutation of mutations) {
    try {
      const response = await fetch(mutation.url, {
        method:  mutation.method,
        headers: { ...mutation.headers, 'X-Arkzen-Sync': 'true' },
        body:    mutation.body || undefined,
      })
      if (response.ok || response.status < 500) {
        await deleteMutation(mutation.id)
        const clients = await self.clients.matchAll()
        clients.forEach(c => c.postMessage({
          type: 'ARKZEN_SYNC_SUCCESS',
          mutation: { id: mutation.id, url: mutation.url, method: mutation.method },
          tatemono: '${tatName}',
        }))
      }
    } catch {
      console.log('[Arkzen SW] Still offline, mutation', mutation.id, 'stays queued')
    }
  }
  const clients = await self.clients.matchAll()
  clients.forEach(c => c.postMessage({
    type:     'ARKZEN_SYNC_COMPLETE',
    tatemono: '${tatName}',
    pending:  (await getPendingMutations('${tatName}')).length,
  }))
}

self.addEventListener('message', (event) => {
  if (event.data?.type === 'ARKZEN_TRIGGER_SYNC') flushMutationQueue()
  if (event.data?.type === 'ARKZEN_GET_PENDING') {
    getPendingMutations('${tatName}').then(mutations =>
      event.source?.postMessage({ type: 'ARKZEN_PENDING_COUNT', count: mutations.length, tatemono: '${tatName}' })
    )
  }
})
`
}

// ─── usePWA hook (framework-agnostic React — works next.js and vite) ──────────

export function generatePWAHook(tatName: string): string {
  return `// ============================================================
// ARKZEN PWA HOOK — ${tatName}
// Provides: online status, sync status, pending count, install prompt
// Usage: const { isOnline, isSyncing, pendingCount, installApp } = usePWA()
// Auto-generated — do not edit directly
// ============================================================

import { useState, useEffect, useCallback } from 'react'

export interface PWAState {
  isOnline:      boolean
  isSyncing:     boolean
  pendingCount:  number
  isInstallable: boolean
  isInstalled:   boolean
  installApp:    () => Promise<void>
  triggerSync:   () => void
}

let deferredPrompt: any = null

export function usePWA(): PWAState {
  const [isOnline,      setIsOnline]      = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [isSyncing,     setIsSyncing]     = useState(false)
  const [pendingCount,  setPendingCount]  = useState(0)
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled,   setIsInstalled]   = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-${tatName}.js', { scope: '/${tatName}/' })
        .then(reg => {
          navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.tatemono !== '${tatName}') return
            if (event.data.type === 'ARKZEN_SYNC_COMPLETE') { setIsSyncing(false); setPendingCount(event.data.pending ?? 0) }
            if (event.data.type === 'ARKZEN_PENDING_COUNT') { setPendingCount(event.data.count ?? 0) }
            if (event.data.type === 'ARKZEN_SYNC_SUCCESS')  { setIsSyncing(true) }
          })
          reg.active?.postMessage({ type: 'ARKZEN_GET_PENDING' })
        })
        .catch(err => console.warn('[Arkzen PWA] SW registration failed:', err))
    }

    const onOnline  = () => { setIsOnline(true);  triggerSync() }
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online',  onOnline)
    window.addEventListener('offline', onOffline)

    const onBeforeInstall = (e: Event) => { e.preventDefault(); deferredPrompt = e; setIsInstallable(true) }
    window.addEventListener('beforeinstallprompt', onBeforeInstall)

    const onAppInstalled = () => { setIsInstalled(true); setIsInstallable(false); deferredPrompt = null }
    window.addEventListener('appinstalled', onAppInstalled)

    if (window.matchMedia('(display-mode: standalone)').matches) setIsInstalled(true)

    return () => {
      window.removeEventListener('online',               onOnline)
      window.removeEventListener('offline',              onOffline)
      window.removeEventListener('beforeinstallprompt', onBeforeInstall)
      window.removeEventListener('appinstalled',        onAppInstalled)
    }
  }, [])

  const triggerSync = useCallback(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker.ready.then(reg => {
      setIsSyncing(true)
      reg.active?.postMessage({ type: 'ARKZEN_TRIGGER_SYNC' })
      if ('sync' in reg) (reg as any).sync.register('arkzen-sync-${tatName}').catch(() => {})
    })
  }, [])

  const installApp = useCallback(async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') { setIsInstalled(true); setIsInstallable(false) }
    deferredPrompt = null
  }, [])

  return { isOnline, isSyncing, pendingCount, isInstallable, isInstalled, installApp, triggerSync }
}

export function PWAStatusBar({ tatemono = '${tatName}' }: { tatemono?: string }) {
  const { isOnline, isSyncing, pendingCount, isInstallable, installApp } = usePWA()
  if (isOnline && !isSyncing && pendingCount === 0 && !isInstallable) return null
  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: isOnline ? '#0a0a0a' : '#dc2626',
      color: '#fff', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      fontSize: '13px', fontFamily: 'system-ui, sans-serif',
      boxShadow: '0 -2px 20px rgba(0,0,0,0.2)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {!isOnline && (
          <>
            <span>📴</span>
            <span>You're offline</span>
            {pendingCount > 0 && (
              <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '99px', padding: '2px 10px' }}>
                {pendingCount} changes queued
              </span>
            )}
          </>
        )}
        {isOnline && isSyncing && (
          <>
            <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⟳</span>
            <span>Syncing {pendingCount} changes...</span>
          </>
        )}
        {isOnline && !isSyncing && pendingCount > 0 && <span>{pendingCount} changes pending sync</span>}
      </div>
      {isInstallable && isOnline && (
        <button onClick={installApp} style={{
          background: '#fff', color: '#0a0a0a', border: 'none',
          borderRadius: '8px', padding: '6px 14px', fontSize: '12px',
          fontWeight: '600', cursor: 'pointer',
        }}>
          + Install App
        </button>
      )}
    </div>
  )
}
`
}

// ─── Offline page JSX body (stack wraps this differently) ────────────────────

export function generateOfflinePageJSX(tatName: string, pwa: ArkzenPWAConfig): string {
  return `    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f0', fontFamily: 'system-ui, sans-serif', padding: '24px',
    }}>
      <div style={{ textAlign: 'center', maxWidth: '360px' }}>
        <div style={{ fontSize: '64px', marginBottom: '24px' }}>📴</div>
        <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#0a0a0a', marginBottom: '12px', letterSpacing: '-0.5px' }}>
          You're offline
        </h1>
        <p style={{ fontSize: '14px', color: '#888', lineHeight: '1.6', marginBottom: '32px' }}>
          ${pwa.name} isn't available right now. Any changes you make will be saved and synced automatically when you reconnect.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: '#0a0a0a', color: '#fff', border: 'none',
            borderRadius: '14px', padding: '14px 28px',
            fontSize: '15px', fontWeight: '700', cursor: 'pointer', width: '100%',
          }}
        >
          Try Again
        </button>
      </div>
    </div>`
}

// ─── SW registration snippet ──────────────────────────────────────────────────

export function generateSWRegistration(tatName: string): string {
  return `if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw-${tatName}.js', { scope: '/${tatName}/' })
      .catch(err => console.warn('[Arkzen PWA] SW failed:', err))
  })
}`
}

// ─── Shared file writers (public assets — same for all stacks) ───────────────

export function writePWAPublicFiles(tatName: string, pwa: ArkzenPWAConfig, publicDir: string): void {
  fs.mkdirSync(publicDir, { recursive: true })

  // manifest.json
  fs.writeFileSync(
    path.join(publicDir, `manifest-${tatName}.json`),
    generateManifest(tatName, pwa),
    'utf-8'
  )
  console.log(`[Arkzen PWA] ✓ Manifest: public/manifest-${tatName}.json`)

  // service worker
  fs.writeFileSync(
    path.join(publicDir, `sw-${tatName}.js`),
    generateServiceWorker(tatName, pwa),
    'utf-8'
  )
  console.log(`[Arkzen PWA] ✓ Service Worker: public/sw-${tatName}.js`)
}

export function writePWAHook(tatName: string, hooksDir: string): void {
  fs.mkdirSync(hooksDir, { recursive: true })
  fs.writeFileSync(
    path.join(hooksDir, `usePWA-${tatName}.ts`),
    generatePWAHook(tatName),
    'utf-8'
  )
  console.log(`[Arkzen PWA] ✓ PWA Hook: arkzen/core/hooks/usePWA-${tatName}.ts`)
}
