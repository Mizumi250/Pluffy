/* @arkzen:meta
name: unreal-physics-playground
version: 1.0.0
description: An Unreal Engine 5 physics playground with falling crates and balls, a tilted ramp, a point light, and a third-person player.
auth: false
*/

/* @arkzen:unreal:project
mode: scene
unreal_version: "5.6"
name: Pluff Unreal Physics Playground
main_scene: arena
width: 1280
height: 720
*/

/* @arkzen:unreal:environment
ambient_color: "#8fa4b8"
ambient_intensity: 0.6
*/

/* @arkzen:unreal:scene:arena
nodes:
  - name: Floor
    type: cube
    position: [0, -0.5, 0]
    scale: [30, 1, 30]
    color: "#5b6670"
  - name: Ramp
    type: cube
    position: [0, 0.6, 6]
    rotation: [-20, 0, 0]
    scale: [4, 0.4, 8]
    color: "#c9a66b"
  - name: CrateBottom
    type: cube
    position: [-4, 0.5, 2]
    color: "#b5651d"
    components:
      - type: physics
        mass: 20
  - name: CrateMiddle
    type: cube
    position: [-4, 1.6, 2]
    color: "#c97a2b"
    components:
      - type: physics
        mass: 15
  - name: CrateTop
    type: cube
    position: [-4, 2.7, 2]
    scale: [0.8, 0.8, 0.8]
    color: "#dd9440"
    components:
      - type: physics
        mass: 8
  - name: RedBall
    type: sphere
    position: [4, 5, 3]
    color: "#d94a4a"
    components:
      - type: physics
        mass: 5
  - name: BlueBall
    type: sphere
    position: [5, 8, 3]
    scale: [0.8, 0.8, 0.8]
    color: "#4a7bd9"
    components:
      - type: physics
        mass: 3
  - name: FloatingOrb
    type: sphere
    position: [0, 3, -4]
    scale: [0.5, 0.5, 0.5]
    color: "#f5e663"
    emission: "#c9b72a"
    components:
      - type: physics
        use_gravity: false
        mass: 1
  - name: Player
    type: cylinder
    position: [0, 1, -8]
    scale: [1, 2, 1]
    color: "#e8e8e8"
    components:
      - type: character_controller
        speed: 6
        jump_height: 1.4
        gravity: -25
        camera_relative: true
  - name: Sun
    type: light
    light_type: directional
    rotation: [55, 20, 0]
    intensity: 1
  - name: LampPost
    type: light
    light_type: point
    position: [0, 5, 0]
    color: "#ffd9a0"
    intensity: 2
    range: 14
    shadows: false
  - name: MainCamera
    type: camera
    main: true
    position: [0, 5, -14]
    field_of_view: 70
    components:
      - type: camera_follow
        target: Player
        offset: [0, 4, -8]
        smooth_speed: 6
*/
/* @arkzen:unreal:scene:arena:end */

/* @arkzen:unreal:export
targets: [windows, linux, macos]
configuration: development
*/
