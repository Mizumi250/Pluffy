// ============================================================
// ARKZEN GENERATED NATIVE TYPES — kotoba [Expo]
// Source: @arkzen:native:components (kotoba)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-27T08:12:16.360Z
// ============================================================

export type KProfile = {
  id: number; user_id: number; display_name: string; bio?: string | null; native_lang: string; learning_lang: string
  level: string; country?: string | null; interests?: string | null; avatar_color: string; xp: number; streak: number
  best_streak: number; daily_goal: number; words_written: number; messages_sent: number; onboarded: boolean
  score?: number; shared?: string[]; following?: boolean
}

export type KPost = {
  id: number; user_id: number; author_name: string; author_color?: string | null; author_native?: string | null
  lang: string; kind: string; mission_id?: number | null; body: string; translation?: string | null
  likes_count: number; comments_count: number; corrections_count: number; liked?: boolean; created_at?: string
}

export type KComment = {
  id: number; post_id: number; user_id: number; author_name: string; author_color?: string | null; body: string
  is_correction: boolean; corrected?: string | null; explanation?: string | null; accepted: boolean; created_at?: string
}
