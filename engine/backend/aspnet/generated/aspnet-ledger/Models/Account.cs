namespace Pluff.AspNet.Generated.AspnetLedger.Models;

public sealed class Account
{
    public long? Id { get; init; }
    public required string Owner { get; init; }
    public decimal? Balance { get; init; }
}
