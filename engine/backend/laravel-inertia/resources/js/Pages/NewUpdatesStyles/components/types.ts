// ============================================================
// ARKZEN GENERATED TYPES — new-updates-styles [React+Inertia]
// Source: @arkzen:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-13T17:05:21.703Z
// ============================================================

export type Feature = {
  id: number
  icon: 'zap' | 'code' | 'palette' | 'layers'
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

export interface FeatureCardProps {
  icon: React.ReactNode
  title: string
  description: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}

export interface HeroSectionProps {
  title: string
  subtitle: string
  ctaText: string
  onCta?: () => void
}
