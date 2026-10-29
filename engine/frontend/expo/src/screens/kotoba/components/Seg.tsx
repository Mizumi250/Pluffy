// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Seg [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:10.731Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import { usePathname, useRouter } from 'expo-router'
import { Book, BookOpen, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Layers, Lightbulb, Medal, MessageCircle, Newspaper, PartyPopper, PenLine, Pencil, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, WifiOff, X } from 'lucide-react-native'
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, RefreshControl, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { SvgUri } from 'react-native-svg'
import { TH } from './constants'

export const Seg = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
    <View style={{ flexDirection: 'row', backgroundColor: TH.fill, borderRadius: 999, padding: 4 }}>
      {options.map(o => (
        <TouchableOpacity key={o.value} accessibilityRole="tab" accessibilityState={{ selected: value === o.value }} onPress={() => onChange(o.value)}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: value === o.value ? TH.blue : 'transparent' }}>
          <Text style={{ fontWeight: value === o.value ? '700' : '500', fontSize: 14, color: value === o.value ? TH.card : TH.text }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
)
