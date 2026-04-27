# Arkzen Tatemono Syntax — Quick Findings

## Critical Discoveries

### 1. @arkzen:database — Column Format
✅ **DICT FORMAT** (not array)
```yaml
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 255
    nullable: false
```

**Fields available:**
- `type` (string, integer, text, decimal, boolean, datetime)
- `length` (for string fields)
- `nullable` (boolean)
- `default` (scalar value)
- `primary` (boolean)
- `autoIncrement` (boolean)
- `unique` (boolean)
- `precision` + `scale` (for decimal)

---

### 2. @arkzen:api — Endpoint Definition
✅ **DICT FORMAT** with method name as key
```yaml
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
    response:
      type: single
```

**Structure:**
- Top-level keys: `model`, `controller`, `prefix`, `middleware`, `endpoints` (dict), `resource`, `policy`, `factory`
- Endpoint keys: `method`, `route`, `description`, `type` (optional), `validation` (optional), `response`
- Response: `type` + optional `value` for message type

---

### 3. @arkzen:mail — Mail Definition
✅ **YAML + HTML Body**
```yaml
/* @arkzen:mail:welcome-mail
subject: "Welcome to Arkzen"
data:
  username: string
  app_name: string
*/
<!-- Blade HTML goes here if defined -->
/* @arkzen:mail:welcome-mail:end */
```

**Key points:**
- YAML with `subject` (quoted) and `data` (dict of field_name: type)
- Blade HTML body is placed **after the YAML closing `*/`** and before `:end`
- No explicit `blade_body` field; body is implicit placement

---

### 4. @arkzen:notifications — Notification Definition
✅ **YAML with ARRAY channels**
```yaml
/* @arkzen:notifications:database-ping
channels: [database]
message: "You have a new database notification"
subject: "Database Ping"
*/
/* @arkzen:notifications:database-ping:end */

/* @arkzen:notifications:all-channels
channels: [database, mail, broadcast]
channel_type: private
message: "This notification was sent to all three channels"
subject: "All Channels Test"
*/
/* @arkzen:notifications:all-channels:end */
```

**Key points:**
- `channels` is always **ARRAY** (not string)
- Supported channels: "database", "mail", "broadcast"
- Optional `channel_type` field: "private" or "public" (for broadcast)
- `message` and `subject` as strings

---

### 5. @arkzen:config — Configuration
✅ **YAML with nested structure**
```yaml
/* @arkzen:config
toast:
  position: top-right
  duration: 3000
modal:
  borderRadius: 2xl
  backdrop: blur
  animation: fadeScale
table:
  striped: true
  hoverable: true
layout:
  guest:
    className: "min-h-screen bg-neutral-50"
  auth:
    className: "min-h-screen bg-neutral-50"
*/
```

**Blocks:**
- `toast`: position, duration (ms)
- `modal`: borderRadius, backdrop, animation
- `table`: striped, hoverable
- `layout`: guest/auth with className

---

### 6. @arkzen:routes — Custom Routes
✅ **Routes array format**
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

### 7. @arkzen:events — Event + Listeners
✅ **Listeners as ARRAY**
```yaml
/* @arkzen:events:user-signed-up
listeners: [SendWelcomeEmail, UpdateUserStats, NotifyAdmins]
*/
/* @arkzen:events:user-signed-up:end */
```

---

### 8. @arkzen:jobs — Job Configuration
✅ **YAML + PHP body**
```yaml
/* @arkzen:jobs:process-data
queue: default
tries: 3
timeout: 30
*/
public function handle(): void { /* ... */ }
/* @arkzen:jobs:process-data:end */
```

**Fields:** queue, tries, timeout

---

### 9. @arkzen:console — Console Commands
✅ **YAML + PHP handle() method**
```yaml
/* @arkzen:console:cleanup-temp
signature: scheduler-test:cleanup-temp
description: Deletes temporary files older than 24h
schedule: '0 * * * *'
*/
public function handle(): int { /* ... */ }
/* @arkzen:console:cleanup-temp:end */
```

**Fields:** signature, description, schedule (cron)

---

### 10. @arkzen:middleware — Middleware Body Injection
✅ **PHP code between markers**
```php
/* @arkzen:middleware:requireJson
*/
if (!$request->isJson()) {
    return response()->json(['message' => '...'], 415);
}
return $next($request);
/* @arkzen:middleware:requireJson:end */
```

---

### 11. @arkzen:endpoint — Endpoint Body Injection
✅ **PHP code in controller method**
```php
/* @arkzen:endpoint:echo
*/
$input = $request->all();
return response()->json(['echo' => $input]);
/* @arkzen:endpoint:echo:end */
```

---

### 12. @arkzen:meta — Tatemono Metadata
✅ **YAML with auth_seed support**
```yaml
/* @arkzen:meta
name: auth-test
version: 1.0.0
description: Tests core authentication
auth: true
auth_seed:
  users:
    - name: Admin User
      email: admin@test.com
      password: password123
      role: admin
    - name: Regular User
      email: user@test.com
      password: password123
      role: user
*/
```

**Fields:** name, version, description, auth (boolean), auth_seed (optional), favicon (optional), dependencies (optional)

---

## Real Tatemono Examples Used

All patterns verified against these 17 actual tatemonos:

1. ✅ auth-test — @arkzen:meta, @arkzen:config, @arkzen:page
2. ✅ body-endpoint-handler — @arkzen:database, @arkzen:api, @arkzen:endpoint
3. ✅ body-mail-notification — @arkzen:database, @arkzen:api, @arkzen:endpoint, @arkzen:mail
4. ✅ broadcast-test — Similar patterns
5. ✅ crud-test — @arkzen:database (full), @arkzen:api (full), @arkzen:seeder
6. ✅ errors-test — @arkzen:routes, error handlers
7. ✅ events-test — @arkzen:events, @arkzen:listeners, @arkzen:database
8. ✅ inventory-management — @arkzen:database (decimal fields), @arkzen:api
9. ✅ job-test — @arkzen:jobs, @arkzen:api
10. ✅ mail-test — @arkzen:mail, @arkzen:api
11. ✅ middleware-test — @arkzen:middleware, @arkzen:api
12. ✅ new-updates-styles — @arkzen:components:shared, @arkzen:page
13. ✅ notification-test — @arkzen:notifications (multi-channel)
14. ✅ portfolio-test — @arkzen:config, @arkzen:page
15. ✅ roles-test — @arkzen:meta with auth_seed, @arkzen:api with role middleware
16. ✅ scheduler-test — @arkzen:console, @arkzen:api, @arkzen:database
17. ✅ upload-test — @arkzen:database, @arkzen:api

---

## Format Patterns Summary

| Marker | Format | Key Insight |
|--------|--------|-------------|
| @arkzen:database | YAML | Columns as DICT, not array |
| @arkzen:api | YAML | Endpoints as DICT (key = method name) |
| @arkzen:mail | YAML + HTML | Body after YAML `*/`, no explicit field |
| @arkzen:notifications | YAML | channels as ARRAY [channel1, channel2] |
| @arkzen:config | YAML | Nested toast/modal/table/layout blocks |
| @arkzen:routes | YAML | routes as ARRAY of route objects |
| @arkzen:events | YAML | listeners as ARRAY |
| @arkzen:jobs | YAML + PHP | queue, tries, timeout fields |
| @arkzen:console | YAML + PHP | signature, description, schedule (cron) |
| @arkzen:middleware | PHP | Raw PHP code between markers |
| @arkzen:endpoint | PHP | Raw PHP code in controller method |
| @arkzen:meta | YAML | name, version, description, auth, auth_seed |

---

## Full Reference

See **TATEMONO_SYNTAX_REFERENCE.md** for complete details with all examples and explanations.
