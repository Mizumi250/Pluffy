// Pluff Express backend: same /arkzen engine contract as the Laravel backend.
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import * as fs from 'fs'
import * as path from 'path'
import { REPO_ROOT, BACKEND_DIR, env, Log } from './runtime/support'
import { startRealtime } from './runtime/broadcast'
import { STORAGE_ROOT } from './runtime/storage'
import { buildTatemono, removeTatemono, loadAllGenerated, routers, routePrefixes } from './engine/build'

export const app = express()
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } }).any())
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

// Generated API prefixes are authoritative; tatemono slugs are not implicit URL prefixes.
app.use((req, res, next) => {
  const candidates = [...routePrefixes.entries()]
    .filter(([, prefixes]) => prefixes.some(prefix => req.path === prefix || req.path.startsWith(`${prefix}/`)))
    .sort((a, b) => Math.max(...b[1].map(p => p.length)) - Math.max(...a[1].map(p => p.length)))
    .map(([slug]) => routers.get(slug))
    .filter((router): router is NonNullable<typeof router> => !!router)
  let index = 0
  const dispatchNext: express.NextFunction = (error?: any) => {
    if (error) return next(error)
    const router = candidates[index++]
    return router ? router(req, res, dispatchNext) : next()
  }
  return dispatchNext()
})
app.use((_q, r) => void r.status(404).json({ message: 'Not Found' }))

const isMain = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(BACKEND_DIR, 'src', 'server.ts')
if (isMain) {
  const port = Number(env('PORT', '8000'))
  await loadAllGenerated()
  startRealtime()
  app.listen(port, () => Log.info(`Express backend on http://localhost:${port}`))
}
