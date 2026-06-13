// ============================================================
// ARKZEN GENERATED SCREEN — broadcast-test/register
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

// User screen (from @arkzen:native:page:register)
const RegisterScreen = () => {
  const router                  = useRouter()
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
      // No navigation here — GuestLayout handles redirect on isAuthenticated change
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
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
          <Text className="text-sm text-neutral-500 mt-1">Create an account to test private + presence channels</Text>
        </View>

        <View className="gap-y-3">
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}
          {([
            { ph: 'Name',             val: name,     set: setName,     secure: false, kb: 'default'        },
            { ph: 'Email',            val: email,    set: setEmail,    secure: false, kb: 'email-address'  },
            { ph: 'Password',         val: password, set: setPassword, secure: true,  kb: 'default'        },
            { ph: 'Confirm password', val: confirm,  set: setConfirm,  secure: true,  kb: 'default'        },
          ] as const).map(f => (
            <TextInput
              key={f.ph}
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder={f.ph} placeholderTextColor="#a3a3a3"
              value={f.val} onChangeText={f.set}
              secureTextEntry={f.secure} keyboardType={f.kb as any}
              autoCapitalize="none" autoCorrect={false}
            />
          ))}
          <TouchableOpacity
            onPress={handleRegister} disabled={isLoading} activeOpacity={0.8}
            className={`py-3.5 rounded-2xl items-center ${isLoading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
          >
            {isLoading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-white text-sm font-semibold">Create account</Text>
            }
          </TouchableOpacity>
        </View>

        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/broadcast-test/login' as any)}>
            <Text className="text-xs text-neutral-400">
              Already have an account?{' '}<Text className="text-neutral-700 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Engine wrapper
export function ArkzenScreen_BroadcastTest_Register() {
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
        <RegisterScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_BroadcastTest_Register
