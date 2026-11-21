/* @arkzen:meta
name: unity-rocket-dodge
version: 1.0.0
description: Unity SVG runner game set in space. Hop a rocket over drifting asteroids and last as long as you can.
auth: false
*/

/* @arkzen:unity:project
unity_version: 6000.0.38f1
name: Rocket Dodge
width: 1280
height: 720
pixels_per_unit: 100
*/

/* @arkzen:unity:game
type: dino_runner
dinosaur: rocket
obstacle: asteroid
jump_key: W
gravity: -26
jump_velocity: 11
ground_y: -2.5
scroll_speed: 9
spawn_interval_min: 0.9
spawn_interval_max: 1.7
*/

/* @arkzen:unity:visuals
background_color: "#0b1026"
ground_color: "#3a3f66"
dinosaur_tint: "#ffffff"
obstacle_tint: "#d9c7b0"
camera_size: 5
ground_thickness: 0.3
ground_width: 26
dinosaur_size: 1.5
obstacle_width: 1.1
obstacle_height: 1.1
*/

/* @arkzen:unity:controls
restart_key: Return
pointer_enabled: false
*/

/* @arkzen:unity:assets
  rocket:
    source: assets/rocket.svg
  asteroid:
    source: assets/asteroid.svg
*/
