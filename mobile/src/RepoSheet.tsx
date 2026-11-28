import React, { useEffect, useState } from 'react'
import { ActivityIndicator, View } from 'react-native'
import { api, RepoInfo } from './api'
import { useNav } from './nav'
import { useStore } from './store'
import { space, useTheme } from './theme'
import { Button, Group, Row, Sheet, T } from './ui'

// Push and Pull confirm first and show what the repo looks like, so nothing leaves the laptop by accident.
export function RepoSheet({ op, onClose }: { op: 'push' | 'pull' | null; onClose: () => void }) {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [info, setInfo] = useState<RepoInfo | null>(null)
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  useEffect(() => {
    setInfo(null); setErr('')
    if (op && st.conn) api.repo(st.conn).then(setInfo).catch((e) => setErr(e.message))
  }, [op])

  async function go() {
    if (!op || !st.conn) return
    setBusy(true); setErr('')
    try {
      const r = await api.repoRun(st.conn, op)
      onClose(); st.refresh(); nav.push({ k: 'task', id: r.task.id })
    } catch (e: any) { setErr(e.message) } finally { setBusy(false) }
  }

  return (
    <Sheet visible={!!op} onClose={onClose} title={op === 'push' ? 'Push repo' : 'Pull repo'}>
      <View style={{ paddingHorizontal: space.md }}>
        {!info && !err ? <ActivityIndicator color={c.muted} style={{ margin: space.lg }} /> : null}
        {info && !info.git ? <T style={{ marginBottom: space.md }}>The Pluffy folder on the laptop is not a git repository.</T> : null}
        {info?.git ? (
          <Group>
            <Row title="Branch" tile={false} chevron={false} right={<T v="mono" style={{ fontSize: 14 }}>{info.branch}</T>} />
            <Row title="Changed files" tile={false} chevron={false} right={<T>{info.changes}</T>} />
            <Row title="Ahead / behind" tile={false} chevron={false} right={<T>{info.upstream ? `${info.ahead} / ${info.behind}` : 'no upstream'}</T>} />
          </Group>
        ) : null}
        <T v="caption" style={{ marginBottom: space.md }}>
          {op === 'push'
            ? 'Stages everything, commits it with the current time as the message, then pushes. If there is nothing new to commit, it still pushes.'
            : 'Fast-forward only. It never throws away work on the laptop; if the branches have split, it stops and tells you.'}
        </T>
        {err ? <T color="err" style={{ marginBottom: space.md }}>{err}</T> : null}
        <Button label={op === 'push' ? 'Push now' : 'Pull now'} kind="primary" onPress={go} busy={busy} disabled={!info?.git} />
        <Button label="Cancel" kind="plain" onPress={onClose} style={{ marginTop: space.sm }} />
      </View>
    </Sheet>
  )
}
