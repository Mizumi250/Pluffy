// ============================================================
// ARKZEN EXPO SCREEN — errors-test/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React, { useState } from 'react'
import { useRouter } from 'expo-router'
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native'


const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type NativeErrorDef = {
  code:    number
  title:   string
  message: string
  color:   string
  bg:      string
  border:  string
}

const NATIVE_ERRORS: NativeErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request.',               color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-100'  },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this.',                    color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100'    },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource.',         color: 'text-orange-700',  bg: 'bg-orange-50',  border: 'border-orange-100'  },
  { code: 404, title: 'Not Found',           message: 'The resource you are looking for does not exist.',            color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-100' },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource.', color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100'  },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid.',                          color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-100'    },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Wait before trying again.',  color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100'   },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end.',                            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100'     },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance.',         color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-100'   },
]

// Shared native error screen — used by +not-found.tsx, error-boundary, and index
export const NativeErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const router = useRouter()
  const err = NATIVE_ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: 'text-neutral-700',
    bg:    'bg-neutral-50',
    border: 'border-neutral-100',
  }

  return (
    <View className={`flex-1 items-center justify-center px-8 ${err.bg}`}>
      <Text className={`text-8xl font-black mb-2 ${err.color}`}>{err.code}</Text>
      <Text className="text-xl font-bold text-neutral-900 mb-3">{err.title}</Text>
      <Text className="text-sm text-neutral-500 text-center leading-6 mb-10">{err.message}</Text>
      <View className="flex-row gap-x-3">
        {reset && (
          <TouchableOpacity
            onPress={reset}
            activeOpacity={0.8}
            className="bg-neutral-900 px-6 py-3 rounded-2xl"
          >
            <Text className="text-white text-sm font-semibold">Try again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={() => router.replace('/' as any)}
          activeOpacity={0.8}
          className="border border-neutral-200 bg-white px-6 py-3 rounded-2xl"
        >
          <Text className="text-neutral-600 text-sm font-medium">Home</Text>
        </TouchableOpacity>
      </View>
      <Text className="mt-10 text-xs text-neutral-300">Error {err.code}</Text>
    </View>
  )
}

// ── Result banner ─────────────────────────────────────────────
const ResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
  if (!result) return null
  const err = NATIVE_ERRORS.find(e => e.code === result.code)
  return (
    <View className={`mx-4 mt-3 p-4 rounded-2xl border ${err ? err.border + ' ' + err.bg : 'bg-neutral-50 border-neutral-100'}`}>
      <Text className={`text-xs font-semibold mb-1 ${err ? err.color : 'text-neutral-600'}`}>
        HTTP {result.code}{err ? ` — ${err.title}` : ''}
      </Text>
      <Text className="text-xs text-neutral-500 font-mono" numberOfLines={4}>{result.body}</Text>
    </View>
  )
}

const NativeServerErrorScreen = ({ reset }: { reset: () => void }) => <NativeErrorScreen code={500} reset={reset} />

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true }
  }

  reset = () => this.setState({ hasError: false })

  render() {
    if (this.state.hasError) {
      return <NativeServerErrorScreen reset={this.reset} />
    }
    return this.props.children
  }
}

export default ErrorBoundary
