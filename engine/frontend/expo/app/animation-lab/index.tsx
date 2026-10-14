// ============================================================
// ARKZEN EXPO ROUTE — animation-lab/index
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

import React from 'react'
import Screen from '@/screens/animation-lab/index'
import { ErrorBoundary } from '@/screens/animation-lab/error-boundary'

const WrappedScreen = () => (
  <ErrorBoundary>
    <Screen />
  </ErrorBoundary>
)

export default WrappedScreen
