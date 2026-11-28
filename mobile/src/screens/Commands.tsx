// Every mizumi.js command, as the same cards Studio shows on Home. Type in the bar to filter, or to run any command.
import React, { useEffect, useState } from 'react'
import { ActivityIndicator, Alert } from 'react-native'
import { api, Item } from '../api'
import { useNav } from '../nav'
import { Input } from '../Input'
import { RepoSheet } from '../RepoSheet'
import { useStore } from '../store'
import { useTheme } from '../theme'
import { Banner, Empty, Group, Row, Spacer, T, TabScreen } from '../ui'

export function Commands() {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [q, setQ] = useState('')
  const [busy, setBusy] = useState('')
  const [repoOp, setRepoOp] = useState<'push' | 'pull' | null>(null)
  const menu = st.menu
  const offline = st.link !== 'online'
  const query = q.trim().toLowerCase()
  const match = (i: Item) => !query || `${i.title} ${i.desc} ${i.cli}`.toLowerCase().includes(query)

  async function run(payload: { id: string } | { command: string }, key: string) {
    if (!st.conn) return
    setBusy(key)
    try { const r = await api.run(st.conn, payload); st.refresh(); nav.push({ k: 'task', id: r.task.id }) }
    catch (e: any) { Alert.alert('Could not start it', e.message) }
    finally { setBusy('') }
  }

  function open(i: Item) {
    if (offline) { st.say("The laptop can't be reached right now."); return }
    if (i.kind === 'repo') { setRepoOp(i.repo as 'push' | 'pull'); return }
    if (i.kind === 'form') { nav.push({ k: 'form', id: i.id }); return }
    if (i.laptopOnly) { Alert.alert(i.title, 'This one asks questions in the terminal, so it needs the laptop keyboard. Most of its options are also in other cards here.'); return }
    run({ id: i.id }, i.id)
  }

  return (
    <TabScreen title="Commands">
      {offline ? <Banner kind="warn" text={st.link === 'checking' ? 'Looking for the laptop.' : `Can't reach ${st.active?.name ?? 'the laptop'}. You can read the cards, but they need it to run.`} action={st.link === 'checking' ? undefined : { label: 'Retry', onPress: st.refresh }} /> : null}
      <Input value={q} onChangeText={setQ} placeholder="Search, or type a command to run" returnKeyType="go" accessibilityLabel="Search commands or type one to run"
        onSubmitEditing={() => { if (q.trim() && !offline) run({ command: q.trim() }, '__q') }} />
      <Spacer />
      {query ? (
        <Group>
          <Row icon="play" title="Run as a command" sub={`mizumi ${q.trim()}`} subMono lines={1} disabled={offline} onPress={() => run({ command: q.trim() }, '__q')}
            right={busy === '__q' ? <ActivityIndicator color={c.muted} /> : undefined} />
        </Group>
      ) : null}
      {!menu ? (
        <Empty title="Waiting for the laptop" text="The cards come from the laptop, so they load the first time it answers." />
      ) : menu.groups.map((g) => {
        const items = menu.items.filter((i) => i.group === g.id && match(i))
        if (!items.length) return null
        return (
          <Group key={g.id} title={g.title} sub={g.sub}>
            {items.map((i) => (
              <Row key={i.id} icon={i.icon} title={i.title} sub={i.desc} lines={2} disabled={offline} onPress={() => open(i)}
                right={busy === i.id ? <ActivityIndicator color={c.muted} /> : i.laptopOnly ? <T v="caption">Laptop</T> : undefined} />
            ))}
          </Group>
        )
      })}
      <RepoSheet op={repoOp} onClose={() => setRepoOp(null)} />
    </TabScreen>
  )
}
