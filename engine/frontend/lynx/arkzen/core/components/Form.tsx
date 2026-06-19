// ============================================================
// ARKZEN ENGINE — LYNX UTILITY COMPONENTS v2.0
// Lynx equivalents of native-core/components/Form.tsx
// Badge, Avatar, EmptyState, Loading, Field, Form
//
// Styling: Tailwind CSS v3 via rsbuild-plugin-tailwindcss +
// @lynx-js/tailwind-preset (see config/lynx.config.ts +
// config/tailwind.config.ts). className works the same way
// as web/NativeWind once that plugin is wired in.
//
// NO react-native, NO expo-router, NO @expo/vector-icons,
// NO react-native-reanimated.
// Primitives: <view>, <text> from @lynx-js/react.
// ============================================================

import React from '@lynx-js/react'

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

export interface BadgeProps {
  label:    string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?:    'sm' | 'md'
  dot?:     boolean
  renderContent?: (label: string) => any
}

const badgeVariants = {
  default: 'bg-neutral-100',
  success: 'bg-emerald-50',
  error:   'bg-red-50',
  warning: 'bg-amber-50',
  info:    'bg-blue-50',
  neutral: 'bg-neutral-100',
}
const badgeTextVariants = {
  default: 'text-neutral-700',
  success: 'text-emerald-700',
  error:   'text-red-700',
  warning: 'text-amber-700',
  info:    'text-blue-700',
  neutral: 'text-neutral-600',
}
const dotColors = {
  default: 'bg-neutral-400', success: 'bg-emerald-500', error: 'bg-red-500',
  warning: 'bg-amber-500', info: 'bg-blue-500', neutral: 'bg-neutral-400',
}

export const Badge: React.FC<BadgeProps> = ({ label, variant = 'default', size = 'sm', dot = false, renderContent }) => (
  <view className={`flex-row items-center gap-1.5 rounded-full ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'} ${badgeVariants[variant]}`}>
    {dot && <view className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
    {renderContent ? renderContent(label) : (
      <text className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} ${badgeTextVariants[variant]}`}>{label}</text>
    )}
  </view>
)

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────

export interface AvatarProps {
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  renderFallback?: (initials: string) => any
}

const avatarSizes      = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12', xl: 'w-16 h-16' }
const avatarTextSizes  = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }
const avatarColors = ['bg-violet-100', 'bg-blue-100', 'bg-emerald-100', 'bg-amber-100', 'bg-rose-100']

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', renderFallback }) => {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  const colorIdx = name ? name.charCodeAt(0) % avatarColors.length : 0

  if (renderFallback) return <>{renderFallback(initials)}</>

  return (
    <view className={`${avatarSizes[size]} rounded-full items-center justify-center ${avatarColors[colorIdx]}`}>
      <text className={`font-semibold ${avatarTextSizes[size]}`}>{initials}</text>
    </view>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

export interface EmptyStateProps {
  title:        string
  description?: string
  action?:      any
  icon?:        any
  renderIcon?:    () => any
  renderTitle?:   (title: string) => any
  renderContent?: (title: string, description?: string) => any
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon, renderIcon, renderTitle, renderContent }) => (
  <view className="items-center justify-center py-12 px-4">
    <view className="w-14 h-14 rounded-2xl bg-neutral-100 items-center justify-center mb-4">
      {renderIcon ? renderIcon() : (icon ?? <text className="text-2xl text-neutral-400">📂</text>)}
    </view>
    {renderContent ? renderContent(title, description) : (
      <view className="items-center">
        {renderTitle ? renderTitle(title) : (
          <text className="text-sm font-semibold text-neutral-900 mb-1">{title}</text>
        )}
        {description && <text className="text-sm text-neutral-500 text-center max-w-xs">{description}</text>}
      </view>
    )}
    {action && <view className="mt-4">{action}</view>}
  </view>
)

// ─────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────

export interface LoadingProps {
  size?:     'small' | 'large'
  label?:    string
  fullPage?: boolean
  renderSpinner?: () => any
}

export const Loading: React.FC<LoadingProps> = ({ label, fullPage = false, renderSpinner }) => {
  const inner = (
    <view className="items-center gap-3">
      {renderSpinner ? renderSpinner() : <text className="text-2xl text-neutral-400">⏳</text>}
      {label && <text className="text-sm text-neutral-500">{label}</text>}
    </view>
  )

  if (fullPage) return (
    <view className="absolute inset-0 items-center justify-center bg-white/80 z-50">
      {inner}
    </view>
  )

  return <view className="items-center justify-center p-8">{inner}</view>
}

// ─────────────────────────────────────────────
// FORM + FIELD
// ─────────────────────────────────────────────

export interface FieldProps {
  label:     string
  error?:    string
  required?: boolean
  hint?:     string
  children:  any
  renderLabel?: (label: string, required?: boolean) => any
  renderError?: (error: string) => any
}

export const Field: React.FC<FieldProps> = ({ label, error, required, hint, children, renderLabel, renderError }) => (
  <view className="gap-1.5">
    {renderLabel ? renderLabel(label, required) : (
      <text className="text-sm font-medium text-neutral-700">
        {label}{required && <text className="text-red-500"> *</text>}
      </text>
    )}
    {children}
    {hint && !error && <text className="text-xs text-neutral-400">{hint}</text>}
    {error && (renderError ? renderError(error) : <text className="text-xs text-red-500">{error}</text>)}
  </view>
)

export interface FormProps {
  onSubmit:   () => void
  children:   any
  className?: string
  renderSubmit?: (onSubmit: () => void) => any
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className, renderSubmit }) => (
  <view className={className}>
    {children}
    {renderSubmit ? renderSubmit(onSubmit) : null}
  </view>
)
