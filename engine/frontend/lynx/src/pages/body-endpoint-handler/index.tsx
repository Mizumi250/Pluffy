// ARKZEN GENERATED — body-endpoint-handler/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:45.722Z
import { LynxBadge } from './components/LynxBadge'
import { LynxInjectedBadge } from './components/LynxInjectedBadge'
import { LynxSectionCard } from './components/LynxSectionCard'
import { apiFetch, sourceColor } from './components/utils'
import type { ProbeResult, Stats } from './components/types'
import { useEffect, useState } from '@lynx-js/react'

const IndexScreen = () => {
  const [probes,      setProbes]      = useState<ProbeResult[]>([])
  const [stats,       setStats]       = useState<Stats | null>(null)
  const [ping,        setPing]        = useState<Record<string, any> | null>(null)
  const [latest,      setLatest]      = useState<ProbeResult[]>([])
  const [loading,     setLoading]     = useState(false)
  const [deleting,    setDeleting]    = useState<number | null>(null)
  const [toast,       setToast]       = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Echo form
  const [echoFields,  setEchoFields]  = useState([{ key: 'hello', value: 'world' }])
  const [echoing,     setEchoing]     = useState(false)
  const [echoResult,  setEchoResult]  = useState<Record<string, any> | null>(null)

  // Record handler form
  const [hProbe,      setHProbe]      = useState('handler-probe')
  const [hOk,         setHOk]         = useState(true)
  const [hRecording,  setHRecording]  = useState(false)

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3000)
  }

  const loadAll = async () => {
    setLoading(true)
    try {
      const [probesRes, statsRes, latestRes] = await Promise.all([
        apiFetch('/api/body-endpoint-handler/probes'),
        apiFetch('/api/body-endpoint-handler/stats'),
        apiFetch('/api/body-endpoint-handler/latest'),
      ])
      const pd = await probesRes.json(); setProbes(pd.data ?? pd ?? [])
      const sd = await statsRes.json();  setStats(sd)
      const ld = await latestRes.json(); setLatest(ld.results ?? [])
    } catch { showToast('error', 'Failed to load') }
    setLoading(false)
  }

  const doPing = async () => {
    try {
      const res = await apiFetch('/api/body-endpoint-handler/ping')
      const d   = await res.json()
      setPing(d)
      showToast('success', 'Ping OK — handler body confirmed')
    } catch { showToast('error', 'Ping failed') }
  }

  const doEcho = async () => {
    setEchoing(true)
    try {
      const body: Record<string, string> = {}
      echoFields.forEach((f: { key: string; value: string }) => { if (f.key) body[f.key] = f.value })
      const res = await apiFetch('/api/body-endpoint-handler/echo', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      const d = await res.json()
      setEchoResult(d)
      showToast('success', 'Echo OK — endpoint body confirmed')
      loadAll()
    } catch { showToast('error', 'Echo failed') }
    setEchoing(false)
  }

  const doRecord = async () => {
    setHRecording(true)
    try {
      const res = await apiFetch('/api/body-endpoint-handler/record-handler', {
        method: 'POST',
        body: JSON.stringify({ probe: hProbe, ok: hOk }),
      })
      const d = await res.json()
      if (res.ok) { showToast('success', `Recorded probe #${d.probe_id} via handler body`); loadAll() }
      else        { showToast('error', 'Record failed') }
    } catch { showToast('error', 'Record request failed') }
    setHRecording(false)
  }

  const doDelete = async (id: number) => {
    setDeleting(id)
    try {
      const res = await apiFetch(`/api/body-endpoint-handler/probes/${id}`, { method: 'DELETE' })
      if (res.ok) { showToast('success', 'Probe deleted'); loadAll() }
      else        { showToast('error', 'Delete failed') }
    } catch { showToast('error', 'Delete request failed') }
    setDeleting(null)
  }

  useEffect(() => { loadAll() }, [])

  return (
    <view style={{ flex: 1, backgroundColor: '#fafafa' }}>

      {/* Toast */}
      {toast && (
        <view style={{
          position: 'absolute', top: 52, left: 16, right: 16, zIndex: 999,
          backgroundColor: toast.type === 'success' ? '#22c55e' : '#ef4444',
          borderRadius: 10, padding: 12,
        }}>
          <text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>{toast.msg}</text>
        </view>
      )}

      {/* Header */}
      <view style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', padding: '16px 20px' }}>
        <text style={{ fontSize: 17, fontWeight: '700', color: '#171717' }}>Body Injection Tester</text>
        <text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2, fontFamily: 'monospace' }}>
          ControllerBuilder v7.0 · CustomRouteBuilder v2.0
        </text>
      </view>

      <scroll-view style={{ flex: 1, padding: 16, paddingBottom: 40 }}>

        {/* Stats */}
        <LynxSectionCard>
          <view style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
            <view style={{ flex: 1 }}>
              <text style={{ fontSize: 13, fontWeight: '700', color: '#171717' }}>📊 Stats Endpoint</text>
              <text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2, fontFamily: 'monospace' }}>GET /stats · @arkzen:endpoint:stats</text>
            </view>
            {stats && <LynxInjectedBadge injected={stats.injected} />}
          </view>
          {loading ? (
            <text style={{ fontSize: 13, color: '#a3a3a3' }}>Loading…</text>
          ) : stats ? (
            <view style={{ flexDirection: 'row', gap: 8 }}>
              {([['Total', stats.total, '#171717'], ['Passed ✓', stats.passed, '#16a34a'], ['Failed ✗', stats.failed, '#dc2626']] as const).map(([label, val, color]) => (
                <view key={label} style={{ flex: 1, backgroundColor: '#fafafa', borderRadius: 10, padding: 10, alignItems: 'center' }}>
                  <text style={{ fontSize: 22, fontWeight: '800', color }}>{val}</text>
                  <text style={{ fontSize: 10, color: '#737373', marginTop: 2 }}>{label}</text>
                </view>
              ))}
            </view>
          ) : null}
          <view
            bindtap={loadAll}
            style={{ marginTop: 10, backgroundColor: '#0ea5e9', borderRadius: 8, padding: '6px 14px', alignSelf: 'flex-start' }}
          >
            <text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>Refresh Stats</text>
          </view>
        </LynxSectionCard>

        {/* Echo — multi-field */}
        <LynxSectionCard>
          <text style={{ fontSize: 13, fontWeight: '700', color: '#171717', marginBottom: 2 }}>🔁 Echo Endpoint</text>
          <text style={{ fontSize: 11, color: '#a3a3a3', marginBottom: 12, fontFamily: 'monospace' }}>POST /echo · @arkzen:endpoint:echo</text>
          {echoFields.map((f: { key: string; value: string }, i: number) => (
            <view key={i} style={{ flexDirection: 'row', gap: 6, marginBottom: 6 }}>
              <input
                bindinput={(e: any) => { const n = [...echoFields]; n[i].key = e.detail.value; setEchoFields(n) }}
                placeholder="key"
                style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#171717' }}
              />
              <input
                bindinput={(e: any) => { const n = [...echoFields]; n[i].value = e.detail.value; setEchoFields(n) }}
                placeholder="value"
                style={{ flex: 1, backgroundColor: '#f5f5f5', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#171717' }}
              />
              <view
                bindtap={() => setEchoFields(echoFields.filter((_: any, j: number) => j !== i))}
                style={{ backgroundColor: '#ef4444', borderRadius: 8, paddingLeft: 10, paddingRight: 10, alignItems: 'center', justifyContent: 'center' }}
              >
                <text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>×</text>
              </view>
            </view>
          ))}
          <view style={{ flexDirection: 'row', gap: 8, marginBottom: 8 }}>
            <view
              bindtap={() => setEchoFields([...echoFields, { key: '', value: '' }])}
              style={{ backgroundColor: '#6366f1', borderRadius: 8, padding: '6px 12px' }}
            >
              <text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>+ Add Field</text>
            </view>
          </view>
          <view
            bindtap={echoing ? undefined : doEcho}
            style={{ backgroundColor: echoing ? '#d4d4d4' : '#171717', borderRadius: 8, padding: '8px 16px', alignSelf: 'flex-start' }}
          >
            <text style={{ color: echoing ? '#737373' : '#fff', fontSize: 13, fontWeight: '700' }}>
              {echoing ? 'Echoing…' : 'Send Echo'}
            </text>
          </view>
          {echoResult && (
            <view style={{ marginTop: 12, backgroundColor: '#f5f5f5', borderRadius: 8, padding: 12 }}>
              <view style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <LynxInjectedBadge injected={echoResult.injected} />
                <text style={{ fontSize: 11, color: '#525252' }}>{echoResult.builder} · {echoResult.field_count} field(s)</text>
              </view>
              <text style={{ fontSize: 11, color: '#262626', fontFamily: 'monospace' }}>
                {JSON.stringify(echoResult.echo, null, 2)}
              </text>
            </view>
          )}
        </LynxSectionCard>

        {/* Ping */}
        <LynxSectionCard>
          <text style={{ fontSize: 13, fontWeight: '700', color: '#171717', marginBottom: 2 }}>🏓 Ping Handler</text>
          <text style={{ fontSize: 11, color: '#a3a3a3', marginBottom: 12, fontFamily: 'monospace' }}>GET /ping · @arkzen:handler:ping</text>
          <view
            bindtap={doPing}
            style={{ backgroundColor: '#059669', borderRadius: 8, padding: '8px 16px', alignSelf: 'flex-start' }}
          >
            <text style={{ color: '#fff', fontSize: 13, fontWeight: '700' }}>Ping</text>
          </view>
          {ping && (
            <view style={{ marginTop: 12, backgroundColor: '#f0fdf4', borderRadius: 8, padding: 12, borderWidth: 1, borderColor: '#bbf7d0' }}>
              <view style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <LynxInjectedBadge injected={ping.injected} />
                <text style={{ fontSize: 11, color: '#166534' }}>{ping.builder} · {ping.handler}</text>
              </view>
              <text style={{ fontSize: 13, color: '#15803d' }}>{ping.message}</text>
              <text style={{ fontSize: 11, color: '#86efac', marginTop: 2 }}>{ping.timestamp}</text>
            </view>
          )}
        </LynxSectionCard>

        {/* Record Handler */}
        <LynxSectionCard>
          <text style={{ fontSize: 13, fontWeight: '700', color: '#171717', marginBottom: 2 }}>📝 Record Handler</text>
          <text style={{ fontSize: 11, color: '#a3a3a3', marginBottom: 12, fontFamily: 'monospace' }}>POST /record-handler · @arkzen:handler:recordHandler</text>
          <input
            bindinput={(e: any) => setHProbe(e.detail.value)}
            placeholder="probe name"
            style={{ backgroundColor: '#f5f5f5', borderRadius: 8, padding: '8px 10px', fontSize: 13, color: '#171717', marginBottom: 8 }}
          />
          <view
            bindtap={() => setHOk((v: boolean) => !v)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}
          >
            <view style={{
              width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
              borderColor: hOk ? '#7c3aed' : '#d4d4d8',
              backgroundColor: hOk ? '#7c3aed' : '#fff',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {hOk && <text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>✓</text>}
            </view>
            <text style={{ fontSize: 13, color: '#525252' }}>ok</text>
          </view>
          <view
            bindtap={hRecording ? undefined : doRecord}
            style={{ backgroundColor: hRecording ? '#d4d4d4' : '#7c3aed', borderRadius: 8, padding: '8px 16px', alignSelf: 'flex-start' }}
          >
            <text style={{ color: hRecording ? '#737373' : '#fff', fontSize: 13, fontWeight: '700' }}>
              {hRecording ? 'Recording…' : 'Record via Handler'}
            </text>
          </view>
        </LynxSectionCard>

        {/* Latest 5 */}
        <LynxSectionCard>
          <view style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <view>
              <text style={{ fontSize: 13, fontWeight: '700', color: '#171717' }}>🕑 Latest Handler</text>
              <text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2, fontFamily: 'monospace' }}>GET /latest · @arkzen:handler:latest</text>
            </view>
            <view bindtap={loadAll} style={{ padding: 6 }}>
              <text style={{ fontSize: 11, color: '#0ea5e9', fontWeight: '700' }}>Refresh</text>
            </view>
          </view>
          {latest.length === 0 ? (
            <text style={{ fontSize: 13, color: '#a3a3a3' }}>No results yet.</text>
          ) : (
            latest.map((r: ProbeResult) => (
              <view key={r.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
                <LynxBadge label={r.source} color={sourceColor(r.source)} />
                <text style={{ flex: 1, fontSize: 12, fontWeight: '600', color: '#171717' }}>{r.probe}</text>
                <LynxBadge label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} />
                <text style={{ fontSize: 10, color: '#a3a3a3' }}>{new Date(r.created_at).toLocaleTimeString()}</text>
              </view>
            ))
          )}
        </LynxSectionCard>

        {/* All probes */}
        <LynxSectionCard>
          <text style={{ fontSize: 13, fontWeight: '700', color: '#171717', marginBottom: 12 }}>All Probe Results</text>
          {loading ? (
            <text style={{ fontSize: 13, color: '#a3a3a3' }}>Loading…</text>
          ) : probes.length === 0 ? (
            <text style={{ fontSize: 13, color: '#a3a3a3' }}>No probes yet.</text>
          ) : (
            probes.map((r: ProbeResult, i: number) => (
              <view
                key={r.id}
                style={{
                  paddingTop: 10, paddingBottom: 10,
                  borderBottomWidth: i < probes.length - 1 ? 1 : 0,
                  borderBottomColor: '#f5f5f5',
                }}
              >
                <view style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 }}>
                  <LynxBadge label={r.source} color={sourceColor(r.source)} />
                  <text style={{ flex: 1, fontSize: 12, fontWeight: '700', color: '#171717' }}>{r.probe}</text>
                  <LynxBadge label={r.ok ? '✓' : '✗'} color={r.ok ? '#16a34a' : '#dc2626'} />
                  <view
                    bindtap={() => doDelete(r.id)}
                    disabled={deleting === r.id}
                    style={{ backgroundColor: '#ef4444', borderRadius: 6, padding: '3px 8px', opacity: deleting === r.id ? 0.5 : 1 }}
                  >
                    <text style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
                      {deleting === r.id ? '…' : 'Delete'}
                    </text>
                  </view>
                </view>
                {r.result && (
                  <text style={{ fontSize: 11, color: '#737373', marginLeft: 2 }}>{r.result}</text>
                )}
                <text style={{ fontSize: 10, color: '#a3a3a3', marginTop: 2, marginLeft: 2 }}>
                  {new Date(r.created_at).toLocaleTimeString()}
                </text>
              </view>
            ))
          )}
        </LynxSectionCard>

      </scroll-view>
    </view>
  )
}

export const BodyEndpointHandlerIndex = IndexScreen;
