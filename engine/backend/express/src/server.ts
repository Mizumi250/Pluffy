// Pluff Express backend: same /arkzen engine contract as the Laravel backend.
import express from 'express'
import cors from 'cors'
import * as fs from 'fs'
import * as path from 'path'
import { REPO_ROOT, BACKEND_DIR, env, Log } from './runtime/support'
import { startRealtime } from './runtime/broadcast'
import { STORAGE_ROOT } from './runtime/storage'
import { buildTatemono, removeTatemono, loadAllGenerated, routers } from './engine/build'

export const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/storage', express.static(STORAGE_ROOT))

const SECRET = env('ARKZEN_ENGINE_SECRET', 'arkzen-engine-secret')
const engineAuth: express.RequestHandler = (req, res, next) =>
  req.header('x-arkzen-secret') === SECRET ? next() : void res.status(403).json({ message: 'Invalid engine secret.' })

const engine = express.Router()
engine.get('/health', (_q, r) => void r.json({ status: 'ok', engine: 'Pluff Express Backend Engine', backend: 'express', variant: 'ts', version: '1.0.0' }))
engine.use(engineAuth)
engine.get('/registry', (_q, r) => {
  const f = path.join(REPO_ROOT, 'arkzen.json')
  r.json(fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : { project: path.basename(REPO_ROOT) })
})
engine.post('/build',  async (q, r) => { const o = await buildTatemono(q.body); r.status(o.status).json(o.body) })
engine.post('/remove', async (q, r) => r.json(await removeTatemono(q.body)))
app.use('/arkzen', engine)

// /api/<tatemono>/... is dispatched to that tatemono's generated router (hot-swapped on rebuild).
app.use((req, res, next) => {
  const m = req.path.match(/^\/api\/([^/]+)/)
  const r = m && routers.get(m[1])
  return r ? r(req, res, next) : next()
})
app.use((_q, r) => void r.status(404).json({ message: 'Not Found' }))

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(BACKEND_DIR, 'src', 'server.ts')
if (isMain) {
  const port = Number(env('PORT', '8000'))
  await loadAllGenerated()
  startRealtime()
  app.listen(port, () => Log.info(`Express backend on http://localhost:${port}`))
}
