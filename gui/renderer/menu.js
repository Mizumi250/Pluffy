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
  const TEMPLATES = ['web', 'crud', 'routes', 'auth', 'native', 'multi', 'lynx', 'files', 'godot', 'unity']
  const VARIANTS = [['php', 'Laravel (PHP)'], ['ts', 'Express (TypeScript)'], ['py', 'FastAPI (Python)'], ['java', 'Spring Boot (Java)'], ['cs', 'ASP.NET Core (C#)'], ['go', 'Go'], ['rs', 'Rust']]
  const EXPORT_TARGETS = [
    ...WEB.map((s) => ({ v: s, l: `${s}  (web)` })), ...APP.map((s) => ({ v: s, l: `${s}  (app)` })),
    ...DESKTOP.map((s) => ({ v: s, l: `${s}  (desktop)` })), { v: 'godot', l: 'godot  (game)' }, { v: 'unity', l: 'unity  (game)' },
  ]

  const keep = { v: '', l: '(keep current)' }
  const tatemono = (extra = {}) => ({ id: 't', type: 'tatemono', label: 'Tatemono', required: true, ...extra })

  const groups = [
    { id: 'run', title: 'Run it', sub: 'Set up and launch the engine', tint: 'peach' },
    { id: 'write', title: 'Write it', sub: 'Create tatemonos and add blocks', tint: 'pink' },
    { id: 'stack', title: 'Choose your stack', sub: 'Web, app, desktop, backend and database', tint: 'lilac' },
    { id: 'take', title: 'Take it with you', sub: 'Export, document and publish', tint: 'mint' },
    { id: 'ai', title: 'Use the AI', sub: 'Generate, review and train', tint: 'sky' },
  ]

  const items = [
    // ---- run
    { id: 'classic', group: 'run', icon: '⌨️', title: 'Classic menu', desc: 'The original interactive menu, right in the terminal.', cli: 'mizumi', run: [] },
    { id: 'setup', group: 'run', icon: '🛠️', title: 'Setup', desc: 'Check your tools and install what Pluffy needs the first time.', cli: 'mizumi setup', run: ['setup'] },
    {
      id: 'start', group: 'run', icon: '⚡', title: 'Start engine', desc: 'Run web, app, desktop or any mix. Rebuilds when you save a tatemono.', cli: 'mizumi start',
      form: {
        fields: [{ id: 'only', type: 'multi', label: 'Platforms', options: ['web', 'app', 'desktop'], value: ['web', 'app', 'desktop'] }],
        validate: (v) => (v.only.length ? '' : 'Pick at least one platform.'),
        build: (v) => (v.only.length === 3 ? ['start'] : ['start', '--only=' + v.only.join(',')]),
      },
    },
    {
      id: 'screenshot', group: 'run', icon: '📸', title: 'Screenshot', desc: "Take a screenshot of a tatemono's web page.", cli: 'mizumi screenshot',
      form: {
        fields: [tatemono(), { id: 'wait', type: 'text', label: 'Wait before shooting (ms, optional)', placeholder: '1500' }],
        build: (v) => ['screenshot', v.t, ...(v.wait ? ['--wait=' + v.wait] : [])],
      },
    },

    // ---- write
    {
      id: 'new', group: 'write', icon: '✨', title: 'New tatemono', desc: 'Create a core.tsx from a template.', cli: 'mizumi new <name>',
      form: {
        fields: [
          { id: 'name', type: 'text', label: 'Name', placeholder: 'my-app', required: true, pattern: /^[a-z0-9][a-z0-9_-]*$/i, hint: 'Letters, numbers, - and _' },
          { id: 'tpl', type: 'select', label: 'Template', options: TEMPLATES, value: 'web' },
        ],
        build: (v) => ['new', v.name, '--template=' + v.tpl],
      },
    },
    {
      id: 'block', group: 'write', icon: '🧱', title: 'Add DSL block', desc: 'Add a block to a tatemono. Pluffy writes it with the right tags.', cli: 'mizumi block',
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
    { id: 'block-guided', group: 'write', icon: '🧭', title: 'Add block (guided)', desc: 'Pick tatemono, DSL, block and backend step by step in the terminal.', cli: 'mizumi block', run: ['block'] },
    { id: 'block-list', group: 'write', icon: '📚', title: 'List block types', desc: 'Every block you can add.', cli: 'mizumi block --list', run: ['block', '--list'] },
    { id: 'modules', group: 'write', icon: '🏠', title: 'List tatemonos', desc: 'Every tatemono Pluffy knows about.', cli: 'mizumi modules', run: ['modules'] },
    {
      id: 'check', group: 'write', icon: '✅', title: 'Check', desc: 'Lint tatemonos without starting the engine.', cli: 'mizumi check [name]',
      form: { fields: [tatemono({ required: false, optional: true, optionalLabel: '(all tatemonos)' })], build: (v) => ['check', ...(v.t ? [v.t] : [])] },
    },

    // ---- stack
    {
      id: 'stack-pick', group: 'stack', icon: '🧭', title: 'Switch stacks', desc: 'Change web, app, desktop, backend or database in one go.', cli: 'mizumi web|app|desktop|backend|db <name>',
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
      id: 'deps', group: 'stack', icon: '📦', title: 'Dependencies', desc: 'Install or remove the packages for each stack.', cli: 'mizumi deps',
      form: {
        fields: [
          { id: 'action', type: 'select', label: 'What', options: [{ v: '', l: 'Open the guided menu' }, { v: 'install', l: 'Install one stack' }, { v: 'uninstall', l: 'Remove one stack' }, { v: 'prune', l: 'Remove deps of unused stacks' }] },
          { id: 'stack', type: 'select', label: 'Stack (for install / remove)', optional: true, options: [...WEB, ...APP, ...DESKTOP, ...BACKEND] },
        ],
        validate: (v) => ((v.action === 'install' || v.action === 'uninstall') && !v.stack ? 'Pick a stack.' : ''),
        build: (v) => ['deps', ...(v.action ? [v.action] : []), ...(v.action === 'install' || v.action === 'uninstall' ? [v.stack] : [])],
      },
    },
    { id: 'stack-now', group: 'stack', icon: '📍', title: 'Active stacks', desc: 'Show the web, app and desktop stacks in use.', cli: 'mizumi stack', run: ['stack'] },
    { id: 'stacks', group: 'stack', icon: '🗺️', title: 'All stacks', desc: 'List every stack Pluffy supports.', cli: 'mizumi stacks', run: ['stacks'] },

    // ---- take
    {
      id: 'export', group: 'take', icon: '📤', title: 'Export project', desc: 'Turn a tatemono into a standalone web, app, desktop, Godot or Unity project.', cli: 'mizumi export <name> <stack>',
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
      id: 'openapi', group: 'take', icon: '📘', title: 'OpenAPI docs', desc: 'Write openapi.json and a Swagger page for a tatemono.', cli: 'mizumi openapi <name>',
      form: {
        fields: [tatemono(), { id: 'backend', type: 'select', label: 'Backend', optional: true, optionalLabel: '(default)', options: BACKEND }],
        build: (v) => ['openapi', v.t, ...(v.backend ? ['--backend=' + v.backend] : [])],
      },
    },
    {
      id: 'publish', group: 'take', icon: '🚀', title: 'Publish to GitHub', desc: 'Push an exported project using the Git login you already have.', cli: 'mizumi publish [name]',
      form: { fields: [{ id: 'p', type: 'project', label: 'Exported project', optional: true, optionalLabel: '(choose in the terminal)' }], build: (v) => ['publish', ...(v.p ? [v.p] : [])] },
    },

    // ---- ai
    {
      id: 'ai', group: 'ai', icon: '🪄', title: 'Pluffy AI', desc: 'Write a tatemono from a plain description of your app.', cli: 'mizumi ai "idea"',
      form: { fields: [{ id: 'idea', type: 'textarea', label: 'Describe your app (leave empty for the guided options)', placeholder: 'A clinic booking app with patients, doctors and appointments' }], build: (v) => ['ai', ...(v.idea.trim() ? [v.idea.trim()] : [])] },
    },
    { id: 'review', group: 'ai', icon: '🔍', title: 'Review', desc: 'A second AI reads the whole project and suggests edits.', cli: 'mizumi review', run: ['review'] },
    { id: 'chat', group: 'ai', icon: '💬', title: 'Chat', desc: 'Open the Pluffy chat window.', cli: 'mizumi chat', action: 'chat' },
    { id: 'scan', group: 'ai', icon: '🧪', title: 'Scan training data', desc: 'Turn the tatemonos into training data.', cli: 'mizumi scan', run: ['scan'] },
    { id: 'index', group: 'ai', icon: '🗂️', title: 'Update tatemono index', desc: 'Refresh the online examples list in the language reference.', cli: 'mizumi index', run: ['index'] },
  ]

  window.MENU = { groups, items }
})()
