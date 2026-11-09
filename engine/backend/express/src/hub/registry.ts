import * as fs from 'fs'
import * as path from 'path'

type RegistryModule = {
  name?: string
  version?: string
  status?: string
  filePath?: string
  pages?: string[]
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
const APP_FRONTENDS = ['Expo', 'React Native']
const DESKTOP_FRONTENDS = ['Tauri', 'Electron']
const BACKEND_LABELS: Record<string, string> = {
  laravel: 'Laravel',
  'laravel-inertia': 'Laravel',
  express: 'Express',
  fastapi: 'FastAPI / Django',
  django: 'FastAPI / Django',
  'spring-boot': 'Spring Boot',
  aspnet: 'ASP.NET',
  go: 'Go',
  rust: 'Rust',
}

const CODE_MARKERS = 'endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications'
const BACKEND_VARIANTS: Record<string, string> = {
  php: 'Laravel',
  ts: 'Express',
  py: 'FastAPI / Django',
  java: 'Spring Boot',
  cs: 'ASP.NET',
  go: 'Go',
  rs: 'Rust',
}

function parseMeta(source: string): { name: string; version: string; auth: boolean; backend?: string } | null {
  const block = source.match(/\/\* @arkzen:meta\b([\s\S]*?)\*\//)?.[1]
  if (!block) return null
  const field = (name: string) => {
    const match = block.match(new RegExp(`^\\s*${name}:\\s*(?:"([^"]*)"|'([^']*)'|([^\\s#]+))`, 'm'))
    return match?.[1] ?? match?.[2] ?? match?.[3]
  }
  const name = field('name')
  if (!name) return null
  return {
    name,
    version: field('version') ?? '1.0.0',
    auth: /^true$/i.test(field('auth') ?? 'false'),
    backend: field('backend'),
  }
}

function pageNames(source: string): string[] {
  const names = new Set<string>()
  const pattern = /\/\* @arkzen:(?:web|native):page:(?!layout:)([a-zA-Z0-9_-]+)/g
  for (const match of source.matchAll(pattern)) {
    if (match[1] !== 'end' && match[1] !== 'layout') names.add(match[1])
  }
  return [...names]
}

function sourceModules(repoRoot: string): RegistryModule[] {
  const directory = path.join(repoRoot, 'tatemonos')
  if (!fs.existsSync(directory)) return []

  const modules: RegistryModule[] = []
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const filePath = path.join(directory, entry.name, 'core.tsx')
    if (!fs.existsSync(filePath)) continue
    const source = fs.readFileSync(filePath, 'utf8')
    const meta = parseMeta(source)
    if (!meta) continue
    const relativePath = path.relative(repoRoot, filePath).replace(/\\/g, '/')
    const stat = fs.statSync(filePath)
    modules.push({
      name: meta.name,
      version: meta.version,
      status: 'active',
      filePath: relativePath,
      pages: pageNames(source),
      registered: stat.birthtime.toISOString(),
      lastUpdated: stat.mtime.toISOString(),
      auth: meta.auth,
    })
  }
  return modules
}

function addBackendVariants(source: string, variants: Set<string>): void {
  const pattern = new RegExp(`^/\\* @arkzen:(${CODE_MARKERS}):(?:(php|ts|py|java|cs|go|rs):)?([a-zA-Z0-9_-]+)(?:\\s+\\*/)?\\s*$`, 'gm')
  for (const match of source.matchAll(pattern)) {
    const [, marker, variant, name] = match
    const close = variant
      ? `/* @arkzen:${marker}:${variant}:${name}:end */`
      : `/* @arkzen:${marker}:${name}:end */`
    const start = match.index ?? 0
    const inlineClose = match[0].indexOf('*/')
    const openingEnd = inlineClose >= 0
      ? start + inlineClose
      : source.indexOf('*/', start + match[0].length)
    const closingStart = openingEnd === -1 ? -1 : source.indexOf(close, openingEnd + 2)
    if (openingEnd === -1 || closingStart === -1) continue
    if (!source.slice(openingEnd + 2, closingStart).trim()) continue
    variants.add(variant ?? 'php')
  }
}

function moduleBackends(source: string, activeBackend: string): string[] {
  const variants = new Set<string>()
  addBackendVariants(source, variants)
  const backendTarget = parseMeta(source)?.backend
  const targetLabel = backendTarget ? BACKEND_LABELS[backendTarget] : undefined
  const variantLabels = [...variants].map(variant => BACKEND_VARIANTS[variant]).filter((label): label is string => Boolean(label))
  if (targetLabel) return [...new Set([...variantLabels, targetLabel])]
  const hasBackend = /auth:\s*true|@arkzen:(?:api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)/.test(source)
  if (!variants.size && hasBackend) return [BACKEND_LABELS[activeBackend] ?? 'Laravel']
  return variantLabels
}

export function enrichHubRegistry(registry: HubRegistry, repoRoot: string): HubRegistry {
  const activeStack = registry.activeStack ?? 'nextjs'
  const activeBackend = activeStack === 'react-inertia'
    ? 'laravel-inertia'
    : registry.activeBackend ?? 'laravel'
  const modulesByName = new Map<string, RegistryModule>()
  for (const module of [...sourceModules(repoRoot), ...(registry.modules ?? [])]) {
    if (!module.name) continue
    modulesByName.set(module.name, { ...modulesByName.get(module.name), ...module })
  }
  return {
    ...registry,
    activeStack,
    activeBackend,
    activeDatabase: registry.activeDatabase ?? 'sqlite',
    modules: [...modulesByName.values()].map(module => {
      const sourcePath = path.resolve(repoRoot, module.filePath ?? '')
      if (!module.filePath || !fs.existsSync(sourcePath)) return { ...module, frontend: [], backend: [] }

      const source = fs.readFileSync(sourcePath, 'utf8')
      const backend = moduleBackends(source, activeBackend)
      const hasWeb = /@arkzen:(?:web:|meta:web\b)/.test(source)
      const hasApp = /\/\* @arkzen:native:page:(?!lynx:)[a-zA-Z0-9_-]+/.test(source)
      const hasLynx = /\/\* @arkzen:native:page:lynx:[a-zA-Z0-9_-]+/.test(source)
      const hasDesktop = hasWeb || /@arkzen:desktop:|desktopConfig|@arkzen:meta:desktop/.test(source)

      return {
        ...module,
        frontend: [
          ...(hasWeb ? WEB_FRONTENDS : []),
          ...(hasApp ? APP_FRONTENDS : []),
          ...(hasLynx ? ['Lynx'] : []),
          ...(hasDesktop ? DESKTOP_FRONTENDS : []),
        ],
        pages: module.pages?.length ? module.pages : pageNames(source),
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
