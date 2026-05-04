// ============================================================
// ARKZEN — GuestLayout (React Native)
// For login/register screens.
// Redirects to dashboard if already authed.
// ============================================================

import React, { useEffect } from 'react'
import {
  View,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useArkzenNativeAuth } from '@/hooks/useArkzenNativeAuth'

interface GuestLayoutProps {
  children:       React.ReactNode
  tatSlug:        string
  dashboardRoute: string   // e.g. 'my-app/dashboard'
}

export function GuestLayout({ children, tatSlug, dashboardRoute }: GuestLayoutProps) {
  const navigation = useNavigation()
  const { isAuthed, isLoading } = useArkzenNativeAuth(tatSlug)

  useEffect(() => {
    if (!isLoading && isAuthed) {
      navigation.navigate(dashboardRoute as never)
    }
  }, [isLoading, isAuthed, dashboardRoute])

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.inner}>
          {children}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  flex: {
    flex: 1,
  },
  inner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
})