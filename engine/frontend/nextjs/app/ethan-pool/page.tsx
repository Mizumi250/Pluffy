'use client'
// ============================================================
// ARKZEN GENERATED PAGE — ethan-pool/index
// Layout: guest | Auth guard: false | Guest-only: false
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:27:35.705Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { ethanPoolAnimations, pageVariants } from '@/arkzen/generated/ethan-pool.animations'
import { EpGalleryModal } from './components/EpGalleryModal'
import { EpHeader } from './components/EpHeader'
import { EpNavDrawer } from './components/EpNavDrawer'
import { EpPromoModal } from './components/EpPromoModal'
import { AMENITIES, BLOG_POSTS, GALLERY_MEDIA, LOGOS, ROOMS } from './components/constants'
import { useMounted } from './components/hooks'
import { prev, t } from './components/utils'

// Page component code (from @arkzen:page:index)
const clamp = (min: number, max: number, value: number) => Math.min(Math.max(value, min), max)

const IndexPage = () => {
  const mounted = useMounted()
  const pageRef = useRef<HTMLDivElement>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [motorVisible, setMotorVisible] = useState(false)
  const [galleryOpen, setGalleryOpen] = useState(false)
  const [galleryIndex, setGalleryIndex] = useState(0)
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterAccepted, setNewsletterAccepted] = useState(false)
  const [newsletterMsg, setNewsletterMsg] = useState('')

  // ── coverflow room carousel ──
  const carouselWrapRef = useRef<HTMLDivElement>(null)
  const carouselTrackRef = useRef<HTMLDivElement>(null)
  const [activeRoom, setActiveRoom] = useState(0)

  // ── scroll-based: reveal booking motor + scrolled header state ──
  useEffect(() => {
    const onScroll = () => {
      const heroH = document.querySelector('.ep-hero')?.getBoundingClientRect().height || 0
      setMotorVisible(window.scrollY > heroH * 0.6)
      document.body.classList.toggle('ep-scrolled', window.scrollY > 40)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // ── lock body scroll when drawer/modals open ──
  useEffect(() => {
    document.body.style.overflow = menuOpen || galleryOpen ? 'hidden' : ''
  }, [menuOpen, galleryOpen])

  // ── run scroll animations once mounted ──
  useEffect(() => {
    if (!mounted) return
    const cleanup = ethanPoolAnimations(pageRef)
    return cleanup
  }, [mounted])

  // ── coverflow: rotate/scale each card based on its distance from the
  // center of the visible track, updating on every horizontal scroll ──
  useEffect(() => {
    const wrap = carouselWrapRef.current
    const track = carouselTrackRef.current
    if (!wrap || !track) return

    let raf = 0

    const update = () => {
      const wrapRect = wrap.getBoundingClientRect()
      const centerX = wrapRect.left + wrapRect.width / 2
      const cards = Array.from(track.querySelectorAll<HTMLElement>('.ep-room-card'))

      let closestIndex = 0
      let closestDist = Infinity

      cards.forEach((card, i) => {
        const cardRect = card.getBoundingClientRect()
        const cardCenter = cardRect.left + cardRect.width / 2
        const delta = (cardCenter - centerX) / wrapRect.width // normalized -1..1 roughly

        const rotateY = clamp(-50, 50, delta * 65)
        const scale = clamp(0.72, 1, 1 - Math.abs(delta) * 0.5)
        const translateZ = -Math.abs(delta) * 160
        const opacity = clamp(0.35, 1, 1 - Math.abs(delta) * 0.6)

        card.style.transform = `translateZ(${translateZ}px) rotateY(${-rotateY}deg) scale(${scale})`
        card.style.opacity = String(opacity)
        card.style.zIndex = String(100 - Math.round(Math.abs(delta) * 100))

        const dist = Math.abs(cardCenter - centerX)
        if (dist < closestDist) {
          closestDist = dist
          closestIndex = i
        }
      })

      setActiveRoom((prev) => (prev !== closestIndex ? closestIndex : prev))
    }

    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        update()
        raf = 0
      })
    }

    update()
    wrap.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)

    return () => {
      wrap.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [mounted])

  const scrollToRoom = (index: number) => {
    const wrap = carouselWrapRef.current
    const track = carouselTrackRef.current
    if (!wrap || !track) return
    const card = track.querySelectorAll<HTMLElement>('.ep-room-card')[index]
    if (!card) return
    const wrapRect = wrap.getBoundingClientRect()
    const cardRect = card.getBoundingClientRect()
    const offset = (cardRect.left + cardRect.width / 2) - (wrapRect.left + wrapRect.width / 2)
    wrap.scrollBy({ left: offset, behavior: 'smooth' })
  }

  const openGallery = (index: number) => {
    setGalleryIndex(index)
    setGalleryOpen(true)
  }

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newsletterAccepted) {
      setNewsletterMsg('Please accept the terms and conditions.')
      return
    }
    setNewsletterMsg('Thanks for subscribing! (demo — no data is actually sent)')
    setNewsletterEmail('')
  }

  return (
    <div className="ep-root" ref={pageRef} id="top">

      {/* DISCLAIMER */}
      <div className="ep-disclaimer">
        <strong>Disclaimer:</strong> Ethan Pool is a demo showcase site built for
        demonstration purposes only by James Rafty D. Libago (Mizumi). All names, text, locations and images are fictional or
        stock placeholders and do not represent a real business.
      </div>

      {/* HEADER + DRAWER */}
      <EpHeader menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <EpNavDrawer open={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* PROMO MODAL */}
      <EpPromoModal />

      {/* GALLERY MODAL */}
      <EpGalleryModal
        open={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        images={GALLERY_MEDIA}
        index={galleryIndex}
        setIndex={setGalleryIndex}
      />

      {/* ── HERO ── */}
      <section className="ep-hero" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="100">
        <div className="ep-hero-img">
          <img
            src="https://images.unsplash.com/photo-1560090995-01632a28895b?q=80&w=1800&auto=format&fit=crop"
            alt="Child playing and swimming in the Ethan Pool resort pool"
          />
        </div>
        <div className="ep-hero-overlay" />
        <div className="ep-hero-block">
          <h1 className="ep-hero-logo" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            ETHAN
            <span>POOL · RESORT</span>
          </h1>
        </div>
        <div className="ep-hero-scroll" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="1200">
          <span>Scroll</span>
          <div className="ep-scroll-line" />
        </div>
      </section>

      {/* ── BANNER FULL / TEXT REVEAL ── */}
      <section className="ep-banner-full" id="resort">
        <div className="ep-banner-img">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1800&auto=format&fit=crop"
            alt="Ethan Pool lagoon view"
          />
        </div>
        <div className="ep-banner-overlay" />
        <div className="ep-banner-block">
          <div data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <p className="ep-p-section">A Luxury Aquatic Resort</p>
            <h2 className="ep-title">A resort of calm waters facing the lagoon</h2>
            <p className="ep-subhead">
              Between infinity-edge pools and a garden that opens onto the water, Ethan Pool is a
              retreat that doesn't try to draw attention. Let the water speak. Let time float.
              Let every swim become a memory you keep forever.
            </p>
          </div>
        </div>
      </section>

      {/* ── ROOM / SUITE COVERFLOW CAROUSEL ── */}
      <section className="ep-carousel-section" id="rooms">
        <div className="ep-carousel-intro" data-fade="fade-up" data-fade-delay="700" data-fade-duration="1000">
          <p className="ep-p-section">Stays by the Water</p>
          <h2 className="ep-title">Rooms with views over the lagoon or the tropical garden</h2>
        </div>

        <div className="ep-carousel-cta" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
          <a href="#offers" className="ep-btn ep-btn-stroke ep-btn-green">
            <span className="ep-btn-label">All Rooms<i className="ep-arrow">→</i></span>
          </a>
        </div>

        <div className="ep-carousel-track-wrap" ref={carouselWrapRef}>
          <div className="ep-carousel-track" ref={carouselTrackRef}>
            {ROOMS.map((room, i) => (
              <div
                className={`ep-room-card ${room.tag === 'offer' ? 'ep-offer' : ''} ${i === activeRoom ? 'ep-active' : ''}`}
                key={room.id}
                data-index={i}
                onClick={() => scrollToRoom(i)}
              >
                <img src={room.img} alt={room.name} />
                <div className="ep-room-card-label">{room.name}</div>
                <div className="ep-room-card-overlay">
                  <h3>{room.name}</h3>
                  <div className="ep-room-actions">
                    <a href="#offers" className="ep-btn ep-btn-stroke">
                      <span className="ep-btn-label">Book Now</span>
                    </a>
                    <a href={`#${room.id}`} className="ep-btn-underline">Learn More</a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── INFO / AMENITIES SPLIT ── */}
      <section className="ep-info-section" id="rooftop">
        <div className="ep-info-grid">
          <div className="ep-info-img" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <img
              src="https://images.unsplash.com/photo-1600965962102-9d260a71890d?q=80&w=900&auto=format&fit=crop"
              alt="Ethan Pool morning swim"
            />
          </div>
          <div className="ep-info-text" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <p className="ep-p-section">This Is Where the Trip Makes Sense</p>
            <h2 className="ep-title">
              A pause of calm by the water that invites you to slow down. A place where nothing is
              urgent — just float. Just enjoy.
            </h2>

            <ul className="ep-info-list">
              {AMENITIES.map((a) => (
                <li key={a.label}>{a.label}</li>
              ))}
            </ul>

            <div className="ep-amenity-medias">
              {AMENITIES.map((a) => (
                <img key={a.label} src={a.img} alt={a.label} title={a.label} />
              ))}
            </div>

            <a href="#resort" className="ep-btn ep-btn-stroke">
              <span className="ep-btn-label">More About the Resort<i className="ep-arrow">→</i></span>
            </a>
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── MULTIMEDIA / GALLERY GRID ── */}
      <section className="ep-multimedia" id="gallery">
        <div className="ep-multimedia-head" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <h2 className="ep-title">
            Traveling is learning to float slowly. Discover the small moments you'll make your own at Ethan Pool
          </h2>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ep-btn ep-btn-white"
          >
            <span className="ep-btn-label">More on Instagram ↗</span>
          </a>
        </div>

        <div className="ep-multimedia-grid">
          {GALLERY_MEDIA.map((src, i) => (
            <div className="ep-media" key={src} onClick={() => openGallery(i)}>
              <img src={src} alt={`Ethan Pool gallery ${i + 1}`} loading="lazy" />
              <div className="ep-media-plus">+</div>
            </div>
          ))}
          <a
            className="ep-media ep-media-webcam"
            href="https://example.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span>📹</span>
            <p>Live Cam</p>
          </a>
          <div className="ep-media-empty" />
          <div className="ep-media-empty" />
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── BLOG ── */}
      <section className="ep-blog-section" id="blog">
        <div className="ep-blog-head" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <p className="ep-p-section">The Ethan Pool Blog</p>
          <h2 className="ep-title">
            Stories, places and moments that inspire a slower, calmer way of life by the water.
          </h2>
        </div>

        <div className="ep-blog-track-wrap">
          <div className="ep-blog-track">
            {BLOG_POSTS.map((post) => (
              <div className="ep-blog-card" key={post.href}>
                <div className="ep-blog-img">
                  <img src={post.img} alt={post.title} />
                </div>
                <div className="ep-blog-card-text">
                  <p className="ep-p-section">{post.tag}</p>
                  <h3>{post.title}</h3>
                  <a href={post.href} className="ep-btn ep-btn-stroke">
                    <span className="ep-btn-label">Read More</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="ep-blog-cta" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700">
          <a href="#blog" className="ep-btn ep-btn-stroke ep-btn-green">
            <span className="ep-btn-label">More Ideas & Plans<i className="ep-arrow">→</i></span>
          </a>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── LOCATION / CONTACT ── */}
      <section className="ep-location" id="contact">
        <div className="ep-location-grid">
          <div className="ep-location-map" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
            <img
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=900&auto=format&fit=crop"
              alt="Map showing Ethan Pool location"
            />
          </div>
          <div className="ep-location-text" data-fade="fade-up" data-fade-duration="1000" data-fade-delay="700" id="about">
            <h2 className="ep-title">Ethan Pool Resort &amp; Spa</h2>
            <address>12 Lagoon Promenade<br />20003 San Sebastián, Spain</address>

            <div className="ep-btn-row">
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="ep-btn ep-btn-stroke"
              >
                <span className="ep-btn-label">Open in Google Maps<i className="ep-arrow">→</i></span>
              </a>
            </div>

            <a href="mailto:hello@ethanpool.com">hello@ethanpool.com</a>
            <a href="tel:+34943000000">T. +34 943 000 000</a>

            <div className="ep-btn-row">
              <a
                href="https://wa.me/34943000000"
                target="_blank"
                rel="noopener noreferrer"
                className="ep-btn ep-btn-stroke"
              >
                <span className="ep-btn-label">Send Us a WhatsApp<i className="ep-arrow">→</i></span>
              </a>
            </div>

            <div className="ep-location-social">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">FB</a>
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">IG</a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TT</a>
              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">YT</a>
            </div>
          </div>
        </div>
      </section>

      <div className="ep-bottom-scroll" />

      {/* ── NEWSLETTER ── */}
      <section className="ep-newsletter" id="offers">
        <div data-fade="fade-up" data-fade-delay="700" data-fade-duration="1000">
          <h2 className="ep-title">Subscribe to Our Newsletter</h2>

          <form className="ep-newsletter-form" onSubmit={handleNewsletter}>
            <div className="ep-newsletter-top">
              <input
                type="email"
                placeholder="Your email"
                required
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
              />
              <button type="submit" className="ep-btn ep-btn-stroke ep-btn-white">
                <span className="ep-btn-label">Subscribe<i className="ep-arrow">→</i></span>
              </button>
            </div>
            <div className="ep-newsletter-legal">
              <label>
                <input
                  type="checkbox"
                  checked={newsletterAccepted}
                  onChange={(e) => setNewsletterAccepted(e.target.checked)}
                  required
                />
                <span>I accept the terms and conditions of use (demo)*</span>
              </label>
            </div>
            {newsletterMsg && <div className="ep-newsletter-result">{newsletterMsg}</div>}
          </form>
        </div>
      </section>

      {/* ── LOGOS ── */}
      <section className="ep-logos" data-fade="fade-in" data-fade-duration="1000" data-fade-delay="700">
        <div className="ep-logos-track">
          {LOGOS.map((l, i) => (
            <span key={i}>{l}</span>
          ))}
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="ep-footer">
        <div className="ep-footer-grid">
          <a href="#top" className="ep-footer-logo">
            <span>⌬</span>
            <span>ETHAN<span>POOL</span></span>
          </a>
          <div className="ep-footer-links">
            <ul>
              <li><a href="#rooms">Rooms</a></li>
              <li><a href="#resort">The Resort</a></li>
            </ul>
            <ul>
              <li><a href="#offers">Offers & Newsletter</a></li>
              <li><a href="#blog">Blog</a></li>
            </ul>
            <ul>
              <li><a href="#contact">Contact & Directions</a></li>
              <li><a href="#about">About Us</a></li>
            </ul>
          </div>
        </div>
        <div className="ep-footer-bottom">
          <p>Copyright @ Ethan Pool 2026. Demo tatemono — all rights reserved.</p>
          <ul>
            <li><a href="#">Legal Notice</a></li>
            <li><a href="#">Cookie Policy</a></li>
          </ul>
        </div>
      </footer>

      {/* ── STICKY BOOKING MOTOR ── */}
      <section className={`ep-motor ${motorVisible ? 'ep-motor-visible' : ''}`}>
        <EpBookingBarInner />
      </section>
    </div>
  )
}

// Inner booking bar (re-uses booking form markup without its own <section> wrapper)
const EpBookingBarInner = () => {
  const [open, setOpen] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setOpen(false)
  }

  return (
    <form className="ep-motor-form" onSubmit={handleSubmit}>
      <div className="ep-motor-inputs">
        <div className="ep-motor-field">
          <label>Check-in</label>
          <input type="date" name="checkin" />
        </div>
        <div className="ep-motor-field">
          <label>Check-out</label>
          <input type="date" name="checkout" />
        </div>
        <div className="ep-motor-field ep-motor-guests">
          <label>Guests</label>
          <button type="button" className="ep-guests-toggle" onClick={() => setOpen(!open)}>
            2 Adults
          </button>
          {open && (
            <div className="ep-guests-pop">
              <div className="ep-guests-row">
                <span>Adults <small>18+ years</small></span>
                <div className="ep-stepper">
                  <button type="button">−</button>
                  <span>2</span>
                  <button type="button">+</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <button type="submit" className="ep-motor-submit">Book Now</button>
    </form>
  )
}

export default IndexPage

// Wrapper for animation + layout
const ArkzenPage_EthanPool_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = ethanPoolAnimations(pageRef)
    return cleanup
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

export default ArkzenPage_EthanPool_Index
