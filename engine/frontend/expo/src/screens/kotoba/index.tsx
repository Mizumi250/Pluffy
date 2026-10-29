// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/index
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
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

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const nav = useNav()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: TH.bg }} contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 44, gap: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Logo /><Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: TH.text }}>Kotoba</Text></View>
      <View style={{ height: 320, borderRadius: 36, overflow: 'hidden', backgroundColor: TH.fill }}>
        <Image source={{ uri: 'https://picsum.photos/seed/kotoba-words/900/1125?grayscale' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14, borderRadius: 26, backgroundColor: TH.text, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View><Text style={{ color: 'rgba(245,241,233,0.6)', fontSize: 12 }}>kotoba</Text><Text style={{ color: TH.card, fontSize: 20, fontWeight: '700' }}>Words</Text></View>
          <Text style={{ color: TH.card, fontSize: 40, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}>言葉</Text>
        </View>
      </View>
      <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.6, color: TH.sub, textTransform: 'uppercase' }}>Social language learning</Text>
      <Text style={{ fontSize: 44, fontWeight: '800', letterSpacing: -1.8, color: TH.text, lineHeight: 46, marginTop: -12 }}>Learn by talking, not by tapping.</Text>
      <Text style={{ fontSize: 17, color: TH.sub, lineHeight: 26 }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard.</Text>
      <View style={{ gap: 10 }}>
        <Btn kind="primary" label="Create free account" onPress={() => nav.go('register')} />
        <Btn kind="tint" label="I have an account" onPress={() => nav.go('login')} />
      </View>
    </ScrollView>
  )
}

// Engine wrapper
export function ArkzenScreen_Kotoba_Index() {
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
        <IndexScreen />
      </ScrollView>
      </GuestLayout>
    </SafeAreaView>
  )
}

export default ArkzenScreen_Kotoba_Index
