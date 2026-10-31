// artisan-style runner: `npm run pluff -- scheduler-test:ping-health`
import { loadAllGenerated } from './engine/build'
import { runCommand, commands } from './runtime'

await loadAllGenerated()
const sig = process.argv[2]
if (!sig || sig === 'list') { for (const [s, { tatemono }] of commands) console.log(`${s}  (${tatemono})`); process.exit(0) }
process.exit(await runCommand(sig))
