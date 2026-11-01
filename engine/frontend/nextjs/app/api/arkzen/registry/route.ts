import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { enrichHubRegistry } from '../../../../../../shared/arkzen/hub/registry'

export async function GET() {
  try {
    const registryPath = path.join(process.cwd(), 'arkzen.json')
    const repoRoot = path.resolve(process.cwd(), '..', '..', '..')

    if (!fs.existsSync(registryPath)) {
      return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
    }

    const rootConfigPath = path.join(repoRoot, 'arkzen.json')
    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
    const activeConfig = fs.existsSync(rootConfigPath) ? JSON.parse(fs.readFileSync(rootConfigPath, 'utf-8')) : registry
    const enriched = enrichHubRegistry({
      ...registry,
      activeStack: activeConfig.activeStack ?? registry.activeStack,
      activeBackend: activeConfig.activeBackend ?? registry.activeBackend,
      activeDatabase: activeConfig.activeDatabase ?? registry.activeDatabase,
    }, repoRoot)
    return NextResponse.json(enriched)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read registry' },
      { status: 500 },
    )
  }
}
