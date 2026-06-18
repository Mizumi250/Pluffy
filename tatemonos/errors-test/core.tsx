/* @arkzen:meta
name: errors-test
version: 1.2.0
description: Tests real HTTP error handlers. Next.js segment-scoped not-found.tsx and error.tsx. API codes trigger toasts via arkzenFetch interceptor.
auth: false
*/

/* @arkzen:web:config
layout:
  guest:
    className: "min-h-screen"
*/

/* @arkzen:routes
controller: SimulateController
middleware: []
routes:
  - method: GET
    route: /api/errors-test/simulate/{code}
    handler: simulate
*/

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'

type ErrorDef = {
  code: number
  title: string
  message: string
  action?: { label: string; href: string }
  color: string
  bg: string
  border: string
  btnColor: string
}

const ERRORS: ErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request. Check the data you sent and try again.',         color: 'text-yellow-700',  bg: 'bg-yellow-50',  border: 'border-yellow-100', btnColor: 'bg-yellow-700 hover:bg-yellow-800',  action: { label: 'Go back',      href: 'javascript:history.back()' } },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this. Please log in and try again.',                        color: 'text-blue-700',    bg: 'bg-blue-50',    border: 'border-blue-100',   btnColor: 'bg-blue-700 hover:bg-blue-800',      action: { label: 'Sign in',      href: '/auth-test/login' } },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource. Contact an admin if you think this is wrong.', color: 'text-orange-700', bg: 'bg-orange-50', border: 'border-orange-100', btnColor: 'bg-orange-700 hover:bg-orange-800', action: { label: 'Go home',      href: '/' } },
  { code: 404, title: 'Not Found',           message: 'The page or resource you are looking for does not exist or has been moved.',                   color: 'text-neutral-700', bg: 'bg-neutral-50', border: 'border-neutral-100', btnColor: 'bg-neutral-900 hover:bg-neutral-700', action: { label: 'Go home',     href: '/' } },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource. Refresh and try again.',           color: 'text-purple-700',  bg: 'bg-purple-50',  border: 'border-purple-100', btnColor: 'bg-purple-700 hover:bg-purple-800',  action: { label: 'Refresh',      href: 'javascript:location.reload()' } },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid. Please check your input and try again.',                    color: 'text-pink-700',    bg: 'bg-pink-50',    border: 'border-pink-100',   btnColor: 'bg-pink-700 hover:bg-pink-800',      action: { label: 'Go back',      href: 'javascript:history.back()' } },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Please wait a moment before trying again.',                   color: 'text-amber-700',   bg: 'bg-amber-50',   border: 'border-amber-100',  btnColor: 'bg-amber-700 hover:bg-amber-800',    action: { label: 'Wait & retry', href: 'javascript:location.reload()' } },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end. We have been notified. Please try again shortly.',            color: 'text-red-700',     bg: 'bg-red-50',     border: 'border-red-100',    btnColor: 'bg-red-700 hover:bg-red-800',        action: { label: 'Try again',    href: 'javascript:location.reload()' } },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance. We will be back soon.',                    color: 'text-slate-700',   bg: 'bg-slate-50',   border: 'border-slate-100',  btnColor: 'bg-slate-700 hover:bg-slate-800',    action: { label: 'Refresh',      href: 'javascript:location.reload()' } },
]

export const ErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const err = ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: 'text-neutral-700',
    bg: 'bg-neutral-50',
    border: 'border-neutral-100',
    btnColor: 'bg-neutral-900 hover:bg-neutral-700',
    action: { label: 'Go home', href: '/' },
  }

  const primaryHref  = reset ? undefined : err.action?.href
  const primaryLabel = reset ? 'Try again' : err.action?.label

  return (
    <div className={'min-h-screen flex items-center justify-center ' + err.bg + ' px-4'}>
      <div className="text-center max-w-md w-full">
        <div className={'text-8xl font-black tracking-tight mb-2 ' + err.color}>{err.code}</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">{err.title}</h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-10">{err.message}</p>
        <div className="flex items-center justify-center gap-3">
          {primaryLabel && (
            reset ? (
              <button
                onClick={reset}
                className={'text-sm font-medium text-white px-6 py-2.5 rounded-xl transition-colors ' + err.btnColor}
              >
                {primaryLabel}
              </button>
            ) : (
              <a
                href={primaryHref}
                className={'text-sm font-medium text-white px-6 py-2.5 rounded-xl transition-colors ' + err.btnColor}
              >
                {primaryLabel}
              </a>
            )
          )}
          <a
            href="/"
            className="text-sm font-medium text-neutral-600 bg-white px-6 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            Home
          </a>
        </div>
        <p className="mt-10 text-xs text-neutral-300">Error {err.code}</p>
      </div>
    </div>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  const [simulating, setSimulating] = useState<number | null>(null)
  const [result, setResult] = useState<{ code: number; body: string } | null>(null)
  const { toast } = useToast()

  const API_CODES  = [400, 401, 403, 409, 422, 429, 503]
  const NEXT_CODES = [404, 500]

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await arkzenFetch(`/api/errors-test/simulate/${code}`)
      const text = await res.text()
      setResult({ code: res.status, body: text })
      const err = ERRORS.find(e => e.code === res.status)
      if (err && API_CODES.includes(res.status)) {
        const type = res.status === 429 ? 'warning' as const : res.status === 401 ? 'info' as const : 'error' as const
        toast[type](`${res.status} ${err.title} — ${err.message}`)
      }
    } catch (e) {
      toast.error('Network error — could not reach the server.')
    } finally {
      setSimulating(null)
    }
  }

  const triggerCrash = () => { throw new Error('Intentional crash to trigger error.tsx') }

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-2xl mx-auto space-y-8">

        <div>
          <h1 className="text-2xl font-bold text-neutral-900">Error Handler Test</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Verify all 9 error codes. Next.js handlers are triggered for real — no fake preview pages.
            API codes fire toasts via the arkzenFetch interceptor.
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            Next.js Segment Handlers
          </h2>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-neutral-900">404</span>
                <span className="text-sm text-neutral-600">Not Found</span>
                <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">not-found.tsx</code>
              </div>
              <p className="text-xs text-neutral-400">Navigate to any non-existent route under /errors-test/ to trigger the real handler.</p>
            </div>
            <a
              href="/errors-test/trigger-not-found"
              className="shrink-0 text-xs font-medium bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition-colors"
            >
              Trigger
            </a>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-base font-bold text-neutral-900">500</span>
                <span className="text-sm text-neutral-600">Server Error</span>
                <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">error.tsx</code>
              </div>
              <p className="text-xs text-neutral-400">Throws a runtime error in this component to trigger the real error boundary.</p>
            </div>
            <button
              onClick={triggerCrash}
              className="shrink-0 text-xs font-medium bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors"
            >
              Trigger
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
            API Response Codes — Toast
          </h2>
          {ERRORS.filter(e => API_CODES.includes(e.code)).map(err => (
            <div key={err.code} className="bg-white rounded-2xl border border-neutral-100 p-5 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={'text-base font-bold ' + err.color}>{err.code}</span>
                  <span className="text-sm text-neutral-600">{err.title}</span>
                  <code className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded-lg">toast</code>
                </div>
                <p className="text-xs text-neutral-400 max-w-sm">{err.message}</p>
              </div>
              <button
                onClick={() => simulate(err.code)}
                disabled={simulating === err.code}
                className="shrink-0 text-xs font-medium bg-neutral-900 text-white px-4 py-2 rounded-xl hover:bg-neutral-700 transition-colors disabled:opacity-40"
              >
                {simulating === err.code ? '...' : 'Simulate'}
              </button>
            </div>
          ))}
        </div>

        {result && (
          <div className="bg-white rounded-2xl border border-neutral-100 p-5">
            <p className="text-xs font-medium text-neutral-500 mb-2">Last API response — HTTP {result.code}</p>
            <pre className="text-xs text-neutral-400 bg-neutral-50 rounded-xl p-3 overflow-x-auto">{result.body}</pre>
          </div>
        )}

      </div>
    </div>
  )
}
/* @arkzen:web:page:index:end */

/* @arkzen:web:error:404 */
const NotFoundPage = () => <ErrorScreen code={404} />
/* @arkzen:web:error:404:end */

/* @arkzen:web:error:500 */
const ServerErrorPage = ({ reset }: { reset: () => void }) => <ErrorScreen code={500} reset={reset} />
/* @arkzen:web:error:500:end */


/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from 'react-native'
import { useRouter } from '@react-navigation/native'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

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

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:default */

const IndexScreen = () => {
  const router = useRouter()
  const [simulating,   setSimulating]   = useState<number | null>(null)
  const [result,       setResult]       = useState<{ code: number; body: string } | null>(null)
  const [shouldCrash,  setShouldCrash]  = useState(false)

  if (shouldCrash) throw new Error('Intentional crash to trigger error-boundary')

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/errors-test/simulate/${code}`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      setResult({ code: res.status, body: text })
    } catch (e) {
      setResult({ code: 0, body: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setSimulating(null)
    }
  }

  const triggerCrash = () => setShouldCrash(true)

  const API_CODES = [400, 401, 403, 409, 422, 429, 503]

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4">
        <Text className="text-base font-semibold text-neutral-900">⚠️ Error Handler Test</Text>
        <Text className="text-xs text-neutral-400 mt-0.5">
          Simulate all 9 HTTP error codes against the API
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >

        <ResultBanner result={result} />

        {/* Router error handlers */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100">
            <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              Router Handlers
            </Text>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between border-b border-neutral-50">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-x-2 mb-0.5">
                <Text className="text-sm font-bold text-neutral-700">404</Text>
                <Text className="text-sm text-neutral-700">Not Found</Text>
              </View>
              <Text className="text-xs text-neutral-400">Navigates to a non-existent route</Text>
            </View>
            <TouchableOpacity
              onPress={() => router.push('/errors-test/fake-route' as any)}
              activeOpacity={0.7}
              className="px-4 py-2 rounded-xl items-center bg-neutral-900"
            >
              <Text className="text-white text-xs font-semibold">Trigger</Text>
            </TouchableOpacity>
          </View>

          <View className="px-5 py-4 flex-row items-center justify-between">
            <View className="flex-1 mr-4">
              <View className="flex-row items-center gap-x-2 mb-0.5">
                <Text className="text-sm font-bold text-red-700">500</Text>
                <Text className="text-sm text-neutral-700">Server Error</Text>
              </View>
              <Text className="text-xs text-neutral-400">Crashes the component to trigger error boundary</Text>
            </View>
            <TouchableOpacity
              onPress={triggerCrash}
              activeOpacity={0.7}
              className="px-4 py-2 rounded-xl items-center bg-red-600"
            >
              <Text className="text-white text-xs font-semibold">Trigger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API simulate codes */}
        <View className="mx-4 mt-4 bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <View className="px-5 py-4 border-b border-neutral-100">
            <Text className="text-xs font-semibold uppercase tracking-widest text-neutral-400">
              API Response Codes
            </Text>
          </View>

          {NATIVE_ERRORS.filter(e => API_CODES.includes(e.code)).map((err, i) => (
            <View
              key={err.code}
              className={`px-5 py-4 flex-row items-center justify-between ${
                i < API_CODES.length - 1 ? 'border-b border-neutral-50' : ''
              }`}
            >
              <View className="flex-1 mr-4">
                <View className="flex-row items-center gap-x-2 mb-0.5">
                  <Text className={`text-sm font-bold ${err.color}`}>{err.code}</Text>
                  <Text className="text-sm text-neutral-700">{err.title}</Text>
                </View>
                <Text className="text-xs text-neutral-400" numberOfLines={1}>{err.message}</Text>
              </View>

              <TouchableOpacity
                onPress={() => simulate(err.code)}
                disabled={simulating === err.code}
                activeOpacity={0.7}
                className={`px-4 py-2 rounded-xl items-center ${
                  simulating === err.code ? 'bg-neutral-200' : 'bg-neutral-900'
                }`}
              >
                {simulating === err.code
                  ? <ActivityIndicator size="small" color="#737373" />
                  : <Text className="text-white text-xs font-semibold">Simulate</Text>
                }
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:index:end */


/* @arkzen:native:error:404 */

/* @arkzen:import:expo */
const NativeNotFoundScreen = () => <NativeErrorScreen code={404} />
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
const NativeNotFoundScreen = () => <NativeErrorScreen code={404} />
/* @arkzen:import:rn:end */

/* @arkzen:native:error:404:end */

/* @arkzen:native:error:500 */

/* @arkzen:import:expo */
const NativeServerErrorScreen = ({ reset }: { reset: () => void }) => <NativeErrorScreen code={500} reset={reset} />
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
const NativeServerErrorScreen = ({ reset }: { reset: () => void }) => <NativeErrorScreen code={500} reset={reset} />
/* @arkzen:import:rn:end */

/* @arkzen:native:error:500:end */


/* @arkzen:native:components:lynx:shared */

import { View, Text, TouchableOpacity, ScrollView } from '@lynx-js/react'
import { useState } from '@lynx-js/react'

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type LynxErrorDef = {
  code:    number
  title:   string
  message: string
  color:   string
  bg:      string
}

const LYNX_ERRORS: LynxErrorDef[] = [
  { code: 400, title: 'Bad Request',         message: 'The server could not understand your request.',               color: '#a16207', bg: '#fefce8' },
  { code: 401, title: 'Unauthorized',        message: 'You need to be signed in to access this.',                    color: '#1d4ed8', bg: '#eff6ff' },
  { code: 403, title: 'Forbidden',           message: 'You do not have permission to access this resource.',         color: '#c2410c', bg: '#fff7ed' },
  { code: 404, title: 'Not Found',           message: 'The resource you are looking for does not exist.',            color: '#404040', bg: '#fafafa' },
  { code: 409, title: 'Conflict',            message: 'A conflict occurred with the current state of the resource.', color: '#7e22ce', bg: '#faf5ff' },
  { code: 422, title: 'Validation Error',    message: 'The data you submitted is invalid.',                          color: '#be185d', bg: '#fdf2f8' },
  { code: 429, title: 'Too Many Requests',   message: 'You have made too many requests. Wait before trying again.',  color: '#b45309', bg: '#fffbeb' },
  { code: 500, title: 'Server Error',        message: 'Something went wrong on our end.',                            color: '#b91c1c', bg: '#fef2f2' },
  { code: 503, title: 'Service Unavailable', message: 'The service is temporarily offline for maintenance.',         color: '#334155', bg: '#f8fafc' },
]

export const LynxErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const err = LYNX_ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: '#404040',
    bg: '#fafafa',
  }

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, backgroundColor: err.bg }}>
      <Text style={{ fontSize: 80, fontWeight: '900', color: err.color, marginBottom: 8 }}>{err.code}</Text>
      <Text style={{ fontSize: 20, fontWeight: '700', color: '#171717', marginBottom: 12 }}>{err.title}</Text>
      <Text style={{ fontSize: 13, color: '#737373', textAlign: 'center', lineHeight: 22, marginBottom: 40 }}>{err.message}</Text>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {reset && (
          <TouchableOpacity
            onPress={reset}
            style={{ backgroundColor: '#171717', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
          >
            <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Try again</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={{ borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 16 }}
        >
          <Text style={{ color: '#525252', fontSize: 13, fontWeight: '500' }}>Home</Text>
        </TouchableOpacity>
      </View>
      <Text style={{ marginTop: 40, fontSize: 11, color: '#d4d4d4' }}>Error {err.code}</Text>
    </View>
  )
}

const LynxResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
  if (!result) return null
  const err = LYNX_ERRORS.find(e => e.code === result.code)
  return (
    <View style={{ marginHorizontal: 16, marginTop: 12, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#e5e5e5', backgroundColor: err?.bg ?? '#fafafa' }}>
      <Text style={{ fontSize: 11, fontWeight: '600', color: err?.color ?? '#525252', marginBottom: 4 }}>
        HTTP {result.code}{err ? ` — ${err.title}` : ''}
      </Text>
      <Text style={{ fontSize: 11, color: '#737373', fontFamily: 'monospace' }} numberOfLines={4}>{result.body}</Text>
    </View>
  )
}

/* @arkzen:native:components:lynx:shared:end */


/* @arkzen:native:page:lynx:index */

const IndexScreen = () => {
  const [simulating,  setSimulating]  = useState<number | null>(null)
  const [result,      setResult]      = useState<{ code: number; body: string } | null>(null)
  const [shouldCrash, setShouldCrash] = useState(false)

  if (shouldCrash) throw new Error('Intentional crash to trigger error boundary')

  const simulate = async (code: number) => {
    setSimulating(code)
    setResult(null)
    try {
      const res  = await fetch(`${BACKEND_URL}/api/errors-test/simulate/${code}`, {
        headers: { Accept: 'application/json' },
      })
      const text = await res.text()
      setResult({ code: res.status, body: text })
    } catch (e) {
      setResult({ code: 0, body: e instanceof Error ? e.message : 'Network error' })
    } finally {
      setSimulating(null)
    }
  }

  const API_CODES = [400, 401, 403, 409, 422, 429, 503]

  return (
    <View style={{ flex: 1, backgroundColor: '#fafafa' }}>

      {/* Header */}
      <View style={{ backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f5f5f5', paddingHorizontal: 20, paddingVertical: 16 }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: '#171717' }}>⚠️ Error Handler Test</Text>
        <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Simulate all 9 HTTP error codes against the API</Text>
      </View>

      <ScrollView style={{ flex: 1 }}>

        <LynxResultBanner result={result} />

        {/* Router handlers */}
        <View style={{ marginHorizontal: 16, marginTop: 16, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, color: '#a3a3a3' }}>ROUTER HANDLERS</Text>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: 1, borderBottomColor: '#fafafa' }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#404040' }}>404 — Not Found</Text>
              <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Navigates to a non-existent route</Text>
            </View>
            <TouchableOpacity style={{ backgroundColor: '#171717', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}>
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Trigger</Text>
            </TouchableOpacity>
          </View>

          <View style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flex: 1, marginRight: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: '700', color: '#b91c1c' }}>500 — Server Error</Text>
              <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }}>Crashes the component to trigger error boundary</Text>
            </View>
            <TouchableOpacity
              onPress={() => setShouldCrash(true)}
              style={{ backgroundColor: '#dc2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
            >
              <Text style={{ color: '#fff', fontSize: 11, fontWeight: '600' }}>Trigger</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* API codes */}
        <View style={{ marginHorizontal: 16, marginTop: 16, marginBottom: 32, backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: '#f5f5f5', overflow: 'hidden' }}>
          <View style={{ paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' }}>
            <Text style={{ fontSize: 10, fontWeight: '600', letterSpacing: 1, color: '#a3a3a3' }}>API RESPONSE CODES</Text>
          </View>

          {LYNX_ERRORS.filter(e => API_CODES.includes(e.code)).map((err, i) => (
            <View
              key={err.code}
              style={{ paddingHorizontal: 20, paddingVertical: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderBottomWidth: i < API_CODES.length - 1 ? 1 : 0, borderBottomColor: '#fafafa' }}
            >
              <View style={{ flex: 1, marginRight: 16 }}>
                <Text style={{ fontSize: 13, fontWeight: '700', color: err.color }}>{err.code} — {err.title}</Text>
                <Text style={{ fontSize: 11, color: '#a3a3a3', marginTop: 2 }} numberOfLines={1}>{err.message}</Text>
              </View>
              <TouchableOpacity
                onPress={() => simulate(err.code)}
                disabled={simulating === err.code}
                style={{ backgroundColor: simulating === err.code ? '#d4d4d4' : '#171717', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 12 }}
              >
                <Text style={{ color: simulating === err.code ? '#737373' : '#fff', fontSize: 11, fontWeight: '600' }}>
                  {simulating === err.code ? '...' : 'Simulate'}
                </Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:lynx:index:end */


/* @arkzen:native:error:404:lynx */
const LynxNotFoundScreen = () => <LynxErrorScreen code={404} />
/* @arkzen:native:error:404:lynx:end */

/* @arkzen:native:error:500:lynx */
const LynxServerErrorScreen = ({ reset }: { reset: () => void }) => <LynxErrorScreen code={500} reset={reset} />
/* @arkzen:native:error:500:lynx:end */