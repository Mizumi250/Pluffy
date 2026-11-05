namespace Pluff.AspNet.Generated.SpringLedger.Models;

public sealed class Transfer
{
    public long? Id { get; init; }
    public long? FromAccountId { get; init; }
    public long? ToAccountId { get; init; }
    public decimal Amount { get; init; }
    public required string Status { get; init; }
}
