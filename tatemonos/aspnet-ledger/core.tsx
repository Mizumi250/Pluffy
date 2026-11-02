/* @arkzen:meta
name: aspnet-ledger
version: 1.0.0
description: ASP.NET Core C# transaction fixture for atomic account transfers.
auth: false
*/

/* @arkzen:database:accounts
table: accounts
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  owner:
    type: string
    length: 120
    nullable: false
  balance:
    type: decimal
    precision: 12
    scale: 2
    default: 0
seeder:
  data:
    - owner: Ada
      balance: 1000.00
    - owner: Grace
      balance: 500.00
*/

/* @arkzen:database:transfers
table: transfers
timestamps: true
columns:
  id:
    type: integer
    primary: true
    autoIncrement: true
  from_account_id:
    type: integer
    nullable: false
  to_account_id:
    type: integer
    nullable: false
  amount:
    type: decimal
    precision: 12
    scale: 2
    nullable: false
*/

/* @arkzen:api:accounts
model: Account
controller: AccountController
prefix: /api/aspnet-ledger
middleware: []
resource: false
policy: false
factory: false
endpoints:
  transfer:
    method: POST
    route: /transfer
    type: transfer
*/

/* @arkzen:endpoint:cs:transfer
*/
if (!long.TryParse(Body["from_account_id"]?.ToString(), out var fromId) ||
    !long.TryParse(Body["to_account_id"]?.ToString(), out var toId) ||
    !decimal.TryParse(Body["amount"]?.ToString(), System.Globalization.NumberStyles.Number,
        System.Globalization.CultureInfo.InvariantCulture, out var amount) ||
    amount <= 0 || fromId == toId)
    return Results.BadRequest(new { message = "A positive amount and two different account IDs are required." });

await using var transaction = await Database.BeginTransactionAsync(Context.RequestAborted);
try
{
    async Task<decimal?> BalanceFor(long accountId)
    {
        await using var find = Database.CreateCommand();
        find.Transaction = transaction;
        find.CommandText = "SELECT balance FROM \"aspnet_ledger_accounts\" WHERE id = @id";
        var parameter = find.CreateParameter();
        parameter.ParameterName = "@id";
        parameter.Value = accountId;
        find.Parameters.Add(parameter);
        var value = await find.ExecuteScalarAsync(Context.RequestAborted);
        return value is null or DBNull ? null : Convert.ToDecimal(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    var fromBalance = await BalanceFor(fromId);
    var toBalance = await BalanceFor(toId);
    if (fromBalance is null || toBalance is null)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.NotFound(new { message = "Account not found." });
    }
    if (fromBalance < amount)
    {
        await transaction.RollbackAsync(Context.RequestAborted);
        return Results.UnprocessableEntity(new { message = "Insufficient funds." });
    }

    foreach (var (accountId, balance) in new[] { (fromId, fromBalance.Value - amount), (toId, toBalance.Value + amount) })
    {
        await using var update = Database.CreateCommand();
        update.Transaction = transaction;
        update.CommandText = "UPDATE \"aspnet_ledger_accounts\" SET balance = @balance, updated_at = @updated WHERE id = @id";
        foreach (var (name, value) in new (string Name, object Value)[]
        {
            ("@balance", balance),
            ("@updated", DateTime.UtcNow),
            ("@id", accountId)
        })
        {
            var parameter = update.CreateParameter();
            parameter.ParameterName = name;
            parameter.Value = value;
            update.Parameters.Add(parameter);
        }
        await update.ExecuteNonQueryAsync(Context.RequestAborted);
    }

    await using var insert = Database.CreateCommand();
    insert.Transaction = transaction;
    insert.CommandText = """
        INSERT INTO "aspnet_ledger_transfers" (from_account_id, to_account_id, amount, created_at, updated_at)
        VALUES (@from, @to, @amount, @created, @updated)
        RETURNING id
        """;
    foreach (var (name, value) in new (string Name, object Value)[]
    {
        ("@from", fromId),
        ("@to", toId),
        ("@amount", amount),
        ("@created", DateTime.UtcNow),
        ("@updated", DateTime.UtcNow)
    })
    {
        var parameter = insert.CreateParameter();
        parameter.ParameterName = name;
        parameter.Value = value;
        insert.Parameters.Add(parameter);
    }
    var transferId = await insert.ExecuteScalarAsync(Context.RequestAborted);
    await transaction.CommitAsync(Context.RequestAborted);
    return Results.Json(new { id = transferId, from_account_id = fromId, to_account_id = toId, amount }, statusCode: 201);
}
catch
{
    await transaction.RollbackAsync(Context.RequestAborted);
    throw;
}
/* @arkzen:endpoint:cs:transfer:end */

/* @arkzen:web:page:index */
const IndexPage = () => (
  <main className="mx-auto max-w-3xl p-8">
    <h1 className="text-2xl font-semibold">ASP.NET Core ledger</h1>
    <p className="mt-3">POST to <code>/api/aspnet-ledger/transfer</code> to transfer funds in a database transaction.</p>
  </main>
)
/* @arkzen:web:page:index:end */
