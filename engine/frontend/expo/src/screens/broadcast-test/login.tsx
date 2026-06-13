// ============================================================
// ARKZEN GENERATED SCREEN — broadcast-test/login
// ============================================================

import React, { useState } from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { ChannelCard } from './components/ChannelCard'
import { StatusDot } from './components/StatusDot'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useState } from 'react'
import { useRouter } from 'expo-router'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

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
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
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
