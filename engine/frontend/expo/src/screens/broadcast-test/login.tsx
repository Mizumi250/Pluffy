// ============================================================
// ARKZEN GENERATED SCREEN — broadcast-test/login
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore, useAuthStoreHydrated } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GuestLayout } from '@/layouts/GuestLayout'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL   = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL   ?? 'http://localhost:8000'
const REVERB_HOST   = process.env.EXPO_PUBLIC_REVERB_HOST          ?? 'localhost'
const REVERB_PORT   = process.env.EXPO_PUBLIC_REVERB_PORT          ?? '8080'
const REVERB_SCHEME = process.env.EXPO_PUBLIC_REVERB_SCHEME        ?? 'ws'
const APP_KEY       = process.env.EXPO_PUBLIC_REVERB_APP_KEY       ?? 'arkzen-key'

type WsStatus = 'connecting' | 'connected' | 'error'

interface NativeMessage {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}

const StatusDot = ({ status }: { status: WsStatus }) => {
  const color = status === 'connected' ? '#4ade80' : status === 'connecting' ? '#facc15' : '#f87171'
  return <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: color }} />
}

const ChannelCard = ({
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

// User screen (from @arkzen:native:page:login)
const LoginScreen = () => {
  const router               = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
      router.replace('/broadcast-test/dashboard' as any)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView className="flex-1 bg-neutral-50" behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }} keyboardShouldPersistTaps="handled" className="px-6">
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg">📡</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Broadcast Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">Sign in to test all channel types</Text>
        </View>

        <View className="gap-y-3">
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}
          <TextInput
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Email" placeholderTextColor="#a3a3a3"
            value={email} onChangeText={setEmail}
            keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
          />
          <TextInput
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Password" placeholderTextColor="#a3a3a3"
            value={password} onChangeText={setPassword}
            secureTextEntry
          />
          <TouchableOpacity
            onPress={handleLogin} disabled={isLoading} activeOpacity={0.8}
            className={`py-3.5 rounded-2xl items-center ${isLoading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-white text-sm font-semibold">Sign in</Text>
            }
          </TouchableOpacity>
        </View>

        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/broadcast-test/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}<Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Engine wrapper
export function ArkzenScreen_BroadcastTest_Login() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('broadcast-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="broadcast-test" dashboardRoute="/broadcast-test/dashboard">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <LoginScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_BroadcastTest_Login
