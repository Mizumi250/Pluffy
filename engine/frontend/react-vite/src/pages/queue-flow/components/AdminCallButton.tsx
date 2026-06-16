// ============================================================
// ARKZEN GENERATED COMPONENT — AdminCallButton [React+Vite]
// Source: @arkzen:components (queue-flow)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:29:28.912Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ArrowRight, Calendar, CheckCircle, Clock, Loader2, Pause, SkipForward, Users, Volume2 } from 'lucide-react'
import { create } from 'zustand'

export const AdminCallButton = ({
  onCallNext,
  loading,
  disabled,
}: {
  onCallNext: () => void
  loading: boolean
  disabled: boolean
}) => (
  <button
    onClick={onCallNext}
    disabled={loading || disabled}
    style={{
      width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      padding: '16px', borderRadius: 18,
      background: 'linear-gradient(135deg, #4a72d8, #3a5fc8)',
      border: 'none', color: 'white', fontSize: 15, fontWeight: 700,
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      opacity: disabled || loading ? 0.5 : 1,
      boxShadow: '0 8px 24px rgba(74,114,216,0.30)',
      transition: 'all 0.2s',
    }}
  >
    {loading
      ? <Loader2 size={18} className="animate-spin" />
      : <SkipForward size={18} />
    }
    Call Next
  </button>
)
