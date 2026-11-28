// One command's output, streamed from the laptop. The pane is always dark like a terminal so colours stay readable.
import React, { useEffect, useRef, useState } from 'react'
import { Alert, FlatList, NativeScrollEvent, NativeSyntheticEvent, Text, View } from 'react-native'
import * as Clipboard from 'expo-clipboard'
import { api, ApiError, TaskBrief } from '../api'
import { DEFAULT, parseAnsi, stripAnsi } from '../ansi'
import { useNav } from '../nav'
import { taskMeta } from '../status'
import { useStore } from '../store'
import { mono, radius, space, term, useTheme } from '../theme'
import { Button, Icon, IconButton, PageHeader, T } from '../ui'
import { span } from '../util'

const Line = React.memo(({ text }: { text: string }) => (
  <Text selectable style={{ fontFamily: mono, fontSize: 13, lineHeight: 19, color: DEFAULT }}>
    {parseAnsi(text).map((s, i) => <Text key={i} style={{ color: s.color, fontWeight: s.bold ? '700' : '400' }}>{s.text}</Text>)}
    {text === '' ? ' ' : ''}
  </Text>
))

export function TaskView({ id }: { id: string }) {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [lines, setLines] = useState<string[]>([])
  const [cur, setCur] = useState('')
  const [meta, setMeta] = useState<TaskBrief | null>(null)
  const [trimmed, setTrimmed] = useState(false)
  const [gone, setGone] = useState(false)
  const [follow, setFollow] = useState(true)
  const followRef = useRef(true)
  const list = useRef<FlatList<string>>(null)
  const conn = st.conn

  useEffect(() => {
    if (!conn) return
    let stop = false, since = 0
    ;(async () => {
      while (!stop) {
        try {
          const r = await api.task(conn, id, since, 20)
          if (stop) return
          if (r.from > since) setTrimmed(true)
          const first = since === 0
          setLines((prev) => { const next = first ? r.lines : prev.concat(r.lines); return next.length > 5000 ? next.slice(-5000) : next })
          since = r.next; setCur(r.cur); setMeta(r)
          if (r.status !== 'running') return
        } catch (e: any) {
          if (stop) return
          if (e instanceof ApiError && e.status === 404) { setGone(true); return }
          await new Promise((res) => setTimeout(res, 2000))
        }
      }
    })()
    return () => { stop = true }
  }, [id, conn])

  const data = cur ? [...lines, cur] : lines
  const m = meta ? taskMeta(meta.status) : null
  const running = meta?.status === 'running'

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent
    const atEnd = contentSize.height - (contentOffset.y + layoutMeasurement.height) < 60
    if (atEnd !== followRef.current) { followRef.current = atEnd; setFollow(atEnd) }
  }
  const toEnd = () => { followRef.current = true; setFollow(true); list.current?.scrollToEnd({ animated: true }) }

  function stopIt() {
    Alert.alert('Stop this command?', 'It stops on the laptop too.', [
      { text: 'Keep running', style: 'cancel' },
      { text: 'Stop', style: 'destructive', onPress: () => { if (conn) api.stop(conn, id).then(() => st.refresh()).catch((e) => st.say(e.message)) } },
    ])
  }
  async function removeIt() {
    if (conn) await api.remove(conn, id).catch(() => {})
    st.refresh(); nav.pop()
  }
  async function copy() {
    await Clipboard.setStringAsync(data.map(stripAnsi).join('\n'))
    st.say('Output copied')
  }

  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title={meta?.label ?? 'Command'} sub={m ? `${m.word}${meta && meta.endedAt ? ` in ${span(meta.endedAt - meta.startedAt)}` : ''}` : undefined} onBack={nav.pop}
        right={<>
          <IconButton name="copy" label="Copy output" onPress={copy} />
          {running ? <Button label="Stop" kind="danger" full={false} onPress={stopIt} style={{ minHeight: 44, marginRight: 4 }} />
            : meta ? <IconButton name="trash-2" label="Remove from list" onPress={removeIt} /> : null}
        </>} />
      <View style={{ flex: 1, margin: space.md, marginTop: space.sm, borderRadius: radius.md, backgroundColor: term.bg, overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: term.bar, paddingHorizontal: space.md, minHeight: 40 }}>
          <Icon name="square-terminal" size={18} color={term.muted} />
          <Text numberOfLines={1} style={{ flex: 1, color: term.muted, fontFamily: mono, fontSize: 13 }}>{meta?.shown ?? '...'}</Text>
          {m ? <><Icon name={m.icon} size={16} color={term.ink} /><Text style={{ color: term.ink, fontSize: 13 }}>{m.word}</Text></> : null}
        </View>
        {gone ? (
          <View style={{ padding: space.md }}><Text style={{ color: term.ink, fontSize: 15, lineHeight: 21 }}>The laptop no longer has this command. The bridge was restarted or the list was cleared.</Text></View>
        ) : (
          <FlatList ref={list} data={data} keyExtractor={(_, i) => String(i)} renderItem={({ item }) => <Line text={item} />}
            contentContainerStyle={{ padding: space.md }} onScroll={onScroll} scrollEventThrottle={64}
            onContentSizeChange={() => { if (followRef.current) list.current?.scrollToEnd({ animated: false }) }}
            ListHeaderComponent={trimmed ? <Text style={{ color: term.muted, fontSize: 13, marginBottom: 8 }}>Earlier output was trimmed to keep the phone fast.</Text> : null}
            ListEmptyComponent={<Text style={{ color: term.muted, fontSize: 14 }}>{meta ? 'No output yet.' : 'Connecting to the command'}</Text>} />
        )}
        {!follow && data.length > 0 ? (
          <View style={{ position: 'absolute', right: space.md, bottom: space.md }}>
            <Button label="Latest" icon="arrow-down" kind="primary" full={false} onPress={toEnd} />
          </View>
        ) : null}
      </View>
    </View>
  )
}
