/* @arkzen:meta
name: godot-crystal-cave
version: 1.0.0
description: Godot 4 cave exploration game. Wander a dim crystal cave, talk to the miners who still work there and follow the glow of the crystals.
auth: false
*/

/* @arkzen:godot:project
godot_version: "4.3"
name: Crystal Cave
main_scene: res://scenes/cave.tscn
renderer: gl_compatibility
window:
  width: 1024
  height: 576
  resizable: true
display:
  viewport_width: 512
  viewport_height: 288
  stretch_mode: canvas_items
  pixel_art: true
*/
/* @arkzen:godot:project:end */

/* @arkzen:godot:world
name: crystal-cave
tile_size: 1
grid_width: 48
grid_depth: 48
block_height: 0.5
world_margin: 3
seed: 7
props:
  crystal:
    count: 40
    size: 0.8
    collision: true
    collision_radius: 0.3
    texture: crystal
  mushroom:
    count: 60
    size: 0.5
    collision: false
    collision_radius: 0
    texture: mushroom
npcs:
  count: 4
  spawn_range: 10
  interact_radius: 1.4
  speed: 0.02
  wander_min: 80
  wander_max: 200
  interact_action: interact
dialogues:
  - ["Careful in here.", "The crystals hum when someone walks close."]
  - ["I mined this cave for ten years.", "It still surprises me."]
  - ["Follow the blue glow.", "It always leads somewhere quiet."]
visuals:
  sky:
    zenith_color: "#0b0f1f"
    horizon_color: "#1b2540"
  fog:
    color: "#101830"
    density: 0.004
  lighting:
    ambient_color: "#5568a8"
    ambient_energy: 0.5
  post_processing:
    tonemap: filmic
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
    keys: [E]
*/
/* @arkzen:godot:input:end */

/* @arkzen:godot:assets
textures:
  explorer_sheet:
    source: assets/images/explorer-sheet.png
    filter: nearest
    alpha: true
  ground:
    source: assets/images/cave-floor.png
    filter: nearest
  plain_ground:
    source: assets/images/cave-rock.png
    filter: nearest
  crystal:
    source: assets/images/crystal.png
    filter: nearest
    alpha: true
  mushroom:
    source: assets/images/mushroom.png
    filter: nearest
    alpha: true
*/
/* @arkzen:godot:assets:end */

/* @arkzen:godot:scene:cave
path: res://scenes/cave.tscn
root:
  name: Cave
  type: Node3D
nodes:
  - name: WorldEnvironment
    type: WorldEnvironment
  - name: Lantern
    type: DirectionalLight3D
    properties:
      shadow_enabled: false
      light_color: "#a9c4ff"
      light_energy: 0.9
      rotation_degrees: [-60, 20, 0]
  - name: Player
    instance: res://scenes/explorer.tscn
  - name: CameraRig
    type: Node3D
    children:
      - name: Camera
        type: Camera3D
        properties:
          projection: perspective
          current: true
*/
/* @arkzen:godot:scene:cave:end */

/* @arkzen:godot:scene:explorer
path: res://scenes/explorer.tscn
root:
  name: Explorer
  type: CharacterBody3D
  properties:
    position: [0, 0.5, 0]
components:
  - type: CollisionShape3D
    name: ExplorerCollision
    shape:
      type: CapsuleShape3D
      radius: 0.25
      height: 0.9
  - type: AnimatedSprite3D
    name: Sprite
    position: [0, 0.25, 0]
    texture: explorer_sheet
    pixel_size: 0.03125
    shaded: false
    billboard: enabled
    animation:
      columns: 6
      rows: 8
      directions: [down, left, right, up]
      idle_row_offset: 0
      walk_row_offset: 4
      frames_per_second: 6
*/
/* @arkzen:godot:scene:explorer:end */

/* @arkzen:godot:behavior:player
script: res://scripts/explorer.gd
scene: res://scenes/explorer.tscn
language: gdscript
extends: CharacterBody3D
movement:
  input: [move_left, move_right, move_up, move_down]
  speed: 3.0
  acceleration: 14
  deceleration: 20
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
  offset: [0, 2.2, 2.6]
  smoothing: 0.12
look_at:
  target_offset: [0, 0.4, 0]
zoom:
  min_distance: 1.5
  max_distance: 6
  step: 0.3
  mouse_sensitivity: 0.005
  min_pitch: 0.5
  max_pitch: 1.3
*/
/* @arkzen:godot:behavior:camera:end */

/* @arkzen:godot:export
presets:
  windows:
    runnable: true
  linux:
    runnable: true
  web:
    runnable: false
*/
/* @arkzen:godot:export:end */
