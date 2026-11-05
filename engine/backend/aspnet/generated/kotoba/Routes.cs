namespace Pluff.AspNet.Generated.Kotoba;

public sealed record RouteDefinition(int ApiIndex, string Name, string Method, string Pattern, string Controller);

public static class Routes
{
    public static readonly RouteDefinition[] All =
    {
        new(0, "status", "GET", "/api/kotoba/x/profiles/status", "ProfileController"),
        new(1, "status", "GET", "/api/kotoba/x/posts/status", "PostController"),
        new(2, "status", "GET", "/api/kotoba/x/comments/status", "CommentController"),
        new(3, "status", "GET", "/api/kotoba/x/likes/status", "LikeController"),
        new(4, "status", "GET", "/api/kotoba/x/follows/status", "FollowController"),
        new(5, "status", "GET", "/api/kotoba/x/missions/status", "MissionController"),
        new(6, "status", "GET", "/api/kotoba/x/lessons/status", "LessonController"),
        new(7, "status", "GET", "/api/kotoba/x/lesson-results/status", "LessonResultController"),
        new(8, "status", "GET", "/api/kotoba/x/vocab-cards/status", "VocabCardController"),
        new(9, "status", "GET", "/api/kotoba/x/conversations/status", "ConversationController"),
        new(10, "status", "GET", "/api/kotoba/x/messages/status", "MessageController"),
        new(11, "status", "GET", "/api/kotoba/x/circles/status", "CircleController"),
        new(12, "status", "GET", "/api/kotoba/x/circle-members/status", "CircleMemberController"),
        new(13, "status", "GET", "/api/kotoba/x/alerts/status", "AlertController"),
    };
}
