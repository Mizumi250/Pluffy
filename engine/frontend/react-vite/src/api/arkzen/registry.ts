import * as path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'
import { readHubRegistry } from '../../../../../shared/arkzen/hub/registry'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    // process.cwd() = engine/frontend/react-vite/ when started via npm run dev
    // Resolving 3 levels up lands at the monorepo root where arkzen.json lives.
    // Previously used path.resolve(__dirname, '../../../..') which only reached
    // engine/frontend/ — 2 levels short — so arkzen.json was never found.
    const repoRoot = path.resolve(process.cwd(), '..', '..', '..')
    const registryPath = path.join(repoRoot, 'arkzen.json')

    const registry = readHubRegistry(registryPath, repoRoot)
    if (!registry) {
      res.setHeader('Content-Type', 'application/json')
      res.writeHead(404)
      res.end(JSON.stringify({ error: 'Registry not found' }))
      return
    }

    res.setHeader('Content-Type', 'application/json')
    res.writeHead(200)
    res.end(JSON.stringify(registry))
  } catch (err) {
    res.setHeader('Content-Type', 'application/json')
    res.writeHead(500)
    res.end(JSON.stringify({ error: err instanceof Error ? err.message : 'Failed to read registry' }))
  }
}