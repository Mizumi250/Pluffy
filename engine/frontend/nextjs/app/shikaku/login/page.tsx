'use client'
// ============================================================
// ARKZEN GENERATED PAGE — shikaku/login
// Layout: +guest | Auth guard: false | Guest-only: true
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-31T12:45:25.907Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { CanvasEngine } from '../components/CanvasEngine'
import { LayerPanel } from '../components/LayerPanel'
import { PalettePanel } from '../components/PalettePanel'
import type { CanvasEngineProps, Frame, Layer, LayerPanelProps, PalettePanelProps, Pixel, Project, Tool } from '../components/types'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { useRouter } from 'next/navigation'

// Page component code (from @arkzen:page:login)
const LoginPage = () => {
  const router = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    try {
      await login(email, password)
      router.push('/shikaku')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to sign in')
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#0b0b16] p-6 text-white">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-2xl border border-indigo-400/20 bg-[#11111f] p-8 shadow-2xl">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-indigo-300">Shikaku</p>
          <h1 className="mt-2 text-2xl font-bold">Sign in to your studio</h1>
          <p className="mt-2 text-sm text-indigo-100/60">Your pixel projects are saved to your account.</p>
        </div>
        {error && <p role="alert" className="rounded-lg border border-red-400/30 bg-red-400/10 p-3 text-sm text-red-200">{error}</p>}
        <label className="block space-y-2 text-sm text-indigo-100/70">
          Email
          <input className="w-full rounded-lg border border-indigo-300/20 bg-[#0b0b16] px-3 py-2.5 text-white outline-none focus:border-indigo-400" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} />
        </label>
        <label className="block space-y-2 text-sm text-indigo-100/70">
          Password
          <input className="w-full rounded-lg border border-indigo-300/20 bg-[#0b0b16] px-3 py-2.5 text-white outline-none focus:border-indigo-400" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <button className="w-full rounded-lg bg-indigo-500 px-4 py-3 font-semibold text-white transition hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60" type="submit" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </button>
        <p className="text-center text-sm text-indigo-100/60">
          New here? <a className="text-indigo-300 underline underline-offset-4" href="/shikaku/register">Create an account</a>
        </p>
      </form>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_Shikaku_Login = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout guestOnly={true}>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <LoginPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_Shikaku_Login
