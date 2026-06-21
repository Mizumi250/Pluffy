// ============================================================
// ARKZEN ENGINE — LYNX ICON COMPONENT v1.0
// Drop-in replacement for `@sigx/lynx-icons`, built on Lynx 3.7's
// native <svg> element (lynxjs.org/blog/lynx-3-7) instead of a
// DOM/ComponentFactory-based icon runtime.
//
// Import this directly from tatemono source instead of
// '@sigx/lynx-icons':
//   import { Icon } from '@/arkzen/core/components/Icon'
// Same props (set, name, size, color), same JSX call sites —
// only the import line changes.
//
// Path data is resolved at render time from packages already in
// package.json (@fortawesome/free-{solid,regular,brands}-svg-icons)
// for set="fas"|"far"|"fab", and from @lucide/icons (new dep,
// framework-agnostic icon-node data, no React/DOM coupling) for
// set="lucide". No per-icon static imports — names are resolved
// generically so every existing call site (<Icon set="fas" name=
// "circle-xmark" .../>, <Icon set="lucide" name="trash-2" .../>)
// keeps working.
// ============================================================

import React from '@lynx-js/react'

import * as faSolid   from '@fortawesome/free-solid-svg-icons'
import * as faRegular from '@fortawesome/free-regular-svg-icons'
import * as faBrands  from '@fortawesome/free-brands-svg-icons'

import * as lucideIcons from '@lucide/icons'
import { buildLucideIconNode } from '@lucide/icons/builders'

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
// LUCIDE NODE -> LYNX ELEMENTS
// @lucide/icons ships icon data as a framework-agnostic
// [tagName, attributes, children?] tree (svgson-like).
// We walk it into real Lynx-native intrinsics (<path>,
// <circle>, <line>, <polyline>, <rect>, ...). `color` is
// re-applied on every node (not just the root <svg>) since
// Lynx's renderer is not guaranteed to cascade `stroke`
// via CSS-style inheritance the way a browser would.
// ─────────────────────────────────────────────

function renderLucideNode(node: any, color: string, key: string | number): any {
  const [tag, attrs = {}, children] = node
  const ownAttrs = attrs.stroke ? attrs : { ...attrs, stroke: color }
  const kids = Array.isArray(children)
    ? children.map((child: any, i: number) => renderLucideNode(child, color, i))
    : null
  return React.createElement(tag, { key, ...ownAttrs }, kids)
}

// ─────────────────────────────────────────────
// ICON
// ─────────────────────────────────────────────

export const Icon: React.FC<IconProps> = ({
  set = 'fas',
  name,
  size = 16,
  color = 'currentColor',
  style,
  className,
}) => {
  const dimension = `${size}px`

  if (set === 'lucide') {
    const iconData = resolveLucideIcon(name)
    if (!iconData) {
      console.error(`[Icon] Unknown lucide icon: "${name}"`)
      return null
    }
    const [, rootAttrs, children] = buildLucideIconNode(iconData, { size, color })
    return (
      <svg
        viewBox={rootAttrs.viewBox}
        style={{ width: dimension, height: dimension, ...style }}
        className={className}
      >
        {(children ?? []).map((child: any, i: number) => renderLucideNode(child, color, i))}
      </svg>
    )
  }

  const faIcon = resolveFaIcon(set, name)
  if (!faIcon) {
    console.error(`[Icon] Unknown ${set} icon: "${name}"`)
    return null
  }

  const [width, height, , , pathData] = faIcon.icon
  const paths: string[] = Array.isArray(pathData) ? pathData : [pathData]

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{ width: dimension, height: dimension, ...style }}
      className={className}
    >
      {paths.map((d, i) => (
        <path key={i} d={d} fill={color} />
      ))}
    </svg>
  )
}

export default Icon
