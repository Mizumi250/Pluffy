Phase 1 fix: scaffold.js support for pkg blocks

Why it was needed: the terminal (term) session edited the same lines of parser.ts, validator.ts and scaffold.js,
so the original Phase 1 script found changed anchors and stopped before writing. parser.ts, validator.ts and the
types already had pkg support; scaffold.js (mizumi new --template=package, mizumi block pkg:*) did not.

Paste this zip at the repo root, then run:   node engine/package/phase1/apply.mjs
It now recognises edits that are already present (including lines where term was added next to pkg), and only
adds what is missing. Safe to run again.
