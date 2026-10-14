// ============================================================
// ARKZEN ENGINE — NATIVE MODAL COMPONENT v1.0
// NativeWind equivalent of web-core/components/Modal.tsx
// Uses react-native-reanimated instead of framer-motion.
// Uses React Native Modal + NativeWind for styling.
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity, Modal as RNModal, Pressable } from 'react-native'
import Animated, { FadeIn, FadeOut, SlideInDown, SlideOutDown } from 'react-native-reanimated'
import { X } from 'lucide-react-native'

export interface NativeModalProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode

  title?: string
  description?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  showClose?: boolean
  closeOnBackdrop?: boolean
  animation?: 'fadeScale' | 'slideUp' | 'slideDown' | 'fade'

  renderHeader?: (onClose: () => void) => React.ReactNode
  renderFooter?: (onClose: () => void) => React.ReactNode
  panelClassName?: string
  backdropClassName?: string
  className?: string
}

const sizeMap = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'w-full mx-4',
}

export const NativeModal: React.FC<NativeModalProps> = ({
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
  const enteringAnim = animation === 'slideUp'
    ? SlideInDown.springify().damping(15)
    : animation === 'fade'
    ? FadeIn.duration(200)
    : FadeIn.duration(200)

  const exitingAnim = animation === 'slideUp'
    ? SlideOutDown.duration(200)
    : animation === 'fade'
    ? FadeOut.duration(200)
    : FadeOut.duration(200)

  const defaultHeader = (title || showClose) ? (
    <View className="flex-row items-start justify-between px-6 pt-6 pb-4">
      <View className="flex-1">
        {title && (
          <Text className="text-lg font-semibold text-neutral-900 leading-tight">
            {title}
          </Text>
        )}
        {description && (
          <Text className="mt-1 text-sm text-neutral-500">
            {description}
          </Text>
        )}
      </View>
      {showClose && (
        <TouchableOpacity
          onPress={onClose}
          className="ml-4 p-1.5 rounded-lg"
        >
          <X size={18} color="#737373" />
        </TouchableOpacity>
      )}
    </View>
  ) : null

  return (
    <RNModal
      visible={open}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View className={`flex-1 items-center justify-center p-4 ${className}`}>
        {/* Backdrop */}
        <Animated.View
          entering={FadeIn.duration(200)}
          exiting={FadeOut.duration(200)}
          className={`absolute inset-0 bg-black/40 ${backdropClassName}`}
        >
          {closeOnBackdrop && (
            <Pressable className="flex-1" onPress={onClose} />
          )}
        </Animated.View>

        {/* Panel */}
        <Animated.View
          entering={enteringAnim}
          exiting={exitingAnim}
          className={`relative w-full ${sizeMap[size]} bg-white rounded-2xl shadow-2xl ${panelClassName}`}
        >
          {/* Header */}
          {renderHeader ? renderHeader(onClose) : defaultHeader}

          {/* Body */}
          <View className={`px-6 ${title || renderHeader ? 'pb-6' : 'py-6'}`}>
            {children}
          </View>

          {/* Footer */}
          {renderFooter && (
            <View className="px-6 pb-6">
              {renderFooter(onClose)}
            </View>
          )}
        </Animated.View>
      </View>
    </RNModal>
  )
}

export const Modal = NativeModal
