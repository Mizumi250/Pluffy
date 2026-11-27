Pluffy Package plan, Phase 2: npm library generator + pack-and-install verify

1. Paste this zip into the Pluffy repo root. (Phase 1 must already be applied.)
2. node engine/package/phase2/apply.mjs          (adds the mizumi commands; --dry to preview)
3. node mizumi.js deps install package           (installs tsdown, typescript, tsx, js-yaml into engine/package)
4. Try it on the greet-kit fixture (kind: library, npm):
     copy engine/package/fixtures/greet-kit into tatemonos/  (folder name must stay greet-kit)
     node mizumi.js export greet-kit package
   Output: projects/package/greet-kit/greet/npm/  (gitignored) with the packed .tgz inside.
5. Tests:  cd engine/package && npm test           (18 tests; needs step 3)
           npx tsx --test tests/phase1.test.ts     (needs step 3 and one installed web stack)
6. Delete engine/package/phase2/ once applied.

Supported now: kind: library on npm. Other kinds and registries print "not implemented yet".
Pluffy never publishes and never stores credentials; publish yourself with `npm publish` from the output folder.
