// ============================================================
// ARKZEN — TanStack Start CLIENT ENTRY
// src/client.tsx
//
// Static entry point — do NOT edit. Arkzen generates routes
// into src/pages/{TatName}/{page}.tsx automatically.
// ============================================================

import { StartClient } from '@tanstack/start'
import { createRouter } from './router'
import ReactDOM from 'react-dom/client'
import './index.css'

const router = createRouter()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StartClient router={router} />
)
