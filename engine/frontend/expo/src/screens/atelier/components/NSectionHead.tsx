// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — NSectionHead [Expo]
// Source: @arkzen:native:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:38.548Z
// ============================================================

import React, { useCallback, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../arkzen/core/stores/authStore'
import { useRouter } from 'expo-router'
import { Dimensions, FlatList, Image, Pressable, RefreshControl, ScrollView, StatusBar, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { C } from './constants'

// Section header row
export const NSectionHead = ({ title, onMore }: { title: string; onMore?: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{title}</Text>
    {onMore && (
      <Pressable onPress={onMore}>
        <Text style={{ fontSize: 12, color: C.muted }}>See all</Text>
      </Pressable>
    )}
  </View>
)
 
// Bottom tab bar
