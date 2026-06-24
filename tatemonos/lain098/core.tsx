/* @arkzen:meta
name: lain098
label: Lain098 Art Portfolio
description: Digital art portfolio and commissions site for Lain098_
stack: next
type: page
*/

/* @arkzen:meta:web
title: Lain098_ — Digital Artist
description: Hello I'm Lain, a digital artist whose work focuses on anime style illustrations, fanart, OCs, chibi, and short animations.
ogImage: /lain098/og.jpg
theme: #87CEEB
*/

/* @arkzen:import
import { useEffect, useRef, useState, useCallback } from "react";
*/

/* @arkzen:style
:root {
  --sky-50: #f0f9ff;
  --sky-100: #e0f2fe;
  --sky-200: #bae6fd;
  --sky-300: #87CEEB;
  --sky-400: #60b8e0;
  --sky-500: #3BA3CE;
  --sky-600: #2d8ab5;
  --cream: #fdfcfb;
  --soft-white: #f8fbff;
  --mist: rgba(135, 206, 235, 0.12);
  --mist-deep: rgba(135, 206, 235, 0.28);
  --ink: #1a2332;
  --ink-soft: #2e3d52;
  --ink-muted: #5a7080;
  --petal: #fce4ec;
  --lavender: #e8eaf6;
  --mint: #e0f7f4;
  --gold: #f5d98e;

  --font-display: 'Playfair Display', Georgia, serif;
  --font-body: 'Inter', system-ui, sans-serif;
  --font-script: 'Dancing Script', cursive;
  --font-mono: 'JetBrains Mono', monospace;

  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-quart: cubic-bezier(0.76, 0, 0.24, 1);
}

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

html { scroll-behavior: smooth; overflow-x: hidden; }

body {
  background: var(--soft-white);
  color: var(--ink);
  font-family: var(--font-body);
  overflow-x: hidden;
  cursor: none;
}

/* ─── CUSTOM CURSOR ─── */
.cursor {
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: multiply;
}
.cursor__dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--sky-400);
  position: absolute;
  transform: translate(-50%,-50%);
  transition: transform 0.08s var(--ease-out-expo), width 0.2s, height 0.2s;
}
.cursor__ring {
  width: 36px; height: 36px;
  border-radius: 50%;
  border: 1.5px solid var(--sky-400);
  position: absolute;
  transform: translate(-50%,-50%);
  transition: transform 0.18s var(--ease-out-expo), width 0.3s, height 0.3s, border-color 0.2s;
  opacity: 0.6;
}
.cursor.hover .cursor__dot { width: 16px; height: 16px; background: var(--sky-500); }
.cursor.hover .cursor__ring { width: 52px; height: 52px; border-color: var(--sky-500); opacity: 1; }

/* ─── LOADING SCREEN ─── */
.loading {
  position: fixed; inset: 0;
  background: var(--sky-300);
  z-index: 8000;
  display: flex; align-items: center; justify-content: center;
  flex-direction: column;
  transition: opacity 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo);
}
.loading.done { opacity: 0; transform: translateY(-100%); pointer-events: none; }
.loading__name {
  font-family: var(--font-display);
  font-size: clamp(2rem, 6vw, 4rem);
  color: white;
  letter-spacing: 0.1em;
  opacity: 0;
  animation: loadFadeUp 0.8s 0.3s var(--ease-out-expo) forwards;
}
.loading__sub {
  font-family: var(--font-script);
  font-size: 1.2rem;
  color: rgba(255,255,255,0.8);
  margin-top: 0.5rem;
  opacity: 0;
  animation: loadFadeUp 0.8s 0.6s var(--ease-out-expo) forwards;
}
.loading__bar-wrap {
  width: 160px; height: 2px;
  background: rgba(255,255,255,0.3);
  border-radius: 2px;
  margin-top: 2rem;
  overflow: hidden;
}
.loading__bar {
  height: 100%;
  background: white;
  border-radius: 2px;
  animation: loadBar 1.8s var(--ease-out-expo) forwards;
}
@keyframes loadBar { from { width: 0 } to { width: 100% } }
@keyframes loadFadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

/* ─── NAV ─── */
nav {
  position: fixed; top: 0; left: 0; right: 0;
  z-index: 1000;
  padding: 1.5rem 3rem;
  display: flex; align-items: center; justify-content: space-between;
  transition: background 0.4s, backdrop-filter 0.4s;
}
nav.scrolled {
  background: rgba(240,249,255,0.85);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--mist-deep);
}
.nav__logo {
  font-family: var(--font-display);
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--ink);
  text-decoration: none;
  letter-spacing: 0.04em;
  display: flex; align-items: center; gap: 0.5rem;
}
.nav__logo span { color: var(--sky-500); }
.nav__links {
  display: flex; gap: 2.5rem; list-style: none;
}
.nav__links a {
  font-size: 0.8rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--ink-muted);
  text-decoration: none;
  position: relative;
  transition: color 0.2s;
}
.nav__links a::after {
  content: '';
  position: absolute; bottom: -3px; left: 0; right: 0;
  height: 1px; background: var(--sky-400);
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.3s var(--ease-out-expo);
}
.nav__links a:hover { color: var(--sky-500); }
.nav__links a:hover::after { transform: scaleX(1); }
.nav__cta {
  font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase;
  padding: 0.6rem 1.4rem;
  border: 1.5px solid var(--sky-400);
  border-radius: 999px;
  color: var(--sky-500);
  text-decoration: none;
  transition: background 0.2s, color 0.2s;
}
.nav__cta:hover { background: var(--sky-400); color: white; }

/* ─── FLOATING PARTICLES ─── */
.particles {
  position: fixed; inset: 0; pointer-events: none; z-index: 1; overflow: hidden;
}
.particle {
  position: absolute;
  border-radius: 50%;
  opacity: 0;
  animation: floatParticle var(--dur, 8s) var(--delay, 0s) infinite ease-in-out;
}
@keyframes floatParticle {
  0% { opacity: 0; transform: translateY(0) scale(0.8); }
  20% { opacity: var(--op, 0.4); }
  80% { opacity: var(--op, 0.4); }
  100% { opacity: 0; transform: translateY(-120vh) scale(1.2); }
}

/* ─── HERO ─── */
.hero {
  min-height: 100vh;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
  position: relative;
  overflow: hidden;
  padding: 8rem 2rem 4rem;
}
.hero__bg {
  position: absolute; inset: 0;
  background: linear-gradient(160deg, #e8f6fd 0%, #f0f9ff 40%, #fce4ec22 70%, #e0f7f4 100%);
  z-index: 0;
}
.hero__blob {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.35;
  animation: blobDrift var(--bd, 12s) ease-in-out infinite alternate;
}
@keyframes blobDrift {
  from { transform: translate(0, 0) scale(1); }
  to { transform: translate(var(--bx, 40px), var(--by, -30px)) scale(1.08); }
}

.hero__eyebrow {
  font-family: var(--font-mono);
  font-size: 0.72rem;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--sky-500);
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.8s 0.4s, transform 0.8s 0.4s var(--ease-out-expo);
  position: relative; z-index: 2;
}
.hero__eyebrow.vis { opacity: 1; transform: translateY(0); }

/* COVEO-style animated script SVG */
.hero__script-wrap {
  position: relative; z-index: 2;
  width: min(600px, 90vw);
  margin: 1.5rem 0;
}
.hero__script-wrap svg { overflow: visible; }
.hero__script-wrap path {
  fill: none;
  stroke: var(--sky-400);
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: var(--dl, 1000);
  stroke-dashoffset: var(--dl, 1000);
  animation: drawPath var(--script-duration, 1.5s) var(--script-delay, 0s) var(--ease-out-expo) forwards;
}
@keyframes drawPath { to { stroke-dashoffset: 0; } }

.hero__title {
  font-family: var(--font-display);
  font-size: clamp(3.5rem, 9vw, 7rem);
  font-weight: 400;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--ink);
  position: relative; z-index: 2;
  opacity: 0; transform: translateY(40px);
  transition: opacity 1s 0.6s, transform 1s 0.6s var(--ease-out-expo);
  text-align: center;
}
.hero__title.vis { opacity: 1; transform: translateY(0); }
.hero__title em {
  font-style: italic;
  color: var(--sky-500);
}

.hero__sub {
  font-family: var(--font-body);
  font-size: clamp(0.95rem, 2vw, 1.1rem);
  color: var(--ink-muted);
  max-width: 480px;
  text-align: center;
  line-height: 1.7;
  position: relative; z-index: 2;
  margin-top: 1.5rem;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.8s 0.9s, transform 0.8s 0.9s var(--ease-out-expo);
}
.hero__sub.vis { opacity: 1; transform: translateY(0); }

.hero__ctas {
  display: flex; gap: 1rem; margin-top: 2.5rem;
  position: relative; z-index: 2;
  opacity: 0; transform: translateY(20px);
  transition: opacity 0.8s 1.1s, transform 0.8s 1.1s var(--ease-out-expo);
}
.hero__ctas.vis { opacity: 1; transform: translateY(0); }

.btn-primary {
  padding: 0.85rem 2.2rem;
  background: var(--sky-400);
  color: white;
  border: none; border-radius: 999px;
  font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; text-decoration: none;
  transition: background 0.2s, transform 0.2s, box-shadow 0.2s;
  box-shadow: 0 4px 24px rgba(135,206,235,0.35);
}
.btn-primary:hover {
  background: var(--sky-500);
  transform: translateY(-2px);
  box-shadow: 0 8px 32px rgba(135,206,235,0.5);
}
.btn-outline {
  padding: 0.85rem 2.2rem;
  background: transparent;
  color: var(--sky-500);
  border: 1.5px solid var(--sky-300);
  border-radius: 999px;
  font-size: 0.85rem; letter-spacing: 0.1em; text-transform: uppercase;
  cursor: pointer; text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.btn-outline:hover {
  background: var(--mist);
  border-color: var(--sky-400);
  transform: translateY(-2px);
}

/* Floating art pieces in hero - ref: collage/window-swap style */
.hero__float-art {
  position: absolute;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 40px rgba(0,0,0,0.1);
  opacity: 0;
  transition: opacity 1.2s var(--ease-out-expo), transform 1.2s var(--ease-out-expo);
}
.hero__float-art.vis { opacity: 1; transform: translateY(0) rotate(var(--rot, 0deg)) !important; }
.hero__float-art img { width: 100%; height: 100%; object-fit: cover; display: block; }
.hero__float-art:nth-child(1) {
  width: 180px; height: 220px;
  top: 15%; left: 5%;
  --rot: -4deg;
  transform: translateY(60px) rotate(-4deg);
  transition-delay: 1.2s;
  animation: floatA 6s 2s ease-in-out infinite alternate;
}
.hero__float-art:nth-child(2) {
  width: 140px; height: 160px;
  top: 20%; right: 8%;
  --rot: 5deg;
  transform: translateY(60px) rotate(5deg);
  transition-delay: 1.4s;
  animation: floatB 7s 2.5s ease-in-out infinite alternate;
}
.hero__float-art:nth-child(3) {
  width: 120px; height: 150px;
  bottom: 20%; left: 8%;
  --rot: 3deg;
  transform: translateY(60px) rotate(3deg);
  transition-delay: 1.6s;
  animation: floatA 8s 3s ease-in-out infinite alternate;
}
.hero__float-art:nth-child(4) {
  width: 160px; height: 130px;
  bottom: 22%; right: 5%;
  --rot: -6deg;
  transform: translateY(60px) rotate(-6deg);
  transition-delay: 1.8s;
  animation: floatB 6.5s 3.5s ease-in-out infinite alternate;
}
@keyframes floatA {
  from { transform: translateY(0) rotate(var(--rot, -4deg)); }
  to { transform: translateY(-16px) rotate(calc(var(--rot, -4deg) + 1deg)); }
}
@keyframes floatB {
  from { transform: translateY(0) rotate(var(--rot, 5deg)); }
  to { transform: translateY(-12px) rotate(calc(var(--rot, 5deg) - 1.5deg)); }
}

.hero__scroll-hint {
  position: absolute; bottom: 2.5rem; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--sky-400); z-index: 2;
  opacity: 0; animation: scrollHintFade 0.8s 2.5s forwards;
}
@keyframes scrollHintFade { to { opacity: 1; } }
.hero__scroll-line {
  width: 1px; height: 60px;
  background: linear-gradient(to bottom, var(--sky-400), transparent);
  animation: scrollLinePulse 2s ease-in-out infinite;
}
@keyframes scrollLinePulse {
  0%, 100% { transform: scaleY(1); opacity: 1; }
  50% { transform: scaleY(0.6); opacity: 0.4; }
}

/* ─── SECTION GENERIC ─── */
section { position: relative; overflow: hidden; }

.section-label {
  font-family: var(--font-mono);
  font-size: 0.65rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--sky-400);
}

/* ─── ABOUT / INTRO ─── */
.about {
  padding: 8rem 2rem;
  background: var(--soft-white);
}
.about__inner {
  max-width: 1100px; margin: 0 auto;
  display: grid; grid-template-columns: 1fr 1fr; gap: 6rem;
  align-items: center;
}
.about__image-stack {
  position: relative;
  height: 520px;
}
.about__img {
  position: absolute;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 12px 48px rgba(135,206,235,0.2);
  opacity: 0; transition: opacity 0.9s var(--ease-out-expo), transform 0.9s var(--ease-out-expo);
}
.about__img.vis { opacity: 1; transform: translate(0, 0) rotate(var(--ar, 0deg)) !important; }
.about__img:nth-child(1) {
  width: 65%; top: 0; left: 0;
  --ar: -3deg; transform: translate(-40px, 0) rotate(-3deg);
  transition-delay: 0s;
}
.about__img:nth-child(2) {
  width: 55%; bottom: 0; right: 0;
  --ar: 4deg; transform: translate(40px, 0) rotate(4deg);
  transition-delay: 0.2s;
}
.about__img:nth-child(3) {
  width: 45%; top: 40%; left: 20%;
  --ar: -1deg; transform: translate(0, 40px) rotate(-1deg);
  transition-delay: 0.4s;
  box-shadow: 0 20px 64px rgba(0,0,0,0.12);
}
.about__img img { width: 100%; height: 100%; object-fit: cover; display: block; }

.about__content {
  opacity: 0; transform: translateX(40px);
  transition: opacity 0.9s 0.3s var(--ease-out-expo), transform 0.9s 0.3s var(--ease-out-expo);
}
.about__content.vis { opacity: 1; transform: translateX(0); }
.about__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400; line-height: 1.2;
  margin: 1rem 0 1.5rem;
}
.about__title span { color: var(--sky-500); font-style: italic; }
.about__text {
  font-size: 0.95rem; line-height: 1.8;
  color: var(--ink-muted); margin-bottom: 1rem;
}
.about__tags {
  display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 1.5rem;
}
.about__tag {
  padding: 0.35rem 1rem;
  background: var(--mist);
  border: 1px solid var(--sky-200);
  border-radius: 999px;
  font-size: 0.75rem; letter-spacing: 0.08em;
  color: var(--sky-600);
}

/* ─── ART TYPES MARQUEE ─── */
.marquee-section {
  padding: 3rem 0;
  background: var(--sky-300);
  overflow: hidden;
  position: relative;
}
.marquee-section::before, .marquee-section::after {
  content: ''; position: absolute; top: 0; bottom: 0; width: 80px; z-index: 2;
}
.marquee-section::before { left: 0; background: linear-gradient(to right, var(--sky-300), transparent); }
.marquee-section::after { right: 0; background: linear-gradient(to left, var(--sky-300), transparent); }
.marquee-track {
  display: flex; gap: 3rem;
  animation: marqueeScroll 20s linear infinite;
  white-space: nowrap;
}
.marquee-track:hover { animation-play-state: paused; }
@keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
.marquee-item {
  display: flex; align-items: center; gap: 1rem;
  font-family: var(--font-display);
  font-size: 1.1rem; font-style: italic;
  color: white; letter-spacing: 0.04em;
  flex-shrink: 0;
}
.marquee-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: rgba(255,255,255,0.6);
}

/* ─── PORTFOLIO GRID ─── */
.portfolio {
  padding: 8rem 2rem;
  background: var(--soft-white);
}
.portfolio__header {
  max-width: 1100px; margin: 0 auto 4rem;
  display: flex; justify-content: space-between; align-items: flex-end;
}
.portfolio__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400; line-height: 1.1;
}
.portfolio__title span { color: var(--sky-500); font-style: italic; }
.portfolio__filters {
  display: flex; gap: 0.5rem;
}
.filter-btn {
  padding: 0.4rem 1rem;
  border: 1px solid var(--sky-200);
  border-radius: 999px;
  background: transparent;
  font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--ink-muted);
  cursor: pointer;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.filter-btn.active, .filter-btn:hover {
  background: var(--sky-400);
  border-color: var(--sky-400);
  color: white;
}

.portfolio__grid {
  max-width: 1100px; margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: 1.5rem;
}

/* Vanderbilt / editorial grid layout */
.art-card {
  border-radius: 16px; overflow: hidden;
  position: relative; cursor: pointer;
  opacity: 0; transform: translateY(40px);
  transition: opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo);
}
.art-card.vis { opacity: 1; transform: translateY(0); }
.art-card:hover .art-card__overlay { opacity: 1; }
.art-card:hover .art-card__img { transform: scale(1.05); }

.art-card:nth-child(1) { grid-column: 1 / 7; grid-row: 1; }
.art-card:nth-child(2) { grid-column: 7 / 10; grid-row: 1; }
.art-card:nth-child(3) { grid-column: 10 / 13; grid-row: 1; }
.art-card:nth-child(4) { grid-column: 1 / 5; grid-row: 2; }
.art-card:nth-child(5) { grid-column: 5 / 9; grid-row: 2; }
.art-card:nth-child(6) { grid-column: 9 / 13; grid-row: 2; }

.art-card:nth-child(1) { transition-delay: 0s; }
.art-card:nth-child(2) { transition-delay: 0.1s; }
.art-card:nth-child(3) { transition-delay: 0.15s; }
.art-card:nth-child(4) { transition-delay: 0.2s; }
.art-card:nth-child(5) { transition-delay: 0.25s; }
.art-card:nth-child(6) { transition-delay: 0.3s; }

.art-card__img-wrap {
  position: relative;
  padding-top: var(--ar, 100%);
  background: var(--sky-100);
}
.art-card__img {
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  transition: transform 0.6s var(--ease-out-expo);
}
.art-card__overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(26,35,50,0.7) 0%, transparent 60%);
  opacity: 0; transition: opacity 0.4s;
  display: flex; flex-direction: column;
  justify-content: flex-end; padding: 1.5rem;
}
.art-card__tag {
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--sky-200); margin-bottom: 0.3rem;
}
.art-card__name {
  font-family: var(--font-display);
  font-size: 1.1rem; color: white; font-style: italic;
}

/* ─── SCROLL CAROUSEL (COVEO-inspired) ─── */
.carousel-section {
  padding: 5rem 0;
  background: linear-gradient(160deg, #e8f6fd 0%, var(--soft-white) 100%);
  overflow: hidden;
}
.carousel-section__label {
  max-width: 1100px; margin: 0 auto 2rem; padding: 0 2rem;
}
.carousel-track-outer {
  overflow: hidden; position: relative;
}
.carousel-track {
  display: flex; gap: 1.5rem;
  padding: 1rem 2rem;
  transition: transform 0.6s var(--ease-out-expo);
  will-change: transform;
}
.carousel-card {
  flex-shrink: 0;
  width: 260px;
  border-radius: 20px; overflow: hidden;
  background: white;
  box-shadow: 0 4px 24px rgba(135,206,235,0.15);
  transition: transform 0.4s var(--ease-out-expo), box-shadow 0.4s;
  cursor: pointer;
}
.carousel-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 16px 48px rgba(135,206,235,0.3);
}
.carousel-card__thumb {
  height: 220px; overflow: hidden;
  background: var(--sky-100);
}
.carousel-card__thumb img {
  width: 100%; height: 100%; object-fit: cover;
  transition: transform 0.5s var(--ease-out-expo);
}
.carousel-card:hover .carousel-card__thumb img { transform: scale(1.08); }
.carousel-card__info {
  padding: 1rem 1.2rem 1.2rem;
}
.carousel-card__type {
  font-family: var(--font-mono);
  font-size: 0.62rem; letter-spacing: 0.15em; text-transform: uppercase;
  color: var(--sky-400); margin-bottom: 0.3rem;
}
.carousel-card__title {
  font-family: var(--font-display);
  font-size: 1rem; font-style: italic;
  color: var(--ink);
}

.carousel-nav {
  display: flex; gap: 0.75rem;
  justify-content: center; margin-top: 2rem;
}
.carousel-nav-btn {
  width: 40px; height: 40px; border-radius: 50%;
  border: 1.5px solid var(--sky-300);
  background: transparent; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  transition: background 0.2s, border-color 0.2s;
  color: var(--sky-500);
}
.carousel-nav-btn:hover { background: var(--sky-400); border-color: var(--sky-400); color: white; }

/* ─── COMMISSIONS ─── */
.commissions {
  padding: 8rem 2rem;
  background: var(--soft-white);
}
.commissions__inner { max-width: 1100px; margin: 0 auto; }
.commissions__header { margin-bottom: 4rem; }
.commissions__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3.2rem);
  font-weight: 400; line-height: 1.15;
  margin: 1rem 0;
}
.commissions__title em { color: var(--sky-500); font-style: italic; }

.commissions__grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
}
.comm-card {
  background: var(--sky-50);
  border: 1.5px solid var(--sky-100);
  border-radius: 20px;
  padding: 2rem;
  position: relative; overflow: hidden;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo),
              border-color 0.3s, box-shadow 0.3s;
  cursor: pointer;
}
.comm-card.vis { opacity: 1; transform: translateY(0); }
.comm-card:nth-child(1) { transition-delay: 0s; }
.comm-card:nth-child(2) { transition-delay: 0.1s; }
.comm-card:nth-child(3) { transition-delay: 0.2s; }
.comm-card:nth-child(4) { transition-delay: 0.3s; }

.comm-card::before {
  content: '';
  position: absolute; top: 0; left: 0; right: 0; height: 3px;
  background: linear-gradient(to right, var(--sky-300), var(--sky-500));
  transform: scaleX(0); transform-origin: left;
  transition: transform 0.4s var(--ease-out-expo);
}
.comm-card:hover { border-color: var(--sky-300); box-shadow: 0 8px 32px rgba(135,206,235,0.2); }
.comm-card:hover::before { transform: scaleX(1); }

.comm-card__icon {
  font-size: 2rem; margin-bottom: 1.2rem;
}
.comm-card__type {
  font-family: var(--font-mono);
  font-size: 0.65rem; letter-spacing: 0.2em; text-transform: uppercase;
  color: var(--sky-400); margin-bottom: 0.5rem;
}
.comm-card__name {
  font-family: var(--font-display);
  font-size: 1.3rem; font-weight: 500;
  color: var(--ink); margin-bottom: 0.5rem;
}
.comm-card__desc {
  font-size: 0.85rem; line-height: 1.7;
  color: var(--ink-muted); margin-bottom: 1.5rem;
}
.comm-card__price {
  font-family: var(--font-display);
  font-size: 1.6rem; color: var(--sky-500);
  font-style: italic;
}
.comm-card__price span { font-size: 0.85rem; color: var(--ink-muted); font-style: normal; font-family: var(--font-body); }

.comm-status {
  display: inline-flex; align-items: center; gap: 0.5rem;
  padding: 0.5rem 1.2rem;
  border-radius: 999px;
  font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase;
  margin-top: 3rem;
}
.comm-status.open { background: #e0f7ea; color: #2d7a4a; }
.comm-status.open::before { content: ''; width: 6px; height: 6px; border-radius: 50%; background: #2d7a4a; animation: statusPulse 1.5s infinite; }
@keyframes statusPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }

/* ─── PROCESS / TIMELINE ─── */
.process {
  padding: 8rem 2rem;
  background: linear-gradient(180deg, #e8f6fd 0%, var(--soft-white) 100%);
}
.process__inner { max-width: 800px; margin: 0 auto; }
.process__title {
  font-family: var(--font-display);
  font-size: clamp(1.8rem, 3.5vw, 2.8rem);
  font-weight: 400; margin: 1rem 0 4rem;
  text-align: center;
}
.process__title em { color: var(--sky-500); font-style: italic; }

.process__steps { position: relative; }
.process__line {
  position: absolute; left: 24px; top: 0; bottom: 0;
  width: 1px; background: linear-gradient(to bottom, var(--sky-300), var(--sky-100));
}
.process__step {
  display: flex; gap: 2rem; margin-bottom: 3rem; position: relative;
  opacity: 0; transform: translateX(-30px);
  transition: opacity 0.7s var(--ease-out-expo), transform 0.7s var(--ease-out-expo);
}
.process__step.vis { opacity: 1; transform: translateX(0); }
.process__step:nth-child(1) { transition-delay: 0s; }
.process__step:nth-child(2) { transition-delay: 0.15s; }
.process__step:nth-child(3) { transition-delay: 0.3s; }
.process__step:nth-child(4) { transition-delay: 0.45s; }
.process__step:nth-child(5) { transition-delay: 0.6s; }

.process__num {
  flex-shrink: 0;
  width: 48px; height: 48px; border-radius: 50%;
  background: var(--sky-50);
  border: 1.5px solid var(--sky-300);
  display: flex; align-items: center; justify-content: center;
  font-family: var(--font-mono);
  font-size: 0.8rem; color: var(--sky-500);
  position: relative; z-index: 1;
}
.process__body { padding-top: 0.6rem; }
.process__step-title {
  font-family: var(--font-display);
  font-size: 1.1rem; font-style: italic;
  color: var(--ink); margin-bottom: 0.4rem;
}
.process__step-text { font-size: 0.9rem; line-height: 1.7; color: var(--ink-muted); }

/* ─── SCROLL TEXT REVEAL (Astrophile/Filosofi style) ─── */
.text-reveal-section {
  padding: 10rem 2rem;
  background: var(--sky-300);
  position: relative; overflow: hidden;
}
.text-reveal-section__bg-text {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-family: var(--font-display);
  font-size: clamp(8rem, 20vw, 16rem);
  font-style: italic; font-weight: 700;
  color: rgba(255,255,255,0.08);
  white-space: nowrap;
  pointer-events: none; user-select: none;
  letter-spacing: -0.02em;
}
.text-reveal-section__content {
  max-width: 800px; margin: 0 auto;
  text-align: center; position: relative; z-index: 2;
}
.text-reveal__word {
  display: inline-block;
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 3.5vw, 2.5rem);
  font-style: italic;
  color: white;
  opacity: 0; transform: translateY(30px);
  transition: opacity 0.5s var(--ease-out-expo), transform 0.5s var(--ease-out-expo);
  margin-right: 0.3em;
}
.text-reveal__word.vis { opacity: 1; transform: translateY(0); }

/* ─── CONTACT / SOCIAL ─── */
.contact {
  padding: 8rem 2rem;
  background: var(--soft-white);
}
.contact__inner {
  max-width: 700px; margin: 0 auto; text-align: center;
}
.contact__avatar {
  width: 120px; height: 120px; border-radius: 50%;
  overflow: hidden; margin: 0 auto 2rem;
  border: 4px solid var(--sky-300);
  box-shadow: 0 0 0 8px var(--mist);
  opacity: 0; transform: scale(0.8);
  transition: opacity 0.8s var(--ease-out-expo), transform 0.8s var(--ease-out-expo);
}
.contact__avatar.vis { opacity: 1; transform: scale(1); }
.contact__avatar img { width: 100%; height: 100%; object-fit: cover; }

.contact__title {
  font-family: var(--font-display);
  font-size: clamp(2rem, 4vw, 3rem);
  font-weight: 400; margin-bottom: 1rem;
}
.contact__title em { color: var(--sky-500); font-style: italic; }
.contact__text {
  font-size: 1rem; line-height: 1.7; color: var(--ink-muted);
  max-width: 480px; margin: 0 auto 3rem;
}
.contact__socials {
  display: flex; flex-wrap: wrap; gap: 1rem; justify-content: center;
  margin-bottom: 3rem;
}
.social-link {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.7rem 1.5rem;
  border: 1.5px solid var(--sky-200);
  border-radius: 999px;
  font-size: 0.8rem; letter-spacing: 0.06em;
  color: var(--ink-soft);
  text-decoration: none;
  transition: background 0.2s, border-color 0.2s, transform 0.2s;
}
.social-link:hover {
  background: var(--mist);
  border-color: var(--sky-400);
  transform: translateY(-2px);
}
.social-link svg { width: 16px; height: 16px; color: var(--sky-500); }

/* ─── FOOTER ─── */
footer {
  padding: 2.5rem 3rem;
  border-top: 1px solid var(--sky-100);
  background: var(--sky-50);
  display: flex; align-items: center; justify-content: space-between;
}
.footer__copy {
  font-family: var(--font-mono);
  font-size: 0.72rem; letter-spacing: 0.1em;
  color: var(--ink-muted);
}
.footer__script {
  font-family: var(--font-script);
  font-size: 1.4rem; color: var(--sky-400);
}
.footer__links {
  display: flex; gap: 1.5rem; list-style: none;
}
.footer__links a {
  font-size: 0.72rem; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--ink-muted); text-decoration: none;
  transition: color 0.2s;
}
.footer__links a:hover { color: var(--sky-500); }

/* ─── ANIMATED SCATTER ELEMENTS (scrapbook/collage ref) ─── */
.scatter-sticker {
  position: absolute; pointer-events: none;
  opacity: 0; transition: opacity 0.6s var(--ease-out-expo);
  font-size: var(--fs, 1.5rem);
}
.scatter-sticker.vis { opacity: var(--sop, 0.6); }

/* ─── RESPONSIVE ─── */
@media (max-width: 900px) {
  nav { padding: 1.2rem 1.5rem; }
  .nav__links { display: none; }
  .about__inner { grid-template-columns: 1fr; gap: 3rem; }
  .about__image-stack { height: 300px; }
  .portfolio__header { flex-direction: column; align-items: flex-start; gap: 1.5rem; }
  .portfolio__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .art-card { grid-column: span 1 !important; grid-row: auto !important; }
  footer { flex-direction: column; gap: 1rem; text-align: center; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
*/

/* @arkzen:web:fonts
https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Dancing+Script:wght@500&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap
*/

export default function Lain098Page() {
  /* @arkzen:state
  const [loaded, setLoaded] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: -100, y: -100 });
  const [cursorHover, setCursorHover] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [carouselOffset, setCarouselOffset] = useState(0);
  */

  /* @arkzen:effect
  // ── Loading
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // ── Custom cursor
  useEffect(() => {
    const move = (e: MouseEvent) => setCursorPos({ x: e.clientX, y: e.clientY });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  useEffect(() => {
    const els = document.querySelectorAll("a, button, .art-card, .comm-card, .carousel-card");
    const enter = () => setCursorHover(true);
    const leave = () => setCursorHover(false);
    els.forEach(el => { el.addEventListener("mouseenter", enter); el.addEventListener("mouseleave", leave); });
    return () => els.forEach(el => { el.removeEventListener("mouseenter", enter); el.removeEventListener("mouseleave", leave); });
  }, [loaded]);

  // ── Nav scroll
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // ── IntersectionObserver for scroll-triggered animations
  useEffect(() => {
    const targets = document.querySelectorAll(
      ".hero__eyebrow, .hero__title, .hero__sub, .hero__ctas, .hero__float-art, " +
      ".about__img, .about__content, .art-card, .comm-card, .process__step, " +
      ".text-reveal__word, .contact__avatar"
    );
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("vis"); } });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    targets.forEach(t => obs.observe(t));
    return () => obs.disconnect();
  }, [loaded]);
  */

  /* @arkzen:handler
  const handleCarouselPrev = useCallback(() => {
    setCarouselOffset(prev => Math.min(prev + 280, 0));
  }, []);
  const handleCarouselNext = useCallback(() => {
    setCarouselOffset(prev => Math.max(prev - 280, -280 * 5));
  }, []);
  */

  const artTypes = [
    "Anime Illustrations", "Fanart", "Original Characters",
    "Chibi Art", "Short Animations", "Character Design",
    "Anime Illustrations", "Fanart", "Original Characters",
    "Chibi Art", "Short Animations", "Character Design",
  ];

  const portfolioItems = [
    { tag: "OC", title: "Aether Dreams", img: "https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600&q=80", ar: "130%" },
    { tag: "Chibi", title: "Sweet Reverie", img: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80", ar: "110%" },
    { tag: "Fanart", title: "Star Fragment", img: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=80", ar: "130%" },
    { tag: "OC", title: "Blue Horizon", img: "https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=500&q=80", ar: "100%" },
    { tag: "Animation", title: "Loop of Spring", img: "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=500&q=80", ar: "100%" },
    { tag: "Fanart", title: "Sakura Path", img: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500&q=80", ar: "100%" },
  ];

  const carouselItems = [
    { type: "Character Design", title: "Crystal Witch", img: "https://images.unsplash.com/photo-1596854407944-bf87f6fdd49e?w=400&q=80" },
    { type: "Chibi", title: "Cloud Dancer", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80" },
    { type: "Fanart", title: "Moonlight Sonata", img: "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=400&q=80" },
    { type: "OC", title: "Sea Glass Heart", img: "https://images.unsplash.com/photo-1598214886806-c87b84b7078b?w=400&q=80" },
    { type: "Animation", title: "Float Away", img: "https://images.unsplash.com/photo-1551582045-6ec9c11d8697?w=400&q=80" },
    { type: "Illustration", title: "Quiet Garden", img: "https://images.unsplash.com/photo-1585435557343-3b092031a831?w=400&q=80" },
    { type: "Chibi", title: "Tiny Stars", img: "https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=400&q=80" },
  ];

  const commissionTypes = [
    { icon: "✦", type: "Bust / Half-body", name: "Illustration", desc: "Clean lineart with full color shading. Perfect for character portraits, OC reveals, or profile art.", price: "Starting at $25", delay: 0 },
    { icon: "◈", type: "Full-body", name: "Illustration", desc: "Full character with detailed pose, expression, and background elements. Great for OCs and fanart.", price: "Starting at $45", delay: 0.1 },
    { icon: "⟡", type: "Tiny & Cute", name: "Chibi", desc: "Adorable simplified chibi style. Perfect for sticker packs, emotes, or just because they're cute!", price: "Starting at $18", delay: 0.2 },
    { icon: "⌘", type: "Moving Art", name: "Animation", desc: "Short looping GIF animations. Blinking, breathing, effects — bring your character to life.", price: "Starting at $60", delay: 0.3 },
  ];

  const processSteps = [
    { title: "Inquiry & Quote", text: "Fill out my commission form on Throne or send me a DM on Instagram with your reference, style preference, and details." },
    { title: "Sketch & Approval", text: "I'll send you a rough sketch first. We tweak until you're happy — no surprises in the final piece!" },
    { title: "Lineart & Color", text: "Clean lines, color blocking, then full shading and details. I'll share WIP previews along the way." },
    { title: "Final Delivery", text: "You receive a high-resolution PNG. Transparent backgrounds available on request." },
    { title: "Enjoy your art! ✦", text: "Tag me if you post it — I love seeing where my pieces end up. Your support means everything 🩵" },
  ];

  const revealWords = ["Art", "made", "with", "love,", "for", "the", "dreamers", "and", "wanderers", "of", "the", "internet."];

  return (
    <>
      {/* ── Google Fonts */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;1,400;1,500&family=Dancing+Script:wght@500&family=Inter:wght@300;400;500&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet" />

      {/* ── Custom Cursor */}
      <div className="cursor" style={{ left: cursorPos.x, top: cursorPos.y }}>
        <div className={`cursor__ring ${cursorHover ? "hover" : ""}`} />
        <div className={`cursor__dot ${cursorHover ? "hover" : ""}`} />
      </div>

      {/* ── Loading Screen */}
      <div className={`loading ${loaded ? "done" : ""}`}>
        <p className="loading__name">Lain098_</p>
        <p className="loading__sub">digital artist</p>
        <div className="loading__bar-wrap">
          <div className="loading__bar" />
        </div>
      </div>

      {/* ── Floating Particles (sky blue bubbles) */}
      <div className="particles" aria-hidden="true">
        {[...Array(18)].map((_, i) => (
          <div
            key={i}
            className="particle"
            style={{
              left: `${Math.random() * 100}%`,
              bottom: `-${20 + Math.random() * 20}px`,
              width: `${4 + Math.random() * 12}px`,
              height: `${4 + Math.random() * 12}px`,
              background: `hsl(${195 + Math.random() * 20}, ${60 + Math.random() * 30}%, ${70 + Math.random() * 20}%)`,
              ["--dur" as any]: `${6 + Math.random() * 8}s`,
              ["--delay" as any]: `${Math.random() * 6}s`,
              ["--op" as any]: `${0.2 + Math.random() * 0.3}`,
            } as React.CSSProperties}
          />
        ))}
      </div>

      {/* ── NAV */}
      <nav className={navScrolled ? "scrolled" : ""}>
        <a href="#" className="nav__logo">
          Lain<span>098_</span>
        </a>
        <ul className="nav__links">
          {["About", "Portfolio", "Commissions", "Contact"].map(n => (
            <li key={n}><a href={`#${n.toLowerCase()}`}>{n}</a></li>
          ))}
        </ul>
        <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="nav__cta">
          Commission Me
        </a>
      </nav>

      {/* ─────────────────────────────────────────
          HERO — COVEO-style script + editorial
      ───────────────────────────────────────── */}
      <section className="hero">
        <div className="hero__bg" />

        {/* Blobs */}
        <div className="hero__blob" style={{ width: 500, height: 500, top: -100, right: -100, background: "var(--sky-200)", ["--bd" as any]: "14s", ["--bx" as any]: "40px", ["--by" as any]: "-30px" } as React.CSSProperties} />
        <div className="hero__blob" style={{ width: 300, height: 300, bottom: 50, left: -50, background: "var(--petal)", ["--bd" as any]: "10s", ["--bx" as any]: "-30px", ["--by" as any]: "20px" } as React.CSSProperties} />
        <div className="hero__blob" style={{ width: 200, height: 200, bottom: 200, right: 200, background: "var(--mint)", ["--bd" as any]: "11s", ["--bx" as any]: "20px", ["--by" as any]: "-40px" } as React.CSSProperties} />

        {/* Floating art pieces — collage/scrapbook ref */}
        {[
          "https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=300&q=80",
          "https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=300&q=80",
          "https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=300&q=80",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300&q=80",
        ].map((src, i) => (
          <div key={i} className="hero__float-art">
            <img src={src} alt="" />
          </div>
        ))}

        {/* Content */}
        <p className="hero__eyebrow">✦ Digital Artist · Anime · OC · Chibi</p>

        {/* COVEO-inspired animated script SVG */}
        <div className="hero__script-wrap" aria-hidden="true">
          <svg viewBox="0 0 500 70" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M10 45 C30 20, 60 15, 80 35 C95 50, 110 55, 130 40 C150 25, 165 20, 185 38 C200 52, 215 55, 235 42"
              strokeWidth="2"
              style={{ "--script-duration": "1.2s", "--script-delay": "0.5s", "--dl": "600" } as React.CSSProperties}
            />
            <path
              d="M250 38 C265 22, 285 18, 305 35 C320 48, 338 52, 358 38 C372 28, 388 22, 410 40 C428 55, 448 58, 468 44"
              strokeWidth="2"
              style={{ "--script-duration": "1.2s", "--script-delay": "1.2s", "--dl": "600" } as React.CSSProperties}
            />
          </svg>
        </div>

        <h1 className={`hero__title ${loaded ? "vis" : ""}`}>
          Hello, I'm <em>Lain</em>
        </h1>
        <p className={`hero__sub ${loaded ? "vis" : ""}`}>
          A digital artist crafting anime illustrations, fanart, original characters, chibi, and short animations — art for the people who feel everything.
        </p>
        <div className={`hero__ctas ${loaded ? "vis" : ""}`}>
          <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="btn-primary">
            Commission Me
          </a>
          <a href="#portfolio" className="btn-outline">View Portfolio</a>
        </div>

        {/* Scroll hint */}
        <div className="hero__scroll-hint">
          <span>Scroll</span>
          <div className="hero__scroll-line" />
        </div>
      </section>

      {/* ─────────────────────────────────────────
          MARQUEE — art type scroll
      ───────────────────────────────────────── */}
      <div className="marquee-section" aria-hidden="true">
        <div className="marquee-track">
          {[...artTypes, ...artTypes].map((t, i) => (
            <span key={i} className="marquee-item">
              <span className="marquee-dot" />
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────
          ABOUT — editorial image stack + text
      ───────────────────────────────────────── */}
      <section className="about" id="about">
        <div className="about__inner">
          <div className="about__image-stack">
            <div className="about__img" style={{ height: "70%" }}>
              <img src="https://images.unsplash.com/photo-1604076850742-4c7221f3101b?w=600&q=80" alt="Art example" />
            </div>
            <div className="about__img" style={{ height: "55%" }}>
              <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80" alt="Art example" />
            </div>
            <div className="about__img" style={{ height: "50%" }}>
              <img src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=80" alt="Art example" />
            </div>
          </div>

          <div className="about__content">
            <span className="section-label">— About Lain</span>
            <h2 className="about__title">
              Art that <span>feels</span> like a quiet, sunny afternoon
            </h2>
            <p className="about__text">
              Hello! I'm Lain — a digital artist whose work lives at the intersection of anime warmth and personal expression. I draw fanart of characters I love, design original characters with full backstories, and bring tiny chibi versions of everything to life.
            </p>
            <p className="about__text">
              Every piece I make is personal. I want the person holding my art to feel something — a memory, a daydream, a warmth they can't quite name. That's what I'm always chasing.
            </p>
            <div className="about__tags">
              {["Anime Style", "Fanart", "OC Design", "Chibi", "Animations", "Digital"].map(tag => (
                <span key={tag} className="about__tag">{tag}</span>
              ))}
            </div>
            <div style={{ marginTop: "2rem" }}>
              <a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer" className="btn-outline">
                Follow on Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          PORTFOLIO GRID — editorial/vanderbilt/blue-sky ref
      ───────────────────────────────────────── */}
      <section className="portfolio" id="portfolio">
        <div className="portfolio__header">
          <div>
            <span className="section-label">— Portfolio</span>
            <h2 className="portfolio__title">Selected <span>Works</span></h2>
          </div>
          <div className="portfolio__filters">
            {["all", "oc", "fanart", "chibi", "animation"].map(f => (
              <button
                key={f}
                className={`filter-btn ${activeFilter === f ? "active" : ""}`}
                onClick={() => setActiveFilter(f)}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="portfolio__grid">
          {portfolioItems.map((item, i) => (
            <div key={i} className="art-card" style={{ ["--ar" as any]: item.ar }}>
              <div className="art-card__img-wrap" style={{ paddingTop: item.ar }}>
                <img className="art-card__img" src={item.img} alt={item.title} />
                <div className="art-card__overlay">
                  <span className="art-card__tag">{item.tag}</span>
                  <span className="art-card__name">{item.title}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─────────────────────────────────────────
          CAROUSEL — COVEO-style scroll carousel
      ───────────────────────────────────────── */}
      <section className="carousel-section">
        <div className="carousel-section__label">
          <span className="section-label">— More Works</span>
        </div>
        <div className="carousel-track-outer">
          <div
            className="carousel-track"
            style={{ transform: `translateX(${carouselOffset}px)` }}
          >
            {carouselItems.map((item, i) => (
              <div key={i} className="carousel-card">
                <div className="carousel-card__thumb">
                  <img src={item.img} alt={item.title} />
                </div>
                <div className="carousel-card__info">
                  <p className="carousel-card__type">{item.type}</p>
                  <p className="carousel-card__title">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="carousel-nav">
          <button className="carousel-nav-btn" onClick={handleCarouselPrev} aria-label="Previous">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button className="carousel-nav-btn" onClick={handleCarouselNext} aria-label="Next">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          COMMISSIONS — card grid
      ───────────────────────────────────────── */}
      <section className="commissions" id="commissions">
        <div className="commissions__inner">
          <div className="commissions__header">
            <span className="section-label">— Commissions</span>
            <h2 className="commissions__title">
              Let me draw <em>your</em> vision
            </h2>
            <div style={{ display: "flex", gap: "1rem", alignItems: "center", marginTop: "0.5rem", flexWrap: "wrap" }}>
              <span className="comm-status open">✦ Commissions Open</span>
              <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="btn-primary" style={{ fontSize: "0.8rem", padding: "0.6rem 1.5rem" }}>
                Request via Throne
              </a>
            </div>
          </div>
          <div className="commissions__grid">
            {commissionTypes.map((c, i) => (
              <div key={i} className="comm-card" style={{ transitionDelay: `${c.delay}s` }}>
                <div className="comm-card__icon">{c.icon}</div>
                <p className="comm-card__type">{c.type}</p>
                <p className="comm-card__name">{c.name}</p>
                <p className="comm-card__desc">{c.desc}</p>
                <p className="comm-card__price">
                  {c.price.split("at")[0]}at <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic", color: "var(--sky-500)", fontSize: "1.6rem" }}>{c.price.split("at")[1]}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          PROCESS — timeline steps
      ───────────────────────────────────────── */}
      <section className="process">
        <div className="process__inner">
          <span className="section-label" style={{ display: "block", textAlign: "center" }}>— How it works</span>
          <h2 className="process__title">
            The commission <em>process</em>
          </h2>
          <div className="process__steps">
            <div className="process__line" />
            {processSteps.map((step, i) => (
              <div key={i} className="process__step">
                <div className="process__num">{String(i + 1).padStart(2, "0")}</div>
                <div className="process__body">
                  <p className="process__step-title">{step.title}</p>
                  <p className="process__step-text">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          TEXT REVEAL — Astrophile/sky blue ref
      ───────────────────────────────────────── */}
      <section className="text-reveal-section">
        <div className="text-reveal-section__bg-text" aria-hidden="true">Lain</div>
        <div className="text-reveal-section__content">
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.65rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)", marginBottom: "1.5rem" }}>
            — A note from Lain
          </p>
          <div>
            {revealWords.map((word, i) => (
              <span
                key={i}
                className="text-reveal__word"
                style={{ transitionDelay: `${i * 0.07}s` }}
              >
                {word}
              </span>
            ))}
          </div>
          <p style={{ marginTop: "2.5rem", fontFamily: "var(--font-script)", fontSize: "1.5rem", color: "rgba(255,255,255,0.75)" }}>
            — Lain098_
          </p>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          CONTACT / SOCIALS
      ───────────────────────────────────────── */}
      <section className="contact" id="contact">
        <div className="contact__inner">
          <div className="contact__avatar">
            <img src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=240&q=80" alt="Lain avatar" />
          </div>
          <span className="section-label">— Get in Touch</span>
          <h2 className="contact__title">
            Let's create <em>together</em>
          </h2>
          <p className="contact__text">
            Whether you want a commission, have a collaboration idea, or just want to say hi — my DMs are always open. I love meeting fellow art enjoyers 🩵
          </p>
          <div className="contact__socials">
            <a href="https://www.instagram.com/lain098_?igsh=aXpiYXBuYWJxOXFw" target="_blank" rel="noreferrer" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <circle cx="12" cy="12" r="5" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
              Instagram
            </a>
            <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="social-link">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
              Throne Wishlist
            </a>
          </div>
          <a href="https://throne.com/lain098_" target="_blank" rel="noreferrer" className="btn-primary">
            Send a Commission Request ✦
          </a>
        </div>
      </section>

      {/* ─────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────── */}
      <footer>
        <p className="footer__copy">© 2025 Lain098_ · All rights reserved</p>
        <span className="footer__script">Lain</span>
        <ul className="footer__links">
          <li><a href="#about">About</a></li>
          <li><a href="#portfolio">Portfolio</a></li>
          <li><a href="#commissions">Commissions</a></li>
          <li><a href="https://www.instagram.com/lain098_" target="_blank" rel="noreferrer">Instagram</a></li>
        </ul>
      </footer>
    </>
  );
}