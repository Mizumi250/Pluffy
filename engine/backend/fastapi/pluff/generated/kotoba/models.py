# ARKZEN GENERATED MODELS: kotoba (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("kotoba")


class Profile(Model):
    table = "kotoba_profiles"
    connection_name = "kotoba"
    fillable = ['user_id', 'display_name', 'bio', 'native_lang', 'learning_lang', 'level', 'country', 'interests', 'avatar_color', 'xp', 'streak', 'best_streak', 'last_active', 'daily_goal', 'words_written', 'messages_sent', 'onboarded']
    casts = {'id': 'integer', 'user_id': 'integer', 'xp': 'integer', 'streak': 'integer', 'best_streak': 'integer', 'last_active': 'date', 'daily_goal': 'integer', 'words_written': 'integer', 'messages_sent': 'integer', 'onboarded': 'boolean'}
    timestamps = True
    soft_deletes = False



class Post(Model):
    table = "kotoba_posts"
    connection_name = "kotoba"
    fillable = ['user_id', 'author_name', 'author_color', 'author_native', 'lang', 'kind', 'mission_id', 'body', 'translation', 'likes_count', 'comments_count', 'corrections_count']
    casts = {'id': 'integer', 'user_id': 'integer', 'mission_id': 'integer', 'likes_count': 'integer', 'comments_count': 'integer', 'corrections_count': 'integer'}
    timestamps = True
    soft_deletes = False



class Comment(Model):
    table = "kotoba_comments"
    connection_name = "kotoba"
    fillable = ['post_id', 'user_id', 'author_name', 'author_color', 'body', 'is_correction', 'corrected', 'explanation', 'accepted']
    casts = {'id': 'integer', 'post_id': 'integer', 'user_id': 'integer', 'is_correction': 'boolean', 'accepted': 'boolean'}
    timestamps = True
    soft_deletes = False



class Like(Model):
    table = "kotoba_likes"
    connection_name = "kotoba"
    fillable = ['post_id', 'user_id']
    casts = {'id': 'integer', 'post_id': 'integer', 'user_id': 'integer'}
    timestamps = True
    soft_deletes = False



class Follow(Model):
    table = "kotoba_follows"
    connection_name = "kotoba"
    fillable = ['follower_id', 'following_id']
    casts = {'id': 'integer', 'follower_id': 'integer', 'following_id': 'integer'}
    timestamps = True
    soft_deletes = False



class Mission(Model):
    table = "kotoba_missions"
    connection_name = "kotoba"
    fillable = ['lang', 'level', 'title', 'prompt', 'hint', 'position']
    casts = {'id': 'integer', 'position': 'integer'}
    timestamps = True
    soft_deletes = False



class Lesson(Model):
    table = "kotoba_lessons"
    connection_name = "kotoba"
    fillable = ['lang', 'unit', 'title', 'emoji', 'level', 'position', 'xp', 'content']
    casts = {'id': 'integer', 'position': 'integer', 'xp': 'integer'}
    timestamps = True
    soft_deletes = False



class LessonResult(Model):
    table = "kotoba_lesson_results"
    connection_name = "kotoba"
    fillable = ['user_id', 'lesson_id', 'score', 'best']
    casts = {'id': 'integer', 'user_id': 'integer', 'lesson_id': 'integer', 'score': 'integer', 'best': 'integer'}
    timestamps = True
    soft_deletes = False



class VocabCard(Model):
    table = "kotoba_vocab_cards"
    connection_name = "kotoba"
    fillable = ['user_id', 'lang', 'term', 'meaning', 'example', 'source', 'ease', 'interval_days', 'reps', 'lapses', 'due_date']
    casts = {'id': 'integer', 'user_id': 'integer', 'ease': 'float', 'interval_days': 'integer', 'reps': 'integer', 'lapses': 'integer', 'due_date': 'date'}
    timestamps = True
    soft_deletes = False



class Conversation(Model):
    table = "kotoba_conversations"
    connection_name = "kotoba"
    fillable = ['user_a', 'user_b', 'last_message', 'last_at']
    casts = {'id': 'integer', 'user_a': 'integer', 'user_b': 'integer', 'last_at': 'datetime'}
    timestamps = True
    soft_deletes = False



class Message(Model):
    table = "kotoba_messages"
    connection_name = "kotoba"
    fillable = ['conversation_id', 'circle_id', 'sender_id', 'sender_name', 'sender_color', 'body', 'lang', 'corrected', 'note', 'corrected_by']
    casts = {'id': 'integer', 'conversation_id': 'integer', 'circle_id': 'integer', 'sender_id': 'integer', 'corrected_by': 'integer'}
    timestamps = True
    soft_deletes = False



class Circle(Model):
    table = "kotoba_circles"
    connection_name = "kotoba"
    fillable = ['name', 'emoji', 'lang', 'level', 'description', 'owner_id', 'members_count', 'weekly_goal']
    casts = {'id': 'integer', 'owner_id': 'integer', 'members_count': 'integer', 'weekly_goal': 'integer'}
    timestamps = True
    soft_deletes = False



class CircleMember(Model):
    table = "kotoba_circle_members"
    connection_name = "kotoba"
    fillable = ['circle_id', 'user_id']
    casts = {'id': 'integer', 'circle_id': 'integer', 'user_id': 'integer'}
    timestamps = True
    soft_deletes = False



class Alert(Model):
    table = "kotoba_alerts"
    connection_name = "kotoba"
    fillable = ['user_id', 'kind', 'text', 'ref', 'is_read']
    casts = {'id': 'integer', 'user_id': 'integer', 'ref': 'integer', 'is_read': 'boolean'}
    timestamps = True
    soft_deletes = False



