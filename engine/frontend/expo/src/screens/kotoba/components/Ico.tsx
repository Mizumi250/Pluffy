// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Ico [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.735Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'

// Icons are lucide SVGs addressed by a short key (the same keys circles and lessons store).
export const Ico = ({ n, size = 20, color, fill }: { n?: string | null; size?: number; color?: string; fill?: boolean }) => {
  const map: Record<string, any> = {
    'flame': Flame, 'wifi-off': WifiOff, 'handshake': Handshake, 'pen-line': PenLine, 'users': Users, 'globe': Globe, 'brain': Brain,
    'compass': Compass, 'graduation-cap': GraduationCap, 'target': Target, 'book-open': BookOpen, 'party-popper': PartyPopper, 'layers': Layers,
    'medal': Medal, 'check': Check, 'trending-up': TrendingUp, 'message-circle': MessageCircle, 'lightbulb': Lightbulb, 'calendar': CalendarDays,
    'sprout': Sprout, 'star': Star, 'file-text': FileText, 'book': Book, 'home': Home, 'newspaper': Newspaper, 'user': User, 'heart': Heart,
    'hand': Hand, 'pencil': Pencil, 'sun': Sun, 'flower': Flower2, 'coffee': Coffee, 'headphones': Headphones, 'gamepad': Gamepad2,
    'utensils': Utensils, 'trophy': Trophy, 'clock': Clock, 'history': History, 'close': X,
  }
  const C = (n && map[n]) || Sparkles
  const c = color ?? TH.text
  return <C size={size} color={c} strokeWidth={1.7} fill={fill ? c : 'none'} />
}

// Brand mark: an SVG served online (Iconify), not a bundled asset.
