'use client'
// ============================================================
// ARKZEN GENERATED PAGE — atelier/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T11:32:46.568Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { ContinuationCard } from './components/ContinuationCard'
import { LiveStudioCard } from './components/LiveStudioCard'
import { MobileNav } from './components/MobileNav'
import { Sidebar } from './components/Sidebar'
import { SpaceCard } from './components/SpaceCard'
import { COMMISSIONS, CONTINUATIONS, CR_POSTS, CURRENT_USER, LIVE_STUDIOS, MESSAGES, PEOPLE, PROFILE_JOURNEY, SPACES, SUPPORTER_DATA, TIMELINE_ENTRIES } from './components/constants'
import { Home, Layers, Users, Coffee, Radio, Briefcase, Heart, MessageCircle, Bell, User, Settings, Search, Plus, ArrowRight, ChevronRight, MoreHorizontal, Eye, Clock, Pencil, Image, FileText, Download, Share2, Play, Pause, Mic, Camera, Star, TrendingUp, Send, X, Check, Smile, Paperclip, Grid, List, Filter, ExternalLink, GitCommit, Folders, Globe, Lock, Zap, Music, Film, Book, Sparkles, Award, RefreshCw, ChevronLeft, ArrowLeft, Info, AlertCircle, Tag, Hash, Activity, LogOut, Link, } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const AtelierPage = () => {
  const [activeNav, setActiveNav] = useState('home')
  const [spaces, setSpaces]       = useState(SPACES)
  const [witnessing, setWitnessing] = useState<number[]>([1])
  const [selectedCont, setSelectedCont] = useState<typeof CONTINUATIONS[0] | null>(null)
  const [crTab, setCrTab] = useState<'for-you' | 'memes' | 'art' | 'discuss'>('for-you')
  const [chatMsg, setChatMsg] = useState('')
  const [chatMessages, setChatMessages] = useState(MESSAGES)
  const [commTab, setCommTab] = useState<'my' | 'browse'>('my')
  const [suppTab, setSuppTab] = useState<'supporters' | 'goals' | 'benefits'>('supporters')
  const [profileTab, setProfileTab] = useState<'journey' | 'projects' | 'spaces' | 'about'>('journey')
  const [spaceFilter, setSpaceFilter] = useState('All')
  const [liveTab, setLiveTab] = useState<'watching' | 'all'>('all')
  const [contFilter, setContFilter] = useState('All')
  const [searching, setSearching]   = useState('')
 
  const toggleWitness = (id: number) =>
    setWitnessing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
 
  const toggleJoin = (id: number) =>
    setSpaces(prev => prev.map(s => s.id === id ? { ...s, joined: !s.joined } : s))
 
  const sendChat = () => {
    if (!chatMsg.trim()) return
    setChatMessages(prev => [...prev, {
      id: prev.length + 1,
      from: 'Mizu',
      avatar: CURRENT_USER.avatar,
      text: chatMsg,
      time: 'now',
      own: true,
    }])
    setChatMsg('')
  }
 
  // ── Home Dashboard ──────────────────────────────────────────────────────────
  const HomeView = () => (
    <div className="atl-content">
      <div style={{ marginBottom: 28 }}>
        <div className="atl-page-heading">Welcome back, {CURRENT_USER.name}</div>
        <div className="atl-text-muted" style={{ marginTop: 4, fontSize: 13 }}>What will you continue today?</div>
      </div>
 
      <div className="atl-panel-layout">
        {/* Left */}
        <div>
          {/* Continue Working */}
          <div className="atl-section-head">
            <div className="atl-section-title">Continue Working</div>
            <span className="atl-link-muted" onClick={() => setActiveNav('continuations')}>View all <ChevronRight size={12} style={{ display: 'inline' }} /></span>
          </div>
 
          {/* Featured continuation */}
          <div className="atl-card mb-4" style={{ cursor: 'pointer' }} onClick={() => { setSelectedCont(CONTINUATIONS[0]); setActiveNav('continuations') }}>
            <img src={CONTINUATIONS[0].thumb} alt={CONTINUATIONS[0].title} style={{ width: '100%', aspectRatio: '16/7', objectFit: 'cover', display: 'block' }} />
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{CONTINUATIONS[0].title}</div>
                <span className="atl-badge atl-badge-green">Active</span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>By {CURRENT_USER.handle} · Last updated {CONTINUATIONS[0].lastUpdate}</div>
              <div className="atl-progress-bar">
                <div className="atl-progress-fill" style={{ width: `${CONTINUATIONS[0].progress}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{CONTINUATIONS[0].progress}%</div>
            </div>
          </div>
 
          {/* Mini grid of other active */}
          <div className="atl-grid-2 mb-6">
            {CONTINUATIONS.slice(1, 3).map(c => (
              <ContinuationCard key={c.id} cont={c} onClick={() => { setSelectedCont(c); setActiveNav('continuations') }} />
            ))}
          </div>
 
          {/* People You Witness */}
          <div className="atl-section-head">
            <div className="atl-section-title">People You Witness</div>
            <span className="atl-link-muted">View all</span>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
            {PEOPLE.map(p => (
              <div key={p.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <div style={{ position: 'relative' }}>
                  <img src={p.avatar} alt={p.name} style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(196,168,130,0.2)' }} />
                  {p.online && <div style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: '50%', background: '#86c795', border: '2px solid var(--ink)' }} />}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'center' }}>{p.name}</div>
                <div style={{ fontSize: 10, color: 'var(--muted)', textAlign: 'center' }}>{p.role}</div>
              </div>
            ))}
          </div>
 
          {/* Spaces */}
          <div className="atl-section-head">
            <div className="atl-section-title">Spaces You're In</div>
            <span className="atl-link-muted" onClick={() => setActiveNav('spaces')}>View all</span>
          </div>
          <div className="atl-grid-4">
            {spaces.filter(s => s.joined).map(s => (
              <div key={s.id} className="atl-space-card" onClick={() => setActiveNav('spaces')}>
                <img src={s.thumb} alt={s.name} className="atl-space-thumb" />
                <div style={{ padding: '8px 10px' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{s.members} members</div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Right Rail */}
        <div>
          {/* Live Studios */}
          <div className="atl-rail-block mb-4">
            <div className="atl-section-head mb-3">
              <div className="atl-rail-title">Live Studios</div>
              <span className="atl-link-muted" onClick={() => setActiveNav('live-studios')}>View all</span>
            </div>
            {LIVE_STUDIOS.map(s => (
              <div key={s.artist} className="atl-studio-item">
                <div style={{ position: 'relative' }}>
                  <img src={s.avatar} alt={s.artist} className="atl-avatar-sm" />
                  <div className="atl-live-dot" style={{ position: 'absolute', top: -1, right: -1 }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.artist}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.type}</div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Eye size={10} />{s.viewers}
                </div>
              </div>
            ))}
            <button className="atl-btn atl-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12 }} onClick={() => setActiveNav('live-studios')}>
              <Radio size={13} /> Enter a Studio
            </button>
          </div>
 
          {/* Recent Activity */}
          <div className="atl-rail-block mb-4">
            <div className="atl-rail-title">Recent Activity</div>
            {[
              { text: 'Daro continued Eclipse',              time: '2h ago',  avatar: PEOPLE[0].avatar },
              { text: 'Reiko commented on your continuation', time: '3h ago', avatar: PEOPLE[2].avatar },
              { text: 'New supporter joined your journey',    time: '5h ago', avatar: PEOPLE[3].avatar },
              { text: 'Ash uploaded to Project Aurora',       time: '7h ago', avatar: PEOPLE[1].avatar },
            ].map((a, i) => (
              <div key={i} className="atl-feed-item">
                <img src={a.avatar} alt="" className="atl-avatar-sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', lineHeight: 1.4 }}>{a.text}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{a.time}</div>
                </div>
              </div>
            ))}
          </div>
 
          {/* Absence note */}
          <div className="atl-absence-note">
            The system never punishes absence. Just return and continue.
          </div>
        </div>
      </div>
    </div>
  )
 
  // ── Continuations View ──────────────────────────────────────────────────────
  const ContinuationsView = () => {
    if (selectedCont) {
      return (
        <div className="atl-content">
          <button className="atl-btn atl-btn-ghost atl-btn-sm mb-4" onClick={() => setSelectedCont(null)}>
            <ArrowLeft size={13} /> Back to Continuations
          </button>
 
          {/* Header */}
          <div className="atl-cont-page-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <img src={selectedCont.avatar} alt={selectedCont.artist} className="atl-avatar-md" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: 'var(--text)' }}>{selectedCont.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{selectedCont.handle} · {selectedCont.lastUpdate}</div>
                </div>
              </div>
              <div className="flex gap-2">
                {selectedCont.tags.map(t => <span key={t} className="atl-badge atl-badge-gold">{t}</span>)}
              </div>
            </div>
            <div className="flex gap-2">
              <button
                className={witnessing.includes(selectedCont.id) ? 'atl-btn-witness' : 'atl-witness-btn'}
                onClick={() => toggleWitness(selectedCont.id)}
              >
                <Eye size={13} />
                {witnessing.includes(selectedCont.id) ? 'Witnessing' : 'Witness'}
              </button>
              <button className="atl-menu-btn"><MoreHorizontal size={14} /></button>
            </div>
          </div>
 
          <div className="atl-detail-layout">
            {/* Main */}
            <div>
              {/* Current state */}
              <img src={selectedCont.thumb} alt={selectedCont.title} className="atl-cont-hero" />
 
              {/* Note */}
              <div className="atl-card-padded mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Pencil size={13} color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Artist Note</span>
                </div>
                <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{selectedCont.note}</p>
              </div>
 
              {/* State comparison */}
              <div className="atl-card-padded mb-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 12 }}>
                  <GitCommit size={13} color="var(--gold)" />
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>State Comparison</span>
                  <span className="atl-badge atl-badge-blue" style={{ marginLeft: 4 }}>v{selectedCont.version - 1} → v{selectedCont.version}</span>
                </div>
                <div className="atl-compare">
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>Before</div>
                    <img src={TIMELINE_ENTRIES[1].img} alt="Before" className="atl-compare-img" style={{ width: '100%' }} />
                  </div>
                  <ArrowRight size={16} color="var(--muted)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 6 }}>After</div>
                    <img src={selectedCont.thumb} alt="After" className="atl-compare-img" style={{ width: '100%' }} />
                  </div>
                </div>
                <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, fontStyle: 'italic' }}>
                  Moved the focal point to the right. Trying to create more tension.
                </p>
              </div>
 
              {/* Files */}
              <div className="atl-card-padded">
                <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Files</div>
                <div className="flex gap-2 flex-wrap">
                  {[
                    { name: 'eclipse_v4.psd', size: '756MB' },
                    { name: 'eclipse_v4.png', size: '14MB' },
                    { name: '+3 more files', size: '' },
                  ].map(f => (
                    <div key={f.name} className="atl-file-chip">
                      <FileText size={11} />
                      {f.name}
                      {f.size && <span style={{ opacity: 0.5 }}>{f.size}</span>}
                    </div>
                  ))}
                </div>
              </div>
            </div>
 
            {/* Sidebar */}
            <div>
              {/* Presence */}
              <div className="atl-rail-block mb-4">
                <div className="atl-presence mb-3">
                  <div className="atl-presence-dot" />
                  <span>{selectedCont.witnesses} people are here witnessing</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)', fontStyle: 'italic' }}>
                  Others may be here, but we don't perform together. We simply co-exist in the space.
                </div>
              </div>
 
              {/* Timeline */}
              <div className="atl-rail-block mb-4">
                <div className="atl-rail-title">Timeline</div>
                <div className="atl-timeline">
                  {TIMELINE_ENTRIES.map((entry, i) => (
                    <div key={i} className="atl-timeline-item">
                      <div className={`atl-timeline-dot${entry.isNow ? ' now' : ''}`} />
                      {entry.isNow && <div style={{ fontSize: 10, color: '#86c795', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Now</div>}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                        <img src={entry.img} alt={entry.label} style={{ width: 56, height: 40, objectFit: 'cover', borderRadius: 5, flexShrink: 0 }} />
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{entry.label}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{entry.time}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)', fontStyle: 'italic' }}>{entry.note}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
 
              {/* Progress */}
              <div className="atl-rail-block">
                <div className="atl-rail-title">Progress</div>
                <div style={{ marginBottom: 8 }}>
                  <div className="atl-progress-bar" style={{ height: '6px' }}>
                    <div className="atl-progress-fill" style={{ width: `${selectedCont.progress}%` }} />
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{selectedCont.progress}%</div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--muted)' }}>Version {selectedCont.version} of the journey</div>
              </div>
            </div>
          </div>
        </div>
      )
    }
 
    // List view
    return (
      <div className="atl-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="atl-page-heading">Continuations</div>
          <button className="atl-btn atl-btn-primary">
            <Plus size={14} /> New Continuation
          </button>
        </div>
 
        <div className="atl-filter-row mb-4">
          {['All', 'My Work', 'Witnessing', 'Digital', 'Traditional', 'VTuber'].map(f => (
            <button
              key={f}
              className={`atl-pill${contFilter === f ? ' active' : ''}`}
              onClick={() => setContFilter(f)}
            >{f}</button>
          ))}
        </div>
 
        <div className="atl-grid-3">
          {CONTINUATIONS.map(c => (
            <ContinuationCard key={c.id} cont={c} onClick={() => setSelectedCont(c)} />
          ))}
          {/* Teaser empty card */}
          <div className="atl-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12, cursor: 'pointer', border: '1px dashed rgba(196,168,130,0.15)', background: 'transparent' }}>
            <Plus size={24} color="var(--muted)" />
            <div style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center' }}>Start a new journey</div>
          </div>
        </div>
      </div>
    )
  }
 
  // ── Spaces View ─────────────────────────────────────────────────────────────
  const SpacesView = () => (
    <div className="atl-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="atl-page-heading">Spaces</div>
        <button className="atl-btn atl-btn-primary"><Plus size={14} /> Create Space</button>
      </div>
 
      <div className="atl-three-col">
        {/* Left nav */}
        <div>
          <div className="atl-card-padded">
            <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 12 }}>Your Spaces</div>
            {spaces.filter(s => s.joined).map(s => (
              <div key={s.id} className="atl-nav-item" style={{ borderRadius: 6, marginBottom: 2 }}>
                <img src={s.thumb} alt={s.name} style={{ width: 22, height: 22, borderRadius: 3, objectFit: 'cover' }} />
                <span>{s.name}</span>
              </div>
            ))}
          </div>
        </div>
 
        {/* Main */}
        <div>
          <div className="atl-explore-section">
            <div className="atl-section-head">
              <div className="atl-section-title">Your Spaces</div>
              <span className="atl-link-muted">View all</span>
            </div>
            <div className="atl-grid-2 mb-6">
              {spaces.filter(s => s.joined).map(s => (
                <SpaceCard key={s.id} space={s} onJoin={toggleJoin} />
              ))}
            </div>
          </div>
 
          <div className="atl-explore-section">
            <div className="atl-section-head mb-2">
              <div className="atl-section-title">Explore Spaces</div>
            </div>
            <div className="atl-filter-row mb-3">
              {['All', 'Art Style', 'Industry', 'Community', 'Language', 'Tools'].map(f => (
                <button key={f} className={`atl-pill${spaceFilter === f ? ' active' : ''}`} onClick={() => setSpaceFilter(f)}>{f}</button>
              ))}
            </div>
            <div className="atl-explore-grid">
              {spaces.filter(s => !s.joined && (spaceFilter === 'All' || s.category === spaceFilter)).map(s => (
                <SpaceCard key={s.id} space={s} onJoin={toggleJoin} />
              ))}
            </div>
          </div>
        </div>
 
        {/* Right rail */}
        <div>
          <div className="atl-rail-block mb-4">
            <div className="atl-rail-title">Trending Spaces</div>
            {[
              { name: 'Anime Artists',    members: '1.8K', thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=40&h=40&fit=crop' },
              { name: '3D Artists',       members: '1.5K', thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=40&h=40&fit=crop' },
              { name: 'Manga Creators',   members: '920',  thumb: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=40&h=40&fit=crop' },
              { name: 'Traditional Art',  members: '1.2K', thumb: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=40&h=40&fit=crop' },
            ].map((s, i) => (
              <div key={i} className="atl-feed-item">
                <img src={s.thumb} alt={s.name} style={{ width: 32, height: 32, borderRadius: 4, objectFit: 'cover' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{s.members} members</div>
                </div>
                <button className="atl-btn atl-btn-ghost atl-btn-sm">Join</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
 
  // ── Common Room ─────────────────────────────────────────────────────────────
  const CommonRoomView = () => (
    <div className="atl-content">
      <div style={{ marginBottom: 20 }}>
        <div className="atl-page-heading">Common Room</div>
        <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>A space where artists are just people. No work required.</div>
      </div>
 
      <div className="atl-cr-layout">
        {/* Posts */}
        <div>
          <div className="atl-tabs mb-4">
            {([['for-you', 'For You'], ['memes', 'Memes'], ['art', 'Art Talk'], ['discuss', 'Discussion']] as const).map(([v, l]) => (
              <button key={v} className={`atl-tab${crTab === v ? ' active' : ''}`} onClick={() => setCrTab(v)}>{l}</button>
            ))}
          </div>
 
          {/* Compose */}
          <div className="atl-card-padded mb-4">
            <div className="flex gap-3 items-center">
              <img src={CURRENT_USER.avatar} alt="" className="atl-avatar-sm" />
              <div className="atl-input" style={{ cursor: 'text', color: 'var(--muted)' }}>What's on your mind?</div>
            </div>
            <div className="flex gap-3 mt-3" style={{ paddingLeft: 32 }}>
              <button className="atl-post-action"><Image size={14} /> Image</button>
              <button className="atl-post-action"><FileText size={14} /> Art</button>
              <button className="atl-post-action"><Smile size={14} /> Meme</button>
            </div>
          </div>
 
          {CR_POSTS.map(post => (
            <div key={post.id} className="atl-post">
              <div className="flex items-center gap-3 mb-3">
                <img src={post.avatar} alt={post.author} className="atl-avatar-sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{post.author}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{post.handle} · {post.time}</div>
                </div>
                <button className="atl-menu-btn"><MoreHorizontal size={14} /></button>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text)', marginBottom: 12, lineHeight: 1.5 }}>{post.content}</p>
              {post.image && <img src={post.image} alt="" className="atl-meme-img mb-3" />}
              <div className="atl-post-actions">
                <button className="atl-post-action"><Heart size={14} />{post.hearts}</button>
                <button className="atl-post-action"><MessageCircle size={14} />{post.comments}</button>
                <button className="atl-post-action"><Share2 size={14} /> Share</button>
              </div>
            </div>
          ))}
        </div>
 
        {/* Right panel */}
        <div>
          <div className="atl-rail-block mb-4">
            <div className="atl-rail-title">Online Now</div>
            {PEOPLE.filter(p => p.online).map(p => (
              <div key={p.name} className="atl-feed-item">
                <div style={{ position: 'relative' }}>
                  <img src={p.avatar} alt={p.name} className="atl-avatar-sm" />
                  <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#86c795', border: '1.5px solid var(--surface)' }} />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{p.role}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div className="atl-rail-block">
            <div className="atl-rail-title">Common Room Philosophy</div>
            <div className="atl-callout">
              Artists need fun. Not everything should be work.
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10, lineHeight: 1.6 }}>
              This space exists so art communities don't become emotionally exhausting.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
 
  // ── Live Studios ────────────────────────────────────────────────────────────
  const LiveStudiosView = () => (
    <div className="atl-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="atl-page-heading">Live Studios</div>
          <div style={{ fontSize: 13, color: 'var(--muted)', marginTop: 4 }}>Witness creation in progress. No performance required.</div>
        </div>
        <button className="atl-btn atl-btn-primary"><Radio size={14} /> Open Studio</button>
      </div>
 
      <div className="atl-tabs">
        {([['all', 'All Studios'], ['watching', 'Watching']] as const).map(([v, l]) => (
          <button key={v} className={`atl-tab${liveTab === v ? ' active' : ''}`} onClick={() => setLiveTab(v)}>{l}</button>
        ))}
      </div>
 
      <div className="atl-grid-3 mb-8">
        {LIVE_STUDIOS.map(s => (
          <LiveStudioCard key={s.artist} studio={s} />
        ))}
      </div>
 
      {/* Featured: Daro's studio expanded */}
      <div style={{ marginBottom: 20 }}>
        <div className="atl-section-title mb-4">Featured Studio</div>
        <div className="atl-card">
          <div style={{ position: 'relative' }}>
            <img src={LIVE_STUDIOS[0].thumb} alt="Daro's studio" style={{ width: '100%', aspectRatio: '16/6', objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(14,13,12,0) 40%, rgba(14,13,12,0.85) 100%)' }} />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '20px 24px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <img src={LIVE_STUDIOS[0].avatar} alt="Daro" className="atl-avatar-md" />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>Daro</div>
                    <div style={{ fontSize: 12, color: 'rgba(240,236,228,0.7)' }}>Environment Painting</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(239,68,68,0.2)', borderRadius: 4, padding: '4px 8px', marginLeft: 8 }}>
                    <div className="atl-live-dot" />
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#ef4444' }}>LIVE</span>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{ fontSize: 13, color: 'rgba(240,236,228,0.7)', display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} /> {LIVE_STUDIOS[0].viewers} witnessing</span>
                </div>
              </div>
              <button className="atl-btn atl-btn-primary">
                <Play size={14} /> Enter Studio
              </button>
            </div>
          </div>
          <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(196,168,130,0.06)', display: 'flex', gap: 10 }}>
            {chatMessages.slice(-3).map((m, i) => (
              <div key={i} style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', gap: 6 }}>
                <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{m.from}</span>
                <span>{m.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
 
  // ── Commissions View ────────────────────────────────────────────────────────
  const CommissionsView = () => {
    const [selectedComm, setSelectedComm] = useState<typeof COMMISSIONS[0] | null>(null)
 
    if (selectedComm) return (
      <div className="atl-content">
        <button className="atl-btn atl-btn-ghost atl-btn-sm mb-4" onClick={() => setSelectedComm(null)}>
          <ArrowLeft size={13} /> Back
        </button>
 
        <div className="atl-detail-layout">
          <div>
            <div style={{ fontWeight: 700, fontSize: 20, color: 'var(--text)', marginBottom: 4 }}>{selectedComm.title}</div>
            <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>For {selectedComm.client}</div>
 
            <div className="atl-card-padded mb-4">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>Progress</div>
              <div className="atl-steps">
                {selectedComm.steps.map((step, i) => (
                  <div key={step} className="atl-commission-step">
                    <div className={`atl-step-circle ${i < selectedComm.currentStep ? 'atl-step-done' : i === selectedComm.currentStep ? 'atl-step-active' : 'atl-step-idle'}`}>
                      {i < selectedComm.currentStep ? <Check size={10} /> : i + 1}
                    </div>
                    <span style={{ fontSize: 13, color: i <= selectedComm.currentStep ? 'var(--text)' : 'var(--muted)', fontWeight: i === selectedComm.currentStep ? 600 : 400 }}>{step}</span>
                    {i === selectedComm.currentStep && <span className="atl-badge atl-badge-gold" style={{ marginLeft: 'auto' }}>In Progress</span>}
                    {i < selectedComm.currentStep && <span style={{ marginLeft: 'auto', fontSize: 11, color: '#86c795' }}>Completed</span>}
                  </div>
                ))}
              </div>
            </div>
 
            {/* Latest update */}
            <div className="atl-card-padded mb-4">
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Latest Update</div>
              <img src={CONTINUATIONS[0].thumb} alt="wip" style={{ width: '100%', aspectRatio: '16/9', objectFit: 'cover', borderRadius: 8, display: 'block', marginBottom: 10 }} />
              <p style={{ fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, fontStyle: 'italic' }}>Working on the color palette and values.</p>
            </div>
          </div>
 
          <div>
            <div className="atl-rail-block mb-4">
              <div className="atl-rail-title">Commission Details</div>
              {[
                ['Client',  selectedComm.client],
                ['Price',   selectedComm.price],
                ['Due',     selectedComm.due],
                ['Status',  selectedComm.status],
              ].map(([k, v]) => (
                <div key={k} className="atl-insight-row">
                  <span style={{ color: 'var(--muted)', fontSize: 12 }}>{k}</span>
                  <span style={{ color: 'var(--text)', fontSize: 12, fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
 
            {/* Client chat snippet */}
            <div className="atl-rail-block">
              <div className="atl-rail-title">Chat with Client</div>
              <div style={{ marginBottom: 10 }}>
                {[
                  { text: 'This is looking great!', from: 'Client', own: false },
                  { text: 'Working on shading next', from: 'Mizu', own: true },
                ].map((m, i) => (
                  <div key={i} className="atl-chat-msg" style={{ flexDirection: m.own ? 'row-reverse' : 'row' }}>
                    <div className={`atl-chat-bubble${m.own ? ' own' : ''}`} style={{ fontSize: 12 }}>{m.text}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input className="atl-input" placeholder="Message client..." style={{ fontSize: 12 }} />
                <button className="atl-btn atl-btn-primary atl-btn-sm"><Send size={12} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
 
    return (
      <div className="atl-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div className="atl-page-heading">Commissions</div>
          <button className="atl-btn atl-btn-primary"><Plus size={14} /> Open Commission</button>
        </div>
 
        <div className="atl-tabs">
          {([['my', 'My Commissions'], ['browse', 'Browse Artists']] as const).map(([v, l]) => (
            <button key={v} className={`atl-tab${commTab === v ? ' active' : ''}`} onClick={() => setCommTab(v)}>{l}</button>
          ))}
        </div>
 
        {commTab === 'my' ? (
          <div>
            {(['Active', 'Pending', 'Completed', 'Cancelled'] as const).map(status => {
              const filtered = COMMISSIONS.filter(c =>
                status === 'Active' ? c.status === 'In Progress' :
                status === 'Pending' ? c.status === 'Pending' : false
              )
              if (filtered.length === 0) return null
              return (
                <div key={status} className="mb-6">
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 10 }}>{status}</div>
                  {filtered.map(c => (
                    <div key={c.id} className="atl-commission-row" onClick={() => setSelectedComm(c)} style={{ cursor: 'pointer' }}>
                      <img src={CONTINUATIONS[0].thumb} alt="" style={{ width: 52, height: 40, objectFit: 'cover', borderRadius: 6 }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>{c.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>For {c.client}</div>
                      </div>
                      <div>
                        <span className={`atl-badge ${c.status === 'In Progress' ? 'atl-status-active' : 'atl-status-pending'}`}>
                          {c.status}
                        </span>
                        <div style={{ width: 100, marginTop: 6 }}>
                          <div className="atl-progress-bar">
                            <div className="atl-progress-fill" style={{ width: `${c.progress}%` }} />
                          </div>
                          <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{c.progress}%</div>
                        </div>
                      </div>
                      <ChevronRight size={14} color="var(--muted)" />
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        ) : (
          <div className="atl-grid-3">
            {PEOPLE.map(p => (
              <div key={p.name} className="atl-card-padded">
                <div className="flex items-center gap-3 mb-3">
                  <img src={p.avatar} alt={p.name} className="atl-avatar-md" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)' }}>{p.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.role}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
                  <span className="atl-badge atl-badge-green">Open</span>
                  <span style={{ fontSize: 12, color: 'var(--muted)' }}>From $60</span>
                </div>
                <button className="atl-btn atl-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  View Storefront
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }
 
  // ── Support View ─────────────────────────────────────────────────────────────
  const SupportView = () => (
    <div className="atl-content">
      <div className="atl-page-heading mb-6">Support</div>
 
      <div className="atl-tabs">
        {([['supporters', 'Supporters'], ['goals', 'Goals'], ['benefits', 'Benefits']] as const).map(([v, l]) => (
          <button key={v} className={`atl-tab${suppTab === v ? ' active' : ''}`} onClick={() => setSuppTab(v)}>{l}</button>
        ))}
      </div>
 
      {suppTab === 'supporters' && (
        <div className="atl-panel-layout">
          <div>
            <div className="atl-card-padded mb-4">
              <div style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 4 }}>Monthly Goal</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 400, color: 'var(--text)', marginBottom: 12 }}>
                ${SUPPORTER_DATA.goal.current.toLocaleString()} <span style={{ fontSize: 18, color: 'var(--muted)' }}>/ ${SUPPORTER_DATA.goal.target.toLocaleString()}</span>
              </div>
              <div className="atl-goal-bar mb-2">
                <div className="atl-goal-fill" style={{ width: `${(SUPPORTER_DATA.goal.current / SUPPORTER_DATA.goal.target) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)' }}>{Math.round((SUPPORTER_DATA.goal.current / SUPPORTER_DATA.goal.target) * 100)}% — for living expenses and creating more art</div>
            </div>
 
            <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>Top Supporters</div>
            {SUPPORTER_DATA.topSupporters.map((s, i) => (
              <div key={i} className="atl-feed-item">
                <img src={s.avatar} alt={s.name} className="atl-avatar-sm" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{s.name}</div>
                  <div style={{ fontSize: 12, color: 'var(--muted)' }}>{s.amount}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div>
            <div className="atl-rail-block">
              <div className="atl-rail-title">Become a Supporter</div>
              <div style={{ marginBottom: 12 }}>
                {[
                  { tier: 'Witness',   price: '$5/mo',  desc: 'Follow my journey' },
                  { tier: 'Patron',    price: '$15/mo', desc: 'Early access + updates' },
                  { tier: 'Collector', price: '$30/mo', desc: 'Download originals' },
                ].map(t => (
                  <div key={t.tier} className="atl-support-tier mb-2">
                    <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)', marginBottom: 2 }}>{t.tier}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{t.desc}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginTop: 6 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              <button className="atl-btn atl-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                <Heart size={14} /> Support This Artist
              </button>
            </div>
          </div>
        </div>
      )}
 
      {suppTab === 'goals' && (
        <div className="atl-grid-2">
          {[
            { label: 'New Drawing Tablet',  current: 240, target: 500,  desc: 'Upgrade my main tool' },
            { label: 'Art Course Fund',     current: 80,  target: 200,  desc: 'Learn new techniques' },
            { label: 'Studio Setup',        current: 600, target: 1500, desc: 'Proper lighting and desk' },
          ].map(g => (
            <div key={g.label} className="atl-card-padded">
              <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{g.label}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 10 }}>{g.desc}</div>
              <div className="atl-goal-bar mb-2">
                <div className="atl-goal-fill" style={{ width: `${(g.current / g.target) * 100}%` }} />
              </div>
              <div style={{ fontSize: 12, color: 'var(--muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>${g.current}</span>
                <span>${g.target}</span>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {suppTab === 'benefits' && (
        <div className="atl-grid-2">
          {[
            { tier: 'Witness', price: '$5/mo', benefits: ['See all continuations', 'Early WIP posts', 'Monthly note from artist'] },
            { tier: 'Patron',  price: '$15/mo', benefits: ['Everything in Witness', 'Behind-the-scenes content', 'Name in credits', 'Vote on next project'] },
            { tier: 'Collector', price: '$30/mo', benefits: ['Everything in Patron', 'Download high-res files', 'Monthly digital print', 'Direct message access'] },
          ].map(t => (
            <div key={t.tier} className="atl-card-padded">
              <div style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)', marginBottom: 2 }}>{t.tier}</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--gold)', marginBottom: 12 }}>{t.price}</div>
              <div className="atl-steps">
                {t.benefits.map(b => (
                  <div key={b} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.4 }}>
                    <Check size={13} color="#86c795" style={{ flexShrink: 0, marginTop: 1 }} />
                    {b}
                  </div>
                ))}
              </div>
              <button className="atl-btn atl-btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 14 }}>
                Choose {t.tier}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
 
  // ── Profile View ─────────────────────────────────────────────────────────────
  const ProfileView = () => (
    <div className="atl-content">
      {/* Cover */}
      <div className="atl-card mb-4" style={{ overflow: 'hidden' }}>
        <img src="https://images.unsplash.com/photo-1614851099511-773084f6911d?w=1200&h=200&fit=crop" alt="cover" className="atl-cover" />
        <div style={{ padding: '0 20px 20px', position: 'relative' }}>
          <img src={CURRENT_USER.avatar} alt={CURRENT_USER.name} style={{
            width: 72, height: 72, borderRadius: '50%', objectFit: 'cover',
            border: '3px solid var(--surface)', marginTop: -36, display: 'block', marginBottom: 10
          }} />
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: 'var(--text)', fontWeight: 400 }}>{CURRENT_USER.name}</div>
              <div style={{ fontSize: 13, color: 'var(--muted)' }}>{CURRENT_USER.handle} · {CURRENT_USER.role}</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 6, lineHeight: 1.5 }}>{CURRENT_USER.bio}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4, display: 'flex', gap: 12 }}>
                <span>{CURRENT_USER.location}</span>
                <span>Joined {CURRENT_USER.joinYear}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="atl-btn atl-btn-ghost"><Pencil size={13} /> Edit Profile</button>
            </div>
          </div>
          <div className="flex gap-4 mt-3">
            {[
              ['Continuations', '4'],
              ['Followers',     '326'],
              ['Following',     '51'],
            ].map(([l, v]) => (
              <div key={l}>
                <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>{v}</span>
                <span style={{ fontSize: 12, color: 'var(--muted)', marginLeft: 4 }}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
 
      {/* Year filter */}
      <div className="atl-pill-group mb-4">
        {['All', '2025', '2024', '2023', '2022'].map(y => (
          <button key={y} className="atl-pill active">{y}</button>
        ))}
      </div>
 
      <div className="atl-profile-tabs">
        {([['journey', 'Journey'], ['projects', 'Projects'], ['spaces', 'Spaces'], ['about', 'About']] as const).map(([v, l]) => (
          <button key={v} className={`atl-tab${profileTab === v ? ' active' : ''}`} onClick={() => setProfileTab(v)}>{l}</button>
        ))}
      </div>
 
      {profileTab === 'journey' && (
        <div>
          <div className="atl-journey-grid">
            {PROFILE_JOURNEY.map((img, i) => (
              <img key={i} src={img} alt="" className="atl-journey-thumb atl-img-hover" />
            ))}
          </div>
        </div>
      )}
 
      {profileTab === 'about' && (
        <div className="atl-card-padded" style={{ maxWidth: 480 }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Bio</div>
            <p style={{ fontSize: 14, color: 'var(--text)', lineHeight: 1.7 }}>{CURRENT_USER.bio}</p>
          </div>
          <div className="atl-divider" />
          <div className="atl-insight-row">
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Location</span>
            <span style={{ color: 'var(--text)', fontSize: 13 }}>{CURRENT_USER.location}</span>
          </div>
          <div className="atl-insight-row">
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Role</span>
            <span style={{ color: 'var(--text)', fontSize: 13 }}>{CURRENT_USER.role}</span>
          </div>
          <div className="atl-insight-row">
            <span style={{ color: 'var(--muted)', fontSize: 13 }}>Member since</span>
            <span style={{ color: 'var(--text)', fontSize: 13 }}>{CURRENT_USER.joinYear}</span>
          </div>
        </div>
      )}
 
      {profileTab === 'projects' && (
        <div className="atl-grid-3">
          {[
            { name: 'Project Aurora', members: 4, progress: 65, thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=300&h=180&fit=crop' },
            { name: 'Short Animation', members: 2, progress: 40, thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=180&fit=crop' },
          ].map(p => (
            <div key={p.name} className="atl-continuation-card">
              <img src={p.thumb} alt={p.name} className="atl-continuation-thumb" />
              <div className="atl-continuation-body">
                <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Users size={11} />{p.members} members
                </div>
                <div className="atl-progress-bar">
                  <div className="atl-progress-fill" style={{ width: `${p.progress}%` }} />
                </div>
                <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{p.progress}%</div>
              </div>
            </div>
          ))}
        </div>
      )}
 
      {profileTab === 'spaces' && (
        <div className="atl-grid-4">
          {spaces.filter(s => s.joined).map(s => (
            <SpaceCard key={s.id} space={s} onJoin={toggleJoin} />
          ))}
        </div>
      )}
    </div>
  )
 
  // ── Messages View ─────────────────────────────────────────────────────────────
  const MessagesView = () => (
    <div className="atl-content">
      <div className="atl-page-heading mb-4">Messages</div>
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr', gap: 16, height: 'calc(100vh - 140px)' }}>
        {/* Thread list */}
        <div className="atl-card" style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '12px 14px', borderBottom: '1px solid rgba(196,168,130,0.08)' }}>
            <input className="atl-input" placeholder="Search messages..." style={{ fontSize: 12 }} />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {PEOPLE.map(p => (
              <div key={p.name} className="atl-feed-item" style={{ padding: '12px 14px', cursor: 'pointer', borderBottom: '1px solid rgba(196,168,130,0.06)' }}>
                <div style={{ position: 'relative' }}>
                  <img src={p.avatar} alt={p.name} className="atl-avatar-sm" />
                  {p.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 7, height: 7, borderRadius: '50%', background: '#86c795', border: '1.5px solid var(--surface)' }} />}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text)' }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>Hey! saw your latest…</div>
                </div>
              </div>
            ))}
          </div>
        </div>
 
        {/* Active chat */}
        <div className="atl-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(196,168,130,0.08)', display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={PEOPLE[0].avatar} alt={PEOPLE[0].name} className="atl-avatar-sm" />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{PEOPLE[0].name}</div>
              <div style={{ fontSize: 11, color: '#86c795' }}>Online</div>
            </div>
          </div>
 
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {chatMessages.map(m => (
              <div key={m.id} className="atl-chat-msg" style={{ flexDirection: m.own ? 'row-reverse' : 'row', marginBottom: 10 }}>
                {!m.own && <img src={m.avatar} alt={m.from} className="atl-avatar-sm" />}
                <div>
                  <div className={`atl-chat-bubble${m.own ? ' own' : ''}`}>{m.text}</div>
                  <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 3, textAlign: m.own ? 'right' : 'left' }}>{m.time}</div>
                </div>
              </div>
            ))}
          </div>
 
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(196,168,130,0.08)', display: 'flex', gap: 8 }}>
            <button className="atl-menu-btn"><Paperclip size={14} /></button>
            <input
              className="atl-input"
              placeholder="Type a message..."
              value={chatMsg}
              onChange={e => setChatMsg(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendChat()}
              style={{ fontSize: 13 }}
            />
            <button className="atl-btn atl-btn-primary atl-btn-sm" onClick={sendChat}><Send size={13} /></button>
          </div>
        </div>
      </div>
    </div>
  )
 
  // ── Notifications View ───────────────────────────────────────────────────────
  const NotificationsView = () => (
    <div className="atl-content">
      <div className="atl-page-heading mb-4">Notifications</div>
      <div style={{ maxWidth: 560 }}>
        {[
          { text: 'Daro started witnessing your Eclipse journey',      time: '2h ago',  icon: <Eye size={14} />,          color: 'var(--gold)',    avatar: PEOPLE[0].avatar },
          { text: 'Reiko left a note on your Aurora Illustration',     time: '3h ago',  icon: <MessageCircle size={14} />, color: '#64a0dc',       avatar: PEOPLE[2].avatar },
          { text: 'New supporter joined — StarUser is now supporting', time: '5h ago',  icon: <Heart size={14} />,         color: '#e8a0b4',       avatar: SUPPORTER_DATA.topSupporters[0].avatar },
          { text: 'Commission from @hollow_fox — Character Illustration', time: '1d ago', icon: <Briefcase size={14} />,  color: '#86c795',       avatar: PEOPLE[3].avatar },
          { text: 'Ash uploaded a file to Project Aurora',             time: '1d ago',  icon: <FileText size={14} />,     color: 'var(--muted)',  avatar: PEOPLE[1].avatar },
          { text: 'Your monthly goal reached 60%',                     time: '2d ago',  icon: <TrendingUp size={14} />,   color: 'var(--gold)',   avatar: CURRENT_USER.avatar },
        ].map((n, i) => (
          <div key={i} className="atl-feed-item" style={{ padding: '14px 0' }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: `${n.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: n.color, flexShrink: 0 }}>
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: 'var(--text)', lineHeight: 1.5 }}>{n.text}</div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 3 }}>{n.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
 
  // ── Projects View ────────────────────────────────────────────────────────────
  const ProjectsView = () => (
    <div className="atl-content">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div className="atl-page-heading">Projects</div>
        <button className="atl-btn atl-btn-primary"><Plus size={14} /> New Project</button>
      </div>
 
      <div className="atl-grid-3">
        {[
          { name: 'Project Aurora',  desc: 'A short fantasy animation about two travelers crossing a forgotten world.', tags: ['Animation', 'Fantasy', 'Short Film'], members: 4, tasks: 12, thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400&h=240&fit=crop', progress: 65 },
          { name: 'Short Animation', desc: 'Quick proof-of-concept for a new technique.',                               tags: ['2D', 'Test'],                         members: 2, tasks: 5,  thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&h=240&fit=crop', progress: 40 },
          { name: 'Comic Chapter 2', desc: 'Continuing the series from chapter one.',                                  tags: ['Manga', 'Story'],                     members: 2, tasks: 9,  thumb: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&h=240&fit=crop', progress: 75 },
        ].map(p => (
          <div key={p.name} className="atl-continuation-card">
            <img src={p.thumb} alt={p.name} className="atl-continuation-thumb" />
            <div className="atl-continuation-body">
              <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)', marginBottom: 4 }}>{p.name}</div>
              <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.5, marginBottom: 8 }}>{p.desc}</div>
              <div className="flex gap-2 mb-3">
                {p.tags.map(t => <span key={t} className="atl-badge atl-badge-purple">{t}</span>)}
              </div>
              <div className="flex items-center gap-3" style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', gap: 2 }}>
                  {Array.from({ length: p.members }).map((_, i) => (
                    <img key={i} src={PEOPLE[i % PEOPLE.length].avatar} alt="" style={{ width: 20, height: 20, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--surface)', marginLeft: i > 0 ? -8 : 0 }} />
                  ))}
                </div>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.members} members</span>
                <span style={{ fontSize: 11, color: 'var(--muted)' }}>{p.tasks} tasks</span>
              </div>
              <div className="atl-progress-bar">
                <div className="atl-progress-fill" style={{ width: `${p.progress}%` }} />
              </div>
              <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 4, textAlign: 'right' }}>{p.progress}%</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
 
  // ── Router ──────────────────────────────────────────────────────────────────
  const renderView = () => {
    switch (activeNav) {
      case 'home':          return <HomeView />
      case 'continuations': return <ContinuationsView />
      case 'spaces':        return <SpacesView />
      case 'common-room':   return <CommonRoomView />
      case 'live-studios':  return <LiveStudiosView />
      case 'commissions':   return <CommissionsView />
      case 'support':       return <SupportView />
      case 'messages':      return <MessagesView />
      case 'notifications': return <NotificationsView />
      case 'profile':       return <ProfileView />
      case 'projects':      return <ProjectsView />
      default:              return <HomeView />
    }
  }
 
  const pageTitles: Record<string, string> = {
    home: 'Dashboard', continuations: 'Continuations', spaces: 'Spaces',
    'common-room': 'Common Room', 'live-studios': 'Live Studios',
    commissions: 'Commissions', support: 'Support', messages: 'Messages',
    notifications: 'Notifications', profile: 'Profile', projects: 'Projects', settings: 'Settings',
  }
 
  return (
    <div className="atl-shell">
      <Sidebar active={activeNav} onNav={setActiveNav} />
      <div className="atl-main">
        {/* Topbar */}
        <div className="atl-topbar">
          <div>
            <div className="atl-topbar-title">{pageTitles[activeNav] ?? 'Atelier'}</div>
          </div>
          <div className="atl-topbar-actions">
            <div className="atl-search">
              <Search size={13} />
              <input
                className="atl-input"
                placeholder="Search..."
                value={searching}
                onChange={e => setSearching(e.target.value)}
                style={{ fontSize: 12 }}
              />
            </div>
            <div className="atl-notif-wrap" style={{ cursor: 'pointer' }} onClick={() => setActiveNav('notifications')}>
              <Bell size={18} color="var(--muted)" />
              <div className="atl-notif-dot" />
            </div>
            <img
              src={CURRENT_USER.avatar}
              alt={CURRENT_USER.name}
              className="atl-avatar-sm"
              style={{ cursor: 'pointer' }}
              onClick={() => setActiveNav('profile')}
            />
          </div>
        </div>
 
        {/* Page content */}
        <div className="atl-fade-up">
          {renderView()}
        </div>
      </div>
      <MobileNav active={activeNav} onNav={setActiveNav} />
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Atelier_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animations
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <AtelierPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Atelier_Index
