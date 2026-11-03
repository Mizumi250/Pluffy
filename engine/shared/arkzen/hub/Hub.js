const styles = `
.arkhub{--ink:#151515;--muted:#858585;--line:#e7e7e7;min-height:100vh;background:#f7f7f5;color:var(--ink);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
.arkhub *{box-sizing:border-box}.arkhub button,.arkhub input,.arkhub select{font:inherit}
.arkhub-header{height:72px;border-bottom:1px solid var(--line);display:flex;align-items:center;justify-content:space-between;padding:0 max(24px,calc((100vw - 1200px)/2))}
.arkhub-brand{font-size:15px;font-weight:650;letter-spacing:-.03em}.arkhub-version{font-size:10px;color:var(--muted);letter-spacing:.13em;text-transform:uppercase}
.arkhub-online{display:flex;align-items:center;gap:8px;color:#777;font-size:11px}.arkhub-dot{width:7px;height:7px;border-radius:50%;background:#32c759;box-shadow:0 0 0 4px #32c7591a}.arkhub-dot.is-offline{background:#c7c7c7;box-shadow:none}
.arkhub-main{max-width:1200px;margin:auto;padding:54px 24px 80px}.arkhub-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(420px,1.3fr);gap:22px;align-items:center}
.arkhub-counts{display:grid;grid-template-columns:repeat(3,1fr);padding:10px 0}.arkhub-count{padding:0 16px;border-left:1px solid var(--line)}.arkhub-count:first-child{padding-left:0;border-left:0}
.arkhub-number{font-size:28px;line-height:1;font-weight:650;letter-spacing:-.06em}.arkhub-label{margin-top:8px;color:#999;font-size:9px;font-weight:650;letter-spacing:.17em}
.arkhub-stacks{display:grid;gap:9px;border:1px solid var(--line);border-radius:20px;background:#ffffffb8;padding:14px 16px}
.arkhub-stackrow{display:flex;align-items:center;gap:10px}.arkhub-stacklabel{width:58px;flex:none;color:#a0a0a0;font-size:9px;font-weight:700;letter-spacing:.13em;text-transform:uppercase}
.arkhub-pills{display:flex;flex-wrap:wrap;gap:6px}.arkhub-pill{display:inline-flex;align-items:center;border:1px solid #e8e8e8;border-radius:999px;background:#f3f3f3;color:#aaa;padding:4px 10px;font-size:10px;font-weight:550;white-space:nowrap}
.arkhub-pill.is-active{border-color:var(--tone);background:var(--tone);color:white;box-shadow:0 3px 10px color-mix(in srgb,var(--tone) 24%,transparent)}
.arkhub-controls{margin-top:44px;padding:0 0 18px;border-bottom:1px solid var(--line);display:flex;gap:10px;justify-content:space-between}
.arkhub-searchwrap{position:relative;flex:1;max-width:460px}.arkhub-searchicon{position:absolute;left:15px;top:50%;transform:translateY(-50%);color:#aaa;font-size:17px}
.arkhub-search,.arkhub-filter{height:46px;border:1px solid #e5e5e5;border-radius:15px;background:white;color:#222;outline:none}
.arkhub-search{width:100%;padding:0 15px 0 42px}.arkhub-filter{min-width:190px;padding:0 38px 0 14px}
.arkhub-search:focus,.arkhub-filter:focus{border-color:#222;box-shadow:0 0 0 4px #1111110a}
.arkhub-section{margin:28px 0 14px;display:flex;justify-content:space-between;align-items:center}.arkhub-title{font-size:14px;font-weight:650;letter-spacing:-.02em}.arkhub-total{color:#999;margin-left:8px;font-weight:500}
.arkhub-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:15px}
.arkhub-card{min-height:260px;padding:19px;border:1px solid #e8e8e8;border-radius:23px;background:white;box-shadow:0 12px 40px #00000008;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s}
.arkhub-card:hover{transform:translateY(-3px);box-shadow:0 18px 45px #00000012}.arkhub-cardtop{display:flex;justify-content:space-between;align-items:center;margin-bottom:23px}
.arkhub-avatar{width:36px;height:36px;border-radius:13px;background:#151515;color:white;display:grid;place-items:center;font-size:13px;font-weight:650}
.arkhub-status{border-radius:999px;background:#f2f2f2;color:#666;padding:4px 9px;font-size:10px}.arkhub-status.active{background:#e8f8ed;color:#16843a}.arkhub-status.error{background:#fff0ef;color:#c43c35}
.arkhub-name{font-weight:650;font-size:16px;letter-spacing:-.03em}.arkhub-ver{margin-top:3px;color:#aaa;font:11px ui-monospace,monospace}
.arkhub-compat{margin-top:18px}.arkhub-caption{margin-bottom:7px;color:#a2a2a2;font-size:9px;font-weight:700;letter-spacing:.16em;text-transform:uppercase}
.arkhub-cardpills{display:flex;flex-wrap:wrap;gap:5px}.arkhub-cardpill{border:1px solid #e9e9e9;border-radius:999px;padding:3px 8px;color:#777;background:#fff;font-size:9px}
.arkhub-actions{display:flex;gap:8px;margin-top:auto;padding-top:18px}.arkhub-open{flex:1;border:0;border-radius:12px;background:#151515;color:#fff;text-align:center;padding:9px 12px;text-decoration:none;font-size:11px;font-weight:600;cursor:pointer}
.arkhub-open:hover{background:#414141}.arkhub-copy{border:1px solid #e7e7e7;border-radius:12px;background:white;color:#666;padding:8px 11px;font-size:11px;cursor:pointer}
.arkhub-state{grid-column:1/-1;border:1px dashed #d9d9d9;border-radius:22px;padding:64px 20px;text-align:center;color:#8a8a8a;background:#ffffff80}
.arkhub-error{margin:18px 0 0;border:1px solid #f1d29b;border-radius:13px;background:#fff9ed;padding:10px 13px;color:#8f5b0a;font-size:11px}
@media(max-width:900px){.arkhub-top{grid-template-columns:1fr}.arkhub-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:600px){.arkhub-main{padding:34px 16px 56px}.arkhub-header{height:64px;padding:0 17px}.arkhub-top{gap:15px}.arkhub-stacks{padding:12px}.arkhub-stackrow{align-items:flex-start;flex-direction:column;gap:5px}.arkhub-controls{margin-top:30px;flex-direction:column}.arkhub-searchwrap{max-width:none}.arkhub-filter{width:100%}.arkhub-grid{grid-template-columns:1fr}.arkhub-card{min-height:230px}}
`

const stackGroups = [
  { label: 'Frontend', key: 'activeStack', tone: '#007aff', options: [['nextjs', 'Next.js'], ['react-vite', 'React + Vite'], ['react-inertia', 'React + Inertia'], ['astro', 'Astro'], ['tanstack-start', 'TanStack Start']] },
  { label: 'Backend', key: 'activeBackend', tone: '#30c75a', options: [['laravel', 'Laravel'], ['laravel-inertia', 'Laravel + Inertia'], ['express', 'Express'], ['fastapi', 'FastAPI'], ['django', 'Django'], ['spring-boot', 'Spring Boot'], ['aspnet', 'ASP.NET'], ['go', 'Go'], ['rust', 'Rust']] },
  { label: 'Database', key: 'activeDatabase', tone: '#af52de', options: [['sqlite', 'SQLite'], ['pgsql', 'PostgreSQL']] },
]

export function createArkzenHub(React, { registryPath = '/api/arkzen/registry', platform = '' } = {}) {
  const h = React.createElement

  return function ArkzenHub() {
    const [registry, setRegistry] = React.useState(null)
    const [query, setQuery] = React.useState('')
    const [filter, setFilter] = React.useState('All')
    const [loading, setLoading] = React.useState(true)
    const [error, setError] = React.useState('')

    React.useEffect(() => {
      let mounted = true
      const load = async () => {
        try {
          const response = await fetch(registryPath)
          if (!response.ok) throw new Error(`Registry request failed (${response.status})`)
          const data = await response.json()
          if (mounted) {
            setRegistry(data)
            setError('')
          }
        } catch (reason) {
          if (mounted) setError(reason instanceof Error ? reason.message : 'Could not load registry')
        } finally {
          if (mounted) setLoading(false)
        }
      }
      void load()
      const timer = setInterval(load, 3000)
      return () => {
        mounted = false
        clearInterval(timer)
      }
    }, [])

    const modules = registry?.modules ?? []
    const frameworkNames = [...new Set(modules.flatMap(module => [...(module.frontend ?? []), ...(module.backend ?? [])]))].sort()
    const normalizedQuery = query.trim().toLowerCase()
    const filtered = modules.filter(module => {
      const names = [...(module.frontend ?? []), ...(module.backend ?? [])]
      const matchesQuery = !normalizedQuery || [module.name, ...names].some(name => name.toLowerCase().includes(normalizedQuery))
      return matchesQuery && (filter === 'All' || names.includes(filter))
    })
    const count = (selector) => new Set(modules.flatMap(module => selector(module) ?? [])).size
    const stats = [
      ['TATEMONOS', modules.length],
      ['FRONTENDS', count(module => module.frontend)],
      ['BACKENDS', count(module => module.backend)],
    ]

    const stackRows = stackGroups.map(group => h('div', { className: 'arkhub-stackrow', key: group.label },
      h('span', { className: 'arkhub-stacklabel' }, group.label),
      h('div', { className: 'arkhub-pills' }, group.options.map(([key, label]) =>
        h('span', {
          className: `arkhub-pill${registry?.[group.key] === key ? ' is-active' : ''}`,
          style: { '--tone': group.tone },
          key,
        }, label),
      )),
    ))

    const cards = filtered.map(module => {
      const frontend = module.frontend ?? []
      const backend = module.backend ?? []
      const status = module.status ?? 'active'
      return h('article', { className: 'arkhub-card', key: module.name },
        h('div', { className: 'arkhub-cardtop' },
          h('div', { className: 'arkhub-avatar', 'aria-hidden': true }, String(module.name ?? '?').slice(0, 1).toUpperCase()),
          h('span', { className: `arkhub-status ${status}` }, status),
        ),
        h('div', { className: 'arkhub-name' }, module.name),
        h('div', { className: 'arkhub-ver' }, `v${module.version ?? '—'}`),
        h('div', { className: 'arkhub-compat' },
          h('div', { className: 'arkhub-caption' }, 'Frontend'),
          h('div', { className: 'arkhub-cardpills' },
            ...(frontend.length ? frontend.map(name => h('span', { className: 'arkhub-cardpill', key: name }, name)) : [h('span', { className: 'arkhub-cardpill', key: 'none' }, 'None')]),
          ),
          h('div', { className: 'arkhub-caption', style: { marginTop: '10px' } }, 'Backend'),
          h('div', { className: 'arkhub-cardpills' },
            ...(backend.length ? backend.map(name => h('span', { className: 'arkhub-cardpill', key: name }, name)) : [h('span', { className: 'arkhub-cardpill', key: 'none' }, 'None')]),
          ),
        ),
        h('div', { className: 'arkhub-actions' },
          h('a', { className: 'arkhub-open', href: `/${module.name}`, target: '_blank', rel: 'noreferrer' }, 'Open'),
          h('button', { className: 'arkhub-copy', type: 'button', onClick: () => navigator.clipboard.writeText(module.name), 'aria-label': `Copy ${module.name}` }, 'Copy'),
        ),
      )
    })

    const connected = Boolean(registry) && !error
    return h('main', { className: 'arkhub' },
      h('style', null, styles),
      h('header', { className: 'arkhub-header' },
        h('div', null,
          h('div', { className: 'arkhub-brand' }, 'Arkzen Hub'),
          h('div', { className: 'arkhub-version' }, `Tatemono registry · v${registry?.engine ?? '—'}${platform ? ` · ${platform}` : ''}`),
        ),
        h('div', { className: 'arkhub-online' }, h('span', { className: `arkhub-dot${connected ? '' : ' is-offline'}` }), connected ? 'Engine online' : error ? 'Engine offline' : 'Connecting'),
      ),
      h('section', { className: 'arkhub-main' },
        h('div', { className: 'arkhub-top' },
          h('div', { className: 'arkhub-counts' }, stats.map(([label, value]) =>
            h('div', { className: 'arkhub-count', key: label },
              h('div', { className: 'arkhub-number' }, value),
              h('div', { className: 'arkhub-label' }, label),
            ),
          )),
          h('div', { className: 'arkhub-stacks' }, stackRows),
        ),
        h('div', { className: 'arkhub-controls' },
          h('label', { className: 'arkhub-searchwrap' },
            h('span', { className: 'arkhub-searchicon', 'aria-hidden': true }, '⌕'),
            h('input', {
              className: 'arkhub-search',
              type: 'search',
              value: query,
              onChange: event => setQuery(event.target.value),
              placeholder: 'Search Tatemono or framework',
              'aria-label': 'Search Tatemono or framework',
            }),
          ),
          h('select', {
            className: 'arkhub-filter',
            value: filter,
            onChange: event => setFilter(event.target.value),
            'aria-label': 'Filter by framework',
          }, [
            h('option', { value: 'All', key: 'all' }, 'All frameworks'),
            ...frameworkNames.map(name => h('option', { value: name, key: name }, name)),
          ]),
        ),
        error ? h('div', { className: 'arkhub-error', role: 'status' }, error) : null,
        h('div', { className: 'arkhub-section' },
          h('div', { className: 'arkhub-title' }, 'All Tatemono', h('span', { className: 'arkhub-total' }, filtered.length)),
        ),
        h('div', { className: 'arkhub-grid' },
          loading ? h('div', { className: 'arkhub-state' }, 'Loading registry…')
            : error && modules.length === 0 ? h('div', { className: 'arkhub-state' }, error)
              : filtered.length ? cards
                : h('div', { className: 'arkhub-state' }, 'No matching Tatemono. Try another name or framework.'),
        ),
      ),
    )
  }
}
