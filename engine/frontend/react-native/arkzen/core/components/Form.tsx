// ============================================================
// ARKZEN ENGINE — NATIVE UTILITY COMPONENTS v1.0
// NativeWind equivalents of web-core/components/utils.tsx
// Badge, Avatar, EmptyState, Loading, Pagination, Field, Form
// ============================================================

import React from 'react'
import { View, Text, ActivityIndicator } from 'react-native'
import { FolderOpen } from 'lucide-react-native'

// ─────────────────────────────────────────────
// BADGE
// ─────────────────────────────────────────────

export interface BadgeProps {
  label:    string
  variant?: 'default' | 'success' | 'error' | 'warning' | 'info' | 'neutral'
  size?:    'sm' | 'md'
  dot?:     boolean
  renderContent?: (label: string) => React.ReactNode
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
  <View className={`flex-row items-center gap-1.5 rounded-full ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'} ${badgeVariants[variant]}`}>
    {dot && <View className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />}
    {renderContent ? renderContent(label) : (
      <Text className={`font-medium ${size === 'sm' ? 'text-xs' : 'text-sm'} ${badgeTextVariants[variant]}`}>{label}</Text>
    )}
  </View>
)

// ─────────────────────────────────────────────
// AVATAR
// ─────────────────────────────────────────────

export interface AvatarProps {
  name?: string
  src?:  string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  renderFallback?: (initials: string) => React.ReactNode
}

const avatarSizes  = { sm: 'w-7 h-7', md: 'w-9 h-9', lg: 'w-12 h-12', xl: 'w-16 h-16' }
const avatarTextSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base', xl: 'text-lg' }
const avatarColors = ['bg-violet-100','bg-blue-100','bg-emerald-100','bg-amber-100','bg-rose-100']

export const Avatar: React.FC<AvatarProps> = ({ name, size = 'md', renderFallback }) => {
  const initials = name ? name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() : '?'
  const colorIdx = name ? name.charCodeAt(0) % avatarColors.length : 0

  if (renderFallback) return <>{renderFallback(initials)}</>

  return (
    <View className={`${avatarSizes[size]} rounded-full items-center justify-center ${avatarColors[colorIdx]}`}>
      <Text className={`font-semibold ${avatarTextSizes[size]}`}>{initials}</Text>
    </View>
  )
}

// ─────────────────────────────────────────────
// EMPTY STATE
// ─────────────────────────────────────────────

export interface EmptyStateProps {
  title:        string
  description?: string
  action?:      React.ReactNode
  icon?:        React.ReactNode
  renderIcon?:    () => React.ReactNode
  renderTitle?:   (title: string) => React.ReactNode
  renderContent?: (title: string, description?: string) => React.ReactNode
}

export const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action, icon, renderIcon, renderTitle, renderContent }) => (
  <View className="items-center justify-center py-12 px-4">
    <View className="w-14 h-14 rounded-2xl bg-neutral-100 items-center justify-center mb-4">
      {renderIcon ? renderIcon() : (icon ?? <FolderOpen size={24} color="#a3a3a3" />)}
    </View>
    {renderContent ? renderContent(title, description) : (
      <View className="items-center">
        {renderTitle ? renderTitle(title) : (
          <Text className="text-sm font-semibold text-neutral-900 mb-1">{title}</Text>
        )}
        {description && <Text className="text-sm text-neutral-500 text-center max-w-xs">{description}</Text>}
      </View>
    )}
    {action && <View className="mt-4">{action}</View>}
  </View>
)

// ─────────────────────────────────────────────
// LOADING
// ─────────────────────────────────────────────

export interface LoadingProps {
  size?:     'small' | 'large'
  label?:    string
  fullPage?: boolean
  renderSpinner?: () => React.ReactNode
}

export const Loading: React.FC<LoadingProps> = ({ size = 'large', label, fullPage = false, renderSpinner }) => {
  const inner = (
    <View className="items-center gap-3">
      {renderSpinner ? renderSpinner() : <ActivityIndicator size={size} color="#a3a3a3" />}
      {label && <Text className="text-sm text-neutral-500">{label}</Text>}
    </View>
  )

  if (fullPage) return (
    <View className="absolute inset-0 items-center justify-center bg-white/80 z-50">
      {inner}
    </View>
  )

  return <View className="items-center justify-center p-8">{inner}</View>
}

// ─────────────────────────────────────────────
// FORM + FIELD
// ─────────────────────────────────────────────

export interface FieldProps {
  label:     string
  error?:    string
  required?: boolean
  hint?:     string
  children:  React.ReactNode
  renderLabel?: (label: string, required?: boolean) => React.ReactNode
  renderError?: (error: string) => React.ReactNode
}

export const Field: React.FC<FieldProps> = ({ label, error, required, hint, children, renderLabel, renderError }) => (
  <View className="gap-1.5">
    {renderLabel ? renderLabel(label, required) : (
      <Text className="text-sm font-medium text-neutral-700">
        {label}{required && <Text className="text-red-500"> *</Text>}
      </Text>
    )}
    {children}
    {hint && !error && <Text className="text-xs text-neutral-400">{hint}</Text>}
    {error && (renderError ? renderError(error) : <Text className="text-xs text-red-500">{error}</Text>)}
  </View>
)

export interface FormProps {
  onSubmit:   () => void
  children:   React.ReactNode
  className?: string
  renderSubmit?: (onSubmit: () => void) => React.ReactNode
}

export const Form: React.FC<FormProps> = ({ onSubmit, children, className, renderSubmit }) => (
  <View className={className}>
    {children}
    {renderSubmit ? renderSubmit(onSubmit) : null}
  </View>
)
