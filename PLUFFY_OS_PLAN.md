# Pluffy Operating System Development Plan

Status: plan only. Nothing here is implemented. Written 2026-11-26 from a session that read the Pluffy repo (github.com/Mizumi250/Pluffy), the full DSL catalog and `FUTURE_PLANS.md`, checked the tools available in the author's sandbox, and checked current Rust OS crates on crates.io.

This is Phase 6 of `FUTURE_PLANS.md`. The roadmap text is: "The final and most ambitious stage of Pluffy's evolution. Introduce operating system development capabilities. Expand into system-level software creation. Explore kernel, driver, and operating system development. Establish OS development as the final major expansion of Pluffy." The wording is "explore", so this document defines what the phase means.

All DSL names, header keys and CLI commands below are PROPOSALS. "Verified" means read in the repo, run in the sandbox, or checked against a registry. Everything about how operating systems work, and about the tools named below other than the crate versions, is from general knowledge and has not been tested. Unverified items are listed in section 13.

Scope: the FULL scope Mizumi asked for, not filtered into versions. Section 12 gives a work order, which is order only.

Pluffy's role here is the same as in the earlier phases: scaffold, generate what can be declared, build, run and verify. Pluffy does not write kernel logic for you.

---

## 1. What "OS development" can mean

These are different projects. All of them fit the roadmap wording or are close enough to be in scope.

| # | Kind (`kind:` value) | What it is |
|---|---|---|
| 1 | `kernel` | Bare-metal kernel: boots and does something (prints text, runs tasks) |
| 2 | `os` | Kernel plus userland: init, shell, programs, filesystem |
| 3 | `bootloader` | A bootloader or UEFI application on its own |
| 4 | `bootapp` | A bootable app or game with no OS |
| 5 | `firmware` | RTOS or microcontroller firmware for a board |
| 6 | `unikernel` | One application plus a minimal kernel, run under a hypervisor |
| 7 | `driver` | A driver for an existing OS (Linux kernel module, Windows driver, macOS DriverKit extension) |
| 8 | `distro` | A Linux distribution or custom image: configuration plus packages |
| 9 | `desktop` | A custom shell or desktop environment on top of an existing kernel |

The roadmap's "kernel, driver, and operating system" covers kinds 1 to 7. Kind 8 (`distro`) is the most realistic for Pluffy, because it is mostly configuration, and arguably counts as OS development too. Kind 9 is listed for completeness.

---

## 2. What a kernel is made of

- Boot and early init.
- CPU setup (descriptor tables, exceptions, interrupts).
- Memory: physical frame allocator, paging, kernel heap.
- Scheduler, threads and processes.
- Syscalls and inter-process communication.
- Filesystem and a virtual filesystem layer.
- Drivers: serial, framebuffer, keyboard, timer, disk, network, USB.
- Networking stack.
- Userland: init, shell, an executable loader (ELF), a C library.

Kernel designs: monolithic, microkernel, hybrid, exokernel, unikernel, and real-time (RTOS).

Architectures: `x86_64`, `aarch64`, `riscv64`, legacy 32-bit `x86`, and `arm-cortex-m` for microcontrollers. QEMU can emulate the first three (from knowledge).

Host operating systems for driver projects: `linux`, `windows`, `macos`.

---

## 3. How much Pluffy generates

| Level | Projects | What the DSL does |
|---|---|---|
| Fully declared | `distro` configuration, a bootable image plus emulator run configuration, syscall tables, driver registries, memory layouts, boot configuration, boot tests | Pluffy generates the files and tables. |
| Scaffold plus your code | `kernel`, `os`, `bootloader`, `bootapp`, `firmware`, `unikernel`, `driver`, userland programs, `desktop` | Pluffy generates boot code, linker script, project layout, build, image and run. You write kernel logic, drivers and userland in the language. |
| Not promised | Real-hardware drivers for GPUs and Wi-Fi, SMP stability, a complete USB stack, security hardening, POSIX compatibility or running Linux applications, power management, Windows driver signing, macOS notarization, verification on real hardware | They take years of work or need hardware and accounts that one export cannot provide. |

---

## 4. Languages

Pluffy's existing language codes (verified in the catalog) are `php`, `ts`, `py`, `java`, `cs`, `go`, `rs`.

- `rs` is the primary language: Pluffy already has a Rust backend and the Rust OS ecosystem is active.
- `asm` (assembly) cannot be avoided at boot time. Needed as a new code.
- `c` is needed for Linux kernel modules and many existing kernels. Needed as a new code.
- Windows and macOS host drivers need C or C++ (from knowledge). A `cpp` code may be needed. Open item.
- `go` can target microcontrollers through TinyGo (from knowledge, unverified), so it is listed for `firmware` only.
- The new codes `c` and `asm` (and possibly `cpp`) apply to the `os` family only. This is a recommendation for Mizumi to confirm (section 13).

Rust OS crates checked on crates.io (all updated in 2026):

| Crate | Version | Published | Role (from knowledge) |
|---|---|---|---|
| `bootloader` | 0.11.17 | 2026-07-27 | Builds BIOS and UEFI bootable images for a Rust kernel |
| `bootloader_api` | 0.11.17 | 2026-07-27 | The kernel-side entry and boot info API |
| `x86_64` | 0.15.5 | 2026-09-24 | CPU structures: paging, descriptor tables, ports |
| `uefi` | 0.41.0 | 2026-09-21 | UEFI applications and bootloaders |
| `limine` | 0.6.5 | 2026-06-07 | Protocol crate for the Limine bootloader (the loader itself is separate) |
| `multiboot2` | 0.28.0 | 2026-09-04 | Multiboot2 boot information parsing |
| `riscv` | 0.16.1 | 2026-05-28 | RISC-V CPU access |

Pin these. They are mostly pre-1.0.

---

## 5. Verified findings (repo and sandbox)

| # | Finding | How verified |
|---|---|---|
| 1 | The roadmap Phase 6 text is as quoted above. There is no existing OS code or design in the repo. | Read `FUTURE_PLANS.md` |
| 2 | Unknown DSL families fail in the web parser. Game tatemonos fail `parseTatemono` today and `validateDslTags` writes an error JSON for the UI overlay. The watcher builds every folder with `@arkzen:meta`, logs the failure and moves on. A new `os` family hits the same problem unless the parser knows it. | Ran the real `parser.ts` under tsx (earlier session) |
| 3 | `validatePages` has a precedent exemption for tatemonos with no pages (`content.includes('/* @arkzen:file:')`). | Read and ran |
| 4 | The tag regex only recognises prefixes `web`, `native`, `desktop`. Other families need `:end` unless listed in `YAML_ONLY_TAGS`. | Read `parser.ts` |
| 5 | Catalog patterns reused here: `godot:project`, `unity:project`, `unreal:project` (identity), `godot:export`, `unreal:export` (export), `godot:assets`, `unity:assets` (assets), `endpoint:<backend>:name` and `handler:<backend>:name` (code per language), identifiers with `[:identifier]`. | Read `PLUFF_DSL_CATALOG.md` |
| 6 | `export.js` has per-target early branches (Unreal precedent). `mizumi.js export <tat> <stack>` is the entry point. `mizumi publish` only pushes an exported `projects/` folder to GitHub. | Read |
| 7 | `engine/game/common/` helpers borrow `js-yaml` from `engine/frontend/nextjs/package.json` through `createRequire`. This breaks when `mizumi deps prune` removes Next's `node_modules`. | Read `common/index.js`, `mizumi.js` |
| 8 | `shared-sync.ts` copies `engine-core` files plus `hooks`, `lib`, `stores` into every stack's `arkzen/core/`. Parser, validator and type changes must be synced to every stack. | Read `shared-sync.ts`, guideline 28B |
| 9 | Sandbox tools present: `gcc` 13.3.0 (Ubuntu 13.3.0-6ubuntu2~24.04.1), `ld`, node v22.23.5, python3. Not present: `qemu-system-x86_64`, `qemu-system-aarch64`, `qemu-system-riscv64`, `nasm`, `clang`, `grub-mkrescue`, `xorriso`, `rustc`, `cargo`, `zig`. The Ubuntu package mirror is on the network allowlist, but installing QEMU was not tried. | `which`, network config |
| 10 | Reachable registries from the sandbox: npm, PyPI, crates.io. | Network config |

Nothing for this phase has been built or run. No emulator was available, so no kernel has been booted.

---

## 6. Architecture

### 6.1 Where things live

```
engine/os/
  common/            linker script generator, image builder, QEMU runner, boot test harness,
                     syscall table generator, driver registry, license texts
  rs/                Rust kernel generator (bootloader / limine / uefi crates)
  c/                 C kernel and Linux module generator
  asm/               architecture-specific boot stubs
  distro/            config writers for Buildroot, Yocto, debootstrap, Alpine, NixOS style builders
  firmware/          board support and flashing instructions per board
  hostdriver/
    linux/  windows/  macos/
  package.json       OWN tool dependencies (js-yaml, archive helpers)
engine/shared/arkzen/engine-core/    parser.ts, validator.ts: os parsing and validation
projects/os/<tat>/<id>/<arch>/       output (gitignored)
tatemonos/<tat>/core.tsx             source of truth
tatemonos/<tat>/assets/              fonts, files for the image and initramfs
```

Why `engine/os/` at the root of `engine/`: switchable stacks sit inside a category folder (`frontend/`, `backend/`). Standalone target families get their own top-level folder, next to `engine/game/`, `engine/package/` and `engine/terminal/`.

### 6.2 Rules

1. Exported projects have no Pluffy imports and no Pluffy runtime. They build with the language's own toolchain.
2. Tools use their own `engine/os/package.json`. Never borrow from a stack (finding 7).
3. A tatemono may declare several architectures. Declarative blocks feed all of them. Code blocks carry their architecture where it matters (`asm` always does).
4. The generator never writes to a physical disk or device. It emits images and prints flashing instructions. The user runs their own flashing tool.
5. The generator never loads a kernel module or driver on the host machine. Driver projects are built only.
6. No secrets in any `os:*` block. Distribution user accounts are declared by name only, with no passwords.
7. Every project is verified in an emulator where one exists. If the emulator or toolchain is missing, the result is marked UNVERIFIED, never "passed".

### 6.3 Data flow

1. Watcher or export reads `core.tsx`.
2. `parseTatemono` parses `os:*` blocks into `parsed.os` (new field, same idea as `errorHandlers`).
3. For each architecture, the matching generator writes the project folder: boot stubs, linker script, kernel crate or sources, syscall table, driver modules.
4. It builds with the language toolchain.
5. The image builder produces the output image or firmware binary.
6. The test runner boots the image headless in the emulator and checks the serial output.

### 6.4 Commands (proposed)

- `node mizumi.js export <tat> os [--id=<id>] [--arch=<arch>]` writes `projects/os/<tat>/...`, builds, makes the image and verifies.
- `node mizumi.js run <tat> os [--arch=<arch>]` boots the image in the emulator with the `os:run` settings.
- `node mizumi.js deps install os` installs `engine/os/package.json`.
- `node mizumi.js new <name> --template=kernel|os|firmware|driver|distro` scaffolds an OS tatemono.
- `node start.js --only=os` runs a rebuild watcher (kernels are booted by the user or by `run`).

---

## 7. DSL reference

### 7.1 Patterns taken from the existing catalog

| Existing pattern | Reused as |
|---|---|
| `godot:project`, `unity:project`, `unreal:project` | `os:project` |
| `godot:export`, `unreal:export`, per-target settings | `os:target:<arch>`, `os:image` |
| `godot:assets`, `unity:assets` | `os:assets` |
| `handler:<backend>:name`, `endpoint:<backend>:name` (code per language) | `os:source:<lang>:<name>` |
| `database[:identifier]`, `jobs[:backend]:identifier` (optional identifier) | `os:*[:id]`, named items |
| YAML-only declaration shared across targets, code body per variant | tables (syscalls, drivers, memory) are YAML, bodies are code |
| `@arkzen:file:id` | reused unchanged for any extra file |

Naming: one new family prefix, `os`.

### 7.2 Shapes (existing, guideline Section 3D)

- Shape A: YAML only. Opening line has no `*/`, closed by a bare `*/`. No `:end`.
- Shape B: YAML header in the opening comment, `*/`, body, then `:end */`.
- Shape C: code block with `*/` on the same opening line, body, `:end */`.

`os:source` and `os:readme` use Shape B when they need a header and Shape C when they do not. `:end */` is always required. Parser work: the same multi-line opener exemption that layout tags have.

### 7.3 Twenty new markers

**YAML only (Shape A), 18**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 1 | `@arkzen:os:project[:id]` | per project | Identity, kind, architectures, boot method |
| 2 | `@arkzen:os:target:<arch>` | per architecture | Toolchain target, CPU features, machine |
| 3 | `@arkzen:os:config` | once | Kernel feature flags and constants |
| 4 | `@arkzen:os:boot` | once | Firmware, loader, boot requests |
| 5 | `@arkzen:os:memory` | once | Memory managers, layout, heap |
| 6 | `@arkzen:os:interrupts` | once | Exceptions, IRQ map, controller |
| 7 | `@arkzen:os:scheduler` | once | Scheduling policy |
| 8 | `@arkzen:os:syscall:<name>` | per syscall | Syscall number, arguments, returns |
| 9 | `@arkzen:os:driver:<name>` | per driver | Driver declaration (in-OS or host-OS) |
| 10 | `@arkzen:os:fs` | once | Filesystem and mounts |
| 11 | `@arkzen:os:userland:<name>` | per program | Userland program declaration |
| 12 | `@arkzen:os:shell` | once | Built-in shell settings |
| 13 | `@arkzen:os:image` | once | Output images and partition layout |
| 14 | `@arkzen:os:run` | once | Emulator run configuration |
| 15 | `@arkzen:os:test:<name>` | per test | Boot test expectations |
| 16 | `@arkzen:os:assets` | once | Files bundled into the image or kernel |
| 17 | `@arkzen:os:distro` | once | Distribution build configuration |
| 18 | `@arkzen:os:board` | once | Microcontroller board and peripherals |

**Code (Shape B or C), 2**

| # | Marker | Repeat | Purpose |
|---|---|---|---|
| 19 | `@arkzen:os:source:<lang>:<name>` | per file | One source file in that language |
| 20 | `@arkzen:os:readme` | once | README markdown body |

`<lang>` is one of `rs`, `c`, `asm`, `go` (firmware only), plus `cpp` if confirmed (section 13).
`<arch>` is one of `x86_64`, `aarch64`, `riscv64`, `x86`, `arm-cortex-m`.
`[:id]` names a project when a tatemono makes more than one.

### 7.4 Header keys per block (proposed)

**`os:project[:id]`**
- `name`, `version` (default `meta.version`), `description` (default `meta.description`), `license` (SPDX id), `author`
- `kind`: `kernel` | `os` | `bootloader` | `bootapp` | `firmware` | `unikernel` | `driver` | `distro` | `desktop`
- `arch[]`: architectures to build
- `language`: `rs` | `c` | `asm` | `go` (primary kernel language)
- `kernel_type`: `monolithic` | `microkernel` | `hybrid` | `unikernel` | `exokernel` | `rtos`
- `host` (driver kind only): `linux` | `windows` | `macos`

**`os:target:<arch>`**
- `triple` (Rust target triple or toolchain triple), `cpu`, `features[]`, `page_size`, `page_levels`, `machine` (emulator machine type)
- `toolchain`: `channel` and `components[]` for Rust, or compiler and flags for C
- `abi`, `red_zone` (bool), `soft_float` (bool)

**`os:config`**
- `features[]`: `serial_log`, `framebuffer_console`, `heap`, `scheduler`, `syscalls`, `userland`, `filesystem`, `network`
- `log_level`, `panic`: `halt` | `reboot` | `dump`, `debug_assertions` (bool), `banner` (string), `constants` (object)

**`os:boot`**
- `firmware`: `bios` | `uefi` | `direct` (arch dependent; BIOS is x86 only)
- `loader`: `bootloader_crate` | `limine` | `grub` | `custom` | `none`
- `requests`: `memory_map`, `framebuffer` (`width`, `height`, `bpp`), `rsdp`, `modules[]`, `cmdline`
- `higher_half` (bool), `kernel_base`, `stack_size`

**`os:memory`**
- `physical`: `bitmap` | `buddy` | `freelist`
- `paging`: `levels`, `huge_pages` (bool), `kernel_mapping`
- `heap`: `allocator` (`bump` | `linked_list` | `slab`), `start`, `initial_size`, `max_size`
- `regions[]`: `name`, `base`, `size`, `flags` (read, write, exec), `kind` (code, data, stack, heap, mmio)
- `guard_pages` (bool)
- The linker script is generated from `regions[]` and the target.

**`os:interrupts`**
- `controller`: `pic` | `apic` | `gic` | `plic`
- `exceptions[]`: names handled and handler reference
- `irqs[]`: `name`, `line`, `handler` (reference of the form `<source name>::<function>`)
- `timer`: source and `hz`

**`os:scheduler`**
- `policy`: `round_robin` | `priority` | `mlfq` | `cooperative` | `none`
- `tick_hz`, `preemptive` (bool), `max_tasks`, `stack_size`, `idle_task` (bool), `smp` (bool, not promised to be stable)

**`os:syscall:<name>`**
- `number`, `args[]` (`name`, `type`), `returns` (type), `errors[]`, `privilege`
- `handler`: `<source name>::<function>`
- Generates the kernel dispatch table, userland stubs for each userland language, and a syscall reference page. Numbers must stay stable once published.

**`os:driver:<name>`**
- `class`: `serial` | `framebuffer` | `keyboard` | `mouse` | `timer` | `rtc` | `disk` | `nic` | `usb` | `gpio` | `i2c` | `spi` | `uart` | `pci` | `virtio`
- `bus`: `platform` | `pci` | `usb` | `virtio` | `i2c` | `spi`
- `ports[]` or `mmio` (`base`, `size`), `irq`, `model`: `polling` | `interrupt` | `dma`
- `exposes`: device node or API name
- `handler`: `<source name>::<function>`
- For `host` drivers: `module` (Linux module name), `params[]`, `inf` and `signing` notes (Windows), `entitlements` notes (macOS DriverKit). These are build inputs only.

**`os:fs`**
- `type`: `ramfs` | `tarfs` | `fat32` | `ext2` | `custom`
- `root`: source folder or archive for the initial filesystem, `mounts[]` (`path`, `device`, `type`), `vfs` (bool)

**`os:userland:<name>`**
- `language`: `rs` | `c` | `asm`, `entry`, `args[]`, `autostart` (bool), `order`
- `libc`: `none` | `minimal` | `external`, `stack_size`, `heap_size`

**`os:shell`**
- `prompt`, `builtins[]` (names), `history` (bool), `line_edit` (bool)
- Builtin bodies are `os:source` blocks.

**`os:image`**
- `formats[]`: `iso` | `raw` | `uefi_disk` | `efi_app` | `elf` | `bin` | `uf2` | `sd_image` | `initramfs`
- `partitions[]`: `name`, `size`, `fs`, `contents[]`
- `size`, `bootloader_install` (bool), `checksums` (`sha256`)
- Images are written only into `projects/os/...`. Writing to a device is refused (rule 4).

**`os:run`**
- `emulator`: `qemu`, `machine`, `cpu`, `ram`, `cores`
- `devices[]` (for example `virtio-blk`, `serial`, `vga`, `nic`), `display`: `none` | `gtk` | `sdl` | `vnc`
- `serial`: `stdio` | `file` | `none`, `accel`: `auto` | `kvm` | `tcg`
- `debug`: `gdb` (bool), `port`; `extra_args[]`

**`os:test:<name>`**
- `kind`: `boot` | `unit`
- `boot`: `timeout`, `expect[]` (regex lines on serial), `forbid[]` (for example `panic`), `input[]` (scripted keys), `exit`: how the guest reports pass or fail (an exit device, semihosting or a magic serial line, per architecture)
- `unit`: runs pure kernel logic as normal host tests (`cargo test` style)

**`os:assets`**
- `include[]` (globs under `tatemonos/<name>/assets/`), `dest`, `embed` (bool: compile into the kernel, or place in initramfs)
- `fonts[]`: bitmap console fonts

**`os:distro`**
- `builder`: `buildroot` | `yocto` | `debootstrap` | `alpine` | `nixos` and others
- `base`, `packages[]`, `kernel_fragments[]`, `init`: `systemd` | `openrc` | `busybox` | `custom`
- `users[]` (names only), `services[]`, `overlay[]` (files), `hostname`, `locale`
- Pluffy generates the builder's configuration. The heavy build runs the builder itself on a Linux host.

**`os:board`**
- `name`, `chip`, `clock`, `flash`, `ram`
- `runtime`: `bare` | `embassy` | `freertos` | `zephyr` | `other`
- `peripherals[]`: `gpio` (pins), `uart`, `i2c`, `spi`, `adc`
- `flash_tool`: `uf2` | `openocd` | `probe_rs` (instructions printed, never executed)

**`os:source:<lang>:<name>`**
- Header: `part`: `kernel` | `user` | `boot` | `driver` | `lib` | `test`, `arch` (required for `asm`), `path` (default by language), `entry` (bool)
- Body is code in that language, written verbatim. `no_std` is the default for `rs` kernel parts.

**`os:readme`** body is markdown. If omitted, a README is generated from the project fields, build steps and run command.

### 7.5 Existing DSL reused unchanged

- `@arkzen:meta` (name, version, description). An OS tatemono is detected by `os:*` blocks.
- `@arkzen:file:id` for extra files. Optional `{os}` path prefix starting inside the exported project.
- The `assets/` folder convention.

### 7.6 Which blocks each kind uses

R = required, O = optional, X = not used.

| Kind | project | target | boot | memory | interrupts | scheduler | syscall | driver | fs | userland | image | run | test | board | distro | source |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| kernel | R | R | R | R | O | O | O | O | O | X | R | R | R | X | X | R |
| os | R | R | R | R | R | R | R | O | O | R | R | R | R | X | X | R |
| bootloader | R | R | R | O | O | X | X | X | X | X | R | R | R | X | X | R |
| bootapp | R | R | R | O | O | X | X | O | X | X | R | R | R | X | X | R |
| firmware | R | R | X | O | O | O | X | O | X | X | R | O | O | R | X | R |
| unikernel | R | R | R | R | O | O | O | O | O | X | R | R | R | X | X | R |
| driver | R | O | X | X | X | X | X | R | X | X | X | O | O | X | X | R |
| distro | R | O | X | X | X | X | X | X | X | X | R | O | O | X | R | X |
| desktop | R | O | X | X | X | X | X | X | X | R | O | O | O | X | O | R |

### 7.7 Validator rules (proposed)

- Names and ids are unique; kinds and blocks agree with the table in 7.6.
- `arch` values are valid; BIOS firmware is allowed only for `x86` and `x86_64`; the loader is compatible with the firmware and architecture.
- Memory regions do not overlap, are page aligned, and the heap start lies inside a region; stack sizes are aligned.
- Syscall numbers are unique and not reused; argument and return types are valid; every `handler` reference names an existing `os:source` block.
- IRQ lines are valid for the declared controller; driver class and bus are consistent; MMIO ranges do not collide.
- Image partitions fit within the declared size; image `contents` exist; no output path points at a device (for example under `/dev/`).
- `os:run` references only declared devices; every test references an existing run configuration.
- `asm` source blocks declare `arch`.
- `host` drivers use only keys valid for that host.
- No secret-like keys (token, password, secret, key) in any `os:*` block; distro `users` carry names only.
- `license` is a valid SPDX id; `version` is valid semver.
- Warn when a required toolchain or emulator is not installed: the target builds only where possible and verifies as UNVERIFIED.
- Reject any generated-code path that would import from Pluffy (rule 1).

---

## 8. Examples (illustrative, not compiled)

### 8.1 Minimal x86_64 kernel with a boot test

```tsx
/* @arkzen:meta
name: tiny-kernel
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
*/

/* @arkzen:os:boot
firmware: uefi
loader: bootloader_crate
requests:
  memory_map: true
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
```

`crate::serial` is a module the generator would emit from `os:driver:serial`. Proposed, not built.

### 8.2 Syscall table

```tsx
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
```

The generator emits the dispatch table in the kernel and matching stubs for each userland language.

### 8.3 Distribution configuration

```tsx
/* @arkzen:os:project
name: kiosk
kind: distro
license: MIT
*/

/* @arkzen:os:distro
builder: buildroot
packages: [busybox, dropbear]
init: busybox
hostname: kiosk
users:
  - name: operator
*/

/* @arkzen:os:image
formats: [raw]
*/
```

### 8.4 Microcontroller firmware

```tsx
/* @arkzen:os:project
name: blinker
kind: firmware
arch: [arm-cortex-m]
language: rs
license: MIT
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
```

Board and chip names above are placeholders, not real hardware definitions.

---

## 9. Engine work list

**Parser and validation (engine-core, then sync to every stack)**
- `parser.ts`: add `os` to the tag-prefix regex; register YAML-only tags (`project`, `target`, `config`, `boot`, `memory`, `interrupts`, `scheduler`, `syscall`, `driver`, `fs`, `userland`, `shell`, `image`, `run`, `test`, `assets`, `distro`, `board`) and code tags (`source`, `readme`); multi-line opener exemption for Shape B; `parsed.os`; `validatePages` exemption when `os:*` blocks exist.
- `validator.ts`: the rules in 7.7.
- Each stack's `arkzen/types/index.ts`: `ArkzenOs*` types (the parser imports `../types`).
- Check that the web watcher no longer logs errors for OS tatemonos (finding 2).
- Do this in the same pass as the `ext`, `pkg` and `term` families. It is the same change.

**New engine folder**
- `engine/os/common/`: linker script generator, image builder, QEMU runner, boot test harness (headless run, serial capture, timeout, expectations), syscall table generator, driver registry, license texts.
- `engine/os/rs/`, `c/`, `asm/`, `distro/`, `firmware/`, `hostdriver/{linux,windows,macos}/`, each with a generator and `node --test` tests in the style of `engine/game/unreal/generator.test.js`.
- `engine/os/package.json` for tool dependencies, installed by `deps install os`.
- Reuse the helper ideas from `engine/game/common/` (YAML reading, validators, asset lookup, staged replace) without importing from a stack's `node_modules`.

**Generators**
- Boot stubs and linker script from `os:boot`, `os:memory` and `os:target`.
- Kernel project layout (crate, cargo config, target spec) from `os:project`.
- Syscall dispatch and userland stubs from `os:syscall`.
- Driver skeleton modules from `os:driver`.
- Interrupt tables from `os:interrupts`.
- Images from `os:image`; run scripts from `os:run`.
- Builder configuration from `os:distro`.
- Board and flash instructions from `os:board`.

**CLI and export**
- `export.js`: `os` branch. `mizumi.js`: export wiring, `run`, menu, `deps install os`, `new --template`. Check how `cmdPublish` and `publishProject` treat the nested `projects/os/` folder (games share `projects/<engine>/`).
- `start.js`: `--only=os` rebuild watcher.
- `scaffold.js`: `BLOCKS` entries, `SHAPE_A_TAGS`, family parsing for `os`, templates `kernel`, `os`, `firmware`, `driver`, `distro`, cross-checks.
- `file-writer.ts`: optional `{os}` prefix.
- `gui/renderer/menu.js`: entries (game entries exist there).

**Editor tooling and docs**
- `vscode-extension/extension.js` (tag regex around line 342), `lib/snippets.js`, `lib/scaffold.mjs`, `syntaxes/tatemono.tmLanguage.json`.
- `PLUFF_GUIDELINES_v14.md` new Part, quick lookup table and Section 3 order list; `PLUFF_DSL_CATALOG.md`, `README.md`, `PLUFFY_RUN_GUIDE.md`, `FUTURE_PLANS.md` status.
- `scan.js`, `tatemono-index.js`, `descriptions.json`: AI training data and index need OS examples once the DSL is stable.

---

## 10. Verification policy

- Kernels, bootloaders, boot apps and unikernels: build, make the image, boot it headless in the emulator, capture the serial output, check `expect` and `forbid`, and fail on timeout. The mechanism for reporting pass or fail differs per architecture (an exit device on x86 QEMU, semihosting or a magic serial line elsewhere). All from knowledge, untested.
- Unit tests: pure kernel logic runs as normal host tests.
- Firmware: build and check the binary and size. Flashing is manual. Simulators are optional and unverified.
- Host drivers: build only. Linux modules need kernel headers and are loaded only in a VM by the user. Windows drivers need the Windows Driver Kit on Windows and signing. macOS DriverKit extensions need Xcode on macOS. None of these can be verified on a Linux machine.
- `distro`: validate the generated builder configuration. The full build needs the builder and a Linux host and may take hours (from knowledge).
- If a toolchain or emulator is missing, the export still writes the project where it can, marks it UNVERIFIED in the report, and never claims it passed.
- Verify the exported project builds with no Pluffy files present.

---

## 11. Safety rules (from section 6.2, stated once more)

- No writes to physical disks or devices. Images only. Flashing instructions are printed, never executed.
- Kernel modules and drivers are never loaded on the host by Pluffy.
- Kernel modules run in ring 0 and can crash or corrupt the machine. Test only in a VM.
- No passwords, tokens or keys in any block.
- Windows driver signing and macOS entitlements are the user's responsibility. Pluffy documents what is needed.

---

## 12. Work order (order only, everything above is in scope)

1. Register the `os` family in the parser, validator, types, scaffold and VS Code, together with `ext`, `pkg` and `term`. Done when an OS tatemono parses with zero web-watcher errors and existing tatemonos parse exactly as before.
2. `engine/os/common/` plus the Rust `x86_64` bare kernel (boot, serial driver, image, headless QEMU boot test). Needs `rustc`, `cargo` and QEMU, none of which are in the author's sandbox. Whether the chosen boot crates need a nightly Rust toolchain was not checked.
3. Memory, interrupts and core drivers (serial, framebuffer, keyboard, timer).
4. Scheduler, syscalls, userland, executable loader, filesystem, shell.
5. `aarch64` and `riscv64`.
6. `bootloader`, `bootapp` and `unikernel` kinds.
7. `firmware` boards.
8. `distro` configuration writers.
9. Host drivers: Linux, then Windows and macOS.
10. Tooling and docs: scaffold templates, menus, VS Code, guideline Part, catalog, README, run guide, `FUTURE_PLANS.md`, AI training data.

---

## 13. Risks and unverified items

- Nothing has been built or run. No emulator was available in the sandbox.
- The sandbox has `gcc` and `ld` only. `rustc`, `cargo`, QEMU, `nasm` and other OS-dev tools were not present. The mirror is allowlisted but installing them was not tried.
- Everything about OS design, QEMU behavior, boot protocols, exit mechanisms, TinyGo, Buildroot and Yocto, driver signing and DriverKit is from knowledge and untested.
- Crate roles in section 4 are from knowledge. Only the version and publish date were checked.
- The new language codes `c`, `asm` and possibly `cpp` for the `os` family are a recommendation. Mizumi has not decided.
- Whether Rust OS projects need a nightly toolchain with these crates: not checked.
- `os:distro` depends on external builders running on a Linux host.
- Real-hardware behavior cannot be verified by Pluffy.
- `mizumi publish` and `projects/os/` nesting is unchecked.
- The generated `serial` module, handler reference syntax (`<source name>::<function>`) and all header keys are proposals.
- The scale of this phase is far larger than the earlier ones. The roadmap itself calls it the most ambitious and says "explore".

---

## 14. What the planning session did and did not read

Read fully: `FUTURE_PLANS.md`, `PLUFF_DSL_CATALOG.md`. Read in earlier sessions: `README.md`, `PLUFF_GUIDELINES_v14.md` Sections 1, 1B, 1C, 1D, 1G, 3, 3D, 4, 19C, 26B, 28B, 30, `parser.ts` tag validation, `validatePages` and `parseTatemono`, `shared-sync.ts`, `start.js` (header and spawn sections), the `mizumi.js` command list and `cmdPublish`, `engine/game/common/index.js`.
Checked this session: the available tools in the sandbox, and crates.io for `bootloader`, `bootloader_api`, `x86_64`, `uefi`, `limine`, `multiboot2` and `riscv`.
NOT read: any OS-specific code (the repo has none), the backend generators, the Tauri Rust code, `export.js` beyond the earlier game and desktop sections.
NOT checked: every tool other than `gcc` and `ld` in the sandbox, TinyGo, the Linux, Windows and macOS driver toolchains, Buildroot, Yocto, debootstrap, Alpine and NixOS tooling.

---

## 15. Future addition: Java / Kotlin / Swift layer

Mizumi's instruction: "the Java/Kotlin/Swift layer of the OS will be added when the frontend extension plan will happen in the future. They are connected."

Recorded as follows:
- This plan covers the low-level parts: boot, kernel, drivers, distribution and firmware, in Rust, C and assembly.
- The Java, Kotlin and Swift layer (the application and framework layer above a kernel, in the way mobile platforms put one on top of their kernels, from knowledge) is NOT part of this plan. It will be added later, together with a future plan that extends Pluffy's frontend side with those languages.
- That future plan does not exist yet. No design, DSL or folder is reserved for it here.
- Verified fact relevant to it: Pluffy's current language codes are `php`, `ts`, `py`, `java`, `cs`, `go`, `rs` (catalog). `java` exists. `kt` (Kotlin) and `swift` do not, so they would need adding as new codes when that plan is written.
- Interpretation note: the phrase "frontend extension plan" was read as a future plan that extends the frontend side with Java, Kotlin and Swift. It was NOT read as `PLUFFY_EXTENSION_PLAN.md` (the browser extension plan). If it means that file, this section needs correcting.
- When that plan is written, this OS plan should get a new section describing the connection (which `os:*` blocks gain a framework layer, and how it builds and is tested).

---

## 16. Start here in the next session

Paste this into the new Claude session along with the repo URL:

> Read `PLUFFY_OS_PLAN.md`, `PLUFFY_TERMINAL_PLAN.md`, `PLUFFY_PACKAGE_PLAN.md` and `PLUFFY_EXTENSION_PLAN.md`, then read `engine/shared/arkzen/engine-core/parser.ts` (`validateDslTags`, `validatePages`, `parseTatemono`) and `shared-sync.ts`. Do step 1 only: register the `ext`, `pkg`, `term` and `os` families so tatemonos containing them parse with zero errors in the web watcher and existing tatemonos are unchanged. Show complete files, not diffs.

Constraints Mizumi has stated for this work: direct and decisive answers instead of option lists, complete file outputs instead of snippets or diffs, no unsolicited feature suggestions, read the actual source files before suggesting fixes, no em dashes. Mizumi wants the full scope listed, not split into versions.
