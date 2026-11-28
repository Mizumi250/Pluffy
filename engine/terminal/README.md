# engine/terminal

Pluffy's terminal engine: command line tools and terminal UIs from `@arkzen:term:*` blocks.
Plan: `PLUFFY_TERMINAL_PLAN.md`.

## Status

- Step 1: the `term` block family is registered in the shared parser and validator and in every stack's types.
- Step 2: command line programs in TypeScript (commander). Builds, runs `--help`, `--version`, every command's examples and your tests.
- Step 3: prompts (`term:prompt`), scaffolders (a prompt plus `term:assets` templates), bundled assets, and a pseudo-terminal harness that drives the program like a person.
- Not built yet: terminal UI screens on Ink, `term:config`, data, loops, themes and keymaps (step 4), other languages (step 5), completions, man pages and packaging (step 6).

## Use

```
npm install                                         this folder's own dependencies (or: node engine/terminal/cli.js deps)
node engine/terminal/cli.js build <tatemono>        generate, install, build and verify
node engine/terminal/cli.js verify <tatemono>       run the checks again on what build produced
node engine/terminal/cli.js check <tatemono>        parse and validate only
```

Output goes to `projects/terminal/<tatemono>/<lang>/`. Options: `--lang=ts`, `--out=<dir>`, `--no-install`, `--no-verify`.

`build` needs Node 22.12 or newer and the npm registry (the generated project installs commander and TypeScript).

Fixtures to try: `term-todo-cli`, `term-cli-features` (every command feature), `term-cli-prompts` (every question type), `term-create-site` (a scaffolder).

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

## Prompts

A command with `prompt: <name>` asks the prompt's questions before its handler runs, with `@inquirer/prompts` (pinned, Node 22.13 or newer). The answers reach the handler on `ctx` under the prompt's `result` name (default `answers`):

```ts
export default function survey({ profile, out }) {
  out.json(profile)
}
```

Every question can also be answered without a terminal. For each step the value is taken from, in order: a command argument or flag with the same name, the flag its `fallback` names, the environment variable its `fallback` names, then asked in a terminal, then the step's `default`. A required question with no value and no terminal stops with `missing value for "name": pass --name or set SURVEY_NAME`.

- Each `fallback.flag` becomes a real flag on the command. `--no-input` is added too, and stops all questions even in a terminal.
- Question types: `text`, `password`, `number`, `confirm`, `select`, `multiselect`, `path`, `autocomplete` (a search list, plain text when it has no `choices`), `editor` (opens `$EDITOR`).
- `validate`: `regex` for text, `min` and `max` for numbers (and for the length of text and lists), `length` for an exact length. The same rules run in a terminal and without one.
- `when: { earlier_step: value }` asks the question only when that earlier answer has that value. A list answer matches when it contains the value.
- Ctrl+C in a question exits with 130.

## Scaffolders and assets

A command with a `prompt`, no handler, and `term:assets` `templates` is a scaffolder: it asks the questions, then writes every template. In a template, `{{name}}` is replaced by the answer called `name`, but only for the names the template lists under `variables`. Other braces are left alone. Targets are relative to the current folder, a target that would leave it is refused, and existing files are never overwritten without `--force`. Binary templates are copied byte for byte. Only one command may be generated this way per project.

`term:assets` `include` globs and every template source are shipped with the program. With `embed: true` they are compiled into `src/assets.ts` (base64). Without it they are copied into the `dest` folder (default `assets`) beside the code and listed in `files`. A handler can read them with `import { readAsset } from '../assets.js'`.

## Pseudo-terminal harness

`common/pty.js` runs a program in a real terminal of a given size and plays a script of expected output and keystrokes (arrow keys, space, Enter, Ctrl+C). It uses Python's standard library `pty`, so it needs `python3` and works on Linux and macOS. Where it cannot run, the checks that need it are reported UNVERIFIED, never passed.

`build` runs these checks on every command with a prompt: without a terminal it names the missing input, in a terminal the first question appears and Ctrl+C exits with 130, and (when every question has a default) pressing Enter through all of them completes.

## Tests

```
npm test             sync the shared parser, then run every test
```

`ts/e2e.test.js` does a real `npm install` and `tsc` build in a temp folder. It skips, with the reason, when the registry cannot be reached.

`common/core/` and `common/types/` are generated copies of the shared engine files (gitignored). Edit the originals in `engine/shared`.
