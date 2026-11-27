'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StubCard
// Source: @arkzen:components (a2ui-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:14:27.765Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Plan, Props, Service, ShowFn, Ticket } from './types'

export const StubCard = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="stub slide-in">
    <h2 className="stub-head">{title}</h2>
    <div className="stub-body">{children}</div>
  </section>
)
