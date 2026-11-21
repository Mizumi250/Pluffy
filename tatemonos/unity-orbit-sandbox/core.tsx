/* @arkzen:meta
name: unity-orbit-sandbox
version: 1.0.0
description: A Unity 3D physics sandbox with an orbiting planet, a bouncing crate and a walking explorer across two scenes.
auth: false
*/

/* @arkzen:unity:project
mode: scene
unity_version: 6000.0.38f1
name: Orbit Sandbox
main_scene: Assets/Scenes/Orbit.unity
width: 1600
height: 900
*/

/* @arkzen:unity:environment
ambient_color: "#2a2f55"
ambient_intensity: 0.6
fog_enabled: false
*/

/* @arkzen:unity:scene:orbit
path: Assets/Scenes/Orbit.unity
nodes:
  - name: Floor
    type: plane
    position: [0, 0, 0]
    scale: [3, 1, 3]
    color: "#2b3040"
  - name: Planet
    type: sphere
    position: [0, 2, 0]
    scale: [1.5, 1.5, 1.5]
    color: "#4f8fe0"
    emission: "#1a3c78"
    components:
      - type: rotate
        axis: [0, 1, 0]
        speed: 20
  - name: Crate
    type: cube
    position: [3, 4, 0]
    color: "#b5833f"
    components:
      - type: box_collider
        size: [1, 1, 1]
      - type: rigidbody
        mass: 2
        use_gravity: true
  - name: Explorer
    type: capsule
    position: [-3, 1, 0]
    color: "#f2c14e"
    components:
      - type: character_controller
        speed: 4
        jump_height: 1.2
        camera_relative: true
        keys:
          forward: W
          backward: S
          left: A
          right: D
          jump: Space
  - name: Sun
    type: light
    light_type: directional
    rotation: [50, 20, 0]
    intensity: 1
    shadows: true
  - name: MainCamera
    type: camera
    main: true
    position: [0, 6, -10]
    components:
      - type: camera_follow
        target: Explorer
        offset: [0, 5, -8]
        smooth_speed: 5
*/
/* @arkzen:unity:scene:orbit:end */

/* @arkzen:unity:scene:menu
path: Assets/Scenes/Menu.unity
nodes:
  - name: Logo
    type: cube
    position: [0, 0, 0]
    scale: [2, 2, 2]
    color: "#e0556b"
    components:
      - type: rotate
        axis: [0, 1, 0]
        speed: 45
  - name: MenuCamera
    type: camera
    main: true
    position: [0, 1, -6]
*/
/* @arkzen:unity:scene:menu:end */

/* @arkzen:unity:export
targets: [windows, macos]
*/
