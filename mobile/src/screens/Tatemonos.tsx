import React, { useEffect, useState } from 'react'
import { FlatList, RefreshControl, View } from 'react-native'
import { useNav } from '../nav'
import { Input } from '../Input'
import { useStore } from '../store'
import { radius, space, useTheme } from '../theme'
import { Button, Empty, Row, Spacer, T, TabScreen } from '../ui'

export function Tatemonos() {
  const { c } = useTheme()
  const st = useStore()
  const nav = useNav()
  const [q, setQ] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  useEffect(() => { if (st.link === 'online') st.refreshLists() }, [st.link === 'online'])
  const all = st.lists?.tatemonos ?? []
  const list = all.filter((t) => t.toLowerCase().includes(q.trim().toLowerCase()))
  const hasNew = !!st.menu?.items.some((i) => i.id === 'new')

  return (
    <TabScreen scroll={false} title="Tatemonos" right={hasNew ? <Button label="New" icon="plus" full={false} onPress={() => nav.push({ k: 'form', id: 'new' })} style={{ minHeight: 44 }} /> : null}>
      <Input value={q} onChangeText={setQ} placeholder={all.length ? `Search ${all.length} tatemonos` : 'Search'} accessibilityLabel="Search tatemonos" />
      <Spacer h={space.md} />
      <View style={{ flex: 1, backgroundColor: c.surface, borderRadius: radius.md, overflow: 'hidden', marginBottom: space.md }}>
        <FlatList data={list} keyExtractor={(t) => t} keyboardShouldPersistTaps="handled"
          refreshControl={<RefreshControl refreshing={refreshing} tintColor={c.muted} onRefresh={async () => { setRefreshing(true); await st.refreshLists(); setRefreshing(false) }} />}
          ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: c.line, marginLeft: space.md }} />}
          renderItem={({ item }) => <Row title={item} icon="building-2" tile={false} onPress={() => nav.push({ k: 'tatemono', name: item })} />}
          ListEmptyComponent={st.lists
            ? <Empty title={q ? 'Nothing matches' : 'No tatemonos yet'} text={q ? 'Try a shorter name.' : 'Folders with a core.tsx inside tatemonos/ on the laptop show up here.'} />
            : <T v="caption" style={{ padding: space.md }}>Waiting for the laptop.</T>} />
      </View>
    </TabScreen>
  )
}
