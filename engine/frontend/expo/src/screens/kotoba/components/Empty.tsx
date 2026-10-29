// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Empty [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.738Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'
import { Ico } from './Ico'

export const Empty = ({ icon, title, text, children }: { icon?: string; title: string; text?: string; children?: React.ReactNode }) => (
  <View style={{ alignItems: 'center', padding: 32, gap: 6 }}>
    <Ico n={icon ?? 'sprout'} size={34} />
    <Text style={{ fontSize: 18, fontWeight: '700', color: TH.text, textAlign: 'center' }}>{title}</Text>
    {text && <Text style={{ color: TH.sub, textAlign: 'center', fontSize: 15, lineHeight: 21 }}>{text}</Text>}
    {children && <View style={{ marginTop: 10 }}>{children}</View>}
  </View>
)
