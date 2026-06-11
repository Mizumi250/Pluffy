// ============================================================
// ARKZEN GENERATED — errors-test/error-boundary [React+Vite]
// Class-based React ErrorBoundary wrapping all routes for this tatemono.
// App.tsx imports it via ARKZEN_ERROR_BOUNDARIES from routes.ts.
// DO NOT EDIT — edit @arkzen:error:500 in tatemono instead
// Generated: 2026-06-11T01:13:18.904Z
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
