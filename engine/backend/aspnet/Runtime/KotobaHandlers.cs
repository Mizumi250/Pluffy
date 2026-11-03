using System.Data.Common;
using System.Globalization;
using System.Text.Json;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.Http;

namespace Pluff.AspNet.Runtime;

public static class KotobaHandlers
{
    private const string Prefix = "kotoba_";
    private static readonly JsonSerializerOptions JsonOptions = new(JsonSerializerDefaults.Web);

    public static Task<IResult> ExecuteAsync(
        string action,
        HttpContext context,
        JsonObject body,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject? user) =>
        action switch
        {
            "me" => MeAsync(database, RequiredUser(user)),
            "update_me" => UpdateMeAsync(database, body, RequiredUser(user)),
            "bump" => BumpAsync(database, body, RequiredUser(user)),
            "notify" => NotifyAsync(context, database, body, RequiredUser(user)),
            "community_seed" => SeedAsync(database),
            "home" => HomeAsync(database, context, RequiredUser(user)),
            "feed" => FeedAsync(database, context, RequiredUser(user)),
            "create_post" => CreatePostAsync(context, database, body, RequiredUser(user)),
            "delete_post" => DeletePostAsync(database, routeValues, RequiredUser(user)),
            "toggle_like" => ToggleLikeAsync(context, database, routeValues, RequiredUser(user)),
            "list_comments" => ListCommentsAsync(database, routeValues),
            "add_comment" => AddCommentAsync(context, database, body, routeValues, RequiredUser(user)),
            "accept_correction" => AcceptCorrectionAsync(context, database, routeValues, RequiredUser(user)),
            "list_lessons" => ListLessonsAsync(database, context, RequiredUser(user)),
            "complete_lesson" => CompleteLessonAsync(database, body, routeValues, RequiredUser(user)),
            "list_cards" => ListCardsAsync(database, context, RequiredUser(user)),
            "add_card" => AddCardAsync(database, body, RequiredUser(user)),
            "review_card" => ReviewCardAsync(database, body, routeValues, RequiredUser(user)),
            "delete_card" => DeleteCardAsync(database, routeValues, RequiredUser(user)),
            "partners" => PartnersAsync(database, context, RequiredUser(user)),
            "view_profile" => ViewProfileAsync(database, routeValues, RequiredUser(user)),
            "toggle_follow" => ToggleFollowAsync(context, database, routeValues, RequiredUser(user)),
            "list_conversations" => ListConversationsAsync(database, RequiredUser(user)),
            "start_conversation" => StartConversationAsync(database, body, RequiredUser(user)),
            "list_messages" => ListMessagesAsync(database, context, RequiredUser(user)),
            "send_message" => SendMessageAsync(context, database, body, RequiredUser(user)),
            "correct_message" => CorrectMessageAsync(context, database, body, routeValues, RequiredUser(user)),
            "list_circles" => ListCirclesAsync(database, context, RequiredUser(user)),
            "create_circle" => CreateCircleAsync(database, body, RequiredUser(user)),
            "toggle_join" => ToggleJoinAsync(database, routeValues, RequiredUser(user)),
            "list_alerts" => ListAlertsAsync(database, RequiredUser(user)),
            "read_alerts" => ReadAlertsAsync(database, RequiredUser(user)),
            "progress" => ProgressAsync(database, RequiredUser(user)),
            _ => throw new InvalidOperationException($"Unknown Kotoba handler: {action}")
        };

    private static JsonObject RequiredUser(JsonObject? user) =>
        user ?? throw new InvalidOperationException("Authentication is required.");

    private static long UserId(JsonObject user) => Long(user["id"]);

    private static string Text(JsonNode? value, string fallback = "") =>
        value is JsonValue json && json.TryGetValue<string>(out var text) ? text : value?.ToString() ?? fallback;

    private static long Long(JsonNode? value, long fallback = 0) =>
        long.TryParse(Text(value), NumberStyles.Integer, CultureInfo.InvariantCulture, out var number) ? number : fallback;

    private static int Int(JsonNode? value, int fallback = 0) =>
        int.TryParse(Text(value), NumberStyles.Integer, CultureInfo.InvariantCulture, out var number) ? number : fallback;

    private static bool Bool(JsonNode? value) =>
        value is JsonValue json && (json.TryGetValue<bool>(out var boolean)
            ? boolean
            : bool.TryParse(json.ToString(), out var parsed) && parsed);

    private static string Table(string name) => TatemonoDatabase.Quote(Prefix + name);

    private static object? DbValue(JsonNode? value)
    {
        if (value is null) return null;
        if (value is JsonObject || value is JsonArray) return value.ToJsonString();
        if (value is JsonValue json)
        {
            if (json.TryGetValue<bool>(out var boolean)) return boolean;
            if (json.TryGetValue<long>(out var integer)) return integer;
            if (json.TryGetValue<double>(out var number)) return number;
            if (json.TryGetValue<string>(out var text)) return text;
        }
        return value.ToString();
    }

    private static async Task<List<JsonObject>> QueryAsync(
        DbConnection database,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null) =>
        await ScriptDatabase.QueryAsync(database, sql, parameters);

    private static async Task<JsonObject?> FirstAsync(
        DbConnection database,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null) =>
        (await QueryAsync(database, sql, parameters)).FirstOrDefault();

    private static async Task<long> ScalarLongAsync(
        DbConnection database,
        string sql,
        IReadOnlyDictionary<string, object?>? parameters = null) =>
        Convert.ToInt64(await ScriptDatabase.ScalarAsync(database, sql, parameters) ?? 0, CultureInfo.InvariantCulture);

    private static async Task<JsonObject> InsertAsync(
        DbConnection database,
        string table,
        Dictionary<string, object?> values)
    {
        var now = DateTime.UtcNow;
        values.TryAdd("created_at", now);
        values.TryAdd("updated_at", now);
        var columns = values.Keys.ToArray();
        var sql = $"INSERT INTO {Table(table)} ({string.Join(", ", columns.Select(TatemonoDatabase.Quote))}) " +
                  $"VALUES ({string.Join(", ", columns.Select((_, index) => $"@p{index}"))}) RETURNING *";
        var parameters = columns.Select((name, index) => new KeyValuePair<string, object?>($"@p{index}", values[name]))
            .ToDictionary(pair => pair.Key, pair => pair.Value);
        return (await QueryAsync(database, sql, parameters)).FirstOrDefault()
            ?? throw new InvalidOperationException($"Insert into {table} returned no row.");
    }

    private static async Task UpdateAsync(
        DbConnection database,
        string table,
        long id,
        Dictionary<string, object?> values)
    {
        values["updated_at"] = DateTime.UtcNow;
        var columns = values.Keys.ToArray();
        var assignments = string.Join(", ", columns.Select((column, index) =>
            $"{TatemonoDatabase.Quote(column)} = @p{index}"));
        var parameters = columns.Select((name, index) => new KeyValuePair<string, object?>($"@p{index}", values[name]))
            .ToDictionary(pair => pair.Key, pair => pair.Value);
        parameters["@id"] = id;
        await ScriptDatabase.ExecuteAsync(
            database, $"UPDATE {Table(table)} SET {assignments} WHERE id = @id", parameters);
    }

    private static async Task<JsonObject?> ByIdAsync(DbConnection database, string table, long id) =>
        await FirstAsync(database, $"SELECT * FROM {Table(table)} WHERE id = @id", new Dictionary<string, object?> { ["@id"] = id });

    private static async Task<JsonObject> ProfileAsync(DbConnection database, JsonObject user)
    {
        var id = UserId(user);
        var profile = await FirstAsync(database, $"SELECT * FROM {Table("profiles")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = id });
        return profile ?? await InsertAsync(database, "profiles", new Dictionary<string, object?>
        {
            ["user_id"] = id,
            ["display_name"] = Text(user["name"], "Member"),
            ["avatar_color"] = "#121212"
        });
    }

    private static async Task<IResult> MeAsync(DbConnection database, JsonObject user)
    {
        await SeedAsync(database);
        var profile = await ProfileAsync(database, user);
        return Results.Json(new
        {
            data = profile,
            user = new { id = user["id"], name = user["name"], email = user["email"] }
        });
    }

    private static async Task<IResult> UpdateMeAsync(DbConnection database, JsonObject body, JsonObject user)
    {
        var id = UserId(user);
        var current = await ProfileAsync(database, user);
        var values = new Dictionary<string, object?>();
        var fields = new Dictionary<string, (int MaxLength, bool Nullable)>
        {
            ["display_name"] = (60, false), ["bio"] = (300, true), ["native_lang"] = (8, false),
            ["learning_lang"] = (8, false), ["country"] = (60, true), ["interests"] = (500, true),
            ["avatar_color"] = (16, false)
        };
        foreach (var (field, rule) in fields)
        {
            if (!body.ContainsKey(field)) continue;
            var value = body[field];
            if (value is null && rule.Nullable) { values[field] = null; continue; }
            var text = Text(value);
            if (value is null || text.Length > rule.MaxLength)
                return Results.Json(new { message = $"The {field} field is invalid." }, statusCode: 422);
            values[field] = text;
        }
        if (body["level"] is not null)
        {
            var level = Text(body["level"]);
            if (!new[] { "A1", "A2", "B1", "B2", "C1", "C2" }.Contains(level))
                return Results.Json(new { message = "The level field is invalid." }, statusCode: 422);
            values["level"] = level;
        }
        if (body.ContainsKey("daily_goal"))
        {
            var goal = Int(body["daily_goal"], -1);
            if (goal is < 1 or > 20) return Results.Json(new { message = "The daily_goal field is invalid." }, statusCode: 422);
            values["daily_goal"] = goal;
        }
        if (body.ContainsKey("onboarded"))
        {
            if (body["onboarded"] is not JsonValue) return Results.Json(new { message = "The onboarded field is invalid." }, statusCode: 422);
            values["onboarded"] = Bool(body["onboarded"]);
        }
        if (values.Count > 0) await UpdateAsync(database, "profiles", Long(current["id"]), values);
        var updated = await ByIdAsync(database, "profiles", Long(current["id"])) ?? current;
        return Results.Json(new { data = updated });
    }

    private static async Task<JsonObject> BumpProfileAsync(
        DbConnection database,
        JsonObject user,
        int xp,
        int words,
        int messages)
    {
        var profile = await ProfileAsync(database, user);
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var lastActive = Text(profile["last_active"]);
        var streak = Int(profile["streak"]);
        if (!string.Equals(lastActive, today, StringComparison.Ordinal))
        {
            streak = lastActive == DateTime.UtcNow.AddDays(-1).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
                ? streak + 1
                : 1;
            await UpdateAsync(database, "profiles", Long(profile["id"]), new Dictionary<string, object?>
            {
                ["last_active"] = today,
                ["streak"] = streak,
                ["best_streak"] = Math.Max(Int(profile["best_streak"]), streak),
                ["xp"] = Int(profile["xp"]) + xp,
                ["words_written"] = Int(profile["words_written"]) + words,
                ["messages_sent"] = Int(profile["messages_sent"]) + messages
            });
        }
        else
        {
            await UpdateAsync(database, "profiles", Long(profile["id"]), new Dictionary<string, object?>
            {
                ["best_streak"] = Math.Max(Int(profile["best_streak"]), streak),
                ["xp"] = Int(profile["xp"]) + xp,
                ["words_written"] = Int(profile["words_written"]) + words,
                ["messages_sent"] = Int(profile["messages_sent"]) + messages
            });
        }
        return await ByIdAsync(database, "profiles", Long(profile["id"])) ?? profile;
    }

    private static async Task<IResult> BumpAsync(DbConnection database, JsonObject body, JsonObject user)
    {
        var profile = await BumpProfileAsync(database, user, Int(body["xp"]), Int(body["words"]), Int(body["messages"]));
        return Results.Json(new { data = profile });
    }

    private static async Task<IResult> NotifyAsync(
        HttpContext context,
        DbConnection database,
        JsonObject body,
        JsonObject user)
    {
        var target = Long(body["user_id"]);
        var kind = Text(body["kind"]);
        if (target <= 0 || kind.Length == 0 || target == UserId(user))
            return Results.Json(new { ok = false }, statusCode: 422);
        var text = Text(body["text"]);
        if (text.Length > 480) text = text[..480];
        var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
        {
            ["user_id"] = target, ["kind"] = kind, ["text"] = text,
            ["ref"] = DbValue(body["ref"]), ["is_read"] = false
        });
        await BroadcastHub.BroadcastToAsync(
            $"private-kotoba.{target}", "kotoba.alert-created", alert, context.RequestAborted);
        return Results.Json(new { ok = true, data = alert });
    }

    private static async Task<IResult> SeedAsync(DbConnection database)
    {
        if (await ScalarLongAsync(database, $"SELECT COUNT(*) FROM {Table("posts")}") > 0)
            return Results.Json(new { seeded = false });
        var seedUsers = new[]
        {
            ("aiko@kotoba.app", "Aiko Tanaka", "ja", "en", "A2", "Japan", "Osaka native. I love ramen, film cameras and teaching Japanese.", "travel,food,photography", "#7a3b34", 240, 12),
            ("mateo@kotoba.app", "Mateo Rivera", "es", "en", "B1", "Mexico", "From Mexico City. Football, tacos and bad puns in two languages.", "football,food,music", "#3f6b4f", 180, 6),
            ("sofia@kotoba.app", "Sofia Laurent", "en", "ja", "A2", "Canada", "English teacher learning Japanese. Coffee first, grammar second.", "books,coffee,anime", "#4a4a4a", 320, 21)
        };
        var profiles = new Dictionary<string, JsonObject>();
        foreach (var seed in seedUsers)
        {
            var authUser = await FirstAsync(database,
                $"SELECT id, name FROM {Table("users")} WHERE email = @email",
                new Dictionary<string, object?> { ["@email"] = seed.Item1 });
            if (authUser is null) continue;
            var profile = await FirstAsync(database, $"SELECT * FROM {Table("profiles")} WHERE user_id = @id",
                new Dictionary<string, object?> { ["@id"] = Long(authUser["id"]) });
            var values = new Dictionary<string, object?>
            {
                ["user_id"] = Long(authUser["id"]), ["display_name"] = seed.Item2,
                ["native_lang"] = seed.Item3, ["learning_lang"] = seed.Item4, ["level"] = seed.Item5,
                ["country"] = seed.Item6, ["bio"] = seed.Item7, ["interests"] = seed.Item8,
                ["avatar_color"] = seed.Item9, ["xp"] = seed.Item10,
                ["streak"] = seed.Item11, ["best_streak"] = seed.Item11,
                ["last_active"] = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture),
                ["onboarded"] = true
            };
            profile = profile is null
                ? await InsertAsync(database, "profiles", values)
                : await UpdateAndReadAsync(database, "profiles", Long(profile["id"]), values);
            profiles[seed.Item1] = profile;
        }
        if (profiles.Count == 0) return Results.Json(new { seeded = false });
        var postSeeds = new[]
        {
            ("aiko@kotoba.app", "en", "moment", "Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!", null, 4),
            ("mateo@kotoba.app", "en", "moment", "Today I learned a new word: serendipity. It means finding something good by luck.", null, 7),
            ("sofia@kotoba.app", "ja", "moment", "きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。", "It is raining today. I will read a book while drinking coffee.", 5),
            ("mateo@kotoba.app", "es", "question", "Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.", "Question for you all: what is your favorite food? Mine are the tacos al pastor.", 3),
            ("aiko@kotoba.app", "ja", "moment", "こんにちは！わたしは アイコです。にほんの おおさかから きました。", "Hello! I am Aiko. I came from Osaka, Japan.", 9)
        };
        var postIds = new List<long>();
        foreach (var seed in postSeeds)
        {
            if (!profiles.TryGetValue(seed.Item1, out var profile)) { postIds.Add(0); continue; }
            var post = await InsertAsync(database, "posts", new Dictionary<string, object?>
            {
                ["user_id"] = Long(profile["user_id"]), ["author_name"] = Text(profile["display_name"]),
                ["author_color"] = Text(profile["avatar_color"]), ["author_native"] = Text(profile["native_lang"]),
                ["lang"] = seed.Item2, ["kind"] = seed.Item3, ["body"] = seed.Item4,
                ["translation"] = seed.Item5, ["likes_count"] = seed.Item6
            });
            postIds.Add(Long(post["id"]));
        }
        if (postIds[0] > 0 && profiles.TryGetValue("sofia@kotoba.app", out var correctionAuthor))
        {
            await InsertAsync(database, "comments", new Dictionary<string, object?>
            {
                ["post_id"] = postIds[0], ["user_id"] = Long(correctionAuthor["user_id"]),
                ["author_name"] = Text(correctionAuthor["display_name"]), ["author_color"] = Text(correctionAuthor["avatar_color"]),
                ["body"] = "Nice story! A few small fixes:", ["is_correction"] = true,
                ["corrected"] = "Yesterday I went to the park with my friend. We ate ice cream and it was delicious!",
                ["explanation"] = "Use the past tense: go becomes went and eat becomes ate. Also, delicious already means very tasty, so you do not need very."
            });
            await ScriptDatabase.ExecuteAsync(database,
                $"UPDATE {Table("posts")} SET comments_count = 1, corrections_count = 1 WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = postIds[0] });
        }
        if (postIds[2] > 0 && profiles.TryGetValue("aiko@kotoba.app", out var aiko))
        {
            await InsertAsync(database, "comments", new Dictionary<string, object?>
            {
                ["post_id"] = postIds[2], ["user_id"] = Long(aiko["user_id"]),
                ["author_name"] = Text(aiko["display_name"]), ["author_color"] = Text(aiko["avatar_color"]),
                ["body"] = "すてきですね！Very cozy. Your sentence is perfect.", ["is_correction"] = false
            });
            await ScriptDatabase.ExecuteAsync(database,
                $"UPDATE {Table("posts")} SET comments_count = 1 WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = postIds[2] });
        }
        if (profiles.TryGetValue("aiko@kotoba.app", out var aikoProfile) &&
            profiles.TryGetValue("sofia@kotoba.app", out var sofiaProfile))
        {
            await InsertAsync(database, "follows", new Dictionary<string, object?>
            {
                ["follower_id"] = Long(aikoProfile["user_id"]), ["following_id"] = Long(sofiaProfile["user_id"])
            });
            await InsertAsync(database, "follows", new Dictionary<string, object?>
            {
                ["follower_id"] = Long(sofiaProfile["user_id"]), ["following_id"] = Long(aikoProfile["user_id"])
            });
        }
        var circleSeeds = new[]
        {
            ("English Morning Club", "sun", "en", "A2", "Short daily check-ins in English. Be kind and correct gently.", "sofia@kotoba.app"),
            ("Japanese for Beginners", "flower", "ja", "A1", "Hiragana, greetings and first sentences. Ask anything.", "aiko@kotoba.app"),
            ("Spanish Cafe Talk", "coffee", "es", "A2", "Relaxed conversation practice over virtual coffee.", "mateo@kotoba.app")
        };
        foreach (var seed in circleSeeds)
        {
            if (!profiles.TryGetValue(seed.Item6, out var owner)) continue;
            var circle = await InsertAsync(database, "circles", new Dictionary<string, object?>
            {
                ["name"] = seed.Item1, ["emoji"] = seed.Item2, ["lang"] = seed.Item3, ["level"] = seed.Item4,
                ["description"] = seed.Item5, ["owner_id"] = Long(owner["user_id"]), ["members_count"] = 1
            });
            await InsertAsync(database, "circle_members", new Dictionary<string, object?>
            {
                ["circle_id"] = Long(circle["id"]), ["user_id"] = Long(owner["user_id"])
            });
            await InsertAsync(database, "messages", new Dictionary<string, object?>
            {
                ["circle_id"] = Long(circle["id"]), ["sender_id"] = Long(owner["user_id"]),
                ["sender_name"] = Text(owner["display_name"]), ["sender_color"] = Text(owner["avatar_color"]),
                ["body"] = $"Welcome to {seed.Item1}! Introduce yourself in your target language.",
                ["lang"] = seed.Item3
            });
        }
        return Results.Json(new { seeded = true });
    }

    private static async Task<JsonObject> UpdateAndReadAsync(
        DbConnection database,
        string table,
        long id,
        Dictionary<string, object?> values)
    {
        await UpdateAsync(database, table, id, values);
        return await ByIdAsync(database, table, id)
            ?? throw new InvalidOperationException($"Updated {table} row {id} was not found.");
    }

    private static async Task<IResult> HomeAsync(DbConnection database, HttpContext context, JsonObject user)
    {
        await SeedAsync(database);
        var profile = await ProfileAsync(database, user);
        var userId = UserId(user);
        var lang = Text(profile["learning_lang"], "es");
        var missions = await QueryAsync(database,
            $"SELECT * FROM {Table("missions")} WHERE lang IN (@lang, 'any') ORDER BY position",
            new Dictionary<string, object?> { ["@lang"] = lang });
        var dayOfYear = DateTime.UtcNow.DayOfYear;
        var mission = missions.Count == 0 ? null : missions[dayOfYear % missions.Count];
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var due = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("vocab_cards")} WHERE user_id = @user AND (due_date IS NULL OR due_date <= @today)",
            new Dictionary<string, object?> { ["@user"] = userId, ["@today"] = today });
        var nextLesson = await FirstAsync(database,
            $"SELECT l.* FROM {Table("lessons")} l WHERE l.lang = @lang AND NOT EXISTS " +
            $"(SELECT 1 FROM {Table("lesson_results")} r WHERE r.lesson_id = l.id AND r.user_id = @user) " +
            "ORDER BY l.position LIMIT 1",
            new Dictionary<string, object?> { ["@lang"] = lang, ["@user"] = userId });
        var unread = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("alerts")} WHERE user_id = @user AND is_read = @false",
            new Dictionary<string, object?> { ["@user"] = userId, ["@false"] = false });
        var activity = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("posts")} WHERE user_id = @user AND DATE(created_at) = @today",
            new Dictionary<string, object?> { ["@user"] = userId, ["@today"] = today });
        activity += await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("messages")} WHERE sender_id = @user AND DATE(created_at) = @today",
            new Dictionary<string, object?> { ["@user"] = userId, ["@today"] = today });
        activity += await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("lesson_results")} WHERE user_id = @user AND DATE(updated_at) = @today",
            new Dictionary<string, object?> { ["@user"] = userId, ["@today"] = today });
        var help = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("posts")} WHERE corrections_count = 0 AND user_id <> @user AND lang = @lang",
            new Dictionary<string, object?> { ["@user"] = userId, ["@lang"] = Text(profile["native_lang"], "en") });
        var missionDone = mission is not null && await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("posts")} WHERE user_id = @user AND mission_id = @mission AND DATE(created_at) = @today",
            new Dictionary<string, object?> { ["@user"] = userId, ["@mission"] = Long(mission?["id"]), ["@today"] = today }) > 0;
        var circles = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("circle_members")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = userId });
        return Results.Json(new
        {
            profile,
            mission,
            mission_done = missionDone,
            due,
            next_lesson = nextLesson is null ? null : new
            {
                id = nextLesson["id"], title = nextLesson["title"],
                unit = nextLesson["unit"], emoji = nextLesson["emoji"]
            },
            unread,
            today_activity = activity,
            help_needed = help,
            circles
        });
    }

    private static async Task<IResult> FeedAsync(DbConnection database, HttpContext context, JsonObject user)
    {
        var profile = await ProfileAsync(database, user);
        var userId = UserId(user);
        var scope = context.Request.Query["scope"].ToString();
        var lang = context.Request.Query["lang"].ToString();
        var mission = context.Request.Query["mission_id"].ToString();
        var sql = $"SELECT * FROM {Table("posts")} WHERE 1 = 1";
        var parameters = new Dictionary<string, object?>();
        if (!string.IsNullOrWhiteSpace(lang)) { sql += " AND lang = @lang"; parameters["@lang"] = lang; }
        if (scope == "mine") { sql += " AND user_id = @user"; parameters["@user"] = userId; }
        else if (scope == "help")
        {
            sql += " AND lang = @native AND user_id <> @user AND corrections_count = 0";
            parameters["@native"] = Text(profile["native_lang"], "en");
            parameters["@user"] = userId;
        }
        else if (scope == "following")
        {
            sql += $" AND (user_id = @user OR user_id IN (SELECT following_id FROM {Table("follows")} WHERE follower_id = @user))";
            parameters["@user"] = userId;
        }
        if (long.TryParse(mission, out var missionId)) { sql += " AND mission_id = @mission"; parameters["@mission"] = missionId; }
        sql += " ORDER BY id DESC LIMIT 40";
        var posts = await QueryAsync(database, sql, parameters);
        foreach (var post in posts)
        {
            var liked = await ScalarLongAsync(database,
                $"SELECT COUNT(*) FROM {Table("likes")} WHERE user_id = @user AND post_id = @post",
                new Dictionary<string, object?> { ["@user"] = userId, ["@post"] = Long(post["id"]) });
            post["liked"] = liked > 0;
        }
        return Results.Json(new { data = posts });
    }

    private static async Task<IResult> CreatePostAsync(
        HttpContext context,
        DbConnection database,
        JsonObject body,
        JsonObject user)
    {
        var text = Text(body["body"]);
        var lang = Text(body["lang"]);
        if (string.IsNullOrWhiteSpace(text) || text.Length > 2000 || string.IsNullOrWhiteSpace(lang) || lang.Length > 8)
            return Results.Json(new { message = "A body and valid language are required." }, statusCode: 422);
        var profile = await ProfileAsync(database, user);
        var post = await InsertAsync(database, "posts", new Dictionary<string, object?>
        {
            ["user_id"] = UserId(user), ["author_name"] = Text(profile["display_name"]),
            ["author_color"] = Text(profile["avatar_color"]), ["author_native"] = Text(profile["native_lang"]),
            ["lang"] = lang, ["kind"] = Text(body["kind"], "moment"),
            ["mission_id"] = Long(body["mission_id"]) is > 0 ? Long(body["mission_id"]) : null,
            ["body"] = text, ["translation"] = DbValue(body["translation"])
        });
        var words = text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
        var kind = Text(body["kind"], "moment");
        await BumpProfileAsync(database, user, kind == "mission" ? 20 : 10, Math.Max(1, words), 0);
        post["liked"] = false;
        return Results.Json(new { data = post }, statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> DeletePostAsync(
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var id = RouteId(routeValues);
        var post = await ByIdAsync(database, "posts", id);
        if (post is null) return Results.NotFound(new { message = "Post not found." });
        if (Long(post["user_id"]) != UserId(user))
            return Results.Json(new { message = "Not allowed" }, statusCode: 403);
        await ScriptDatabase.ExecuteAsync(database, $"DELETE FROM {Table("posts")} WHERE id = @id",
            new Dictionary<string, object?> { ["@id"] = id });
        return Results.Json(new { message = "Post deleted" });
    }

    private static async Task<IResult> ToggleLikeAsync(
        HttpContext context,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var postId = RouteId(routeValues);
        if (await ByIdAsync(database, "posts", postId) is null)
            return Results.NotFound(new { message = "Post not found." });
        var userId = UserId(user);
        var like = await FirstAsync(database,
            $"SELECT id FROM {Table("likes")} WHERE post_id = @post AND user_id = @user",
            new Dictionary<string, object?> { ["@post"] = postId, ["@user"] = userId });
        if (like is not null)
        {
            await ScriptDatabase.ExecuteAsync(database, $"DELETE FROM {Table("likes")} WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = Long(like["id"]) });
            await ScriptDatabase.ExecuteAsync(database, $"UPDATE {Table("posts")} SET likes_count = CASE WHEN likes_count > 0 THEN likes_count - 1 ELSE 0 END WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = postId });
            var updatedPost = await ByIdAsync(database, "posts", postId);
            return Results.Json(new { liked = false, likes_count = Int(updatedPost?["likes_count"]) });
        }
        await InsertAsync(database, "likes", new Dictionary<string, object?> { ["post_id"] = postId, ["user_id"] = userId });
        await ScriptDatabase.ExecuteAsync(database, $"UPDATE {Table("posts")} SET likes_count = likes_count + 1 WHERE id = @id",
            new Dictionary<string, object?> { ["@id"] = postId });
        var postRow = await ByIdAsync(database, "posts", postId);
        if (Long(postRow?["user_id"]) != userId)
        {
            var profile = await ProfileAsync(database, user);
            var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
            {
                ["user_id"] = Long(postRow?["user_id"]), ["kind"] = "like",
                ["text"] = Text(profile["display_name"]) + " liked your post",
                ["ref"] = postId, ["is_read"] = false
            });
            await BroadcastHub.BroadcastToAsync($"private-kotoba.{postRow?["user_id"]}",
                "kotoba.alert-created", alert, context.RequestAborted);
        }
        return Results.Json(new { liked = true, likes_count = Int(postRow?["likes_count"]) });
    }

    private static async Task<IResult> ListCommentsAsync(
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues)
    {
        var postId = RouteId(routeValues);
        var comments = await QueryAsync(database,
            $"SELECT * FROM {Table("comments")} WHERE post_id = @post ORDER BY id",
            new Dictionary<string, object?> { ["@post"] = postId });
        return Results.Json(new { data = comments });
    }

    private static async Task<IResult> AddCommentAsync(
        HttpContext context,
        DbConnection database,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var postId = RouteId(routeValues);
        var post = await ByIdAsync(database, "posts", postId);
        if (post is null) return Results.NotFound(new { message = "Post not found." });
        var text = Text(body["body"]);
        if (string.IsNullOrWhiteSpace(text) || text.Length > 1000)
            return Results.Json(new { message = "The comment body is invalid." }, statusCode: 422);
        var profile = await ProfileAsync(database, user);
        var correction = Bool(body["is_correction"]) && !string.IsNullOrWhiteSpace(Text(body["corrected"]));
        var comment = await InsertAsync(database, "comments", new Dictionary<string, object?>
        {
            ["post_id"] = postId, ["user_id"] = UserId(user),
            ["author_name"] = Text(profile["display_name"]), ["author_color"] = Text(profile["avatar_color"]),
            ["body"] = text, ["is_correction"] = correction,
            ["corrected"] = correction ? Text(body["corrected"]) : null,
            ["explanation"] = correction ? Text(body["explanation"]) : null
        });
        await ScriptDatabase.ExecuteAsync(database,
            $"UPDATE {Table("posts")} SET comments_count = comments_count + 1, corrections_count = corrections_count + @correction WHERE id = @id",
            new Dictionary<string, object?> { ["@correction"] = correction ? 1 : 0, ["@id"] = postId });
        var kind = correction ? "correction" : "comment";
        var notice = Text(profile["display_name"]) + (correction ? " corrected your post" : " commented on your post");
        var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
        {
            ["user_id"] = Long(post["user_id"]), ["kind"] = kind, ["text"] = notice,
            ["ref"] = postId, ["is_read"] = false
        });
        await BroadcastHub.BroadcastToAsync($"private-kotoba.{post["user_id"]}",
            "kotoba.alert-created", alert, context.RequestAborted);
        await BumpProfileAsync(database, user, correction ? 15 : 5, 0, 0);
        return Results.Json(new { data = comment }, statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> AcceptCorrectionAsync(
        HttpContext context,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var comment = await ByIdAsync(database, "comments", RouteId(routeValues));
        if (comment is null) return Results.NotFound(new { message = "Comment not found." });
        var post = await ByIdAsync(database, "posts", Long(comment["post_id"]));
        if (post is null) return Results.NotFound(new { message = "Post not found." });
        if (Long(post["user_id"]) != UserId(user))
            return Results.Json(new { message = "Only the author can accept a correction" }, statusCode: 403);
        await UpdateAsync(database, "comments", Long(comment["id"]), new Dictionary<string, object?> { ["accepted"] = true });
        var profile = await ProfileAsync(database, user);
        var text = Text(profile["display_name"]) + " accepted your correction. Thank you!";
        var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
        {
            ["user_id"] = Long(comment["user_id"]), ["kind"] = "accepted", ["text"] = text,
            ["ref"] = Long(post["id"]), ["is_read"] = false
        });
        await BroadcastHub.BroadcastToAsync($"private-kotoba.{comment["user_id"]}",
            "kotoba.alert-created", alert, context.RequestAborted);
        return Results.Json(new { data = await ByIdAsync(database, "comments", Long(comment["id"])) });
    }

    private static async Task<IResult> ListLessonsAsync(
        DbConnection database,
        HttpContext context,
        JsonObject user)
    {
        var profile = await ProfileAsync(database, user);
        var lang = string.IsNullOrWhiteSpace(context.Request.Query["lang"])
            ? Text(profile["learning_lang"])
            : context.Request.Query["lang"].ToString();
        var lessons = await QueryAsync(database,
            $"SELECT l.*, CASE WHEN r.id IS NULL THEN 0 ELSE 1 END AS done, COALESCE(r.best, 0) AS best " +
            $"FROM {Table("lessons")} l LEFT JOIN {Table("lesson_results")} r ON r.lesson_id = l.id AND r.user_id = @user " +
            "WHERE l.lang = @lang ORDER BY l.position",
            new Dictionary<string, object?> { ["@user"] = UserId(user), ["@lang"] = lang });
        return Results.Json(new { data = lessons, lang });
    }

    private static async Task<IResult> CompleteLessonAsync(
        DbConnection database,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var score = Int(body["score"], -1);
        if (score is < 0 or > 100)
            return Results.Json(new { message = "The score field must be between 0 and 100." }, statusCode: 422);
        var lesson = await ByIdAsync(database, "lessons", RouteId(routeValues));
        if (lesson is null) return Results.NotFound(new { message = "Lesson not found." });
        var userId = UserId(user);
        var result = await FirstAsync(database,
            $"SELECT * FROM {Table("lesson_results")} WHERE user_id = @user AND lesson_id = @lesson",
            new Dictionary<string, object?> { ["@user"] = userId, ["@lesson"] = Long(lesson["id"]) });
        var first = result is null;
        if (first)
        {
            result = await InsertAsync(database, "lesson_results", new Dictionary<string, object?>
            {
                ["user_id"] = userId, ["lesson_id"] = Long(lesson["id"]), ["score"] = score, ["best"] = score
            });
        }
        else
        {
            var existingResult = result ?? throw new InvalidOperationException("Lesson result lookup returned no row.");
            await UpdateAsync(database, "lesson_results", Long(existingResult["id"]),
                new Dictionary<string, object?> { ["score"] = score, ["best"] = Math.Max(Int(existingResult["best"]), score) });
        }
        var xp = first ? (int)Math.Round(Int(lesson["xp"]) * Math.Max(0.4, score / 100.0)) : 5;
        var added = 0;
        JsonNode? content = null;
        try { content = JsonNode.Parse(Text(lesson["content"], "{}")); }
        catch (JsonException exception) { throw new InvalidOperationException("Lesson content is invalid JSON.", exception); }
        if (content?["v"] is JsonArray vocabulary)
        {
            foreach (var pair in vocabulary.OfType<JsonArray>())
            {
                if (pair.Count < 2) continue;
                var term = DbValue(pair[0]);
                var existing = await FirstAsync(database,
                    $"SELECT id FROM {Table("vocab_cards")} WHERE user_id = @user AND lang = @lang AND term = @term",
                    new Dictionary<string, object?> { ["@user"] = userId, ["@lang"] = Text(lesson["lang"]), ["@term"] = term });
                if (existing is not null) continue;
                await InsertAsync(database, "vocab_cards", new Dictionary<string, object?>
                {
                    ["user_id"] = userId, ["lang"] = Text(lesson["lang"]), ["term"] = term,
                    ["meaning"] = DbValue(pair[1]), ["source"] = "lesson",
                    ["due_date"] = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
                });
                added++;
            }
        }
        await BumpProfileAsync(database, user, xp, 0, 0);
        return Results.Json(new { xp, cards_added = added, first });
    }

    private static async Task<IResult> ListCardsAsync(
        DbConnection database,
        HttpContext context,
        JsonObject user)
    {
        var userId = UserId(user);
        var today = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var lang = context.Request.Query["lang"].ToString();
        var parameters = new Dictionary<string, object?> { ["@user"] = userId, ["@today"] = today };
        var where = $"user_id = @user";
        if (!string.IsNullOrWhiteSpace(lang)) { where += " AND lang = @lang"; parameters["@lang"] = lang; }
        var total = await ScalarLongAsync(database, $"SELECT COUNT(*) FROM {Table("vocab_cards")} WHERE {where}", parameters);
        var dueCount = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("vocab_cards")} WHERE {where} AND (due_date IS NULL OR due_date <= @today)", parameters);
        var sql = $"SELECT * FROM {Table("vocab_cards")} WHERE {where}";
        if (context.Request.Query["due"] == "1") sql += " AND (due_date IS NULL OR due_date <= @today)";
        var search = context.Request.Query["q"].ToString();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (term LIKE @search OR meaning LIKE @search)";
            parameters["@search"] = $"%{search}%";
        }
        sql += " ORDER BY due_date, id LIMIT 200";
        var cards = await QueryAsync(database, sql, parameters);
        return Results.Json(new { data = cards, total, due_count = dueCount });
    }

    private static async Task<IResult> AddCardAsync(DbConnection database, JsonObject body, JsonObject user)
    {
        var term = Text(body["term"]);
        var meaning = Text(body["meaning"]);
        var lang = Text(body["lang"]);
        if (term.Length is 0 or > 255 || meaning.Length is 0 or > 255 || lang.Length is 0 or > 8)
            return Results.Json(new { message = "Term, meaning, and language are required and must be valid." }, statusCode: 422);
        var parameters = new Dictionary<string, object?>
        {
            ["@user"] = UserId(user), ["@lang"] = lang, ["@term"] = term
        };
        var card = await FirstAsync(database,
            $"SELECT * FROM {Table("vocab_cards")} WHERE user_id = @user AND lang = @lang AND term = @term", parameters);
        var created = card is null;
        if (created)
        {
            card = await InsertAsync(database, "vocab_cards", new Dictionary<string, object?>
            {
                ["user_id"] = UserId(user), ["lang"] = lang, ["term"] = term, ["meaning"] = meaning,
                ["example"] = DbValue(body["example"]), ["source"] = Text(body["source"], "manual"),
                ["due_date"] = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        }
        return Results.Json(new { data = card, created }, statusCode: created ? 201 : 200);
    }

    private static async Task<IResult> ReviewCardAsync(
        DbConnection database,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var card = await FirstAsync(database,
            $"SELECT * FROM {Table("vocab_cards")} WHERE id = @id AND user_id = @user",
            new Dictionary<string, object?> { ["@id"] = RouteId(routeValues), ["@user"] = UserId(user) });
        if (card is null) return Results.NotFound(new { message = "Card not found." });
        var grade = Math.Clamp(Int(body["grade"], 2), 0, 3);
        var reps = Int(card["reps"]);
        var lapses = Int(card["lapses"]);
        var ease = double.TryParse(Text(card["ease"], "2.5"), NumberStyles.Float, CultureInfo.InvariantCulture, out var currentEase)
            ? currentEase : 2.5;
        var interval = Int(card["interval_days"]);
        string dueDate;
        if (grade == 0)
        {
            lapses++;
            reps = 0;
            ease = Math.Max(1.3, ease - 0.2);
            interval = 0;
            dueDate = DateTime.UtcNow.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
        else
        {
            reps++;
            if (reps == 1) interval = grade == 3 ? 3 : 1;
            else if (reps == 2) interval = grade == 1 ? 2 : grade == 3 ? 7 : 4;
            else
            {
                var multiplier = grade == 1 ? 1.2 : grade == 3 ? ease * 1.3 : ease;
                interval = Math.Max(1, (int)Math.Round(interval * multiplier));
            }
            if (grade == 1) ease = Math.Max(1.3, ease - 0.15);
            if (grade == 3) ease += 0.15;
            dueDate = DateTime.UtcNow.AddDays(interval).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        }
        await UpdateAsync(database, "vocab_cards", Long(card["id"]), new Dictionary<string, object?>
        {
            ["lapses"] = lapses, ["reps"] = reps, ["ease"] = ease,
            ["interval_days"] = interval, ["due_date"] = dueDate
        });
        await BumpProfileAsync(database, user, 2, 0, 0);
        return Results.Json(new { data = await ByIdAsync(database, "vocab_cards", Long(card["id"])) });
    }

    private static async Task<IResult> DeleteCardAsync(
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        await ScriptDatabase.ExecuteAsync(database,
            $"DELETE FROM {Table("vocab_cards")} WHERE id = @id AND user_id = @user",
            new Dictionary<string, object?> { ["@id"] = RouteId(routeValues), ["@user"] = UserId(user) });
        return Results.Json(new { message = "Card deleted" });
    }

    private static async Task<IResult> PartnersAsync(
        DbConnection database,
        HttpContext context,
        JsonObject user)
    {
        var mine = await ProfileAsync(database, user);
        var userId = UserId(user);
        var parameters = new Dictionary<string, object?> { ["@user"] = userId };
        var sql = $"SELECT * FROM {Table("profiles")} WHERE user_id <> @user";
        if (context.Request.Query["mode"] == "exchange")
        {
            sql += " AND native_lang = @learning";
            parameters["@learning"] = Text(mine["learning_lang"]);
        }
        var lang = context.Request.Query["lang"].ToString();
        if (!string.IsNullOrWhiteSpace(lang)) { sql += " AND native_lang = @lang"; parameters["@lang"] = lang; }
        var search = context.Request.Query["q"].ToString();
        if (!string.IsNullOrWhiteSpace(search))
        {
            sql += " AND (display_name LIKE @search OR interests LIKE @search OR country LIKE @search)";
            parameters["@search"] = $"%{search}%";
        }
        sql += " LIMIT 60";
        var following = (await QueryAsync(database,
            $"SELECT following_id FROM {Table("follows")} WHERE follower_id = @user",
            new Dictionary<string, object?> { ["@user"] = userId })).Select(row => Long(row["following_id"])).ToHashSet();
        var mineInterests = Text(mine["interests"]).Split(',').Select(value => value.Trim().ToLowerInvariant())
            .Where(value => value.Length > 0).ToHashSet();
        var levels = new Dictionary<string, int> { ["A1"] = 1, ["A2"] = 2, ["B1"] = 3, ["B2"] = 4, ["C1"] = 5, ["C2"] = 6 };
        var rows = new List<JsonObject>();
        foreach (var candidate in await QueryAsync(database, sql, parameters))
        {
            var shared = Text(candidate["interests"]).Split(',').Select(value => value.Trim().ToLowerInvariant())
                .Where(mineInterests.Contains).Distinct().ToArray();
            var levelDistance = Math.Abs(levels.GetValueOrDefault(Text(candidate["level"]), 1) -
                                         levels.GetValueOrDefault(Text(mine["level"]), 1));
            var score = (Text(candidate["native_lang"]) == Text(mine["learning_lang"]) ? 50 : 0)
                      + (Text(candidate["learning_lang"]) == Text(mine["native_lang"]) ? 30 : 0)
                      + Math.Min(20, shared.Length * 7) + Math.Max(0, 5 - levelDistance);
            candidate["score"] = Math.Min(100, score);
            candidate["shared"] = JsonSerializer.SerializeToNode(shared, JsonOptions);
            candidate["following"] = following.Contains(Long(candidate["user_id"]));
            rows.Add(candidate);
        }
        rows.Sort((left, right) => Int(right["score"]).CompareTo(Int(left["score"])));
        return Results.Json(new { data = rows });
    }

    private static async Task<IResult> ViewProfileAsync(
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var profile = await FirstAsync(database,
            $"SELECT * FROM {Table("profiles")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = RouteId(routeValues) });
        if (profile is null) return Results.NotFound(new { message = "Profile not found." });
        var profileUserId = Long(profile["user_id"]);
        var posts = await QueryAsync(database,
            $"SELECT * FROM {Table("posts")} WHERE user_id = @user ORDER BY id DESC LIMIT 5",
            new Dictionary<string, object?> { ["@user"] = profileUserId });
        var followers = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("follows")} WHERE following_id = @user",
            new Dictionary<string, object?> { ["@user"] = profileUserId });
        var followingCount = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("follows")} WHERE follower_id = @user",
            new Dictionary<string, object?> { ["@user"] = profileUserId });
        var following = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("follows")} WHERE follower_id = @viewer AND following_id = @user",
            new Dictionary<string, object?> { ["@viewer"] = UserId(user), ["@user"] = profileUserId }) > 0;
        var postCount = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("posts")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = profileUserId });
        return Results.Json(new { data = profile, posts, followers, following_count = followingCount, following, post_count = postCount });
    }

    private static async Task<IResult> ToggleFollowAsync(
        HttpContext context,
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var userId = UserId(user);
        var target = RouteId(routeValues);
        if (target == userId) return Results.Json(new { message = "You cannot follow yourself" }, statusCode: 422);
        if (await FirstAsync(database, $"SELECT id FROM {Table("profiles")} WHERE user_id = @user",
                new Dictionary<string, object?> { ["@user"] = target }) is null)
            return Results.NotFound(new { message = "Profile not found." });
        var existing = await FirstAsync(database,
            $"SELECT id FROM {Table("follows")} WHERE follower_id = @user AND following_id = @target",
            new Dictionary<string, object?> { ["@user"] = userId, ["@target"] = target });
        if (existing is not null)
        {
            await ScriptDatabase.ExecuteAsync(database, $"DELETE FROM {Table("follows")} WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = Long(existing["id"]) });
            return Results.Json(new { following = false });
        }
        await InsertAsync(database, "follows", new Dictionary<string, object?> { ["follower_id"] = userId, ["following_id"] = target });
        var profile = await ProfileAsync(database, user);
        var text = Text(profile["display_name"]) + " started following you";
        var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
        {
            ["user_id"] = target, ["kind"] = "follow", ["text"] = text, ["ref"] = userId, ["is_read"] = false
        });
        await BroadcastHub.BroadcastToAsync($"private-kotoba.{target}",
            "kotoba.alert-created", alert, context.RequestAborted);
        return Results.Json(new { following = true });
    }

    private static long RouteId(IReadOnlyDictionary<string, string> routeValues) =>
        routeValues.TryGetValue("id", out var value) && long.TryParse(value, out var id)
            ? id
            : throw new InvalidOperationException("A numeric route id is required.");

    private static async Task<IResult> ListConversationsAsync(DbConnection database, JsonObject user)
    {
        var userId = UserId(user);
        var conversations = await QueryAsync(database,
            $"SELECT * FROM {Table("conversations")} WHERE user_a = @user OR user_b = @user ORDER BY last_at DESC, id DESC",
            new Dictionary<string, object?> { ["@user"] = userId });
        var rows = new List<object>();
        foreach (var conversation in conversations)
        {
            var otherId = Long(conversation["user_a"]) == userId
                ? Long(conversation["user_b"])
                : Long(conversation["user_a"]);
            var profile = await FirstAsync(database,
                $"SELECT * FROM {Table("profiles")} WHERE user_id = @user",
                new Dictionary<string, object?> { ["@user"] = otherId });
            rows.Add(new
            {
                id = conversation["id"],
                last_message = conversation["last_message"],
                last_at = conversation["last_at"],
                @with = profile ?? JsonSerializer.SerializeToNode(new
                {
                    user_id = otherId, display_name = "Member", avatar_color = "#6b655b"
                }, JsonOptions)!.AsObject()
            });
        }
        return Results.Json(new { data = rows });
    }

    private static async Task<IResult> StartConversationAsync(
        DbConnection database,
        JsonObject body,
        JsonObject user)
    {
        var otherId = Long(body["user_id"]);
        var userId = UserId(user);
        if (otherId <= 0) return Results.Json(new { message = "A valid user_id is required." }, statusCode: 422);
        if (otherId == userId) return Results.Json(new { message = "Pick someone else to talk to" }, statusCode: 422);
        var profile = await FirstAsync(database,
            $"SELECT * FROM {Table("profiles")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = otherId });
        if (profile is null) return Results.NotFound(new { message = "Profile not found." });
        var firstId = Math.Min(userId, otherId);
        var secondId = Math.Max(userId, otherId);
        var conversation = await FirstAsync(database,
            $"SELECT * FROM {Table("conversations")} WHERE user_a = @first AND user_b = @second",
            new Dictionary<string, object?> { ["@first"] = firstId, ["@second"] = secondId });
        conversation ??= await InsertAsync(database, "conversations",
            new Dictionary<string, object?> { ["user_a"] = firstId, ["user_b"] = secondId });
        return Results.Json(new
        {
            data = new
            {
                id = conversation["id"], last_message = conversation["last_message"],
                last_at = conversation["last_at"], @with = profile
            }
        });
    }

    private static async Task<IResult> ListMessagesAsync(
        DbConnection database,
        HttpContext context,
        JsonObject user)
    {
        var userId = UserId(user);
        var conversationId = context.Request.Query["conversation_id"].ToString();
        var circleId = context.Request.Query["circle_id"].ToString();
        var afterId = context.Request.Query["after_id"].ToString();
        var parameters = new Dictionary<string, object?>();
        var sql = $"SELECT * FROM {Table("messages")} WHERE 1 = 1";
        if (long.TryParse(conversationId, out var convId))
        {
            var conversation = await ByIdAsync(database, "conversations", convId);
            if (conversation is null) return Results.NotFound(new { message = "Conversation not found." });
            if (Long(conversation["user_a"]) != userId && Long(conversation["user_b"]) != userId)
                return Results.Json(new { message = "Not your conversation" }, statusCode: 403);
            sql += " AND conversation_id = @conversation";
            parameters["@conversation"] = convId;
        }
        else if (long.TryParse(circleId, out var circle))
        {
            var membership = await FirstAsync(database,
                $"SELECT id FROM {Table("circle_members")} WHERE circle_id = @circle AND user_id = @user",
                new Dictionary<string, object?> { ["@circle"] = circle, ["@user"] = userId });
            if (membership is null) return Results.Json(new { message = "Join this circle first" }, statusCode: 403);
            sql += " AND circle_id = @circle";
            parameters["@circle"] = circle;
        }
        else return Results.Json(new { message = "conversation_id or circle_id required" }, statusCode: 422);
        if (long.TryParse(afterId, out var after))
        {
            sql += " AND id > @after";
            parameters["@after"] = after;
        }
        sql += " ORDER BY id DESC LIMIT 100";
        var messages = await QueryAsync(database, sql, parameters);
        messages.Reverse();
        return Results.Json(new { data = messages });
    }

    private static async Task<IResult> SendMessageAsync(
        HttpContext context,
        DbConnection database,
        JsonObject body,
        JsonObject user)
    {
        var text = Text(body["body"]);
        if (string.IsNullOrWhiteSpace(text) || text.Length > 2000)
            return Results.Json(new { message = "The message body is invalid." }, statusCode: 422);
        var userId = UserId(user);
        var profile = await ProfileAsync(database, user);
        long? conversationId = null;
        long? circleId = null;
        var participants = new List<long>();
        var rawConversation = body["conversation_id"];
        var rawCircle = body["circle_id"];
        if (rawConversation is not null)
        {
            var id = Long(rawConversation);
            var conversation = await ByIdAsync(database, "conversations", id);
            if (conversation is null) return Results.NotFound(new { message = "Conversation not found." });
            if (Long(conversation["user_a"]) != userId && Long(conversation["user_b"]) != userId)
                return Results.Json(new { message = "Not your conversation" }, statusCode: 403);
            conversationId = id;
            participants.Add(Long(conversation["user_a"]));
            participants.Add(Long(conversation["user_b"]));
            await UpdateAsync(database, "conversations", id, new Dictionary<string, object?>
            {
                ["last_message"] = text[..Math.Min(200, text.Length)],
                ["last_at"] = DateTime.UtcNow
            });
        }
        else if (rawCircle is not null)
        {
            var id = Long(rawCircle);
            var member = await FirstAsync(database,
                $"SELECT id FROM {Table("circle_members")} WHERE circle_id = @circle AND user_id = @user",
                new Dictionary<string, object?> { ["@circle"] = id, ["@user"] = userId });
            if (member is null) return Results.Json(new { message = "Join this circle first" }, statusCode: 403);
            circleId = id;
            participants = (await QueryAsync(database,
                $"SELECT user_id FROM {Table("circle_members")} WHERE circle_id = @circle",
                new Dictionary<string, object?> { ["@circle"] = id }))
                .Select(row => Long(row["user_id"])).ToList();
        }
        else return Results.Json(new { message = "conversation_id or circle_id required" }, statusCode: 422);

        var message = await InsertAsync(database, "messages", new Dictionary<string, object?>
        {
            ["conversation_id"] = conversationId, ["circle_id"] = circleId,
            ["sender_id"] = userId, ["sender_name"] = Text(profile["display_name"]),
            ["sender_color"] = Text(profile["avatar_color"]), ["body"] = text,
            ["lang"] = DbValue(body["lang"])
        });
        message["scope"] = circleId is null ? "dm" : "circle";
        foreach (var recipient in participants.Where(id => id != userId).Distinct())
            await BroadcastHub.BroadcastToAsync($"private-kotoba.{recipient}",
                "kotoba.message-created", message, context.RequestAborted);
        var words = text.Split((char[]?)null, StringSplitOptions.RemoveEmptyEntries).Length;
        await BumpProfileAsync(database, user, 0, words, 1);
        return Results.Json(new { data = message }, statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> CorrectMessageAsync(
        HttpContext context,
        DbConnection database,
        JsonObject body,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var corrected = Text(body["corrected"]);
        if (corrected.Length is 0 or > 2000 || Text(body["note"]).Length > 500)
            return Results.Json(new { message = "The correction details are invalid." }, statusCode: 422);
        var message = await ByIdAsync(database, "messages", RouteId(routeValues));
        if (message is null) return Results.NotFound(new { message = "Message not found." });
        var userId = UserId(user);
        if (Long(message["sender_id"]) == userId)
            return Results.Json(new { message = "You cannot correct your own message" }, statusCode: 422);
        var participantIds = new List<long>();
        if (message["conversation_id"] is not null)
        {
            var conversation = await ByIdAsync(database, "conversations", Long(message["conversation_id"]));
            if (conversation is not null)
            {
                participantIds.Add(Long(conversation["user_a"]));
                participantIds.Add(Long(conversation["user_b"]));
            }
        }
        else if (message["circle_id"] is not null)
        {
            participantIds = (await QueryAsync(database,
                $"SELECT user_id FROM {Table("circle_members")} WHERE circle_id = @circle",
                new Dictionary<string, object?> { ["@circle"] = Long(message["circle_id"]) }))
                .Select(row => Long(row["user_id"])).ToList();
        }
        if (!participantIds.Contains(userId))
            return Results.Json(new { message = "Not allowed" }, statusCode: 403);
        await UpdateAsync(database, "messages", Long(message["id"]), new Dictionary<string, object?>
        {
            ["corrected"] = corrected, ["note"] = DbValue(body["note"]), ["corrected_by"] = userId
        });
        var updated = await ByIdAsync(database, "messages", Long(message["id"])) ?? message;
        updated["scope"] = message["circle_id"] is null ? "dm" : "circle";
        updated["updated"] = true;
        var profile = await ProfileAsync(database, user);
        var alert = await InsertAsync(database, "alerts", new Dictionary<string, object?>
        {
            ["user_id"] = Long(message["sender_id"]), ["kind"] = "correction",
            ["text"] = Text(profile["display_name"]) + " suggested a correction in chat",
            ["ref"] = Long(message["id"]), ["is_read"] = false
        });
        await BroadcastHub.BroadcastToAsync($"private-kotoba.{message["sender_id"]}",
            "kotoba.alert-created", alert, context.RequestAborted);
        foreach (var recipient in participantIds.Where(id => id != userId).Distinct())
            await BroadcastHub.BroadcastToAsync($"private-kotoba.{recipient}",
                "kotoba.message-created", updated, context.RequestAborted);
        await BumpProfileAsync(database, user, 10, 0, 0);
        return Results.Json(new { data = updated });
    }

    private static async Task<IResult> ListCirclesAsync(
        DbConnection database,
        HttpContext context,
        JsonObject user)
    {
        var userId = UserId(user);
        var parameters = new Dictionary<string, object?>();
        var sql = $"SELECT * FROM {Table("circles")}";
        var lang = context.Request.Query["lang"].ToString();
        if (!string.IsNullOrWhiteSpace(lang)) { sql += " WHERE lang = @lang"; parameters["@lang"] = lang; }
        sql += " ORDER BY members_count DESC, id DESC LIMIT 60";
        var circles = await QueryAsync(database, sql, parameters);
        foreach (var circle in circles)
        {
            circle["joined"] = await ScalarLongAsync(database,
                $"SELECT COUNT(*) FROM {Table("circle_members")} WHERE circle_id = @circle AND user_id = @user",
                new Dictionary<string, object?> { ["@circle"] = Long(circle["id"]), ["@user"] = userId }) > 0;
        }
        return Results.Json(new { data = circles });
    }

    private static async Task<IResult> CreateCircleAsync(DbConnection database, JsonObject body, JsonObject user)
    {
        var name = Text(body["name"]);
        var lang = Text(body["lang"]);
        var level = Text(body["level"], "A1");
        if (name.Length is 0 or > 80 || lang.Length is 0 or > 8 ||
            !new[] { "A1", "A2", "B1", "B2", "C1", "C2" }.Contains(level))
            return Results.Json(new { message = "The circle details are invalid." }, statusCode: 422);
        var circle = await InsertAsync(database, "circles", new Dictionary<string, object?>
        {
            ["name"] = name, ["emoji"] = Text(body["emoji"], "message-circle"),
            ["lang"] = lang, ["level"] = level, ["description"] = DbValue(body["description"]),
            ["owner_id"] = UserId(user), ["members_count"] = 1
        });
        await InsertAsync(database, "circle_members", new Dictionary<string, object?>
        {
            ["circle_id"] = Long(circle["id"]), ["user_id"] = UserId(user)
        });
        circle["joined"] = true;
        return Results.Json(new { data = circle }, statusCode: StatusCodes.Status201Created);
    }

    private static async Task<IResult> ToggleJoinAsync(
        DbConnection database,
        IReadOnlyDictionary<string, string> routeValues,
        JsonObject user)
    {
        var circleId = RouteId(routeValues);
        var circle = await ByIdAsync(database, "circles", circleId);
        if (circle is null) return Results.NotFound(new { message = "Circle not found." });
        var userId = UserId(user);
        var member = await FirstAsync(database,
            $"SELECT id FROM {Table("circle_members")} WHERE circle_id = @circle AND user_id = @user",
            new Dictionary<string, object?> { ["@circle"] = circleId, ["@user"] = userId });
        if (member is not null)
        {
            if (Long(circle["owner_id"]) == userId)
                return Results.Json(new { message = "Owners cannot leave their own circle" }, statusCode: 422);
            await ScriptDatabase.ExecuteAsync(database, $"DELETE FROM {Table("circle_members")} WHERE id = @id",
                new Dictionary<string, object?> { ["@id"] = Long(member["id"]) });
            var count = Math.Max(1, Int(circle["members_count"]) - 1);
            await UpdateAsync(database, "circles", circleId, new Dictionary<string, object?> { ["members_count"] = count });
            return Results.Json(new { joined = false, members_count = count });
        }
        await InsertAsync(database, "circle_members", new Dictionary<string, object?>
        {
            ["circle_id"] = circleId, ["user_id"] = userId
        });
        var newCount = Int(circle["members_count"]) + 1;
        await UpdateAsync(database, "circles", circleId, new Dictionary<string, object?> { ["members_count"] = newCount });
        return Results.Json(new { joined = true, members_count = newCount });
    }

    private static async Task<IResult> ListAlertsAsync(DbConnection database, JsonObject user)
    {
        var userId = UserId(user);
        var alerts = await QueryAsync(database,
            $"SELECT * FROM {Table("alerts")} WHERE user_id = @user ORDER BY id DESC LIMIT 50",
            new Dictionary<string, object?> { ["@user"] = userId });
        var unread = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("alerts")} WHERE user_id = @user AND is_read = @false",
            new Dictionary<string, object?> { ["@user"] = userId, ["@false"] = false });
        return Results.Json(new { data = alerts, unread });
    }

    private static async Task<IResult> ReadAlertsAsync(DbConnection database, JsonObject user)
    {
        await ScriptDatabase.ExecuteAsync(database,
            $"UPDATE {Table("alerts")} SET is_read = @true, updated_at = @updated WHERE user_id = @user AND is_read = @false",
            new Dictionary<string, object?>
            {
                ["@true"] = true, ["@false"] = false, ["@user"] = UserId(user), ["@updated"] = DateTime.UtcNow
            });
        return Results.Json(new { ok = true });
    }

    private static async Task<IResult> ProgressAsync(DbConnection database, JsonObject user)
    {
        var profile = await ProfileAsync(database, user);
        var userId = UserId(user);
        var today = DateTime.UtcNow.Date;
        var firstDay = today.AddDays(-13);
        var days = Enumerable.Range(0, 14)
            .ToDictionary(offset => firstDay.AddDays(offset).ToString("yyyy-MM-dd", CultureInfo.InvariantCulture), _ => 0);
        await AddActivityDaysAsync(database, "posts", "user_id", userId, "created_at", firstDay, days);
        await AddActivityDaysAsync(database, "messages", "sender_id", userId, "created_at", firstDay, days);
        await AddActivityDaysAsync(database, "lesson_results", "user_id", userId, "updated_at", firstDay, days);
        var postIds = (await QueryAsync(database,
            $"SELECT id FROM {Table("posts")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = userId })).Select(row => Long(row["id"])).ToArray();
        var cards = await ScalarLongAsync(database, $"SELECT COUNT(*) FROM {Table("vocab_cards")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = userId });
        var mastered = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("vocab_cards")} WHERE user_id = @user AND reps >= 4",
            new Dictionary<string, object?> { ["@user"] = userId });
        var lessons = await ScalarLongAsync(database, $"SELECT COUNT(*) FROM {Table("lesson_results")} WHERE user_id = @user",
            new Dictionary<string, object?> { ["@user"] = userId });
        var correctionsGiven = await ScalarLongAsync(database,
            $"SELECT COUNT(*) FROM {Table("comments")} WHERE user_id = @user AND is_correction = @true",
            new Dictionary<string, object?> { ["@user"] = userId, ["@true"] = true });
        var received = 0L;
        var accepted = 0L;
        if (postIds.Length > 0)
        {
            var parameters = postIds.Select((id, index) => new KeyValuePair<string, object?>($"@post{index}", id))
                .ToDictionary(pair => pair.Key, pair => pair.Value);
            parameters["@true"] = true;
            var placeholders = string.Join(", ", postIds.Select((_, index) => $"@post{index}"));
            received = await ScalarLongAsync(database,
                $"SELECT COUNT(*) FROM {Table("comments")} WHERE is_correction = @true AND post_id IN ({placeholders})", parameters);
            accepted = await ScalarLongAsync(database,
                $"SELECT COUNT(*) FROM {Table("comments")} WHERE is_correction = @true AND accepted = @true AND post_id IN ({placeholders})", parameters);
        }
        var xp = Int(profile["xp"]);
        var series = days.Select(entry => new { date = entry.Key, count = entry.Value }).ToArray();
        return Results.Json(new
        {
            profile,
            series,
            stats = new
            {
                cards, mastered, lessons, posts = postIds.Length,
                corrections_given = correctionsGiven, corrections_received = received,
                corrections_accepted = accepted, words_written = Int(profile["words_written"]),
                messages_sent = Int(profile["messages_sent"])
            },
            level = xp / 100 + 1,
            level_progress = xp % 100
        });
    }

    private static async Task AddActivityDaysAsync(
        DbConnection database,
        string table,
        string userColumn,
        long userId,
        string dateColumn,
        DateTime firstDay,
        Dictionary<string, int> days)
    {
        var rows = await QueryAsync(database,
            $"SELECT {TatemonoDatabase.Quote(dateColumn)} AS activity_date FROM {Table(table)} " +
            $"WHERE {TatemonoDatabase.Quote(userColumn)} = @user AND {TatemonoDatabase.Quote(dateColumn)} >= @since",
            new Dictionary<string, object?>
            {
                ["@user"] = userId,
                ["@since"] = firstDay.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture)
            });
        foreach (var row in rows)
        {
            var day = Text(row["activity_date"]);
            if (day.Length >= 10 && days.ContainsKey(day[..10])) days[day[..10]]++;
        }
    }
}
