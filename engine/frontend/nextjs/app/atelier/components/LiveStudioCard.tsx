'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — LiveStudioCard
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:44:59.398Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'
import { LIVE_STUDIOS } from './constants'

export const LiveStudioCard = ({ studio }: { studio: typeof LIVE_STUDIOS[0] }) => (
  <div className="atl-card" style={{ cursor: 'pointer', transition: 'border-color 0.2s' }}>
    <div style={{ position: 'relative' }}>
      <img src={studio.thumb} alt={studio.artist} style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', display: 'block' }} />
      <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(14,13,12,0.7)', borderRadius: 4, padding: '3px 7px' }}>
        <div className="atl-live-dot" />
        <span style={{ fontSize: 11, color: '#f0ece4', fontWeight: 600 }}>LIVE</span>
      </div>
      <div style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(14,13,12,0.7)', borderRadius: 4, padding: '3px 7px', fontSize: 11, color: '#f0ece4', display: 'flex', alignItems: 'center', gap: 4 }}>
        <Eye size={10} />{studio.viewers}
      </div>
    </div>
    <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
      <img src={studio.avatar} alt={studio.artist} className="atl-avatar-sm" />
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{studio.artist}</div>
        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{studio.type}</div>
      </div>
      <button className="atl-btn atl-btn-primary atl-btn-sm" style={{ marginLeft: 'auto' }}>
        <Play size={11} /> Enter
      </button>
    </div>
  </div>
)
