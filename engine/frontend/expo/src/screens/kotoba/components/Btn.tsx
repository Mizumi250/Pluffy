// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Btn [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.729Z
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

export const Btn = ({ label, onPress, kind = 'fill', disabled, small, style, icon, iconFilled }: { label: string; onPress: () => void; kind?: 'primary' | 'tint' | 'fill' | 'danger' | 'ghost'; disabled?: boolean; small?: boolean; style?: any; icon?: string; iconFilled?: boolean }) => {
  const bg = kind === 'primary' ? TH.blue : kind === 'fill' ? TH.fill : 'transparent'
  const fg = kind === 'primary' ? TH.card : kind === 'danger' ? TH.red : TH.text
  const ring = kind === 'tint' ? TH.text : kind === 'danger' ? TH.red : 'transparent'
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} disabled={disabled} activeOpacity={0.8} onPress={onPress}
      style={[{ height: small ? 36 : 50, paddingHorizontal: small ? 16 : 24, borderRadius: 999, backgroundColor: bg, borderWidth: 1.5, borderColor: ring, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }, style]}>
      {icon ? <Ico n={icon} size={small ? 15 : 18} color={fg} fill={iconFilled} /> : null}
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 14 : 16 }}>{label}</Text>
    </TouchableOpacity>
  )
}
