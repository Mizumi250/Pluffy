Pluffy Package plan, Phase 4: the remaining npm kinds, plus GitHub Packages and JSR

Nothing here edits files outside engine/package, so there is no apply script: paste the zip at the repo root.
(Phases 1 to 3 must already be applied, including their apply.mjs scripts.)

1. node mizumi.js deps install package     adds @types/react and tinyglobby to the tools (npm install in engine/package)
2. Try the fixtures (copy each folder from engine/package/fixtures/ into tatemonos/, same folder name):
     node mizumi.js export ui-kit package               kind components (React, CSS export, rendered with react-dom/server)
     node mizumi.js export eslint-config-kit package    kind config (files shipped as written)
     node mizumi.js export brand-assets package         kind assets (byte-identical copy, optional index module)
     node mizumi.js export create-demo-app package      kind template (an npm create style scaffolder)
     node mizumi.js export demo-cli package             kind cli (commands are run from the installed package)
     node mizumi.js export vite-plugin-demo package     kind plugin (Vite contract checked)
     node mizumi.js export greet-github package         GitHub Packages variant (@owner/name, npm.pkg.github.com)
     node mizumi.js export greet-jsr package            JSR variant (add --jsr-dry-run to run jsr's own dry run; it downloads Deno)
3. Tests:  cd engine/package && npm test               (58 tests)
           npx tsx --test tests/phase1.test.ts          (30 tests, needs one installed web stack)
4. Delete engine/package/phase4/ when you like.

Globs inside a block comment: a pattern such as **/*.svg contains "*/" and ends the comment early.
Write it as "**\/*.svg" in double quotes (\/ is a valid YAML escape for /). See engine/package/fixtures/brand-assets.
