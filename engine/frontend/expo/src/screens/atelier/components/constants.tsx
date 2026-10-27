// ============================================================
// ARKZEN GENERATED NATIVE CONSTANTS — atelier [Expo]
// Source: @arkzen:native:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:25.067Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'


export const SCREEN_W = Dimensions.get('window').width
 
// ── Design tokens ─────────────────────────────────────────────────────────────

// ── Design tokens ─────────────────────────────────────────────────────────────
export const C = {
  bg:       '#0e0d0c',
  surface:  '#1a1917',
  surface2: '#242220',
  gold:     '#c4a882',
  goldDim:  '#a08560',
  text:     '#f0ece4',
  textDim:  '#b5a898',
  muted:    '#6b6560',
  green:    '#86c795',
  blue:     '#64a0dc',
  border:   'rgba(196,168,130,0.1)',
  borderMid:'rgba(196,168,130,0.18)',
}
 
// ── Shared data (mirrors web) ──────────────────────────────────────────────────

// ── Shared data (mirrors web) ──────────────────────────────────────────────────
export const N_USER = {
  name: 'Mizu', handle: '@mizu_art', role: 'Artist',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
}

export const N_CONTINUATIONS = [
  { id: 1, title: 'Eclipse Project',     artist: 'Mizu',  handle: '@mizu_art', thumb: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=600&h=360&fit=crop', progress: 73, version: 4, lastUpdate: '2h ago', witnesses: 23, note: 'Working on light and atmosphere.', tags: ['Digital', 'Space'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
  { id: 2, title: 'Aurora Illustration', artist: 'Mizu',  handle: '@mizu_art', thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=360&fit=crop', progress: 48, version: 2, lastUpdate: '1d ago', witnesses: 8,  note: 'Exploring aurora colors.',         tags: ['Watercolor'],     avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
  { id: 3, title: 'Character Design',   artist: 'Daro',  handle: '@daro_env', thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=360&fit=crop', progress: 62, version: 3, lastUpdate: '34m ago', witnesses: 14, note: 'Refining the silhouette.',          tags: ['Character'],      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
]

export const N_SPACES = [
  { id: 1, name: 'Environment Artists', members: '1.2K', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=120&fit=crop', joined: true },
  { id: 2, name: 'VTuber Hub',          members: '860',  thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=120&fit=crop', joined: true },
  { id: 3, name: 'Storyboard Artists',  members: '642',  thumb: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=120&fit=crop', joined: false },
  { id: 4, name: 'Anime Artists',       members: '1.8K', thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=120&fit=crop', joined: false },
]

export const N_PEOPLE = [
  { name: 'Daro',  handle: '@daro_env',  role: 'Environment Artist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', online: true },
  { name: 'Ash',   handle: '@ash_illus', role: 'Illustrator',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', online: false },
  { name: 'Reiko', handle: '@reiko_art', role: 'Character Designer',  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', online: true },
]

export const N_LIVE = [
  { artist: 'Daro',  type: 'Environment Painting', viewers: 23, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=160&fit=crop' },
  { artist: 'Reiko', type: 'Character Sketching',  viewers: 18, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=160&fit=crop' },
]

export const N_MESSAGES = [
  { id: 1, from: 'Daro',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=36&h=36&fit=crop&crop=face', text: 'The atmosphere is amazing!', time: '2m', own: false },
  { id: 2, from: 'Reiko', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=36&h=36&fit=crop&crop=face', text: 'Love the lighting', time: '1m', own: false },
  { id: 3, from: 'Mizu',  avatar: N_USER.avatar, text: "It's custom", time: '58s', own: true },
]
 
// ── Shared native components ───────────────────────────────────────────────────
 
// Small pill badge
