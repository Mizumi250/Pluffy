// ============================================================
// ARKZEN GENERATED COMPONENT — AboutSection [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.697Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// ─── ABOUT SECTION ────────────────────────────────────────────

export const AboutSection = () => (
  <section className="about">
    <div className="wrapper l">
      <div className="imageFloat right">
        <img
          loading="lazy"
          src="/assets/img/about-scanning.jpg"
          className="about-img"
          alt="Scanning"
        />
        <canvas
          className="image-sequence float1"
          data-size="300"
          data-src="/assets/img/polaroid.webp"
        />
      </div>
      <div className="imageFloat left">
        <img
          loading="lazy"
          src="/assets/img/about-studio.jpg"
          className="about-img"
          alt="Studio"
        />
        <canvas
          className="image-sequence float2"
          data-size="300"
          data-src="/assets/img/yamaha.webp"
        />
      </div>
      <div className="content">
        <h3>The art of Sonic and Visual <span>Storytelling</span></h3>
        <p>
          Since childhood, I've been captivated by music. I grew up with an upright grand piano in my parents' living room
          and I would spend hours improvising melodies and scores, drawn to its rich, warm sound. Though I learnt the
          basics of music theory, I preferred creating my own music or playing my favourite songs by ear. Over the years,
          I explored different instruments, including the trumpet in my high school band, but I always returned to the
          piano as my creative anchor.
        </p>
        <p>
          My interest in technology quickly grew alongside my love for music, and I started experimenting with web
          development and graphic design. Eventually, I discovered electronic music which led to creating my own songs in
          GarageBand, blending my passion for technology and music.
        </p>
        <p>
          As my skills developed, I created COVEO, a project that united my music and visual design. Each release is
          intended to capture a feeling or story, with instrumental tracks that evoke an emotional narrative. My songs
          often swell into euphoric climaxes before settling into bittersweet, stripped-back outros—a signature part of my
          sound.
        </p>
        <p>
          Behind each song is a meticulous artwork process. I craft visuals from my photography, photo collages, 3D
          design, or whichever medium brings the vision to life. The process is detailed and intuitive, allowing me to
          connect the sonic and visual story that resonates both emotionally and aesthetically.
        </p>
      </div>
    </div>
  </section>
)

// ─── DISCOGRAPHY ──────────────────────────────────────────────
