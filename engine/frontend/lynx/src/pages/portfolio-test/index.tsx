// ARKZEN GENERATED — portfolio-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:59:06.847Z
import { CATEGORIES, PROJECTS, SKILLS } from './components/constants'

/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'

const IndexLynxPage = () => {
  const [name,      setName]      = useState('')
  const [email,     setEmail]     = useState('')
  const [message,   setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSend = () => {
    if (!name || !email || !message) return
    setSubmitted(true)
    setName(''); setEmail(''); setMessage('')
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <scroll-view className="flex-1 bg-neutral-50">
      {/* Header */}
      <view className="bg-white border-b border-neutral-200">
        <view className="px-6 py-4 flex-row items-center" style={{ gap: 8 }}>
          <text className="text-2xl">💻</text>
          <text className="font-semibold text-neutral-900">Portfolio</text>
        </view>
      </view>

      <view className="px-6 py-16" style={{ gap: 80 }}>
        {/* Hero */}
        <view className="items-center">
          <text className="text-5xl font-semibold text-neutral-900 mb-4 text-center">Full-Stack Developer</text>
          <text className="text-lg text-neutral-600">Crafting digital experiences</text>
        </view>

        {/* Projects */}
        <view>
          <view className="flex-row items-center mb-8" style={{ gap: 8 }}>
            <text className="text-2xl font-semibold text-neutral-900">⭐ Projects</text>
          </view>
          <view className="flex-row flex-wrap" style={{ gap: 24 }}>
            {PROJECTS.map(p => (
              <view key={p.id} className="flex-1 bg-white rounded-2xl border border-neutral-200" style={{ overflow: 'hidden', minWidth: '30%' }}>
                <view className="h-32 bg-neutral-100 items-center justify-center">
                  <text className="text-5xl">{p.image}</text>
                </view>
                <view className="p-6">
                  <text className="text-lg font-semibold text-neutral-900 mb-2">{p.title}</text>
                  <text className="text-sm text-neutral-600 mb-4">{p.description}</text>
                  <view className="flex-row flex-wrap mb-4" style={{ gap: 8 }}>
                    {p.tags.map((t, i) => (
                      <text key={i} className="px-2 py-1 text-xs bg-neutral-100 text-neutral-600 rounded">{t}</text>
                    ))}
                  </view>
                  <text className="text-sm text-neutral-900 font-medium" bindtap={() => lynx.openSchema?.(p.url)}>View ↗</text>
                </view>
              </view>
            ))}
          </view>
        </view>

        {/* Skills */}
        <view>
          <text className="text-2xl font-semibold text-neutral-900 mb-12">Skills</text>
          <view className="flex-row flex-wrap" style={{ gap: 48 }}>
            {CATEGORIES.map(cat => (
              <view key={cat} className="flex-1" style={{ minWidth: '45%' }}>
                <text className="text-sm font-semibold text-neutral-900 mb-6" style={{ letterSpacing: 1.5, textTransform: 'uppercase' }}>{cat}</text>
                <view style={{ gap: 16 }}>
                  {SKILLS.filter(s => s.category === cat).map((s, i) => (
                    <view key={i}>
                      <view className="flex-row justify-between mb-2">
                        <text className="text-sm text-neutral-700">{s.name}</text>
                        <text className="text-xs text-neutral-500">{s.proficiency}%</text>
                      </view>
                      <view className="h-2 bg-neutral-200 rounded-full">
                        <view className="h-full bg-neutral-900 rounded-full" style={{ width: `${s.proficiency}%` }} />
                      </view>
                    </view>
                  ))}
                </view>
              </view>
            ))}
          </view>
        </view>

        {/* Contact */}
        <view className="bg-white rounded-2xl border border-neutral-200 p-8">
          <view className="flex-row items-center mb-6" style={{ gap: 8 }}>
            <text className="text-2xl">✉️</text>
            <text className="text-2xl font-semibold text-neutral-900">Contact</text>
          </view>
          {submitted && (
            <view className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
              <text className="text-emerald-600 text-sm">Thanks! Message sent.</text>
            </view>
          )}
          <view style={{ gap: 16 }}>
            <input
              type="text"
              placeholder="Name"
              bindinput={(e) => setName(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <input
              type="email"
              placeholder="Email"
              bindinput={(e) => setEmail(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <textarea
              placeholder="Message"
              maxlines={4}
              bindinput={(e) => setMessage(e.detail.value)}
              className="w-full px-4 py-2 text-sm border border-neutral-200 rounded-lg"
            />
            <view
              bindtap={handleSend}
              className="w-full bg-neutral-900 rounded-lg py-2 items-center"
            >
              <text className="text-white text-sm font-medium">Send</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  )
}
