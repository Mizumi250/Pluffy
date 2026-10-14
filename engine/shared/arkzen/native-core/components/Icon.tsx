import * as LucideIcons from 'lucide-react-native'
import type { LucideProps } from 'lucide-react-native'
import type { ComponentType } from 'react'

interface ArkzenIconProps extends LucideProps {
  name: string
  set?: string
}

function isLucideIcon(value: unknown): value is ComponentType<LucideProps> {
  return typeof value === 'function'
}

export function Icon({ name, set = 'lucide', ...props }: ArkzenIconProps) {
  if (set !== 'lucide') {
    throw new Error(`Unsupported icon set "${set}". Only "lucide" is available in Expo.`)
  }

  const componentName = name
    .split(/[-_\s]/)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
  const entry = Object.entries(LucideIcons).find(([key]) => key === componentName)

  if (!entry || !isLucideIcon(entry[1])) {
    throw new Error(`Unknown Lucide icon "${name}".`)
  }

  const IconComponent = entry[1]
  return <IconComponent {...props} />
}
