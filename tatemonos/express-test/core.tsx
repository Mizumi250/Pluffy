/* @arkzen:meta
name: express-test
version: 1.0.0
description: "Exercises the Express backend (:ts variants) end to end: auth, CRUD, policy, middleware, custom endpoint, custom route, job, event/listener, console command, mail, notification and realtime."
auth: true
*/

/* @arkzen:database:tickets
table: tickets
timestamps: true
softDeletes: false
columns:
  user_id:
    type: foreignId
    nullable: true
  title:
    type: string
    length: 255
  status:
    type: string
    length: 30
    default: open
  priority:
    type: integer
    default: 1
  done:
    type: boolean
    default: false
seeder:
  count: 2
  data:
    - title: Seeded ticket A
      status: open
      priority: 2
    - title: Seeded ticket B
      status: closed
      priority: 1
*/

/* @arkzen:database:event_log
table: event_log
timestamps: true
columns:
  event_name:
    type: string
  listener:
    type: string
  payload:
    type: text
    nullable: true
*/

/* @arkzen:database:job_results
table: job_results
timestamps: true
columns:
  job_name:
    type: string
  status:
    type: string
*/

/* @arkzen:api:tickets
model: Ticket
controller: TicketController
prefix: /api/express-test
middleware: [auth:sanctum]
policy: true
endpoints:
  index:
    method: GET
    route: /tickets
    description: List tickets
    query:
      search: string
      status: string
      per_page: integer|default:10
    response:
      type: collection
  store:
    method: POST
    route: /tickets
    description: Create ticket
    validation:
      title: required|string|max:255
      status: sometimes|string|in:open,closed
      priority: sometimes|integer|min:1
      done: sometimes|boolean
      user_id: sometimes|integer
    response:
      type: single
  show:
    method: GET
    route: /tickets/{id}
    description: Show ticket
    response:
      type: single
  update:
    method: PUT
    route: /tickets/{id}
    description: Update ticket
    validation:
      title: sometimes|string|max:255
      status: sometimes|string|in:open,closed
    response:
      type: single
  destroy:
    method: DELETE
    route: /tickets/{id}
    description: Delete ticket
    response:
      type: message
      value: Ticket deleted
  stats:
    method: GET
    route: /stats
    description: Custom endpoint with a :ts body
    response:
      type: single
*/

/* @arkzen:api:public_ping
model: JobResult
controller: PingController
prefix: /api/express-test
middleware: [requireJson]
endpoints:
  index:
    method: GET
    route: /ping
    description: Public, passes requireJson
    response:
      type: array
*/

/* @arkzen:routes
controller: ProbeController
middleware: []
routes:
  - method: GET
    route: /api/express-test/probe/{name}
    handler: probe
*/

/* @arkzen:middleware:ts:requireJson
*/
if (!request.isJson()) {
  return response.json({ message: 'Content-Type: application/json is required.' }, 415)
}
return next()
/* @arkzen:middleware:ts:requireJson:end */

/* @arkzen:middleware:php:requireJson
*/
return $next($request);
/* @arkzen:middleware:php:requireJson:end */

/* @arkzen:policy:ts:delete
*/
return user?.role === 'admin'
/* @arkzen:policy:ts:delete:end */

/* @arkzen:endpoint:ts:stats
*/
const total = await Ticket.count()
const open = await Ticket.where('status', 'open').count()
return response.json({ total, open, closed: total - open, by: request.user().email })
/* @arkzen:endpoint:ts:stats:end */

/* @arkzen:handler:ts:probe
*/
return response.json({ probe: request.route('name'), params, at: 'express' })
/* @arkzen:handler:ts:probe:end */

/* @arkzen:jobs:process-data
queue: default
tries: 2
timeout: 20
*/
/* @arkzen:jobs:process-data:end */

/* @arkzen:jobs:ts:record-result
queue: default
tries: 2
timeout: 20
*/
const mode = this.data?.mode ?? 'default'
await JobResult.create({ job_name: 'record-result', status: 'completed:' + mode })
/* @arkzen:jobs:ts:record-result:end */

/* @arkzen:events:ticket-created
listeners: [LogTicket, CountTicket]
*/
/* @arkzen:events:ticket-created:end */

/* @arkzen:listener:ts:LogTicket
*/
await EventLog.create({ event_name: 'ticket-created', listener: 'LogTicket', payload: JSON.stringify(event.data) })
/* @arkzen:listener:ts:LogTicket:end */

/* @arkzen:listener:ts:CountTicket
*/
await EventLog.create({ event_name: 'ticket-created', listener: 'CountTicket', payload: String(await Ticket.count()) })
/* @arkzen:listener:ts:CountTicket:end */

/* @arkzen:console:ts:ping
signature: express-test:ping
description: Writes a job_results row
schedule: '* * * * *'
*/
await JobResult.create({ job_name: 'ping', status: 'ran' })
this.info('[express-test] ping done')
return Command.SUCCESS
/* @arkzen:console:ts:ping:end */

/* @arkzen:mail:welcome-mail
subject: "Welcome to Pluff"
data:
  username: string
  app_name: string
*/
/* @arkzen:mail:welcome-mail:end */

/* @arkzen:notifications:db-ping
channels: [database]
message: "You have a new database notification"
subject: "DB Ping"
*/
/* @arkzen:notifications:db-ping:end */

/* @arkzen:realtime:express-test-public
type: public
*/
/* @arkzen:realtime:express-test-public:end */

/* @arkzen:realtime:message-sent-public
channel: express-test-public
type: public
*/
/* @arkzen:realtime:message-sent-public:end */

/* @arkzen:web:components:shared */

'use client'

import React from 'react'

/* @arkzen:web:components:shared:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:guest */
const IndexPage = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-semibold">Express backend test</h1>
      <p className="text-neutral-600">Hit /api/express-test/* to exercise the :ts variants.</p>
    </div>
  )
}

export default IndexPage
/* @arkzen:web:page:index:end */
