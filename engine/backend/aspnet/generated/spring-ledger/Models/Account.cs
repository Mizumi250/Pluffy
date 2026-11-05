namespace Pluff.AspNet.Generated.SpringLedger.Models;

public sealed class Account
{
    public long? Id { get; init; }
    public required string Name { get; init; }
    public decimal Balance { get; init; }
}
