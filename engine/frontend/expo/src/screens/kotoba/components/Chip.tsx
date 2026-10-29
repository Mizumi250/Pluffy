// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Chip [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.730Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'

export const Chip = ({ label, tone = 'gray', onPress, on }: { label: string; tone?: 'gray' | 'blue' | 'green' | 'orange' | 'purple'; onPress?: () => void; on?: boolean }) => {
  const m: any = { gray: [TH.fill, TH.sub, 'transparent'], blue: [TH.blue, TH.card, 'transparent'], green: ['transparent', TH.green, TH.green], orange: ['transparent', TH.orange, TH.orange], purple: ['transparent', TH.purple, TH.purple] }
  const [bg, fg, ring] = on ? m.blue : m[tone]
  const inner = <View style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: ring, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' }}><Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text></View>
  return onPress ? <TouchableOpacity onPress={onPress} style={{ marginRight: 6, marginBottom: 6 }}>{inner}</TouchableOpacity> : <View style={{ marginRight: 6, marginBottom: 6 }}>{inner}</View>
}
