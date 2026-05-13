import type { Metadata } from 'next'
import './styles/global.css'

export const metadata: Metadata = {
  icons: {
    icon: '📦',
  },
}

export default function AssetHubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
