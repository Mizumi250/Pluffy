// ============================================================
// ARKZEN ENGINE — LYNX ICON COMPONENT v1.1
// Drop-in replacement for `@sigx/lynx-icons`.
//
// Import this directly from tatemono source instead of
// '@sigx/lynx-icons':
//   import { Icon } from '@/arkzen/core/components/Icon'
// Same props (set, name, size, color), same JSX call sites —
// only the import line changes.
//
// Path data is resolved at render time from packages already in
// package.json (@fortawesome/free-{solid,regular,brands}-svg-icons)
// for set="fas"|"far"|"fab", and from @lucide/icons (framework-
// agnostic icon-node data, no React/DOM coupling) for set="lucide".
// No per-icon static imports — names are resolved generically so
// every existing call site (<Icon set="fas" name="circle-xmark" .../>,
// <Icon set="lucide" name="trash-2" .../>) keeps working.
//
// RENDERING NOTE: Lynx's React runtime (@lynx-js/react) does not
// expose <svg>/<path> as JSX intrinsics — there is no SVGProps /
// IntrinsicElements entry for them. Actual SVG support comes from
// @lynx-js/web-elements' <x-svg> custom element, which takes raw
// SVG markup as a string via its `content` attribute. So instead
// of walking icon node data into nested JSX elements, this builds
// a complete SVG string and hands it to <x-svg>.
//
// SETUP REQUIRED: this needs @lynx-js/web-elements installed and
// its elements registered for this app (see that package's docs /
// your lynx.config.ts) before <x-svg> will render. If your TS
// config's jsxImportSource type defs don't already pick up
// `x-svg` under JSX.IntrinsicElements, add the package's type
// augmentation (or a local one) so this file type-checks.
// ============================================================

import type { FC } from '@lynx-js/react'

import * as faSolid   from '@fortawesome/free-solid-svg-icons'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import * as faBrands  from '@fortawesome/free-brands-svg-icons'

import * as lucideIcons from '@lucide/icons'
import { buildLucideSvg } from '@lucide/icons/build'

export type IconSet = 'fas' | 'far' | 'fab' | 'lucide'

export interface IconProps {
  set?:       IconSet
  name:       string
  size?:      number
  color?:     string
  style?:     Record<string, any>
  className?: string
}

// ─────────────────────────────────────────────
// NAME RESOLUTION
// kebab-case DSL names ("circle-xmark") -> PascalCase
// ("CircleXmark") for both FA ("faCircleXmark") and
// Lucide ("CircleXmark") export lookups.
// ─────────────────────────────────────────────

function toPascal(name: string): string {
  return name
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

const FA_PACKAGES: Record<'fas' | 'far' | 'fab', Record<string, any>> = {
  fas: faSolid,
  far: faRegular,
  fab: faBrands,
}

function resolveFaIcon(set: 'fas' | 'far' | 'fab', name: string) {
  return FA_PACKAGES[set]?.[`fa${toPascal(name)}`]
}

function resolveLucideIcon(name: string) {
  return (lucideIcons as Record<string, any>)[toPascal(name)]
}

// ─────────────────────────────────────────────
// FA ICON -> SVG STRING
// FA icon data is [width, height, ligatures, unicode, pathData].
// ─────────────────────────────────────────────

function faToSvgString(faIcon: any, color: string): string {
  const [width, height, , , pathData] = faIcon.icon
  const paths: string[] = Array.isArray(pathData) ? pathData : [pathData]
  const body = paths.map(d => `<path d="${d}" fill="${color}"/>`).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}">${body}</svg>`
}

// ─────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────

export const Icon: FC<IconProps> = ({
  set = 'fas',
  name,
  size = 16,
  color = 'currentColor',
  style,
  className,
}) => {
  const dimension = `${size}px`

  let svgContent: string

  if (set === 'lucide') {
    const iconData = resolveLucideIcon(name)
    if (!iconData) {
      console.error(`[Icon] Unknown lucide icon: "${name}"`)
      return null
    }
    svgContent = buildLucideSvg(iconData, { size, color })
  } else {
    const faIcon = resolveFaIcon(set, name)
    if (!faIcon) {
      console.error(`[Icon] Unknown ${set} icon: "${name}"`)
      return null
    }
    svgContent = faToSvgString(faIcon, color)
  }

  return (
    <x-svg
      content={svgContent}
      style={{ width: dimension, height: dimension, ...style }}
      className={className}
    />
  )
}

export default Icon
