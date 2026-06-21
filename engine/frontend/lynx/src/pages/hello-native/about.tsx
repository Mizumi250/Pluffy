// ARKZEN GENERATED — hello-native/about (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T10:20:21.097Z
import { Badge } from './components/Badge'
import { GhostButton } from './components/GhostButton'
import { useState } from '@lynx-js/react'

const AboutLynxScreen = () => {
  const [count, setCount] = useState(0)

  return (
    <view className="flex-1 bg-neutral-50 px-6 pt-14 pb-10">

      {/* Back */}
      <GhostButton label="← Back" onPress={() => {}} />

      {/* Heading */}
      <view className="mt-8 mb-8">
        <Badge label="about" />
        <text className="text-3xl font-bold text-neutral-900 mt-4">
          About this tatemono
        </text>
        <text className="text-sm text-neutral-500 mt-2 leading-6">
          A minimal native module scaffolded by the Arkzen engine. Pure Lynx + Tailwind — no web code.
        </text>
      </view>

      {/* Interactive counter — quick state smoke test */}
      <view className="bg-white rounded-2xl border border-neutral-100 p-6 items-center mb-6">
        <text className="text-xs text-neutral-400 uppercase tracking-widest mb-2">
          State check
        </text>
        <text className="text-5xl font-bold text-indigo-500 mb-4">{count}</text>
        <view className="flex-row gap-x-3">
          <view
            bindtap={() => setCount(c => Math.max(0, c - 1))}
            className="w-12 h-12 rounded-2xl bg-neutral-100 items-center justify-center"
          >
            <text className="text-xl font-bold text-neutral-600">−</text>
          </view>
          <view
            bindtap={() => setCount(c => c + 1)}
            className="w-12 h-12 rounded-2xl bg-indigo-500 items-center justify-center"
          >
            <text className="text-xl font-bold text-white">+</text>
          </view>
        </view>
      </view>

      {/* Stack info */}
      <view className="bg-neutral-100 rounded-2xl px-5 py-4">
        <text className="text-xs font-mono text-neutral-500 leading-6">
          {`stack: lynx\nengine: arkzen v10.1\ntatemono: hello-native\nscreens: index, about`}
        </text>
      </view>

    </view>
  )
}

export const HelloNativeAbout = AboutLynxScreen;
