# engine/terminal

Pluffy's terminal engine: command line tools and terminal UIs from `@arkzen:term:*` blocks.
Plan: `PLUFFY_TERMINAL_PLAN.md`.

## Status

- Step 1: the `term` block family is registered in the shared parser and validator and in every stack's types.
- Step 2: command line programs in TypeScript (commander). Builds, runs `--help`, `--version`, every command's examples and your tests.
- Not built yet: prompts and terminal UIs (step 3), `term:config`, data, loops, themes and keymaps (step 4), other languages (step 5), completions, man pages and packaging (step 6).

## Use

```
npm install                                         this folder's own dependencies (or: node engine/terminal/cli.js deps)
node engine/terminal/cli.js build <tatemono>        generate, install, build and verify
node engine/terminal/cli.js verify <tatemono>       run the checks again on what build produced
node engine/terminal/cli.js check <tatemono>        parse and validate only
```

Output goes to `projects/terminal/<tatemono>/<lang>/`. Options: `--lang=ts`, `--out=<dir>`, `--no-install`, `--no-verify`.

`build` needs Node 22.12 or newer and the npm registry (the generated project installs commander and TypeScript).

Fixtures to try: `term-todo-cli`, `term-cli-features`.

## What the generated program looks like

```
package.json  tsconfig.json  README.md
src/cli.ts       commander wiring (generated)
src/runtime.ts   ctx, value parsers, output helpers (generated)
src/commands/    one file per term:handler:ts block, kept verbatim
src/scripts/     one file per term:script:ts block
tests/           your term:test:ts blocks, plus examples.test.ts built from the command examples
```

It depends on commander and Node only. Nothing in it refers to Pluffy, and `build` checks that.

### The handler contract

A handler is the default export of its file. It receives one `ctx` object and may return a number to set the exit code.

```ts
export default async function add({ args, flags, out, err, stdin, env, exit, command }) {
  out.line(`added: ${args.title}`)
  return 0
}
```

- `args` and `flags` are keyed by name, in camelCase (`--dry-run` is `flags.dryRun`). A variadic argument is an array. A repeatable flag is an array. A switch that was not given is `false`.
- `out.line`, `out.write`, `out.json`, `out.table`, `out.data`. `out.data` prints in the command's declared `output` kind. A command with an `output` also gets `--json`.
- `err.line`, `err.write`. `stdin.read()` returns standard input, `stdin.isTTY` says whether one is attached.
- `exit(code)` stops the command. Throwing an error prints `error: message` and exits 1.
- Handler bodies are not type annotated by default, so the generated `tsconfig.json` sets `noImplicitAny` to false.
- Import your own scripts with a `.js` ending: `import { x } from '../scripts/x.js'`.

## Tests

```
npm test             sync the shared parser, then run every test
```

`ts/e2e.test.js` does a real `npm install` and `tsc` build in a temp folder. It skips, with the reason, when the registry cannot be reached.

`common/core/` and `common/types/` are generated copies of the shared engine files (gitignored). Edit the originals in `engine/shared`.
