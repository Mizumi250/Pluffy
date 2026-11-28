# engine/os

Pluffy's operating system engine: kernels, operating systems, bootloaders, firmware, host drivers and distribution configuration from `@arkzen:os:*` blocks.
Plan: `PLUFFY_OS_PLAN.md`.

## Status

- Step 1: the `os` block family is registered in the shared parser and validator, in every stack's types, in `scaffold.js` and in the VS Code extension.
- Not built yet: the generator, the Rust `x86_64` kernel, QEMU boot tests (step 2), and everything after it (see section 12 of the plan).

Nothing here builds or boots an operating system yet. `check` style work (parse and validate) is what exists.

## Use

```
npm install                  this folder's own dependencies
npm test                     sync the shared engine files, then run the tests
node ../../scaffold.js ...   or: node mizumi.js new <name> --template=kernel|os|firmware|driver|distro
```

Fixtures to try: `os-tiny-kernel`, `os-kernel-features`, `os-kiosk-distro`, `os-blinker-firmware`, `os-hello-module`.

## What is checked today

`validateOs()` in `engine/shared/arkzen/engine-core/validator.ts` reads the contracts in section 7.7 of the plan: the kind and block matrix, architectures and targets, memory layout and alignment, IRQ ranges, syscall numbers, handler references, partition sizes, device-path and secret rules, and the toolchains that are installed. A missing toolchain is a warning, and the target would verify as UNVERIFIED.

`npm test` copies `parser.ts`, `validator.ts`, `backends.ts` and `file-writer.ts` from `engine/shared/arkzen/engine-core/` into `common/core/` (generated, gitignored) so this folder resolves `js-yaml` from its own `node_modules`.
