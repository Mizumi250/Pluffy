'use client'
// ============================================================
// ARKZEN GENERATED PAGE — pluffy-showcase/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T03:48:52.438Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Letters } from './components/Letters'
import { Mark } from './components/Mark'
import { Petal } from './components/Petal'
import { CLONE_CMD, DOWNLOAD_URL, FONTS_URL, RELEASE_URL, REPO_URL } from './components/constants'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { pageVariants, pluffyShowcaseAnimations } from '@/arkzen/generated/pluffy-showcase.animations'

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

  useEffect(() => {
    // Fonts shift the layout once, so measure again after they land.
    const cleanup = pluffyShowcaseAnimations(pageRef)
    const late = window.setTimeout(() => ScrollTrigger.refresh(), 900)
    return () => { window.clearTimeout(late); cleanup() }
  }, [])

  const say = (m: string) => { setToast(m); window.setTimeout(() => setToast(''), 3800) }
  const copyClone = async (m: string) => {
    try { await navigator.clipboard.writeText(CLONE_CMD); say(m) }
    catch { say('Could not copy. Run: ' + CLONE_CMD) }
  }
  const IMG = '/tatemonos/pluffy-showcase/assets/images/'

  const stats = [
    { to: 7, t: 'Backends', d: 'Laravel, Express, FastAPI, Spring Boot, ASP.NET, Go and Rust' },
    { to: 3, t: 'Stacks at once', d: 'Web, app and desktop built from the same file' },
    { to: 66, t: 'Tatemonos in the repo', d: 'Cafes, a payroll system, a language app and more' },
    { to: 3, t: 'Game targets', d: 'Godot 4, Unity and Unreal Engine' },
  ]
  const shots = [
    { k: 'studio-home', n: '01', jp: 'ホーム', c: 'Describe an app, or type / for commands.' },
    { k: 'studio-editor', n: '02', jp: 'エディタ', c: 'core.tsx opens with its blocks in a rail.' },
    { k: 'studio-new', n: '03', jp: '新規', c: 'Start from a template: web, crud, auth, native.' },
    { k: 'studio-home-dark', n: '04', jp: '夜', c: 'A dark room for late builds.' },
  ]
  const built = [
    { k: 'built-kairo', n: 'Kairo', s: 'Next.js', jp: '海路' },
    { k: 'built-kotoba', n: 'Kotoba', s: 'Next.js, language app', jp: '言葉' },
    { k: 'built-rubik', n: 'Rubik Solver', s: 'React and Vite', jp: '立方' },
  ]
  const names = ['kairo', 'kotoba', 'cafe-teresita', 'rubik-solver', 'shan-shan', 'ethereane', 'jo-payroll', 'queue-flow', 'dtr-geofencing', 'ollama-studio', 'godot-sky-islands', 'unreal-sky-garden', 'mobile-sdui', 'asset-hub']

  return (
    <div ref={pageRef} className="pf-root">
      <div className="pf-progress" aria-hidden="true" />
      <div className="pf-petals" aria-hidden="true">{[0, 1, 2, 3, 4, 5, 6].map((i) => <Petal key={i} i={i} />)}</div>

      <header className="pf-nav">
        <a className="pf-brand" href="#top"><Mark />Pluffy</a>
        <nav className="pf-links" aria-label="Sections">
          <a href="#story">Story</a><a href="#studio">Studio</a><a href="#built">Built with it</a>
          <a className="pf-btn pf-main pf-sm" href="#download">Download</a>
        </nav>
      </header>

      <section className="pf-hero" id="top">
        <div className="pf-sheet">
          <div className="pf-badge pf-caps"><i className="pf-jp">建</i><span>Pluffy<br />Studio</span></div>
          <div className="pf-vert pf-jp" aria-hidden="true">一つのファイル × 建物</div>
          <div className="pf-ghostkanji" aria-hidden="true">建</div>
          <div className="pf-copy">
            <h1 className="pf-title"><Letters text="ONE FILE" /><br /><Letters text="A BUILDING" /></h1>
            <div className="pf-rule pf-in" />
            <p className="pf-lead pf-in">Pluffy turns a single core.tsx, called a tatemono, into a database, a backend, web pages, mobile screens and a desktop shell. Studio is the quiet place to write it.</p>
            <div className="pf-cta pf-in">
              <a className="pf-btn pf-main" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}>Download Studio v1.0.6</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}>Clone the repo</button>
            </div>
            <p className="pf-fine pf-in">Windows x64, about 246 MB, unzip and run. Not code signed yet.</p>
          </div>
          <div className="pf-panel">
            <img className="pf-hero-img" src={IMG + 'studio-editor.webp'} alt="Pluffy Studio editing the portfolio-test tatemono" />
            <div className="pf-cover" />
          </div>
          <div className="pf-count-side"><span className="pf-caps">01 / 05 &nbsp; scroll</span></div>
        </div>
      </section>

      <section className="pf-story" id="story">
        <div className="pf-stick">
          <div>
            <p className="pf-kick pf-caps">Story / one</p>
            <h2 className="pf-h2">Write the plan once. Watch the floors rise.</h2>
            <ol className="pf-steps">
              <li className="pf-step on"><b>One file</b>A tatemono is a single core.tsx. Tables, API, login, pages and the look all sit in tagged blocks.</li>
              <li className="pf-step"><b>Studio reads it</b>Blocks line up in a side rail. Check lints the file without starting the engine.</li>
              <li className="pf-step"><b>The engine builds</b>Save, and it rebuilds the database, backend, web, mobile and desktop around your file.</li>
            </ol>
          </div>
          <div className="pf-file" aria-label="Sample tatemono blocks and what each one builds">
            <div className="pf-file-top"><i /><i /><i />&nbsp;core.tsx, sample blocks</div>
            {[
              ['@arkzen:database:lessons', 'Database', 'SQLite or PostgreSQL'],
              ['@arkzen:api:lessons', 'API', 'Seven backends to pick from'],
              ['@arkzen:web:page:index', 'Web', 'Next.js, Vite and more'],
              ['@arkzen:native:page:index', 'Mobile', 'Expo, React Native, Lynx'],
              ['@arkzen:desktop:config', 'Desktop', 'Electron or Tauri'],
            ].map((r) => (
              <div className="pf-row" key={r[0]}><code className="pf-tag">{r[0]}</code><span className="pf-bar"><b>{r[1]}</b><i>{r[2]}</i></span></div>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-studio" id="studio">
        <div className="pf-hstick">
          <div className="pf-hhead">
            <p className="pf-kick pf-caps">Story / two</p>
            <h2 className="pf-h2">Studio, in a few quiet rooms.</h2>
          </div>
          <div className="pf-track">
            {shots.map((s) => (
              <figure className="pf-card" key={s.k} style={{ margin: 0 }}>
                <div className="pf-num"><span>{s.n.charAt(0)}<br />{s.n.charAt(1)}</span><small /><em>{s.c}</em></div>
                <div className="pf-shot">
                  <img src={IMG + s.k + '.webp'} alt={'Pluffy Studio screen ' + s.n} loading="lazy" />
                  <div className="pf-vellum"><span className="pf-jp">{s.jp}</span></div>
                </div>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="pf-numbers">
        <p className="pf-kick pf-caps pf-rv">Story / three</p>
        <h2 className="pf-h2 pf-rv">One source, a lot of ground.</h2>
        <div className="pf-stats">
          {stats.map((s) => (
            <div className="pf-stat pf-rv" key={s.t}><strong className="pf-count" data-to={s.to}>0</strong><b>{s.t}</b><span>{s.d}</span></div>
          ))}
        </div>
      </section>

      <section className="pf-built" id="built">
        <p className="pf-kick pf-caps pf-rv">Story / four</p>
        <h2 className="pf-h2 pf-rv">Buildings already standing.</h2>
        <div className="pf-grid">
          {built.map((b) => (
            <article className="pf-rv" key={b.k}>
              <div className="pf-pic"><img src={IMG + b.k + '.webp'} alt={b.n + ' homepage, built with Pluffy'} loading="lazy" /><div className="pf-vellum"><span className="pf-jp">{b.jp}</span></div></div>
              <p className="pf-cap"><b>{b.n}</b>{b.s}</p>
            </article>
          ))}
        </div>
        <div className="pf-marq" aria-hidden="true"><div className="pf-marq-in">{[0, 1].map((r) => <React.Fragment key={r}>{names.map((n) => <span key={r + n}>{n}</span>)}</React.Fragment>)}</div></div>
      </section>

      <section className="pf-get" id="download">
        <div className="pf-get-card">
          <div>
            <p className="pf-kick pf-caps">Take it home</p>
            <h2 className="pf-h2">Pluffy Studio v1.0.6</h2>
            <ol className="pf-get-steps">
              <li>Download the zip. It carries the app and a snapshot of the Pluffy engine.</li>
              <li>Extract the whole folder somewhere permanent, not just the exe.</li>
              <li>Open Pluffy Studio.exe. If Windows warns, choose More info, then Run anyway.</li>
            </ol>
            <div className="pf-cta">
              <a className="pf-btn pf-main" href={DOWNLOAD_URL} onClick={() => { copyClone('Download started. Clone command copied too.') }}>Download for Windows</a>
              <button type="button" className="pf-btn pf-ghost" onClick={() => copyClone('Clone command copied. Paste it in a terminal.')}>Clone the repo</button>
              <a className="pf-btn pf-ghost" href={RELEASE_URL} target="_blank" rel="noreferrer">Release notes</a>
            </div>
            <div className="pf-clone"><span>$ {CLONE_CMD}</span></div>
            <p className="pf-fine" style={{ color: 'var(--r300)', marginTop: 12 }}>On Mac or Linux, clone, then run npm install and npm start inside the gui folder.</p>
          </div>
          <div className="pf-get-img"><img src={IMG + 'studio-home.webp'} alt="Pluffy Studio home screen" loading="lazy" /></div>
        </div>
      </section>

      <footer className="pf-foot">
        <span>Pluffy by Mizumi. One file in, a whole building out.</span>
        <span><a href={REPO_URL} target="_blank" rel="noreferrer">GitHub</a> &nbsp; <a href={RELEASE_URL} target="_blank" rel="noreferrer">Releases</a> &nbsp; <a href={REPO_URL + '/blob/main/PLUFF_GUIDELINES_v14.md'} target="_blank" rel="noreferrer">Language guide</a></span>
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
