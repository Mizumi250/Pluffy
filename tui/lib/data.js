import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const MIZUMI = path.join(ROOT, 'mizumi.js')

export function readStacks() {
  try {
    const c = JSON.parse(fs.readFileSync(path.join(ROOT, 'arkzen.json'), 'utf8'))
    return [['web', c.activeStack], ['app', c.activeAppStack], ['desktop', c.activeDesktopStack], ['backend', c.activeBackend], ['db', c.activeDatabase ?? 'sqlite']].filter(([, v]) => v)
  } catch { return [] }
}

const dirs = (p, needFile) => {
  try {
    return fs.readdirSync(p, { withFileTypes: true })
      .filter((e) => e.isDirectory() && (!needFile || fs.existsSync(path.join(p, e.name, needFile))))
      .map((e) => e.name).sort((a, b) => a.localeCompare(b))
  } catch { return [] }
}
export const listTatemonos = () => dirs(path.join(ROOT, 'tatemonos'), 'core.tsx')
export const listProjects = () => dirs(path.join(ROOT, 'projects'))
