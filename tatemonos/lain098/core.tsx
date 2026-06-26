/* @arkzen:meta
name: lain098
version: 4.0.0
description: "Art portfolio for Lain — fullscreen bottom-slide image slider, centered orbit."
auth: false
*/

/* @arkzen:meta:web
title: "Lain098_ — Digital Artist"
description: "Anime illustrations, fanart, OCs, chibi & short animations. Commissions open."
favicon: "🌊"
*/

/* @arkzen:web:config
layout:
  guest:
    className: "lain-root"
toast:
  position: bottom-right
  duration: 3000
*/

// ────────────────────────────────────────────────────────────────
// WEB SHARED COMPONENTS
// ────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { motion, AnimatePresence } from 'framer-motion'

// ─── DATA ──────────────────────────────────────────────────────

const WORKS = [
  {
    id: 'fanart',
    num: '01',
    label: 'Fanart',
    tagline: 'FANART — CHARACTER STUDIES',
    headline: 'Beloved characters,\nredrawn with feeling.',
    img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&q=80',
  },
  {
    id: 'ocs',
    num: '02',
    label: 'Original Characters',
    tagline: 'OCs — ORIGINAL DESIGN',
    headline: 'New souls\nbrought to life.',
    img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80',
  },
  {
    id: 'chibi',
    num: '03',
    label: 'Chibi',
    tagline: 'CHIBI — CUTE & COMPACT',
    headline: 'Big emotions,\ntiny forms.',
    img: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=800&q=80',
  },
  {
    id: 'animation',
    num: '04',
    label: 'Short Animations',
    tagline: 'ANIMATION — MOTION & LIFE',
    headline: 'Still frames\nset in motion.',
    img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
  },
]

const COMMISSION_TIERS = [
  {
    id: 'sketch',
    num: '001',
    title: 'Sketch',
    price: 'From $8',
    desc: 'Loose linework, single character, no background. Great for quick references or personal use.',
    features: ['1 character', 'Greyscale or flat colour', '2–3 day turnaround', '1 minor revision'],
  },
  {
    id: 'fullbody',
    num: '002',
    title: 'Full Illustration',
    price: 'From $25',
    desc: 'Clean lineart, full shading, detailed colouring with optional simple background.',
    features: ['1–2 characters', 'Full render & shading', 'Simple background included', '2 revisions'],
    featured: true,
  },
  {
    id: 'chibi',
    num: '003',
    title: 'Chibi',
    price: 'From $15',
    desc: 'Cute chibi-style characters, expressive and fully coloured.',
    features: ['1–2 characters', 'Flat or cel shading', 'Transparent PNG', '1 revision'],
  },
  {
    id: 'animation',
    num: '004',
    title: 'Animated Sticker',
    price: 'From $30',
    desc: 'Short looping animation, 4–8 frames. Perfect for Discord, Twitch, or Telegram.',
    features: ['1 character / emoji', '4–8 frame loop', 'GIF + APNG delivery', '1 revision'],
  },
]

const NAV_LINKS = [
  { label: 'WORKS', href: '#works' },
  { label: 'COMMISSIONS', href: '#commissions' },
  { label: 'ABOUT', href: '#about' },
  { label: 'CONTACT', href: '#contact' },
]

const CAROUSEL_ITEMS = [
  { id: 'fanart',     label: 'Fanart',              img: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=1200&q=80' },
  { id: 'oc1',       label: 'Original Character',   img: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=1200&q=80' },
  { id: 'chibi',     label: 'Chibi',                img: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=1200&q=80' },
  { id: 'anim',      label: 'Animation',            img: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&q=80' },
  { id: 'fanart2',   label: 'Fanart',               img: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=1200&q=80' },
  { id: 'oc2',       label: 'Original Character',   img: 'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=1200&q=80' },
  { id: 'illus',     label: 'Illustration',         img: 'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=1200&q=80' },
  { id: 'sketch',    label: 'Sketch',               img: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&q=80' },
]

const FULL_CAROUSEL = [...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS, ...CAROUSEL_ITEMS.slice(0, 6)]

const BURST_IMGS = [
  'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200&q=80',
  'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=200&q=80',
  'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=200&q=80',
  'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&q=80',
  'https://images.unsplash.com/photo-1549317336-206569e8475c?w=200&q=80',
  'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=200&q=80',
  'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=200&q=80',
  'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=200&q=80',
]

// ─── SIGNATURE LOGO SVG ───────────────────────────────────────

const SignatureLogo = ({ className = '' }: { className?: string }) => (
  <svg className={`signature-logo ${className}`} width="90" height="34" viewBox="0 0 116 44" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M115.346 21.8893C115.305 21.6315 115.088 21.6635 114.899 21.6469C114.402 21.6007 113.924 21.6789 113.464 21.8765C113.242 21.9599 109.686 22.8784 105.778 23.1414C104.747 23.2017 102.393 23.5993 100.553 23.5339C98.9668 23.5403 88.081 23.2132 86.2898 24.6884C86.2885 24.6884 86.2871 24.691 86.2857 24.6923C85.5888 25.3504 85.6289 26.2496 86.3792 26.7833C87.0835 27.2836 87.0917 27.3234 86.6043 27.8724C85.8637 28.891 83.6847 29.7197 82.9489 29.2899C82.9358 29.2823 82.9295 29.2681 82.9299 29.254C83.0842 27.5479 85.926 26.9295 84.0513 26.0598C83.4149 25.7647 81.424 25.3504 79.6624 28.4343C79.6624 28.4343 79.6609 28.4369 79.6596 28.4382C79.3146 28.9256 78.8567 29.2386 78.3032 29.5196C77.8925 29.7274 75.6383 30.5625 74.8862 30.6138C74.8862 30.6138 74.8835 30.6138 74.8822 30.6138C74.4426 30.6113 74.003 30.6087 73.5634 30.6061C73.5567 30.6061 73.55 30.6048 73.5447 30.6023C73.0993 30.3816 73.0863 30.1289 73.514 29.8441C73.7613 29.6786 73.9881 29.4811 74.2546 29.3464C78.0784 27.4273 77.4601 26.401 77.0447 25.5916C76.9659 25.3453 76.8179 25.2221 76.5444 25.3196C76.5295 25.3247 76.5122 25.3209 76.5018 25.3093C76.0707 24.818 75.5291 24.6307 74.8535 24.8219C73.8417 25.1913 72.8623 25.4569 72.0139 26.3061C71.1806 27.1399 70.471 27.9135 70.2315 29.0321C70.2284 29.0449 70.2188 29.0552 70.2053 29.059C69.3042 29.3066 69.0989 29.9262 66.788 29.8313C66.784 29.8313 66.7786 29.8313 66.7747 29.8287C66.4072 29.6928 65.2469 29.5363 65.5642 28.1777C65.5644 28.1726 65.5672 28.1675 65.57 28.1636C65.9267 27.6364 65.6954 27.3336 65.224 26.9873C64.5875 26.4613 63.8351 26.4729 63.3077 27.0155C62.5863 27.8763 60.6122 28.9013 58.9639 29.5953C58.3162 29.8416 57.6698 30.0891 57.022 30.3355C56.6968 30.4586 56.3719 30.524 56.0556 30.3355C55.8377 30.1251 54.8566 29.3195 56.4474 28.5716C57.4093 28.12 56.4913 27.1669 55.6385 25.8058C55.2269 25.149 53.1888 26.2573 52.8579 26.3933C51.6102 26.9052 52.1026 26.6499 49.7792 26.809C47.4631 27.1322 47.9722 27.5684 46.6876 28.2432C45.1827 29.0334 44.6493 29.9763 43.149 29.9865C42.6599 29.9352 42.4152 29.3451 43.0573 28.7306C45.3477 25.7211 45.3494 26.8436 47.6409 26.3946C49.2152 26.0867 48.8306 24.1009 47.9928 24.0534C46.9551 24.0599 44.6926 24.9527 44.2357 25.1362C41.3477 26.292 37.5034 27.8481 35.8066 28.4086C32.0896 29.6389 21.7617 33.9774 21.5556 34.0595C7.10894 40.7969 2.90246 42.5518 4.08568 40.77C5.52312 38.9099 10.3262 33.7491 10.8497 33.2051C11.2088 32.8793 16.9105 27.6056 16.9366 27.5812C18.8516 26.0418 33.0841 14.0949 34.0069 13.2238C34.2114 13.0558 41.0973 7.85776 41.933 7.31769C42.0825 7.28947 42.2265 7.31641 42.1962 7.58452C41.4282 8.52611 37.3373 13.2469 37.3373 13.2469C35.1643 15.6124 31.9829 18.7515 31.1203 19.6264C30.5669 20.187 31.8674 21.1697 32.8189 21.0337C34.0383 20.8605 36.1702 17.8612 36.6926 17.2622C37.1885 16.6952 49.5336 1.96445 49.4422 1.40899C49.3511 0.840697 48.8746 0.626465 48.392 0.626465C47.4872 0.626465 33.5191 10.0565 32.8692 10.8506C32.084 11.5023 22.3807 19.4815 15.6569 25.2529C11.9735 28.4138 9.32178 31.0243 9.20305 31.1462C7.64138 32.7549 2.41964 38.6867 1.69305 39.7758C1.11065 40.6494 0.736125 41.4717 0.983001 42.4556C1.54436 44.6864 5.70062 43.5678 6.42017 43.3407C10.5752 42.0284 19.9324 37.3666 25.4318 35.0665C31.5375 32.5124 36.8574 30.0212 39.4193 29.3464C39.7413 29.7607 40.0489 30.8742 40.9466 31.6439C42.1303 32.3944 43.3156 32.2405 44.4162 32.0506C45.289 31.948 48.1669 29.6825 48.9324 29.2989C50.5016 28.5126 52.7424 28.2444 52.9079 28.9295C52.8792 30.5561 53.8826 31.8505 54.7227 32.2905C55.2451 32.6792 55.7662 32.7869 56.476 32.6189C58.6433 32.107 62.3282 30.2149 62.3942 30.1559C62.8553 29.7338 63.2732 29.7454 63.4429 30.329C63.6749 31.1282 65.4137 32.0647 66.1803 32.0211C68.291 32.0878 68.9026 31.6016 69.3 31.295C70.2161 31.2283 70.7788 31.7594 71.036 32.0018C72.0967 32.5047 72.2333 32.556 75.5519 33.0897C78.523 31.5529 78.7992 31.4092 79.3577 31.2809 79.9193 30.9538 80.4477 31.4631C81.0988 32.0904 81.6246 32.0313 82.8004 31.7863C84.7104 31.508 87.5 30.8883 90.1396 27.7595C90.4309 27.4132 90.2265 26.918 90.4072 26.4074C91.5516 25.3311 98.5553 25.6185 99.4386 25.6185C102.213 25.6185 105.898 25.0528 106.913 24.945C110.826 24.5332 113.568 23.4929 114.503 23.0464C114.97 22.7527 115.397 22.491 115.345 21.8906L115.346 21.8893Z" fill="currentColor"/>
  </svg>
)

// ─── NAV ──────────────────────────────────────────────────────

const LainNav = ({ visible }: { visible: boolean }) => {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <header className={`lain-header ${scrolled ? 'scrolled' : ''} ${visible ? 'nav-visible' : 'nav-hidden'}`}>
        <a href="#" className="lain-header-logo">
          <SignatureLogo />
        </a>
        <button className={`lain-burger ${open ? 'open' : ''}`} onClick={() => setOpen(!open)}>
          <i /><i /><i />
        </button>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="lain-nav-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setOpen(false)}
          >
            <motion.nav
              className="lain-nav-panel"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
              onClick={e => e.stopPropagation()}
            >
              <ul>
                {NAV_LINKS.map(l => (
                  <li key={l.href}>
                    <a className="lain-nav-link" href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="lain-nav-socials">
                <a href="https://www.instagram.com/lain098_" target="_blank">Instagram</a>
                <a href="https://throne.com/lain098_" target="_blank">Throne</a>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

// ─── HERO SCRIPT SVG (BACKGROUND) ────────────────────────────

// (Script path is kept as a subtle decorative element over the sky)
const HeroScript = () => (
  <div className="hero-script-bg" aria-hidden>
    <svg viewBox="0 0 1285 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g>
        <path className="script-path" d="M110.5 50.5045C110.5 50.5045 50 112 23.0001 142.005C-3.99987 172.009 -2.49995 190.605 41.5 161.005C96.5 124.005 212 31.0045 227 7.50452C242 -15.9955 98.5 133.005 79.5 157.005C60.5 181.005 123.5 123.505 128 126.505C132.5 129.505 110 167.004 135.5 157.005C161 147.005 211 98.5046 217 105.005C223 111.505 198 132.005 192.5 126.505C185.895 119.9 176 153.005 196 142.005C211.705 133.367 282 101.005 289 99.0046C296 97.0046 249 155.244 249.5 136.005" strokeLinecap="butt" />
        <path className="script-path" d="M289.63 127.003C306.964 118.836 337.23 102.403 319.63 102.003C297.63 101.503 261.13 165.503 303.63 140.503C337.63 120.503 343.13 113.836 341.63 113.003" strokeLinecap="butt" />
        <path className="script-path" d="M7.5 85.5C63.3333 83.5 185 78.2 225 73" strokeLinecap="butt" />
        <path className="script-path" d="M445 119C445 119 451 109.5 446.5 108.5C442 107.5 386.6 132.7 395 141.5C405.5 152.5 428.5 132.5 432 129.5C435.5 126.5 407.5 148.5 425 145C442.5 141.5 514 101.5 514 94.5C514 87.5 498.5 99.5 508.5 114.5C518.5 129.5 470 138 486 145C502 152 572.486 113.195 568 107C557.5 92.5 500 151 535.5 141.5C563.9 133.9 586 120.333 593.5 114.5" strokeLinecap="butt" />
        <path className="script-path" d="M640 133C658 119 693.7 93.4 692.5 103C691 115 677 129 651.5 150C626 171 686.5 111.5 699.5 116.5C712.5 121.5 700 136 695 141C690 146 729 108 729.5 120.5C730 133 706 157.5 737 141C768 124.5 808 90.5 800 105.5C792 120.5 769.5 152.5 795 136.5C820.5 120.5 847 101 848.5 96.5C850 92 689.5 239 699.5 255" strokeLinecap="butt" />
        <path className="script-path" d="M890.5 129.5C912 116.333 954.6 91.9 953 99.5C951 109 923.5 135.5 920 140C916.5 144.5 1049.5 56 1055 42.5C1060.5 29 953 139 968.5 152.5" strokeLinecap="butt" />
        <path className="script-path" d="M1044 104C1027.17 111.5 995 129.8 1001 143C1008.5 159.5 1026 111.5 1044 112C1062 112.5 1105 94.5 1104.5 85.5C1104 76.5 1088 104.5 1098 112C1108 119.5 1052 143 1075 143C1098 143 1161 97 1169.5 97.5C1178 98 1136 122 1143 132.5" strokeLinecap="butt" />
        <path className="script-path" d="M1184 75C1180.5 78.1667 1173.9 85.2 1175.5 88" strokeLinecap="butt" />
        <path className="script-path" d="M1187.5 120.5C1203.33 113.667 1231 99.9 1215 99.5C1195 99 1160 153.5 1187.5 137C1215 120.5 1268 94 1277 94C1286 94 1241.5 143.5 1241.5 129.5" strokeLinecap="butt" />
        <path className="script-path" d="M951 71.5C989.167 65.5 1071.3 54.3 1094.5 57.5" strokeLinecap="butt" />
      </g>
    </svg>
  </div>
)

// ─── ORBIT CAROUSEL ──────────────────────────────────────────

const ArtCarousel = ({
  onPreview,
  orbitVisible,
}: {
  onPreview: (index: number) => void
  orbitVisible: boolean
}) => {
  const [rotation, setRotation] = useState(0)
  const total = FULL_CAROUSEL.length

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation(prev => prev + 0.25)
    }, 30)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`carousel ${orbitVisible ? 'orbit-visible' : 'orbit-hidden'}`} style={{ '--itemCount': total } as React.CSSProperties}>
      <div className="carousel-track" style={{ transform: `rotate(${rotation}deg)` }}>
        {FULL_CAROUSEL.map((item, idx) => (
          <button
            key={`${item.id}-${idx}`}
            className="carousel-item"
            style={{ '--item': idx } as React.CSSProperties}
            onClick={() => onPreview(idx % CAROUSEL_ITEMS.length)}
          >
            <img src={item.img} alt={item.label} />
            <span className="carousel-item-label">{item.label}</span>
          </button>
        ))}
      </div>
      <div className="carousel-center-avatar">
        <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=200&q=80" alt="Lain" />
      </div>
    </div>
  )
}

// ─── FULLSCREEN SLIDER ────────────────────────────────────────

const FullscreenSlider = ({
  items,
  initialIndex,
  onClose,
}: {
  items: typeof CAROUSEL_ITEMS
  initialIndex: number
  onClose: () => void
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = 'unset' }
  }, [])

  const goTo = (index: number) => {
    if (index < 0) index = items.length - 1
    if (index >= items.length) index = 0
    setDirection(index > currentIndex ? 1 : -1)
    setCurrentIndex(index)
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') goTo(currentIndex + 1)
    if (e.key === 'ArrowLeft') goTo(currentIndex - 1)
    if (e.key === 'Escape') onClose()
  }

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentIndex])

  const currentItem = items[currentIndex]

  return (
    <motion.div
      className="fullscreen-slider"
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      exit={{ y: '100%' }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <button className="slider-close" onClick={onClose}>
        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 6L6 18" /><path d="M6 6L18 18" />
        </svg>
      </button>

      <div className="slider-image-container">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ x: direction > 0 ? '100%' : '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: direction > 0 ? '-100%' : '100%', opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            className="slider-image-wrapper"
          >
            <img src={currentItem.img} alt={currentItem.label} />
          </motion.div>
        </AnimatePresence>
      </div>

      <p className="slider-title">{currentItem.label}</p>

      <button className="slider-nav slider-prev" onClick={() => goTo(currentIndex - 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18L9 12L15 6" /></svg>
      </button>
      <button className="slider-nav slider-next" onClick={() => goTo(currentIndex + 1)}>
        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18L15 12L9 6" /></svg>
      </button>

      <div className="slider-dots">
        {items.map((_, idx) => (
          <button key={idx} className={`slider-dot ${idx === currentIndex ? 'active' : ''}`} onClick={() => goTo(idx)} />
        ))}
      </div>
    </motion.div>
  )
}

// ─── HERO SECTION (100vh STATIC, NO PINNING) ─────────────────

const HeroSection = ({
  onPreview,
  orbitVisible,
  avatarVisible,
}: {
  onPreview: (index: number) => void
  orbitVisible: boolean
  avatarVisible: boolean
}) => {
  const heroRef = useRef<HTMLDivElement>(null)
  const bgCloudRef = useRef<HTMLDivElement>(null)
  const bgImgRef = useRef<HTMLImageElement>(null)

  // Very gentle zoom/fade out as you scroll past the hero.
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!bgCloudRef.current || !bgImgRef.current || !heroRef.current) return

    const ctx = gsap.context(() => {
      // The "white cloud" overlay fades out revealing the sky
      gsap.to(bgCloudRef.current, {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      })

      // The background sky image gently zooms in
      gsap.to(bgImgRef.current, {
        scale: 1.08,
        ease: 'none',
        scrollTrigger: {
          trigger: heroRef.current,
          start: 'top top',
          end: 'bottom top',
          scrub: 0.8,
        }
      })
    }, heroRef)

    return () => ctx.revert()
  }, [])

  return (
    <section className="hero hero-ocean-bg" ref={heroRef}>
      
      {/* SKY BACKGROUND LAYER */}
      <div className="hero-bg-container">
        <div className="hero-bg-gradient" />
        <img 
          ref={bgImgRef}
          src="https://images.unsplash.com/photo-1505533321630-975218a5f66f?w=1920&q=80" 
          alt="Blue sky and clouds" 
          className="hero-bg-img" 
        />
        <div ref={bgCloudRef} className="hero-bg-cloud-overlay" />
      </div>

      {/* Script SVG */}
      <HeroScript />

      {/* Center Carousel */}
      <div className="hero-center">
        <div className={`hero-avatar-wrap ${avatarVisible ? 'avatar-visible' : 'avatar-hidden'}`}>
          <ArtCarousel onPreview={onPreview} orbitVisible={orbitVisible} />
        </div>
      </div>

      {/* Side text */}
      <div className={`hero-side-content ${avatarVisible ? 'side-visible' : 'side-hidden'}`}>
        <div className="hero-badge">Digital Artist</div>
        <p className="hero-preview muted">
          <span className="desktop">Click artwork to preview</span>
          <span className="mobile">Tap artwork to preview</span>
        </p>
        <p className="hero-tagline">Art for the <span>dreamers</span>, the <span>storytellers</span>, and the <span>wanderers</span> — illustrations that capture emotion in every stroke.</p>
      </div>
    </section>
  )
}

// ─── INTRO STRIP ──────────────────────────────────────────────

const IntroStrip = () => (
  <section className="intro-strip">
    <div className="intro-strip-inner">
      <div className="intro-label"><span className="vertical-text">LAIN098_ — DIGITAL ARTIST</span></div>
      <div className="intro-statement">
        <p>I create worlds one frame at a time — anime illustrations that breathe, characters that feel like old friends, and animations that carry a quiet heartbeat.</p>
        <p className="intro-date">est. 2021 · open for work</p>
      </div>
      <div className="intro-stats">
        {[['100+', 'Commissions completed'], ['4', 'Art styles offered'], ['∞', 'Characters imagined']].map(([n, l]) => (
          <div key={n} className="intro-stat"><strong>{n}</strong><span>{l}</span></div>
        ))}
      </div>
    </div>
  </section>
)

// ─── WORK CHAPTER ─────────────────────────────────────────────

const WorkChapter = ({ work, index }: { work: typeof WORKS[0], index: number }) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.wc-text > *'),
      { opacity: 0, y: 40, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 72%' },
      }
    )
    gsap.fromTo(ref.current.querySelector('.wc-img') as HTMLElement,
      { scale: 1.08 },
      {
        scale: 1.0, ease: 'none',
        scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
      }
    )
  }, [])

  const isEven = index % 2 === 0
  return (
    <div ref={ref} className={`work-chapter ${isEven ? 'wc-left' : 'wc-right'}`}>
      <div className="wc-img-wrap">
        <div className="wc-img-inner"><img className="wc-img" src={work.img} alt={work.label} /></div>
        <div className="wc-num">{work.num}</div>
      </div>
      <div className="wc-text">
        <span className="wc-tagline">{work.tagline}</span>
        <h2 className="wc-headline">{work.headline.split('\n').map((line, i) => <span key={i}>{line}{i === 0 && <br />}</span>)}</h2>
        <div className="wc-accent-line" />
      </div>
    </div>
  )
}

// ─── WORKS SECTION ────────────────────────────────────────────

const WorksSection = () => {
  const headRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!headRef.current) return
    gsap.fromTo(headRef.current.querySelectorAll('.works-head-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.12, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: headRef.current, start: 'top 80%' },
      }
    )
  }, [])
  return (
    <section id="works" className="works">
      <div ref={headRef} className="section-head">
        <h2 className="works-head-el section-title">What I <em>create</em></h2>
        <p className="works-head-el section-sub">Four pillars of my practice</p>
      </div>
      <div className="works-chapters">{WORKS.map((w, i) => <WorkChapter key={w.id} work={w} index={i} />)}</div>
    </section>
  )
}

// ─── GALLERY STRIP ────────────────────────────────────────────

const GalleryStrip = () => {
  const ref = useRef<HTMLDivElement>(null)
  const galleryImgs = [
    'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80',
    'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&q=80',
    'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=400&q=80',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=400&q=80',
    'https://images.unsplash.com/photo-1549317336-206569e8475c?w=400&q=80',
    'https://images.unsplash.com/photo-1501366062246-723b4d3e4eb6?w=400&q=80',
    'https://images.unsplash.com/photo-1526289034009-0240ddb68ce3?w=400&q=80',
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&q=80',
  ]

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    const cards = ref.current.querySelectorAll('.gallery-card')
    gsap.fromTo(cards,
      { opacity: 0, y: 40, scale: 0.95, filter: 'blur(4px)' },
      {
        opacity: 1, y: 0, scale: 1, filter: 'blur(0px)',
        stagger: 0.07, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 78%' },
      }
    )
    gsap.to(ref.current.querySelector('.gallery-row-top') as HTMLElement, {
      xPercent: -6, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
    gsap.to(ref.current.querySelector('.gallery-row-bot') as HTMLElement, {
      xPercent: 6, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
    })
  }, [])

  return (
    <section className="gallery" ref={ref}>
      <div className="section-head">
        <h2 className="section-title">Recent <em>works</em></h2>
        <p className="section-sub">Selected pieces</p>
      </div>
      <div className="gallery-row gallery-row-top">
        {galleryImgs.slice(0, 4).map((src, i) => (
          <div key={i} className="gallery-card"><img src={src} alt={`artwork ${i + 1}`} /><div className="gallery-card-overlay"><span>View</span></div></div>
        ))}
      </div>
      <div className="gallery-row gallery-row-bot">
        {galleryImgs.slice(4).map((src, i) => (
          <div key={i} className="gallery-card"><img src={src} alt={`artwork ${i + 5}`} /><div className="gallery-card-overlay"><span>View</span></div></div>
        ))}
      </div>
    </section>
  )
}

// ─── DISCOGRAPHY (COVEO-STYLE CLICK BURST) ───────────────────

type BurstItem = { id: number; x: number; y: number; imgs: string[] }

const DiscographySection = () => {
  const [bursts, setBursts] = useState<BurstItem[]>([])
  const sectionRef = useRef<HTMLDivElement>(null)
  const burstIdRef = useRef(0)

  const releases = [
    { id: 'hold-out-hope',         title: 'hold out hope',             date: 'September 2025', type: 'single, 4 songs',  duration: '12 minutes 22 seconds', artwork: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=140&q=80' },
    { id: 'wanna-get-to-know-you', title: 'wanna get to know you',     date: 'September 2022', type: 'single, 1 song',   duration: '3 minutes 19 seconds',  artwork: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=140&q=80' },
    { id: 'just-a-memory-stripped', title: 'Just a Memory (Stripped)', date: 'January 2021',   type: 'single, 1 song',   duration: '3 minutes 49 seconds',  artwork: 'https://images.unsplash.com/photo-1560707303-4e980ce876ad?w=140&q=80' },
    { id: 'just-a-memory',         title: 'Just a Memory',             date: 'November 2020',  type: 'single, 1 song',   duration: '3 minutes 43 seconds',  artwork: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=140&q=80' },
    { id: 'still-dreaming',        title: 'Still Dreaming',            date: 'January 2020',   type: 'single, 1 song',   duration: '4 minutes 9 seconds',   artwork: 'https://images.unsplash.com/photo-1549317336-206569e8475c?w=140&q=80' },
  ]

  const handleSectionClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (sectionRef.current) {
      const rect = sectionRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      const id = burstIdRef.current++

      // Shuffle imgs for variety
      const shuffled = [...BURST_IMGS].sort(() => Math.random() - 0.5).slice(0, 6)

      setBursts(prev => [...prev, { id, x, y, imgs: shuffled }])

      // Remove burst after animation completes
      setTimeout(() => {
        setBursts(prev => prev.filter(b => b.id !== id))
      }, 900)
    }
  }

  return (
    <section id="discography" className="discography">
      <div className="section-head">
        <h2 className="section-title">Discography <span>The complete works</span></h2>
        <p className="section-sub">all releases — ordered by newest first</p>
      </div>
      <div className="discography-list">
        {releases.map((release, idx) => (
          <div key={release.id} className="discography-item">
            <div className="discography-row">
              <span className="disc-index muted">{String(releases.length - idx).padStart(3, '0')}</span>
              <div className="discography-artwork">
                <img src={release.artwork} alt={release.title} />
              </div>
              <div className="discography-info">
                <p className="disc-title">{release.title}</p>
                <div className="discography-meta">
                  <span className="muted">{release.date}</span>
                  <span className="muted">{release.type}</span>
                  <span className="muted">{release.duration}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Click burst particles — positioned relative to section */}
      {bursts.map(burst => (
        <div
          key={burst.id}
          className="disc-burst-container"
          style={{ left: burst.x, top: burst.y }}
          aria-hidden
        >
          {burst.imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="disc-burst-img"
              style={{ '--burst-i': i, '--burst-total': burst.imgs.length } as React.CSSProperties}
            />
          ))}
        </div>
      ))}
    </section>
  )
}

// ─── COMMISSIONS (FIXED CARD CLIPPING) ───────────────────────

const CommissionsSection = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const items = COMMISSION_TIERS

  return (
    <section id="commissions" className="commissions">
      <div className="section-head">
        <h2 className="section-title">Let's create <em>together</em></h2>
        <p className="section-sub">all slots ordered by popularity</p>
      </div>

      <div className="commissions-wrapper">
        <div className="ocean-glow-bg" />

        <div className="commissions-scroll-container">
          {items.map((item, idx) => {
            const isHovered = hoveredIndex === idx
            return (
              <div
                key={item.id}
                className={`commission-card ${isHovered ? 'hovered' : ''}`}
                onMouseEnter={() => setHoveredIndex(idx)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="commission-img-wrap">
                  <img src={BURST_IMGS[idx % BURST_IMGS.length]} alt={item.title} />
                </div>
                <div className="commission-meta">
                  <span className="commission-num">/ {String(idx + 1).padStart(2, '0')}</span>
                  <span className="commission-label">{item.title}</span>
                </div>
              </div>
            )
          })}
        </div>

        <div className="commission-text-wrapper">
          <AnimatePresence mode="wait">
            <motion.div
              key={hoveredIndex !== null ? hoveredIndex : 0}
              initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: 10, filter: 'blur(8px)' }}
              transition={{ duration: 0.4, ease: 'power3.out' }}
              className="commission-active-text"
            >
              <p className="commission-active-title">{items[hoveredIndex !== null ? hoveredIndex : 0].title}</p>
              <p className="commission-active-desc muted">{items[hoveredIndex !== null ? hoveredIndex : 0].desc}</p>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

// ─── ABOUT ────────────────────────────────────────────────────

const AboutSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.about-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.9, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 75%' },
      }
    )
    gsap.to(ref.current.querySelector('.about-bg-text') as HTMLElement, {
      yPercent: -15, ease: 'none',
      scrollTrigger: { trigger: ref.current, start: 'top bottom', end: 'bottom top', scrub: true },
    })
  }, [])
  return (
    <section id="about" className="about">
      <div className="about-bg-text" aria-hidden>LAIN</div>
      <div className="about-inner">
        <div className="about-img-col about-el">
          <div className="about-img-frame">
            <img src="https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&q=80" alt="Lain working" />
          </div>
          <div className="about-img-tag about-el"><span className="vertical-text">DIGITAL ARTIST · 2021</span></div>
          <div className="about-float-small about-float1">✦</div>
          <div className="about-float-small about-float2">◈</div>
        </div>
        <div className="about-text-col">
          <span className="about-el section-eyebrow">About</span>
          <h2 className="about-el about-title">The art of Sonic and Visual <span>Storytelling</span></h2>
          <p className="about-el about-p">I'm a digital artist whose work focuses on anime-style illustrations — fanart, original characters, chibi, and short animations. I enjoy creating unique characters and bringing ideas to life through art.</p>
          <p className="about-el about-p">My style lives in soft colours, expressive eyes, and the quiet in-between moments — the kind of art that feels like a warm afternoon.</p>
          <p className="about-el about-p">Behind each piece is a meticulous process — from initial sketch to final render. I craft each work to connect emotionally and aesthetically.</p>
          <div className="about-el about-tags">
            {['Anime Illustration', 'Fanart', 'Original Characters', 'Chibi', 'Short Animation', 'Character Design'].map(t => <span key={t} className="tag">{t}</span>)}
          </div>
          <div className="about-el about-links">
            <a href="https://www.instagram.com/lain098_" target="_blank" className="btn-dark">Instagram</a>
            <a href="https://throne.com/lain098_" target="_blank" className="btn-ghost">Throne Wishlist</a>
          </div>
        </div>
      </div>
    </section>
  )
}

// ─── CONTACT ──────────────────────────────────────────────────

const ContactSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.contact-el'),
      { opacity: 0, y: 30, filter: 'blur(6px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])
  return (
    <section id="contact" className="contact">
      <div className="contact-inner">
        <div className="contact-el contact-sig">
          <SignatureLogo />
          <div className="contact-sig-line" />
        </div>
        <h2 className="contact-el contact-title">Got an idea?<br /><em>Let's talk.</em></h2>
        <p className="contact-el contact-sub">Whether you want a commission, a collaboration, or just want to say hi — my DMs are always open.</p>
        <div className="contact-el contact-cards">
          <a href="https://www.instagram.com/lain098_" target="_blank" className="contact-card">
            <span className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="5" /><circle cx="19.5" cy="4.5" r="1.5" fill="currentColor" stroke="none" />
              </svg>
            </span>
            <strong>Instagram</strong>
            <span className="muted">@lain098_</span>
          </a>
          <a href="https://throne.com/lain098_" target="_blank" className="contact-card">
            <span className="contact-card-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 11l3-6 2 4 4-5 4 5 2-4 3 6v8H3z" /><path d="M5 19h14" />
              </svg>
            </span>
            <strong>Throne</strong>
            <span className="muted">throne.com/lain098_</span>
          </a>
        </div>
        <p className="contact-el contact-note muted">For commissions, please check my Throne page for current availability and pricing tiers.</p>
      </div>
    </section>
  )
}

// ─── ZEN TYPOGRAPHY SECTION ──────────────────────────────────

const ZenSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.zen-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.1, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="zen-section" ref={ref}>
      <div className="zen-inner">
        <div className="zen-content zen-el">
          <div className="zen-char-box">
            <span className="zen-char">樸</span>
            <span className="zen-char">素</span>
            <div className="zen-stamp" />
          </div>
          <div className="zen-vert-text">
            愛護天地 萬物及眾生<br />
            生活回歸 自然形態
          </div>
          <div className="zen-scatter-text">少欲 知足</div>
          <div className="zen-scatter-right">清淨調和<br />如規如律</div>
        </div>
        <div className="zen-collage zen-el">
          <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80" alt="sky" />
          <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80" alt="clouds" />
          <img src="https://images.unsplash.com/photo-1518173946687-a4c8892bbd9f?w=800&q=80" alt="tree" />
        </div>
      </div>
    </section>
  )
}

// ─── BLUE GRID SCRAPBOOK SECTION ────────────────────────────

const GridSection = () => {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return
    gsap.fromTo(ref.current.querySelectorAll('.grid-el'),
      { opacity: 0, y: 30, filter: 'blur(8px)' },
      {
        opacity: 1, y: 0, filter: 'blur(0px)',
        stagger: 0.08, duration: 0.8, ease: 'power3.out',
        scrollTrigger: { trigger: ref.current, start: 'top 80%' },
      }
    )
  }, [])

  return (
    <section className="grid-section" ref={ref}>
      <div className="grid-inner">
        <div className="grid-bg-line" />
        <div className="grid-bg-line-2" />
        
        <div className="grid-text-top grid-el">No one can get closer to each other</div>
        <div className="grid-text-center grid-el">
          没有人能够比<br />
          <span className="j-big">我们</span><br />
          接近 对方。
        </div>
        <div className="grid-text-bottom grid-el">
          就这样并肩躺在<br />一望无际麦田的中央
        </div>
        <div className="grid-text-tiny grid-el">
          直到再没有人能够<br />比我们更为接近对方
        </div>

        <div className="grid-img-vert grid-el"><img src="https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=600&q=80" alt="Tall forest" /></div>
        <div className="grid-img-sml grid-el"><img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80" alt="Grass" /></div>
        <div className="grid-img-sq grid-el"><img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80" alt="Sunset" /></div>
        <div className="grid-img-sq2 grid-el"><img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80" alt="Mountain" /></div>

        <div className="grid-swatches grid-el">
          <div className="g-swatch" style={{ background: '#1b3d5c' }} />
          <div className="g-swatch" style={{ background: '#4f8eb3' }} />
          <div className="g-swatch" style={{ background: '#7ec3e2' }} />
        </div>
      </div>
    </section>
  )
}

// ─── FOOTER (NO SMALL SIGNATURE, BIG CENTER LOGO WITH MIZUMI) ─

const Footer = () => (
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

/* @arkzen:web:components:shared:end */

// ────────────────────────────────────────────────────────────────
// WEB STYLE
// ────────────────────────────────────────────────────────────────

/* @arkzen:web:style */

@import url('https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap');

/* ── CSS VARIABLES ───────────────────────────────────────────── */

.lain-root {
  --bg: #ffffff;
  --bg-alt: #fafaf8;
  --text: #1D1812;
  --text-light: rgba(29,24,18,0.6);
  --muted: rgba(29,24,18,0.45);
  --border: rgba(29,24,18,0.08);
  --border-strong: rgba(29,24,18,0.12);
  --shadow: rgba(0,0,0,0.05);
  --nav-bg: rgba(255, 255, 255, 0.15);
  --nav-border: rgba(255, 255, 255, 0.2);

  background-color: transparent; /* Make Root transparent so the Orb bleeds through */
  color: var(--text);
  transition: background-color 1s ease, color 1s ease, border-color 1s ease;
  
  margin: 0; padding: 0;
  font-family: 'Inter', sans-serif;
  font-weight: 400;
  
  -webkit-font-smoothing: antialiased;
  overflow-x: hidden;
}

/* ⭐ GLOBAL BLEEDING BLUE GRADIENT ORB ⭐ */
.global-bg-bleed {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(ellipse at 50% 0%, rgba(100, 180, 240, 0.35) 0%, transparent 70%);
  pointer-events: none;
  z-index: -1;
}

* { box-sizing: border-box; }
a { text-decoration: none; color: inherit; }
img { display: block; width: 100%; object-fit: cover; }
ul { list-style: none; margin: 0; padding: 0; }
.muted { opacity: 0.45; }
.uppercase { text-transform: uppercase; }

/* ── SIGNATURE LOGO ──────────────────────────────────────────── */

.signature-logo {
  color: var(--text);
  width: 80px;
  height: auto;
  display: block;
}
.signature-logo path { fill: currentColor; }

/* ── HEADER ──────────────────────────────────────────────────── */

.lain-header {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 40px;
  transition: background 0.4s ease, backdrop-filter 0.4s ease, opacity 0.6s ease, filter 0.6s ease, transform 0.6s ease, color 0.6s ease;
}
.lain-header.scrolled {
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(20px);
  box-shadow: 0 1px 0 var(--border);
}
.lain-header-logo {
  display: flex; align-items: center;
}
/* Nav entrance states */
.nav-hidden {
  opacity: 0;
  filter: blur(12px);
  transform: translateY(-8px);
  pointer-events: none;
}
.nav-visible {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0);
  pointer-events: all;
}

.lain-burger {
  background: none; border: none; cursor: pointer;
  padding: 8px; display: flex; flex-direction: column; gap: 5px; align-items: flex-end;
}
.lain-burger i {
  display: block; height: 1.5px; background: var(--text);
  border-radius: 1px; transition: all 0.3s ease;
}
.lain-burger i:nth-child(1) { width: 26px; }
.lain-burger i:nth-child(2) { width: 18px; }
.lain-burger i:nth-child(3) { width: 26px; }
.lain-burger.open i:nth-child(1) { transform: translateY(7px) rotate(45deg); width: 24px; }
.lain-burger.open i:nth-child(2) { opacity: 0; }
.lain-burger.open i:nth-child(3) { transform: translateY(-7px) rotate(-45deg); width: 24px; }

/* GLASSMORPHISM MENU OVERLAY */
.lain-nav-overlay {
  position: fixed; inset: 0; z-index: 900;
  background: var(--nav-bg);
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
}
.lain-nav-panel {
  position: absolute; top: 0; right: 0; bottom: 0;
  width: min(360px, 90vw); 
  background: rgba(255, 255, 255, 0.25);
  border-left: 1px solid var(--nav-border);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  display: flex; flex-direction: column; justify-content: center;
  padding: 60px 48px;
}
.lain-nav-panel ul { display: flex; flex-direction: column; gap: 0; margin-bottom: 48px; }
.lain-nav-link {
  font-family: 'Inter', sans-serif;
  font-size: clamp(26px, 4vw, 38px); font-weight: 800;
  color: inherit; letter-spacing: -0.02em;
  display: block; padding: 10px 0;
  border-bottom: 1px solid var(--border);
  transition: color 0.2s, padding-left 0.3s;
}
.lain-nav-link:hover { color: var(--muted); padding-left: 8px; }
.lain-nav-socials { display: flex; gap: 16px; padding-top: 24px; }
.lain-nav-socials a {
  font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--muted); transition: color 0.2s;
}
.lain-nav-socials a:hover { color: var(--text); }

/* ── BUTTONS ──────────────────────────────────────────────────── */

.btn-dark, .btn-ghost, .btn-tier {
  display: inline-flex; align-items: center; justify-content: center; gap: 6px;
  padding: 11px 24px; border-radius: 100px;
  font-family: 'Inter', sans-serif;
  font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; text-transform: uppercase;
  cursor: pointer; transition: all 0.22s ease;
  border: 1.5px solid transparent;
  white-space: nowrap;
}
.btn-dark { background: var(--text); color: var(--bg); }
.btn-dark:hover { background: #3a3228; transform: translateY(-2px); }
.btn-ghost { background: transparent; color: inherit; border-color: var(--border-strong); }
.btn-ghost:hover { border-color: var(--text); transform: translateY(-2px); }
.btn-tier { background: rgba(29,24,18,0.06); color: inherit; border-color: var(--border); }
.btn-tier:hover { background: rgba(29,24,18,0.12); }

/* ── HERO ────────────────────────────────────────────────────── */

.hero {
  position: relative;
  height: 100vh;
  display: block;
  overflow: hidden;
  padding: 0;
  z-index: 0;
}

/* The Sky Background Container */
.hero-bg-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}
.hero-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}
.hero-bg-gradient {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 35%;
  background: linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0) 100%);
  z-index: 2;
  pointer-events: none;
  transition: background 1s ease;
}
.hero-bg-cloud-overlay {
  position: absolute;
  inset: 0;
  background: #ffffff;
  z-index: 1;
  pointer-events: none;
  transition: background 1s ease;
}

/* Script lives as a background decorative layer */
.hero-script-bg {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 40px;
  z-index: 1;
  pointer-events: none;
  opacity: 0.9; /* Increased visibility */
}
.hero-script-bg svg {
  width: 100%;
  max-width: 1200px;
  height: auto;
}
/* ⭐ SIGNATURE CHANGE TO BLUE ⭐ */
.script-path {
  stroke: rgba(0, 119, 190, 0.6);
  stroke-width: 2;
  fill: none;
  stroke-dasharray: 1000;
  stroke-dashoffset: 1000;
}

/* STICKY CAROUSEL LAYER */
.hero-center {
  position: sticky;
  top: 0;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  z-index: 2;
}

.hero-avatar-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.6s ease, transform 0.6s ease, filter 0.6s ease;
}
.avatar-hidden {
  opacity: 0;
  transform: scale(0);
  filter: blur(4px);
  pointer-events: none;
}
.avatar-visible {
  opacity: 1;
  transform: scale(1);
  filter: blur(0px);
}

/* Side text */
.hero-side-content {
  position: absolute;
  bottom: 64px;
  left: 40px;
  z-index: 3;
  display: flex; flex-direction: column; gap: 12px;
  max-width: 340px;
  transition: opacity 0.7s ease, filter 0.7s ease, transform 0.7s ease;
}
.side-hidden {
  opacity: 0;
  filter: blur(8px);
  transform: translateY(12px);
  pointer-events: none;
}
.side-visible {
  opacity: 1;
  filter: blur(0px);
  transform: translateY(0);
}
.hero-badge {
  display: inline-block; padding: 6px 14px;
  border: 1px solid var(--border); border-radius: 100px;
  font-size: 10px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--muted); background: rgba(255,255,255,0.7); backdrop-filter: blur(8px);
  align-self: flex-start;
}
.hero-preview {
  font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase;
}
.hero-tagline {
  font-size: 13px; line-height: 1.8; color: var(--muted);
}
.hero-tagline span { font-style: italic; color: var(--text); font-weight: 600; }

/* ── ORBIT CAROUSEL ──────────────────────────────────────────── */

.carousel {
  position: relative;
  width: 100%;
  max-width: 780px;
  height: 620px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
}

.orbit-hidden .carousel-track { transform: scale(0) rotate(0deg) !important; opacity: 0; }
.orbit-visible .carousel-track { opacity: 1; }

.carousel-track {
  position: absolute;
  top: 50%; left: 50%;
  width: 0; height: 0;
  transform-origin: center center;
  transition: opacity 0.4s ease;
}
.carousel-item {
  position: absolute;
  top: 50%; left: 50%;
  width: 110px; height: 110px;
  border-radius: 18px;
  overflow: hidden;
  border: none;
  background: transparent;
  cursor: pointer;
  transform:
    translate(-50%, -50%)
    rotate(calc(var(--item) * 360deg / var(--itemCount)))
    translateX(320px)
    rotate(calc(-1 * var(--item) * 360deg / var(--itemCount)));
  transition: transform 0.35s ease, opacity 0.3s ease;
  box-shadow: 0 4px 28px var(--shadow);
  opacity: 0.5;
}
.carousel-item img { width: 100%; height: 100%; object-fit: cover; }
.carousel-item:hover {
  transform:
    translate(-50%, -50%)
    rotate(calc(var(--item) * 360deg / var(--itemCount)))
    translateX(340px)
    rotate(calc(-1 * var(--item) * 360deg / var(--itemCount)))
    scale(1.15);
  z-index: 10; opacity: 1;
}
.carousel-item-label {
  position: absolute; bottom: 8px; left: 50%;
  transform: translateX(-50%);
  font-size: 8px; letter-spacing: 0.08em; text-transform: uppercase;
  color: rgba(255,255,255,0.9);
  background: rgba(0,0,0,0.5);
  padding: 3px 12px; border-radius: 100px;
  white-space: nowrap;
  opacity: 0; transition: opacity 0.25s;
}
.carousel-item:hover .carousel-item-label { opacity: 1; }
.carousel-center-avatar {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 110px; height: 110px;
  border-radius: 50%; overflow: hidden;
  border: 3px solid #fff;
  box-shadow: 0 8px 48px rgba(0,0,0,0.15);
  z-index: 10;
  pointer-events: none;
}
.carousel-center-avatar img { width: 100%; height: 100%; object-fit: cover; }

/* ── FULLSCREEN SLIDER ────────────────────────────────────────── */

.fullscreen-slider {
  position: fixed; inset: 0; z-index: 3000;
  background: rgba(0,0,0,0.92); backdrop-filter: blur(8px);
  display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px;
}
.slider-close {
  position: absolute; top: 24px; right: 32px;
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.6); transition: color 0.2s, transform 0.2s; z-index: 10;
}
.slider-close:hover { color: #fff; transform: scale(1.1); }
.slider-image-container {
  flex: 1; display: flex; align-items: center; justify-content: center;
  width: 100%; max-height: 80vh; overflow: hidden; position: relative;
}
.slider-image-wrapper {
  width: 100%; max-height: 80vh;
  display: flex; align-items: center; justify-content: center;
}
.slider-image-wrapper img { width: auto; max-width: 100%; max-height: 80vh; object-fit: contain; border-radius: 8px; }
.slider-title {
  color: #fff; font-size: 24px; font-weight: 700;
  margin: 20px 0 0; text-align: center;
}
.slider-nav {
  position: absolute; top: 50%; transform: translateY(-50%);
  background: none; border: none; cursor: pointer;
  color: rgba(255,255,255,0.4); transition: color 0.2s, transform 0.2s; z-index: 10; padding: 12px;
}
.slider-nav:hover { color: #fff; transform: translateY(-50%) scale(1.1); }
.slider-prev { left: 16px; }
.slider-next { right: 16px; }
.slider-dots {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; gap: 10px; z-index: 10;
}
.slider-dot {
  width: 10px; height: 10px; border-radius: 50%; border: none;
  background: rgba(255,255,255,0.25); cursor: pointer;
  transition: background 0.2s, transform 0.2s; padding: 0;
}
.slider-dot.active { background: #fff; transform: scale(1.25); }
.slider-dot:hover { background: rgba(255,255,255,0.6); }

/* ── INTRO STRIP (DARK GLASS, RESTORED BG) ──────────────────── */

.intro-strip { 
  background: rgba(29, 24, 18, 0.85);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 80px 40px;
}
.intro-strip-inner {
  max-width: 1200px; margin: 0 auto;
  display: grid; grid-template-columns: auto 1fr auto; gap: 60px; align-items: center;
}
.vertical-text {
  writing-mode: vertical-rl; text-orientation: mixed; transform: rotate(180deg);
  font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
  color: rgba(255,255,255,0.3); white-space: nowrap; font-weight: 500;
}
.intro-statement p {
  font-size: clamp(17px, 2.4vw, 24px); font-style: italic; font-weight: 300;
  color: rgba(255,255,255,0.85); line-height: 1.65; margin: 0 0 12px;
}
.intro-date {
  font-size: 10px !important; font-style: normal !important;
  font-weight: 600 !important; letter-spacing: 0.16em !important;
  text-transform: uppercase; color: rgba(255,255,255,0.35) !important;
}
.intro-stats { display: flex; flex-direction: column; gap: 28px; }
.intro-stat { display: flex; flex-direction: column; gap: 2px; }
.intro-stat strong { font-size: 30px; font-weight: 900; color: #fff; line-height: 1; }
.intro-stat span { font-size: 9px; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(255,255,255,0.3); font-weight: 500; }

/* ── SECTION SHARED ───────────────────────────────────────────── */

.section-head { max-width: 1200px; margin: 0 auto 64px; padding: 0 40px; display: flex; flex-direction: column; gap: 12px; }
.section-eyebrow { font-size: 10px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase; color: var(--muted); }
.section-title {
  font-size: clamp(36px, 5.5vw, 68px); font-weight: 900;
  color: inherit; line-height: 1.05; margin: 0; letter-spacing: -0.03em;
}
.section-title em { font-style: italic; font-weight: 300; color: var(--muted); }
.section-title span { font-style: italic; font-weight: 300; color: var(--muted); font-size: 0.65em; display: block; }
.section-sub { font-size: 10px; font-weight: 600; letter-spacing: 0.14em; text-transform: uppercase; color: var(--muted); margin: 0; }

/* ── WORKS ───────────────────────────────────────────────────── */

.works { padding: 100px 0; overflow: hidden; }
.works-chapters { display: flex; flex-direction: column; }
.work-chapter { display: grid; grid-template-columns: 1fr 1fr; min-height: 520px; overflow: hidden; }
.work-chapter.wc-right { direction: rtl; }
.work-chapter.wc-right .wc-text { direction: ltr; }
.wc-img-wrap { position: relative; overflow: hidden; background: rgba(250,250,248,0.8); backdrop-filter: blur(4px); }
.wc-img-inner { position: absolute; inset: -10%; overflow: hidden; }
.wc-img { width: 100%; height: 100%; object-fit: cover; }
.wc-num { position: absolute; bottom: 24px; right: 24px; font-size: 11px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(255,255,255,0.6); }
.wc-text { display: flex; flex-direction: column; justify-content: center; padding: 64px 56px; gap: 20px; background: rgba(255,255,255,0.8); backdrop-filter: blur(8px); }
.wc-tagline { font-size: 9px; font-weight: 700; letter-spacing: 0.22em; text-transform: uppercase; color: var(--muted); }
.wc-headline { font-size: clamp(30px, 4vw, 52px); font-weight: 900; color: inherit; line-height: 1.1; margin: 0; letter-spacing: -0.03em; }
.wc-accent-line { width: 36px; height: 1.5px; background: var(--text); opacity: 0.3; margin-top: 4px; }

/* ── GALLERY ──────────────────────────────────────────────────── */

.gallery { padding: 100px 0; overflow: hidden; }
.gallery-row { display: flex; gap: 16px; padding: 0 40px; margin-bottom: 16px; }
.gallery-card { flex: 0 0 auto; width: clamp(200px, 22vw, 300px); position: relative; overflow: hidden; border-radius: 16px; cursor: pointer; }
.gallery-card img { width: 100%; aspect-ratio: 3/4; object-fit: cover; transition: transform 0.5s ease; }
.gallery-card:hover img { transform: scale(1.05); }
.gallery-card-overlay { position: absolute; inset: 0; background: rgba(29,24,18,0.3); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s; }
.gallery-card:hover .gallery-card-overlay { opacity: 1; }
.gallery-card-overlay span { font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #fff; }

/* ── DISCOGRAPHY ──────────────────────────────────────────────── */

.discography {
  padding: 100px 0;
  background: rgba(250,250,248,0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  cursor: crosshair;
  user-select: none;
  transition: background 1s ease;
}
.discography-list { max-width: 1200px; margin: 0 auto; padding: 0 40px; }
.discography-item {
  padding: 16px 0;
  border-bottom: 1px solid var(--border);
}
.discography-item:first-child { border-top: 1px solid var(--border); }
.discography-row { display: flex; align-items: center; gap: 20px; }
.disc-index { font-size: 11px; font-weight: 700; letter-spacing: 0.14em; min-width: 36px; }
.discography-artwork { width: 48px; height: 48px; border-radius: 8px; overflow: hidden; flex-shrink: 0; border: 1px solid var(--border); }
.discography-artwork img { width: 100%; height: 100%; object-fit: cover; }
.discography-info { flex: 1; }
.disc-title { font-size: 16px; font-weight: 700; margin: 0 0 2px; letter-spacing: -0.01em; }
.discography-meta { display: flex; gap: 16px; flex-wrap: wrap; font-size: 9px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; }

/* ── COVEO-STYLE CLICK BURST ─────────────────────────────────── */

.disc-burst-container {
  position: absolute;
  pointer-events: none;
  z-index: 50;
  /* anchor to click point */
  transform: translate(-50%, -50%);
}
.disc-burst-img {
  position: absolute;
  width: 72px;
  height: 72px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 6px 24px rgba(0,0,0,0.15);
  /* Each image fans out in a different direction */
  --angle: calc(var(--burst-i) * (360deg / var(--burst-total)));
  --dist: 90px;
  animation: burstFly 0.85s cubic-bezier(0.22, 1, 0.36, 1) forwards;
  animation-delay: calc(var(--burst-i) * 0.04s);
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.4) rotate(var(--angle)) translateY(0);
}
@keyframes burstFly {
  0%   { opacity: 0;   transform: translate(-50%, -50%) scale(0.3)  rotate(var(--angle)) translateY(0px);    filter: blur(4px); }
  30%  { opacity: 1;   transform: translate(-50%, -50%) scale(1.05) rotate(var(--angle)) translateY(-80px);  filter: blur(0px); }
  60%  { opacity: 1;   transform: translate(-50%, -50%) scale(1.0)  rotate(var(--angle)) translateY(-100px); filter: blur(0px); }
  100% { opacity: 0;   transform: translate(-50%, -50%) scale(0.8)  rotate(var(--angle)) translateY(-130px); filter: blur(6px); }
}

/* ── COMMISSIONS ──────────────────────────────────────────────── */

.commissions {
  padding: 100px 0 120px;
  position: relative;
  overflow: visible;
  background: rgba(255,255,255,0.6);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
.commissions-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 32px;
  /* Extra padding top prevents scaled cards from clipping at the ceiling */
  padding-top: 40px; 
  padding-bottom: 20px;
}
.commissions-scroll-container {
  display: flex;
  overflow-x: auto;
  overflow-y: visible; /* Critical! Prevents hover scaling from being cut at top */
  gap: 24px;
  padding: 0 40px;
  position: relative;
  z-index: 1;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
}
.commissions-scroll-container::-webkit-scrollbar { display: none; }

.commission-card {
  flex-shrink: 0;
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
  width: 260px;
  aspect-ratio: 3 / 4;
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  box-shadow: 0 4px 12px var(--shadow);
}
.commission-card.hovered {
  transform: scale(1.12);
  z-index: 2;
  box-shadow: 0 16px 48px var(--shadow);
}
.commission-card:not(.hovered) {
  transform: scale(0.9);
  opacity: 0.7;
  filter: saturate(0.7);
}

.commission-img-wrap { width: 100%; height: 100%; border-radius: 8px; overflow: hidden; }
.commission-img-wrap img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s ease; }
.commission-img-wrap img:hover { transform: scale(1.05); }
.commission-meta {
  display: flex;
  justify-content: space-between;
  padding: 12px 8px 0;
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: var(--text-light);
}
.commission-num { font-weight: 700; color: var(--muted); }
.commission-label { font-weight: 800; color: var(--text); }

.ocean-glow-bg {
  position: absolute;
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  width: 80vw;
  max-width: 900px;
  height: 80vw;
  max-height: 900px;
  background: radial-gradient(circle, rgba(0, 119, 190, 0.65) 0%, rgba(0, 119, 190, 0.25) 30%, rgba(30, 144, 255, 0.08) 60%, transparent 80%);
  filter: blur(100px);
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
}

.commission-text-wrapper {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: center;
  padding: 0 40px;
  min-height: 80px;
}
.commission-active-text { text-align: center; max-width: 480px; }
.commission-active-title { font-size: 20px; font-weight: 700; color: var(--text); margin: 0 0 6px; letter-spacing: -0.01em; }
.commission-active-desc { font-size: 13px; line-height: 1.6; color: var(--muted); margin: 0; }

@media (max-width: 768px) {
  .commissions-scroll-container { padding: 0 16px; gap: 16px; }
  .commission-card { width: 200px; }
  .commission-card.hovered { transform: scale(1.08); }
  .commission-card:not(.hovered) { transform: scale(0.85); }
  .commission-text-wrapper { padding: 0 16px; min-height: 60px; }
  .commission-active-title { font-size: 16px; }
  .commission-active-desc { font-size: 11px; }
  .ocean-glow-bg { width: 80vw; height: 80vw; filter: blur(80px); }
}

/* ── ZEN TYPOGRAPHY SECTION ────────────────────────────────── */

.zen-section {
  padding: 100px 40px;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  position: relative;
  overflow: hidden;
  transition: background 1s ease;
}
.zen-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  position: relative;
  gap: 40px;
}
.zen-content {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
  margin-bottom: 60px;
}
.zen-char-box {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  position: relative;
}
.zen-char {
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 78px;
  font-weight: 900;
  line-height: 0.8;
  color: var(--text);
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 6px;
  margin-right: 8px;
}
.zen-stamp {
  position: absolute;
  bottom: 16px;
  right: -12px;
  width: 24px;
  height: 24px;
  background: #b63a2b;
  border-radius: 2px;
}
.zen-stamp::after {
  content: '印';
  color: #fff;
  font-size: 10px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}
.zen-vert-text {
  font-family: 'Noto Serif SC', 'SimSun', serif;
  writing-mode: vertical-rl;
  text-orientation: upright;
  font-size: 15px;
  letter-spacing: 0.35em;
  color: var(--muted);
  line-height: 2.2;
  margin-left: 24px;
}
.zen-scatter-text {
  position: absolute;
  top: 120px;
  right: 60px;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 18px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: var(--text-light);
  letter-spacing: 0.2em;
}
.zen-scatter-right {
  position: absolute;
  top: 120px;
  right: -60px;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 14px;
  writing-mode: vertical-rl;
  text-orientation: upright;
  color: var(--muted);
  letter-spacing: 0.2em;
}
.zen-collage {
  display: flex;
  gap: 12px;
  width: 100%;
  height: 220px;
  overflow: hidden;
  opacity: 0.7;
  mask-image: linear-gradient(to bottom, transparent 0%, black 40%, black 100%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 40%, black 100%);
}
.zen-collage img {
  flex: 1;
  object-fit: cover;
}

/* ── BLUE GRID SCRAPBOOK SECTION ──────────────────────────── */

.grid-section {
  padding: 80px 40px 120px;
  position: relative;
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  overflow: hidden;
  transition: background 1s ease;
}
.grid-inner {
  max-width: 1000px;
  margin: 0 auto;
  position: relative;
  min-height: 600px;
  padding: 20px 0;
  background-image: 
    linear-gradient(rgba(100, 150, 200, 0.08) 1px, transparent 1px),
    linear-gradient(90deg, rgba(100, 150, 200, 0.08) 1px, transparent 1px);
  background-size: 30px 30px;
}
.grid-bg-line {
  position: absolute;
  top: 40px; left: 40px;
  width: 60px; height: 1px;
  background: var(--border);
  transform: rotate(-15deg);
}
.grid-bg-line-2 {
  position: absolute;
  bottom: 40px; right: 60px;
  width: 80px; height: 1px;
  background: var(--border);
  transform: rotate(20deg);
}

/* Grid text */
.grid-text-top {
  position: absolute;
  top: 60px; right: 20px;
  font-size: 9px;
  color: var(--muted);
  font-weight: 500;
  letter-spacing: 0.1em;
}
.grid-text-center {
  position: absolute;
  top: 120px; right: 180px;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 14px;
  color: var(--text-light);
  line-height: 2.4;
  letter-spacing: 0.1em;
  text-align: right;
}
.grid-text-center .j-big {
  font-size: 34px;
  font-weight: 900;
  color: var(--text);
  letter-spacing: 0.15em;
}
.grid-text-bottom {
  position: absolute;
  bottom: 130px; left: -10px;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 10px;
  color: var(--muted);
  line-height: 1.8;
  text-align: left;
  letter-spacing: 0.08em;
}
.grid-text-tiny {
  position: absolute;
  bottom: 20px; left: 60px;
  font-family: 'Noto Serif SC', 'SimSun', serif;
  font-size: 9px;
  color: var(--muted);
  line-height: 1.8;
  letter-spacing: 0.05em;
}

/* Grid Images */
.grid-img-vert {
  position: absolute;
  top: 60px; left: 40px;
  width: 150px; height: 350px;
  border-radius: 4px;
  overflow: hidden;
}
.grid-img-vert img { width: 100%; height: 100%; object-fit: cover; }

.grid-img-sml {
  position: absolute;
  bottom: 110px; left: 40px;
  width: 100px; height: 100px;
  border-radius: 4px;
  overflow: hidden;
}
.grid-img-sml img { width: 100%; height: 100%; object-fit: cover; }

.grid-img-sq {
  position: absolute;
  top: 160px; right: 60px;
  width: 220px; height: 220px;
  border-radius: 4px;
  overflow: hidden;
}
.grid-img-sq img { width: 100%; height: 100%; object-fit: cover; }

.grid-img-sq2 {
  position: absolute;
  bottom: 160px; right: 60px;
  width: 100px; height: 100px;
  border-radius: 4px;
  overflow: hidden;
}
.grid-img-sq2 img { width: 100%; height: 100%; object-fit: cover; }

/* Color swatches */
.grid-swatches {
  position: absolute;
  bottom: 40px; right: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.g-swatch {
  width: 16px;
  height: 16px;
  border-radius: 2px;
  border: 1px solid rgba(255,255,255,0.1);
}

@media (max-width: 1024px) {
  .grid-img-sq { width: 180px; height: 180px; right: 30px; }
  .grid-text-center { right: 120px; }
}
@media (max-width: 768px) {
  .zen-section { padding: 60px 20px; }
  .zen-char { font-size: 52px; letter-spacing: 0px; }
  .zen-scatter-text { right: 10px; top: 80px; font-size: 14px; }
  .zen-scatter-right { display: none; }
  .zen-collage { height: 120px; gap: 6px; }
  
  .grid-section { padding: 60px 20px; }
  .grid-inner { min-height: 900px; display: flex; flex-direction: column; gap: 16px; background-image: none; }
  .grid-bg-line, .grid-bg-line-2 { display: none; }
  .grid-img-vert { position: relative; top: 0; left: 0; width: 100%; height: 300px; }
  .grid-img-sml { position: relative; bottom: 0; left: 0; width: 120px; height: 120px; margin-top: -80px; z-index: 2; }
  .grid-img-sq { position: relative; top: 0; right: 0; width: 100%; height: 240px; margin-top: -40px; }
  .grid-img-sq2 { position: relative; bottom: 0; right: 0; width: 100px; height: 100px; align-self: flex-end; margin-top: -50px; z-index: 2; }
  .grid-text-top { position: relative; top: 0; right: 0; text-align: right; margin-bottom: 8px; }
  .grid-text-center { position: relative; top: 0; right: 0; text-align: left; margin-bottom: 16px; }
  .grid-text-bottom { position: relative; bottom: 0; left: 0; margin-top: 8px; }
  .grid-text-tiny { position: relative; bottom: 0; left: 0; margin-top: 8px; }
  .grid-swatches { position: relative; bottom: 0; right: 0; flex-direction: row; margin-top: 16px; justify-content: flex-end; }
}

/* ── FOOTER (EXACT SCRAPBOOK LAYOUT) ────────────────────────── */

.scrapbook-footer {
  position: relative;
  background: #1D1812;
  padding: 70px 40px 40px;
  overflow: hidden;
  margin-top: 40px;
  z-index: 10; /* So scrollTrigger detects it easily */
}
/* CSS Torn edge (black clips into the white above) */
.torn-edge {
  position: absolute;
  top: -30px;
  left: 0;
  width: 100%;
  height: 30px;
  background: #1D1812;
  clip-path: polygon(
    0% 100%, 4% 70%, 8% 100%, 12% 80%, 16% 100%, 20% 60%,
    24% 100%, 28% 85%, 32% 100%, 36% 65%, 40% 100%, 44% 90%,
    48% 100%, 52% 75%, 56% 100%, 60% 85%, 64% 100%, 68% 55%,
    72% 100%, 76% 80%, 80% 100%, 84% 70%, 88% 100%, 92% 90%, 96% 100%, 100% 90%
  );
  z-index: 2;
  pointer-events: none;
}
.footer-layout {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  gap: 30px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  align-items: start;
  padding-top: 10px;
}
.footer-side-text {
  font-size: 8px;
  letter-spacing: 0.15em;
  line-height: 2.8;
  text-transform: uppercase;
  color: rgba(255,255,255,0.25);
  font-weight: 500;
}
.footer-side-text.right { text-align: right; padding-top: 20px; }

.footer-center-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  padding: 0 10px;
}
.footer-center-line-vert {
  position: absolute;
  top: -10px; bottom: 40px; left: 50%;
  width: 1px;
  background: rgba(255,255,255,0.08);
  transform: translateX(-50%);
  z-index: 0;
}
.footer-center-collage {
  display: flex;
  gap: 8px;
  margin: 4px 0 40px;
  position: relative;
  z-index: 1;
}
.footer-center-collage img {
  width: 60px; height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid rgba(255,255,255,0.06);
}
.footer-center-logo {
  width: 160px; 
  height: auto;
  color: #fff !important;
  position: relative;
  z-index: 1;
  margin-top: 10px;
}
.footer-center-brand {
  font-size: 28px;
  font-weight: 900;
  color: #fff;
  margin: 6px 0 0;
  letter-spacing: 0.06em;
  position: relative;
  z-index: 1;
}

.footer-legal {
  margin-top: 50px;
  border-top: 1px solid rgba(255,255,255,0.06);
  padding-top: 24px;
  text-align: center;
  font-size: 10px;
  color: rgba(255,255,255,0.3);
  letter-spacing: 0.1em;
  z-index: 2;
  position: relative;
}

@media (max-width: 768px) {
  .footer-layout { grid-template-columns: 1fr; gap: 20px; }
  .footer-side-text.right { text-align: center; padding-top: 0; font-size: 7px; }
  .footer-center-line-vert { display: none; }
  .scrapbook-footer { padding: 60px 20px 30px; }
  .torn-edge { top: -20px; height: 20px; }
  .footer-center-logo { width: 120px; }
  .footer-center-brand { font-size: 24px; }
}

/* ── ABOUT ───────────────────────────────────────────────────── */

.about { padding: 100px 40px; position: relative; overflow: hidden; }
.about-bg-text {
  position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
  font-size: clamp(120px, 20vw, 280px); font-weight: 900;
  color: rgba(29,24,18,0.025); white-space: nowrap; pointer-events: none;
  user-select: none; letter-spacing: -0.05em;
}
.about-inner { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 1.2fr; gap: 80px; align-items: center; position: relative; z-index: 1; }
.about-img-col { position: relative; display: flex; align-items: flex-start; }
.about-img-frame { width: 100%; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 60px rgba(29,24,18,0.1); }
.about-img-frame img { width: 100%; aspect-ratio: 4/5; object-fit: cover; }
.about-img-tag { position: absolute; left: -20px; top: 50%; transform: translateY(-50%); }
.about-float-small { position: absolute; font-size: 30px; color: rgba(29,24,18,0.08); pointer-events: none; }
.about-float1 { top: 10%; right: -10px; transform: rotate(12deg); }
.about-float2 { bottom: 15%; left: -5px; transform: rotate(-8deg); }
.about-text-col { display: flex; flex-direction: column; gap: 20px; }
.about-title { font-size: clamp(28px, 4vw, 48px); font-weight: 900; color: inherit; line-height: 1.15; margin: 0; letter-spacing: -0.03em; }
.about-title span { font-style: italic; font-weight: 300; color: var(--muted); }
.about-p { font-size: 15px; line-height: 1.75; color: var(--text-light); margin: 0; font-weight: 400; }
.about-tags { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 4px; }
.tag {
  padding: 5px 12px; background: rgba(29,24,18,0.05);
  border: 1px solid var(--border); border-radius: 100px;
  font-size: 9px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase;
  color: var(--muted); transition: background 0.2s, border-color 0.2s;
}
.tag:hover { background: rgba(29,24,18,0.1); border-color: var(--border-strong); color: var(--text); }
.about-links { display: flex; gap: 10px; flex-wrap: wrap; }

/* ── CONTACT ──────────────────────────────────────────────────── */

.contact { padding: 100px 40px; background: rgba(250,250,248,0.8); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border-top: 1px solid var(--border); transition: background 1s ease; }
.contact-inner { max-width: 680px; margin: 0 auto; display: flex; flex-direction: column; align-items: center; gap: 24px; text-align: center; }
.contact-sig { display: flex; flex-direction: column; align-items: center; gap: 12px; }
.contact-sig .signature-logo { width: 100px; }
.contact-sig-line { width: 120px; height: 1px; background: var(--border); }
.contact-title { font-size: clamp(36px, 6vw, 68px); font-weight: 900; color: inherit; margin: 0; letter-spacing: -0.03em; line-height: 1.1; }
.contact-title em { font-style: italic; font-weight: 300; color: var(--muted); }
.contact-sub { font-size: 15px; font-weight: 400; color: var(--muted); max-width: 420px; line-height: 1.7; margin: 0; }
.contact-cards { display: flex; gap: 14px; flex-wrap: wrap; justify-content: center; margin-top: 8px; }
.contact-card {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  background: rgba(255,255,255,0.9); border: 1px solid var(--border);
  border-radius: 20px; padding: 28px 36px; min-width: 180px;
  box-shadow: 0 4px 20px var(--shadow);
  transition: box-shadow 0.3s, border-color 0.3s; cursor: pointer;
}
.contact-card:hover { box-shadow: 0 12px 40px var(--shadow); border-color: var(--border-strong); }
.contact-card-icon { width: 28px; height: 28px; color: var(--text); display: flex; align-items: center; justify-content: center; }
.contact-card strong { font-size: 17px; font-weight: 700; color: inherit; }
.contact-card span { font-size: 11px; }
.contact-note { font-size: 10px; letter-spacing: 0.05em; line-height: 1.8; max-width: 380px; }

/* ── RESPONSIVE ───────────────────────────────────────────────── */

@media (max-width: 1024px) {
  .carousel { max-width: 600px; height: 500px; }
  .carousel-item {
    width: 80px; height: 80px;
    transform: translate(-50%, -50%) rotate(calc(var(--item) * 360deg / var(--itemCount))) translateX(260px) rotate(calc(-1 * var(--item) * 360deg / var(--itemCount)));
  }
  .carousel-item:hover {
    transform: translate(-50%, -50%) rotate(calc(var(--item) * 360deg / var(--itemCount))) translateX(280px) rotate(calc(-1 * var(--item) * 360deg / var(--itemCount))) scale(1.12);
  }
  .carousel-center-avatar { width: 80px; height: 80px; }
}
@media (max-width: 768px) {
  .lain-header { padding: 16px 24px; }
  .hero-side-content { left: 24px; bottom: 40px; max-width: 280px; }
  .intro-strip-inner { grid-template-columns: 1fr; text-align: center; }
  .intro-label { display: none; }
  .intro-stats { flex-direction: row; justify-content: center; gap: 36px; }
  .work-chapter { grid-template-columns: 1fr; min-height: auto; }
  .wc-img-wrap { height: 280px; position: relative; }
  .wc-img-inner { inset: 0; }
  .work-chapter.wc-right { direction: ltr; }
  .about-inner { grid-template-columns: 1fr; gap: 40px; }
  .about-img-col { max-width: 400px; margin: 0 auto; }
  .about-img-tag { display: none; }
  .about-float-small { display: none; }
  .gallery-row { padding: 0 16px; }
  .section-head { padding: 0 24px; }
  .about { padding: 80px 24px; }
  .contact { padding: 80px 24px; }
  .discography-list { padding: 0 24px; }
  .carousel { height: 340px; max-width: 100%; }
  .carousel-item {
    width: 60px; height: 60px;
    transform: translate(-50%, -50%) rotate(calc(var(--item) * 360deg / var(--itemCount))) translateX(180px) rotate(calc(-1 * var(--item) * 360deg / var(--itemCount)));
  }
  .carousel-item:hover {
    transform: translate(-50%, -50%) rotate(calc(var(--item) * 360deg / var(--itemCount))) translateX(195px) rotate(calc(-1 * var(--item) * 360deg / var(--itemCount))) scale(1.1);
  }
  .carousel-center-avatar { width: 60px; height: 60px; }
  .fullscreen-slider { padding: 20px; }
  .slider-close { top: 16px; right: 20px; }
  .slider-title { font-size: 18px; margin-top: 12px; }
  .slider-prev { left: 8px; }
  .slider-next { right: 8px; }
  .disc-burst-img { width: 52px; height: 52px; }
}
@media (prefers-reduced-motion: reduce) {
  .disc-burst-img { animation: none; }
}

/* @arkzen:web:style:end */

// ────────────────────────────────────────────────────────────────
// WEB ANIMATION
// ────────────────────────────────────────────────────────────────

/* @arkzen:web:animation */
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import React from 'react'

export const lain098Animations = (
  pageRef: React.RefObject<HTMLDivElement>,
  onAvatarReady: () => void,
  onOrbitReady: () => void,
  onNavReady: () => void,
) => {
  gsap.registerPlugin(ScrollTrigger)
  const ctx = gsap.context(() => {

    // 1. Draw the script SVG paths (background hero text)
    const paths = document.querySelectorAll('.script-path')
    let totalDuration = 0
    paths.forEach((path, i) => {
      const el = path as SVGPathElement
      const length = el.getTotalLength?.() || 800
      gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
      const dur = 1.0 + Math.random() * 0.4
      const delay = i * 0.18 + 0.2
      gsap.to(el, { strokeDashoffset: 0, duration: dur, delay, ease: 'power2.inOut' })
      totalDuration = Math.max(totalDuration, delay + dur)
    })

    // 2. Avatar appears right after script finishes — scale from 0
    gsap.delayedCall(totalDuration + 0.1, () => {
      onAvatarReady()
    })

    // 3. Orbit expands fast then eases to normal — triggered after avatar
    gsap.delayedCall(totalDuration + 0.35, () => {
      onOrbitReady()
    })

    // 4. Nav + side text blur-fade in after orbit settles
    gsap.delayedCall(totalDuration + 0.9, () => {
      onNavReady()
    })

  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } },
  exit:    { opacity: 0, transition: { duration: 0.1 } },
}
/* @arkzen:web:animation:end */

// ────────────────────────────────────────────────────────────────
// WEB PAGE: INDEX
// ────────────────────────────────────────────────────────────────

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const IndexPage = () => {
  const [sliderOpen, setSliderOpen] = useState(false)
  const [initialIndex, setInitialIndex] = useState(0)
  const [avatarVisible, setAvatarVisible] = useState(false)
  const [orbitVisible, setOrbitVisible] = useState(false)
  const [navVisible, setNavVisible] = useState(false)
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cleanup = lain098Animations(
      pageRef,
      () => setAvatarVisible(true),   // avatar scale-in
      () => setOrbitVisible(true),    // orbit expand
      () => setNavVisible(true),      // nav + side text
    )
    return cleanup
  }, [])

  const openSlider = (index: number) => {
    setInitialIndex(index)
    setSliderOpen(true)
  }

  // GLOBAL THEME TRANSITION UPON REACHING THE FOOTER
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    const footerEl = document.querySelector('.scrapbook-footer')
    if (!footerEl) return

    const ctx = gsap.context(() => {
      gsap.to(".lain-root", {
        backgroundColor: "#1D1812",
        color: "#f0f0f0",
        duration: 2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: footerEl,
          start: "top bottom",
          end: "top 30%",
          scrub: 1.2
        }
      })
      gsap.to(".lain-root", {
        "--muted": "rgba(255,255,255,0.45)",
        "--border": "rgba(255,255,255,0.08)",
        "--text-light": "rgba(255,255,255,0.6)",
        duration: 2,
        ease: "power2.inOut",
        scrollTrigger: {
          trigger: footerEl,
          start: "top bottom",
          end: "top 30%",
          scrub: 1.2
        }
      })
    }, footerEl)
    return () => ctx.revert()
  }, [])

  return (
    <motion.div
      ref={pageRef}
      className="lain-root"
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {/* ⭐ GLOBAL FIXED BLEEDING BLUE ORB STARTS HERE ⭐ */}
      <div className="global-bg-bleed" />
      
      <LainNav visible={navVisible} />
      <HeroSection
        onPreview={openSlider}
        orbitVisible={orbitVisible}
        avatarVisible={avatarVisible}
      />
      <IntroStrip />
      <WorksSection />
      <GalleryStrip />
      <DiscographySection />
      <CommissionsSection />
      <AboutSection />
      <ContactSection />
      <ZenSection />
      <GridSection />
      <Footer />

      <AnimatePresence>
        {sliderOpen && (
          <FullscreenSlider
            items={CAROUSEL_ITEMS}
            initialIndex={initialIndex}
            onClose={() => setSliderOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default IndexPage

/* @arkzen:web:page:index:end */

// ────────────────────────────────────────────────────────────────
// ERROR 404
// ────────────────────────────────────────────────────────────────

/* @arkzen:web:error:404 */

import React from 'react'
import { Link } from 'react-router'

const NotFoundPage = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-100 leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">This route doesn't exist in the lain098 tatemono.</p>
      <Link to="/lain098" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Home
      </Link>
    </div>
  </div>
)

/* @arkzen:web:error:404:end */