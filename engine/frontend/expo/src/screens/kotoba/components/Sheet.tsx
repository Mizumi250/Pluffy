// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Sheet [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:59:07.097Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { TH } from './constants'

export const Sheet = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      <View style={{ backgroundColor: TH.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, maxHeight: '90%', paddingTop: 10 }}>
        <View style={{ alignSelf: 'center', width: 38, height: 5, borderRadius: 3, backgroundColor: TH.line, marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>{title}</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 16, color: TH.sub }}>✕</Text></TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 36, gap: 14 }}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
)
