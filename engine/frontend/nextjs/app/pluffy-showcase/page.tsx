'use client'
// ============================================================
// ARKZEN GENERATED PAGE — pluffy-showcase/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:03.376Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AddBlockDialog } from './components/AddBlockDialog'
import { Chip } from './components/Chip'
import { DockHead } from './components/DockHead'
import { EditorView } from './components/EditorView'
import { ExportDialog } from './components/ExportDialog'
import { Frame } from './components/Frame'
import { HomeView } from './components/HomeView'
import { Logo } from './components/Logo'
import { Mark } from './components/Mark'
import { TermExport } from './components/TermExport'
import { TermHero } from './components/TermHero'
import { TermStack } from './components/TermStack'
import { AZ, CLONE_CMD, DOWNLOAD_URL, FONTS_URL, IMG_BASE, RELEASE_URL, REPO_URL } from './components/constants'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { pageVariants, pluffyShowcaseAnimations } from '@/arkzen/generated/pluffy-showcase.animations'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'

// Page component code (from @arkzen:page:index)
const IndexPage = () => {
  const pageRef = useRef<HTMLDivElement>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = FONTS_URL
    document.head.appendChild(link)
    return () => { link.remove() }
  }, [])

  useEffect(() => pluffyShowcaseAnimations(pageRef), [])

  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3800) }
  const copyClone = async (m: string) => {
    try { await navigator.clipboard.writeText(CLONE_CMD); say(m) }
    catch { say('Could not copy. Run: ' + CLONE_CMD) }
  }
  const PLAN = (f: string) => REPO_URL + '/blob/main/' + f

  const REAL: Array<[string | number, Array<[string, string]>]> = [
    [1, [['t', '/* ' + AZ + ':meta']]], [2, [['k', 'name: '], ['v', 'kairo']]], [3, [['k', 'version: '], ['v', '1.0.0']]],
    [4, [['k', 'description: '], ['v', 'Kairo, a 3D circuit board. Wire NAND gates, save the result as a chip, and reuse that chip as a part in bigger circuits.']]],
    [5, [['k', 'auth: '], ['v', 'false']]], [6, [['', '*/']]], ['\u2026', []],
    [15, [['t', '/* ' + AZ + ':database:chips']]], [16, [['k', 'table: '], ['v', 'chips']]], [17, [['k', 'timestamps: '], ['v', 'true']]],
    [18, [['k', 'softDeletes: '], ['v', 'false']]], [19, [['k', 'columns:']]], [20, [['k', '  name:']]], [21, [['k', '    type: '], ['v', 'string']]], [22, [['k', '    length: '], ['v', '60']]],
  ]
  const BLOCKS = [['meta', 1, '#b0642f'], ['meta:web', 8, '#b0642f'], ['database:chips', 15, '#b0642f'], ['api:chips', 48, '#6a4fb0'], ['web:script', 75, '#c2415b'], ['web:style', 1389, '#c2415b'], ['web:components:board', 1507, '#c2415b'], ['web:page:index', 2294, '#c2415b']]
  const platforms = [
    { t: 'Web', n: 'Five stacks', c: [['nextjs', 'Next.js'], ['vite', 'React + Vite'], ['tanstack', 'TanStack Start'], ['astro', 'Astro'], ['inertia', 'React with Inertia']] },
    { t: 'Mobile', n: 'Three stacks', c: [['expo', 'Expo'], ['react', 'React Native'], ['lynx', 'Lynx']] },
    { t: 'Desktop', n: 'Wraps the running web stack', c: [['tauri', 'Tauri'], ['electron', 'Electron']] },
    { t: 'Games', n: 'Generated from game DSLs', c: [['godot', 'Godot 4'], ['unity', 'Unity'], ['unreal', 'Unreal Engine 5']] },
    { t: 'Backend', n: 'Pick one per project', c: [['laravel', 'Laravel'], ['express', 'Express'], ['fastapi', 'FastAPI'], ['spring', 'Spring Boot'], ['dotnet', 'ASP.NET Core'], ['go', 'Go'], ['rust', 'Rust']] },
    { t: 'Database', n: 'One isolated database per tatemono', c: [['sqlite', 'SQLite'], ['postgres', 'PostgreSQL']] },
  ]
  const plans = [
    { t: 'Browser extensions', d: 'A WXT stack that turns a tatemono into a Manifest V3 extension, sharing the same database, API and login as the web app.', f: 'PLUFFY_EXTENSION_PLAN.md', c: [['wxt', 'WXT'], ['react', 'React'], ['vite', 'Vite']] },
    { t: 'More web frameworks', d: 'Pages written in each framework\u2019s own syntax, not translated from React.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['vue', 'Vue'], ['nuxt', 'Nuxt'], ['svelte', 'Svelte'], ['angular', 'Angular'], ['solid', 'Solid'], ['html', 'Plain HTML']] },
    { t: 'Native mobile', d: 'Real Android and iOS projects, generated for export. Not wrappers.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['android', 'Android'], ['kotlin', 'Kotlin'], ['apple', 'iOS'], ['swift', 'Swift']] },
    { t: 'Native desktop', d: 'Compose Desktop for Windows, macOS and Linux, and SwiftUI for macOS.', f: 'PLUFFY_FRONTEND_EXTEND_PLAN.md', c: [['jetpack', 'Compose Desktop'], ['swift', 'SwiftUI']] },
    { t: 'Packages', d: 'Publish libraries, plus SDKs, types, validators and OpenAPI generated from what a tatemono already declares.', f: 'PLUFFY_PACKAGE_PLAN.md', c: [['npm', 'npm'], ['pypi', 'PyPI'], ['rust', 'crates.io'], ['go', 'Go modules'], ['maven', 'Maven Central'], ['nuget', 'NuGet'], ['packagist', 'Packagist']] },
    { t: 'Terminal apps', d: 'Standalone command-line tools and full-screen terminal apps, with no Pluffy runtime inside.', f: 'PLUFFY_TERMINAL_PLAN.md', c: [['ts', 'TypeScript + Ink'], ['python', 'Python + Textual'], ['rust', 'Rust + Ratatui']] },
    { t: 'Operating systems', d: 'Scaffold, build and boot-test kernels, bootloaders, firmware and Linux distributions. You still write the kernel logic.', f: 'PLUFFY_OS_PLAN.md', c: [['rust', 'Rust'], ['linux', 'Linux']] },
  ]
  const scenes = [
    { id: 'a', h: 'Build the file one block at a time.', caps: ['Open Add block from any tatemono.', 'Search the list. Every block has a plain description.', 'Pick crud: a table and its API in one step.', 'Two blocks land in your file, ready to fill in.'] },
    { id: 'b', h: 'Swap the stack. The file stays put.', caps: ['One command switches the web stack.', 'Another switches the backend.', 'Check what is active. core.tsx never changed.'] },
    { id: 'c', h: 'Take it with you when it is done.', caps: ['Export opens from the editor.', 'Tick Docker for web exports.', 'Tick OpenAPI docs for Postman and Swagger.', 'Run writes a standalone project you can take anywhere.'] },
  ]
  const sceneWin = (id: string) => id === 'a'
    ? <Frame active="new" modal={<AddBlockDialog />}><EditorView stat extra /></Frame>
    : id === 'b'
      ? <Frame active="new" dock={<TermStack />}><EditorView stat /></Frame>
      : <Frame active="new" modal={<ExportDialog />} dock={<TermExport />}><EditorView stat /></Frame>

  return (
    <div ref={pageRef} className="pf-root">
      <div className="pf-wrap">
        <header className="pf-head">
          <a className="pf-brand" href="#top"><Mark />Pluffy</a>
          <nav className="pf-nav" aria-label="Main">
            <a className="pf-link" href={REPO_URL} target="_blank" rel="noreferrer">Source on GitHub</a>
            <a className="pf-btn pf-primary" href="#download"><Download />Get Studio</a>
          </nav>
        </header>

        <section className="pf-hero" id="top">
          <h1 className="pf-h1">One file in, a whole building out.</h1>
          <p className="pf-muted">Pluffy turns one core.tsx, called a tatemono, into a database, a backend, web pages, mobile screens and a desktop shell. Studio is where you write it.</p>
          <div className="pf-cta">
            <div className="pf-cta-row">
              <a className="pf-btn pf-primary" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}><Download />Download for Windows</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine">v1.0.6, Windows x64, about 246 MB. Unzip the whole folder and run it.</p>
          </div>
          <div className="pf-stage" id="hero-win">
            <Frame dock={<TermHero />}><HomeView /><EditorView /></Frame>
          </div>
        </section>
      </div>

      <section className="pf-scene" id="scene-r">
        <div className="pf-wrap pf-sc-stick">
          <div className="pf-sc-head">
            <h2 className="pf-h2">Here is a whole app, in one file.</h2>
            <p className="pf-cs">
              <span className="on">This is Kairo, a 3D circuit board. All 2,298 lines live in one core.tsx.</span>
              <span>A database table, an API, the script, styles and the page sit in tagged blocks.</span>
              <span>Save, and the engine builds the site on the right.</span>
            </p>
          </div>
          <div className="pf-rc">
            <div className="pf-card pf-rc-code" aria-label="The opening lines and block list of the Kairo tatemono">
              <div className="pf-rc-bar">tatemonos/kairo/core.tsx, 2,298 lines</div>
              <div>
                {REAL.map((r, i) => (
                  <div className={'pf-rl' + (i > 5 ? ' x' : '')} key={i}><u>{r[0]}</u>{r[1].map((p, j) => <span key={j} className={p[0]}>{p[1]}</span>)}</div>
                ))}
              </div>
              <div className="pf-rc-blocks">
                {BLOCKS.map((b) => <div className="pf-rc-blk" key={String(b[0])}><i style={{ background: String(b[2]) }} /><b>{b[0]}</b><em>{b[1]}</em></div>)}
              </div>
            </div>
            <figure className="pf-card pf-rc-shot">
              <div className="pf-rc-img"><img src={IMG_BASE + 'built-kairo.webp'} alt="The Kairo site, built from that file" /><div className="pf-rc-cover" /></div>
              <figcaption>Kairo, built from the file on the left.</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {scenes.map((s, n) => (
        <React.Fragment key={s.id}>
          <section className="pf-scene" id={'scene-' + s.id}>
            <div className="pf-wrap pf-sc-stick">
              <div className="pf-sc-head">
                <h2 className="pf-h2">{s.h}</h2>
                <p className="pf-cs">{s.caps.map((c, i) => <span key={c} className={i === 0 ? 'on' : ''}>{c}</span>)}</p>
              </div>
              <div className="pf-stage">{sceneWin(s.id)}</div>
            </div>
          </section>

          {n === 0 && (
            <section className="pf-wrap pf-section" id="platforms">
              <div className="pf-sec-head">
                <span className="pf-badge ready">Ready today</span>
                <h2 className="pf-h2">One tatemono, every place it runs.</h2>
                <p className="pf-muted">Pick a stack and the same file runs on it. Some backends are further along than others, and the repo keeps a checklist of the gaps.</p>
              </div>
              <div className="pf-card pf-plat">
                {platforms.map((p) => (
                  <div className="pf-plat-row" key={p.t}>
                    <div><h3>{p.t}</h3><p>{p.n}</p></div>
                    <div className="pf-chips">{p.c.map((c) => <Chip key={c[0] + c[1]} id={c[0]} label={c[1]} />)}</div>
                  </div>
                ))}
              </div>
              <p className="pf-note"><a className="pf-link" href={PLAN('BACKEND_PARITY_CHECKLIST.md')} target="_blank" rel="noreferrer">Read the backend parity checklist<ArrowUpRight /></a></p>
            </section>
          )}
        </React.Fragment>
      ))}

      <section className="pf-wrap pf-section" id="next">
        <div className="pf-next-grid">
          <div className="pf-next-l">
            <span className="pf-badge planned">Planned</span>
            <h2 className="pf-h2">What is coming.</h2>
            <p className="pf-muted">Seven plans are written up in the repo. None of them is built yet, so read this as a map, not a promise.</p>
          </div>
          <div className="pf-next-list">
            {plans.map((p) => (
              <article className="pf-card pf-plan" key={p.t}>
                <h3 className="pf-h3">{p.t}</h3>
                <p>{p.d}</p>
                <div className="pf-plan-foot">
                  <div className="pf-chips">{p.c.map((c) => <Chip key={c[0] + c[1]} id={c[0]} label={c[1]} />)}</div>
                  <a className="pf-link" href={PLAN(p.f)} target="_blank" rel="noreferrer">Read the plan<ArrowUpRight /></a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-built pf-wrap" id="built">
        <div className="pf-built-head">
          <h2 className="pf-h2">Buildings already standing.</h2>
          <a className="pf-btn pf-ghost" href={REPO_URL + '/tree/main/tatemonos'} target="_blank" rel="noreferrer">Browse the 66 tatemonos<ArrowUpRight /></a>
        </div>
        <div className="pf-grid">
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-kotoba.webp'} alt="Kotoba homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kotoba</b><span>A social language-learning app, Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-kairo.webp'} alt="Kairo homepage, built with Pluffy" loading="lazy" /><figcaption><b>Kairo</b><span>Next.js</span></figcaption></figure>
          <figure className="pf-card pf-fig"><img src={IMG_BASE + 'built-rubik.webp'} alt="Rubik Solver, built with Pluffy" loading="lazy" /><figcaption><b>Rubik Solver</b><span>React and Vite</span></figcaption></figure>
        </div>
      </section>

      <section className="pf-wrap" id="download">
        <div className="pf-card pf-get">
          <div>
            <h2 className="pf-h2">Get Pluffy Studio</h2>
            <ol className="pf-get-steps">
              <li><span className="pf-n">1</span><span>Download the zip. It carries the app and a snapshot of the Pluffy engine.</span></li>
              <li><span className="pf-n">2</span><span>Extract the whole folder somewhere permanent. The exe needs the files beside it.</span></li>
              <li><span className="pf-n">3</span><span>Open Pluffy Studio.exe. If Windows warns, choose More info, then Run anyway.</span></li>
            </ol>
            <div className="pf-cta-row" style={{ justifyContent: 'flex-start' }}>
              <a className="pf-btn pf-primary" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}><Download />Download for Windows</a>
              <a className="pf-link" style={{ alignSelf: 'center' }} href={RELEASE_URL} target="_blank" rel="noreferrer">Release v1.0.6 notes<ArrowUpRight /></a>
            </div>
          </div>
          <div>
            <p className="pf-muted" style={{ marginBottom: 12 }}>On Mac or Linux, run it from source:</p>
            <div className="pf-code"><div>{CLONE_CMD}</div><div>cd Pluffy/gui</div><div>npm install</div><div>npm start</div></div>
            <div className="pf-cta-row" style={{ justifyContent: 'flex-start', marginTop: 16 }}>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}><Copy />Copy clone command</button>
            </div>
            <p className="pf-fine" style={{ marginTop: 12 }}>The Windows build is not code signed yet.</p>
          </div>
        </div>
      </section>

      <footer className="pf-wrap pf-foot">
        <span>Pluffy by Mizumi. Logos belong to their owners.</span>
        <nav aria-label="Footer"><a className="pf-link" href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a><a className="pf-link" href={RELEASE_URL} target="_blank" rel="noreferrer">Releases</a><a className="pf-link" href={PLAN('PLUFF_GUIDELINES_v14.md')} target="_blank" rel="noreferrer">Language guide</a></nav>
      </footer>

      <div className={'pf-toast' + (toast ? ' on' : '')} role="status" aria-live="polite">{toast}</div>
    </div>
  )
}

// Wrapper for animation + layout
const ArkzenPage_PluffyShowcase_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // Animations are managed by the page or not defined
  }, [])

  return (
    <GuestLayout>
      <motion.div
        ref={pageRef}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <IndexPage />
      </motion.div>
    </GuestLayout>
  )
}

export default ArkzenPage_PluffyShowcase_Index
