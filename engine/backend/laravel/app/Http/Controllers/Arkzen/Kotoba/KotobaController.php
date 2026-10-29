<?php

// ============================================================
// ARKZEN GENERATED CONTROLLER — KotobaController
// Tatemono: kotoba
// Type: Custom Route Controller (no model/resource)
// DO NOT EDIT DIRECTLY. Edit the @arkzen:routes block in the tatemono instead.
// Generated: 2026-10-29T03:33:38.330797Z
// ============================================================

namespace App\Http\Controllers\Arkzen\Kotoba;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Http\Controllers\Controller;

class KotobaController extends Controller
{
    /**
     * GET /api/kotoba/me
     */
    public function me(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile';
        $Post = $ns . 'Post';
        if ($Post::count() === 0) { $this->community_seed($request); }
        $palette = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a'];
        $p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name, 'avatar_color' => $palette[$u->id % count($palette)]]);
        return response()->json(['data' => $p, 'user' => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]]);
    }

    /**
     * PUT /api/kotoba/me
     */
    public function update_me(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile';
        $data = $request->validate([
            'display_name' => 'sometimes|string|max:60',
            'bio' => 'sometimes|nullable|string|max:300',
            'native_lang' => 'sometimes|string|max:8',
            'learning_lang' => 'sometimes|string|max:8',
            'level' => 'sometimes|string|in:A1,A2,B1,B2,C1,C2',
            'country' => 'sometimes|nullable|string|max:60',
            'interests' => 'sometimes|nullable|string|max:500',
            'avatar_color' => 'sometimes|string|max:16',
            'daily_goal' => 'sometimes|integer|min:1|max:20',
            'onboarded' => 'sometimes|boolean',
        ]);
        $p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $p->update($data);
        return response()->json(['data' => $p->fresh()]);
    }

    /**
     * GET /api/kotoba/home
     */
    public function home(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Mission = $ns . 'Mission'; $Lesson = $ns . 'Lesson'; $Result = $ns . 'LessonResult';
        $Card = $ns . 'VocabCard'; $Alert = $ns . 'Alert'; $Post = $ns . 'Post'; $Message = $ns . 'Message'; $Circle = $ns . 'CircleMember';
        if ($Post::count() === 0) { $this->community_seed($request); }
        $p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $lang = $p->learning_lang;
        $missions = $Mission::whereIn('lang', [$lang, 'any'])->orderBy('position')->get();
        $mission = $missions->count() ? $missions[now()->dayOfYear % $missions->count()] : null;
        $today = now()->toDateString();
        $due = $Card::where('user_id', $u->id)->where(function ($q) use ($today) { $q->whereNull('due_date')->orWhere('due_date', '<=', $today); })->count();
        $done = $Result::where('user_id', $u->id)->pluck('lesson_id')->all();
        $next = $Lesson::where('lang', $lang)->whereNotIn('id', $done)->orderBy('position')->first();
        $unread = $Alert::where('user_id', $u->id)->where('is_read', false)->count();
        $acts = $Post::where('user_id', $u->id)->whereDate('created_at', $today)->count()
              + $Message::where('sender_id', $u->id)->whereDate('created_at', $today)->count()
              + $Result::where('user_id', $u->id)->whereDate('updated_at', $today)->count();
        $help = $Post::where('corrections_count', 0)->where('user_id', '!=', $u->id)->where('lang', $p->native_lang)->count();
        $mine = $Post::where('user_id', $u->id)->where('mission_id', $mission ? $mission->id : 0)->whereDate('created_at', $today)->exists();
        return response()->json([
            'profile' => $p, 'mission' => $mission, 'mission_done' => $mine, 'due' => $due,
            'next_lesson' => $next ? ['id' => $next->id, 'title' => $next->title, 'unit' => $next->unit, 'emoji' => $next->emoji] : null,
            'unread' => $unread, 'today_activity' => $acts, 'help_needed' => $help,
            'circles' => $Circle::where('user_id', $u->id)->count(),
        ]);
    }

    /**
     * POST /api/kotoba/activity
     */
    public function bump(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile';
        $xp = (int) ($params[0] ?? 0);
        $words = (int) ($params[1] ?? 0);
        $msgs = (int) ($params[2] ?? 0);
        $p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $today = now()->toDateString();
        $last = $p->last_active ? substr((string) $p->last_active, 0, 10) : null;
        if ($last !== $today) {
            $p->streak = ($last === now()->subDay()->toDateString()) ? ((int) $p->streak + 1) : 1;
            $p->last_active = $today;
        }
        $p->best_streak = max((int) $p->best_streak, (int) $p->streak);
        $p->xp = (int) $p->xp + $xp;
        $p->words_written = (int) $p->words_written + $words;
        $p->messages_sent = (int) $p->messages_sent + $msgs;
        $p->save();
        return response()->json(['data' => $p]);
    }

    /**
     * POST /api/kotoba/internal/notify
     */
    public function notify(Request $request, mixed ...$params): JsonResponse
    {

        $to = (int) ($params[0] ?? 0);
        $kind = (string) ($params[1] ?? '');
        $text = (string) ($params[2] ?? '');
        $ref = isset($params[3]) ? (int) $params[3] : null;
        if ($to <= 0 || $kind === '' || $to === (int) $request->user()->id) {
            return response()->json(['ok' => false], 422);
        }
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Alert = $ns . 'Alert';
        $a = $Alert::create(['user_id' => $to, 'kind' => $kind, 'text' => mb_substr($text, 0, 480), 'ref' => $ref, 'is_read' => false]);
        try { broadcast(new \App\Events\Arkzen\Kotoba\Broadcast\AlertCreated($to, $a->toArray())); } catch (\Throwable $e) {}
        return response()->json(['ok' => true]);
    }

    /**
     * POST /api/kotoba/internal/seed
     */
    public function community_seed(Request $request, mixed ...$params): JsonResponse
    {

        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $User = $ns . 'User';
        $Profile = $ns . 'Profile';
        $Post = $ns . 'Post';
        $Comment = $ns . 'Comment';
        $Follow = $ns . 'Follow';
        $Circle = $ns . 'Circle';
        $Member = $ns . 'CircleMember';
        $Message = $ns . 'Message';
        if ($Post::count() > 0) { return response()->json(['seeded' => false]); }
        $people = [
            'aiko@kotoba.app' => ['Aiko Tanaka', 'ja', 'en', 'A2', 'Japan', 'Osaka native. I love ramen, film cameras and teaching Japanese.', 'travel,food,photography', '#7a3b34', 240, 12],
            'mateo@kotoba.app' => ['Mateo Rivera', 'es', 'en', 'B1', 'Mexico', 'From Mexico City. Football, tacos and bad puns in two languages.', 'football,food,music', '#3f6b4f', 180, 6],
            'sofia@kotoba.app' => ['Sofia Laurent', 'en', 'ja', 'A2', 'Canada', 'English teacher learning Japanese. Coffee first, grammar second.', 'books,coffee,anime', '#4a4a4a', 320, 21],
        ];
        $by = [];
        foreach ($people as $email => $d) {
            $usr = $User::where('email', $email)->first();
            if (!$usr) { continue; }
            $by[$email] = $Profile::updateOrCreate(['user_id' => $usr->id], [
                'display_name' => $d[0], 'native_lang' => $d[1], 'learning_lang' => $d[2], 'level' => $d[3],
                'country' => $d[4], 'bio' => $d[5], 'interests' => $d[6], 'avatar_color' => $d[7],
                'xp' => $d[8], 'streak' => $d[9], 'best_streak' => $d[9], 'last_active' => now()->toDateString(), 'onboarded' => true,
            ]);
        }
        if (count($by) === 0) { return response()->json(['seeded' => false]); }
        $mk = function ($email, $lang, $kind, $body, $translation, $likes) use ($by, $Post) {
            if (!isset($by[$email])) { return null; }
            $p = $by[$email];
            return $Post::create([
                'user_id' => $p->user_id, 'author_name' => $p->display_name, 'author_color' => $p->avatar_color,
                'author_native' => $p->native_lang, 'lang' => $lang, 'kind' => $kind, 'body' => $body,
                'translation' => $translation, 'likes_count' => $likes,
            ]);
        };
        $p1 = $mk('aiko@kotoba.app', 'en', 'moment', "Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!", null, 4);
        $p2 = $mk('mateo@kotoba.app', 'en', 'moment', "Today I learned a new word: serendipity. It means finding something good by luck.", null, 7);
        $p3 = $mk('sofia@kotoba.app', 'ja', 'moment', "きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。", "It is raining today. I will read a book while drinking coffee.", 5);
        $p4 = $mk('mateo@kotoba.app', 'es', 'question', "Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.", "Question for you all: what is your favorite food? Mine is tacos al pastor.", 3);
        $p5 = $mk('aiko@kotoba.app', 'ja', 'moment', "こんにちは！わたしは アイコです。にほんの おおさかから きました。", "Hello! I am Aiko. I came from Osaka, Japan.", 9);
        if ($p1 && isset($by['sofia@kotoba.app'])) {
            $s = $by['sofia@kotoba.app'];
            $Comment::create(['post_id' => $p1->id, 'user_id' => $s->user_id, 'author_name' => $s->display_name, 'author_color' => $s->avatar_color,
                'body' => 'Nice story! A few small fixes:', 'is_correction' => true,
                'corrected' => 'Yesterday I went to the park with my friend. We ate ice cream and it was delicious!',
                'explanation' => 'Use the past tense: go becomes went and eat becomes ate. Also, delicious already means very tasty, so you do not need very.']);
            $p1->update(['comments_count' => 1, 'corrections_count' => 1]);
        }
        if ($p3 && isset($by['aiko@kotoba.app'])) {
            $a = $by['aiko@kotoba.app'];
            $Comment::create(['post_id' => $p3->id, 'user_id' => $a->user_id, 'author_name' => $a->display_name, 'author_color' => $a->avatar_color,
                'body' => 'すてきですね！Very cozy. Your sentence is perfect.', 'is_correction' => false]);
            $p3->update(['comments_count' => 1]);
        }
        if (isset($by['aiko@kotoba.app']) && isset($by['sofia@kotoba.app'])) {
            $Follow::firstOrCreate(['follower_id' => $by['aiko@kotoba.app']->user_id, 'following_id' => $by['sofia@kotoba.app']->user_id]);
            $Follow::firstOrCreate(['follower_id' => $by['sofia@kotoba.app']->user_id, 'following_id' => $by['aiko@kotoba.app']->user_id]);
        }
        $circles = [
            ['English Morning Club', 'sun', 'en', 'A2', 'Short daily check-ins in English. Be kind and correct gently.', 'sofia@kotoba.app'],
            ['Japanese for Beginners', 'flower', 'ja', 'A1', 'Hiragana, greetings and first sentences. Ask anything.', 'aiko@kotoba.app'],
            ['Spanish Cafe Talk', 'coffee', 'es', 'A2', 'Relaxed conversation practice over virtual coffee.', 'mateo@kotoba.app'],
        ];
        foreach ($circles as $c) {
            if (!isset($by[$c[5]])) { continue; }
            $o = $by[$c[5]];
            $circle = $Circle::create(['name' => $c[0], 'emoji' => $c[1], 'lang' => $c[2], 'level' => $c[3], 'description' => $c[4], 'owner_id' => $o->user_id, 'members_count' => 1]);
            $Member::create(['circle_id' => $circle->id, 'user_id' => $o->user_id]);
            $Message::create(['circle_id' => $circle->id, 'sender_id' => $o->user_id, 'sender_name' => $o->display_name, 'sender_color' => $o->avatar_color,
                'body' => 'Welcome to ' . $c[0] . '! Introduce yourself in your target language.', 'lang' => $c[2]]);
        }
        return response()->json(['seeded' => true]);
    }

    /**
     * GET /api/kotoba/feed
     */
    public function feed(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Post = $ns . 'Post'; $Like = $ns . 'Like'; $Follow = $ns . 'Follow';
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $q = $Post::query()->orderByDesc('id');
        if ($request->filled('lang')) { $q->where('lang', $request->input('lang')); }
        $scope = $request->input('scope', 'all');
        if ($scope === 'following') {
            $ids = $Follow::where('follower_id', $u->id)->pluck('following_id')->all();
            $ids[] = $u->id;
            $q->whereIn('user_id', $ids);
        } elseif ($scope === 'mine') {
            $q->where('user_id', $u->id);
        } elseif ($scope === 'help') {
            $q->where('lang', $me->native_lang)->where('user_id', '!=', $u->id)->where('corrections_count', 0);
        }
        if ($request->filled('mission_id')) { $q->where('mission_id', (int) $request->input('mission_id')); }
        $posts = $q->limit(40)->get();
        $liked = $Like::where('user_id', $u->id)->whereIn('post_id', $posts->pluck('id')->all())->pluck('post_id')->all();
        $data = $posts->map(function ($p) use ($liked) { return array_merge($p->toArray(), ['liked' => in_array($p->id, $liked)]); })->values();
        return response()->json(['data' => $data]);
    }

    /**
     * POST /api/kotoba/posts
     */
    public function create_post(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Post = $ns . 'Post';
        $data = $request->validate([
            'body' => 'required|string|max:1500',
            'lang' => 'required|string|max:8',
            'kind' => 'sometimes|string|in:moment,question,mission',
            'mission_id' => 'sometimes|nullable|integer',
            'translation' => 'sometimes|nullable|string|max:1500',
        ]);
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $kind = $data['kind'] ?? 'moment';
        $post = $Post::create([
            'user_id' => $u->id, 'author_name' => $me->display_name, 'author_color' => $me->avatar_color, 'author_native' => $me->native_lang,
            'lang' => $data['lang'], 'kind' => $kind, 'mission_id' => $data['mission_id'] ?? null,
            'body' => $data['body'], 'translation' => $data['translation'] ?? null,
        ]);
        $words = max(1, count(preg_split('/\s+/u', trim($data['body']))));
        $this->bump($request, $kind === 'mission' ? 20 : 10, $words);
        return response()->json(['data' => array_merge($post->toArray(), ['liked' => false])], 201);
    }

    /**
     * DELETE /api/kotoba/posts/{id}
     */
    public function delete_post(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Post = $ns . 'Post';
        $post = $Post::where('id', (int) $id)->where('user_id', $u->id)->firstOrFail();
        $post->delete();
        return response()->json(['message' => 'Post deleted']);
    }

    /**
     * POST /api/kotoba/posts/{id}/like
     */
    public function toggle_like(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Post = $ns . 'Post'; $Like = $ns . 'Like'; $Profile = $ns . 'Profile';
        $post = $Post::findOrFail((int) $id);
        $existing = $Like::where('post_id', $post->id)->where('user_id', $u->id)->first();
        if ($existing) {
            $existing->delete();
            $post->update(['likes_count' => max(0, (int) $post->likes_count - 1)]);
            $liked = false;
        } else {
            $Like::create(['post_id' => $post->id, 'user_id' => $u->id]);
            $post->update(['likes_count' => (int) $post->likes_count + 1]);
            $liked = true;
            $me = $Profile::where('user_id', $u->id)->first();
            $this->notify($request, $post->user_id, 'like', ($me ? $me->display_name : $u->name) . ' liked your post', $post->id);
        }
        return response()->json(['liked' => $liked, 'likes_count' => (int) $post->fresh()->likes_count]);
    }

    /**
     * GET /api/kotoba/posts/{id}/comments
     */
    public function list_comments(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Comment = $ns . 'Comment';
        $rows = $Comment::where('post_id', (int) $id)->orderBy('id')->get();
        return response()->json(['data' => $rows]);
    }

    /**
     * POST /api/kotoba/posts/{id}/comments
     */
    public function add_comment(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Post = $ns . 'Post'; $Comment = $ns . 'Comment';
        $data = $request->validate([
            'body' => 'required|string|max:1000',
            'is_correction' => 'sometimes|boolean',
            'corrected' => 'sometimes|nullable|string|max:1500',
            'explanation' => 'sometimes|nullable|string|max:1000',
        ]);
        $post = $Post::findOrFail((int) $id);
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $isFix = !empty($data['is_correction']) && !empty($data['corrected']);
        $c = $Comment::create([
            'post_id' => $post->id, 'user_id' => $u->id, 'author_name' => $me->display_name, 'author_color' => $me->avatar_color,
            'body' => $data['body'], 'is_correction' => $isFix, 'corrected' => $isFix ? $data['corrected'] : null,
            'explanation' => $isFix ? ($data['explanation'] ?? null) : null,
        ]);
        $post->update([
            'comments_count' => (int) $post->comments_count + 1,
            'corrections_count' => (int) $post->corrections_count + ($isFix ? 1 : 0),
        ]);
        $this->notify($request, $post->user_id, $isFix ? 'correction' : 'comment', $me->display_name . ($isFix ? ' corrected your post' : ' commented on your post'), $post->id);
        $this->bump($request, $isFix ? 15 : 5, 0);
        return response()->json(['data' => $c], 201);
    }

    /**
     * POST /api/kotoba/comments/{id}/accept
     */
    public function accept_correction(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Post = $ns . 'Post'; $Comment = $ns . 'Comment'; $Profile = $ns . 'Profile';
        $c = $Comment::findOrFail((int) $id);
        $post = $Post::findOrFail($c->post_id);
        if ((int) $post->user_id !== (int) $u->id) { return response()->json(['message' => 'Only the author can accept a correction'], 403); }
        $c->update(['accepted' => true]);
        $me = $Profile::where('user_id', $u->id)->first();
        $this->notify($request, $c->user_id, 'accepted', ($me ? $me->display_name : $u->name) . ' accepted your correction. Thank you!', $post->id);
        return response()->json(['data' => $c->fresh()]);
    }

    /**
     * GET /api/kotoba/lessons
     */
    public function list_lessons(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Lesson = $ns . 'Lesson'; $Result = $ns . 'LessonResult';
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $lang = $request->input('lang', $me->learning_lang);
        $results = $Result::where('user_id', $u->id)->get()->keyBy('lesson_id');
        $rows = $Lesson::where('lang', $lang)->orderBy('position')->get()->map(function ($l) use ($results) {
            $r = $results->get($l->id);
            return array_merge($l->toArray(), ['done' => (bool) $r, 'best' => $r ? (int) $r->best : 0]);
        })->values();
        return response()->json(['data' => $rows, 'lang' => $lang]);
    }

    /**
     * POST /api/kotoba/lessons/{id}/complete
     */
    public function complete_lesson(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Lesson = $ns . 'Lesson'; $Result = $ns . 'LessonResult'; $Card = $ns . 'VocabCard';
        $data = $request->validate(['score' => 'required|integer|min:0|max:100']);
        $lesson = $Lesson::findOrFail((int) $id);
        $r = $Result::firstOrNew(['user_id' => $u->id, 'lesson_id' => $lesson->id]);
        $first = !$r->exists;
        $r->score = $data['score'];
        $r->best = max((int) $r->best, (int) $data['score']);
        $r->save();
        $xp = $first ? (int) round($lesson->xp * max(0.4, $data['score'] / 100)) : 5;
        $added = 0;
        $content = json_decode($lesson->content, true);
        foreach (($content['v'] ?? []) as $pair) {
            if (!is_array($pair) || count($pair) < 2) { continue; }
            $card = $Card::firstOrCreate(
                ['user_id' => $u->id, 'lang' => $lesson->lang, 'term' => $pair[0]],
                ['meaning' => $pair[1], 'source' => 'lesson', 'due_date' => now()->toDateString()]
            );
            if ($card->wasRecentlyCreated) { $added++; }
        }
        $this->bump($request, $xp, 0);
        return response()->json(['xp' => $xp, 'cards_added' => $added, 'first' => $first]);
    }

    /**
     * GET /api/kotoba/vocab
     */
    public function list_cards(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Card = $ns . 'VocabCard';
        $today = now()->toDateString();
        $base = $Card::where('user_id', $u->id);
        if ($request->filled('lang')) { $base->where('lang', $request->input('lang')); }
        $total = (clone $base)->count();
        $dueCount = (clone $base)->where(function ($q) use ($today) { $q->whereNull('due_date')->orWhere('due_date', '<=', $today); })->count();
        if ($request->input('due') == '1') {
            $base->where(function ($q) use ($today) { $q->whereNull('due_date')->orWhere('due_date', '<=', $today); });
        }
        if ($request->filled('q')) {
            $term = '%' . $request->input('q') . '%';
            $base->where(function ($q) use ($term) { $q->where('term', 'like', $term)->orWhere('meaning', 'like', $term); });
        }
        $rows = $base->orderBy('due_date')->orderBy('id')->limit(200)->get();
        return response()->json(['data' => $rows, 'total' => $total, 'due_count' => $dueCount]);
    }

    /**
     * POST /api/kotoba/vocab
     */
    public function add_card(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Card = $ns . 'VocabCard';
        $data = $request->validate([
            'term' => 'required|string|max:255', 'meaning' => 'required|string|max:255', 'lang' => 'required|string|max:8',
            'example' => 'sometimes|nullable|string|max:500', 'source' => 'sometimes|string|max:16',
        ]);
        $card = $Card::firstOrCreate(
            ['user_id' => $u->id, 'lang' => $data['lang'], 'term' => $data['term']],
            ['meaning' => $data['meaning'], 'example' => $data['example'] ?? null, 'source' => $data['source'] ?? 'manual', 'due_date' => now()->toDateString()]
        );
        return response()->json(['data' => $card, 'created' => $card->wasRecentlyCreated], $card->wasRecentlyCreated ? 201 : 200);
    }

    /**
     * POST /api/kotoba/vocab/{id}/review
     */
    public function review_card(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Card = $ns . 'VocabCard';
        $c = $Card::where('id', (int) $id)->where('user_id', $u->id)->firstOrFail();
        $g = max(0, min(3, (int) $request->input('grade', 2)));
        if ($g === 0) {
            $c->lapses = (int) $c->lapses + 1;
            $c->reps = 0;
            $c->ease = max(1.3, (float) $c->ease - 0.2);
            $c->interval_days = 0;
            $c->due_date = now()->toDateString();
        } else {
            $c->reps = (int) $c->reps + 1;
            if ($c->reps === 1) { $c->interval_days = $g === 3 ? 3 : 1; }
            elseif ($c->reps === 2) { $c->interval_days = $g === 1 ? 2 : ($g === 3 ? 7 : 4); }
            else {
                $mult = $g === 1 ? 1.2 : ($g === 3 ? (float) $c->ease * 1.3 : (float) $c->ease);
                $c->interval_days = max(1, (int) round((int) $c->interval_days * $mult));
            }
            if ($g === 1) { $c->ease = max(1.3, (float) $c->ease - 0.15); }
            if ($g === 3) { $c->ease = (float) $c->ease + 0.15; }
            $c->due_date = now()->addDays((int) $c->interval_days)->toDateString();
        }
        $c->save();
        $this->bump($request, 2, 0);
        return response()->json(['data' => $c]);
    }

    /**
     * DELETE /api/kotoba/vocab/{id}
     */
    public function delete_card(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Card = $ns . 'VocabCard';
        $Card::where('id', (int) $id)->where('user_id', $u->id)->delete();
        return response()->json(['message' => 'Card deleted']);
    }

    /**
     * GET /api/kotoba/partners
     */
    public function partners(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Follow = $ns . 'Follow';
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $following = $Follow::where('follower_id', $u->id)->pluck('following_id')->all();
        $q = $Profile::where('user_id', '!=', $u->id);
        if ($request->input('mode') === 'exchange') { $q->where('native_lang', $me->learning_lang); }
        if ($request->filled('lang')) { $q->where('native_lang', $request->input('lang')); }
        if ($request->filled('q')) {
            $term = '%' . $request->input('q') . '%';
            $q->where(function ($w) use ($term) { $w->where('display_name', 'like', $term)->orWhere('interests', 'like', $term)->orWhere('country', 'like', $term); });
        }
        $mine = array_filter(array_map('trim', explode(',', strtolower((string) $me->interests))));
        $levels = ['A1' => 1, 'A2' => 2, 'B1' => 3, 'B2' => 4, 'C1' => 5, 'C2' => 6];
        $rows = $q->limit(60)->get()->map(function ($p) use ($me, $mine, $following, $levels) {
            $score = 0;
            if ($p->native_lang === $me->learning_lang) { $score += 50; }
            if ($p->learning_lang === $me->native_lang) { $score += 30; }
            $theirs = array_filter(array_map('trim', explode(',', strtolower((string) $p->interests))));
            $shared = array_values(array_intersect($mine, $theirs));
            $score += min(20, count($shared) * 7);
            $score += max(0, 5 - abs(($levels[$p->level] ?? 1) - ($levels[$me->level] ?? 1)));
            return array_merge($p->toArray(), ['score' => min(100, $score), 'shared' => $shared, 'following' => in_array($p->user_id, $following)]);
        })->sortByDesc('score')->values();
        return response()->json(['data' => $rows]);
    }

    /**
     * GET /api/kotoba/profile/{id}
     */
    public function view_profile(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Post = $ns . 'Post'; $Follow = $ns . 'Follow';
        $p = $Profile::where('user_id', (int) $id)->firstOrFail();
        $posts = $Post::where('user_id', $p->user_id)->orderByDesc('id')->limit(5)->get();
        return response()->json([
            'data' => $p,
            'posts' => $posts,
            'followers' => $Follow::where('following_id', $p->user_id)->count(),
            'following_count' => $Follow::where('follower_id', $p->user_id)->count(),
            'following' => $Follow::where('follower_id', $u->id)->where('following_id', $p->user_id)->exists(),
            'post_count' => $Post::where('user_id', $p->user_id)->count(),
        ]);
    }

    /**
     * POST /api/kotoba/follow/{id}
     */
    public function toggle_follow(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Follow = $ns . 'Follow'; $Profile = $ns . 'Profile';
        $target = (int) $id;
        if ($target === (int) $u->id) { return response()->json(['message' => 'You cannot follow yourself'], 422); }
        $existing = $Follow::where('follower_id', $u->id)->where('following_id', $target)->first();
        if ($existing) {
            $existing->delete();
            return response()->json(['following' => false]);
        }
        $Follow::create(['follower_id' => $u->id, 'following_id' => $target]);
        $me = $Profile::where('user_id', $u->id)->first();
        $this->notify($request, $target, 'follow', ($me ? $me->display_name : $u->name) . ' started following you', $u->id);
        return response()->json(['following' => true]);
    }

    /**
     * GET /api/kotoba/conversations
     */
    public function list_conversations(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Conv = $ns . 'Conversation'; $Profile = $ns . 'Profile';
        $rows = $Conv::where('user_a', $u->id)->orWhere('user_b', $u->id)->orderByDesc('last_at')->orderByDesc('id')->get();
        $others = $rows->map(function ($c) use ($u) { return (int) $c->user_a === (int) $u->id ? $c->user_b : $c->user_a; })->all();
        $profiles = $Profile::whereIn('user_id', $others)->get()->keyBy('user_id');
        $data = $rows->map(function ($c) use ($u, $profiles) {
            $other = (int) $c->user_a === (int) $u->id ? $c->user_b : $c->user_a;
            $pr = $profiles->get($other);
            return [
                'id' => $c->id, 'last_message' => $c->last_message, 'last_at' => $c->last_at,
                'with' => $pr ? $pr->toArray() : ['user_id' => $other, 'display_name' => 'Member', 'avatar_color' => '#6b655b'],
            ];
        })->values();
        return response()->json(['data' => $data]);
    }

    /**
     * POST /api/kotoba/conversations
     */
    public function start_conversation(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Conv = $ns . 'Conversation'; $Profile = $ns . 'Profile';
        $data = $request->validate(['user_id' => 'required|integer']);
        $other = (int) $data['user_id'];
        if ($other === (int) $u->id) { return response()->json(['message' => 'Pick someone else to talk to'], 422); }
        $pr = $Profile::where('user_id', $other)->firstOrFail();
        $conv = $Conv::firstOrCreate(['user_a' => min($u->id, $other), 'user_b' => max($u->id, $other)]);
        return response()->json(['data' => ['id' => $conv->id, 'last_message' => $conv->last_message, 'last_at' => $conv->last_at, 'with' => $pr->toArray()]]);
    }

    /**
     * GET /api/kotoba/messages
     */
    public function list_messages(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Conv = $ns . 'Conversation'; $Message = $ns . 'Message'; $Member = $ns . 'CircleMember';
        $q = $Message::query();
        if ($request->filled('conversation_id')) {
            $conv = $Conv::findOrFail((int) $request->input('conversation_id'));
            if ((int) $conv->user_a !== (int) $u->id && (int) $conv->user_b !== (int) $u->id) { return response()->json(['message' => 'Not your conversation'], 403); }
            $q->where('conversation_id', $conv->id);
        } elseif ($request->filled('circle_id')) {
            $cid = (int) $request->input('circle_id');
            if (!$Member::where('circle_id', $cid)->where('user_id', $u->id)->exists()) { return response()->json(['message' => 'Join this circle first'], 403); }
            $q->where('circle_id', $cid);
        } else {
            return response()->json(['message' => 'conversation_id or circle_id required'], 422);
        }
        if ($request->filled('after_id')) { $q->where('id', '>', (int) $request->input('after_id')); }
        $rows = $q->orderByDesc('id')->limit(100)->get()->reverse()->values();
        return response()->json(['data' => $rows]);
    }

    /**
     * POST /api/kotoba/messages
     */
    public function send_message(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Conv = $ns . 'Conversation'; $Message = $ns . 'Message'; $Member = $ns . 'CircleMember';
        $data = $request->validate([
            'body' => 'required|string|max:2000', 'lang' => 'sometimes|nullable|string|max:8',
            'conversation_id' => 'sometimes|nullable|integer', 'circle_id' => 'sometimes|nullable|integer',
        ]);
        $me = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $ids = [];
        $convId = null; $circleId = null;
        if (!empty($data['conversation_id'])) {
            $conv = $Conv::findOrFail((int) $data['conversation_id']);
            if ((int) $conv->user_a !== (int) $u->id && (int) $conv->user_b !== (int) $u->id) { return response()->json(['message' => 'Not your conversation'], 403); }
            $convId = $conv->id;
            $ids = [$conv->user_a, $conv->user_b];
        } elseif (!empty($data['circle_id'])) {
            $circleId = (int) $data['circle_id'];
            if (!$Member::where('circle_id', $circleId)->where('user_id', $u->id)->exists()) { return response()->json(['message' => 'Join this circle first'], 403); }
            $ids = $Member::where('circle_id', $circleId)->pluck('user_id')->all();
        } else {
            return response()->json(['message' => 'conversation_id or circle_id required'], 422);
        }
        $m = $Message::create([
            'conversation_id' => $convId, 'circle_id' => $circleId, 'sender_id' => $u->id, 'sender_name' => $me->display_name,
            'sender_color' => $me->avatar_color, 'body' => $data['body'], 'lang' => $data['lang'] ?? null,
        ]);
        if (isset($conv)) { $conv->update(['last_message' => mb_substr($data['body'], 0, 200), 'last_at' => now()]); }
        $payload = array_merge($m->toArray(), ['scope' => $circleId ? 'circle' : 'dm']);
        foreach ($ids as $rid) {
            if ((int) $rid === (int) $u->id) { continue; }
            try { broadcast(new \App\Events\Arkzen\Kotoba\Broadcast\MessageCreated((int) $rid, $payload)); } catch (\Throwable $e) {}
        }
        $words = max(1, count(preg_split('/\s+/u', trim($data['body']))));
        $this->bump($request, 3, $words, 1);
        return response()->json(['data' => $payload], 201);
    }

    /**
     * POST /api/kotoba/messages/{id}/correct
     */
    public function correct_message(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Conv = $ns . 'Conversation'; $Message = $ns . 'Message'; $Member = $ns . 'CircleMember';
        $data = $request->validate(['corrected' => 'required|string|max:2000', 'note' => 'sometimes|nullable|string|max:500']);
        $m = $Message::findOrFail((int) $id);
        if ((int) $m->sender_id === (int) $u->id) { return response()->json(['message' => 'You cannot correct your own message'], 422); }
        $ids = [];
        if ($m->conversation_id) {
            $conv = $Conv::find($m->conversation_id);
            if ($conv) { $ids = [$conv->user_a, $conv->user_b]; }
        } elseif ($m->circle_id) {
            $ids = $Member::where('circle_id', $m->circle_id)->pluck('user_id')->all();
        }
        if (!in_array($u->id, $ids)) { return response()->json(['message' => 'Not allowed'], 403); }
        $m->update(['corrected' => $data['corrected'], 'note' => $data['note'] ?? null, 'corrected_by' => $u->id]);
        $payload = array_merge($m->fresh()->toArray(), ['scope' => $m->circle_id ? 'circle' : 'dm', 'updated' => true]);
        foreach ($ids as $rid) {
            if ((int) $rid === (int) $u->id) { continue; }
            try { broadcast(new \App\Events\Arkzen\Kotoba\Broadcast\MessageCreated((int) $rid, $payload)); } catch (\Throwable $e) {}
        }
        $me = $Profile::where('user_id', $u->id)->first();
        $this->notify($request, $m->sender_id, 'correction', ($me ? $me->display_name : $u->name) . ' suggested a correction in chat', $m->id);
        $this->bump($request, 10, 0);
        return response()->json(['data' => $payload]);
    }

    /**
     * GET /api/kotoba/circles
     */
    public function list_circles(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Circle = $ns . 'Circle'; $Member = $ns . 'CircleMember';
        $mine = $Member::where('user_id', $u->id)->pluck('circle_id')->all();
        $q = $Circle::query()->orderByDesc('members_count')->orderByDesc('id');
        if ($request->filled('lang')) { $q->where('lang', $request->input('lang')); }
        $rows = $q->limit(60)->get()->map(function ($c) use ($mine) { return array_merge($c->toArray(), ['joined' => in_array($c->id, $mine)]); })->values();
        return response()->json(['data' => $rows]);
    }

    /**
     * POST /api/kotoba/circles
     */
    public function create_circle(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Circle = $ns . 'Circle'; $Member = $ns . 'CircleMember';
        $data = $request->validate([
            'name' => 'required|string|max:80', 'emoji' => 'sometimes|nullable|string|max:24', 'lang' => 'required|string|max:8',
            'level' => 'sometimes|string|in:A1,A2,B1,B2,C1,C2', 'description' => 'sometimes|nullable|string|max:400',
        ]);
        $c = $Circle::create([
            'name' => $data['name'], 'emoji' => $data['emoji'] ?? 'message-circle', 'lang' => $data['lang'], 'level' => $data['level'] ?? 'A1',
            'description' => $data['description'] ?? null, 'owner_id' => $u->id, 'members_count' => 1,
        ]);
        $Member::create(['circle_id' => $c->id, 'user_id' => $u->id]);
        return response()->json(['data' => array_merge($c->toArray(), ['joined' => true])], 201);
    }

    /**
     * POST /api/kotoba/circles/{id}/join
     */
    public function toggle_join(Request $request, mixed ...$params): JsonResponse
    {
        $id = $params[0] ?? null;

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Circle = $ns . 'Circle'; $Member = $ns . 'CircleMember';
        $c = $Circle::findOrFail((int) $id);
        $existing = $Member::where('circle_id', $c->id)->where('user_id', $u->id)->first();
        if ($existing) {
            if ((int) $c->owner_id === (int) $u->id) { return response()->json(['message' => 'Owners cannot leave their own circle'], 422); }
            $existing->delete();
            $c->update(['members_count' => max(1, (int) $c->members_count - 1)]);
            return response()->json(['joined' => false, 'members_count' => (int) $c->fresh()->members_count]);
        }
        $Member::create(['circle_id' => $c->id, 'user_id' => $u->id]);
        $c->update(['members_count' => (int) $c->members_count + 1]);
        return response()->json(['joined' => true, 'members_count' => (int) $c->fresh()->members_count]);
    }

    /**
     * GET /api/kotoba/alerts
     */
    public function list_alerts(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Alert = $ns . 'Alert';
        $rows = $Alert::where('user_id', $u->id)->orderByDesc('id')->limit(40)->get();
        return response()->json(['data' => $rows, 'unread' => $Alert::where('user_id', $u->id)->where('is_read', false)->count()]);
    }

    /**
     * POST /api/kotoba/alerts/read
     */
    public function read_alerts(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Alert = $ns . 'Alert';
        $Alert::where('user_id', $u->id)->where('is_read', false)->update(['is_read' => true]);
        return response()->json(['ok' => true]);
    }

    /**
     * GET /api/kotoba/progress
     */
    public function progress(Request $request, mixed ...$params): JsonResponse
    {

        $u = $request->user();
        $ns = '\\App\\Models\\Arkzen\\Kotoba\\';
        $Profile = $ns . 'Profile'; $Post = $ns . 'Post'; $Message = $ns . 'Message'; $Result = $ns . 'LessonResult';
        $Card = $ns . 'VocabCard'; $Comment = $ns . 'Comment';
        $p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name]);
        $days = [];
        for ($i = 13; $i >= 0; $i--) { $days[now()->subDays($i)->toDateString()] = 0; }
        $since = now()->subDays(13)->startOfDay();
        foreach ($Post::where('user_id', $u->id)->where('created_at', '>=', $since)->get(['created_at']) as $r) {
            $k = substr((string) $r->created_at, 0, 10); if (isset($days[$k])) { $days[$k]++; }
        }
        foreach ($Message::where('sender_id', $u->id)->where('created_at', '>=', $since)->get(['created_at']) as $r) {
            $k = substr((string) $r->created_at, 0, 10); if (isset($days[$k])) { $days[$k]++; }
        }
        foreach ($Result::where('user_id', $u->id)->where('updated_at', '>=', $since)->get(['updated_at']) as $r) {
            $k = substr((string) $r->updated_at, 0, 10); if (isset($days[$k])) { $days[$k]++; }
        }
        $series = [];
        foreach ($days as $d => $n) { $series[] = ['date' => $d, 'count' => $n]; }
        $myPosts = $Post::where('user_id', $u->id)->pluck('id')->all();
        $stats = [
            'cards' => $Card::where('user_id', $u->id)->count(),
            'mastered' => $Card::where('user_id', $u->id)->where('reps', '>=', 4)->count(),
            'lessons' => $Result::where('user_id', $u->id)->count(),
            'posts' => count($myPosts),
            'corrections_given' => $Comment::where('user_id', $u->id)->where('is_correction', true)->count(),
            'corrections_received' => $Comment::where('is_correction', true)->whereIn('post_id', $myPosts)->count(),
            'corrections_accepted' => $Comment::where('is_correction', true)->where('accepted', true)->whereIn('post_id', $myPosts)->count(),
            'words_written' => (int) $p->words_written,
            'messages_sent' => (int) $p->messages_sent,
        ];
        return response()->json(['profile' => $p, 'series' => $series, 'stats' => $stats, 'level' => (int) floor(((int) $p->xp) / 100) + 1, 'level_progress' => ((int) $p->xp) % 100]);
    }

}
