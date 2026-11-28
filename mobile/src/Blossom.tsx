// The cherry blossom mark (same five petals as gui/build/icon.svg) and the falling petals.
// Petals are decoration, so they only appear on the connect screen and empty states, never on working screens,
// and they stop completely when the phone asks for reduced motion.
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Animated, Easing, StyleSheet, View } from 'react-native'
import Svg, { Circle, G, Path } from 'react-native-svg'
import { useReduceMotion, useTheme } from './theme'

const PETAL = 'M0 -2.5 C -6.5 -7 -6.5 -13 -3 -14.5 L 0 -12 L 3 -14.5 C 6.5 -13 6.5 -7 0 -2.5 Z'

export function Blossom({ size = 48, color, center, hollow = false, strokeColor }: { size?: number; color?: string; center?: string; hollow?: boolean; strokeColor?: string }) {
  const { c } = useTheme()
  const fill = color ?? c.primary
  const stroke = strokeColor ?? c.ink
  return (
    <Svg width={size} height={size} viewBox="-16 -16 32 32" accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <G fill={hollow ? 'none' : fill} stroke={hollow ? stroke : 'none'} strokeWidth={hollow ? 1.2 : 0}>
        {[0, 72, 144, 216, 288].map((a) => <Path key={a} d={PETAL} transform={`rotate(${a})`} />)}
      </G>
      <Circle r={2.2} fill={center ?? c.bg} />
    </Svg>
  )
}

type P = { x: number; s: number; dur: number; delay: number; sway: number; spin: number; o: number; col: string }

function Petal({ p, w, h }: { p: P; w: number; h: number }) {
  const fall = useRef(new Animated.Value(0)).current
  const sway = useRef(new Animated.Value(0)).current
  const spin = useRef(new Animated.Value(0)).current
  useEffect(() => {
    const a = Animated.sequence([Animated.delay(p.delay), Animated.loop(Animated.timing(fall, { toValue: 1, duration: p.dur, easing: Easing.linear, useNativeDriver: true }))])
    const b = Animated.loop(Animated.sequence([
      Animated.timing(sway, { toValue: 1, duration: p.dur / 3, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(sway, { toValue: 0, duration: p.dur / 3, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]))
    const r = Animated.loop(Animated.timing(spin, { toValue: 1, duration: p.spin, easing: Easing.linear, useNativeDriver: true }))
    a.start(); b.start(); r.start()
    return () => { a.stop(); b.stop(); r.stop() }
  }, [])
  const translateY = fall.interpolate({ inputRange: [0, 1], outputRange: [-48, h + 48] })
  const translateX = sway.interpolate({ inputRange: [0, 1], outputRange: [-p.sway, p.sway] })
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
  return (
    <Animated.View style={{ position: 'absolute', left: p.x * w, top: 0, opacity: p.o, transform: [{ translateY }, { translateX }, { rotate }] }}>
      <Svg width={p.s} height={p.s * 0.95} viewBox="-8 -16 16 15"><Path d={PETAL} fill={p.col} /></Svg>
    </Animated.View>
  )
}

export function Petals({ count = 14 }: { count?: number }) {
  const { mode } = useTheme()
  const reduce = useReduceMotion()
  const [box, setBox] = useState({ w: 0, h: 0 })
  const cols = mode === 'dark' ? ['#f99e9e', '#fbb3b3', '#e58a96'] : ['#f99e9e', '#fbb8b8', '#f58a8a']
  const items = useMemo<P[]>(() => Array.from({ length: count }, () => ({
    x: Math.random(), s: 14 + Math.random() * 16, dur: 9000 + Math.random() * 7000, delay: Math.random() * 8000,
    sway: 10 + Math.random() * 22, spin: 4000 + Math.random() * 5000, o: 0.35 + Math.random() * 0.4, col: cols[Math.floor(Math.random() * cols.length)],
  })), [count, mode])
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} onLayout={(e) => setBox({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}
      accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {!reduce && box.h > 0 && items.map((p, i) => <Petal key={`${mode}-${i}`} p={p} w={box.w} h={box.h} />)}
    </View>
  )
}
