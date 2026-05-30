/* @arkzen:meta
name: upload-test
version: 1.0.0
description: Tests file uploads — single file, multiple files, image preview, download, delete. Backend stores in storage/app/public/arkzen/upload-test/.
auth: false
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 4000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:database:uploaded_files
table: uploaded_files
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  user_id:
    type: integer
    nullable: true
  original_name:
    type: string
  stored_name:
    type: string
  mime_type:
    type: string
  size_bytes:
    type: integer
  disk_path:
    type: string
  is_image:
    type: boolean
timestamps: true
*/

/* @arkzen:api:uploaded_files
model: UploadedFile
controller: UploadedFileController
prefix: /api/upload-test
middleware: []
endpoints:
  index:
    method: GET
    route: /files
    description: List all uploaded files
    type: upload_index
    response:
      type: collection
  store:
    method: POST
    route: /files
    description: Upload one or more files
    type: upload
    validation:
      files: required|array
      files.*: file|max:10240
    response:
      type: collection
  destroy:
    method: DELETE
    route: /files/{id}
    description: Delete a file
    type: upload_destroy
    response:
      type: message
      value: File deleted
  fileUrl:
    method: GET
    route: /files/{id}/url
    description: Get public URL or download for a file
    type: upload_url
    response:
      type: single
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { CloudUpload, FileArchive, FileText, FileVideo, Folder, ImageIcon, Upload } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

/* @arkzen:web:components:shared:end */



/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:guest */
const DashboardPage = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [files, setFiles]       = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError]       = useState<string | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  const loadFiles = async () => {
    try {
      const res = await arkzenFetch('/api/upload-test/files')
      const d   = await res.json()
      setFiles(d.data ?? [])
    } catch {}
  }

  useEffect(() => { loadFiles() }, [])

  const upload = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return
    setUploading(true)
    setError(null)
    setProgress(0)

    const formData = new FormData()
    Array.from(fileList).forEach(f => formData.append('files[]', f))

    try {
      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/upload-test/files')
      xhr.setRequestHeader('Accept', 'application/json')

      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }

      await new Promise<void>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else {
            try { reject(new Error(JSON.parse(xhr.responseText)?.message ?? 'Upload failed')) }
            catch { reject(new Error(`Upload failed (${xhr.status})`)) }
          }
        }
        xhr.onerror = () => reject(new Error('Network error during upload'))
        xhr.send(formData)
      })

      await loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
      setProgress(0)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const deleteFile = async (id: number) => {
    setDeleting(id)
    try {
      await arkzenFetch(`/api/upload-test/files/${id}`, { method: 'DELETE' })
      setFiles(prev => prev.filter(f => f.id !== id))
    } catch {} finally {
      setDeleting(null)
    }
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1048576).toFixed(1)} MB`
  }

  const fileIcon = (mime: string) => {
    if (mime.startsWith('image/')) return <ImageIcon size={18} className="text-emerald-600" />
    if (mime.includes('pdf')) return <FileText size={18} className="text-sky-600" />
    if (mime.includes('zip') || mime.includes('rar')) return <FileArchive size={18} className="text-amber-600" />
    if (mime.includes('video/')) return <FileVideo size={18} className="text-violet-600" />
    return <Folder size={18} className="text-neutral-500" />
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><Upload size={20} /> Upload Test</h1>
            <p className="text-sm text-neutral-500 mt-1">Run <code>php artisan storage:link</code> to enable public URLs.</p>
          </div>
          
        </div>

        {/* Drop zone */}
        <div
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-colors cursor-pointer
            ${dragOver ? 'border-neutral-900 bg-neutral-50' : 'border-neutral-200 hover:border-neutral-400'}`}
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={e => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files) }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={e => upload(e.target.files)}
          />
          <div className="text-3xl mb-2 flex justify-center"><CloudUpload size={28} className="text-neutral-500" /></div>
          <div className="text-sm font-medium text-neutral-700">Drop files here or click to browse</div>
          <div className="text-xs text-neutral-400 mt-1">Any file type. Max 10MB each.</div>

          {uploading && (
            <div className="mt-4">
              <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="text-xs text-neutral-500 mt-1">{progress}% uploaded</div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600">{error}</div>
        )}

        {/* File list */}
        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="font-semibold">Uploaded files ({files.length})</h2>
            <button className="text-xs text-neutral-400" onClick={loadFiles}>Refresh</button>
          </div>
          {files.length === 0 ? (
            <div className="p-8 text-center text-sm text-neutral-400">No files uploaded yet.</div>
          ) : (
            <div className="divide-y divide-neutral-50">
              {files.map(f => (
                <div key={f.id} className="px-5 py-3 flex items-center gap-3">
                  <span className="text-xl shrink-0">{fileIcon(f.mime_type)}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{f.original_name}</div>
                    <div className="text-xs text-neutral-400">{formatSize(f.size_bytes)} · {f.mime_type}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {f.is_image && f.url && (
                      <a href={f.url} target="_blank" rel="noopener" className="text-xs text-blue-500 hover:underline">View</a>
                    )}
                    <a href={`/api/upload-test/files/${f.id}/url`} className="text-xs text-neutral-500 hover:underline">Download</a>
                    <button
                      className="text-xs text-red-400 hover:text-red-600"
                      onClick={() => deleteFile(f.id)}
                      disabled={deleting === f.id}
                    >
                      {deleting === f.id ? '...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-4">
          <strong>Backend stores files at:</strong> <code>storage/app/public/arkzen/upload-test/</code><br/>
          <strong>Access via:</strong> <code>/storage/arkzen/upload-test/filename</code><br/>
          <strong>Upload progress</strong> uses XHR instead of fetch — XHR supports <code>onprogress</code>, fetch does not.
        </div>
      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* @arkzen:native:components:shared */

import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import * as DocumentPicker from 'expo-document-picker'
import { Image } from 'expo-image'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'

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

/* @arkzen:native:components:shared:end */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:default */

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

/* @arkzen:native:page:dashboard:end */
