import { createServerFileRoute } from '@tanstack/react-start/server'
import * as path from 'path'
import { readHubRegistry } from '../../../../../../shared/arkzen/hub/registry'

const REGISTRY_PATH = path.resolve(process.cwd(), '..', '..', '..', 'arkzen.json')
const REPO_ROOT = path.resolve(process.cwd(), '..', '..', '..')

export default createServerFileRoute('/api/arkzen/registry')({
  methods: {
    GET: async () => {
      try {
        const registry = readHubRegistry(REGISTRY_PATH, REPO_ROOT, path.join(REPO_ROOT, 'arkzen.json'))
        if (!registry) return Response.json({ error: 'Registry not found' }, { status: 404 })
        return Response.json(registry)
      } catch (error) {
        return Response.json({ error: error instanceof Error ? error.message : 'Failed to read registry' }, { status: 500 })
      }
    },
  },
})