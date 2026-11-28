// One tatemono: quick actions (the same cards Studio offers for it), lint, and its files. Editing is a plain text editor.
import React, { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native'
import { api, ApiError, Problem } from '../api'
import { Input } from '../Input'
import { useNav } from '../nav'
import { useStore } from '../store'
import { mono, radius, space, useTheme } from '../theme'
import { Banner, Button, Group, Icon, PageHeader, Row, Sheet, T } from '../ui'
import { bytes } from '../util'

type Lint = { errors: number; warnings: number; problems: Problem[] }
const summary = (l: Lint) => (l.errors || l.warnings ? `${l.errors} error${l.errors === 1 ? '' : 's'}, ${l.warnings} warning${l.warnings === 1 ? '' : 's'}` : 'Clean')

function ProblemRows({ problems }: { problems: Problem[] }) {
  const { c } = useTheme()
  return <>{problems.map((p, i) => (
    <Row key={i} tile={false} chevron={false} icon={p.level === 'error' ? 'circle-x' : 'triangle-alert'} title={`Line ${p.line}`} sub={p.message} lines={4} />
  ))}</>
}

export function TatemonoView({ name }: { name: string }) {
  const st = useStore()
  const nav = useNav()
  const [files, setFiles] = useState<{ path: string; size: number }[] | null>(null)
  const [lint, setLint] = useState<Lint | null>(null)
  const [linting, setLinting] = useState(false)
  const [err, setErr] = useState('')
  const items = st.menu?.items ?? []
  const quick = [['check', 'Check', 'square-check'], ['export', 'Export', 'package'], ['screenshot', 'Screenshot', 'camera'], ['openapi', 'OpenAPI docs', 'book-open']]
    .filter(([id]) => items.some((i) => i.id === id))

  useEffect(() => { if (st.conn) api.files(st.conn, name).then((r) => setFiles(r.files)).catch((e) => setErr(e.message)) }, [name, st.conn])

  async function runLint() {
    if (!st.conn) return
    setLinting(true); setErr('')
    try { setLint(await api.check(st.conn, name)) } catch (e: any) { setErr(e.message) } finally { setLinting(false) }
  }

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title={name} sub="tatemono" onBack={nav.pop} />
      <ScrollView contentContainerStyle={{ padding: space.md, paddingBottom: space.xl }}>
        {err ? <Banner kind="warn" text={err} /> : null}
        {quick.length ? (
          <Group title="Run on the laptop">
            {quick.map(([id, label, icon]) => <Row key={id} icon={icon} title={label} onPress={() => nav.push({ k: 'form', id, preset: { t: name } })} />)}
          </Group>
        ) : null}

        <Group title="Problems" sub="The same check as mizumi check, for this tatemono.">
          <Row icon={lint ? (lint.errors ? 'circle-x' : 'circle-check') : 'square-check'} title={lint ? summary(lint) : 'Not checked yet'} tile={false} chevron={false}
            right={linting ? <ActivityIndicator /> : <Button label={lint ? 'Check again' : 'Check now'} full={false} onPress={runLint} style={{ minHeight: 44 }} />} />
          {lint ? <ProblemRows problems={lint.problems} /> : null}
        </Group>

        <Group title="Files">
          {files === null ? <Row title="Loading" tile={false} chevron={false} right={<ActivityIndicator />} />
            : files.map((f) => <Row key={f.path} icon="file-code" tile={false} title={f.path} sub={bytes(f.size)} onPress={() => nav.push({ k: 'editor', name, path: f.path })} />)}
        </Group>
      </ScrollView>
    </View>
  )
}

// Plain text editor. The text box is uncontrolled so a 30 KB file stays smooth while typing.
export function Editor({ name, path }: { name: string; path: string }) {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [loaded, setLoaded] = useState<{ text: string; mtime: number; key: number } | null>(null)
  const [note, setNote] = useState('')
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [lint, setLint] = useState<Lint | null>(null)
  const [show, setShow] = useState(false)
  const text = useRef(''); const base = useRef(''); const mtime = useRef(0)

  async function load() {
    if (!st.conn) return
    setNote('')
    try {
      const r = await api.readFile(st.conn, name, path)
      if (r.binary || r.text === undefined) { setNote(r.tooBig ? 'This file is too big to edit on the phone.' : 'This is not a text file.'); return }
      text.current = r.text; base.current = r.text; mtime.current = r.mtime
      setDirty(false); setLint(null); setLoaded({ text: r.text, mtime: r.mtime, key: Date.now() })
    } catch (e: any) { setNote(e.message) }
  }
  useEffect(() => { load() }, [name, path, st.conn])

  useEffect(() => {
    nav.setGuard(() => {
      if (!dirty) return true
      Alert.alert('Discard your edits?', 'This file has changes that are not saved to the laptop.', [
        { text: 'Keep editing', style: 'cancel' }, { text: 'Discard', style: 'destructive', onPress: nav.popForce },
      ])
      return false
    })
    return () => nav.setGuard(null)
  }, [dirty])

  async function save(force = false) {
    if (!st.conn) return
    setSaving(true)
    try {
      const r = await api.writeFile(st.conn, name, path, text.current, force ? undefined : mtime.current)
      mtime.current = r.mtime; base.current = text.current; setDirty(false); st.say('Saved to the laptop')
      if (path === 'core.tsx') api.check(st.conn, name).then(setLint).catch(() => {})
    } catch (e: any) {
      if (e instanceof ApiError && e.status === 409) {
        Alert.alert('This file changed on the laptop', 'Someone saved it there after you opened it here.', [
          { text: 'Cancel', style: 'cancel' }, { text: 'Reload (lose my edits)', style: 'destructive', onPress: load }, { text: 'Overwrite', onPress: () => save(true) },
        ])
      } else Alert.alert('Could not save', e.message)
    } finally { setSaving(false) }
  }

  return (
    <View style={{ flex: 1 }}>
      <PageHeader title={path} sub={dirty ? 'Edited, not saved' : lint ? summary(lint) : name} onBack={nav.pop}
        right={<Button label="Save" kind="primary" full={false} onPress={() => save()} busy={saving} disabled={!dirty || st.link !== 'online'} style={{ minHeight: 44, marginRight: 4 }} />} />
      {note ? <View style={{ padding: space.md }}><Banner kind="warn" text={note} action={{ label: 'Retry', onPress: load }} /></View> : null}
      {!loaded && !note ? <ActivityIndicator color={c.muted} style={{ margin: space.xl }} /> : null}
      {loaded ? (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <TextInput key={loaded.key} multiline defaultValue={loaded.text} onChangeText={(t) => { text.current = t; setDirty(t !== base.current) }}
            autoCapitalize="none" autoCorrect={false} spellCheck={false} scrollEnabled textAlignVertical="top" selectionColor={c.primary} accessibilityLabel={`Contents of ${path}`}
            style={{ flex: 1, margin: space.md, marginBottom: space.sm, padding: space.md, borderRadius: radius.md, backgroundColor: c.surface, color: c.ink, fontFamily: mono, fontSize: 14, lineHeight: 21 }} />
          {lint && (lint.errors || lint.warnings) ? (
            <View style={{ paddingHorizontal: space.md, paddingBottom: space.md }}>
              <Button label={`${summary(lint)}. Show`} icon="triangle-alert" onPress={() => setShow(true)} />
            </View>
          ) : null}
        </KeyboardAvoidingView>
      ) : null}
      <Sheet visible={show} onClose={() => setShow(false)} title="Problems">
        <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ paddingHorizontal: space.md }}>
          <Group>{lint ? <ProblemRows problems={lint.problems} /> : <View />}</Group>
        </ScrollView>
      </Sheet>
    </View>
  )
}
