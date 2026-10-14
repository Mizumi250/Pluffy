// ============================================================
// ARKZEN NATIVE SCREEN — animation-lab/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

/* @arkzen:import:expo */
/* @arkzen:import:expo:end */

const ServerErrorExpo = () => (
  <View className="flex-1 items-center justify-center bg-neutral-950">
    <Text className="text-6xl mb-4">500</Text>
    <Text className="text-white text-xl font-bold">Server Error</Text>
    <Text className="text-white/40 text-sm mt-2">Something went wrong on our end. Please try again later.</Text>
  </View>
)


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
      return <ServerErrorExpo />
    }
    return this.props.children
  }
}

export default ErrorBoundary
