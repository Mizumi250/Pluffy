namespace Pluff.AspNet.Generated.SpringLedger;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/spring-ledger/accounts", "AccountController"),
        new(0, "transfer", "POST", "/api/spring-ledger/accounts/transfer", "AccountController"),
        new(1, "index", "GET", "/api/spring-ledger/transfers", "TransferController"),
    };
}
