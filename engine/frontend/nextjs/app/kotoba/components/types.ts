// ============================================================
// ARKZEN GENERATED TYPES — kotoba
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T03:33:33.713Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────
export type KProfile = {
  id: number; user_id: number; display_name: string; bio?: string | null; native_lang: string; learning_lang: string
  level: string; country?: string | null; interests?: string | null; avatar_color: string; xp: number; streak: number
  best_streak: number; daily_goal: number; words_written: number; messages_sent: number; onboarded: boolean
  score?: number; shared?: string[]; following?: boolean
}

export type KPost = {
  id: number; user_id: number; author_name: string; author_color?: string | null; author_native?: string | null
  lang: string; kind: string; mission_id?: number | null; body: string; translation?: string | null
  likes_count: number; comments_count: number; corrections_count: number; liked?: boolean; created_at?: string
}

export type KComment = {
  id: number; post_id: number; user_id: number; author_name: string; author_color?: string | null; body: string
  is_correction: boolean; corrected?: string | null; explanation?: string | null; accepted: boolean; created_at?: string
}

// ─── Levels & palette ─────────────────────────────────────────
// (LANGS, langName and kt live in the web:script block above)

// ─── Lesson player ────────────────────────────────────────────
export type Ex = { t: 'choose' | 'type' | 'order' | 'match'; q: string; o?: string[]; a?: any; w?: string[]; p?: string[][] }
