// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — GuideRow
// Source: @arkzen:native:components:lynx:* (asset-hub)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T03:18:54.262Z
// ============================================================

import { useState } from '@lynx-js/react'

// ── Guide row ──────────────────────────────────────────────────
export const GuideRow = ({ folder, desc }: { folder: string; desc: string }) => (
  <view className="py-2.5 border-b border-[#f1f5f9]">
    <text className="text-[11px] font-mono text-[#6366f1] mb-0.5">{folder}</text>
    <text className="text-[11px] text-[#94a3b8]">{desc}</text>
  </view>
)
