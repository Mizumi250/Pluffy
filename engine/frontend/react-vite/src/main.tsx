// ============================================================
// ARKZEN React+Vite — Entry Point
// ============================================================
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import { ToastProvider } from '@/arkzen/core/components/Toast'
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'
import './index.css'

// ============================================================
// Initialize tatemono slug for auth store persistence
// Extracts slug from URL path: /tatemono-name/page → slug
// This ensures zustand:persist uses the correct storage key
// ============================================================
if (typeof window !== 'undefined') {
  const segments = window.location.pathname.split('/').filter(Boolean)
  const slug = segments[0] ?? 'default'
  setActiveTatemono(slug)
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastProvider position="top-right">
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </BrowserRouter>
    </ToastProvider>
  </React.StrictMode>
)
