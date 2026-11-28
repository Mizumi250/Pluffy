import path from 'node:path'
import { fileURLToPath } from 'node:url'

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
export const MIZUMI = path.join(ROOT, 'mizumi.js')
export const TATEMONOS = path.join(ROOT, 'tatemonos')
export const PROJECTS = path.join(ROOT, 'projects')
