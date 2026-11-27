// Generated support code for the command line program in cli.ts.
// This file belongs to your project now: it depends on nothing but commander and Node.
import { InvalidArgumentError } from 'commander'
import type { Command } from 'commander'

/** Everything a command handler receives. */
export interface Ctx {
  /** The command that is running, for example "add" or "tag.add". */
  command: string
  /** Positional arguments by name. A variadic argument is an array. */
  args: Record<string, any>
  /** Flags by name. Names with dashes are camelCase: --dry-run is flags.dryRun. */
  flags: Record<string, any>
  out: Out
  err: Err
  stdin: Stdin
  env: NodeJS.ProcessEnv
  /** Stops the command with an exit code. */
  exit(code: number): never
}

export interface Out {
  line(text?: string): void
  write(text: string): void
  json(value: unknown): void
  table(rows: Record<string, unknown>[], columns?: string[]): void
  /** Prints a value the way the command declares its output (json, table, lines or text). --json forces JSON. */
  data(value: unknown): void
}

export interface Err {
  line(text?: string): void
  write(text: string): void
}

export interface Stdin {
  readonly isTTY: boolean
  read(): Promise<string>
}

/** A handler may return a number to set the exit code. */
export type Handler = (ctx: Ctx) => void | number | Promise<void | number>

export interface ActionSpec {
  name: string
  args: string[]
  output: 'json' | 'table' | 'lines' | 'text' | null
  deprecated: string | boolean | null
}

export class ExitSignal extends Error {
  constructor(public readonly code: number) {
    super(`exit ${code}`)
  }
}

// ── value parsers ────────────────────────────────────────

export function parseInteger(value: string): number {
  if (!/^[+-]?\d+$/.test(value.trim())) throw new InvalidArgumentError('Expected a whole number.')
  return Number(value)
}

export function parseNumber(value: string): number {
  const n = Number(value)
  if (value.trim() === '' || !Number.isFinite(n)) throw new InvalidArgumentError('Expected a number.')
  return n
}

export function parseBoolean(value: string): boolean {
  const v = value.trim().toLowerCase()
  if (['true', 'yes', '1', 'on'].includes(v)) return true
  if (['false', 'no', '0', 'off'].includes(v)) return false
  throw new InvalidArgumentError('Expected true or false.')
}

/** For a flag that may be given several times, and for variadic arguments with a typed value. */
export function collect(parse?: (value: string) => unknown) {
  return (value: string, previous: unknown): unknown[] => [
    ...(Array.isArray(previous) ? previous : []),
    parse ? parse(value) : value,
  ]
}

// ── output ───────────────────────────────────────────────

function writeTo(stream: NodeJS.WriteStream, text: string): void {
  try {
    stream.write(text)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EPIPE') throw error
  }
}

// A reader that closes the pipe early (for example `| head`) is not an error.
process.stdout.on('error', error => { if ((error as NodeJS.ErrnoException).code === 'EPIPE') process.exit(0) })
process.stderr.on('error', error => { if ((error as NodeJS.ErrnoException).code === 'EPIPE') process.exit(0) })

function cell(value: unknown): string {
  if (value === null || value === undefined) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

export function formatTable(rows: Record<string, unknown>[], columns?: string[]): string {
  const cols = columns ?? [...new Set(rows.flatMap(row => Object.keys(row)))]
  if (cols.length === 0) return ''
  const widths = cols.map(col => Math.max(col.length, ...rows.map(row => cell(row[col]).length)))
  const format = (values: string[]) => values.map((v, i) => v.padEnd(widths[i])).join('  ').trimEnd()
  return [format(cols), ...rows.map(row => format(cols.map(col => cell(row[col]))))].join('\n') + '\n'
}

function makeOut(output: ActionSpec['output'], forceJson: boolean): Out {
  const out: Out = {
    line: (text = '') => writeTo(process.stdout, text + '\n'),
    write: text => writeTo(process.stdout, text),
    json: value => writeTo(process.stdout, JSON.stringify(value, null, 2) + '\n'),
    table: (rows, columns) => writeTo(process.stdout, formatTable(rows, columns)),
    data: value => {
      if (forceJson || output === 'json') return out.json(value)
      if (output === 'table' && Array.isArray(value)) return out.table(value as Record<string, unknown>[])
      if (output === 'lines' && Array.isArray(value)) return value.forEach(item => out.line(cell(item)))
      if (typeof value === 'string') return out.line(value)
      return out.json(value)
    },
  }
  return out
}

function makeStdin(): Stdin {
  return {
    isTTY: process.stdin.isTTY === true,
    read: () => new Promise((resolve, reject) => {
      let text = ''
      process.stdin.setEncoding('utf8')
      process.stdin.on('data', chunk => { text += chunk })
      process.stdin.on('end', () => resolve(text))
      process.stdin.on('error', reject)
    }),
  }
}

// ── running a handler ────────────────────────────────────

/** Builds the commander action for one command. */
export function createAction(spec: ActionSpec, handler: Handler) {
  return async (...received: unknown[]): Promise<void> => {
    const options = received[received.length - 2] as Record<string, any>
    const positional = received.slice(0, -2)
    const args: Record<string, any> = {}
    spec.args.forEach((prop, i) => { args[prop] = positional[i] })

    if (spec.deprecated) {
      const note = typeof spec.deprecated === 'string' ? `: ${spec.deprecated}` : ''
      writeTo(process.stderr, `warning: the command "${spec.name}" is deprecated${note}\n`)
    }

    const ctx: Ctx = {
      command: spec.name,
      args,
      flags: options,
      out: makeOut(spec.output, options.json === true),
      err: {
        line: (text = '') => writeTo(process.stderr, text + '\n'),
        write: text => writeTo(process.stderr, text),
      },
      stdin: makeStdin(),
      env: process.env,
      exit: (code: number): never => { throw new ExitSignal(code) },
    }
    try {
      const result = await handler(ctx)
      if (typeof result === 'number') process.exitCode = result
    } catch (error) {
      if (error instanceof ExitSignal) { process.exitCode = error.code; return }
      throw error
    }
  }
}

/** Last stop for anything a handler threw. */
export function reportError(error: unknown): void {
  if (error instanceof ExitSignal) { process.exitCode = error.code; return }
  const message = error instanceof Error ? error.message : String(error)
  writeTo(process.stderr, `error: ${message}\n`)
  if (process.env.DEBUG && error instanceof Error && error.stack) writeTo(process.stderr, error.stack + '\n')
  process.exitCode = 1
}

export type { Command }
