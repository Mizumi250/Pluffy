// ARKZEN GENERATED — auth-test/register (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:48.277Z
import { ErrorBox } from './components/ErrorBox'
import { Field } from './components/Field'
import { PrimaryBtn } from './components/PrimaryBtn'
import { ScrollView, Text, View, useState } from '@lynx-js/react'
import { useAuthStore } from '../../../arkzen/core/stores/authStore'

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
    <ScrollView style={{ flex: 1, backgroundColor: '#fafafa' }}>
      <View style={{ flex: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 48 }}>

        {/* Header */}
        <View style={{ marginBottom: 32 }}>
          <View style={{ width: 48, height: 48, borderRadius: 16, backgroundColor: '#171717', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Text style={{ color: '#fff', fontSize: 20 }}>🔒</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: '700', color: '#171717' }}>Auth Test</Text>
          <Text style={{ fontSize: 13, color: '#737373', marginTop: 4 }}>Create an account</Text>
        </View>

        {/* Form */}
        <View style={{ gap: 12 }}>
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"             value={name}     onInput={setName}     />
          <Field placeholder="Email"            value={email}    onInput={setEmail}    />
          <Field placeholder="Password"         value={password} onInput={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm}  onInput={setConfirm}  secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>
      </View>
    </ScrollView>
  )
}
