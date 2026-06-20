// ARKZEN GENERATED — errors-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.906Z
import { LynxResultBanner } from './components/LynxResultBanner'
import { BACKEND_URL, LYNX_ERRORS } from './components/constants'
import { ScrollView, Text, TouchableOpacity, View, useState } from '@lynx-js/react'

const IndexScreen = () => {
  const [simulating,  setSimulating]  = useState<number | null>(null)
  const [result,      setResult]      = useState<{ code: number; body: string } | null>(null)
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) throw new Error('Intentional crash to trigger error boundary')

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/errors-test/simulate/${code}`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      setResult({ code: res.status, body: text })
    } catch (e) {
      setResult({ code: 0, body: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setSimulating(null)
    }
  }

  const API_CODES = [400, 401, 403, 409, 422, 429, 503]

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>

      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#171717' }}>⚠️ Error Handler Test</Text>
        <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Simulate all 9 HTTP error codes against the API</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>

        <LynxResultBanner result={result} />

        {/* Router handlers */}
        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, color: '#a3a3a3' }}>ROUTER HANDLERS</Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#fafafa' }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#404040' }}>404 — Not Found</Text>
              <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Navigates to a non-existent route</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#171717', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Trigger</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#b91c1c' }}>500 — Server Error</Text>
              <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Crashes the component to trigger error boundary</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShouldCrash(true)}
              style={{ backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Trigger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API codes */}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 32, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, color: '#a3a3a3' }}>API RESPONSE CODES</Text>
          </View>

          {LYNX_ERRORS.filter(e => API_CODES.includes(e.code)).map((err, i) => (
            <View
              key={err.code}
              style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < API_CODES.length - 1 ? 1 : 0, borderBottomColor: '#fafafa' }}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: err.color }}>{err.code} — {err.title}</Text>
                <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }} numberOfLines={1}>{err.message}</Text>
              </View>
              <TouchableOpacity
                onPress={() => simulate(err.code)}
                disabled={simulating === err.code}
                style={{ backgroundColor: simulating === err.code ? '#d4d4d4' : '#171717', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
              >
                <Text style={{ color: simulating === err.code ? '#737373' : '#fff', fontSize: 11, fontWeight: '600' }}>
                  {simulating === err.code ? '...' : 'Simulate'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}
