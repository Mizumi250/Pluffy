// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — FileMime [Expo]
// Source: @arkzen:native:components (upload-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:40:31.716Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Sharing from 'expo-sharing'
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'

export const FileMime = ({ mime }: { mime: string }) => {
  const label = mime.startsWith('image/') ? '🖼️'
    : mime.includes('pdf')               ? '📄'
    : mime.includes('video')             ? '🎬'
    : mime.includes('zip') || mime.includes('rar') ? '🗜️'
    : '📁'
  return <Text className="text-xl">{label}</Text>
}

const { width: SW, height: SH } = Dimensions.get('window')
