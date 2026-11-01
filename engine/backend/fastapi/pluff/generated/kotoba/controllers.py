# ARKZEN GENERATED CONTROLLERS: kotoba
from pluff.runtime import *
from .models import User, Profile, Post, Comment, Like, Follow, Mission, Lesson, LessonResult, VocabCard, Conversation, Message, Circle, CircleMember, Alert
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ProfileController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class PostController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class CommentController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class LikeController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class FollowController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class MissionController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class LessonController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class LessonResultController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class VocabCardController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class ConversationController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class MessageController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class CircleController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class CircleMemberController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class AlertController:
    @staticmethod
    async def status(request, response):
        # Custom endpoint: status
        # Add @arkzen:endpoint:py:status ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint status is not implemented yet"}, 501)


class KotobaController:
    @staticmethod
    async def me(request, response, *params):
        user = request.user()
        palette = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a']
        if await Post.count() == 0:
            await KotobaController.community_seed(request, response)
        profile = await Profile.first_or_create(
            {'user_id': user.id},
            {'display_name': user.name, 'avatar_color': palette[int(user.id) % len(palette)]},
        )
        return response.json({'data': profile.to_json(), 'user': {'id': user.id, 'name': user.name, 'email': user.email}})

    @staticmethod
    async def update_me(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'display_name': 'sometimes|string|max:60',
            'bio': 'sometimes|nullable|string|max:300',
            'native_lang': 'sometimes|string|max:8',
            'learning_lang': 'sometimes|string|max:8',
            'level': 'sometimes|string|in:A1,A2,B1,B2,C1,C2',
            'country': 'sometimes|nullable|string|max:60',
            'interests': 'sometimes|nullable|string|max:500',
            'avatar_color': 'sometimes|string|max:16',
            'daily_goal': 'sometimes|integer|min:1|max:20',
            'onboarded': 'sometimes|boolean',
        })
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        await profile.update(validated)
        return response.json({'data': profile.to_json()})

    @staticmethod
    async def home(request, response, *params):
        from datetime import timedelta
        user = request.user()
        if await Post.count() == 0:
            await KotobaController.community_seed(request, response)
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        lang = profile.learning_lang
        missions = await Mission.where_in('lang', [lang, 'any']).order_by('position').get()
        today_date = now().date()
        mission = missions[today_date.timetuple().tm_yday % len(missions)] if missions else None
        today = today_date.isoformat()
        tomorrow = (today_date + timedelta(days=1)).isoformat()
        due = await VocabCard.where('user_id', user.id).where(
            lambda q: q.where_null('due_date').or_where('due_date', '<=', today)
        ).count()
        done = await LessonResult.where('user_id', user.id).pluck('lesson_id')
        next_lesson = await Lesson.query().where('lang', lang).where_not_in('id', done).order_by('position').first()
        unread = await Alert.where('user_id', user.id).where('is_read', False).count()
        start = today + ' 00:00:00'
        end = tomorrow + ' 00:00:00'
        activity = await Post.where('user_id', user.id).where('created_at', '>=', start).where('created_at', '<', end).count()
        activity += await Message.where('sender_id', user.id).where('created_at', '>=', start).where('created_at', '<', end).count()
        activity += await LessonResult.where('user_id', user.id).where('updated_at', '>=', start).where('updated_at', '<', end).count()
        help_needed = await Post.where('corrections_count', 0).where('user_id', '!=', user.id).where('lang', profile.native_lang).count()
        mission_done = bool(mission) and await Post.where('user_id', user.id).where('mission_id', mission.id).where(
            'created_at', '>=', start
        ).where('created_at', '<', end).exists()
        return response.json({
            'profile': profile.to_json(), 'mission': mission.to_json() if mission else None,
            'mission_done': mission_done, 'due': due,
            'next_lesson': {'id': next_lesson.id, 'title': next_lesson.title, 'unit': next_lesson.unit, 'emoji': next_lesson.emoji} if next_lesson else None,
            'unread': unread, 'today_activity': activity, 'help_needed': help_needed,
            'circles': await CircleMember.where('user_id', user.id).count(),
        })

    @staticmethod
    async def bump(request, response, *params):
        from datetime import timedelta
        user = request.user()
        xp = int(float(params[0])) if len(params) > 0 and params[0] is not None else 0
        words = int(float(params[1])) if len(params) > 1 and params[1] is not None else 0
        messages = int(float(params[2])) if len(params) > 2 and params[2] is not None else 0
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        today = now().date()
        last_active = str(profile.last_active)[:10] if profile.last_active else None
        if last_active != today.isoformat():
            profile.streak = int(profile.streak or 0) + 1 if last_active == (today - timedelta(days=1)).isoformat() else 1
            profile.last_active = today.isoformat()
        profile.best_streak = max(int(profile.best_streak or 0), int(profile.streak or 0))
        profile.xp = int(profile.xp or 0) + xp
        profile.words_written = int(profile.words_written or 0) + words
        profile.messages_sent = int(profile.messages_sent or 0) + messages
        await profile.save()
        return response.json({'data': profile.to_json()})

    @staticmethod
    async def notify(request, response, *params):
        user = request.user()
        target = int(float(params[0])) if len(params) > 0 and params[0] is not None else 0
        kind = str(params[1]) if len(params) > 1 and params[1] is not None else ''
        text = str(params[2]) if len(params) > 2 and params[2] is not None else ''
        ref = int(float(params[3])) if len(params) > 3 and params[3] is not None else None
        if target <= 0 or not kind or target == int(user.id):
            return response.json({'ok': False}, 422)
        alert = await Alert.create({'user_id': target, 'kind': kind, 'text': text[:480], 'ref': ref, 'is_read': False})
        return response.json({'ok': True, 'data': alert.to_json()})

    @staticmethod
    async def community_seed(request, response, *params):
        if await Post.count() > 0:
            return response.json({'seeded': False})
        User = user_model_for('kotoba')
        people = [
            {'email': 'aiko@kotoba.app', 'display_name': 'Aiko Tanaka', 'native_lang': 'ja', 'learning_lang': 'en', 'level': 'A2', 'country': 'Japan', 'bio': 'Osaka native. I love ramen, film cameras and teaching Japanese.', 'interests': 'travel,food,photography', 'avatar_color': '#7a3b34', 'xp': 240, 'streak': 12},
            {'email': 'mateo@kotoba.app', 'display_name': 'Mateo Rivera', 'native_lang': 'es', 'learning_lang': 'en', 'level': 'B1', 'country': 'Mexico', 'bio': 'From Mexico City. Football, tacos and bad puns in two languages.', 'interests': 'football,food,music', 'avatar_color': '#3f6b4f', 'xp': 180, 'streak': 6},
            {'email': 'sofia@kotoba.app', 'display_name': 'Sofia Laurent', 'native_lang': 'en', 'learning_lang': 'ja', 'level': 'A2', 'country': 'Canada', 'bio': 'English teacher learning Japanese. Coffee first, grammar second.', 'interests': 'books,coffee,anime', 'avatar_color': '#4a4a4a', 'xp': 320, 'streak': 21},
        ]
        seeded_profiles = {}
        for person in people:
            seeded_user = await User.where('email', person['email']).first()
            if not seeded_user:
                continue
            values = {**person, 'user_id': seeded_user.id, 'best_streak': person['streak'],
                      'last_active': now().date().isoformat(), 'onboarded': True}
            seeded_profiles[person['email']] = await Profile.update_or_create({'user_id': seeded_user.id}, values)
        if not seeded_profiles:
            return response.json({'seeded': False})

        async def make_post(email, lang, kind, body, translation, likes):
            profile = seeded_profiles.get(email)
            if not profile:
                return None
            return await Post.create({
                'user_id': profile.user_id, 'author_name': profile.display_name, 'author_color': profile.avatar_color,
                'author_native': profile.native_lang, 'lang': lang, 'kind': kind, 'body': body,
                'translation': translation, 'likes_count': likes,
            })

        first_post = await make_post('aiko@kotoba.app', 'en', 'moment', 'Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!', None, 4)
        await make_post('mateo@kotoba.app', 'en', 'moment', 'Today I learned a new word: serendipity. It means finding something good by luck.', None, 7)
        japanese_post = await make_post('sofia@kotoba.app', 'ja', 'moment', 'きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。', 'It is raining today. I will read a book while drinking coffee.', 5)
        await make_post('mateo@kotoba.app', 'es', 'question', 'Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.', 'Question for you all: what is your favorite food? Mine are tacos al pastor.', 3)
        await make_post('aiko@kotoba.app', 'ja', 'moment', 'こんにちは！わたしは アイコです。にほんの おおさかから きました。', 'Hello! I am Aiko. I came from Osaka, Japan.', 9)
        if first_post and 'sofia@kotoba.app' in seeded_profiles:
            profile = seeded_profiles['sofia@kotoba.app']
            await Comment.create({
                'post_id': first_post.id, 'user_id': profile.user_id, 'author_name': profile.display_name,
                'author_color': profile.avatar_color, 'body': 'Nice story! A few small fixes:', 'is_correction': True,
                'corrected': 'Yesterday I went to the park with my friend. We ate ice cream and it was delicious!',
                'explanation': 'Use the past tense: go becomes went and eat becomes ate. Also, delicious already means very tasty, so you do not need very.',
            })
            await first_post.update({'comments_count': 1, 'corrections_count': 1})
        if japanese_post and 'aiko@kotoba.app' in seeded_profiles:
            profile = seeded_profiles['aiko@kotoba.app']
            await Comment.create({
                'post_id': japanese_post.id, 'user_id': profile.user_id, 'author_name': profile.display_name,
                'author_color': profile.avatar_color, 'body': 'すてきですね！Very cozy. Your sentence is perfect.', 'is_correction': False,
            })
            await japanese_post.update({'comments_count': 1})
        aiko = seeded_profiles.get('aiko@kotoba.app')
        sofia = seeded_profiles.get('sofia@kotoba.app')
        if aiko and sofia:
            await Follow.first_or_create({'follower_id': aiko.user_id, 'following_id': sofia.user_id})
            await Follow.first_or_create({'follower_id': sofia.user_id, 'following_id': aiko.user_id})
        circles = [
            ('English Morning Club', 'sun', 'en', 'A2', 'Short daily check-ins in English. Be kind and correct gently.', 'sofia@kotoba.app'),
            ('Japanese for Beginners', 'flower', 'ja', 'A1', 'Hiragana, greetings and first sentences. Ask anything.', 'aiko@kotoba.app'),
            ('Spanish Cafe Talk', 'coffee', 'es', 'A2', 'Relaxed conversation practice over virtual coffee.', 'mateo@kotoba.app'),
        ]
        for name, emoji, lang, level, description, email in circles:
            owner = seeded_profiles.get(email)
            if not owner:
                continue
            circle = await Circle.create({
                'name': name, 'emoji': emoji, 'lang': lang, 'level': level, 'description': description,
                'owner_id': owner.user_id, 'members_count': 1,
            })
            await CircleMember.create({'circle_id': circle.id, 'user_id': owner.user_id})
            await Message.create({
                'circle_id': circle.id, 'sender_id': owner.user_id, 'sender_name': owner.display_name,
                'sender_color': owner.avatar_color,
                'body': f'Welcome to {name}! Introduce yourself in your target language.', 'lang': lang,
            })
        return response.json({'seeded': True})

    @staticmethod
    async def feed(request, response, *params):
        user = request.user()
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        query = Post.query().order_by('id', 'desc')
        if request.filled('lang'):
            query = query.where('lang', request.input('lang'))
        scope = request.input('scope', 'all')
        if scope == 'following':
            followed_ids = await Follow.where('follower_id', user.id).pluck('following_id')
            query = query.where_in('user_id', [*followed_ids, user.id])
        elif scope == 'mine':
            query = query.where('user_id', user.id)
        elif scope == 'help':
            query = query.where('lang', profile.native_lang).where('user_id', '!=', user.id).where('corrections_count', 0)
        if request.filled('mission_id'):
            query = query.where('mission_id', int(request.input('mission_id')))
        posts = await query.limit(40).get()
        post_ids = [post.id for post in posts]
        liked_ids = await Like.where('user_id', user.id).where_in('post_id', post_ids).pluck('post_id') if post_ids else []
        return response.json({
            'data': [{**post.to_json(), 'liked': post.id in liked_ids or int(post.id) in liked_ids} for post in posts],
        })

    @staticmethod
    async def create_post(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'body': 'required|string|max:1500', 'lang': 'required|string|max:8',
            'kind': 'sometimes|string|in:moment,question,mission', 'mission_id': 'sometimes|nullable|integer',
            'translation': 'sometimes|nullable|string|max:1500',
        })
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        kind = validated.get('kind') or 'moment'
        post = await Post.create({
            'user_id': user.id, 'author_name': profile.display_name, 'author_color': profile.avatar_color,
            'author_native': profile.native_lang, 'lang': validated['lang'], 'kind': kind,
            'mission_id': validated.get('mission_id'), 'body': validated['body'],
            'translation': validated.get('translation'),
        })
        words = max(1, len(str(validated['body']).strip().split()))
        await KotobaController.bump(request, response, kind == 'mission' and 20 or 10, words)
        return response.json({'data': {**post.to_json(), 'liked': False}}, 201)

    @staticmethod
    async def delete_post(request, response, *params):
        user = request.user()
        post = await Post.where('id', params[0]).where('user_id', user.id).first_or_fail()
        await post.delete()
        return response.json({'message': 'Post deleted'})

    @staticmethod
    async def toggle_like(request, response, *params):
        user = request.user()
        post = await Post.find_or_fail(params[0])
        existing = await Like.where('post_id', post.id).where('user_id', user.id).first()
        if existing:
            await existing.delete()
            await post.update({'likes_count': max(0, int(post.likes_count or 0) - 1)})
            liked = False
        else:
            await Like.create({'post_id': post.id, 'user_id': user.id})
            await post.update({'likes_count': int(post.likes_count or 0) + 1})
            liked = True
            profile = await Profile.where('user_id', user.id).first()
            if int(post.user_id) != int(user.id):
                display_name = profile.display_name if profile else user.name
                await KotobaController.notify(request, response, post.user_id, 'like', f'{display_name} liked your post', post.id)
        return response.json({'liked': liked, 'likes_count': int(post.likes_count)})

    @staticmethod
    async def list_comments(request, response, *params):
        comments = await Comment.where('post_id', params[0]).order_by('id').get()
        return response.json({'data': [comment.to_json() for comment in comments]})

    @staticmethod
    async def add_comment(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'body': 'required|string|max:1000', 'is_correction': 'sometimes|boolean',
            'corrected': 'sometimes|nullable|string|max:1500', 'explanation': 'sometimes|nullable|string|max:1000',
        })
        post = await Post.find_or_fail(params[0])
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        is_correction = bool(validated.get('is_correction') and validated.get('corrected'))
        comment = await Comment.create({
            'post_id': post.id, 'user_id': user.id, 'author_name': profile.display_name,
            'author_color': profile.avatar_color, 'body': validated['body'],
            'is_correction': is_correction, 'corrected': validated.get('corrected') if is_correction else None,
            'explanation': validated.get('explanation') if is_correction else None,
        })
        await post.update({
            'comments_count': int(post.comments_count or 0) + 1,
            'corrections_count': int(post.corrections_count or 0) + (1 if is_correction else 0),
        })
        kind = 'correction' if is_correction else 'comment'
        verb = ' corrected your post' if is_correction else ' commented on your post'
        await KotobaController.notify(request, response, post.user_id, kind, profile.display_name + verb, post.id)
        await KotobaController.bump(request, response, 15 if is_correction else 5, 0)
        return response.json({'data': comment.to_json()}, 201)

    @staticmethod
    async def accept_correction(request, response, *params):
        user = request.user()
        comment = await Comment.find_or_fail(params[0])
        post = await Post.find_or_fail(comment.post_id)
        if int(post.user_id) != int(user.id):
            return response.json({'message': 'Only the author can accept a correction'}, 403)
        await comment.update({'accepted': True})
        profile = await Profile.where('user_id', user.id).first()
        display_name = profile.display_name if profile else user.name
        await KotobaController.notify(
            request, response, comment.user_id, 'accepted',
            f'{display_name} accepted your correction. Thank you!', post.id,
        )
        return response.json({'data': comment.to_json()})

    @staticmethod
    async def list_lessons(request, response, *params):
        user = request.user()
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        lang = request.input('lang', profile.learning_lang)
        lessons = await Lesson.where('lang', lang).order_by('position').get()
        results = await LessonResult.where('user_id', user.id).get()
        result_by_lesson = {int(result.lesson_id): result for result in results}
        data = []
        for lesson in lessons:
            result = result_by_lesson.get(int(lesson.id))
            data.append({**lesson.to_json(), 'done': bool(result), 'best': int(result.best or 0) if result else 0})
        return response.json({'data': data, 'lang': lang})

    @staticmethod
    async def complete_lesson(request, response, *params):
        import json
        user = request.user()
        validated = await request.validate({'score': 'required|integer|min:0|max:100'})
        lesson = await Lesson.find_or_fail(params[0])
        result = await LessonResult.where('user_id', user.id).where('lesson_id', lesson.id).first()
        first = result is None
        if first:
            result = await LessonResult.create({
                'user_id': user.id, 'lesson_id': lesson.id, 'score': validated['score'], 'best': validated['score'],
            })
        else:
            await result.update({
                'score': validated['score'], 'best': max(int(result.best or 0), int(validated['score'])),
            })
        xp = int(float(lesson.xp) * max(0.4, float(validated['score']) / 100) + 0.5) if first else 5
        cards_added = 0
        content = json.loads(lesson.content) if isinstance(lesson.content, str) else lesson.content
        for pair in (content or {}).get('v', []):
            if not isinstance(pair, list) or len(pair) < 2:
                continue
            existing = await VocabCard.where('user_id', user.id).where('lang', lesson.lang).where('term', pair[0]).first()
            if existing:
                continue
            await VocabCard.create({
                'user_id': user.id, 'lang': lesson.lang, 'term': pair[0], 'meaning': pair[1],
                'source': 'lesson', 'due_date': now().date().isoformat(),
            })
            cards_added += 1
        await KotobaController.bump(request, response, xp, 0)
        return response.json({'xp': xp, 'cards_added': cards_added, 'first': first})

    @staticmethod
    async def list_cards(request, response, *params):
        user = request.user()
        today = now().date().isoformat()
        def base_cards():
            query = VocabCard.query().where('user_id', user.id)
            if request.filled('lang'):
                query = query.where('lang', request.input('lang'))
            return query

        total = await base_cards().count()
        due_count = await base_cards().where(
            lambda q: q.where_null('due_date').or_where('due_date', '<=', today)
        ).count()
        query = base_cards()
        if str(request.input('due', '0')) == '1':
            query = query.where(lambda q: q.where_null('due_date').or_where('due_date', '<=', today))
        if request.filled('q'):
            term = f"%{request.input('q')}%"
            query = query.where(lambda q: q.where('term', 'like', term).or_where('meaning', 'like', term))
        cards = await query.order_by('due_date').order_by('id').limit(200).get()
        return response.json({'data': [card.to_json() for card in cards], 'total': total, 'due_count': due_count})

    @staticmethod
    async def add_card(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'term': 'required|string|max:255', 'meaning': 'required|string|max:255',
            'lang': 'required|string|max:8', 'example': 'sometimes|nullable|string|max:500',
            'source': 'sometimes|string|max:16',
        })
        card = await VocabCard.where('user_id', user.id).where('lang', validated['lang']).where('term', validated['term']).first()
        created = card is None
        if created:
            card = await VocabCard.create({
                'user_id': user.id, 'lang': validated['lang'], 'term': validated['term'],
                'meaning': validated['meaning'], 'example': validated.get('example'),
                'source': validated.get('source') or 'manual', 'due_date': now().date().isoformat(),
            })
        return response.json({'data': card.to_json(), 'created': created}, 201 if created else 200)

    @staticmethod
    async def review_card(request, response, *params):
        from datetime import timedelta
        user = request.user()
        card = await VocabCard.where('id', params[0]).where('user_id', user.id).first_or_fail()
        try:
            grade = int(float(request.input('grade', 2)) or 0)
        except (TypeError, ValueError):
            grade = 0
        grade = max(0, min(3, grade))
        repetitions = int(card.reps or 0)
        interval_days = int(card.interval_days or 0)
        ease = float(card.ease or 2.5)
        lapses = int(card.lapses or 0)
        if grade == 0:
            lapses += 1
            repetitions = 0
            ease = max(1.3, ease - 0.2)
            interval_days = 0
        else:
            repetitions += 1
            if repetitions == 1:
                interval_days = 3 if grade == 3 else 1
            elif repetitions == 2:
                interval_days = 2 if grade == 1 else 7 if grade == 3 else 4
            else:
                multiplier = 1.2 if grade == 1 else ease * 1.3 if grade == 3 else ease
                interval_days = max(1, int(interval_days * multiplier + 0.5))
            if grade == 1:
                ease = max(1.3, ease - 0.15)
            if grade == 3:
                ease += 0.15
        due_date = (now().date() + timedelta(days=interval_days)).isoformat()
        await card.update({
            'lapses': lapses, 'reps': repetitions, 'ease': ease,
            'interval_days': interval_days, 'due_date': due_date,
        })
        await KotobaController.bump(request, response, 2, 0)
        return response.json({'data': card.to_json()})

    @staticmethod
    async def delete_card(request, response, *params):
        user = request.user()
        await VocabCard.where('id', params[0]).where('user_id', user.id).delete()
        return response.json({'message': 'Card deleted'})

    @staticmethod
    async def partners(request, response, *params):
        user = request.user()
        me = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        following_ids = await Follow.where('follower_id', user.id).pluck('following_id')
        query = Profile.query().where('user_id', '!=', user.id)
        if request.input('mode') == 'exchange':
            query = query.where('native_lang', me.learning_lang)
        if request.filled('lang'):
            query = query.where('native_lang', request.input('lang'))
        if request.filled('q'):
            term = f"%{request.input('q')}%"
            query = query.where(
                lambda w: w.where('display_name', 'like', term)
                .or_where('interests', 'like', term).or_where('country', 'like', term)
            )
        mine = [value.strip() for value in str(me.interests or '').lower().split(',') if value.strip()]
        levels = {'A1': 1, 'A2': 2, 'B1': 3, 'B2': 4, 'C1': 5, 'C2': 6}
        candidates = await query.limit(60).get()
        data = []
        for candidate in candidates:
            score = 50 if candidate.native_lang == me.learning_lang else 0
            if candidate.learning_lang == me.native_lang:
                score += 30
            interests = [value.strip() for value in str(candidate.interests or '').lower().split(',') if value.strip()]
            shared = [interest for interest in mine if interest in interests]
            score += min(20, len(shared) * 7)
            score += max(0, 5 - abs(levels.get(candidate.level, 1) - levels.get(me.level, 1)))
            data.append({
                **candidate.to_json(), 'score': min(100, score), 'shared': shared,
                'following': any(int(following_id) == int(candidate.user_id) for following_id in following_ids),
            })
        data.sort(key=lambda candidate: candidate['score'], reverse=True)
        return response.json({'data': data})

    @staticmethod
    async def view_profile(request, response, *params):
        user = request.user()
        profile = await Profile.where('user_id', params[0]).first_or_fail()
        posts = await Post.where('user_id', profile.user_id).order_by('id', 'desc').limit(5).get()
        followers = await Follow.where('following_id', profile.user_id).count()
        following_count = await Follow.where('follower_id', profile.user_id).count()
        following = await Follow.where('follower_id', user.id).where('following_id', profile.user_id).exists()
        post_count = await Post.where('user_id', profile.user_id).count()
        return response.json({
            'data': profile.to_json(), 'posts': [post.to_json() for post in posts],
            'followers': followers, 'following_count': following_count,
            'following': following, 'post_count': post_count,
        })

    @staticmethod
    async def toggle_follow(request, response, *params):
        user = request.user()
        target = int(params[0])
        if target == int(user.id):
            return response.json({'message': 'You cannot follow yourself'}, 422)
        existing = await Follow.where('follower_id', user.id).where('following_id', target).first()
        if existing:
            await existing.delete()
            return response.json({'following': False})
        await Follow.create({'follower_id': user.id, 'following_id': target})
        profile = await Profile.where('user_id', user.id).first()
        display_name = profile.display_name if profile else user.name
        await KotobaController.notify(
            request, response, target, 'follow', f'{display_name} started following you', user.id,
        )
        return response.json({'following': True})

    @staticmethod
    async def list_conversations(request, response, *params):
        user = request.user()
        rows = await Conversation.where('user_a', user.id).or_where('user_b', user.id).order_by(
            'last_at', 'desc'
        ).order_by('id', 'desc').get()
        other_ids = [
            row.user_b if int(row.user_a) == int(user.id) else row.user_a
            for row in rows
        ]
        profiles = await Profile.where_in('user_id', other_ids).get()
        profile_by_id = {int(profile.user_id): profile for profile in profiles}
        data = []
        for conversation in rows:
            other_id = conversation.user_b if int(conversation.user_a) == int(user.id) else conversation.user_a
            profile = profile_by_id.get(int(other_id))
            data.append({
                'id': conversation.id, 'last_message': conversation.last_message, 'last_at': conversation.last_at,
                'with': profile.to_json() if profile else {
                    'user_id': other_id, 'display_name': 'Member', 'avatar_color': '#6b655b',
                },
            })
        return response.json({'data': data})

    @staticmethod
    async def start_conversation(request, response, *params):
        user = request.user()
        validated = await request.validate({'user_id': 'required|integer'})
        other_id = int(validated['user_id'])
        if other_id == int(user.id):
            return response.json({'message': 'Pick someone else to talk to'}, 422)
        profile = await Profile.where('user_id', other_id).first_or_fail()
        conversation = await Conversation.first_or_create({
            'user_a': min(int(user.id), other_id), 'user_b': max(int(user.id), other_id),
        })
        return response.json({
            'data': {
                'id': conversation.id, 'last_message': conversation.last_message,
                'last_at': conversation.last_at, 'with': profile.to_json(),
            },
        })

    @staticmethod
    async def list_messages(request, response, *params):
        user = request.user()
        query = Message.query()
        if request.filled('conversation_id'):
            conversation = await Conversation.find_or_fail(int(request.input('conversation_id')))
            if int(conversation.user_a) != int(user.id) and int(conversation.user_b) != int(user.id):
                return response.json({'message': 'Not your conversation'}, 403)
            query = query.where('conversation_id', conversation.id)
        elif request.filled('circle_id'):
            circle_id = int(request.input('circle_id'))
            if not await CircleMember.where('circle_id', circle_id).where('user_id', user.id).exists():
                return response.json({'message': 'Join this circle first'}, 403)
            query = query.where('circle_id', circle_id)
        else:
            return response.json({'message': 'conversation_id or circle_id required'}, 422)
        if request.filled('after_id'):
            query = query.where('id', '>', int(request.input('after_id')))
        rows = await query.order_by('id', 'desc').limit(100).get()
        return response.json({'data': [message.to_json() for message in reversed(rows)]})

    @staticmethod
    async def send_message(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'body': 'required|string|max:2000', 'lang': 'sometimes|nullable|string|max:8',
            'conversation_id': 'sometimes|nullable|integer', 'circle_id': 'sometimes|nullable|integer',
        })
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        conversation_id = None
        circle_id = None
        participant_ids = []
        if validated.get('conversation_id'):
            conversation = await Conversation.find_or_fail(int(validated['conversation_id']))
            if int(conversation.user_a) != int(user.id) and int(conversation.user_b) != int(user.id):
                return response.json({'message': 'Not your conversation'}, 403)
            conversation_id = conversation.id
            participant_ids = [conversation.user_a, conversation.user_b]
            await conversation.update({
                'last_message': str(validated['body'])[:200], 'last_at': now(),
            })
        elif validated.get('circle_id'):
            circle_id = int(validated['circle_id'])
            if not await CircleMember.where('circle_id', circle_id).where('user_id', user.id).exists():
                return response.json({'message': 'Join this circle first'}, 403)
            participant_ids = await CircleMember.where('circle_id', circle_id).pluck('user_id')
        else:
            return response.json({'message': 'conversation_id or circle_id required'}, 422)
        message = await Message.create({
            'conversation_id': conversation_id, 'circle_id': circle_id, 'sender_id': user.id,
            'sender_name': profile.display_name, 'sender_color': profile.avatar_color,
            'body': validated['body'], 'lang': validated.get('lang'),
        })
        payload = {**message.to_json(), 'scope': 'circle' if circle_id else 'dm'}
        for recipient_id in participant_ids:
            if int(recipient_id) != int(user.id):
                broadcast_to(f'private-kotoba.{recipient_id}', 'kotoba.message-created', payload)
        words = max(1, len(str(validated['body']).strip().split()))
        await KotobaController.bump(request, response, 3, words, 1)
        return response.json({'data': payload}, 201)

    @staticmethod
    async def correct_message(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'corrected': 'required|string|max:2000', 'note': 'sometimes|nullable|string|max:500',
        })
        message = await Message.find_or_fail(params[0])
        if int(message.sender_id) == int(user.id):
            return response.json({'message': 'You cannot correct your own message'}, 422)
        participant_ids = []
        if message.conversation_id:
            conversation = await Conversation.find(message.conversation_id)
            if conversation:
                participant_ids = [conversation.user_a, conversation.user_b]
        elif message.circle_id:
            participant_ids = await CircleMember.where('circle_id', message.circle_id).pluck('user_id')
        if not any(int(participant_id) == int(user.id) for participant_id in participant_ids):
            return response.json({'message': 'Not allowed'}, 403)
        await message.update({
            'corrected': validated['corrected'], 'note': validated.get('note'), 'corrected_by': user.id,
        })
        payload = {
            **message.to_json(), 'scope': 'circle' if message.circle_id else 'dm', 'updated': True,
        }
        for recipient_id in participant_ids:
            if int(recipient_id) != int(user.id):
                broadcast_to(f'private-kotoba.{recipient_id}', 'kotoba.message-created', payload)
        profile = await Profile.where('user_id', user.id).first()
        display_name = profile.display_name if profile else user.name
        await KotobaController.notify(
            request, response, message.sender_id, 'correction',
            f'{display_name} suggested a correction in chat', message.id,
        )
        await KotobaController.bump(request, response, 10, 0)
        return response.json({'data': payload})

    @staticmethod
    async def list_circles(request, response, *params):
        user = request.user()
        mine = await CircleMember.where('user_id', user.id).pluck('circle_id')
        query = Circle.query().order_by('members_count', 'desc').order_by('id', 'desc').limit(60)
        if request.filled('lang'):
            query = query.where('lang', request.input('lang'))
        rows = await query.get()
        return response.json({
            'data': [{**circle.to_json(), 'joined': circle.id in mine} for circle in rows],
        })

    @staticmethod
    async def create_circle(request, response, *params):
        user = request.user()
        validated = await request.validate({
            'name': 'required|string|max:80', 'emoji': 'sometimes|nullable|string|max:24',
            'lang': 'required|string|max:8', 'level': 'sometimes|string|in:A1,A2,B1,B2,C1,C2',
            'description': 'sometimes|nullable|string|max:400',
        })
        circle = await Circle.create({
            'name': validated['name'], 'emoji': validated.get('emoji') or 'message-circle',
            'lang': validated['lang'], 'level': validated.get('level') or 'A1',
            'description': validated.get('description'), 'owner_id': user.id, 'members_count': 1,
        })
        await CircleMember.create({'circle_id': circle.id, 'user_id': user.id})
        return response.json({'data': {**circle.to_json(), 'joined': True}}, 201)

    @staticmethod
    async def toggle_join(request, response, *params):
        user = request.user()
        circle = await Circle.find_or_fail(params[0])
        existing = await CircleMember.where('circle_id', circle.id).where('user_id', user.id).first()
        if existing:
            if int(circle.owner_id) == int(user.id):
                return response.json({'message': 'Owners cannot leave their own circle'}, 422)
            await existing.delete()
            await circle.update({'members_count': max(1, int(circle.members_count or 1) - 1)})
            return response.json({'joined': False, 'members_count': int(circle.members_count)})
        await CircleMember.create({'circle_id': circle.id, 'user_id': user.id})
        await circle.update({'members_count': int(circle.members_count or 0) + 1})
        return response.json({'joined': True, 'members_count': int(circle.members_count)})

    @staticmethod
    async def list_alerts(request, response, *params):
        user = request.user()
        alerts = await Alert.where('user_id', user.id).order_by('id', 'desc').limit(40).get()
        unread = await Alert.where('user_id', user.id).where('is_read', False).count()
        return response.json({'data': [alert.to_json() for alert in alerts], 'unread': unread})

    @staticmethod
    async def read_alerts(request, response, *params):
        user = request.user()
        await Alert.where('user_id', user.id).where('is_read', False).update({'is_read': True})
        return response.json({'ok': True})

    @staticmethod
    async def progress(request, response, *params):
        from datetime import datetime, time, timedelta, timezone
        user = request.user()
        profile = await Profile.first_or_create({'user_id': user.id}, {'display_name': user.name})
        today = now().date()
        days = {(today - timedelta(days=offset)).isoformat(): 0 for offset in range(13, -1, -1)}
        since = datetime.combine(today - timedelta(days=13), time.min, tzinfo=timezone.utc)
        posts = await Post.where('user_id', user.id).where('created_at', '>=', since).select('created_at').get()
        messages = await Message.where('sender_id', user.id).where('created_at', '>=', since).select('created_at').get()
        results = await LessonResult.where('user_id', user.id).where('updated_at', '>=', since).select('updated_at').get()
        my_posts = await Post.where('user_id', user.id).pluck('id')
        for row in posts:
            day = str(row.created_at or '')[:10]
            if day in days:
                days[day] += 1
        for row in messages:
            day = str(row.created_at or '')[:10]
            if day in days:
                days[day] += 1
        for row in results:
            day = str(row.updated_at or '')[:10]
            if day in days:
                days[day] += 1
        card_count = await VocabCard.where('user_id', user.id).count()
        mastered = await VocabCard.where('user_id', user.id).where('reps', '>=', 4).count()
        lesson_count = await LessonResult.where('user_id', user.id).count()
        corrections_given = await Comment.where('user_id', user.id).where('is_correction', True).count()
        corrections_received = await Comment.where('is_correction', True).where_in('post_id', my_posts).count() if my_posts else 0
        corrections_accepted = await Comment.where('is_correction', True).where('accepted', True).where_in('post_id', my_posts).count() if my_posts else 0
        xp = int(profile.xp or 0)
        return response.json({
            'profile': profile.to_json(),
            'series': [{'date': day, 'count': count} for day, count in days.items()],
            'stats': {
                'cards': card_count, 'mastered': mastered, 'lessons': lesson_count, 'posts': len(my_posts),
                'corrections_given': corrections_given, 'corrections_received': corrections_received,
                'corrections_accepted': corrections_accepted, 'words_written': int(profile.words_written or 0),
                'messages_sent': int(profile.messages_sent or 0),
            },
            'level': xp // 100 + 1, 'level_progress': xp % 100,
        })


