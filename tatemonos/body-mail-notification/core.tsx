/* @arkzen:meta
name: body-mail-notification
version: 1.0.0
description: "Tests MailBuilder v3.1 blade_body injection and NotificationBuilder v3.9 toMail_body injection. Blade HTML is placed between the closing YAML comment and the end marker. This tatemono verifies that blade views are generated from injected HTML content and that toMail() uses the injected MailMessage chain instead of the stub."
auth: true
auth_seed:
  users:
    - name: Test User
      email: test@body-mail-notification.com
      password: password123
*/

/* @arkzen:meta:native
label: Body Mail Notification
description: Tests MailBuilder v3.1 blade_body injection and NotificationBuilder v3.9 toMail_body injection — native mirror
expo:
  bundle_id: com.arkzen.bodymailnotification
  scheme: bodymailnotification
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:native:config
theme:
  primary: "#0f172a"
  background: "#f8fafc"
  surface: "#ffffff"
  text: "#0f172a"
  muted: "#64748b"
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 4000
layout:
  guest:
    className: "min-h-screen bg-slate-50"
  auth:
    className: "min-h-screen bg-slate-50"
*/

/* @arkzen:database:send_log
table: send_log
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  user_id:
    type: integer
    nullable: true
  to_email:
    type: string
    nullable: true
  subject:
    type: string
    nullable: true
  mail_class:
    type: string
    nullable: true
  kind:
    type: string
    length: 20
    default: mail
  status:
    type: string
    length: 20
    default: sent
  error:
    type: text
    nullable: true
*/

/* @arkzen:api:send_log
model: SendLog
controller: SendLogController
prefix: /api/body-mail-notification
middleware: [auth]
endpoints:
  index:
    method: GET
    route: /log
    description: All send log entries for the authenticated user
    response:
      type: collection
  sendMail:
    method: POST
    route: /send-mail
    description: Send a mail and write a log row — blade_body injection test
    validation:
      mail: required|string|in:welcome,receipt,alert
      to: required|email
    response:
      type: single
  notify:
    method: POST
    route: /notify
    description: Trigger a notification and write a log row — toMail_body injection test
    validation:
      notification: required|string|in:action-required,summary
      message: sometimes|string|max:255
    response:
      type: single
  clearLog:
    method: DELETE
    route: /log/clear
    description: Wipe all send log entries for this user
    response:
      type: message
      value: Log cleared
*/

/* @arkzen:endpoint:sendMail
*/
$validated = $request->validate([
    'mail' => 'required|string|in:welcome,receipt,alert',
    'to'   => 'required|email',
]);
$user      = $request->user('sanctum');
$mailKey   = $validated['mail'];
$className = \Illuminate\Support\Str::studly(str_replace('-', '_', $mailKey)) . 'Mail';
$fullClass = "\\App\\Mail\\Arkzen\\BodyMailNotification\\" . $className;
if (!class_exists($fullClass)) {
    return response()->json(['message' => 'Unknown mail type: ' . $mailKey], 422);
}
// Provide default data for each mail type so the constructor is satisfied.
$mailData = match($mailKey) {
    'welcome' => ['Test User', 'Arkzen'],
    'receipt' => ['ORD-001', '$9.99', 'Arkzen Test Item'],
    'alert'   => ['This is a test alert from Arkzen.', url('/')],
    default   => [],
};
try {
    \Mail::to($validated['to'])->send(new $fullClass(...$mailData));
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $validated['to'],
        'subject'    => $mailKey,
        'mail_class' => $fullClass,
        'kind'       => 'mail',
        'status'     => 'sent',
    ]);
    return response()->json($log, 201);
} catch (\Throwable $e) {
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $validated['to'],
        'subject'    => $mailKey,
        'mail_class' => $fullClass,
        'kind'       => 'mail',
        'status'     => 'failed',
        'error'      => $e->getMessage(),
    ]);
    return response()->json($log, 201);
}
/* @arkzen:endpoint:sendMail:end */

/* @arkzen:endpoint:notify
*/
$validated = $request->validate([
    'notification' => 'required|string|in:action-required,summary',
    'message'      => 'sometimes|string|max:255',
]);
$user     = $request->user();
$notifKey = $validated['notification'];
$className = \Illuminate\Support\Str::studly(str_replace('-', '_', $notifKey)) . 'Notification';
$fullClass = "\\App\\Notifications\\Arkzen\\BodyMailNotification\\" . $className;
if (!class_exists($fullClass)) {
    return response()->json(['message' => 'Unknown notification type: ' . $notifKey], 422);
}
try {
    $instance = new $fullClass($user);
    if (isset($validated['message'])) {
        $instance->message = $validated['message'];
    }
    $user->notify($instance);
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $user?->email,
        'subject'    => $notifKey,
        'mail_class' => $fullClass,
        'kind'       => 'notification',
        'status'     => 'sent',
    ]);
    return response()->json($log, 201);
} catch (\Throwable $e) {
    $log = \App\Models\Arkzen\BodyMailNotification\SendLog::create([
        'user_id'    => $user?->id,
        'to_email'   => $user?->email,
        'subject'    => $notifKey,
        'mail_class' => $fullClass,
        'kind'       => 'notification',
        'status'     => 'failed',
        'error'      => $e->getMessage(),
    ]);
    return response()->json($log, 201);
}
/* @arkzen:endpoint:notify:end */

/* @arkzen:endpoint:clearLog
*/
$user = $request->user('sanctum');
\App\Models\Arkzen\BodyMailNotification\SendLog::where('user_id', $user?->id)->delete();
return response()->json(['message' => 'Log cleared']);
/* @arkzen:endpoint:clearLog:end */

/* @arkzen:mail:welcome
subject: "Welcome to Arkzen — blade_body injection test"
data:
  name: string
  app_name: string
*/
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 32px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; box-shadow: 0 2px 12px rgba(0,0,0,.08); }
    h1 { font-size: 22px; color: #1e293b; margin-bottom: 8px; }
    p { color: #475569; line-height: 1.6; }
    .badge { display: inline-block; background: #0f172a; color: #fff; border-radius: 6px; padding: 4px 12px; font-size: 12px; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Welcome, {{ $name }}!</h1>
    <p>You are now part of <strong>{{ $app_name }}</strong>. This email was generated from a <code>blade_body</code> block injected via the Arkzen DSL — no manually created Blade file required.</p>
    <span class="badge">✓ blade_body injection works</span>
  </div>
</body>
</html>
/* @arkzen:mail:welcome:end */

/* @arkzen:mail:receipt
subject: "Your receipt — blade_body injection test"
data:
  order_id: string
  amount: string
  item_name: string
*/
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #f0fdf4; margin: 0; padding: 32px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border: 1px solid #bbf7d0; }
    h1 { color: #15803d; font-size: 20px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; }
    td { padding: 8px 0; border-bottom: 1px solid #f0fdf4; color: #374151; }
    td:last-child { text-align: right; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>🧾 Receipt #{{ $order_id }}</h1>
    <table>
      <tr><td>Item</td><td>{{ $item_name }}</td></tr>
      <tr><td>Amount</td><td>{{ $amount }}</td></tr>
      <tr><td>Status</td><td>✅ Paid</td></tr>
    </table>
    <p style="margin-top:16px;font-size:12px;color:#6b7280;">blade_body injected receipt — no stub used.</p>
  </div>
</body>
</html>
/* @arkzen:mail:receipt:end */

/* @arkzen:mail:alert
subject: "⚠ Action Required — blade_body injection test"
data:
  alert_message: string
  action_url: string
*/
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: sans-serif; background: #fff7ed; margin: 0; padding: 32px; }
    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border-left: 4px solid #f97316; }
    h1 { color: #c2410c; font-size: 18px; }
    p { color: #374151; }
    a { display: inline-block; margin-top: 16px; background: #f97316; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠ Action Required</h1>
    <p>{{ $alert_message }}</p>
    <a href="{{ $action_url }}">Take Action</a>
    <p style="margin-top:16px;font-size:12px;color:#9ca3af;">Injected via blade_body — MailBuilder v3.1 test.</p>
  </div>
</body>
</html>
/* @arkzen:mail:alert:end */

/* @arkzen:notifications:action-required
channels: [mail, database]
channel_type: private
message: "You have a pending action that requires your attention."
subject: "Action Required"
*/
return (new \Illuminate\Notifications\Messages\MailMessage)
    ->subject('⚠ Action Required — toMail_body injection test')
    ->greeting('Hello!')
    ->line($this->message ?? 'You have a pending action that requires your attention.')
    ->line('This toMail() body was injected via the Arkzen DSL — not a stub.')
    ->action('Review Now', url('/'))
    ->line('NotificationBuilder v3.9 toMail_body injection confirmed ✓');
/* @arkzen:notifications:action-required:end */

/* @arkzen:notifications:summary
channels: [mail, database]
channel_type: private
message: "Here is your activity summary."
subject: "Activity Summary"
*/
return (new \Illuminate\Notifications\Messages\MailMessage)
    ->subject('📊 Activity Summary — toMail_body injection test')
    ->greeting('Hi there!')
    ->line($this->message ?? 'Here is your latest activity summary.')
    ->line('Notifications: 2 unread | Mails: 3 sent | Status: All healthy')
    ->action('View Dashboard', url('/'))
    ->salutation('Cheers, Arkzen Engine');
/* @arkzen:notifications:summary:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

function useToast() {
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const show = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 4000)
  }, [])
  return {
    toast,
    success: (msg: string) => show('success', msg),
    error:   (msg: string) => show('error', msg),
  }
}

if (typeof window !== 'undefined') {
  setActiveTatemono('body-mail-notification')
}

type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}

const KindBadge = ({ kind }: { kind: string }) => (
  <span style={{
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 20,
    fontSize: 11,
    fontWeight: 700,
    background: kind === 'mail' ? '#dbeafe' : '#fef9c3',
    color:      kind === 'mail' ? '#1d4ed8' : '#a16207',
    letterSpacing: 0.5,
  }}>
    {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
  </span>
)

const StatusDot = ({ status }: { status: string }) => (
  <span style={{
    display: 'inline-block',
    width: 8, height: 8,
    borderRadius: '50%',
    background: status === 'sent' ? '#22c55e' : '#ef4444',
    marginRight: 6,
    verticalAlign: 'middle',
  }} />
)

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:guest */
const LoginPage = () => {
  const { login }  = useAuthStore()
  const router     = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()
  const [email, setEmail]       = useState('test@body-mail-notification.com')
  const [password, setPassword] = useState('password123')
  const [loading, setLoading]   = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    try {
      await login(email, password)
      toastSuccess('Logged in')
      router.push('/body-mail-notification/dashboard')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Invalid credentials')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 4 }}>Body Injection Test</h1>
        <p style={{ fontSize: 13, color: '#64748b', marginBottom: 28 }}>MailBuilder blade_body · NotificationBuilder toMail_body</p>
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 12, boxSizing: 'border-box' }} />
        <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Password</label>
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, marginBottom: 20, boxSizing: 'border-box' }} />
        <button onClick={handleLogin} disabled={loading} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}
/* @arkzen:web:page:login:end */

/* @arkzen:web:page:register */
/* @arkzen:web:page:layout:guest */
const RegisterPage = () => {
  const { register } = useAuthStore()
  const router       = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleRegister = async () => {
    setLoading(true)
    try {
      await register(name, email, password, password)
      toastSuccess('Account created')
      router.push('/body-mail-notification/dashboard')
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Registration failed')
    }
    setLoading(false)
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ background: '#fff', borderRadius: 16, padding: 40, width: 360, boxShadow: '0 4px 24px rgba(0,0,0,.08)' }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', marginBottom: 24 }}>Create Account</h1>
        {[['Name', name, setName, 'text'], ['Email', email, setEmail, 'email'], ['Password', password, setPassword, 'password']].map(([label, val, setter, type]: any) => (
          <div key={label} style={{ marginBottom: 12 }}>
            <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>{label}</label>
            <input type={type} value={val} onChange={e => setter(e.target.value)} style={{ width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '10px 12px', fontSize: 14, boxSizing: 'border-box' }} />
          </div>
        ))}
        <button onClick={handleRegister} disabled={loading} style={{ width: '100%', background: '#0f172a', color: '#fff', border: 'none', borderRadius: 8, padding: '12px 0', fontSize: 14, fontWeight: 700, cursor: 'pointer', marginTop: 8 }}>
          {loading ? 'Creating…' : 'Register'}
        </button>
      </div>
    </div>
  )
}
/* @arkzen:web:page:register:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:auth */
const DashboardPage = () => {
  const { user, logout } = useAuthStore()
  const router           = useRouter()
  const { toast, success: toastSuccess, error: toastError } = useToast()

  const [log,     setLog]     = useState<SendLogEntry[]>([])
  const [loading, setLoading] = useState(false)

  // Mail send state
  const [mailKind, setMailKind]   = useState<'welcome' | 'receipt' | 'alert'>('welcome')
  const [mailTo,   setMailTo]     = useState('')
  const [sending,  setSending]    = useState(false)

  // Notification state
  const [notifKind, setNotifKind] = useState<'action-required' | 'summary'>('action-required')
  const [notifMsg,  setNotifMsg]  = useState('')
  const [notifying, setNotifying] = useState(false)

  const loadLog = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch('/api/body-mail-notification/log')
      const data = await res.json()
      // Laravel pagination returns { data: [...], meta: {...} }
      const items = Array.isArray(data) ? data : (data?.data ?? [])
      setLog(items)
    } catch { toastError('Failed to load log') }
    setLoading(false)
  }

  useEffect(() => { loadLog() }, [])

  const sendMail = async () => {
    if (!mailTo) { toastError('Enter a recipient email'); return }
    setSending(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/send-mail', {
        method: 'POST',
        body: JSON.stringify({ mail: mailKind, to: mailTo }),
      })
      if (res.ok) { toastSuccess(`${mailKind} mail sent`); loadLog() }
      else        { const e = await res.json(); toastError(e.message ?? 'Mail failed') }
    } catch { toastError('Mail request failed') }
    setSending(false)
  }

  const sendNotif = async () => {
    setNotifying(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/notify', {
        method: 'POST',
        body: JSON.stringify({ notification: notifKind, message: notifMsg || undefined }),
      })
      if (res.ok) { toastSuccess(`${notifKind} notification sent`); loadLog() }
      else        { const e = await res.json(); toastError(e.message ?? 'Notification failed') }
    } catch { toastError('Notification request failed') }
    setNotifying(false)
  }

  const clearLog = async () => {
    try {
      await arkzenFetch('/api/body-mail-notification/log/clear', { method: 'DELETE' })
      toastSuccess('Log cleared')
      setLog([])
    } catch { toastError('Clear failed') }
  }

  const handleLogout = async () => { await logout(); router.push('/body-mail-notification') }

  const card: React.CSSProperties = {
    background: '#fff', borderRadius: 14, padding: 28,
    boxShadow: '0 2px 12px rgba(0,0,0,.06)', marginBottom: 20,
  }
  const inputStyle: React.CSSProperties = {
    width: '100%', border: '1.5px solid #e2e8f0', borderRadius: 8,
    padding: '9px 12px', fontSize: 13, boxSizing: 'border-box',
  }
  const selectStyle: React.CSSProperties = { ...inputStyle }
  const btn = (color = '#0f172a'): React.CSSProperties => ({
    background: color, color: '#fff', border: 'none', borderRadius: 8,
    padding: '10px 20px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
  })

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', padding: '32px 16px' }}>
      {toast && <div style={{ position: 'fixed', top: 20, right: 20, background: toast.type === 'success' ? '#22c55e' : '#ef4444', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, zIndex: 9999 }}>{toast.msg}</div>}
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Body Injection Dashboard</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
              MailBuilder <code>blade_body</code> · NotificationBuilder <code>toMail_body</code>
            </p>
          </div>
          <button onClick={handleLogout} style={{ ...btn('#64748b'), fontSize: 12 }}>Logout</button>
        </div>

        {/* Send Mail */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>
            ✉ Send Mail <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>blade_body injection</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Each mail has a custom Blade HTML view injected via <code>blade_body</code> in the DSL block. Verifies MailBuilder v3.1 generates views from body instead of stub.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Mail Type</label>
              <select value={mailKind} onChange={e => setMailKind(e.target.value as any)} style={selectStyle}>
                <option value="welcome">welcome — onboarding HTML</option>
                <option value="receipt">receipt — table layout HTML</option>
                <option value="alert">alert — CTA button HTML</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Recipient Email</label>
              <input value={mailTo} onChange={e => setMailTo(e.target.value)} placeholder="you@example.com" style={inputStyle} />
            </div>
          </div>
          <button onClick={sendMail} disabled={sending} style={btn()}>
            {sending ? 'Sending…' : 'Send Mail'}
          </button>
        </div>

        {/* Send Notification */}
        <div style={card}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginTop: 0, marginBottom: 4 }}>
            🔔 Send Notification <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 400 }}>toMail_body injection</span>
          </h2>
          <p style={{ fontSize: 12, color: '#64748b', marginBottom: 16 }}>
            Both notifications have a custom <code>toMail()</code> body injected via the DSL block. Verifies NotificationBuilder v3.9 uses the body instead of the stub.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Notification Type</label>
              <select value={notifKind} onChange={e => setNotifKind(e.target.value as any)} style={selectStyle}>
                <option value="action-required">action-required</option>
                <option value="summary">summary</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 12, color: '#64748b', display: 'block', marginBottom: 4 }}>Custom Message (optional)</label>
              <input value={notifMsg} onChange={e => setNotifMsg(e.target.value)} placeholder="Override default message…" style={inputStyle} />
            </div>
          </div>
          <button onClick={sendNotif} disabled={notifying} style={btn('#7c3aed')}>
            {notifying ? 'Sending…' : 'Send Notification'}
          </button>
        </div>

        {/* Log */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', margin: 0 }}>Send Log</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={loadLog} style={{ ...btn('#0ea5e9'), padding: '7px 14px', fontSize: 12 }}>Refresh</button>
              <button onClick={clearLog} style={{ ...btn('#ef4444'), padding: '7px 14px', fontSize: 12 }}>Clear</button>
            </div>
          </div>
          {loading ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>Loading…</p>
          ) : log.length === 0 ? (
            <p style={{ color: '#94a3b8', fontSize: 13 }}>No entries yet — send a mail or notification above.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {log.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#f8fafc', borderRadius: 8, fontSize: 13 }}>
                  <KindBadge kind={entry.kind} />
                  <span style={{ fontWeight: 600, color: '#0f172a', flex: 1 }}>{entry.subject ?? '—'}</span>
                  <span style={{ color: '#64748b' }}>{entry.to_email ?? '—'}</span>
                  <span><StatusDot status={entry.status} />{entry.status}</span>
                  <span style={{ color: '#94a3b8', fontSize: 11 }}>{new Date(entry.created_at).toLocaleTimeString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
/* @arkzen:web:page:dashboard:end */

/* ─────────────────────────────────────────────────────────────────────────────
   NATIVE — Expo / Bare RN
   ───────────────────────────────────────────────────────────────────────────── */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useRouter } from 'expo-router'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('body-mail-notification')

const BACKEND_URL = process.env.EXPO_PUBLIC_ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useCallback } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('body-mail-notification')

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'
/* @arkzen:import:rn:end */

type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}

// ── Reusable input field ───────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  keyboardType = 'default',
}: {
  placeholder:      string
  value:            string
  onChangeText:     (v: string) => void
  secureTextEntry?: boolean
  keyboardType?:    'default' | 'email-address'
}) => (
  <TextInput
    className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    placeholder={placeholder}
    placeholderTextColor="#a3a3a3"
    value={value}
    onChangeText={onChangeText}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    autoCapitalize="none"
    autoCorrect={false}
  />
)

// ── Error box ──────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <View className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <Text className="text-xs text-red-600">{message}</Text>
  </View>
)

// ── Primary button ─────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
  color = 'bg-neutral-900',
}: {
  label:    string
  onPress:  () => void
  loading?: boolean
  color?:   string
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.8}
    className={`py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : color}`}
  >
    {loading
      ? <ActivityIndicator size="small" color="#fff" />
      : <Text className="text-white text-sm font-semibold">{label}</Text>
    }
  </TouchableOpacity>
)

// ── Kind badge ─────────────────────────────────────────────────
const KindBadge = ({ kind }: { kind: string }) => (
  <View className={`px-2.5 py-0.5 rounded-full ${kind === 'mail' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
    <Text className={`text-xs font-bold ${kind === 'mail' ? 'text-blue-700' : 'text-yellow-700'}`}>
      {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
    </Text>
  </View>
)

// ── Status dot ─────────────────────────────────────────────────
const StatusDot = ({ status }: { status: string }) => (
  <View
    className={`w-2 h-2 rounded-full mr-1.5 ${status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`}
    style={{ marginTop: 1 }}
  />
)

/* @arkzen:native:components:shared:end */


/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:guest */

const LoginScreen = () => {
  const router               = useRouter()
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@body-mail-notification.com')
  const [password, setPassword] = useState('password123')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">✉</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Body Injection Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            MailBuilder blade_body · NotificationBuilder toMail_body
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
          />
          <Field
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <PrimaryBtn label="Sign in" onPress={handleLogin} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/body-mail-notification/register' as any)}>
            <Text className="text-xs text-neutral-400">
              No account?{' '}
              <Text className="text-neutral-700 font-medium">Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:login:end */


/* @arkzen:native:page:register */
/* @arkzen:native:page:layout:guest */

const RegisterScreen = () => {
  const router                  = useRouter()
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
        className="px-6"
      >
        {/* Header */}
        <View className="mb-8">
          <View className="w-12 h-12 rounded-2xl bg-neutral-900 items-center justify-center mb-4">
            <Text className="text-white text-lg font-bold">✉</Text>
          </View>
          <Text className="text-2xl font-bold text-neutral-900">Body Injection Test</Text>
          <Text className="text-sm text-neutral-500 mt-1">
            Create an account to test mail &amp; notification injection
          </Text>
        </View>

        {/* Form */}
        <View className="gap-y-3">
          {error && <ErrorBox message={error} />}

          <Field placeholder="Name"             value={name}     onChangeText={setName}     />
          <Field placeholder="Email"            value={email}    onChangeText={setEmail}    keyboardType="email-address" />
          <Field placeholder="Password"         value={password} onChangeText={setPassword} secureTextEntry />
          <Field placeholder="Confirm password" value={confirm}  onChangeText={setConfirm}  secureTextEntry />

          <PrimaryBtn label="Create account" onPress={handleRegister} loading={isLoading} />
        </View>

        {/* Footer */}
        <View className="mt-6 items-center">
          <TouchableOpacity onPress={() => router.push('/body-mail-notification/login' as any)}>
            <Text className="text-xs text-neutral-400">
              Already have an account?{' '}
              <Text className="text-neutral-700 font-medium">Sign in</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:register:end */


/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:auth */

const DashboardScreen = () => {
  const router           = useRouter()
  const { user, logout } = useAuthStore()

  const [log,       setLog]       = useState<SendLogEntry[]>([])
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Mail send state
  const [mailKind,  setMailKind]  = useState<'welcome' | 'receipt' | 'alert'>('welcome')
  const [mailTo,    setMailTo]    = useState('')
  const [sending,   setSending]   = useState(false)

  // Notification state
  const [notifKind, setNotifKind] = useState<'action-required' | 'summary'>('action-required')
  const [notifMsg,  setNotifMsg]  = useState('')
  const [notifying, setNotifying] = useState(false)

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadLog = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/log`)
      const data = await res.json()
      setLog(Array.isArray(data) ? data : (data?.data ?? []))
    } catch {
      showToast('error', 'Failed to load log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLog() }, [])

  const sendMail = async () => {
    if (!mailTo) { showToast('error', 'Enter a recipient email'); return }
    setSending(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/send-mail`, {
        method: 'POST',
        body: JSON.stringify({ mail: mailKind, to: mailTo }),
      })
      if (res.ok) { showToast('success', `${mailKind} mail sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Mail failed') }
    } catch {
      showToast('error', 'Mail request failed')
    } finally {
      setSending(false)
    }
  }

  const sendNotif = async () => {
    setNotifying(true)
    try {
      const res = await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/notify`, {
        method: 'POST',
        body: JSON.stringify({ notification: notifKind, message: notifMsg || undefined }),
      })
      if (res.ok) { showToast('success', `${notifKind} notification sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Notification failed') }
    } catch {
      showToast('error', 'Notification request failed')
    } finally {
      setNotifying(false)
    }
  }

  const clearLog = async () => {
    try {
      await arkzenFetch(`${BACKEND_URL}/api/body-mail-notification/log/clear`, { method: 'DELETE' })
      showToast('success', 'Log cleared')
      setLog([])
    } catch {
      showToast('error', 'Clear failed')
    }
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/body-mail-notification/login' as any)
  }

  const mailTypes: Array<{ key: 'welcome' | 'receipt' | 'alert'; label: string; desc: string }> = [
    { key: 'welcome', label: 'Welcome',  desc: 'Onboarding HTML via blade_body' },
    { key: 'receipt', label: 'Receipt',  desc: 'Table layout HTML via blade_body' },
    { key: 'alert',   label: 'Alert',    desc: 'CTA button HTML via blade_body'  },
  ]

  const notifTypes: Array<{ key: 'action-required' | 'summary'; label: string; desc: string }> = [
    { key: 'action-required', label: 'Action Required', desc: 'Custom toMail() chain via DSL body' },
    { key: 'summary',         label: 'Summary',         desc: 'Activity summary via DSL body'      },
  ]

  return (
    <View className="flex-1 bg-neutral-50">

      {/* Toast */}
      {toast && (
        <View
          style={{ position: 'absolute', top: 60, left: 16, right: 16, zIndex: 50 }}
          className={`rounded-2xl px-5 py-3 flex-row items-center ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}
        >
          <Text className="text-white text-sm flex-1">{toast.msg}</Text>
        </View>
      )}

      {/* Header */}
      <View className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <View>
          <Text className="text-base font-semibold text-neutral-900">✉ Body Injection Test</Text>
          <Text className="text-xs text-neutral-400 mt-0.5">{user?.email}</Text>
        </View>
        <TouchableOpacity onPress={handleLogout}>
          <Text className="text-xs text-neutral-400">Sign out</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >

        {/* ── Send Mail ─────────────────────────────────── */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Send Mail · blade_body injection
        </Text>

        {/* Mail type picker */}
        <View className="gap-y-2 mb-3">
          {mailTypes.map(({ key, label, desc }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setMailKind(key)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${mailKind === key ? 'border-neutral-900' : 'border-neutral-100'}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                <Text className="text-xs text-neutral-400 mt-0.5">{desc}</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${mailKind === key ? 'border-neutral-900' : 'border-neutral-300'}`}>
                {mailKind === key && <View className="w-2 h-2 rounded-full bg-neutral-900" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          placeholder="Recipient email"
          value={mailTo}
          onChangeText={setMailTo}
          keyboardType="email-address"
        />
        <View className="mt-2 mb-6">
          <PrimaryBtn label={sending ? 'Sending…' : 'Send Mail'} onPress={sendMail} loading={sending} />
        </View>

        {/* ── Send Notification ─────────────────────────── */}
        <Text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
          Send Notification · toMail_body injection
        </Text>

        {/* Notif type picker */}
        <View className="gap-y-2 mb-3">
          {notifTypes.map(({ key, label, desc }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setNotifKind(key)}
              activeOpacity={0.8}
              className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${notifKind === key ? 'border-violet-600' : 'border-neutral-100'}`}
            >
              <View className="flex-1 mr-3">
                <Text className="text-sm font-semibold text-neutral-900">{label}</Text>
                <Text className="text-xs text-neutral-400 mt-0.5">{desc}</Text>
              </View>
              <View className={`w-4 h-4 rounded-full border-2 items-center justify-center ${notifKind === key ? 'border-violet-600' : 'border-neutral-300'}`}>
                {notifKind === key && <View className="w-2 h-2 rounded-full bg-violet-600" />}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <Field
          placeholder="Custom message (optional)"
          value={notifMsg}
          onChangeText={setNotifMsg}
        />
        <View className="mt-2 mb-6">
          <PrimaryBtn label={notifying ? 'Sending…' : 'Send Notification'} onPress={sendNotif} loading={notifying} color="bg-violet-600" />
        </View>

        {/* ── Send Log ──────────────────────────────────── */}
        <View className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
          <View className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <Text className="font-semibold text-sm text-neutral-900">Send Log</Text>
            <View className="flex-row gap-x-3">
              <TouchableOpacity onPress={loadLog}>
                <Text className="text-xs text-neutral-400">{loading ? 'Loading…' : 'Refresh'}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={clearLog}>
                <Text className="text-xs text-red-400">Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {log.length === 0 ? (
            <View className="py-10 items-center">
              <Text className="text-sm text-neutral-400">
                {loading ? 'Loading…' : 'No entries yet — send a mail or notification above.'}
              </Text>
            </View>
          ) : (
            log.map((entry, i) => (
              <View
                key={entry.id}
                className={`px-4 py-3 flex-row items-center gap-x-3 ${i < log.length - 1 ? 'border-b border-neutral-50' : ''}`}
              >
                <KindBadge kind={entry.kind} />
                <View className="flex-1 min-w-0">
                  <Text className="text-sm font-semibold text-neutral-900" numberOfLines={1}>
                    {entry.subject ?? '—'}
                  </Text>
                  <Text className="text-xs text-neutral-400 mt-0.5" numberOfLines={1}>
                    {entry.to_email ?? '—'}
                  </Text>
                </View>
                <View className="flex-row items-center">
                  <StatusDot status={entry.status} />
                  <Text className="text-xs text-neutral-500">{entry.status}</Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Info note */}
        <View className="bg-neutral-100 rounded-2xl px-4 py-3">
          <Text className="text-xs text-neutral-500 font-semibold mb-1">What's being tested</Text>
          <Text className="text-xs text-neutral-500 leading-5">
            {'✉️ blade_body — MailBuilder v3.1 generates Blade views from DSL HTML\n'}
            {'🔔 toMail_body — NotificationBuilder v3.9 injects custom MailMessage chain\n'}
            {'📋 send_log — every dispatch logged to DB with status + error'}
          </Text>
        </View>

      </ScrollView>
    </View>
  )
}

/* @arkzen:native:page:dashboard:end */

/* ─────────────────────────────────────────────────────────────────────────────
   NATIVE — LYNX (FIXED)
   ───────────────────────────────────────────────────────────────────────────── */

/* @arkzen:native:components:lynx:shared */

import { useState, useEffect, useCallback } from '@lynx-js/react'
import { useAuthStore, setActiveTatemono, arkzenFetch } from '@/arkzen/core/stores/authStore'

setActiveTatemono('body-mail-notification')

const BACKEND_URL = process.env.ARKZEN_BACKEND_URL ?? 'http://localhost:8000'

type SendLogEntry = {
  id:         number
  kind:       'mail' | 'notification'
  subject:    string | null
  to_email:   string | null
  mail_class: string | null
  status:     'sent' | 'failed'
  error:      string | null
  created_at: string
}

// ── Input field ───────────────────────────────────────────────
const Field = ({
  placeholder,
  value,
  onChangeText,
  type = 'text',
}: {
  placeholder:  string
  value:        string
  onChangeText: (v: string) => void
  type?:        string
}) => (
  <input
    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900"
    type={type}
    placeholder={placeholder}
    bindinput={e => onChangeText(e.detail.value)}
  />
)

// ── Error box ─────────────────────────────────────────────────
const ErrorBox = ({ message }: { message: string }) => (
  <view className="p-3 bg-red-50 border border-red-100 rounded-xl">
    <text className="text-xs text-red-600">{message}</text>
  </view>
)

// ── Primary button ────────────────────────────────────────────
const PrimaryBtn = ({
  label,
  onPress,
  loading = false,
  className = 'bg-neutral-900',
}: {
  label:      string
  onPress:    () => void
  loading?:   boolean
  className?: string
}) => (
  <view
    bindtap={loading ? undefined : onPress}
    className={`w-full py-3.5 rounded-2xl items-center ${loading ? 'bg-neutral-300' : className}`}
  >
    <text className="text-white text-sm font-semibold">
      {loading ? '…' : label}
    </text>
  </view>
)

// ── Kind badge ────────────────────────────────────────────────
const KindBadge = ({ kind }: { kind: string }) => (
  <view className={`inline-flex items-center px-2.5 py-0.5 rounded-full ${kind === 'mail' ? 'bg-blue-100' : 'bg-yellow-100'}`}>
    <text className={`text-xs font-bold ${kind === 'mail' ? 'text-blue-700' : 'text-yellow-700'}`}>
      {kind === 'mail' ? '✉ MAIL' : '🔔 NOTIF'}
    </text>
  </view>
)

// ── Status dot ────────────────────────────────────────────────
const StatusDot = ({ status }: { status: string }) => (
  <view className={`inline-block w-2 h-2 rounded-full mr-1.5 ${status === 'sent' ? 'bg-green-500' : 'bg-red-500'}`} />
)

/* @arkzen:native:components:lynx:shared:end */

/* @arkzen:native:page:lynx:login */
/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const LoginLynxPage = () => {
  const { login, isLoading } = useAuthStore()
  const [email,    setEmail]    = useState('test@body-mail-notification.com')
  const [password, setPassword] = useState('password123')
  const [error,    setError]    = useState<string | null>(null)

  const handleLogin = async () => {
    setError(null)
    try {
      await login(email, password)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed')
    }
  }

  return (
    <view className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <view className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full" style={{ maxWidth: 384, gap: 20 }}>
        <view>
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
            <text className="text-white text-lg font-bold">✉</text>
          </view>
          <text className="text-xl font-bold text-neutral-900">Body Injection Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            MailBuilder blade_body · NotificationBuilder toMail_body
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        <view style={{ gap: 12 }}>
          <Field placeholder="Email"    value={email}    onChangeText={setEmail}    type="email"    />
          <Field placeholder="Password" value={password} onChangeText={setPassword} type="password" />
        </view>

        <PrimaryBtn label={isLoading ? 'Signing in…' : 'Sign in'} onPress={handleLogin} loading={isLoading} />

        <text className="text-xs text-center text-neutral-400">
          No account?{' '}
          <text className="text-neutral-700" style={{ textDecorationLine: 'underline' }}>
            Register
          </text>
        </text>
      </view>
    </view>
  )
}

/* @arkzen:native:page:lynx:login:end */

/* @arkzen:native:page:lynx:register */
/* @arkzen:native:page:layout:guest */

import { useState } from '@lynx-js/react'
import { useAuthStore } from '@/arkzen/core/stores/authStore'

const RegisterLynxPage = () => {
  const { register, isLoading } = useAuthStore()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [error,    setError]    = useState<string | null>(null)

  const handleRegister = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try {
      await register(name, email, password, confirm)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Registration failed')
    }
  }

  return (
    <view className="min-h-screen flex items-center justify-center p-6 bg-neutral-50">
      <view className="bg-white rounded-2xl border border-neutral-100 shadow-sm p-8 w-full" style={{ maxWidth: 384, gap: 20 }}>
        <view>
          <view className="w-12 h-12 rounded-2xl bg-neutral-900 flex items-center justify-center mb-4">
            <text className="text-white text-lg font-bold">✉</text>
          </view>
          <text className="text-xl font-bold text-neutral-900">Body Injection Test</text>
          <text className="text-sm text-neutral-500 mt-1">
            Create an account to test mail &amp; notification injection
          </text>
        </view>

        {error && <ErrorBox message={error} />}

        <view style={{ gap: 12 }}>
          <Field placeholder="Name"             value={name}     onChangeText={setName}     />
          <Field placeholder="Email"            value={email}    onChangeText={setEmail}    type="email"    />
          <Field placeholder="Password"         value={password} onChangeText={setPassword} type="password" />
          <Field placeholder="Confirm password" value={confirm}  onChangeText={setConfirm}  type="password" />
        </view>

        <PrimaryBtn label={isLoading ? 'Creating…' : 'Create account'} onPress={handleRegister} loading={isLoading} />

        <text className="text-xs text-center text-neutral-400">
          Already have an account?{' '}
          <text className="text-neutral-700" style={{ textDecorationLine: 'underline' }}>
            Sign in
          </text>
        </text>
      </view>
    </view>
  )
}

/* @arkzen:native:page:lynx:register:end */

/* @arkzen:native:page:lynx:dashboard */
/* @arkzen:native:page:layout:auth */

import { useState, useEffect, useCallback } from '@lynx-js/react'
import { useAuthStore, arkzenFetch } from '@/arkzen/core/stores/authStore'

const DashboardLynxPage = () => {
  const { user, logout } = useAuthStore()

  const [log,       setLog]       = useState<SendLogEntry[]>([])
  const [loading,   setLoading]   = useState(false)
  const [toast,     setToast]     = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  // Mail send state
  const [mailKind,  setMailKind]  = useState<'welcome' | 'receipt' | 'alert'>('welcome')
  const [mailTo,    setMailTo]    = useState('')
  const [sending,   setSending]   = useState(false)

  // Notification state
  const [notifKind, setNotifKind] = useState<'action-required' | 'summary'>('action-required')
  const [notifMsg,  setNotifMsg]  = useState('')
  const [notifying, setNotifying] = useState(false)

  const showToast = useCallback((type: 'success' | 'error', msg: string) => {
    setToast({ type, msg })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadLog = async () => {
    setLoading(true)
    try {
      const res  = await arkzenFetch('/api/body-mail-notification/log')
      const data = await res.json()
      setLog(Array.isArray(data) ? data : (data?.data ?? []))
    } catch {
      showToast('error', 'Failed to load log')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadLog() }, [])

  const sendMail = async () => {
    if (!mailTo) { showToast('error', 'Enter a recipient email'); return }
    setSending(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/send-mail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mail: mailKind, to: mailTo }),
      })
      if (res.ok) { showToast('success', `${mailKind} mail sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Mail failed') }
    } catch {
      showToast('error', 'Mail request failed')
    } finally {
      setSending(false)
    }
  }

  const sendNotif = async () => {
    setNotifying(true)
    try {
      const res = await arkzenFetch('/api/body-mail-notification/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notification: notifKind, message: notifMsg || undefined }),
      })
      if (res.ok) { showToast('success', `${notifKind} notification sent`); loadLog() }
      else        { const e = await res.json(); showToast('error', e.message ?? 'Notification failed') }
    } catch {
      showToast('error', 'Notification request failed')
    } finally {
      setNotifying(false)
    }
  }

  const clearLog = async () => {
    try {
      await arkzenFetch('/api/body-mail-notification/log/clear', { method: 'DELETE' })
      showToast('success', 'Log cleared')
      setLog([])
    } catch {
      showToast('error', 'Clear failed')
    }
  }

  const handleLogout = async () => {
    await logout()
  }

  const mailTypes = [
    { key: 'welcome' as const, label: 'Welcome',  desc: 'Onboarding HTML via blade_body'     },
    { key: 'receipt' as const, label: 'Receipt',  desc: 'Table layout HTML via blade_body'   },
    { key: 'alert'   as const, label: 'Alert',    desc: 'CTA button HTML via blade_body'     },
  ]

  const notifTypes = [
    { key: 'action-required' as const, label: 'Action Required', desc: 'Custom toMail() chain via DSL body' },
    { key: 'summary'         as const, label: 'Summary',         desc: 'Activity summary via DSL body'      },
  ]

  return (
    <view className="min-h-screen bg-neutral-50">

      {/* Toast */}
      {toast && (
        <view className={`fixed top-5 right-5 z-50 text-white text-sm rounded-2xl px-5 py-3 shadow-xl ${
          toast.type === 'success' ? 'bg-neutral-900' : 'bg-red-500'
        }`}>
          <text>{toast.msg}</text>
        </view>
      )}

      {/* Header */}
      <view className="bg-white border-b border-neutral-100 px-5 py-4 flex-row items-center justify-between">
        <view>
          <text className="text-base font-semibold text-neutral-900">✉ Body Injection Test</text>
          <text className="text-xs text-neutral-400 mt-0.5">{user?.email}</text>
        </view>
        <view bindtap={handleLogout} className="text-xs text-neutral-400">
          <text className="text-xs text-neutral-400">Sign out</text>
        </view>
      </view>

      <view className="max-w-2xl mx-auto p-6" style={{ gap: 24 }}>

        {/* ── Send Mail ─────────────────────────────────── */}
        <view>
          <text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Mail · blade_body injection
          </text>

          {/* Mail type picker */}
          <view style={{ gap: 8 }} className="mb-3">
            {mailTypes.map(({ key, label, desc }) => (
              <view
                key={key}
                bindtap={() => setMailKind(key)}
                className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-100'
                }`}
              >
                <view className="flex-1 mr-3">
                  <text className="text-sm font-semibold text-neutral-900">{label}</text>
                  <text className="text-xs text-neutral-400 mt-0.5">{desc}</text>
                </view>
                <view className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                  mailKind === key ? 'border-neutral-900' : 'border-neutral-300'
                }`}>
                  {mailKind === key && <view className="w-2 h-2 rounded-full bg-neutral-900" />}
                </view>
              </view>
            ))}
          </view>

          <Field
            placeholder="Recipient email"
            onChangeText={setMailTo}
            type="email"
          />
          <view className="mt-2">
            <PrimaryBtn label={sending ? 'Sending…' : 'Send Mail'} onPress={sendMail} loading={sending} />
          </view>
        </view>

        {/* ── Send Notification ─────────────────────────── */}
        <view>
          <text className="text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            Send Notification · toMail_body injection
          </text>

          {/* Notif type picker */}
          <view style={{ gap: 8 }} className="mb-3">
            {notifTypes.map(({ key, label, desc }) => (
              <view
                key={key}
                bindtap={() => setNotifKind(key)}
                className={`bg-white rounded-2xl border p-4 flex-row items-center justify-between ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-100'
                }`}
              >
                <view className="flex-1 mr-3">
                  <text className="text-sm font-semibold text-neutral-900">{label}</text>
                  <text className="text-xs text-neutral-400 mt-0.5">{desc}</text>
                </view>
                <view className={`w-4 h-4 rounded-full border-2 items-center justify-center ${
                  notifKind === key ? 'border-violet-600' : 'border-neutral-300'
                }`}>
                  {notifKind === key && <view className="w-2 h-2 rounded-full bg-violet-600" />}
                </view>
              </view>
            ))}
          </view>

          <Field
            placeholder="Custom message (optional)"
            onChangeText={setNotifMsg}
          />
          <view className="mt-2">
            <PrimaryBtn
              label={notifying ? 'Sending…' : 'Send Notification'}
              onPress={sendNotif}
              loading={notifying}
              className="bg-violet-600"
            />
          </view>
        </view>

        {/* ── Send Log ──────────────────────────────────── */}
        <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
          <view className="px-5 py-4 border-b border-neutral-100 flex-row items-center justify-between">
            <text className="font-semibold text-sm text-neutral-900">Send Log</text>
            <view className="flex-row items-center" style={{ gap: 16 }}>
              <text
                className="text-xs text-neutral-400"
                bindtap={loading ? undefined : loadLog}
              >
                {loading ? 'Loading…' : 'Refresh'}
              </text>
              <text
                className="text-xs text-red-400"
                bindtap={clearLog}
              >
                Clear
              </text>
            </view>
          </view>

          {log.length === 0 ? (
            <view className="p-10 items-center">
              <text className="text-sm text-neutral-400">
                {loading ? 'Loading…' : 'No entries yet — send a mail or notification above.'}
              </text>
            </view>
          ) : (
            <view className="divide-y divide-neutral-50">
              {log.map(entry => (
                <view key={entry.id} className="px-5 py-3 flex-row items-center" style={{ gap: 12 }}>
                  <KindBadge kind={entry.kind} />
                  <view className="flex-1 min-w-0">
                    <text className="text-sm font-semibold text-neutral-900">
                      {entry.subject ?? '—'}
                    </text>
                    <text className="text-xs text-neutral-400 mt-0.5">
                      {entry.to_email ?? '—'}
                    </text>
                  </view>
                  <view className="flex-row items-center">
                    <StatusDot status={entry.status} />
                    <text className="text-xs text-neutral-500">{entry.status}</text>
                  </view>
                </view>
              ))}
            </view>
          )}
        </view>

        {/* Info note */}
        <view className="bg-neutral-100 rounded-2xl px-4 py-3">
          <text className="text-xs text-neutral-500 font-semibold mb-1">What's being tested</text>
          <text className="text-xs text-neutral-500 leading-5">
            ✉️ blade_body — MailBuilder v3.1 generates Blade views from DSL HTML{'\n'}
            🔔 toMail_body — NotificationBuilder v3.9 injects custom MailMessage chain{'\n'}
            📋 send_log — every dispatch logged to DB with status + error
          </text>
        </view>

      </view>
    </view>
  )
}

/* @arkzen:native:page:lynx:dashboard:end */