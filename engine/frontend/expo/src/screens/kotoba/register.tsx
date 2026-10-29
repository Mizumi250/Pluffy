// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/register
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { GuestLayout } from '@/layouts/GuestLayout'
import { StatusBar as ArkzenStatusBar } from 'expo-status-bar'
import { Avatar } from './components/Avatar'
import { Bar } from './components/Bar'
import { Btn } from './components/Btn'
import { Card } from './components/Card'
import { Chip } from './components/Chip'
import { ComposeBox } from './components/ComposeBox'
import { Diff } from './components/Diff'
import { Empty } from './components/Empty'
import { Field } from './components/Field'
import { Ico } from './components/Ico'
import { InterestPicker } from './components/InterestPicker'
import { LangPicker } from './components/LangPicker'
import { LessonPlayer } from './components/LessonPlayer'
import { Logo } from './components/Logo'
import { OnboardingSheet } from './components/OnboardingSheet'
import { PostCard } from './components/PostCard'
import { ProfileSheet } from './components/ProfileSheet'
import { Screen } from './components/Screen'
import { Seg } from './components/Seg'
import { Sheet } from './components/Sheet'
import { ShellFx } from './components/ShellFx'
import { Skel } from './components/Skel'
import { TH } from './components/constants'
import { useNav } from './components/hooks'

// User screen (from @arkzen:native:page:register)
const RegisterScreen = () => {
  const nav = useNav()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try { await register(name.trim(), email.trim(), password, confirm) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create account') }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: TH.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <Card style={{ padding: 28, gap: 14, borderRadius: 36 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>Create your account</Text>
          <Text style={{ color: TH.sub, fontSize: 16 }}>Free forever. Takes under a minute.</Text>
          {error && <View accessibilityRole="alert" style={{ backgroundColor: 'rgba(155, 59, 52, 0.14)', padding: 12, borderRadius: 12 }}><Text style={{ color: TH.red }}>{error}</Text></View>}
          <Field label="Name" value={name} onChangeText={setName} autoCap="words" />
          <Field label="Email" value={email} onChangeText={setEmail} keyboard="email-address" />
          <Field label="Password (8+ characters)" value={password} onChangeText={setPassword} secure />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secure />
          <Btn kind="primary" label={isLoading ? 'Creating…' : 'Create account'} disabled={isLoading || !name || !email || password.length < 8} onPress={submit} />
          <Btn kind="ghost" label="Already learning with us? Sign in" onPress={() => nav.go('login')} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Register() {
  // Set slug synchronously on every render — must be first line so
  // __ARKZEN_TATEMONO__ is correct before any child component or
  // store call (logout, arkzenFetch, fetchMe, getAuthBase) runs.
  setActiveTatemono('kotoba')
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <ArkzenStatusBar style="dark" />
      <GuestLayout tatSlug="kotoba" dashboardRoute="/kotoba/dashboard">
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

export default ArkzenScreen_Kotoba_Register
