#!/usr/bin/env node
// pluffy-ai.js — generate a Tatemono (tatemonos/<slug>/core.tsx) with your fine-tuned Pluffy model.
// Put this file in the repo root (next to mizumi.js). Needs Node 18+, no npm packages.
//
// 1) Start the model (needs -c 8192, temp 0):
//    llama-server -m <your.gguf> -c 8192 -t <cpu cores> --temp 0 --port 8080
// 2) Run:
//    node pluffy-ai.js "a clinic booking app with patients and appointments"
//    node pluffy-ai.js "a todo app" --tables "tasks(title:string,done:boolean,due_date:date)" --pages index
//
// Options: --slug <name>  --tables "<t>(<col>:<type>,...);<t2>(...)"  --pages index,admin
//          --server http://127.0.0.1:8080  --model pluffy-v11  --key <api-key>  --out tatemonos  --tries 3

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { buildReference, fullGuide } from './pluffy-retrieve.js';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// ---------- args ----------
const argv = process.argv.slice(2);
const opt = {};
const words = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith('--')) opt[argv[i].slice(2)] = argv[++i];
  else words.push(argv[i]);
}
const REQUEST = words.join(' ').trim();
if (!REQUEST) {
  console.log('Usage: node pluffy-ai.js "<app idea>" [--tables "tasks(title:string)"] [--pages index] [--slug my-app]');
  process.exit(1);
}
const SERVER = opt.server || 'http://127.0.0.1:8080';
const OUT_ROOT = path.resolve(ROOT, opt.out || 'tatemonos');
const MAX_TRIES = Number(opt.tries || 3);
const GUIDE = opt.guide === 'full' ? fullGuide() : '';

// Must be EXACTLY the system prompt used in training.
const SYSTEM = 'You generate one valid Pluff @arkzen DSL block. Output only the requested block, including its opening and closing markers where required.';

const COL_TYPES = new Set(['integer', 'string', 'text', 'decimal', 'boolean', 'date', 'datetime', 'json']);
const YAML_ONLY = new Set(['meta', 'meta:web', 'meta:native', 'web:config', 'native:config', 'desktop:config',
  'database', 'api', 'routes', 'realtime', 'events', 'notifications', 'mail']);
const BANNED_WEB_IMPORTS = ['next/', 'react-router', '@react-navigation', 'react-dropzone', 'expo', 'react-native', '@lynx-js'];

const kebab = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
const snake = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const pascal = (s) => s.split(/[^A-Za-z0-9]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join('');

// ---------- model call (streaming, so slow CPUs don't hit fetch timeouts) ----------
async function chat(messages, maxTokens, temperature) {
  const res = await fetch(/\/chat\/completions$/.test(SERVER) ? SERVER : `${SERVER.replace(/\/+$/, '')}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(opt.key ? { Authorization: `Bearer ${opt.key}` } : {}) },
    body: JSON.stringify({ model: opt.model || 'pluffy-v11', messages, max_tokens: maxTokens, temperature, stream: true }),
  });
  if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`);
  const decoder = new TextDecoder();
  let buf = '', text = '';
  for await (const chunk of res.body) {
    buf += decoder.decode(chunk, { stream: true });
    const lines = buf.split('\n');
    buf = lines.pop();
    for (const line of lines) {
      if (!line.startsWith('data: ') || line.includes('[DONE]')) continue;
      try { text += JSON.parse(line.slice(6)).choices?.[0]?.delta?.content ?? ''; } catch { /* partial line */ }
    }
    process.stdout.write('.');
  }
  return text;
}

// ---------- plan ----------
function parseTables(spec) {
  return spec.split(';').map((t) => t.trim()).filter(Boolean).map((t) => {
    const m = t.match(/^(\w+)\s*\(([^)]*)\)$/);
    if (!m) throw new Error(`Bad --tables entry: ${t}`);
    const columns = m[2].split(',').map((c) => c.trim()).filter(Boolean).map((c) => {
      const [n, ty = 'string'] = c.split(':').map((x) => x.trim());
      return { name: snake(n), type: COL_TYPES.has(ty) ? ty : 'string' };
    });
    return { name: snake(m[1]), model: pascal(m[1].replace(/s$/, '')), columns };
  });
}

async function autoPlan() {
  const sys = 'You are a planner. Output ONLY one JSON object, no prose, no Markdown.';
  const user = `Plan a small web app for: ${REQUEST}\n` +
    'Return JSON: {"slug":"kebab-case-name","tables":[{"name":"plural_snake_case","columns":[{"name":"snake_case","type":"string"}]}]}\n' +
    'Allowed column types: integer, string, text, decimal, boolean, date, datetime, json. At most 3 tables. No id or timestamp columns.';
  for (let a = 0; a < 3; a++) {
    try {
      const raw = await chat([{ role: 'system', content: sys }, { role: 'user', content: user }], 700, a ? 0.4 : 0);
      const m = raw.match(/\{[\s\S]*\}/);
      if (m) { const p = JSON.parse(m[0]); if (p.tables?.length) return p; }
    } catch { /* retry */ }
  }
  console.log('\n(auto-plan failed — pass --tables "name(col:type,...)" for a reliable plan)');
  return {};
}

async function makePlan() {
  let p = {};
  if (opt.tables) p.tables = parseTables(opt.tables);
  else p = await autoPlan();
  const slug = kebab(opt.slug || p.slug || REQUEST).slice(0, 30) || 'my-app';
  const tables = (p.tables || []).slice(0, 3).map((t) => ({
    name: snake(t.name || ''), model: pascal(t.model || (t.name || '').replace(/s$/, '')),
    columns: (t.columns || []).filter((c) => !['id', 'created_at', 'updated_at'].includes(snake(c.name || '')))
      .slice(0, 8).map((c) => ({ name: snake(c.name), type: COL_TYPES.has(c.type) ? c.type : 'string' })),
  })).filter((t) => t.name);
  if (!tables.length) tables.push({ name: 'items', model: 'Item', columns: [{ name: 'title', type: 'string' }] });
  tables.forEach((t, i) => { t.base = `/api/${slug}`; t.prefix = `${t.base}/${t.name.replace(/_/g, '-')}`; t.page = i === 0 ? 'index' : kebab(t.name); });
  const pages = opt.pages ? opt.pages.split(',').map((s) => s.trim()) : tables.map((t) => t.page);
  return { slug, tables, pages };
}

const blockList = (plan) => [
  'meta', 'meta:web', 'web:config',
  ...plan.tables.map((t) => `database:${t.name}`),
  ...plan.tables.map((t) => `api:${t.name}`),
  'web:components:shared',
  ...plan.pages.map((p) => `web:page:${p}`),
];

// ---------- prompt (same shape as the training data) ----------
function userPrompt(tag, plan, blocks, errors) {
  let msg = (opt.guide === 'full' ? 'PLUFF GUIDELINES (read all of it before answering):\n' + GUIDE + '\n\n---\n\n' : '') + `Write the @arkzen:${tag} block for this application: ${REQUEST}`;
  const ctx = [];
  if (/^(api|endpoint|handler|web:page|web:components)/.test(tag)) {
    ctx.push('- tables: ' + plan.tables.map((t) => `${t.name}(${t.columns.map((c) => c.name).join(', ')})`).join('; '));
  }
  if (tag.startsWith('web:page') && blocks['web:components:shared']) {
    const names = [...blocks['web:components:shared'].matchAll(/(?:const|function|class)\s+([A-Za-z_]\w*)/g)].map((m) => m[1]);
    if (names.length) ctx.push('- shared components and hooks: ' + [...new Set(names)].join(', '));
  }
  if (ctx.length) msg += '\n\nAlready written:\n' + ctx.join('\n');
  if (opt.ref === 'on' && !/^(meta|web:config)/.test(tag)) { const r = buildReference(tag, REQUEST); if (r) msg += '\n\nReference (same format, adapt to this app):\n' + r; }
  if (errors?.length) msg += '\n\nYour previous attempt was rejected. Fix these problems and output the full block again:\n- ' + errors.join('\n- ');
  return msg;
}

// ---------- closers, autofix, validation ----------
function closerFor(tag) {
  const k = YAML_ONLY.has(tag) || YAML_ONLY.has(tag.split(':')[0]);
  return k ? '\n*/' : `/* @arkzen:${tag}:end */`;
}

// Deterministic fixes for habits the base Qwen model leaks.
function autofix(tag, text, plan) {
  let s = text.trim().replace(/^```\w*\n?|\n?```$/g, '').trim();
  if (tag === 'meta') s = s.replace(/^name:.*$/m, `name: ${plan.slug}`);
  if (tag.startsWith('database:') || tag.startsWith('api:')) {
    s = s.replace(/^(\s*)soft_delete:/gm, '$1softDeletes:').replace(/\bauto_increment:/g, 'autoIncrement:');
    s = s.replace(/^timestamps:\s*\n(?:\s+\w+:.*\n?)+/m, 'timestamps: true\n');
  }
  if (tag.startsWith('api:')) {
    const t = plan.tables.find((x) => x.name === tag.split(':')[1]);
    if (t) {
      s = s.replace(/^model:.*$/m, `model: ${t.model}`).replace(/^controller:.*$/m, `controller: ${t.model}Controller`)
        .replace(/^prefix:.*$/m, `prefix: ${t.base}`);
    }
  }
  if (tag.startsWith('web:page')) {
    s = s.replace(/^\s*['"]use client['"];?\s*\n/m, '');
    s = s.replace(/\/api\/[a-z0-9-]+\/(?=[a-z$])/g, `/api/${plan.slug}/`);
  }
  return s;
}

function validate(tag, s, plan) {
  const errs = [];
  if (s.includes('```')) errs.push('contains Markdown fences');
  const m = s.match(/^\/\*\s*@arkzen:([A-Za-z0-9:_.{}+-]+)/);
  if (!m) return ['does not start with /* @arkzen:'];
  if (m[1] !== tag) errs.push(`opening tag is ${m[1]}, expected ${tag}`);
  const yaml = YAML_ONLY.has(tag) || YAML_ONLY.has(tag.split(':')[0]);
  if (yaml) {
    if (!s.trimEnd().endsWith('*/')) errs.push('YAML block not closed by */');
    if (tag.startsWith('database:') && !/^columns:/m.test(s)) errs.push('database block needs columns:');
    if (/soft_delete|auto_increment/.test(s)) errs.push('wrong field names (use softDeletes / autoIncrement)');
    if (tag.startsWith('api:')) for (const k of ['model', 'controller', 'prefix', 'endpoints']) if (!new RegExp(`^${k}:`, 'm').test(s)) errs.push(`api block needs ${k}:`);
    if (tag.startsWith('api:')) {
      const t = plan.tables.find((x) => x.name === tag.split(':')[1]);
      if (t?.columns?.length) {
        const cols = new Set(t.columns.map((c) => c.name));
        const bad = new Set();
        const lines = s.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const m = lines[i].match(/^(\s+)validation:\s*$/);
          if (!m) continue;
          for (let j = i + 1; j < lines.length; j++) {
            const f = lines[j].match(/^(\s+)(\w+):\s*\S/);
            if (!f || f[1].length <= m[1].length) break;
            if (!cols.has(f[2])) bad.add(f[2]);
          }
        }
        if (bad.size) errs.push(`validation fields [${[...bad].join(', ')}] are not database columns; the table columns are: ${[...cols].join(', ')}`);
      }
    }
    return errs;
  }
  if (!s.endsWith(`/* @arkzen:${tag}:end */`)) errs.push('not closed with :end marker (output may be cut off)');
  for (const [, imp] of s.matchAll(/from\s+['"]([^'"]+)['"]/g)) if (BANNED_WEB_IMPORTS.some((b) => imp.startsWith(b))) errs.push(`banned import '${imp}'`);
  if (/NEXT_PUBLIC|process\.env/.test(s)) errs.push('do not use process.env');
  if (/\b(useQuery|apiFetch|useSWR|axios)\b/.test(s)) errs.push("do not use useQuery/apiFetch/axios; use arkzenFetch from '@/arkzen/core/stores/authStore' (it returns a Response: await res.json())");
  if (tag.startsWith('web:page') && /fetch\(/i.test(s) && !/arkzenFetch/.test(s)) errs.push('use arkzenFetch for API calls');
  if (tag.startsWith('web:page')) {
    if (/export default/.test(s)) errs.push('web pages must not use export default');
    const t = plan.tables.find((x) => x.page === tag.split(':')[2]);
    if (t && !s.includes(t.prefix)) errs.push(`page must call ${t.prefix}`);
  }
  return errs;
}

// ---------- engine validator (the framework's own DSL check, same validator scan.js uses) ----------
async function engineValidate(filePath) {
  try {
    let stack = 'nextjs';
    const cfg = path.join(ROOT, 'arkzen.json');
    if (fs.existsSync(cfg)) stack = JSON.parse(fs.readFileSync(cfg, 'utf8')).activeStack || stack;
    const dir = path.join(ROOT, 'engine', 'frontend', stack);
    const validatorPath = path.join(dir, 'arkzen', 'core', 'validator.ts');
    if (!fs.existsSync(validatorPath)) return { skipped: `no validator for stack "${stack}"` };
    // Run in a child process from the stack folder so `tsx` resolves from that stack's node_modules.
    const code = `
      const { tsImport } = await import('tsx/esm/api');
      const { validateTatemono } = await tsImport(${JSON.stringify(pathToFileURL(validatorPath).href)}, import.meta.url);
      const log = console.log, err = console.error; console.log = () => {}; console.error = () => {};
      const r = validateTatemono(${JSON.stringify(filePath)});
      console.log = log; console.log('@@RESULT@@' + JSON.stringify(r));`;
    const out = execFileSync(process.execPath, ['--input-type=module', '-e', code], { cwd: dir, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const line = out.split('\n').find((l) => l.startsWith('@@RESULT@@'));
    if (!line) return { skipped: 'validator gave no result' };
    return { result: JSON.parse(line.slice(10)) };
  } catch (e) {
    return { skipped: `${String(e.stderr || e.message).split('\n').find((l) => l.trim()) || e.message} (run "npm install" in engine/frontend/<stack> first)` };
  }
}

// ---------- main ----------
console.log(`Pluffy AI → ${SERVER}\nRequest: ${REQUEST}\n`);
const plan = await makePlan();
console.log('Plan:', JSON.stringify({ slug: plan.slug, tables: plan.tables.map((t) => t.name), pages: plan.pages }));

const blocks = {}, failed = {}, report = [];
for (const tag of blockList(plan)) {
  const big = /^(web:page|web:components|native)/.test(tag);
  let best = '', bestErrs = null, tries = 0, lastErrs = null;
  for (let a = 1; a <= MAX_TRIES; a++) {
    tries = a;
    process.stdout.write(`[${tag}] try ${a} `);
    let raw = await chat([{ role: 'system', content: SYSTEM }, { role: 'user', content: userPrompt(tag, plan, blocks, lastErrs) }], big ? 4096 : 1200, a > 1 ? 0.3 : 0);
    const closer = closerFor(tag);
    const cut = raw.indexOf(closer);
    if (cut !== -1) raw = raw.slice(0, cut + closer.length);
    const text = autofix(tag, raw, plan);
    const errs = validate(tag, text, plan);
    lastErrs = errs;
    console.log(errs.length ? ` FAIL: ${errs.join('; ').slice(0, 150)}` : ' OK');
    if (bestErrs === null || errs.length < bestErrs.length) { best = text; bestErrs = errs; }
    if (!errs.length) break;
  }
  if (bestErrs.length) failed[tag] = best; else blocks[tag] = best;
  if (tag.startsWith('database:') && blocks[tag]) {
    const t = plan.tables.find((x) => x.name === tag.split(':')[1]);
    const cols = [...blocks[tag].matchAll(/^  (\w+):\s*$/gm)].map((m) => m[1]).filter((c) => !['id', 'created_at', 'updated_at'].includes(c));
    if (t && cols.length) t.columns = cols.map((n) => ({ name: n, type: 'string' }));
  }
  report.push({ tag, ok: !bestErrs.length, tries, errors: bestErrs });
}

const dir = path.join(OUT_ROOT, plan.slug);
fs.mkdirSync(dir, { recursive: true });
const body = blockList(plan).filter((t) => blocks[t]).map((t) => blocks[t].trim()).join('\n\n') + '\n';
fs.writeFileSync(path.join(dir, 'core.tsx'), body, 'utf8');
if (Object.keys(failed).length) {
  fs.mkdirSync(path.join(dir, 'failed'), { recursive: true });
  for (const [t, txt] of Object.entries(failed)) fs.writeFileSync(path.join(dir, 'failed', t.replace(/:/g, '_') + '.txt'), txt, 'utf8');
}
fs.writeFileSync(path.join(dir, 'report.json'), JSON.stringify({ request: REQUEST, plan, report }, null, 2));
const ok = report.filter((r) => r.ok).length;
console.log(`\nDone: ${ok}/${report.length} blocks passed → ${path.join(dir, 'core.tsx')}`);
if (Object.keys(failed).length) console.log('Failed blocks (left out of core.tsx):', Object.keys(failed).join(', '), '→ see failed/ folder');
const ev = await engineValidate(path.join(dir, 'core.tsx'));
if (ev.skipped) console.log(`Engine validator: skipped — ${ev.skipped}`);
else if (ev.result.valid) console.log('Engine validator: VALID' + (ev.result.warnings.length ? ` (warnings: ${ev.result.warnings.join('; ')})` : ''));
else console.log('Engine validator: INVALID\n  - ' + ev.result.errors.join('\n  - '));
console.log('If the engine is running (node start.js) it will pick up the new tatemono automatically.');