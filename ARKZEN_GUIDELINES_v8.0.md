# ARKZEN GUIDELINES DOCUMENT v8.0
## For Claude AI — Generating Tatemono Files

**UPDATED:** 2026-05-06
**VERSION:** 8.0 (Previously v7.7 with major design & UX additions)
**VERIFIED AGAINST:** 21 active tatemonos + queue-flow debugging + design/transition/UX defaults
**NEW IN v8.0:**
- ADDED: Section 2D — Transition Defaults (context, drill, continuity transitions as smart fallbacks)
- ADDED: Section 2E — UX Pattern Defaults (skeleton screens, optimistic UI, progress illusions)
- EXPANDED: Section 2C — Design Aesthetic Policy with 6-tier fallback system (minimalism, glassmorphism, skeuomorphism, claymorphism, neo-brutalism, liquid glass)
- CLARIFIED: All design, transition, and UX defaults are completely overridable by user request
**PREVIOUS (v7.7):**
- FIXED: `@arkzen:routes` custom handlers MUST use `@arkzen:handler:name` — NOT `@arkzen:endpoint:name`
- FIXED: `@arkzen:endpoint:name` is ONLY for `@arkzen:api` resource controller methods
- FIXED: foreignId `foreign:` value must use the ACTUAL generated table name (with tatemono prefix)
- FIXED: broadcast events require a SEPARATE `@arkzen:realtime` block with `channel:` key
- FIXED: `QueueUpdated`-style events used with `broadcast()` must be in `Broadcast` sub-namespace
- ADDED: Section 9B — `@arkzen:handler:name` complete rules
- ADDED: Section 7D — foreignId prefixed table name rule
- ADDED: Section 11B — how broadcast events vs channels are declared
- UPDATED: Section 9 — clarified `@arkzen:routes` + handler relationship
- UPDATED: Section 18 — `@arkzen:endpoint` scope clarification
- UPDATED: Section 29 — checklist updated with new rules

---

## SECTION 1 — WHAT IS ARKZEN

Arkzen is a full-stack scaffolding engine built on Next.js TypeScript and Laravel. It uses a single file format called a **Tatemono** to define an entire system — multiple database tables, multiple backend API resources, middleware, multiple frontend pages and components, multiple stores, real-time channels, background jobs, notifications, events, and animations — all in one file.

**One Tatemono = one complete, fully isolated client system.**

Each Tatemono is its own world. It does not share anything with other Tatemonos. No shared auth, no shared components, no shared stores. Every Tatemono stands alone.

**Stack:**
- Frontend: Next.js 16 + TypeScript + Tailwind CSS + Zustand
- Backend: Laravel 13 + SQLite (per-tatemono isolated) + Laravel Sanctum
- Real-time: Laravel Reverb
- Animation: GSAP + Framer Motion
- Icons: Lucide React (primary) + Hero Icons (secondary)
- Optional: Matter.js, Three.js, TipTap, Leaflet

---

## SECTION 2 — TAILWIND CSS POLICY

Tailwind CSS is the default for page and component styling. Inline styles are also valid and often preferred for dynamic values or complex glassmorphism/gradient effects.

**Use Tailwind for:** utility classes, spacing, flex/grid, text sizes, colors
**Use inline styles for:** dynamic computed values, complex gradients, glassmorphism, backdrop-filter, box-shadow, animation values

Both can be mixed freely. Never use both on the same property.

---

## SECTION 2B — ICON & EMOJI POLICY

**Lucide React is the default.** Hero Icons only when Lucide doesn't have the needed icon.

```tsx
import { Plus, Trash2, Edit2, Search, Bell, ChevronRight, X } from 'lucide-react'
```

Rules:
- Always import from lucide-react first
- Never import icons you don't use
- Icon size: `size` prop on Lucide (`<Plus size={16} />`)
- In layouts: import lucide in the layout block itself
- In components: import lucide in @arkzen:components block
- In multiple components blocks: only import in the FIRST block — subsequent blocks share the same file scope

---

## SECTION 2C — DESIGN AESTHETIC POLICY & FALLBACK SYSTEM

Default to Awwwards-quality design. The queue-flow tatemono demonstrates the target quality level:
- Glassmorphism with `rgba` backgrounds and `backdropFilter: blur`
- Gradient backgrounds via inline style
- Soft shadows, rounded corners (border-radius 16-28px)
- Animated SVG components for data visualization
- Light/pastel color schemes work as well as dark

### Design Fallback System

When no specific design style is requested, apply these design patterns in order of priority (best fit for the system context first):

**Priority 1: Minimalism** (Arkzen default)
- Clean lines, ample whitespace, typography-focused
- Best for: content-heavy, data-dense, professional systems
- Example: task managers, dashboards, admin panels
- Colors: neutral palette, high contrast text, subtle grays

**Priority 2: Glassmorphism**
- Frosted glass effect with `rgba + backdrop-filter: blur`
- Best for: modern, sleek, translucent layers
- Example: overlay cards, nav bars, modals
- Colors: semi-transparent overlays, dark/light backgrounds

**Priority 3: Skeuomorphism**
- Realistic, textured, 3D-like elements (subtle depth)
- Best for: familiar interactions, banking/finance, legacy users
- Example: credit card designs, document-like interfaces
- Colors: realistic shadows, material textures

**Priority 4: Claymorphism**
- Soft, rounded, 3D-plastic appearance
- Best for: friendly, playful, approachable applications
- Example: creative tools, social apps, onboarding flows
- Colors: pastel, soft shadows, muted tones

**Priority 5: Neo-Brutalism**
- Raw, bold, high-contrast, thick borders, geometric
- Best for: statement-making, alternative apps, attention-grabbing
- Example: experimental tools, artistic platforms, portfolio sites
- Colors: stark black/white, bold accent colors

**Priority 6: Liquid Glass** (Morphism variant)
- Flowing, liquid-like shapes, soft gradients, smooth animations
- Best for: premium, polished, sophisticated experiences
- Example: high-end products, media apps, design showcases
- Colors: gradient-heavy, smooth color transitions

**Application Rules:**
- These are fallback defaults when user doesn't specify a design style
- Choice depends on system purpose and user demographic
- Multiple styles CAN be mixed (e.g. minimalist base + glassmorphism accents)
- Always overrideable: if user specifies "neo-brutalism" or "skeuomorphism", use their request
- Generate modern, polished interfaces regardless of fallback choice
- Accessibility (contrast, readability) remains a priority in all styles

---

## SECTION 2D — TRANSITION DEFAULTS

When no specific transition type is requested, apply these transition patterns (non-exclusive, can combine):

### Transition Types (Priority Order)

**Context Transition**
- Animate based on page/section context
- Example: opening a detail view slides in from the side, button state change fades
- Best for: showing relationship between screens
- Implementation: `transition: all 0.3s ease-out`, transform properties

**Drill Transition**
- Zoom/scale interaction focusing into detail
- Example: clicking a card zooms it to fill screen, clicking back zooms out
- Best for: hierarchical navigation, focused tasks
- Implementation: `transform: scale()`, `opacity`, positioned stagger

**Continuity Transition**
- Motion continuity between elements
- Example: shared element transition, smooth flow between related states
- Best for: polished, premium feel
- Implementation: layout animations, morphing shapes, path animations

### UX Transition Patterns (Select 1-2 per interaction)

**Page Transitions:**
- Default: Context transition (fade + slide: `opacity 0.3s`, `transform 0.4s`)
- Alternative: Drill transition (zoom: `scale 0.3s`, parent container scaling)

**Modal/Overlay:**
- Default: Continuity transition (smooth entrance: `scale-in`, fade-in)
- Recommended duration: 0.25-0.35s

**Button/State Changes:**
- Default: Context transition (quick feedback: `0.15-0.2s`)
- Avoid long animations for frequent interactions

**List Item Actions:**
- Staggered drill transitions (`delay: index * 50ms`)
- Smooth removal with slide-out + fade

**Application Rules:**
- These are fallback defaults when user doesn't specify transitions
- Always overrideable: if user requests "only fade transitions", use only fade
- Transitions enhance, not distract (keep under 500ms for most interactions)
- Reduced motion: respect `prefers-reduced-motion` media query
- Mobile: consider performance, use hardware-accelerated properties (`transform`, `opacity` only)

---

## SECTION 2E — UX PATTERN DEFAULTS

When no specific UX patterns are requested, implement these defaults for modern user experiences:

### Skeleton Screens (Loading States)

**When to use:** API calls, data fetches, page navigations taking >300ms

**Implementation:**
```tsx
// ✅ CORRECT — Skeleton with pulsing animation
const SkeletonCard = () => (
  <div style={{
    borderRadius: 12,
    background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s infinite',
    height: 120,
    marginBottom: 12,
  }} />
)

// In @arkzen:style
@keyframes shimmer {
  0% { backgroundPosition: 200% 0; }
  100% { backgroundPosition: -200% 0; }
}
```

**Rules:**
- Always show skeleton matching final content layout (same height/width)
- Use neutral grays, avoid colored placeholders
- Pulse or shimmer effect optional but recommended
- Hide skeleton on data arrival

### Optimistic UI (Instant Feedback)

**When to use:** Form submissions, action buttons, real-time interactions

**Implementation:**
```tsx
// ✅ CORRECT — Update UI before API response
const addItem = async (itemData) => {
  // 1. Update UI immediately
  setItems([...items, { id: 'temp', ...itemData, status: 'pending' }])
  
  // 2. Make API call
  try {
    const res = await arkzenFetch('/api/items', { method: 'POST', body: itemData })
    // 3. Update with server response (confirm/fix if needed)
    setItems(prev => prev.map(item => 
      item.id === 'temp' ? { ...item, id: res.id, status: 'confirmed' } : item
    ))
  } catch (error) {
    // 4. Revert on error
    setItems(prev => prev.filter(item => item.id !== 'temp'))
    showError('Failed to add item')
  }
}
```

**Rules:**
- Show visual feedback immediately (no waiting for API)
- Disable button during request
- Add `pending` or `loading` state indicator
- Revert changes gracefully on error
- No network latency visible to user

### Optimistic Pre-loading (Predictive Data Loading)

**When to use:** Multi-step flows, wizards, login sequences, search results, pagination

**What it is:** Load data/assets in the background BEFORE user requests them, based on predicted next action. NOT a side effect—pure background fetch that caches data silently.

**Google login step wizard example:**
```tsx
// Step 1: User enters email
const [email, setEmail] = useState('')
const [passwordStep, setPasswordStep] = useState(null)

const handleEmailSubmit = async (email) => {
  // 1. Validate email on backend
  const emailValid = await arkzenFetch('/api/auth/validate-email', { method: 'POST', body: { email } })
  
  if (emailValid) {
    // 2. PRELOAD password form data silently (config, hints, etc)
    arkzenFetch(`/api/auth/password-config?email=${email}`)
      .then(data => {
        // Store in cache, user doesn't wait
        sessionStorage.setItem('passwordConfig', JSON.stringify(data))
      })
      .catch(() => {}) // Fail silently, next step will still work
    
    // 3. Show password step (data already loading in background)
    setPasswordStep({ email })
  }
}

// Step 2: Password form renders while preload happened in background
// User has minimal wait, config is ready
const handlePasswordSubmit = async (password) => {
  // Config already cached from step 1 preload
  const config = JSON.parse(sessionStorage.getItem('passwordConfig'))
  
  const res = await arkzenFetch('/api/auth/login', {
    method: 'POST',
    body: { email, password, config }
  })
  
  if (res.success) {
    // PRELOAD dashboard data while user sees success screen
    arkzenFetch('/api/dashboard')
      .then(data => sessionStorage.setItem('dashboardCache', JSON.stringify(data)))
      .catch(() => {})
    
    setPasswordStep({ ...passwordStep, success: true })
  }
}
```

**Instagram-style feed preload example:**
```tsx
// User scrolls through feed
const [posts, setPosts] = useState([])
const [page, setPage] = useState(1)

useEffect(() => {
  // Load current page
  arkzenFetch(`/api/feed?page=${page}`)
    .then(data => setPosts(data))
}, [page])

useEffect(() => {
  // PRELOAD next page silently while user browses current page
  const nextPage = page + 1
  arkzenFetch(`/api/feed?page=${nextPage}`)
    .then(data => {
      // Store in cache, no UI update
      sessionStorage.setItem(`feed-page-${nextPage}`, JSON.stringify(data))
    })
    .catch(() => {})
}, [page])

// When user reaches bottom (or swipes next), data is already cached
const handleNextPage = () => {
  const cached = sessionStorage.getItem(`feed-page-${page + 1}`)
  if (cached) {
    // Instant page switch, data already loaded
    setPosts(JSON.parse(cached))
    setPage(page + 1)
  }
}
```

**Hover/intent-based preload:**
```tsx
// Preload user profile on hover before click
const handleProfileHover = (userId) => {
  arkzenFetch(`/api/users/${userId}`)
    .then(data => sessionStorage.setItem(`user-${userId}`, JSON.stringify(data)))
    .catch(() => {})
}

// Search results preload
const handleSearchInput = async (query) => {
  setSearchQuery(query)
  
  // PRELOAD results while user is still typing
  if (query.length > 2) {
    arkzenFetch(`/api/search?q=${query}`)
      .then(data => sessionStorage.setItem(`search-${query}`, JSON.stringify(data)))
      .catch(() => {})
  }
}
```

**Rules:**
- NO side effects (don't mutate state, don't trigger actions)
- Always fail gracefully (catch errors silently, don't show to user)
- Cache in `sessionStorage` or Zustand store, not component state
- Only preload data user will likely access next (predictive, not wasteful)
- Respect user's connection (don't preload on very slow networks)
- No loading spinners or visual feedback—data loads silently in background
- Perfect for: multi-step forms, pagination, profile previews, search, navigation
- NOT for: critical data that must load before showing (use regular Optimistic UI for that)

### Progress Illusions (Perceived Performance)

**When to use:** Long-running operations, file uploads, complex data processing

**Implementation:**
```tsx
// ✅ CORRECT — Show realistic progress even when actual progress unknown
const UploadProgress = ({ file }) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    // Fake progress: 0% → 90% quickly, then slow crawl to 99%
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev < 30) return prev + Math.random() * 20  // Fast ramp
        if (prev < 90) return prev + Math.random() * 8   // Moderate
        return Math.min(prev + 1, 99)                      // Slow crawl
      })
    }, 200)

    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ width: '100%', height: 4, background: '#e0e0e0', borderRadius: 2 }}>
      <div style={{
        width: `${progress}%`,
        height: '100%',
        background: 'linear-gradient(90deg, #3a6fd8, #4a72c8)',
        transition: 'width 0.3s ease-out',
        borderRadius: 2,
      }} />
      <p style={{ marginTop: 8, fontSize: 12, color: '#666' }}>{Math.floor(progress)}%</p>
    </div>
  )
}
```

**Rules:**
- Never show 100% until actually complete
- Use realistic progression (not linear)
- Show intermediate milestones (buffering, processing, finalizing)
- Pair with actual progress tracking when available
- Smoothly animate between progress values

### Combined UX Pattern Example

```tsx
// Step 1: Skeleton while loading
if (loading) return <SkeletonCard />

// Step 2: Optimistic update on user action
const handleSubmit = async (data) => {
  setItems([...items, data])  // Optimistic
  setLoading(true)
  try {
    const res = await arkzenFetch('/api/items', { method: 'POST', body: data })
    setItems(prev => prev.map(item => item.id === 'temp' ? res : item))
  } catch {
    setItems(items)  // Revert
    showError('Failed')
  } finally {
    setLoading(false)
  }
}

// Step 3: Progress animation on time-consuming tasks
if (uploading) return <UploadProgress />

// Step 4: Final rendered content with transitions
return <div style={{ animation: 'fadeIn 0.3s' }}>...</div>
```

**Application Rules:**
- These are fallback defaults when user doesn't specify UX patterns
- Always overrideable: if user requests "no skeleton screens", skip them
- Combine patterns: skeleton → optimistic UI → progress illusion as appropriate
- Test on real networks (3G, 4G) to validate perceived performance
- Mobile-first: skeleton screens especially important on slow connections

### Storytelling & Scroll Triggers

**When to use:** Hero sections, data reveals, timeline views, feature showcases

**Scroll Trigger patterns (GSAP):**
```tsx
// ✅ CORRECT — Reveal on scroll
useEffect(() => {
  const ctx = gsap.context(() => {
    gsap.registerPlugin(ScrollTrigger)
    
    gsap.to('.hero-text', {
      scrollTrigger: {
        trigger: '.hero-section',
        start: 'top center',
        end: 'center center',
        scrub: 1, // smooth scroll-linked animation
        markers: false,
      },
      opacity: 1,
      y: 0,
      duration: 1,
    })
  }, pageRef)
  return () => ctx.revert()
}, [])
```

**Storytelling variants:**
- **Progressive reveal**: Text/elements fade in one by one as user scrolls
- **Parallax depth**: Background moves slower than foreground
- **Meter/gauge animations**: Values animate to target as they enter viewport
- **Timeline unroll**: Vertical line connects events, each fades on scroll

---

### Hover Effects & Micro-Interactions

**When to use:** Buttons, cards, links, interactive elements

**Framer Motion hover patterns:**
```tsx
// ✅ CORRECT — Magnetic hover button
<motion.button
  whileHover={{ scale: 1.05, boxShadow: '0 8px 24px rgba(58, 111, 216, 0.3)' }}
  whileTap={{ scale: 0.98 }}
  transition={{ type: 'spring', stiffness: 300 }}
  style={{ cursor: 'pointer' }}
>
  Click Me
</motion.button>

// Card lift on hover
<motion.div
  whileHover={{ y: -8, boxShadow: '0 12px 32px rgba(0,0,0,0.15)' }}
  transition={{ duration: 0.2 }}
>
  Card Content
</motion.div>

// Icon rotate on hover
<motion.div
  whileHover={{ rotate: 360 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
>
  <Icon size={24} />
</motion.div>
```

**Micro-interaction variants:**
- **Button press**: Scale down on click, ripple effect
- **Icon pulse**: Icon size oscillates on hover
- **Link underline**: Animated underline slides in on hover
- **Color shift**: Background color transitions on hover
- **Bounce feedback**: Element bounces on interaction completion

---

### 3D Effects & Depth

**When to use:** Premium cards, showcase sections, product displays

**GSAP 3D transforms:**
```tsx
// ✅ CORRECT — 3D card flip
<div
  onMouseEnter={() => {
    gsap.to(cardRef.current, {
      rotationY: 180,
      duration: 0.6,
      ease: 'power2.inOut',
    })
  }}
  onMouseLeave={() => {
    gsap.to(cardRef.current, {
      rotationY: 0,
      duration: 0.6,
      ease: 'power2.inOut',
    })
  }}
  ref={cardRef}
  style={{
    perspective: '1000px',
    transformStyle: 'preserve-3d',
    width: 200,
    height: 200,
  }}
>
  Card
</div>

// 3D perspective on scroll
gsap.to('.product-card', {
  scrollTrigger: { trigger: '.products' },
  rotationX: 5,
  rotationY: 5,
  z: 50,
  duration: 0.8,
})
```

**3D effect variants:**
- **Card flip**: Rotate Y axis to reveal back
- **Depth perspective**: Z-axis movement + shadow
- **Tilt effect**: Rotate on mouse position
- **Cube rotation**: Multi-face 3D navigation
- **Stacked layers**: Multiple depth planes

---

### Entrance Animations

**When to use:** Page loads, modal opens, list items appear

**Framer Motion entrance patterns:**
```tsx
// ✅ CORRECT — Staggered list entrance
const container = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
}

<motion.div variants={container} initial="hidden" animate="visible">
  {items.map((item) => (
    <motion.div key={item.id} variants={item}>
      {item.name}
    </motion.div>
  ))}
</motion.div>

// Page entrance
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.4, ease: 'easeOut' }}
>
  Page Content
</motion.div>
```

**Entrance variants:**
- **Fade + slide**: Fade in + slide from side/bottom
- **Stagger**: Children animate one by one
- **Scale bloom**: Scale from 0 to 1 with fade
- **Blur reveal**: Blur effect clears on enter
- **Rotate unfold**: Rotate + scale simultaneously

---

### Loading Animations

**When to use:** Data fetching, file uploads, processing states

**GSAP + Framer Motion spinner patterns:**
```tsx
// ✅ CORRECT — Animated spinner
<motion.div
  animate={{ rotate: 360 }}
  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
  style={{ width: 40, height: 40 }}
>
  <Loader2 size={40} style={{ color: '#3a6fd8' }} />
</motion.div>

// Pulse skeleton
<motion.div
  animate={{ opacity: [0.5, 1, 0.5] }}
  transition={{ duration: 1.5, repeat: Infinity }}
  style={{
    height: 80,
    borderRadius: 8,
    background: '#f0f0f0',
  }}
/>

// Morphing loader (GSAP)
gsap.to('.loader-shape', {
  morphSVG: '#shape-target',
  duration: 0.6,
  repeat: -1,
  yoyo: true,
})
```

**Loading variants:**
- **Spinning icon**: Rotate 360° infinite
- **Pulsing dot**: 3 dots animate stagger + fade
- **Progress bar**: Animated width + shimmer
- **Skeleton morph**: Placeholder morphs subtly
- **Wave effect**: Bars rise/fall in sequence

---

### Mouse Animations & Parallax

**When to use:** Hero sections, interactive backgrounds, cursor feedback

**Mouse-tracking patterns:**
```tsx
// ✅ CORRECT — Parallax on mouse move
const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

useEffect(() => {
  const handleMouseMove = (e) => {
    setMousePos({ x: e.clientX, y: e.clientY })
  }
  window.addEventListener('mousemove', handleMouseMove)
  return () => window.removeEventListener('mousemove', handleMouseMove)
}, [])

<motion.div
  style={{
    x: mousePos.x * 0.05,
    y: mousePos.y * 0.05,
  }}
>
  Parallax Background
</motion.div>

// Magnetic button (follow cursor)
<motion.button
  animate={{
    x: (mousePos.x - buttonPos.x) * 0.1,
    y: (mousePos.y - buttonPos.y) * 0.1,
  }}
  transition={{ type: 'spring', stiffness: 150 }}
>
  Magnetic Button
</motion.button>
```

**Mouse interaction variants:**
- **Parallax**: Background layers move at different speeds
- **Magnetic snap**: Element follows cursor, snaps back
- **Cursor glow**: Custom cursor with trailing glow
- **Hover shift**: Element moves toward cursor on hover
- **Drag inertia**: Smooth momentum on drag release

---

### Background Animations

**When to use:** Page backgrounds, decorative elements, ambient effects

**Background animation patterns:**
```tsx
// ✅ CORRECT — Animated gradient background
<div
  style={{
    background: 'linear-gradient(-45deg, #ee7752, #e73c7e, #23a6d5, #23d5ab)',
    backgroundSize: '400% 400%',
    animation: 'gradientShift 15s ease infinite',
    minHeight: '100vh',
  }}
>
  Content
</div>

// In @arkzen:style
@keyframes gradientShift {
  0% { backgroundPosition: 0% 50%; }
  50% { backgroundPosition: 100% 50%; }
  100% { backgroundPosition: 0% 50%; }
}

// Floating shapes (GSAP)
gsap.to('.float-shape', {
  y: -30,
  rotation: 360,
  duration: 4,
  repeat: -1,
  yoyo: true,
  ease: 'sine.inOut',
})

// Blob morphing
<motion.div
  animate={{
    borderRadius: ['30% 70% 70% 30%', '70% 30% 30% 70%', '30% 70% 70% 30%'],
  }}
  transition={{ duration: 8, repeat: Infinity }}
  style={{
    width: 200,
    height: 200,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  }}
/>
```

**Background variants:**
- **Gradient shift**: Animated gradient colors
- **Particle system**: Small animated particles
- **Floating shapes**: Orbs/shapes move smoothly
- **Blob morph**: Organic shape morphs continuously
- **Grid animation**: Grid tiles light up in pattern

---

### Combined Animation Sequence

**When to use:** Hero sections, landing pages, premium showcases

```tsx
// ✅ CORRECT — Full animation sequence
export const HeroAnimation = () => {
  const pageRef = useRef(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline()

      // 1. Background fade in
      tl.from('.hero-bg', { opacity: 0, duration: 0.6 })

      // 2. Title entrance (stagger)
      tl.from('.hero-title', {
        opacity: 0,
        y: 30,
        duration: 0.8,
        staggerBy: 0.1,
      }, 0.2)

      // 3. Button appears + scale
      tl.from('.hero-btn', {
        opacity: 0,
        scale: 0.8,
        duration: 0.5,
      }, 0.5)

      // 4. Scroll trigger for content below
      gsap.registerPlugin(ScrollTrigger)
      gsap.to('.content-section', {
        scrollTrigger: { trigger: '.content-section' },
        opacity: 1,
        y: 0,
        duration: 0.8,
      })
    }, pageRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={pageRef}>
      {/* Hero section animations */}
    </div>
  )
}
```

**Sequence formula:**
1. Background/ambient enter
2. Hero content (title, subtitle) stagger in
3. CTAs appear + scale
4. Scroll triggers for sections below
5. Hover states + micro-interactions on all interactive elements

---

**Application Rules:**
- These are fallback defaults when user doesn't specify animation patterns
- Always overrideable: if user requests "minimal animations", use restraint
- Performance-first: use `transform` & `opacity` only (GPU-accelerated)
- Mobile: reduce animation complexity, no parallax on low-end devices
- Accessibility: respect `prefers-reduced-motion` for all animations
- Combine patterns: entrance → scroll trigger → hover → exit as flow requires
- Test on real networks (3G, 4G) and devices to validate performance
- Frontend-heavy: these animations are expected defaults for modern tatemonos

---

## SECTION 2F — BUTTON & COMPONENT VARIANT DEFAULTS

### Button Variants

**Default to two button variants:**
- **Primary**: Main action, emphasis, CTAs (filled, bold, high contrast)
- **Ghost**: Secondary action, alternative path, cancel/dismiss (outlined, low emphasis)

**NEVER have two primary buttons** in the same component/section. Always one primary (main action) + ghost (secondary action).

**Example (CORRECT):**
```tsx
<div style={{ display: 'flex', gap: 12 }}>
  {/* Primary = main action */}
  <button style={{
    background: '#3a6fd8',
    color: 'white',
    padding: '10px 24px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
  }}>
    Save Changes
  </button>

  {/* Ghost = secondary action */}
  <button style={{
    background: 'transparent',
    color: '#3a6fd8',
    padding: '10px 24px',
    borderRadius: 8,
    border: '2px solid #3a6fd8',
    cursor: 'pointer',
  }}>
    Cancel
  </button>
</div>
```

**Example (WRONG):**
```tsx
// ❌ Two primary buttons = confusing UX
<button style={{ background: '#3a6fd8', color: 'white' }}>Delete</button>
<button style={{ background: '#e74c3c', color: 'white' }}>Cancel</button>
```

**Rules:**
- Primary button = what user SHOULD do (save, submit, confirm, next)
- Ghost button = what user CAN do (cancel, skip, go back)
- Always pair them together when offering choice
- Use ghost for destructive alternates (delete, logout) to reduce accident clicks
- Can add additional variants (danger, success, disabled) but primary + ghost are defaults
- Completely overrideable: if user requests "use 3 button styles" or "multiple primary", follow their request

---

## SECTION 2G — VISUAL HIERARCHY DEFAULTS

**Visual hierarchy** controls what users see FIRST and what's important. Proper hierarchy guides user attention naturally through interfaces.

### Hierarchy Levels (Default Priority Order)

**Level 1 (Critical):** Page title, main heading, primary CTA
- Font size: 32-48px (desktop), 24-32px (mobile)
- Font weight: 700-900 (bold/black)
- Color: High contrast (dark on light, light on dark)
- Whitespace: Generous margin below (32-48px)
- Example: "Sign Up", "Dashboard", "Create New Project"

**Level 2 (Important):** Subheadings, secondary CTAs, section headers
- Font size: 20-28px (desktop), 18-24px (mobile)
- Font weight: 600-700 (semibold/bold)
- Color: Medium contrast (slightly muted primary)
- Whitespace: 24px margin below
- Example: "Account Settings", "Recently Viewed", "Save & Continue"

**Level 3 (Standard):** Body text, descriptions, form labels
- Font size: 16px (desktop), 14-16px (mobile)
- Font weight: 400-500 (normal/medium)
- Color: Standard text (good contrast, readable)
- Whitespace: 16px margin below
- Example: "Enter your email address", card descriptions

**Level 4 (Secondary):** Helper text, hints, metadata, timestamps
- Font size: 12-14px (desktop), 12px (mobile)
- Font weight: 400 (normal)
- Color: Low contrast (gray, muted)
- Whitespace: 8px margin below
- Example: "Required field", "Last updated 2 hours ago", form hints

**Example (CORRECT visual hierarchy):**
```tsx
<div style={{ maxWidth: 600 }}>
  {/* Level 1: Page title */}
  <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 32, color: '#000' }}>
    Create Account
  </h1>

  {/* Level 2: Section header */}
  <h2 style={{ fontSize: 24, fontWeight: 600, marginBottom: 24, color: '#333' }}>
    Personal Information
  </h2>

  {/* Level 3: Form label */}
  <label style={{ fontSize: 16, fontWeight: 500, marginBottom: 8, display: 'block', color: '#000' }}>
    Email Address
  </label>

  {/* Form input */}
  <input style={{ fontSize: 16, padding: '12px 16px', marginBottom: 4, border: '1px solid #ddd' }} />

  {/* Level 4: Helper text */}
  <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>
    We'll use this to send you account updates.
  </p>

  {/* Level 2: CTA (secondary) */}
  <button style={{ 
    fontSize: 16, 
    fontWeight: 600, 
    padding: '12px 32px',
    background: '#3a6fd8',
    color: 'white',
    border: 'none',
    borderRadius: 8,
  }}>
    Create Account
  </button>

  {/* Level 4: Alternative action */}
  <p style={{ fontSize: 14, color: '#666', marginTop: 16 }}>
    Already have an account? <a href="/login" style={{ color: '#3a6fd8', textDecoration: 'underline' }}>Sign in</a>
  </p>
</div>
```

### Visual Hierarchy Principles

**1. Size Hierarchy**
- Primary action button: 44-48px height, 24-32px font
- Secondary button: 40-44px height, 16px font
- Text: h1 > h2 > h3 > body > helper text
- Ratio: Each level ~20-30% smaller than previous

**2. Color Hierarchy**
- Level 1: Bold, saturated color (draw attention)
- Level 2: Same color, slightly desaturated
- Level 3: Standard text color
- Level 4: Gray, muted, low contrast

**3. Weight Hierarchy**
- Level 1: 700-900 (bold/black)
- Level 2: 600-700 (semibold/bold)
- Level 3: 400-500 (normal/medium)
- Level 4: 400 (normal)

**4. Spacing Hierarchy**
- Around Level 1: 32-48px
- Around Level 2: 24px
- Around Level 3: 16px
- Around Level 4: 8px

**Common Mistakes (❌ WRONG):**
```tsx
// ❌ No hierarchy — all text same size/weight
<div>
  <p style={{ fontSize: 16, fontWeight: 400 }}>Create Account</p>
  <p style={{ fontSize: 16, fontWeight: 400 }}>Email Address</p>
  <p style={{ fontSize: 16, fontWeight: 400 }}>Helper text here</p>
</div>

// ❌ Multiple emphasis — confusing where to look
<div>
  <button style={{ background: '#3a6fd8' }}>Save</button>
  <button style={{ background: '#e74c3c' }}>Delete</button>
  <button style={{ background: '#27ae60' }}>Export</button>
</div>

// ❌ Low contrast text — hard to read
<div style={{ color: '#999', fontSize: 14 }}>
  "Helper text in gray" but text is too light and small
</div>

// ❌ Text buried in whitespace — hard to find
<div style={{ padding: 100, fontSize: 12 }}>
  Tiny text lost in huge spacing
</div>
```

### Accessibility + Hierarchy

**WCAG Contrast Ratios (minimum):**
- Level 1 (headings): 4.5:1 contrast ratio (AA standard)
- Level 3 (body text): 4.5:1 contrast ratio
- Level 4 (helper text): 3:1 contrast ratio (minimum)

**Size Minimums:**
- Body text: Never below 14px on mobile, 16px on desktop
- Helper text: Never below 12px (harder to read, not accessible)
- Form labels: 14px minimum

**Test hierarchy:**
1. Squint at your design — what stands out first? Should be most important
2. Hide colors (grayscale) — hierarchy should work in B&W via size/weight
3. Test on screen readers — semantic HTML + hierarchy = better accessibility

### Rules

- These are fallback defaults when user doesn't specify hierarchy
- Always overrideable: if user requests "bold helper text" or "large secondary buttons", follow their request
- Combine with button variants (primary + ghost) for clear hierarchy
- Pair with spacing and color from design fallback system
- Test on real users to validate hierarchy (what do they look at first?)
- Mobile-first: ensure hierarchy readable on small screens

---

## SECTION 2H — VISUAL BALANCE DEFAULTS

**Visual balance** is how weight (visual mass) is distributed across an interface. Balanced layouts feel calm, organized, intentional. Unbalanced layouts feel chaotic, broken, or accidental.

### Balance Types

**Symmetrical Balance** — Equal weight on both sides (formal, stable, professional)
```tsx
// ✅ CORRECT — Centered, symmetric
<div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 32 }}>
  <button style={{ padding: '12px 32px' }}>Cancel</button>
  <button style={{ padding: '12px 32px', background: '#3a6fd8', color: 'white' }}>
    Confirm
  </button>
</div>
```

**Asymmetrical Balance** — Different elements balanced through color, size, negative space (modern, dynamic)
```tsx
// ✅ CORRECT — Heavy left, light right, balanced by spacing
<div style={{ display: 'flex', gap: 48, alignItems: 'center' }}>
  <div style={{ flex: 1 }}>
    <h1 style={{ fontSize: 40, fontWeight: 700, marginBottom: 16 }}>
      Welcome Back
    </h1>
    <p style={{ fontSize: 16, color: '#666', marginBottom: 24 }}>
      Continue where you left off
    </p>
    <button>Get Started</button>
  </div>
  
  {/* Right side lighter, but balanced by whitespace */}
  <div style={{ flex: 0.8, backgroundColor: '#f5f5f5', borderRadius: 12, height: 300 }} />
</div>
```

### Spacing Rules (Default Grid: 8px)

**Consistent spacing scale:**
- **Micro (4px):** Between text lines, icon-text gaps
- **Small (8px):** Between form elements, inline spacing
- **Base (16px):** Between sections, default padding
- **Medium (24px):** Between major sections, card margins
- **Large (32px):** Between page sections, hero spacing
- **XL (48px):** Between layout blocks, hero to content

**Example (CORRECT spacing):**
```tsx
<div style={{ padding: 32 }}> {/* Page padding: Large */}
  <h1 style={{ marginBottom: 16 }}>Dashboard</h1> {/* Base */}
  
  <div style={{ marginBottom: 32 }}> {/* Medium gap to next section */}
    <p style={{ marginBottom: 8 }}>Email</p> {/* Small gap to input */}
    <input style={{ marginBottom: 4, padding: '10px 12px' }} /> {/* Micro */}
    <p style={{ fontSize: 13, color: '#666', marginBottom: 24 }}>Helper text</p> {/* Medium to next field */}
  </div>

  <div style={{ marginBottom: 32 }}>
    <p style={{ marginBottom: 8 }}>Password</p>
    <input style={{ marginBottom: 4, padding: '10px 12px' }} />
    <p style={{ fontSize: 13, color: '#666' }}>Minimum 8 characters</p>
  </div>

  <div style={{ display: 'flex', gap: 16, marginTop: 32 }}> {/* Large gap before buttons */}
    <button style={{ flex: 1, padding: '12px 24px' }}>Cancel</button>
    <button style={{ flex: 1, padding: '12px 24px', background: '#3a6fd8', color: 'white' }}>
      Save
    </button>
  </div>
</div>
```

### Button Spacing

**Button pairs (primary + ghost):**
```tsx
// ✅ CORRECT — Equal padding, consistent gap
<div style={{ display: 'flex', gap: 16 }}>
  <button style={{ 
    flex: 1,
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 600,
    border: '2px solid #3a6fd8',
    background: 'transparent',
    color: '#3a6fd8',
    cursor: 'pointer',
    borderRadius: 8,
  }}>
    Cancel
  </button>
  <button style={{ 
    flex: 1,
    padding: '12px 24px',
    fontSize: 16,
    fontWeight: 600,
    background: '#3a6fd8',
    color: 'white',
    border: 'none',
    cursor: 'pointer',
    borderRadius: 8,
  }}>
    Confirm
  </button>
</div>

// ❌ WRONG — Different padding, buttons unbalanced
<div style={{ display: 'flex', gap: 16 }}>
  <button style={{ padding: '8px 16px' }}>Cancel</button>
  <button style={{ padding: '16px 32px', background: '#3a6fd8', color: 'white' }}>Confirm</button>
</div>
```

**Button groups (multiple actions):**
```tsx
// ✅ CORRECT — Only 1 primary, others ghost, consistent sizing
<div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
  <button style={{ padding: '12px 24px', background: '#3a6fd8', color: 'white', borderRadius: 8, border: 'none' }}>
    Primary Action
  </button>
  <button style={{ padding: '12px 24px', border: '2px solid #ddd', background: 'transparent', borderRadius: 8 }}>
    Secondary
  </button>
  <button style={{ padding: '12px 24px', border: '2px solid #ddd', background: 'transparent', borderRadius: 8 }}>
    Tertiary
  </button>
</div>

// ❌ WRONG — Multiple primary buttons, mismatched sizes
<div>
  <button style={{ padding: '16px 32px', background: '#3a6fd8', color: 'white' }}>Save</button>
  <button style={{ padding: '10px 20px', background: '#e74c3c', color: 'white' }}>Delete</button>
  <button style={{ padding: '14px 28px', background: '#27ae60', color: 'white' }}>Export</button>
</div>
```

### Form Field Balance

**Field groups (stacked):**
```tsx
// ✅ CORRECT — Consistent vertical spacing
<form style={{ maxWidth: 400 }}>
  <div style={{ marginBottom: 24 }}>
    <label style={{ display: 'block', marginBottom: 8, fontSize: 16, fontWeight: 500 }}>
      First Name
    </label>
    <input style={{ width: '100%', padding: '12px 16px', fontSize: 16 }} />
  </div>

  <div style={{ marginBottom: 24 }}>
    <label style={{ display: 'block', marginBottom: 8, fontSize: 16, fontWeight: 500 }}>
      Last Name
    </label>
    <input style={{ width: '100%', padding: '12px 16px', fontSize: 16 }} />
  </div>

  <div style={{ marginBottom: 32 }}> {/* Larger gap before submit */}
    <label style={{ display: 'block', marginBottom: 8, fontSize: 16, fontWeight: 500 }}>
      Email
    </label>
    <input style={{ width: '100%', padding: '12px 16px', fontSize: 16 }} />
  </div>

  <button style={{ width: '100%', padding: '14px 24px', fontSize: 16, fontWeight: 600, background: '#3a6fd8', color: 'white', border: 'none', borderRadius: 8 }}>
    Sign Up
  </button>
</form>

// ❌ WRONG — Inconsistent spacing, cramped
<form>
  <input placeholder="First" style={{ marginBottom: 4 }} />
  <input placeholder="Last" style={{ marginBottom: 8 }} />
  <input placeholder="Email" style={{ marginBottom: 20 }} />
  <button>Submit</button>
</form>
```

### Card Grid Balance

**Symmetric card layout:**
```tsx
// ✅ CORRECT — Equal padding, balanced grid
<div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, padding: 32 }}>
  {[1, 2, 3, 4].map(i => (
    <div key={i} style={{
      padding: 24,
      border: '1px solid #e0e0e0',
      borderRadius: 12,
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    }}>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 12 }}>Card {i}</h3>
      <p style={{ fontSize: 14, color: '#666', marginBottom: 16 }}>Description here</p>
      <button style={{ padding: '8px 16px', background: '#3a6fd8', color: 'white', border: 'none', borderRadius: 6 }}>
        Action
      </button>
    </div>
  ))}
</div>

// ❌ WRONG — Inconsistent padding, misaligned
<div>
  <div style={{ padding: '16px 8px' }}>Card</div>
  <div style={{ padding: '32px 24px' }}>Card</div>
  <div style={{ padding: '12px 12px' }}>Card</div>
</div>
```

### Navigation/Header Balance

**Symmetric header:**
```tsx
// ✅ CORRECT — Logo left, nav center, actions right (balanced)
<header style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '16px 32px',
  borderBottom: '1px solid #e0e0e0',
}}>
  <div style={{ fontSize: 24, fontWeight: 700 }}>Logo</div>
  
  <nav style={{ display: 'flex', gap: 32 }}>
    <a>Home</a>
    <a>Products</a>
    <a>Pricing</a>
  </nav>
  
  <div style={{ display: 'flex', gap: 12 }}>
    <button style={{ padding: '8px 16px', border: '1px solid #3a6fd8', background: 'transparent', color: '#3a6fd8' }}>
      Login
    </button>
    <button style={{ padding: '8px 16px', background: '#3a6fd8', color: 'white', border: 'none' }}>
      Sign Up
    </button>
  </div>
</header>

// ❌ WRONG — Cramped left, empty right, unbalanced
<header style={{ padding: '8px 16px' }}>
  <div style={{ display: 'flex', gap: 4 }}>
    <span>Logo</span>
    <a>Home</a>
    <a>Products</a>
  </div>
  <div style={{ position: 'absolute', right: 4 }}>
    <button>Login</button>
  </div>
</header>
```

### Rules

- Use 8px grid system for all spacing (multiples of 8)
- Keep button/field padding consistent (12px vertical min, 16px horizontal min)
- Match spacing between similar elements (all form fields same gap, all buttons same padding)
- Use negative space intentionally — breathing room = calm, balanced feel
- Test balance: squint at design — does visual weight feel even?
- Mobile balance: spacing scales down, but ratios stay same (16px → 12px, 32px → 24px)
- Always overrideable: if user requests "dense spacing" or "large gaps", follow their request

---

## SECTION 3 — TATEMONO FILE RULES

```
1. Single .tsx file per tatemono
2. File location: tatemonos/<name>/core.tsx
3. TypeScript throughout
4. All imports inside @arkzen:components or @arkzen:layout blocks ONLY
5. NO imports inside @arkzen:page blocks
6. Sections appear in this EXACT order:

   @arkzen:meta                     (once)
   @arkzen:config                   (optional, once)
   @arkzen:database[:identifier]    (REPEAT)
   @arkzen:api[:identifier]         (REPEAT)
   @arkzen:routes                   (optional)
   @arkzen:endpoint:name            (optional, REPEAT) ← ONLY for @arkzen:api resource methods
   @arkzen:handler:name             (optional, REPEAT) ← ONLY for @arkzen:routes custom routes
   @arkzen:middleware:name          (optional, REPEAT)
   @arkzen:realtime:identifier      (optional, REPEAT)
   @arkzen:events:identifier        (optional, REPEAT)
   @arkzen:listeners:name           (optional, REPEAT)
   @arkzen:jobs:identifier          (optional, REPEAT)
   @arkzen:notifications:identifier (optional, REPEAT)
   @arkzen:mail:identifier          (optional, REPEAT)
   @arkzen:console:identifier       (optional, REPEAT)
   @arkzen:layout:name              (optional, REPEAT)
   @arkzen:components:identifier    (REPEAT)
   @arkzen:style                    (optional, once)
   @arkzen:style:name               (optional, REPEAT)
   @arkzen:page:name                (REPEAT)
   @arkzen:error:404                (optional)
   @arkzen:error:500                (optional)
   @arkzen:animation                (optional, once)
```

---

## ⚠️ SECTION 3D — DSL TAG FORMAT RULES (CRITICAL)

### TWO types of blocks:

**TYPE A — YAML content blocks** (no `*/` on opening line)
```
/* @arkzen:meta
/* @arkzen:config
/* @arkzen:database[:identifier]
/* @arkzen:api[:identifier]
/* @arkzen:routes
/* @arkzen:realtime:identifier
/* @arkzen:events:identifier
/* @arkzen:jobs:identifier
/* @arkzen:notifications:identifier
/* @arkzen:mail:identifier
/* @arkzen:console:identifier
/* @arkzen:middleware:name
```

**TYPE B — Code blocks** (MUST have `*/` on the SAME opening line)
```
/* @arkzen:components:shared */
/* @arkzen:layout:app */
/* @arkzen:animation */
/* @arkzen:page:index */
/* @arkzen:page:dashboard */
/* @arkzen:style */
/* @arkzen:style:ComponentName */
/* @arkzen:error:404 */
/* @arkzen:error:500 */
```

**Endpoint/handler blocks** — open WITHOUT `*/`, then `*/` on NEXT line as body separator:
```tsx
/* @arkzen:endpoint:my_endpoint
*/
$php = $code->here();
return response()->json($result);
/* @arkzen:endpoint:my_endpoint:end */

/* @arkzen:handler:my_handler
*/
$php = $code->here();
return response()->json($result);
/* @arkzen:handler:my_handler:end */
```

**Page layout declaration** — always inline `*/`:
```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */
```

**ALL closing tags:**
```
/* @arkzen:components:shared:end */
/* @arkzen:layout:app:end */
/* @arkzen:page:dashboard:end */
/* @arkzen:animation:end */
/* @arkzen:endpoint:name:end */
/* @arkzen:handler:name:end */
/* @arkzen:error:404:end */
```

---

## SECTION 3A — IMPORT PLACEMENT RULES (CRITICAL)

| Block | Can have imports? |
|-------|------------------|
| `@arkzen:components:*` | ✅ YES |
| `@arkzen:layout:*` | ✅ YES |
| `@arkzen:animation` | ✅ YES (gsap/framer only) |
| `@arkzen:page:*` | ❌ NO |
| `@arkzen:endpoint:*` | ❌ NO — PHP only |
| `@arkzen:handler:*` | ❌ NO — PHP only |
| `@arkzen:error:404` | ❌ NO — engine injects React |
| `@arkzen:error:500` | ✅ YES — needs 'use client' |

---

## SECTION 3B — `'use client'` RULES

- Write `'use client'` at top of `@arkzen:components` blocks
- Write `'use client'` at top of `@arkzen:layout` blocks
- Write `'use client'` at top of `@arkzen:error:500` blocks
- NEVER write `'use client'` inside `@arkzen:page` blocks
- NEVER write `'use client'` inside `@arkzen:animation` blocks
- NEVER write `'use client'` inside `@arkzen:error:404` blocks

---

## SECTION 3C — ZUSTAND STORE RULES

Define stores directly inside `@arkzen:components` blocks. Always export them.

```tsx
export const useAppStore = create<AppState>((set) => ({
  items: [],
  setItems: (items) => set({ items }),
}))
```

---

## ⚠️ SECTION 3E — NULL SAFETY RULES FOR ASYNC DATA (CRITICAL)

All components that receive data from API calls must guard against undefined/null.

```tsx
// ✅ CORRECT — guard at component level
export const BigTicketDisplay = ({ data }: { data: MyTicketResponse }) => {
  if (!data || !data.ticket) {
    return <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60 }}>
      <Loader2 size={24} style={{ color: '#4a72c8' }} />
    </div>
  }
  const { ticket, position } = data
  // ... rest of component
}

// ✅ CORRECT — double optional chain for nested API objects
status?.queue?.name ?? 'Default'
status?.queue?.avg_wait_minutes ?? 5

// ❌ WRONG — single chain on nested object
status?.queue.name  // crashes if queue is undefined
```

Rules:
- Always use `?.` on EVERY level of a nested API object
- Always provide `?? fallback` values
- Components receiving async data must have a loading/null state
- Never assume API response shape — always guard

---

## SECTION 3F — LOCALSTORAGE SAFETY RULES

Always validate data after parsing from localStorage:

```tsx
// ✅ CORRECT
const saved = localStorage.getItem('my_key')
if (saved) {
  try {
    const parsed = JSON.parse(saved)
    if (parsed && parsed.requiredField) {  // validate structure
      setState(parsed)
    } else {
      localStorage.removeItem('my_key')   // clean up bad data
    }
  } catch {
    localStorage.removeItem('my_key')
  }
}
```

---

## SECTION 4 — AUTH RULES

```tsx
/* @arkzen:meta
name: my-app
auth: true
*/
```

- `auth: true` — generates isolated users table, login/register/dashboard, Sanctum tokens
- `auth: false` — no auth, all pages public
- Auth layout: `/* @arkzen:page:layout:auth */`
- Guest layout: `/* @arkzen:page:layout:guest */`
- Custom layout: `/* @arkzen:page:layout:app */`

---

## SECTION 5 — @arkzen:meta

```tsx
/* @arkzen:meta
name: my-app
version: 1.0.0
label: My App
auth: false
description: Optional description
favicon: https://example.com/icon.png
*/
```

---

## SECTION 6 — @arkzen:config

```tsx
/* @arkzen:config
toast:
  position: top-right
  duration: 3000
pwa:
  name: QueueFlow
  short_name: Queue
  theme_color: "#0f0f1a"
  background_color: "#0f0f1a"
  display: standalone
  icons:
    - { src: /tatemonos/my-app/icon-192.png, sizes: 192x192, type: image/png }
    - { src: /tatemonos/my-app/icon-512.png, sizes: 512x512, type: image/png }
    - { src: /tatemonos/my-app/icon-mask.png, sizes: 512x512, type: image/png, purpose: maskable }
*/
```

---

## SECTION 7 — @arkzen:database

### FORMAT A — Dict format (standard)

```tsx
/* @arkzen:database:products
table: products
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  price:
    type: decimal
    precision: 8
    scale: 2
  category_id:
    type: foreignId
    foreign: my_app_categories.id    ← USE PREFIXED TABLE NAME (see Section 7D)
    nullable: false
  status:
    type: enum
    values: [active, inactive]
    default: active
seeder:
  count: 3
  data:
    - name: "Product One"
      price: "99.99"
      category_id: 1
      status: active
*/
```

### FORMAT B — Array format (multi-table)

```tsx
/* @arkzen:database
name: my-app
tables:
  - name: categories
    columns:
      - { name: name, type: string }
    seeds:
      - { name: "Electronics" }
  - name: products
    columns:
      - { name: category_id, type: foreignId, references: categories }
      - { name: name, type: string }
*/
```

**Column Types:** `integer, bigInteger, string, text, longText, decimal, float, boolean, date, datetime, timestamp, json, uuid, foreignId, enum`

**Column Modifiers:** `length, nullable, default, primary, autoIncrement, unique, precision, scale, foreign (table.column), values ([...] for enum)`

---

## ⚠️ SECTION 7B — foreignId & AUTO-RELATIONSHIPS

Engine auto-generates `belongsTo`/`hasMany` from foreign keys. Never write them manually.

```yaml
# Format A — use foreign: table.id
employee_id:
  type: foreignId
  foreign: employees.id
  nullable: false

# Format B — use references: table
- { name: employee_id, type: foreignId, references: employees }
```

---

## ⚠️ SECTION 7C — SEEDER ORDER WARNING

If Table B has a `foreignId` pointing to Table A, **remove the seeder from Table B**. The engine seeds tables in definition order, and SQLite foreign key constraints will fail if the parent table isn't seeded first.

```tsx
// ✅ CORRECT — only seed the parent table
/* @arkzen:database:queues
seeder:
  data:
    - name: "General"
*/

/* @arkzen:database:tickets
table: tickets
columns:
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id   ← prefixed name (see Section 7D)
// ← NO seeder here — tickets created at runtime
*/
```

---

## ⚠️ SECTION 7D — foreignId PREFIXED TABLE NAME RULE (CRITICAL)

Arkzen generates all tables with a `{tatemono-slug}_` prefix. When using `foreignId` with `foreign:`, you **MUST** use the actual generated table name including the prefix — NOT the bare table name.

**Formula:**
```
generated table name = {tatemono-name with _ instead of -}_{table name}
```

**Examples:**
```
tatemono: queue-flow    table: queues   → generated: queue_flow_queues
tatemono: queue-flow    table: tickets  → generated: queue_flow_tickets
tatemono: task-manager  table: tasks    → generated: task_manager_tasks
tatemono: dtr-geofencing table: records → generated: dtr_geofencing_records
```

**foreignId usage:**
```yaml
# ✅ CORRECT
queue_id:
  type: foreignId
  foreign: queue_flow_queues.id   ← full prefixed name

# ❌ WRONG — will cause "no such table" SQLite error
queue_id:
  type: foreignId
  foreign: queues.id              ← bare name, table doesn't exist in isolated SQLite
```

**Why:** Each tatemono has its own isolated SQLite database. Inside that database the table is named `queue_flow_queues`. The `constrained('queues')` call Laravel generates will fail because there is no table called `queues` — only `queue_flow_queues`.

---

## SECTION 8 — @arkzen:api

```tsx
/* @arkzen:api:products
model: Product
controller: ProductController
prefix: /api/my-app
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /products
    description: Get all products        ← REQUIRED
    response:
      type: collection
  store:
    method: POST
    route: /products
    description: Create a product        ← REQUIRED
    validation:
      name: required|string|max:255
    response:
      type: single
  show:
    method: GET
    route: /products/{id}
    description: Get a single product    ← REQUIRED
    response:
      type: single
  update:
    method: PUT
    route: /products/{id}
    description: Update a product        ← REQUIRED
    validation:
      name: sometimes|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /products/{id}
    description: Delete a product        ← REQUIRED
    response:
      type: message
      value: Product deleted
*/
```

**`description` is REQUIRED on every endpoint.** The ControllerBuilder throws `Undefined array key "description"` if missing.

**Response types:** `collection`, `single`, `message`

---

## SECTION 9 — @arkzen:routes

Use `@arkzen:routes` when you need custom one-off endpoints that don't belong to a resource controller. Always pair with `@arkzen:handler:name` blocks for the PHP logic.

```tsx
/* @arkzen:routes
controller: QueueController
middleware: []
routes:
  - method: POST
    route: /api/my-app/join
    handler: join_queue
  - method: POST
    route: /api/my-app/call-next
    handler: call_next
  - method: GET
    route: /api/my-app/status/{queue_id}
    handler: queue_status
*/
```

**Route params** (`{queue_id}`, `{ticket_number}`) are available inside handler bodies as `$params[0]`, `$params[1]` in order of appearance. Do NOT use `$request->route('param_name')` — use `$params[n]` instead.

---

## ⚠️ SECTION 9B — @arkzen:handler:name (CRITICAL — for @arkzen:routes)

`@arkzen:handler:name` injects PHP into custom route controller methods declared in `@arkzen:routes`.

```tsx
/* @arkzen:handler:join_queue
*/
$queueId      = $request->input('queue_id');
$customerName = $request->input('customer_name', 'Guest');

$queue = \App\Models\Arkzen\MyApp\Queue::findOrFail($queueId);

$ticket = \App\Models\Arkzen\MyApp\Ticket::create([
  'queue_id'      => $queueId,
  'ticket_number' => $queue->prefix . '-' . str_pad(1, 3, '0', STR_PAD_LEFT),
  'customer_name' => $customerName,
  'status'        => 'waiting',
]);

return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;   ← URL params via $params[n], NOT $request->route()

$queue = \App\Models\Arkzen\MyApp\Queue::findOrFail($queueId);
return response()->json(['queue' => $queue]);
/* @arkzen:handler:queue_status:end */
```

**CRITICAL RULES:**
- Use `@arkzen:handler:name` for `@arkzen:routes` handlers — NEVER `@arkzen:endpoint:name`
- `@arkzen:endpoint:name` is ONLY for `@arkzen:api` resource controller methods
- URL route params use `$params[0]`, `$params[1]` — NOT `$request->route('name')`
- Request body params still use `$request->input('field')`
- Handler name must exactly match the `handler:` value in `@arkzen:routes`

**Which to use:**

| Scenario | Use |
|----------|-----|
| Custom logic inside a resource controller method (index, store, update, etc.) | `@arkzen:endpoint:name` |
| Custom one-off route declared in `@arkzen:routes` | `@arkzen:handler:name` |

---

## SECTION 10 — @arkzen:middleware:name

```tsx
/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json(['error' => 'JSON required'], 415);
}
/* @arkzen:middleware:requireJson:end */
```

---

## ⚠️ SECTION 11 — @arkzen:realtime:identifier

Realtime blocks serve TWO different purposes depending on whether they have a `channel:` key:

### Without `channel:` key → registers a channel in channels.php
```tsx
/* @arkzen:realtime:my-app.{id}
type: private
*/
```

### With `channel:` key → generates a ShouldBroadcast event class
```tsx
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

**The engine routes by `channel:` presence:**
- `channel:` present → `BroadcastBuilder` → `App\Events\Arkzen\{Slug}\Broadcast\{ClassName}` with `ShouldBroadcast`
- `channel:` absent → `ChannelBuilder` → entry in `routes/channels.php`

Types: `public`, `private`, `presence`

---

## ⚠️ SECTION 11B — BROADCAST EVENTS — COMPLETE PATTERN (CRITICAL)

When you need real-time broadcasting, you need BOTH a channel registration block AND a broadcast event block, PLUS the correct namespace in the controller.

```tsx
// Step 1: Register the channel (no channel: key)
/* @arkzen:realtime:queue-flow.{queueId}
type: public
*/

// Step 2: Declare the broadcast event (HAS channel: key)
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

In your `@arkzen:handler` PHP body, reference the Broadcast sub-namespace:
```php
// ✅ CORRECT — Broadcast sub-namespace
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([
  'queue_id' => $queueId,
  'action'   => 'joined',
  'ticket'   => $ticket,
]))->toOthers();

// ❌ WRONG — plain Events namespace has no ShouldBroadcast, causes 500
broadcast(new \App\Events\Arkzen\QueueFlow\QueueUpdated([...]));
```

**Namespace formula:**
```
\App\Events\Arkzen\{TatemonoNamespace}\Broadcast\{EventClassName}

queue-flow + queue-updated → \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated
my-realtime-app + user-joined → \App\Events\Arkzen\MyRealtimeApp\Broadcast\UserJoined
```

**The `@arkzen:events:name` block** (separate from realtime) is for plain Laravel events with listeners — NOT for broadcasting. If you need `broadcast()`, use `@arkzen:realtime` with `channel:` key instead.

---

## SECTION 12 — @arkzen:events:identifier

For plain Laravel events with queued listeners (NOT for broadcasting):

```tsx
/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats]
*/
/* @arkzen:events:user-signed-up:end */
```

---

## SECTION 13 — @arkzen:listeners:name

```tsx
/* @arkzen:listeners:SendWelcomeEmail */
public function handle(UserSignedUp $event): void
{
    Mail::to($event->user->email)->send(new WelcomeMail($event->user));
}
/* @arkzen:listeners:SendWelcomeEmail:end */
```

---

## SECTION 14 — @arkzen:jobs:identifier

```tsx
/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 60
*/
// job body PHP here
/* @arkzen:jobs:process-data:end */
```

---

## SECTION 15 — @arkzen:notifications:identifier

```tsx
/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new notification"
*/
```

---

## SECTION 16 — @arkzen:mail:identifier

```tsx
/* @arkzen:mail:welcome
subject: Welcome to Our App
greeting: Hello!
lines:
  - Thank you for joining us.
action:
  text: Get Started
  url: "{{ $url }}"
*/
```

---

## SECTION 17 — @arkzen:console:identifier

```tsx
/* @arkzen:console:cleanup-temp
command: app:cleanup-temp
description: Clean up temporary files
schedule: daily
*/
\Storage::deleteDirectory('temp');
/* @arkzen:console:cleanup-temp:end */
```

---

## SECTION 18 — @arkzen:endpoint:name

**ONLY for `@arkzen:api` resource controller methods.** Do NOT use for `@arkzen:routes` handlers.

```tsx
/* @arkzen:endpoint:index
*/
$query = \App\Models\Arkzen\MyApp\Item::query()->orderBy('created_at', 'desc');
$perPage = $request->get('per_page', 15);
return response()->json($query->paginate($perPage));
/* @arkzen:endpoint:index:end */
```

The endpoint name must match a key in the `endpoints:` section of an `@arkzen:api` block.

---

## SECTION 19 — @arkzen:layout:name

```tsx
/* @arkzen:layout:app */

'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Home, Settings } from 'lucide-react'

const NAV = [
  { href: '/my-app',          icon: Home,     label: 'Home'     },
  { href: '/my-app/settings', icon: Settings, label: 'Settings' },
]

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname()
  const router   = useRouter()

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #e8f2ff, #daeeff)' }}>
      <main style={{ paddingBottom: 80 }}>{children}</main>
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        background: 'rgba(255,255,255,0.70)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderTop: '1px solid rgba(255,255,255,0.85)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', maxWidth: 390, margin: '0 auto', height: 64, alignItems: 'center' }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href
            return (
              <button key={href} onClick={() => router.push(href)}
                style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer' }}>
                <Icon size={20} style={{ color: active ? '#3a6fd8' : '#8aabcf' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: active ? '#3a6fd8' : '#8aabcf' }}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

/* @arkzen:layout:app:end */
```

**Layout Rules:**
- Opening tag: `/* @arkzen:layout:name */` (with `*/` on same line)
- Must export component named `<Name>Layout` (e.g. `AppLayout`, `DashboardLayout`)
- Must include ALL imports the layout needs
- `'use client'` required at top
- Can use Tailwind classes OR inline styles OR both
- CANNOT import from @arkzen:components

---

## SECTION 19B — LAYOUT STYLING NOTES

Layouts often use glassmorphism or gradient backgrounds. Inline styles are preferred here because:
- `backdrop-filter` and `WebkitBackdropFilter` require inline styles in React
- Complex `box-shadow` and gradient values are easier inline
- Dynamic color values from state must be inline

```tsx
// Glassmorphism nav bar example
<nav style={{
  background: 'rgba(255,255,255,0.60)',
  backdropFilter: 'blur(24px)',
  WebkitBackdropFilter: 'blur(24px)',
  borderTop: '1px solid rgba(255,255,255,0.85)',
  boxShadow: '0 -4px 24px rgba(80,130,210,0.10)',
}}>
```

---

## SECTION 20 — @arkzen:style & @arkzen:style:name

```tsx
/* @arkzen:style */
.arkzen-btn {
  @apply px-4 py-2 rounded-lg font-medium;
}
/* @arkzen:style:end */

/* @arkzen:style:ProductCard */
.card { border-radius: 12px; transition: transform 0.2s; }
/* @arkzen:style:ProductCard:end */
```

---

## SECTION 21 — @arkzen:page:name

```tsx
/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */

const DashboardPage = () => {
  const [data, setData] = useState(null)
  // ...
  return <div>...</div>
}

/* @arkzen:page:dashboard:end */
```

**Page Rules:**
- Opening tag: `/* @arkzen:page:name */` (with `*/` on same line)
- NO imports — engine provides everything from @arkzen:components
- NO `'use client'` — engine adds it
- NO `export default` — NOT required
- Component name: `<PageName>Page` (PascalCase) — `IndexPage`, `DashboardPage`
- All hooks available automatically
- All exports from ALL @arkzen:components blocks available automatically

---

## ⚠️ SECTION 22 — @arkzen:error:404 & @arkzen:error:500

### error:404 — CORRECT FORMAT:
```tsx
/* @arkzen:error:404 */

const NotFoundPage = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(74,114,216,0.20)' }}>404</p>
      <p style={{ color: '#7a9bc4' }}>Page not found</p>
    </div>
  </div>
)

/* @arkzen:error:404:end */
```

**error:404 STRICT RULES:**
- Component MUST be named `NotFoundPage` — router expects this exact name
- NO `export default` — router appends its own `export default NotFoundPage`
- NO `import React` — engine injects it
- NO `'use client'` — not-found is a server component
- Opening tag: `/* @arkzen:error:404 */` (with `*/` on same line)

### error:500 — CORRECT FORMAT:
```tsx
/* @arkzen:error:500 */

'use client'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 64, fontWeight: 900, color: 'rgba(239,68,68,0.20)' }}>500</p>
        <button onClick={reset} style={{ marginTop: 16, padding: '12px 24px', borderRadius: 12, background: '#3a6fd8', color: 'white', border: 'none', cursor: 'pointer' }}>
          Try Again
        </button>
      </div>
    </div>
  )
}

/* @arkzen:error:500:end */
```

---

## SECTION 23 — @arkzen:components:identifier

```tsx
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { create } from 'zustand'
import { Plus, Trash2, Loader2, ArrowRight } from 'lucide-react'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Types, Store, Utilities, Components all here
// ...

/* @arkzen:components:shared:end */
```

**Rules:**
- Opening tag: `/* @arkzen:components:shared */` (with `*/` on same line)
- `'use client'` at top
- ALL types, stores, utilities, hooks, components exported
- All imports for ALL components in this block go here

---

## ⚠️ SECTION 23B — MULTIPLE COMPONENTS BLOCKS IMPORT RULES (CRITICAL)

When using multiple `@arkzen:components` blocks (e.g. `shared` and `admin`):

```tsx
/* @arkzen:components:shared */
'use client'
import React, { useState, useCallback } from 'react'
import { Users, Clock, Loader2, SkipForward } from 'lucide-react'
// ... all shared components
/* @arkzen:components:shared:end */

/* @arkzen:components:admin */
'use client'
import React, { useCallback } from 'react'
// ← DO NOT re-import icons/hooks that are already in shared
// ← The engine inlines all blocks into one file — duplicates cause "Duplicate declaration" errors
// ← Only import what is UNIQUE to this block

export const AdminButton = () => {
  // SkipForward, Loader2 from shared are available here — do not reimport
  return <button><SkipForward size={16} /></button>
}
/* @arkzen:components:admin:end */
```

**Rules:**
- Each block still needs its own `'use client'` and `React` import
- Do NOT re-import icons, utilities, or hooks that exist in a previous components block
- The engine inlines all components blocks into one file — duplicate imports = `Duplicate declaration` error
- Only add imports for things unique to that block

---

## SECTION 24 — @arkzen:animation

```tsx
/* @arkzen:animation */

import { gsap } from 'gsap'

const queueFlowAnimations = (pageRef: React.RefObject<HTMLDivElement>) => {
  const ctx = gsap.context(() => {
    gsap.fromTo('.header-section',
      { opacity: 0, y: -16 },
      { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' }
    )
  }, pageRef)
  return () => ctx.revert()
}

export const pageVariants = {
  initial:  { opacity: 0, y: 12 },
  animate:  { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit:     { opacity: 0, y: -8, transition: { duration: 0.2 } },
}

/* @arkzen:animation:end */
```

**⚠️ Animation STRICT RULES:**
- Opening tag: `/* @arkzen:animation */` (with `*/` on same line)
- Main animation function: **NO `export` keyword** — router adds its own export
- Main animation function name: **MUST be `camelCase(tatemono-name) + Animations`**
  - `queue-flow` → `queueFlowAnimations`
  - `dtr-geofencing` → `dtrGeofencingAnimations`
  - `barbershop-booking` → `barbershopBookingAnimations`
- `pageVariants`: **KEEP `export const`** — used directly in pages
- NO `import React` in animation block
- GSAP target class names (`.stat-pill`, `.card-row`) **MUST exist** on actual rendered elements in components
- Close with `/* @arkzen:animation:end */`

---

## SECTION 25 — ASSETS FOLDER

Static media at `tatemonos/<name>/assets/`. Auto-copied to public folder.
Reference in code: `/tatemonos/<name>/assets/images/photo.jpg`

---

## SECTION 26 — AVAILABLE IMPORTS

**Always available in @arkzen:components:**
```tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { create } from 'zustand'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { useAuthStore } from '@/arkzen/core/stores/authStore'
import { useToast } from '@/arkzen/core/components/Toast'
import { Modal } from '@/arkzen/core/components/Modal'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
```

**Optional (already installed):**
```tsx
import L from 'leaflet'
import { useEditor, EditorContent } from '@tiptap/react'
import * as THREE from 'three'
import Matter from 'matter-js'
import { gsap } from 'gsap'
import { motion, AnimatePresence } from 'framer-motion'
```

---

## SECTION 27 — ACTIVE TATEMONOS (21 Total)

```
auth-test                v1.0.0  auth:true   pages: login, register, dashboard
barbershop-booking       v1.0.0  auth:false  pages: index
body-endpoint-handler    v1.0.0  auth:false  pages: index
body-mail-notification   v1.0.0  auth:true   pages: login, register, dashboard
broadcast-test           v2.0.0  auth:true   pages: login, register, dashboard
crud-test                v1.0.0  auth:false  pages: index
dtr-geofencing           v2.0.0  auth:false  pages: index, admin  layout:app
errors-test              v1.0.0  auth:false  pages: index  error:404 error:500
events-test              v1.0.0  auth:false  pages: index
inventory-management     v2.0.0  auth:false  pages: index
jo-payroll               v3.0.0  auth:false  pages: index,job-database,cash-atm,sss,hdmf,appointments,payslip  layout:app
job-test                 v1.0.0  auth:false  pages: dashboard
mail-test                v2.0.0  auth:true   pages: login, register, dashboard
middleware-test          v2.0.0  auth:false  pages: index
new-updates-styles       v2.0.0  auth:false  pages: index, about, features
notification-test        v2.1.0  auth:true   pages: login, register, dashboard
portfolio-test           v1.0.0  auth:false  pages: index
queue-flow               v1.0.0  auth:false  pages: index, join, admin  layout:app  pwa:true  realtime:public
roles-test               v2.1.0  auth:true   pages: login, register, dashboard
scheduler-test           v2.0.0  auth:false  pages: dashboard
upload-test              v1.0.0  auth:false  pages: dashboard
```

---

## SECTION 28 — COMPLETE TATEMONO EXAMPLE (with custom routes + broadcast)

The queue-flow tatemono is the reference example for:
- Custom routes with `@arkzen:routes` + `@arkzen:handler`
- Broadcast realtime with `@arkzen:realtime` + `channel:` key
- Custom app layout with bottom nav
- PWA config
- Multi-page tatemono (index, join, admin)

Key patterns from queue-flow:

```tsx
/* @arkzen:meta
name: queue-flow
version: 1.0.0
auth: false
*/

/* @arkzen:database:queues
table: queues
...
seeder:
  data:
    - name: "General"
      prefix: "G"
*/

/* @arkzen:database:tickets
table: tickets
columns:
  queue_id:
    type: foreignId
    foreign: queue_flow_queues.id   ← PREFIXED table name
    nullable: false
  ...
// NO seeder — tickets created at runtime
*/

/* @arkzen:routes
controller: QueueController
middleware: []
routes:
  - method: POST
    route: /api/queue-flow/join
    handler: join_queue
  - method: GET
    route: /api/queue-flow/status/{queue_id}
    handler: queue_status
*/

/* @arkzen:handler:join_queue         ← handler: for @arkzen:routes
*/
$queueId = $request->input('queue_id');
$ticket  = \App\Models\Arkzen\QueueFlow\Ticket::create([...]);
broadcast(new \App\Events\Arkzen\QueueFlow\Broadcast\QueueUpdated([   ← Broadcast\ namespace
  'queue_id' => $queueId,
  'ticket'   => $ticket,
]))->toOthers();
return response()->json(['ticket' => $ticket]);
/* @arkzen:handler:join_queue:end */

/* @arkzen:handler:queue_status
*/
$queueId = $params[0] ?? null;    ← URL params via $params[n]
$queue   = \App\Models\Arkzen\QueueFlow\Queue::findOrFail($queueId);
return response()->json(['queue' => $queue]);
/* @arkzen:handler:queue_status:end */

// Channel registration (no channel: key)
/* @arkzen:realtime:queue-flow.{queueId}
type: public
*/

// Broadcast event (HAS channel: key → generates ShouldBroadcast class)
/* @arkzen:realtime:queue-updated
channel: queue-flow.{queueId}
type: public
*/
/* @arkzen:realtime:queue-updated:end */
```

---

## SECTION 29 — AI GENERATION CHECKLIST

Before finalizing any tatemono:

**DSL TAG FORMAT:**
- [ ] YAML blocks (meta, config, database, api, etc.) — NO `*/` on opening line
- [ ] Code blocks (components, layout, animation, page, style, error) — HAS `*/` on same line
- [ ] Endpoint/handler blocks — NO `*/` on opening, `*/` on NEXT line
- [ ] ALL closing tags use `:end */` format

**DATABASE:**
- [ ] foreignId `foreign:` uses PREFIXED table name: `{tatemono_slug}_{table}` (e.g. `queue_flow_queues`)
- [ ] Child table with foreignId has NO seeder if parent needs to seed first
- [ ] description field on EVERY api endpoint

**CUSTOM ROUTES vs RESOURCE ENDPOINTS:**
- [ ] `@arkzen:routes` handlers use `@arkzen:handler:name` — NEVER `@arkzen:endpoint:name`
- [ ] `@arkzen:api` endpoint bodies use `@arkzen:endpoint:name`
- [ ] URL route params in handlers use `$params[0]`, `$params[1]` — NOT `$request->route('name')`

**BROADCAST / REALTIME:**
- [ ] Channel registration block has NO `channel:` key
- [ ] Broadcast event block HAS `channel:` key pointing to the channel name
- [ ] `broadcast()` calls use `\App\Events\Arkzen\{Ns}\Broadcast\{ClassName}` (Broadcast sub-namespace)
- [ ] Plain `@arkzen:events` blocks are for listener-based events only — NOT for `broadcast()`

**IMPORTS:**
- [ ] ALL imports inside `@arkzen:components` or `@arkzen:layout` blocks
- [ ] NO imports inside `@arkzen:page` blocks
- [ ] NO `import React` in `@arkzen:animation`
- [ ] Multiple components blocks — no duplicate icon/hook imports across blocks
- [ ] Each components block still has its own React import

**ERROR HANDLERS:**
- [ ] error:404 component named `NotFoundPage` exactly
- [ ] error:404 has NO `export default` — router adds it
- [ ] error:404 has NO `import React` — engine adds it
- [ ] error:404 has NO `'use client'`
- [ ] error:500 has `'use client'` and `export default function Error`

**ANIMATION:**
- [ ] Main animation function has NO `export` — router adds it
- [ ] Main animation function named `camelCase(tatemono-name) + Animations`
- [ ] `pageVariants` HAS `export const`
- [ ] GSAP target classes exist on actual rendered elements

**NULL SAFETY:**
- [ ] Double optional chain on nested API objects: `status?.queue?.name`
- [ ] Components with async data have null/loading guard at top
- [ ] localStorage data validated before use

**PAGES:**
- [ ] NO imports in page blocks
- [ ] NO `'use client'` in page blocks
- [ ] NO `export default`
- [ ] Component name: `<PageName>Page` PascalCase

**SECTION ORDER:**
- [ ] meta → config → database → api → routes → endpoint → handler → middleware → realtime → events → listeners → jobs → notifications → mail → console → layout → components → style → page → error → animation