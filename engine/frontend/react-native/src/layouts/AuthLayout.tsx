// ============================================================
// ARKZEN — AuthLayout (React Native)
// Wraps protected screens.
// Checks token — redirects to login if not authed.
// ============================================================

import React, { useEffect } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useArkzenNativeAuth } from '@/hooks/useArkzenNativeAuth'

interface AuthLayoutProps {
  children:  React.ReactNode
  tatSlug:   string
  loginRoute: string   // e.g. 'my-app/login'
}

export function AuthLayout({ children, tatSlug, loginRoute }: AuthLayoutProps) {
  const navigation = useNavigation()
  const { user, isLoading, isAuthed, logout } = useArkzenNativeAuth(tatSlug)

  useEffect(() => {
    if (!isLoading && !isAuthed) {
      navigation.navigate(loginRoute as never)
    }
  }, [isLoading, isAuthed, loginRoute])

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="small" color="#aaa" />
        <Text style={styles.loadingText}>Checking auth...</Text>
      </SafeAreaView>
    )
  }

  if (!isAuthed) return null

  return (
    <SafeAreaView style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Text style={styles.appName}>Arkzen</Text>
        <View style={styles.topBarRight}>
          {user && (
            <Text style={styles.userEmail} numberOfLines={1}>{user.email}</Text>
          )}
          <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen content */}
      <View style={styles.content}>
        {children}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f0',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#aaa',
    fontFamily: 'System',
  },
  topBar: {
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  appName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  userEmail: {
    fontSize: 12,
    color: '#888',
    maxWidth: 140,
  },
  logoutBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
  },
  logoutText: {
    fontSize: 12,
    color: '#555',
  },
  content: {
    flex: 1,
  },
})