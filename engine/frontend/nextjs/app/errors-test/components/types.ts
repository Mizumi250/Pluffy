// ============================================================
// ARKZEN GENERATED TYPES — errors-test
// Source: @arkzen:components (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:20.310Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useToast } from '@/arkzen/core/components/Toast'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

export type ErrorDef = {
  code: number
  title: string
  message: string
  action?: { label: string; href: string }
  color: string
  bg: string
  border: string
  btnColor: string
}
