// ============================================================
// ARKZEN ENGINE — LYNX MODAL COMPONENT v2.0
// Lynx equivalent of native-core/components/Modal.tsx
//
// Styling: Tailwind className (rsbuild-plugin-tailwindcss).
// NO react-native Modal, NO react-native-reanimated,
// NO @expo/vector-icons.
// Uses @lynx-js/react primitives: <view>, <text>.
// Animation: Lynx supports CSS transitions/keyframes via
// the bundled Tailwind preset — use `animate-*` utility
// classes (configured in tailwind.config.ts) instead of
// react-native-reanimated's enter/exit props.
// ============================================================

import { type FC, useState, useEffect } from '@lynx-js/react'

export interface NativeModalProps {
  open:            boolean
  onClose:         () => void
  children:        any

  title?:          string
  description?:    string
  size?:           'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?:      boolean
  closeOnBackdrop?: boolean
  animation?:      'fadeScale' | 'slideUp' | 'slideDown' | 'fade'

  renderHeader?:   (onClose: () => void) => any
  renderFooter?:   (onClose: () => void) => any
  panelClassName?: string
  backdropClassName?: string
  className?:      string
}

const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'w-full mx-4',
}

const enterAnimMap = {
  fadeScale: 'animate-in fade-in zoom-in-95 duration-200',
  slideUp:   'animate-in slide-in-from-bottom duration-200',
  slideDown: 'animate-in slide-in-from-top duration-200',
  fade:      'animate-in fade-in duration-200',
}

export const NativeModal: FC<NativeModalProps> = ({
  open,
  onClose,
  title,
  description,
  children,
  size = 'md',
  showClose = true,
  closeOnBackdrop = true,
  animation = 'fadeScale',
  renderHeader,
  renderFooter,
  panelClassName = '',
  backdropClassName = '',
  className = '',
}) => {
  const [visible, setVisible] = useState(open)

  useEffect(() => {
    if (open) setVisible(true)
  }, [open])

  if (!visible) return null

  const defaultHeader = (title || showClose) ? (
    <view className="flex-row items-start justify-between px-6 pt-6 pb-4">
      <view className="flex-1">
        {title && (
          <text className="text-lg font-semibold text-neutral-900 leading-tight">
            {title}
          </text>
        )}
        {description && (
          <text className="mt-1 text-sm text-neutral-500">
            {description}
          </text>
        )}
      </view>
      {showClose && (
        <view bindtap={onClose} className="ml-4 p-1.5 rounded-lg">
          <text className="text-base text-neutral-500">✕</text>
        </view>
      )}
    </view>
  ) : null

  return (
    <view className={`fixed inset-0 z-50 items-center justify-center p-4 ${className}`}>
      {/* Backdrop */}
      <view
        bindtap={closeOnBackdrop ? onClose : undefined}
        className={`absolute inset-0 bg-black/40 animate-in fade-in duration-200 ${backdropClassName}`}
      />

      {/* Panel */}
      <view className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl ${enterAnimMap[animation]} ${panelClassName}`}>
        {/* Header */}
        {renderHeader ? renderHeader(onClose) : defaultHeader}

        {/* Body */}
        <view className={`px-6 ${title || renderHeader ? 'pb-6' : 'py-6'}`}>
          {children}
        </view>

        {/* Footer */}
        {renderFooter && (
          <view className="px-6 pb-6">
            {renderFooter(onClose)}
          </view>
        )}
      </view>
    </view>
  )
}

export const Modal = NativeModal
