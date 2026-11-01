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
  frontend?:   string[]
  backend?:    string[]
}

interface RegistryData {
  engine:  string
  project: string
  modules: RegistryModule[]
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
}

interface HubRegistry {
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
  modules?: Array<{ name: string; frontend?: string[]; backend?: string[] }>
}

const stackGroups = [
  { label: 'Frontend', key: 'activeStack' as const, tone: '#007aff', options: [['nextjs', 'Next.js'], ['react-vite', 'React + Vite'], ['react-inertia', 'React + Inertia'], ['astro', 'Astro'], ['tanstack-start', 'TanStack Start'], ['expo', 'Expo'], ['react-native', 'React Native'], ['lynx', 'Lynx'], ['tauri', 'Tauri'], ['electron', 'Electron']] },
  { label: 'Backend', key: 'activeBackend' as const, tone: '#30c75a', options: [['laravel', 'Laravel'], ['laravel-inertia', 'Laravel + Inertia'], ['express', 'Express'], ['fastapi', 'FastAPI'], ['django', 'Django'], ['spring-boot', 'Spring Boot'], ['aspnet', 'ASP.NET']] },
  { label: 'Database', key: 'activeDatabase' as const, tone: '#af52de', options: [['sqlite', 'SQLite'], ['pgsql', 'PostgreSQL']] },
]

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
      <view className="px-4 pb-3 flex-col gap-2">
        <CompatibilityRow label="Frontend" items={mod.frontend ?? []} />
        <CompatibilityRow label="Backend" items={mod.backend ?? []} />
      </view>
      <view className="border-t border-neutral-50 py-3 px-4">
        <text className="text-xs text-neutral-400">{routeText}</text>
      </view>
    </view>
  )
}

function CompatibilityRow({ label, items }: { label: string; items: string[] }) {
  return (
    <view className="flex-row items-start gap-2">
      <text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">{label}</text>
      <view className="flex-1 flex-row flex-wrap gap-1.5">
        {items.length > 0 ? items.map(item => (
          <view key={item} className="rounded-full border border-neutral-200 bg-white px-2.5 py-1">
            <text className="text-[10px] text-neutral-600">{item}</text>
          </view>
        )) : (
          <view className="rounded-full border border-neutral-200 bg-neutral-50 px-2.5 py-1">
            <text className="text-[10px] text-neutral-400">None</text>
          </view>
        )}
      </view>
    </view>
  )
}

function ActiveStack({ registry }: { registry: RegistryData | null }) {
  return (
    <view className="mb-5 rounded-2xl border border-neutral-200 bg-white p-3.5 flex-col gap-2.5">
      {stackGroups.map(group => (
        <view key={group.label} className="flex-row items-start gap-2">
          <text className="w-16 pt-1 text-[9px] font-semibold uppercase tracking-wider text-neutral-400">{group.label}</text>
          <view className="flex-1 flex-row flex-wrap gap-1.5">
            {group.options.map(([key, label]) => {
              const isActive = registry?.[group.key] === key
              return (
                <view
                  key={key}
                  style={{
                    backgroundColor: isActive ? group.tone : '#f3f4f6',
                    borderColor: isActive ? group.tone : '#e5e7eb',
                  }}
                  className="rounded-full border px-2.5 py-1"
                >
                  <text style={{ color: isActive ? '#fff' : '#9ca3af' }} className="text-[10px] font-medium">{label}</text>
                </view>
              )
            })}
          </view>
        </view>
      ))}
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
  const [metadataUnavailable, setMetadataUnavailable] = useState(false)
  const [query, setQuery] = useState('')
  const [frameworkFilter, setFrameworkFilter] = useState('All')
  const [active404, setActive404]     = useState<{ mod: string; page: string } | null>(null)
  const [currentRoute, setCurrentRoute] = useState<{ mod: string; page: string } | null>(null)

  const fetchRegistry = useCallback(() => {
    fetch(BACKEND_URL + '/arkzen/lynx-registry', { headers: { Accept: 'application/json' } })
      .then(res => {
        if (!res.ok) throw new Error(`Lynx registry request failed (${res.status})`)
        setEngineAlive(true)
        return res.json()
      })
      .then(async (data: RegistryData) => {
        let hubRegistry: HubRegistry | null = null
        try {
          const hubResponse = await fetch(BACKEND_URL + '/arkzen/registry', { headers: { Accept: 'application/json' } })
          if (!hubResponse.ok) throw new Error(`Hub registry request failed (${hubResponse.status})`)
          hubRegistry = await hubResponse.json() as HubRegistry
          setMetadataUnavailable(false)
        } catch {
          setMetadataUnavailable(true)
        }
        const modulesByName = new Map((hubRegistry?.modules ?? []).map(module => [module.name, module]))
        setRegistry({
          ...data,
          activeStack: hubRegistry?.activeStack ?? 'lynx',
          activeBackend: hubRegistry?.activeBackend,
          activeDatabase: hubRegistry?.activeDatabase,
          modules: (data.modules ?? []).map(module => {
            const shared = modulesByName.get(module.name)
            return { ...module, frontend: shared?.frontend ?? ['Lynx'], backend: shared?.backend ?? [] }
          }),
        })
      })
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
  const frameworks = [...new Set(modules.flatMap(module => [...(module.frontend ?? []), ...(module.backend ?? [])]))].sort()
  const normalizedQuery = query.trim().toLowerCase()
  const filteredModules = modules.filter(module => {
    const compatible = [...(module.frontend ?? []), ...(module.backend ?? [])]
    const matchesQuery = !normalizedQuery || [module.name, ...compatible].some(value => value.toLowerCase().includes(normalizedQuery))
    return matchesQuery && (frameworkFilter === 'All' || compatible.includes(frameworkFilter))
  })

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
            <view>
              <text className="text-sm font-semibold text-neutral-900">Arkzen Engine</text>
              <text className="text-xs text-neutral-400">v{registry?.engine ?? '1.0.0'} · Lynx</text>
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

          <ActiveStack registry={registry} />

          {metadataUnavailable && (
            <text className="mb-4 text-xs text-amber-700">Framework compatibility and active stack details are unavailable.</text>
          )}

          <input
            value={query}
            bindinput={event => setQuery(event.detail.value)}
            placeholder="Search Tatemono or framework"
            className="mb-3 h-12 rounded-2xl border border-neutral-200 bg-white px-4 text-sm text-neutral-900"
          />

          {frameworks.length > 0 && (
            <scroll-view className="mb-5" scroll-orientation="horizontal" show-scrollbar={false}>
              <view className="flex-row gap-2">
                {['All', ...frameworks].map(framework => {
                  const selected = frameworkFilter === framework
                  return (
                    <view
                      key={framework}
                      bindtap={() => setFrameworkFilter(framework)}
                      className={'rounded-full border px-3.5 py-2 ' + (selected ? 'border-neutral-900 bg-neutral-900' : 'border-neutral-200 bg-white')}
                    >
                      <text className={'text-xs font-medium ' + (selected ? 'text-white' : 'text-neutral-500')}>{framework === 'All' ? 'All frameworks' : framework}</text>
                    </view>
                  )
                })}
              </view>
            </scroll-view>
          )}

          <view className="flex-row items-center justify-between mb-3">
            <text className="text-xs font-semibold text-neutral-900 uppercase tracking-wider">Tatemonos · {filteredModules.length}</text>
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
          ) : filteredModules.length === 0 ? (
            <view className="py-12 items-center">
              <text className="text-xs text-neutral-400">No matching Tatemono. Try another name or framework.</text>
            </view>
          ) : (
            <view className="flex-col gap-3">
              {filteredModules.map(mod => <TatemonoCard key={mod.name} mod={mod} onNavigate={handleNavigate} />)}
            </view>
          )}
        </view>
      </scroll-view>
    </page>
  )
}
