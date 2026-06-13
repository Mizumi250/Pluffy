// ============================================================
// ARKZEN GENERATED SCREEN — mail-test/register
// ============================================================

import React, { useState } from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { ScrollView, View, Text, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

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
