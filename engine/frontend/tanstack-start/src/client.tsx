// ============================================================
// ARKZEN — TanStack Start CLIENT ENTRY
// src/client.tsx
//
// Static entry point — do NOT edit. Arkzen generates routes
// into src/pages/{TatName}/{page}.tsx automatically.
// ============================================================

import { hydrateRoot } from 'react-dom/client'
import { StartClient } from '@tanstack/react-start/client'
import { createRouter } from './router'
import './index.css'

const router = createRouter()

hydrateRoot(document, <StartClient router={router} />)
