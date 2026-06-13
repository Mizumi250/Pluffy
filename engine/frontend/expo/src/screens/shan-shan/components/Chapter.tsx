// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — Chapter [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T09:40:31.661Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { CHAPTERS } from './constants'
import { GalleryStrip } from './GalleryStrip'
import { SoundBars } from './SoundBars'

// ─── CHAPTER COMPONENT ────────────────────────────────────────────────────────

export const Chapter = ({
  chapter,
  index,
  onWorkPress,
}: {
  chapter: typeof CHAPTERS[0]
  index: number
  onWorkPress: () => void
}) => {
  const coverScale   = useRef(new Animated.Value(1)).current
  const bodyOpacity  = useRef(new Animated.Value(0)).current
  const bodyTranslate = useRef(new Animated.Value(32)).current
  const [revealed, setRevealed] = useState(false)

  const revealBody = useCallback(() => {
    if (revealed) return
    setRevealed(true)
    Animated.parallel([
      Animated.timing(bodyOpacity, {
        toValue: 1, duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(bodyTranslate, {
        toValue: 0, duration: 600,
        useNativeDriver: true,
      }),
    ]).start()
  }, [revealed])

  // Subtle cover scale pulse on mount
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(coverScale, { toValue: 1.04, duration: 6000, useNativeDriver: true }),
        Animated.timing(coverScale, { toValue: 1.00, duration: 6000, useNativeDriver: true }),
      ])
    ).start()
  }, [])

  const nextChapter = CHAPTERS[index + 1]

  return (
    <View
      style={s.chapterWrap}
      onLayout={revealBody}
    >
      {/* ── Cover image ── */}
      <View style={{ overflow: 'hidden', height: 260 }}>
        <Animated.Image
          source={chapter.img}
          style={[s.chapterCoverImg, { transform: [{ scale: coverScale }] }]}
          resizeMode="cover"
        />
        <View style={s.chapterCoverOverlay} />

        {/* Num watermark */}
        <View style={{ position: 'absolute', bottom: 8, right: 16 }}>
          <Text style={s.chapterCoverNum}>{chapter.num}</Text>
        </View>

        {/* Chapter label badge */}
        <View style={[s.chapterCoverBadge]}>
          <View style={s.redPill}>
            <Text style={s.redPillText}>[{chapter.coverLabel.toUpperCase()}]</Text>
          </View>
        </View>

        {/* Bottom cover label */}
        <View style={s.chapterCoverLabel}>
          <Text style={s.chapterCoverLabelText}>[{chapter.num}] [CHAPTER]</Text>
        </View>
      </View>

      {/* ── Chapter body (animated in) ── */}
      <Animated.View style={{ opacity: bodyOpacity, transform: [{ translateY: bodyTranslate }] }}>

        {/* Header */}
        <View style={s.chapterBody}>
          <Text style={s.chapterTagline}>{chapter.tagline}</Text>
          <Text style={s.chapterTitle}>{chapter.coverLabel.toUpperCase()}</Text>
          <Text style={s.chapterHeadline}>{chapter.headline}</Text>
          <Text style={s.chapterDesc}>{chapter.desc}</Text>

          {/* Tags row */}
          <View style={s.chapterTagsWrap}>
            {chapter.tags.map((tag) => (
              <View key={tag} style={s.tagPill}>
                <Text style={s.tagPillText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={s.chapterDivider} />

        {/* Gallery strip */}
        <View style={{ marginVertical: 2 }}>
          <GalleryStrip images={chapter.gallery} />
        </View>

        <View style={s.chapterDivider} />

        {/* Craft quote */}
        <View style={s.chapterCraftWrap}>
          <Text style={s.chapterCraftLabel}>[MY APPROACH]</Text>
          <Text style={s.chapterCraftText}>{chapter.craft}</Text>
        </View>

        <View style={s.chapterDivider} />

        {/* Sound strip */}
        <View style={s.chapterSoundStrip}>
          <Text style={s.chapterSoundLabel}>THE SOUND WITHIN</Text>
          <Text style={s.chapterSoundTitle}>{chapter.sound}</Text>
          <SoundBars />
        </View>

        {/* Outro */}
        <View style={s.chapterOutroWrap}>
          <Text style={s.chapterOutroDesc}>{chapter.desc.slice(0, 90)}…</Text>

          <TouchableOpacity style={s.ctaButton} onPress={onWorkPress} activeOpacity={0.8}>
            <Text style={s.ctaButtonText}>LET'S WORK</Text>
          </TouchableOpacity>

          {nextChapter && (
            <>
              <Text style={s.chapterNextLabel}>NEXT CHAPTER</Text>
              <Text style={s.chapterNextTitle}>{nextChapter.coverLabel.toUpperCase()} →</Text>
            </>
          )}
        </View>

      </Animated.View>
    </View>
  )
}
