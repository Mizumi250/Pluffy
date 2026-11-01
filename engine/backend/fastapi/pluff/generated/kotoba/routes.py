# ARKZEN GENERATED ROUTES: kotoba
from pluff.runtime import *
from .models import User, Profile, Post, Comment, Like, Follow, Mission, Lesson, LessonResult, VocabCard, Conversation, Message, Circle, CircleMember, Alert
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "kotoba"
    r = Router(S)

    def mw(name):
        if name == 'auth' or name.startswith('auth:'):
            return auth_middleware(S)
        if name.startswith('role:'):
            return role_middleware(*name[5:].split(','))
        fn = middleware_fns.get(name)
        if fn is None:
            raise Exception('Unknown middleware: ' + name)
        return middleware(S, fn)

    register_auth_routes(r, S, "/api/kotoba", {'kotoba.{id}': {'type': 'private', 'auth': 'owner'}})
    r.add("GET", "/api/kotoba/x/profiles/status", [mw("auth:sanctum")], handle(S, C.ProfileController.status))
    r.add("GET", "/api/kotoba/x/posts/status", [mw("auth:sanctum")], handle(S, C.PostController.status))
    r.add("GET", "/api/kotoba/x/comments/status", [mw("auth:sanctum")], handle(S, C.CommentController.status))
    r.add("GET", "/api/kotoba/x/likes/status", [mw("auth:sanctum")], handle(S, C.LikeController.status))
    r.add("GET", "/api/kotoba/x/follows/status", [mw("auth:sanctum")], handle(S, C.FollowController.status))
    r.add("GET", "/api/kotoba/x/missions/status", [mw("auth:sanctum")], handle(S, C.MissionController.status))
    r.add("GET", "/api/kotoba/x/lessons/status", [mw("auth:sanctum")], handle(S, C.LessonController.status))
    r.add("GET", "/api/kotoba/x/lesson-results/status", [mw("auth:sanctum")], handle(S, C.LessonResultController.status))
    r.add("GET", "/api/kotoba/x/vocab-cards/status", [mw("auth:sanctum")], handle(S, C.VocabCardController.status))
    r.add("GET", "/api/kotoba/x/conversations/status", [mw("auth:sanctum")], handle(S, C.ConversationController.status))
    r.add("GET", "/api/kotoba/x/messages/status", [mw("auth:sanctum")], handle(S, C.MessageController.status))
    r.add("GET", "/api/kotoba/x/circles/status", [mw("auth:sanctum")], handle(S, C.CircleController.status))
    r.add("GET", "/api/kotoba/x/circle-members/status", [mw("auth:sanctum")], handle(S, C.CircleMemberController.status))
    r.add("GET", "/api/kotoba/x/alerts/status", [mw("auth:sanctum")], handle(S, C.AlertController.status))
    r.add("GET", "/api/kotoba/me", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.me(rq, rs, *rq.route().values())))
    r.add("PUT", "/api/kotoba/me", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.update_me(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/home", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.home(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/activity", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.bump(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/internal/notify", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.notify(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/internal/seed", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.community_seed(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/feed", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.feed(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/posts", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.create_post(rq, rs, *rq.route().values())))
    r.add("DELETE", "/api/kotoba/posts/{id}", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.delete_post(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/posts/{id}/like", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.toggle_like(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/posts/{id}/comments", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_comments(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/posts/{id}/comments", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.add_comment(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/comments/{id}/accept", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.accept_correction(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/lessons", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_lessons(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/lessons/{id}/complete", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.complete_lesson(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/vocab", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_cards(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/vocab", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.add_card(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/vocab/{id}/review", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.review_card(rq, rs, *rq.route().values())))
    r.add("DELETE", "/api/kotoba/vocab/{id}", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.delete_card(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/partners", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.partners(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/profile/{id}", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.view_profile(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/follow/{id}", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.toggle_follow(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/conversations", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_conversations(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/conversations", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.start_conversation(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/messages", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_messages(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/messages", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.send_message(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/messages/{id}/correct", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.correct_message(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/circles", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_circles(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/circles", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.create_circle(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/circles/{id}/join", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.toggle_join(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/alerts", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.list_alerts(rq, rs, *rq.route().values())))
    r.add("POST", "/api/kotoba/alerts/read", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.read_alerts(rq, rs, *rq.route().values())))
    r.add("GET", "/api/kotoba/progress", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.KotobaController.progress(rq, rs, *rq.route().values())))
    return r
