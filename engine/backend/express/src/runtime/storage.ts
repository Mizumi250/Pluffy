import * as fs from 'fs'
import * as path from 'path'
import * as crypto from 'crypto'
import { BACKEND_DIR, ensureDir, env } from './support'

export const STORAGE_ROOT = path.join(BACKEND_DIR, 'storage', 'public')

/** Local public disk (storage/public), served at /storage. */
export const Storage = {
  put(dir: string, file: { originalname: string; buffer: Buffer }): string {
    const ext = path.extname(file.originalname)
    const rel = path.posix.join(dir, `${crypto.randomBytes(16).toString('hex')}${ext}`)
    ensureDir(path.join(STORAGE_ROOT, dir))
    fs.writeFileSync(path.join(STORAGE_ROOT, rel), file.buffer)
    return rel
  },
  delete(rel: string) { const p = path.join(STORAGE_ROOT, rel); if (fs.existsSync(p)) fs.rmSync(p) },
  exists: (rel: string) => fs.existsSync(path.join(STORAGE_ROOT, rel)),
  url: (rel: string) => `${env('APP_URL', 'http://localhost:8000')}/storage/${rel}`,
}
