Pluffy Package plan, Phase 3: derived kinds on npm (sdk, types, validators, openapi)

1. Paste this zip into the Pluffy repo root. (Phases 1 and 2 must already be applied.)
2. node engine/package/phase3/apply.mjs       (one small validator edit: include: [..., auth]; --dry to preview)
3. node mizumi.js deps install package         (if you have not already; installs tsdown, typescript, tsx, js-yaml, @types/node)
   The derived kinds also need one web stack installed (node mizumi.js deps install nextjs), because they read
   your api and database blocks with the engine parser.
4. Try the four fixtures (copy each folder from engine/package/fixtures/ into tatemonos/, same folder name):
     node mizumi.js export notes-sdk package          typed client, verified against a mock HTTP server
     node mizumi.js export notes-types package        TypeScript types from api and database blocks
     node mizumi.js export notes-validators package   validators, verified against all 177 conformance vectors
     node mizumi.js export notes-openapi package      OpenAPI 3.1 spec as module + json + html
   Output: projects/package/<tatemono>/<package-id>/npm/ (gitignored), with the packed .tgz inside.
   Options: --stack=<frontend> --backend=<name> --api-url=<url> --no-verify
5. Tests:  cd engine/package && npm test        (35 tests)
           npx tsx --test tests/phase1.test.ts  (23 tests, needs one installed web stack)
6. Delete engine/package/phase3/ once applied.

sdk fixture note: languages [ts, py] with targets [npm, pypi] builds the npm package now; the py side waits for the PyPI phase.
