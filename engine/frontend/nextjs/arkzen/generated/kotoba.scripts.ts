// ============================================================
// ARKZEN GENERATED SCRIPT — kotoba
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-29T02:08:57.872Z
// ============================================================

import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Shared building blocks used by BOTH the generated utils.tsx and hooks.tsx.
// The engine emits constants / utils / hooks / types as separate modules that
// don't import each other (langName needs LANGS, useApi needs kt), so anything
// they share lives here and is imported once by the components block below.

// ─── Languages ────────────────────────────────────────────────
export const LANGS = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' }, { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Mandarin' }, { code: 'tl', name: 'Filipino' },
]
export const langName = (c?: string | null) => LANGS.find(l => l.code === c)?.name ?? (c ?? '')

// ─── Network ──────────────────────────────────────────────────
export async function kt<T = any>(path: string, opts: { method?: string; json?: any } = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? (opts.json !== undefined ? 'POST' : 'GET') }
  if (opts.json !== undefined) init.body = JSON.stringify(opts.json)
  const res = await arkzenFetch(`/api/kotoba${path}`, init)
  let data: any = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined
    throw new Error(first ?? data?.message ?? `Request failed (${res.status})`)
  }
  return data as T
}
