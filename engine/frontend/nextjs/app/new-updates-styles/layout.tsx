import type { Metadata } from 'next'
import './styles/global.css'

export const metadata: Metadata = {
  icons: {
    icon: 'https://cdn-icons-png.flaticon.com/512/1995/1995467.png',
  },
}

export default function NewUpdatesStylesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
