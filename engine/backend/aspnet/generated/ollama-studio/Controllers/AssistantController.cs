namespace Pluff.AspNet.Generated.OllamaStudio.Controllers;

public static class AssistantController
{
    public const string Model = "Assistant";
    public const string Prefix = "/api/ollama-studio";
    public static readonly (string Name, string Method, string Route)[] Actions =
    {
        ("chat", "POST", "/chat"),
    };
}
