import * as fs from 'fs'
import * as path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // process.cwd() = engine/frontend/react-vite/ when started via npm run dev
    // Resolving 3 levels up lands at the monorepo root where arkzen.json lives.
    // Previously used path.resolve(__dirname, '../../../..') which only reached
    // engine/frontend/ — 2 levels short — so arkzen.json was never found.
    const registryPath = path.resolve(process.cwd(), '..', '..', '..', 'arkzen.json')

    if (!fs.existsSync(registryPath)) {
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(200)
      res.end(JSON.stringify({ engine: '1.0.0', project: 'arkzen', modules: [] }))
      return
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify(registry))
  } catch (err) {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(500)
    res.end(JSON.stringify({ error: 'Failed to read registry' }))
  }
}