// ARKZEN GENERATED — new-updates-styles/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.514Z
import { LynxBadge } from './components/LynxBadge'
import { LynxFeatureCard } from './components/LynxFeatureCard'
import { LynxGhostButton } from './components/LynxGhostButton'
import { LynxPrimaryButton } from './components/LynxPrimaryButton'
import { LYNX_FEATURES } from './components/constants'
import { getLynxIcon } from './components/utils'

import React, { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
  const [activeFeature, setActiveFeature] = useState<number | null>(null)

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <div className="mb-8">
        <LynxBadge label="Arkzen v2.0" />
        <h1 className="text-4xl font-bold text-neutral-900 mt-4 leading-tight">
          What's New<br />in v2.0 ✦
        </h1>
        <p className="text-base text-neutral-500 mt-3 leading-6">
          Component separation, CSS DSL, multiple pages, and more — all running natively on Lynx.
        </p>
      </div>

      <div className="mb-6">
        {LYNX_FEATURES.map(f => (
          <LynxFeatureCard
            key={f.id}
            icon={getLynxIcon(f.icon)}
            title={f.title}
            description={f.description}
            color={f.color}
            expanded={activeFeature === f.id}
            onClick={() => setActiveFeature(activeFeature === f.id ? null : f.id)}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-blue-600 p-6 mb-6">
        <div className="text-white font-bold text-xl mb-3">What's new?</div>
        {[
          '✓ Individual component files',
          '✓ Global CSS variables',
          '✓ Per-component CSS Modules',
          '✓ Multi-page support',
          '✓ Asset management',
          '✓ Zero hardcoding',
        ].map(item => (
          <div key={item} className="text-blue-100 text-sm leading-7">{item}</div>
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <LynxPrimaryButton
          label="Browse Features →"
          onPress={() => { window.location.href = '/new-updates-styles/features' }}
        />
        <LynxGhostButton
          label="About this tatemono"
          onPress={() => { window.location.href = '/new-updates-styles/about' }}
        />
      </div>

    </div>
  )
}
