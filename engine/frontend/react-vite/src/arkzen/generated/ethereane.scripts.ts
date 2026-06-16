// ============================================================
// ARKZEN GENERATED SCRIPT — ethereane
// Source: @arkzen:script (global)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-16T07:10:49.320Z
// ============================================================

// ─── GAME CONSTANTS ────────────────────────────────────────────────────────────
export const GAME_W     = 640
export const GAME_H     = 360
export const WORLD_W    = 6400
export const WORLD_H    = 3600
export const TILE_SIZE  = 32
export const CHAR_W     = 32
export const CHAR_H     = 48
export const CHAR_SPEED = 2
export const CAM_LERP   = 0.08
export const ZOOM       = 2

// ─── ASSET PATHS ──────────────────────────────────────────────────────────────
export const ASSETS = {
  tileGrass:  '/tatemonos/ethereane/assets/images/tile-grass.png',
  character1: '/tatemonos/ethereane/assets/images/character1.png',
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

// ─── RENDER FRAME ─────────────────────────────────────────────────────────────
export function renderFrame(
  ctx:   CanvasRenderingContext2D,
  grass: HTMLImageElement,
  char:  HTMLImageElement,
  charX: number,
  charY: number,
  camX:  number,
  camY:  number,
  zoom:  number,
) {
  ctx.clearRect(0, 0, GAME_W, GAME_H)

  ctx.save()
  ctx.scale(zoom, zoom)

  const visW = GAME_W / zoom
  const visH = GAME_H / zoom

  // ── Tiles ──
  const startCol = Math.floor(camX / TILE_SIZE)
  const startRow = Math.floor(camY / TILE_SIZE)
  const endCol   = Math.ceil((camX + visW) / TILE_SIZE)
  const endRow   = Math.ceil((camY + visH) / TILE_SIZE)

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      const sx = c * TILE_SIZE - camX
      const sy = r * TILE_SIZE - camY
      ctx.drawImage(grass, sx, sy, TILE_SIZE, TILE_SIZE)
    }
  }

  const screenX = Math.floor(charX - camX)
  const screenY = Math.floor(charY - camY)

  // ── Oval shadow under feet ──
  ctx.save()
  ctx.globalAlpha = 0.3
  ctx.fillStyle = '#000'
  ctx.beginPath()
  ctx.ellipse(
    screenX + CHAR_W / 2,
    screenY + CHAR_H,
    CHAR_W / 2.5,
    CHAR_H / 10,
    0, 0, Math.PI * 2,
  )
  ctx.fill()
  ctx.restore()

  // ── Character on top ──
  ctx.drawImage(char, screenX, screenY, CHAR_W, CHAR_H)

  ctx.restore()
}
