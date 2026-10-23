import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PROJECT_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
  '..'
)

const DEFAULT_WINDOW = {
  width: 1280,
  height: 800,
  minWidth: 800,
  minHeight: 600,
  resizable: true,
  fullscreenable: true,
  title: 'Pluff',
}

export function resolveDesktopWindowOptions(modules = [], warn = console.warn) {
  const configuredModules = modules
    .filter(module => module.status === 'active' && module.desktopConfig?.window)
    .sort((a, b) => a.name.localeCompare(b.name, 'en'))

  const windowConfig = {}
  const conflicts = new Set()
  for (const module of configuredModules) {
    for (const [key, value] of Object.entries(module.desktopConfig.window)) {
      if (windowConfig[key] === undefined) {
        windowConfig[key] = value
      } else if (windowConfig[key] !== value) {
        conflicts.add(module.name)
      }
    }
  }

  if (conflicts.size) {
    warn(
      `[Electron] Conflicting desktop window settings; alphabetically earlier settings take precedence. ` +
      `Conflicting Tatemonos: ${[...conflicts].join(', ')}`
    )
  }

  return {
    ...DEFAULT_WINDOW,
    ...(windowConfig.width !== undefined ? { width: windowConfig.width } : {}),
    ...(windowConfig.height !== undefined ? { height: windowConfig.height } : {}),
    ...(windowConfig.min_width !== undefined ? { minWidth: windowConfig.min_width } : {}),
    ...(windowConfig.min_height !== undefined ? { minHeight: windowConfig.min_height } : {}),
    ...(windowConfig.resizable !== undefined ? { resizable: windowConfig.resizable } : {}),
    ...(windowConfig.fullscreenable !== undefined ? { fullscreenable: windowConfig.fullscreenable } : {}),
    ...(windowConfig.title !== undefined ? { title: windowConfig.title } : {}),
  }
}

export function loadDesktopWindowOptions(registryPath = path.join(PROJECT_ROOT, 'arkzen.json')) {
  if (!fs.existsSync(registryPath)) return resolveDesktopWindowOptions()

  let registry
  try {
    registry = JSON.parse(fs.readFileSync(registryPath, 'utf8').replace(/^\uFEFF/, ''))
  } catch (error) {
    throw new Error(
      `Could not read desktop settings from ${registryPath}: ` +
      `${error instanceof Error ? error.message : String(error)}`
    )
  }

  if (!Array.isArray(registry.modules)) {
    throw new Error(`Invalid Arkzen registry at ${registryPath}: "modules" must be an array`)
  }

  return resolveDesktopWindowOptions(registry.modules)
}
