import type { APIRoute } from 'astro'
import fs   from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const REGISTRY_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'arkzen.json')

export const GET: APIRoute = () => {
  try {
    if (!fs.existsSync(REGISTRY_PATH)) {
      return new Response(
        JSON.stringify({ engine: '1.0.0', project: 'arkzen', modules: [] }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'))
    return new Response(
      JSON.stringify(registry),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch {
    return new Response(
      JSON.stringify({ engine: '1.0.0', project: 'arkzen', modules: [] }),
      { headers: { 'Content-Type': 'application/json' } }
    )
  }
}