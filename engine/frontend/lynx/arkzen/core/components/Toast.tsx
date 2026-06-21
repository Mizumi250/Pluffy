// ============================================================
// ARKZEN ENGINE — LYNX TOAST COMPONENT v2.0
// Lynx equivalent of native-core/components/Toast.tsx
//
// Styling: Tailwind className (rsbuild-plugin-tailwindcss).
// NO react-native-reanimated, NO @expo/vector-icons,
// NO Dimensions API.
// Uses @lynx-js/react: createContext, useState, useCallback,
// useRef. Position via Tailwind fixed/top/right/etc utilities
// instead of Dimensions.get('window').
// ============================================================

import { type FC, Fragment, createContext, useContext, useState, useCallback, useRef } from '@lynx-js/react'

type ToastType     = 'success' | 'error' | 'warning' | 'info'
type ToastPosition = 'top-right' | 'top-left' | 'top-center' | 'bottom-right' | 'bottom-left'

interface ToastItemData {
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
  success: { icon: '✓', bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  error:   { icon: '✕', bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800' },
  warning: { icon: '⚠', bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800' },
  info:    { icon: 'i', bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800' },
}

const positionClasses: Record<ToastPosition, string> = {
  'top-right':    'top-10 right-4',
  'top-left':     'top-10 left-4',
  'top-center':   'top-10 left-1/2 -translate-x-1/2',
  'bottom-right': 'bottom-10 right-4',
  'bottom-left':  'bottom-10 left-4',
}

const DefaultToastItem: FC<{ toast: ToastItemData; onDismiss: (id: string) => void }> = ({ toast, onDismiss }) => {
  const config = toastConfig[toast.type]
  return (
    <view className={`flex-row items-start w-80 px-4 py-3.5 rounded-xl border shadow-lg mb-2 animate-in fade-in slide-in-from-top-2 duration-200 ${config.bg} ${config.border}`}>
      <text className={`text-sm font-bold mt-0.5 ${config.text}`}>{config.icon}</text>
      <text className={`flex-1 text-sm font-medium leading-snug ml-3 ${config.text}`}>{toast.message}</text>
      <view bindtap={() => onDismiss(toast.id)} className="mt-0.5 ml-2 opacity-60">
        <text className={`text-xs ${config.text}`}>✕</text>
      </view>
    </view>
  )
}

export const ToastProvider: FC<{
  children:         any
  position?:        ToastPosition
  defaultDuration?: number
  renderToast?:     (toast: ToastItemData & { onClose: () => void }) => any
}> = ({ children, position = 'top-right', defaultDuration = 3000, renderToast }) => {
  const [toasts, setToasts] = useState<ToastItemData[]>([])
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
      <view className={`fixed z-50 flex-col ${positionClasses[position]}`}>
        {toasts.map(t =>
          renderToast
            ? <Fragment key={t.id}>{renderToast({ ...t, onClose: () => dismiss(t.id) })}</Fragment>
            : <DefaultToastItem key={t.id} toast={t} onDismiss={dismiss} />
        )}
      </view>
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

export const Toast = ToastProvider
