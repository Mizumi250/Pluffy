// Generated support code for interactive questions. It depends on @inquirer/prompts and Node only.
import { checkbox, confirm, editor, input, number, password, search, select } from '@inquirer/prompts'
import { ExitSignal, parseBoolean } from './runtime.js'
import type { Ctx, Handler } from './runtime.js'

export type StepType = 'text' | 'password' | 'number' | 'confirm' | 'select' | 'multiselect' | 'path' | 'autocomplete' | 'editor'

export interface Rules {
  regex?: string
  min?: number
  max?: number
  length?: number
}

export interface Step {
  id: string
  /** The camelCase name used to look the value up in ctx.args and ctx.flags. */
  prop: string
  type: StepType
  message: string
  default?: unknown
  choices?: string[] | null
  required?: boolean
  validate?: Rules | null
  /** Ask only when every listed earlier answer has this value (a list answer must contain it). */
  when?: Record<string, unknown> | null
}

export interface FallbackSpec {
  flag?: string
  env?: string
}

export interface PromptDef {
  name: string
  /** The name the answers are stored under on ctx. */
  result: string
  steps: Step[]
  /** How each step is supplied when nobody can be asked: a flag, an environment variable, or both. */
  fallback: Record<string, FallbackSpec>
}

// ── checking values ──────────────────────────────────────

function isEmpty(value: unknown): boolean {
  return value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)
}

/** Returns true when the value is acceptable, or the reason it is not. */
export function checkValue(step: Step, value: unknown): true | string {
  if (isEmpty(value)) return step.required ? `"${step.id}" is required` : true
  const rules = step.validate
  if (typeof value === 'string' || Array.isArray(value)) {
    const size = value.length
    if (rules?.length !== undefined && size !== rules.length) return `"${step.id}" must have length ${rules.length}`
    if (rules?.min !== undefined && size < rules.min) return `"${step.id}" must have at least ${rules.min} ${Array.isArray(value) ? 'item(s)' : 'character(s)'}`
    if (rules?.max !== undefined && size > rules.max) return `"${step.id}" must have at most ${rules.max} ${Array.isArray(value) ? 'item(s)' : 'character(s)'}`
  }
  if (typeof value === 'number') {
    if (rules?.min !== undefined && value < rules.min) return `"${step.id}" must be at least ${rules.min}`
    if (rules?.max !== undefined && value > rules.max) return `"${step.id}" must be at most ${rules.max}`
  }
  if (rules?.regex !== undefined && typeof value === 'string' && !new RegExp(rules.regex).test(value)) {
    return `"${step.id}" does not match ${rules.regex}`
  }
  if (step.choices && (step.type === 'select' || step.type === 'multiselect')) {
    for (const v of Array.isArray(value) ? value : [value]) {
      if (!step.choices.includes(String(v))) return `"${step.id}" must be one of: ${step.choices.join(', ')}`
    }
  }
  return true
}

/** Turns a flag or environment value into the type the step asks for. Throws a readable error. */
export function coerce(step: Step, raw: unknown): unknown {
  if (typeof raw !== 'string') return raw
  switch (step.type) {
    case 'number': {
      const n = Number(raw)
      if (raw.trim() === '' || !Number.isFinite(n)) throw new Error(`"${step.id}" must be a number (got "${raw}")`)
      return n
    }
    case 'confirm':
      try { return parseBoolean(raw) } catch { throw new Error(`"${step.id}" must be true or false (got "${raw}")`) }
    case 'multiselect':
      return raw.split(',').map(s => s.trim()).filter(Boolean)
    default:
      return raw
  }
}

/** True when this step should be asked, given the answers so far. */
export function applies(step: Step, answers: Record<string, unknown>): boolean {
  if (!step.when) return true
  return Object.entries(step.when).every(([id, expected]) => {
    const actual = answers[id]
    return Array.isArray(actual) ? actual.includes(expected) : actual === expected
  })
}

// ── finding a value without asking ───────────────────────

function camel(name: string): string {
  return name.replace(/[-_.]+([a-z0-9])/gi, (_, c: string) => c.toUpperCase())
}

function presetFor(def: PromptDef, step: Step, ctx: Ctx): unknown {
  const fromArgs = ctx.args[step.prop]
  if (!isEmpty(fromArgs)) return fromArgs
  const spec = def.fallback[step.id]
  const flagProp = spec?.flag ? camel(spec.flag.replace(/^--/, '')) : step.prop
  const fromFlag = ctx.flags[flagProp]
  if (!isEmpty(fromFlag)) return fromFlag
  if (spec?.env && !isEmpty(ctx.env[spec.env])) return ctx.env[spec.env]
  return undefined
}

function hint(def: PromptDef, step: Step): string {
  const spec = def.fallback[step.id]
  const ways = [spec?.flag, spec?.env && `set ${spec.env}`].filter(Boolean)
  return ways.length ? `pass ${ways.join(' or ')}` : 'no flag or environment variable is declared for it'
}

// ── asking ───────────────────────────────────────────────

async function ask(step: Step, answers: Record<string, unknown>): Promise<unknown> {
  const validate = (value: unknown) => checkValue(step, step.type === 'number' ? (value as number | undefined) : value)
  const message = step.message
  switch (step.type) {
    case 'password':
      return password({ message, mask: '*', validate })
    case 'number':
      return number({ message, default: typeof step.default === 'number' ? step.default : undefined, validate: value => validate(value) })
    case 'confirm':
      return confirm({ message, default: typeof step.default === 'boolean' ? step.default : undefined })
    case 'select':
      return select({
        message,
        choices: (step.choices ?? []).map(c => ({ value: c, name: c })),
        default: typeof step.default === 'string' ? step.default : undefined,
      })
    case 'multiselect': {
      const preset = Array.isArray(step.default) ? step.default.map(String) : []
      return checkbox({
        message,
        choices: (step.choices ?? []).map(c => ({ value: c, name: c, checked: preset.includes(c) })),
        validate: choices => checkValue(step, choices.map(c => c.value)),
      })
    }
    case 'autocomplete': {
      const choices = step.choices
      if (!choices) return input({ message, default: typeof step.default === 'string' ? step.default : undefined, validate })
      return search({
        message,
        source: async term => choices
          .filter(c => !term || c.toLowerCase().includes(term.toLowerCase()))
          .map(c => ({ value: c, name: c })),
      })
    }
    case 'editor':
      return editor({ message, default: typeof step.default === 'string' ? step.default : undefined, validate })
    default:
      // text and path
      return input({ message, default: typeof step.default === 'string' ? step.default : undefined, validate })
  }
}

function isInteractive(ctx: Ctx): boolean {
  return ctx.flags.input !== false && process.stdin.isTTY === true && process.stdout.isTTY === true
}

/** Runs every step that applies and returns the answers by step id. */
export async function runPrompt(def: PromptDef, ctx: Ctx): Promise<Record<string, unknown>> {
  const answers: Record<string, unknown> = {}
  const interactive = isInteractive(ctx)
  for (const step of def.steps) {
    if (!applies(step, answers)) continue

    let value = coerce(step, presetFor(def, step, ctx))
    if (isEmpty(value)) {
      if (interactive) {
        try {
          value = await ask(step, answers)
        } catch (error) {
          if (error instanceof Error && error.name === 'ExitPromptError') {
            process.stdout.write('\n')
            throw new ExitSignal(130)
          }
          throw error
        }
      } else if (step.default !== undefined) {
        value = step.default
      } else if (step.required) {
        throw new Error(`missing value for "${step.id}": ${hint(def, step)}`)
      }
    }
    const verdict = checkValue(step, value)
    if (verdict !== true) throw new Error(verdict)
    if (value !== undefined) answers[step.id] = value
  }
  return answers
}

/** Wraps a handler so the questions run first and the answers are on ctx under the prompt's result name. */
export function withPrompt(def: PromptDef, handler: Handler): Handler {
  return async ctx => {
    const answers = await runPrompt(def, ctx)
    Object.assign(ctx, { [def.result]: answers })
    return handler(ctx)
  }
}
