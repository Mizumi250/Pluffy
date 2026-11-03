/* @arkzen:meta
name: aspnet-ledger
version: 2.0.0
description: "ASP.NET Core showcase: atomic ledger transfers in C# with decimal arithmetic, per-Tatemono database transactions, a rollback proof, validation and a live transfer history."
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
  owner:
    type: string
    length: 120
    nullable: false
  balance:
    type: decimal
    precision: 12
    scale: 2
    default: 0
seeder:
  data:
    - owner: Ada
      balance: 1000.00
    - owner: Grace
      balance: 500.00
    - owner: Linus
      balance: 250.00
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
    type: integer
    nullable: false
  to_account_id:
    type: integer
    nullable: false
  amount:
    type: decimal
    precision: 12
    scale: 2
    nullable: false
  status:
    type: string
    length: 20
    default: completed
  memo:
    type: string
    length: 140
    nullable: true
*/

/* @arkzen:api:accounts
model: Account
controller: AccountController
prefix: /api/aspnet-ledger
middleware: []
resource: false
policy: false
factory: false
endpoints:
  accounts:
    method: GET
    route: /accounts
    type: accounts
    description: List accounts ordered by id
  open:
    method: POST
    route: /accounts
    type: store
    description: Open an account (standard CRUD store with validation)
    validation:
      owner: required|string|max:120
      balance: sometimes|numeric|min:0
  transfer:
    method: POST
    route: /transfer
    type: transfer
    description: Move funds between two accounts in one database transaction
    validation:
      from_account_id: required|integer
      to_account_id: required|integer
      amount: required|numeric|min:0.01
      memo: sometimes|string|max:140
  crash:
    method: POST
    route: /transfer/crash
    type: crash
    description: Debits the source, then fails on purpose to prove the rollback
    validation:
      from_account_id: required|integer
      to_account_id: required|integer
      amount: required|numeric|min:0.01
  transfers:
    method: GET
    route: /transfers
    type: transfers
    description: Latest transfers with account owners
  summary:
    method: GET
    route: /summary
    type: summary
    description: Total money held and total moved
*/

/* @arkzen:endpoint:cs:accounts
*/
var rows = await ScriptDatabase.QueryAsync(
    Database,
    "SELECT id, owner, balance FROM \"aspnet_ledger_accounts\" ORDER BY id",
    null,
    Context.RequestAborted);
return Results.Json(rows);
/* @arkzen:endpoint:cs:accounts:end */

/* @arkzen:endpoint:cs:transfers
*/
var rows = await ScriptDatabase.QueryAsync(
    Database,
    """
    SELECT t.id, t.from_account_id, t.to_account_id,
           a.owner AS from_owner, b.owner AS to_owner,
           t.amount, t.status, t.memo, t.created_at
    FROM "aspnet_ledger_transfers" t
    JOIN "aspnet_ledger_accounts" a ON a.id = t.from_account_id
    JOIN "aspnet_ledger_accounts" b ON b.id = t.to_account_id
    ORDER BY t.id DESC
    LIMIT 20
    """,
    null,
    Context.RequestAborted);
return Results.Json(rows);
/* @arkzen:endpoint:cs:transfers:end */

/* @arkzen:endpoint:cs:summary
*/
var held = await ScriptDatabase.QueryAsync(
    Database,
    "SELECT COUNT(*) AS accounts, COALESCE(SUM(balance), 0) AS total FROM \"aspnet_ledger_accounts\"",
    null,
    Context.RequestAborted);
var moved = await ScriptDatabase.QueryAsync(
    Database,
    "SELECT COUNT(*) AS transfers, COALESCE(SUM(amount), 0) AS total FROM \"aspnet_ledger_transfers\"",
    null,
    Context.RequestAborted);
return Results.Json(new
{
    accounts = held[0]["accounts"],
    total_held = held[0]["total"],
    transfers = moved[0]["transfers"],
    total_moved = moved[0]["total"]
});
/* @arkzen:endpoint:cs:summary:end */

/* @arkzen:endpoint:cs:transfer
*/
if (!long.TryParse(Body["from_account_id"]?.ToString(), out var fromId) ||
    !long.TryParse(Body["to_account_id"]?.ToString(), out var toId) ||
    !decimal.TryParse(Body["amount"]?.ToString(), System.Globalization.NumberStyles.Number,
        System.Globalization.CultureInfo.InvariantCulture, out var amount) ||
    amount <= 0 || fromId == toId)
    return Results.UnprocessableEntity(new { message = "A positive amount and two different account IDs are required." });

var memo = Body["memo"]?.ToString();

var transaction = await Database.BeginTransactionAsync(Context.RequestAborted);
try
{
    var fromBalanceValue = await ScriptDatabase.ScalarAsync(
        Database,
        "SELECT balance FROM \"aspnet_ledger_accounts\" WHERE id = @id",
        new Dictionary<string, object?> { ["@id"] = fromId },
        Context.RequestAborted,
        transaction);
    var toBalanceValue = await ScriptDatabase.ScalarAsync(
        Database,
        "SELECT balance FROM \"aspnet_ledger_accounts\" WHERE id = @id",
        new Dictionary<string, object?> { ["@id"] = toId },
        Context.RequestAborted,
        transaction);

    if (fromBalanceValue is null or DBNull || toBalanceValue is null or DBNull)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.NotFound(new { message = "Account not found." });
    }

    var fromBalance = Convert.ToDecimal(fromBalanceValue, System.Globalization.CultureInfo.InvariantCulture);
    var toBalance = Convert.ToDecimal(toBalanceValue, System.Globalization.CultureInfo.InvariantCulture);
    if (fromBalance < amount)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.UnprocessableEntity(new { message = "Insufficient funds." });
    }

    var now = DateTime.UtcNow;
    await ScriptDatabase.ExecuteAsync(
        Database,
        "UPDATE \"aspnet_ledger_accounts\" SET balance = @balance, updated_at = @updated WHERE id = @id",
        new Dictionary<string, object?> { ["@balance"] = fromBalance - amount, ["@updated"] = now, ["@id"] = fromId },
        Context.RequestAborted,
        transaction);
    await ScriptDatabase.ExecuteAsync(
        Database,
        "UPDATE \"aspnet_ledger_accounts\" SET balance = @balance, updated_at = @updated WHERE id = @id",
        new Dictionary<string, object?> { ["@balance"] = toBalance + amount, ["@updated"] = now, ["@id"] = toId },
        Context.RequestAborted,
        transaction);

    var transferId = await ScriptDatabase.ScalarAsync(
        Database,
        """
        INSERT INTO "aspnet_ledger_transfers"
            (from_account_id, to_account_id, amount, status, memo, created_at, updated_at)
        VALUES (@from, @to, @amount, 'completed', @memo, @created, @updated)
        RETURNING id
        """,
        new Dictionary<string, object?>
        {
            ["@from"] = fromId,
            ["@to"] = toId,
            ["@amount"] = amount,
            ["@memo"] = memo,
            ["@created"] = now,
            ["@updated"] = now
        },
        Context.RequestAborted,
        transaction);

    await transaction.CommitAsync(Context.RequestAborted);
    return Results.Json(new
    {
        id = transferId,
        from_account_id = fromId,
        to_account_id = toId,
        amount,
        status = "completed",
        memo,
        from_balance = fromBalance - amount,
        to_balance = toBalance + amount
    }, statusCode: StatusCodes.Status201Created);
}
catch
{
    await transaction.RollbackAsync(Context.RequestAborted);
    throw;
}
finally
{
    await transaction.DisposeAsync();
}
/* @arkzen:endpoint:cs:transfer:end */

/* @arkzen:endpoint:cs:crash
*/
if (!long.TryParse(Body["from_account_id"]?.ToString(), out var fromId) ||
    !decimal.TryParse(Body["amount"]?.ToString(), System.Globalization.NumberStyles.Number,
        System.Globalization.CultureInfo.InvariantCulture, out var amount) ||
    amount <= 0)
    return Results.UnprocessableEntity(new { message = "A positive amount and a source account ID are required." });

var transaction = await Database.BeginTransactionAsync(Context.RequestAborted);
try
{
    var fromBalanceValue = await ScriptDatabase.ScalarAsync(
        Database,
        "SELECT balance FROM \"aspnet_ledger_accounts\" WHERE id = @id",
        new Dictionary<string, object?> { ["@id"] = fromId },
        Context.RequestAborted,
        transaction);
    if (fromBalanceValue is null or DBNull)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.NotFound(new { message = "Account not found." });
    }

    var fromBalance = Convert.ToDecimal(fromBalanceValue, System.Globalization.CultureInfo.InvariantCulture);
    await ScriptDatabase.ExecuteAsync(
        Database,
        "UPDATE \"aspnet_ledger_accounts\" SET balance = @balance, updated_at = @updated WHERE id = @id",
        new Dictionary<string, object?> { ["@balance"] = fromBalance - amount, ["@updated"] = DateTime.UtcNow, ["@id"] = fromId },
        Context.RequestAborted,
        transaction);

    throw new InvalidOperationException("Simulated failure after the debit. The transaction must roll back.");
}
catch
{
    await transaction.RollbackAsync(Context.RequestAborted);
    throw;
}
finally
{
    await transaction.DisposeAsync();
}
/* @arkzen:endpoint:cs:crash:end */

/* @arkzen:web:page:index */
'use client'

import React, { useCallback, useEffect, useState } from 'react'

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
/* @arkzen:web:page:index:end */