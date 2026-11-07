/* @arkzen:meta
name: dino-runner
version: 1.0.0
description: Unity SVG dinosaur runner game. Jump over cactus obstacles and survive as long as possible.
auth: false
*/

/* @arkzen:unity:project
unity_version: 6000.0.38f1
name: Pluff Dino Runner
width: 1280
height: 720
pixels_per_unit: 100
*/

/* @arkzen:unity:game
type: dino_runner
dinosaur: dino
obstacle: cactus
jump_key: Space
gravity: -30
jump_velocity: 12.5
ground_y: -2
scroll_speed: 7.5
spawn_interval_min: 1.1
spawn_interval_max: 2
*/

/* @arkzen:unity:visuals
background_color: "#b3e0f5"
ground_color: "#338a4f"
dinosaur_tint: "#ffffff"
obstacle_tint: "#ffffff"
camera_size: 5
ground_thickness: 0.22
ground_width: 24
dinosaur_size: 1.75
obstacle_width: 0.9
obstacle_height: 1.25
*/

/* @arkzen:unity:controls
restart_key: R
pointer_enabled: true
*/

/* @arkzen:unity:assets
  dino:
    source: assets/dino.svg
  cactus:
    source: assets/cactus.svg
*/
