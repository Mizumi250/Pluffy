// ============================================================
// ARKZEN GENERATED SCRIPT — ethereane
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-19T22:51:31.623Z
// ============================================================

// ─── GAME CONSTANTS ────────────────────────────────────────────────────────────
export const GAME_W     = 640
export const GAME_H     = 360
export const WORLD_W    = 6400
export const WORLD_H    = 3600
export const TILE_SIZE  = 32
export const CHAR_W     = 32
export const CHAR_H     = 48
export const CHAR_SPEED    = 2
export const CAM_LERP      = 0.08
export const ZOOM          = 2

// ─── ANIMATION ────────────────────────────────────────────────────────────────
export const IDLE_FRAMES     = 4
export const IDLE_FRAME_RATE = 8    // ticks per frame during animation (snappy)
export const IDLE_PAUSE      = 60   // ~1 second at 60fps
export const WALK_FRAMES     = 6
export const WALK_FRAME_RATE = 8    // ticks per frame for walk
export const WALK_ROW_OFFSET = 4    // walk rows start at row 4

// Direction rows in sprite sheet (idle rows 0-3, walk rows 4-7 — not drawn yet)
export const DIR_DOWN  = 0
export const DIR_LEFT  = 1
export const DIR_RIGHT = 2
export const DIR_UP    = 3

// ─── ASSET PATHS ──────────────────────────────────────────────────────────────
export const ASSETS = {
  tileGrass:       '/tatemonos/ethereane/assets/images/tile-grass.png',
  tilePlainGrass:  '/tatemonos/ethereane/assets/images/tile-plain-grass.png',
  character1:      '/tatemonos/ethereane/assets/images/character1.png',
  bush1:           '/tatemonos/ethereane/assets/images/bush1.png',
  bush2:           '/tatemonos/ethereane/assets/images/bush2.png',
}

// ─── PROP TYPES ───────────────────────────────────────────────────────────────
export type PropType = 'bush1' | 'bush2'

export interface Prop {
  type:      PropType
  x:         number
  y:         number
  w:         number
  h:         number
  collision: boolean
}

// bush2 collision box — bottom half only so top overlaps character
export const PROP_DEFS: Record<PropType, { w: number; h: number; collision: boolean; colOffsetY: number; colH: number }> = {
  bush1: { w: 32, h: 32, collision: false, colOffsetY: 0,  colH: 0  },
  bush2: { w: 32, h: 32, collision: true,  colOffsetY: 16, colH: 16 },
}

// ─── WORLD GENERATOR ──────────────────────────────────────────────────────────
export function generateProps(seed: number = 42): Prop[] {
  const props: Prop[] = []
  // simple seeded random
  let s = seed
  const rand = () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff }

  const COUNT_BUSH1 = 300
  const COUNT_BUSH2 = 150
  const MARGIN      = 64  // keep away from world edges

  for (let i = 0; i < COUNT_BUSH1; i++) {
    props.push({
      type: 'bush1',
      x: Math.floor(MARGIN + rand() * (WORLD_W - MARGIN * 2)),
      y: Math.floor(MARGIN + rand() * (WORLD_H - MARGIN * 2)),
      w: 32, h: 32,
      collision: false,
    })
  }
  for (let i = 0; i < COUNT_BUSH2; i++) {
    props.push({
      type: 'bush2',
      x: Math.floor(MARGIN + rand() * (WORLD_W - MARGIN * 2)),
      y: Math.floor(MARGIN + rand() * (WORLD_H - MARGIN * 2)),
      w: 32, h: 32,
      collision: true,
    })
  }
  return props
}

// ─── COLLISION CHECK ──────────────────────────────────────────────────────────
export function resolveCollision(
  nextX:  number,
  nextY:  number,
  props:  Prop[],
): { x: number; y: number } {
  // character feet box
  const cLeft   = nextX + 4
  const cRight  = nextX + CHAR_W - 4
  const cTop    = nextY + CHAR_H - 12
  const cBottom = nextY + CHAR_H

  for (const p of props) {
    if (!p.collision) continue
    const def     = PROP_DEFS[p.type]
    const pLeft   = p.x
    const pRight  = p.x + p.w
    const pTop    = p.y + def.colOffsetY
    const pBottom = p.y + def.colOffsetY + def.colH

    if (cRight > pLeft && cLeft < pRight && cBottom > pTop && cTop < pBottom) {
      // push back — find smallest overlap axis
      const overlapLeft  = cRight  - pLeft
      const overlapRight = pRight  - cLeft
      const overlapTop   = cBottom - pTop
      const overlapBot   = pBottom - cTop

      const minH = Math.min(overlapLeft, overlapRight)
      const minV = Math.min(overlapTop,  overlapBot)

      if (minH < minV) {
        nextX += overlapLeft < overlapRight ? -overlapLeft : overlapRight
      } else {
        nextY += overlapTop  < overlapBot   ? -overlapTop  : overlapBot
      }
    }
  }
  return { x: nextX, y: nextY }
}

// ─── NPC ──────────────────────────────────────────────────────────────────────
export const NPC_COUNT      = 10
export const NPC_SPEED      = 0.8
export const NPC_WANDER_MIN = 60
export const NPC_WANDER_MAX = 240
export const NPC_SPAWN_RANGE = 400
export const NPC_INTERACT_RADIUS = 36  // pixels — how close to trigger button

export const NPC_DIALOGUES = [
  ["Hey there, traveler!", "This world is bigger than it looks..."],
  ["Beautiful day, isn't it?", "I've been walking for hours and still haven't seen it all."],
  ["Don't wander too far from the path.", "Strange things happen near the edges of the world."],
  ["I heard there are hidden places", "deep in this land. Have you found any?"],
  ["The grass here feels different.", "Like it remembers something."],
  ["Oh! You startled me.", "I was just enjoying the view."],
  ["They say if you walk far enough,", "the world wraps back around."],
  ["I've been here since dawn.", "Still not sure where I'm going."],
  ["Have you seen any strange lights", "to the north? I keep seeing them at night."],
  ["Just passing through.", "Same as everyone else, I suppose."],
]

export interface Npc {
  x:            number
  y:            number
  dx:           number
  dy:           number
  dirRow:       number
  frameIndex:   number
  frameTick:    number
  wanderTick:   number
  wanderMax:    number
  idlePausing:  boolean
  idleTick:     number
  dialogueIndex: number
}

export function generateNpcs(): Npc[] {
  const npcs: Npc[] = []
  const cx = WORLD_W / 2
  const cy = WORLD_H / 2
  for (let i = 0; i < NPC_COUNT; i++) {
    const angle = (i / NPC_COUNT) * Math.PI * 2
    const dist  = 100 + Math.random() * NPC_SPAWN_RANGE
    npcs.push({
      x:           cx + Math.cos(angle) * dist,
      y:           cy + Math.sin(angle) * dist,
      dx:          0,
      dy:          0,
      dirRow:      DIR_DOWN,
      frameIndex:  Math.floor(Math.random() * WALK_FRAMES),
      frameTick:   0,
      wanderTick:  0,
      wanderMax:     NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN)),
      idlePausing:   false,
      idleTick:      0,
      dialogueIndex: i % NPC_DIALOGUES.length,
    })
  }
  return npcs
}

export function findNearbyNpc(
  charX: number,
  charY: number,
  npcs:  Npc[],
): Npc | null {
  const cx = charX + CHAR_W / 2
  const cy = charY + CHAR_H / 2
  for (const npc of npcs) {
    const nx   = npc.x + CHAR_W / 2
    const ny   = npc.y + CHAR_H / 2
    const dist = Math.sqrt((cx - nx) ** 2 + (cy - ny) ** 2)
    if (dist < NPC_INTERACT_RADIUS) return npc
  }
  return null
}

// ─── NPC UPDATE FUNCTION (added to fix parse error) ─────────────────────────
export function updateNpcs(npcs: Npc[], paused: boolean = false): void {
  for (const npc of npcs) {
    npc.wanderTick++

    // Pick new direction only when not paused
    if (!paused && npc.wanderTick >= npc.wanderMax) {
      npc.wanderTick = 0
      npc.wanderMax  = NPC_WANDER_MIN + Math.floor(Math.random() * (NPC_WANDER_MAX - NPC_WANDER_MIN))
      if (Math.random() < 0.25) {
        npc.dx = 0
        npc.dy = 0
      } else {
        const angle = Math.random() * Math.PI * 2
        npc.dx = Math.cos(angle)
        npc.dy = Math.sin(angle)
      }
    }

    const moving = !paused && (Math.abs(npc.dx) > 0.1 || Math.abs(npc.dy) > 0.1)

    // Move only if not paused
    if (moving) {
      npc.x = Math.max(0, Math.min(npc.x + npc.dx * NPC_SPEED, WORLD_W - CHAR_W))
      npc.y = Math.max(0, Math.min(npc.y + npc.dy * NPC_SPEED, WORLD_H - CHAR_H))
      if      (npc.dy >  0.3) npc.dirRow = DIR_DOWN
      else if (npc.dy < -0.3) npc.dirRow = DIR_UP
      else if (npc.dx < -0.3) npc.dirRow = DIR_LEFT
      else if (npc.dx >  0.3) npc.dirRow = DIR_RIGHT
    }

    // Animation always runs (idle or walk frames)
    npc.frameTick++
    if (moving) {
      if (npc.frameTick >= WALK_FRAME_RATE) {
        npc.frameTick  = 0
        npc.frameIndex = (npc.frameIndex + 1) % WALK_FRAMES
      }
    } else {
      const rate = npc.idlePausing ? IDLE_PAUSE : IDLE_FRAME_RATE
      if (npc.frameTick >= rate) {
        npc.frameTick = 0
        if (npc.idlePausing) {
          npc.idlePausing = false
          npc.frameIndex  = 0
        } else {
          npc.frameIndex++
          if (npc.frameIndex >= IDLE_FRAMES) {
            npc.frameIndex  = 0
            npc.idlePausing = true
          }
        }
      }
    }
  }
}

// ─── IMAGE LOADER ─────────────────────────────────────────────────────────────
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload  = () => resolve(img)
    img.onerror = () => reject(new Error(`Failed to load: ${src}`))
    img.src = src
  })
}

// ─── SCALE CALCULATOR ─────────────────────────────────────────────────────────
export function calcScale(): number {
  const scaleX  = window.innerWidth  / GAME_W
  const scaleY  = window.innerHeight / GAME_H
  const fit     = Math.min(scaleX, scaleY)
  const integer = Math.floor(fit)
  return integer >= 1 ? integer : fit
}

// ─── CAMERA ───────────────────────────────────────────────────────────────────
export function lerpCam(
  cam:    { x: number; y: number },
  target: { x: number; y: number },
  lerp:   number,
  zoom:   number,
): { x: number; y: number } {
  const visW = GAME_W / zoom
  const visH = GAME_H / zoom
  const targetCamX = target.x + CHAR_W / 2 - visW / 2
  const targetCamY = target.y + CHAR_H / 2 - visH / 2
  let cx = cam.x + (targetCamX - cam.x) * lerp
  let cy = cam.y + (targetCamY - cam.y) * lerp
  cx = Math.max(0, Math.min(cx, WORLD_W - visW))
  cy = Math.max(0, Math.min(cy, WORLD_H - visH))
  return { x: cx, y: cy }
}

// ─── MINIMAP ──────────────────────────────────────────────────────────────────
export const MINI_W      = 80   // minimap width in pixels
export const MINI_H      = 45   // minimap height (keeps 16:9 ratio of world)
export const MINI_PAD    = 8    // padding from corner
export const MINI_BORDER = 1

export function renderMinimap(
  ctx:   CanvasRenderingContext2D,
  charX: number,
  charY: number,
) {
  const x = GAME_W - MINI_W - MINI_PAD
  const y = MINI_PAD

  // ── Background ──
  ctx.save()
  ctx.globalAlpha = 0.7
  ctx.fillStyle = '#0a1a0a'
  ctx.fillRect(x - MINI_BORDER, y - MINI_BORDER, MINI_W + MINI_BORDER * 2, MINI_H + MINI_BORDER * 2)
  ctx.globalAlpha = 1

  // ── World fill ──
  ctx.fillStyle = '#2d5a27'
  ctx.fillRect(x, y, MINI_W, MINI_H)

  // ── Border ──
  ctx.strokeStyle = 'rgba(255,255,255,0.4)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(x, y, MINI_W, MINI_H)

  // ── Player dot ──
  const dotX = x + (charX / WORLD_W) * MINI_W
  const dotY = y + (charY / WORLD_H) * MINI_H
  ctx.fillStyle = '#fff'
  ctx.beginPath()
  ctx.arc(dotX, dotY, 1.5, 0, Math.PI * 2)
  ctx.fill()

  // ── Viewport box — shows what camera sees ──
  const vx = x + ((charX - GAME_W / ZOOM / 2) / WORLD_W) * MINI_W
  const vy = y + ((charY - GAME_H / ZOOM / 2) / WORLD_H) * MINI_H
  const vw = (GAME_W / ZOOM / WORLD_W) * MINI_W
  const vh = (GAME_H / ZOOM / WORLD_H) * MINI_H
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 0.5
  ctx.strokeRect(vx, vy, vw, vh)

  ctx.restore()
}

// ─── RENDER FRAME ─────────────────────────────────────────────────────────────
export function renderFrame(
  ctx:        CanvasRenderingContext2D,
  grass:      HTMLImageElement,
  plainGrass: HTMLImageElement,
  char:       HTMLImageElement,
  images:     Record<string, HTMLImageElement>,
  props:      Prop[],
  npcs:       Npc[],
  charX:      number,
  charY:      number,
  camX:       number,
  camY:       number,
  zoom:       number,
  frameIndex: number,
  dirRow:     number,
  isWalking:  boolean,
) {
  // ── Keep pixels sharp ──
  ctx.imageSmoothingEnabled = false
  ctx.clearRect(0, 0, GAME_W, GAME_H)

  // floor camera to prevent sub-pixel jitter on all sprites
  camX = Math.floor(camX)
  camY = Math.floor(camY)

  ctx.save()
  ctx.scale(zoom, zoom)

  const visW = GAME_W / zoom
  const visH = GAME_H / zoom

  // ── Tiles — patchy distribution using multi-frequency hash ──
  const startCol = Math.floor(camX / TILE_SIZE)
  const startRow = Math.floor(camY / TILE_SIZE)
  const endCol   = Math.ceil((camX + visW) / TILE_SIZE)
  const endRow   = Math.ceil((camY + visH) / TILE_SIZE)

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE_SIZE - camX
      const sy = r * TILE_SIZE - camY
      // patch noise — large scale + medium blended, more mix visible
      const large  = Math.sin(c * 0.13 + r * 0.17) * Math.cos(c * 0.07 - r * 0.11)
      const medium = Math.sin(c * 0.31 + r * 0.29) * 0.4
      const small  = Math.sin(c * 0.61 + r * 0.53) * 0.2
      const noise  = large + medium + small
      const tile   = noise > 0.0 ? plainGrass : grass
      ctx.drawImage(tile, sx, sy, TILE_SIZE, TILE_SIZE)
    }
  }

  // ── Y-sort: collect visible props + character into one list ──
  const visibleProps = props.filter(p =>
    p.x + p.w > camX - 32 && p.x < camX + visW + 32 &&
    p.y + p.h > camY - 32 && p.y < camY + visH + 32
  )

  // character sort key = bottom of feet
  const charSortY = charY + CHAR_H

  // sort everything by bottom Y
  type Drawable = { sortY: number; draw: () => void }
  const drawables: Drawable[] = []

  // add props
  for (const p of visibleProps) {
    const sx = Math.floor(p.x - camX)
    const sy = Math.floor(p.y - camY)
    const img = images[p.type]
    if (!img) continue
    drawables.push({
      sortY: p.y + p.h,
      draw: () => {
        // shadow under bush2
        if (p.type === 'bush2') {
          ctx.save()
          ctx.globalAlpha = 0.3
          ctx.fillStyle = '#000'
          ctx.beginPath()
          ctx.ellipse(
            sx + p.w / 2,
            sy + p.h,
            p.w / 2.5,
            p.h / 5,
            0, 0, Math.PI * 2,
          )
          ctx.fill()
          ctx.restore()
        }
        ctx.drawImage(img, sx, sy, p.w, p.h)
      },
    })
  }

  // add npcs
  for (const npc of npcs) {
    const nx = Math.floor(npc.x - camX)
    const ny = Math.floor(npc.y - camY)
    // skip if off screen
    if (nx + CHAR_W < 0 || nx > visW || ny + CHAR_H < 0 || ny > visH) continue
    const moving   = Math.abs(npc.dx) > 0.1 || Math.abs(npc.dy) > 0.1
    const npcRow   = moving ? WALK_ROW_OFFSET + npc.dirRow : npc.dirRow
    drawables.push({
      sortY: npc.y + CHAR_H,
      draw: () => {
        // shadow
        ctx.save()
        ctx.globalAlpha = 0.25
        ctx.fillStyle = '#000'
        ctx.beginPath()
        ctx.ellipse(nx + CHAR_W / 2, ny + CHAR_H, CHAR_W / 2.5, CHAR_H / 10, 0, 0, Math.PI * 2)
        ctx.fill()
        ctx.restore()
        // sprite
        ctx.drawImage(char, npc.frameIndex * CHAR_W, npcRow * CHAR_H, CHAR_W, CHAR_H, nx, ny, CHAR_W, CHAR_H)
      },
    })
  }

  // add character
  const screenX = Math.floor(charX - camX)
  const screenY = Math.floor(charY - camY)
  const sheetRow = isWalking ? WALK_ROW_OFFSET + dirRow : dirRow
  drawables.push({
    sortY: charSortY,
    draw: () => {
      // shadow
      ctx.save()
      ctx.globalAlpha = 0.3
      ctx.fillStyle = '#000'
      ctx.beginPath()
      ctx.ellipse(
        screenX + CHAR_W / 2, screenY + CHAR_H,
        CHAR_W / 2.5, CHAR_H / 10,
        0, 0, Math.PI * 2,
      )
      ctx.fill()
      ctx.restore()
      // sprite
      ctx.drawImage(
        char,
        frameIndex * CHAR_W, sheetRow * CHAR_H,
        CHAR_W, CHAR_H,
        screenX, screenY,
        CHAR_W, CHAR_H,
      )
    },
  })

  // draw in Y order
  drawables.sort((a, b) => a.sortY - b.sortY)
  for (const d of drawables) d.draw()

  ctx.restore()

  // ── Minimap — outside zoom so it stays fixed size ──
  renderMinimap(ctx, charX, charY)
}
