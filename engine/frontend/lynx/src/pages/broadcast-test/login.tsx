// ARKZEN GENERATED — broadcast-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:49.996Z
import { ScrollView, Text, TextInput, TouchableOpacity, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const LoginScreen = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
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
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="flex-1 justify-center px-6 py-12">

        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg">📡</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Broadcast Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">Sign in to test all channel types</Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}
          <TextInput
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Email"
            value={email}
            onInput={e => setEmail(e.detail.value)}
            type="email"
          />
          <TextInput
            className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
            placeholder="Password"
            value={password}
            onInput={e => setPassword(e.detail.value)}
            type="password"
          />
          {/* disabled state changes bg — dynamic value, use inline */}
          <TouchableOpacity
            onPress={handleLogin}
            disabled={isLoading}
            className="py-3.5 rounded-2xl items-center"
            style={{ backgroundColor: isLoading ? '#d4d4d4' : '#171717' }}
          >
            <Text className="text-white text-sm font-semibold">
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-neutral-400">
            No account?{' '}
            <Text className="text-neutral-700 font-medium">Register</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
