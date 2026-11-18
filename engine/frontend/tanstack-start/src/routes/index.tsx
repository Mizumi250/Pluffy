// ============================================================
// ARKZEN — TanStack Start INDEX ROUTE (Arkzen Hub)
// src/routes/index.tsx
//
// The / route renders the ArkzenHub tatemono dashboard.
// Mirrors App.tsx ArkzenHub from the React+Vite stack exactly.
// ============================================================

import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { createArkzenHub } from '../../../../shared/arkzen/hub/Hub.js'

const ArkzenHub = createArkzenHub(React, { platform: 'TanStack Start' })

export const Route = createFileRoute('/')({
  component: ArkzenHub,
})
