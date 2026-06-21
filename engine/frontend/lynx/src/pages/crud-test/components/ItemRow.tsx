// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ItemRow
// Source: @arkzen:native:components:lynx:* (crud-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:53.362Z
// ============================================================

import { useEffect, useState } from '@lynx-js/react'
import type { Item } from './types'
import { StatusBadge } from './StatusBadge'

// ── Item row ──────────────────────────────────────────────────
export const ItemRow = ({
  item,
  onEdit,
  onDelete,
  deleting,
}: {
  item:     Item
  onEdit:   (item: Item) => void
  onDelete: (id: number) => void
  deleting: number | null
}) => (
  <view className="px-4 py-3 flex-row items-start gap-3 border-b border-neutral-50">
    <view className="flex-1">
      <view className="flex-row items-center gap-2 flex-wrap">
        <text className="text-sm font-medium text-neutral-900">{item.name}</text>
        <StatusBadge status={item.status} />
        {item.priority > 0 && (
          <text className="text-xs text-neutral-400">P{item.priority}</text>
        )}
      </view>
      {item.description ? (
        <text className="text-xs text-neutral-500 mt-0.5">{item.description}</text>
      ) : null}
      {item.tags ? (
        <view className="flex-row flex-wrap gap-1 mt-1">
          {item.tags.split(',').map((t, i) => (
            <view key={i} className="bg-neutral-100 rounded px-1.5 py-0.5">
              <text className="text-xs text-neutral-500">{t.trim()}</text>
            </view>
          ))}
        </view>
      ) : null}
    </view>
    <view className="flex-row gap-3 pt-0.5">
      <view bindtap={() => onEdit(item)}>
        <text className="text-xs text-neutral-400">Edit</text>
      </view>
      <view bindtap={() => deleting === item.id ? null : onDelete(item.id)}>
        <text className="text-xs text-red-400">{deleting === item.id ? '…' : 'Delete'}</text>
      </view>
    </view>
  </view>
)
