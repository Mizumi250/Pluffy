/* @arkzen:meta
name: spring-ledger
version: 1.0.0
description: "Spring Boot showcase: atomic ledger transfers using Java BigDecimal and per-Tatemono database transactions."
auth: false
*/

/* @arkzen:database:accounts
table: accounts
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 120
    nullable: false
  balance:
    type: decimal
    precision: 14
    scale: 2
    nullable: false
seeder:
  data:
    - id: 1
      name: Operating Account
      balance: "12500.00"
    - id: 2
      name: Reserve Account
      balance: "3200.00"
*/

/* @arkzen:database:transfers
table: transfers
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  from_account_id:
    type: foreignId
    foreign: accounts.id
  to_account_id:
    type: foreignId
    foreign: accounts.id
  amount:
    type: decimal
    precision: 14
    scale: 2
    nullable: false
  status:
    type: string
    length: 20
    nullable: false
seeder:
  data: []
*/

/* @arkzen:api:accounts
model: Account
controller: AccountController
prefix: /api/spring-ledger/accounts
middleware: []
endpoints:
  index:
    method: GET
    route: /
    response:
      type: array
  transfer:
    method: POST
    route: /transfer
    validation:
      from_account_id: required|integer
      to_account_id: required|integer
      amount: required|numeric|min:0.01
    response:
      type: single
*/

/* @arkzen:endpoint:java:transfer
*/
Map<String, Object> input = request.validate(mapOf(
    "from_account_id", "required|integer",
    "to_account_id", "required|integer",
    "amount", "required|numeric|min:0.01"
));
BigDecimal amount = new BigDecimal(String.valueOf(input.get("amount")));
if (amount.signum() <= 0) throw new Errors.HttpException(422, "Transfer amount must be positive.");
if (String.valueOf(input.get("from_account_id")).equals(String.valueOf(input.get("to_account_id"))))
    throw new Errors.HttpException(422, "Choose two different accounts for a transfer.");

return DB.transaction(() -> {
    Account source = Account.findOrFail(input.get("from_account_id"));
    Account destination = Account.findOrFail(input.get("to_account_id"));
    BigDecimal sourceBalance = new BigDecimal(source.str("balance"));
    BigDecimal destinationBalance = new BigDecimal(destination.str("balance"));
    if (sourceBalance.compareTo(amount) < 0)
        throw new Errors.HttpException(422, "Insufficient funds.");

    source.set("balance", sourceBalance.subtract(amount)).save();
    destination.set("balance", destinationBalance.add(amount)).save();
    Transfer transfer = Transfer.create(mapOf(
        "from_account_id", source.id(),
        "to_account_id", destination.id(),
        "amount", amount,
        "status", "completed"
    ));
    return response.json(mapOf(
        "transfer", transfer,
        "from_balance", source.str("balance"),
        "to_balance", destination.str("balance")
    ), 201);
});
/* @arkzen:endpoint:java:transfer:end */

/* @arkzen:api:transfers
model: Transfer
controller: TransferController
prefix: /api/spring-ledger/transfers
middleware: []
endpoints:
  index:
    method: GET
    route: /
    response:
      type: array
*/

/* @arkzen:web:page:index */
'use client'

import React, { useCallback, useEffect, useState } from 'react'

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
/* @arkzen:web:page:index:end */
