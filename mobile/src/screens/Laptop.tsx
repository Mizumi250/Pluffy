// The laptop you are controlling: is it there, ping it, who else can control it, and the repo.
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert, View } from 'react-native'
import { api, Device, RepoInfo } from '../api'
import { Blossom } from '../Blossom'
import { RepoSheet } from '../RepoSheet'
import { useStore } from '../store'
import { space, useTheme } from '../theme'
import { Banner, Button, Group, Row, Segmented, T, TabScreen } from '../ui'
import { ago, osName, span } from '../util'

export function Laptop() {
  const { c, pref, setPref } = useTheme()
  const st = useStore()
  const [pinging, setPinging] = useState(false)
  const [devices, setDevices] = useState<{ list: Device[]; you: string } | null>(null)
  const [repo, setRepo] = useState<RepoInfo | null>(null)
  const [repoOp, setRepoOp] = useState<'push' | 'pull' | null>(null)
  const online = st.link === 'online'
  const word = st.link === 'online' ? 'Online' : st.link === 'checking' ? 'Checking' : st.link === 'auth' ? 'Not paired' : "Can't reach it"

  function load() {
    if (!st.conn) return
    api.devices(st.conn).then((r) => setDevices({ list: r.devices, you: r.you })).catch(() => {})
    api.repo(st.conn).then(setRepo).catch(() => {})
  }
  useEffect(() => { if (online) load() }, [online, st.active?.id])

  async function ping() {
    setPinging(true)
    const r = await st.pingNow()
    setPinging(false)
    st.say(r.ok ? `${st.active?.name} answered in ${r.ms} ms` : r.message ?? "Can't reach the laptop.")
  }
  function revoke(d: Device) {
    const self = d.id === devices?.you
    Alert.alert(self ? 'Remove this phone?' : `Remove ${d.name}?`, self ? 'You will need a new PIN to pair again.' : 'It will need a new PIN to control this laptop again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { if (st.conn) { await api.revoke(st.conn, d.id).catch(() => {}); if (self) st.forget(d.id); else load() } } },
    ])
  }

  if (!st.active) return <TabScreen title="Laptop"><T v="caption">No laptop selected.</T></TabScreen>
  const i = st.info
  return (
    <TabScreen title="Laptop">
      {st.link === 'auth' ? <Banner kind="err" text={`${st.active.name} no longer knows this phone. Pair it again.`} action={{ label: 'Pair', onPress: () => st.forget(st.active!.id) }} /> : null}

      <View style={{ backgroundColor: c.surface, borderRadius: 14, padding: space.md, marginBottom: space.lg, flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Blossom size={44} hollow={!online} center={c.surface} />
        <View style={{ flex: 1 }}>
          <T v="h2" numberOfLines={1}>{st.active.name}</T>
          <T v="caption">{word}{online && st.latency != null ? `, about ${st.latency} ms` : ''}</T>
        </View>
        {pinging ? <ActivityIndicator color={c.muted} /> : <Button label="Ping" icon="refresh-cw" full={false} onPress={ping} style={{ minHeight: 44 }} />}
      </View>

      <Group title="This laptop" sub={online ? undefined : 'Last known details. They update when it answers.'}>
        <Row title="Address" tile={false} chevron={false} right={<T v="mono" style={{ fontSize: 13 }}>{st.active.display}</T>} />
        {i ? <Row title="System" tile={false} chevron={false} right={<T>{osName(i.platform)}, Node {i.node.replace(/^v/, '')}</T>} /> : null}
        {i ? <Row title="Pluffy folder" tile={false} chevron={false} right={<T>{i.folder}</T>} /> : null}
        {i ? <Row title="Bridge running for" tile={false} chevron={false} right={<T>{span(i.uptime * 1000)}</T>} /> : null}
        {i ? <Row title="Commands running" tile={false} chevron={false} right={<T>{i.running}</T>} /> : null}
      </Group>

      {i?.stacks?.length ? (
        <Group title="Active stacks" sub="Change them from Commands, Switch stacks.">
          {i.stacks.map((s) => <Row key={s.k} title={s.k === 'db' ? 'Database' : s.k.charAt(0).toUpperCase() + s.k.slice(1)} tile={false} chevron={false} right={<T v="mono" style={{ fontSize: 14 }}>{s.v}</T>} />)}
        </Group>
      ) : null}

      {repo?.git ? (
        <Group title="Repo" sub={`${repo.branch}, ${repo.changes} changed file${repo.changes === 1 ? '' : 's'}${repo.upstream ? `, ${repo.ahead} ahead, ${repo.behind} behind` : ''}`}>
          <Row icon="upload" title="Push repo" sub="Commit everything and push" disabled={!online} onPress={() => setRepoOp('push')} />
          <Row icon="download" title="Pull repo" sub="Fast-forward from the remote" disabled={!online} onPress={() => setRepoOp('pull')} />
        </Group>
      ) : null}

      {devices ? (
        <Group title="Phones that can control this laptop">
          {devices.list.map((d) => (
            <Row key={d.id} icon="smartphone" title={d.id === devices.you ? `${d.name} (this phone)` : d.name} sub={`${d.platform || 'phone'}, last seen ${ago(d.lastSeen)}`} chevron={false}
              right={<Button label="Remove" kind="plain" full={false} onPress={() => revoke(d)} style={{ minHeight: 44 }} />} />
          ))}
        </Group>
      ) : null}

      <Group title="Appearance">
        <View style={{ padding: space.md }}>
          <Segmented value={pref} onChange={setPref} options={[{ v: 'auto', label: 'Auto' }, { v: 'light', label: 'Light' }, { v: 'dark', label: 'Dark' }]} />
        </View>
      </Group>

      <Group>
        <Row icon="laptop" title="Change laptop" onPress={st.openConnect} />
        <Row icon="unplug" title="Forget this laptop" sub="Removes the pairing from this phone" onPress={() => Alert.alert(`Forget ${st.active!.name}?`, 'You will need a new PIN to connect again.', [{ text: 'Cancel', style: 'cancel' }, { text: 'Forget', style: 'destructive', onPress: () => st.forget(st.active!.id) }])} />
      </Group>
      <T v="caption" style={{ textAlign: 'center' }}>Pluffy Mobile 1.0, bridge v{i?.v ?? 1}</T>
      <RepoSheet op={repoOp} onClose={() => { setRepoOp(null); load() }} />
    </TabScreen>
  )
}
