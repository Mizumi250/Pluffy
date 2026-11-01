'use client'

import { useEffect, useMemo, useState } from 'react'
import type React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle, ChevronDown, Copy, ExternalLink, Layers, Search, Terminal } from 'lucide-react'

type Filter = 'All' | string

interface TatemonoEntry {
  name: string
  version: string
  status: 'active' | 'inactive' | 'error'
  registered: string
  lastUpdated: string
  frontend?: string[]
  backend?: string[]
}

interface RegistryData {
  engine: string
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
  modules: TatemonoEntry[]
}

const Pill = ({ children, tone = 'neutral' }: { children: React.ReactNode; tone?: 'neutral' | 'dark' }) => (
  <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium tracking-wide ${
    tone === 'dark'
      ? 'border-neutral-900 bg-neutral-900 text-white'
      : 'border-neutral-200 bg-white text-neutral-600'
  }`}>
    {children}
  </span>
)

const STACK_GROUPS = [
  {
    label: 'Frontend',
    activeKey: 'activeStack',
    activeClass: 'border-[#007aff] bg-[#007aff] text-white shadow-[0_3px_10px_rgba(0,122,255,0.24)]',
    options: [
      ['nextjs', 'Next.js'],
      ['react-vite', 'React + Vite'],
      ['react-inertia', 'React + Inertia'],
      ['astro', 'Astro'],
      ['tanstack-start', 'TanStack Start'],
      ['expo', 'Expo'],
      ['react-native', 'React Native'],
      ['lynx', 'Lynx'],
      ['tauri', 'Tauri'],
      ['electron', 'Electron'],
    ],
  },
  {
    label: 'Backend',
    activeKey: 'activeBackend',
    activeClass: 'border-[#30c75a] bg-[#30c75a] text-white shadow-[0_3px_10px_rgba(48,199,90,0.24)]',
    options: [
      ['laravel', 'Laravel'],
      ['laravel-inertia', 'Laravel + Inertia'],
      ['express', 'Express'],
      ['fastapi', 'FastAPI'],
      ['django', 'Django'],
      ['spring-boot', 'Spring Boot'],
      ['aspnet', 'ASP.NET'],
    ],
  },
  {
    label: 'Database',
    activeKey: 'activeDatabase',
    activeClass: 'border-[#af52de] bg-[#af52de] text-white shadow-[0_3px_10px_rgba(175,82,222,0.24)]',
    options: [
      ['sqlite', 'SQLite'],
      ['pgsql', 'PostgreSQL'],
    ],
  },
] as const

function ActiveStackRows({ registry }: { registry: RegistryData | null }) {
  return (
    <div className="space-y-2.5 rounded-2xl border border-neutral-200 bg-white/70 p-3.5">
      {STACK_GROUPS.map(group => {
        const active = registry?.[group.activeKey]
        return (
          <div key={group.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center">
            <p className="w-16 shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-neutral-400">{group.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map(([key, label]) => {
                const isActive = key === active
                return (
                  <span
                    key={key}
                    className={`rounded-full border px-2.5 py-1 text-[10px] font-medium transition ${
                      isActive
                      ? group.activeClass
                        : 'border-neutral-200 bg-neutral-100/70 text-neutral-400'
                    }`}
                  >
                    {label}
                  </span>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

function TatemonoCard({ tatemono, index }: { tatemono: TatemonoEntry; index: number }) {
  const routePath = `/${tatemono.name}`

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.045, duration: 0.35 }}
      className="group relative overflow-hidden rounded-[26px] border border-neutral-200/80 bg-white p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(0,0,0,0.09)]"
    >
      <div className="mb-8 flex items-start justify-between gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-neutral-950 text-sm font-semibold text-white">
          {tatemono.name.slice(0, 1).toUpperCase()}
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-neutral-100 px-2.5 py-1 text-[10px] font-medium text-neutral-500">
          <span className={`h-1.5 w-1.5 rounded-full ${tatemono.status === 'active' ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
          {tatemono.status}
        </span>
      </div>

      <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-neutral-950">{tatemono.name}</h2>
      <p className="mt-1 font-mono text-[11px] text-neutral-400">v{tatemono.version}</p>

      <div className="mt-5 min-h-[90px] space-y-3">
        {[
          { label: 'Frontend', frameworks: tatemono.frontend ?? [] },
          { label: 'Backend', frameworks: tatemono.backend ?? [] },
        ].map(({ label, frameworks }) => (
          <div key={String(label)}>
            <p className="mb-1.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-neutral-400">{label}</p>
            <div className="flex flex-wrap gap-1.5">
              {frameworks.length ? frameworks.map(framework => <Pill key={framework}>{framework}</Pill>) : <Pill>None</Pill>}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-2 border-t border-neutral-100 pt-4">
        <button onClick={() => window.open(routePath, '_blank')} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-neutral-950 px-3 py-2.5 text-xs font-medium text-white transition hover:bg-neutral-700">
          <ExternalLink size={13} /> Open
        </button>
        <button aria-label={`Copy ${tatemono.name}`} onClick={() => navigator.clipboard.writeText(tatemono.name)} className="rounded-xl border border-neutral-200 p-2.5 text-neutral-500 transition hover:bg-neutral-50">
          <Copy size={13} />
        </button>
      </div>
    </motion.article>
  )
}

export default function ArkzenHub() {
  const [registry, setRegistry] = useState<RegistryData | null>(null)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<Filter>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchRegistry = async () => {
      try {
        const res = await fetch('/api/arkzen/registry')
        if (!res.ok) throw new Error(`Registry request failed (${res.status})`)
        setRegistry(await res.json())
        setError('')
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : 'Could not load registry')
      } finally {
        setLoading(false)
      }
    }
    fetchRegistry()
    const interval = setInterval(fetchRegistry, 3000)
    return () => clearInterval(interval)
  }, [])

  const modules = registry?.modules ?? []
  const frameworks = useMemo(() => Array.from(new Set(modules.flatMap(module => [...(module.frontend ?? []), ...(module.backend ?? [])]))).sort(), [modules])
  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    return modules.filter(module => {
      const names = [...(module.frontend ?? []), ...(module.backend ?? [])]
      const matchesQuery = !normalized || [module.name, ...names].some(value => value.toLowerCase().includes(normalized))
      const matchesFilter = filter === 'All' || names.includes(filter)
      return matchesQuery && matchesFilter
    })
  }, [filter, modules, query])

  const active = modules.filter(module => module.status === 'active').length
  const frontendCount = new Set(modules.flatMap(module => module.frontend ?? [])).size
  const backendCount = new Set(modules.flatMap(module => module.backend ?? [])).size

  return (
    <main className="min-h-screen bg-[#f7f7f5] text-neutral-950">
      <header className="border-b border-neutral-200/80 bg-[#f7f7f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
          <div>
              <p className="text-sm font-semibold tracking-[-0.02em]">Arkzen Hub</p>
              <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-400">Tatemono registry · v{registry?.engine ?? '—'}</p>
          </div>
          <div className="hidden items-center gap-2 text-[11px] text-neutral-500 sm:flex"><span className={`h-1.5 w-1.5 rounded-full ${registry && !error ? 'bg-emerald-500' : 'bg-neutral-300'}`} /> {registry && !error ? 'Engine online' : error ? 'Engine offline' : 'Connecting'}</div>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-6 pb-8 pt-14 lg:px-10 lg:pt-20">
        <div className="flex flex-col gap-5 border-y border-neutral-200 py-5 xl:flex-row xl:items-center">
          <div className="grid grid-cols-3 gap-5 sm:min-w-[27rem] sm:max-w-xl">
            {[['TATEMONOS', modules.length], ['FRONTENDS', frontendCount], ['BACKENDS', backendCount]].map(([label, value]) => (
              <div key={String(label)}><p className="text-2xl font-semibold tracking-[-0.04em]">{value}</p><p className="mt-1 text-[9px] font-semibold tracking-[0.18em] text-neutral-400">{label}</p></div>
            ))}
          </div>
          <ActiveStackRows registry={registry} />
        </div>

        <div className="mt-12 flex flex-col gap-3 border-b border-neutral-200 pb-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
            <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search Tatemono or framework" className="h-12 w-full rounded-2xl border border-neutral-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-neutral-400 focus:border-neutral-950 focus:ring-4 focus:ring-neutral-950/5" />
          </div>
          <div className="relative">
            <select value={filter} onChange={event => setFilter(event.target.value)} className="h-12 w-full appearance-none rounded-2xl border border-neutral-200 bg-white pl-4 pr-11 text-sm font-medium outline-none focus:border-neutral-950 sm:w-56">
              <option value="All">All frameworks</option>
              {frameworks.map(framework => <option key={framework} value={framework}>{framework}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500" size={15} />
          </div>
        </div>

        <div className="mb-5 mt-8 flex items-center justify-between">
          <h2 className="text-sm font-semibold tracking-[-0.02em]">All Tatemono <span className="ml-1 text-neutral-400">{filtered.length}</span></h2>
          <div className="hidden items-center gap-2 text-[10px] text-neutral-400 sm:flex"><Layers size={12} /> Live registry</div>
        </div>

        {error && <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800">{error}</p>}

        {loading ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <div key={index} className="h-64 animate-pulse rounded-[26px] bg-neutral-200/60" />)}</div>
          : error && !registry ? <div className="rounded-[26px] border border-dashed border-neutral-300 bg-white/50 py-20 text-center"><p className="text-sm font-medium">Registry unavailable</p><p className="mt-1 text-xs text-neutral-400">{error}</p></div>
          : filtered.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{filtered.map((tatemono, index) => <TatemonoCard key={tatemono.name} tatemono={tatemono} index={index} />)}</div>
          : <div className="rounded-[26px] border border-dashed border-neutral-300 bg-white/50 py-20 text-center"><Terminal className="mx-auto mb-4 text-neutral-300" size={22} /><p className="text-sm font-medium">No matching Tatemono</p><p className="mt-1 text-xs text-neutral-400">Try another name or framework.</p></div>}
      </section>
    </main>
  )
}
