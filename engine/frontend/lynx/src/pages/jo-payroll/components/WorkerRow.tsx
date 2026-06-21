// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — WorkerRow
// Source: @arkzen:native:components:lynx:* (jo-payroll)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:55.638Z
// ============================================================

import { useCallback, useEffect, useMemo, useState } from '@lynx-js/react'
import { Icon } from 'sigx/lynx-icons-lucide'
import { formatPeso } from './utils'
import type { JobOrder } from './types'
import { Avatar } from './Avatar'
import { SearchBar } from './SearchBar'

// ── WorkerRow ────────────────────────────────────────────────

export const WorkerRow = ({ jo, onPress }: { jo: JobOrder; onPress?: () => void }) => {
  const deductions = (jo.sss_amount ?? 0) + (jo.hdmf_premium ?? 0) + (jo.hdmf_mpl ?? 0) + (jo.calamity_loan ?? 0)
  const netPay = jo.basic_pay - deductions

  return (
    <view
      bindtap={onPress}
      className="flex-row items-center px-4 py-3 border-b border-gray-50"
      style={{ gap: 12 }}
    >
      <Avatar name={jo.name_of_jo} size={38} />
      <view className="flex-1">
        <text className="text-[13px] font-semibold text-gray-900" maxLength={1}>{jo.name_of_jo}</text>
        <text className="text-[11px] text-gray-400" style={{ marginTop: 2 }}>{jo.job_title} · {jo.funding}</text>
      </view>
      <view className="items-end" style={{ gap: 4 }}>
        <text className="text-[13px] font-bold text-gray-900">{formatPeso(netPay)}</text>
        <view className={`rounded-md px-1.5 py-0.5 ${jo.disbursement_type === 'ATM' ? 'bg-blue-100' : 'bg-amber-100'}`}>
          <text className={`text-[10px] font-bold ${jo.disbursement_type === 'ATM' ? 'text-blue-600' : 'text-amber-600'}`}>
            {jo.disbursement_type}
          </text>
        </view>
      </view>
    </view>
  )
}

// ── SearchBar ────────────────────────────────────────────────
