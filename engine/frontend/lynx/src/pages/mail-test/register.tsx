// ARKZEN GENERATED — mail-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.833Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { KeyboardAvoidingView, Platform, ScrollView, Text, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'
import { Mail } from 'lucide-react-native'

/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
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
          <Text className="text-sm text-neutral-500 mt-1">
            Create an account to start testing email delivery
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Name"
            value={name}
            onChangeText={setName}
          />
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
          <Field
            placeholder="Confirm password"
            value={confirm}
            onChangeText={setConfirm}
            secureTextEntry
          />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <Text className="text-xs text-neutral-400">
            Already have an account?{' '}
            <Text className="text-neutral-700 font-medium">Sign in</Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}
