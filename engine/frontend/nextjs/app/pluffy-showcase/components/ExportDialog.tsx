'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ExportDialog
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:03.362Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'

export const ExportDialog = () => (
  <div className="pf-modal">
    <div className="pf-dlg pf-ex">
      <h4>Export project</h4>
      <span style={{ color: 'var(--muted)' }}>Write a standalone web, app, desktop, Godot, Unity or Unreal project.</span>
      <div className="pf-ex-g">
        <div className="pf-ex-f"><label>Tatemono *</label><div className="pf-ex-sel">warung-sore</div></div>
        <div className="pf-ex-f"><label>Target *</label><div className="pf-ex-sel">react-vite (web)</div><span className="pf-cb pf-cb-d"><em><i /></em>Add Dockerfile + docker-compose (web only)</span></div>
        <div className="pf-ex-f"><label>Backend</label><div className="pf-ex-sel">(default)</div><span className="pf-cb pf-cb-o"><em><i /></em>Add OpenAPI docs</span></div>
      </div>
      <div className="pf-ex-cmd">mizumi export warung-sore react-vite<span className="x x-d"> --docker</span><span className="x x-o"> --openapi</span></div>
      <div className="pf-ex-foot"><span className="pf-w-b">Cancel</span><span className="pf-w-b p pf-ex-run">Run</span></div>
    </div>
  </div>
)
