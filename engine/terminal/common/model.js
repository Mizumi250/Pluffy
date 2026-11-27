// Turns parsed.term into the model the generators read: defaults applied, names normalized,
// commands arranged as a tree. The validator has already checked every contract, so this
// only has to reshape. It throws for the few things the validator cannot see.

export const SUPPORTED_FRAMEWORK = { ts: 'commander', py: 'typer', rs: 'clap', go: 'cobra' }

// "dry-run" -> "dryRun", "my_arg" -> "myArg"
export function camel(name) {
  return name.replace(/[-_.]+([a-z0-9])/gi, (_, c) => c.toUpperCase())
}

// A runtime dependency list is either { name: version } or [name, ...] (any version).
function depMap(value) {
  if (!value) return {}
  if (Array.isArray(value)) return Object.fromEntries(value.map(n => [n, '*']))
  return Object.fromEntries(Object.entries(value).map(([n, v]) => [n, String(v)]))
}

function normalizeArg(raw) {
  return {
    name: raw.name,
    prop: camel(raw.name),
    type: raw.type ?? 'string',
    required: raw.required === true,
    variadic: raw.variadic === true,
    choices: raw.choices ?? null,
    default: raw.default,
    description: raw.description ?? '',
  }
}

function normalizeFlag(raw) {
  return {
    name: raw.name,
    prop: camel(raw.name),
    short: raw.short ?? null,
    type: raw.type ?? 'string',
    default: raw.default,
    env: raw.env ?? null,
    required: raw.required === true,
    repeatable: raw.repeatable === true,
    choices: raw.choices ?? null,
    description: raw.description ?? '',
  }
}

export function buildModel(parsed) {
  const term = parsed.term
  if (!term || !term.project) throw new Error('this tatemono has no @arkzen:term:project')
  const p = term.project.data

  const project = {
    name: p.name,
    binary: p.binary,
    version: String(p.version ?? parsed.meta.version),
    description: p.description ?? parsed.meta.description ?? '',
    author: p.author ?? null,
    license: p.license ?? null,
    homepage: p.homepage ?? null,
    mode: p.mode,
    runtimes: [...p.runtimes],
    defaultCommand: p.default_command ?? null,
  }

  const runtimes = {}
  for (const lang of project.runtimes) {
    const block = term.runtimes.find(r => r.lang === lang)
    const d = block ? block.data : {}
    runtimes[lang] = {
      lang,
      framework: d.framework ?? SUPPORTED_FRAMEWORK[lang] ?? null,
      tui: d.tui,
      dependencies: depMap(d.dependencies),
      devDependencies: depMap(d.dev_dependencies),
      minVersion: d.min_version === undefined ? null : String(d.min_version),
      bundle: d.bundle ?? 'none',
      packageName: d.package_name ?? null,
      explicit: !!block,
    }
  }

  // handlers by language, keyed by the command they serve
  const handlers = {}
  for (const h of term.handlers) {
    const command = typeof h.header.command === 'string' ? h.header.command : h.name
    handlers[h.lang] ??= {}
    if (handlers[h.lang][command]) {
      throw new Error(`two @arkzen:term:handler:${h.lang} blocks serve the command "${command}" (${handlers[h.lang][command].file} and ${h.name})`)
    }
    handlers[h.lang][command] = { file: h.name, command, raw: h.raw, async: h.header.async === true }
  }
  const byLang = list => {
    const out = {}
    for (const b of list) (out[b.lang] ??= []).push({ name: b.name, raw: b.raw, header: b.header })
    return out
  }

  // commands: a flat list in declaration order, plus a tree
  const commands = term.commands.map(c => {
    const d = c.data
    return {
      name: c.name,
      path: c.name.split('.'),
      leaf: c.name.split('.').at(-1),
      description: d.description ?? '',
      aliases: d.aliases ?? [],
      hidden: d.hidden === true,
      deprecated: d.deprecated === undefined || d.deprecated === false ? null : (d.deprecated === true ? true : String(d.deprecated)),
      args: (d.args ?? []).map(normalizeArg),
      flags: (d.flags ?? []).map(normalizeFlag),
      stdin: d.stdin === true,
      output: d.output ?? null,
      prompt: d.prompt ?? null,
      exitCodes: d.exit_codes ?? {},
      examples: (d.examples ?? []).map(e => ({
        cmd: e.cmd, expectExit: e.expect_exit ?? 0, expectStdout: e.expect_stdout ?? null, expectStderr: e.expect_stderr ?? null,
      })),
      builtin: d.builtin && d.builtin !== 'none' ? d.builtin : null,
      children: [],
    }
  })
  const byName = new Map(commands.map(c => [c.name, c]))
  const roots = []
  for (const c of commands) {
    const parent = c.path.length > 1 ? byName.get(c.path.slice(0, -1).join('.')) : null
    if (parent) parent.children.push(c)
    else roots.push(c)
  }

  return {
    meta: { name: parsed.meta.name, version: String(parsed.meta.version), description: parsed.meta.description ?? '' },
    project,
    runtimes,
    commands,
    commandTree: roots,
    handlers,
    scripts: byLang(term.scripts),
    tests: byLang(term.tests),
    readme: term.readme ? term.readme.raw : null,
    // blocks later steps will generate (kept raw so a generator can say exactly what it skipped)
    declared: {
      config: !!term.config, theme: !!term.theme, assets: !!term.assets, export: !!term.export,
      keymaps: term.keymaps.length, prompts: term.prompts.length, screens: term.screens.length,
      data: term.data.length, loops: term.loops.length, views: term.views.length,
    },
  }
}
