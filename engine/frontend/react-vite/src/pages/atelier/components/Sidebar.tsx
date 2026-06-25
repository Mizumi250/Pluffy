// ============================================================
// ARKZEN GENERATED COMPONENT — Sidebar [React+Vite]
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T07:05:46.636Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'
import { CURRENT_USER } from './constants'

// ── Shared UI components ──────────────────────────────────────────────────────
 
export const Sidebar = ({ active, onNav }: { active: string; onNav: (v: string) => void }) => (
  <nav className="atl-sidebar">
    <div className="atl-sidebar-logo">
      <div className="atl-sidebar-logo-wordmark">ATELIER</div>
      <div className="atl-sidebar-logo-tagline">A Home for Creative Journeys</div>
    </div>
 
    <div className="atl-nav">
      <div className="atl-nav-section">Navigate</div>
      {[
        { id: 'home',         label: 'Home',          icon: <Home size={14} /> },
        { id: 'continuations',label: 'Continuations', icon: <Layers size={14} /> },
        { id: 'spaces',       label: 'Spaces',        icon: <Globe size={14} /> },
        { id: 'projects',     label: 'Projects',      icon: <Folders size={14} /> },
        { id: 'common-room',  label: 'Common Room',   icon: <Coffee size={14} /> },
        { id: 'live-studios', label: 'Live Studios',  icon: <Radio size={14} /> },
      ].map(n => (
        <div
          key={n.id}
          className={`atl-nav-item${active === n.id ? ' active' : ''}`}
          onClick={() => onNav(n.id)}
        >
          {n.icon}
          {n.label}
        </div>
      ))}
 
      <div className="atl-nav-section" style={{ marginTop: 12 }}>Create & Support</div>
      {[
        { id: 'commissions', label: 'Commissions', icon: <Briefcase size={14} /> },
        { id: 'support',     label: 'Support',     icon: <Heart size={14} /> },
        { id: 'messages',    label: 'Messages',    icon: <MessageCircle size={14} /> },
        { id: 'notifications', label: 'Notifications', icon: <Bell size={14} /> },
      ].map(n => (
        <div
          key={n.id}
          className={`atl-nav-item${active === n.id ? ' active' : ''}`}
          onClick={() => onNav(n.id)}
        >
          {n.icon}
          {n.label}
        </div>
      ))}
 
      <div className="atl-nav-section" style={{ marginTop: 12 }}>Account</div>
      {[
        { id: 'profile',  label: 'Profile',  icon: <User size={14} /> },
        { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
      ].map(n => (
        <div
          key={n.id}
          className={`atl-nav-item${active === n.id ? ' active' : ''}`}
          onClick={() => onNav(n.id)}
        >
          {n.icon}
          {n.label}
        </div>
      ))}
    </div>
 
    <div className="atl-sidebar-user">
      <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} className="atl-avatar" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="atl-user-name">{CURRENT_USER.name}</div>
        <div className="atl-user-role">{CURRENT_USER.handle}</div>
      </div>
    </div>
 
    <div className="atl-sidebar-footer">No algorithms. No pressure.</div>
  </nav>
)
