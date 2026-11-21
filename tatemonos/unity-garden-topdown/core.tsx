/* @arkzen:meta
name: unity-garden-topdown
version: 1.0.0
description: Unity 2D top-down garden scene. Walk a gardener around flowers and stones using sprite assets and 2D physics.
auth: false
*/

/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: Garden Topdown
main_scene: Assets/Scenes/Garden.unity
width: 1280
height: 720
*/

/* @arkzen:unity:environment
ambient_color: "#ffffff"
ambient_intensity: 1
*/

/* @arkzen:unity:assets
  gardener:
    source: assets/gardener.svg
  flower:
    source: assets/flower.svg
  stone:
    source: assets/stone.svg
*/

/* @arkzen:unity:scene:garden
path: Assets/Scenes/Garden.unity
nodes:
  - name: Gardener
    type: sprite
    sprite: gardener
    position: [0, 0, 0]
    components:
      - type: rigidbody_2d
        body_type: kinematic
      - type: box_collider_2d
        size: [0.8, 0.8]
      - type: top_down_controller_2d
        speed: 3.5
  - name: Flower
    type: sprite
    sprite: flower
    position: [2, 1, 0]
  - name: Stone
    type: sprite
    sprite: stone
    position: [-2, -1, 0]
    components:
      - type: box_collider_2d
        size: [1, 1]
  - name: MainCamera
    type: camera
    main: true
    position: [0, 0, -10]
    components:
      - type: camera_follow
        target: Gardener
        offset: [0, 0, -10]
        smooth_speed: 6
*/
/* @arkzen:unity:scene:garden:end */

/* @arkzen:unity:export
targets: [windows, webgl]
*/
