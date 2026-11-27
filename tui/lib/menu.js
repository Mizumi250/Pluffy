// The command cards are the GUI's own list (gui/renderer/menu.js), so both skins always show the same commands.
// That file only fills window.MENU, so it is loaded here with a fake window. If gui/ is not in this copy of the
// repo, a short built-in list is used instead.
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { ROOT } from './data.js'

const FALLBACK = {
  groups: [
    { id: 'run', title: 'Run it', sub: 'Set up and launch' },
    { id: 'write', title: 'Write it', sub: 'Create and edit' },
    { id: 'stack', title: 'Stacks', sub: 'Web, app, desktop, backend, database' },
  ],
  items: [
    { id: 'classic', group: 'run', icon: 'square-terminal', title: 'Classic menu', desc: 'The original menu from mizumi.js.', cli: 'mizumi', run: [] },
    { id: 'setup', group: 'run', icon: 'wrench', title: 'Setup', desc: 'Check your toolchains and install what is missing.', cli: 'mizumi setup', run: ['setup'] },
    { id: 'start', group: 'run', icon: 'play', title: 'Start engine', desc: 'Run web, app and desktop. Rebuilds when you save a tatemono.', cli: 'mizumi start', run: ['start'] },
    { id: 'modules', group: 'write', icon: 'building-2', title: 'List tatemonos', desc: 'All tatemonos and their pages.', cli: 'mizumi modules', run: ['modules'] },
    { id: 'check', group: 'write', icon: 'square-check', title: 'Check', desc: 'Lint every tatemono.', cli: 'mizumi check', run: ['check'] },
    { id: 'stack-now', group: 'stack', icon: 'map-pin', title: 'Active stacks', desc: 'The stacks currently in use.', cli: 'mizumi stack', run: ['stack'] },
    { id: 'stacks', group: 'stack', icon: 'layers', title: 'All stacks', desc: 'Every supported stack.', cli: 'mizumi stacks', run: ['stacks'] },
  ],
}

export function loadMenu() {
  let menu = FALLBACK, from = 'built-in'
  try {
    const file = path.join(ROOT, 'gui', 'renderer', 'menu.js')
    const box = { window: {} }
    vm.runInNewContext(fs.readFileSync(file, 'utf8'), box, { filename: file, timeout: 2000 })
    if (box.window.MENU?.items?.length) { menu = box.window.MENU; from = 'gui' }
  } catch { /* use the built-in list */ }
  // "repo" cards are Studio-only (git helpers in the app, not mizumi.js commands)
  const items = menu.items.filter((i) => !i.repo)
  const groups = menu.groups.filter((g) => items.some((i) => i.group === g.id))
  return { groups, items, from }
}

export const GLYPH = {
  'square-terminal': '❯', wrench: '⚙', play: '▶', camera: '◉', 'file-plus': '✚', blocks: '▦', 'list-tree': '☰',
  'building-2': '▥', 'square-check': '☑', 'arrow-left-right': '⇄', package: '▣', 'map-pin': '⌖', layers: '≣',
  upload: '⇪', 'book-open': '❡', 'cloud-upload': '☁', 'pen-line': '✎', 'search-check': '⌕', 'message-square': '✉',
  database: '◈',
}

// Commands that ask questions need a real terminal, so the TUI hands the screen over to them.
const GUIDED = new Set(['block', 'deps', 'publish', 'ai', 'review'])
export const needsTty = (args) => args.length === 0 || (args.length === 1 && GUIDED.has(args[0]))
