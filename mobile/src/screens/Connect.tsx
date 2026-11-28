// Entry point: pair this phone with a laptop. The story lives here (petals, one calm instruction), per the design guideline.
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api, normalizeAddress } from '../api'
import { Blossom, Petals } from '../Blossom'
import { Input } from '../Input'
import { useStore } from '../store'
import { space, useTheme } from '../theme'
import { Button, Group, Icon, Row, T } from '../ui'

type Probe = { state: 'idle' | 'checking' | 'found' | 'none'; name?: string; msg?: string }

export function Connect() {
  const { c } = useTheme()
  const st = useStore()
  const insets = useSafeAreaInsets()
  const [addr, setAddr] = useState('')
  const [pin, setPin] = useState('')
  const [probe, setProbe] = useState<Probe>({ state: 'idle' })
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const n = normalizeAddress(addr)

  useEffect(() => {
    if (!n) { setProbe({ state: 'idle' }); return }
    setProbe({ state: 'checking' })
    let dead = false
    const t = setTimeout(async () => {
      try { const r = await api.ping(n.base, 4000); if (!dead) setProbe({ state: 'found', name: r.name }) }
      catch (e: any) { if (!dead) setProbe({ state: 'none', msg: e.message }) }
    }, 600)
    return () => { dead = true; clearTimeout(t) }
  }, [n?.base])

  async function pair() {
    setErr(''); setBusy(true)
    try { await st.pair(addr, pin) } catch (e: any) { setErr(e.message ?? 'Could not pair.') } finally { setBusy(false) }
  }
  const ready = !!n && pin.replace(/\s/g, '').length === 6

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <Petals count={16} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.md, paddingTop: insets.top + space.xl, paddingBottom: insets.bottom + space.xl }}>
          <Blossom size={56} />
          <T v="title" accessibilityRole="header" style={{ marginTop: space.md }}>Connect to your laptop</T>
          <T v="caption" style={{ marginTop: space.sm, marginBottom: space.lg }}>
            Pluffy Mobile is a remote. Your tatemonos and the engine stay on the laptop, and this phone starts commands there and watches them.
          </T>

          <Group title="On the laptop">
            <Row icon="square-terminal" title="Run this in the Pluffy folder" sub="node mizumi.js bridge" subMono />
          </Group>

          <T v="strong" style={{ marginBottom: space.sm, marginLeft: 4 }}>Address</T>
          <Input value={addr} onChangeText={setAddr} placeholder="192.168.1.20:7471" keyboardType="url" code accessibilityLabel="Laptop address" />
          <View style={{ minHeight: 28, flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: space.sm, marginLeft: 4 }}>
            {probe.state === 'checking' ? <><ActivityIndicator size="small" color={c.muted} /><T v="caption">Looking for the laptop</T></> : null}
            {probe.state === 'found' ? <><Icon name="circle-check" size={18} color={c.ok} /><T v="caption" color="ok">Found {probe.name}</T></> : null}
            {probe.state === 'none' ? <><Icon name="triangle-alert" size={18} color={c.warn} /><T v="caption" color="warn" style={{ flex: 1 }}>{probe.msg}</T></> : null}
            {probe.state === 'idle' ? <T v="caption" style={{ flex: 1 }}>Type one of the addresses the bridge prints. Away from home? Put Tailscale on both devices and use the laptop's 100.x address.</T> : null}
          </View>

          <T v="strong" style={{ marginTop: space.md, marginBottom: space.sm, marginLeft: 4 }}>Pairing PIN</T>
          <Input value={pin} onChangeText={(t) => setPin(t.replace(/[^0-9 ]/g, '').slice(0, 7))} placeholder="000 000" keyboardType="number-pad" code maxLength={7}
            accessibilityLabel="Six digit pairing PIN" style={{ letterSpacing: 4, fontSize: 20 }} />
          <T v="caption" style={{ marginTop: space.sm, marginLeft: 4 }}>The PIN works once and expires after 10 minutes. After five wrong tries the laptop waits a minute.</T>

          {err ? (
            <View accessibilityRole="alert" style={{ flexDirection: 'row', gap: 8, marginTop: space.md, alignItems: 'flex-start' }}>
              <Icon name="triangle-alert" size={20} color={c.err} /><T color="err" style={{ flex: 1 }}>{err}</T>
            </View>
          ) : null}
          <Button label="Pair with laptop" kind="primary" onPress={pair} disabled={!ready} busy={busy} style={{ marginTop: space.lg }} />
          {st.active ? <Button label="Back" kind="plain" onPress={st.closeConnect} style={{ marginTop: space.sm }} /> : null}

          {st.laptops.length ? (
            <Group title="Your laptops" sub="Tap one to reconnect." style={{ marginTop: space.xl }}>
              {st.laptops.map((l) => (
                <Row key={l.id} icon="laptop" title={l.name} sub={l.display} subMono onPress={() => st.select(l.id)}
                  right={<Button label="Forget" kind="plain" full={false} onPress={() => st.forget(l.id)} style={{ minHeight: 44 }} />} chevron={false} />
              ))}
            </Group>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}
