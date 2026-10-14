// ARKZEN GENERATED — upload-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T07:33:16.899Z
import { BACKEND_URL } from './components/constants'
import { formatSize, getMimeIcon } from './components/utils'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'
import { openURL, pickFiles } from '../../../arkzen/core/native-bridge'

/* @arkzen:native:page:layout:guest */

import { useState, useCallback, useEffect } from '@lynx-js/react'

const DashboardLynxPage = () => {
  const [files, setFiles] = useState<any[]>([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [viewingImage, setViewingImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const loadFiles = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/upload-test/files')
      const d = await res.json()
      setFiles(d.data ?? [])
    } catch {
      setError('Failed to load files')
    }
  }, [])

  useEffect(() => { loadFiles() }, [])

  // Lynx has no FileList/File or XMLHttpRequest progress events.
  // Selection goes through the native picker; each picked item is
  // {uri, name, size, mimeType} and is appended RN/Lynx-fetch style.
  const pickAndUpload = async () => {
    const picked = await pickFiles({ multiple: true })
    if (picked.length === 0) return

    setUploading(true)
    setError(null)

    const formData = new FormData()
    picked.forEach(f => {
      formData.append('files[]', { uri: f.uri, name: f.name, type: f.mimeType } as any)
    })

    try {
      const res = await fetch('/api/upload-test/files', {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData,
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message ?? 'Upload failed')
      }
      await loadFiles()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed')
    } finally {
      setUploading(false)
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

  return (
    <scroll-view className="min-h-screen bg-neutral-50">
      <view className="p-8">
        <view className="max-w-2xl mx-auto" style={{ gap: 24 }}>

          {/* Header */}
          <view className="flex-row items-center justify-between">
            <view>
              <text className="text-2xl font-bold">📤 Upload Test</text>
              <text className="text-sm text-neutral-500 mt-1">Run php artisan storage:link</text>
            </view>
          </view>

          {/* Upload area with file input */}
          <view className="border-2 border-dashed rounded-2xl p-10 text-center border-neutral-200">
            <text className="text-3xl mb-2">☁️</text>
            <text className="text-sm font-medium text-neutral-700">Click to select files</text>
            <text className="text-xs text-neutral-400 mt-1">Max 10MB each</text>
            <view bindtap={pickAndUpload} className="mt-4 px-4 py-2 bg-neutral-900 rounded-lg inline-block">
              <text className="text-xs text-white font-medium">Select files</text>
            </view>
            {uploading && (
              <view className="mt-4">
                <text className="text-xs text-neutral-500">Uploading...</text>
              </view>
            )}
          </view>

          {error && (
            <view className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <text className="text-sm text-red-600">{error}</text>
            </view>
          )}

          {/* File list */}
          <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
            <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
              <text className="font-semibold">Uploaded files ({files.length})</text>
              <view bindtap={loadFiles}>
                <text className="text-xs text-neutral-400">Refresh</text>
              </view>
            </view>

            {files.length === 0 ? (
              <view className="p-8 items-center">
                <text className="text-sm text-neutral-400">No files uploaded yet.</text>
              </view>
            ) : (
              files.map((f) => (
                <view key={f.id} className="px-5 py-3 flex-row items-center gap-3 border-b border-neutral-50">
                  <text className="text-xl shrink-0">{getMimeIcon(f.mime_type)}</text>
                  <view className="flex-1 min-w-0">
                    <text className="text-sm font-medium truncate">{f.original_name}</text>
                    <text className="text-xs text-neutral-400">{formatSize(f.size_bytes)} · {f.mime_type}</text>
                  </view>
                  <view className="flex-row items-center gap-2 shrink-0">
                    {f.is_image && f.url && (
                      <view bindtap={() => setViewingImage(f.url)}>
                        <text className="text-xs text-blue-500">View</text>
                      </view>
                    )}
                    <view bindtap={() => openURL(`${BACKEND_URL}/api/upload-test/files/${f.id}/url`)}>
                      <text className="text-xs text-neutral-500">Download</text>
                    </view>
                    <view bindtap={() => deleteFile(f.id)}>
                      <text className="text-xs text-red-400">{deleting === f.id ? '...' : 'Delete'}</text>
                    </view>
                  </view>
                </view>
              ))
            )}
          </view>

          {/* Info */}
          <view className="bg-neutral-100 rounded-2xl px-4 py-3">
            <text className="text-xs text-neutral-500 font-mono leading-5">
              backend: /api/upload-test/files{'\n'}
              storage: storage/app/public/arkzen/upload-test/
            </text>
          </view>

        </view>
      </view>

      {/* Image preview modal — simplified for Lynx */}
      {viewingImage && (
        <view className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <view className="absolute top-4 right-4" bindtap={() => setViewingImage(null)}>
            <text className="text-white text-2xl">✕</text>
          </view>
          <image src={viewingImage} className="max-w-4xl max-h-screen object-contain" />
        </view>
      )}
    </scroll-view>
  )
}

export const UploadTestDashboard = DashboardLynxPage;
