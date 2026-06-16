// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NContinuationCard [Expo]
// Source: @arkzen:native:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:38.548Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { C, N_CONTINUATIONS } from './constants'
import { NBadge } from './NBadge'
import { NProgressBar } from './NProgressBar'

// Continuation card
export const NContinuationCard = ({ c, onPress }: { c: typeof N_CONTINUATIONS[0]; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      backgroundColor: C.surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: pressed ? C.borderMid : C.border,
      marginBottom: 12,
    })}
  >
    <Image source={{ uri: c.thumb }} style={{ width: '100%', height: 160, resizeMode: 'cover' }} />
    <View style={{ padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Image source={{ uri: c.avatar }} style={{ width: 22, height: 22, borderRadius: 11 }} />
        <Text style={{ fontSize: 11, color: C.muted }}>{c.handle}</Text>
        <Text style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{c.lastUpdate}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 }}>{c.title}</Text>
      <Text style={{ fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>{c.note}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
        {c.tags.slice(0, 2).map(t => <NBadge key={t} label={t} />)}
        <Text style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{c.witnesses} witnessing</Text>
      </View>
      <NProgressBar pct={c.progress} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: C.muted }}>v{c.version}</Text>
        <Text style={{ fontSize: 10, color: C.muted }}>{c.progress}%</Text>
      </View>
    </View>
  </Pressable>
)
 
// Section header row
