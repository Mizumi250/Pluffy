# engine/terminal

Pluffy's terminal engine: command line tools and terminal UIs from `@arkzen:term:*` blocks.
Plan: `PLUFFY_TERMINAL_PLAN.md`.

Status: step 1 only. The `term` block family is registered in the shared parser and validator
(`engine/shared/arkzen/engine-core/`) and in every stack's `arkzen/types/index.ts`. No generator exists yet.

```
npm install          install this folder's own dependencies
npm test             sync the shared parser and validator into common/core, then run tests/
```

`common/core/` and `common/types/` are generated copies (gitignored). Edit the shared originals.
