import * as fs from 'fs'
import * as path from 'path'
import type { IncomingMessage, ServerResponse } from 'http'

export const GET = async (req: IncomingMessage, res: ServerResponse) => {
  try {
    const registryPath = path.resolve(__dirname, '../../../..', 'arkzen.json')

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
