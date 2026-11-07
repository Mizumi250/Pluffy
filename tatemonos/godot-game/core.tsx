/* @arkzen:meta
name: godot-game
version: 1.0.0
description: Godot 4 game Tatemono DSL. Defines project settings, scenes, nodes, input, assets, and gameplay behavior for the Godot project generator.
auth: false
*/

/* @arkzen:godot:project
godot_version: "4.x"
name: Pluff Godot Game
main_scene: res://scenes/main.tscn
renderer: forward_plus
window:
  width: 1280
  height: 720
  resizable: true
display:
  viewport_width: 640
  viewport_height: 360
  stretch_mode: canvas_items
  pixel_art: true
*/
/* @arkzen:godot:project:end */

/* @arkzen:godot:world
name: ethereane
tile_size: 1
grid_width: 100
grid_depth: 64
block_height: 0.6
world_margin: 2
seed: 42
props:
  bush1:
    count: 86
    size: 0.85
    collision: false
    collision_radius: 0
    texture: bush1
  bush2:
    count: 43
    size: 0.9
    collision: true
    collision_radius: 0.32
    texture: bush2
npcs:
  count: 10
  spawn_range: 14
  interact_radius: 1.2
  speed: 0.025
  wander_min: 60
  wander_max: 240
  interact_action: interact
dialogues:
  - ["Hey there, traveler!", "This world is bigger than it looks..."]
  - ["Beautiful day, isn't it?", "I've been walking for hours and still haven't seen it all."]
  - ["Don't wander too far from the path.", "Strange things happen near the edges of the world."]
  - ["I heard there are hidden places", "deep in this land. Have you found any?"]
  - ["The grass here feels different.", "Like it remembers something."]
  - ["Oh! You startled me.", "I was just enjoying the view."]
  - ["They say if you walk far enough,", "the world wraps back around."]
  - ["I've been here since dawn.", "Still not sure where I'm going."]
  - ["Have you seen any strange lights", "to the north? I keep seeing them at night."]
  - ["Just passing through.", "Same as everyone else, I suppose."]
visuals:
  sky:
    zenith_color: "#1565c0"
    horizon_color: "#e1f5fe"
    gradient_texture: sky_layer_0
    cloud_layers: [sky_layer_1, sky_layer_2, sky_layer_3]
    cloud_speed: 0.004
    sun_azimuth: -35
    sun_elevation: 35
    ray_strength: 0.32
  fog:
    color: "#c5e0dc"
    density: 0.0006
    volumetric: true
    volumetric_density: 0.0012
  lighting:
    ambient_color: "#a9c7d7"
    ambient_energy: 0.72
  post_processing:
    tonemap: aces
    glow: true
    glow_intensity: 0.55
    bloom: 0.08
    ssao: true
    ssao_radius: 1.5
    ssao_intensity: 1.15
    ssil: false
    ssil_radius: 5.0
    ssil_intensity: 0.35
    ssr: true
    ssr_max_steps: 96
    ssr_depth_tolerance: 0.2
*/
/* @arkzen:godot:world:end */

/* @arkzen:godot:input
actions:
  move_left:
    deadzone: 0.2
    keys: [A, LEFT]
  move_right:
    deadzone: 0.2
    keys: [D, RIGHT]
  move_up:
    deadzone: 0.2
    keys: [W, UP]
  move_down:
    deadzone: 0.2
    keys: [S, DOWN]
  interact:
    deadzone: 0.2
    keys: [E, ENTER]
  run:
    deadzone: 0.2
    keys: [SHIFT]
  jump:
    deadzone: 0.2
    keys: [SPACE]
*/
/* @arkzen:godot:input:end */

/* @arkzen:godot:assets
textures:
  player_sheet:
    source: assets/images/character1.png
    filter: nearest
    alpha: true
  ground:
    source: assets/images/tile-grass.png
    filter: nearest
  plain_ground:
    source: assets/images/tile-plain-grass.png
    filter: nearest
  bush1:
    source: assets/images/bush1.png
    filter: nearest
  bush2:
    source: assets/images/bush2.png
    filter: nearest
  sky_layer_0:
    source: assets/images/sky-layer-0.png
    filter: nearest
  sky_layer_1:
    source: assets/images/sky-layer-1.png
    filter: nearest
  sky_layer_2:
    source: assets/images/sky-layer-2.png
    filter: nearest
  sky_layer_3:
    source: assets/images/sky-layer-3.png
    filter: nearest
*/
/* @arkzen:godot:assets:end */

/* @arkzen:godot:scene:main
path: res://scenes/main.tscn
root:
  name: Main
  type: Node3D
nodes:
  - name: WorldEnvironment
    type: WorldEnvironment
  - name: Sun
    type: DirectionalLight3D
    properties:
      shadow_enabled: true
      light_color: "#fff5e0"
      light_energy: 1.55
      shadow_blur: 2.0
      shadow_bias: 0.035
      shadow_normal_bias: 1.4
      directional_shadow_max_distance: 96.0
      light_volumetric_fog_energy: 2.4
      rotation_degrees: [-55, -35, 0]
  - name: Player
    instance: res://scenes/player.tscn
  - name: CameraRig
    type: Node3D
    children:
      - name: Camera
        type: Camera3D
        properties:
          projection: perspective
          size: 12
          current: true
*/
/* @arkzen:godot:scene:main:end */

/* @arkzen:godot:scene:player
path: res://scenes/player.tscn
root:
  name: Player
  type: CharacterBody3D
  properties:
    position: [0, 0.5, 0]
components:
  - type: CollisionShape3D
    name: PlayerCollision
    shape:
      type: CapsuleShape3D
      radius: 0.25
      height: 0.9
  - type: AnimatedSprite3D
    name: Sprite
    position: [0, 0.25, 0]
    texture: player_sheet
    pixel_size: 0.03125
    shaded: true
    billboard: enabled
    animation:
      columns: 6
      rows: 8
      directions: [down, left, right, up]
      idle_row_offset: 0
      walk_row_offset: 4
      frames_per_second: 8
      run_frames_per_second: 20
*/
/* @arkzen:godot:scene:player:end */

/* @arkzen:godot:behavior:player
script: res://scripts/player.gd
scene: res://scenes/player.tscn
language: gdscript
extends: CharacterBody3D
movement:
  input: [move_left, move_right, move_up, move_down]
  speed: 4.0
  run_action: run
  run_multiplier: 1.65
  jump_action: jump
  jump_velocity: 6.5
  acceleration: 18
  deceleration: 24
  camera_relative: true
  normalize_diagonal: true
  gravity: project_default
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
projection: perspective
follow:
  offset: [0, 1.8, 2.1]
  smoothing: 0.09
look_at:
  target_offset: [0, 0.5, 0]
zoom:
  min_distance: 1.1
  max_distance: 7.5
  step: 0.35
  mouse_sensitivity: 0.0055
  min_pitch: 0.4
  max_pitch: 1.45
*/
/* @arkzen:godot:behavior:camera:end */

/* @arkzen:godot:multiplayer
enabled: true
port: 24567
max_clients: 8
sync_rate: 20
default_address: 127.0.0.1
*/
/* @arkzen:godot:multiplayer:end */

/* @arkzen:godot:export
presets:
  windows:
    runnable: true
  linux:
    runnable: true
  macos:
    runnable: true
  web:
    runnable: false
*/
/* @arkzen:godot:export:end */
