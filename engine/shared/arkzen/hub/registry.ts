import * as fs from 'fs'
import * as path from 'path'

type RegistryModule = {
  filePath?: string
  frontend?: string[]
  backend?: string[]
  [key: string]: unknown
}

type HubRegistry = {
  engine?: string
  project?: string
  modules?: RegistryModule[]
  activeStack?: string
  activeBackend?: string
  activeDatabase?: string
  [key: string]: unknown
}

const WEB_FRONTENDS = ['Next.js', 'React + Vite', 'React + Inertia', 'Astro', 'TanStack Start']
const APP_FRONTENDS = ['Expo', 'React Native', 'Lynx']
const DESKTOP_FRONTENDS = ['Tauri', 'Electron']

export function enrichHubRegistry(registry: HubRegistry, repoRoot: string): HubRegistry {
  const activeStack = registry.activeStack ?? 'nextjs'
  return {
    ...registry,
    activeStack,
    activeBackend: activeStack === 'react-inertia'
      ? 'laravel-inertia'
      : registry.activeBackend ?? 'laravel',
    activeDatabase: registry.activeDatabase ?? 'sqlite',
    modules: (registry.modules ?? []).map(module => {
      const sourcePath = path.resolve(repoRoot, module.filePath ?? '')
      if (!module.filePath || !fs.existsSync(sourcePath)) return { ...module, frontend: [], backend: [] }

      const source = fs.readFileSync(sourcePath, 'utf8')
      const hasBackend = /auth:\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)/.test(source)
      const hasBackendVariant = /@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):(?:php|ts|py|java|cs)\b/.test(source)
      const hasLaravelVariant = /@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):php\b/.test(source)
      const backend = [
        ...(hasBackend && (hasLaravelVariant || !hasBackendVariant) ? ['Laravel'] : []),
        ...(/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):ts\b/.test(source) ? ['Express'] : []),
        ...(/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):py\b/.test(source) ? ['FastAPI / Django'] : []),
        ...(/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):java\b/.test(source) ? ['Spring Boot'] : []),
        ...(/@arkzen:(?:endpoint|handler|middleware|policy|listener|job|console|mail|notification):cs\b/.test(source) ? ['ASP.NET'] : []),
        ...(hasBackend && !hasBackendVariant ? ['Laravel'] : []),
      ]
      const hasWeb = /@arkzen:(?:web:|meta:web\b)/.test(source)
      const hasApp = /@arkzen:(?:native:|meta:native\b)/.test(source)
      const hasDesktop = hasWeb || /@arkzen:desktop:|desktopConfig|@arkzen:meta:desktop/.test(source)

      return {
        ...module,
        frontend: [
          ...(hasWeb ? WEB_FRONTENDS : []),
          ...(hasApp ? APP_FRONTENDS : []),
          ...(hasDesktop ? DESKTOP_FRONTENDS : []),
        ],
        backend: [...new Set(backend)],
      }
    }),
  }
}

export function readHubRegistry(
  registryPath: string,
  rootDir = path.dirname(registryPath),
  activeConfigPath = registryPath,
): HubRegistry | null {
  if (!fs.existsSync(registryPath)) return null
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8')) as HubRegistry
  const activeConfig = fs.existsSync(activeConfigPath)
    ? JSON.parse(fs.readFileSync(activeConfigPath, 'utf8')) as HubRegistry
    : registry
  return enrichHubRegistry({
    ...registry,
    activeStack: activeConfig.activeStack ?? registry.activeStack,
    activeBackend: activeConfig.activeBackend ?? registry.activeBackend,
    activeDatabase: activeConfig.activeDatabase ?? registry.activeDatabase,
  }, rootDir)
}
