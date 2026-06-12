'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ErrorScreen
// Source: @arkzen:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T09:10:05.841Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/arkzen/core/components/Toast'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { ERRORS } from './constants'

export const ErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const err = ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: 'text-neutral-700',
    bg: 'bg-neutral-50',
    border: 'border-neutral-100',
    btnColor: 'bg-neutral-900 hover:bg-neutral-700',
    action: { label: 'Go home', href: '/' },
  }

  const primaryHref  = reset ? undefined : err.action?.href
  const primaryLabel = reset ? 'Try again' : err.action?.label

  return (
    <div className={'min-h-screen flex items-center justify-center ' + err.bg + ' px-4'}>
      <div className="text-center max-w-md w-full">
        <div className={'text-8xl font-black tracking-tight mb-2 ' + err.color}>{err.code}</div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-3">{err.title}</h1>
        <p className="text-sm text-neutral-500 leading-relaxed mb-10">{err.message}</p>
        <div className="flex items-center justify-center gap-3">
          {primaryLabel && (
            reset ? (
              <button
                onClick={reset}
                className={'text-sm font-medium text-white px-6 py-2.5 rounded-xl transition-colors ' + err.btnColor}
              >
                {primaryLabel}
              </button>
            ) : (
              <a
                href={primaryHref}
                className={'text-sm font-medium text-white px-6 py-2.5 rounded-xl transition-colors ' + err.btnColor}
              >
                {primaryLabel}
              </a>
            )
          )}
          <a
            href="/"
            className="text-sm font-medium text-neutral-600 bg-white px-6 py-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-50 transition-colors"
          >
            Home
          </a>
        </div>
        <p className="mt-10 text-xs text-neutral-300">Error {err.code}</p>
      </div>
    </div>
  )
}
