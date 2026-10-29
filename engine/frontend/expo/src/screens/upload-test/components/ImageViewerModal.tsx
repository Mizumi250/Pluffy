// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — ImageViewerModal [Expo]
// Source: @arkzen:native:components (upload-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:29.135Z
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../../arkzen/core/stores/authStore'
import * as DocumentPicker from 'expo-document-picker'
import * as FileSystem from 'expo-file-system/legacy'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import * as Sharing from 'expo-sharing'
import { ActivityIndicator, Alert, Dimensions, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { SH, SW } from './constants'

export const ImageViewerModal = ({ uri, onClose }: { uri: string; onClose: () => void }) => (
  <Modal visible animationType="fade" transparent statusBarTranslucent onRequestClose={onClose}>
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <TouchableOpacity
        onPress={onClose}
        style={{ position: 'absolute', top: 48, right: 20, zIndex: 10, backgroundColor: 'rgba(0,0,0,0.6)', borderRadius: 20, padding: 8 }}
      >
        <Text style={{ color: '#fff', fontSize: 16 }}>✕</Text>
      </TouchableOpacity>
      <Image source={{ uri }} style={{ width: SW, height: SH }} contentFit="contain" />
    </View>
  </Modal>
)
