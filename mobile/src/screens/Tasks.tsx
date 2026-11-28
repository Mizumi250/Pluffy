// Home: what is running on the laptop, and what finished. Same shape as Qoder's task list (running first, the rest after).
import React, { useState } from 'react'
import { RefreshControl, View } from 'react-native'
import { api } from '../api'
import { useNav } from '../nav'
import { LaptopChip, taskMeta } from '../status'
import { useStore } from '../store'
import { space, useTheme } from '../theme'
import { Banner, Button, Empty, Group, Row, Segmented, Spacer, T, TabScreen } from '../ui'
import { ago, span } from '../util'

export function Tasks() {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [seg, setSeg] = useState<'running' | 'finished'>('running')
  const [refreshing, setRefreshing] = useState(false)
  const running = st.tasks.filter((t) => t.status === 'running')
  const finished = st.tasks.filter((t) => t.status !== 'running')
  const list = seg === 'running' ? running : finished
  const name = st.active?.name ?? 'the laptop'

  async function clear() {
    if (!st.conn) return
    const c0 = st.conn
    await Promise.all(finished.map((t) => api.remove(c0, t.id).catch(() => {})))
    st.refresh()
  }

  return (
    <TabScreen title="Tasks" right={<LaptopChip onPress={() => nav.setTab('laptop')} />}
      refresh={<RefreshControl refreshing={refreshing} tintColor={c.muted} onRefresh={async () => { setRefreshing(true); await st.refresh(); setRefreshing(false) }} />}>
      {st.link === 'offline' ? <Banner kind="warn" text={`Can't reach ${name}. This is the list from the last time it answered.`} action={{ label: 'Retry', onPress: st.refresh }} /> : null}
      {st.link === 'auth' ? <Banner kind="err" text={`${name} no longer knows this phone. Pair it again.`} action={{ label: 'Pair', onPress: () => { if (st.active) st.forget(st.active.id) } }} /> : null}

      <Segmented value={seg} onChange={setSeg} options={[{ v: 'running', label: `Running${running.length ? ` (${running.length})` : ''}` }, { v: 'finished', label: `Finished${finished.length ? ` (${finished.length})` : ''}` }]} />
      <Spacer />

      {list.length === 0 ? (
        seg === 'running'
          ? <Empty title="Nothing is running" text="Start a command and it keeps going on the laptop while your phone sleeps." action={{ label: 'Open commands', onPress: () => nav.setTab('commands') }} />
          : <Empty title="Nothing finished yet" text="Commands you run from this phone show up here with their full output." />
      ) : (
        <Group>
          {list.map((t) => {
            const m = taskMeta(t.status)
            const when = t.status === 'running' ? `Running ${span(Date.now() - t.startedAt)}` : `${m.word} ${ago(t.endedAt ?? t.startedAt)}`
            return <Row key={t.id} icon={m.icon} title={t.label} sub={t.shown} subMono lines={1} onPress={() => nav.push({ k: 'task', id: t.id })} right={<T v="caption" style={{ maxWidth: 110, textAlign: 'right' }}>{when}</T>} />
          })}
        </Group>
      )}
      {seg === 'finished' && finished.length > 0 ? <Button label="Clear finished" onPress={clear} icon="trash-2" /> : null}
    </TabScreen>
  )
}
