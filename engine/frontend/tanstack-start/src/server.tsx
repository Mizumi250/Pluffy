// ============================================================
// ARKZEN — TanStack Start SERVER ENTRY (SSR)
// src/server.tsx
//
// Handles SSR rendering. TanStack Start 1.x calls this on
// every request via its Vite-native server handler.
// ============================================================

import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/react-start/server'
import { createRouter } from './router'

export default createStartHandler({
  createRouter,
})(defaultStreamHandler)
