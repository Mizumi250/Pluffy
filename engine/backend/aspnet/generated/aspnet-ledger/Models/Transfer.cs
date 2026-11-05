namespace Pluff.AspNet.Generated.AspnetLedger.Models;

public sealed class Transfer
{
    public long? Id { get; init; }
    public long FromAccountId { get; init; }
    public long ToAccountId { get; init; }
    public decimal Amount { get; init; }
    public string? Status { get; init; }
    public string? Memo { get; init; }
}
