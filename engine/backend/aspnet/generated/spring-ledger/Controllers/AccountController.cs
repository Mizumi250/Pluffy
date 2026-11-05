namespace Pluff.AspNet.Generated.SpringLedger.Controllers;

public static class AccountController
{
    public const string Model = "Account";
    public const string Prefix = "/api/spring-ledger/accounts";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("index", "GET", "/"),
        ("transfer", "POST", "/transfer"),
    };
}
