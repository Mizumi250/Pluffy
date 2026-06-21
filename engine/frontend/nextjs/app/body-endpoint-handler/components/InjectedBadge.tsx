'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — InjectedBadge
// Source: @arkzen:components (body-endpoint-handler)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:47.271Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { Tag } from './Tag'

export const InjectedBadge = ({ injected }: { injected: boolean }) => (
  <Tag label={injected ? '✓ BODY INJECTED' : '✗ STUB'} color={injected ? '#16a34a' : '#dc2626'} />
)
