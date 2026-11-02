/* @arkzen:meta
name: aspnet-test
version: 1.0.0
description: ASP.NET Core contract fixture for C# endpoints, validation, isolated schema, and CRUD.
auth: true
authSeed:
  users:
    - name: ASP.NET Admin
      email: admin@aspnet-test.local
      password: password
      role: admin
*/

/* @arkzen:database:checks
table: checks
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  name:
    type: string
    length: 120
    nullable: false
  status:
    type: string
    length: 24
    default: pending
seeder:
  data:
    - name: ASP.NET engine ready
      status: passed
*/

/* @arkzen:api:checks
model: Check
controller: CheckController
prefix: /api/aspnet-test
middleware: []
resource: true
policy: false
factory: false
endpoints:
  index:
    method: GET
    route: /checks
    type: index
  store:
    method: POST
    route: /checks
    type: store
    validation:
      name: required|string|max:120
      status: sometimes|string|in:pending,passed,failed
  show:
    method: GET
    route: /checks/{id}
    type: show
  update:
    method: PUT
    route: /checks/{id}
    type: update
    validation:
      name: sometimes|string|max:120
      status: sometimes|string|in:pending,passed,failed
  destroy:
    method: DELETE
    route: /checks/{id}
    type: destroy
  health:
    method: GET
    route: /health
    type: health
*/

/* @arkzen:endpoint:cs:health
*/
await using var command = Database.CreateCommand();
command.CommandText = "SELECT COUNT(*) FROM \"aspnet_test_checks\"";
var checks = Convert.ToInt64(await command.ExecuteScalarAsync(Context.RequestAborted));
return Results.Json(new { backend = "aspnet", status = "ok", checks });
/* @arkzen:endpoint:cs:health:end */

/* @arkzen:web:page:index */
const IndexPage = () => (
  <main className="mx-auto max-w-3xl p-8">
    <h1 className="text-2xl font-semibold">ASP.NET Core engine test</h1>
    <p className="mt-3">The API includes a C# health endpoint and a validated CRUD resource.</p>
    <a className="mt-4 inline-block underline" href="/api/aspnet-test/health">Check engine health</a>
  </main>
)
/* @arkzen:web:page:index:end */
