// ============================================================
// ARKZEN GENERATED PAGE — lain098/index [React+Vite]
// Layout: guest | Auth: false | Guest: true
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-25T13:17:37.156Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { GuestLayout } from '@/arkzen/core/layouts/GuestLayout'
import { lain098Animations, pageVariants } from '@/arkzen/generated/lain098.animations'
import { useNavigate } from 'react-router'
import './styles/global.css'
import { ART_MARQUEE, COLLAGE_IMGS, COMMISSIONS, GALLERY, PROCESS } from './components/constants'
import { el, lerp, smoothScroll } from './components/utils'
import { gsap } from 'gsap'
import { Instagram, ExternalLink, Heart, Star, ArrowRight, ChevronDown, Menu, X, Sparkles, Send, Eye, Download, ChevronLeft, ChevronRight, ZoomIn, Play } from 'lucide-react'

// ── Page component from @arkzen:page:index ─────────────────────────────
const IndexPage = () => {
  const pageRef       = useRef<HTMLDivElement>(null)
  const cursorRef     = useRef<HTMLDivElement>(null)
  const ringRef       = useRef<HTMLDivElement>(null)
  const rafRef        = useRef<number>(0)
  const ringPos       = useRef({x:-200,y:-200})

  const [menuOpen,      setMenuOpen]      = useState(false)
  const [activeFilter,  setActiveFilter]  = useState('all')
  const [lbOpen,        setLbOpen]        = useState(false)
  const [lbIdx,         setLbIdx]         = useState(0)

  const filtered = activeFilter==='all' ? GALLERY : GALLERY.filter(g=>g.tag.toLowerCase().includes(activeFilter))

  // ── cursor ────────────────────────────────────────────────────────────────
  useEffect(()=>{
    const onMove=(e:MouseEvent)=>{
      if(cursorRef.current) gsap.set(cursorRef.current,{x:e.clientX,y:e.clientY})
      ringPos.current={x:e.clientX,y:e.clientY}
    }
    const onClick=()=>{ cursorRef.current?.classList.add('click'); setTimeout(()=>cursorRef.current?.classList.remove('click'),160) }
    window.addEventListener('mousemove',onMove)
    window.addEventListener('click',onClick)
    const tick=()=>{
      if(ringRef.current){
        const rx=lerp((ringRef.current as any).__rx??-200,ringPos.current.x,.12)
        const ry=lerp((ringRef.current as any).__ry??-200,ringPos.current.y,.12)
        ;(ringRef.current as any).__rx=rx
        ;(ringRef.current as any).__ry=ry
        gsap.set(ringRef.current,{x:rx,y:ry})
      }
      rafRef.current=requestAnimationFrame(tick)
    }
    rafRef.current=requestAnimationFrame(tick)
    return ()=>{ window.removeEventListener('mousemove',onMove); window.removeEventListener('click',onClick); cancelAnimationFrame(rafRef.current) }
  },[])

  // hover cursor
  useEffect(()=>{
    const els=pageRef.current?.querySelectorAll('a,button,.l-art-card,.l-comm-card,.l-vand-item,.l-carousel-item,.l-collage-photo')
    const on=()=>{ cursorRef.current?.classList.add('hov'); ringRef.current?.classList.add('hov') }
    const off=()=>{ cursorRef.current?.classList.remove('hov'); ringRef.current?.classList.remove('hov') }
    els?.forEach(el=>{ el.addEventListener('mouseenter',on); el.addEventListener('mouseleave',off) })
    return ()=>els?.forEach(el=>{ el.removeEventListener('mouseenter',on); el.removeEventListener('mouseleave',off) })
  },[activeFilter])

  // gsap
  useEffect(() => { 
  if (!pageRef.current) return
  return lain098Animations(pageRef as React.RefObject<HTMLDivElement>) 
}, [])

  // lightbox
  const openLb=useCallback((i:number)=>{ setLbIdx(i); setLbOpen(true); document.body.style.overflow='hidden' },[])
  const closeLb=useCallback(()=>{ setLbOpen(false); document.body.style.overflow='' },[])
  const lbPrev=useCallback(()=>setLbIdx(i=>(i-1+filtered.length)%filtered.length),[filtered])
  const lbNext=useCallback(()=>setLbIdx(i=>(i+1)%filtered.length),[filtered])
  useEffect(()=>{
    const h=(e:KeyboardEvent)=>{ if(!lbOpen) return; if(e.key==='Escape') closeLb(); if(e.key==='ArrowLeft') lbPrev(); if(e.key==='ArrowRight') lbNext() }
    window.addEventListener('keydown',h); return ()=>window.removeEventListener('keydown',h)
  },[lbOpen,lbPrev,lbNext,closeLb])

  // magnetic
  const mag=useCallback((e:React.MouseEvent<HTMLElement>,s=.32)=>{
    const r=(e.currentTarget as HTMLElement).getBoundingClientRect()
    gsap.to(e.currentTarget,{x:(e.clientX-(r.left+r.width/2))*s,y:(e.clientY-(r.top+r.height/2))*s,duration:.3,ease:'power2.out'})
  },[])
  const magLeave=useCallback((e:React.MouseEvent<HTMLElement>)=>{
    gsap.to(e.currentTarget,{x:0,y:0,duration:.55,ease:'elastic.out(1,.45)'})
  },[])

  return (
    <div ref={pageRef} style={{position:'relative'}}>

      {/* cursor */}
      <div ref={cursorRef} className="l-cursor" />
      <div ref={ringRef}   className="l-cursor-ring" />

      {/* LOADER */}
      <div id="l-loader">
        <div id="l-loader-title">Lain098_</div>
        <div id="l-loader-sub">digital artist</div>
        <div id="l-loader-bar-wrap"><div id="l-loader-bar" /></div>
        <div id="l-loader-pct">0%</div>
      </div>

      {/* PARTICLES */}
      <div className="l-particles" aria-hidden="true">
        {Array.from({length:24}).map((_,i)=>(
          <div key={i} className="l-particle" style={{
            left:`${Math.random()*100}%`, bottom:`${-5-Math.random()*8}px`,
            width:`${3+Math.random()*8}px`, height:`${3+Math.random()*8}px`,
            background:`hsl(${194+Math.random()*22},${54+Math.random()*28}%,${62+Math.random()*22}%)`,
            '--dur':`${6+Math.random()*9}s`,'--del':`${Math.random()*8}s`,'--op':`${.12+Math.random()*0.26}`,
          } as React.CSSProperties} />
        ))}
      </div>

      {/* NAV */}
      <nav id="l-nav">
        <a href="#" className="l-nav-logo">Lain<span>098_</span></a>
        <ul className="l-nav-links">
          {[{l:'About',h:'#about'},{l:'Gallery',h:'#gallery'},{l:'Commissions',h:'#commissions'},{l:'Process',h:'#process'},{l:'Contact',h:'#contact'}].map(n=>(
            <li key={n.l}><a href={n.h} onClick={e=>{e.preventDefault();smoothScroll(n.h)}}>{n.l}</a></li>
          ))}
        </ul>
        <div style={{display:'flex',alignItems:'center',gap:'1rem'}}>
          <a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer"
             className="l-nav-cta" onMouseMove={e=>mag(e)} onMouseLeave={magLeave}>
            Commission Me
          </a>
          <button className="l-nav-burger" onClick={()=>setMenuOpen(p=>!p)} aria-label="menu">
            {menuOpen ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </div>
      </nav>
      <div className={`l-mobile-nav${menuOpen?' open':''}`}>
        <button className="l-mobile-nav-close" onClick={()=>setMenuOpen(false)}><X size={26}/></button>
        {[{l:'About',h:'#about'},{l:'Gallery',h:'#gallery'},{l:'Commissions',h:'#commissions'},{l:'Process',h:'#process'},{l:'Contact',h:'#contact'}].map(n=>(
          <a key={n.l} href={n.h} onClick={e=>{e.preventDefault();smoothScroll(n.h);setMenuOpen(false)}}>{n.l}</a>
        ))}
      </div>

      {/* ════════════════════════════════════════════════
          HERO — Astrophile exact layout
          Full-bleed sky, center circle title, vertical nav
          right, vertical date left, IG url left, long line+dot
      ════════════════════════════════════════════════ */}
      <section className="l-hero">
        <div className="l-hero-bg" />

        {/* clouds */}
        {[
          {w:320,h:120,top:'8%',left:'5%','--cd':'22s','--cx':'50px'},
          {w:240,h:90, top:'18%',right:'8%','--cd':'18s','--cx':'-40px'},
          {w:180,h:70, top:'55%',left:'15%','--cd':'25s','--cx':'35px'},
          {w:140,h:55, top:'70%',right:'15%','--cd':'19s','--cx':'-30px'},
          {w:200,h:75, top:'35%',left:'60%','--cd':'21s','--cx':'28px'},
        ].map((c,i)=>(
          <div key={i} className="l-cloud" style={{
            width:c.w,height:c.h,top:c.top,left:(c as any).left,right:(c as any).right,
            '--cd':c['--cd'],'--cx':c['--cx'],
          } as React.CSSProperties} />
        ))}

        {/* three dots top right — Astrophile */}
        <div className="l-hero-dots" aria-hidden="true">
          <div className="l-hero-dot"/><div className="l-hero-dot"/><div className="l-hero-dot"/>
        </div>

        {/* CENTER CIRCLE — Astrophile */}
        <div className="l-hero-circle-wrap">
          <div className="l-hero-circle">
            <div className="l-hero-circle-title">
              Lain<span>digital artist</span>
            </div>
            <span className="l-hero-sparkle" aria-hidden="true">✦</span>
            <span className="l-hero-sparkle" aria-hidden="true">✧</span>
            <span className="l-hero-sparkle" aria-hidden="true">✦</span>
          </div>
        </div>

        {/* body text left of circle — Astrophile paragraph rotated */}
        <p className="l-hero-body-text" aria-label="About Lain">
          Hello I'm Lain — anime illustrations, fanart, OCs, chibi and short animations. Art for those who feel everything a little too deeply.
        </p>

        {/* vertical right nav — Astrophile Post/Story/Reels/Typography/Creative */}
        <nav className="l-hero-vnav" aria-label="content types">
          {['Gallery','About','Commissions','Process','Contact'].map((item,i)=>(
            <button key={item} className={`l-hero-vnav-item${i===0?' active':''}`}
              onClick={()=>smoothScroll(`#${item.toLowerCase()}`)}>
              {item}
            </button>
          ))}
        </nav>

        {/* vertical date left — Astrophile "05 March 2023" */}
        <span className="l-hero-vdate" aria-hidden="true">Digital Art · Since 2020</span>

        {/* vertical IG URL far left — Astrophile */}
        <a href="https://www.instagram.com/lain098_" target="_blank" rel="noopener noreferrer"
           className="l-hero-vig" aria-label="Instagram">
          https://instagram.com/lain098_
        </a>

        {/* long vertical line + dot — Astrophile exact */}
        <div className="l-hero-vline" aria-hidden="true">
          <div className="l-hero-vline-dot"/>
        </div>

        {/* download circle bottom left — Astrophile */}
        <button className="l-hero-dl" onClick={()=>smoothScroll('#gallery')} aria-label="View gallery">
          <ChevronDown size={14}/>
        </button>
      </section>

      {/* ════════════════════════════════════════════════
          COVEO-STYLE CAROUSEL SECTION
          carouselContainer, intro avatar+logo, side-text,
          horizontal scrolling art cards, new banner, fade
      ════════════════════════════════════════════════ */}
      <section className="l-carousel-section" style={{minHeight:'420px',position:'relative'}}>

        {/* "Now Available" banner — COVEO featuredRelease */}
        <div className="l-new-banner">
          <span className="l-new-banner-dot"/>
          <span className="l-new-banner-text">Latest Work — Now Available</span>
        </div>

        {/* COVEO .intro: avatar + logo */}
        <div className="l-carousel-intro">
          <div className="l-carousel-avatar">
            <img src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=160&q=80" alt="Lain"/>
          </div>
          <div className="l-carousel-logo">Lain<span>098_</span></div>
          <div className="l-carousel-sub">An Anime Art Project</div>
        </div>

        {/* COVEO .side-text with highlighted spans */}
        <p className="l-carousel-sidetext">
          Art for the <span>day-dreamers</span>, the <span>over-thinkers</span>, the <span>storytellers</span>,
          and the <span>wanderers</span> — a soundtrack for those who find beauty in every moment.
        </p>

        {/* carousel track — like COVEO .carousel */}
        <div className="l-carousel">
          {[...GALLERY,...GALLERY].map((item,i)=>(
            <div key={i} className="l-carousel-item" onClick={()=>openLb(i%GALLERY.length)}>
              <img src={item.img} alt={item.title} loading="lazy"/>
              <div className="l-carousel-item-overlay"/>
              <span className="l-carousel-item-tag">{item.tag}</span>
            </div>
          ))}
        </div>

        {/* COVEO .fade radial gradient overlay */}
        <div className="l-carousel-fade" aria-hidden="true"/>

        {/* COVEO .previewText */}
        <p className="l-carousel-preview-txt">Tap artwork to view full piece</p>
      </section>

      {/* MARQUEE */}
      <div className="l-marquee-wrap" aria-hidden="true">
        <div className="l-marquee">
          {[...ART_MARQUEE,...ART_MARQUEE,...ART_MARQUEE].map((t,i)=>(
            <span key={i} className={`l-marquee-item${t==='✦'?' l-marquee-dot':''}`}>{t}</span>
          ))}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          ABOUT — Fuzzy Hat reference
          Huge split serif title, image bleed off-screen right,
          floating ghost circles, JOIN NOW pill, numbered feats
      ════════════════════════════════════════════════ */}
      <section className="l-about" id="about">
        {/* image bleed right — Fuzzy Hat */}
        <div className="l-about-img-bleed">
          <img src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&q=85" alt="art"/>
        </div>

        {/* ghost circle elements — Fuzzy Hat */}
        {[
          {w:180,h:180,top:'15%',left:'42%','--gf':'9s','--gy':'-22px'},
          {w:90, h:90, top:'60%',left:'38%','--gf':'7s','--gy':'-14px'},
          {w:120,h:120,top:'30%',right:'52%','--gf':'11s','--gy':'-18px'},
          {w:55, h:55, bottom:'20%',left:'46%','--gf':'8s','--gy':'-10px'},
        ].map((c,i)=>(
          <div key={i} className="l-about-ghost-circle" style={{
            width:c.w,height:c.h,top:(c as any).top,left:(c as any).left,
            right:(c as any).right,bottom:(c as any).bottom,
            '--gf':c['--gf'],'--gy':c['--gy'],
          } as React.CSSProperties}/>
        ))}

        <div className="l-about-content">
          {/* HUGE split title — Fuzzy Hat "FUZZY HAT" */}
          <div className="l-about-bigtitle" aria-label="Hello I'm Lain">
            <span className="line1"><em>Hello</em></span>
            <span className="line2">I'm Lain.</span>
          </div>

          <p className="l-about-text">
            I'm a digital artist specializing in anime-style illustrations, fanart,
            original characters, chibi, and short animations. Every piece I make
            is made with intention — to make you feel something.
          </p>

          <div className="l-about-cta-row">
            <a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer"
               className="l-btn-pri" onMouseMove={e=>mag(e)} onMouseLeave={magLeave}>
              Commission Me
            </a>
            <a href="https://www.instagram.com/lain098_" target="_blank" rel="noopener noreferrer"
               className="l-btn-out" onMouseMove={e=>mag(e)} onMouseLeave={magLeave}>
              <Instagram size={14}/> Instagram
            </a>
          </div>

          {/* numbered sections — Fuzzy Hat "01 LLAMATIVO Y ÚNICO" */}
          <div className="l-about-feats">
            {[
              {n:'01',title:'Anime & Fanart',    desc:'Detailed character illustrations with expressive linework, rich color and cinematic lighting.'},
              {n:'02',title:'Original Characters',desc:'Unique OC designs from concept to final with full color, shading and optional lore sheet.'},
              {n:'03',title:'Chibi & Animations', desc:'Adorable chibi illustrations and short looping GIF animations for emotes and sticker packs.'},
            ].map(f=>(
              <div key={f.n} className="l-about-feat">
                <div className="l-about-feat-num">{f.n}</div>
                <div>
                  <div className="l-about-feat-title">{f.title}</div>
                  <div className="l-about-feat-desc">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>

          {/* arrow like Fuzzy Hat → */}
          <div className="l-about-arrow" aria-hidden="true">→</div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          GALLERY — Vanderbilt + Japanese zine
      ════════════════════════════════════════════════ */}
      <section className="l-gallery" id="gallery">
        <div className="l-gallery-header">
          <div>
            <span className="l-sec-label">— Portfolio</span>
            <h2 className="l-gallery-title">Selected <em>Works</em></h2>
          </div>
          <div className="l-gallery-filters">
            {[{k:'all',l:'All Works'},{k:'oc',l:'OC Design'},{k:'fanart',l:'Fanart'},{k:'chibi',l:'Chibi'},{k:'animation',l:'Animation'}].map(f=>(
              <button key={f.k} className={`l-filter-btn${activeFilter===f.k?' on':''}`}
                onClick={()=>setActiveFilter(f.k)}>
                {f.l}
              </button>
            ))}
          </div>
        </div>

        {/* VANDERBILT row — center photo larger, side blurred, /01 /02 /03 labels */}
        <div className="l-gallery-vand" style={{maxWidth:'1100px',margin:'0 auto 5rem'}}>
          <div className="l-gallery-vand-header">Grupos like x like</div>
          <div className="l-gallery-vand-row">
            {[
              {img:GALLERY[0].img, num:'/01', name:'Crystal Reverie',  cls:'side'},
              {img:GALLERY[2].img, num:'/02', name:'Star & Sky',       cls:'center'},
              {img:GALLERY[6].img, num:'/03', name:'Cloud Dancer',     cls:'side'},
            ].map((v,i)=>(
              <div key={i}>
                <div className={`l-vand-item ${v.cls}`} onClick={()=>openLb(i===0?0:i===1?2:6)}>
                  <img src={v.img} alt={v.name} loading="lazy"
                    style={{height: v.cls==='center'?'360px':'280px'}}/>
                  <div className="l-art-zoom"><ZoomIn size={13}/></div>
                </div>
                <div className="l-vand-label">
                  <span className="l-vand-num">{v.num}</span>
                  <span className="l-vand-name">{v.name}</span>
                </div>
              </div>
            ))}
          </div>
          {/* Vanderbilt page number "022" and "created by" */}
          <div className="l-vand-footer">
            <span className="l-vand-page">022</span>
            <span className="l-vand-credit">created by <span>lain098_</span></span>
          </div>
        </div>

        {/* main art grid — Japanese zine asymmetric layout */}
        <div className="l-gallery-grid">
          {filtered.map((item,i)=>(
            <div key={item.id} className="l-art-card" onClick={()=>openLb(i)}
              role="button" tabIndex={0} aria-label={`View ${item.title}`}
              onKeyDown={e=>e.key==='Enter'&&openLb(i)}>
              <div className="l-art-img-wrap">
                <img src={item.img} alt={item.title} loading="lazy"/>
                <div className="l-art-overlay" aria-hidden="true">
                  <span className="l-art-tag">{item.tag}</span>
                  <span className="l-art-title">{item.title}</span>
                </div>
                <div className="l-art-zoom" aria-hidden="true"><ZoomIn size={13}/></div>
              </div>
              <div className="l-art-meta">
                <div>
                  <div className="l-art-tag">{item.tag}</div>
                  <div className="l-art-title">{item.title}</div>
                </div>
                {/* Japanese zine Page /XX */}
                <span className="l-art-page">Page /{String(i+1).padStart(2,'0')}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* LIGHTBOX */}
      <div className={`l-lightbox${lbOpen?' open':''}`} role="dialog" aria-modal="true">
        <div className="l-lightbox-bg" onClick={closeLb}/>
        <div className="l-lightbox-inner">
          <button className="l-lightbox-close" onClick={closeLb} aria-label="Close"><X size={17}/></button>
          <button className="l-lightbox-nav prev" onClick={lbPrev} aria-label="Previous"><ChevronLeft size={19}/></button>
          <button className="l-lightbox-nav next" onClick={lbNext} aria-label="Next"><ChevronRight size={19}/></button>
          {filtered[lbIdx] && <>
            <div className="l-lightbox-img-wrap">
              <img src={filtered[lbIdx].img} alt={filtered[lbIdx].title}/>
            </div>
            <div className="l-lightbox-info">
              <div>
                <div className="l-lightbox-title">{filtered[lbIdx].title}</div>
                <div className="l-lightbox-tag">{filtered[lbIdx].tag}</div>
              </div>
              <div className="l-lightbox-year">{filtered[lbIdx].year}</div>
            </div>
            <div className="l-lightbox-count">{lbIdx+1} / {filtered.length}</div>
          </>}
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          COLLAGE SECTION — Lost & Forgotten exact
          Full landscape top photo, overlapping cut-out photos,
          vertical center line, "LOST AND FORGOTTEN" title,
          scattered corner texts, cursive script, "ME?" big word
      ════════════════════════════════════════════════ */}
      <section className="l-collage">
        {/* full-width top photo — L&F */}
        <img
          className="l-collage-top-img"
          src="https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=1400&q=85"
          alt="cherry blossom landscape"
          loading="lazy"
        />

        {/* scattered corner texts — L&F exact */}
        <div className="l-collage-corner tl" aria-hidden="true">
          TO ART, FOR ART<br/>
          I'VE CHANGED EVERY<br/>
          PART OF ME<br/>
          UNTIL THE OC PIECES<br/>
          AREN'T ME AT ALL
        </div>
        <div className="l-collage-corner tr" aria-hidden="true">
          I LOOK AT THE SCREEN, NOW I'M<br/>
          JUST A JIGSAW<br/>
          YOU TAKE EVERY PART OF ME<br/>
          ALL OF THE THINGS YOU NEED<br/>
          THE THE REST YOU KEEP
        </div>

        {/* overlapping cut-out photo chaos — L&F */}
        <div className="l-collage-board">
          <div className="l-collage-vline" aria-hidden="true"/>
          <div className="l-collage-num" aria-hidden="true">02</div>

          {[
            {src:COLLAGE_IMGS[0], w:160,h:130, top:'8%',  left:'5%',  rot:-5,  cap:'Loop of Spring'},
            {src:COLLAGE_IMGS[1], w:200,h:160, top:'4%',  left:'30%', rot:3,   cap:'Crystal Reverie'},
            {src:COLLAGE_IMGS[2], w:145,h:120, top:'2%',  left:'62%', rot:-3,  cap:'Velvet Dawn'},
            {src:COLLAGE_IMGS[3], w:175,h:140, top:'42%', left:'8%',  rot:5,   cap:'Tiny Wisteria'},
            {src:COLLAGE_IMGS[4], w:155,h:130, top:'46%', left:'52%', rot:-4,  cap:'Cloud Dancer'},
          ].map((p,i)=>(
            <div key={i} className="l-collage-photo" style={{
              top:p.top, left:p.left,
              transform:`rotate(${p.rot}deg)`,
              zIndex:i+1,
            }}>
              <img src={p.src} alt={p.cap} style={{width:p.w,height:p.h}} loading="lazy"/>
              <div className="l-collage-photo-cap">{p.cap}</div>
            </div>
          ))}
        </div>

        {/* "LOST AND FORGOTTEN" style section */}
        <div className="l-collage-title-wrap">
          <h2 className="l-collage-title">Lost &amp; Found in Art</h2>
          <span className="l-collage-script" aria-hidden="true">lost and found</span>
          <p className="l-collage-title-sub">
            the moment when you feel forgotten in the place where you once felt most important.
            it's hard to even breathe in here without thinking that you are truly lost.
          </p>
        </div>

        {/* "ME?" like L&F big word */}
        <div className="l-collage-bigword" aria-hidden="true">ART?</div>
        <div className="l-collage-corner br" aria-hidden="true">
          @lain098_<br/>
          digital artist
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          SKY SECTION — Filosofi Teras + 樸素 + Chinese blue collage
          Full-bleed sky, all vertical text, overlapping photos,
          color swatches, diagonal slash, big kanji-style word
      ════════════════════════════════════════════════ */}
      <section className="l-sky-section">
        <div className="l-sky-bg"/>

        {/* diagonal slash lines — Chinese blue collage */}
        {[
          {left:'30%',top:'0',height:'100%',rot:'12deg'},
          {left:'65%',top:'0',height:'100%',rot:'-8deg'},
        ].map((s,i)=>(
          <div key={i} className="l-sky-slash" style={{
            left:s.left, top:s.top, height:s.height,
            transform:`rotate(${s.rot}) translateX(-50%)`,
          }}/>
        ))}

        {/* 樸素 large kanji-style */}
        <div className="l-sky-kanji" aria-hidden="true">夢</div>

        {/* center: cursive title + vertical body text — Filosofi Teras */}
        <div className="l-sky-vert-title" style={{position:'absolute',left:'50%',top:'50%',transform:'translate(-50%,-50%)',zIndex:5,display:'flex',gap:'3rem',alignItems:'center'}}>
          <p className="l-sky-vtext">
            Hello I'm Lain — a digital artist whose work focuses on anime style illustrations, fanart, OCs, chibi, and short animations. I enjoy creating unique characters and bringing ideas to life through art.
          </p>
          <div className="l-sky-cursive">Lain098_</div>
          <p className="l-sky-vtext">
            Commissions open. DM on Instagram or visit my Throne wishlist. Every piece is made with love and intention — art for those who feel everything deeply.
          </p>
        </div>

        {/* offset overlapping photos — Chinese blue collage */}
        <div className="l-sky-photos" style={{position:'absolute',right:'4%',top:'50%',transform:'translateY(-50%)',zIndex:4,width:'clamp(260px,35vw,380px)',height:'460px'}}>
          {[
            {src:GALLERY[9].img,  w:'65%', h:'200px', top:'0',   left:'0',   rot:'-2deg'},
            {src:GALLERY[3].img,  w:'72%', h:'220px', top:'40%', right:'0',  rot:'3deg'},
            {src:GALLERY[5].img,  w:'52%', h:'160px', top:'60%', left:'5%',  rot:'-1deg'},
          ].map((p,i)=>(
            <div key={i} className="l-sky-photo-item" style={{
              width:p.w, height:p.h,
              top:p.top, left:(p as any).left, right:(p as any).right,
              transform:`rotate(${p.rot})`,
            }}>
              <img src={p.src} alt="" loading="lazy"/>
            </div>
          ))}
        </div>

        {/* color swatches — Chinese blue collage bottom right */}
        <div className="l-sky-swatches" aria-hidden="true">
          <div className="l-sky-swatch" style={{background:'#1a2d4a'}}/>
          <div className="l-sky-swatch" style={{background:'#3BA3CE'}}/>
          <div className="l-sky-swatch" style={{background:'#87CEEB'}}/>
        </div>

        {/* metadata columns — Filosofi Teras "Halaman 131" / "Archive by" / "Typography" */}
        <div className="l-sky-meta-cols">
          {['Typography','Archive by Lain','Halaman 001','Creative'].map((t,i)=>(
            <div key={i} className="l-sky-meta-col">{t}</div>
          ))}
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          YHL GAME UI — artist stats HUD
          Dark parchment, character image left, stat bars right
      ════════════════════════════════════════════════ */}
      <section className="l-hud">
        {/* HUD top bar — YHL */}
        <div className="l-hud-topbar" style={{maxWidth:'1100px',margin:'0 auto 2rem'}}>
          <div className="l-hud-topbar-item">
            <span>Commissions</span>
            <span className="l-hud-topbar-val">● 900</span>
          </div>
          <div className="l-hud-topbar-item">
            <span>Followers</span>
            <span className="l-hud-topbar-val">▲ 7890</span>
          </div>
          <div className="l-hud-topbar-item">
            <span>Works</span>
            <span className="l-hud-topbar-val">◆ 1200</span>
          </div>
        </div>

        <div className="l-hud-inner" style={{maxWidth:'1100px',margin:'0 auto'}}>
          {/* left: character silhouette */}
          <div className="l-hud-char">
            <div className="l-hud-char-tab">Introduce</div>
            <img className="l-hud-char-img"
              src="https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?w=600&q=85"
              alt="Lain character art"/>
            <div className="l-hud-char-label">ANNUAL 人物信息界面</div>
          </div>

          {/* right: stats panel — YHL exact */}
          <div className="l-hud-stats">
            <div className="l-hud-stats-header">
              <div className="l-hud-char-name">Lain098_</div>
              <div className="l-hud-char-level">70 ─────── 剩可达再工程[4.8s]</div>
              <div className="l-hud-char-status">● MESSAGE RESTART IN PROGRESS</div>
              <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'.58rem',color:'rgba(90,75,50,.45)',letterSpacing:'.1em',marginTop:'.2rem'}}>
                REMAINING LIFE ●●●●●
              </div>
            </div>

            {/* HP bars */}
            <div className="l-hud-hp-row">
              {[{l:'Linework Precision',v:92},{l:'Color Theory',v:88},{l:'Character Design',v:95},{l:'Storytelling',v:90}].map(b=>(
                <div key={b.l}>
                  <div className="l-hud-hp-label">{b.l}</div>
                  <div className="l-hud-hp-bar-bg">
                    <div className="l-hud-hp-bar-fill" style={{'--v':`${b.v}%`} as React.CSSProperties}/>
                  </div>
                </div>
              ))}
            </div>

            {/* stat grid — YHL numbered table */}
            <div className="l-hud-stat-grid">
              {[
                {k:'建设系数RO',v:'90000'},{k:'攻击系数RO',v:'18021'},
                {k:'防御系数RO',v:'2000'}, {k:'意志系数RO',v:'9009'},
                {k:'年配系数RO',v:'600'},  {k:'平行系数RO',v:'58'},
              ].map(s=>(
                <div key={s.k} className="l-hud-stat-row">
                  <span className="l-hud-stat-key">{s.k}</span>
                  <span className="l-hud-stat-val">{s.v}</span>
                </div>
              ))}
            </div>

            {/* action buttons — YHL Equip / Live */}
            <div className="l-hud-actions">
              <button className="l-hud-action">Equip</button>
              <button className="l-hud-action">Live</button>
            </div>

            {/* icon row */}
            <div className="l-hud-icon-row">
              {['◯','□','△','♡','✦','⟡','☆'].map((ic,i)=>(
                <div key={i} className="l-hud-icon">{ic}</div>
              ))}
            </div>
            <span className="l-hud-section-label">ANNUAL 人物信息界面 · RO 90</span>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          COMMISSIONS — RS/blutkrahe split hero + Fuzzy Hat cards
      ════════════════════════════════════════════════ */}
      <section className="l-comm" id="commissions">
        {/* RS split hero: photo LEFT, bold text RIGHT */}
        <div className="l-comm-hero">
          <div className="l-comm-hero-img">
            <img src="https://images.unsplash.com/photo-1612544448445-b8232cff3b6c?w=900&q=85" alt="commission art"/>
            <div className="l-comm-hero-img-overlay"/>
          </div>
          <div className="l-comm-hero-text">
            {/* RS fake nav */}
            <div className="l-comm-nav-fake">
              {['Home','About','Gallery','Settings'].map((n,i)=>(
                <span key={n} className={`l-comm-nav-fake-item${i===0?' active':''}`}>{n}</span>
              ))}
            </div>
            {/* "LET'S GET THIS PARTY STARTED" — RS */}
            <h2 className="l-comm-hero-hed">Let's create<br/>something<br/>beautiful.</h2>
            <div className="l-comm-status">
              <span className="l-comm-status-dot"/>
              Commissions Open
            </div>
            <p className="l-comm-sub">
              Fill out my commission form on Throne or DM me on Instagram.
              I love bringing your characters and ideas to life.
            </p>
            <a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer"
               className="l-btn-pri" onMouseMove={e=>mag(e)} onMouseLeave={magLeave}>
              <ExternalLink size={13}/> Request via Throne
            </a>
          </div>
        </div>

        {/* commission cards */}
        <div className="l-comm-cards">
          <div style={{marginBottom:'2.5rem'}}>
            <span className="l-sec-label">— Commission Types</span>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:'clamp(1.8rem,3.4vw,2.6rem)',fontWeight:400,color:'#1a2332'}}>
              Choose your <em style={{color:'#3BA3CE',fontStyle:'italic'}}>style</em>
            </h2>
          </div>
          <div className="l-comm-grid">
            {COMMISSIONS.map((c,i)=>(
              <div key={i} className="l-comm-card">
                <div className="l-comm-num">{c.num}</div>
                <div className="l-comm-icon">{c.icon}</div>
                <div className="l-comm-tier">{c.tier}</div>
                <div className="l-comm-name">{c.name}</div>
                <p className="l-comm-desc">{c.desc}</p>
                <div className="l-comm-feats">
                  {c.features.map((f,fi)=><div key={fi} className="l-comm-feat">{f}</div>)}
                </div>
                <div className="l-comm-footer">
                  <div className="l-comm-price">{c.price} <span>starting</span></div>
                  <div className="l-comm-arr"><ArrowRight size={14}/></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          PROCESS — Japanese zine layout
          White page, big decorative number, asymmetric,
          Page /XX labels, thin rules, lots of whitespace
      ════════════════════════════════════════════════ */}
      <section className="l-process" id="process">
        <div className="l-process-inner">
          <div className="l-process-header">
            <div>
              <span className="l-sec-label">— How it works</span>
              <h2 className="l-process-title">The commission <em>process</em></h2>
            </div>
            {/* big decorative number — Japanese zine right side */}
            <div className="l-process-big-num" aria-hidden="true">05</div>
          </div>

          <div className="l-steps">
            <div className="l-steps-rule" aria-hidden="true"/>
            {PROCESS.map((s,i)=>(
              <div key={i} className="l-step">
                <div className="l-step-num">{s.num}</div>
                <div className="l-step-body">
                  <div className="l-step-title">{s.title}</div>
                  <p className="l-step-desc">{s.desc}</p>
                </div>
                <div className="l-step-aside">
                  <div className="l-step-label">{s.label}</div>
                  {/* Page /XX like Japanese zine */}
                  <div className="l-step-page">Page /{String(i+1).padStart(2,'0')}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════
          COVEO ACKNOWLEDGEMENTS-STYLE contact
          avatar + logo, SVG sig, side-text, COVEO vibes
      ════════════════════════════════════════════════ */}
      <section className="l-contact" id="contact">
        <div className="l-contact-inner">
          <div className="l-contact-avatar">
            <img src="https://images.unsplash.com/photo-1607748851687-ba9a10438621?w=220&q=80" alt="Lain"/>
          </div>
          <span className="l-sec-label">— Get in Touch</span>
          <h2 className="l-contact-title">Let's create <em>together</em></h2>
          <p className="l-contact-text">
            Whether you want a commission, have a collab idea, or just want to say hi —
            my DMs are always open. I love meeting fellow art enjoyers 🩵
          </p>
          <div className="l-socials">
            <a href="https://www.instagram.com/lain098_?igsh=aXpiYXBuYWJxOXFw" target="_blank" rel="noopener noreferrer" className="l-social-link">
              <Instagram size={14} style={{color:'#3BA3CE'}}/> @lain098_
            </a>
            <a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer" className="l-social-link">
              <Heart size={14} style={{color:'#3BA3CE'}}/> Throne Wishlist
            </a>
          </div>
          <div className="l-contact-cta">
            <a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer"
               className="l-btn-pri" onMouseMove={e=>mag(e)} onMouseLeave={magLeave}>
              <Send size={13}/> Send a Commission Request
            </a>
          </div>
        </div>
      </section>

      {/* COVEO acknowledgements section */}
      <section className="l-ack">
        <div className="l-ack-inner">
          <div className="l-ack-img">
            <img src="https://images.unsplash.com/photo-1547036967-23d11aacaee0?w=800&q=85" alt="art inspiration"/>
          </div>
          <div className="l-ack-content">
            {/* SVG signature — COVEO acknowledgements style */}
            <div className="l-ack-sig">
              <svg width="116" height="44" viewBox="0 0 116 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M115.346 21.8893C115.305 21.6315 115.088 21.6635 114.899 21.6469C114.402 21.6007 113.924 21.6789 113.464 21.8765C113.242 21.9599 109.686 22.8784 105.778 23.1414C104.747 23.2017 102.393 23.5993 100.553 23.5339C98.9668 23.5403 88.081 23.2132 86.2898 24.6884C85.5888 25.3504 85.6289 26.2496 86.3792 26.7833C87.0835 27.2836 87.0917 27.3234 86.6043 27.8724C85.8637 28.891 83.6847 29.7197 82.9489 29.2899C83.0842 27.5479 85.926 26.9295 84.0513 26.0598C83.4149 25.7647 81.424 25.3504 79.6624 28.4343C79.3146 28.9256 78.8567 29.2386 78.3032 29.5196C77.8925 29.7274 75.6383 30.5625 74.8862 30.6138C74.4426 30.6113 74.003 30.6087 73.5634 30.6061C73.0993 30.3816 73.0863 30.1289 73.514 29.8441C73.7613 29.6786 73.9881 29.4811 74.2546 29.3464C78.0784 27.4273 77.4601 26.401 77.0447 25.5916C76.9659 25.3453 76.8179 25.2221 76.5444 25.3196C76.0707 24.818 75.5291 24.6307 74.8535 24.8219C73.8417 25.1913 72.8623 25.4569 72.0139 26.3061C71.1806 27.1399 70.471 27.9135 70.2315 29.0321C69.3042 29.3066 69.0989 29.9262 66.788 29.8313C66.4072 29.6928 65.2469 29.5363 65.5642 28.1777C65.9267 27.6364 65.6954 27.3336 65.224 26.9873C64.5875 26.4613 63.8351 26.4729 63.3077 27.0155C62.5863 27.8763 60.6122 28.9013 58.9639 29.5953C58.3162 29.8416 57.6698 30.0891 57.022 30.3355C56.6968 30.4586 56.3719 30.524 56.0556 30.3355C55.8377 30.1251 54.8566 29.3195 56.4474 28.5716C57.4093 28.12 56.4913 27.1669 55.6385 25.8058C55.2269 25.149 53.1888 26.2573 52.8579 26.3933C51.6102 26.9052 52.1026 26.6499 49.7792 26.809C47.4631 27.1322 47.9722 27.5684 46.6876 28.2432C45.1827 29.0334 44.6493 29.9763 43.149 29.9865C42.6599 29.9352 42.4152 29.3451 43.0573 28.7306C45.3477 25.7211 45.3494 26.8436 47.6409 26.3946C49.2152 26.0867 48.8306 24.1009 47.9928 24.0534C46.9551 24.0599 44.6926 24.9527 44.2357 25.1362C41.3477 26.292 37.5034 27.8481 35.8066 28.4086C32.0896 29.6389 21.7617 33.9774 21.5556 34.0595C7.10894 40.7969 2.90246 42.5518 4.08568 40.77C5.52312 38.9099 10.3262 33.7491 10.8497 33.2051C11.2088 32.8793 16.9105 27.6056 16.9366 27.5812C18.8516 26.0418 33.0841 14.0949 34.0069 13.2238C34.2114 13.0558 41.0973 7.85776 41.933 7.31769C42.0825 7.28947 42.2265 7.31641 42.1962 7.58452C41.4282 8.52611 37.3373 13.2469 37.3373 13.2469C35.1643 15.6124 31.9829 18.7515 31.1203 19.6264C30.5669 20.187 31.8674 21.1697 32.8189 21.0337C34.0383 20.8605 36.1702 17.8612 36.6926 17.2622C37.1885 16.6952 49.5336 1.96445 49.4422 1.40899C49.3511 0.840697 48.8746 0.626465 48.392 0.626465C47.4872 0.626465 33.5191 10.0565 32.8692 10.8506C32.084 11.5023 22.3807 19.4815 15.6569 25.2529C11.9735 28.4138 9.32178 31.0243 9.20305 31.1462C7.64138 32.7549 2.41964 38.6867 1.69305 39.7758C1.11065 40.6494 0.736125 41.4717 0.983001 42.4556C1.54436 44.6864 5.70062 43.5678 6.42017 43.3407C10.5752 42.0284 19.9324 37.3666 25.4318 35.0665C31.5375 32.5124 36.8574 30.0212 39.4193 29.3464C39.5733 29.3053 39.7741 29.2194 39.8053 29.4901C39.7413 29.7607 40.0489 30.8742 40.9466 31.6439C42.1303 32.3944 43.3156 32.2405 44.4162 32.0506C45.289 31.948 48.1669 29.6825 48.9324 29.2989C50.5016 28.5126 52.7424 28.2444 52.9079 28.9295C52.8792 30.5561 53.8826 31.8505 54.7227 32.2905C55.2451 32.6792 55.7662 32.7869 56.476 32.6189C58.6433 32.107 62.3282 30.2149 62.3942 30.1559C62.8553 29.7338 63.2732 29.7454 63.4429 30.329C63.6749 31.1282 65.4137 32.0647 66.1803 32.0211C66.4446 32.0609 68.291 32.0878 68.9026 31.6016C69.3 31.295 70.2161 31.2283 70.7788 31.7594C71.036 32.0018 72.0967 32.5047 72.2333 32.556C75.5519 33.0897 78.523 31.5529 78.7992 31.4092C79.3577 31.2809 79.9193 30.9538 80.4477 31.4631C81.0988 32.0904 81.6246 32.0313 82.8004 31.7863C84.7104 31.508 87.5 30.8883 90.1396 27.7595C90.4309 27.4132 90.2265 26.918 90.4072 26.4074C91.5516 25.3311 98.5553 25.6185 99.4386 25.6185C102.213 25.6185 105.898 25.0528 106.913 24.945C110.826 24.5332 113.568 23.4929 114.503 23.0464C114.97 22.7527 115.397 22.491 115.345 21.8906L115.346 21.8893Z" fill="#87CEEB"/>
              </svg>
              <div className="l-ack-sig-line"/>
            </div>
            <p className="l-ack-quote">
              Music for the <span>day-dreamers</span>, the <span>over-thinkers</span>, the <span>storytellers</span>,
              and the <span>wanderers</span> — a soundtrack for those who find beauty in every moment,
              and meaning in every silence.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="l-footer">
        <p className="l-footer-copy">© 2025 Lain098_ · All rights reserved</p>
        <span className="l-footer-sig">Lain</span>
        <ul className="l-footer-links">
          {[{l:'About',h:'#about'},{l:'Gallery',h:'#gallery'},{l:'Commissions',h:'#commissions'}].map(n=>(
            <li key={n.l}><a href={n.h} onClick={e=>{e.preventDefault();smoothScroll(n.h)}}>{n.l}</a></li>
          ))}
          <li><a href="https://www.instagram.com/lain098_" target="_blank" rel="noopener noreferrer">Instagram</a></li>
          <li><a href="https://throne.com/lain098_" target="_blank" rel="noopener noreferrer">Throne</a></li>
        </ul>
      </footer>

    </div>
  )
}

// ── Arkzen wrapper ─────────────────────────────────────────────────────────────
const ArkzenPage_Lain098_Index = () => {
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    const cleanup = lain098Animations(pageRef)
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

export default ArkzenPage_Lain098_Index
