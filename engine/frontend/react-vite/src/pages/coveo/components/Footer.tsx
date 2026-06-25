// ============================================================
// ARKZEN GENERATED COMPONENT — Footer [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.697Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── FOOTER ────────────────────────────────────────────────────

export const Footer = () => (
  <footer className="footer">
    <div className="copyright">
      <div className="copyright-line">
        <div className="copyright-icons">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <g clipPath="url(#clip0)">
              <path d="M8.58121 5.04261H7.51871C7.48841 4.86837 7.43254 4.71402 7.3511 4.57955C7.26966 4.44318 7.16833 4.32765 7.04712 4.23295C6.92591 4.13826 6.78765 4.06723 6.63235 4.01989C6.47894 3.97064 6.31322 3.94602 6.13519 3.94602C5.8189 3.94602 5.5386 4.02557 5.29428 4.18466C5.04996 4.34186 4.85867 4.57292 4.72041 4.87784C4.58216 5.18087 4.51303 5.55114 4.51303 5.98864C4.51303 6.43371 4.58216 6.80871 4.72041 7.11364C4.86057 7.41667 5.05185 7.64583 5.29428 7.80114C5.5386 7.95455 5.81795 8.03125 6.13235 8.03125C6.30659 8.03125 6.46947 8.00852 6.62098 7.96307C6.77439 7.91572 6.9117 7.84659 7.03291 7.75568C7.15602 7.66477 7.25924 7.55303 7.34257 7.42045C7.4278 7.28788 7.48651 7.13636 7.51871 6.96591L8.58121 6.97159C8.54144 7.24811 8.45526 7.50758 8.32269 7.75C8.19201 7.99242 8.0206 8.20644 7.80848 8.39205C7.59636 8.57576 7.34826 8.7197 7.06416 8.82386C6.78007 8.92614 6.46473 8.97727 6.11814 8.97727C5.60678 8.97727 5.15034 8.8589 4.74882 8.62216C4.34731 8.38542 4.03102 8.04356 3.79996 7.59659C3.5689 7.14962 3.45337 6.61364 3.45337 5.98864C3.45337 5.36174 3.56985 4.82576 3.8028 4.38068C4.03576 3.93371 4.35299 3.59186 4.75451 3.35511C5.15602 3.11837 5.61057 3 6.11814 3C6.44201 3 6.74314 3.04545 7.02155 3.13636C7.29996 3.22727 7.54807 3.3608 7.76587 3.53693C7.98367 3.71117 8.16265 3.92519 8.3028 4.17898C8.44485 4.43087 8.53765 4.71875 8.58121 5.04261Z" fill="currentColor" />
              <circle cx="6" cy="6" r="5.5" stroke="currentColor" />
            </g>
            <defs>
              <clipPath id="clip0">
                <rect width="12" height="12" fill="white" />
              </clipPath>
            </defs>
          </svg>
        </div>
        <p>2014-{new Date().getFullYear()} COVEO Music</p>
      </div>
      <p className="muted">All Rights Reserved</p>
      <div className="credits">
        <button className="btn inline modalTrigger" data-target="credits-modal">Credits</button>
        <a className="btn inline" href="mailto:info@coveomusic.com" target="_blank">Licensing Inquires</a>
        <a className="btn inline" href="https://drive.google.com/drive/folders/14-h2xSTu4mPTpzIprRuAOIpcUe44FVSO?usp=sharing" target="_blank">Press Kit</a>
      </div>
    </div>
  </footer>
)

// ─── MODAL (simple credits) ──────────────────────────────────
