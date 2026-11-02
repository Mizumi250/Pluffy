import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'
import { readHubRegistry } from '../../../../../../shared/arkzen/hub/registry'

export async function GET() {
  try {
    const registryPath = path.join(process.cwd(), 'arkzen.json')
    const repoRoot = path.resolve(process.cwd(), '..', '..', '..')

    if (!fs.existsSync(registryPath)) {
      return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
    }

    const rootConfigPath = path.join(repoRoot, 'arkzen.json')
    const enriched = readHubRegistry(registryPath, repoRoot, rootConfigPath)
    if (!enriched) return NextResponse.json({ error: 'Registry not found' }, { status: 404 })
    return NextResponse.json(enriched)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to read registry' },
      { status: 500 },
    )
  }
}
