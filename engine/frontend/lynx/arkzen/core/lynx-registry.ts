// ============================================================
// ARKZEN ENGINE — LYNX REGISTRY v1.0
//
// Lynx equivalent of expo-registry.ts.
// Tracks active tatemonos for the Lynx stack in lynx-registry.json.
//
// Separate from the web arkzen.json and expo-registry.json so
// web, Expo, and Lynx stacks can run independently.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono } from '../types'

const REGISTRY_PATH = path.resolve(process.cwd(), 'lynx-registry.json')

interface LynxRegistryEntry {
  name:        string
  version:     string
  status:      'active' | 'removed'
  filePath:    string
  pages:       string[]
  auth:        boolean
  registered:  string
  lastUpdated: string
}

interface LynxRegistry {
  engine:  string
  project: string
  modules: LynxRegistryEntry[]
}

// ─── Read / Write ─────────────────────────────────────────────────────────────

function getRegistry(): LynxRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) return createEmptyRegistry()
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8')) as LynxRegistry
}

function writeRegistry(registry: LynxRegistry): void {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8')
}

function createEmptyRegistry(): LynxRegistry {
  const registry: LynxRegistry = {
    engine:  '1.0.0',
    project: path.basename(process.cwd()),
    modules: [],
  }
  writeRegistry(registry)
  return registry
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateLynxRegistry(tatemono: ParsedTatemono): void {
  const registry = getRegistry()
  const now      = new Date().toISOString()

  const existingIndex = registry.modules.findIndex(m => m.name === tatemono.meta.name)

  const entry: LynxRegistryEntry = {
    name:        tatemono.meta.name,
    version:     tatemono.meta.version,
    status:      'active',
    filePath:    tatemono.filePath,
    pages:       (tatemono.nativeLynxPages ?? []).map(p => p.name),
    auth:        tatemono.meta.auth,
    registered:  existingIndex === -1 ? now : registry.modules[existingIndex].registered,
    lastUpdated: now,
  }

  if (existingIndex === -1) {
    registry.modules.push(entry)
  } else {
    registry.modules[existingIndex] = entry
  }

  writeRegistry(registry)
  console.log(`[Arkzen Lynx Registry] ✓ Updated: ${tatemono.meta.name}`)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeFromLynxRegistry(tatemonoName: string): void {
  const registry = getRegistry()
  registry.modules = registry.modules.filter(m => m.name !== tatemonoName)
  writeRegistry(registry)
  console.log(`[Arkzen Lynx Registry] ✓ Removed: ${tatemonoName}`)
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

export function getLynxRegistry(): LynxRegistry {
  return getRegistry()
}

export function listLynxModules(): LynxRegistryEntry[] {
  return getRegistry().modules.filter(m => m.status === 'active')
}