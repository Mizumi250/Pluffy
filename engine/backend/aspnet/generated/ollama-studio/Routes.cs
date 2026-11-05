namespace Pluff.AspNet.Generated.OllamaStudio;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "chat", "POST", "/api/ollama-studio/chat", "AssistantController"),
    };
}
