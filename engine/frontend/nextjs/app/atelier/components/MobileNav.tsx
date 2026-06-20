'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — MobileNav
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:31.677Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'

export const MobileNav = ({ active, onNav }: { active: string; onNav: (v: string) => void }) => (
  <div className="atl-mobile-nav">
    {[
      { id: 'home',         label: 'Home',       icon: <Home size={18} /> },
      { id: 'continuations',label: 'Journey',    icon: <Layers size={18} /> },
      { id: 'spaces',       label: 'Spaces',     icon: <Globe size={18} /> },
      { id: 'common-room',  label: 'Common',     icon: <Coffee size={18} /> },
      { id: 'profile',      label: 'Profile',    icon: <User size={18} /> },
    ].map(n => (
      <button
        key={n.id}
        className={`atl-mob-nav-item${active === n.id ? ' active' : ''}`}
        onClick={() => onNav(n.id)}
      >
        {n.icon}
        {n.label}
      </button>
    ))}
  </div>
)
