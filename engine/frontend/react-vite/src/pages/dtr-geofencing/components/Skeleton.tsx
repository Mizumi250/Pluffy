// ============================================================
// ARKZEN GENERATED COMPONENT — Skeleton [React+Vite]
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T14:13:41.909Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'

export const Skeleton = () => (
  <div className="animate-pulse flex items-center gap-3 px-4 py-3">
    <div className="w-7 h-7 rounded-full bg-white/[0.05]" />
    <div className="flex-1 space-y-1.5">
      <div className="h-3 bg-white/[0.05] rounded w-2/3" />
      <div className="h-2.5 bg-white/[0.04] rounded w-1/3" />
    </div>
  </div>
)
