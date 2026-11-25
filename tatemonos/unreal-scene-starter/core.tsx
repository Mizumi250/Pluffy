/* @arkzen:meta
name: unreal-scene-starter
version: 1.0.0
description: An Unreal Engine 5 scene starter showing 3D objects, lighting, fog, a third-person player, and a camera that follows it.
auth: false
*/

/* @arkzen:unreal:project
mode: scene
unreal_version: "5.6"
name: Pluff Unreal Scene Starter
main_scene: main
width: 1280
height: 720
*/

/* @arkzen:unreal:environment
ambient_color: "#a9c7d7"
ambient_intensity: 0.8
fog_enabled: true
fog_color: "#c5e0dc"
fog_density: 0.008
*/

/* @arkzen:unreal:scene:main
nodes:
  - name: Ground
    type: cube
    position: [0, -0.5, 0]
    scale: [20, 1, 20]
    color: "#456b46"
  - name: Player
    type: cylinder
    position: [0, 1, 0]
    scale: [1, 2, 1]
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
          jump: SpaceBar
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
/* @arkzen:unreal:scene:main:end */

/* @arkzen:unreal:export
targets: [windows, linux]
*/
