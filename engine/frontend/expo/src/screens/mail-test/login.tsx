// ============================================================
// ARKZEN GENERATED SCREEN — mail-test/login
// ============================================================

import React from 'react'
import { GuestLayout } from '@/layouts/GuestLayout'
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { ScrollView } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'

import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { SafeAreaView } from 'react-native-safe-area-context'

// User screen (from @arkzen:native:page:login)
const LoginScreen = () => {
  const router               = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
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
          <Text className="text-sm text-neutral-500 mt-1">
            Sign in to start testing email delivery
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center gap-y-3">
          <TouchableOpacity onPress={() => router.push('/mail-test/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}
              <Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>

          <View className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <Text className="text-xs text-neutral-400 font-mono">
              test@arkzen.local / password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Engine wrapper
export function ArkzenScreen_MailTest_Login() {
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
        <LoginScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_MailTest_Login
