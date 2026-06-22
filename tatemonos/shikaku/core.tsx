/* @arkzen:meta
name: shikaku
version: 1.0.0
description: Shikaku — a full pixel art editor. Combines Aseprite's layer/frame system, PixSquare's clean mobile UI, Resprite's gesture-native canvas, and ibispaint's smooth panel UX. Per-project isolated SQLite. Auth-gated. Projects saved as JSON blobs with thumbnail previews.
auth: true
*/

/* @arkzen:meta:web
favicon: 🟦
title: Shikaku — Pixel Art Editor
description: A professional pixel art editor built on Arkzen. Layers, frames, animation, palettes.
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 2500
modal:
  borderRadius: lg
  backdrop: blur
layout:
  guest:
    className: "sk-root-guest"
  auth:
    className: "sk-root-auth"
*/

/* @arkzen:database:projects
table: shikaku_projects
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  user_id:
    type: integer
    nullable: false
  name:
    type: string
    length: 255
    nullable: false
  width:
    type: integer
    default: 32
  height:
    type: integer
    default: 32
  thumbnail:
    type: text
    nullable: true
seeder:
  count: 0
*/

/* @arkzen:database:saves
table: shikaku_saves
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  project_id:
    type: integer
    nullable: false
  frames_json:
    type: longText
    nullable: false
  version:
    type: integer
    default: 1
seeder:
  count: 0
*/

/* @arkzen:api:projects
model: ShikakuProject
controller: ShikakuProjectController
prefix: /api/shikaku/projects
middleware: [auth:sanctum]
resource: false
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /
    description: List all projects for current user
    response:
      type: collection
  store:
    method: POST
    route: /
    description: Create a new pixel art project
    validation:
      name: required|string|max:255
      width: required|integer|in:8,16,32,64,128
      height: required|integer|in:8,16,32,64,128
    response:
      type: single
  show:
    method: GET
    route: /{id}
    description: Load a project with its latest save
    response:
      type: single
  update:
    method: PUT
    route: /{id}
    description: Update project name or thumbnail
    validation:
      name: sometimes|string|max:255
      thumbnail: sometimes|nullable|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /{id}
    description: Delete project and all its saves
    response:
      type: message
      value: Project deleted
*/

/* @arkzen:api:saves
model: ShikakuSave
controller: ShikakuSaveController
prefix: /api/shikaku/projects
middleware: [auth:sanctum]
resource: false
policy: false
factory: false
endpoints:
  save:
    method: POST
    route: /{project_id}/save
    description: Save current frame/layer state as JSON blob
    validation:
      frames_json: required|string
    response:
      type: single
  latest:
    method: GET
    route: /{project_id}/latest
    description: Load most recent save for a project
    response:
      type: single
*/

/* @arkzen:realtime:shikaku.project.{id}
type: presence
*/
/* @arkzen:realtime:shikaku.project.{id}:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

/* ── Reset ─────────────────────────────────────────────── */
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { background: #0e0e1a; color: #e0e0f0; font-family: 'Inter', sans-serif; }

/* ── Root ────────────────────────────────────────────────── */
.sk-root-guest,
.sk-root-auth {
  min-height: 100vh;
  background: #0e0e1a;
  color: #e0e0f0;
  font-family: 'Inter', sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ── Dashboard ──────────────────────────────────────────── */
.sk-dash {
  min-height: 100vh;
  background: #0e0e1a;
  display: flex;
  flex-direction: column;
}

.sk-dash-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  border-bottom: 1px solid #1e1e32;
  background: #12121f;
}

.sk-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  color: #e0e0f0;
  letter-spacing: -0.3px;
}

.sk-logo-sq {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #4f8ef7 0%, #a78bfa 100%);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
}

.sk-dash-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sk-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: all 0.15s ease;
  font-family: 'Inter', sans-serif;
}

.sk-btn-primary {
  background: #4f8ef7;
  color: #fff;
}
.sk-btn-primary:hover { background: #3a7ae0; }

.sk-btn-ghost {
  background: transparent;
  color: #8888aa;
  border: 1px solid #1e1e32;
}
.sk-btn-ghost:hover { color: #e0e0f0; border-color: #3a3a5c; }

.sk-btn-danger {
  background: transparent;
  color: #f87171;
  border: 1px solid #f8717133;
}
.sk-btn-danger:hover { background: #f8717122; }

.sk-btn-sm {
  padding: 5px 10px;
  font-size: 12px;
}

.sk-dash-body {
  flex: 1;
  padding: 32px 24px;
  max-width: 1100px;
  margin: 0 auto;
  width: 100%;
}

.sk-dash-title {
  font-size: 13px;
  font-weight: 500;
  color: #5555aa;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin-bottom: 20px;
}

.sk-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.sk-project-card {
  background: #12121f;
  border: 1px solid #1e1e32;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}
.sk-project-card:hover { border-color: #4f8ef7; transform: translateY(-2px); }

.sk-project-thumb {
  width: 100%;
  aspect-ratio: 1;
  background: #0a0a14;
  display: flex;
  align-items: center;
  justify-content: center;
  image-rendering: pixelated;
  overflow: hidden;
}

.sk-project-thumb img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  image-rendering: pixelated;
}

.sk-project-thumb-empty {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  width: 80%;
  height: 80%;
  opacity: 0.15;
}

.sk-project-thumb-empty span {
  border: 0.5px solid #333;
  aspect-ratio: 1;
}

.sk-project-info {
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sk-project-name {
  font-size: 13px;
  font-weight: 600;
  color: #c8c8e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sk-project-meta {
  font-size: 11px;
  color: #5555aa;
  font-family: 'JetBrains Mono', monospace;
}

.sk-project-actions {
  display: flex;
  gap: 6px;
  padding: 8px 12px;
  border-top: 1px solid #1e1e32;
}

/* ── New Project Modal ───────────────────────────────────── */
.sk-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.sk-modal {
  background: #12121f;
  border: 1px solid #1e1e32;
  border-radius: 12px;
  padding: 28px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sk-modal-title {
  font-size: 16px;
  font-weight: 700;
  color: #e0e0f0;
}

.sk-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sk-label {
  font-size: 12px;
  font-weight: 500;
  color: #8888aa;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

.sk-input {
  background: #0e0e1a;
  border: 1px solid #2a2a3e;
  border-radius: 6px;
  padding: 9px 12px;
  color: #e0e0f0;
  font-size: 13px;
  font-family: 'Inter', sans-serif;
  outline: none;
  transition: border-color 0.15s;
}
.sk-input:focus { border-color: #4f8ef7; }

.sk-size-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 6px;
}

.sk-size-btn {
  padding: 8px 0;
  border-radius: 6px;
  border: 1px solid #2a2a3e;
  background: #0e0e1a;
  color: #8888aa;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  cursor: pointer;
  transition: all 0.15s;
  text-align: center;
}
.sk-size-btn:hover { border-color: #4f8ef7; color: #e0e0f0; }
.sk-size-btn.active { background: #4f8ef7; border-color: #4f8ef7; color: #fff; }

.sk-modal-footer {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* ── Editor Layout ──────────────────────────────────────── */
.sk-editor {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #0e0e1a;
  overflow: hidden;
  user-select: none;
}

.sk-editor-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  height: 44px;
  background: #12121f;
  border-bottom: 1px solid #1a1a2e;
  flex-shrink: 0;
  z-index: 10;
}

.sk-editor-topbar-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sk-editor-topbar-center {
  display: flex;
  align-items: center;
  gap: 4px;
}

.sk-editor-topbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sk-topbar-btn {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  border: none;
  background: transparent;
  color: #8888aa;
  cursor: pointer;
  transition: all 0.12s;
  font-size: 14px;
}
.sk-topbar-btn:hover { background: #1e1e32; color: #e0e0f0; }
.sk-topbar-btn:disabled { opacity: 0.3; cursor: not-allowed; }

.sk-project-title-input {
  background: transparent;
  border: none;
  outline: none;
  color: #c8c8e8;
  font-size: 13px;
  font-weight: 600;
  font-family: 'Inter', sans-serif;
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  min-width: 120px;
  transition: background 0.15s;
}
.sk-project-title-input:hover { background: #1e1e32; }
.sk-project-title-input:focus { background: #1e1e32; }

/* ── Editor Body ─────────────────────────────────────────── */
.sk-editor-body {
  flex: 1;
  display: flex;
  overflow: hidden;
}

/* ── Toolbar (left) ──────────────────────────────────────── */
.sk-toolbar {
  width: 52px;
  background: #12121f;
  border-right: 1px solid #1a1a2e;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
  gap: 2px;
  flex-shrink: 0;
  overflow-y: auto;
}

.sk-tool-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 7px;
  border: none;
  background: transparent;
  color: #6666aa;
  cursor: pointer;
  transition: all 0.12s;
  position: relative;
}
.sk-tool-btn:hover { background: #1e1e32; color: #c8c8e8; }
.sk-tool-btn.active { background: #4f8ef733; color: #4f8ef7; }

.sk-tool-sep {
  width: 28px;
  height: 1px;
  background: #1e1e32;
  margin: 4px 0;
}

/* Color swatches */
.sk-color-swatches {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
  padding: 6px 0;
  margin-top: auto;
}

.sk-swatch-secondary {
  width: 22px;
  height: 22px;
  border-radius: 4px;
  border: 2px solid #1e1e32;
  cursor: pointer;
  position: relative;
  top: 8px;
  left: 8px;
}

.sk-swatch-primary {
  width: 26px;
  height: 26px;
  border-radius: 4px;
  border: 2px solid #3a3a5c;
  cursor: pointer;
  position: relative;
  z-index: 1;
}

/* ── Canvas Area ─────────────────────────────────────────── */
.sk-canvas-area {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0a0a14;
  overflow: hidden;
  position: relative;
  cursor: crosshair;
}

.sk-canvas-wrap {
  position: relative;
  image-rendering: pixelated;
}

.sk-canvas-main {
  display: block;
  image-rendering: pixelated;
  image-rendering: crisp-edges;
}

.sk-canvas-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.sk-canvas-info {
  position: absolute;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(18,18,31,0.85);
  border: 1px solid #1e1e32;
  border-radius: 6px;
  padding: 4px 10px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #5555aa;
  display: flex;
  gap: 14px;
  pointer-events: none;
}

/* ── Right Panels ────────────────────────────────────────── */
.sk-panels {
  width: 220px;
  background: #12121f;
  border-left: 1px solid #1a1a2e;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  overflow: hidden;
}

.sk-panel {
  border-bottom: 1px solid #1a1a2e;
  flex-shrink: 0;
}

.sk-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  font-size: 11px;
  font-weight: 600;
  color: #5555aa;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
}

.sk-panel-header-add {
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  color: #5555aa;
  cursor: pointer;
  transition: all 0.12s;
  border: none;
  background: transparent;
}
.sk-panel-header-add:hover { background: #1e1e32; color: #e0e0f0; }

/* Palette panel */
.sk-palette-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 2px;
  padding: 8px 12px;
}

.sk-pal-swatch {
  aspect-ratio: 1;
  border-radius: 2px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: transform 0.1s;
}
.sk-pal-swatch:hover { transform: scale(1.2); z-index: 1; position: relative; }
.sk-pal-swatch.selected { border-color: #fff; }

.sk-color-hex {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px 10px;
}

.sk-hex-dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;
  border: 1px solid #3a3a5c;
}

.sk-hex-input {
  flex: 1;
  background: #0e0e1a;
  border: 1px solid #2a2a3e;
  border-radius: 5px;
  padding: 5px 8px;
  color: #e0e0f0;
  font-size: 12px;
  font-family: 'JetBrains Mono', monospace;
  outline: none;
}
.sk-hex-input:focus { border-color: #4f8ef7; }

/* Layer panel */
.sk-layers-list {
  overflow-y: auto;
  max-height: 200px;
  display: flex;
  flex-direction: column;
}

.sk-layer-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 7px 12px;
  cursor: pointer;
  transition: background 0.12s;
  border-left: 2px solid transparent;
}
.sk-layer-item:hover { background: #1a1a2e; }
.sk-layer-item.active { background: #1a1a2e; border-left-color: #4f8ef7; }

.sk-layer-eye {
  background: none;
  border: none;
  color: #5555aa;
  cursor: pointer;
  width: 16px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}
.sk-layer-eye:hover { color: #e0e0f0; }

.sk-layer-thumb {
  width: 28px;
  height: 28px;
  background: #0a0a14;
  border: 1px solid #2a2a3e;
  border-radius: 3px;
  flex-shrink: 0;
  image-rendering: pixelated;
}

.sk-layer-name {
  flex: 1;
  font-size: 12px;
  color: #c8c8e8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.sk-layer-opacity {
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #5555aa;
  flex-shrink: 0;
}

/* Blend mode */
.sk-blend-row {
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sk-blend-label {
  font-size: 11px;
  color: #5555aa;
  flex-shrink: 0;
}

.sk-blend-select {
  flex: 1;
  background: #0e0e1a;
  border: 1px solid #2a2a3e;
  border-radius: 5px;
  padding: 4px 8px;
  color: #c8c8e8;
  font-size: 12px;
  outline: none;
  font-family: 'Inter', sans-serif;
}

/* ── Bottom: Tabs + Timeline ─────────────────────────────── */
.sk-editor-bottom {
  flex-shrink: 0;
  background: #12121f;
  border-top: 1px solid #1a1a2e;
}

.sk-bottom-tabs {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #1a1a2e;
}

.sk-bottom-tab {
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 500;
  color: #5555aa;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.15s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: 'Inter', sans-serif;
  display: flex;
  align-items: center;
  gap: 5px;
}
.sk-bottom-tab:hover { color: #c8c8e8; }
.sk-bottom-tab.active { color: #4f8ef7; border-bottom-color: #4f8ef7; }

/* Timeline */
.sk-timeline {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  gap: 8px;
  overflow-x: auto;
}

.sk-timeline-controls {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}

.sk-tl-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: #8888aa;
  cursor: pointer;
  border-radius: 5px;
  transition: all 0.12s;
}
.sk-tl-btn:hover { background: #1e1e32; color: #e0e0f0; }
.sk-tl-btn.playing { color: #4f8ef7; }

.sk-frames-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.sk-frame-thumb {
  width: 48px;
  height: 48px;
  background: #0a0a14;
  border: 2px solid #1e1e32;
  border-radius: 5px;
  cursor: pointer;
  image-rendering: pixelated;
  flex-shrink: 0;
  overflow: hidden;
  position: relative;
  transition: border-color 0.12s;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sk-frame-thumb:hover { border-color: #3a3a5c; }
.sk-frame-thumb.active { border-color: #4f8ef7; }

.sk-frame-num {
  position: absolute;
  top: 2px;
  left: 3px;
  font-size: 9px;
  font-family: 'JetBrains Mono', monospace;
  color: #5555aa;
  line-height: 1;
}

.sk-frame-thumb canvas {
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

.sk-frame-add {
  width: 48px;
  height: 48px;
  background: none;
  border: 2px dashed #2a2a3e;
  border-radius: 5px;
  cursor: pointer;
  color: #5555aa;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.12s;
}
.sk-frame-add:hover { border-color: #4f8ef7; color: #4f8ef7; }

/* ── Onion skin toggle ───────────────────────────────────── */
.sk-onion-btn {
  padding: 4px 10px;
  border-radius: 5px;
  border: 1px solid #2a2a3e;
  background: none;
  color: #5555aa;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.12s;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.sk-onion-btn.on { border-color: #a78bfa44; background: #a78bfa22; color: #a78bfa; }

/* ── Save indicator ──────────────────────────────────────── */
.sk-save-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
  flex-shrink: 0;
}
.sk-save-dot.unsaved { background: #f59e0b; }

/* ── Presence badge ──────────────────────────────────────── */
.sk-presence {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-family: 'JetBrains Mono', monospace;
  color: #5555aa;
  padding: 0 8px;
}

.sk-presence-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #22c55e;
}

/* ── Scrollbar ───────────────────────────────────────────── */
::-webkit-scrollbar { width: 4px; height: 4px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #2a2a3e; border-radius: 2px; }
::-webkit-scrollbar-thumb:hover { background: #3a3a5c; }

/* ── Loading ─────────────────────────────────────────────── */
.sk-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100vh;
  flex-direction: column;
  gap: 16px;
  color: #5555aa;
  font-size: 13px;
}

.sk-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid #1e1e32;
  border-top-color: #4f8ef7;
  border-radius: 50%;
  animation: sk-spin 0.8s linear infinite;
}
@keyframes sk-spin { to { transform: rotate(360deg); } }

/* ── Empty state ─────────────────────────────────────────── */
.sk-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 64px 24px;
  color: #3a3a5c;
  text-align: center;
}

.sk-empty-icon {
  font-size: 48px;
  opacity: 0.4;
  filter: grayscale(1);
}

.sk-empty-text {
  font-size: 14px;
  color: #5555aa;
}

/* ── Color picker modal ──────────────────────────────────── */
.sk-color-picker-wrap {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sk-hue-bar {
  height: 10px;
  border-radius: 5px;
  background: linear-gradient(to right, #f00,#ff0,#0f0,#0ff,#00f,#f0f,#f00);
  cursor: pointer;
  position: relative;
}

.sk-sat-val-box {
  width: 100%;
  height: 120px;
  border-radius: 6px;
  position: relative;
  cursor: crosshair;
}

.sk-picker-thumb {
  position: absolute;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid #fff;
  transform: translate(-50%, -50%);
  pointer-events: none;
  box-shadow: 0 0 0 1px rgba(0,0,0,0.5);
}

/* ── FX panel ────────────────────────────────────────────── */
.sk-fx-panel {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sk-fx-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 12px;
  color: #8888aa;
}

.sk-fx-toggle {
  width: 32px;
  height: 16px;
  border-radius: 8px;
  background: #2a2a3e;
  cursor: pointer;
  position: relative;
  border: none;
  transition: background 0.2s;
}
.sk-fx-toggle.on { background: #4f8ef7; }
.sk-fx-toggle::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  transition: left 0.2s;
}
.sk-fx-toggle.on::after { left: 18px; }

/* ── Export panel ────────────────────────────────────────── */
.sk-export-panel {
  padding: 24px;
  max-width: 600px;
  margin: 40px auto;
}

.sk-export-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 24px;
}

.sk-export-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.sk-export-card {
  background: #12121f;
  border: 1px solid #1e1e32;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.15s;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: center;
}
.sk-export-card:hover { border-color: #4f8ef7; }
.sk-export-card-icon { font-size: 28px; }
.sk-export-card-label { font-size: 12px; font-weight: 600; color: #c8c8e8; }
.sk-export-card-desc { font-size: 11px; color: #5555aa; }

/* ── Responsive guards ───────────────────────────────────── */
@media (max-width: 768px) {
  .sk-panels { width: 180px; }
  .sk-toolbar { width: 44px; }
  .sk-tool-btn { width: 34px; height: 34px; }
}

/* ── Animation keyframes ─────────────────────────────────── */
@keyframes sk-pixel-scatter {
  from { opacity: 0; transform: scale(0.3); filter: blur(2px); }
  to   { opacity: 1; transform: scale(1);   filter: blur(0);   }
}
/* @arkzen:web:style:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Pencil, Eraser, Pipette, Move, Square, Circle, Minus,
  Type, Trash2, Plus, Eye, EyeOff, Lock, Unlock,
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Undo2, Redo2, Download, Share2, Settings, ArrowLeft,
  Layers, Palette, Sparkles, Film, Grid3x3, FlipHorizontal,
  FlipVertical, RotateCcw, Copy, Crosshair, Bucket,
  Save, RefreshCw, Check, X
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Pixel {
  [key: string]: string // "x,y" -> hex color
}

export interface Layer {
  id: string
  name: string
  visible: boolean
  locked: boolean
  opacity: number
  blendMode: string
  pixels: Pixel
}

export interface Frame {
  id: string
  duration: number // ms
  layers: Layer[]
}

export interface Project {
  id: number
  name: string
  width: number
  height: number
  thumbnail: string | null
  created_at: string
  updated_at: string
}

export type Tool =
  | 'pencil' | 'eraser' | 'fill' | 'eyedropper'
  | 'select' | 'move' | 'line' | 'rect' | 'circle' | 'text'

// ─── Constants ────────────────────────────────────────────────────────────────

export const PICO8_PALETTE = [
  '#000000','#1D2B53','#7E2553','#008751',
  '#AB5236','#5F574F','#C2C3C7','#FFF1E8',
  '#FF004D','#FFA300','#FFEC27','#00E436',
  '#29ADFF','#83769C','#FF77A8','#FFCCAA',
]

export const SWEETIE16_PALETTE = [
  '#1a1c2c','#5d275d','#b13e53','#ef7d57',
  '#ffcd75','#a7f070','#38b764','#257179',
  '#29366f','#3b5dc9','#41a6f6','#73eff7',
  '#f4f4f4','#94b0c2','#566c86','#333c57',
]

export const NES_PALETTE = [
  '#000000','#fcfcfc','#f8f8f8','#bcbcbc',
  '#7c7c7c','#a4e4fc','#3cbcfc','#0078f8',
  '#0000fc','#b8b8f8','#6888fc','#0058f8',
  '#00e8d8','#f8d878','#f83800','#e40058',
]

export const DEFAULT_PALETTES: Record<string, string[]> = {
  'Pico-8': PICO8_PALETTE,
  'Sweetie-16': SWEETIE16_PALETTE,
  'NES': NES_PALETTE,
}

// ─── Utils ────────────────────────────────────────────────────────────────────

export function createEmptyLayer(name: string, id?: string): Layer {
  return {
    id: id ?? `layer-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    name,
    visible: true,
    locked: false,
    opacity: 100,
    blendMode: 'normal',
    pixels: {},
  }
}

export function createEmptyFrame(width: number, height: number, id?: string): Frame {
  return {
    id: id ?? `frame-${Date.now()}-${Math.random().toString(36).slice(2,6)}`,
    duration: 100,
    layers: [
      createEmptyLayer('Color'),
      createEmptyLayer('Line'),
    ],
  }
}

export function floodFill(
  pixels: Pixel,
  x: number,
  y: number,
  targetColor: string | undefined,
  fillColor: string,
  width: number,
  height: number
): Pixel {
  if (targetColor === fillColor) return pixels
  const result = { ...pixels }
  const stack = [[x, y]]
  const key = (cx: number, cy: number) => `${cx},${cy}`
  const visited = new Set<string>()
  while (stack.length) {
    const [cx, cy] = stack.pop()!
    const k = key(cx, cy)
    if (visited.has(k)) continue
    if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue
    const cur = result[k]
    if (cur !== targetColor) continue
    visited.add(k)
    result[k] = fillColor
    stack.push([cx-1,cy],[cx+1,cy],[cx,cy-1],[cx,cy+1])
  }
  return result
}

export function drawLine(x0: number, y0: number, x1: number, y1: number): [number,number][] {
  const pts: [number,number][] = []
  let dx = Math.abs(x1-x0), dy = Math.abs(y1-y0)
  let sx = x0<x1?1:-1, sy = y0<y1?1:-1, err = dx-dy
  while(true) {
    pts.push([x0,y0])
    if(x0===x1&&y0===y1) break
    let e2=2*err
    if(e2>-dy){err-=dy;x0+=sx}
    if(e2<dx){err+=dx;y0+=sy}
  }
  return pts
}

// Render all visible layers to a flat RGBA Uint8ClampedArray
export function flattenFrame(frame: Frame, width: number, height: number): ImageData {
  const buf = new Uint8ClampedArray(width * height * 4)
  // Checkerboard
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y*width+x)*4
      const light = (x+y)%2===0
      buf[i]   = light ? 200 : 160
      buf[i+1] = light ? 200 : 160
      buf[i+2] = light ? 200 : 160
      buf[i+3] = 255
    }
  }
  for (const layer of [...frame.layers].reverse()) {
    if (!layer.visible) continue
    const alpha = layer.opacity / 100
    for (const [key, hex] of Object.entries(layer.pixels)) {
      const [x, y] = key.split(',').map(Number)
      if (x<0||y<0||x>=width||y>=height) continue
      const i=(y*width+x)*4
      const r=parseInt(hex.slice(1,3),16)
      const g=parseInt(hex.slice(3,5),16)
      const b=parseInt(hex.slice(5,7),16)
      buf[i]  =Math.round(buf[i]*(1-alpha)+r*alpha)
      buf[i+1]=Math.round(buf[i+1]*(1-alpha)+g*alpha)
      buf[i+2]=Math.round(buf[i+2]*(1-alpha)+b*alpha)
      buf[i+3]=255
    }
  }
  return new ImageData(buf, width, height)
}

// Render a frame to a small canvas for thumbnails
export function renderFrameThumb(frame: Frame, width: number, height: number, size: number): string {
  const c = document.createElement('canvas')
  c.width = width; c.height = height
  const ctx = c.getContext('2d')!
  const id = flattenFrame(frame, width, height)
  ctx.putImageData(id, 0, 0)
  const out = document.createElement('canvas')
  out.width = size; out.height = size
  const oc = out.getContext('2d')!
  oc.imageSmoothingEnabled = false
  oc.drawImage(c, 0, 0, width, height, 0, 0, size, size)
  return out.toDataURL('image/png')
}

// arkzen fetch helper
export async function skFetch(url: string, options?: RequestInit) {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const token = typeof window !== 'undefined' ? localStorage.getItem('shikaku_token') : null
  const res = await fetch(`${base}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers || {}),
    },
  })
  if (!res.ok) throw new Error(await res.text())
  return res.json()
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:components:editor */

'use client'

import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react'
import {
  Pencil, Eraser, Bucket, Pipette, Move, Square, Minus,
  Type, Trash2, Plus, Eye, EyeOff, Lock,
  ChevronDown, Play, Pause, SkipBack, SkipForward,
  Undo2, Redo2, Download, Share2, ArrowLeft,
  Layers, Palette, Sparkles, Film, Grid3x3,
  FlipHorizontal, FlipVertical, Save, Check, RotateCcw
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── Canvas Engine Component ───────────────────────────────────────────────────

interface CanvasEngineProps {
  frames: Frame[]
  currentFrameIdx: number
  currentLayerIdx: number
  tool: Tool
  primaryColor: string
  secondaryColor: string
  zoom: number
  pan: { x: number; y: number }
  onPanChange: (p: { x: number; y: number }) => void
  onZoomChange: (z: number) => void
  onPixelChange: (frameIdx: number, layerIdx: number, pixels: Pixel) => void
  onColorPick: (color: string) => void
  onZoomInfo: (info: { x: number; y: number; zoom: number }) => void
  width: number
  height: number
  showGrid: boolean
  onionSkin: boolean
}

export const CanvasEngine: React.FC<CanvasEngineProps> = ({
  frames, currentFrameIdx, currentLayerIdx,
  tool, primaryColor, zoom, pan,
  onPanChange, onZoomChange, onPixelChange, onColorPick, onZoomInfo,
  width, height, showGrid, onionSkin,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const drawing = useRef(false)
  const lastPos = useRef<[number,number] | null>(null)
  const lineStart = useRef<[number,number] | null>(null)
  const spaceDown = useRef(false)
  const panStart = useRef<{ mx: number; my: number; px: number; py: number } | null>(null)
  const lastTouches = useRef<TouchList | null>(null)
  const lastPinchDist = useRef<number | null>(null)

  const pixelAt = useCallback((clientX: number, clientY: number): [number, number] | null => {
    const c = canvasRef.current
    if (!c) return null
    const rect = c.getBoundingClientRect()
    const px = Math.floor((clientX - rect.left) / zoom)
    const py = Math.floor((clientY - rect.top) / zoom)
    if (px < 0 || py < 0 || px >= width || py >= height) return null
    return [px, py]
  }, [zoom, width, height])

  // ── Render ─────────────────────────────────────────────────────────────────
  useLayoutEffect(() => {
    const c = canvasRef.current
    if (!c) return
    c.width = width
    c.height = height
    const ctx = c.getContext('2d')!
    ctx.imageSmoothingEnabled = false

    // Onion skin: previous frame ghost
    if (onionSkin && currentFrameIdx > 0) {
      const prev = frames[currentFrameIdx - 1]
      const id = flattenFrame(prev, width, height)
      const tmp = document.createElement('canvas')
      tmp.width = width; tmp.height = height
      tmp.getContext('2d')!.putImageData(id, 0, 0)
      ctx.globalAlpha = 0.25
      ctx.drawImage(tmp, 0, 0)
      ctx.globalAlpha = 1
    }

    const frame = frames[currentFrameIdx]
    if (frame) {
      const id = flattenFrame(frame, width, height)
      ctx.putImageData(id, 0, 0)
    }

    // Grid
    if (showGrid && zoom >= 4) {
      ctx.save()
      ctx.strokeStyle = 'rgba(255,255,255,0.08)'
      ctx.lineWidth = 0.5 / zoom
      for (let x = 0; x <= width; x++) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
      }
      for (let y = 0; y <= height; y++) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
      }
      ctx.restore()
    }
  }, [frames, currentFrameIdx, zoom, showGrid, onionSkin, width, height])

  // ── Draw ───────────────────────────────────────────────────────────────────
  const applyTool = useCallback((px: number, py: number, endPx?: number, endPy?: number) => {
    const frame = frames[currentFrameIdx]
    if (!frame) return
    const layer = frame.layers[currentLayerIdx]
    if (!layer || layer.locked) return
    const key = `${px},${py}`

    let newPixels = { ...layer.pixels }

    if (tool === 'pencil') {
      if (endPx !== undefined && endPy !== undefined) {
        drawLine(px, py, endPx, endPy).forEach(([x,y]) => {
          newPixels[`${x},${y}`] = primaryColor
        })
      } else {
        newPixels[key] = primaryColor
      }
    } else if (tool === 'eraser') {
      if (endPx !== undefined && endPy !== undefined) {
        drawLine(px, py, endPx, endPy).forEach(([x,y]) => {
          delete newPixels[`${x},${y}`]
        })
      } else {
        delete newPixels[key]
      }
    } else if (tool === 'fill') {
      const target = layer.pixels[key]
      newPixels = floodFill(newPixels, px, py, target, primaryColor, width, height)
    } else if (tool === 'eyedropper') {
      const color = layer.pixels[key] || '#00000000'
      onColorPick(color.startsWith('#') ? color : primaryColor)
      return
    } else if (tool === 'line') {
      if (lineStart.current) {
        newPixels = { ...layer.pixels }
        drawLine(lineStart.current[0], lineStart.current[1], px, py).forEach(([x,y]) => {
          newPixels[`${x},${y}`] = primaryColor
        })
      }
    } else if (tool === 'rect') {
      if (lineStart.current) {
        newPixels = { ...layer.pixels }
        const [sx,sy] = lineStart.current
        for (let x = Math.min(sx,px); x <= Math.max(sx,px); x++) {
          newPixels[`${x},${sy}`] = primaryColor
          newPixels[`${x},${py}`] = primaryColor
        }
        for (let y = Math.min(sy,py); y <= Math.max(sy,py); y++) {
          newPixels[`${sx},${y}`] = primaryColor
          newPixels[`${px},${y}`] = primaryColor
        }
      }
    }

    onPixelChange(currentFrameIdx, currentLayerIdx, newPixels)
  }, [frames, currentFrameIdx, currentLayerIdx, tool, primaryColor, width, height, onColorPick, onPixelChange])

  // Mouse events
  const onMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || spaceDown.current) {
      panStart.current = { mx: e.clientX, my: e.clientY, px: pan.x, py: pan.y }
      return
    }
    drawing.current = true
    const pos = pixelAt(e.clientX, e.clientY)
    if (!pos) return
    lastPos.current = pos
    if (tool === 'line' || tool === 'rect') {
      lineStart.current = pos
    }
    applyTool(pos[0], pos[1])
  }, [pan, pixelAt, tool, applyTool])

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    if (panStart.current) {
      const dx = e.clientX - panStart.current.mx
      const dy = e.clientY - panStart.current.my
      onPanChange({ x: panStart.current.px + dx, y: panStart.current.py + dy })
      return
    }
    const pos = pixelAt(e.clientX, e.clientY)
    if (pos) {
      onZoomInfo({ x: pos[0], y: pos[1], zoom })
    }
    if (!drawing.current || !pos) return
    if (tool === 'pencil' || tool === 'eraser') {
      if (lastPos.current) {
        applyTool(lastPos.current[0], lastPos.current[1], pos[0], pos[1])
      }
    } else if (tool === 'line' || tool === 'rect') {
      applyTool(pos[0], pos[1])
    }
    lastPos.current = pos
  }, [pixelAt, drawing, pan, zoom, tool, applyTool, onPanChange, onZoomInfo])

  const onMouseUp = useCallback((e: React.MouseEvent) => {
    panStart.current = null
    drawing.current = false
    lineStart.current = null
    lastPos.current = null
  }, [])

  const onWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()
    const delta = e.deltaY < 0 ? 1.2 : 0.85
    const next = Math.min(64, Math.max(1, zoom * delta))
    onZoomChange(next)
  }, [zoom, onZoomChange])

  // Touch (pinch-to-zoom + draw)
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    lastTouches.current = e.touches
    if (e.touches.length === 1) {
      drawing.current = true
      const t = e.touches[0]
      const pos = pixelAt(t.clientX, t.clientY)
      if (pos) { lastPos.current = pos; applyTool(pos[0], pos[1]) }
    } else if (e.touches.length === 2) {
      drawing.current = false
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      lastPinchDist.current = Math.hypot(dx, dy)
    }
  }, [pixelAt, applyTool])

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    if (e.touches.length === 2 && lastPinchDist.current) {
      const dx = e.touches[0].clientX - e.touches[1].clientX
      const dy = e.touches[0].clientY - e.touches[1].clientY
      const dist = Math.hypot(dx, dy)
      const ratio = dist / lastPinchDist.current
      const next = Math.min(64, Math.max(1, zoom * ratio))
      onZoomChange(next)
      lastPinchDist.current = dist
    } else if (e.touches.length === 1 && drawing.current) {
      const t = e.touches[0]
      const pos = pixelAt(t.clientX, t.clientY)
      if (!pos) return
      if (lastPos.current && (tool === 'pencil' || tool === 'eraser')) {
        applyTool(lastPos.current[0], lastPos.current[1], pos[0], pos[1])
      } else {
        applyTool(pos[0], pos[1])
      }
      lastPos.current = pos
    }
  }, [zoom, pixelAt, tool, applyTool, onZoomChange])

  const onTouchEnd = useCallback(() => {
    drawing.current = false
    lastPos.current = null
    lastPinchDist.current = null
  }, [])

  return (
    <div
      ref={containerRef}
      className="sk-canvas-area"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
      onWheel={onWheel}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ cursor: tool === 'move' ? 'grab' : tool === 'eyedropper' ? 'crosshair' : 'crosshair' }}
    >
      <div
        className="sk-canvas-wrap"
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px)`,
          animation: 'sk-pixel-scatter 0.4s ease-out',
        }}
      >
        <canvas
          ref={canvasRef}
          className="sk-canvas-main"
          style={{
            width: width * zoom,
            height: height * zoom,
            imageRendering: 'pixelated',
          }}
        />
      </div>
    </div>
  )
}

// ─── Layer Panel ───────────────────────────────────────────────────────────────

interface LayerPanelProps {
  layers: Layer[]
  currentIdx: number
  onSelect: (idx: number) => void
  onToggleVisible: (idx: number) => void
  onToggleLock: (idx: number) => void
  onAdd: () => void
  onDelete: (idx: number) => void
  onDuplicate: (idx: number) => void
  onOpacityChange: (idx: number, v: number) => void
  onBlendChange: (idx: number, mode: string) => void
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers, currentIdx, onSelect, onToggleVisible, onToggleLock,
  onAdd, onDelete, onDuplicate, onOpacityChange, onBlendChange,
}) => {
  return (
    <div className="sk-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div className="sk-panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Layers size={11} /> Layers
        </span>
        <button className="sk-panel-header-add" onClick={onAdd} title="Add layer">
          <Plus size={12} />
        </button>
      </div>
      <div className="sk-layers-list">
        {layers.map((layer, idx) => (
          <div
            key={layer.id}
            className={`sk-layer-item ${idx === currentIdx ? 'active' : ''}`}
            onClick={() => onSelect(idx)}
          >
            <button
              className="sk-layer-eye"
              onClick={e => { e.stopPropagation(); onToggleVisible(idx) }}
            >
              {layer.visible ? <Eye size={12} /> : <EyeOff size={12} />}
            </button>
            <div className="sk-layer-thumb" />
            <span className="sk-layer-name">{layer.name}</span>
            <span className="sk-layer-opacity">{layer.opacity}%</span>
          </div>
        ))}
      </div>
      {layers[currentIdx] && (
        <div className="sk-blend-row">
          <span className="sk-blend-label">Blend</span>
          <select
            className="sk-blend-select"
            value={layers[currentIdx].blendMode}
            onChange={e => onBlendChange(currentIdx, e.target.value)}
          >
            {['normal','multiply','screen','overlay','add','difference'].map(m => (
              <option key={m} value={m}>{m.charAt(0).toUpperCase()+m.slice(1)}</option>
            ))}
          </select>
        </div>
      )}
    </div>
  )
}

// ─── Palette Panel ─────────────────────────────────────────────────────────────

interface PalettePanelProps {
  palette: string[]
  primaryColor: string
  secondaryColor: string
  onSelectColor: (hex: string) => void
  onAddColor: () => void
  activePaletteName: string
  onChangePalette: (name: string) => void
}

export const PalettePanel: React.FC<PalettePanelProps> = ({
  palette, primaryColor, onSelectColor, onAddColor, activePaletteName, onChangePalette,
}) => {
  const [hexEdit, setHexEdit] = useState(primaryColor)

  useEffect(() => { setHexEdit(primaryColor) }, [primaryColor])

  return (
    <div className="sk-panel">
      <div className="sk-panel-header">
        <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Palette size={11} /> Palette
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <select
            style={{ background: '#0e0e1a', border: '1px solid #1e1e32', borderRadius: 4, color: '#5555aa', fontSize: 10, padding: '2px 4px' }}
            value={activePaletteName}
            onChange={e => onChangePalette(e.target.value)}
          >
            {Object.keys(DEFAULT_PALETTES).map(n => <option key={n}>{n}</option>)}
          </select>
          <button className="sk-panel-header-add" onClick={onAddColor} title="Add color">
            <Plus size={12} />
          </button>
        </div>
      </div>
      <div className="sk-palette-grid">
        {palette.map((hex, i) => (
          <div
            key={i}
            className={`sk-pal-swatch ${hex === primaryColor ? 'selected' : ''}`}
            style={{ background: hex }}
            onClick={() => onSelectColor(hex)}
            title={hex}
          />
        ))}
      </div>
      <div className="sk-color-hex">
        <div className="sk-hex-dot" style={{ background: primaryColor }} />
        <input
          className="sk-hex-input"
          value={hexEdit}
          onChange={e => setHexEdit(e.target.value)}
          onBlur={() => {
            const clean = hexEdit.startsWith('#') ? hexEdit : `#${hexEdit}`
            if (/^#[0-9a-fA-F]{6}$/.test(clean)) onSelectColor(clean)
          }}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              const clean = hexEdit.startsWith('#') ? hexEdit : `#${hexEdit}`
              if (/^#[0-9a-fA-F]{6}$/.test(clean)) onSelectColor(clean)
            }
          }}
        />
        <Pipette size={12} style={{ color: '#5555aa', cursor: 'pointer' }} />
      </div>
    </div>
  )
}

// ─── Tool definitions ──────────────────────────────────────────────────────────

export const TOOLS: { id: Tool; icon: React.ReactNode; label: string }[] = [
  { id: 'pencil',     icon: <Pencil size={15} />,       label: 'Pencil (B)' },
  { id: 'eraser',     icon: <Eraser size={15} />,       label: 'Eraser (E)' },
  { id: 'fill',       icon: <Bucket size={15} />,       label: 'Fill (G)' },
  { id: 'eyedropper', icon: <Pipette size={15} />,      label: 'Eyedropper (I)' },
  { id: 'move',       icon: <Move size={15} />,         label: 'Move (V)' },
  { id: 'line',       icon: <Minus size={15} />,        label: 'Line (L)' },
  { id: 'rect',       icon: <Square size={15} />,       label: 'Rectangle (U)' },
  { id: 'text',       icon: <Type size={15} />,         label: 'Text (T)' },
]

/* @arkzen:web:components:editor:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:+auth */

const DashboardPage = () => {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('Untitled')
  const [newSize, setNewSize] = useState(32)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    skFetch('/api/shikaku/projects')
      .then(d => setProjects(d.data ?? d))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const p = await skFetch('/api/shikaku/projects', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), width: newSize, height: newSize }),
      })
      router.push(`/shikaku/editor/${p.data?.id ?? p.id}`)
    } catch (e: any) {
      setError(e.message)
      setCreating(false)
    }
  }

  const handleDelete = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm('Delete this project?')) return
    try {
      await skFetch(`/api/shikaku/projects/${id}`, { method: 'DELETE' })
      setProjects(ps => ps.filter(p => p.id !== id))
    } catch {}
  }

  if (loading) {
    return (
      <div className="sk-loading">
        <div className="sk-spinner" />
        <span>Loading projects...</span>
      </div>
    )
  }

  return (
    <div className="sk-dash">
      <header className="sk-dash-header">
        <div className="sk-logo">
          <div className="sk-logo-sq">🟦</div>
          Shikaku
        </div>
        <div className="sk-dash-actions">
          <button className="sk-btn sk-btn-primary" onClick={() => setShowNew(true)}>
            <Plus size={14} /> New Project
          </button>
        </div>
      </header>

      <div className="sk-dash-body">
        {error && (
          <div style={{ background: '#f8717122', border: '1px solid #f8717144', borderRadius: 6, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#f87171' }}>
            {error}
          </div>
        )}

        <div className="sk-dash-title">Your Projects — {projects.length}</div>

        {projects.length === 0 ? (
          <div className="sk-empty">
            <div className="sk-empty-icon">🟦</div>
            <div className="sk-empty-text">No projects yet. Create your first pixel art!</div>
            <button className="sk-btn sk-btn-primary" onClick={() => setShowNew(true)}>
              <Plus size={14} /> New Project
            </button>
          </div>
        ) : (
          <div className="sk-grid">
            {projects.map(project => (
              <div
                key={project.id}
                className="sk-project-card"
                onClick={() => router.push(`/shikaku/editor/${project.id}`)}
              >
                <div className="sk-project-thumb">
                  {project.thumbnail ? (
                    <img src={project.thumbnail} alt={project.name} />
                  ) : (
                    <div className="sk-project-thumb-empty">
                      {Array.from({ length: 64 }).map((_, i) => <span key={i} />)}
                    </div>
                  )}
                </div>
                <div className="sk-project-info">
                  <div className="sk-project-name">{project.name}</div>
                  <div className="sk-project-meta">{project.width}×{project.height}px</div>
                </div>
                <div className="sk-project-actions">
                  <button
                    className="sk-btn sk-btn-ghost sk-btn-sm"
                    style={{ flex: 1 }}
                    onClick={e => { e.stopPropagation(); router.push(`/shikaku/editor/${project.id}`) }}
                  >
                    Open
                  </button>
                  <button
                    className="sk-btn sk-btn-danger sk-btn-sm"
                    onClick={e => handleDelete(project.id, e)}
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showNew && (
        <div className="sk-modal-overlay" onClick={() => setShowNew(false)}>
          <div className="sk-modal" onClick={e => e.stopPropagation()}>
            <div className="sk-modal-title">New Project</div>

            <div className="sk-field">
              <label className="sk-label">Project Name</label>
              <input
                className="sk-input"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                placeholder="Untitled"
                autoFocus
              />
            </div>

            <div className="sk-field">
              <label className="sk-label">Canvas Size</label>
              <div className="sk-size-grid">
                {[8,16,32,64,128].map(s => (
                  <button
                    key={s}
                    className={`sk-size-btn ${newSize === s ? 'active' : ''}`}
                    onClick={() => setNewSize(s)}
                  >
                    {s}×{s}
                  </button>
                ))}
              </div>
            </div>

            <div className="sk-modal-footer">
              <button className="sk-btn sk-btn-ghost" onClick={() => setShowNew(false)}>
                Cancel
              </button>
              <button
                className="sk-btn sk-btn-primary"
                onClick={handleCreate}
                disabled={creating}
              >
                {creating ? 'Creating...' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:editor */
/* @arkzen:web:page:layout:+auth */

const EditorPage = () => {
  const router = useRouter()

  // ── State ──────────────────────────────────────────────────────────────────
  const [project, setProject] = useState<Project | null>(null)
  const [frames, setFrames] = useState<Frame[]>([])
  const [currentFrameIdx, setCurrentFrameIdx] = useState(0)
  const [currentLayerIdx, setCurrentLayerIdx] = useState(0)
  const [tool, setTool] = useState<Tool>('pencil')
  const [primaryColor, setPrimaryColor] = useState('#4f8ef7')
  const [secondaryColor, setSecondaryColor] = useState('#000000')
  const [zoom, setZoom] = useState(8)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [palette, setPalette] = useState<string[]>(PICO8_PALETTE)
  const [activePalette, setActivePalette] = useState('Pico-8')
  const [showGrid, setShowGrid] = useState(true)
  const [onionSkin, setOnionSkin] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [activeTab, setActiveTab] = useState<'draw'|'animate'|'tiles'|'fx'|'preview'>('draw')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(true)
  const [undoStack, setUndoStack] = useState<Frame[][]>([])
  const [redoStack, setRedoStack] = useState<Frame[][]>([])
  const [canvasInfo, setCanvasInfo] = useState({ x: 0, y: 0, zoom: 8 })
  const playTimer = useRef<ReturnType<typeof setInterval> | null>(null)
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── Get project id from URL ────────────────────────────────────────────────
  const projectId = typeof window !== 'undefined'
    ? window.location.pathname.split('/').pop()
    : null

  // ── Load project ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!projectId) return
    skFetch(`/api/shikaku/projects/${projectId}`)
      .then(d => {
        const p = d.data ?? d
        setProject(p)
        return skFetch(`/api/shikaku/projects/${projectId}/latest`)
      })
      .then(s => {
        if (s?.data?.frames_json) {
          try {
            const parsed = JSON.parse(s.data.frames_json)
            setFrames(parsed)
          } catch {
            initBlankCanvas()
          }
        } else {
          initBlankCanvas()
        }
      })
      .catch(() => initBlankCanvas())
  }, [projectId])

  const initBlankCanvas = () => {
    setFrames([createEmptyFrame(32, 32)])
  }

  // ── Auto-save ──────────────────────────────────────────────────────────────
  useEffect(() => {
    setSaved(false)
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current)
    autoSaveTimer.current = setTimeout(() => { handleSave() }, 3000)
    return () => { if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current) }
  }, [frames])

  const handleSave = async () => {
    if (!projectId || !project) return
    setSaving(true)
    try {
      const thumb = frames[0] && project
        ? renderFrameThumb(frames[0], project.width, project.height, 128)
        : null
      await skFetch(`/api/shikaku/projects/${projectId}/save`, {
        method: 'POST',
        body: JSON.stringify({ frames_json: JSON.stringify(frames) }),
      })
      if (thumb) {
        await skFetch(`/api/shikaku/projects/${projectId}`, {
          method: 'PUT',
          body: JSON.stringify({ thumbnail: thumb }),
        })
      }
      setSaved(true)
    } catch {}
    setSaving(false)
  }

  // ── Undo/Redo ──────────────────────────────────────────────────────────────
  const pushUndo = (prev: Frame[]) => {
    setUndoStack(s => [...s.slice(-40), prev])
    setRedoStack([])
  }

  const undo = () => {
    if (!undoStack.length) return
    const prev = undoStack[undoStack.length - 1]
    setRedoStack(s => [frames, ...s])
    setFrames(prev)
    setUndoStack(s => s.slice(0, -1))
  }

  const redo = () => {
    if (!redoStack.length) return
    const next = redoStack[0]
    setUndoStack(s => [...s, frames])
    setFrames(next)
    setRedoStack(s => s.slice(1))
  }

  // ── Pixel change ───────────────────────────────────────────────────────────
  const onPixelChange = useCallback((frameIdx: number, layerIdx: number, pixels: Pixel) => {
    setFrames(prev => {
      pushUndo(prev)
      const next = prev.map((f, fi) => fi !== frameIdx ? f : {
        ...f,
        layers: f.layers.map((l, li) => li !== layerIdx ? l : { ...l, pixels }),
      })
      return next
    })
  }, [])

  // ── Layer ops ──────────────────────────────────────────────────────────────
  const addLayer = () => {
    setFrames(prev => {
      pushUndo(prev)
      return prev.map((f, fi) => fi !== currentFrameIdx ? f : {
        ...f,
        layers: [...f.layers, createEmptyLayer(`Layer ${f.layers.length + 1}`)],
      })
    })
  }

  const deleteLayer = (idx: number) => {
    const frame = frames[currentFrameIdx]
    if (frame.layers.length <= 1) return
    setFrames(prev => {
      pushUndo(prev)
      return prev.map((f, fi) => fi !== currentFrameIdx ? f : {
        ...f,
        layers: f.layers.filter((_, li) => li !== idx),
      })
    })
    if (currentLayerIdx >= idx && currentLayerIdx > 0) setCurrentLayerIdx(i => i - 1)
  }

  const toggleVisible = (idx: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, visible: !l.visible }),
    }))
  }

  const toggleLock = (idx: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, locked: !l.locked }),
    }))
  }

  const setBlendMode = (idx: number, mode: string) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, blendMode: mode }),
    }))
  }

  const setOpacity = (idx: number, v: number) => {
    setFrames(prev => prev.map((f, fi) => fi !== currentFrameIdx ? f : {
      ...f,
      layers: f.layers.map((l, li) => li !== idx ? l : { ...l, opacity: v }),
    }))
  }

  // ── Frame ops ──────────────────────────────────────────────────────────────
  const addFrame = () => {
    const w = project?.width ?? 32
    const h = project?.height ?? 32
    setFrames(prev => {
      pushUndo(prev)
      return [...prev, createEmptyFrame(w, h)]
    })
    setCurrentFrameIdx(frames.length)
  }

  const deleteFrame = (idx: number) => {
    if (frames.length <= 1) return
    setFrames(prev => {
      pushUndo(prev)
      return prev.filter((_, i) => i !== idx)
    })
    if (currentFrameIdx >= idx && currentFrameIdx > 0) setCurrentFrameIdx(i => i - 1)
  }

  // ── Playback ───────────────────────────────────────────────────────────────
  useEffect(() => {
    if (isPlaying) {
      playTimer.current = setInterval(() => {
        setCurrentFrameIdx(i => (i + 1) % frames.length)
      }, frames[currentFrameIdx]?.duration ?? 100)
    } else {
      if (playTimer.current) clearInterval(playTimer.current)
    }
    return () => { if (playTimer.current) clearInterval(playTimer.current) }
  }, [isPlaying, frames.length, currentFrameIdx])

  // ── Palette ops ────────────────────────────────────────────────────────────
  const onChangePalette = (name: string) => {
    setActivePalette(name)
    setPalette(DEFAULT_PALETTES[name] ?? PICO8_PALETTE)
  }

  // ── Keyboard shortcuts ─────────────────────────────────────────────────────
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.metaKey||e.ctrlKey) && e.key==='z') { e.preventDefault(); if(e.shiftKey) redo(); else undo() }
      if (!e.metaKey && !e.ctrlKey) {
        if (e.key==='b') setTool('pencil')
        if (e.key==='e') setTool('eraser')
        if (e.key==='g') setTool('fill')
        if (e.key==='i') setTool('eyedropper')
        if (e.key==='v') setTool('move')
        if (e.key==='l') setTool('line')
        if (e.key==='u') setTool('rect')
        if (e.key==='t') setTool('text')
        if (e.key==='[') setZoom(z => Math.max(1, Math.round(z / 1.5)))
        if (e.key===']') setZoom(z => Math.min(64, Math.round(z * 1.5)))
      }
    }
    window.addEventListener('keydown', down)
    return () => window.removeEventListener('keydown', down)
  }, [undoStack, redoStack])

  // ── Export ─────────────────────────────────────────────────────────────────
  const exportPng = () => {
    const w = project?.width ?? 32
    const h = project?.height ?? 32
    const frame = frames[currentFrameIdx]
    if (!frame) return
    const c = document.createElement('canvas')
    c.width = w; c.height = h
    const ctx = c.getContext('2d')!
    ctx.putImageData(flattenFrame(frame, w, h), 0, 0)
    const a = document.createElement('a')
    a.href = c.toDataURL('image/png')
    a.download = `${project?.name ?? 'shikaku'}.png`
    a.click()
  }

  const currentFrame = frames[currentFrameIdx]

  if (!project) {
    return <div className="sk-loading"><div className="sk-spinner" /></div>
  }

  return (
    <div className="sk-editor">
      {/* ── Topbar ── */}
      <div className="sk-editor-topbar">
        <div className="sk-editor-topbar-left">
          <button className="sk-topbar-btn" onClick={() => router.push('/shikaku')} title="Back">
            <ArrowLeft size={15} />
          </button>
          <div className="sk-save-dot" style={{ background: saved ? '#22c55e' : '#f59e0b' }} title={saved ? 'Saved' : 'Unsaved changes'} />
        </div>

        <div className="sk-editor-topbar-center">
          <button className="sk-topbar-btn" onClick={undo} disabled={!undoStack.length} title="Undo (Ctrl+Z)">
            <Undo2 size={14} />
          </button>
          <button className="sk-topbar-btn" onClick={redo} disabled={!redoStack.length} title="Redo (Ctrl+Shift+Z)">
            <Redo2 size={14} />
          </button>
          <input
            className="sk-project-title-input"
            value={project.name}
            onChange={e => setProject(p => p ? { ...p, name: e.target.value } : p)}
            onBlur={async e => {
              try {
                await skFetch(`/api/shikaku/projects/${projectId}`, {
                  method: 'PUT',
                  body: JSON.stringify({ name: e.target.value }),
                })
              } catch {}
            }}
          />
        </div>

        <div className="sk-editor-topbar-right">
          <button className="sk-topbar-btn" onClick={() => setShowGrid(g => !g)} title="Toggle grid">
            <Grid3x3 size={14} style={{ color: showGrid ? '#4f8ef7' : undefined }} />
          </button>
          <button className="sk-topbar-btn" onClick={exportPng} title="Export PNG">
            <Download size={14} />
          </button>
          <button
            className="sk-topbar-btn"
            onClick={handleSave}
            title="Save"
            style={{ color: saving ? '#4f8ef7' : undefined }}
          >
            {saving ? <RefreshCw size={14} style={{ animation: 'sk-spin 1s linear infinite' }} /> : <Save size={14} />}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="sk-editor-body">
        {/* ── Left: Toolbar ── */}
        <div className="sk-toolbar">
          {TOOLS.map((t, i) => (
            <React.Fragment key={t.id}>
              {i === 4 && <div className="sk-tool-sep" />}
              <button
                className={`sk-tool-btn ${tool === t.id ? 'active' : ''}`}
                onClick={() => setTool(t.id)}
                title={t.label}
              >
                {t.icon}
              </button>
            </React.Fragment>
          ))}

          <div className="sk-tool-sep" />

          {/* Color swatches */}
          <div className="sk-color-swatches">
            <div
              className="sk-swatch-secondary"
              style={{ background: secondaryColor }}
              onClick={() => { const tmp = primaryColor; setPrimaryColor(secondaryColor); setSecondaryColor(tmp) }}
              title="Secondary color (click to swap)"
            />
            <div
              className="sk-swatch-primary"
              style={{ background: primaryColor }}
              title="Primary color"
            />
          </div>
        </div>

        {/* ── Center: Canvas ── */}
        {currentFrame && (
          <CanvasEngine
            frames={frames}
            currentFrameIdx={currentFrameIdx}
            currentLayerIdx={currentLayerIdx}
            tool={tool}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            zoom={zoom}
            pan={pan}
            onPanChange={setPan}
            onZoomChange={setZoom}
            onPixelChange={onPixelChange}
            onColorPick={setPrimaryColor}
            onZoomInfo={setCanvasInfo}
            width={project.width}
            height={project.height}
            showGrid={showGrid}
            onionSkin={onionSkin}
          />
        )}

        {/* ── Info bar overlay ── */}
        <div className="sk-canvas-info" style={{ position: 'absolute', bottom: 130, left: '50%', transform: 'translateX(-50%)', zIndex: 5 }}>
          <span>{canvasInfo.x},{canvasInfo.y}</span>
          <span>{project.width}×{project.height}</span>
          <span>{Math.round(zoom)}×</span>
        </div>

        {/* ── Right: Panels ── */}
        <div className="sk-panels">
          <PalettePanel
            palette={palette}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onSelectColor={setPrimaryColor}
            onAddColor={() => setPalette(p => [...p, primaryColor])}
            activePaletteName={activePalette}
            onChangePalette={onChangePalette}
          />
          {currentFrame && (
            <LayerPanel
              layers={currentFrame.layers}
              currentIdx={currentLayerIdx}
              onSelect={setCurrentLayerIdx}
              onToggleVisible={toggleVisible}
              onToggleLock={toggleLock}
              onAdd={addLayer}
              onDelete={deleteLayer}
              onDuplicate={idx => {}}
              onOpacityChange={setOpacity}
              onBlendChange={setBlendMode}
            />
          )}
        </div>
      </div>

      {/* ── Bottom: Tabs + Timeline ── */}
      <div className="sk-editor-bottom">
        <div className="sk-bottom-tabs">
          {(['draw','animate','tiles','fx','preview'] as const).map(tab => (
            <button
              key={tab}
              className={`sk-bottom-tab ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'draw' && <Pencil size={11} />}
              {tab === 'animate' && <Film size={11} />}
              {tab === 'tiles' && <Grid3x3 size={11} />}
              {tab === 'fx' && <Sparkles size={11} />}
              {tab === 'preview' && <Play size={11} />}
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="sk-timeline">
          <div className="sk-timeline-controls">
            <button className="sk-tl-btn" onClick={() => setCurrentFrameIdx(0)} title="First frame">
              <SkipBack size={13} />
            </button>
            <button
              className={`sk-tl-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(p => !p)}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            </button>
            <button className="sk-tl-btn" onClick={() => setCurrentFrameIdx(frames.length - 1)} title="Last frame">
              <SkipForward size={13} />
            </button>
          </div>

          <button
            className={`sk-onion-btn ${onionSkin ? 'on' : ''}`}
            onClick={() => setOnionSkin(o => !o)}
            title="Onion skinning"
          >
            👁 Onion
          </button>

          <div className="sk-frames-row">
            {frames.map((frame, idx) => (
              <div
                key={frame.id}
                className={`sk-frame-thumb ${idx === currentFrameIdx ? 'active' : ''}`}
                onClick={() => setCurrentFrameIdx(idx)}
                onContextMenu={e => { e.preventDefault(); deleteFrame(idx) }}
                title={`Frame ${idx + 1} — right-click to delete`}
              >
                <span className="sk-frame-num">{idx + 1}</span>
              </div>
            ))}
            <button className="sk-frame-add" onClick={addFrame} title="Add frame">
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* @arkzen:web:page:editor:end */

/* @arkzen:web:animation */
// GSAP — pixel scatter entrance on editor canvas load
import { gsap } from 'gsap'

if (typeof window !== 'undefined') {
  // Animate tool buttons into view on mount
  document.addEventListener('DOMContentLoaded', () => {
    const tools = document.querySelectorAll('.sk-tool-btn')
    if (tools.length) {
      gsap.fromTo(tools,
        { opacity: 0, x: -12 },
        { opacity: 1, x: 0, duration: 0.3, stagger: 0.03, ease: 'power2.out' }
      )
    }

    const panels = document.querySelectorAll('.sk-panel')
    if (panels.length) {
      gsap.fromTo(panels,
        { opacity: 0, x: 16 },
        { opacity: 1, x: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      )
    }

    const cards = document.querySelectorAll('.sk-project-card')
    if (cards.length) {
      gsap.fromTo(cards,
        { opacity: 0, y: 20, scale: 0.95 },
        { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.06, ease: 'back.out(1.4)' }
      )
    }
  })
}
/* @arkzen:web:animation:end */ 