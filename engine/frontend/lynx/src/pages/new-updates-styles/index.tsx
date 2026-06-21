// ARKZEN GENERATED — new-updates-styles/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:09:57.197Z
import '../../arkzen/generated/new-updates-styles.lynx-styles.css'
import { LynxBadge } from './components/LynxBadge'
import { LynxFeatureCard } from './components/LynxFeatureCard'
import { LynxGhostButton } from './components/LynxGhostButton'
import { LynxPrimaryButton } from './components/LynxPrimaryButton'
import { LYNX_FEATURES } from './components/constants'
import { getLynxIcon } from './components/utils'

import { useState } from '@lynx-js/react'

const IndexLynxPage = ({ onNavigate }: { onNavigate: (page: string) => void }) => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <scroll-view className="flex-1 bg-slate-50 px-6 pt-14 pb-12">

      <view className="mb-8">
        <LynxBadge label="Arkzen v2.0" />
        <text className="text-4xl font-bold text-neutral-900 mt-4 leading-tight">
          What's New{'\n'}in v2.0 ✦
        </text>
        <text className="text-base text-neutral-500 mt-3 leading-6">
          Component separation, CSS DSL, multiple pages, and more — all running natively on Lynx.
        </text>
      </view>

      <view className="mb-6">
        {LYNX_FEATURES.map(f => (
          <LynxFeatureCard
            key={f.id}
            icon={getLynxIcon(f.icon, f.color)}
            title={f.title}
            description={f.description}
            color={f.color}
            expanded={activeFeature === f.id}
            onPress={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
          />
        ))}
      </view>

      <view className="rounded-2xl bg-blue-600 p-6 mb-6">
        <text className="text-white font-bold text-xl mb-3">What's new?</text>
        {[
          '✓ Individual component files',
          '✓ Global CSS variables',
          '✓ Per-component CSS Modules',
          '✓ Multi-page support',
          '✓ Asset management',
          '✓ Zero hardcoding',
        ].map(item => (
          <text key={item} className="text-blue-100 text-sm leading-7">{item}</text>
        ))}
      </view>

      <view className="flex-col" style={{ gap: 12 }}>
        <LynxPrimaryButton
          label="Browse Features →"
          onPress={() => onNavigate('features')}
        />
        <LynxGhostButton
          label="About this tatemono"
          onPress={() => onNavigate('about')}
        />
      </view>

    </scroll-view>
  )
}

export const NewUpdatesStylesIndex = IndexLynxPage;
