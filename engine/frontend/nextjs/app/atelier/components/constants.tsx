// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — atelier
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:31.666Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'

// ── Mock data ─────────────────────────────────────────────────────────────────
 
export const CURRENT_USER = {
  name: 'Mizu',
  handle: '@mizu_art',
  role: 'Artist',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
  bio: 'I draw slow, murals, and stories.',
  location: 'Cloud City',
  joinYear: 2023,
}

export const CONTINUATIONS = [
  {
    id: 1,
    title: 'Eclipse Project',
    artist: 'Mizu',
    handle: '@mizu_art',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
    thumb: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=600&h=380&fit=crop',
    progress: 73,
    version: 4,
    lastUpdate: '2h ago',
    witnesses: 23,
    tags: ['Digital', 'Space', 'Atmospheric'],
    note: 'Working on light and atmosphere. Trying to push more depth into the clouds.',
    status: 'active',
  },
  {
    id: 2,
    title: 'Aurora Illustration',
    artist: 'Mizu',
    handle: '@mizu_art',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face',
    thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=380&fit=crop',
    progress: 48,
    version: 2,
    lastUpdate: '1d ago',
    witnesses: 8,
    tags: ['Watercolor', 'Nature'],
    note: 'Exploring aurora color palettes.',
    status: 'active',
  },
  {
    id: 3,
    title: 'Character Design',
    artist: 'Daro',
    handle: '@daro_env',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=380&fit=crop',
    progress: 62,
    version: 3,
    lastUpdate: '34m ago',
    witnesses: 14,
    tags: ['Character', 'VTuber'],
    note: 'Refining the silhouette. Color pass next.',
    status: 'active',
  },
  {
    id: 4,
    title: 'Forgotten World',
    artist: 'Ash',
    handle: '@ash_illus',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face',
    thumb: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=600&h=380&fit=crop',
    progress: 29,
    version: 1,
    lastUpdate: '3h ago',
    witnesses: 6,
    tags: ['Environment', 'Fantasy'],
    note: 'Initial sketching phase.',
    status: 'active',
  },
]

export const SPACES = [
  {
    id: 1,
    name: 'Environment Artists',
    members: '1.2K',
    thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=160&fit=crop',
    joined: true,
    category: 'Art Style',
  },
  {
    id: 2,
    name: 'VTuber Hub',
    members: '860',
    thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=160&fit=crop',
    joined: true,
    category: 'Community',
  },
  {
    id: 3,
    name: 'Storyboard Artists',
    members: '642',
    thumb: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=400&h=160&fit=crop',
    joined: true,
    category: 'Industry',
  },
  {
    id: 4,
    name: 'Chill & Memes',
    members: '2.1K',
    thumb: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?w=400&h=160&fit=crop',
    joined: true,
    category: 'Community',
  },
  {
    id: 5,
    name: 'Anime Artists',
    members: '1.8K',
    thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=400&h=160&fit=crop',
    joined: false,
    category: 'Art Style',
  },
  {
    id: 6,
    name: 'Pixel Art',
    members: '1.1K',
    thumb: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400&h=160&fit=crop',
    joined: false,
    category: 'Art Style',
  },
  {
    id: 7,
    name: 'Concept Art',
    members: '980',
    thumb: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=400&h=160&fit=crop',
    joined: false,
    category: 'Industry',
  },
  {
    id: 8,
    name: 'Illustration',
    members: '2.3K',
    thumb: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=160&fit=crop',
    joined: false,
    category: 'Art Style',
  },
]

export const PEOPLE = [
  { name: 'Daro',  handle: '@daro_env',  role: 'Environment Artist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', online: true },
  { name: 'Ash',   handle: '@ash_illus', role: 'Illustrator',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', online: false },
  { name: 'Reiko', handle: '@reiko_art', role: 'Character Designer',  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', online: true },
  { name: 'Yuki',  handle: '@yuki_draw', role: 'Manga Artist',        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face', online: false },
]

export const LIVE_STUDIOS = [
  { artist: 'Daro',  handle: '@daro_env',  type: 'Environment Painting', viewers: 23, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=120&fit=crop' },
  { artist: 'Reiko', handle: '@reiko_art', type: 'Character Sketching',  viewers: 18, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&h=120&fit=crop' },
  { artist: 'Ash',   handle: '@ash_illus', type: 'Blender 3D Modeling',  viewers: 14, avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=120&fit=crop' },
]

export const TIMELINE_ENTRIES = [
  { version: 'v4', label: 'Final lighting', time: '14:20', note: 'Refined the shape', img: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=120&h=80&fit=crop', isNow: true },
  { version: 'v3', label: 'Composition',    time: '11:47', note: 'Changed composition', img: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=120&h=80&fit=crop', isNow: false },
  { version: 'v2', label: 'Blocking',       time: '09:10', note: 'Initial sketch',       img: 'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=120&h=80&fit=crop', isNow: false },
  { version: 'v1', label: 'Initial sketch', time: 'Yesterday', note: 'Concept phase',    img: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=120&h=80&fit=crop', isNow: false },
]

export const COMMISSIONS = [
  { id: 1, title: 'Character Illustration', client: '@hollow_fox', status: 'In Progress', progress: 60, steps: ['Sketch', 'Lineart', 'Color', 'Shading', 'Final'], currentStep: 2, price: '$120', due: 'Mar 14' },
  { id: 2, title: 'VTuber Model',           client: '@vlunar',     status: 'Pending',     progress: 10, steps: ['Concept', 'Design', 'Rig', 'Final'], currentStep: 0, price: '$400', due: 'Mar 30' },
  { id: 3, title: 'Background Art',         client: '@gameblue',   status: 'In Progress', progress: 50, steps: ['Sketch', 'Lineart', 'Color', 'Final'], currentStep: 2, price: '$80', due: 'Mar 12' },
]

export const CR_POSTS = [
  {
    id: 1,
    author: 'Yuki',
    handle: '@yuki_draw',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face',
    content: 'When the ref and the final look nothing alike',
    image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&h=360&fit=crop',
    time: '26m ago',
    hearts: 129,
    comments: 24,
  },
  {
    id: 2,
    author: 'Daro',
    handle: '@daro_env',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face',
    content: "Every artist's nightmare.",
    image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=500&h=360&fit=crop',
    time: '1h ago',
    hearts: 76,
    comments: 12,
  },
]

export const SUPPORTER_DATA = {
  goal: { current: 1200, target: 2000, label: 'Monthly Goal' },
  topSupporters: [
    { name: 'StarUser',    amount: '$50/mo',  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=36&h=36&fit=crop&crop=face' },
    { name: 'PixelKnight', amount: '$30/mo',  avatar: 'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=36&h=36&fit=crop&crop=face' },
    { name: 'LunaOH',      amount: '$25/mo',  avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=36&h=36&fit=crop&crop=face' },
    { name: 'ArtLover',    amount: '$15/mo',  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=36&h=36&fit=crop&crop=face' },
    { name: 'VTuber Hub',  amount: '$10/mo',  avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=36&h=36&fit=crop&crop=face' },
  ],
}

export const PROFILE_JOURNEY = [
  'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=160&h=160&fit=crop',
  'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=160&h=160&fit=crop',
]

export const MESSAGES = [
  { id: 1, from: 'Daro',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=36&h=36&fit=crop&crop=face', text: 'The atmosphere is amazing!', time: '2m ago', own: false },
  { id: 2, from: 'Reiko', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=36&h=36&fit=crop&crop=face', text: 'Love the lighting', time: '1m ago', own: false },
  { id: 3, from: 'Ash',   avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=36&h=36&fit=crop&crop=face', text: 'What brush are you using?', time: '1m ago', own: false },
  { id: 4, from: 'Mizu',  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=36&h=36&fit=crop&crop=face', text: "It's custom", time: '58s ago', own: true },
]
 
// ── Shared UI components ──────────────────────────────────────────────────────
