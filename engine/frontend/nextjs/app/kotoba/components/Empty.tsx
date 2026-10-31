'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Empty
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:17.171Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'
import type { Ex, KComment, KPost, KProfile } from './types'
import { Ico } from './Ico'

export const Empty = ({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) => (
  <div className="kt-card flat" style={{ textAlign: 'center', padding: '44px 24px' }}>
    <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>{typeof icon === 'string' || icon == null ? <Ico n={(icon as string) ?? 'sprout'} size={34} /> : icon}</div>
    <div className="kt-h2" style={{ fontSize: 19 }}>{title}</div>
    {text && <p className="kt-sub" style={{ margin: '6px auto 16px', maxWidth: 360 }}>{text}</p>}
    {action}
  </div>
)
