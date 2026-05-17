// ============================================================
// ARKZEN — TanStack Start SERVER ENTRY (SSR)
// src/server.tsx
//
// Handles SSR rendering. Vinxi calls this on every request.
// ============================================================

import {
  createStartHandler,
  defaultStreamHandler,
} from '@tanstack/start/server'
import { createRouter } from './router'

export default createStartHandler({
  createRouter,
})(defaultStreamHandler)
