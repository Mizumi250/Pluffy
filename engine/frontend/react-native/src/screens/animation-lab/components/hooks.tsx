// ARKZEN GENERATED — animation-lab/components/hooks
// DO NOT EDIT

import React from 'react'
import { StyleSheet } from 'react-native'
import { create } from 'zustand'
import type { AnimLabState } from './types'

export const useAnimLabStore = create<AnimLabState>((set) => ({
  activeSection: 'entrance',
  setActiveSection: (s) => set({ activeSection: s }),
  playingDemo: null,
  setPlayingDemo: (id) => set({ playingDemo: id }),
  resetKey: 0,
  triggerReset: () => set((s) => ({ resetKey: s.resetKey + 1 })),
}))
