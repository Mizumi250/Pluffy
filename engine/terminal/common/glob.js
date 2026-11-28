// Glob matching for term:assets include patterns, relative to the tatemono's assets folder.
// Supports *, ** and ?. The same rules the validator uses.
import fs from 'node:fs'
import path from 'node:path'

export function globToRegExp(glob) {
  let re = ''
  for (let i = 0; i < glob.length; i++) {
    const c = glob[i]
    if (c === '*') {
      if (glob[i + 1] === '*') { re += '.*'; i++; if (glob[i + 1] === '/') i++ } else re += '[^/]*'
    } else if (c === '?') re += '[^/]'
    else re += c.replace(/[.+^${}()|[\]\\]/g, '\\$&')
  }
  return new RegExp(`^${re}$`)
}

// Every file under dir, as forward-slash paths relative to dir.
export function listFiles(dir) {
  const out = []
  const walk = (current, rel) => {
    let entries = []
    try { entries = fs.readdirSync(current, { withFileTypes: true }) } catch { return }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      const r = rel ? `${rel}/${entry.name}` : entry.name
      if (entry.isDirectory()) walk(path.join(current, entry.name), r)
      else out.push(r)
    }
  }
  walk(dir, '')
  return out
}

// "./assets/x" and "assets/x" and "x" all mean the same file.
export function cleanAssetPath(rel) {
  return rel.replace(/\\/g, '/').replace(/^(?:\.\/)?\/?(?:assets\/)?/, '')
}

export function matchGlobs(files, globs) {
  const res = globs.map(g => globToRegExp(cleanAssetPath(g)))
  return files.filter(f => res.some(re => re.test(f)))
}
