namespace Pluff.AspNet.Generated.ExpressTest2;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "index", "GET", "/api/express-test-2/records", "RecordController"),
        new(0, "store", "POST", "/api/express-test-2/records", "RecordController"),
        new(0, "show", "GET", "/api/express-test-2/records/{id}", "RecordController"),
        new(0, "update", "PUT", "/api/express-test-2/records/{id}", "RecordController"),
        new(0, "destroy", "DELETE", "/api/express-test-2/records/{id}", "RecordController"),
        new(0, "stats", "GET", "/api/express-test-2/records/stats", "RecordController"),
        new(1, "index", "GET", "/api/express-test-2/files", "UploadedFileController"),
        new(1, "store", "POST", "/api/express-test-2/files", "UploadedFileController"),
        new(1, "destroy", "DELETE", "/api/express-test-2/files/{id}", "UploadedFileController"),
        new(1, "fileUrl", "GET", "/api/express-test-2/files/{id}/url", "UploadedFileController"),
        new(2, "index", "GET", "/api/express-test-2/commands", "CommandController"),
        new(2, "store", "POST", "/api/express-test-2/commands/run", "CommandController"),
        new(3, "store", "POST", "/api/express-test-2/jobs/dispatch", "DispatchController"),
        new(4, "store", "POST", "/api/express-test-2/events/fire", "EventController"),
        new(5, "broadcast", "POST", "/api/express-test-2/broadcast", "MessagingController"),
        new(5, "sendMail", "POST", "/api/express-test-2/mail", "MessagingController"),
        new(5, "notify", "POST", "/api/express-test-2/notify", "MessagingController"),
    };
}
