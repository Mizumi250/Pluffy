// A card with options, same fields as Studio's forms. The preview is the exact command the laptop will run.
import React, { useEffect, useState } from 'react'
import { Alert, Dimensions, FlatList, KeyboardAvoidingView, Platform, Pressable, ScrollView, Switch, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api, Field, Option } from '../api'
import { Input } from '../Input'
import { useNav } from '../nav'
import { useStore } from '../store'
import { mono, radius, space, term, useTheme } from '../theme'
import { Button, Group, Icon, PageHeader, Row, Sheet, T } from '../ui'

function Picker({ field, options, value, onPick, onClose }: { field: Field | null; options: Option[]; value: string; onPick: (v: string) => void; onClose: () => void }) {
  const [q, setQ] = useState('')
  useEffect(() => { setQ('') }, [field?.id])
  const list = options.filter((o) => o.l.toLowerCase().includes(q.toLowerCase()))
  return (
    <Sheet visible={!!field} onClose={onClose} title={field?.label ?? ''}>
      <View style={{ paddingHorizontal: space.md }}><Input value={q} onChangeText={setQ} placeholder="Search" accessibilityLabel="Search options" /></View>
      <FlatList style={{ marginTop: space.sm, maxHeight: Dimensions.get('window').height * 0.45, flexGrow: 0 }} data={list} keyExtractor={(o) => o.v || '__none'} keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => <Row title={item.l} tile={false} chevron={false} onPress={() => onPick(item.v)} right={item.v === value ? <Icon name="check" size={20} /> : undefined} />}
        ListEmptyComponent={<T v="caption" style={{ padding: space.md }}>Nothing matches.</T>} />
    </Sheet>
  )
}

export function FormScreen({ id, preset }: { id: string; preset?: Record<string, unknown> }) {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const insets = useSafeAreaInsets()
  const item = st.menu?.items.find((i) => i.id === id)
  const fields = item?.form?.fields ?? []
  const [vals, setVals] = useState<Record<string, any>>(() => Object.fromEntries(fields.map((f) => [f.id, preset && f.id in preset ? preset[f.id] : f.value])))
  const [prev, setPrev] = useState<{ preview?: string; error?: string }>({})
  const [picker, setPicker] = useState<Field | null>(null)
  const [busy, setBusy] = useState(false)
  const set = (k: string, v: any) => setVals((p) => ({ ...p, [k]: v }))

  useEffect(() => { if (fields.some((f) => f.type === 'tatemono' || f.type === 'project')) st.refreshLists() }, [])

  useEffect(() => {
    if (!st.conn || !item) return
    let dead = false
    const t = setTimeout(async () => {
      try { const r = await api.build(st.conn!, id, vals); if (!dead) setPrev({ preview: r.preview }) }
      catch (e: any) { if (!dead) setPrev({ error: e.message }) }
    }, 250)
    return () => { dead = true; clearTimeout(t) }
  }, [vals, st.conn])

  if (!item || !item.form) return (
    <View style={{ flex: 1, backgroundColor: c.bg }}><PageHeader title="Command" onBack={nav.pop} /><T style={{ padding: space.md }}>This card is not on the laptop any more. Go back and pull to refresh.</T></View>
  )

  const optionsOf = (f: Field): Option[] => {
    const base = f.type === 'tatemono' ? (st.lists?.tatemonos ?? []).map((v) => ({ v, l: v }))
      : f.type === 'project' ? (st.lists?.projects ?? []).map((v) => ({ v, l: v })) : (f.options ?? [])
    return f.optional ? [{ v: '', l: f.optionalLabel || '(none)' }, ...base] : base
  }

  async function go() {
    if (!st.conn) return
    setBusy(true)
    try { const r = await api.run(st.conn, { id, values: vals }); st.refresh(); nav.replace({ k: 'task', id: r.task.id }) }
    catch (e: any) { setBusy(false); Alert.alert('Could not start it', e.message) }
  }

  const renderField = (f: Field) => {
    const label = <T v="strong" style={{ marginBottom: space.sm, marginLeft: 4 }}>{f.label}{f.required ? ' *' : ''}</T>
    const hint = f.hint ? <T v="caption" style={{ marginTop: space.sm, marginLeft: 4 }}>{f.hint}</T> : null
    if (f.type === 'check') return (
      <Group key={f.id}><Row title={f.label} tile={false} chevron={false} right={<Switch value={!!vals[f.id]} onValueChange={(v) => set(f.id, v)} trackColor={{ true: c.primary, false: c.chipPress }} thumbColor={c.surface} accessibilityLabel={f.label} />} /></Group>
    )
    if (f.type === 'multi') return (
      <View key={f.id} style={{ marginBottom: space.lg }}>
        {label}
        <Group style={{ marginBottom: 0 }}>
          {(f.options ?? []).map((o) => {
            const on = (vals[f.id] as string[]).includes(o.v)
            return <Row key={o.v} title={o.l} tile={false} chevron={false} icon={on ? 'square-check' : 'square'}
              onPress={() => set(f.id, on ? (vals[f.id] as string[]).filter((x) => x !== o.v) : [...(vals[f.id] as string[]), o.v])} />
          })}
        </Group>
        {hint}
      </View>
    )
    if (f.type === 'select' || f.type === 'tatemono' || f.type === 'project') {
      const shown = optionsOf(f).find((o) => o.v === vals[f.id])?.l
      return (
        <View key={f.id} style={{ marginBottom: space.lg }}>
          {label}
          <Pressable accessibilityRole="button" accessibilityLabel={`${f.label}: ${shown || 'not chosen'}. Change`} onPress={() => setPicker(f)}
            style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', minHeight: 52, borderRadius: radius.md, paddingHorizontal: 16, backgroundColor: pressed ? c.chipPress : c.chip })}>
            <Text style={{ flex: 1, fontSize: 16, color: shown ? c.ink : c.muted }} numberOfLines={1}>{shown || 'Choose'}</Text>
            <Icon name="chevron-down" size={20} color={c.muted} />
          </Pressable>
          {hint}
        </View>
      )
    }
    return (
      <View key={f.id} style={{ marginBottom: space.lg }}>
        {label}
        <Input value={String(vals[f.id] ?? '')} onChangeText={(t) => set(f.id, t)} placeholder={f.placeholder} accessibilityLabel={f.label}
          multiline={f.type === 'textarea'} style={f.type === 'textarea' ? { minHeight: 112, textAlignVertical: 'top' } : undefined} />
        {hint}
      </View>
    )
  }

  const pickerField = picker
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <PageHeader title={item.title} onBack={nav.pop} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: space.md, paddingBottom: space.lg }}>
          <T v="caption" style={{ marginBottom: space.lg, marginLeft: 4 }}>{item.desc}</T>
          {fields.map(renderField)}
          <T v="strong" style={{ marginBottom: space.sm, marginLeft: 4 }}>Command</T>
          <View style={{ backgroundColor: term.bg, borderRadius: radius.md, padding: space.md }}>
            <Text selectable style={{ fontFamily: mono, fontSize: 13, lineHeight: 19, color: term.ink }}>$ {prev.preview ?? '...'}</Text>
          </View>
          {prev.error ? <View style={{ flexDirection: 'row', gap: 8, marginTop: space.md, alignItems: 'flex-start' }}><Icon name="triangle-alert" size={20} color={c.warn} /><T color="warn" style={{ flex: 1 }}>{prev.error}</T></View> : null}
        </ScrollView>
        <View style={{ padding: space.md, paddingBottom: insets.bottom + space.md, backgroundColor: c.bg }}>
          <Button label="Run on laptop" icon="play" kind="primary" onPress={go} busy={busy} disabled={!!prev.error || !prev.preview || st.link !== 'online'} />
        </View>
      </KeyboardAvoidingView>
      <Picker field={pickerField} options={pickerField ? optionsOf(pickerField) : []} value={pickerField ? String(vals[pickerField.id] ?? '') : ''}
        onPick={(v) => { if (pickerField) set(pickerField.id, v); setPicker(null) }} onClose={() => setPicker(null)} />
    </View>
  )
}
