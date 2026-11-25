/* @arkzen:meta
name: unreal-sky-garden
version: 1.0.0
description: An Unreal Engine 5 top-down garden using an orthographic camera, grouped objects with children, a spinning pinwheel, spot lights, and fog.
auth: false
*/

/* @arkzen:unreal:project
mode: scene
unreal_version: "5.6"
name: Pluff Unreal Sky Garden
main_scene: garden
width: 1280
height: 720
*/

/* @arkzen:unreal:environment
ambient_color: "#cfe3f0"
ambient_intensity: 1
fog_enabled: true
fog_color: "#e6f1f5"
fog_density: 0.004
*/

/* @arkzen:unreal:scene:garden
nodes:
  - name: Lawn
    type: plane
    position: [0, 0, 0]
    scale: [24, 1, 24]
    color: "#6fa96b"
  - name: Pond
    type: cylinder
    position: [-5, 0.02, 4]
    scale: [6, 0.05, 6]
    color: "#4aa3c9"
  - name: Pinwheel
    type: empty
    position: [4, 1.5, 3]
    components:
      - type: rotate
        axis: [0, 1, 0]
        speed: 60
    children:
      - name: BladeNorth
        type: cube
        position: [0, 0, 1]
        scale: [0.3, 0.1, 1.6]
        color: "#e85d75"
      - name: BladeSouth
        type: cube
        position: [0, 0, -1]
        scale: [0.3, 0.1, 1.6]
        color: "#f2a65a"
      - name: BladeEast
        type: cube
        position: [1, 0, 0]
        scale: [1.6, 0.1, 0.3]
        color: "#4fb286"
      - name: BladeWest
        type: cube
        position: [-1, 0, 0]
        scale: [1.6, 0.1, 0.3]
        color: "#5b8def"
  - name: PinwheelPost
    type: cylinder
    position: [4, 0.75, 3]
    scale: [0.2, 1.5, 0.2]
    color: "#8a6a4a"
  - name: Lantern
    type: sphere
    position: [-3, 1.2, -4]
    scale: [0.5, 0.5, 0.5]
    color: "#fff1b8"
    emission: "#ffdf80"
  - name: LanternSpot
    type: light
    light_type: spot
    position: [-3, 4, -4]
    rotation: [90, 0, 0]
    spot_angle: 70
    intensity: 2
    range: 8
    color: "#ffe9b0"
  - name: Sun
    type: light
    light_type: directional
    rotation: [60, -20, 0]
    intensity: 1.1
  - name: TopCamera
    type: camera
    main: true
    projection: orthographic
    orthographic_size: 9
    position: [0, 20, 0]
    rotation: [90, 0, 0]
*/
/* @arkzen:unreal:scene:garden:end */

/* @arkzen:unreal:export
targets: [windows]
*/
