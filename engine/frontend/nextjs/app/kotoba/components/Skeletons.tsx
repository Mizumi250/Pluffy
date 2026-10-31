'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Skeletons
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T13:21:10.050Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'

export const Skeletons = ({ n = 3, h = 120 }: { n?: number; h?: number }) => (
  <div className="kt-stack">{Array.from({ length: n }).map((_, i) => <div key={i} className="kt-skel" style={{ height: h }} />)}</div>
)
