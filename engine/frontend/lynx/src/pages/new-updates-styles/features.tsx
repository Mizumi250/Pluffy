// ARKZEN GENERATED — new-updates-styles/features (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.525Z
import { LynxBadge } from './components/LynxBadge'
import { LynxFeatureCard } from './components/LynxFeatureCard'
import { LynxGhostButton } from './components/LynxGhostButton'
import { LYNX_FEATURES } from './components/constants'
import { getLynxIcon } from './components/utils'
import type { LynxColor } from './components/types'

import React, { useState } from '@lynx-js/react'

const FeaturesLynxPage = () => {
  const [selectedColor, setSelectedColor] = useState<LynxColor>('blue')
  const colors: LynxColor[] = ['blue', 'purple', 'green', 'orange']
  const filtered = LYNX_FEATURES.filter(f => f.color === selectedColor)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <LynxGhostButton label="← Back" onPress={() => window.history.back()} />

      <div className="mt-8 mb-6">
        <LynxBadge label="features" />
        <h1 className="text-3xl font-bold text-neutral-900 mt-4">All Features</h1>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        {colors.map(color => (
          <button
            key={color}
            onClick={() => setSelectedColor(color)}
            className={`px-4 py-2 rounded-xl font-semibold text-sm border-none cursor-pointer ${
              selectedColor === color ? 'bg-neutral-900 text-white' : 'bg-neutral-200 text-neutral-700'
            }`}
          >
            {color.charAt(0).toUpperCase() + color.slice(1)}
          </button>
        ))}
      </div>

      {filtered.map(f => (
        <LynxFeatureCard
          key={f.id}
          icon={getLynxIcon(f.icon)}
          title={f.title}
          description={f.description}
          color={f.color}
        />
      ))}

      {filtered.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <span className="text-neutral-400 text-sm">No features for this filter.</span>
        </div>
      )}

    </div>
  )
}
