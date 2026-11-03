using System.Collections.Concurrent;
using System.Net.WebSockets;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization.Metadata;
using System.Text.Json.Nodes;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Pluff.AspNet.Runtime;

public sealed record BroadcastChannelRule(string Channel, string Type, string Authorization);

public static class BroadcastHub
{
    private sealed class Client
    {
        public required string Id { get; init; }
        public required WebSocket Socket { get; init; }
        public HashSet<string> Channels { get; } = new(StringComparer.Ordinal);
        public Dictionary<string, JsonObject> Presence { get; } = new(StringComparer.Ordinal);
    }

    private static readonly object Gate = new();
    private static readonly Dictionary<WebSocket, Client> Clients = new();
    private static readonly Dictionary<string, HashSet<Client>> Channels = new(StringComparer.Ordinal);
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web)
    {
        TypeInfoResolver = new DefaultJsonTypeInfoResolver()
    };

    public static List<BroadcastChannelRule> ReadChannelRules(JsonNode? sections)
    {
        var rules = new List<BroadcastChannelRule>();
        foreach (var section in sections as JsonArray ?? new JsonArray())
        {
            if (section is not JsonValue jsonValue || !jsonValue.TryGetValue<string>(out var raw)) continue;
            var name = Regex.Match(raw, @"(?m)^([A-Za-z0-9_.{}-]+):\s*$").Groups[1].Value;
            var type = ReadSectionValue(raw, "type") ?? "public";
            if (name.Length == 0 || type is not ("private" or "presence") ||
                ReadSectionValue(raw, "channel") is not null) continue;
            rules.Add(new BroadcastChannelRule(name, type, ReadSectionValue(raw, "auth") ?? "authenticated"));
        }
        return rules;
    }

    public static (string Channel, string Event)? ResolveEvent(
        JsonNode? sections,
        string slug,
        string channelType,
        JsonObject? user)
    {
        foreach (var section in sections as JsonArray ?? new JsonArray())
        {
            if (section is not JsonValue jsonValue || !jsonValue.TryGetValue<string>(out var raw)) continue;
            var name = Regex.Match(raw, @"(?m)^([A-Za-z0-9_.{}-]+):\s*$").Groups[1].Value;
            var type = ReadSectionValue(raw, "type") ?? "public";
            var channel = ReadSectionValue(raw, "channel");
            if (name.Length == 0 || channel is null || type != channelType) continue;
            var resolved = Regex.Replace(channel, @"\{([^}]+)\}", match =>
                match.Groups[1].Value switch
                {
                    "id" or "user_id" => user?["id"]?.ToString() ?? "",
                    _ => ""
                });
            if (resolved.Length == 0) continue;
            var channelName = channelType switch
            {
                "private" => $"private-{resolved}",
                "presence" => $"presence-{resolved}",
                _ => resolved
            };
            return (channelName, $"{slug}.{name}");
        }
        return null;
    }

    public static string SignChannel(string socketId, string channel, string? channelData = null)
    {
        var message = channelData is null
            ? $"{socketId}:{channel}"
            : $"{socketId}:{channel}:{channelData}";
        var secret = Environment.GetEnvironmentVariable("REVERB_APP_SECRET") ?? "pluff-secret";
        var key = Environment.GetEnvironmentVariable("REVERB_APP_KEY") ?? "arkzen-key";
        var signature = HMACSHA256.HashData(Encoding.UTF8.GetBytes(secret), Encoding.UTF8.GetBytes(message));
        return $"{key}:{Convert.ToHexString(signature).ToLowerInvariant()}";
    }

    public static JsonObject? AuthorizeChannel(
        string socketId,
        string channel,
        JsonObject user,
        IReadOnlyList<BroadcastChannelRule> rules)
    {
        var type = channel.StartsWith("private-", StringComparison.Ordinal)
            ? "private"
            : channel.StartsWith("presence-", StringComparison.Ordinal) ? "presence" : null;
        if (type is null) return null;
        var name = channel[(type.Length + 1)..];

        foreach (var rule in rules)
        {
            if (!string.Equals(rule.Type, type, StringComparison.Ordinal)) continue;
            var captures = new List<string>();
            var pattern = new StringBuilder("^");
            var offset = 0;
            foreach (Match placeholder in Regex.Matches(rule.Channel, @"\{([^}]+)\}"))
            {
                pattern.Append(Regex.Escape(rule.Channel[offset..placeholder.Index]));
                pattern.Append("([^.]+)");
                captures.Add(placeholder.Groups[1].Value);
                offset = placeholder.Index + placeholder.Length;
            }
            pattern.Append(Regex.Escape(rule.Channel[offset..]));
            pattern.Append('$');
            var match = Regex.Match(name, pattern.ToString(), RegexOptions.CultureInvariant);
            if (!match.Success) continue;

            var authorization = rule.Authorization;
            var id = user["id"]?.ToString();
            if (authorization == "owner" &&
                (captures.Count == 0 || !string.Equals(id, match.Groups[1].Value, StringComparison.Ordinal)))
                continue;
            if (authorization == "admin" &&
                !string.Equals(user["role"]?.ToString(), "admin", StringComparison.OrdinalIgnoreCase))
                continue;

            string? channelData = null;
            if (type == "presence")
            {
                var userInfo = new JsonObject
                {
                    ["name"] = user["name"]?.DeepClone() ?? JsonValue.Create(user["email"]?.ToString())
                };
                channelData = new JsonObject
                {
                    ["user_id"] = user["id"]?.DeepClone(),
                    ["user_info"] = userInfo
                }.ToJsonString(JsonOptions);
            }
            return new JsonObject
            {
                ["auth"] = SignChannel(socketId, channel, channelData),
                ["channel_data"] = channelData
            };
        }
        return null;
    }

    public static async Task BroadcastToAsync(
        string channel,
        string eventName,
        JsonNode? data,
        CancellationToken cancellationToken,
        string? exceptSocketId = null)
    {
        Client[] recipients;
        lock (Gate)
        {
            recipients = Channels.TryGetValue(channel, out var subscribers)
                ? subscribers.Where(client => client.Id != exceptSocketId).ToArray()
                : [];
        }

        var payload = new JsonObject
        {
            ["event"] = eventName,
            ["channel"] = channel,
            ["data"] = data is JsonValue stringValue && stringValue.TryGetValue<string>(out var text)
                ? text
                : data?.ToJsonString(JsonOptions) ?? "null"
        }.ToJsonString(JsonOptions);
        var bytes = Encoding.UTF8.GetBytes(payload);
        await Task.WhenAll(recipients.Select(async client =>
        {
            try
            {
                if (client.Socket.State == WebSocketState.Open)
                    await client.Socket.SendAsync(bytes, WebSocketMessageType.Text, true, cancellationToken);
            }
            catch (WebSocketException exception)
            {
                Console.Error.WriteLine($"[ASP.NET realtime] Broadcast failed for {client.Id}: {exception.Message}");
                await DropAsync(client, CancellationToken.None);
            }
        }));
    }

    public static WebApplication CreateServer(int port, ILogger logger)
    {
        var builder = WebApplication.CreateBuilder();
        builder.WebHost.UseUrls($"http://0.0.0.0:{port}");
        var app = builder.Build();
        app.UseWebSockets();
        app.MapGet("/", () => Results.Text("pluff realtime\n"));
        app.Map("/app/{appKey}", HandleConnectionAsync);
        logger.LogInformation("ASP.NET realtime (Pusher protocol) configured on :{Port}", port);
        return app;
    }

    private static async Task HandleConnectionAsync(HttpContext context)
    {
        var key = Environment.GetEnvironmentVariable("REVERB_APP_KEY") ?? "arkzen-key";
        if (!string.Equals(context.Request.RouteValues["appKey"]?.ToString(), key, StringComparison.Ordinal))
        {
            context.Response.StatusCode = StatusCodes.Status404NotFound;
            return;
        }
        if (!context.WebSockets.IsWebSocketRequest)
        {
            context.Response.StatusCode = StatusCodes.Status400BadRequest;
            return;
        }

        var socket = await context.WebSockets.AcceptWebSocketAsync();
        var client = new Client
        {
            Id = $"{RandomNumberGenerator.GetInt32(1_000_000_000)}.{RandomNumberGenerator.GetInt32(1_000_000_000)}",
            Socket = socket
        };
        lock (Gate) Clients[socket] = client;

        try
        {
            await SendAsync(client, "pusher:connection_established", new JsonObject
            {
                ["socket_id"] = client.Id,
                ["activity_timeout"] = 30
            }, cancellationToken: context.RequestAborted);

            var buffer = new byte[8192];
            while (socket.State == WebSocketState.Open && !context.RequestAborted.IsCancellationRequested)
            {
                using var message = new MemoryStream();
                WebSocketReceiveResult result;
                do
                {
                    result = await socket.ReceiveAsync(buffer, context.RequestAborted);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        await socket.CloseOutputAsync(
                            result.CloseStatus ?? WebSocketCloseStatus.NormalClosure,
                            result.CloseStatusDescription,
                            CancellationToken.None);
                        return;
                    }
                    if (message.Length + result.Count > 65536)
                    {
                        await socket.CloseAsync(WebSocketCloseStatus.MessageTooBig, "Message too large", CancellationToken.None);
                        return;
                    }
                    message.Write(buffer, 0, result.Count);
                } while (!result.EndOfMessage);

                if (result.MessageType != WebSocketMessageType.Text) continue;
                JsonObject? envelope;
                try
                {
                    envelope = JsonNode.Parse(message.ToArray()) as JsonObject;
                }
                catch (JsonException)
                {
                    continue;
                }
                await HandleMessageAsync(client, envelope, context.RequestAborted);
            }
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
        }
        catch (WebSocketException exception)
        {
            Console.Error.WriteLine($"[ASP.NET realtime] Socket {client.Id} failed: {exception.Message}");
        }
        finally
        {
            await DropAsync(client, CancellationToken.None);
            socket.Dispose();
        }
    }

    private static async Task HandleMessageAsync(Client client, JsonObject? envelope, CancellationToken cancellationToken)
    {
        var eventName = envelope?["event"]?.ToString();
        var data = ReadData(envelope?["data"]);
        if (eventName == "pusher:ping")
        {
            await SendAsync(client, "pusher:pong", new JsonObject(), cancellationToken: cancellationToken);
            return;
        }
        if (eventName == "pusher:subscribe")
        {
            await SubscribeAsync(client, data, cancellationToken);
            return;
        }
        if (eventName == "pusher:unsubscribe" && data?["channel"]?.ToString() is { } channel)
        {
            await UnsubscribeAsync(client, channel, cancellationToken);
        }
    }

    private static async Task SubscribeAsync(Client client, JsonObject? data, CancellationToken cancellationToken)
    {
        var channel = data?["channel"]?.ToString();
        if (string.IsNullOrWhiteSpace(channel)) return;
        var isPrivate = channel.StartsWith("private-", StringComparison.Ordinal);
        var isPresence = channel.StartsWith("presence-", StringComparison.Ordinal);
        JsonObject? presenceData = null;
        if (isPresence && data?["channel_data"]?.ToString() is { } rawPresence)
        {
            try { presenceData = JsonNode.Parse(rawPresence) as JsonObject; }
            catch (JsonException) { }
        }
        if ((isPrivate || isPresence) &&
            (data?["auth"]?.ToString() is not { } supplied ||
             !CryptographicOperations.FixedTimeEquals(
                 Encoding.UTF8.GetBytes(SignChannel(client.Id, channel, isPresence ? data["channel_data"]?.ToString() : null)),
                 Encoding.UTF8.GetBytes(supplied))))
        {
            await SendAsync(client, "pusher:error", new JsonObject
            {
                ["code"] = 4009,
                ["message"] = "Connection is unauthorized"
            }, channel, cancellationToken);
            return;
        }

        JsonObject members;
        Client[] existing;
        lock (Gate)
        {
            if (!Channels.TryGetValue(channel, out var subscribers))
                Channels[channel] = subscribers = new HashSet<Client>();
            existing = subscribers.ToArray();
            subscribers.Add(client);
            client.Channels.Add(channel);
            if (presenceData is not null) client.Presence[channel] = presenceData;
            members = Members(channel, subscribers);
        }

        if (isPresence)
        {
            await SendAsync(client, "pusher_internal:subscription_succeeded", members, channel, cancellationToken);
            if (presenceData is not null)
                foreach (var existingClient in existing)
                    await SendAsync(existingClient, "pusher_internal:member_added", presenceData, channel, cancellationToken);
        }
        else
        {
            await SendAsync(client, "pusher_internal:subscription_succeeded", new JsonObject(), channel, cancellationToken);
        }
    }

    private static JsonObject Members(string channel, IEnumerable<Client> subscribers)
    {
        var ids = new JsonArray();
        var hash = new JsonObject();
        foreach (var client in subscribers)
        {
            if (!client.Presence.TryGetValue(channel, out var info)) continue;
            var id = info["user_id"]?.ToString();
            if (id is null) continue;
            ids.Add(id);
            hash[id] = info["user_info"]?.DeepClone();
        }
        return new JsonObject
        {
            ["presence"] = new JsonObject { ["count"] = ids.Count, ["ids"] = ids, ["hash"] = hash }
        };
    }

    private static async Task DropAsync(Client client, CancellationToken cancellationToken)
    {
        List<(string Channel, JsonObject Presence, Client[] Remaining)> departures = [];
        lock (Gate)
        {
            foreach (var channel in client.Channels.ToArray())
            {
                var presence = client.Presence.TryGetValue(channel, out var channelPresence)
                    ? (JsonObject)channelPresence.DeepClone()
                    : null;
                RemoveSubscription(client, channel);
                if (presence is not null && Channels.TryGetValue(channel, out var remaining))
                {
                    departures.Add((channel, presence, remaining.ToArray()));
                }
            }
            Clients.Remove(client.Socket);
        }
        foreach (var (channel, presence, remaining) in departures)
        {
            await Task.WhenAll(remaining.Select(other => SendAsync(other, "pusher_internal:member_removed",
                new JsonObject { ["user_id"] = presence["user_id"]?.DeepClone() }, channel, cancellationToken)));
        }
    }

    private static async Task UnsubscribeAsync(Client client, string channel, CancellationToken cancellationToken)
    {
        JsonObject? presence;
        Client[] remaining;
        lock (Gate)
        {
            presence = client.Presence.TryGetValue(channel, out var channelPresence)
                ? (JsonObject)channelPresence.DeepClone()
                : null;
            RemoveSubscription(client, channel);
            remaining = Channels.TryGetValue(channel, out var subscribers)
                ? subscribers.ToArray()
                : [];
        }
        if (presence is not null)
        {
            var member = new JsonObject { ["user_id"] = presence["user_id"]?.DeepClone() };
            await Task.WhenAll(remaining.Select(other =>
                SendAsync(other, "pusher_internal:member_removed", member, channel, cancellationToken)));
        }
    }

    private static void RemoveSubscription(Client client, string channel)
    {
        if (Channels.TryGetValue(channel, out var subscribers))
        {
            subscribers.Remove(client);
            if (subscribers.Count == 0) Channels.Remove(channel);
        }
        client.Channels.Remove(channel);
        client.Presence.Remove(channel);
    }

    private static async Task SendAsync(
        Client client,
        string eventName,
        JsonNode data,
        string? channel = null,
        CancellationToken cancellationToken = default)
    {
        if (client.Socket.State != WebSocketState.Open) return;
        var message = new JsonObject
        {
            ["event"] = eventName,
            ["data"] = data.ToJsonString(JsonOptions)
        };
        if (channel is not null) message["channel"] = channel;
        await client.Socket.SendAsync(
            Encoding.UTF8.GetBytes(message.ToJsonString(JsonOptions)),
            WebSocketMessageType.Text,
            true,
            cancellationToken);
    }

    private static JsonObject? ReadData(JsonNode? node)
    {
        if (node is JsonObject obj) return obj;
        var text = node?.ToString();
        if (string.IsNullOrEmpty(text)) return null;
        try { return JsonNode.Parse(text) as JsonObject; }
        catch (JsonException) { return null; }
    }

    private static string? ReadSectionValue(string raw, string key)
    {
        var match = Regex.Match(raw, $@"(?m)^\s+{Regex.Escape(key)}:\s*(?:""([^""]*)""|'([^']*)'|([^\s#]+))\s*$");
        if (!match.Success) return null;
        for (var index = 1; index <= 3; index++)
            if (match.Groups[index].Success) return match.Groups[index].Value;
        return null;
    }
}
