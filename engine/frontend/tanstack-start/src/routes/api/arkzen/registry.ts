import { createServerFileRoute } from '@tanstack/react-start/server'
import * as fs from 'fs'
import * as path from 'path'

const REGISTRY_PATH = path.resolve(process.cwd(), '..', '..', '..', 'arkzen.json')

export const ServerRoute = createServerFileRoute('/api/arkzen/registry')({
  methods: {
    GET: async () => {
      try {
        if (!fs.existsSync(REGISTRY_PATH)) {
          return Response.json({ engine: '1.0.0', project: 'arkzen', modules: [] })
        }
        const registry = JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8'))
        return Response.json(registry)
      } catch {
        return Response.json({ engine: '1.0.0', project: 'arkzen', modules: [] })
      }
    },
  },
})