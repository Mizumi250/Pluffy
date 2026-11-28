/* @arkzen:meta
name: os-blinker-firmware
version: 0.1.0
description: Blink an LED on a microcontroller (board and chip names are placeholders)
auth: false
*/

/* @arkzen:os:project
name: blinker
kind: firmware
arch: [arm-cortex-m]
language: rs
kernel_type: rtos
license: MIT
*/

/* @arkzen:os:target:arm-cortex-m
triple: thumbv6m-none-eabi
*/

/* @arkzen:os:board
name: example-board
chip: example-chip
runtime: embassy
peripherals:
  - gpio:
      pins: [25]
flash_tool: uf2
*/

/* @arkzen:os:image
formats: [uf2]
*/

/* @arkzen:os:source:rs:main
part: kernel
entry: true
*/
#![no_std]
#![no_main]

// Placeholder: the real pin setup depends on the board named in @arkzen:os:board.
#[no_mangle]
pub extern "C" fn main() -> ! {
    loop {}
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
/* @arkzen:os:source:rs:main:end */
