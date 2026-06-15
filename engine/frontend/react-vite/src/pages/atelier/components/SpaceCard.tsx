// ============================================================
// ARKZEN GENERATED COMPONENT — SpaceCard [React+Vite]
// Source: @arkzen:components (atelier)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-14T16:01:54.880Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Activity, AlertCircle, ArrowLeft, ArrowRight, Award, Bell, Book, Briefcase, Camera, Check, ChevronLeft, ChevronRight, Clock, Coffee, Download, ExternalLink, Eye, FileText, Film, Filter, Folders, GitCommit, Globe, Grid, Hash, Heart, Home, Image, Info, Layers, Link, List, Lock, LogOut, MessageCircle, Mic, MoreHorizontal, Music, Paperclip, Pause, Pencil, Play, Plus, Radio, RefreshCw, Search, Send, Settings, Share2, Smile, Sparkles, Star, Tag, TrendingUp, User, Users, X, Zap } from 'lucide-react'
import { SPACES } from './constants'

export const SpaceCard = ({ space, onJoin }: { space: typeof SPACES[0]; onJoin: (id: number) => void }) => (
  <div className="atl-space-card">
    <img src={space.thumb} alt={space.name} className="atl-space-thumb" />
    <div className="atl-space-body">
      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 3 }}>{space.name}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 4 }}>
        <Users size={10} />{space.members} members
      </div>
      <button
        className={`atl-btn atl-btn-sm ${space.joined ? 'atl-btn-ghost' : 'atl-btn-primary'}`}
        onClick={(e) => { e.stopPropagation(); onJoin(space.id) }}
        style={{ width: '100%', justifyContent: 'center' }}
      >
        {space.joined ? <><Check size={12} />Joined</> : <>Join</>}
      </button>
    </div>
  </div>
)
