# Arkzen Tatemono Syntax Reference

**Last Updated:** From actual tatemonos analysis (17 samples)

This document shows the **EXACT** syntax used by real tatemonos for each `@arkzen` marker type, with examples directly from the codebase.

---

## 1. @arkzen:meta — Tatemono Metadata

**Location:** Top of every tatemono (first marker)

**Format:** YAML block (always required)

**Fields:**
- `name` — tatemono slug (kebab-case)
- `version` — semver (1.0.0, 2.1.0, etc.)
- `description` — one-line description
- `auth` — boolean (true/false) — triggers AuthBuilder
- `auth_seed` — (optional) user seed data for auth:true tatemonos
- `favicon` — (optional) external URL or emoji
- `dependencies` — (optional) array of tatemono names

**Examples:**

```yaml
/* @arkzen:meta
name: auth-test
version: 1.0.0
description: Tests core authentication — register, login, logout, and protected dashboard.
auth: true
*/

/* @arkzen:meta
name: body-mail-notification
version: 1.0.0
description: Tests MailBuilder v3.1 blade_body injection and NotificationBuilder v3.9 toMail_body injection.
auth: true
auth_seed:
  users:
    - name: Test User
      email: test@body-mail-notification.com
      password: password123
*/

/* @arkzen:meta
name: inventory-management
version: 2.0.0
description: Full inventory management with stock tracking
auth: false
dependencies: []
*/
```

---

## 2. @arkzen:config — Global Configuration

**Location:** After @arkzen:meta

**Format:** YAML block

**Common Fields:**
- `toast` — Toast notification settings
  - `position` — "top-right", "top-left", "bottom-right", "bottom-left"
  - `duration` — milliseconds (3000, 4000, 5000)
- `modal` — Modal dialog settings
  - `borderRadius` — Tailwind value ("2xl", "lg", "md")
  - `backdrop` — "blur" or "dark"
  - `animation` — "fadeScale", "slideDown", etc.
- `table` — Table display settings
  - `striped` — boolean
  - `hoverable` — boolean
- `layout` — Layout class configurations
  - `guest` — { `className`: tailwind classes }
  - `auth` — { `className`: tailwind classes }

**Examples:**

```yaml
/* @arkzen:config
toast:
  position: top-right
  duration: 3000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/

/* @arkzen:config
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
toast:
  position: top-right
  duration: 3000
table:
  striped: true
  hoverable: true
*/

/* @arkzen:config
toast:
  position: top-right
  duration: 5000
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/
```

---

## 3. @arkzen:database — Database Table Definition

**Location:** After @arkzen:config

**Format:** YAML block with specific structure

**Key Fields:**
- `table` — table name (or part of marker name: `@arkzen:database:items` → "items" is the table)
- `columns` — **DICT** format (column_name: properties)
  - Column property keys: `type`, `length`, `primary`, `autoIncrement`, `nullable`, `default`, `unique`, `precision`, `scale`
- `timestamps` — boolean (adds created_at, updated_at)
- `softDeletes` — boolean (adds deleted_at)
- `seeder` — (optional) seed data
  - `count` — number of rows
  - `data` — array of objects with column values

**Column Property Types:**
- `type`: "integer", "string", "text", "boolean", "decimal", "datetime"
- `length`: for string (255, 100, 50)
- `precision` / `scale`: for decimal (10, 2)
- `nullable`: true/false
- `default`: scalar value or expression
- `primary`: true (for PK)
- `autoIncrement`: true (for PK)
- `unique`: true

**Examples:**

```yaml
/* @arkzen:database:items
table: items
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  description:
    type: text
    nullable: true
  status:
    type: string
    length: 50
    default: active
  priority:
    type: integer
    default: 0
  tags:
    type: string
    nullable: true
seeder:
  count: 5
  data:
    - name: Alpha Item
      description: First seeded item
      status: active
      priority: 1
      tags: test,seed
    - name: Beta Item
      description: Second seeded item
      status: pending
      priority: 2
      tags: test
*/

/* @arkzen:database:inventories
table: inventories
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
  sku:
    type: string
    length: 100
    unique: true
    nullable: false
  quantity:
    type: integer
    default: 0
    nullable: false
  price:
    type: decimal
    precision: 10
    scale: 2
    nullable: false
  category:
    type: string
    length: 100
    nullable: true
  description:
    type: text
    nullable: true
seeder:
  count: 5
  data:
    - name: Wireless Keyboard
      sku: WK-001
      quantity: 50
      price: 1299.00
      category: Electronics
      description: Compact wireless keyboard
*/

/* @arkzen:database:event_log
table: event_log
timestamps: true
softDeletes: false
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  event_name:
    type: string
    length: 255
    nullable: false
  listener_name:
    type: string
    length: 255
    nullable: false
  status:
    type: string
    length: 50
    default: completed
  payload:
    type: text
    nullable: true
  duration_ms:
    type: integer
    nullable: true
*/
```

**Note:** No `@arkzen:database` block is needed when `auth: true` in meta — the users table is auto-generated by AuthBuilder.

---

## 4. @arkzen:api — API Endpoint Definition

**Location:** After @arkzen:database

**Format:** YAML block with nested structure

**Top-level Fields:**
- `model` — Laravel model name (e.g., "Item", "EventLog")
- `controller` — Controller class name (e.g., "ItemController")
- `prefix` — API route prefix ("/api/crud-test")
- `middleware` — array of middleware names (e.g., `[auth]`, `[auth, role:admin]`)
- `resource` — boolean (generate resource routes: index, store, show, update, destroy)
- `policy` — boolean (generate policy class)
- `factory` — boolean (generate factory class)
- `endpoints` — **DICT** of endpoint definitions (key = method name)

**Endpoint Properties:**
- `method` — HTTP verb ("GET", "POST", "PUT", "DELETE")
- `route` — path segment (can include `{id}`, `{slug}`)
- `description` — human description
- `type` — (optional) custom endpoint type (e.g., "job_dispatch", "mail_send", "event_fire")
- `validation` — (optional) Laravel validation rules (as dict)
- `response` — response shape definition
  - `type` — "collection", "paginated", "single", "message"
  - `value` — (for type=message) message string

**Examples:**

```yaml
/* @arkzen:api:items
model: Item
controller: ItemController
prefix: /api/crud-test
middleware: []
resource: true
policy: true
factory: true
endpoints:
  index:
    method: GET
    route: /items
    description: Get all items
    response:
      type: collection
  store:
    method: POST
    route: /items
    description: Create item
    validation:
      name: required|string|max:255
      description: nullable|string
      status: sometimes|string|in:active,pending,archived
      priority: sometimes|integer|min:0
      tags: nullable|string
    response:
      type: single
  show:
    method: GET
    route: /items/{id}
    description: Get single item
    response:
      type: single
  update:
    method: PUT
    route: /items/{id}
    description: Update item
    validation:
      name: sometimes|string|max:255
      description: nullable|string
      status: sometimes|string|in:active,pending,archived
      priority: sometimes|integer|min:0
      tags: nullable|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /items/{id}
    description: Delete item
    response:
      type: message
      value: Item deleted
*/

/* @arkzen:api:event_log
model: EventLog
controller: EventLogController
prefix: /api/events-test
middleware: []
endpoints:
  index:
    method: GET
    route: /log
    description: Get event log entries
    response:
      type: paginated
  store:
    method: POST
    route: /fire
    description: Fire an event
    type: event_fire
    validation:
      event: required|string
      payload: nullable|array
    response:
      type: single
  clearLog:
    method: POST
    route: /log/clear
    description: Clear all log entries
    response:
      type: message
      value: Log cleared
*/

/* @arkzen:api:notifications
model: Notification
controller: NotificationController
prefix: /api/notification-test
middleware: [auth]
endpoints:
  index:
    method: GET
    route: /inbox
    description: Get all notifications for the authenticated user
    response:
      type: collection
  store:
    method: POST
    route: /trigger
    description: Trigger a notification
    type: notification_trigger
    validation:
      notification: required|string
    response:
      type: single
  destroy:
    method: DELETE
    route: /inbox/{id}
    description: Delete a notification
    response:
      type: message
      value: Notification deleted
  readAll:
    method: POST
    route: /inbox/read-all
    description: Mark all notifications as read
    response:
      type: message
      value: All notifications marked as read
*/
```

---

## 5. @arkzen:routes — Custom Routes (Non-Resource)

**Location:** Can appear instead of or alongside @arkzen:api

**Format:** YAML block with routes array

**Fields:**
- `controller` — Controller class name
- `middleware` — array of middleware
- `routes` — **ARRAY** of route definitions
  - Each route: `method`, `route`, `handler` (method name)

**Example:**

```yaml
/* @arkzen:routes
controller: SimulateController
middleware: []
routes:
  - method: GET
    route: /api/errors-test/simulate/{code}
    handler: simulate
*/
```

---

## 6. @arkzen:mail — Mail Class Definition

**Location:** Can appear multiple times (one per mail class)

**Format:** YAML block followed by optional HTML body

**Fields:**
- `subject` — email subject line (quoted string)
- `data` — **DICT** of data variables (name: type)
  - type: "string", "integer", "array", etc.

**HTML Body:** (optional)
- Blade HTML placed between the closing `*/` and `:end` marker
- `blade_body` property was mentioned in v3.1 docs, but actual format is:
  - YAML block closes with `*/`
  - Blade HTML follows immediately after
  - Marked with `/* @arkzen:mail:NAME:end */`

**Examples:**

```yaml
/* @arkzen:mail:welcome-mail
subject: "Welcome to Arkzen"
data:
  username: string
  app_name: string
*/
<!-- Blade HTML body would go here if defined -->
/* @arkzen:mail:welcome-mail:end */

/* @arkzen:mail:order-confirmation
subject: "Your order has been confirmed"
data:
  order_id: string
  total: string
  customer_name: string
*/
/* @arkzen:mail:order-confirmation:end */

/* @arkzen:mail:password-reset
subject: "Reset your password"
data:
  reset_link: string
  expires_in: string
*/
/* @arkzen:mail:password-reset:end */
```

---

## 7. @arkzen:notifications — Notification Class Definition

**Location:** Can appear multiple times

**Format:** YAML block

**Fields:**
- `channels` — **ARRAY** of channel names
  - Typical channels: "database", "mail", "broadcast"
  - Examples: `[database]`, `[mail]`, `[broadcast, database]`, `[database, mail, broadcast]`
- `message` — notification message text
- `subject` — notification subject (for mail channel)
- `channel_type` — (optional) "private" or "public" (for broadcast channel)

**Examples:**

```yaml
/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new database notification"
subject: "Database Ping"
*/
/* @arkzen:notifications:database-ping:end */

/* @arkzen:notifications:mail-ping
channels: [mail]
message: "This is a test mail notification"
subject: "Mail Ping from Arkzen"
*/
/* @arkzen:notifications:mail-ping:end */

/* @arkzen:notifications:broadcast-ping
channels: [broadcast, database]
channel_type: private
message: "Real-time notification received on your private channel!"
subject: "Broadcast Ping (Private)"
*/
/* @arkzen:notifications:broadcast-ping:end */

/* @arkzen:notifications:all-channels
channels: [database, mail, broadcast]
channel_type: private
message: "This notification was sent to all three channels simultaneously"
subject: "All Channels Test"
*/
/* @arkzen:notifications:all-channels:end */
```

---

## 8. @arkzen:events — Event Definition

**Location:** Defines event and its listeners

**Format:** YAML block with listeners array

**Fields:**
- `listeners` — **ARRAY** of listener class names

**Examples:**

```yaml
/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]
*/
/* @arkzen:events:user-signed-up:end */

/* @arkzen:events:order-placed
listeners: [ProcessPayment, UpdateInventory, SendOrderConfirmation]
*/
/* @arkzen:events:order-placed:end */

/* @arkzen:events:data-exported
listeners: [LogExportActivity, CleanupTempFiles]
*/
/* @arkzen:events:data-exported:end */
```

---

## 9. @arkzen:jobs — Job Definition

**Location:** Inside or near controller/model code

**Format:** YAML block followed by PHP handle() method body (base64-encoded or raw)

**Fields:**
- `queue` — queue name ("default", "heavy", "mail", etc.)
- `tries` — number of retries (integer)
- `timeout` — timeout in seconds (integer)

**Examples:**

```yaml
/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 30
*/
public function handle(): void
{
    $start = microtime(true);
    // Simulate work
    sleep(2);
    \App\Models\Arkzen\JobTest\JobResult::create([
        'job_name'     => 'process-data',
        'status'       => 'completed',
        'result'       => 'Data processed successfully',
        'processed_at' => now(),
    ]);
}
/* @arkzen:jobs:process-data:end */

/* @arkzen:jobs:heavy-computation
queue: heavy
tries: 1
timeout: 120
*/
public function handle(): void
{
    $start = microtime(true);
    // Simulate heavy work
    sleep(5);
    // Store result...
}
/* @arkzen:jobs:heavy-computation:end */
```

---

## 10. @arkzen:console — Console Command Definition

**Location:** Defines Artisan commands for scheduler

**Format:** YAML block followed by PHP handle() method

**Fields:**
- `signature` — command signature (e.g., "scheduler-test:cleanup-temp")
- `description` — command description
- `schedule` — (optional) cron expression (e.g., "0 * * * *" for hourly)

**Examples:**

```yaml
/* @arkzen:console:cleanup-temp
signature: scheduler-test:cleanup-temp
description: Deletes temporary files older than 24h
schedule: '0 * * * *'
*/
public function handle(): int
{
    $start = microtime(true);
    $this->info('[Arkzen:scheduler-test] Running cleanup-temp...');
    
    \App\Models\Arkzen\SchedulerTest\CommandRun::create([
        'command_name' => 'cleanup-temp',
        'signature'    => 'scheduler-test:cleanup-temp',
        'exit_code'    => 0,
        'output'       => 'Cleanup completed successfully.',
        'triggered_by' => 'schedule',
        'duration_ms'  => (int) ((microtime(true) - $start) * 1000),
    ]);
    
    return Command::SUCCESS;
}
/* @arkzen:console:cleanup-temp:end */

/* @arkzen:console:generate-report
signature: scheduler-test:generate-report
description: Generates a daily activity report
schedule: '0 8 * * *'
*/
public function handle(): int
{
    // Implementation...
}
/* @arkzen:console:generate-report:end */
```

---

## 11. @arkzen:middleware — Middleware Body Injection

**Location:** Near API or routes definitions

**Format:** YAML (empty) followed by PHP body code

**Fields:** None (just marker name)

**Usage:** PHP code between `*/` and `:end` is injected into middleware handle() method

**Examples:**

```php
/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json([
        'message' => 'Content-Type: application/json is required for this endpoint.',
        'hint'    => 'Set the Content-Type header to application/json',
    ], 415);
}
return $next($request);
/* @arkzen:middleware:requireJson:end */
```

---

## 12. @arkzen:endpoint — Endpoint Body Injection

**Location:** In API controller

**Format:** YAML (empty) followed by PHP code

**Fields:** None

**Usage:** PHP code injected into controller method (replaces stub)

**Examples:**

```php
/* @arkzen:endpoint:echo
*/
$input   = $request->all();
$count   = count($input);
$record  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::create([
    'source'  => 'endpoint-body',
    'probe'   => 'echo',
    'payload' => json_encode($input),
    'result'  => "Echoed {$count} field(s)",
    'ok'      => true,
]);
return response()->json([
    'injected'    => true,
    'builder'     => 'ControllerBuilder v7.0',
    'method'      => 'echo',
    'field_count' => $count,
    'echo'        => $input,
    'probe_id'    => $record->id,
]);
/* @arkzen:endpoint:echo:end */

/* @arkzen:endpoint:stats
*/
$total   = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::count();
$passed  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::where('ok', true)->count();
$failed  = \App\Models\Arkzen\BodyEndpointHandler\ProbeResult::where('ok', false)->count();
return response()->json([
    'total'  => $total,
    'passed' => $passed,
    'failed' => $failed,
]);
/* @arkzen:endpoint:stats:end */

/* @arkzen:endpoint:sendMail
*/
$validated = $request->validate([
    'mail' => 'required|string|in:welcome,receipt,alert',
    'to'   => 'required|email',
]);
// Mail sending logic...
/* @arkzen:endpoint:sendMail:end */
```

---

## 13. @arkzen:handler — Custom Route Handler Body Injection

**Location:** In routes file or handler definition

**Format:** YAML (empty) followed by PHP code

**Fields:** None

**Usage:** PHP code injected into custom route handler

**Examples:**

```php
/* @arkzen:handler:probeSimulator
*/
$code = $request->route('code');
// Handler logic...
/* @arkzen:handler:probeSimulator:end */
```

---

## 14. @arkzen:listeners — Listener Body Injection

**Location:** In event listener classes

**Format:** YAML (empty) followed by PHP code

**Fields:** None

**Examples:**

```php
/* @arkzen:listeners:SendWelcomeEmail
*/
class SendWelcomeEmail implements ShouldQueue {
  use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
  public $timeout = 30;

  public function handle($event) {
    $start = microtime(true);
    
    \DB::table('event_log')->insert([
        'event_name'   => 'user-signed-up',
        'listener_name' => 'SendWelcomeEmail',
        'status'       => 'completed',
        'duration_ms'  => (int)((microtime(true) - $start) * 1000),
    ]);
  }
}
/* @arkzen:listeners:SendWelcomeEmail:end */
```

---

## 15. @arkzen:components:shared — Shared Components

**Location:** Top of React component section

**Format:** Empty YAML followed by JavaScript/React code

**Fields:** None

**Usage:** Code between markers is placed at top of component file (imports, helpers, types)

**Examples:**

```javascript
/* @arkzen:components:shared */

'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Lock, ShieldCheck } from 'lucide-react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

// Activate the correct isolated auth context for this Tatemono
if (typeof window !== 'undefined') {
  setActiveTatemono('auth-test')
}

/* @arkzen:components:shared:end */
```

---

## 16. @arkzen:page — Page Component Definition

**Location:** React component definition

**Format:** Empty YAML marker

**Marker Variants:**
- `@arkzen:page:PAGE_NAME` — marks start of page component
- `@arkzen:page:layout:LAYOUT_NAME` — specifies layout ("guest" or "auth")

**Usage:** Wraps React component definition

**Examples:**

```javascript
/* @arkzen:page:login */
/* @arkzen:page:layout:guest */
const LoginPage = () => {
  // Component code...
  return (
    // JSX...
  )
}
/* @arkzen:page:login:end */

/* @arkzen:page:dashboard */
/* @arkzen:page:layout:auth */
const DashboardPage = () => {
  // Component code...
}
/* @arkzen:page:dashboard:end */
```

---

## 17. @arkzen:store — Global State/Store Definition

**Location:** (Observed in codebase but not heavily used in current tatemonos)

**Format:** YAML with store configuration

**Examples:** Not prominently featured in current tatemonos; likely reserved for future global state management

---

## Summary Table

| Marker | Format | Key Properties | Example |
|--------|--------|----------------|---------|
| `@arkzen:meta` | YAML | name, version, description, auth, auth_seed, favicon | see section 1 |
| `@arkzen:config` | YAML | toast, modal, table, layout | see section 2 |
| `@arkzen:database` | YAML | table, columns (dict), timestamps, softDeletes, seeder | see section 3 |
| `@arkzen:api` | YAML | model, controller, prefix, middleware, endpoints (dict) | see section 4 |
| `@arkzen:routes` | YAML | controller, middleware, routes (array) | see section 5 |
| `@arkzen:mail` | YAML + HTML | subject, data (dict), blade body | see section 6 |
| `@arkzen:notifications` | YAML | channels (array), message, subject, channel_type | see section 7 |
| `@arkzen:events` | YAML | listeners (array) | see section 8 |
| `@arkzen:jobs` | YAML + PHP | queue, tries, timeout, handle() method | see section 9 |
| `@arkzen:console` | YAML + PHP | signature, description, schedule, handle() method | see section 10 |
| `@arkzen:middleware` | PHP | (empty YAML), handler code | see section 11 |
| `@arkzen:endpoint` | PHP | (empty YAML), controller method body | see section 12 |
| `@arkzen:handler` | PHP | (empty YAML), route handler body | see section 13 |
| `@arkzen:listeners` | PHP | (empty YAML), listener class body | see section 14 |
| `@arkzen:components:shared` | JS/React | (empty YAML), shared code/types | see section 15 |
| `@arkzen:page` | React Marker | (empty YAML), page component | see section 16 |

---

## Key Patterns Observed

### 1. Column Definition Format
- **Always DICT** with column name as key
- Fields: `type`, `length`, `nullable`, `default`, `primary`, `autoIncrement`, `unique`, `precision`, `scale`
- No array format observed in any tatemonos

### 2. Endpoint Definition Format
- **DICT** with endpoint key = method name (index, store, show, update, destroy, custom names)
- Fields per endpoint: `method`, `route`, `description`, `type` (optional), `validation` (optional), `response`

### 3. Mail Definition
- YAML block with `subject` (quoted string) and `data` (DICT of field names and types)
- Blade HTML body is placed **after the closing `*/`** of YAML, before the `:end` marker

### 4. Notifications Format
- `channels` is always an **ARRAY** (not string)
- Examples: `[database]`, `[mail]`, `[broadcast, database]`, `[database, mail, broadcast]`
- Optional `channel_type: private|public` for broadcast channels

### 5. Database Seeder
- `seeder` block with `count` (number) and `data` (array of objects)
- Each object has column names as keys with seed values

### 6. Auth Seed (in meta)
- `auth_seed` → `users` → array of user objects
- User fields: `name`, `email`, `password`, `role` (optional)

### 7. Body Injection (@arkzen:endpoint, @arkzen:handler, @arkzen:middleware)
- PHP code is placed **raw** between the closing `*/` and `:end` marker
- Parser may base64-encode for storage, but display shows raw PHP
- Indentation is preserved

### 8. Middleware Declaration in API
- `middleware: []` or `middleware: [auth]` or `middleware: [auth, role:admin]`
- Array of middleware name tokens (colon-delimited for parameterized middleware)

---

## Tatemono File Checklist

A complete tatemono follows this structure:

```javascript
/* @arkzen:meta ... */
/* @arkzen:config ... */
/* @arkzen:database ... */ (optional, omitted if auth:true)
/* @arkzen:api ... */ (or @arkzen:routes)
/* @arkzen:mail ... */ (optional, can have multiple)
/* @arkzen:notifications ... */ (optional, can have multiple)
/* @arkzen:events ... */ (optional, can have multiple)
/* @arkzen:jobs ... */ (optional, can have multiple)
/* @arkzen:console ... */ (optional, can have multiple)
/* @arkzen:middleware:NAME */ (optional, can have multiple)
/* @arkzen:endpoint:NAME */ (optional, can have multiple)
/* @arkzen:components:shared */ ... /* @arkzen:components:shared:end */
/* @arkzen:page:NAME */ ... /* @arkzen:page:NAME:end */ (can have multiple)
```

---

**Reference Generated From:**
- auth-test/core.tsx
- body-endpoint-handler/core.tsx
- body-mail-notification/core.tsx
- broadcast-test/core.tsx
- crud-test/core.tsx
- errors-test/core.tsx
- events-test/core.tsx
- inventory-management/core.tsx
- job-test/core.tsx
- mail-test/core.tsx
- middleware-test/core.tsx
- new-updates-styles/core.tsx
- notification-test/core.tsx
- portfolio-test/core.tsx
- roles-test/core.tsx
- scheduler-test/core.tsx
- upload-test/core.tsx
