// ARKZEN GENERATED — mail-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.827Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { Mail } from 'lucide-react-native'

/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@arkzen.local')
  const [password, setPassword] = useState('password')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
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
          <Text className="text-xs text-neutral-400">
            No account?{' '}
            <Text className="text-neutral-700 font-medium">Register</Text>
          </Text>

          <View className="bg-neutral-100 rounded-xl px-4 py-2.5">
            <Text className="text-xs text-neutral-500 text-center">
              Default: test@arkzen.local / password
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
