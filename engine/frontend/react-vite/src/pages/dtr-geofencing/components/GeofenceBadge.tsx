// ============================================================
// ARKZEN GENERATED COMPONENT — GeofenceBadge [React+Vite]
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:57.020Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'
import { within } from './utils'

export const GeofenceBadge = ({ within, enabled }: { within: boolean; enabled: boolean }) => {
  if (!enabled) return (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-white/30 bg-white/[0.04] px-2 py-1 rounded-full">
      <AlertCircle size={10} /> geofence off
    </span>
  )
  return within ? (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
      <CheckCircle size={10} /> within range
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 text-xs font-mono text-rose-400 bg-rose-400/10 px-2 py-1 rounded-full">
      <XCircle size={10} /> outside range
    </span>
  )
}
