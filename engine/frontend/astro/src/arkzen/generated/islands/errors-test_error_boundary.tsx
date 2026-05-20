// ARKZEN GENERATED ERROR BOUNDARY — errors-test
// Class-based React ErrorBoundary wrapping every island for this tatemono.
// Imported and applied by each generated island wrapper.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-20T00:39:42.039Z

import React, { Component, ReactNode } from 'react'
import { ErrorScreen } from '@/arkzen/generated/components/errors-test'

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
