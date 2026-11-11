'use client'
// ============================================================
// ARKZEN GENERATED PAGE — aspnet-ledger/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-11T07:25:27.297Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'

// Page component code (from @arkzen:page:index)
const API = '/api/aspnet-ledger'

type Account = { id: number; owner: string; balance: number | string }
type Transfer = {
  id: number
  from_owner: string
  to_owner: string
  amount: number | string
  status: string
  memo: string | null
}
type Summary = { accounts: number; total_held: number | string; transfers: number; total_moved: number | string }
type Last = { label: string; status: number | string; ok: boolean; body: string }

const money = (value: number | string) =>
  Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
const cents = (value: number | string) => Math.round(Number(value) * 100)

const IndexPage = () => {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [baseline, setBaseline] = useState<number | null>(null)
  const [fromId, setFromId] = useState('')
  const [toId, setToId] = useState('')
  const [amount, setAmount] = useState('')
  const [memo, setMemo] = useState('')
  const [owner, setOwner] = useState('')
  const [opening, setOpening] = useState('')
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [last, setLast] = useState<Last | null>(null)

  const loadAll = useCallback(async (resetBaseline = false) => {
    const [accountsRes, transfersRes, summaryRes] = await Promise.all([
      fetch(API + '/accounts'),
      fetch(API + '/transfers'),
      fetch(API + '/summary'),
    ])
    if (!accountsRes.ok || !transfersRes.ok || !summaryRes.ok) throw new Error('Could not load the ledger.')
    const list: Account[] = await accountsRes.json()
    const history: Transfer[] = await transfersRes.json()
    const totals: Summary = await summaryRes.json()
    setAccounts(list)
    setTransfers(history)
    setSummary(totals)
    setBaseline(prev => (resetBaseline || prev === null ? cents(totals.total_held) : prev))
    setFromId(prev => (prev && list.some(a => String(a.id) === prev) ? prev : String(list[0]?.id ?? '')))
    setToId(prev => (prev && list.some(a => String(a.id) === prev) ? prev : String(list[1]?.id ?? '')))
  }, [])

  useEffect(() => {
    loadAll()
      .catch(reason => setLoadError(reason instanceof Error ? reason.message : 'Could not load the ledger.'))
      .finally(() => setLoading(false))
  }, [loadAll])

  const send = async (label: string, path: string, payload: unknown, resetBaseline = false) => {
    setBusy(true)
    try {
      const response = await fetch(API + path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
      })
      const text = await response.text()
      let data: any = null
      try { data = JSON.parse(text) } catch { data = null }
      setLast({ label, status: response.status, ok: response.ok, body: data ? JSON.stringify(data, null, 2) : text })
      await loadAll(resetBaseline)
    } catch (reason) {
      setLast({ label, status: 'network error', ok: false, body: reason instanceof Error ? reason.message : String(reason) })
    } finally {
      setBusy(false)
    }
  }

  const transferPayload = (overrides: Record<string, unknown> = {}) => ({
    from_account_id: Number(fromId),
    to_account_id: Number(toId),
    amount: Number(amount || 0),
    ...(memo.trim() ? { memo: memo.trim() } : {}),
    ...overrides,
  })

  const submitTransfer = async (event: React.FormEvent) => {
    event.preventDefault()
    await send('POST /transfer', '/transfer', transferPayload())
    setAmount('')
    setMemo('')
  }

  const openAccount = async (event: React.FormEvent) => {
    event.preventDefault()
    await send('POST /accounts', '/accounts', { owner: owner.trim(), balance: Number(opening || 0) }, true)
    setOwner('')
    setOpening('')
  }

  const conserved = baseline !== null && summary !== null && cents(summary.total_held) === baseline
  const ready = !loading && accounts.length >= 2 && fromId !== '' && toId !== ''
  const panel = 'rounded-2xl border border-slate-800 bg-slate-900 p-6'
  const field = 'mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 p-3'
  const ghost = 'rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-200 hover:bg-slate-800 disabled:opacity-50'

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-12 text-slate-100">
      <section className="mx-auto max-w-4xl space-y-8">
        <header>
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-violet-400">ASP.NET Core - C#</p>
          <h1 className="mt-2 text-4xl font-bold">Atomic Ledger</h1>
          <p className="mt-3 text-slate-400">
            Transfers run as C# decimal arithmetic inside one database transaction. A rejected or crashed transfer
            leaves every balance exactly as it was.
          </p>
        </header>

        {loadError && <p role="alert" className="text-sm text-red-400">{loadError} Is the backend running on port 8000?</p>}

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Totals">
          <article className={panel}>
            <p className="text-sm text-slate-400">Total held</p>
            <p className="mt-2 text-3xl font-semibold">${summary ? money(summary.total_held) : '...'}</p>
            <p className={'mt-2 text-xs ' + (conserved ? 'text-emerald-400' : 'text-amber-400')}>
              {conserved ? 'Conserved: transfers never change the total' : 'Total changed because an account was opened'}
            </p>
          </article>
          <article className={panel}>
            <p className="text-sm text-slate-400">Transfers completed</p>
            <p className="mt-2 text-3xl font-semibold">{summary ? String(summary.transfers) : '...'}</p>
          </article>
          <article className={panel}>
            <p className="text-sm text-slate-400">Total moved</p>
            <p className="mt-2 text-3xl font-semibold">${summary ? money(summary.total_moved) : '...'}</p>
          </article>
        </section>

        <section className="grid gap-4 sm:grid-cols-3" aria-label="Accounts">
          {loading ? <p className="text-slate-400">Loading accounts...</p> : accounts.map(account => (
            <article key={account.id} className={panel}>
              <p className="text-sm text-slate-400">#{account.id} {account.owner}</p>
              <p className="mt-2 text-3xl font-semibold">${money(account.balance)}</p>
            </article>
          ))}
        </section>

        <div className="grid gap-6 md:grid-cols-2">
          <form onSubmit={submitTransfer} className={panel + ' space-y-4'}>
            <h2 className="text-xl font-semibold">Transfer funds</h2>
            <label className="block text-sm text-slate-300">
              From
              <select value={fromId} onChange={event => setFromId(event.target.value)} className={field}>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.owner}</option>)}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              To
              <select value={toId} onChange={event => setToId(event.target.value)} className={field}>
                {accounts.map(account => <option key={account.id} value={account.id}>{account.owner}</option>)}
              </select>
            </label>
            <label className="block text-sm text-slate-300">
              Amount
              <input type="number" min="0.01" step="0.01" required value={amount} onChange={event => setAmount(event.target.value)} className={field} />
            </label>
            <label className="block text-sm text-slate-300">
              Memo (optional)
              <input type="text" maxLength={140} value={memo} onChange={event => setMemo(event.target.value)} className={field} />
            </label>
            <button type="submit" disabled={busy || !ready || fromId === toId} className="rounded-lg bg-violet-400 px-5 py-3 font-semibold text-slate-950 disabled:opacity-50">
              {busy ? 'Working...' : 'Transfer'}
            </button>
          </form>

          <div className="space-y-6">
            <section className={panel + ' space-y-3'}>
              <h2 className="text-xl font-semibold">Try to break it</h2>
              <p className="text-sm text-slate-400">Each button sends a bad or failing request. Balances must not move.</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={ghost} disabled={busy || !ready} onClick={() => send('Overdraw (expect 422)', '/transfer', transferPayload({ amount: 1000000 }))}>Overdraw</button>
                <button type="button" className={ghost} disabled={busy || !ready} onClick={() => send('Same account (expect 422)', '/transfer', transferPayload({ to_account_id: Number(fromId), amount: 1 }))}>Same account</button>
                <button type="button" className={ghost} disabled={busy || !ready} onClick={() => send('Unknown account (expect 404)', '/transfer', transferPayload({ to_account_id: 9999, amount: 1 }))}>Unknown account</button>
                <button type="button" className={ghost} disabled={busy || !ready} onClick={() => send('Negative amount (expect 422)', '/transfer', transferPayload({ amount: -5 }))}>Negative amount</button>
                <button type="button" className={ghost} disabled={busy || !ready} onClick={() => send('Crash after debit (expect 500, no change)', '/transfer/crash', { from_account_id: Number(fromId), to_account_id: Number(toId), amount: Number(amount || 1) })}>Crash mid-transfer</button>
              </div>
            </section>

            <form onSubmit={openAccount} className={panel + ' space-y-3'}>
              <h2 className="text-xl font-semibold">Open an account</h2>
              <input type="text" required maxLength={120} placeholder="Owner" value={owner} onChange={event => setOwner(event.target.value)} className={field} />
              <input type="number" min="0" step="0.01" placeholder="Opening balance" value={opening} onChange={event => setOpening(event.target.value)} className={field} />
              <button type="submit" disabled={busy || loading || !owner.trim()} className="rounded-lg bg-slate-100 px-5 py-2 font-semibold text-slate-950 disabled:opacity-50">Open account</button>
            </form>
          </div>
        </div>

        {last && (
          <section className={panel} aria-label="Last response">
            <p className="text-sm font-medium">
              <span className={last.ok ? 'text-emerald-400' : 'text-red-400'}>{String(last.status)}</span> {last.label}
            </p>
            <pre className="mt-2 max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-slate-300">{last.body}</pre>
          </section>
        )}

        <section className={panel} aria-label="Transfer history">
          <h2 className="text-xl font-semibold">Recent transfers</h2>
          {transfers.length === 0 ? (
            <p className="mt-3 text-sm text-slate-400">No transfers yet. Send one above.</p>
          ) : (
            <ul className="mt-3 divide-y divide-slate-800 text-sm">
              {transfers.map(item => (
                <li key={item.id} className="flex items-center justify-between gap-4 py-2">
                  <span>#{item.id} {item.from_owner} to {item.to_owner}{item.memo ? ' - ' + item.memo : ''}</span>
                  <span className="font-semibold">${money(item.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  )
}

// Wrapper for animation + layout
const ArkzenPage_AspnetLedger_Index = () => {
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

export default ArkzenPage_AspnetLedger_Index
