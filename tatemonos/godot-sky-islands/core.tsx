/* @arkzen:meta
name: godot-sky-islands
version: 1.0.0
description: Godot 4 flying exploration game. Glide between floating islands above the clouds with a top-down orthographic camera and no gravity.
auth: false
*/

/* @arkzen:godot:project
godot_version: "4.x"
name: Sky Islands
main_scene: res://scenes/sky.tscn
renderer: mobile
window:
  width: 1280
  height: 720
  resizable: false
display:
  viewport_width: 640
  viewport_height: 360
  stretch_mode: canvas_items
  pixel_art: true
*/
/* @arkzen:godot:project:end */

/* @arkzen:godot:input
actions:
  move_left:
    deadzone: 0.25
    keys: [A, LEFT]
  move_right:
    deadzone: 0.25
    keys: [D, RIGHT]
  move_up:
    deadzone: 0.25
    keys: [W, UP]
  move_down:
    deadzone: 0.25
    keys: [S, DOWN]
  boost:
    deadzone: 0.2
    keys: [SHIFT]
*/
/* @arkzen:godot:input:end */

/* @arkzen:godot:assets
textures:
  pilot_sheet:
    source: assets/images/pilot-sheet.png
    filter: nearest
    alpha: true
  ground:
    source: assets/images/island-grass.png
    filter: nearest
  plain_ground:
    source: assets/images/island-stone.png
    filter: nearest
  sky_gradient:
    source: assets/images/sky-gradient.png
    filter: linear
  cloud:
    source: assets/images/cloud.png
    filter: nearest
    alpha: true
*/
/* @arkzen:godot:assets:end */

/* @arkzen:godot:world
name: sky-islands
tile_size: 1
grid_width: 64
grid_depth: 64
block_height: 0.4
world_margin: 4
seed: 2026
props:
  cloud_puff:
    count: 24
    size: 1.6
    collision: false
    collision_radius: 0
    texture: cloud
npcs:
  count: 0
visuals:
  sky:
    zenith_color: "#2a6fc4"
    horizon_color: "#cfe8fb"
    gradient_texture: sky_gradient
    cloud_layers: [cloud]
    cloud_speed: 0.01
    sun_azimuth: 20
    sun_elevation: 50
    ray_strength: 0.15
  lighting:
    ambient_color: "#c9ddf2"
    ambient_energy: 0.9
  post_processing:
    tonemap: linear
*/
/* @arkzen:godot:world:end */

/* @arkzen:godot:scene:sky
path: res://scenes/sky.tscn
root:
  name: Sky
  type: Node3D
nodes:
  - name: WorldEnvironment
    type: WorldEnvironment
  - name: Sun
    type: DirectionalLight3D
    properties:
      shadow_enabled: false
      light_energy: 1.1
      rotation_degrees: [-70, 15, 0]
  - name: Player
    instance: res://scenes/pilot.tscn
  - name: CameraRig
    type: Node3D
    children:
      - name: Camera
        type: Camera3D
        properties:
          projection: orthogonal
          size: 14
          current: true
*/
/* @arkzen:godot:scene:sky:end */

/* @arkzen:godot:scene:pilot
path: res://scenes/pilot.tscn
root:
  name: Pilot
  type: CharacterBody3D
  properties:
    position: [0, 2, 0]
components:
  - type: CollisionShape3D
    name: PilotCollision
    shape:
      type: SphereShape3D
      radius: 0.4
  - type: AnimatedSprite3D
    name: Sprite
    position: [0, 0, 0]
    texture: pilot_sheet
    pixel_size: 0.04
    shaded: false
    billboard: enabled
    animation:
      columns: 4
      rows: 4
      directions: [down, left, right, up]
      idle_row_offset: 0
      walk_row_offset: 0
      frames_per_second: 10
*/
/* @arkzen:godot:scene:pilot:end */

/* @arkzen:godot:behavior:player
script: res://scripts/pilot.gd
scene: res://scenes/pilot.tscn
language: gdscript
extends: CharacterBody3D
movement:
  input: [move_left, move_right, move_up, move_down]
  speed: 5.5
  run_action: boost
  run_multiplier: 1.8
  acceleration: 10
  deceleration: 8
  camera_relative: false
  normalize_diagonal: true
  gravity: none
animation:
  moving: walk_{direction}
  idle: idle_{direction}
  facing_priority: dominant_axis
*/
/* @arkzen:godot:behavior:player:end */

/* @arkzen:godot:behavior:camera
script: res://scripts/camera_follow.gd
node: Camera
language: gdscript
target: ../../Player
projection: orthogonal
follow:
  offset: [0, 12, 6]
  smoothing: 0.2
look_at:
  target_offset: [0, 0, 0]
zoom:
  min_distance: 8
  max_distance: 20
  step: 1
  mouse_sensitivity: 0.004
  min_pitch: 0.9
  max_pitch: 1.4
*/
/* @arkzen:godot:behavior:camera:end */

/* @arkzen:godot:export
presets:
  windows:
    runnable: true
  macos:
    runnable: true
  web:
    runnable: true
*/
/* @arkzen:godot:export:end */
