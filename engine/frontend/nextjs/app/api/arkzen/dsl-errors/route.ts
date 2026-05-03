// engine/frontend/nextjs/app/api/arkzen/dsl-errors/route.ts
// Serves current DSL error payloads from /public/arkzen-errors/*.json
// Called by ArkzenDslErrorOverlay every 2 seconds in development

import { NextResponse } from 'next/server'
import * as fs   from 'fs'
import * as path from 'path'

export async function GET() {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json([])
  }

  try {
    const errorDir = path.resolve(process.cwd(), 'public/arkzen-errors')

    if (!fs.existsSync(errorDir)) {
      return NextResponse.json([])
    }

    const files = fs.readdirSync(errorDir).filter(f => f.endsWith('.json'))

    const payloads = files
      .map(file => {
        try {
          const raw = fs.readFileSync(path.join(errorDir, file), 'utf-8')
          return JSON.parse(raw)
        } catch {
          return null
        }
      })
      .filter(Boolean)

    return NextResponse.json(payloads)
  } catch {
    return NextResponse.json([])
  }
}