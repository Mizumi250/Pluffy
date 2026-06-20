// ARKZEN GENERATED — broadcast-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:50.008Z
import { ScrollView, Text, TextInput, TouchableOpacity, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

const RegisterScreen = () => {
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
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
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
          <Text className="text-sm text-neutral-500 mt-1">Create an account to test private + presence channels</Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && (
            <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
              <Text className="text-xs text-red-600">{error}</Text>
            </View>
          )}
          {([
            { ph: 'Name',             val: name,     set: setName,     type: 'text'     },
            { ph: 'Email',            val: email,    set: setEmail,    type: 'email'    },
            { ph: 'Password',         val: password, set: setPassword, type: 'password' },
            { ph: 'Confirm password', val: confirm,  set: setConfirm,  type: 'password' },
          ] as const).map(f => (
            <TextInput
              key={f.ph}
              className="bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
              placeholder={f.ph}
              value={f.val}
              onInput={e => f.set(e.detail.value)}
              type={f.type}
            />
          ))}
          {/* disabled state changes bg — dynamic value, use inline */}
          <TouchableOpacity
            onPress={handleRegister}
            disabled={isLoading}
            className="py-3.5 rounded-2xl items-center"
            style={{ backgroundColor: isLoading ? '#d4d4d4' : '#171717' }}
          >
            <Text className="text-white text-sm font-semibold">
              {isLoading ? 'Creating account…' : 'Create account'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-neutral-400">
            Already have an account?{' '}
            <Text className="text-neutral-700 font-medium">Sign in</Text>
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}
