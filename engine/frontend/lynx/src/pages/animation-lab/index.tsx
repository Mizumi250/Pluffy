// ARKZEN GENERATED — animation-lab/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:39.122Z
import { LynxEasingSection } from './components/LynxEasingSection'
import { LynxEntranceSection } from './components/LynxEntranceSection'
import { LynxLoopSection } from './components/LynxLoopSection'
import { LynxPressSection } from './components/LynxPressSection'
import { LynxSpringSection } from './components/LynxSpringSection'
import { LynxStaggerSection } from './components/LynxStaggerSection'
import { LynxTimelineSection } from './components/LynxTimelineSection'
import { LynxTransformsSection } from './components/LynxTransformsSection'
import { LYNX_NAV_SECTIONS } from './components/constants'

import React, { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
  const [activeSection, setActiveSection] = useState('entrance')

  const renderSection = () => {
    switch (activeSection) {
      case 'entrance':   return <LynxEntranceSection />
      case 'timeline':   return <LynxTimelineSection />
      case 'stagger':    return <LynxStaggerSection />
      case 'press':      return <LynxPressSection />
      case 'loop':       return <LynxLoopSection />
      case 'transforms': return <LynxTransformsSection />
      case 'spring':     return <LynxSpringSection />
      case 'easing':     return <LynxEasingSection />
      default:           return <LynxEntranceSection />
    }
  }

  return (
    <div className="flex-1 min-h-screen bg-neutral-900 text-white">
      <div className="border-b border-white/10 px-5 py-4">
        <div className="text-lg font-bold text-purple-400">🎬 Animation Lab</div>
        <div className="text-xs text-white/35">Lynx · @lynx-js/motion</div>
      </div>

      <div className="flex flex-row overflow-x-auto border-b border-white/10 px-3 py-2 gap-1">
        {LYNX_NAV_SECTIONS.map(({ id, label, icon, color }) => {
          const active = activeSection === id
          return (
            <button
              key={id}
              className={`flex flex-row items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold ${
                active ? 'bg-neutral-800 text-white' : 'bg-white/10 text-white/60'
              }`}
              onPress={() => setActiveSection(id)}
            >
              <span>{icon}</span>
              {label}
            </button>
          )
        })}
      </div>

      <div className="flex-1 overflow-y-auto">
        {renderSection()}
        <div className="h-8" />
      </div>
    </div>
  )
}

export const AnimationLabIndex = IndexLynxPage;
