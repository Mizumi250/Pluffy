// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Diff [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.748Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'
import { diffText } from './utils'

export const Diff = ({ from, to, size = 15 }: { from: string; to: string; size?: number }) => (
  <Text style={{ fontSize: size, color: TH.text, lineHeight: size * 1.5 }}>
    {diffText(from, to).map((p, i) => <Text key={i} style={p.t === 'del' ? { color: TH.red, textDecorationLine: 'line-through', backgroundColor: 'rgba(155, 59, 52, 0.14)' } : p.t === 'add' ? { color: '#3f6b4f', fontWeight: '700', backgroundColor: 'rgba(63, 107, 79, 0.2)' } : undefined}>{p.s}</Text>)}
  </Text>
)
