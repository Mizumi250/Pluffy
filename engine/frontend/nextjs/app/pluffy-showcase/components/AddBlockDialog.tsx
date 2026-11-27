'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — AddBlockDialog
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:24:16.351Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { ABLOCKS } from './constants'

export const AddBlockDialog = () => (
  <div className="pf-modal">
    <div className="pf-dlg pf-ab">
      <div className="pf-ab-l">
        <h4>Add block</h4>
        <div className="pf-ab-s"><Search /><span className="pf-ab-ty" data-t="crud" data-ph="Search blocks" /></div>
        <div className="pf-ab-lab">DATA + API</div>
        {ABLOCKS.map((b) => (
          <div className={'pf-ab-i' + (b[0] === 'crud' ? ' pf-ab-crud' : '')} key={b[0]}>
            {b[0] === 'crud' && <i className="pf-sel" />}<b>{b[0]}</b><span>{b[1]}</span>
          </div>
        ))}
      </div>
      <div className="pf-ab-r">
        <div className="pf-ab-ph"><b>Pick a block</b><span>The list on the left has every block this tatemono can take, with the same rules as mizumi block.</span></div>
        <div className="pf-ab-d"><code>crud</code><span>a table and its api resource in one step (database + api)</span><span className="pf-w-b p pf-ab-go" style={{ marginTop: 12 }}>Add block</span></div>
      </div>
    </div>
  </div>
)
