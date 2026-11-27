/* @arkzen:meta
name: term-snake
version: 1.0.0
description: Snake in the terminal
auth: false
*/

/* @arkzen:term:project
name: snake
binary: snake
mode: tui
runtimes: [ts]
alt_screen: true
color: 16
*/

/* @arkzen:term:runtime:ts
framework: ink
*/

/* @arkzen:term:keymap
actions:
  up: [up, w]
  down: [down, s]
  left: [left, a]
  right: [right, d]
  pause: [p]
  quit: [q, ctrl+c]
*/

/* @arkzen:term:loop:snake
tick_rate: 12
render: diff
size:
  width: 40
  height: 20
input: events
seed: random
pause_key: p
fixed_timestep: true
*/

/* @arkzen:term:view:ts:snake
kind: loop
*/
export function init() {
  return { snake: [{ x: 5, y: 5 }], dir: 'right' }
}
export function update(state, input, dt) {
  return state
}
export function draw(state, frame) {}
/* @arkzen:term:view:ts:snake:end */
