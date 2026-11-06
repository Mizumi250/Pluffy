#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url))
const SHOTS_DIR = path.join(ROOT_DIR, 'Shots')
const ARKZEN_PATH = path.join(ROOT_DIR, 'arkzen.json')
const TATEMONOS_DIR = path.join(ROOT_DIR, 'tatemonos')

function discoverTatemonos(config) {
  if (!fs.existsSync(TATEMONOS_DIR)) return []
  const registry = new Map((config.modules ?? []).map(module => [module.name, module]))
  return fs.readdirSync(TATEMONOS_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .filter(entry => fs.existsSync(path.join(TATEMONOS_DIR, entry.name, 'core.tsx')))
    .map(entry => {
      const name = entry.name
      const registered = registry.get(name)
      let generatedPages = []
      if (config.activeStack === 'nextjs') {
        const routeRoot = path.join(ROOT_DIR, 'engine', 'frontend', 'nextjs', 'app', name)
        if (fs.existsSync(path.join(routeRoot, 'page.tsx')) || fs.existsSync(path.join(routeRoot, 'page.js'))) generatedPages.push('index')
        if (fs.existsSync(routeRoot)) {
          generatedPages.push(...fs.readdirSync(routeRoot, { withFileTypes: true })
            .filter(route => route.isDirectory())
            .filter(route => fs.existsSync(path.join(routeRoot, route.name, 'page.tsx')) || fs.existsSync(path.join(routeRoot, route.name, 'page.js')))
            .map(route => route.name))
        }
      }
      return {
        name,
        pages: registered?.pages ?? (generatedPages.length > 0 ? [...new Set(generatedPages)] : ['index']),
        auth: registered?.auth ?? false,
      }
    })
    .sort((a, b) => a.name.localeCompare(b.name))
}

function findChrome() {
  const candidates = process.platform === 'win32'
    ? [
        process.env.CHROME_PATH,
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        `${process.env.LOCALAPPDATA || ''}\\Google\\Chrome\\Application\\chrome.exe`,
        `${process.env.PROGRAMFILES || ''}\\Chromium\\Application\\chrome.exe`,
      ]
    : [
        process.env.CHROME_PATH,
        '/usr/bin/google-chrome',
        '/usr/bin/chromium',
        '/usr/bin/chromium-browser',
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      ]
  return candidates.filter(Boolean).find(candidate => fs.existsSync(candidate)) ?? null
}

async function waitForUrl(url, timeoutMs = 90000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { redirect: 'manual' })
      if (response.status < 500) return true
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

async function waitForBackend(timeoutMs = 300000) {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    try {
      const response = await fetch('http://localhost:8000/arkzen/health', { redirect: 'manual' })
      if (response.ok) {
        const body = await response.json()
        if (body.status === 'ok') return true
      }
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  return false
}

function safeName(value) {
  return String(value).replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-|-$/g, '') || 'page'
}

function pageUrl(baseUrl, moduleName, page) {
  if (page === 'index') return `${baseUrl}/${moduleName}`
  return `${baseUrl}/${moduleName}/${page}`
}

async function captureWithChromium({ config, baseUrl, category, stack, modules, viewport, fakeAuth, settleMs }) {
  let puppeteer
  try {
    puppeteer = await import('puppeteer-core')
  } catch {
    return { success: false, reason: 'puppeteer-core is not installed', captures: [] }
  }

  const executablePath = findChrome()
  if (!executablePath) {
    return { success: false, reason: 'Google Chrome or Chromium executable not found', captures: [] }
  }
  if (!await waitForUrl(baseUrl)) {
    return { success: false, reason: `URL did not become ready: ${baseUrl}`, captures: [] }
  }

  const browser = await puppeteer.default.launch({
    executablePath,
    headless: true,
    defaultViewport: viewport,
    args: ['--no-sandbox', '--disable-dev-shm-usage'],
  })
  const captures = []
  try {
    for (const module of modules) {
      for (const page of module.pages ?? []) {
        const pagePath = pageUrl(baseUrl, module.name, page)
        const targetDir = path.join(SHOTS_DIR, category, safeName(stack), safeName(module.name))
        fs.mkdirSync(targetDir, { recursive: true })
        const filePath = path.join(targetDir, `${safeName(page)}.png`)
        const browserPage = await browser.newPage()
        await browserPage.setViewport(viewport)

        if (fakeAuth) {
          const authKey = `arkzen-auth-${module.name}`
          await browserPage.setCookie({
            name: `arkzen-auth-${module.name}`,
            value: 'pluff-screenshot-token',
            url: baseUrl,
            path: '/',
          })
          await browserPage.evaluateOnNewDocument((key) => {
            window.__ARKZEN_TATEMONO__ = key.replace(/^arkzen-auth-/, '')
            localStorage.setItem(key, JSON.stringify({
              state: {
                token: 'pluff-screenshot-token',
                user: { id: 1, name: 'Screenshot User', email: 'screenshot@example.com' },
                isAuthenticated: true,
              },
              version: 0,
            }))
          }, authKey)
        }

        await browserPage.setRequestInterception(true)
        browserPage.on('request', request => {
          const url = request.url()
          if (fakeAuth && /\/auth\/me(?:\?|$)/.test(url)) {
            request.respond({
              status: 200,
              contentType: 'application/json',
              body: JSON.stringify({
                user: { id: 1, name: 'Screenshot User', email: 'screenshot@example.com' },
              }),
            })
          } else {
            request.continue().catch(() => {})
          }
        })

        try {
          await browserPage.goto(pagePath, { waitUntil: 'networkidle2', timeout: 90000 })
          await browserPage.waitForFunction(() => document.readyState === 'complete', { timeout: 15000 }).catch(() => {})

          await browserPage.waitForFunction(() => {
            const bodyText = document.body?.innerText?.trim() ?? ''
            const busy = document.querySelector('[aria-busy="true"], [aria-live="polite"][aria-busy="true"]')
            const loading = document.querySelector([
              '.animate-spin',
              '[role="progressbar"]',
              '[class*="spinner"]',
              '[class*="skeleton"]',
            ].join(','))
            return bodyText.length > 20 && !busy && !loading
          }, { timeout: Math.min(settleMs, 15000) }).catch(() => {})

          await new Promise(resolve => setTimeout(resolve, settleMs))
          await browserPage.screenshot({ path: filePath, fullPage: true })
          captures.push({ module: module.name, page, path: path.relative(ROOT_DIR, filePath), url: browserPage.url(), settleMs })
        } catch (error) {
          captures.push({ module: module.name, page, path: null, url: pagePath, error: error.message })
        } finally {
          await browserPage.close()
        }
      }
    }
  } finally {
    await browser.close()
  }
  return { success: true, captures }
}

async function run() {
  const config = JSON.parse(fs.readFileSync(ARKZEN_PATH, 'utf8'))
  const moduleArg = process.argv.slice(2).find(argument => argument.startsWith('--module='))
  const selectedModule = moduleArg?.slice('--module='.length).trim()
  const waitArg = process.argv.slice(2).find(argument => argument.startsWith('--wait='))
  const waitMsArg = process.argv.slice(2).find(argument => argument.startsWith('--wait-ms='))
  const parsedWaitMs = Number(waitMsArg?.slice('--wait-ms='.length) ?? waitArg?.slice('--wait='.length) ?? 8000)
  const settleMs = Number.isFinite(parsedWaitMs)
    ? Math.max(0, Math.min(Math.trunc(parsedWaitMs), 30000))
    : 8000
  const modules = discoverTatemonos(config)
    .filter(module => !selectedModule || module.name === selectedModule)

  if (!selectedModule) {
    throw new Error('Select a Tatemono with --module=<name>. Automatic and bulk screenshot capture is disabled.')
  }
  if (modules.length === 0) {
    throw new Error(`Tatemono not found or missing core.tsx in tatemonos/: ${selectedModule}`)
  }

  const backendReady = await waitForBackend(300000)
  const webBaseUrl = config.activeStack === 'react-inertia' ? 'http://localhost:5173' : 'http://localhost:3000'
  const webReady = backendReady && await waitForUrl(webBaseUrl, 300000)

  const report = {
    generatedAt: new Date().toISOString(),
    backendReady,
    webReady,
    selectedModule,
    settleMs,
    ...(!backendReady ? { backendError: 'Backend did not become ready at http://localhost:8000/arkzen/health' } : {}),
    ...(!webReady ? { frontendError: `Frontend did not become ready: ${webBaseUrl}` } : {}),
    webStack: config.activeStack,
    appStack: config.activeAppStack,
    desktopStack: config.activeDesktopStack,
    results: {},
  }

  if (backendReady && webReady) {
    const selectedWebDir = path.join(SHOTS_DIR, 'web', safeName(config.activeStack ?? 'web'), safeName(selectedModule))
    fs.rmSync(selectedWebDir, { recursive: true, force: true })
    fs.mkdirSync(SHOTS_DIR, { recursive: true })
    report.results.web = await captureWithChromium({
      config,
      baseUrl: webBaseUrl,
      category: 'web',
      stack: config.activeStack ?? 'web',
      modules,
      viewport: { width: 1440, height: 900 },
      fakeAuth: true,
      settleMs,
    })
  }

  fs.mkdirSync(SHOTS_DIR, { recursive: true })
  fs.writeFileSync(path.join(SHOTS_DIR, 'shots.json'), JSON.stringify(report, null, 2))
  console.log(JSON.stringify(report, null, 2))
}

run().catch(error => {
  fs.mkdirSync(SHOTS_DIR, { recursive: true })
  fs.writeFileSync(path.join(SHOTS_DIR, 'shots.json'), JSON.stringify({
    generatedAt: new Date().toISOString(),
    error: error.message,
    results: {},
  }, null, 2))
  console.error(`[Screenshots] ${error.message}`)
  process.exit(1)
})
