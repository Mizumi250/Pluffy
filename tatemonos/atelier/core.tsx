
Hi

23:41
Hi Mizumi! What's up?


arkzen-main__53_.zip
ZIP

706734176b6024aa630408ff9f4d5cec.webp
content.png
b3e3418fff6bfda422fff165dc1556d9.jpg
f5525a868c4b21e044b6e871c8a16803.webp
content (1).png
e6acc732d085e3a5d716a6d697731c4d.jpg
a32b76c514086f5c751cd9143b3fb967.webp
83dfef2c2bd12c85e89e7c498c9bd7b8.jpg
6f110e04aa5463ec28e400b33c56c3cb.jpg
4cddc25e2377bdb8e88b450722daf133.jpg
71c3c64dd650e48047a15d89560a74c2.webp
5926002fbddb7a49ef6642fae95f19e4.webp
2c25d9afe774f77f71785410e2d827c9.jpg

ATELIER A Home for Creative Journeys Overview ATELIER is a social platform designed specifically for artists, supporters, commissioners, and creative collaborators. Unlike traditional social media where content is optimized for engagement, popularity, and algorithms, Atelier is designed around a d

PASTED

CREATE A TATEMONO FOR Atelier, both web and native app, FRONTEND FOR NOW, DONT USE EMOJI ONLY ICONS, USE ONLINE IMAGES FOR NOW, NO BACKEND FOR NOW, JUST FRONTEND, MUST BE FOLLOWING THE WIREFRAME, THE UI IMAGES, ALL THE IMAGES I SENT YOU, NOTE: YOU CAN REFERENCE OTHER TATEMONO FOR GUIDANCE IN CREATING

23:43
Let me start by reading the relevant files from the uploaded zip and existing tatemonos for reference.


Ran 9 commands, viewed a file
Ran 9 commands, viewed a file
Good, now I have a solid understanding of the DSL format. Let me also check the ARKZEN_GUIDELINES for v9:


Ran 4 commands
Ran 4 commands
Now I have enough context. Let me read the native block format specifically:


Ran 4 commands
Ran 4 commands
Now I have everything I need. Let me read the frontend-design skill quickly and then build the tatemono:


Read frontend design skill
Read frontend design skill
Now I have everything. Let me build the Atelier tatemono. This is a large, complex file — I'll structure it with multiple web pages (Home/Dashboard, Continuation view, Spaces, Common Room, Commissions, Profile) and native screens:


Ran a command, created a file
Ran a command, created a file

Create working dir

Script

Atelier tatemono - web and native frontend
core.tsx
Done

Claude Fable 5 is currently unavailable.
Learn more(opens in new tab)




Claude is AI and can make mistakes. Please double-check responses.


Core · TSX
/* @arkzen:meta
name: atelier
version: 1.0.0
description: Atelier — A Home for Creative Journeys. Social platform for artists, supporters, commissioners, and collaborators. Centered on creative continuations rather than isolated posts.
auth: false
*/
 
/* @arkzen:meta:web
label: Atelier
title: Atelier — A Home for Creative Journeys
favicon: https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=32&h=32&fit=crop
*/
 
/* @arkzen:meta:native
label: Atelier
description: Atelier — creative journeys, continuations, and community
expo:
  bundle_id: com.eunoia.atelier
  scheme: atelier
  version: 1.0.0
  orientation: portrait
  status_bar_style: light
*/
 
/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen"
*/
 
/* @arkzen:native:config
theme:
  primary: "#c4a882"
  background: "#0e0d0c"
  surface: "#1a1917"
  text: "#f0ece4"
  muted: "#6b6560"
*/
 
/* @arkzen:web:style */
 
/* ── Global reset / tokens ───────────────────────────────────────────────── */
:root {
  --ink:       #0e0d0c;
  --warm-50:   #faf8f5;
  --warm-100:  #f2ede6;
  --warm-200:  #e4dbd0;
  --warm-400:  #b5a898;
  --warm-600:  #8a7968;
  --warm-800:  #4a3f34;
  --gold:      #c4a882;
  --gold-dim:  #a08560;
  --surface:   #1a1917;
  --surface-2: #242220;
  --muted:     #6b6560;
  --text:      #f0ece4;
  --text-dim:  #b5a898;
  --radius:    12px;
  --font-display: 'Georgia', 'Times New Roman', serif;
  --font-body:    system-ui, -apple-system, sans-serif;
  --font-mono:    'SF Mono', 'Fira Code', monospace;
}
 
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
 
body { background: var(--ink); color: var(--text); font-family: var(--font-body); }
 
/* ── Utility classes ─────────────────────────────────────────────────────── */
.atl-shell {
  display: flex;
  min-height: 100vh;
  background: var(--ink);
}
 
/* Sidebar */
.atl-sidebar {
  width: 220px;
  flex-shrink: 0;
  background: var(--surface);
  border-right: 1px solid rgba(196,168,130,0.08);
  display: flex;
  flex-direction: column;
  padding: 0;
  position: fixed;
  top: 0; left: 0; bottom: 0;
  z-index: 40;
}
 
.atl-sidebar-logo {
  padding: 24px 20px 20px;
  border-bottom: 1px solid rgba(196,168,130,0.08);
}
 
.atl-sidebar-logo-wordmark {
  font-family: var(--font-display);
  font-size: 20px;
  font-weight: 400;
  letter-spacing: 0.08em;
  color: var(--gold);
}
 
.atl-sidebar-logo-tagline {
  font-size: 10px;
  color: var(--muted);
  letter-spacing: 0.06em;
  margin-top: 2px;
}
 
.atl-nav {
  flex: 1;
  padding: 16px 0;
  overflow-y: auto;
}
 
.atl-nav-section {
  padding: 8px 16px 4px;
  font-size: 9px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
 
.atl-nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 16px;
  font-size: 13px;
  color: var(--text-dim);
  border-radius: 0;
  cursor: pointer;
  transition: all 0.15s ease;
  text-decoration: none;
  border-left: 2px solid transparent;
  margin: 1px 0;
}
 
.atl-nav-item:hover {
  background: rgba(196,168,130,0.06);
  color: var(--text);
}
 
.atl-nav-item.active {
  background: rgba(196,168,130,0.1);
  color: var(--gold);
  border-left-color: var(--gold);
}
 
.atl-nav-item svg { flex-shrink: 0; }
 
.atl-sidebar-user {
  padding: 16px;
  border-top: 1px solid rgba(196,168,130,0.08);
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.atl-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.atl-avatar-sm {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.atl-avatar-md {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.atl-avatar-lg {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}
 
.atl-user-name { font-size: 13px; font-weight: 500; color: var(--text); }
.atl-user-role { font-size: 11px; color: var(--muted); }
 
/* Main content area */
.atl-main {
  margin-left: 220px;
  flex: 1;
  min-height: 100vh;
  overflow: auto;
}
 
.atl-topbar {
  position: sticky;
  top: 0;
  z-index: 30;
  background: rgba(14,13,12,0.85);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(196,168,130,0.06);
  padding: 14px 32px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
 
.atl-topbar-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text);
}
 
.atl-topbar-sub {
  font-size: 12px;
  color: var(--muted);
  margin-top: 1px;
}
 
.atl-topbar-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}
 
.atl-content {
  padding: 32px;
  max-width: 1400px;
}
 
/* Cards */
.atl-card {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  overflow: hidden;
}
 
.atl-card-padded {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  padding: 20px;
}
 
/* Grid layouts */
.atl-grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
 
.atl-grid-2 {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}
 
.atl-grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
 
/* Continuation / Journey card */
.atl-continuation-card {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: border-color 0.2s ease, transform 0.2s ease;
}
 
.atl-continuation-card:hover {
  border-color: rgba(196,168,130,0.22);
  transform: translateY(-2px);
}
 
.atl-continuation-thumb {
  width: 100%;
  aspect-ratio: 16/10;
  object-fit: cover;
  display: block;
}
 
.atl-continuation-body {
  padding: 14px 16px 16px;
}
 
.atl-continuation-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}
 
.atl-label {
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--muted);
  font-weight: 600;
}
 
.atl-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.04em;
}
 
.atl-badge-gold {
  background: rgba(196,168,130,0.15);
  color: var(--gold);
}
 
.atl-badge-green {
  background: rgba(134,199,149,0.15);
  color: #86c795;
}
 
.atl-badge-blue {
  background: rgba(100,160,220,0.15);
  color: #64a0dc;
}
 
.atl-badge-purple {
  background: rgba(170,130,210,0.15);
  color: #aa82d2;
}
 
.atl-progress-bar {
  height: 3px;
  background: rgba(196,168,130,0.15);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 10px;
}
 
.atl-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dim), var(--gold));
  border-radius: 2px;
  transition: width 0.4s ease;
}
 
/* Timeline */
.atl-timeline {
  position: relative;
  padding-left: 20px;
}
 
.atl-timeline::before {
  content: '';
  position: absolute;
  left: 6px; top: 0; bottom: 0;
  width: 1px;
  background: rgba(196,168,130,0.12);
}
 
.atl-timeline-item {
  position: relative;
  padding-bottom: 20px;
}
 
.atl-timeline-dot {
  position: absolute;
  left: -17px;
  top: 5px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--gold);
  box-shadow: 0 0 0 3px rgba(196,168,130,0.15);
}
 
.atl-timeline-dot.now {
  background: #86c795;
  box-shadow: 0 0 0 3px rgba(134,199,149,0.15);
  animation: pulse-now 2s ease-in-out infinite;
}
 
@keyframes pulse-now {
  0%, 100% { box-shadow: 0 0 0 3px rgba(134,199,149,0.15); }
  50% { box-shadow: 0 0 0 6px rgba(134,199,149,0.08); }
}
 
/* Buttons */
.atl-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border: none;
  cursor: pointer;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 16px;
  transition: all 0.15s ease;
  font-family: var(--font-body);
}
 
.atl-btn-primary {
  background: var(--gold);
  color: var(--ink);
}
 
.atl-btn-primary:hover {
  background: #d4b892;
  transform: translateY(-1px);
}
 
.atl-btn-ghost {
  background: rgba(196,168,130,0.08);
  color: var(--text-dim);
  border: 1px solid rgba(196,168,130,0.12);
}
 
.atl-btn-ghost:hover {
  background: rgba(196,168,130,0.14);
  color: var(--text);
}
 
.atl-btn-sm {
  padding: 5px 12px;
  font-size: 12px;
  border-radius: 6px;
}
 
/* Input */
.atl-input {
  background: rgba(196,168,130,0.06);
  border: 1px solid rgba(196,168,130,0.12);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 13px;
  color: var(--text);
  font-family: var(--font-body);
  outline: none;
  width: 100%;
  transition: border-color 0.15s ease;
}
 
.atl-input::placeholder { color: var(--muted); }
.atl-input:focus { border-color: rgba(196,168,130,0.35); }
 
/* Section heading */
.atl-section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
 
.atl-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text);
}
 
.atl-link-muted {
  font-size: 12px;
  color: var(--muted);
  text-decoration: none;
  cursor: pointer;
}
 
.atl-link-muted:hover { color: var(--gold); }
 
/* Space card */
.atl-space-card {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
}
 
.atl-space-card:hover { border-color: rgba(196,168,130,0.2); }
 
.atl-space-thumb {
  width: 100%;
  aspect-ratio: 16/7;
  object-fit: cover;
}
 
.atl-space-body {
  padding: 12px 14px;
}
 
/* Live studio entry */
.atl-studio-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(196,168,130,0.06);
  cursor: pointer;
}
 
.atl-studio-item:last-child { border-bottom: none; }
 
.atl-live-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #ef4444;
  flex-shrink: 0;
  animation: pulse-live 1.5s ease-in-out infinite;
}
 
@keyframes pulse-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}
 
/* Profile journey grid */
.atl-journey-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
}
 
.atl-journey-thumb {
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 6px;
  cursor: pointer;
  transition: opacity 0.15s ease;
}
 
.atl-journey-thumb:hover { opacity: 0.8; }
 
/* Chat */
.atl-chat-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 12px;
}
 
.atl-chat-bubble {
  background: rgba(196,168,130,0.06);
  border-radius: 10px 10px 10px 2px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--text);
  max-width: 70%;
  line-height: 1.5;
}
 
.atl-chat-bubble.own {
  background: rgba(196,168,130,0.14);
  border-radius: 10px 10px 2px 10px;
  margin-left: auto;
}
 
/* Witness bar */
.atl-witness-bar {
  display: flex;
  align-items: center;
  gap: -6px;
}
 
.atl-witness-avatar {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--surface);
  margin-right: -6px;
}
 
/* State comparison */
.atl-compare {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
}
 
.atl-compare-img {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 8px;
}
 
/* Notification / feed item */
.atl-feed-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(196,168,130,0.06);
}
 
.atl-feed-item:last-child { border-bottom: none; }
 
/* Common room post */
.atl-post {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  padding: 18px;
  margin-bottom: 12px;
}
 
.atl-post-actions {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(196,168,130,0.06);
}
 
.atl-post-action {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  color: var(--muted);
  cursor: pointer;
  background: none;
  border: none;
  padding: 0;
  font-family: var(--font-body);
  transition: color 0.15s ease;
}
 
.atl-post-action:hover { color: var(--gold); }
 
/* Commission */
.atl-commission-row {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px 0;
  border-bottom: 1px solid rgba(196,168,130,0.06);
}
 
.atl-commission-row:last-child { border-bottom: none; }
 
/* Scrollbar */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(196,168,130,0.2); border-radius: 2px; }
 
/* Tab bar */
.atl-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(196,168,130,0.08);
  margin-bottom: 20px;
}
 
.atl-tab {
  padding: 10px 16px;
  font-size: 13px;
  color: var(--muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s ease;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: var(--font-body);
}
 
.atl-tab:hover { color: var(--text); }
 
.atl-tab.active {
  color: var(--gold);
  border-bottom-color: var(--gold);
}
 
/* Highlight */
.atl-highlight {
  font-family: var(--font-display);
  font-style: italic;
  color: var(--gold);
}
 
/* Backdrop for modals */
.atl-overlay {
  position: fixed;
  inset: 0;
  background: rgba(14,13,12,0.75);
  backdrop-filter: blur(4px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
}
 
.atl-modal {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.14);
  border-radius: 16px;
  padding: 28px;
  width: min(560px, 90vw);
  max-height: 85vh;
  overflow-y: auto;
}
 
/* Responsive */
@media (max-width: 1024px) {
  .atl-grid-3 { grid-template-columns: repeat(2, 1fr); }
  .atl-grid-4 { grid-template-columns: repeat(2, 1fr); }
}
 
@media (max-width: 768px) {
  .atl-sidebar { display: none; }
  .atl-main { margin-left: 0; }
  .atl-content { padding: 20px; }
  .atl-grid-3, .atl-grid-2, .atl-grid-4 { grid-template-columns: 1fr; }
}
 
/* Shimmer skeleton */
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
 
.atl-skeleton {
  background: linear-gradient(90deg,
    rgba(196,168,130,0.06) 25%,
    rgba(196,168,130,0.12) 50%,
    rgba(196,168,130,0.06) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
  border-radius: 6px;
}
 
/* Entrance animations */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: translateY(0); }
}
 
.atl-fade-up { animation: fadeUp 0.4s ease forwards; }
.atl-fade-up-1 { animation: fadeUp 0.4s 0.05s ease both; }
.atl-fade-up-2 { animation: fadeUp 0.4s 0.10s ease both; }
.atl-fade-up-3 { animation: fadeUp 0.4s 0.15s ease both; }
.atl-fade-up-4 { animation: fadeUp 0.4s 0.20s ease both; }
 
/* ── Common Room meme grid ──────────────────────────────────────────────── */
.atl-meme-img {
  width: 100%;
  border-radius: 10px;
  object-fit: cover;
}
 
/* Supporting count badge */
.atl-count {
  font-size: 11px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 4px;
}
 
/* ── Banner gradient overlay ─────────────────────────────────────────────── */
.atl-banner {
  position: relative;
  width: 100%;
  aspect-ratio: 3/1;
  overflow: hidden;
  border-radius: var(--radius) var(--radius) 0 0;
}
 
.atl-banner img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
 
.atl-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, rgba(14,13,12,0.1) 0%, rgba(14,13,12,0.7) 100%);
}
 
/* Divider */
.atl-divider {
  height: 1px;
  background: rgba(196,168,130,0.08);
  margin: 20px 0;
}
 
/* ── Two-panel layout ──────────────────────────────────────────────────── */
.atl-panel-layout {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 20px;
}
 
@media (max-width: 1100px) {
  .atl-panel-layout { grid-template-columns: 1fr; }
}
 
/* ── Continuation detail ─────────────────────────────────────────────────── */
.atl-detail-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
  align-items: start;
}
 
@media (max-width: 1000px) {
  .atl-detail-layout { grid-template-columns: 1fr; }
}
 
/* ── Filter pill ─────────────────────────────────────────────────────────── */
.atl-pill-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}
 
.atl-pill {
  padding: 5px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(196,168,130,0.14);
  background: transparent;
  color: var(--muted);
  font-family: var(--font-body);
  transition: all 0.15s ease;
}
 
.atl-pill:hover { color: var(--text); border-color: rgba(196,168,130,0.3); }
 
.atl-pill.active {
  background: rgba(196,168,130,0.14);
  color: var(--gold);
  border-color: rgba(196,168,130,0.3);
}
 
/* ── Support tiers ─────────────────────────────────────────────────────── */
.atl-support-tier {
  background: rgba(196,168,130,0.04);
  border: 1px solid rgba(196,168,130,0.1);
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}
 
.atl-support-tier:hover {
  border-color: rgba(196,168,130,0.25);
  background: rgba(196,168,130,0.08);
}
 
/* ── Presence indicator ──────────────────────────────────────────────────── */
.atl-presence {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--muted);
}
 
.atl-presence-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: rgba(134,199,149,0.6);
}
 
/* ── Commission status pills ─────────────────────────────────────────────── */
.atl-status-active    { background: rgba(134,199,149,0.12); color: #86c795; }
.atl-status-pending   { background: rgba(250,204,21,0.12);  color: #facc15; }
.atl-status-completed { background: rgba(100,160,220,0.12); color: #64a0dc; }
.atl-status-cancelled { background: rgba(239,68,68,0.12);   color: #ef4444; }
 
/* ── Steps progress ──────────────────────────────────────────────────────── */
.atl-steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
 
.atl-step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
 
.atl-step-circle {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 10px;
  font-weight: 700;
}
 
.atl-step-done   { background: rgba(134,199,149,0.2); color: #86c795; }
.atl-step-active { background: rgba(196,168,130,0.2); color: var(--gold); }
.atl-step-idle   { background: rgba(196,168,130,0.06); color: var(--muted); }
 
/* ── Spaces explore grid ─────────────────────────────────────────────────── */
.atl-explore-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 12px;
}
 
/* Search bar */
.atl-search {
  position: relative;
  width: 240px;
}
 
.atl-search svg {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--muted);
  pointer-events: none;
}
 
.atl-search input {
  padding-left: 34px;
}
 
/* ── Mobile nav bar ──────────────────────────────────────────────────────── */
.atl-mobile-nav {
  display: none;
  position: fixed;
  bottom: 0; left: 0; right: 0;
  background: rgba(26,25,23,0.95);
  backdrop-filter: blur(12px);
  border-top: 1px solid rgba(196,168,130,0.08);
  padding: 10px 0 max(10px, env(safe-area-inset-bottom));
  z-index: 50;
}
 
@media (max-width: 768px) {
  .atl-mobile-nav { display: flex; justify-content: space-around; }
  .atl-main { padding-bottom: 70px; }
}
 
.atl-mob-nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  color: var(--muted);
  font-size: 10px;
  cursor: pointer;
  transition: color 0.15s;
  background: none;
  border: none;
  font-family: var(--font-body);
  padding: 4px 12px;
}
 
.atl-mob-nav-item.active { color: var(--gold); }
.atl-mob-nav-item:hover  { color: var(--text); }
 
/* ── Witness count ─────────────────────────────────────────────────────── */
.atl-witness-count {
  font-size: 12px;
  color: var(--muted);
  display: flex;
  align-items: center;
  gap: 6px;
}
 
/* ── Page heading ──────────────────────────────────────────────────────── */
.atl-page-heading {
  font-family: var(--font-display);
  font-size: 26px;
  font-weight: 400;
  color: var(--text);
  letter-spacing: -0.01em;
}
 
/* ── Supporter goal bar ────────────────────────────────────────────────── */
.atl-goal-bar {
  background: rgba(196,168,130,0.1);
  border-radius: 4px;
  height: 6px;
  overflow: hidden;
}
 
.atl-goal-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--gold-dim), var(--gold));
  border-radius: 4px;
}
 
/* ── Notification bell badge ─────────────────────────────────────────────── */
.atl-notif-wrap {
  position: relative;
}
 
.atl-notif-dot {
  position: absolute;
  top: -2px; right: -2px;
  width: 7px; height: 7px;
  border-radius: 50%;
  background: var(--gold);
  border: 1.5px solid var(--ink);
}
 
/* ── Two-col profile ─────────────────────────────────────────────────────── */
.atl-profile-layout {
  display: grid;
  grid-template-columns: 240px 1fr;
  gap: 24px;
  align-items: start;
}
 
@media (max-width: 800px) {
  .atl-profile-layout { grid-template-columns: 1fr; }
}
 
/* ── Separator text ──────────────────────────────────────────────────────── */
.atl-sep-text {
  text-align: center;
  position: relative;
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
 
.atl-sep-text::before, .atl-sep-text::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 40%;
  height: 1px;
  background: rgba(196,168,130,0.1);
}
 
.atl-sep-text::before { left: 0; }
.atl-sep-text::after  { right: 0; }
 
/* ── Witness button ──────────────────────────────────────────────────────── */
.atl-witness-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 7px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid rgba(196,168,130,0.25);
  background: rgba(196,168,130,0.08);
  color: var(--text);
  font-family: var(--font-body);
  transition: all 0.15s ease;
}
 
.atl-witness-btn.witnessing {
  background: rgba(196,168,130,0.16);
  color: var(--gold);
  border-color: rgba(196,168,130,0.35);
}
 
.atl-witness-btn:hover {
  background: rgba(196,168,130,0.14);
  border-color: rgba(196,168,130,0.4);
  color: var(--gold);
}
 
/* ── Quick intro/tagline hero ────────────────────────────────────────────── */
.atl-hero-serif {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 400;
  color: var(--text);
  line-height: 1.18;
  letter-spacing: -0.02em;
}
 
.atl-hero-serif span {
  color: var(--gold);
  font-style: italic;
}
 
/* ── Explore pill active state ───────────────────────────────────────────── */
.atl-explore-section {
  margin-bottom: 28px;
}
 
/* ── Continuation page header ────────────────────────────────────────────── */
.atl-cont-page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 24px;
}
 
/* ── Project progress ring ─────────────────────────────────────────────── */
.atl-progress-ring-wrap {
  position: relative;
  width: 48px;
  height: 48px;
  flex-shrink: 0;
}
 
/* ── Inline mention ──────────────────────────────────────────────────────── */
.atl-mention {
  color: var(--gold);
  cursor: pointer;
}
 
/* ── Insight bar ──────────────────────────────────────────────────────────── */
.atl-insight-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid rgba(196,168,130,0.06);
  font-size: 13px;
}
 
.atl-insight-row:last-child { border-bottom: none; }
 
/* ── File attachment ─────────────────────────────────────────────────────── */
.atl-file-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 6px;
  background: rgba(196,168,130,0.07);
  border: 1px solid rgba(196,168,130,0.12);
  font-size: 11px;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.15s;
}
 
.atl-file-chip:hover { background: rgba(196,168,130,0.14); }
 
/* ── "No punish absence" indicator ─────────────────────────────────────── */
.atl-absence-note {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: rgba(196,168,130,0.06);
  border-radius: 8px;
  border-left: 2px solid var(--gold-dim);
  font-size: 12px;
  color: var(--muted);
  font-style: italic;
}
 
/* ── Three‑col explore ───────────────────────────────────────────────────── */
.atl-three-col {
  display: grid;
  grid-template-columns: 200px 1fr 260px;
  gap: 20px;
}
 
@media (max-width: 1100px) {
  .atl-three-col { grid-template-columns: 1fr; }
}
 
/* ── Tabs variant: underline ──────────────────────────────────────────────── */
.atl-profile-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid rgba(196,168,130,0.08);
  margin-bottom: 20px;
}
 
/* ── Right rail block ─────────────────────────────────────────────────────── */
.atl-rail-block {
  background: var(--surface);
  border: 1px solid rgba(196,168,130,0.08);
  border-radius: var(--radius);
  padding: 16px;
  margin-bottom: 16px;
}
 
.atl-rail-title {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-dim);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  margin-bottom: 12px;
}
 
/* ── Tooltip-like note ───────────────────────────────────────────────────── */
.atl-note {
  font-size: 12px;
  color: var(--muted);
  line-height: 1.6;
  font-style: italic;
}
 
/* ── Green witness btn (following) ──────────────────────────────────────── */
.atl-btn-witness {
  background: rgba(134,199,149,0.12);
  color: #86c795;
  border: 1px solid rgba(134,199,149,0.2);
  border-radius: 8px;
  padding: 7px 14px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.15s;
  font-family: var(--font-body);
}
 
.atl-btn-witness:hover {
  background: rgba(134,199,149,0.2);
}
 
/* ── Thumbnail row ───────────────────────────────────────────────────────── */
.atl-thumb-row {
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding-bottom: 4px;
}
 
.atl-thumb-row img {
  height: 60px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}
 
/* ── Footer inside sidebar ───────────────────────────────────────────────── */
.atl-sidebar-footer {
  font-size: 10px;
  color: rgba(107,101,96,0.5);
  text-align: center;
  padding: 8px 16px 16px;
}
 
/* ── Year label ──────────────────────────────────────────────────────────── */
.atl-year-label {
  font-size: 11px;
  color: var(--muted);
  letter-spacing: 0.1em;
  font-weight: 600;
  margin-bottom: 8px;
}
 
/* ── Project member stack ────────────────────────────────────────────────── */
.atl-member-stack {
  display: flex;
  align-items: center;
}
 
.atl-member-stack img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--surface);
  margin-right: -8px;
}
 
/* ── Space resource chip ─────────────────────────────────────────────────── */
.atl-resource-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  background: rgba(196,168,130,0.06);
  border: 1px solid rgba(196,168,130,0.1);
  font-size: 12px;
  color: var(--text-dim);
  cursor: pointer;
  transition: background 0.15s;
}
 
.atl-resource-chip:hover { background: rgba(196,168,130,0.12); }
 
/* Misc */
.atl-text-gold { color: var(--gold); }
.atl-text-muted { color: var(--muted); }
.atl-text-dim { color: var(--text-dim); }
.atl-text-sm { font-size: 12px; }
.atl-text-xs { font-size: 11px; }
.atl-font-serif { font-family: var(--font-display); }
.atl-font-mono { font-family: var(--font-mono); }
 
/* ── Continuation "Now" hero thumb ──────────────────────────────────────── */
.atl-now-thumb {
  width: 100%;
  aspect-ratio: 4/3;
  object-fit: cover;
  border-radius: 10px;
  display: block;
}
 
/* ── Continuation page main image ────────────────────────────────────────── */
.atl-cont-hero {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 10px;
  display: block;
  margin-bottom: 16px;
}
 
/* ── Profile cover ───────────────────────────────────────────────────────── */
.atl-cover {
  width: 100%;
  height: 160px;
  object-fit: cover;
  border-radius: var(--radius) var(--radius) 0 0;
  display: block;
}
 
/* ── Common room sidebar panel ───────────────────────────────────────────── */
.atl-cr-layout {
  display: grid;
  grid-template-columns: 1fr 280px;
  gap: 20px;
}
 
@media (max-width: 900px) {
  .atl-cr-layout { grid-template-columns: 1fr; }
}
 
/* ── Mobile section hide ─────────────────────────────────────────────────── */
@media (max-width: 768px) {
  .atl-hide-mobile { display: none; }
}
 
/* ── Search input in topbar ──────────────────────────────────────────────── */
.atl-topbar-search {
  flex: 1;
  max-width: 320px;
}
 
/* ── Three-dot menu ──────────────────────────────────────────────────────── */
.atl-menu-btn {
  width: 30px;
  height: 30px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(196,168,130,0.06);
  border: none;
  cursor: pointer;
  color: var(--muted);
  transition: all 0.15s;
}
 
.atl-menu-btn:hover { background: rgba(196,168,130,0.12); color: var(--text); }
 
/* ── Radio list for spaces join ──────────────────────────────────────────── */
.atl-radio-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.15s;
}
 
.atl-radio-item:hover { background: rgba(196,168,130,0.06); }
 
/* ── Empty state ─────────────────────────────────────────────────────────── */
.atl-empty {
  text-align: center;
  padding: 40px 24px;
  color: var(--muted);
}
 
.atl-empty-icon {
  width: 44px;
  height: 44px;
  margin: 0 auto 12px;
  opacity: 0.4;
}
 
/* ── Image hover ring ────────────────────────────────────────────────────── */
.atl-img-hover {
  transition: box-shadow 0.2s ease;
  cursor: pointer;
}
 
.atl-img-hover:hover {
  box-shadow: 0 0 0 2px var(--gold);
}
 
/* ── Tooltip ────────────────────────────────────────────────────────────── */
[data-tooltip] {
  position: relative;
}
 
[data-tooltip]::after {
  content: attr(data-tooltip);
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  background: rgba(36,34,32,0.95);
  color: var(--text);
  font-size: 11px;
  padding: 4px 8px;
  border-radius: 5px;
  white-space: nowrap;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.15s;
  border: 1px solid rgba(196,168,130,0.12);
}
 
[data-tooltip]:hover::after { opacity: 1; }
 
/* ── Commission step ─────────────────────────────────────────────────────── */
.atl-commission-step {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 8px;
  border: 1px solid rgba(196,168,130,0.08);
  margin-bottom: 8px;
  font-size: 13px;
  transition: background 0.15s;
}
 
.atl-commission-step:hover { background: rgba(196,168,130,0.04); }
 
/* ── Quote callout ───────────────────────────────────────────────────────── */
.atl-callout {
  border-left: 2px solid var(--gold);
  padding-left: 14px;
  font-family: var(--font-display);
  font-style: italic;
  font-size: 15px;
  color: var(--text-dim);
  line-height: 1.6;
}
 
/* Fade scroll direction hint */
.atl-scroll-fade {
  position: relative;
}
 
.atl-scroll-fade::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 40px;
  background: linear-gradient(transparent, var(--surface));
  pointer-events: none;
}
 
/* ── Pill‑row top of spaces ──────────────────────────────────────────────── */
.atl-filter-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}
 
/* Misc layout helpers */
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-start { align-items: flex-start; }
.justify-between { justify-content: space-between; }
.justify-center { justify-content: center; }
.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-4 { gap: 16px; }
.gap-6 { gap: 24px; }
.flex-1 { flex: 1; }
.w-full { width: 100%; }
.relative { position: relative; }
.overflow-hidden { overflow: hidden; }
.mb-1 { margin-bottom: 4px; }
.mb-2 { margin-bottom: 8px; }
.mb-3 { margin-bottom: 12px; }
.mb-4 { margin-bottom: 16px; }
.mb-6 { margin-bottom: 24px; }
.mt-1 { margin-top: 4px; }
.mt-2 { margin-top: 8px; }
.mt-3 { margin-top: 12px; }
.mt-4 { margin-top: 16px; }
.ml-auto { margin-left: auto; }
 
/* @arkzen:web:style:end */
 
/* @arkzen:web:components:shared */
 
'use client'
 
import React, { useState, useRef, useEffect, useCallback } from 'react'
import {
  Home,
  Layers,
  Users,
  Coffee,
  Radio,
  Briefcase,
  Heart,
  MessageCircle,
  Bell,
  User,
  Settings,
  Search,
  Plus,
  ArrowRight,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Clock,
  Pencil,
  Image,
  FileText,
  Download,
  Share2,
  Play,
  Pause,
  Mic,
  Camera,
  Star,
  TrendingUp,
  Send,
  X,
  Check,
  Smile,
  Paperclip,
  Grid,
  List,
  Filter,
  ExternalLink,
  GitCommit,
  Folders,
  Globe,
  Lock,
  Zap,
  Music,
  Film,
  Book,
  Sparkles,
  Award,
  RefreshCw,
  ChevronLeft,
  ArrowLeft,
  Info,
  AlertCircle,
  Tag,
  Hash,
  Activity,
  LogOut,
  Link,
} from 'lucide-react'
 
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
 
/* @arkzen:web:components:shared:end */
 
 
/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
 
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
 
/* @arkzen:web:page:index:end */
 
 
/* ═══════════════════════════════════════════════════════════════════════════════
   NATIVE — Atelier App
═══════════════════════════════════════════════════════════════════════════════ */
 
/* @arkzen:native:components:shared */
 
import React, { useState, useRef, useCallback } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  TextInput,
  Image,
  FlatList,
  Dimensions,
  StatusBar,
  RefreshControl,
} from 'react-native'
import { useRouter } from 'expo-router'
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'
 
setActiveTatemono('atelier')
 
const { width: SCREEN_W } = Dimensions.get('window')
 
// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  bg:       '#0e0d0c',
  surface:  '#1a1917',
  surface2: '#242220',
  gold:     '#c4a882',
  goldDim:  '#a08560',
  text:     '#f0ece4',
  textDim:  '#b5a898',
  muted:    '#6b6560',
  green:    '#86c795',
  blue:     '#64a0dc',
  border:   'rgba(196,168,130,0.1)',
  borderMid:'rgba(196,168,130,0.18)',
}
 
// ── Shared data (mirrors web) ──────────────────────────────────────────────────
const N_USER = {
  name: 'Mizu', handle: '@mizu_art', role: 'Artist',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop&crop=face',
}
 
const N_CONTINUATIONS = [
  { id: 1, title: 'Eclipse Project',     artist: 'Mizu',  handle: '@mizu_art', thumb: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=600&h=360&fit=crop', progress: 73, version: 4, lastUpdate: '2h ago', witnesses: 23, note: 'Working on light and atmosphere.', tags: ['Digital', 'Space'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
  { id: 2, title: 'Aurora Illustration', artist: 'Mizu',  handle: '@mizu_art', thumb: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=600&h=360&fit=crop', progress: 48, version: 2, lastUpdate: '1d ago', witnesses: 8,  note: 'Exploring aurora colors.',         tags: ['Watercolor'],     avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=40&h=40&fit=crop&crop=face' },
  { id: 3, title: 'Character Design',   artist: 'Daro',  handle: '@daro_env', thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=360&fit=crop', progress: 62, version: 3, lastUpdate: '34m ago', witnesses: 14, note: 'Refining the silhouette.',          tags: ['Character'],      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face' },
]
 
const N_SPACES = [
  { id: 1, name: 'Environment Artists', members: '1.2K', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=120&fit=crop', joined: true },
  { id: 2, name: 'VTuber Hub',          members: '860',  thumb: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=300&h=120&fit=crop', joined: true },
  { id: 3, name: 'Storyboard Artists',  members: '642',  thumb: 'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=300&h=120&fit=crop', joined: false },
  { id: 4, name: 'Anime Artists',       members: '1.8K', thumb: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=300&h=120&fit=crop', joined: false },
]
 
const N_PEOPLE = [
  { name: 'Daro',  handle: '@daro_env',  role: 'Environment Artist', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', online: true },
  { name: 'Ash',   handle: '@ash_illus', role: 'Illustrator',        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face', online: false },
  { name: 'Reiko', handle: '@reiko_art', role: 'Character Designer',  avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', online: true },
]
 
const N_LIVE = [
  { artist: 'Daro',  type: 'Environment Painting', viewers: 23, avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=160&fit=crop' },
  { artist: 'Reiko', type: 'Character Sketching',  viewers: 18, avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=40&h=40&fit=crop&crop=face', thumb: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&h=160&fit=crop' },
]
 
const N_MESSAGES = [
  { id: 1, from: 'Daro',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=36&h=36&fit=crop&crop=face', text: 'The atmosphere is amazing!', time: '2m', own: false },
  { id: 2, from: 'Reiko', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=36&h=36&fit=crop&crop=face', text: 'Love the lighting', time: '1m', own: false },
  { id: 3, from: 'Mizu',  avatar: N_USER.avatar, text: "It's custom", time: '58s', own: true },
]
 
// ── Shared native components ───────────────────────────────────────────────────
 
// Small pill badge
export const NBadge = ({ label, color = C.gold }: { label: string; color?: string }) => (
  <View style={{ backgroundColor: `${color}20`, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, alignSelf: 'flex-start' }}>
    <Text style={{ fontSize: 10, fontWeight: '700', color, letterSpacing: 0.4 }}>{label}</Text>
  </View>
)
 
// Progress bar
export const NProgressBar = ({ pct, color = C.gold }: { pct: number; color?: string }) => (
  <View style={{ height: 3, backgroundColor: `${color}25`, borderRadius: 2, overflow: 'hidden' }}>
    <View style={{ height: '100%', width: `${pct}%`, backgroundColor: color, borderRadius: 2 }} />
  </View>
)
 
// Continuation card
export const NContinuationCard = ({ c, onPress }: { c: typeof N_CONTINUATIONS[0]; onPress: () => void }) => (
  <Pressable
    onPress={onPress}
    style={({ pressed }) => ({
      backgroundColor: C.surface,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: pressed ? C.borderMid : C.border,
      marginBottom: 12,
    })}
  >
    <Image source={{ uri: c.thumb }} style={{ width: '100%', height: 160, resizeMode: 'cover' }} />
    <View style={{ padding: 14 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Image source={{ uri: c.avatar }} style={{ width: 22, height: 22, borderRadius: 11 }} />
        <Text style={{ fontSize: 11, color: C.muted }}>{c.handle}</Text>
        <Text style={{ fontSize: 11, color: C.muted, marginLeft: 'auto' }}>{c.lastUpdate}</Text>
      </View>
      <Text style={{ fontSize: 14, fontWeight: '700', color: C.text, marginBottom: 4 }}>{c.title}</Text>
      <Text style={{ fontSize: 12, color: C.muted, lineHeight: 18, marginBottom: 10 }} numberOfLines={2}>{c.note}</Text>
      <View style={{ flexDirection: 'row', gap: 6, marginBottom: 10 }}>
        {c.tags.slice(0, 2).map(t => <NBadge key={t} label={t} />)}
        <Text style={{ marginLeft: 'auto', fontSize: 11, color: C.muted }}>{c.witnesses} witnessing</Text>
      </View>
      <NProgressBar pct={c.progress} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
        <Text style={{ fontSize: 10, color: C.muted }}>v{c.version}</Text>
        <Text style={{ fontSize: 10, color: C.muted }}>{c.progress}%</Text>
      </View>
    </View>
  </Pressable>
)
 
// Section header row
export const NSectionHead = ({ title, onMore }: { title: string; onMore?: () => void }) => (
  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
    <Text style={{ fontSize: 14, fontWeight: '700', color: C.text }}>{title}</Text>
    {onMore && (
      <Pressable onPress={onMore}>
        <Text style={{ fontSize: 12, color: C.muted }}>See all</Text>
      </Pressable>
    )}
  </View>
)
 
// Bottom tab bar
export const NTabBar = ({ active, onNav }: { active: string; onNav: (v: string) => void }) => {
  const tabs = [
    { id: 'home',          label: 'Home',    icon: '⌂' },
    { id: 'continuations', label: 'Journey', icon: '◱' },
    { id: 'spaces',        label: 'Spaces',  icon: '◎' },
    { id: 'common-room',   label: 'Common',  icon: '☕' },
    { id: 'profile',       label: 'Profile', icon: '◉' },
  ]
  return (
    <View style={{
      flexDirection: 'row',
      backgroundColor: 'rgba(26,25,23,0.97)',
      borderTopWidth: 1,
      borderTopColor: C.border,
      paddingBottom: 12,
    }}>
      {tabs.map(t => (
        <Pressable
          key={t.id}
          onPress={() => onNav(t.id)}
          style={{ flex: 1, alignItems: 'center', paddingTop: 10, paddingBottom: 2 }}
        >
          <Text style={{ fontSize: 18, color: active === t.id ? C.gold : C.muted }}>{t.icon}</Text>
          <Text style={{ fontSize: 10, color: active === t.id ? C.gold : C.muted, marginTop: 3, fontWeight: active === t.id ? '700' : '400' }}>{t.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}
 
/* @arkzen:native:components:shared:end */
 
 
/* @arkzen:native:page:index */
 
const IndexScreen = () => {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('home')
  const [refreshing, setRefreshing] = useState(false)
  const [witnessing, setWitnessing] = useState<number[]>([1])
  const [spaces, setSpaces] = useState(N_SPACES)
  const [chatMsg, setChatMsg] = useState('')
  const [messages, setMessages] = useState(N_MESSAGES)
  const [selectedCont, setSelectedCont] = useState<typeof N_CONTINUATIONS[0] | null>(null)
 
  const onRefresh = useCallback(() => {
    setRefreshing(true)
    setTimeout(() => setRefreshing(false), 1200)
  }, [])
 
  const toggleWitness = (id: number) =>
    setWitnessing(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
 
  const sendMsg = () => {
    if (!chatMsg.trim()) return
    setMessages(prev => [...prev, { id: prev.length + 1, from: 'Mizu', avatar: N_USER.avatar, text: chatMsg, time: 'now', own: true }])
    setChatMsg('')
  }
 
  // ── HOME ──────────────────────────────────────────────────────────────────────
  const HomeTab = () => (
    <ScrollView
      style={{ flex: 1, backgroundColor: C.bg }}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.gold} />}
    >
      {/* Header */}
      <View style={{ backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border, paddingHorizontal: 20, paddingTop: 52, paddingBottom: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ fontSize: 11, color: C.muted, letterSpacing: 1.4, textTransform: 'uppercase', marginBottom: 2 }}>ATELIER</Text>
            <Text style={{ fontSize: 22, fontWeight: '300', color: C.text }}>Welcome back, <Text style={{ fontWeight: '700', color: C.gold }}>{N_USER.name}</Text></Text>
          </View>
          <Image source={{ uri: N_USER.avatar }} style={{ width: 38, height: 38, borderRadius: 19, borderWidth: 1.5, borderColor: C.gold }} />
        </View>
        <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>What will you continue today?</Text>
      </View>
 
      <View style={{ padding: 20 }}>
        {/* Continue Working */}
        <NSectionHead title="Continue Working" onMore={() => setActiveTab('continuations')} />
 
        {/* Featured */}
        <NContinuationCard c={N_CONTINUATIONS[0]} onPress={() => { setSelectedCont(N_CONTINUATIONS[0]); setActiveTab('continuations') }} />
 
        {/* Live Studios strip */}
        <NSectionHead title="Live Studios" onMore={() => {}} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {N_LIVE.map(s => (
            <Pressable key={s.artist} style={{ marginRight: 12, width: 180, backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: s.thumb }} style={{ width: 180, height: 100, resizeMode: 'cover' }} />
                <View style={{ position: 'absolute', top: 6, left: 6, flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: 'rgba(14,13,12,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#ef4444' }} />
                  <Text style={{ fontSize: 9, fontWeight: '700', color: C.text }}>LIVE</Text>
                </View>
                <View style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(14,13,12,0.75)', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 }}>
                  <Text style={{ fontSize: 9, color: C.text }}>{s.viewers} watching</Text>
                </View>
              </View>
              <View style={{ padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Image source={{ uri: s.avatar }} style={{ width: 22, height: 22, borderRadius: 11 }} />
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, fontWeight: '600', color: C.text }}>{s.artist}</Text>
                  <Text style={{ fontSize: 10, color: C.muted }}>{s.type}</Text>
                </View>
              </View>
            </Pressable>
          ))}
        </ScrollView>
 
        {/* People You Witness */}
        <NSectionHead title="People You Witness" />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {N_PEOPLE.map(p => (
            <View key={p.name} style={{ marginRight: 16, alignItems: 'center', gap: 5 }}>
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: p.avatar }} style={{ width: 48, height: 48, borderRadius: 24, borderWidth: 1.5, borderColor: p.online ? C.green : 'transparent' }} />
                {p.online && <View style={{ position: 'absolute', bottom: 1, right: 1, width: 9, height: 9, borderRadius: 5, backgroundColor: C.green, borderWidth: 1.5, borderColor: C.bg }} />}
              </View>
              <Text style={{ fontSize: 11, color: C.textDim }}>{p.name}</Text>
              <Text style={{ fontSize: 9, color: C.muted }}>{p.role}</Text>
            </View>
          ))}
        </ScrollView>
 
        {/* Absence note */}
        <View style={{ backgroundColor: `${C.gold}0a`, borderLeftWidth: 2, borderLeftColor: C.goldDim, borderRadius: 6, padding: 12, marginTop: 4 }}>
          <Text style={{ fontSize: 12, color: C.muted, fontStyle: 'italic', lineHeight: 18 }}>The system never punishes absence. Return when you're ready and simply continue.</Text>
        </View>
      </View>
    </ScrollView>
  )
 
  // ── JOURNEY (Continuations) ───────────────────────────────────────────────────
  const JourneyTab = () => {
    if (selectedCont) return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Hero */}
        <Image source={{ uri: selectedCont.thumb }} style={{ width: '100%', height: 240, resizeMode: 'cover' }} />
 
        <View style={{ padding: 20 }}>
          {/* Back */}
          <Pressable onPress={() => setSelectedCont(null)} style={{ marginBottom: 16 }}>
            <Text style={{ fontSize: 13, color: C.gold }}>← Back to Continuations</Text>
          </Pressable>
 
          {/* Artist + meta */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Image source={{ uri: selectedCont.avatar }} style={{ width: 40, height: 40, borderRadius: 20 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{selectedCont.title}</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{selectedCont.handle} · {selectedCont.lastUpdate}</Text>
            </View>
            <Pressable
              onPress={() => toggleWitness(selectedCont.id)}
              style={{ backgroundColor: witnessing.includes(selectedCont.id) ? `${C.green}18` : `${C.gold}12`, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 7, borderWidth: 1, borderColor: witnessing.includes(selectedCont.id) ? `${C.green}35` : C.border }}
            >
              <Text style={{ fontSize: 12, fontWeight: '600', color: witnessing.includes(selectedCont.id) ? C.green : C.gold }}>
                {witnessing.includes(selectedCont.id) ? 'Witnessing' : 'Witness'}
              </Text>
            </Pressable>
          </View>
 
          {/* Tags */}
          <View style={{ flexDirection: 'row', gap: 6, marginBottom: 16 }}>
            {selectedCont.tags.map(t => <NBadge key={t} label={t} />)}
          </View>
 
          {/* Progress */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 }}>Progress</Text>
            <NProgressBar pct={selectedCont.progress} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
              <Text style={{ fontSize: 11, color: C.muted }}>v{selectedCont.version}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{selectedCont.progress}%</Text>
            </View>
          </View>
 
          {/* Artist note */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: C.border }}>
            <Text style={{ fontSize: 12, fontWeight: '600', color: C.textDim, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Artist Note</Text>
            <Text style={{ fontSize: 13, color: C.text, lineHeight: 20 }}>{selectedCont.note}</Text>
          </View>
 
          {/* Witnesses */}
          <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 14, borderWidth: 1, borderColor: C.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: `${C.green}90` }} />
              <Text style={{ fontSize: 12, color: C.muted }}>{selectedCont.witnesses} people are here witnessing</Text>
            </View>
            <Text style={{ fontSize: 11, color: C.muted, marginTop: 6, fontStyle: 'italic', lineHeight: 17 }}>
              We simply co-exist in the space.
            </Text>
          </View>
        </View>
      </ScrollView>
    )
 
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: C.text }}>Continuations</Text>
          <Pressable style={{ backgroundColor: C.gold, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 8 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: C.bg }}>+ New</Text>
          </Pressable>
        </View>
 
        {N_CONTINUATIONS.map(c => (
          <NContinuationCard key={c.id} c={c} onPress={() => setSelectedCont(c)} />
        ))}
      </ScrollView>
    )
  }
 
  // ── SPACES ──────────────────────────────────────────────────────────────────
  const SpacesTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 20 }}>Spaces</Text>
 
      <NSectionHead title="Your Spaces" />
      {spaces.filter(s => s.joined).map(s => (
        <View key={s.id} style={{ backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 10 }}>
          <Image source={{ uri: s.thumb }} style={{ width: '100%', height: 80, resizeMode: 'cover' }} />
          <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{s.name}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{s.members} members</Text>
            </View>
            <Pressable
              onPress={() => setSpaces(prev => prev.map(sp => sp.id === s.id ? { ...sp, joined: false } : sp))}
              style={{ backgroundColor: `${C.gold}14`, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5, borderWidth: 1, borderColor: C.border }}
            >
              <Text style={{ fontSize: 12, color: C.gold }}>Joined</Text>
            </Pressable>
          </View>
        </View>
      ))}
 
      <View style={{ marginTop: 12 }}>
        <NSectionHead title="Discover Spaces" />
        {spaces.filter(s => !s.joined).map(s => (
          <View key={s.id} style={{ backgroundColor: C.surface, borderRadius: 10, overflow: 'hidden', borderWidth: 1, borderColor: C.border, marginBottom: 10 }}>
            <Image source={{ uri: s.thumb }} style={{ width: '100%', height: 80, resizeMode: 'cover' }} />
            <View style={{ padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontSize: 13, fontWeight: '700', color: C.text }}>{s.name}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{s.members} members</Text>
              </View>
              <Pressable
                onPress={() => setSpaces(prev => prev.map(sp => sp.id === s.id ? { ...sp, joined: true } : sp))}
                style={{ backgroundColor: C.gold, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 5 }}
              >
                <Text style={{ fontSize: 12, fontWeight: '700', color: C.bg }}>Join</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
 
  // ── COMMON ROOM ──────────────────────────────────────────────────────────────
  const CommonRoomTab = () => (
    <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
      <Text style={{ fontSize: 22, fontWeight: '700', color: C.text, marginBottom: 4 }}>Common Room</Text>
      <Text style={{ fontSize: 12, color: C.muted, marginBottom: 20 }}>A space where artists are just people.</Text>
 
      {/* Post item */}
      {[
        { author: 'Yuki', handle: '@yuki_draw', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=40&h=40&fit=crop&crop=face', time: '26m ago', content: 'When the ref and the final look nothing alike', image: 'https://images.unsplash.com/photo-1563089145-599997674d42?w=500&h=340&fit=crop', hearts: 129, comments: 24 },
        { author: 'Daro', handle: '@daro_env',  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face', time: '1h ago',  content: "Every artist's nightmare.",               image: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=500&h=340&fit=crop', hearts: 76,  comments: 12 },
      ].map((post, i) => (
        <View key={i} style={{ backgroundColor: C.surface, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: C.border }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <Image source={{ uri: post.avatar }} style={{ width: 36, height: 36, borderRadius: 18 }} />
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 13, fontWeight: '600', color: C.text }}>{post.author}</Text>
              <Text style={{ fontSize: 11, color: C.muted }}>{post.handle} · {post.time}</Text>
            </View>
          </View>
          <Text style={{ fontSize: 13, color: C.text, marginBottom: 12, lineHeight: 20 }}>{post.content}</Text>
          <Image source={{ uri: post.image }} style={{ width: '100%', height: 180, borderRadius: 8, resizeMode: 'cover', marginBottom: 12 }} />
          <View style={{ flexDirection: 'row', gap: 20, borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10 }}>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>♥</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{post.hearts}</Text>
            </Pressable>
            <Pressable style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Text style={{ fontSize: 13, color: C.muted }}>◎</Text>
              <Text style={{ fontSize: 12, color: C.muted }}>{post.comments}</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </ScrollView>
  )
 
  // ── PROFILE ──────────────────────────────────────────────────────────────────
  const ProfileTab = () => {
    const [tab, setTab] = useState<'journey' | 'about'>('journey')
 
    return (
      <ScrollView style={{ flex: 1, backgroundColor: C.bg }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Cover */}
        <Image source={{ uri: 'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=800&h=200&fit=crop' }} style={{ width: '100%', height: 120, resizeMode: 'cover' }} />
 
        <View style={{ paddingHorizontal: 20 }}>
          {/* Avatar */}
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -28, marginBottom: 12 }}>
            <Image source={{ uri: N_USER.avatar }} style={{ width: 60, height: 60, borderRadius: 30, borderWidth: 2.5, borderColor: C.surface }} />
            <Pressable style={{ backgroundColor: `${C.gold}14`, borderRadius: 8, paddingHorizontal: 14, paddingVertical: 7, borderWidth: 1, borderColor: C.border, marginBottom: 4 }}>
              <Text style={{ fontSize: 12, fontWeight: '600', color: C.gold }}>Edit Profile</Text>
            </Pressable>
          </View>
 
          <Text style={{ fontSize: 20, fontWeight: '700', color: C.text }}>{N_USER.name}</Text>
          <Text style={{ fontSize: 13, color: C.muted, marginBottom: 6 }}>{N_USER.handle} · {N_USER.role}</Text>
          <Text style={{ fontSize: 13, color: C.textDim, marginBottom: 14, lineHeight: 20 }}>I draw slow, murals, and stories.</Text>
 
          {/* Stats */}
          <View style={{ flexDirection: 'row', gap: 20, marginBottom: 20 }}>
            {[['4', 'Continuations'], ['326', 'Followers'], ['51', 'Following']].map(([v, l]) => (
              <View key={l}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: C.text }}>{v}</Text>
                <Text style={{ fontSize: 11, color: C.muted }}>{l}</Text>
              </View>
            ))}
          </View>
 
          {/* Tab switcher */}
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 16 }}>
            {([['journey', 'Journey'], ['about', 'About']] as const).map(([v, l]) => (
              <Pressable key={v} onPress={() => setTab(v)} style={{ paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 2, borderBottomColor: tab === v ? C.gold : 'transparent' }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: tab === v ? C.gold : C.muted }}>{l}</Text>
              </Pressable>
            ))}
          </View>
 
          {tab === 'journey' && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
              {[
                'https://images.unsplash.com/photo-1614851099511-773084f6911d?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1518709766631-a6a7f45921c3?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=160&h=160&fit=crop',
                'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=160&h=160&fit=crop',
              ].map((img, i) => {
                const size = (SCREEN_W - 48) / 3
                return <Image key={i} source={{ uri: img }} style={{ width: size, height: size, borderRadius: 6, resizeMode: 'cover' }} />
              })}
            </View>
          )}
 
          {tab === 'about' && (
            <View style={{ backgroundColor: C.surface, borderRadius: 10, padding: 16, borderWidth: 1, borderColor: C.border }}>
              {[['Location', 'Cloud City'], ['Role', 'Artist'], ['Member since', '2023']].map(([k, v]) => (
                <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.border }}>
                  <Text style={{ fontSize: 13, color: C.muted }}>{k}</Text>
                  <Text style={{ fontSize: 13, color: C.text, fontWeight: '500' }}>{v}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    )
  }
 
  // ── Render active tab ─────────────────────────────────────────────────────────
  const renderTab = () => {
    switch (activeTab) {
      case 'home':          return <HomeTab />
      case 'continuations': return <JourneyTab />
      case 'spaces':        return <SpacesTab />
      case 'common-room':   return <CommonRoomTab />
      case 'profile':       return <ProfileTab />
      default:              return <HomeTab />
    }
  }
 
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      {renderTab()}
      <NTabBar active={activeTab} onNav={(v) => { setActiveTab(v); setSelectedCont(null) }} />
    </View>
  )
}
 
/* @arkzen:native:page:index:end */
 
