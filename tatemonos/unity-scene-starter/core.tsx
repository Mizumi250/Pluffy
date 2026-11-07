/* @arkzen:meta
name: unity-scene-starter
version: 1.0.0
description: A Unity scene-based starter showing 3D game objects, lighting, physics, and camera-follow controls.
auth: false
*/

/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: Pluff Unity Scene Starter
main_scene: Assets/Scenes/Main.unity
width: 1280
height: 720
*/

/* @arkzen:unity:environment
ambient_color: "#a9c7d7"
ambient_intensity: 0.8
fog_enabled: true
fog_color: "#c5e0dc"
fog_density: 0.008
*/

/* @arkzen:unity:scene:main
path: Assets/Scenes/Main.unity
nodes:
  - name: Ground
    type: cube
    position: [0, -0.5, 0]
    scale: [20, 1, 20]
    color: "#456b46"
    components:
      - type: box_collider
        size: [1, 1, 1]
  - name: Player
    type: capsule
    position: [0, 1, 0]
    color: "#d8a26b"
    components:
      - type: character_controller
        speed: 5
        jump_height: 1.6
        camera_relative: true
        keys:
          forward: W
          backward: S
          left: A
          right: D
          jump: Space
  - name: Beacon
    type: sphere
    position: [2, 1, 1]
    scale: [0.6, 0.6, 0.6]
    color: "#56d9c2"
    emission: "#168a7d"
    components:
      - type: rotate
        axis: [0, 1, 0]
        speed: 35
  - name: Sun
    type: light
    light_type: directional
    rotation: [45, -30, 0]
    intensity: 1.2
    shadows: true
  - name: MainCamera
    type: camera
    main: true
    position: [0, 4, -7]
    components:
      - type: camera_follow
        target: Player
        offset: [0, 4, -7]
        smooth_speed: 8
*/
/* @arkzen:unity:scene:main:end */

/* @arkzen:unity:export
targets: [windows, linux, webgl]
*/
