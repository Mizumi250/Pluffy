// ============================================================
// ARKZEN GENERATED NATIVE UTILITIES — animation-lab [Expo]
// Source: @arkzen:native:components (animation-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:11:24.623Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { Play, RotateCcw } from 'lucide-react-native'
import { MotiText, MotiView } from 'moti'
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import Animated, { Easing, Extrapolation, cancelAnimation, interpolate, runOnJS, useAnimatedStyle, useSharedValue, withDelay, withRepeat, withSequence, withSpring, withTiming } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'

// ─── SHARED STYLES ────────────────────────────────────────────────────────────
export const nativeStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#09090b',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#a78bfa',
  },
  headerSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  navScroll: {
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  navScrollContent: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginRight: 4,
  },
  navTabActive: {
    borderBottomColor: '#a78bfa',
  },
  navTabIcon: {
    fontSize: 13,
    marginRight: 5,
  },
  navTabLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  navTabLabelActive: {
    color: 'white',
  },
  sectionScroll: {
    flex: 1,
  },
  sectionBottomPad: {
    height: 40,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    margin: 16,
    marginBottom: 12,
  },
  sectionHeaderIcon: {
    width: 36,
    height: 36,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: 'white',
    marginBottom: 2,
  },
  sectionHeaderSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
  demoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  demoCard: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    width: '46%',
    margin: '2%',
  },
  demoCardFull: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    borderRadius: 14,
    overflow: 'hidden',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  demoCardHeader: {
    padding: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  demoCardTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: 'rgba(255,255,255,0.9)',
  },
  demoCardDesc: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.35)',
    marginTop: 2,
  },
  demoCardStage: {
    padding: 18,
    paddingVertical: 14,
    minHeight: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animBox: {
    width: 56,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  animBoxLabel: {
    fontWeight: '700',
    fontSize: 9,
    color: 'white',
  },
  animPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 24,
  },
  animPillLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  animCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  gestureTarget: {
    width: 90,
    height: 56,
    borderRadius: 10,
  },
  playBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#6366f1',
  },
  playBtnLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    marginLeft: 6,
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  resetBtnLabel: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 11,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  staggerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tlStage: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#1e293b',
    width: '100%',
  },
  tlTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: 'white',
  },
  tlDotsRow: {
    flexDirection: 'row',
  },
  tlDot: {
    fontSize: 18,
    color: '#a78bfa',
    marginHorizontal: 4,
  },
  tlBarWrap: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  tlBarFill: {
    height: 8,
    borderRadius: 4,
  },
  tlBadge: {
    backgroundColor: '#a78bfa',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 5,
  },
  tlBadgeLabel: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  waveRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 50,
  },
})
