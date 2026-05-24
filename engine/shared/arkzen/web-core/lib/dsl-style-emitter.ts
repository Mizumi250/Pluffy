// ============================================================
// ARKZEN ENGINE — SHARED DSL STYLE EMITTER
// Emits style artifacts from parsed tatemono style blocks:
//   - @arkzen:style            -> styles/global.css
//   - @arkzen:style:Component  -> styles/Component.module.css
// Shared across stack routers so style DSL stays parity-consistent.
// ============================================================

import * as fs from 'fs'
import * as path from 'path'

interface StyleBlock {
  name?: string
  raw: string
}

interface StyleSource {
  styles: StyleBlock[]
}

export interface EmitTatemonoStylesResult {
  hasGlobalStyle: boolean
  namedStyles: string[]
}

interface EmitStyleOptions {
  loggerLabel?: string
}

export function emitTatemonoStyles(
  tatemono: StyleSource,
  tatemonoDir: string,
  options: EmitStyleOptions = {},
): EmitTatemonoStylesResult {
  const label = options.loggerLabel ?? 'Arkzen Style'
  const styleBlocks = tatemono.styles ?? []
  const stylesDir = path.join(tatemonoDir, 'styles')
  const globalCssPath = path.join(stylesDir, 'global.css')

  const globalStyles = styleBlocks.filter(s => !s.name)
  const namedStyles = styleBlocks.filter(s => s.name)
  const hasGlobalStyle = globalStyles.length > 0
  const namedStyleNames = namedStyles.map(s => s.name as string)

  if (styleBlocks.length === 0) {
    if (fs.existsSync(globalCssPath)) fs.unlinkSync(globalCssPath)
    cleanupStaleModules(stylesDir, new Set())
    return { hasGlobalStyle: false, namedStyles: [] }
  }

  fs.mkdirSync(stylesDir, { recursive: true })

  if (hasGlobalStyle) {
    const mergedGlobal = globalStyles.map(s => s.raw.trim()).filter(Boolean).join('\n\n')
    fs.writeFileSync(globalCssPath, mergedGlobal + '\n', 'utf-8')
    console.log(`[${label}] ✓ Global style: styles/global.css`)
  } else if (fs.existsSync(globalCssPath)) {
    fs.unlinkSync(globalCssPath)
  }

  const activeModuleFiles = new Set<string>()
  for (const style of namedStyles) {
    const styleName = style.name as string
    const fileName = `${styleName}.module.css`
    const filePath = path.join(stylesDir, fileName)
    fs.writeFileSync(filePath, style.raw.trim() + '\n', 'utf-8')
    activeModuleFiles.add(fileName)
    console.log(`[${label}] ✓ Style module: styles/${fileName}`)
  }

  cleanupStaleModules(stylesDir, activeModuleFiles)

  return { hasGlobalStyle, namedStyles: namedStyleNames }
}

function cleanupStaleModules(stylesDir: string, activeModuleFiles: Set<string>): void {
  if (!fs.existsSync(stylesDir)) return

  const files = fs.readdirSync(stylesDir)
  for (const file of files) {
    if (!file.endsWith('.module.css')) continue
    if (activeModuleFiles.has(file)) continue
    fs.unlinkSync(path.join(stylesDir, file))
  }
}
