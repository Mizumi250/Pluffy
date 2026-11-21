/* @arkzen:meta
name: godot-block-arena
version: 1.0.0
description: Godot 4 arena prototype built from plain meshes. A checkered floor, four walls and a capsule player, with optional ENet multiplayer.
auth: false
*/

/* @arkzen:godot:project
godot_version: "4.3"
name: Block Arena
main_scene: res://scenes/arena.tscn
renderer: forward_plus
window:
  width: 1600
  height: 900
  resizable: true
*/
/* @arkzen:godot:project:end */

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
  jump:
    deadzone: 0.2
    keys: [SPACE]
  sprint:
    deadzone: 0.2
    keys: [SHIFT]
*/
/* @arkzen:godot:input:end */

/* @arkzen:godot:assets
textures:
  floor_checker:
    source: assets/images/arena-checker.png
    filter: nearest
  wall_checker:
    source: assets/images/wall-checker.png
    filter: nearest
*/
/* @arkzen:godot:assets:end */

/* @arkzen:godot:scene:arena
path: res://scenes/arena.tscn
root:
  name: Arena
  type: Node3D
nodes:
  - name: WorldEnvironment
    type: WorldEnvironment
  - name: Sun
    type: DirectionalLight3D
    properties:
      shadow_enabled: true
      light_energy: 1.3
      rotation_degrees: [-50, 40, 0]
  - name: Floor
    type: MeshInstance3D
    mesh:
      type: PlaneMesh
    material:
      albedo: floor_checker
  - name: NorthWall
    type: StaticBody3D
    properties:
      position: [0, 1, -10]
    children:
      - name: NorthWallMesh
        type: MeshInstance3D
        mesh:
          type: BoxMesh
        material:
          albedo: wall_checker
      - name: NorthWallCollision
        type: CollisionShape3D
        shape:
          type: BoxShape3D
  - name: SouthWall
    type: StaticBody3D
    properties:
      position: [0, 1, 10]
    children:
      - name: SouthWallMesh
        type: MeshInstance3D
        mesh:
          type: BoxMesh
        material:
          albedo: wall_checker
      - name: SouthWallCollision
        type: CollisionShape3D
        shape:
          type: BoxShape3D
  - name: Player
    instance: res://scenes/fighter.tscn
  - name: CameraRig
    type: Node3D
    children:
      - name: Camera
        type: Camera3D
        properties:
          projection: perspective
          current: true
*/
/* @arkzen:godot:scene:arena:end */

/* @arkzen:godot:scene:fighter
path: res://scenes/fighter.tscn
root:
  name: Fighter
  type: CharacterBody3D
  properties:
    position: [0, 1, 0]
components:
  - type: CollisionShape3D
    name: FighterCollision
    shape:
      type: CapsuleShape3D
      radius: 0.35
      height: 1.4
  - type: MeshInstance3D
    name: FighterBody
    mesh:
      type: CapsuleMesh
*/
/* @arkzen:godot:scene:fighter:end */

/* @arkzen:godot:behavior:player
script: res://scripts/fighter.gd
scene: res://scenes/fighter.tscn
language: gdscript
extends: CharacterBody3D
movement:
  input: [move_left, move_right, move_up, move_down]
  speed: 5.0
  run_action: sprint
  run_multiplier: 1.5
  jump_action: jump
  jump_velocity: 7.5
  acceleration: 22
  deceleration: 26
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
  offset: [0, 3.5, 5]
  smoothing: 0.08
look_at:
  target_offset: [0, 1, 0]
zoom:
  min_distance: 2
  max_distance: 9
  step: 0.5
  mouse_sensitivity: 0.006
  min_pitch: 0.3
  max_pitch: 1.2
*/
/* @arkzen:godot:behavior:camera:end */

/* @arkzen:godot:multiplayer
enabled: true
port: 27015
max_clients: 6
sync_rate: 30
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
    runnable: false
*/
/* @arkzen:godot:export:end */
