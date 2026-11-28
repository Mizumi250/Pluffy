Pluffy Package plan, Phase 5: PyPI (library and cli)

1. Paste this zip at the Pluffy repo root. (Phases 1 to 4 must already be applied.)
2. node engine/package/phase5/apply.mjs        one small validator edit (bin: <source>:<function>); --dry to preview
3. node mizumi.js deps install package         npm install in engine/package, then a Python virtual environment
                                               engine/package/.venv with build, hatchling and twine (needs Python 3.9+;
                                               without it only PyPI packages are affected: they report UNVERIFIED)
4. Try the fixtures (copy each folder from engine/package/fixtures/ into tatemonos/, same folder name):
     node mizumi.js export greet-py package        a typed Python library with unit tests
     node mizumi.js export demo-py-cli package     a command line tool (console script)
     node mizumi.js export greet-both package      one tatemono, an npm package AND a PyPI package
   Output: projects/package/<tatemono>/<package-id>/pypi/ (gitignored), wheel and sdist inside dist/.
5. Tests:  cd engine/package && npm test           (72 tests, the PyPI ones need step 3)
           npx tsx --test tests/phase1.test.ts      (33 tests, needs one installed web stack)

What a PyPI build does: src/<import_name>/ layout, pyproject.toml (hatchling), python -m build (sdist, then the wheel
from the sdist), twine check --strict, wheel and sdist content checks, then a fresh virtual environment where the WHEEL
is installed, imported, its tests are run (unittest, or pytest when a test uses it) and its commands are executed.
Semver versions are translated to PEP 440 (1.2.3-beta.1 becomes 1.2.3b1).
The Python versions of sdk, types, validators and openapi come in the next phase.
