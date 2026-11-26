'use strict'
// Every mizumi.js command, as cards. Nothing here re-implements the CLI:
// each card just builds the argument list and the app types `node mizumi.js ...args` into a terminal.
//
//   run:   [args]            runs straight away
//   form:  { fields, build } asks first; build(values) returns [args] or [[args], [args], ...]
//   action: 'chat'           handled by the app (opens the chat window)

;(function () {
  const WEB = ['nextjs', 'react-vite', 'react-inertia', 'astro', 'tanstack-start']
  const APP = ['expo', 'react-native', 'lynx']
  const DESKTOP = ['tauri', 'electron']
  const BACKEND = ['laravel', 'express', 'fastapi', 'spring-boot', 'aspnet', 'go', 'rust']
  const DB = ['sqlite', 'postgresql']
  const TEMPLATES = ['web', 'crud', 'routes', 'auth', 'native', 'multi', 'lynx', 'files', 'godot', 'unity', 'unreal']
  const VARIANTS = [['php', 'Laravel (PHP)'], ['ts', 'Express (TypeScript)'], ['py', 'FastAPI (Python)'], ['java', 'Spring Boot (Java)'], ['cs', 'ASP.NET Core (C#)'], ['go', 'Go'], ['rs', 'Rust']]
  const EXPORT_TARGETS = [
    ...WEB.map((s) => ({ v: s, l: `${s}  (web)` })), ...APP.map((s) => ({ v: s, l: `${s}  (app)` })),
    ...DESKTOP.map((s) => ({ v: s, l: `${s}  (desktop)` })), { v: 'godot', l: 'godot  (game)' }, { v: 'unity', l: 'unity  (game)' }, { v: 'unreal', l: 'unreal  (game)' },
  ]

  const keep = { v: '', l: '(keep current)' }
  const tatemono = (extra = {}) => ({ id: 't', type: 'tatemono', label: 'Tatemono', required: true, ...extra })

  const groups = [
    { id: 'run', title: 'Run it', sub: 'Set up and launch' },
    { id: 'write', title: 'Write it', sub: 'Create and edit' },
    { id: 'stack', title: 'Stacks', sub: 'Web, app, desktop, backend, database' },
    { id: 'take', title: 'Ship it', sub: 'Export and publish' },
    { id: 'ai', title: 'AI', sub: 'Generate and review' },
    { id: 'repo', title: 'Repo', sub: 'Git copy in Documents/Pluffy' },
  ]

  const items = [
    // ---- run
    { id: 'classic', group: 'run', icon: 'square-terminal', title: 'Classic menu', desc: 'The original menu from mizumi.js, in a terminal tab.', cli: 'mizumi', run: [] },
    { id: 'setup', group: 'run', icon: 'wrench', title: 'Setup', desc: 'Check Node, git and your toolchains, then install what is missing.', cli: 'mizumi setup', run: ['setup'] },
    {
      id: 'start', group: 'run', icon: 'play', title: 'Start engine', desc: 'Run web, app and desktop together, or pick some. Rebuilds when you save a tatemono.', cli: 'mizumi start',
      form: {
        fields: [{ id: 'only', type: 'multi', label: 'Platforms', options: ['web', 'app', 'desktop'], value: ['web', 'app', 'desktop'] }],
        validate: (v) => (v.only.length ? '' : 'Pick at least one platform.'),
        build: (v) => (v.only.length === 3 ? ['start'] : ['start', '--only=' + v.only.join(',')]),
      },
    },
    {
      id: 'screenshot', group: 'run', icon: 'camera', title: 'Screenshot', desc: 'Capture a tatemono\'s web page as a PNG.', cli: 'mizumi screenshot',
      form: {
        fields: [tatemono(), { id: 'wait', type: 'text', label: 'Wait before shooting (ms, optional)', placeholder: '1500' }],
        build: (v) => ['screenshot', v.t, ...(v.wait ? ['--wait=' + v.wait] : [])],
      },
    },

    // ---- write
    {
      id: 'new', group: 'write', icon: 'file-plus', title: 'New tatemono', desc: 'Create a core.tsx from a template.', cli: 'mizumi new <name>',
      form: {
        fields: [
          { id: 'name', type: 'text', label: 'Name', placeholder: 'my-app', required: true, pattern: /^[a-z0-9][a-z0-9_-]*$/i, hint: 'Letters, numbers, - and _' },
          { id: 'tpl', type: 'select', label: 'Template', options: TEMPLATES, value: 'web' },
        ],
        build: (v) => ['new', v.name, '--template=' + v.tpl],
      },
    },
    {
      id: 'block', group: 'write', icon: 'blocks', title: 'Add DSL block', desc: 'Add a DSL block to a tatemono.', cli: 'mizumi block',
      form: {
        fields: [
          tatemono(),
          { id: 'block', type: 'text', label: 'Block', placeholder: 'web:page', required: true, hint: 'Use "List block types" to see them all' },
          { id: 'names', type: 'text', label: 'Names (space separated, optional)', placeholder: 'about contact' },
          { id: 'variant', type: 'select', label: 'Backend variant', optional: true, options: VARIANTS.map(([v, l]) => ({ v, l })) },
        ],
        build: (v) => ['block', v.t, v.block, ...v.names.split(/\s+/).filter(Boolean), ...(v.variant ? ['--' + v.variant] : [])],
      },
    },
    { id: 'block-guided', group: 'write', icon: 'square-terminal', title: 'Add block (guided)', desc: 'Pick the tatemono, DSL, block and backend step by step.', cli: 'mizumi block', run: ['block'] },
    { id: 'block-list', group: 'write', icon: 'list-tree', title: 'List block types', desc: 'Every block type you can add.', cli: 'mizumi block --list', run: ['block', '--list'] },
    { id: 'modules', group: 'write', icon: 'building-2', title: 'List tatemonos', desc: 'All tatemonos and how many pages each has.', cli: 'mizumi modules', run: ['modules'] },
    {
      id: 'check', group: 'write', icon: 'square-check', title: 'Check', desc: 'Lint tatemonos without starting the engine.', cli: 'mizumi check [name]',
      form: { fields: [tatemono({ required: false, optional: true, optionalLabel: '(all tatemonos)' })], build: (v) => ['check', ...(v.t ? [v.t] : [])] },
    },

    // ---- stack
    {
      id: 'stack-pick', group: 'stack', icon: 'arrow-left-right', title: 'Switch stacks', desc: 'Change web, app, desktop, backend or database.', cli: 'mizumi web|app|desktop|backend|db <name>',
      form: {
        fields: [
          { id: 'web', type: 'select', label: 'Web', options: [keep, ...WEB] }, { id: 'app', type: 'select', label: 'App', options: [keep, ...APP] },
          { id: 'desktop', type: 'select', label: 'Desktop', options: [keep, ...DESKTOP] }, { id: 'backend', type: 'select', label: 'Backend', options: [keep, ...BACKEND] },
          { id: 'db', type: 'select', label: 'Database', options: [keep, ...DB] },
        ],
        validate: (v) => (['web', 'app', 'desktop', 'backend', 'db'].some((k) => v[k]) ? '' : 'Pick at least one thing to change.'),
        build: (v) => ['web', 'app', 'desktop', 'backend', 'db'].filter((k) => v[k]).map((k) => [k, v[k]]),
      },
    },
    {
      id: 'deps', group: 'stack', icon: 'package', title: 'Dependencies', desc: 'Install or remove packages for a stack.', cli: 'mizumi deps',
      form: {
        fields: [
          { id: 'action', type: 'select', label: 'What', options: [{ v: '', l: 'Open the guided menu' }, { v: 'install', l: 'Install one stack' }, { v: 'uninstall', l: 'Remove one stack' }, { v: 'prune', l: 'Remove deps of unused stacks' }] },
          { id: 'stack', type: 'select', label: 'Stack (for install / remove)', optional: true, options: [...WEB, ...APP, ...DESKTOP, ...BACKEND] },
        ],
        validate: (v) => ((v.action === 'install' || v.action === 'uninstall') && !v.stack ? 'Pick a stack.' : ''),
        build: (v) => ['deps', ...(v.action ? [v.action] : []), ...(v.action === 'install' || v.action === 'uninstall' ? [v.stack] : [])],
      },
    },
    { id: 'stack-now', group: 'stack', icon: 'map-pin', title: 'Active stacks', desc: 'The stacks currently in use.', cli: 'mizumi stack', run: ['stack'] },
    { id: 'stacks', group: 'stack', icon: 'layers', title: 'All stacks', desc: 'Every supported stack.', cli: 'mizumi stacks', run: ['stacks'] },

    // ---- take
    {
      id: 'export', group: 'take', icon: 'upload', title: 'Export project', desc: 'Write a standalone web, app, desktop, Godot, Unity or Unreal project.', cli: 'mizumi export <name> <stack>',
      form: {
        fields: [
          tatemono(), { id: 'target', type: 'select', label: 'Target', required: true, options: EXPORT_TARGETS, value: 'react-vite' },
          { id: 'backend', type: 'select', label: 'Backend', optional: true, optionalLabel: '(default)', options: BACKEND },
          { id: 'docker', type: 'check', label: 'Add Dockerfile + docker-compose (web only)' }, { id: 'openapi', type: 'check', label: 'Add OpenAPI docs' },
        ],
        build: (v) => ['export', v.t, v.target, ...(v.backend ? ['--backend=' + v.backend] : []), ...(v.docker ? ['--docker'] : []), ...(v.openapi ? ['--openapi'] : [])],
      },
    },
    {
      id: 'openapi', group: 'take', icon: 'book-open', title: 'OpenAPI docs', desc: 'Generate openapi.json and a Swagger page.', cli: 'mizumi openapi <name>',
      form: {
        fields: [tatemono(), { id: 'backend', type: 'select', label: 'Backend', optional: true, optionalLabel: '(default)', options: BACKEND }],
        build: (v) => ['openapi', v.t, ...(v.backend ? ['--backend=' + v.backend] : [])],
      },
    },
    {
      id: 'publish', group: 'take', icon: 'cloud-upload', title: 'Publish to GitHub', desc: 'Push an exported project to GitHub with your Git login.', cli: 'mizumi publish [name]',
      form: { fields: [{ id: 'p', type: 'project', label: 'Exported project', optional: true, optionalLabel: '(choose in the terminal)' }], build: (v) => ['publish', ...(v.p ? [v.p] : [])] },
    },

    // ---- ai
    {
      id: 'ai', group: 'ai', icon: 'pen-line', title: 'Pluffy AI', desc: 'Write a tatemono from a description of your app.', cli: 'mizumi ai "idea"',
      form: { fields: [{ id: 'idea', type: 'textarea', label: 'Describe your app (leave empty for the guided options)', placeholder: 'A clinic booking app with patients, doctors and appointments' }], build: (v) => ['ai', ...(v.idea.trim() ? [v.idea.trim()] : [])] },
    },
    { id: 'review', group: 'ai', icon: 'search-check', title: 'Review', desc: 'A second AI pass reads the project and suggests edits.', cli: 'mizumi review', run: ['review'] },
    { id: 'chat', group: 'ai', icon: 'message-square', title: 'Chat', desc: 'Open the Pluffy chat window.', cli: 'mizumi chat', action: 'chat' },
    { id: 'scan', group: 'ai', icon: 'database', title: 'Scan training data', desc: 'Turn the tatemonos into training data.', cli: 'mizumi scan', run: ['scan'] },
    { id: 'index', group: 'ai', icon: 'list-tree', title: 'Update tatemono index', desc: 'Refresh the examples list in the language reference.', cli: 'mizumi index', run: ['index'] },

    // ---- repo (the same four commands as mz.cmd; handled by the app, see runRepo in app.js)
    { id: 'repo-install', group: 'repo', icon: 'download', title: 'Install repo', desc: 'Clone Pluffy from GitHub into Documents/Pluffy. An unpacked copy there is linked to GitHub, your work stays.', cli: 'mz install', repo: 'install' },
    { id: 'repo-push', group: 'repo', icon: 'arrow-up-from-line', title: 'Push repo', desc: 'Commit everything and push it to GitHub.', cli: 'mz push', repo: 'push' },
    { id: 'repo-pull', group: 'repo', icon: 'arrow-down-to-line', title: 'Pull repo', desc: 'Throw away local changes and match GitHub.', cli: 'mz pull', repo: 'pull' },
    { id: 'repo-uninstall', group: 'repo', icon: 'trash-2', title: 'Uninstall repo', desc: 'Delete Documents/Pluffy for good. Anything not pushed is lost.', cli: 'mz uninstall', repo: 'uninstall' },
  ]

  window.MENU = { groups, items }
})()
