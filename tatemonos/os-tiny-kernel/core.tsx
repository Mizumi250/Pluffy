/* @arkzen:meta
name: os-tiny-kernel
version: 0.1.0
description: A kernel that prints a line and exits
auth: false
*/

/* @arkzen:os:project
name: tiny
kind: kernel
arch: [x86_64]
language: rs
kernel_type: monolithic
license: MIT
*/

/* @arkzen:os:target:x86_64
triple: x86_64-unknown-none
machine: q35
red_zone: false
*/

/* @arkzen:os:boot
firmware: uefi
loader: bootloader_crate
requests:
  memory_map: true
*/

/* @arkzen:os:memory
physical: bitmap
guard_pages: true
*/

/* @arkzen:os:driver:serial
class: serial
bus: platform
ports: [0x3F8]
model: polling
exposes: serial
*/

/* @arkzen:os:source:rs:main
part: kernel
entry: true
*/
#![no_std]
#![no_main]

use bootloader_api::{entry_point, BootInfo};

entry_point!(kernel_main);

fn kernel_main(_boot_info: &'static mut BootInfo) -> ! {
    crate::serial::write_str("boot ok\n");
    loop {}
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
/* @arkzen:os:source:rs:main:end */

/* @arkzen:os:image
formats: [uefi_disk]
checksums: sha256
*/

/* @arkzen:os:run
emulator: qemu
machine: q35
ram: 256M
display: none
serial: stdio
*/

/* @arkzen:os:test:boots
kind: boot
timeout: 10
expect: ["boot ok"]
forbid: ["panic"]
*/
