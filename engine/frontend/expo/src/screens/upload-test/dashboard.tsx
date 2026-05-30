// ============================================================
// ARKZEN GENERATED SCREEN — upload-test/dashboard
// ============================================================

import React, { useCallback, useEffect, useState } from 'react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import * as ImagePicker from 'expo-image-picker'
import { ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native'

import { useRouter } from 'expo-router'

import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

// Shared components (from @arkzen:native:components:*)
const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1048576).toFixed(1)} MB`
}

const FileMime = ({ mime }: { mime: string }) => {
  const label = mime.startsWith('image/') ? '🖼️'
    : mime.includes('pdf')               ? '📄'
    : mime.includes('video')             ? '🎬'
    : mime.includes('zip') || mime.includes('rar') ? '🗜️'
    : '📁'
  return <Text className="text-xl">{label}</Text>
}

// User screen (from @arkzen:native:page:dashboard)
const DashboardScreen = () => {
  const [files, setFiles]         = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [error, setError]         = useState<string | null>(null)

  const loadFiles = useCallback(async () => {
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/upload-test/files`)
      const d   = await res.json()
      setFiles(d.data ?? [])
    } catch {
      setError('Failed to load files')
    }
  }, [])

  useEffect(() => { loadFiles() }, [])

  const uploadFile = async (uri: string, name: string, type: string) => {
    setUploading(true)
    setError(null)
    try {
      const formData = new FormData()
      formData.append('files[]', { uri, name, type } as any)

      const res = await fetch(`${BACKEND_URL}/api/upload-test/files`, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    formData,
      })
      if (!res.ok) {
        const d = await res.json().catch(() => ({}))
        throw new Error(d.message ?? `Upload failed (${res.status})`)
      }
      await loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const pickImage = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!perm.granted) { Alert.alert('Permission needed', 'Allow access to your photo library.'); return }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images', 'videos'],
      quality: 0.85,
    })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      const name  = asset.fileName ?? `photo_${Date.now()}.jpg`
      const type  = asset.mimeType ?? 'image/jpeg'
      await uploadFile(asset.uri, name, type)
    }
  }

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', copyToCacheDirectory: true })
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0]
      await uploadFile(asset.uri, asset.name, asset.mimeType ?? 'application/octet-stream')
    }
  }

  const deleteFile = async (id: number) => {
    setDeleting(id)
    try {
      await arkzenFetch(`${BACKEND_URL}/api/upload-test/files/${id}`, { method: 'DELETE' })
      setFiles(prev => prev.filter(f => f.id !== id))
    } catch {
      setError('Delete failed')
    } finally {
      setDeleting(null)
    }
  }

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <Text className="text-base font-semibold text-neutral-900">📤 Upload Test</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">Pick images or documents to upload</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ padding: 16, gap: 12 }}>

        {/* Upload buttons */}
        <View className="flex-row gap-3">
          <TouchableOpacity
            onPress={pickImage}
            disabled={uploading}
            className="flex-1 bg-neutral-900 rounded-2xl py-3.5 items-center"
          >
            {uploading
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text className="text-white text-sm font-semibold">🖼️  Photo / Video</Text>
            }
          </TouchableOpacity>
          <TouchableOpacity
            onPress={pickDocument}
            disabled={uploading}
            className="flex-1 bg-white border border-neutral-200 rounded-2xl py-3.5 items-center"
          >
            <Text className="text-neutral-800 text-sm font-semibold">📁  Document</Text>
          </TouchableOpacity>
        </View>

        {error && (
          <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
            <Text className="text-xs text-red-600">{error}</Text>
          </View>
        )}

        {/* File list */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-3 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="text-sm font-semibold text-neutral-900">Files ({files.length})</Text>
            <TouchableOpacity onPress={loadFiles}>
              <Text className="text-xs text-neutral-400">Refresh</Text>
            </TouchableOpacity>
          </View>

          {files.length === 0 ? (
            <View className="p-8 items-center">
              <Text className="text-sm text-neutral-400">No files uploaded yet.</Text>
            </View>
          ) : (
            files.map((f, i) => (
              <View
                key={f.id}
                className={`px-5 py-3 flex-row items-center gap-3 ${i < files.length - 1 ? 'border-b border-neutral-50' : ''}`}
              >
                {f.is_image && f.url ? (
                  <Image
                    source={{ uri: f.url }}
                    style={{ width: 36, height: 36, borderRadius: 8 }}
                    contentFit="cover"
                  />
                ) : (
                  <FileMime mime={f.mime_type} />
                )}

                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-medium text-neutral-900" numberOfLines={1}>{f.original_name}</Text>
                  <Text className="text-xs text-neutral-400">{formatSize(f.size_bytes)} · {f.mime_type}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => deleteFile(f.id)}
                  disabled={deleting === f.id}
                >
                  {deleting === f.id
                    ? <ActivityIndicator size="small" color="#f87171" />
                    : <Text className="text-xs text-red-400">Delete</Text>
                  }
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>

        {/* Info */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-mono leading-5">
            backend: /api/upload-test/files{'\n'}
            storage: storage/app/public/arkzen/upload-test/
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

// Engine wrapper
export function ArkzenScreen_UploadTest_Dashboard() {
  const router = useRouter()
  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <DashboardScreen />
      </ScrollView>
      
    </SafeAreaView>
  )
}

export default ArkzenScreen_UploadTest_Dashboard
