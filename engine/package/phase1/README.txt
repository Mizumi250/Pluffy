Pluffy Package plan, Phase 1: register the pkg family

1. Paste this zip's contents into the Pluffy repo root (it only adds files under engine/package/).
2. From the repo root run:   node engine/package/phase1/apply.mjs
   (add --dry first if you want to see what it will touch; it is safe to run twice)
3. Test:   cd engine/frontend/react-vite
           npx tsx --test ../../package/tests/phase1.test.ts
4. Try:    node mizumi.js new my-pkg --template=package
           node mizumi.js check my-pkg
5. Delete engine/package/phase1/ once applied. Keep fixtures/ and tests/.

apply.mjs edits parser.ts, validator.ts (shared + the stack copies), every stack types/index.ts,
scaffold.js, mizumi.js (help text) and vscode-extension/extension.js with small anchored insertions,
so changes the extension session made to the same files are kept. If an anchor is missing it stops
before writing anything and tells you which one.
