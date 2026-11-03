'use client'
// ============================================================
// ARKZEN GENERATED PAGE — spring-ledger/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-03T12:28:37.443Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
type Account = { id: number; name: string; balance: string }

const IndexPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [fromId, setFromId] = useState('1')
  const [toId, setToId] = useState('2')
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const loadAccounts = useCallback(async () => {
    const response = await fetch('/api/spring-ledger/accounts')
    const data = await response.json()
    if (!response.ok) throw new Error(data?.message ?? 'Could not load accounts.')
    setAccounts(data)
  }, [])

  useEffect(() => {
    loadAccounts()
      .catch(reason => setError(reason instanceof Error ? reason.message : 'Could not load accounts.'))
      .finally(() => setLoading(false))
  }, [loadAccounts])

  const transfer = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    setMessage('')
    try {
      const response = await fetch('/api/spring-ledger/accounts/transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          from_account_id: Number(fromId),
          to_account_id: Number(toId),
          amount,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data?.message ?? 'Transfer failed.')
      setMessage(`Transfer completed. New balances: ${data.from_balance} and ${data.to_balance}.`)
      setAmount('')
      await loadAccounts()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Transfer failed.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto max-w-3xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-cyan-400">Spring Boot - Java</p>
          <h1 className="mt-2 text-4xl font-bold">Atomic Ledger</h1>
          <p className="mt-3 text-slate-400">
            Transfers use BigDecimal arithmetic and a database transaction. A rejected transfer leaves both
            account balances unchanged.
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2" aria-label="Accounts">
          {loading ? <p className="text-slate-400">Loading accounts...</p> : accounts.map(account => (
            <article key={account.id} className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
              <p className="text-sm text-slate-400">{account.name}</p>
              <p className="mt-2 text-3xl font-semibold">${account.balance}</p>
            </article>
          ))}
        </section>

        <form onSubmit={transfer} className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-xl font-semibold">Transfer funds</h2>
          <label className="block text-sm text-slate-300">
            From
            <select value={fromId} onChange={event => setFromId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              {accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            To
            <select value={toId} onChange={event => setToId(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3">
              {accounts.map(account => <option key={account.id} value={account.id}>{account.name}</option>)}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Amount
            <input type="number" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3" />
          </label>
          {error && <p role="alert" className="text-sm text-red-400">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-400">{message}</p>}
          <button type="submit" disabled={submitting || loading || accounts.length < 2 || fromId === toId} className="rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
            {submitting ? 'Transferring...' : 'Transfer'}
          </button>
        </form>
      </section>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_SpringLedger_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={{}}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_SpringLedger_Index
