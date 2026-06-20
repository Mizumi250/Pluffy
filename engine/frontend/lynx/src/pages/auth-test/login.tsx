// ARKZEN GENERATED — auth-test/login (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.274Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { ScrollView, Text, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

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
    <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>

        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 20 }}>🔒</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#171717' }}>Auth Test</Text>
          <Text style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>
            Sign in to access the protected dashboard
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 12 }}>
          {error && <ErrorBox message={error} />}

          <Field placeholder="Email"    value={email}    onInput={setEmail}    />
          <Field placeholder="Password" value={password} onInput={setPassword} secureTextEntry />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Footer */}
        <View style={{ marginTop: 24, alignItems: 'center' }}>
          <View style={{ backgroundColor: '#f5f5f5', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 10 }}>
            <Text style={{ fontSize: 11, color: '#a3a3a3', fontFamily: 'monospace' }}>
              test@arkzen.local / password
            </Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}
