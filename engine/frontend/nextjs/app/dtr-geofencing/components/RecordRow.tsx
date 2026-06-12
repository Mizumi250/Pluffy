'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — RecordRow
// Source: @arkzen:components (dtr-geofencing)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:05.460Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { AlertCircle, CheckCircle, ChevronDown, Clock, Loader2, LogIn, LogOut, MapPin, Navigation, RefreshCw, TrendingUp, User as UserIcon, XCircle } from 'lucide-react'
import { create } from 'zustand'

export const RecordRow = ({ rec, geofencingEnabled }: { rec: TimeRecord; geofencingEnabled: boolean }) => (
  <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors">
    <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${rec.type === 'in' ? 'bg-emerald-400/10' : 'bg-white/[0.05]'}`}>
      {rec.type === 'in'
        ? <LogIn size={13} className="text-emerald-400" />
        : <LogOut size={13} className="text-white/40" />
      }
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold uppercase tracking-wide ${rec.type === 'in' ? 'text-emerald-400' : 'text-white/40'}`}>{rec.type}</span>
        <span className="text-sm text-white/70">{fmtTime(rec.timestamp)}</span>
        {geofencingEnabled && (
          rec.within_geofence
            ? <span className="text-emerald-400/60 text-xs">✓</span>
            : <span className="text-rose-400/60 text-xs">✗</span>
        )}
      </div>
      <span className="text-xs text-white/25 font-mono">{fmtDate(rec.timestamp)}</span>
    </div>
  </div>
)
