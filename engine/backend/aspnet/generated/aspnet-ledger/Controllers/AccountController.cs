namespace Pluff.AspNet.Generated.AspnetLedger.Controllers;

public static class AccountController
{
    public const string Model = "Account";
    public const string Prefix = "/api/aspnet-ledger";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("accounts", "GET", "/accounts"),
        ("open", "POST", "/accounts"),
        ("transfer", "POST", "/transfer"),
        ("crash", "POST", "/transfer/crash"),
        ("transfers", "GET", "/transfers"),
        ("summary", "GET", "/summary"),
    };
}
