// ============================================================
// ARKZEN GENERATED PAGE — body-endpoint-handler/index [React+Inertia]
// Layout: guest | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-18T09:39:38.511Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { usePage, router } from '@inertiajs/react'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'

// Props passed from Laravel via Inertia::render()
export type BodyEndpointHandlerIndexProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Shared components from @arkzen:components ─────────────────────────────────
function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const show = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }, [])
  return {
    toast,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
  }
}

type ProbeResult = {
  id:         number
  source:     string
  probe:      string
  payload:    string | null
  result:     string | null
  ok:         boolean
  created_at: string
}

type Stats = {
  injected: boolean
  builder:  string
  method:   string
  total:    number
  passed:   number
  failed:   number
  sources:  string[]
}

const Tag = ({ label, color }: { label: string; color: string }) => (
  <span style={{
    display: 'inline-block', padding: '2px 9px', borderRadius: 20,
    fontSize: 10, fontWeight: 700, letterSpacing: 0.5,
    background: color + '22', color,
  }}>{label}</span>
)

const InjectedBadge = ({ injected }: { injected: boolean }) => (
  <Tag label={injected ? '✓ BODY INJECTED' : '✗ STUB'} color={injected ? '#16a34a' : '#dc2626'} />
)

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const { toast, success: toastSuccess, error: toastError } = useToast()

  const [probes,   setProbes]   = useState<ProbeResult[]>([])
  const [stats,    setStats]    = useState<Stats | null>(null)
  const [ping,     setPing]     = useState<Record<string, any> | null>(null)
  const [latest,   setLatest]   = useState<ProbeResult[]>([])
  const [loading,  setLoading]  = useState(false)

  // Echo form state
  const [echoFields, setEchoFields] = useState([{ key: 'hello', value: 'world' }])
  const [echoing,    setEchoing]    = useState(false)
  const [echoResult, setEchoResult] = useState<Record<string, any> | null>(null)

  // Handler record form
  const [hProbe,  setHProbe]  = useState('handler-probe')
  const [hOk,     setHOk]     = useState(true)
  const [hRecording, setHRecording] = useState(false)

  const loadAll = async () => {
    setLoading(true)
    try {
      const [probesRes, statsRes, latestRes] = await Promise.all([
        arkzenFetch('/api/body-endpoint-handler/probes'),
        arkzenFetch('/api/body-endpoint-handler/stats'),
        arkzenFetch('/api/body-endpoint-handler/latest'),
      ])
      const pd = await probesRes.json(); setProbes(pd.data ?? pd ?? [])
      const sd = await statsRes.json();  setStats(sd)
      const ld = await latestRes.json(); setLatest(ld.results ?? [])
    } catch { toastError('Failed to load') }
    setLoading(false)
  }

  const doPing = async () => {
    try {
      const res = await arkzenFetch('/api/body-endpoint-handler/ping')
      const d   = await res.json()
      setPing(d)
      toastSuccess('Ping OK — handler body confirmed')
    } catch { toastError('Ping failed') }
  }

  const doEcho = async () => {
    setEchoing(true)
    const body: Record<string, string> = {}
    echoFields.forEach(f => { if (f.key) body[f.key] = f.value })
    try {
      const res = await arkzenFetch('/api/body-endpoint-handler/echo', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const d = await res.json()
      setEchoResult(d)
      toastSuccess('Echo OK — endpoint body confirmed')
      loadAll()
    } catch { toastError('Echo failed') }
    setEchoing(false)
  }

  const doRecord = async () => {
    setHRecording(true)
    try {
      const res = await arkzenFetch('/api/body-endpoint-handler/record-handler', {
        method: 'POST',
        body: JSON.stringify({ probe: hProbe, ok: hOk }),
      })
      const d = await res.json()
      if (res.ok) { toastSuccess(`Recorded probe #${d.probe_id} via handler body`); loadAll() }
      else        { toastError('Record failed') }
    } catch { toastError('Record request failed') }
    setHRecording(false)
  }

  useEffect(() => { loadAll() }, [])

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20,
  }
  const inputStyle: React.CSSProperties = {
    border: '1.5px solid #e4e4e7', borderRadius: 8,
    padding: '8px 12px', fontSize: 13, boxSizing: 'border-box' as const,
  }
  const btn = (color = '#18181b'): React.CSSProperties => ({
    background: color, color: '#fff', border: 'none', borderRadius: 8,
    padding: '9px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#fafafa', padding: '32px 16px' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ maxWidth: 800, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: '#18181b', margin: 0 }}>Body Injection — Endpoint & Handler</h1>
          <p style={{ fontSize: 13, color: '#71717a', margin: '6px 0 0' }}>
            <strong>ControllerBuilder v7.0</strong> <code>@arkzen:endpoint</code> ·{' '}
            <strong>CustomRouteBuilder v2.0</strong> <code>@arkzen:handler</code>
          </p>
        </div>

        {/* Stats card — ControllerBuilder endpoint body */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', margin: 0 }}>
                📊 Stats Endpoint <code style={{ fontSize: 11, color: '#94a3b8' }}>GET /stats</code>
              </h2>
              <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0' }}>
                Injected via <code>@arkzen:endpoint:stats</code> — ControllerBuilder reads aggregate counts from DB.
              </p>
            </div>
            {stats && <InjectedBadge injected={stats.injected} />}
          </div>
          {loading ? <p style={{ color: '#a1a1aa', fontSize: 13 }}>Loading…</p> : stats ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {[['Total', stats.total, '#18181b'], ['Passed ✓', stats.passed, '#16a34a'], ['Failed ✗', stats.failed, '#dc2626']].map(([label, val, color]: any) => (
                <div key={label} style={{ background: '#fafafa', borderRadius: 10, padding: '14px 16px', textAlign: 'center' }}>
                  <div style={{ fontSize: 28, fontWeight: 800, color }}>{val}</div>
                  <div style={{ fontSize: 11, color: '#71717a', marginTop: 2 }}>{label}</div>
                </div>
              ))}
            </div>
          ) : null}
          <button onClick={loadAll} style={{ ...btn('#0ea5e9'), fontSize: 12, padding: '7px 14px', marginTop: 14 }}>Refresh Stats</button>
        </div>

        {/* Echo — ControllerBuilder endpoint body */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginTop: 0, marginBottom: 4 }}>
            🔁 Echo Endpoint <code style={{ fontSize: 11, color: '#94a3b8' }}>POST /echo</code>
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 16 }}>
            Injected via <code>@arkzen:endpoint:echo</code> — controller body echoes input and writes a probe result.
          </p>
          <div style={{ marginBottom: 12 }}>
            {echoFields.map((f, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: 8, marginBottom: 6 }}>
                <input value={f.key} onChange={e => { const n = [...echoFields]; n[i].key = e.target.value; setEchoFields(n) }} placeholder="key" style={inputStyle} />
                <input value={f.value} onChange={e => { const n = [...echoFields]; n[i].value = e.target.value; setEchoFields(n) }} placeholder="value" style={inputStyle} />
                <button onClick={() => setEchoFields(echoFields.filter((_, j) => j !== i))} style={{ ...btn('#ef4444'), padding: '8px 12px' }}>×</button>
              </div>
            ))}
            <button onClick={() => setEchoFields([...echoFields, { key: '', value: '' }])} style={{ ...btn('#6366f1'), padding: '6px 12px', fontSize: 12 }}>+ Add Field</button>
          </div>
          <button onClick={doEcho} disabled={echoing} style={btn()}>
            {echoing ? 'Echoing…' : 'Send Echo'}
          </button>
          {echoResult && (
            <div style={{ marginTop: 14, background: '#f4f4f5', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <InjectedBadge injected={echoResult.injected} />
                <span style={{ fontSize: 12, color: '#52525b' }}>{echoResult.builder} · {echoResult.field_count} field(s)</span>
              </div>
              <pre style={{ fontSize: 11, color: '#27272a', margin: 0, overflow: 'auto' }}>{JSON.stringify(echoResult.echo, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Ping — CustomRouteBuilder handler body */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginTop: 0, marginBottom: 4 }}>
            🏓 Ping Handler <code style={{ fontSize: 11, color: '#94a3b8' }}>GET /ping</code>
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 14 }}>
            Injected via <code>@arkzen:handler:ping</code> — CustomRouteBuilder handler returns a status object with timestamp.
          </p>
          <button onClick={doPing} style={btn('#059669')}>Ping</button>
          {ping && (
            <div style={{ marginTop: 14, background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <InjectedBadge injected={ping.injected} />
                <span style={{ fontSize: 12, color: '#166534' }}>{ping.builder} · {ping.handler}</span>
              </div>
              <p style={{ fontSize: 13, color: '#15803d', margin: 0 }}>{ping.message}</p>
              <p style={{ fontSize: 11, color: '#86efac', margin: '4px 0 0' }}>{ping.timestamp}</p>
            </div>
          )}
        </div>

        {/* Record Handler — CustomRouteBuilder handler body */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginTop: 0, marginBottom: 4 }}>
            📝 Record Handler <code style={{ fontSize: 11, color: '#94a3b8' }}>POST /record-handler</code>
          </h2>
          <p style={{ fontSize: 12, color: '#71717a', marginBottom: 14 }}>
            Injected via <code>@arkzen:handler:recordHandler</code> — validates, writes to DB, returns probe ID. Tests handler body with real DB write.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 10, marginBottom: 12 }}>
            <input value={hProbe} onChange={e => setHProbe(e.target.value)} placeholder="probe name" style={{ ...inputStyle, width: '100%' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#3f3f46', cursor: 'pointer' }}>
              <input type="checkbox" checked={hOk} onChange={e => setHOk(e.target.checked)} />
              ok
            </label>
          </div>
          <button onClick={doRecord} disabled={hRecording} style={btn('#7c3aed')}>
            {hRecording ? 'Recording…' : 'Record via Handler'}
          </button>
        </div>

        {/* Latest 5 — CustomRouteBuilder handler body */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', margin: 0 }}>
                🕑 Latest Handler <code style={{ fontSize: 11, color: '#94a3b8' }}>GET /latest</code>
              </h2>
              <p style={{ fontSize: 12, color: '#71717a', margin: '4px 0 0' }}>
                Injected via <code>@arkzen:handler:latest</code> — returns 5 most recent probe results.
              </p>
            </div>
            <button onClick={loadAll} style={{ ...btn('#0ea5e9'), fontSize: 12, padding: '6px 12px' }}>Refresh</button>
          </div>
          {latest.length === 0 ? (
            <p style={{ color: '#a1a1aa', fontSize: 13 }}>No results yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {latest.map(r => (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px', background: '#fafafa', borderRadius: 8, fontSize: 12 }}>
                  <Tag label={r.source} color={r.source === 'handler-body' ? '#7c3aed' : r.source === 'endpoint-body' ? '#0891b2' : '#64748b'} />
                  <span style={{ fontWeight: 600, color: '#18181b', flex: 1 }}>{r.probe}</span>
                  <Tag label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} />
                  <span style={{ color: '#a1a1aa', fontSize: 11 }}>{new Date(r.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* All probes log */}
        <div style={card}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: '#18181b', marginTop: 0, marginBottom: 14 }}>All Probe Results</h2>
          {loading ? <p style={{ color: '#a1a1aa', fontSize: 13 }}>Loading…</p> : probes.length === 0 ? (
            <p style={{ color: '#a1a1aa', fontSize: 13 }}>No probes yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: '#f4f4f5' }}>
                    {['#', 'Source', 'Probe', 'Result', 'Ok', 'Time'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 700, color: '#3f3f46' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {probes.map((r, i) => (
                    <tr key={r.id} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ padding: '8px 10px', color: '#a1a1aa' }}>{r.id}</td>
                      <td style={{ padding: '8px 10px' }}><Tag label={r.source} color={r.source === 'handler-body' ? '#7c3aed' : r.source === 'endpoint-body' ? '#0891b2' : '#64748b'} /></td>
                      <td style={{ padding: '8px 10px', fontWeight: 600, color: '#18181b' }}>{r.probe}</td>
                      <td style={{ padding: '8px 10px', color: '#52525b', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.result ?? '—'}</td>
                      <td style={{ padding: '8px 10px' }}><Tag label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} /></td>
                      <td style={{ padding: '8px 10px', color: '#a1a1aa' }}>{new Date(r.created_at).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_BodyEndpointHandler_Index() {
  const props   = usePage<BodyEndpointHandlerIndexProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <IndexPage {...props} />
    </motion.div>
  )

  return <GuestLayout>{content}</GuestLayout>
}

export default ArkzenPage_BodyEndpointHandler_Index
