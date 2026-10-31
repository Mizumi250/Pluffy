// artisan-like commands + scheduler (node-cron).
import cron from 'node-cron'
import { Log } from './support'

export class Command {
  static SUCCESS = 0
  static FAILURE = 1
  signature = ''
  description = ''
  schedule: string | null = null
  info(m: string)  { console.log(`[cmd] ${m}`) }
  line(m: string)  { console.log(m) }
  warn(m: string)  { console.warn(`[cmd] ⚠ ${m}`) }
  error(m: string) { console.error(`[cmd] ✖ ${m}`) }
  async handle(): Promise<number | void> { return Command.SUCCESS }
}

type CmdCtor = new () => Command
export const commands = new Map<string, { tatemono: string; Cmd: CmdCtor }>()
const tasks = new Map<string, cron.ScheduledTask>()

export function registerCommand(tatemono: string, Cmd: CmdCtor) {
  const inst = new Cmd()
  commands.set(inst.signature, { tatemono, Cmd })
  if (inst.schedule) startTask(inst.signature, inst.schedule)
}

export async function runCommand(signature: string): Promise<number> {
  const entry = commands.get(signature)
  if (!entry) { Log.error(`Command "${signature}" is not defined.`); return 1 }
  const code = await new entry.Cmd().handle()
  return typeof code === 'number' ? code : 0
}

let schedulerOn = false
export function startScheduler() {
  schedulerOn = true
  for (const [sig, { Cmd }] of commands) { const c = new Cmd(); if (c.schedule) startTask(sig, c.schedule) }
}

function startTask(signature: string, expr: string) {
  if (!schedulerOn) return                          // only the worker process runs schedules
  tasks.get(signature)?.stop()
  if (!cron.validate(expr)) { Log.warn(`Invalid cron "${expr}" for ${signature}`); return }
  tasks.set(signature, cron.schedule(expr, () => { runCommand(signature).catch(e => Log.error(`${signature}: ${e?.message}`)) }))
  Log.info(`Schedule registered: ${signature} (${expr})`)
}

export function unregisterTatemonoCommands(tatemono: string) {
  for (const [sig, v] of [...commands]) if (v.tatemono === tatemono) { tasks.get(sig)?.stop(); tasks.delete(sig); commands.delete(sig) }
}
