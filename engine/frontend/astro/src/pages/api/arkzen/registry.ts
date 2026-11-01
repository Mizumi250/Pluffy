import type { APIRoute } from 'astro'
import path from 'path'
import { fileURLToPath } from 'url'
import { readHubRegistry } from '../../../../../../shared/arkzen/hub/registry'

const __filename    = fileURLToPath(import.meta.url)
const __dirname     = path.dirname(__filename)
const REGISTRY_PATH = path.resolve(__dirname, '..', '..', '..', '..', 'arkzen.json')
const REPO_ROOT = path.resolve(process.cwd(), '..', '..', '..')

export const GET: APIRoute = () => {
  try {
    const registry = readHubRegistry(REGISTRY_PATH, REPO_ROOT, path.join(REPO_ROOT, 'arkzen.json'))
    if (!registry) {
      return new Response(
        JSON.stringify({ error: 'Registry not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(registry),
      { headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Failed to read registry' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}