// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ProfileSheet [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.226Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'
import { useNav } from './hooks'
import { kt, langFlag, langName, pending, toast } from './utils'
import type { KProfile } from './types'
import { Avatar } from './Avatar'
import { Btn } from './Btn'
import { Chip } from './Chip'
import { Sheet } from './Sheet'

// ─── Profile + onboarding sheets ──────────────────────────────
export const ProfileSheet = ({ userId, onClose }: { userId: number | null; onClose: () => void }) => {
  const nav = useNav()
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    setD(null)
    if (userId) kt(`/profile/${userId}`).then(setD).catch(e => { toast(e instanceof Error ? e.message : 'Profile not found', 'err'); onClose() })
  }, [userId])
  const follow = async () => { try { const r = await kt<{ following: boolean }>(`/follow/${userId}`, { json: {} }); setD((x: any) => ({ ...x, following: r.following, followers: x.followers + (r.following ? 1 : -1) })) } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') } }
  const message = async () => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: userId } }); pending.chat = { kind: 'dm', id: r.data.id }; onClose(); nav.go('chat') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const p: KProfile | undefined = d?.data
  return (
    <Sheet open={!!userId} onClose={onClose} title="Profile">
      {!p ? <ActivityIndicator /> : (
        <>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}><Avatar name={p.display_name} color={p.avatar_color} size={64} /><View><Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{p.display_name}</Text><Text style={{ color: TH.sub }}>{p.country ?? 'Somewhere on Earth'}</Text></View></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}><Chip tone="green" label={`Speaks ${langFlag(p.native_lang)} ${langName(p.native_lang)}`} /><Chip tone="blue" label={`Learning ${langFlag(p.learning_lang)} ${langName(p.learning_lang)} · ${p.level}`} /><Chip tone="orange" label={`🔥 ${p.streak} days`} /></View>
          {p.bio && <Text style={{ fontSize: 16, lineHeight: 23, color: TH.text }}>{p.bio}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}>{[['Posts', d.post_count], ['Followers', d.followers], ['Following', d.following_count]].map(([k, v]) => <View key={k as string} style={{ flex: 1, backgroundColor: TH.fill, borderRadius: 14, padding: 12, alignItems: 'center' }}><Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>{v}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{k}</Text></View>)}</View>
          <View style={{ flexDirection: 'row', gap: 10 }}><Btn kind="primary" label="Message" onPress={message} style={{ flex: 1 }} /><Btn label={d.following ? 'Following' : 'Follow'} onPress={follow} /></View>
        </>
      )}
    </Sheet>
  )
}
