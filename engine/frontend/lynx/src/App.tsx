import { useState, useEffect, useCallback } from '@lynx-js/react'
import { LYNX_ROUTES } from './arkzen/generated/app-routes.js'

const BACKEND_URL =
  (typeof process !== 'undefined' && process.env && process.env.ARKZEN_BACKEND_URL) ||
  'http://localhost:8000'

interface RegistryModule {
  name:        string
  version:     string
  status:      'active' | 'removed'
  pages:       string[]
  auth:        boolean
  registered:  string
  lastUpdated: string
}

interface RegistryData {
  engine:  string
  project: string
  modules: RegistryModule[]
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return '—'
  }
}

function TatemonoCard({ mod, onNavigate }: { mod: RegistryModule; onNavigate: (mod: string, page: string) => void }) {
  const isActive  = mod.status === 'active'
  const firstPage = mod.pages[0] ?? 'index'
  const routeText = firstPage !== 'index' ? '/' + mod.name + '/' + firstPage : '/' + mod.name

  return (
    <view
      bindtap={() => onNavigate(mod.name, firstPage)}
      className="bg-white rounded-2xl border border-neutral-100 overflow-hidden"
    >
      <view className="px-4 pt-4 pb-3 flex-row items-start justify-between">
        <view className="flex-1 mr-3">
          <text className="text-sm font-semibold text-neutral-900 mb-0.5">{mod.name}</text>
          <text className="text-xs text-neutral-400">v{mod.version}</text>
        </view>
        <view className={'flex-row items-center gap-1 px-2 py-0.5 rounded-full ' + (isActive ? 'bg-emerald-50' : 'bg-neutral-100')}>
          <text className={'text-xs font-medium ' + (isActive ? 'text-emerald-700' : 'text-neutral-500')}>{mod.status}</text>
        </view>
      </view>
      <view className="px-4 pb-3 flex-row gap-4">
        <view>
          <text className="text-xs text-neutral-400">Registered</text>
          <text className="text-xs text-neutral-600 font-medium mt-0.5">{formatDate(mod.registered)}</text>
        </view>
        {mod.auth && (
          <view className="ml-auto px-2 py-0.5 rounded-md bg-indigo-50">
            <text className="text-xs text-indigo-600 font-medium">Auth</text>
          </view>
        )}
      </view>
      <view className="border-t border-neutral-50 py-3 px-4">
        <text className="text-xs text-neutral-400">{routeText}</text>
      </view>
    </view>
  )
}

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <view className="flex-1 bg-white rounded-xl border border-neutral-100 px-4 py-3">
      <text className={'text-xl font-bold ' + color}>{value}</text>
      <text className="text-xs text-neutral-400 mt-0.5">{label}</text>
    </view>
  )
}

function EmptyState() {
  return (
    <view className="items-center justify-center py-16 px-8">
      <view className="w-16 h-16 rounded-2xl bg-neutral-100 items-center justify-center mb-4">
        <text className="text-2xl">📦</text>
      </view>
      <text className="text-sm font-semibold text-neutral-900 mb-1">No tatemonos yet</text>
      <text className="text-xs text-neutral-400 text-center leading-5">Drop a tatemono and run the watcher to see it here.</text>
    </view>
  )
}

export function App() {
  const [registry, setRegistry]       = useState<RegistryData | null>(null)
  const [loading, setLoading]         = useState(true)
  const [engineAlive, setEngineAlive] = useState(false)
  const [active404, setActive404]     = useState<{ mod: string; page: string } | null>(null)
  const [currentRoute, setCurrentRoute] = useState<{ mod: string; page: string } | null>(null)

  const fetchRegistry = useCallback(() => {
    fetch(BACKEND_URL + '/arkzen/lynx-registry', { headers: { Accept: 'application/json' } })
      .then(res => {
        setEngineAlive(res.ok)
        return res.ok ? res.json() : null
      })
      .then(data => { if (data) setRegistry(data) })
      .catch(() => setEngineAlive(false))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchRegistry()
    const interval = setInterval(fetchRegistry, 3000)
    return () => clearInterval(interval)
  }, [fetchRegistry])

  const modules = registry?.modules ?? []
  const active  = modules.filter(m => m.status === 'active').length
  const total   = modules.length
  const removed = modules.filter(m => m.status === 'removed').length

  function handleNavigate(mod: string, page: string) {
    const exists = LYNX_ROUTES.some(r => r.module === mod && r.page === page)
    if (exists) {
      setActive404(null)
      setCurrentRoute({ mod, page })
    } else {
      setActive404({ mod, page })
    }
  }

  if (currentRoute) {
    const route = LYNX_ROUTES.find(r => r.module === currentRoute.mod && r.page === currentRoute.page)
    const Page  = route?.component
    return (
      <page>
        <view style={{ height: '100%' }} className="bg-neutral-50">
          <view className="bg-white border-b border-neutral-100 px-5 py-3 flex-row items-center gap-3">
            <view bindtap={() => setCurrentRoute(null)} className="px-3 py-1.5 rounded-lg bg-neutral-100">
              <text className="text-xs font-medium text-neutral-700">← Hub</text>
            </view>
            <text className="text-xs text-neutral-400">{currentRoute.mod} / {currentRoute.page}</text>
          </view>
          {Page ? <Page /> : (
            <view className="items-center justify-center py-16">
              <text className="text-xs text-neutral-400">Page not found</text>
            </view>
          )}
        </view>
      </page>
    )
  }

  return (
    <page>
      <scroll-view style={{ height: '100%' }} className="bg-neutral-50" scroll-orientation="vertical" show-scrollbar={false}>
        <view className="bg-white border-b border-neutral-100 px-5 py-4">
          <view className="flex-row items-center justify-between">
            <view className="flex-row items-center gap-3">
              <view className="w-8 h-8 rounded-xl bg-neutral-900 items-center justify-center">
                <text className="text-white text-xs font-bold">A</text>
              </view>
              <view>
                <text className="text-sm font-semibold text-neutral-900">Arkzen Engine</text>
                <text className="text-xs text-neutral-400">v{registry?.engine ?? '1.0.0'} · Lynx</text>
              </view>
            </view>
            <view className="flex-row items-center gap-1.5">
              <view className={'w-1.5 h-1.5 rounded-full ' + (engineAlive ? 'bg-emerald-500' : 'bg-neutral-300')} />
              <text className="text-xs text-neutral-400">{engineAlive ? 'Engine running' : 'Engine offline'}</text>
            </view>
          </view>
        </view>

        <view className="px-4 py-5 pb-12">
          <view className="flex-row gap-2.5 mb-5">
            <StatCard label="Active" value={active} color="text-blue-600" />
            <StatCard label="Total" value={total} color="text-neutral-900" />
            <StatCard label="Removed" value={removed} color="text-red-500" />
          </view>

          <view className="flex-row items-center justify-between mb-3">
            <text className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Tatemonos</text>
            <text className="text-xs text-neutral-400">{registry?.project ?? 'project'}</text>
          </view>

          {active404 && (
            <view className="mb-3 px-3 py-2 rounded-lg bg-red-50">
              <text className="text-xs text-red-600">No registered page for {active404.mod}/{active404.page}</text>
            </view>
          )}

          {loading ? (
            <view className="py-16 items-center">
              <text className="text-xs text-neutral-400">Loading registry…</text>
            </view>
          ) : modules.length === 0 ? (
            <EmptyState />
          ) : (
            <view className="flex-col gap-3">
              {modules.map(mod => <TatemonoCard key={mod.name} mod={mod} onNavigate={handleNavigate} />)}
            </view>
          )}
        </view>
      </scroll-view>
    </page>
  )
}
