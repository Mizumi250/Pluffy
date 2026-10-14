// ============================================================
// ARKZEN ADAPTER — Link (Expo stack)
// arkzen/core/adapters/Link.tsx
//
// Maps the generic <Link href="..."> API used in tatemono
// page components to expo-router's <Link> component.
//
// Shared component utils reference this adapter so they
// compile correctly on the Expo stack without DOM deps.
// ============================================================

import React from 'react'
import { Link as ExpoLink, type Href } from 'expo-router'
import { StyleSheet } from 'react-native'

interface ArkzenLinkProps {
  href?:      string
  to?:        string
  children:   React.ReactNode
  style?:     object
  className?: string  // accepted but ignored — use style instead
}

export const Link: React.FC<ArkzenLinkProps> = ({ href, to, children, style }) => {
  const target = (to ?? href ?? '/') as Href

  return (
    <ExpoLink href={target} style={[styles.link, style]}>
      {children}
    </ExpoLink>
  )
}

const styles = StyleSheet.create({
  link: {
    color: '#6366f1',
    textDecorationLine: 'underline',
  },
})

export default Link
