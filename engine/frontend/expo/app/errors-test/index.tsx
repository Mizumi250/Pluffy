// ============================================================
// ARKZEN EXPO ROUTE — errors-test/index
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import Screen from '@/screens/errors-test/index'
import { ErrorBoundary } from '@/screens/errors-test/error-boundary'

const WrappedScreen = () => (
  <ErrorBoundary>
    <Screen />
  </ErrorBoundary>
)

export default WrappedScreen
