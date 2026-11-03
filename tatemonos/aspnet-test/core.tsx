/* @arkzen:meta
name: aspnet-test
version: 2.0.0
description: "Exercises the ASP.NET Core backend (:cs variants) end to end: token auth, CRUD with validation and filters, update/delete policies, role and custom middleware, custom endpoints, custom route, and a transactional C# endpoint."
auth: true
auth_seed:
  users:
    - name: ASP.NET Admin
      email: admin@aspnet-test.local
      password: password
      role: admin
*/

/* @arkzen:database:checks
table: checks
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  user_id:
    type: foreignId
    nullable: true
  name:
    type: string
    length: 120
    nullable: false
  status:
    type: string
    length: 24
    default: pending
  priority:
    type: integer
    default: 1
  done:
    type: boolean
    default: false
seeder:
  data:
    - name: ASP.NET engine ready
      status: passed
      priority: 1
    - name: C# endpoint compiled on first call
      status: passed
      priority: 2
    - name: Validation rules enforced
      status: pending
      priority: 2
    - name: Policy blocks non-owners
      status: pending
      priority: 3
    - name: Transaction rolls back on failure
      status: failed
      priority: 3
*/

/* @arkzen:database:audit_logs
table: audit_logs
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  action:
    type: string
    length: 60
    nullable: false
  check_id:
    type: integer
    nullable: true
  actor:
    type: string
    length: 120
    nullable: true
  detail:
    type: text
    nullable: true
*/

/* @arkzen:api:checks
model: Check
controller: CheckController
prefix: /api/aspnet-test
middleware: [auth:sanctum]
resource: true
policy: true
factory: false
endpoints:
  index:
    method: GET
    route: /checks
    type: index
    description: List checks with search, status filter and pagination
    query:
      search: string
      status: string
      per_page: integer|default:10
  store:
    method: POST
    route: /checks
    type: store
    description: Create a check
    validation:
      name: required|string|max:120
      status: sometimes|string|in:pending,passed,failed
      priority: sometimes|integer|min:1
      done: sometimes|boolean
      user_id: sometimes|integer
  show:
    method: GET
    route: /checks/{id}
    type: show
    description: Show a check
  update:
    method: PUT
    route: /checks/{id}
    type: update
    description: Update a check (owner or admin, enforced by the C# policy)
    validation:
      name: sometimes|string|max:120
      status: sometimes|string|in:pending,passed,failed
      priority: sometimes|integer|min:1
      done: sometimes|boolean
  destroy:
    method: DELETE
    route: /checks/{id}
    type: destroy
    description: Delete a check (admin only, enforced by the C# policy)
  pass:
    method: POST
    route: /checks/{id}/pass
    type: pass
    description: Mark a check passed and write an audit row in one transaction
  stats:
    method: GET
    route: /stats
    type: stats
    description: Custom C# endpoint that aggregates checks by status
*/

/* @arkzen:api:public
model: AuditLog
controller: PublicController
prefix: /api/aspnet-test
middleware: []
resource: false
policy: false
factory: false
endpoints:
  health:
    method: GET
    route: /health
    type: health
    description: Public health endpoint with a live row count
*/

/* @arkzen:api:ping
model: AuditLog
controller: PingController
prefix: /api/aspnet-test
middleware: [requireJson]
resource: false
policy: false
factory: false
endpoints:
  ping:
    method: GET
    route: /ping
    type: ping
    description: Public, but guarded by the requireJson C# middleware
*/

/* @arkzen:api:admin
model: AuditLog
controller: AdminController
prefix: /api/aspnet-test
middleware: [auth:sanctum, role:admin]
resource: false
policy: false
factory: false
endpoints:
  audit:
    method: GET
    route: /admin/audit
    type: audit
    description: Latest audit rows, admin role only
*/

/* @arkzen:routes
controller: ProbeController
middleware: []
routes:
  - method: GET
    route: /api/aspnet-test/probe/{name}
    handler: probe
*/

/* @arkzen:middleware:cs:requireJson
*/
if (!Context.Request.HasJsonContentType())
    return Results.Json(new
    {
        message = "Content-Type: application/json is required.",
        hint = "Set the Content-Type header to application/json"
    }, statusCode: 415);
return null;
/* @arkzen:middleware:cs:requireJson:end */

/* @arkzen:policy:cs:update
*/
var role = user?["role"]?.ToString();
var owner = item?["user_id"]?.ToString();
return role == "admin" || owner is null || owner == user?["id"]?.ToString();
/* @arkzen:policy:cs:update:end */

/* @arkzen:policy:cs:delete
*/
return user?["role"]?.ToString() == "admin";
/* @arkzen:policy:cs:delete:end */

/* @arkzen:endpoint:cs:health
*/
var count = await ScriptDatabase.ScalarAsync(
    Database,
    "SELECT COUNT(*) FROM \"aspnet_test_checks\"",
    null,
    Context.RequestAborted);
var checks = Convert.ToInt64(count, System.Globalization.CultureInfo.InvariantCulture);
return Results.Json(new { backend = "aspnet", status = "ok", checks });
/* @arkzen:endpoint:cs:health:end */

/* @arkzen:endpoint:cs:ping
*/
return Results.Json(new
{
    pong = true,
    engine = "aspnet",
    runtime = Environment.Version.ToString(),
    at = DateTime.UtcNow
});
/* @arkzen:endpoint:cs:ping:end */

/* @arkzen:endpoint:cs:stats
*/
var rows = await ScriptDatabase.QueryAsync(
    Database,
    "SELECT status, COUNT(*) AS total FROM \"aspnet_test_checks\" GROUP BY status",
    null,
    Context.RequestAborted);
var counts = rows.ToDictionary(
    row => row["status"]?.ToString() ?? "unknown",
    row => long.Parse(row["total"]?.ToString() ?? "0", System.Globalization.CultureInfo.InvariantCulture));
return Results.Json(new
{
    total = counts.Values.Sum(),
    passed = counts.GetValueOrDefault("passed"),
    failed = counts.GetValueOrDefault("failed"),
    pending = counts.GetValueOrDefault("pending"),
    requested_by = user?["email"]?.ToString()
});
/* @arkzen:endpoint:cs:stats:end */

/* @arkzen:endpoint:cs:pass
*/
if (!long.TryParse(RouteValues["id"], out var checkId))
    return Results.BadRequest(new { message = "A numeric check id is required." });

var transaction = await Database.BeginTransactionAsync(Context.RequestAborted);
try
{
    var found = await ScriptDatabase.QueryAsync(
        Database,
        "SELECT id, name FROM \"aspnet_test_checks\" WHERE id = @id",
        new Dictionary<string, object?> { ["@id"] = checkId },
        Context.RequestAborted,
        transaction);
    if (found.Count == 0)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.NotFound(new { message = "Check not found." });
    }

    var now = DateTime.UtcNow;
    await ScriptDatabase.ExecuteAsync(
        Database,
        "UPDATE \"aspnet_test_checks\" SET status = 'passed', done = @done, updated_at = @now WHERE id = @id",
        new Dictionary<string, object?> { ["@done"] = true, ["@now"] = now, ["@id"] = checkId },
        Context.RequestAborted,
        transaction);
    await ScriptDatabase.ExecuteAsync(
        Database,
        "INSERT INTO \"aspnet_test_audit_logs\" (action, check_id, actor, detail, created_at, updated_at) VALUES (@action, @check, @actor, @detail, @now, @now)",
        new Dictionary<string, object?>
        {
            ["@action"] = "check.passed",
            ["@check"] = checkId,
            ["@actor"] = user?["email"]?.ToString(),
            ["@detail"] = found[0]["name"]?.ToString(),
            ["@now"] = now
        },
        Context.RequestAborted,
        transaction);

    await transaction.CommitAsync(Context.RequestAborted);
    return Results.Json(new { id = checkId, status = "passed", audited = true, actor = user?["email"]?.ToString() });
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
/* @arkzen:endpoint:cs:pass:end */

/* @arkzen:endpoint:cs:audit
*/
var rows = await ScriptDatabase.QueryAsync(
    Database,
    "SELECT * FROM \"aspnet_test_audit_logs\" ORDER BY id DESC LIMIT 50",
    null,
    Context.RequestAborted);
return Results.Json(new { count = rows.Count, data = rows });
/* @arkzen:endpoint:cs:audit:end */

/* @arkzen:handler:cs:probe
*/
return Results.Json(new
{
    probe = RouteValues["name"],
    at = "aspnet",
    method = Context.Request.Method,
    query = Context.Request.Query.Keys.ToArray()
});
/* @arkzen:handler:cs:probe:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState } from 'react'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const API = 'http://localhost:8000/api/aspnet-test'

type Result = { label: string; status: number | string; body: string; ok: boolean }
type Step = { label: string; expect: number; pass: boolean; status: number | string }

const IndexPage = () => {
  const [email, setEmail] = useState('tester@example.com')
  const [password, setPassword] = useState('password123')
  const [token, setToken] = useState('')
  const [role, setRole] = useState('')
  const [userId, setUserId] = useState<number | null>(null)
  const [checkId, setCheckId] = useState('1')
  const [name, setName] = useState('My test check')
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [suite, setSuite] = useState<Step[]>([])
  const [running, setRunning] = useState(false)

  const request = async (
    method: string,
    path: string,
    opts: { body?: unknown; token?: string; json?: boolean } = {},
  ) => {
    const { body, token: bearer, json = true } = opts
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (json) headers['Content-Type'] = 'application/json'
    if (bearer) headers['Authorization'] = 'Bearer ' + bearer
    let status: number | string = 'network error'
    let text = ''
    let data: any = null
    try {
      const res = await fetch(API + path, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
      })
      status = res.status
      text = await res.text()
      try { data = JSON.parse(text) } catch { data = null }
    } catch (e: any) {
      text = 'Could not reach ' + API + ' - is the backend running? (' + (e?.message ?? e) + ')'
    }
    return { status, data, text }
  }

  const call = async (
    label: string,
    method: string,
    path: string,
    opts: { body?: unknown; auth?: boolean; json?: boolean } = {},
  ) => {
    const { body, auth = true, json = true } = opts
    const r = await request(method, path, { body, json, token: auth ? token : undefined })
    const ok = typeof r.status === 'number' && r.status >= 200 && r.status < 300
    setResults(prev => [{ label, status: r.status, body: r.data ? JSON.stringify(r.data, null, 2) : r.text, ok }, ...prev])
    return r.data
  }

  const adopt = (d: any) => {
    if (d?.token) {
      setToken(d.token)
      setUserId(d.user?.id ?? null)
      setRole(d.user?.role ?? '')
    }
  }

  const register = async () => adopt(await call('POST /auth/register', 'POST', '/auth/register', {
    auth: false,
    body: { name: 'Tester', email, password, password_confirmation: password },
  }))
  const login = async () => adopt(await call('POST /auth/login', 'POST', '/auth/login', { auth: false, body: { email, password } }))
  const loginAdmin = async () => adopt(await call('POST /auth/login (seeded admin)', 'POST', '/auth/login', {
    auth: false,
    body: { email: 'admin@aspnet-test.local', password: 'password' },
  }))
  const me = async () => {
    const d = await call('GET /auth/me', 'GET', '/auth/me')
    if (d?.id) { setUserId(d.id); setRole(d.role ?? '') }
  }
  const logout = async () => {
    await call('POST /auth/logout', 'POST', '/auth/logout')
    setToken(''); setRole(''); setUserId(null)
  }
  const createCheck = async (mine: boolean) => {
    const payload: Record<string, unknown> = { name, priority: 2 }
    if (mine && userId !== null) payload.user_id = userId
    const d = await call(mine ? 'POST /checks (owned by me)' : 'POST /checks', 'POST', '/checks', { body: payload })
    if (d?.id) setCheckId(String(d.id))
  }

  const runSuite = async () => {
    setRunning(true)
    setSuite([])
    const steps: Step[] = []
    const record = (label: string, expect: number, status: number | string) => {
      steps.push({ label, expect, pass: status === expect, status })
      setSuite([...steps])
    }
    const stamp = Date.now()

    record('GET /health (public)', 200, (await request('GET', '/health')).status)
    record('GET /ping with JSON header', 200, (await request('GET', '/ping')).status)
    record('GET /ping without JSON header (custom middleware)', 415, (await request('GET', '/ping', { json: false })).status)
    record('GET /probe/hello (custom route)', 200, (await request('GET', '/probe/hello')).status)
    record('GET /checks without token', 401, (await request('GET', '/checks')).status)

    const adminLogin = await request('POST', '/auth/login', { body: { email: 'admin@aspnet-test.local', password: 'password' } })
    record('POST /auth/login (seeded admin)', 200, adminLogin.status)
    const adminToken: string = adminLogin.data?.token ?? ''
    const adminId = adminLogin.data?.user?.id

    record('POST /checks empty body (validation)', 422, (await request('POST', '/checks', { token: adminToken, body: {} })).status)
    record('POST /checks bad status (in: rule)', 422, (await request('POST', '/checks', { token: adminToken, body: { name: 'x', status: 'nope' } })).status)
    const created = await request('POST', '/checks', { token: adminToken, body: { name: 'Suite check ' + stamp, priority: 2, user_id: adminId } })
    record('POST /checks valid', 201, created.status)
    const id = created.data?.id

    record('GET /checks?search=Suite', 200, (await request('GET', '/checks?search=Suite&per_page=5', { token: adminToken })).status)
    record('GET /checks?status=passed (filter)', 200, (await request('GET', '/checks?status=passed', { token: adminToken })).status)
    record('PUT /checks/{id} as owner', 200, (await request('PUT', '/checks/' + id, { token: adminToken, body: { status: 'failed' } })).status)
    record('POST /checks/{id}/pass (transaction + audit row)', 200, (await request('POST', '/checks/' + id + '/pass', { token: adminToken })).status)
    record('POST /checks/999999/pass (missing row)', 404, (await request('POST', '/checks/999999/pass', { token: adminToken })).status)
    record('GET /stats (custom endpoint)', 200, (await request('GET', '/stats', { token: adminToken })).status)
    record('GET /admin/audit as admin', 200, (await request('GET', '/admin/audit', { token: adminToken })).status)

    const reg = await request('POST', '/auth/register', {
      body: { name: 'Suite User', email: 'suite+' + stamp + '@example.com', password: 'password123', password_confirmation: 'password123' },
    })
    record('POST /auth/register', 201, reg.status)
    const userToken: string = reg.data?.token ?? ''

    record('GET /admin/audit as plain user (role middleware)', 403, (await request('GET', '/admin/audit', { token: userToken })).status)
    record('DELETE /checks/{id} as plain user (policy)', 403, (await request('DELETE', '/checks/' + id, { token: userToken })).status)
    record('DELETE /checks/{id} as admin', 200, (await request('DELETE', '/checks/' + id, { token: adminToken })).status)
    record('GET /checks/{id} after delete', 404, (await request('GET', '/checks/' + id, { token: adminToken })).status)

    setRunning(false)
  }

  const passed = suite.filter(s => s.pass).length

  const btn = 'rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 disabled:opacity-50'
  const input = 'rounded border border-neutral-300 px-2 py-1 text-sm'
  const group = 'mb-5'
  const h2 = 'mb-2 text-sm font-semibold uppercase tracking-wide text-neutral-500'

  return (
    <div className="mx-auto max-w-3xl p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-600">ASP.NET Core - C#</p>
      <h1 className="text-2xl font-semibold">ASP.NET backend test</h1>
      <p className="mb-1 text-neutral-600">Click the buttons to exercise the :cs variants. Backend: {API}</p>
      <p className="mb-6 text-sm text-neutral-500">
        {token ? 'Logged in' + (userId !== null ? ' as user #' + userId : '') + (role ? ' (' + role + ')' : '') : 'Not logged in'}
      </p>

      <div className="mb-6 rounded border border-violet-200 bg-violet-50 p-4">
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-semibold text-violet-900">Contract suite</div>
          <button className={btn} disabled={running} onClick={runSuite}>{running ? 'Running...' : 'Run full suite'}</button>
        </div>
        <p className="mb-2 text-sm text-violet-900/80">
          Logs in as the seeded admin and checks every status code the engine should return: auth, validation, filters, policies, role and custom middleware, the C# endpoints and the transaction.
        </p>
        {suite.length > 0 && (
          <>
            <p className="mb-2 text-sm font-medium">{passed} of {suite.length} passed</p>
            <ul className="space-y-1 text-sm">
              {suite.map((s, i) => (
                <li key={i} className="flex gap-2">
                  <span className={s.pass ? 'text-green-700' : 'text-red-700'}>{s.pass ? 'PASS' : 'FAIL'}</span>
                  <span className="flex-1">{s.label}</span>
                  <span className="text-neutral-500">{String(s.status)}{s.pass ? '' : ' (expected ' + s.expect + ')'}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </div>

      <div className={group}>
        <div className={h2}>No login needed</div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /health (C# endpoint)', 'GET', '/health', { auth: false })}>Health</button>
          <button className={btn} onClick={() => call('GET /probe/hello (custom route)', 'GET', '/probe/hello?x=1', { auth: false })}>Probe route</button>
          <button className={btn} onClick={() => call('GET /ping with JSON header -> 200', 'GET', '/ping', { auth: false })}>Ping (JSON, expect 200)</button>
          <button className={btn} onClick={() => call('GET /ping without JSON header -> 415', 'GET', '/ping', { auth: false, json: false })}>Ping (no JSON, expect 415)</button>
          <button className={btn} onClick={() => call('GET /checks without token -> 401', 'GET', '/checks', { auth: false })}>Checks without token (expect 401)</button>
        </div>
      </div>

      <div className={group}>
        <div className={h2}>Account</div>
        <div className="mb-2 flex flex-wrap gap-2">
          <input className={input} value={email} onChange={e => setEmail(e.target.value)} placeholder="email" />
          <input className={input} value={password} onChange={e => setPassword(e.target.value)} placeholder="password (8+ chars)" />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={register}>Register</button>
          <button className={btn} onClick={login}>Login</button>
          <button className={btn} onClick={loginAdmin}>Login as seeded admin</button>
          <button className={btn} onClick={me}>Who am I</button>
          <button className={btn} onClick={logout}>Logout</button>
          <button className={btn} onClick={() => call('POST /auth/register invalid -> 422', 'POST', '/auth/register', { auth: false, body: { email: 'nope' } })}>Register with bad data (expect 422)</button>
        </div>
      </div>

      <div className={group}>
        <div className={h2}>Checks (login first)</div>
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <input className={input} value={name} onChange={e => setName(e.target.value)} placeholder="check name" />
          <input className={input} value={search} onChange={e => setSearch(e.target.value)} placeholder="search" />
          <span className="text-sm text-neutral-500">check id</span>
          <input className={input + ' w-16'} value={checkId} onChange={e => setCheckId(e.target.value)} />
        </div>
        <div className="flex flex-wrap gap-2">
          <button className={btn} onClick={() => call('GET /checks', 'GET', '/checks')}>List checks</button>
          <button className={btn} onClick={() => call('GET /checks?search=' + search, 'GET', '/checks?search=' + encodeURIComponent(search))}>Search</button>
          <button className={btn} onClick={() => call('GET /checks?status=passed', 'GET', '/checks?status=passed')}>Only passed</button>
          <button className={btn} onClick={() => call('GET /checks?per_page=2', 'GET', '/checks?per_page=2')}>Page size 2</button>
          <button className={btn} onClick={() => createCheck(true)}>Create check (mine)</button>
          <button className={btn} onClick={() => createCheck(false)}>Create check (no owner)</button>
          <button className={btn} onClick={() => call('POST /checks empty -> 422', 'POST', '/checks', { body: {} })}>Create empty (expect 422)</button>
          <button className={btn} onClick={() => call('GET /checks/' + checkId, 'GET', '/checks/' + checkId)}>Show check</button>
          <button className={btn} onClick={() => call('PUT /checks/' + checkId + ' (owner or admin)', 'PUT', '/checks/' + checkId, { body: { status: 'failed' } })}>Fail check</button>
          <button className={btn} onClick={() => call('POST /checks/' + checkId + '/pass (transaction)', 'POST', '/checks/' + checkId + '/pass')}>Pass check (transaction)</button>
          <button className={btn} onClick={() => call('DELETE /checks/' + checkId + ' (admin only)', 'DELETE', '/checks/' + checkId)}>Delete check (admin only)</button>
          <button className={btn} onClick={() => call('GET /stats (custom endpoint)', 'GET', '/stats')}>Stats</button>
          <button className={btn} onClick={() => call('GET /admin/audit (role:admin)', 'GET', '/admin/audit')}>Audit log (admin only)</button>
        </div>
      </div>

      <div className="mb-2 flex items-center justify-between">
        <div className={h2 + ' mb-0'}>Results</div>
        <button className="text-sm text-neutral-500 underline" onClick={() => setResults([])}>Clear</button>
      </div>
      {results.length === 0 && <p className="text-sm text-neutral-500">Nothing yet. Click a button above.</p>}
      <div className="space-y-2">
        {results.map((r, i) => (
          <div key={i} className="rounded border border-neutral-200 p-3">
            <div className="text-sm font-medium">
              <span className={r.ok ? 'text-green-700' : 'text-red-700'}>{String(r.status)}</span> {r.label}
            </div>
            <pre className="mt-1 max-h-48 overflow-auto whitespace-pre-wrap break-words text-xs text-neutral-700">{r.body}</pre>
          </div>
        ))}
      </div>
    </div>
  )
}

export default IndexPage
/* @arkzen:web:page:index:end */