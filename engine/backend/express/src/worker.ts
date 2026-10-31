// Queue worker + scheduler (Laravel: `queue:work` + `schedule:work`). Run with `npm run queue`.
import { loadAllGenerated } from './engine/build'
import { workOnce, startScheduler, Log } from './runtime'

await loadAllGenerated()
startScheduler()
Log.info('Queue worker + scheduler running')
const queues = (process.env.QUEUE_NAMES ?? 'default,heavy').split(',')
for (;;) {
  let worked = false
  for (const q of queues) worked = (await workOnce(q.trim())) || worked
  if (!worked) await new Promise(r => setTimeout(r, 1000))
}
