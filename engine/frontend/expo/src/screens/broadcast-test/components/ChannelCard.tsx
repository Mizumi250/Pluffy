// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ChannelCard [Expo]
// Source: @arkzen:native:components (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:38.270Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { handleSend, val } from './utils'
import type { NativeMessage, WsStatus } from './types'
import { StatusDot } from './StatusDot'

export const ChannelCard = ({
  title, badge, badgeColor, description, status, count, msgs, onSend, footer,
}: {
  title:       string
  badge:       string
  badgeColor:  string
  description: string
  status:      WsStatus
  count:       number
  msgs:        NativeMessage[]
  onSend:      (val: string) => void
  footer?:     React.ReactNode
}) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    const val = input.trim()
    if (!val) return
    onSend(val)
    setInput('')
  }

  return (
    <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
      <View className="px-4 py-3.5 border-b border-neutral-100">
        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center gap-2">
            <View className={`px-2 py-0.5 rounded-full ${badgeColor}`}>
              <Text className="text-white text-xs font-semibold">{badge}</Text>
            </View>
            <Text className="text-sm font-semibold text-neutral-800">{title}</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <StatusDot status={status} />
            <Text className="text-xs text-neutral-400">{status}</Text>
            <Text className="text-xs text-neutral-300"> · </Text>
            <Text className="text-xs text-neutral-400">{count} rx</Text>
          </View>
        </View>
        <Text className="text-xs text-neutral-400 mt-1" numberOfLines={2}>{description}</Text>
      </View>

      <View className="px-4 py-2.5 border-b border-neutral-50 flex-row gap-2 items-center">
        <TextInput
          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900"
          placeholder="Type and send…"
          placeholderTextColor="#a3a3a3"
          value={input}
          onChangeText={setInput}
          onSubmitEditing={handleSend}
          returnKeyType="send"
          autoCorrect={false}
          autoCapitalize="none"
        />
        <TouchableOpacity onPress={handleSend} activeOpacity={0.8} className="bg-neutral-900 px-4 py-2.5 rounded-xl">
          <Text className="text-white text-xs font-semibold">Send</Text>
        </TouchableOpacity>
      </View>

      {footer && <View className="px-4 py-2.5 border-b border-neutral-50">{footer}</View>}

      {msgs.length === 0 ? (
        <View className="py-8 items-center">
          <Text className="text-xs text-neutral-300">No messages yet</Text>
        </View>
      ) : (
        msgs.slice(0, 20).map((m, i) => (
          <View key={i} className="px-4 py-2.5 border-b border-neutral-50 flex-row items-start gap-2">
            <Text className="flex-1 text-sm text-neutral-700">{m.content}</Text>
            <Text className="text-xs text-neutral-300 shrink-0">{m.created_at?.slice(11, 19)}</Text>
          </View>
        ))
      )}
    </View>
  )
}
