import {
  createRootRoute,
  Outlet,
  HeadContent,
  Scripts,
} from '@tanstack/react-router'
import { ToastProvider } from '@/arkzen/core/components/Toast'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      { rel: 'preconnect', href: 'https://fonts.bunny.net' },
      { rel: 'stylesheet', href: 'https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap' },
    ],
  }),
  notFoundComponent: () => (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>404 — Page not found</h2>
    </div>
  ),
  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        <ToastProvider position="top-right">
          <Outlet />
        </ToastProvider>
        <Scripts />
      </body>
    </html>
  )
}