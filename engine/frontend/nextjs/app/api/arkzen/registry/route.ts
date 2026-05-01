import { NextResponse } from 'next/server'
import * as fs from 'fs'
import * as path from 'path'

export async function GET() {
  try {
    // Read from the engine's frontend arkzen.json
    const registryPath = path.join(process.cwd(), 'arkzen.json')

    if (!fs.existsSync(registryPath)) {
      return NextResponse.json({
        engine: '1.0.0',
        project: 'arkzen',
        modules: [],
      })
    }

    const registry = JSON.parse(fs.readFileSync(registryPath, 'utf-8'))
    return NextResponse.json(registry)
  } catch {
    return NextResponse.json({ engine: '1.0.0', project: 'arkzen', modules: [] })
  }
}
