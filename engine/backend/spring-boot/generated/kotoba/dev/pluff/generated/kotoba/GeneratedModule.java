package dev.pluff.generated.kotoba;
import dev.pluff.runtime.*;
import java.util.*;
import java.math.*;
import static dev.pluff.runtime.Support.*;
public final class GeneratedModule {
  private GeneratedModule() {}
  public static Router createRouter() throws Exception {
    JobDispatcher.unregister("kotoba");
    EventDispatcher.unregister("kotoba");
    CommandRegistry.unregister("kotoba");
    Router router = new Router("kotoba");
    Map<String, Map<String, Object>> mailTemplates = mailTemplates();
    router.add("POST", "/api/kotoba/auth/register", Auth.registerHandler("kotoba"));
    router.add("POST", "/api/kotoba/auth/login", Auth.loginHandler("kotoba"));
    router.add("POST", "/api/kotoba/auth/logout", List.of(Auth.authMiddleware("kotoba")), Auth.logoutHandler("kotoba"));
    router.add("GET", "/api/kotoba/auth/me", List.of(Auth.authMiddleware("kotoba")), Auth.meHandler());
    router.add("POST", "/api/kotoba/auth/broadcasting/auth", List.of(Auth.authMiddleware("kotoba")), Auth.broadcastingAuth("kotoba", Map.ofEntries(Map.entry("kotoba.{id}", Map.of("type", "private", "auth", "owner")))));
    router.add("GET", "/api/kotoba/x/profiles/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/posts/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/comments/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/likes/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/follows/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/missions/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/lessons/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/lesson-results/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/vocab-cards/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/conversations/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/messages/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/circles/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/circle-members/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/x/alerts/status", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return response.json(mapOf("message", "Endpoint status is not implemented yet"), 501);
    });
    router.add("GET", "/api/kotoba/me", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return me(request, response);
    });
    router.add("PUT", "/api/kotoba/me", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return update_me(request, response);
    });
    router.add("GET", "/api/kotoba/home", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return home(request, response);
    });
    router.add("POST", "/api/kotoba/activity", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return bump(request, response);
    });
    router.add("POST", "/api/kotoba/internal/notify", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return notify(request, response);
    });
    router.add("POST", "/api/kotoba/internal/seed", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return community_seed(request, response);
    });
    router.add("GET", "/api/kotoba/feed", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return feed(request, response);
    });
    router.add("POST", "/api/kotoba/posts", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return create_post(request, response);
    });
    router.add("GET", "/api/kotoba/lessons", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_lessons(request, response);
    });
    router.add("GET", "/api/kotoba/vocab", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_cards(request, response);
    });
    router.add("POST", "/api/kotoba/vocab", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return add_card(request, response);
    });
    router.add("GET", "/api/kotoba/partners", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return partners(request, response);
    });
    router.add("GET", "/api/kotoba/conversations", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_conversations(request, response);
    });
    router.add("POST", "/api/kotoba/conversations", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return start_conversation(request, response);
    });
    router.add("GET", "/api/kotoba/messages", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_messages(request, response);
    });
    router.add("POST", "/api/kotoba/messages", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return send_message(request, response);
    });
    router.add("GET", "/api/kotoba/circles", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_circles(request, response);
    });
    router.add("POST", "/api/kotoba/circles", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return create_circle(request, response);
    });
    router.add("GET", "/api/kotoba/alerts", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_alerts(request, response);
    });
    router.add("POST", "/api/kotoba/alerts/read", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return read_alerts(request, response);
    });
    router.add("GET", "/api/kotoba/progress", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return progress(request, response);
    });
    router.add("DELETE", "/api/kotoba/posts/{id}", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return delete_post(request, response);
    });
    router.add("POST", "/api/kotoba/posts/{id}/like", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return toggle_like(request, response);
    });
    router.add("GET", "/api/kotoba/posts/{id}/comments", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return list_comments(request, response);
    });
    router.add("POST", "/api/kotoba/posts/{id}/comments", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return add_comment(request, response);
    });
    router.add("POST", "/api/kotoba/comments/{id}/accept", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return accept_correction(request, response);
    });
    router.add("POST", "/api/kotoba/lessons/{id}/complete", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return complete_lesson(request, response);
    });
    router.add("POST", "/api/kotoba/vocab/{id}/review", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return review_card(request, response);
    });
    router.add("DELETE", "/api/kotoba/vocab/{id}", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return delete_card(request, response);
    });
    router.add("GET", "/api/kotoba/profile/{id}", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return view_profile(request, response);
    });
    router.add("POST", "/api/kotoba/follow/{id}", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return toggle_follow(request, response);
    });
    router.add("POST", "/api/kotoba/messages/{id}/correct", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return correct_message(request, response);
    });
    router.add("POST", "/api/kotoba/circles/{id}/join", List.of(Auth.authMiddleware("kotoba")), (request, response) -> {
      return toggle_join(request, response);
    });
    return router;
  }
  private static Map<String, Map<String, Object>> mailTemplates() {
    Map<String, Map<String, Object>> templates = new LinkedHashMap<>();
    return templates;
  }
  private static Router.Middleware customMiddleware(String name) {
    throw new IllegalArgumentException("Unknown middleware: " + name);
  }
  public static Object me(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    if (Post.count() == 0) community_seed(request, response);
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    return response.json(Support.mapOf("data", profile, "user", Support.mapOf("id", user.get("id"), "name", user.get("name"), "email", user.get("email"))));
  }
  public static Object update_me(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> validated = request.validate(Support.mapOf(
        "display_name", "sometimes|string|max:60", "bio", "sometimes|nullable|string|max:300",
        "native_lang", "sometimes|string|max:8", "learning_lang", "sometimes|string|max:8",
        "level", "sometimes|string|in:A1,A2,B1,B2,C1,C2", "country", "sometimes|nullable|string|max:60",
        "interests", "sometimes|nullable|string|max:500", "avatar_color", "sometimes|string|max:16",
        "daily_goal", "sometimes|integer|min:1|max:20", "onboarded", "sometimes|boolean"));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    profile.update(validated);
    return response.json(Support.mapOf("data", profile));
  }
  public static Object home(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    if (Post.count() == 0) community_seed(request, response);
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    String lang = profile.str("learning_lang");
    java.util.List<Mission> missions = Mission.query().whereIn("lang", java.util.List.of(lang, "any")).orderBy("position").get();
    Mission mission = missions.isEmpty() ? null : missions.get(java.time.LocalDate.now(java.time.ZoneOffset.UTC).getDayOfYear() % missions.size());
    String today = java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString();
    String tomorrow = java.time.LocalDate.now(java.time.ZoneOffset.UTC).plusDays(1).toString();
    long due = VocabCard.query().where("user_id", user.get("id")).where(q -> q.whereNull("due_date").orWhere("due_date", "<=", today)).count();
    java.util.List<Object> done = LessonResult.query().where("user_id", user.get("id")).pluck("lesson_id");
    Lesson next = Lesson.query().where("lang", lang).whereNotIn("id", done).orderBy("position").first();
    long unread = Alert.query().where("user_id", user.get("id")).where("is_read", false).count();
    String start = today + " 00:00:00";
    String end = tomorrow + " 00:00:00";
    long activity = Post.query().where("user_id", user.get("id")).where("created_at", ">=", start).where("created_at", "<", end).count()
        + Message.query().where("sender_id", user.get("id")).where("created_at", ">=", start).where("created_at", "<", end).count()
        + LessonResult.query().where("user_id", user.get("id")).where("updated_at", ">=", start).where("updated_at", "<", end).count();
    long help = Post.query().where("corrections_count", 0).where("user_id", "!=", user.get("id")).where("lang", profile.get("native_lang")).count();
    boolean missionDone = mission != null && Post.query().where("user_id", user.get("id")).where("mission_id", mission.id())
        .where("created_at", ">=", start).where("created_at", "<", end).exists();
    java.util.Map<String, Object> nextLesson = next == null ? null : Support.mapOf("id", next.id(), "title", next.get("title"), "unit", next.get("unit"), "emoji", next.get("emoji"));
    return response.json(Support.mapOf("profile", profile, "mission", mission, "mission_done", missionDone,
        "due", due, "next_lesson", nextLesson, "unread", unread, "today_activity", activity,
        "help_needed", help, "circles", CircleMember.query().where("user_id", user.get("id")).count()));
  }
  public static Object bump(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    int xp = Support.toInt(request.input("xp", 0), 0);
    int words = Support.toInt(request.input("words", 0), 0);
    int messages = Support.toInt(request.input("messages", 0), 0);
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String todayText = today.toString();
    Object lastActive = profile.get("last_active");
    String lastText = lastActive == null ? null : String.valueOf(lastActive).substring(0, Math.min(10, String.valueOf(lastActive).length()));
    if (!todayText.equals(lastText)) {
      profile.set("streak", today.minusDays(1).toString().equals(lastText) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", todayText);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + xp);
    profile.set("words_written", Support.toInt(profile.get("words_written"), 0) + words);
    profile.set("messages_sent", Support.toInt(profile.get("messages_sent"), 0) + messages);
    profile.save();
    return response.json(Support.mapOf("data", profile));
  }
  public static Object notify(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Object targetValue = request.input("user_id");
    Object kindValue = request.input("kind", "");
    Object textValue = request.input("text", "");
    Object refValue = request.input("ref");
    Model user = request.user();
    long target = Support.toLong(targetValue, 0);
    String kind = kindValue == null ? "" : String.valueOf(kindValue);
    String text = textValue == null ? "" : String.valueOf(textValue);
    if (target <= 0 || kind.isEmpty() || String.valueOf(user.get("id")).equals(String.valueOf(target)))
      return response.json(Support.mapOf("ok", false), 422);
    Alert alert = Alert.create(Support.mapOf("user_id", target, "kind", kind,
        "text", text.substring(0, Math.min(480, text.length())), "ref", refValue, "is_read", false));
    Broadcast.broadcastTo("private-kotoba." + target, "kotoba.alert-created", alert, null);
    return response.json(Support.mapOf("ok", true, "data", alert));
  }
  public static Object community_seed(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    if (Post.count() > 0) return response.json(Support.mapOf("seeded", false));
    String[] emails = {"aiko@kotoba.app", "mateo@kotoba.app", "sofia@kotoba.app"};
    String[][] data = {
      {"Aiko Tanaka","ja","en","A2","Japan","Osaka native. I love ramen, film cameras and teaching Japanese.","travel,food,photography","#7a3b34","240","12"},
      {"Mateo Rivera","es","en","B1","Mexico","From Mexico City. Football, tacos and bad puns in two languages.","football,food,music","#3f6b4f","180","6"},
      {"Sofia Laurent","en","ja","A2","Canada","English teacher learning Japanese. Coffee first, grammar second.","books,coffee,anime","#4a4a4a","320","21"}
    };
    java.util.Map<String, Profile> profiles = new java.util.LinkedHashMap<>();
    for (int i = 0; i < emails.length; i++) {
      java.util.Map<String, Object> authUser = DB.table("users").where("email", emails[i]).first();
      if (authUser == null) continue;
      Object userId = authUser.get("id");
      Profile profile = Profile.query().where("user_id", userId).first();
      java.util.Map<String, Object> values = Support.mapOf("user_id", userId, "display_name", data[i][0],
          "native_lang", data[i][1], "learning_lang", data[i][2], "level", data[i][3], "country", data[i][4],
          "bio", data[i][5], "interests", data[i][6], "avatar_color", data[i][7],
          "xp", Integer.parseInt(data[i][8]), "streak", Integer.parseInt(data[i][9]),
          "best_streak", Integer.parseInt(data[i][9]), "last_active", java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString(),
          "onboarded", true);
      if (profile == null) profile = Profile.create(values); else profile.update(values);
      profiles.put(emails[i], profile);
    }
    if (profiles.isEmpty()) return response.json(Support.mapOf("seeded", false));
    String[][] posts = {
      {"aiko@kotoba.app","en","moment","Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!","","4"},
      {"mateo@kotoba.app","en","moment","Today I learned a new word: serendipity. It means finding something good by luck.","","7"},
      {"sofia@kotoba.app","ja","moment","きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。","It is raining today. I will read a book while drinking coffee.","5"},
      {"mateo@kotoba.app","es","question","Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.","Question for you all: what is your favorite food? Mine are the tacos al pastor.","3"},
      {"aiko@kotoba.app","ja","moment","こんにちは！わたしは アイコです。にほんの おおさかから きました。","Hello! I am Aiko. I came from Osaka, Japan.","9"}
    };
    java.util.List<Post> seededPosts = new java.util.ArrayList<>();
    for (String[] row : posts) {
      Profile owner = profiles.get(row[0]);
      if (owner == null) { seededPosts.add(null); continue; }
      seededPosts.add(Post.create(Support.mapOf("user_id", owner.get("user_id"), "author_name", owner.get("display_name"),
          "author_color", owner.get("avatar_color"), "author_native", owner.get("native_lang"), "lang", row[1],
          "kind", row[2], "body", row[3], "translation", row[4].isEmpty() ? null : row[4],
          "likes_count", Integer.parseInt(row[5]))));
    }
    Profile sofia = profiles.get("sofia@kotoba.app");
    Post firstPost = seededPosts.get(0);
    if (firstPost != null && sofia != null) {
      Comment.create(Support.mapOf("post_id", firstPost.id(), "user_id", sofia.get("user_id"),
          "author_name", sofia.get("display_name"), "author_color", sofia.get("avatar_color"),
          "body", "Nice story! A few small fixes:", "is_correction", true,
          "corrected", "Yesterday I went to the park with my friend. We ate ice cream and it was delicious!",
          "explanation", "Use the past tense: go becomes went and eat becomes ate. Also, delicious already means very tasty, so you do not need very."));
      firstPost.update(Support.mapOf("comments_count", 1, "corrections_count", 1));
    }
    Post japanesePost = seededPosts.get(2);
    Profile aiko = profiles.get("aiko@kotoba.app");
    if (japanesePost != null && aiko != null) {
      Comment.create(Support.mapOf("post_id", japanesePost.id(), "user_id", aiko.get("user_id"),
          "author_name", aiko.get("display_name"), "author_color", aiko.get("avatar_color"),
          "body", "すてきですね！Very cozy. Your sentence is perfect.", "is_correction", false));
      japanesePost.update(Support.mapOf("comments_count", 1));
    }
    if (aiko != null && sofia != null) {
      Follow.create(Support.mapOf("follower_id", aiko.get("user_id"), "following_id", sofia.get("user_id")));
      Follow.create(Support.mapOf("follower_id", sofia.get("user_id"), "following_id", aiko.get("user_id")));
    }
    String[][] circles = {
      {"English Morning Club","sun","en","A2","Short daily check-ins in English. Be kind and correct gently.","sofia@kotoba.app"},
      {"Japanese for Beginners","flower","ja","A1","Hiragana, greetings and first sentences. Ask anything.","aiko@kotoba.app"},
      {"Spanish Cafe Talk","coffee","es","A2","Relaxed conversation practice over virtual coffee.","mateo@kotoba.app"}
    };
    for (String[] row : circles) {
      Profile owner = profiles.get(row[5]);
      if (owner == null) continue;
      Circle circle = Circle.create(Support.mapOf("name", row[0], "emoji", row[1], "lang", row[2], "level", row[3],
          "description", row[4], "owner_id", owner.get("user_id"), "members_count", 1));
      CircleMember.create(Support.mapOf("circle_id", circle.id(), "user_id", owner.get("user_id")));
      Message.create(Support.mapOf("circle_id", circle.id(), "sender_id", owner.get("user_id"),
          "sender_name", owner.get("display_name"), "sender_color", owner.get("avatar_color"),
          "body", "Welcome to " + row[0] + "! Introduce yourself in your target language.", "lang", row[2]));
    }
    return response.json(Support.mapOf("seeded", true));
  }
  public static Object feed(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    QueryBuilder<Post> query = Post.query().orderBy("id", "desc");
    if (request.filled("lang")) query = query.where("lang", request.input("lang"));
    Object scope = request.input("scope", "all");
    if ("following".equals(scope)) {
      java.util.List<Object> ids = Follow.query().where("follower_id", user.get("id")).pluck("following_id");
      ids.add(user.get("id"));
      query = query.whereIn("user_id", ids);
    } else if ("mine".equals(scope)) query = query.where("user_id", user.get("id"));
    else if ("help".equals(scope)) query = query.where("lang", profile.get("native_lang")).where("user_id", "!=", user.get("id")).where("corrections_count", 0);
    if (request.filled("mission_id")) query = query.where("mission_id", request.input("mission_id"));
    java.util.List<Post> posts = query.limit(40).get();
    java.util.List<Object> ids = new java.util.ArrayList<>();
    for (Post post : posts) ids.add(post.id());
    java.util.List<Object> liked = ids.isEmpty() ? java.util.List.of()
        : Like.query().where("user_id", user.get("id")).whereIn("post_id", ids).pluck("post_id");
    java.util.List<java.util.Map<String, Object>> rows = new java.util.ArrayList<>();
    for (Post post : posts) {
      java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) post.toJson());
      boolean isLiked = false;
      for (Object id : liked) if (String.valueOf(id).equals(String.valueOf(post.id()))) isLiked = true;
      row.put("liked", isLiked);
      rows.add(row);
    }
    return response.json(Support.mapOf("data", rows));
  }
  public static Object create_post(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf(
        "body", "required|string|max:1500", "lang", "required|string|max:8",
        "kind", "sometimes|string|in:moment,question,mission", "mission_id", "sometimes|nullable|integer",
        "translation", "sometimes|nullable|string|max:1500"));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    String kind = String.valueOf(data.getOrDefault("kind", "moment"));
    Post post = Post.create(Support.mapOf("user_id", user.get("id"), "author_name", profile.get("display_name"),
        "author_color", profile.get("avatar_color"), "author_native", profile.get("native_lang"),
        "lang", data.get("lang"), "kind", kind, "mission_id", data.get("mission_id"),
        "body", data.get("body"), "translation", data.get("translation")));
    int words = Math.max(1, String.valueOf(data.get("body")).trim().split("\\s+").length);
    int earned = "mission".equals(kind) ? 20 : 10;
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + earned);
    profile.set("words_written", Support.toInt(profile.get("words_written"), 0) + words);
    profile.save();
    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) post.toJson());
    row.put("liked", false);
    return response.json(Support.mapOf("data", row), 201);
  }
  public static Object delete_post(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Post post = Post.query().where("id", request.route("id")).where("user_id", user.get("id")).firstOrFail();
    post.delete();
    return response.json(Support.mapOf("message", "Post deleted"));
  }
  public static Object toggle_like(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Post post = Post.findOrFail(request.route("id"));
    Like existing = Like.query().where("post_id", post.id()).where("user_id", user.get("id")).first();
    boolean liked;
    if (existing != null) {
      existing.delete();
      post.update(Support.mapOf("likes_count", Math.max(0, Support.toInt(post.get("likes_count"), 0) - 1)));
      liked = false;
    } else {
      Like.create(Support.mapOf("post_id", post.id(), "user_id", user.get("id")));
      post.update(Support.mapOf("likes_count", Support.toInt(post.get("likes_count"), 0) + 1));
      liked = true;
      if (!String.valueOf(post.get("user_id")).equals(String.valueOf(user.get("id")))) {
        Profile profile = Profile.query().where("user_id", user.get("id")).first();
        String name = profile == null ? String.valueOf(user.get("name")) : String.valueOf(profile.get("display_name"));
        String text = name + " liked your post";
        Alert.create(Support.mapOf("user_id", post.get("user_id"), "kind", "like", "text", text,
            "ref", post.id(), "is_read", false));
        Broadcast.broadcastTo("private-kotoba." + post.get("user_id"), "kotoba.alert-created",
            Support.mapOf("kind", "like", "text", text, "ref", post.id()), null);
      }
    }
    return response.json(Support.mapOf("liked", liked, "likes_count", post.get("likes_count")));
  }
  public static Object list_comments(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    return response.json(Support.mapOf("data", Comment.query().where("post_id", request.route("id")).orderBy("id").get()));
  }
  public static Object add_comment(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf(
        "body", "required|string|max:1000", "is_correction", "sometimes|boolean",
        "corrected", "sometimes|nullable|string|max:1500", "explanation", "sometimes|nullable|string|max:1000"));
    Post post = Post.findOrFail(request.route("id"));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    boolean correction = Boolean.TRUE.equals(data.get("is_correction")) && data.get("corrected") != null && !String.valueOf(data.get("corrected")).isEmpty();
    Comment comment = Comment.create(Support.mapOf("post_id", post.id(), "user_id", user.get("id"),
        "author_name", profile.get("display_name"), "author_color", profile.get("avatar_color"), "body", data.get("body"),
        "is_correction", correction, "corrected", correction ? data.get("corrected") : null,
        "explanation", correction ? data.get("explanation") : null));
    post.update(Support.mapOf("comments_count", Support.toInt(post.get("comments_count"), 0) + 1,
        "corrections_count", Support.toInt(post.get("corrections_count"), 0) + (correction ? 1 : 0)));
    String notice = String.valueOf(profile.get("display_name")) + (correction ? " corrected your post" : " commented on your post");
    Alert.create(Support.mapOf("user_id", post.get("user_id"), "kind", correction ? "correction" : "comment",
        "text", notice, "ref", post.id(), "is_read", false));
    Broadcast.broadcastTo("private-kotoba." + post.get("user_id"), "kotoba.alert-created",
        Support.mapOf("kind", correction ? "correction" : "comment", "text", notice, "ref", post.id()), null);
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + (correction ? 15 : 5));
    profile.save();
    return response.json(Support.mapOf("data", comment), 201);
  }
  public static Object accept_correction(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Comment comment = Comment.findOrFail(request.route("id"));
    Post post = Post.findOrFail(comment.get("post_id"));
    if (!String.valueOf(post.get("user_id")).equals(String.valueOf(user.get("id"))))
      return response.json(Support.mapOf("message", "Only the author can accept a correction"), 403);
    comment.update(Support.mapOf("accepted", true));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    String name = profile == null ? String.valueOf(user.get("name")) : String.valueOf(profile.get("display_name"));
    String text = name + " accepted your correction. Thank you!";
    Alert.create(Support.mapOf("user_id", comment.get("user_id"), "kind", "accepted", "text", text,
        "ref", post.id(), "is_read", false));
    Broadcast.broadcastTo("private-kotoba." + comment.get("user_id"), "kotoba.alert-created",
        Support.mapOf("kind", "accepted", "text", text, "ref", post.id()), null);
    return response.json(Support.mapOf("data", comment));
  }
  public static Object list_lessons(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    Object lang = request.input("lang", profile.get("learning_lang"));
    java.util.List<Lesson> lessons = Lesson.query().where("lang", lang).orderBy("position").get();
    java.util.List<LessonResult> results = LessonResult.query().where("user_id", user.get("id")).get();
    java.util.Map<String, LessonResult> byLesson = new java.util.HashMap<>();
    for (LessonResult result : results) byLesson.put(String.valueOf(result.get("lesson_id")), result);
    java.util.List<java.util.Map<String, Object>> rows = new java.util.ArrayList<>();
    for (Lesson lesson : lessons) {
      LessonResult result = byLesson.get(String.valueOf(lesson.id()));
      java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) lesson.toJson());
      row.put("done", result != null);
      row.put("best", result == null ? 0 : Support.toInt(result.get("best"), 0));
      rows.add(row);
    }
    return response.json(Support.mapOf("data", rows, "lang", lang));
  }
  public static Object complete_lesson(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf("score", "required|integer|min:0|max:100"));
    Lesson lesson = Lesson.findOrFail(request.route("id"));
    LessonResult result = LessonResult.query().where("user_id", user.get("id")).where("lesson_id", lesson.id()).first();
    boolean first = result == null;
    int score = Support.toInt(data.get("score"), 0);
    if (first) result = LessonResult.create(Support.mapOf("user_id", user.get("id"), "lesson_id", lesson.id(), "score", score, "best", score));
    else result.update(Support.mapOf("score", score, "best", Math.max(Support.toInt(result.get("best"), 0), score)));
    int xp = first ? (int) Math.round(Support.toInt(lesson.get("xp"), 0) * Math.max(0.4, score / 100.0)) : 5;
    Object contentValue = lesson.get("content");
    java.util.Map<String, Object> content = contentValue instanceof java.util.Map
        ? (java.util.Map<String, Object>) contentValue : contentValue == null ? java.util.Map.of() : Json.parseObject(String.valueOf(contentValue));
    int added = 0;
    Object rawVocab = content.get("v");
    if (rawVocab instanceof Iterable<?> vocab) for (Object rawPair : vocab) {
      if (!(rawPair instanceof java.util.List<?> pair) || pair.size() < 2) continue;
      Object term = pair.get(0);
      if (VocabCard.query().where("user_id", user.get("id")).where("lang", lesson.get("lang")).where("term", term).first() != null) continue;
      VocabCard.create(Support.mapOf("user_id", user.get("id"), "lang", lesson.get("lang"), "term", term,
          "meaning", pair.get(1), "source", "lesson", "due_date", java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString()));
      added++;
    }
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + xp);
    profile.save();
    return response.json(Support.mapOf("xp", xp, "cards_added", added, "first", first));
  }
  public static Object list_cards(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    String today = java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString();
    QueryBuilder<VocabCard> base = VocabCard.query().where("user_id", user.get("id"));
    if (request.filled("lang")) base = base.where("lang", request.input("lang"));
    long total = base.count();
    long dueCount = base.where(q -> q.whereNull("due_date").orWhere("due_date", "<=", today)).count();
    QueryBuilder<VocabCard> query = VocabCard.query().where("user_id", user.get("id"));
    if (request.filled("lang")) query = query.where("lang", request.input("lang"));
    if ("1".equals(String.valueOf(request.input("due", "0"))))
      query = query.where(q -> q.whereNull("due_date").orWhere("due_date", "<=", today));
    if (request.filled("q")) {
      String term = "%" + request.input("q") + "%";
      query = query.where(q -> q.where("term", "like", term).orWhere("meaning", "like", term));
    }
    java.util.List<VocabCard> cards = query.orderBy("due_date").orderBy("id").limit(200).get();
    return response.json(Support.mapOf("data", cards, "total", total, "due_count", dueCount));
  }
  public static Object add_card(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf(
        "term", "required|string|max:255", "meaning", "required|string|max:255", "lang", "required|string|max:8",
        "example", "sometimes|nullable|string|max:500", "source", "sometimes|string|max:16"));
    VocabCard card = VocabCard.query().where("user_id", user.get("id")).where("lang", data.get("lang")).where("term", data.get("term")).first();
    boolean created = card == null;
    if (created) card = VocabCard.create(Support.mapOf("user_id", user.get("id"), "lang", data.get("lang"),
        "term", data.get("term"), "meaning", data.get("meaning"), "example", data.get("example"),
        "source", data.getOrDefault("source", "manual"), "due_date", java.time.LocalDate.now(java.time.ZoneOffset.UTC).toString()));
    return response.json(Support.mapOf("data", card, "created", created), created ? 201 : 200);
  }
  public static Object review_card(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    VocabCard card = VocabCard.query().where("id", request.route("id")).where("user_id", user.get("id")).firstOrFail();
    int grade = Math.max(0, Math.min(3, Support.toInt(request.input("grade", 2), 0)));
    int repetitions = Support.toInt(card.get("reps"), 0);
    int interval = Support.toInt(card.get("interval_days"), 0);
    double ease = card.get("ease") == null ? 2.5 : Double.parseDouble(String.valueOf(card.get("ease")));
    int lapses = Support.toInt(card.get("lapses"), 0);
    if (grade == 0) { lapses++; repetitions = 0; ease = Math.max(1.3, ease - 0.2); interval = 0; }
    else {
      repetitions++;
      if (repetitions == 1) interval = grade == 3 ? 3 : 1;
      else if (repetitions == 2) interval = grade == 1 ? 2 : grade == 3 ? 7 : 4;
      else interval = Math.max(1, (int) Math.round(interval * (grade == 1 ? 1.2 : grade == 3 ? ease * 1.3 : ease)));
      if (grade == 1) ease = Math.max(1.3, ease - 0.15);
      if (grade == 3) ease += 0.15;
    }
    String due = java.time.LocalDate.now(java.time.ZoneOffset.UTC).plusDays(interval).toString();
    card.update(Support.mapOf("lapses", lapses, "reps", repetitions, "ease", ease, "interval_days", interval, "due_date", due));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + 2);
    profile.save();
    return response.json(Support.mapOf("data", card));
  }
  public static Object delete_card(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    VocabCard.query().where("id", request.route("id")).where("user_id", user.get("id")).delete();
    return response.json(Support.mapOf("message", "Card deleted"));
  }
  public static Object partners(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Profile me = Profile.query().where("user_id", user.get("id")).first();
    if (me == null) me = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    java.util.List<Object> following = Follow.query().where("follower_id", user.get("id")).pluck("following_id");
    QueryBuilder<Profile> query = Profile.query().where("user_id", "!=", user.get("id"));
    if ("exchange".equals(request.input("mode"))) query = query.where("native_lang", me.get("learning_lang"));
    if (request.filled("lang")) query = query.where("native_lang", request.input("lang"));
    if (request.filled("q")) {
      String term = "%" + request.input("q") + "%";
      query = query.where(q -> q.where("display_name", "like", term).orWhere("interests", "like", term).orWhere("country", "like", term));
    }
    java.util.Map<String, Integer> levels = java.util.Map.of("A1",1,"A2",2,"B1",3,"B2",4,"C1",5,"C2",6);
    java.util.List<String> mine = new java.util.ArrayList<>();
    String mineText = String.valueOf(me.get("interests", ""));
    for (String value : mineText.toLowerCase().split(",")) if (!value.trim().isEmpty()) mine.add(value.trim());
    java.util.List<java.util.Map<String, Object>> data = new java.util.ArrayList<>();
    for (Profile candidate : query.limit(60).get()) {
      int score = String.valueOf(candidate.get("native_lang")).equals(String.valueOf(me.get("learning_lang"))) ? 50 : 0;
      if (String.valueOf(candidate.get("learning_lang")).equals(String.valueOf(me.get("native_lang")))) score += 30;
      java.util.List<String> shared = new java.util.ArrayList<>();
      String interests = String.valueOf(candidate.get("interests", ""));
      for (String value : interests.toLowerCase().split(",")) if (!value.trim().isEmpty() && mine.contains(value.trim())) shared.add(value.trim());
      score += Math.min(20, shared.size() * 7);
      score += Math.max(0, 5 - Math.abs(levels.getOrDefault(String.valueOf(candidate.get("level")), 1) - levels.getOrDefault(String.valueOf(me.get("level")), 1)));
      java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) candidate.toJson());
      row.put("score", Math.min(100, score)); row.put("shared", shared);
      boolean isFollowing = false;
      for (Object id : following) if (String.valueOf(id).equals(String.valueOf(candidate.get("user_id")))) isFollowing = true;
      row.put("following", isFollowing); data.add(row);
    }
    data.sort((a, b) -> Integer.compare(Support.toInt(b.get("score"), 0), Support.toInt(a.get("score"), 0)));
    return response.json(Support.mapOf("data", data));
  }
  public static Object view_profile(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", request.route("id")).firstOrFail();
    java.util.List<Post> posts = Post.query().where("user_id", profile.get("user_id")).orderBy("id", "desc").limit(5).get();
    return response.json(Support.mapOf("data", profile, "posts", posts,
        "followers", Follow.query().where("following_id", profile.get("user_id")).count(),
        "following_count", Follow.query().where("follower_id", profile.get("user_id")).count(),
        "following", Follow.query().where("follower_id", user.get("id")).where("following_id", profile.get("user_id")).exists(),
        "post_count", Post.query().where("user_id", profile.get("user_id")).count()));
  }
  public static Object toggle_follow(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Object target = request.route("id");
    if (String.valueOf(target).equals(String.valueOf(user.get("id"))))
      return response.json(Support.mapOf("message", "You cannot follow yourself"), 422);
    Follow existing = Follow.query().where("follower_id", user.get("id")).where("following_id", target).first();
    if (existing != null) { existing.delete(); return response.json(Support.mapOf("following", false)); }
    Follow.create(Support.mapOf("follower_id", user.get("id"), "following_id", target));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    String name = profile == null ? String.valueOf(user.get("name")) : String.valueOf(profile.get("display_name"));
    String text = name + " started following you";
    Alert.create(Support.mapOf("user_id", target, "kind", "follow", "text", text, "ref", user.get("id"), "is_read", false));
    Broadcast.broadcastTo("private-kotoba." + target, "kotoba.alert-created", Support.mapOf("kind", "follow", "text", text, "ref", user.get("id")), null);
    return response.json(Support.mapOf("following", true));
  }
  public static Object list_conversations(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.List<Conversation> conversations = Conversation.query().where(q -> q.where("user_a", user.get("id")).orWhere("user_b", user.get("id")))
        .orderBy("last_at", "desc").orderBy("id", "desc").get();
    java.util.List<Object> ids = new java.util.ArrayList<>();
    for (Conversation conversation : conversations)
      ids.add(String.valueOf(conversation.get("user_a")).equals(String.valueOf(user.get("id"))) ? conversation.get("user_b") : conversation.get("user_a"));
    java.util.List<Profile> profiles = ids.isEmpty() ? java.util.List.of() : Profile.query().whereIn("user_id", ids).get();
    java.util.Map<String, Profile> profileById = new java.util.HashMap<>();
    for (Profile profile : profiles) profileById.put(String.valueOf(profile.get("user_id")), profile);
    java.util.List<java.util.Map<String, Object>> data = new java.util.ArrayList<>();
    for (Conversation conversation : conversations) {
      Object other = String.valueOf(conversation.get("user_a")).equals(String.valueOf(user.get("id"))) ? conversation.get("user_b") : conversation.get("user_a");
      Profile profile = profileById.get(String.valueOf(other));
      data.add(Support.mapOf("id", conversation.id(), "last_message", conversation.get("last_message"), "last_at", conversation.get("last_at"),
          "with", profile == null ? Support.mapOf("user_id", other, "display_name", "Member", "avatar_color", "#6b655b") : profile));
    }
    return response.json(Support.mapOf("data", data));
  }
  public static Object start_conversation(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf("user_id", "required|integer"));
    long otherId = Support.toLong(data.get("user_id"), 0);
    if (otherId == Support.toLong(user.get("id"), 0)) return response.json(Support.mapOf("message", "Pick someone else to talk to"), 422);
    Profile profile = Profile.query().where("user_id", otherId).firstOrFail();
    long userId = Support.toLong(user.get("id"), 0);
    Conversation conversation = Conversation.query().where("user_a", Math.min(userId, otherId)).where("user_b", Math.max(userId, otherId)).first();
    if (conversation == null) conversation = Conversation.create(Support.mapOf("user_a", Math.min(userId, otherId), "user_b", Math.max(userId, otherId)));
    return response.json(Support.mapOf("data", Support.mapOf("id", conversation.id(), "last_message", conversation.get("last_message"),
        "last_at", conversation.get("last_at"), "with", profile)));
  }
  public static Object list_messages(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    QueryBuilder<Message> query = Message.query();
    if (request.filled("conversation_id")) {
      Conversation conversation = Conversation.findOrFail(request.input("conversation_id"));
      if (!String.valueOf(conversation.get("user_a")).equals(String.valueOf(user.get("id"))) && !String.valueOf(conversation.get("user_b")).equals(String.valueOf(user.get("id"))))
        return response.json(Support.mapOf("message", "Not your conversation"), 403);
      query = query.where("conversation_id", conversation.id());
    } else if (request.filled("circle_id")) {
      Object circleId = request.input("circle_id");
      if (!CircleMember.query().where("circle_id", circleId).where("user_id", user.get("id")).exists())
        return response.json(Support.mapOf("message", "Join this circle first"), 403);
      query = query.where("circle_id", circleId);
    } else return response.json(Support.mapOf("message", "conversation_id or circle_id required"), 422);
    if (request.filled("after_id")) query = query.where("id", ">", request.input("after_id"));
    java.util.List<Message> messages = query.orderBy("id", "desc").limit(100).get();
    java.util.Collections.reverse(messages);
    return response.json(Support.mapOf("data", messages));
  }
  public static Object send_message(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf(
        "body", "required|string|max:2000", "lang", "sometimes|nullable|string|max:8",
        "conversation_id", "sometimes|nullable|integer", "circle_id", "sometimes|nullable|integer"));
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    Object conversationId = null, circleId = null;
    java.util.List<Object> participants = new java.util.ArrayList<>();
    Conversation conversation = null;
    if (data.get("conversation_id") != null) {
      conversation = Conversation.findOrFail(data.get("conversation_id"));
      if (!String.valueOf(conversation.get("user_a")).equals(String.valueOf(user.get("id"))) && !String.valueOf(conversation.get("user_b")).equals(String.valueOf(user.get("id"))))
        return response.json(Support.mapOf("message", "Not your conversation"), 403);
      conversationId = conversation.id();
      participants.add(conversation.get("user_a")); participants.add(conversation.get("user_b"));
      conversation.update(Support.mapOf("last_message", String.valueOf(data.get("body")).substring(0, Math.min(200, String.valueOf(data.get("body")).length())),
          "last_at", java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC).toString()));
    } else if (data.get("circle_id") != null) {
      circleId = data.get("circle_id");
      if (!CircleMember.query().where("circle_id", circleId).where("user_id", user.get("id")).exists())
        return response.json(Support.mapOf("message", "Join this circle first"), 403);
      participants = CircleMember.query().where("circle_id", circleId).pluck("user_id");
    } else return response.json(Support.mapOf("message", "conversation_id or circle_id required"), 422);
    Message message = Message.create(Support.mapOf("conversation_id", conversationId, "circle_id", circleId,
        "sender_id", user.get("id"), "sender_name", profile.get("display_name"), "sender_color", profile.get("avatar_color"),
        "body", data.get("body"), "lang", data.get("lang")));
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) message.toJson());
    payload.put("scope", circleId == null ? "dm" : "circle");
    for (Object recipient : participants) if (!String.valueOf(recipient).equals(String.valueOf(user.get("id"))))
      Broadcast.broadcastTo("private-kotoba." + recipient, "kotoba.message-created", payload, null);
    int words = Math.max(1, String.valueOf(data.get("body")).trim().split("\\s+").length);
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + 3);
    profile.set("words_written", Support.toInt(profile.get("words_written"), 0) + words);
    profile.set("messages_sent", Support.toInt(profile.get("messages_sent"), 0) + 1);
    profile.save();
    return response.json(Support.mapOf("data", payload), 201);
  }
  public static Object correct_message(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf("corrected", "required|string|max:2000", "note", "sometimes|nullable|string|max:500"));
    Message message = Message.findOrFail(request.route("id"));
    if (String.valueOf(message.get("sender_id")).equals(String.valueOf(user.get("id"))))
      return response.json(Support.mapOf("message", "You cannot correct your own message"), 422);
    java.util.List<Object> participants = new java.util.ArrayList<>();
    if (message.get("conversation_id") != null) {
      Conversation conversation = Conversation.find(message.get("conversation_id"));
      if (conversation != null) { participants.add(conversation.get("user_a")); participants.add(conversation.get("user_b")); }
    } else if (message.get("circle_id") != null)
      participants = CircleMember.query().where("circle_id", message.get("circle_id")).pluck("user_id");
    boolean member = false;
    for (Object participant : participants) if (String.valueOf(participant).equals(String.valueOf(user.get("id")))) member = true;
    if (!member) return response.json(Support.mapOf("message", "Not allowed"), 403);
    message.update(Support.mapOf("corrected", data.get("corrected"), "note", data.get("note"), "corrected_by", user.get("id")));
    java.util.Map<String, Object> payload = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) message.toJson());
    payload.put("scope", message.get("circle_id") == null ? "dm" : "circle"); payload.put("updated", true);
    for (Object recipient : participants) if (!String.valueOf(recipient).equals(String.valueOf(user.get("id"))))
      Broadcast.broadcastTo("private-kotoba." + recipient, "kotoba.message-created", payload, null);
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    String name = profile == null ? String.valueOf(user.get("name")) : String.valueOf(profile.get("display_name"));
    String text = name + " suggested a correction in chat";
    Alert.create(Support.mapOf("user_id", message.get("sender_id"), "kind", "correction", "text", text, "ref", message.id(), "is_read", false));
    Broadcast.broadcastTo("private-kotoba." + message.get("sender_id"), "kotoba.alert-created",
        Support.mapOf("kind", "correction", "text", text, "ref", message.id()), null);
    profile = profile == null ? Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name"))) : profile;
    java.time.LocalDate activityDate = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    String activityDay = activityDate.toString();
    Object lastActivity = profile.get("last_active");
    String lastDay = lastActivity == null ? null : String.valueOf(lastActivity).substring(0, Math.min(10, String.valueOf(lastActivity).length()));
    if (!activityDay.equals(lastDay)) {
      profile.set("streak", activityDate.minusDays(1).toString().equals(lastDay) ? Support.toInt(profile.get("streak"), 0) + 1 : 1);
      profile.set("last_active", activityDay);
    }
    profile.set("best_streak", Math.max(Support.toInt(profile.get("best_streak"), 0), Support.toInt(profile.get("streak"), 0)));
    profile.set("xp", Support.toInt(profile.get("xp"), 0) + 10); profile.save();
    return response.json(Support.mapOf("data", payload));
  }
  public static Object list_circles(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.List<Object> mine = CircleMember.query().where("user_id", user.get("id")).pluck("circle_id");
    QueryBuilder<Circle> query = Circle.query().orderBy("members_count", "desc").orderBy("id", "desc").limit(60);
    if (request.filled("lang")) query = query.where("lang", request.input("lang"));
    java.util.List<java.util.Map<String, Object>> rows = new java.util.ArrayList<>();
    for (Circle circle : query.get()) {
      java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) circle.toJson());
      boolean joined = false;
      for (Object id : mine) if (String.valueOf(id).equals(String.valueOf(circle.id()))) joined = true;
      row.put("joined", joined); rows.add(row);
    }
    return response.json(Support.mapOf("data", rows));
  }
  public static Object create_circle(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    java.util.Map<String, Object> data = request.validate(Support.mapOf(
        "name", "required|string|max:80", "emoji", "sometimes|nullable|string|max:24", "lang", "required|string|max:8",
        "level", "sometimes|string|in:A1,A2,B1,B2,C1,C2", "description", "sometimes|nullable|string|max:400"));
    Circle circle = Circle.create(Support.mapOf("name", data.get("name"), "emoji", data.getOrDefault("emoji", "message-circle"),
        "lang", data.get("lang"), "level", data.getOrDefault("level", "A1"), "description", data.get("description"),
        "owner_id", user.get("id"), "members_count", 1));
    CircleMember.create(Support.mapOf("circle_id", circle.id(), "user_id", user.get("id")));
    java.util.Map<String, Object> row = new java.util.LinkedHashMap<>((java.util.Map<String, Object>) circle.toJson());
    row.put("joined", true);
    return response.json(Support.mapOf("data", row), 201);
  }
  public static Object toggle_join(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Circle circle = Circle.findOrFail(request.route("id"));
    CircleMember existing = CircleMember.query().where("circle_id", circle.id()).where("user_id", user.get("id")).first();
    if (existing != null) {
      if (String.valueOf(circle.get("owner_id")).equals(String.valueOf(user.get("id"))))
        return response.json(Support.mapOf("message", "Owners cannot leave their own circle"), 422);
      existing.delete();
      circle.update(Support.mapOf("members_count", Math.max(1, Support.toInt(circle.get("members_count"), 1) - 1)));
      return response.json(Support.mapOf("joined", false, "members_count", circle.get("members_count")));
    }
    CircleMember.create(Support.mapOf("circle_id", circle.id(), "user_id", user.get("id")));
    circle.update(Support.mapOf("members_count", Support.toInt(circle.get("members_count"), 0) + 1));
    return response.json(Support.mapOf("joined", true, "members_count", circle.get("members_count")));
  }
  public static Object list_alerts(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    return response.json(Support.mapOf("data", Alert.query().where("user_id", user.get("id")).orderBy("id", "desc").limit(50).get(),
        "unread", Alert.query().where("user_id", user.get("id")).where("is_read", false).count()));
  }
  public static Object read_alerts(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Alert.query().where("user_id", user.get("id")).where("is_read", false).update(Support.mapOf("is_read", true));
    return response.json(Support.mapOf("ok", true));
  }
  public static Object progress(Request request, Response response) throws Exception {
    List<Object> params = new ArrayList<>(request.route().values());
    Model user = request.user();
    Profile profile = Profile.query().where("user_id", user.get("id")).first();
    if (profile == null) profile = Profile.create(Support.mapOf("user_id", user.get("id"), "display_name", user.get("name")));
    java.time.LocalDate today = java.time.LocalDate.now(java.time.ZoneOffset.UTC);
    java.time.LocalDate firstDay = today.minusDays(13);
    java.util.Map<String, Integer> days = new java.util.LinkedHashMap<>();
    for (int i = 0; i < 14; i++) days.put(firstDay.plusDays(i).toString(), 0);
    String since = firstDay + " 00:00:00";
    for (Post row : Post.query().where("user_id", user.get("id")).where("created_at", ">=", since).get()) {
      String date = String.valueOf(row.get("created_at")).substring(0, 10);
      if (days.containsKey(date)) days.put(date, days.get(date) + 1);
    }
    for (Message row : Message.query().where("sender_id", user.get("id")).where("created_at", ">=", since).get()) {
      String date = String.valueOf(row.get("created_at")).substring(0, 10);
      if (days.containsKey(date)) days.put(date, days.get(date) + 1);
    }
    for (LessonResult row : LessonResult.query().where("user_id", user.get("id")).where("updated_at", ">=", since).get()) {
      String date = String.valueOf(row.get("updated_at")).substring(0, 10);
      if (days.containsKey(date)) days.put(date, days.get(date) + 1);
    }
    java.util.List<java.util.Map<String, Object>> series = new java.util.ArrayList<>();
    for (java.util.Map.Entry<String, Integer> entry : days.entrySet()) series.add(Support.mapOf("date", entry.getKey(), "count", entry.getValue()));
    java.util.List<Object> postIds = Post.query().where("user_id", user.get("id")).pluck("id");
    java.util.Map<String, Object> stats = Support.mapOf(
        "cards", VocabCard.query().where("user_id", user.get("id")).count(),
        "mastered", VocabCard.query().where("user_id", user.get("id")).where("reps", ">=", 4).count(),
        "lessons", LessonResult.query().where("user_id", user.get("id")).count(), "posts", postIds.size(),
        "corrections_given", Comment.query().where("user_id", user.get("id")).where("is_correction", true).count(),
        "corrections_received", Comment.query().where("is_correction", true).whereIn("post_id", postIds).count(),
        "corrections_accepted", Comment.query().where("is_correction", true).where("accepted", true).whereIn("post_id", postIds).count(),
        "words_written", profile.get("words_written"), "messages_sent", profile.get("messages_sent"));
    int xp = Support.toInt(profile.get("xp"), 0);
    return response.json(Support.mapOf("profile", profile, "series", series, "stats", stats,
        "level", (int) Math.floor(xp / 100.0) + 1, "level_progress", xp % 100));
  }
  private static Notification notificationFor(String name) {
    return switch (name) {
      default -> null;
    };
  }
  private static Map<String, Object> objectMap(Object value) {
    Map<String, Object> out = new LinkedHashMap<>();
    if (value instanceof Map<?, ?> values) values.forEach((key, item) -> out.put(String.valueOf(key), item));
    return out;
  }
}
