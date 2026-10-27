// ============================================================
// ARKZEN GENERATED SCREEN — kotoba/index
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
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
import { InterestPicker } from './components/InterestPicker'
import { LangPicker } from './components/LangPicker'
import { LessonPlayer } from './components/LessonPlayer'
import { OnboardingSheet } from './components/OnboardingSheet'
import { PostCard } from './components/PostCard'
import { ProfileSheet } from './components/ProfileSheet'
import { Screen } from './components/Screen'
import { Seg } from './components/Seg'
import { Sheet } from './components/Sheet'
import { Skel } from './components/Skel'
import { TH } from './components/constants'
import { useNav } from './components/hooks'

// User screen (from @arkzen:native:page:index)
const IndexScreen = () => {
  const nav = useNav()
  return (
    <View style={{ flex: 1, backgroundColor: TH.bg, justifyContent: 'center', padding: 28, gap: 14 }}>
      <View style={{ width: 64, height: 64, borderRadius: 18, backgroundColor: TH.blue, alignItems: 'center', justifyContent: 'center' }}><Text style={{ color: '#fff', fontSize: 30 }}>言</Text></View>
      <Text style={{ fontSize: 42, fontWeight: '800', letterSpacing: -1.2, color: TH.text, lineHeight: 46 }}>Learn by talking, not by tapping.</Text>
      <Text style={{ fontSize: 18, color: TH.sub, lineHeight: 26 }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard.</Text>
      <View style={{ gap: 10, marginTop: 18 }}>
        <Btn kind="primary" label="Create free account" onPress={() => nav.go('register')} />
        <Btn label="I have an account" onPress={() => nav.go('login')} />
      </View>
    </View>
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
