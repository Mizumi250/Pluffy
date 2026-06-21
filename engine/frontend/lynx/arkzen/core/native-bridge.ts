// ============================================================
// ARKZEN ENGINE — LYNX NATIVE BRIDGE
//
// `lynx.openSchema` and web-style `<input type="file">` are not
// real Lynx APIs (see src/rspeedy-env.d.ts for the type story).
// Opening an external URL and picking a file both require a
// native module — there is no JS-only equivalent on this
// platform. `ArkzenBridge` is that native module's expected
// shape; it must be implemented and registered natively
// (iOS/Android) under the name "ArkzenBridge".
//
// Until the native side exists, these wrappers no-op safely
// (warn + resolve empty) instead of throwing, so tatemonos that
// call them keep building and running.
// ============================================================

import type { NativeModules } from '@lynx-js/types'

function getBridge(): NativeModules['ArkzenBridge'] | undefined {
  return typeof NativeModules !== 'undefined' ? NativeModules.ArkzenBridge : undefined
}

export function openURL(url: string): void {
  const bridge = getBridge()
  if (!bridge) {
    console.warn(
      `[ArkzenBridge] openURL("${url}") called but the native ArkzenBridge module isn't ` +
      `registered yet. Implement NativeModules.ArkzenBridge.openURL natively to enable this.`
    )
    return
  }
  bridge.openURL(url)
}

export async function pickFiles(
  options: { multiple?: boolean } = {}
): Promise<Array<{ uri: string; name: string; size: number; mimeType: string }>> {
  const bridge = getBridge()
  if (!bridge) {
    console.warn(
      `[ArkzenBridge] pickFiles() called but the native ArkzenBridge module isn't registered ` +
      `yet. Implement NativeModules.ArkzenBridge.pickFiles natively to enable file uploads.`
    )
    return []
  }
  return bridge.pickFiles(options)
}
