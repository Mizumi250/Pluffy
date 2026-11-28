import React from 'react'
import { Pressable, View } from 'react-native'
import { TaskStatus } from './api'
import { Blossom } from './Blossom'
import { useStore } from './store'
import { T } from './ui'
import { useTheme } from './theme'

// Every status is an icon plus a word. Colour only supports it.
export const taskMeta = (s: TaskStatus) => ({
  running: { icon: 'loader-circle', word: 'Running' },
  done: { icon: 'circle-check', word: 'Done' },
  failed: { icon: 'circle-x', word: 'Failed' },
  stopped: { icon: 'square', word: 'Stopped' },
}[s])

// The laptop you are controlling, with a blossom that is filled when it answers and outlined when it does not.
export function LaptopChip({ onPress }: { onPress?: () => void }) {
  const { c } = useTheme()
  const { active, link } = useStore()
  if (!active) return null
  const word = link === 'online' ? 'Online' : link === 'checking' ? 'Checking' : link === 'auth' ? 'Unpaired' : 'Offline'
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`${active.name}, ${word}. Open laptop details`} onPress={onPress}
      style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: 8, minHeight: 44, paddingHorizontal: 12, borderRadius: 22, backgroundColor: pressed ? c.chipPress : c.surface, maxWidth: 190 })}>
      <Blossom size={22} hollow={link !== 'online'} center={link === 'online' ? c.surface : c.surface} />
      <View style={{ flexShrink: 1 }}>
        <T v="strong" numberOfLines={1} style={{ fontSize: 14, lineHeight: 18 }}>{active.name}</T>
        <T v="caption" numberOfLines={1} style={{ fontSize: 13, lineHeight: 16 }}>{word}</T>
      </View>
    </Pressable>
  )
}
