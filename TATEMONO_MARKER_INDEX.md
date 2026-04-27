# Arkzen @arkzen Marker Index

## Complete Marker Reference with Tatemono Examples

### Organizational Markers

#### 1️⃣ @arkzen:meta
- **Purpose:** Tatemono metadata and configuration
- **Type:** YAML block (required first marker)
- **Top-level fields:** name, version, description, auth, auth_seed, favicon, dependencies
- **Examples found in:** All 17 tatemonos (required)
- **Key discovery:** auth_seed can pre-populate users for auth:true tatemonos

**Real examples:**
```
- auth-test: auth:true
- body-mail-notification: auth:true with auth_seed users
- inventory-management: auth:false
- roles-test: auth:true with auth_seed (admin/user roles)
```

---

#### 2️⃣ @arkzen:config
- **Purpose:** Global UI/UX configuration
- **Type:** YAML block
- **Sections:** toast, modal, table, layout (guest/auth)
- **Examples found in:** auth-test, crud-test, inventory-management, mail-test, notification-test, etc. (most tatemonos)
- **Key discovery:** layout.guest and layout.auth use className field for Tailwind classes

**Real examples:**
```
- crud-test: toast(top-right, 3000ms), modal(2xl, blur)
- inventory-management: table(striped, hoverable)
- notification-test: toast(top-right, 5000ms)
```

---

### Data Architecture Markers

#### 3️⃣ @arkzen:database
- **Purpose:** Database table schema definition
- **Type:** YAML block
- **Structure:** table, timestamps, softDeletes, columns (DICT!), seeder (optional)
- **Column format:** **DICT with column_name as key** — NOT array
- **Examples found in:** crud-test, events-test, inventory-management, job-test, mail-test, notification-test, roles-test, scheduler-test, upload-test
- **Key discovery:** Columns are dict where each key is column name with properties (type, length, nullable, default, etc.)

**Real examples:**
```
crud-test:items:
  - id: integer, primary, autoIncrement
  - name: string(255), not nullable
  - status: string(50), default:active
  - tags: string, nullable

inventory-management:inventories:
  - price: decimal(precision:10, scale:2)
  - sku: string(100), unique

events-test:event_log:
  - duration_ms: integer, nullable
```

---

#### 4️⃣ @arkzen:api
- **Purpose:** RESTful API endpoints definition
- **Type:** YAML block
- **Structure:** model, controller, prefix, middleware, resource, policy, factory, endpoints (DICT!)
- **Endpoint format:** **DICT with method_name as key** — NOT array
- **Examples found in:** crud-test, events-test, inventory-management, job-test, mail-test, middleware-test, notification-test, roles-test, scheduler-test, upload-test
- **Key discovery:** Endpoints dict keys are method names (index, store, show, update, destroy, custom names)

**Real examples:**
```
crud-test:items:
  endpoints:
    index: GET /items → collection
    store: POST /items → single (with validation)
    show: GET /items/{id} → single
    update: PUT /items/{id} → single (with validation)
    destroy: DELETE /items/{id} → message("Item deleted")

notification-test:notifications:
  endpoints:
    index: GET /inbox → collection [auth middleware]
    store: POST /trigger → single (type:notification_trigger)
    destroy: DELETE /inbox/{id} → message
    readAll: POST /inbox/read-all → message
```

---

#### 5️⃣ @arkzen:routes
- **Purpose:** Custom route definitions (non-resource)
- **Type:** YAML block with routes as ARRAY
- **Structure:** controller, middleware, routes (ARRAY of route objects)
- **Examples found in:** errors-test
- **Key discovery:** Each route has method, route, handler properties

**Real example:**
```
errors-test:
  controller: SimulateController
  routes:
    - method: GET
      route: /api/errors-test/simulate/{code}
      handler: simulate
```

---

### Communication Markers

#### 6️⃣ @arkzen:mail
- **Purpose:** Mail class definition with subject and data variables
- **Type:** YAML block + optional Blade HTML body
- **Structure:** subject, data (DICT of field_name: type), optional Blade HTML after YAML
- **Examples found in:** mail-test, body-mail-notification
- **Key discovery:** HTML body is placed **after the YAML closing `*/`**, not in a field

**Real examples:**
```
mail-test:welcome-mail:
  subject: "Welcome to Arkzen"
  data:
    username: string
    app_name: string

body-mail-notification:welcome:
  subject: (quoted string)
  data:
    field_name: type (dict)
  [Blade HTML here if needed]
```

---

#### 7️⃣ @arkzen:notifications
- **Purpose:** Notification class definition with channels and message
- **Type:** YAML block
- **Structure:** channels (ARRAY!), message, subject, channel_type (optional)
- **Channel options:** database, mail, broadcast
- **channel_type:** private or public (for broadcast)
- **Examples found in:** notification-test (5 different notification classes)
- **Key discovery:** channels is always ARRAY format [database], [mail], [broadcast, database], [database, mail, broadcast]

**Real examples:**
```
notification-test:database-ping:
  channels: [database]
  message: "You have a new database notification"
  subject: "Database Ping"

notification-test:broadcast-ping:
  channels: [broadcast, database]
  channel_type: private
  message: "Real-time notification received"
  subject: "Broadcast Ping"

notification-test:all-channels:
  channels: [database, mail, broadcast]
  channel_type: private
  message: "Sent to all three channels"
  subject: "All Channels Test"
```

---

### Processing Markers

#### 8️⃣ @arkzen:events
- **Purpose:** Event and listener registration
- **Type:** YAML block with listeners as ARRAY
- **Structure:** listeners (ARRAY of listener class names)
- **Examples found in:** events-test (3 events)
- **Key discovery:** listeners is array format [Listener1, Listener2, Listener3]

**Real examples:**
```
events-test:user-signed-up:
  listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]

events-test:order-placed:
  listeners: [ProcessPayment, UpdateInventory, SendOrderConfirmation]

events-test:data-exported:
  listeners: [LogExportActivity, CleanupTempFiles]
```

---

#### 9️⃣ @arkzen:jobs
- **Purpose:** Queue job definition
- **Type:** YAML block + PHP handle() method body
- **Structure:** queue, tries, timeout, [PHP body]
- **Examples found in:** job-test (2 jobs)
- **Key discovery:** queue names are flexible (default, heavy, mail)

**Real examples:**
```
job-test:process-data:
  queue: default
  tries: 3
  timeout: 30
  [handle() method implementation]

job-test:heavy-computation:
  queue: heavy
  tries: 1
  timeout: 120
  [handle() method implementation]
```

---

#### 🔟 @arkzen:console
- **Purpose:** Artisan console command definition
- **Type:** YAML block + PHP handle() method body
- **Structure:** signature, description, schedule (cron), [PHP body]
- **Examples found in:** scheduler-test (2+ commands)
- **Key discovery:** schedule field uses cron format (e.g., '0 * * * *' for hourly)

**Real examples:**
```
scheduler-test:cleanup-temp:
  signature: scheduler-test:cleanup-temp
  description: Deletes temporary files older than 24h
  schedule: '0 * * * *'
  [handle() method]

scheduler-test:generate-report:
  signature: scheduler-test:generate-report
  description: Generates a daily activity report
  schedule: '0 8 * * *'
  [handle() method]
```

---

### Code Injection Markers

#### 1️⃣1️⃣ @arkzen:middleware
- **Purpose:** Middleware body code injection
- **Type:** PHP code block
- **Structure:** (empty YAML), [raw PHP code]
- **Examples found in:** middleware-test
- **Key discovery:** PHP code is placed raw between markers, no base64 encoding in display

**Real example:**
```
middleware-test:requireJson:
  if (!$request->isJson()) {
      return response()->json([...], 415);
  }
  return $next($request);
```

---

#### 1️⃣2️⃣ @arkzen:endpoint
- **Purpose:** Controller endpoint method body injection
- **Type:** PHP code block
- **Structure:** (empty YAML), [raw PHP code]
- **Examples found in:** body-endpoint-handler (echo, stats endpoints), body-mail-notification (sendMail, notify endpoints)
- **Key discovery:** Replaces the default "Not implemented" stub with actual business logic

**Real examples:**
```
body-endpoint-handler:echo:
  $input = $request->all();
  $record = ProbeResult::create([...]);
  return response()->json([...]);

body-mail-notification:sendMail:
  $validated = $request->validate([...]);
  Mail::to($validated['to'])->send(new MailClass(...));
```

---

#### 1️⃣3️⃣ @arkzen:handler
- **Purpose:** Custom route handler body injection
- **Type:** PHP code block
- **Examples found in:** body-endpoint-handler (likely)
- **Key discovery:** Similar to @arkzen:endpoint but for standalone route handlers

---

#### 1️⃣4️⃣ @arkzen:listeners
- **Purpose:** Event listener class implementation
- **Type:** PHP code block
- **Examples found in:** events-test (listener implementations)
- **Key discovery:** Full listener class implementation with ShouldQueue, handle() method, etc.

---

### Frontend Markers

#### 1️⃣5️⃣ @arkzen:components:shared
- **Purpose:** Shared React components, types, imports
- **Type:** JavaScript/React code block
- **Structure:** (empty YAML), [imports, types, utilities]
- **Examples found in:** All 17 tatemonos (standard in every React tatemono)
- **Key discovery:** Placed before page components, sets up shared context (auth store, utilities)

**Real example:**
```
'use client'
import React, { useState } from 'react'
import { useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

if (typeof window !== 'undefined') {
  setActiveTatemono('auth-test')
}
```

---

#### 1️⃣6️⃣ @arkzen:page
- **Purpose:** Page component definition
- **Type:** React component marker
- **Structure:** (empty YAML), @arkzen:page:layout:LAYOUT_TYPE, [React component]
- **Layout types:** guest, auth
- **Examples found in:** All 17 tatemonos (at least one page per tatemono)
- **Key discovery:** Can have multiple pages per tatemono

**Real examples:**
```
auth-test:login:
  @arkzen:page:layout:guest
  const LoginPage = () => { ... }

auth-test:dashboard:
  @arkzen:page:layout:auth
  const DashboardPage = () => { ... }

crud-test:index:
  @arkzen:page:layout:guest
  const IndexPage = () => { ... }
```

---

#### 1️⃣7️⃣ @arkzen:store
- **Purpose:** Global state/store definition
- **Type:** (Reserved for future use in current tatemonos)
- **Examples found in:** Not heavily used in current 17 tatemonos

---

## Marker Frequency in 17 Tatemonos

| Marker | Count | Found In |
|--------|-------|----------|
| @arkzen:meta | 17/17 ✅ | All tatemonos |
| @arkzen:config | 15/17 | Most tatemonos |
| @arkzen:database | 12/17 | Ones with data tables |
| @arkzen:api | 13/17 | Ones with API |
| @arkzen:routes | 1/17 | errors-test only |
| @arkzen:mail | 2/17 | mail-test, body-mail-notification |
| @arkzen:notifications | 1/17 | notification-test (5 notification classes) |
| @arkzen:events | 1/17 | events-test (3 event classes) |
| @arkzen:jobs | 1/17 | job-test (2 job classes) |
| @arkzen:console | 1/17 | scheduler-test (2+ command classes) |
| @arkzen:middleware | 1/17 | middleware-test |
| @arkzen:endpoint | 2/17 | body-endpoint-handler, body-mail-notification |
| @arkzen:handler | ~1/17 | body-endpoint-handler |
| @arkzen:listeners | 1/17 | events-test (listener implementations) |
| @arkzen:components:shared | 17/17 ✅ | All React tatemonos |
| @arkzen:page | 17/17 ✅ | All React tatemonos |
| @arkzen:store | 0/17 | Reserved for future |

---

## Quick Copy-Paste Templates

### Database Table
```yaml
/* @arkzen:database:TABLE_NAME
table: table_name
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
seeder:
  count: 3
  data:
    - name: Item 1
    - name: Item 2
    - name: Item 3
*/
```

### API Endpoints
```yaml
/* @arkzen:api:MODEL_NAME
model: ModelName
controller: ControllerName
prefix: /api/slug
middleware: []
endpoints:
  index:
    method: GET
    route: /resource
    description: List all
    response:
      type: collection
  store:
    method: POST
    route: /resource
    description: Create one
    validation:
      field: required|string|max:255
    response:
      type: single
  destroy:
    method: DELETE
    route: /resource/{id}
    description: Delete one
    response:
      type: message
      value: Deleted
*/
```

### Mail
```yaml
/* @arkzen:mail:mail-name
subject: "Subject Line"
data:
  variable_name: string
  another_var: integer
*/
<!-- Optional Blade HTML here -->
/* @arkzen:mail:mail-name:end */
```

### Notification
```yaml
/* @arkzen:notifications:notification-name
channels: [database, mail]
message: "Notification message text"
subject: "Subject for mail channel"
channel_type: private
*/
/* @arkzen:notifications:notification-name:end */
```

---

## Full Documentation

See **TATEMONO_SYNTAX_REFERENCE.md** for exhaustive details with all code examples.
See **SYNTAX_FINDINGS_SUMMARY.md** for quick format discoveries.
