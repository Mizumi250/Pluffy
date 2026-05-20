// ============================================================
// ARKZEN — TanStack Start ROOT ROUTE
// src/routes/__root.tsx
//
// This is the HTML shell for the app. All page routes are
// children of this root. The ToastProvider lives here so
// every tatemono page has access to toasts.
// ============================================================

import {
  createRootRoute,
  Outlet,
  ScrollRestoration,
} from '@tanstack/react-router'
import { Meta, Scripts } from '@tanstack/react-start'
import { ToastProvider } from '@/arkzen/core/components/Toast'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ],
    links: [
      {
        rel: 'preconnect',
        href: 'https://fonts.bunny.net',
      },
      {
        rel: 'stylesheet',
        href: 'https://fonts.bunny.net/css?family=inter:400,500,600,700&display=swap',
      },
    ],
  }),

  component: RootComponent,
})

function RootComponent() {
  return (
    <html lang="en">
      <head>
        <Meta />
      </head>
      <body>
        <ToastProvider position="top-right">
          <Outlet />
        </ToastProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  )
}
