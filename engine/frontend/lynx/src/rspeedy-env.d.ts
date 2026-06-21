/// <reference types="@lynx-js/rspeedy/client" />

import type * as Lynx from '@lynx-js/types'

declare module '@lynx-js/types' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface GlobalProps {
    /**
     * Define your global properties in this interface.
     * These types will be accessible through `lynx.__globalProps`.
     */
  }

  // ─────────────────────────────────────────────
  // <x-svg> from @lynx-js/web-elements.
  // Required for arkzen/core/components/Icon.tsx —
  // see that file's header comment for details.
  // ─────────────────────────────────────────────
  interface IntrinsicElements extends Lynx.IntrinsicElements {
    'x-svg': {
      content: string
      style?: Record<string, unknown>
      className?: string
    }
  }

  // ─────────────────────────────────────────────
  // Custom native modules. `lynx.openSchema` and
  // web-style `<input type="file">` are NOT part of
  // the public Lynx API — there is no built-in way to
  // open an external URL or pick a file from JS alone.
  // These two methods must be implemented natively
  // (iOS/Android) and registered under these names
  // before tatemonos calling them will actually work
  // on-device. Until then, calls fall back to a no-op
  // + console.warn (see ArkzenBridge.ts).
  // ─────────────────────────────────────────────
  interface NativeModules {
    ArkzenBridge: {
      /** Opens an external URL via the platform (browser / deep link). */
      openURL(url: string): void
      /** Opens the native file picker. Resolves with picked file metadata. */
      pickFiles(options: { multiple?: boolean }): Promise<
        Array<{ uri: string; name: string; size: number; mimeType: string }>
      >
    }
  }
}

// This export makes the file a module
export {}
