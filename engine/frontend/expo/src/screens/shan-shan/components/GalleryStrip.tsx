// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — GalleryStrip [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T08:12:40.880Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { width } from './utils'

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
