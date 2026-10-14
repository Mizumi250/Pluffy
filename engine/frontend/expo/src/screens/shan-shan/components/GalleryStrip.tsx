// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GalleryStrip [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:43:21.239Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, ScrollView, StatusBar, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { SCREEN_W } from './constants'

// ─── GALLERY STRIP ────────────────────────────────────────────────────────────

export const GalleryStrip = ({ images }: { images: any[] }) => (
  <ScrollView
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ gap: 2, paddingHorizontal: 0 }}
  >
    {images.map((img, i) => (
      <Image
        key={i}
        source={img}
        style={{ width: SCREEN_W * 0.72, height: 200 }}
        resizeMode="cover"
      />
    ))}
  </ScrollView>
)

// ─── SKILL BAR ────────────────────────────────────────────────────────────────
