# Arkzen @arkzen Markers — Quick Reference Card

## Format Decisions at a Glance

### DICT vs ARRAY Format

| Marker | Format | Example |
|--------|--------|---------|
| `columns:` in @arkzen:database | **DICT** | `id: { type: integer, primary: true }` |
| `endpoints:` in @arkzen:api | **DICT** | `index: { method: GET, route: /items }` |
| `channels:` in @arkzen:notifications | **ARRAY** | `[database, mail, broadcast]` |
| `listeners:` in @arkzen:events | **ARRAY** | `[SendEmail, UpdateStats]` |
| `routes:` in @arkzen:routes | **ARRAY** | `[{ method: GET, route: / }]` |

---

## The 5 Most Important Things

### 1️⃣ Database Columns — DICT Format
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
  price:
    type: decimal
    precision: 10
    scale: 2
```
✅ Column name is **KEY**, properties are values
❌ NOT an array format

---

### 2️⃣ API Endpoints — DICT Format
```yaml
endpoints:
  index:
    method: GET
    route: /items
    response:
      type: collection
  store:
    method: POST
    route: /items
    validation:
      name: required|string|max:255
    response:
      type: single
```
✅ Method name (index, store, show) is **KEY**
❌ NOT an array format

---

### 3️⃣ Notifications Channels — ARRAY Format
```yaml
channels: [database]
channels: [mail]
channels: [broadcast, database]
channels: [database, mail, broadcast]
```
✅ Always **ARRAY**, not string
✅ Can combine: database, mail, broadcast

---

### 4️⃣ Mail Definition — HTML After YAML
```yaml
/* @arkzen:mail:welcome
subject: "Welcome"
data:
  username: string
*/
<!-- Blade HTML goes here -->
<h1>Welcome {{ $username }}</h1>
/* @arkzen:mail:welcome:end */
```
✅ Blade HTML **after `*/`**, not in field
❌ No explicit blade_body property

---

### 5️⃣ Auth with Seed Users
```yaml
/* @arkzen:meta
name: my-app
auth: true
auth_seed:
  users:
    - name: Admin
      email: admin@test.com
      password: password123
      role: admin
*/
```
✅ Optional auth_seed with users array
✅ Each user: name, email, password, role

---

## Field Cheat Sheet

### @arkzen:meta
- `name` — kebab-case slug
- `version` — semver (1.0.0)
- `description` — one-liner
- `auth` — true/false
- `auth_seed` — optional users
- `favicon` — optional URL/emoji
- `dependencies` — optional array

### @arkzen:config
- `toast` → position, duration
- `modal` → borderRadius, backdrop, animation
- `table` → striped, hoverable
- `layout.guest` → className
- `layout.auth` → className

### @arkzen:database
- `table` — table name
- `columns` — **DICT** (see above)
- `timestamps` — true/false
- `softDeletes` — true/false
- `seeder` → count, data (array)

### @arkzen:api
- `model` — ModelName
- `controller` — ControllerName
- `prefix` — /api/slug
- `middleware` — [auth], [role:admin]
- `endpoints` — **DICT** (see above)
- `resource` — true/false
- `policy` — true/false
- `factory` — true/false

### @arkzen:mail
- `subject` — "quoted string"
- `data` — **DICT** field_name: type
- Optional Blade HTML after YAML

### @arkzen:notifications
- `channels` — **ARRAY** [database, mail, broadcast]
- `message` — notification text
- `subject` — for mail channel
- `channel_type` — private/public (optional)

### @arkzen:events
- `listeners` — **ARRAY** [ListenerClass1, ListenerClass2]

### @arkzen:jobs
- `queue` — queue name (default, heavy)
- `tries` — retry count
- `timeout` — seconds
- PHP `handle()` method body

### @arkzen:console
- `signature` — command:name format
- `description` — description
- `schedule` — cron format ('0 * * * *')
- PHP `handle()` method body

### @arkzen:page
- `@arkzen:page:PAGE_NAME` — component name
- `@arkzen:page:layout:guest` or `layout:auth`

---

## Response Type Options
```yaml
response:
  type: collection        # array of items
response:
  type: single           # single item object
response:
  type: paginated        # pagination metadata
response:
  type: message          # { message: "..." }
  value: "Item deleted"
```

---

## Validation Rule Examples
```yaml
name: required|string|max:255
status: sometimes|string|in:active,pending
priority: sometimes|integer|min:0|max:100
email: required|email
files: required|array
files.*: file|max:10240
description: nullable|string
```

---

## Middleware in API
```yaml
middleware: []                    # no middleware
middleware: [auth]               # require auth
middleware: [requireJson]        # custom middleware
middleware: [auth, role:admin]   # multiple with params
```

---

## Database Column Types
```
string(length)      — varchar
integer             — int
text                — longtext
decimal(precision, scale) — decimal
boolean             — boolean
datetime            — datetime
```

---

## Column Properties
```
type: string|integer|text|decimal|boolean|datetime
length: integer (for string)
precision: integer (for decimal)
scale: integer (for decimal)
nullable: true|false
default: value
primary: true|false
autoIncrement: true|false
unique: true|false
```

---

## Seeder Data Format
```yaml
seeder:
  count: 5          # number of records
  data:             # array of objects
    - name: Item 1
      status: active
    - name: Item 2
      status: pending
```

---

## Console Schedule Examples
```
'0 * * * *'      — every hour
'0 8 * * *'      — 8 AM daily
'0 0 * * 0'      — Sunday midnight
'*/5 * * * *'    — every 5 minutes
'30 14 * * *'    — 2:30 PM daily
'0 0 1 * *'      — 1st of month
```

---

## Blade HTML in Mail
```blade
<!-- After @arkzen:mail:NAME:end marker -->
<div>
  <h1>Welcome {{ $username }}</h1>
  <p>You're logged in as {{ $email }}</p>
  @foreach ($items as $item)
    <li>{{ $item->name }}</li>
  @endforeach
</div>
```

---

## Code Injection Format
```php
/* @arkzen:endpoint:methodName
*/
$input = $request->all();
return response()->json($input);
/* @arkzen:endpoint:methodName:end */

/* @arkzen:middleware:customName
*/
if (condition) {
  return response()->json(['error' => '...'], 403);
}
return $next($request);
/* @arkzen:middleware:customName:end */
```

---

## Required Markers Per Tatemono
```
✅ @arkzen:meta (always)
✅ @arkzen:components:shared (React apps)
✅ @arkzen:page (React apps)
⚠️  @arkzen:config (recommended)
⚠️  @arkzen:database (if using DB)
⚠️  @arkzen:api (if using API)
```

---

## Files to Reference
- **TATEMONO_SYNTAX_REFERENCE.md** — Full details
- **TATEMONO_MARKER_INDEX.md** — Lookup + templates
- **SYNTAX_FINDINGS_SUMMARY.md** — Key discoveries
- **TATEMONO_DOCS_README.md** — Navigation guide

---

## Quick Links
- **All 17 tatemonos:** `/tatemonos/` directory
- **Real examples:** See sections in TATEMONO_SYNTAX_REFERENCE.md
- **Copy templates:** See TATEMONO_MARKER_INDEX.md

---

✅ **Print this card and keep it handy!**
