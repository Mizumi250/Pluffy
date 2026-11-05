namespace Pluff.AspNet.Generated.AspnetLedger;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "accounts", "GET", "/api/aspnet-ledger/accounts", "AccountController"),
        new(0, "open", "POST", "/api/aspnet-ledger/accounts", "AccountController"),
        new(0, "transfer", "POST", "/api/aspnet-ledger/transfer", "AccountController"),
        new(0, "crash", "POST", "/api/aspnet-ledger/transfer/crash", "AccountController"),
        new(0, "transfers", "GET", "/api/aspnet-ledger/transfers", "AccountController"),
        new(0, "summary", "GET", "/api/aspnet-ledger/summary", "AccountController"),
    };
}
