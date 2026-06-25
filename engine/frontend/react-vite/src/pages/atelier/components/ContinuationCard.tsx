// ============================================================
// ARKZEN GENERATED COMPONENT — ContinuationCard [React+Vite]
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T16:31:10.634Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'
import { CONTINUATIONS } from './constants'

export const ContinuationCard = ({ cont, onClick }: { cont: typeof CONTINUATIONS[0]; onClick: () => void }) => (
  <div className="atl-continuation-card" onClick={onClick}>
    <img src={cont.thumb} alt={cont.title} className="atl-continuation-thumb" />
    <div className="atl-continuation-body">
      <div className="atl-continuation-meta">
        <img src={cont.avatar} alt={cont.artist} className="atl-avatar-sm" />
        <span style={{ fontSize: 12, color: 'var(--muted)' }}>{cont.handle}</span>
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)' }}>{cont.lastUpdate}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{cont.title}</div>
      <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, lineHeight: 1.5 }}>{cont.note}</div>
      <div className="flex items-center gap-2 mb-2">
        {cont.tags.slice(0, 2).map(t => (
          <span key={t} className="atl-badge atl-badge-gold">{t}</span>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
          <Eye size={11} />{cont.witnesses}
        </span>
      </div>
      <div className="atl-progress-bar">
        <div className="atl-progress-fill" style={{ width: `${cont.progress}%` }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 5, display: 'flex', justifyContent: 'space-between' }}>
        <span>v{cont.version}</span>
        <span>{cont.progress}%</span>
      </div>
    </div>
  </div>
)
