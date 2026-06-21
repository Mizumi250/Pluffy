// ARKZEN GENERATED — new-updates-styles/features (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T12:05:09.007Z
import '../../arkzen/generated/new-updates-styles.lynx-styles.css'
import { LynxBadge } from './components/LynxBadge'
import { LynxFeatureCard } from './components/LynxFeatureCard'
import { LynxGhostButton } from './components/LynxGhostButton'
import { LYNX_FEATURES } from './components/constants'
import { getLynxIcon } from './components/utils'
import type { LynxColor } from './components/types'

import { useState } from '@lynx-js/react'

const FeaturesLynxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [selectedColor, setSelectedColor] = useState<LynxColor>('blue')
  const colors: LynxColor[] = ['blue', 'purple', 'green', 'orange']
  const filtered = LYNX_FEATURES.filter(f => f.color === selectedColor)

  return (
    <scroll-view className="flex-1 bg-slate-50 px-6 pt-14 pb-12">

      <LynxGhostButton label="← Back" onPress={() => onNavigate('index')} />

      <view className="mt-8 mb-6">
        <LynxBadge label="features" />
        <text className="text-3xl font-bold text-neutral-900 mt-4">All Features</text>
      </view>

      <view className="flex-row flex-wrap" style={{ gap: 8 }}>
        {colors.map(color => (
          <view
            key={color}
            bindtap={() => setSelectedColor(color)}
            className={`px-4 py-2 rounded-xl ${selectedColor === color ? 'bg-neutral-900' : 'bg-neutral-200'}`}
          >
            <text className={`font-semibold text-sm ${selectedColor === color ? 'text-white' : 'text-neutral-700'}`}>
              {color.charAt(0).toUpperCase() + color.slice(1)}
            </text>
          </view>
        ))}
      </view>

      <view className="mt-4">
        {filtered.map(f => (
          <LynxFeatureCard
            key={f.id}
            icon={getLynxIcon(f.icon, f.color)}
            title={f.title}
            description={f.description}
            color={f.color}
          />
        ))}
      </view>

      {filtered.length === 0 && (
        <view className="items-center py-12">
          <text className="text-neutral-400 text-sm">No features for this filter.</text>
        </view>
      )}

    </scroll-view>
  )
}

export const NewUpdatesStylesFeatures = FeaturesLynxPage;
