// ============================================================
// ARKZEN GENERATED NATIVE COMPONENT — BurgerNav [Expo]
// Source: @arkzen:native:components (shan-shan)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-13T10:20:32.973Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { setActiveTatemono } from '../../../../arkzen/core/stores/authStore'
import { Animated, Dimensions, Image, Linking, Modal, Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import { NAV_LINKS } from './constants'

// ─── BURGER / NAV ─────────────────────────────────────────────────────────────

export const BurgerNav = ({
  onNavigate,
  darkBg = false,
}: {
  onNavigate: (target: string) => void
  darkBg?: boolean
}) => {
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<string | null>(null)
  const overlayOpacity = useRef(new Animated.Value(0)).current
  const navItemAnims   = useRef(NAV_LINKS.map(() => ({
    opacity:    new Animated.Value(0),
    translateX: new Animated.Value(-40),
  }))).current

  const openNav = () => {
    setOpen(true)
    Animated.timing(overlayOpacity, {
      toValue: 1, duration: 320,
      useNativeDriver: true,
    }).start(() => {
      NAV_LINKS.forEach((_, i) => {
        Animated.parallel([
          Animated.timing(navItemAnims[i].opacity, {
            toValue: 1, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
          Animated.timing(navItemAnims[i].translateX, {
            toValue: 0, duration: 340, delay: i * 80,
            useNativeDriver: true,
          }),
        ]).start()
      })
    })
  }

  const closeNav = () => {
    navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
      Animated.timing(op,  { toValue: 0, duration: 180, useNativeDriver: true }).start()
      Animated.timing(tx,  { toValue: -40, duration: 180, useNativeDriver: true }).start()
    })
    Animated.timing(overlayOpacity, {
      toValue: 0, duration: 300, delay: 120,
      useNativeDriver: true,
    }).start(() => {
      setOpen(false)
      navItemAnims.forEach(({ opacity: op, translateX: tx }) => {
        op.setValue(0); tx.setValue(-40)
      })
    })
  }

  const handleLink = (scrollTo: string) => {
    setActive(scrollTo)
    closeNav()
    setTimeout(() => {
      onNavigate(scrollTo)
      setActive(null)
    }, 340)
  }

  // Burger lines
  const line1Rotate    = useRef(new Animated.Value(0)).current
  const line2Opacity   = useRef(new Animated.Value(1)).current
  const line3Rotate    = useRef(new Animated.Value(0)).current

  useEffect(() => {
    if (open) {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 1, duration: 280, useNativeDriver: true }),
      ]).start()
    } else {
      Animated.parallel([
        Animated.timing(line1Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
        Animated.timing(line2Opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(line3Rotate,  { toValue: 0, duration: 280, useNativeDriver: true }),
      ]).start()
    }
  }, [open])

  const lineColor = darkBg ? '#ffffff' : '#ffffff'

  return (
    <>
      {/* Burger button */}
      <TouchableOpacity
        style={s.burgerBtn}
        onPress={openNav}
        activeOpacity={0.7}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line1Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '45deg'] }),
          }, {
            translateY: line1Rotate.interpolate({ inputRange: [0,1], outputRange: [0, 10] }),
          }],
        }} />
        <Animated.View style={{
          height: 2, width: 20, backgroundColor: lineColor, borderRadius: 1,
          opacity: line2Opacity,
        }} />
        <Animated.View style={{
          height: 2, width: 28, backgroundColor: lineColor, borderRadius: 1,
          transform: [{
            rotate: line3Rotate.interpolate({ inputRange: [0,1], outputRange: ['0deg', '-45deg'] }),
          }, {
            translateY: line3Rotate.interpolate({ inputRange: [0,1], outputRange: [0, -10] }),
          }],
        }} />
      </TouchableOpacity>

      {/* Full-screen nav overlay */}
      <Modal visible={open} transparent animationType="none" statusBarTranslucent>
        <Animated.View style={[s.navOverlay, { opacity: overlayOpacity }]}>
          {/* Close button */}
          <TouchableOpacity style={s.navCloseBtn} onPress={closeNav} activeOpacity={0.7}>
            <Text style={s.navCloseText}>×</Text>
          </TouchableOpacity>

          {/* Nav links */}
          <View style={{ width: '100%', gap: 4 }}>
            {NAV_LINKS.map((link, i) => (
              <Animated.View
                key={link.scrollTo}
                style={{
                  opacity: navItemAnims[i].opacity,
                  transform: [{ translateX: navItemAnims[i].translateX }],
                }}
              >
                <TouchableOpacity
                  onPress={() => handleLink(link.scrollTo)}
                  activeOpacity={0.7}
                >
                  <Text style={active === link.scrollTo ? s.navLinkTextActive : s.navLinkText}>
                    {link.label}
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>

          {/* Bottom micro info */}
          <View style={{ position: 'absolute', bottom: 48, left: 40 }}>
            <Text style={{ fontSize: 9, letterSpacing: 3, color: 'rgba(255,255,255,0.2)' }}>
              SHAN SABAL CEZAR · PORTFOLIO
            </Text>
          </View>
        </Animated.View>
      </Modal>
    </>
  )
}

// ─── GALLERY STRIP ────────────────────────────────────────────────────────────
