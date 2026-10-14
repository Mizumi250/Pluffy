// ============================================================
// ARKZEN ENGINE — NATIVE TOAST COMPONENT v1.0
// NativeWind equivalent of web-core/components/Toast.tsx
// Uses react-native-reanimated instead of framer-motion.
// Uses @expo/vector-icons instead of lucide-react.
// ============================================================

import React, { createContext, useContext, useState, useCallback, useRef } from 'react'
import { View, Text, TouchableOpacity, Dimensions } from 'react-native'
import Animated, { FadeInUp, FadeOutUp, Layout } from 'react-native-reanimated'
import { AlertCircle, CircleCheck, CircleX, Info, X } from 'lucide-react-native'

type ToastType = 'success' | 'error' | 'warning' | 'info'
type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left'

interface ToastItem {
  id:       string
  type:     ToastType
  message:  string
  duration: number
  onClose?: () => void
}

interface ToastContextValue {
  toast: {
    success: (message: string, duration?: number) => void
    error:   (message: string, duration?: number) => void
    warning: (message: string, duration?: number) => void
    info:    (message: string, duration?: number) => void
  }
}

const ToastContext = createContext<ToastContextValue | null>(null)

const toastConfig = {
  success: { icon: CircleCheck,  bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon_color: '#10b981' },
  error:   { icon: CircleX,      bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     icon_color: '#ef4444' },
  warning: { icon: AlertCircle,  bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   icon_color: '#f59e0b' },
  info:    { icon: Info,         bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800',    icon_color: '#3b82f6' },
}

const positionStyles: Record<ToastPosition, object> = {
  'top-right':    { top: 40, right: 16 },
  'top-left':     { top: 40, left: 16 },
  'top-center':   { top: 40, left: Dimensions.get('window').width / 2 - 160 },
  'bottom-right': { bottom: 40, right: 16 },
  'bottom-left':  { bottom: 40, left: 16 },
}

const DefaultToastItem: React.FC<{ toast: ToastItem; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = toastConfig[toast.type]
  const Icon = config.icon
  return (
    <Animated.View
      entering={FadeInUp.springify().damping(15)}
      exiting={FadeOutUp.duration(150)}
      layout={Layout.springify()}
      className={`flex-row items-start w-80 px-4 py-3.5 rounded-xl border shadow-lg ${config.bg} ${config.border}`}
    >
      <Icon size={18} color={config.icon_color} style={{ marginTop: 2 }} />
      <Text className={`flex-1 text-sm font-medium leading-snug ml-3 ${config.text}`}>{toast.message}</Text>
      <TouchableOpacity onPress={() => onDismiss(toast.id)} style={{ marginTop: 2 }}>
        <X size={14} color={config.icon_color} style={{ opacity: 0.6 }} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export const ToastProvider: React.FC<{
  children:         React.ReactNode
  position?:        ToastPosition
  defaultDuration?: number
  renderToast?:     (toast: ToastItem & { onClose: () => void }) => React.ReactNode
}> = ({ children, position = 'top-right', defaultDuration = 3000, renderToast }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) { clearTimeout(timer); timers.current.delete(id) }
  }, [])

  const add = useCallback((type: ToastType, message: string, duration?: number) => {
    const id  = Math.random().toString(36).slice(2)
    const dur = duration ?? defaultDuration
    setToasts(prev => [...prev, { id, type, message, duration: dur }])
    if (dur > 0) {
      const timer = setTimeout(() => dismiss(id), dur)
      timers.current.set(id, timer)
    }
  }, [defaultDuration, dismiss])

  const toast = {
    success: (msg: string, dur?: number) => add('success', msg, dur),
    error:   (msg: string, dur?: number) => add('error',   msg, dur),
    warning: (msg: string, dur?: number) => add('warning', msg, dur),
    info:    (msg: string, dur?: number) => add('info',    msg, dur),
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <View className="absolute z-50 flex-col gap-2" style={positionStyles[position]}>
        {toasts.map(t =>
          renderToast
            ? <React.Fragment key={t.id}>{renderToast({ ...t, onClose: () => dismiss(t.id) })}</React.Fragment>
            : <DefaultToastItem key={t.id} toast={t} onDismiss={dismiss} />
        )}
      </View>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export const Toast = ToastProvider
