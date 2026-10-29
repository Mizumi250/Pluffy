// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Bar [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.741Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'
import { toast } from './utils'
import { Screen } from './Screen'

export const Bar = ({ value, max, color = TH.blue }: { value: number; max: number; color?: string }) => (
  <View style={{ height: 8, borderRadius: 4, backgroundColor: TH.fill, overflow: 'hidden' }}><View style={{ height: 8, borderRadius: 4, width: `${Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))}%`, backgroundColor: color }} /></View>
)

// Realtime socket + toast host. Mounted once per screen through <Screen/>; the socket is shared and ref-counted so it
// connects once per session no matter how many screens are in the stack.
