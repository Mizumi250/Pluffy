'use strict'
// SQLite storage (built-in node:sqlite). Sessions, messages, settings.

const { DatabaseSync } = require('node:sqlite')
const { cap } = require('./lib')

const DEFAULTS = { server: 'http://127.0.0.1:11434', model: 'pluffy-v11', key: '' }
const now = () => Date.now()
const like = (s) => '%' + String(s).replace(/[\\%_]/g, '\\$&') + '%'

function row(r) {
  if (!r) return null
  let meta = null
  if (r.meta) { try { meta = JSON.parse(r.meta) } catch { /* ignore */ } }
  return { ...r, meta }
}

function openDb(file) {
  const db = new DatabaseSync(file)
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL DEFAULT 'New chat',
      titled INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS messages (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      session_id INTEGER NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
      role TEXT NOT NULL,
      kind TEXT NOT NULL DEFAULT 'text',
      content TEXT NOT NULL DEFAULT '',
      meta TEXT,
      created_at INTEGER NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, id);
    CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
  `)

  // a terminal run that was still going when the app closed
  try {
    db.exec(`UPDATE messages SET meta = json_set(meta, '$.running', json('false'), '$.interrupted', json('true'))
             WHERE kind = 'terminal' AND json_extract(meta, '$.running') = 1`)
  } catch { /* ignore */ }

  const q = {
    listAll: db.prepare(`SELECT s.id, s.title, s.created_at, s.updated_at,
        (SELECT content FROM messages m WHERE m.session_id = s.id AND m.kind IN ('text','command','notice') AND m.content <> '' ORDER BY m.id DESC LIMIT 1) AS preview
        FROM sessions s ORDER BY s.updated_at DESC`),
    listSearch: db.prepare(`SELECT s.id, s.title, s.created_at, s.updated_at,
        (SELECT content FROM messages m WHERE m.session_id = s.id AND m.kind IN ('text','command','notice') AND m.content <> '' ORDER BY m.id DESC LIMIT 1) AS preview
        FROM sessions s
        WHERE s.title LIKE ? ESCAPE '\\' OR EXISTS (SELECT 1 FROM messages m WHERE m.session_id = s.id AND m.content LIKE ? ESCAPE '\\')
        ORDER BY s.updated_at DESC`),
    getSession: db.prepare('SELECT id, title, titled, created_at, updated_at FROM sessions WHERE id = ?'),
    insSession: db.prepare('INSERT INTO sessions (title, titled, created_at, updated_at) VALUES (?, 0, ?, ?)'),
    rename: db.prepare('UPDATE sessions SET title = ?, titled = 1 WHERE id = ?'),
    autoTitle: db.prepare('UPDATE sessions SET title = ?, titled = 1 WHERE id = ? AND titled = 0'),
    touch: db.prepare('UPDATE sessions SET updated_at = ? WHERE id = ?'),
    delSession: db.prepare('DELETE FROM sessions WHERE id = ?'),
    msgs: db.prepare('SELECT id, session_id, role, kind, content, meta, created_at FROM messages WHERE session_id = ? ORDER BY id'),
    textMsgs: db.prepare(`SELECT id, role, content FROM messages WHERE session_id = ? AND kind = 'text' ORDER BY id`),
    getMsg: db.prepare('SELECT id, session_id, role, kind, content, meta, created_at FROM messages WHERE id = ?'),
    insMsg: db.prepare('INSERT INTO messages (session_id, role, kind, content, meta, created_at) VALUES (?, ?, ?, ?, ?, ?)'),
    updMsg: db.prepare('UPDATE messages SET content = ?, meta = ? WHERE id = ?'),
    delMsg: db.prepare('DELETE FROM messages WHERE id = ?'),
    getSet: db.prepare('SELECT key, value FROM settings'),
    putSet: db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value'),
  }

  const api = {
    listSessions(search) {
      const s = String(search || '').trim()
      return (s ? q.listSearch.all(like(s), like(s)) : q.listAll.all()).map((r) => ({ ...r }))
    },
    getSession: (id) => { const r = q.getSession.get(id); return r ? { ...r } : null },
    createSession() {
      const t = now()
      const r = q.insSession.run('New chat', t, t)
      return api.getSession(Number(r.lastInsertRowid))
    },
    renameSession(id, title) {
      const t = String(title || '').replace(/\s+/g, ' ').trim().slice(0, 80)
      if (t) q.rename.run(t, id)
      return api.getSession(id)
    },
    deleteSession: (id) => { q.delSession.run(id) },
    autoTitle(id, text) {
      const t = String(text).replace(/\s+/g, ' ').trim().slice(0, 40)
      if (t) q.autoTitle.run(t, id)
    },
    getMessages: (id) => q.msgs.all(id).map(row),
    getTextMessages: (id) => q.textMsgs.all(id).map((r) => ({ ...r })),
    getMessage: (id) => row(q.getMsg.get(id)),
    addMessage(sessionId, role, kind, content, meta) {
      const t = now()
      const r = q.insMsg.run(sessionId, role, kind, cap(content || ''), meta ? JSON.stringify(meta) : null, t)
      q.touch.run(t, sessionId)
      return row(q.getMsg.get(Number(r.lastInsertRowid)))
    },
    updateMessage(id, content, meta) {
      q.updMsg.run(cap(content || ''), meta ? JSON.stringify(meta) : null, id)
    },
    deleteMessage: (id) => { q.delMsg.run(id) },
    getSettings() {
      const out = { ...DEFAULTS }
      for (const r of q.getSet.all()) if (r.key in DEFAULTS) out[r.key] = r.value
      return out
    },
    setSettings(obj) {
      for (const k of Object.keys(DEFAULTS)) if (k in obj) q.putSet.run(k, String(obj[k]))
      return api.getSettings()
    },
    close: () => db.close(),
  }
  return api
}

module.exports = { openDb, DEFAULTS }