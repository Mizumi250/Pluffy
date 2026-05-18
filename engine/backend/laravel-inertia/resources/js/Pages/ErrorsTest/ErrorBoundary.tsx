// ============================================================
// ARKZEN GENERATED — errors-test/ErrorBoundary.tsx [React+Inertia]
// Class-based React ErrorBoundary wrapping all Inertia pages in this tatemono.
// DO NOT EDIT — edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-18T13:18:29.924Z
// ============================================================

import React, { Component, ReactNode } from 'react'
import { ErrorScreen } from './components'

const ServerErrorPage = ({ reset }: { reset: () => void }) => <ErrorScreen code={500} reset={reset} />

interface ArkzenErrorBoundaryState { hasError: boolean }

export class ArkzenErrorBoundary_ErrorsTest extends Component<
  { children: ReactNode },
  ArkzenErrorBoundaryState
> {
  state: ArkzenErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(): ArkzenErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[Arkzen] errors-test error boundary caught:', error, info)
  }

  reset = (): void => {
    this.setState({ hasError: false })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return <ServerErrorPage reset={this.reset} />
    }
    return this.props.children
  }
}
