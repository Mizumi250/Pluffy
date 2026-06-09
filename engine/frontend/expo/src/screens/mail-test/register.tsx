// ============================================================
// ARKZEN GENERATED SCREEN — mail-test/register
// ============================================================

import React, { useEffect, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { CheckCircle, Clock, LogOut, Mail, RefreshCw, Send, XCircle } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { GuestLayout } from '@/layouts/GuestLayout'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

interface MailLog {
  id:         number
  to_email:   string
  subject:    string
  mail_class: string
  status:     string
  error:      string | null
  created_at: string
}

interface MailType {
  key:    string
  label:  string
  desc:   string
  fields: Record<string, string>
}

// ── Input field ───────────────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address' | 'numeric'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ─────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <View className="flex-row items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
    <XCircle size={14} color="#ef4444" style={{ marginTop: 1 }} />
    <Text className="text-xs text-red-600 flex-1">{message}</Text>
  </View>
)

// ── Primary button ────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : 'bg-neutral-900'}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-sm font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// User screen (from @arkzen:native:page:register)
const RegisterScreen = () => {
  const router                  = useRouter()
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('Test User')
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [confirm,  setConfirm]  = useState('password')
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
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Mail size={22} color="#fff" />
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Mail Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">Create an account</Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"             value={name}     onChangeText={setName}     />
          <Field placeholder="Email"            value={email}    onChangeText={setEmail}    keyboardType="email-address" />
          <Field placeholder="Password"         value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm}  onChangeText={setConfirm}  secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/mail-test/login' as any)}>
            <Text className="text-xs text-neutral-400">
              Already have an account?{' '}
              <Text className="text-neutral-700 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Engine wrapper
export function ArkzenScreen_MailTest_Register() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('mail-test')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      <GuestLayout tatSlug="mail-test" dashboardRoute="/mail-test/dashboard">
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

export default ArkzenScreen_MailTest_Register
