// pluffy-retrieve.js — lets pluffy-ai.js "read" your repo: tatemonos/*/core.tsx + PLUFF_GUIDELINES_v*.md.
// Put it in the repo root (next to pluffy-ai.js). No npm packages, Node 18+.
// The model never opens files itself: this reads them locally and returns a short text snippet
// that pluffy-ai.js appends to the prompt.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));

// Same list pluffy-ai.js uses: blocks closed by a bare "*/" line instead of ":end */".
const YAML_ONLY = new Set(['meta', 'meta:web', 'meta:native', 'web:config', 'native:config', 'desktop:config',
  'database', 'api', 'routes', 'realtime', 'events', 'notifications', 'mail']);
const isYamlOnly = (tag) => YAML_ONLY.has(tag) || YAML_ONLY.has(tag.split(':')[0]);

// "web:page:index" -> "web:page", "database:items" -> "database", "web:components:shared" -> "web:components"
const baseOf = (tag) => {
  const p = tag.split(':');
  if (p[0] === 'web' || p[0] === 'native') return p.slice(0, 2).join(':');
  return p[0];
};

const STOP = new Set('a an the and or for of to with in on app application system me my that lets let can create build make want need'.split(' '));
const words = (s) => (String(s || '').toLowerCase().match(/[a-z]{3,}/g) || []).filter((w) => !STOP.has(w));

// ---------- guideline: split into "## " sections ----------
let _guide = null;
function loadGuide() {
  if (_guide) return _guide;
  const files = fs.readdirSync(ROOT).filter((f) => /^PLUFF_GUIDELINES.*\.md$/i.test(f));
  // newest version number wins (v12 > v9)
  files.sort((a, b) => (Number((b.match(/v(\d+)/i) || [])[1]) || 0) - (Number((a.match(/v(\d+)/i) || [])[1]) || 0));
  _guide = [];
  if (!files.length) return _guide;
  const lines = fs.readFileSync(path.join(ROOT, files[0]), 'utf8').split('\n');
  let cur = null;
  for (const line of lines) {
    if (/^## /.test(line)) { cur = { heading: line, body: [] }; _guide.push(cur); }
    else if (cur) cur.body.push(line);
  }
  _guide.forEach((s) => { s.text = [s.heading, ...s.body].join('\n').trim(); });
  return _guide;
}

// Sections whose heading mentions "@arkzen:<base>" (e.g. SECTION 8 — @arkzen:api for tag api:items).
function guideFor(tag, maxChars) {
  const base = baseOf(tag);
  const needle = new RegExp(`@arkzen:${base.replace(/:/g, ':')}(?![A-Za-z0-9])`);
  const hits = loadGuide().filter((s) => needle.test(s.heading));
  const out = hits.map((s) => s.text).join('\n\n');
  return out.length > maxChars ? out.slice(0, maxChars) + '\n…' : out;
}

// ---------- tatemonos: parse blocks out of every core.tsx ----------
let _tats = null;
function parseBlocks(src) {
  const lines = src.split('\n');
  const blocks = {};
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^\/\*\s*@arkzen:([A-Za-z0-9:_.{}+-]+?)(?:\s|\*\/|$)/);
    if (!m || m[1].endsWith(':end')) continue;
    const tag = m[1];
    const yaml = isYamlOnly(tag);
    let j = i + 1;
    for (; j < lines.length; j++) {
      if (yaml ? lines[j].trim() === '*/' : lines[j].includes(`@arkzen:${tag}:end`)) break;
    }
    if (j < lines.length) { blocks[tag] = lines.slice(i, j + 1).join('\n'); i = j; }
  }
  return blocks;
}

function loadTatemonos() {
  if (_tats) return _tats;
  _tats = [];
  const dir = path.join(ROOT, 'tatemonos');
  if (!fs.existsSync(dir)) return _tats;
  let desc = {};
  try { desc = JSON.parse(fs.readFileSync(path.join(ROOT, 'descriptions.json'), 'utf8')); } catch { /* optional */ }
  for (const name of fs.readdirSync(dir)) {
    const f = path.join(dir, name, 'core.tsx');
    if (!fs.existsSync(f)) continue;
    const blocks = parseBlocks(fs.readFileSync(f, 'utf8'));
    const d = desc[name] || {};
    const text = `${name.replace(/-/g, ' ')} ${d.description || ''} ${d.meta_description || ''}`;
    _tats.push({ name, blocks, words: new Set(words(text)) });
  }
  return _tats;
}

function similar(request, tag, n) {
  const q = words(request);
  const base = baseOf(tag);
  return loadTatemonos()
    .map((t) => {
      const hasTag = Object.keys(t.blocks).filter((k) => baseOf(k) === base);
      const score = q.reduce((s, w) => s + (t.words.has(w) ? 1 : 0), 0);
      return { t, hasTag, score };
    })
    .filter((x) => x.hasTag.length && x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, n);
}

/**
 * Build the reference text for one block.
 * @param tag      e.g. "api:tasks", "web:page:index"
 * @param request  the user's app idea
 * @param opts     { examples: 2, exampleChars: 2200, guideChars: 2500 }
 */
export function buildReference(tag, request, opts = {}) {
  const { examples = 2, exampleChars = 2200, guideChars = 2500 } = opts;
  const parts = [];
  const g = guideFor(tag, guideChars);
  if (g) parts.push(`Guideline excerpt:\n${g}`);
  for (const { t, hasTag } of similar(request, tag, examples)) {
    // prefer the block whose full tag is closest to the requested one
    const key = hasTag.find((k) => k === tag) || hasTag[0];
    let b = t.blocks[key];
    if (b.length > exampleChars) b = b.slice(0, exampleChars) + '\n…(truncated)';
    parts.push(`Example from tatemono "${t.name}":\n${b}`);
  }
  return parts.length ? parts.join('\n\n') : '';
}

// quick self-test: node pluffy-retrieve.js "a clinic booking app" api:appointments
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const [req = 'a clinic booking app', tag = 'api:appointments'] = process.argv.slice(2);
  const ref = buildReference(tag, req);
  console.log(`tatemonos parsed: ${loadTatemonos().length}, guideline sections: ${loadGuide().length}`);
  console.log(`reference: ${ref.length} chars (~${Math.round(ref.length / 3.5)} tokens)\n`);
  console.log(ref.slice(0, 1800));
}