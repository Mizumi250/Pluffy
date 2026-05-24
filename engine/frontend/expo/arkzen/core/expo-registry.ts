// ============================================================
// ARKZEN ENGINE — EXPO REGISTRY v1.0
//
// Expo equivalent of nextjs/arkzen/core/registry.ts.
// Tracks active tatemonos for the Expo stack in expo-registry.json.
//
// Separate from the web arkzen.json so web and native stacks
// can run independently without stepping on each other.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono } from '../types'

const REGISTRY_PATH = path.resolve(process.cwd(), 'expo-registry.json')

interface ExpoRegistryEntry {
  name:        string
  version:     string
  status:      'active' | 'removed'
  filePath:    string
  screens:     string[]
  auth:        boolean
  registered:  string
  lastUpdated: string
}

interface ExpoRegistry {
  engine:  string
  project: string
  modules: ExpoRegistryEntry[]
}

// ─── Read / Write ─────────────────────────────────────────────────────────────

function getRegistry(): ExpoRegistry {
  if (!fs.existsSync(REGISTRY_PATH)) {
    return createEmptyRegistry()
  }
  return JSON.parse(fs.readFileSync(REGISTRY_PATH, 'utf-8')) as ExpoRegistry
}

function writeRegistry(registry: ExpoRegistry): void {
  fs.writeFileSync(REGISTRY_PATH, JSON.stringify(registry, null, 2), 'utf-8')
}

function createEmptyRegistry(): ExpoRegistry {
  const registry: ExpoRegistry = {
    engine:  '1.0.0',
    project: path.basename(process.cwd()),
    modules: [],
  }
  writeRegistry(registry)
  return registry
}

// ─── Update ───────────────────────────────────────────────────────────────────

export function updateExpoRegistry(tatemono: ParsedTatemono): void {
  const registry = getRegistry()
  const now      = new Date().toISOString()

  const existingIndex = registry.modules.findIndex(m => m.name === tatemono.meta.name)

  const entry: ExpoRegistryEntry = {
    name:        tatemono.meta.name,
    version:     tatemono.meta.version,
    status:      'active',
    filePath:    tatemono.filePath,
    screens:     tatemono.pages.map(p => p.name),
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
  console.log(`[Arkzen Expo Registry] ✓ Updated: ${tatemono.meta.name}`)
}

// ─── Remove ───────────────────────────────────────────────────────────────────

export function removeFromExpoRegistry(tatemonoName: string): void {
  const registry = getRegistry()
  registry.modules = registry.modules.filter(m => m.name !== tatemonoName)
  writeRegistry(registry)
  console.log(`[Arkzen Expo Registry] ✓ Removed: ${tatemonoName}`)
}

// ─── Read helpers ─────────────────────────────────────────────────────────────

export function getExpoRegistry(): ExpoRegistry {
  return getRegistry()
}

export function listExpoModules(): ExpoRegistryEntry[] {
  return getRegistry().modules.filter(m => m.status === 'active')
}
