// ARKZEN GENERATED — new-updates-styles/about (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:53.520Z
import { LynxBadge } from './components/LynxBadge'
import { LynxGhostButton } from './components/LynxGhostButton'

import React, { useState } from '@lynx-js/react'

const AboutLynxPage = () => {
  const [expanded, setExpanded] = useState<string | null>(null)

  const sections = [
    {
      title: 'Architecture',
      content: 'Pages are completely individual with their own screen files. Components are separated into individual re-export files that import from a shared _components backend for utilities and types.',
    },
    {
      title: 'Styling',
      content: 'The CSS DSL supports both global CSS variables (for design tokens) and per-component CSS Modules. All styles are generated from @arkzen:style blocks in your tatemono file.',
    },
    {
      title: 'Generation',
      content: 'Everything is generated from a single core.tsx tatemono file. No hardcoding. Update your tatemono and rebuild with `node start.js` to regenerate all pages and components.',
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 px-6 pt-14 pb-12 flex flex-col">

      <LynxGhostButton label="← Back" onPress={() => window.history.back()} />

      <div className="mt-8 mb-8">
        <LynxBadge label="about" />
        <h1 className="text-3xl font-bold text-neutral-900 mt-4">About this showcase</h1>
        <p className="text-sm text-neutral-500 mt-2 leading-6">
          This tatemono demonstrates all new features added to Arkzen v2.0.
        </p>
      </div>

      <div className="flex flex-col gap-3 mb-8">
        {sections.map(s => (
          <div
            key={s.title}
            onClick={() => setExpanded(expanded === s.title ? null : s.title)}
            className="bg-white rounded-2xl border border-neutral-200 p-5 cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-neutral-900 text-base">{s.title}</span>
              <span className="text-neutral-400 text-lg">{expanded === s.title ? '−' : '+'}</span>
            </div>
            {expanded === s.title && (
              <p className="mt-3 text-sm text-neutral-600 leading-6">{s.content}</p>
            )}
          </div>
        ))}
      </div>

      <div className="bg-neutral-100 rounded-2xl px-5 py-4">
        <pre className="text-xs font-mono text-neutral-500 leading-6">
          {`stack: lynx\nengine: arkzen v10.1\ntatemono: new-updates-styles\nscreens: index, about, features`}
        </pre>
      </div>

    </div>
  )
}
