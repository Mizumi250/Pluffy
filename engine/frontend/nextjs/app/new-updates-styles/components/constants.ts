// ============================================================
// ARKZEN GENERATED SHARED CONSTANTS — new-updates-styles
// Source: @arkzen:components (new-updates-styles)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-12T14:02:47.468Z
// ============================================================

export const FEATURES: Feature[] = [
  {
    id: 1,
    icon: 'zap',
    title: 'Component Separation',
    description: 'Individual component files with shared utilities backend',
    color: 'blue',
  },
  {
    id: 2,
    icon: 'code',
    title: 'CSS DSL Support',
    description: 'Global CSS variables and per-component CSS Modules',
    color: 'purple',
  },
  {
    id: 3,
    icon: 'palette',
    title: 'Multiple Pages',
    description: 'Support for home, about, features, and custom routes',
    color: 'green',
  },
  {
    id: 4,
    icon: 'layers',
    title: 'Asset Management',
    description: 'Built-in favicon, image, and static file support',
    color: 'orange',
  },
]

const getIconComponent = (iconName: string) => {
  const icons: Record<string, React.ReactNode> = {
    zap:    <Zap size={32} />,
    code:   <Code size={32} />,
    palette: <Palette size={32} />,
    layers:  <Layers size={32} />,
  }
  return icons[iconName] || null
}
