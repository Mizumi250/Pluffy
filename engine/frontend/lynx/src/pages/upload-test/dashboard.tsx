// ARKZEN GENERATED — upload-test/dashboard (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:26:45.854Z
import { BACKEND_URL } from './components/constants'
import { formatSize, getMimeIcon } from './components/utils'

/* @arkzen:native:page:layout:guest */

import { view, text, scrollView, image, input } from '@lynx-js/react'
import React, { useState, useCallback } from '@lynx-js/react'
import { arkzenFetch } from '../../../arkzen/core/stores/authStore'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / 1048576).toFixed(1) + ' MB'
}

const getMimeIcon = (mime) => {
  if (mime.startsWith('image/')) return '🖼️'
  if (mime.includes('pdf')) return '📄'
  if (mime.includes('video')) return '🎬'
  if (mime.includes('zip') || mime.includes('rar')) return '🗜️'
  return '📁'
}

const DashboardLynxPage = () => {
  const [files, setFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [viewingImage, setViewingImage] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  const loadFiles = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/upload-test/files')
      const d = await res.json()
      setFiles(d.data ?? [])
    } catch {
      setError('Failed to load files')
    }
  }, [])

  React.useEffect(() => { loadFiles() }, [])

  const upload = async (fileList) => {
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

      await new Promise((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) resolve()
          else {
            try { reject(new Error(JSON.parse(xhr.responseText)?.message ?? 'Upload failed')) }
            catch { reject(new Error('Upload failed')) }
          }
        }
        xhr.onerror = () => reject(new Error('Network error'))
        xhr.send(formData)
      })

      await loadFiles()
    } catch (e) {
      setError(e.message)
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const deleteFile = async (id) => {
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
        <view className="max-w-2xl mx-auto space-y-6">

          {/* Header */}
          <view className="flex items-center justify-between">
            <view>
              <text className="text-2xl font-bold">📤 Upload Test</text>
              <text className="text-sm text-neutral-500 mt-1">Run php artisan storage:link</text>
            </view>
          </view>

          {/* Upload button - Lynx uses input with type="file" */}
          <view className="border-2 border-dashed rounded-2xl p-10 text-center border-neutral-200">
            <text className="text-3xl mb-2">☁️</text>
            <text className="text-sm font-medium text-neutral-700">Click to select files</text>
            <text className="text-xs text-neutral-400 mt-1">Max 10MB each</text>
            <input
              type="file"
              multiple
              className="mt-4"
              onChange={(e) => upload(e.target.files)}
            />

            {uploading && (
              <view className="mt-4">
                <view className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <view className="h-full bg-neutral-900 rounded-full" style={{ width: progress + '%' }} />
                </view>
                <text className="text-xs text-neutral-500 mt-1">{progress}% uploaded</text>
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
            <view className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
              <text className="font-semibold">Uploaded files ({files.length})</text>
              <view onTap={loadFiles}>
                <text className="text-xs text-neutral-400">Refresh</text>
              </view>
            </view>

            {files.length === 0 ? (
              <view className="p-8">
                <text className="text-sm text-neutral-400">No files uploaded yet.</text>
              </view>
            ) : (
              files.map((f) => (
                <view key={f.id} className="px-5 py-3 flex items-center gap-3 border-b border-neutral-50">
                  <text className="text-xl shrink-0">{getMimeIcon(f.mime_type)}</text>
                  <view className="flex-1 min-w-0">
                    <text className="text-sm font-medium truncate">{f.original_name}</text>
                    <text className="text-xs text-neutral-400">{formatSize(f.size_bytes)} · {f.mime_type}</text>
                  </view>
                  <view className="flex items-center gap-2 shrink-0">
                    {f.is_image && f.url && (
                      <view onTap={() => setViewingImage(f.url)}>
                        <text className="text-xs text-blue-500">View</text>
                      </view>
                    )}
                    <view onTap={() => window.open(`/api/upload-test/files/${f.id}/url`, '_blank')}>
                      <text className="text-xs text-neutral-500">Download</text>
                    </view>
                    <view onTap={() => deleteFile(f.id)}>
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

      {/* Image preview modal */}
      {viewingImage && (
        <view className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
          <view className="absolute top-4 right-4" onTap={() => setViewingImage(null)}>
            <text className="text-white text-2xl">✕</text>
          </view>
          <image src={viewingImage} className="max-w-4xl max-h-screen object-contain" />
        </view>
      )}
    </scroll-view>
  )
}
