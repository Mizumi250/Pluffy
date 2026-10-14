// ============================================================
// ARKZEN GENERATED COMPONENT — Footer
// Source: @arkzen:components (lain098)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-09T14:13:12.797Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { BURST_IMGS } from './constants'
import { SignatureLogo } from './SignatureLogo'

// ─── FOOTER (NO SMALL SIGNATURE, BIG CENTER LOGO WITH MIZUMI) ─

export const Footer = () => (
  <footer className="footer scrapbook-footer">
    <div className="torn-edge" />

    <div className="footer-layout">
      
      <div className="footer-center-col">
        <div className="footer-center-line-vert" />
        <div className="footer-center-collage">
          <img src={BURST_IMGS[0]} alt="collage1" />
          <img src={BURST_IMGS[1]} alt="collage2" />
        </div>
        
        {/* LARGE LAIN LOGO */}
        <SignatureLogo className="footer-center-logo" />
        
        {/* MIZUMI DIRECTLY BELOW THE BIG LOGO */}
        <h3 className="footer-center-brand">MIZUMI</h3>
      </div>

      <div className="footer-side-text right">
        I LOOK IN THE MIRROR, NOW I'M<br />
        JUST A GHOST<br />
        YOU TAKE EVERY PART OF ME<br />
        ALL OF THE THINGS YOU NEED<br />
        THE REST YOU WANT
      </div>
    </div>

    <div className="footer-legal">
      {/* REMOVED THE SMALL SIGNATURE AND "created by mortpoet" */}
      © 2026 Lain098_ · site by mizumi
    </div>
  </footer>
)
