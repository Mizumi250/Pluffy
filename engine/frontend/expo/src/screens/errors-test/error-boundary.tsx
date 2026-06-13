// ============================================================
// ARKZEN EXPO SCREEN — errors-test/error-boundary
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'

import { useRouter } from 'expo-router'
import { NativeErrorScreen } from './components/NativeErrorScreen'

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
