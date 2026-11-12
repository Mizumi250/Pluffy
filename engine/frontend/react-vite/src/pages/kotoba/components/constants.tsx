// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — kotoba [React+Vite]
// Source: @arkzen:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-12T01:55:51.545Z
// ============================================================

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { LANGS, kt, langName } from '@/arkzen/generated/kotoba.scripts'
import { ArrowRight, Book, BookOpen, BookmarkPlus, Brain, CalendarDays, Check, Clock, Coffee, Compass, FileText, Flame, Flower2, Gamepad2, Globe, GraduationCap, Hand, Handshake, Headphones, Heart, History, Home, Languages, Layers, Lightbulb, Medal, MessageCircle, Minus, Newspaper, PartyPopper, PenLine, Pencil, Plus, Send, Sparkles, Sprout, Star, Sun, Target, TrendingUp, Trophy, User, Users, Utensils, Wand2, WifiOff, X } from 'lucide-react'


export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export const COLORS = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a'];

export const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'flame': Flame, 'wifi-off': WifiOff, 'handshake': Handshake, 'pen-line': PenLine, 'users': Users, 'globe': Globe, 'brain': Brain,
  'compass': Compass, 'graduation-cap': GraduationCap, 'target': Target, 'book-open': BookOpen, 'party-popper': PartyPopper, 'layers': Layers,
  'medal': Medal, 'check': Check, 'trending-up': TrendingUp, 'message-circle': MessageCircle, 'lightbulb': Lightbulb, 'calendar': CalendarDays,
  'sprout': Sprout, 'star': Star, 'file-text': FileText, 'book': Book, 'home': Home, 'newspaper': Newspaper, 'user': User, 'heart': Heart,
  'hand': Hand, 'pencil': Pencil, 'sun': Sun, 'flower': Flower2, 'coffee': Coffee, 'headphones': Headphones, 'gamepad': Gamepad2,
  'utensils': Utensils, 'trophy': Trophy, 'clock': Clock, 'history': History,
};
