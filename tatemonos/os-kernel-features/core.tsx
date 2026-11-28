/* @arkzen:meta
name: os-kernel-features
version: 0.1.0
description: Every os block a full operating system can declare
auth: false
*/

/* @arkzen:os:project
name: featherweight
kind: os
arch: [x86_64]
language: rs
kernel_type: monolithic
license: MIT
author: Pluffy
description: A small preemptive OS with syscalls, a ram filesystem and a shell
*/

/* @arkzen:os:target:x86_64
triple: x86_64-unknown-none
cpu: x86-64
page_size: 4K
page_levels: 4
machine: q35
red_zone: false
toolchain:
  channel: nightly
  components: [rust-src, llvm-tools]
*/

/* @arkzen:os:config
features: [serial_log, heap, scheduler, syscalls, userland, filesystem]
log_level: info
panic: halt
debug_assertions: true
banner: featherweight 0.1.0
constants:
  MAX_PROCESSES: 64
  TICK_HZ: 100
*/

/* @arkzen:os:boot
firmware: uefi
loader: bootloader_crate
requests:
  memory_map: true
  framebuffer:
    width: 1024
    height: 768
    bpp: 32
higher_half: true
kernel_base: "0xFFFFFFFF80000000"
stack_size: 64K
*/

/* @arkzen:os:memory
physical: bitmap
paging:
  levels: 4
  huge_pages: false
  kernel_mapping: higher_half
heap:
  allocator: linked_list
  start: "0xFFFF900000000000"
  initial_size: 1M
  max_size: 16M
regions:
  - name: kernel_code
    base: "0xFFFFFFFF80000000"
    size: 2M
    flags: [read, exec]
    kind: code
  - name: kernel_data
    base: "0xFFFFFFFF80200000"
    size: 2M
    flags: [read, write]
    kind: data
  - name: kernel_heap
    base: "0xFFFF900000000000"
    size: 16M
    flags: [read, write]
    kind: heap
guard_pages: true
*/

/* @arkzen:os:interrupts
controller: apic
exceptions:
  - name: page_fault
    handler: interrupts::page_fault
  - name: double_fault
    handler: interrupts::double_fault
irqs:
  - name: timer
    line: 0
    handler: interrupts::timer_tick
  - name: keyboard
    line: 1
    handler: interrupts::keyboard_irq
timer:
  source: apic
  hz: 100
*/

/* @arkzen:os:scheduler
policy: round_robin
tick_hz: 100
preemptive: true
max_tasks: 64
stack_size: 16K
idle_task: true
*/

/* @arkzen:os:syscall:write
number: 1
args:
  - name: fd
    type: u64
  - name: buf
    type: ptr
  - name: len
    type: u64
returns: i64
errors: [EBADF, EFAULT]
handler: syscalls::sys_write
*/

/* @arkzen:os:syscall:exit
number: 2
args:
  - name: code
    type: i64
returns: never
handler: syscalls::sys_exit
*/

/* @arkzen:os:syscall:yield
number: 3
returns: i64
handler: syscalls::sys_yield
*/

/* @arkzen:os:driver:serial
class: serial
bus: platform
ports: [0x3F8]
model: polling
exposes: serial
*/

/* @arkzen:os:driver:keyboard
class: keyboard
bus: platform
ports: [0x60, 0x64]
irq: 1
model: interrupt
exposes: keyboard
handler: interrupts::keyboard_irq
*/

/* @arkzen:os:fs
type: tarfs
root: initrd
mounts:
  - path: /
    device: initramfs
    type: tarfs
vfs: true
*/

/* @arkzen:os:userland:hello
language: rs
entry: main
autostart: true
order: 1
libc: none
stack_size: 64K
heap_size: 1M
*/

/* @arkzen:os:shell
prompt: "fw> "
builtins: [help, echo, halt]
history: true
line_edit: true
*/

/* @arkzen:os:assets
include: ["initrd/**"]
dest: initrd
embed: false
*/

/* @arkzen:os:image
formats: [uefi_disk]
size: 64M
partitions:
  - name: esp
    size: 32M
    fs: fat32
    contents: [kernel, bootloader]
  - name: data
    size: 16M
    fs: tarfs
    contents: [initramfs]
bootloader_install: true
checksums: sha256
*/

/* @arkzen:os:run
emulator: qemu
machine: q35
cpu: qemu64
ram: 256M
cores: 1
devices: [serial, virtio-blk]
display: none
serial: stdio
accel: tcg
*/

/* @arkzen:os:test:boots
kind: boot
timeout: 20
expect: ["featherweight 0\\.1\\.0", "fw> "]
forbid: ["panic", "double fault"]
*/

/* @arkzen:os:test:logic
kind: unit
*/

/* @arkzen:os:source:rs:main
part: kernel
entry: true
*/
#![no_std]
#![no_main]

use bootloader_api::{entry_point, BootInfo};

entry_point!(kernel_main);

fn kernel_main(boot_info: &'static mut BootInfo) -> ! {
    crate::serial::write_str("featherweight 0.1.0\n");
    let _ = boot_info;
    loop {}
}

#[panic_handler]
fn panic(_info: &core::panic::PanicInfo) -> ! {
    loop {}
}
/* @arkzen:os:source:rs:main:end */

/* @arkzen:os:source:rs:interrupts
part: kernel
*/
pub fn page_fault() {}
pub fn double_fault() { loop {} }
pub fn timer_tick() {}
pub fn keyboard_irq() {}
/* @arkzen:os:source:rs:interrupts:end */

/* @arkzen:os:source:rs:syscalls
part: kernel
*/
pub fn sys_write(_fd: u64, _buf: *const u8, _len: u64) -> i64 { 0 }
pub fn sys_exit(_code: i64) -> ! { loop {} }
pub fn sys_yield() -> i64 { 0 }
/* @arkzen:os:source:rs:syscalls:end */

/* @arkzen:os:source:rs:hello
part: user
*/
#![no_std]
#![no_main]

#[no_mangle]
pub extern "C" fn main() -> i64 {
    0
}
/* @arkzen:os:source:rs:hello:end */
