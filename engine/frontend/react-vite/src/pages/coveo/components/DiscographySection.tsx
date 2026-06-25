// ============================================================
// ARKZEN GENERATED COMPONENT — DiscographySection [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.697Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { RELEASES } from './constants'
import { releases } from './utils'

// ─── DISCOGRAPHY ──────────────────────────────────────────────

export const DiscographySection = () => {
  // filter out duplicates (since we duplicated for carousel) – use the original list
  const releases = RELEASES

  return (
    <section className="discography">
      <div className="wrapper l">
        <h2 className="discography-headline">Discography <span>The complete works</span></h2>
        <h3 className="discography-sub mono muted">all releases — ordered by newest first</h3>
        <ul className="release-list">
          {releases.map((release, idx) => (
            <li key={release.id} className="release-item">
              <div className="release-container">
                <a href={`/${release.id}`} className="release-link">
                  <div className="release-info">
                    <p className="mono muted index">{String(releases.length - idx).padStart(3, '0')}</p>
                    <div className="release-artwork">
                      <img loading="lazy" src={release.artwork} alt={release.title} />
                    </div>
                    <div className="release-details">
                      <p className="title uppercase">{release.title}</p>
                      <div className="release-meta">
                        <p className="uppercase muted">{release.date}</p>
                        <p className="uppercase muted">{release.type}</p>
                        <p className="uppercase muted">{release.duration}</p>
                      </div>
                    </div>
                  </div>
                </a>
                <div className="release-cta">
                  <button className="btn btn__blurred dark mono preview-trigger">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
                      <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" />
                    </svg>
                    Preview
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

// ─── FOOTER ────────────────────────────────────────────────────
