'use strict'
// Bundles the in-app editor (Monaco + Shiki) into renderer/dist/. Run automatically before
// `npm start` and `npm run dist`; run `npm run build` by hand after editing renderer/editor-src.js.

const path = require('node:path')
const fs = require('node:fs')
const { spawnSync } = require('node:child_process')

// New build tools arrive with updates. If they are not installed yet, install them once, then run the
// build again in a fresh process (Node remembers a failed lookup for the rest of the current run, so
// requiring the freshly installed package from this same process can still fail).
function loadEsbuild() {
  const guiDir = path.resolve(__dirname, '..')
  try { return require(require.resolve('esbuild', { paths: [guiDir] })) } catch (e) {
    if (e.code !== 'MODULE_NOT_FOUND') throw e
    if (process.env.PLUFFY_BUILD_RETRY) { console.error('esbuild is still missing after npm install. Run "npm install" inside gui/ by hand and read its output.'); process.exit(1) }
    console.log('The editor build tools are not installed yet. Running "npm install" in gui/ (one time)...')
    const install = spawnSync('npm', ['install', '--no-audit', '--no-fund'], { cwd: guiDir, stdio: 'inherit', shell: true })
    if (install.status !== 0) { console.error('\nnpm install failed. Run "npm install" inside gui/ by hand, then try again.'); process.exit(1) }
    const again = spawnSync(process.execPath, [__filename], { cwd: guiDir, stdio: 'inherit', env: { ...process.env, PLUFFY_BUILD_RETRY: '1' } })
    process.exit(again.status === null ? 1 : again.status)
  }
}
const esbuild = loadEsbuild()

const root = path.resolve(__dirname, '..')
const out = path.join(root, 'renderer', 'dist')
const editorDir = path.join(root, 'node_modules', 'monaco-editor', 'esm', 'vs', 'editor')

// Monaco's own editor.main.js also registers every bundled language and the TypeScript/CSS/HTML/JSON
// workers, which this app does not use (syntax colors come from TextMate grammars). This virtual
// module re-imports only the editor features from editor.main.js, so the bundle stays small and
// keeps working when Monaco moves files around between versions.
const monacoContrib = {
  name: 'monaco-contrib',
  setup(build) {
    build.onResolve({ filter: /^pluffy:monaco-contrib$/ }, () => ({ path: 'monaco-contrib', namespace: 'pluffy' }))
    build.onLoad({ filter: /.*/, namespace: 'pluffy' }, () => {
      const main = fs.readFileSync(path.join(editorDir, 'editor.main.js'), 'utf8')
      const lines = [...main.matchAll(/^import ['"](\.[^'"]+)['"];?$/gm)]
        .map((m) => m[1])
        .filter((rel) => !/(^|\/)languages\//.test(rel) && !/external\//.test(rel))
        .map((rel) => `import ${JSON.stringify(path.resolve(editorDir, rel))}`)
      return { contents: lines.join('\n'), loader: 'js', resolveDir: editorDir }
    })
  },
}

async function main() {
  fs.rmSync(out, { recursive: true, force: true })
  await esbuild.build({
    absWorkingDir: root,
    entryPoints: {
      editor: 'renderer/editor-src.js',
      'editor.worker': 'node_modules/monaco-editor/esm/vs/editor/editor.worker.js',
    },
    outdir: 'renderer/dist',
    bundle: true,
    format: 'iife',
    minify: true,
    target: 'chrome120',
    loader: { '.ttf': 'file' },
    plugins: [monacoContrib],
    logLevel: 'warning',
    legalComments: 'none',
  })
  const files = fs.readdirSync(out)
  const size = files.reduce((n, f) => n + fs.statSync(path.join(out, f)).size, 0)
  console.log(`renderer/dist: ${files.length} files, ${(size / 1048576).toFixed(1)} MB`)
}

main().catch((e) => { console.error(e); process.exit(1) })
