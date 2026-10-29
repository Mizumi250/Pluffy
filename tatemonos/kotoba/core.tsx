/* @arkzen:meta
name: kotoba
version: 1.0.0
description: "Kotoba — a social language-learning network. Learn by using the language: daily missions, a community feed with native-speaker corrections, spaced-repetition vocab built from what you actually read and write, short lessons, partner matching, 1:1 and group chat with in-message corrections, and honest progress tracking."
auth: true
auth_seed:
  users:
    - { name: Aiko Tanaka, email: aiko@kotoba.app, password: password123 }
    - { name: Mateo Rivera, email: mateo@kotoba.app, password: password123 }
    - { name: Sofia Laurent, email: sofia@kotoba.app, password: password123 }
    - { name: Demo Learner, email: demo@kotoba.app, password: password123 }
*/

/* @arkzen:meta:web
favicon: "https://api.iconify.design/lucide/languages.svg?color=%23121212"
title: Kotoba — Learn languages with real people
description: A social language-learning network. Daily missions, native-speaker corrections, spaced repetition and real conversations.
*/

/* @arkzen:meta:native
label: Kotoba
description: Learn languages with real people
expo:
  bundle_id: com.kotoba.app
  scheme: kotoba
  version: 1.0.0
  orientation: portrait
  status_bar_style: dark
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
*/

/* @arkzen:native:config
theme:
  primary: "#121212"
  background: "#e9e4da"
  surface: "#f5f1e9"
  text: "#121212"
  muted: "#6b655b"
*/

/* @arkzen:desktop:config
window:
  width: 1280
  height: 840
  min_width: 960
  min_height: 640
  resizable: true
  fullscreenable: true
  title: Kotoba
*/

/* @arkzen:database:profiles
table: profiles
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_id: { type: integer, nullable: false, unique: true }
  display_name: { type: string, length: 80, nullable: false }
  bio: { type: text, nullable: true }
  native_lang: { type: string, length: 8, default: en }
  learning_lang: { type: string, length: 8, default: es }
  level: { type: string, length: 4, default: A1 }
  country: { type: string, length: 80, nullable: true }
  interests: { type: string, length: 500, nullable: true }
  avatar_color: { type: string, length: 16, default: "#121212" }
  xp: { type: integer, default: 0 }
  streak: { type: integer, default: 0 }
  best_streak: { type: integer, default: 0 }
  last_active: { type: date, nullable: true }
  daily_goal: { type: integer, default: 3 }
  words_written: { type: integer, default: 0 }
  messages_sent: { type: integer, default: 0 }
  onboarded: { type: boolean, default: false }
*/

/* @arkzen:database:posts
table: posts
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_id: { type: integer, nullable: false }
  author_name: { type: string, length: 80, nullable: false }
  author_color: { type: string, length: 16, nullable: true }
  author_native: { type: string, length: 8, nullable: true }
  lang: { type: string, length: 8, nullable: false }
  kind: { type: string, length: 16, default: moment }
  mission_id: { type: integer, nullable: true }
  body: { type: text, nullable: false }
  translation: { type: text, nullable: true }
  likes_count: { type: integer, default: 0 }
  comments_count: { type: integer, default: 0 }
  corrections_count: { type: integer, default: 0 }
*/

/* @arkzen:database:comments
table: comments
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  post_id: { type: integer, nullable: false }
  user_id: { type: integer, nullable: false }
  author_name: { type: string, length: 80, nullable: false }
  author_color: { type: string, length: 16, nullable: true }
  body: { type: text, nullable: false }
  is_correction: { type: boolean, default: false }
  corrected: { type: text, nullable: true }
  explanation: { type: text, nullable: true }
  accepted: { type: boolean, default: false }
*/

/* @arkzen:database:likes
table: likes
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  post_id: { type: integer, nullable: false }
  user_id: { type: integer, nullable: false }
indexes:
  - { columns: [post_id, user_id], unique: true }
*/

/* @arkzen:database:follows
table: follows
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  follower_id: { type: integer, nullable: false }
  following_id: { type: integer, nullable: false }
indexes:
  - { columns: [follower_id, following_id], unique: true }
*/

/* @arkzen:database:missions
table: missions
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  lang: { type: string, length: 8, default: any }
  level: { type: string, length: 4, default: A1 }
  title: { type: string, length: 120, nullable: false }
  prompt: { type: text, nullable: false }
  hint: { type: text, nullable: true }
  position: { type: integer, default: 0 }
seeder:
  count: 7
  data:
    - { lang: any, level: A1, title: "Introduce yourself", prompt: "Tell the community who you are, where you live and one thing you love doing. Write at least three sentences in your target language.", hint: "Start simple: your name, your city, one hobby. Short and correct beats long and messy.", position: 1 }
    - { lang: any, level: A1, title: "Your morning", prompt: "Describe what you did this morning, step by step, from waking up to leaving the house.", hint: "Use time words: first, then, after that. Present or past tense is fine.", position: 2 }
    - { lang: any, level: A1, title: "A place you love", prompt: "Describe a place that makes you feel at home. What does it look like, sound like and smell like?", hint: "Try to use at least three adjectives you learned this week.", position: 3 }
    - { lang: any, level: A2, title: "Dinner tonight", prompt: "What are you eating or cooking tonight? Explain it as if you were telling a friend on the phone.", hint: "Food words stick best when you attach a real memory to them.", position: 4 }
    - { lang: any, level: A2, title: "Ask the community", prompt: "Ask one real question you are curious about and invite native speakers to answer it.", hint: "Real curiosity gets real answers. Avoid yes or no questions.", position: 5 }
    - { lang: any, level: A2, title: "A small win", prompt: "Share one small thing that went well this week and why it made you happy.", hint: "Use because and so to connect your ideas.", position: 6 }
    - { lang: any, level: B1, title: "Change my mind", prompt: "Share a mild opinion you hold, for example about food, travel or music, and give two reasons for it.", hint: "Opinions need connectors: however, because, in fact.", position: 7 }
*/

/* @arkzen:database:lessons
table: lessons
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  lang: { type: string, length: 8, nullable: false }
  unit: { type: string, length: 80, nullable: false }
  title: { type: string, length: 120, nullable: false }
  emoji: { type: string, length: 24, nullable: true }
  level: { type: string, length: 4, default: A1 }
  position: { type: integer, default: 0 }
  xp: { type: integer, default: 15 }
  content: { type: longText, nullable: false }
seeder:
  count: 9
  data:
    - lang: es
      unit: Basics
      title: Greetings
      emoji: hand
      level: A1
      position: 1
      xp: 15
      content: '{"ex":[{"t":"choose","q":"Which word means hello?","o":["Hola","Gracias","Adios"],"a":0},{"t":"choose","q":"How do you say good morning?","o":["Buenas noches","Buenos dias","Buenas tardes"],"a":1},{"t":"type","q":"Type in Spanish: thank you","a":["gracias"]},{"t":"order","q":"Build: My name is Ana","w":["Me","llamo","Ana"],"a":"Me llamo Ana"},{"t":"match","p":[["hello","hola"],["goodbye","adios"],["please","por favor"],["thank you","gracias"]]}],"v":[["hola","hello"],["adios","goodbye"],["por favor","please"],["gracias","thank you"],["buenos dias","good morning"],["me llamo","my name is"]]}'
    - lang: es
      unit: Basics
      title: Introductions
      emoji: handshake
      level: A1
      position: 2
      xp: 15
      content: '{"ex":[{"t":"choose","q":"How do you ask: how are you?","o":["Como estas?","Donde estas?","Que es eso?"],"a":0},{"t":"choose","q":"Mucho gusto means...","o":["Nice to meet you","See you later","I am hungry"],"a":0},{"t":"type","q":"Type in Spanish: I am a student","a":["soy estudiante","soy un estudiante","soy una estudiante"]},{"t":"order","q":"Build: I am from Mexico","w":["Soy","de","Mexico"],"a":"Soy de Mexico"},{"t":"match","p":[["where","donde"],["from","de"],["friend","amigo"],["name","nombre"]]}],"v":[["como estas","how are you"],["mucho gusto","nice to meet you"],["soy de","I am from"],["amigo","friend"],["nombre","name"]]}'
    - lang: es
      unit: Food
      title: At the cafe
      emoji: coffee
      level: A1
      position: 3
      xp: 20
      content: '{"ex":[{"t":"choose","q":"Which word means water?","o":["Agua","Leche","Cafe"],"a":0},{"t":"choose","q":"How do you ask for the bill?","o":["La cuenta, por favor","Una mesa, por favor","El menu, por favor"],"a":0},{"t":"type","q":"Type in Spanish: coffee","a":["cafe"]},{"t":"order","q":"Build: I would like a coffee","w":["Quisiera","un","cafe"],"a":"Quisiera un cafe"},{"t":"match","p":[["bread","pan"],["milk","leche"],["water","agua"],["coffee","cafe"]]}],"v":[["agua","water"],["leche","milk"],["pan","bread"],["cafe","coffee"],["la cuenta","the bill"]]}'
    - lang: ja
      unit: Basics
      title: Greetings
      emoji: flower
      level: A1
      position: 1
      xp: 15
      content: '{"ex":[{"t":"choose","q":"Which means hello?","o":["こんにちは","さようなら","ありがとう"],"a":0},{"t":"choose","q":"Arigatou means...","o":["Thank you","Sorry","Good night"],"a":0},{"t":"type","q":"Type in romaji: good morning (ohayou)","a":["ohayou","ohayo"]},{"t":"choose","q":"Which is used to say excuse me or sorry?","o":["すみません","おやすみ","いただきます"],"a":0},{"t":"match","p":[["hello","こんにちは"],["thank you","ありがとう"],["goodbye","さようなら"],["good morning","おはよう"]]}],"v":[["こんにちは","hello"],["ありがとう","thank you"],["さようなら","goodbye"],["おはよう","good morning"],["すみません","excuse me / sorry"]]}'
    - lang: ja
      unit: Basics
      title: Introductions
      emoji: users
      level: A1
      position: 2
      xp: 15
      content: '{"ex":[{"t":"choose","q":"How do you say: I am Mika?","o":["わたしはミカです","ミカはどこですか","ありがとうミカ"],"a":0},{"t":"choose","q":"Hajimemashite means...","o":["Nice to meet you (first time)","See you tomorrow","Delicious"],"a":0},{"t":"order","q":"Build: I am a student","w":["わたしは","がくせい","です"],"a":"わたしはがくせいです"},{"t":"match","p":[["I","わたし"],["student","がくせい"],["teacher","せんせい"],["friend","ともだち"]]},{"t":"type","q":"Type in romaji: friend (tomodachi)","a":["tomodachi"]}],"v":[["わたし","I"],["がくせい","student"],["せんせい","teacher"],["ともだち","friend"],["はじめまして","nice to meet you"]]}'
    - lang: ja
      unit: Food
      title: Food and drink
      emoji: utensils
      level: A1
      position: 3
      xp: 20
      content: '{"ex":[{"t":"choose","q":"Which means water?","o":["みず","おちゃ","ごはん"],"a":0},{"t":"choose","q":"Itadakimasu is said...","o":["Before eating","After eating","When leaving"],"a":0},{"t":"match","p":[["rice","ごはん"],["tea","おちゃ"],["water","みず"],["fish","さかな"]]},{"t":"type","q":"Type in romaji: delicious (oishii)","a":["oishii"]},{"t":"order","q":"Build: Water, please","w":["みずを","ください"],"a":"みずをください"}],"v":[["みず","water"],["おちゃ","tea"],["ごはん","rice / meal"],["さかな","fish"],["おいしい","delicious"]]}'
    - lang: en
      unit: Conversation
      title: Greetings and small talk
      emoji: message-circle
      level: A1
      position: 1
      xp: 15
      content: '{"ex":[{"t":"choose","q":"Which is a polite greeting?","o":["Nice to meet you","Give me that","Go away"],"a":0},{"t":"choose","q":"How would you answer: How are you?","o":["I am fine, thanks. And you?","I am twenty","At the station"],"a":0},{"t":"type","q":"Type the missing word: Nice to ___ you.","a":["meet"]},{"t":"order","q":"Build: Where are you from","w":["Where","are","you","from"],"a":"Where are you from"},{"t":"match","p":[["Good morning","before noon"],["Good evening","after sunset"],["Good night","before bed"]]}],"v":[["nice to meet you","a polite first greeting"],["where are you from","asking about someone origin"],["how are you","asking about wellbeing"]]}'
    - lang: en
      unit: Everyday life
      title: Daily routine
      emoji: clock
      level: A2
      position: 2
      xp: 20
      content: '{"ex":[{"t":"choose","q":"Pick the correct sentence.","o":["She wakes up at six.","She wake up at six.","She waking up at six."],"a":0},{"t":"type","q":"Type the missing word: I usually ___ breakfast at home. (eat / have)","a":["eat","have"]},{"t":"order","q":"Build: I go to work by bus","w":["I","go","to","work","by","bus"],"a":"I go to work by bus"},{"t":"choose","q":"Which word shows how often?","o":["Usually","Yesterday","Because"],"a":0},{"t":"match","p":[["wake up","start the day"],["commute","travel to work"],["brush","clean teeth"],["sleep","rest at night"]]}],"v":[["usually","most of the time"],["commute","travel to work or school"],["wake up","stop sleeping"]]}'
    - lang: en
      unit: Everyday life
      title: Talking about the past
      emoji: history
      level: A2
      position: 3
      xp: 20
      content: '{"ex":[{"t":"choose","q":"Past of go?","o":["went","goed","gone"],"a":0},{"t":"choose","q":"Past of eat?","o":["ate","eated","eaten"],"a":0},{"t":"type","q":"Type the past tense of play","a":["played"]},{"t":"order","q":"Build: We watched a movie yesterday","w":["We","watched","a","movie","yesterday"],"a":"We watched a movie yesterday"},{"t":"type","q":"Type the past tense of buy","a":["bought"]}],"v":[["went","past of go"],["ate","past of eat"],["bought","past of buy"],["watched","past of watch"]]}'
*/

/* @arkzen:database:lesson_results
table: lesson_results
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_id: { type: integer, nullable: false }
  lesson_id: { type: integer, nullable: false }
  score: { type: integer, default: 0 }
  best: { type: integer, default: 0 }
indexes:
  - { columns: [user_id, lesson_id], unique: true }
*/

/* @arkzen:database:vocab_cards
table: vocab_cards
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_id: { type: integer, nullable: false }
  lang: { type: string, length: 8, nullable: false }
  term: { type: string, length: 255, nullable: false }
  meaning: { type: string, length: 255, nullable: false }
  example: { type: text, nullable: true }
  source: { type: string, length: 16, default: manual }
  ease: { type: float, default: 2.5 }
  interval_days: { type: integer, default: 0 }
  reps: { type: integer, default: 0 }
  lapses: { type: integer, default: 0 }
  due_date: { type: date, nullable: true }
*/

/* @arkzen:database:conversations
table: conversations
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_a: { type: integer, nullable: false }
  user_b: { type: integer, nullable: false }
  last_message: { type: text, nullable: true }
  last_at: { type: datetime, nullable: true }
indexes:
  - { columns: [user_a, user_b], unique: true }
*/

/* @arkzen:database:messages
table: messages
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  conversation_id: { type: integer, nullable: true }
  circle_id: { type: integer, nullable: true }
  sender_id: { type: integer, nullable: false }
  sender_name: { type: string, length: 80, nullable: false }
  sender_color: { type: string, length: 16, nullable: true }
  body: { type: text, nullable: false }
  lang: { type: string, length: 8, nullable: true }
  corrected: { type: text, nullable: true }
  note: { type: text, nullable: true }
  corrected_by: { type: integer, nullable: true }
*/

/* @arkzen:database:circles
table: circles
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  name: { type: string, length: 80, nullable: false }
  emoji: { type: string, length: 24, default: "message-circle" }
  lang: { type: string, length: 8, nullable: false }
  level: { type: string, length: 4, default: A1 }
  description: { type: text, nullable: true }
  owner_id: { type: integer, nullable: false }
  members_count: { type: integer, default: 1 }
  weekly_goal: { type: integer, default: 50 }
*/

/* @arkzen:database:circle_members
table: circle_members
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  circle_id: { type: integer, nullable: false }
  user_id: { type: integer, nullable: false }
indexes:
  - { columns: [circle_id, user_id], unique: true }
*/

/* @arkzen:database:alerts
table: alerts
timestamps: true
columns:
  id: { type: integer, primary: true, autoIncrement: true }
  user_id: { type: integer, nullable: false }
  kind: { type: string, length: 24, nullable: false }
  text: { type: string, length: 500, nullable: false }
  ref: { type: integer, nullable: true }
  is_read: { type: boolean, default: false }
*/

/* @arkzen:api:profiles
model: Profile
controller: ProfileController
prefix: /api/kotoba/x/profiles
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:posts
model: Post
controller: PostController
prefix: /api/kotoba/x/posts
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:comments
model: Comment
controller: CommentController
prefix: /api/kotoba/x/comments
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:likes
model: Like
controller: LikeController
prefix: /api/kotoba/x/likes
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:follows
model: Follow
controller: FollowController
prefix: /api/kotoba/x/follows
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:missions
model: Mission
controller: MissionController
prefix: /api/kotoba/x/missions
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:lessons
model: Lesson
controller: LessonController
prefix: /api/kotoba/x/lessons
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:lesson_results
model: LessonResult
controller: LessonResultController
prefix: /api/kotoba/x/lesson-results
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:vocab_cards
model: VocabCard
controller: VocabCardController
prefix: /api/kotoba/x/vocab-cards
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:conversations
model: Conversation
controller: ConversationController
prefix: /api/kotoba/x/conversations
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:messages
model: Message
controller: MessageController
prefix: /api/kotoba/x/messages
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:circles
model: Circle
controller: CircleController
prefix: /api/kotoba/x/circles
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:circle_members
model: CircleMember
controller: CircleMemberController
prefix: /api/kotoba/x/circle-members
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:api:alerts
model: Alert
controller: AlertController
prefix: /api/kotoba/x/alerts
middleware: [auth:sanctum]
endpoints:
  status: { method: GET, route: /status, description: Reserved, response: { type: message, value: ok } }
*/

/* @arkzen:realtime:kotoba.{id}
type: private
auth: owner
*/
/* @arkzen:realtime:kotoba.{id}:end */

/* @arkzen:realtime:message-created
channel: kotoba.{id}
type: private
*/
/* @arkzen:realtime:message-created:end */

/* @arkzen:realtime:alert-created
channel: kotoba.{id}
type: private
*/
/* @arkzen:realtime:alert-created:end */

/* @arkzen:routes
controller: KotobaController
middleware: [auth:sanctum]
routes:
  - { method: GET,    route: /api/kotoba/me,                    handler: me }
  - { method: PUT,    route: /api/kotoba/me,                    handler: update_me }
  - { method: GET,    route: /api/kotoba/home,                  handler: home }
  - { method: POST,   route: /api/kotoba/activity,              handler: bump }
  - { method: POST,   route: /api/kotoba/internal/notify,       handler: notify }
  - { method: POST,   route: /api/kotoba/internal/seed,         handler: community_seed }
  - { method: GET,    route: /api/kotoba/feed,                  handler: feed }
  - { method: POST,   route: /api/kotoba/posts,                 handler: create_post }
  - { method: DELETE, route: "/api/kotoba/posts/{id}",            handler: delete_post }
  - { method: POST,   route: "/api/kotoba/posts/{id}/like",       handler: toggle_like }
  - { method: GET,    route: "/api/kotoba/posts/{id}/comments",   handler: list_comments }
  - { method: POST,   route: "/api/kotoba/posts/{id}/comments",   handler: add_comment }
  - { method: POST,   route: "/api/kotoba/comments/{id}/accept",  handler: accept_correction }
  - { method: GET,    route: /api/kotoba/lessons,               handler: list_lessons }
  - { method: POST,   route: "/api/kotoba/lessons/{id}/complete", handler: complete_lesson }
  - { method: GET,    route: /api/kotoba/vocab,                 handler: list_cards }
  - { method: POST,   route: /api/kotoba/vocab,                 handler: add_card }
  - { method: POST,   route: "/api/kotoba/vocab/{id}/review",     handler: review_card }
  - { method: DELETE, route: "/api/kotoba/vocab/{id}",            handler: delete_card }
  - { method: GET,    route: /api/kotoba/partners,              handler: partners }
  - { method: GET,    route: "/api/kotoba/profile/{id}",          handler: view_profile }
  - { method: POST,   route: "/api/kotoba/follow/{id}",           handler: toggle_follow }
  - { method: GET,    route: /api/kotoba/conversations,         handler: list_conversations }
  - { method: POST,   route: /api/kotoba/conversations,         handler: start_conversation }
  - { method: GET,    route: /api/kotoba/messages,              handler: list_messages }
  - { method: POST,   route: /api/kotoba/messages,              handler: send_message }
  - { method: POST,   route: "/api/kotoba/messages/{id}/correct", handler: correct_message }
  - { method: GET,    route: /api/kotoba/circles,               handler: list_circles }
  - { method: POST,   route: /api/kotoba/circles,               handler: create_circle }
  - { method: POST,   route: "/api/kotoba/circles/{id}/join",     handler: toggle_join }
  - { method: GET,    route: /api/kotoba/alerts,                handler: list_alerts }
  - { method: POST,   route: /api/kotoba/alerts/read,           handler: read_alerts }
  - { method: GET,    route: /api/kotoba/progress,              handler: progress }
*/

/* @arkzen:handler:me
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Profile = $ns . 'Profile';
$Post = $ns . 'Post';
if ($Post::count() === 0) { $this->community_seed($request); }
$palette = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a'];
$p = $Profile::firstOrCreate(['user_id' => $u->id], ['display_name' => $u->name, 'avatar_color' => $palette[$u->id % count($palette)]]);
return response()->json(['data' => $p, 'user' => ['id' => $u->id, 'name' => $u->name, 'email' => $u->email]]);
/* @arkzen:handler:me:end */

/* @arkzen:handler:update_me
*/
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
/* @arkzen:handler:update_me:end */

/* @arkzen:handler:bump
*/
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
/* @arkzen:handler:bump:end */

/* @arkzen:handler:notify
*/
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
/* @arkzen:handler:notify:end */

/* @arkzen:handler:community_seed
*/
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
/* @arkzen:handler:community_seed:end */

/* @arkzen:handler:home
*/
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
/* @arkzen:handler:home:end */

/* @arkzen:handler:feed
*/
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
/* @arkzen:handler:feed:end */

/* @arkzen:handler:create_post
*/
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
/* @arkzen:handler:create_post:end */

/* @arkzen:handler:delete_post
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Post = $ns . 'Post';
$post = $Post::where('id', (int) $id)->where('user_id', $u->id)->firstOrFail();
$post->delete();
return response()->json(['message' => 'Post deleted']);
/* @arkzen:handler:delete_post:end */

/* @arkzen:handler:toggle_like
*/
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
/* @arkzen:handler:toggle_like:end */

/* @arkzen:handler:list_comments
*/
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Comment = $ns . 'Comment';
$rows = $Comment::where('post_id', (int) $id)->orderBy('id')->get();
return response()->json(['data' => $rows]);
/* @arkzen:handler:list_comments:end */

/* @arkzen:handler:add_comment
*/
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
/* @arkzen:handler:add_comment:end */

/* @arkzen:handler:accept_correction
*/
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
/* @arkzen:handler:accept_correction:end */

/* @arkzen:handler:list_lessons
*/
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
/* @arkzen:handler:list_lessons:end */

/* @arkzen:handler:complete_lesson
*/
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
/* @arkzen:handler:complete_lesson:end */

/* @arkzen:handler:list_cards
*/
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
/* @arkzen:handler:list_cards:end */

/* @arkzen:handler:add_card
*/
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
/* @arkzen:handler:add_card:end */

/* @arkzen:handler:review_card
*/
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
/* @arkzen:handler:review_card:end */

/* @arkzen:handler:delete_card
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Card = $ns . 'VocabCard';
$Card::where('id', (int) $id)->where('user_id', $u->id)->delete();
return response()->json(['message' => 'Card deleted']);
/* @arkzen:handler:delete_card:end */

/* @arkzen:handler:partners
*/
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
/* @arkzen:handler:partners:end */

/* @arkzen:handler:view_profile
*/
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
/* @arkzen:handler:view_profile:end */

/* @arkzen:handler:toggle_follow
*/
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
/* @arkzen:handler:toggle_follow:end */

/* @arkzen:handler:list_conversations
*/
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
/* @arkzen:handler:list_conversations:end */

/* @arkzen:handler:start_conversation
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Conv = $ns . 'Conversation'; $Profile = $ns . 'Profile';
$data = $request->validate(['user_id' => 'required|integer']);
$other = (int) $data['user_id'];
if ($other === (int) $u->id) { return response()->json(['message' => 'Pick someone else to talk to'], 422); }
$pr = $Profile::where('user_id', $other)->firstOrFail();
$conv = $Conv::firstOrCreate(['user_a' => min($u->id, $other), 'user_b' => max($u->id, $other)]);
return response()->json(['data' => ['id' => $conv->id, 'last_message' => $conv->last_message, 'last_at' => $conv->last_at, 'with' => $pr->toArray()]]);
/* @arkzen:handler:start_conversation:end */

/* @arkzen:handler:list_messages
*/
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
/* @arkzen:handler:list_messages:end */

/* @arkzen:handler:send_message
*/
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
/* @arkzen:handler:send_message:end */

/* @arkzen:handler:correct_message
*/
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
/* @arkzen:handler:correct_message:end */

/* @arkzen:handler:list_circles
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Circle = $ns . 'Circle'; $Member = $ns . 'CircleMember';
$mine = $Member::where('user_id', $u->id)->pluck('circle_id')->all();
$q = $Circle::query()->orderByDesc('members_count')->orderByDesc('id');
if ($request->filled('lang')) { $q->where('lang', $request->input('lang')); }
$rows = $q->limit(60)->get()->map(function ($c) use ($mine) { return array_merge($c->toArray(), ['joined' => in_array($c->id, $mine)]); })->values();
return response()->json(['data' => $rows]);
/* @arkzen:handler:list_circles:end */

/* @arkzen:handler:create_circle
*/
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
/* @arkzen:handler:create_circle:end */

/* @arkzen:handler:toggle_join
*/
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
/* @arkzen:handler:toggle_join:end */

/* @arkzen:handler:list_alerts
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Alert = $ns . 'Alert';
$rows = $Alert::where('user_id', $u->id)->orderByDesc('id')->limit(40)->get();
return response()->json(['data' => $rows, 'unread' => $Alert::where('user_id', $u->id)->where('is_read', false)->count()]);
/* @arkzen:handler:list_alerts:end */

/* @arkzen:handler:read_alerts
*/
$u = $request->user();
$ns = '\\App\\Models\\Arkzen\\Kotoba\\';
$Alert = $ns . 'Alert';
$Alert::where('user_id', $u->id)->where('is_read', false)->update(['is_read' => true]);
return response()->json(['ok' => true]);
/* @arkzen:handler:read_alerts:end */

/* @arkzen:handler:progress
*/
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
/* @arkzen:handler:progress:end */

/* @arkzen:web:style */
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=Noto+Serif+JP:wght@500;700&display=swap');
:root {
  --kt-bg: #e9e4da; --kt-surface: #f5f1e9; --kt-surface2: #e0d9cb; --kt-text: #121212; --kt-sub: #6b655b;
  --kt-line: rgba(18, 18, 18, 0.12); --kt-blue: #121212; --kt-on-blue: #f5f1e9; --kt-green: #3f6b4f; --kt-orange: #8a6a2f;
  --kt-red: #9b3b34; --kt-purple: #4a4a4a; --kt-glass: rgba(233, 228, 218, 0.82); --kt-dark: #121212; --kt-on-dark: #efe9dc;
  --kt-shadow: 0 1px 2px rgba(18, 18, 18, 0.04), 0 14px 40px rgba(18, 18, 18, 0.07);
  --kt-logo-filter: none;
  --kt-paper: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .2 0 0 0 0 .18 0 0 0 0 .14 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  --kt-font: 'Plus Jakarta Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
  --kt-serif: 'Noto Serif JP', 'Hiragino Mincho ProN', 'Yu Mincho', serif;
  --kt-ease: cubic-bezier(0.2, 0.8, 0.2, 1);
}
@media (prefers-color-scheme: dark) {
  :root {
    --kt-bg: #0e0d0b; --kt-surface: #1a1916; --kt-surface2: #2a2824; --kt-text: #efe9dc; --kt-sub: #a39c8f;
    --kt-line: rgba(239, 233, 220, 0.14); --kt-blue: #efe9dc; --kt-on-blue: #121212; --kt-green: #7fb08f; --kt-orange: #c9a45f;
    --kt-red: #d9776e; --kt-purple: #b8b8b8; --kt-glass: rgba(14, 13, 11, 0.82); --kt-dark: #efe9dc; --kt-on-dark: #121212;
    --kt-shadow: 0 1px 2px rgba(0, 0, 0, 0.4), 0 14px 40px rgba(0, 0, 0, 0.5);
    --kt-logo-filter: invert(1);
  }
}
.kt-shell { display: flex; min-height: 100vh; background-color: var(--kt-bg); background-image: var(--kt-paper); color: var(--kt-text); font-family: var(--kt-font); -webkit-font-smoothing: antialiased; }
.kt-shell * { box-sizing: border-box; }
.kt-logo { width: 28px; height: 28px; display: block; filter: var(--kt-logo-filter); }
.kt-side { width: 264px; flex-shrink: 0; position: sticky; top: 0; height: 100vh; padding: 24px 16px; display: flex; flex-direction: column; gap: 4px; background: var(--kt-glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border-right: 1px solid var(--kt-line); }
.kt-brand { display: flex; align-items: center; gap: 10px; padding: 6px 12px 22px; font-size: 20px; font-weight: 800; letter-spacing: -0.03em; }
.kt-nav { display: flex; align-items: center; gap: 12px; padding: 11px 14px; border-radius: 999px; font-family: inherit; font-size: 15px; font-weight: 500; color: var(--kt-text); cursor: pointer; border: 0; background: transparent; width: 100%; text-align: left; transition: background 0.15s var(--kt-ease), color 0.15s var(--kt-ease); }
.kt-nav:hover { background: var(--kt-surface2); }
.kt-nav.active { background: var(--kt-blue); color: var(--kt-on-blue); }
.kt-main { flex: 1; min-width: 0; width: 100%; max-width: 1040px; margin: 0 auto; padding: 40px 44px 96px; animation: kt-in 0.4s var(--kt-ease); }
@keyframes kt-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.kt-tabbar { display: none; }
.kt-title { font-size: 40px; line-height: 1.05; font-weight: 800; letter-spacing: -0.04em; margin: 0; }
.kt-subtitle { font-size: 17px; font-weight: 400; color: var(--kt-sub); margin: 8px 0 0; line-height: 1.5; }
.kt-h2 { font-size: 22px; font-weight: 700; letter-spacing: -0.025em; margin: 0; }
.kt-head { display: flex; align-items: flex-end; justify-content: space-between; gap: 16px; margin-bottom: 28px; flex-wrap: wrap; }
.kt-sub { color: var(--kt-sub); font-size: 14px; font-weight: 400; }
.kt-card { background: var(--kt-surface); border-radius: 28px; box-shadow: var(--kt-shadow); padding: 22px; border: 1px solid var(--kt-line); }
.kt-card.flat { box-shadow: none; background: transparent; border-style: dashed; }
.kt-card.dark { background: var(--kt-dark); color: var(--kt-on-dark); border-color: transparent; }
.kt-card.dark .kt-sub { color: var(--kt-on-dark); opacity: 0.6; }
.kt-grid { display: grid; gap: 16px; }
.kt-grid.c2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.kt-grid.c3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.kt-grid.c4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
.kt-stack { display: flex; flex-direction: column; gap: 14px; }
.kt-row { display: flex; align-items: center; gap: 12px; }
.kt-between { justify-content: space-between; }
.kt-wrap { flex-wrap: wrap; }
.kt-btn { display: inline-flex; align-items: center; justify-content: center; gap: 8px; height: 46px; padding: 0 24px; border-radius: 999px; border: 0; font-family: inherit; font-size: 15px; font-weight: 600; cursor: pointer; transition: transform 0.15s var(--kt-ease), opacity 0.15s, background 0.15s; background: var(--kt-surface2); color: var(--kt-text); }
.kt-btn:active { transform: scale(0.97); }
.kt-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.kt-btn.primary { background: var(--kt-blue); color: var(--kt-on-blue); }
.kt-btn.tint { background: transparent; color: var(--kt-text); box-shadow: inset 0 0 0 1.5px var(--kt-text); }
.kt-btn.ghost { background: transparent; color: var(--kt-text); }
.kt-btn.danger { background: transparent; color: var(--kt-red); box-shadow: inset 0 0 0 1.5px var(--kt-red); }
.kt-btn.sm { height: 36px; padding: 0 16px; font-size: 14px; }
.kt-btn.block { width: 100%; }
.kt-icon-btn { width: 38px; height: 38px; border-radius: 50%; border: 0; display: inline-grid; place-items: center; background: var(--kt-surface2); color: var(--kt-text); cursor: pointer; position: relative; font-family: inherit; }
.kt-fab { width: 64px; height: 64px; border-radius: 50%; border: 0; display: inline-grid; place-items: center; background: var(--kt-dark); color: var(--kt-on-dark); cursor: pointer; transition: transform 0.2s var(--kt-ease); }
.kt-fab:hover { transform: scale(1.05); }
.kt-input, .kt-textarea, .kt-select { width: 100%; border: 1px solid var(--kt-line); background: var(--kt-surface); color: var(--kt-text); border-radius: 18px; padding: 13px 16px; font-family: inherit; font-size: 16px; outline: none; transition: border-color 0.15s, box-shadow 0.15s; }
.kt-input:focus, .kt-textarea:focus, .kt-select:focus { border-color: var(--kt-text); box-shadow: 0 0 0 4px var(--kt-line); }
.kt-textarea { resize: vertical; min-height: 96px; line-height: 1.5; }
.kt-label { display: block; font-size: 11px; font-weight: 600; color: var(--kt-sub); margin: 0 0 8px 4px; text-transform: uppercase; letter-spacing: 0.1em; }
.kt-seg { display: inline-flex; padding: 4px; border-radius: 999px; background: var(--kt-surface2); gap: 2px; max-width: 100%; overflow-x: auto; }
.kt-seg button { border: 0; background: transparent; color: var(--kt-text); font-family: inherit; font-size: 14px; font-weight: 500; padding: 8px 16px; border-radius: 999px; cursor: pointer; white-space: nowrap; transition: background 0.2s var(--kt-ease); }
.kt-seg button.on { background: var(--kt-blue); color: var(--kt-on-blue); font-weight: 600; }
.kt-chip { display: inline-flex; align-items: center; gap: 6px; padding: 5px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; background: var(--kt-surface2); color: var(--kt-sub); }
.kt-chip.blue { background: var(--kt-blue); color: var(--kt-on-blue); }
.kt-chip.green { background: transparent; color: var(--kt-green); box-shadow: inset 0 0 0 1.5px var(--kt-green); }
.kt-chip.orange { background: transparent; color: var(--kt-orange); box-shadow: inset 0 0 0 1.5px var(--kt-orange); }
.kt-chip.purple { background: transparent; color: var(--kt-purple); box-shadow: inset 0 0 0 1.5px var(--kt-purple); }
.kt-avatar { border-radius: 50%; display: grid; place-items: center; color: #f5f1e9; font-weight: 700; flex-shrink: 0; user-select: none; }
.kt-list { background: var(--kt-surface); border-radius: 24px; border: 1px solid var(--kt-line); overflow: hidden; }
.kt-item { display: flex; align-items: center; gap: 12px; padding: 15px 18px; border-bottom: 1px solid var(--kt-line); width: 100%; background: transparent; border-left: 0; border-right: 0; border-top: 0; text-align: left; font-family: inherit; color: inherit; cursor: pointer; }
.kt-item:last-child { border-bottom: 0; }
.kt-item:hover { background: var(--kt-surface2); }
.kt-item.on { background: var(--kt-surface2); }
.kt-sheet-back { position: fixed; inset: 0; z-index: 80; background: rgba(18, 18, 18, 0.45); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center; padding: 16px; animation: kt-fade 0.25s ease; }
@keyframes kt-fade { from { opacity: 0; } to { opacity: 1; } }
.kt-sheet { width: 100%; max-width: 520px; max-height: 88vh; overflow-y: auto; background-color: var(--kt-surface); border-radius: 32px; padding: 16px 24px 26px; box-shadow: 0 30px 80px rgba(0, 0, 0, 0.35); animation: kt-pop 0.35s var(--kt-ease); }
.kt-sheet.wide { max-width: 720px; }
@keyframes kt-pop { from { opacity: 0; transform: translateY(24px) scale(0.97); } to { opacity: 1; transform: none; } }
.kt-grab { width: 38px; height: 5px; border-radius: 3px; background: var(--kt-line); margin: 0 auto 10px; }
.kt-sheet-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
.kt-sheet-head h3 { margin: 0; font-size: 20px; font-weight: 800; letter-spacing: -0.03em; }
.kt-bubble { max-width: 76%; padding: 11px 16px; border-radius: 22px; font-size: 16px; line-height: 1.45; word-break: break-word; white-space: pre-wrap; }
.kt-bubble.me { background: var(--kt-dark); color: var(--kt-on-dark); border-bottom-right-radius: 6px; margin-left: auto; }
.kt-bubble.them { background: var(--kt-surface2); border-bottom-left-radius: 6px; }
.kt-fix { margin-top: 6px; padding: 9px 13px; border-radius: 16px; background: transparent; color: var(--kt-text); font-size: 14px; border: 1px dashed var(--kt-green); }
.kt-diff del { background: rgba(155, 59, 52, 0.14); color: var(--kt-red); text-decoration: line-through; border-radius: 4px; padding: 0 2px; }
.kt-diff ins { background: rgba(63, 107, 79, 0.16); color: var(--kt-green); text-decoration: none; border-radius: 4px; padding: 0 2px; font-weight: 700; }
.kt-bar { height: 8px; border-radius: 4px; background: var(--kt-surface2); overflow: hidden; }
.kt-bar > div { height: 100%; border-radius: 4px; background: var(--kt-dark); transition: width 0.5s var(--kt-ease); }
.kt-skel { border-radius: 24px; background: var(--kt-surface2); animation: kt-pulse 1.4s ease-in-out infinite; }
@keyframes kt-pulse { 0%, 100% { opacity: 0.55; } 50% { opacity: 1; } }
.kt-toasts { position: fixed; top: 16px; right: 16px; z-index: 120; display: flex; flex-direction: column; gap: 8px; pointer-events: none; }
.kt-toast { padding: 13px 20px; border-radius: 999px; background: var(--kt-dark); color: var(--kt-on-dark); box-shadow: var(--kt-shadow); font-size: 14px; font-weight: 500; animation: kt-pop 0.3s var(--kt-ease); }
.kt-toast.err { background: var(--kt-red); color: #f5f1e9; }
.kt-hero { background-color: var(--kt-bg); background-image: var(--kt-paper); font-family: var(--kt-font); }
.kt-hero * { box-sizing: border-box; }
.kt-cjk { font-family: var(--kt-serif); font-weight: 700; }
.kt-photo { width: 100%; height: 100%; object-fit: cover; display: block; filter: grayscale(1) contrast(1.05); }
.kt-card-flip { min-height: 280px; display: grid; place-items: center; text-align: center; cursor: pointer; user-select: none; transition: transform 0.2s var(--kt-ease); }
.kt-card-flip:active { transform: scale(0.99); }
.kt-chat { display: grid; grid-template-columns: 320px minmax(0, 1fr); gap: 16px; height: calc(100vh - 190px); min-height: 460px; }
.kt-chat-thread { display: flex; flex-direction: column; min-height: 0; padding: 0; overflow: hidden; }
.kt-chat-scroll { flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 10px; }
.kt-chat-input { display: flex; gap: 10px; padding: 14px; border-top: 1px solid var(--kt-line); background: var(--kt-glass); }
.kt-bars { display: flex; align-items: flex-end; gap: 6px; height: 120px; }
.kt-bars > div { flex: 1; border-radius: 999px; background: var(--kt-dark); min-height: 4px; transition: height 0.5s var(--kt-ease); }
.kt-hero-grid { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 48px; align-items: center; }
.kt-hero-art { position: relative; aspect-ratio: 4 / 5; border-radius: 40px; overflow: hidden; background: var(--kt-surface2); }
.kt-hero-art .kt-dark-card { position: absolute; left: 6%; right: 6%; bottom: 5%; border-radius: 30px; padding: 22px 24px; background: var(--kt-dark); color: var(--kt-on-dark); display: flex; align-items: center; justify-content: space-between; gap: 16px; }
.kt-hide-m { display: initial; }
.kt-only-m { display: none; }
@media (max-width: 860px) {
  .kt-side { display: none; }
  .kt-main { padding: 22px 16px 120px; }
  .kt-title { font-size: 32px; }
  .kt-grid.c2, .kt-grid.c3, .kt-grid.c4 { grid-template-columns: 1fr; }
  .kt-grid.c4.keep2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .kt-hero-grid { grid-template-columns: 1fr; gap: 28px; }
  .kt-tabbar { display: flex; position: fixed; left: 12px; right: 12px; bottom: calc(12px + env(safe-area-inset-bottom)); z-index: 60; padding: 8px; background: var(--kt-glass); backdrop-filter: blur(24px); -webkit-backdrop-filter: blur(24px); border: 1px solid var(--kt-line); border-radius: 999px; justify-content: space-around; }
  .kt-tab { display: flex; flex-direction: column; align-items: center; gap: 2px; font-size: 11px; font-weight: 500; color: var(--kt-sub); border: 0; background: transparent; padding: 7px 12px; border-radius: 999px; cursor: pointer; font-family: inherit; }
  .kt-tab.active { color: var(--kt-on-blue); background: var(--kt-blue); }
  .kt-chat { grid-template-columns: 1fr; height: calc(100vh - 230px); }
  .kt-chat.thread-open .kt-chat-list { display: none; }
  .kt-chat:not(.thread-open) .kt-chat-thread { display: none; }
  .kt-sheet-back { align-items: flex-end; padding: 0; }
  .kt-sheet { border-radius: 32px 32px 0 0; max-width: none; }
  .kt-hide-m { display: none; }
  .kt-only-m { display: initial; }
}
@media (prefers-reduced-motion: reduce) { .kt-main, .kt-sheet, .kt-toast, .kt-skel { animation: none; } .kt-btn, .kt-bars > div, .kt-bar > div { transition: none; } }
.kt-split { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); }
@media (max-width: 860px) { .kt-split { grid-template-columns: 1fr; } }
/* @arkzen:web:style:end */

/* @arkzen:web:script */

import { arkzenFetch } from '@/arkzen/core/stores/authStore'

// Shared building blocks used by BOTH the generated utils.tsx and hooks.tsx.
// The engine emits constants / utils / hooks / types as separate modules that
// don't import each other (langName needs LANGS, useApi needs kt), so anything
// they share lives here and is imported once by the components block below.

// ─── Languages ────────────────────────────────────────────────
export const LANGS = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' }, { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Mandarin' }, { code: 'tl', name: 'Filipino' },
]
export const langName = (c?: string | null) => LANGS.find(l => l.code === c)?.name ?? (c ?? '')

// ─── Network ──────────────────────────────────────────────────
export async function kt<T = any>(path: string, opts: { method?: string; json?: any } = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? (opts.json !== undefined ? 'POST' : 'GET') }
  if (opts.json !== undefined) init.body = JSON.stringify(opts.json)
  const res = await arkzenFetch(`/api/kotoba${path}`, init)
  let data: any = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined
    throw new Error(first ?? data?.message ?? `Request failed (${res.status})`)
  }
  return data as T
}

/* @arkzen:web:script:end */

/* @arkzen:web:components:shared */

'use client'

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { Heart, MessageCircle, Check, X, Plus, Languages, Sparkles, Send, PenLine, Wand2, BookmarkPlus, Trophy, Flame, WifiOff, Handshake, Users, Globe, Brain, Compass, GraduationCap, Target, BookOpen, PartyPopper, Layers, Medal, TrendingUp, Lightbulb, CalendarDays, Sprout, Star, FileText, Book, Home, Newspaper, User, Hand, Pencil, Sun, Flower2, Coffee, Headphones, Gamepad2, Utensils, Clock, History, ArrowRight, Minus } from 'lucide-react'
import { arkzenFetch, useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'
import { useArkzenRouter } from '@/arkzen/core/adapters/router'
import { LANGS, langName, kt } from '@/arkzen/generated/kotoba.scripts'

if (typeof window !== 'undefined') { setActiveTatemono('kotoba') }

// ─── Types ────────────────────────────────────────────────────
export type KProfile = {
  id: number; user_id: number; display_name: string; bio?: string | null; native_lang: string; learning_lang: string
  level: string; country?: string | null; interests?: string | null; avatar_color: string; xp: number; streak: number
  best_streak: number; daily_goal: number; words_written: number; messages_sent: number; onboarded: boolean
  score?: number; shared?: string[]; following?: boolean
}
export type KPost = {
  id: number; user_id: number; author_name: string; author_color?: string | null; author_native?: string | null
  lang: string; kind: string; mission_id?: number | null; body: string; translation?: string | null
  likes_count: number; comments_count: number; corrections_count: number; liked?: boolean; created_at?: string
}
export type KComment = {
  id: number; post_id: number; user_id: number; author_name: string; author_color?: string | null; body: string
  is_correction: boolean; corrected?: string | null; explanation?: string | null; accepted: boolean; created_at?: string
}

// ─── Levels & palette ─────────────────────────────────────────
// (LANGS, langName and kt live in the web:script block above)
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const COLORS = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a']

export function toast(message: string, kind: 'ok' | 'err' = 'ok') {
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('kotoba:toast', { detail: { message, kind } }))
}

export function useApi<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    if (!path) return
    setLoading(true); setError(null)
    try { setData(await kt<T>(path)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setLoading(false) }
  }, [path])
  useEffect(() => { load() }, [load, ...deps])
  return { data, loading, error, reload: load, setData }
}

export function useRealtime(event: string, cb: (data: any) => void) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    const h = (e: any) => { if (e.detail?.event === event) ref.current(e.detail.data) }
    window.addEventListener('kotoba:rt', h)
    return () => window.removeEventListener('kotoba:rt', h)
  }, [event])
}

export const useNav = () => {
  const r = useArkzenRouter()
  return { go: (p: string) => r.push(p ? `/kotoba/${p}` : '/kotoba') }
}

export function useProfile() {
  const [profile, setProfile] = useState<KProfile | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile }>('/me'); setProfile(r.data) } catch { /* handled by auth layout */ }
  }, [])
  useEffect(() => { load() }, [load])
  return { profile, setProfile, reload: load }
}

// ─── Utils ────────────────────────────────────────────────────
export function timeAgo(ts?: string | null) {
  if (!ts) return ''
  const s = Math.max(1, Math.floor((Date.now() - new Date(ts).getTime()) / 1000))
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  if (s < 604800) return `${Math.floor(s / 86400)}d`
  return new Date(ts).toLocaleDateString()
}
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
export const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

export function diffText(a: string, b: string) {
  const split = (s: string) => (/\s/.test(s) ? s.split(/(\s+)/).filter(Boolean) : Array.from(s))
  const x = split(a), y = split(b)
  const dp: number[][] = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0))
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: { t: 'same' | 'del' | 'add'; s: string }[] = []
  let i = 0, j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ t: 'same', s: x[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: 'del', s: x[i] }); i++ }
    else { out.push({ t: 'add', s: y[j] }); j++ }
  }
  while (i < x.length) out.push({ t: 'del', s: x[i++] })
  while (j < y.length) out.push({ t: 'add', s: y[j++] })
  return out
}

// ─── UI atoms ─────────────────────────────────────────────────
export const Avatar = ({ name, color = '#121212', size = 40 }: { name?: string; color?: string | null; size?: number }) => (
  <div className="kt-avatar" style={{ width: size, height: size, background: color ?? '#121212', fontSize: size * 0.42 }}>{(name || '?').trim().slice(0, 1).toUpperCase()}</div>
)

export const Segmented = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <div className="kt-seg" role="tablist">
    {options.map(o => <button key={o.value} role="tab" aria-selected={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>{o.label}</button>)}
  </div>
)

export const Sheet = ({ open, onClose, title, children, wide }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode; wide?: boolean }) => {
  useEffect(() => {
    if (!open) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [open, onClose])
  if (!open) return null
  return (
    <div className="kt-sheet-back" onClick={onClose}>
      <div className={`kt-sheet ${wide ? 'wide' : ''}`} role="dialog" aria-modal="true" aria-label={title} onClick={e => e.stopPropagation()}>
        <div className="kt-grab" />
        <div className="kt-sheet-head"><h3>{title}</h3><button className="kt-icon-btn" aria-label="Close" onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  )
}

// Icon set — every icon in the UI is a lucide SVG, addressed by a short key (also what circles and lessons store).
const ICON_MAP: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number }>> = {
  'flame': Flame, 'wifi-off': WifiOff, 'handshake': Handshake, 'pen-line': PenLine, 'users': Users, 'globe': Globe, 'brain': Brain,
  'compass': Compass, 'graduation-cap': GraduationCap, 'target': Target, 'book-open': BookOpen, 'party-popper': PartyPopper, 'layers': Layers,
  'medal': Medal, 'check': Check, 'trending-up': TrendingUp, 'message-circle': MessageCircle, 'lightbulb': Lightbulb, 'calendar': CalendarDays,
  'sprout': Sprout, 'star': Star, 'file-text': FileText, 'book': Book, 'home': Home, 'newspaper': Newspaper, 'user': User, 'heart': Heart,
  'hand': Hand, 'pencil': Pencil, 'sun': Sun, 'flower': Flower2, 'coffee': Coffee, 'headphones': Headphones, 'gamepad': Gamepad2,
  'utensils': Utensils, 'trophy': Trophy, 'clock': Clock, 'history': History,
}
export const Ico = ({ n, size = 20 }: { n?: string | null; size?: number }) => {
  const C = (n && ICON_MAP[n]) || Sparkles
  return <C size={size} strokeWidth={1.6} />
}

export const Empty = ({ icon, title, text, action }: { icon?: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) => (
  <div className="kt-card flat" style={{ textAlign: 'center', padding: '44px 24px' }}>
    <div style={{ display: 'grid', placeItems: 'center', marginBottom: 12 }}>{typeof icon === 'string' || icon == null ? <Ico n={(icon as string) ?? 'sprout'} size={34} /> : icon}</div>
    <div className="kt-h2" style={{ fontSize: 19 }}>{title}</div>
    {text && <p className="kt-sub" style={{ margin: '6px auto 16px', maxWidth: 360 }}>{text}</p>}
    {action}
  </div>
)

export const Skeletons = ({ n = 3, h = 120 }: { n?: number; h?: number }) => (
  <div className="kt-stack">{Array.from({ length: n }).map((_, i) => <div key={i} className="kt-skel" style={{ height: h }} />)}</div>
)

export const Ring = ({ value, max, size = 120, stroke = 12, color = 'currentColor', children }: { value: number; max: number; size?: number; stroke?: number; color?: string; children?: React.ReactNode }) => {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r, pct = Math.max(0, Math.min(1, max ? value / max : 0))
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--kt-surface2)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.2,0.8,0.2,1)' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>{children}</div>
    </div>
  )
}

export const LangSelect = ({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) => (
  <div>
    {label && <label className="kt-label">{label}</label>}
    <select className="kt-select" value={value} onChange={e => onChange(e.target.value)}>
      {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
    </select>
  </div>
)

export const Diff = ({ from, to }: { from: string; to: string }) => (
  <span className="kt-diff">
    {diffText(from, to).map((p, i) => p.t === 'same' ? <span key={i}>{p.s}</span> : p.t === 'del' ? <del key={i}>{p.s}</del> : <ins key={i}>{p.s}</ins>)}
  </span>
)

// ─── Compose box ──────────────────────────────────────────────
export const ComposeBox = ({ lang: initialLang, kind = 'moment', missionId, placeholder, onPosted, compact }: {
  lang: string; kind?: 'moment' | 'question' | 'mission'; missionId?: number | null; placeholder?: string; onPosted?: (p: KPost) => void; compact?: boolean
}) => {
  const [body, setBody] = useState('')
  const [lang, setLang] = useState(initialLang)
  const [tr, setTr] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [asKind, setAsKind] = useState<'moment' | 'question' | 'mission'>(kind)
  const [busy, setBusy] = useState(false)
  useEffect(() => setLang(initialLang), [initialLang])
  const submit = async () => {
    if (!body.trim()) return
    setBusy(true)
    try {
      const r = await kt<{ data: KPost }>('/posts', { json: { body: body.trim(), lang, kind: asKind, mission_id: missionId ?? null, translation: tr.trim() || null } })
      setBody(''); setTr(''); setShowTr(false)
      toast(asKind === 'mission' ? 'Mission complete! +20 XP' : 'Posted! +10 XP')
      onPosted?.(r.data)
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not post', 'err') }
    finally { setBusy(false) }
  }
  return (
    <div className="kt-card" style={{ padding: compact ? 14 : 20 }}>
      <textarea className="kt-textarea" style={{ minHeight: compact ? 72 : 96 }} value={body} onChange={e => setBody(e.target.value)} placeholder={placeholder ?? `Write in ${langName(lang)}. Mistakes are welcome, that is how we learn.`} aria-label="Write a post" maxLength={1500} />
      {showTr && <textarea className="kt-textarea" style={{ minHeight: 60, marginTop: 10 }} value={tr} onChange={e => setTr(e.target.value)} placeholder="Add a translation so learners can follow along (optional)" aria-label="Translation" />}
      <div className="kt-row kt-between kt-wrap" style={{ marginTop: 12 }}>
        <div className="kt-row kt-wrap">
          <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Post language">
            {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
          </select>
          {kind !== 'mission' && (
            <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={asKind} onChange={e => setAsKind(e.target.value as any)} aria-label="Post type">
              <option value="moment">Moment</option><option value="question">Question</option>
            </select>
          )}
          <button className="kt-btn ghost sm" onClick={() => setShowTr(s => !s)}><Languages size={16} />{showTr ? 'Hide translation' : 'Add translation'}</button>
        </div>
        <button className="kt-btn primary sm" disabled={busy || !body.trim()} onClick={submit}><Send size={15} />{busy ? 'Posting…' : kind === 'mission' ? 'Complete mission' : 'Post'}</button>
      </div>
    </div>
  )
}

// ─── Post card ────────────────────────────────────────────────
export const PostCard = ({ post, meId, onProfile, onDeleted }: { post: KPost; meId?: number; onProfile?: (userId: number) => void; onDeleted?: (id: number) => void }) => {
  const [p, setP] = useState<KPost>(post)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<KComment[] | null>(null)
  const [mode, setMode] = useState<'comment' | 'fix'>('comment')
  const [text, setText] = useState('')
  const [fixed, setFixed] = useState(post.body)
  const [why, setWhy] = useState('')
  const [sel, setSel] = useState('')
  const [meaning, setMeaning] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => setP(post), [post])

  const like = async () => {
    setP(x => ({ ...x, liked: !x.liked, likes_count: x.likes_count + (x.liked ? -1 : 1) }))
    try { const r = await kt<{ liked: boolean; likes_count: number }>(`/posts/${p.id}/like`, { json: {} }); setP(x => ({ ...x, liked: r.liked, likes_count: r.likes_count })) }
    catch { setP(post) }
  }
  const toggleThread = async () => {
    const next = !open
    setOpen(next)
    if (next && comments === null) {
      try { const r = await kt<{ data: KComment[] }>(`/posts/${p.id}/comments`); setComments(r.data) } catch (e) { toast('Could not load comments', 'err') }
    }
  }
  const send = async () => {
    if (!text.trim()) return
    if (mode === 'fix' && (!fixed.trim() || fixed.trim() === p.body.trim())) { toast('Edit the text to suggest a correction', 'err'); return }
    setBusy(true)
    try {
      const r = await kt<{ data: KComment }>(`/posts/${p.id}/comments`, { json: { body: text.trim(), is_correction: mode === 'fix', corrected: mode === 'fix' ? fixed.trim() : null, explanation: mode === 'fix' ? why.trim() || null : null } })
      setComments(c => [...(c ?? []), r.data])
      setP(x => ({ ...x, comments_count: x.comments_count + 1, corrections_count: x.corrections_count + (r.data.is_correction ? 1 : 0) }))
      setText(''); setWhy(''); setMode('comment'); setFixed(p.body)
      toast(r.data.is_correction ? 'Correction sent. +15 XP' : 'Comment sent. +5 XP')
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const accept = async (c: KComment) => {
    try { await kt(`/comments/${c.id}/accept`, { json: {} }); setComments(list => (list ?? []).map(x => x.id === c.id ? { ...x, accepted: true } : x)); toast('Correction accepted') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const capture = () => { const s = (typeof window !== 'undefined' ? window.getSelection()?.toString() : '')?.trim() ?? ''; setSel(s.length > 0 && s.length <= 80 ? s : '') }
  const save = async () => {
    if (!sel || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: sel, meaning: meaning.trim(), lang: p.lang, example: p.body, source: 'feed' } }); toast(`Saved “${sel}” to your deck`); setSel(''); setMeaning('') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async () => { try { await kt(`/posts/${p.id}`, { method: 'DELETE' }); onDeleted?.(p.id) } catch (e) { toast('Could not delete', 'err') } }
  const mine = meId === p.user_id

  return (
    <article className="kt-card">
      <div className="kt-row">
        <button style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} aria-label={`Open ${p.author_name}'s profile`} onClick={() => onProfile?.(p.user_id)}><Avatar name={p.author_name} color={p.author_color} /></button>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600 }}>{p.author_name}</div>
          <div className="kt-sub">Native {langName(p.author_native)} · {timeAgo(p.created_at)}</div>
        </div>
        <span className="kt-chip blue">{langName(p.lang)}</span>
        {p.kind !== 'moment' && <span className={`kt-chip ${p.kind === 'mission' ? 'orange' : 'purple'}`}>{p.kind === 'mission' ? 'Mission' : 'Question'}</span>}
      </div>
      <p onMouseUp={capture} onTouchEnd={capture} style={{ fontSize: 18, lineHeight: 1.55, margin: '14px 0 6px', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{p.body}</p>
      {p.translation && (
        <div style={{ marginBottom: 6 }}>
          <button className="kt-btn ghost sm" style={{ padding: 0, height: 28 }} onClick={() => setShowTr(s => !s)}><Languages size={15} />{showTr ? 'Hide translation' : 'Show translation'}</button>
          {showTr && <p className="kt-sub" style={{ margin: '4px 0 0', fontSize: 15 }}>{p.translation}</p>}
        </div>
      )}
      {sel && (
        <div className="kt-row kt-wrap" style={{ margin: '10px 0', padding: 10, borderRadius: 14, background: 'rgba(18, 18, 18, 0.1)' }}>
          <BookmarkPlus size={18} color="#121212" />
          <span style={{ fontWeight: 600 }}>“{sel}”</span>
          <input className="kt-input" style={{ flex: 1, minWidth: 140, padding: '8px 12px', fontSize: 14 }} value={meaning} onChange={e => setMeaning(e.target.value)} placeholder="What does it mean?" onKeyDown={e => { if (e.key === 'Enter') save() }} />
          <button className="kt-btn primary sm" onClick={save} disabled={!meaning.trim()}>Save to deck</button>
        </div>
      )}
      {!sel && <div className="kt-sub" style={{ fontSize: 12, marginBottom: 8 }}>Tip: select any word or phrase to save it to your deck.</div>}
      <div className="kt-row" style={{ marginTop: 6 }}>
        <button className="kt-btn ghost sm" aria-pressed={!!p.liked} onClick={like} style={{ color: p.liked ? 'var(--kt-red)' : undefined }}><Heart size={17} fill={p.liked ? 'currentColor' : 'none'} />{p.likes_count}</button>
        <button className="kt-btn ghost sm" aria-expanded={open} onClick={toggleThread}><MessageCircle size={17} />{p.comments_count}</button>
        {p.corrections_count > 0 ? <span className="kt-chip green"><Check size={13} />{p.corrections_count} correction{p.corrections_count > 1 ? 's' : ''}</span> : !mine && <span className="kt-chip orange"><PenLine size={13} />Needs feedback</span>}
        {mine && <button className="kt-btn ghost sm" style={{ marginLeft: 'auto', color: 'var(--kt-red)' }} onClick={remove}>Delete</button>}
      </div>
      {open && (
        <div className="kt-stack" style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid var(--kt-line)' }}>
          {comments === null && <div className="kt-skel" style={{ height: 56 }} />}
          {comments?.length === 0 && <div className="kt-sub">No comments yet. Be the first to help.</div>}
          {comments?.map(c => (
            <div key={c.id} className="kt-row" style={{ alignItems: 'flex-start' }}>
              <Avatar name={c.author_name} color={c.author_color} size={32} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14 }}><b>{c.author_name}</b> <span className="kt-sub">{timeAgo(c.created_at)}</span></div>
                <div style={{ fontSize: 15, lineHeight: 1.45 }}>{c.body}</div>
                {c.is_correction && c.corrected && (
                  <div className="kt-fix">
                    <div className="kt-row" style={{ gap: 6, marginBottom: 4 }}><Wand2 size={14} /><b style={{ fontSize: 13 }}>Suggested correction</b>{c.accepted && <span className="kt-chip green">Accepted</span>}</div>
                    <Diff from={p.body} to={c.corrected} />
                    {c.explanation && <div className="kt-sub" style={{ marginTop: 6 }}>{c.explanation}</div>}
                    {mine && !c.accepted && <button className="kt-btn tint sm" style={{ marginTop: 8 }} onClick={() => accept(c)}><Check size={14} />Accept and thank</button>}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div className="kt-stack" style={{ gap: 8 }}>
            {!mine && <Segmented value={mode} onChange={v => setMode(v as any)} options={[{ value: 'comment', label: 'Comment' }, { value: 'fix', label: 'Suggest correction' }]} />}
            {mode === 'fix' && (
              <>
                <textarea className="kt-textarea" style={{ minHeight: 70 }} value={fixed} onChange={e => setFixed(e.target.value)} aria-label="Corrected text" />
                <input className="kt-input" value={why} onChange={e => setWhy(e.target.value)} placeholder="Why? A short explanation helps them learn" />
              </>
            )}
            <div className="kt-row">
              <input className="kt-input" value={text} onChange={e => setText(e.target.value)} placeholder={mode === 'fix' ? 'Add a friendly note' : 'Write a comment'} onKeyDown={e => { if (e.key === 'Enter') send() }} />
              <button className="kt-btn primary sm" disabled={busy || !text.trim()} onClick={send}>Send</button>
            </div>
          </div>
        </div>
      )}
    </article>
  )
}

// ─── Lesson player ────────────────────────────────────────────
type Ex = { t: 'choose' | 'type' | 'order' | 'match'; q: string; o?: string[]; a?: any; w?: string[]; p?: string[][] }

export const LessonPlayer = ({ lesson, onClose, onDone }: { lesson: any; onClose: () => void; onDone: () => void }) => {
  const data = useMemo(() => { try { return JSON.parse(lesson.content) } catch { return { ex: [], v: [] } } }, [lesson])
  const ex: Ex[] = data.ex ?? []
  const [i, setI] = useState(0)
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [correct, setCorrect] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [left, setLeft] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [result, setResult] = useState<{ xp: number; cards_added: number; score: number } | null>(null)
  const cur = ex[i]
  const order = useMemo(() => shuffle((cur?.o ?? cur?.w ?? cur?.p?.map((_, k) => k) ?? []).map((_: any, k: number) => k)), [i, lesson])
  const rightOrder = useMemo(() => shuffle((cur?.p ?? []).map((_, k) => k)), [i, lesson])

  const reset = () => { setStatus('idle'); setSel(null); setTyped(''); setPicked([]); setLeft(null); setDone([]) }
  const verdict = (ok: boolean) => { setStatus(ok ? 'right' : 'wrong'); if (ok) setCorrect(c => c + 1) }
  const check = () => {
    if (!cur) return
    if (cur.t === 'choose') verdict(sel === cur.a)
    else if (cur.t === 'type') verdict((cur.a as string[]).some(x => norm(x) === norm(typed)))
    else if (cur.t === 'order') verdict(picked.map(k => cur.w![k]).join('').replace(/\s/g, '') === String(cur.a).replace(/\s/g, ''))
  }
  const next = async () => {
    if (i + 1 < ex.length) { setI(i + 1); reset(); return }
    const score = Math.round((correct / Math.max(1, ex.length)) * 100)
    try { const r = await kt<{ xp: number; cards_added: number }>(`/lessons/${lesson.id}/complete`, { json: { score } }); setResult({ ...r, score }) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save progress', 'err'); setResult({ xp: 0, cards_added: 0, score }) }
  }
  const pickMatch = (side: 'l' | 'r', k: number) => {
    if (status !== 'idle' || done.includes(k)) return
    if (side === 'l') { setLeft(k); return }
    if (left === null) return
    if (left === k) {
      const nd = [...done, k]; setDone(nd); setLeft(null)
      if (nd.length === cur.p!.length) verdict(true)
    } else { setLeft(null); toast('Not a match, try again', 'err') }
  }

  if (!ex.length) return <Sheet open onClose={onClose} title={lesson.title}><Empty title="This lesson is empty" /></Sheet>
  if (result) return (
    <div className="kt-sheet-back"><div className="kt-sheet" style={{ textAlign: 'center', padding: 32 }}>
      <Ring value={result.score} max={100} size={140} color={result.score >= 70 ? '#3f6b4f' : '#8a6a2f'}><div><div style={{ fontSize: 34, fontWeight: 700 }}>{result.score}%</div><div className="kt-sub">score</div></div></Ring>
      <h2 className="kt-h2" style={{ marginTop: 18 }}>{result.score >= 70 ? 'Nicely done!' : 'Good effort!'}</h2>
      <p className="kt-sub">+{result.xp} XP{result.cards_added > 0 ? ` · ${result.cards_added} new words added to your deck` : ''}</p>
      <div className="kt-row" style={{ justifyContent: 'center', marginTop: 18 }}><button className="kt-btn primary" onClick={onDone}><Trophy size={16} />Continue</button></div>
    </div></div>
  )
  const canCheck = cur.t === 'choose' ? sel !== null : cur.t === 'type' ? typed.trim().length > 0 : cur.t === 'order' ? picked.length === cur.w!.length : false
  const answerText = cur.t === 'choose' ? cur.o![cur.a] : cur.t === 'type' ? (cur.a as string[])[0] : String(cur.a ?? '')

  return (
    <div className="kt-sheet-back" style={{ alignItems: 'stretch', padding: 0 }}>
      <div style={{ background: 'var(--kt-bg)', width: '100%', display: 'flex', flexDirection: 'column', animation: 'kt-fade 0.25s' }}>
        <div className="kt-row" style={{ padding: '16px 20px', maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <button className="kt-icon-btn" aria-label="Quit lesson" onClick={onClose}><X size={18} /></button>
          <div className="kt-bar" style={{ flex: 1 }}><div style={{ width: `${(i / ex.length) * 100}%` }} /></div>
          <span className="kt-sub">{i + 1}/{ex.length}</span>
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '10px 20px 30px', maxWidth: 720, width: '100%', margin: '0 auto' }}>
          <h2 className="kt-title" style={{ fontSize: 26, marginBottom: 22 }}>{cur.q}</h2>
          {cur.t === 'choose' && <div className="kt-stack" style={{ gap: 10 }}>{order.map(k => (
            <button key={k} disabled={status !== 'idle'} className="kt-card" onClick={() => setSel(k)} style={{ textAlign: 'left', cursor: 'pointer', fontSize: 18, fontFamily: 'inherit', color: 'inherit', borderColor: sel === k ? '#121212' : undefined, boxShadow: sel === k ? '0 0 0 3px rgba(18, 18, 18, 0.25)' : undefined }}>{cur.o![k]}</button>
          ))}</div>}
          {cur.t === 'type' && <input autoFocus className="kt-input" style={{ fontSize: 20 }} value={typed} disabled={status !== 'idle'} onChange={e => setTyped(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && canCheck && status === 'idle') check() }} placeholder="Type your answer" aria-label="Your answer" />}
          {cur.t === 'order' && (
            <div className="kt-stack">
              <div className="kt-card flat kt-row kt-wrap" style={{ minHeight: 70 }}>{picked.map((k, n) => <button key={n} disabled={status !== 'idle'} className="kt-chip blue" style={{ fontSize: 18, padding: '8px 14px', border: 0, cursor: 'pointer' }} onClick={() => setPicked(picked.filter((_, m) => m !== n))}>{cur.w![k]}</button>)}</div>
              <div className="kt-row kt-wrap">{order.filter(k => !picked.includes(k)).map(k => <button key={k} disabled={status !== 'idle'} className="kt-btn" onClick={() => setPicked([...picked, k])}>{cur.w![k]}</button>)}</div>
            </div>
          )}
          {cur.t === 'match' && (
            <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="kt-stack" style={{ gap: 10 }}>{cur.p!.map((pair, k) => <button key={k} disabled={done.includes(k)} className="kt-btn" style={{ height: 54, fontSize: 17, opacity: done.includes(k) ? 0.35 : 1, outline: left === k ? '3px solid #121212' : 'none' }} onClick={() => pickMatch('l', k)}>{pair[0]}</button>)}</div>
              <div className="kt-stack" style={{ gap: 10 }}>{rightOrder.map(k => <button key={k} disabled={done.includes(k)} className="kt-btn" style={{ height: 54, fontSize: 17, opacity: done.includes(k) ? 0.35 : 1 }} onClick={() => pickMatch('r', k)}>{cur.p![k][1]}</button>)}</div>
            </div>
          )}
        </div>
        <div style={{ padding: '16px 20px calc(16px + env(safe-area-inset-bottom))', background: status === 'right' ? 'rgba(63, 107, 79, 0.18)' : status === 'wrong' ? 'rgba(155, 59, 52, 0.16)' : 'var(--kt-glass)', borderTop: '1px solid var(--kt-line)' }}>
          <div className="kt-row kt-between" style={{ maxWidth: 720, margin: '0 auto' }}>
            <div>
              {status === 'right' && <b style={{ color: '#3f6b4f', fontSize: 18 }}>Correct!</b>}
              {status === 'wrong' && <div><b style={{ color: 'var(--kt-red)', fontSize: 18 }}>Not quite</b>{cur.t !== 'match' && <div className="kt-sub">Answer: {answerText}</div>}</div>}
            </div>
            {status === 'idle' ? (cur.t === 'match' ? <button className="kt-btn" onClick={() => { verdict(false) }}>Skip</button> : <button className="kt-btn primary" disabled={!canCheck} onClick={check}>Check</button>) : <button className="kt-btn primary" onClick={next}>{i + 1 < ex.length ? 'Continue' : 'Finish'}</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Profile sheet ────────────────────────────────────────────
export const ProfileSheet = ({ userId, onClose }: { userId: number | null; onClose: () => void }) => {
  const nav = useNav()
  const [d, setD] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => {
    setD(null)
    if (userId) kt(`/profile/${userId}`).then(setD).catch(e => { toast(e instanceof Error ? e.message : 'Profile not found', 'err'); onClose() })
  }, [userId])
  const follow = async () => {
    setBusy(true)
    try { const r = await kt<{ following: boolean }>(`/follow/${userId}`, { json: {} }); setD((x: any) => ({ ...x, following: r.following, followers: x.followers + (r.following ? 1 : -1) })) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const message = async () => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: userId } }); onClose(); nav.go(`chat#c=${r.data.id}`) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const p: KProfile | undefined = d?.data
  return (
    <Sheet open={!!userId} onClose={onClose} title="Profile">
      {!p ? <Skeletons n={2} h={90} /> : (
        <div className="kt-stack">
          <div className="kt-row"><Avatar name={p.display_name} color={p.avatar_color} size={64} />
            <div><div className="kt-h2">{p.display_name}</div><div className="kt-sub">{p.country ?? 'Somewhere on Earth'}</div></div></div>
          <div className="kt-row kt-wrap">
            <span className="kt-chip green">Speaks {langName(p.native_lang)}</span>
            <span className="kt-chip blue">Learning {langName(p.learning_lang)} · {p.level}</span>
            <span className="kt-chip orange"><Ico n="flame" size={13} />{p.streak} day streak</span>
          </div>
          {p.bio && <p style={{ margin: 0, fontSize: 16, lineHeight: 1.5 }}>{p.bio}</p>}
          {p.interests && <div className="kt-row kt-wrap">{p.interests.split(',').filter(Boolean).map(i => <span key={i} className="kt-chip">{i.trim()}</span>)}</div>}
          <div className="kt-grid c3" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
            {[['Posts', d.post_count], ['Followers', d.followers], ['Following', d.following_count]].map(([k, v]) => <div key={k as string} className="kt-card flat" style={{ textAlign: 'center', padding: 12 }}><div style={{ fontSize: 22, fontWeight: 700 }}>{v}</div><div className="kt-sub">{k}</div></div>)}
          </div>
          <div className="kt-row"><button className="kt-btn primary" style={{ flex: 1 }} onClick={message}><MessageCircle size={16} />Message</button><button className="kt-btn" disabled={busy} onClick={follow}>{d.following ? 'Following' : 'Follow'}</button></div>
          {d.posts?.length > 0 && <div><div className="kt-label">Recent posts</div><div className="kt-list">{d.posts.map((x: KPost) => <div key={x.id} className="kt-item" style={{ cursor: 'default', display: 'block' }}><span className="kt-chip" style={{ marginBottom: 4 }}>{langName(x.lang)}</span><div style={{ fontSize: 15 }}>{x.body}</div></div>)}</div></div>}
        </div>
      )}
    </Sheet>
  )
}

// ─── Onboarding sheet ─────────────────────────────────────────
export const InterestPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const all = ['travel', 'food', 'music', 'anime', 'football', 'books', 'coffee', 'photography', 'gaming', 'movies', 'fitness', 'tech']
  const cur = value.split(',').map(s => s.trim()).filter(Boolean)
  const flip = (i: string) => onChange((cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]).join(','))
  return <div className="kt-row kt-wrap">{all.map(i => <button key={i} type="button" className={`kt-chip ${cur.includes(i) ? 'blue' : ''}`} style={{ border: 0, cursor: 'pointer', padding: '8px 14px', fontSize: 14 }} onClick={() => flip(i)}>{i}</button>)}</div>
}

export const OnboardingSheet = ({ open, profile, onDone }: { open: boolean; profile?: KProfile; onDone: () => void }) => {
  const [native, setNative] = useState('en')
  const [learning, setLearning] = useState('es')
  const [level, setLevel] = useState('A1')
  const [interests, setInterests] = useState('')
  const [goal, setGoal] = useState('3')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) { setNative(profile.native_lang); setLearning(profile.learning_lang); setLevel(profile.level) } }, [profile?.id])
  const save = async () => {
    if (native === learning) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { await kt('/me', { method: 'PUT', json: { native_lang: native, learning_lang: learning, level, interests, daily_goal: Number(goal), onboarded: true } }); toast('You are all set. Let us begin!'); onDone() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Sheet open={open} onClose={() => {}} title="Welcome to Kotoba">
      <div className="kt-stack">
        <p className="kt-sub" style={{ margin: 0 }}>Two quick questions so we can match you with the right people, missions and lessons.</p>
        <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <LangSelect label="I speak" value={native} onChange={setNative} />
          <LangSelect label="I am learning" value={learning} onChange={setLearning} />
        </div>
        <div><label className="kt-label">My level</label><Segmented value={level} onChange={setLevel} options={LEVELS.map(l => ({ value: l, label: l }))} /></div>
        <div><label className="kt-label">Things I like talking about</label><InterestPicker value={interests} onChange={setInterests} /></div>
        <div><label className="kt-label">Daily goal (posts, messages or lessons)</label><Segmented value={goal} onChange={setGoal} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></div>
        <button className="kt-btn primary block" disabled={busy} onClick={save}>{busy ? 'Saving…' : 'Start learning'}</button>
      </div>
    </Sheet>
  )
}

/* @arkzen:web:components:shared:end */

/* @arkzen:web:layout:shell */

'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Home, Newspaper, GraduationCap, Layers, Compass, MessageCircle, Users, BarChart3, User, Bell, LogOut, X, Heart, Hand, Check, Pencil } from 'lucide-react'
import { useArkzenRouter, useArkzenPathname } from '@/arkzen/core/adapters/router'
import { useAuthStore, arkzenFetch } from '@/arkzen/core/stores/authStore'

const NAV = [
  { key: 'dashboard', label: 'Home', icon: Home, mobile: true },
  { key: 'feed', label: 'Community', icon: Newspaper, mobile: true },
  { key: 'learn', label: 'Learn', icon: GraduationCap, mobile: true },
  { key: 'review', label: 'Review', icon: Layers, mobile: false },
  { key: 'partners', label: 'Partners', icon: Compass, mobile: false },
  { key: 'chat', label: 'Messages', icon: MessageCircle, mobile: true },
  { key: 'circles', label: 'Circles', icon: Users, mobile: false },
  { key: 'progress', label: 'Progress', icon: BarChart3, mobile: false },
  { key: 'profile', label: 'Profile', icon: User, mobile: true },
]

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useArkzenRouter()
  const pathname = useArkzenPathname() ?? ''
  const { user, logout } = useAuthStore()
  const [alerts, setAlerts] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [bell, setBell] = useState(false)
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([])
  const uid = (user as any)?.id as number | undefined

  const active = NAV.find(n => pathname.endsWith(`/kotoba/${n.key}`) || pathname.includes(`/kotoba/${n.key}/`))?.key ?? ''
  const go = (key: string) => router.push(`/kotoba/${key}`)

  const loadAlerts = useCallback(async () => {
    try {
      const res = await arkzenFetch('/api/kotoba/alerts')
      if (!res.ok) return
      const d = await res.json()
      setAlerts(d.data ?? []); setUnread(d.unread ?? 0)
    } catch { /* offline */ }
  }, [])

  useEffect(() => { if (uid) loadAlerts() }, [uid, loadAlerts])

  // Toasts (fed by window events from shared components)
  useEffect(() => {
    const h = (e: any) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, message: e.detail.message, kind: e.detail.kind }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3200)
    }
    window.addEventListener('kotoba:toast', h)
    return () => window.removeEventListener('kotoba:toast', h)
  }, [])

  // Realtime: one Reverb socket per session, re-broadcast as window events
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(() => {
    if (!uid) return
    let closed = false
    let retry = 0
    let timer: any
    const host = process.env.NEXT_PUBLIC_REVERB_HOST ?? 'localhost'
    const port = process.env.NEXT_PUBLIC_REVERB_PORT ?? '8080'
    const key = process.env.NEXT_PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'
    const schemeEnv = process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'ws'
    const scheme = schemeEnv === 'https' || schemeEnv === 'wss' ? 'wss' : 'ws'
    const connect = () => {
      if (closed) return
      const ws = new WebSocket(`${scheme}://${host}:${port}/app/${key}?protocol=7&client=js&version=8.4.0`)
      wsRef.current = ws
      ws.onmessage = async (ev) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        if (msg.event === 'pusher:connection_established') {
          retry = 0
          const socketId = JSON.parse(msg.data).socket_id
          const channel = `private-kotoba.${uid}`
          try {
            const res = await arkzenFetch('/api/kotoba/auth/broadcasting/auth', { method: 'POST', body: JSON.stringify({ socket_id: socketId, channel_name: channel }) })
            if (!res.ok) return
            const auth = await res.json()
            ws.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel, auth: auth.auth } }))
          } catch { /* retry on reconnect */ }
        } else if (msg.event === 'pusher:ping') {
          ws.send(JSON.stringify({ event: 'pusher:pong', data: {} }))
        } else if (typeof msg.event === 'string' && msg.event.startsWith('kotoba.')) {
          let data: any = msg.data
          try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data } catch { /* keep raw */ }
          window.dispatchEvent(new CustomEvent('kotoba:rt', { detail: { event: msg.event, data } }))
          if (msg.event === 'kotoba.alert-created') {
            const a = data?.data ?? data
            setAlerts(list => [a, ...list]); setUnread(n => n + 1)
            window.dispatchEvent(new CustomEvent('kotoba:toast', { detail: { message: a?.text ?? 'New notification', kind: 'ok' } }))
          }
        }
      }
      ws.onclose = () => { if (closed) return; retry = Math.min(retry + 1, 6); timer = setTimeout(connect, 1000 * 2 ** retry) }
      ws.onerror = () => ws.close()
    }
    connect()
    return () => { closed = true; clearTimeout(timer); wsRef.current?.close() }
  }, [uid])

  const openBell = async () => {
    const next = !bell
    setBell(next)
    if (next && unread > 0) {
      try { await arkzenFetch('/api/kotoba/alerts/read', { method: 'POST', body: '{}' }); setUnread(0); setAlerts(l => l.map(a => ({ ...a, is_read: true }))) } catch { /* ignore */ }
    }
  }
  const signOut = async () => { try { await logout() } catch { /* ignore */ } router.push('/kotoba/login') }

  return (
    <div className="kt-shell">
      <aside className="kt-side" aria-label="Main navigation">
        <div className="kt-brand"><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        {NAV.map(n => (
          <button key={n.key} className={`kt-nav ${active === n.key ? 'active' : ''}`} aria-current={active === n.key ? 'page' : undefined} onClick={() => go(n.key)}>
            <n.icon size={20} />{n.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button className="kt-nav" onClick={openBell}><Bell size={20} />Notifications</button>
        <button className="kt-nav" onClick={signOut}><LogOut size={20} />Sign out</button>
      </aside>

      <div style={{ flex: 1, minWidth: 0, position: 'relative' }}>
        <button className="kt-icon-btn kt-only-m" aria-label="Notifications" onClick={openBell} style={{ position: 'fixed', top: 14, right: 14, zIndex: 55, background: 'var(--kt-glass)', backdropFilter: 'blur(16px)' }}>
          <Bell size={18} />
        </button>
        <main className="kt-main" key={pathname}>{children}</main>
      </div>

      <nav className="kt-tabbar" aria-label="Tabs">
        {NAV.filter(n => n.mobile).map(n => (
          <button key={n.key} className={`kt-tab ${active === n.key ? 'active' : ''}`} onClick={() => go(n.key)} aria-label={n.label}><n.icon size={22} />{n.label}</button>
        ))}
      </nav>

      {bell && (
        <div className="kt-sheet-back" onClick={() => setBell(false)}>
          <div className="kt-sheet" onClick={e => e.stopPropagation()} role="dialog" aria-label="Notifications">
            <div className="kt-grab" />
            <div className="kt-sheet-head"><h3>Notifications</h3><button className="kt-icon-btn" aria-label="Close" onClick={() => setBell(false)}><X size={18} /></button></div>
            {alerts.length === 0 && <p className="kt-sub" style={{ textAlign: 'center', padding: 24 }}>You are all caught up.</p>}
            <div className="kt-list">{alerts.map((a, i) => (
              <div key={a.id ?? i} className="kt-item" style={{ cursor: 'default', background: a.is_read ? undefined : 'var(--kt-surface2)' }}>
                <span style={{ display: 'grid', placeItems: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--kt-surface2)', flexShrink: 0 }}>{a.kind === 'like' ? <Heart size={17} /> : a.kind === 'follow' ? <Hand size={17} /> : a.kind === 'accepted' ? <Check size={17} /> : a.kind === 'correction' ? <Pencil size={17} /> : <MessageCircle size={17} />}</span>
                <span style={{ fontSize: 15 }}>{a.text}</span>
              </div>
            ))}</div>
          </div>
        </div>
      )}

      <div className="kt-toasts" aria-live="polite">{toasts.map(t => <div key={t.id} className={`kt-toast ${t.kind === 'err' ? 'err' : ''}`}>{t.message}</div>)}</div>
    </div>
  )
}

/* @arkzen:web:layout:shell:end */

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:+guest */

const IndexPage = () => {
  const nav = useNav()
  // y = yes, n = no, p = partial
  const rows: [string, string, string, string][] = [
    ['Real people', 'n', 'y', 'y'],
    ['Structure and a plan', 'y', 'n', 'y'],
    ['Corrections with explanations', 'n', 'p', 'y'],
    ['Words saved from your own conversations', 'n', 'n', 'y'],
    ['Spaced repetition', 'y', 'n', 'y'],
    ['Conversation starters that fit your level', 'n', 'n', 'y'],
  ]
  const mark = (v: string) => (v === 'y' ? <Check size={18} /> : v === 'n' ? <X size={18} /> : <Minus size={18} />)
  return (
    <div className="kt-hero" style={{ minHeight: '100vh', color: 'var(--kt-text)' }}>
      <header className="kt-row kt-between" style={{ maxWidth: 1120, margin: '0 auto', padding: '24px' }}>
        <div className="kt-brand" style={{ padding: 0 }}><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        <div className="kt-row"><button className="kt-btn ghost" onClick={() => nav.go('login')}>Sign in</button><button className="kt-btn primary" onClick={() => nav.go('register')}>Get started</button></div>
      </header>
      <section className="kt-hero-grid" style={{ maxWidth: 1120, margin: '0 auto', padding: '32px 24px 64px' }}>
        <div>
          <span className="kt-label" style={{ marginLeft: 0 }}>Social language learning</span>
          <h1 className="kt-title" style={{ fontSize: 'clamp(46px, 7vw, 84px)', lineHeight: 1, marginTop: 6 }}>Learn by talking, not by tapping.</h1>
          <p className="kt-subtitle" style={{ fontSize: 19, maxWidth: 520, margin: '24px 0 0' }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard. Kotoba is the practice that streak apps skip.</p>
          <div className="kt-row kt-wrap" style={{ marginTop: 32 }}>
            <button className="kt-btn primary" style={{ height: 54, padding: '0 30px', fontSize: 16 }} onClick={() => nav.go('register')}>Create free account</button>
            <button className="kt-btn tint" style={{ height: 54, padding: '0 30px', fontSize: 16 }} onClick={() => nav.go('login')}>I have an account</button>
          </div>
          <p className="kt-sub" style={{ marginTop: 16 }}>Try the demo: demo@kotoba.app / password123</p>
        </div>
        <div className="kt-hero-art">
          <img className="kt-photo" src="https://picsum.photos/seed/kotoba-words/900/1125?grayscale" alt="" />
          <div className="kt-dark-card">
            <div><div className="kt-sub" style={{ opacity: 0.6, color: 'inherit' }}>kotoba</div><div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em' }}>Words</div></div>
            <div className="kt-cjk" style={{ fontSize: 44, lineHeight: 1 }}>言葉</div>
            <button className="kt-fab" style={{ background: 'var(--kt-on-dark)', color: 'var(--kt-dark)', width: 52, height: 52 }} aria-label="Get started" onClick={() => nav.go('register')}><ArrowRight size={20} /></button>
          </div>
        </div>
      </section>
      <section style={{ maxWidth: 1120, margin: '0 auto', padding: '24px' }}>
        <div className="kt-grid c3">
          {[['target', 'Daily mission', 'One small prompt a day, written at your level. No more blank-page panic or "hi, where are you from?"'], ['pencil', 'Corrections that teach', 'Native speakers suggest a fix with a visual diff and a reason. Accept it and it sticks.'], ['brain', 'Your own deck', 'Select any word in any post or chat to save it. Spaced repetition brings it back right before you forget.']].map(([e, t, d]) => (
            <div key={t} className="kt-card" style={{ padding: 28 }}><div className="kt-icon-btn" style={{ width: 48, height: 48, background: 'var(--kt-dark)', color: 'var(--kt-on-dark)' }}><Ico n={e} size={22} /></div><div className="kt-h2" style={{ margin: '20px 0 8px' }}>{t}</div><p className="kt-sub" style={{ margin: 0, fontSize: 16, lineHeight: 1.55 }}>{d}</p></div>
          ))}
        </div>
      </section>
      <section style={{ maxWidth: 860, margin: '0 auto', padding: '56px 24px' }}>
        <h2 className="kt-title" style={{ fontSize: 36, textAlign: 'center', marginBottom: 28 }}>Why most apps stop working</h2>
        <div className="kt-list" style={{ overflowX: 'auto' }}>
          <div className="kt-item" style={{ cursor: 'default', fontWeight: 600, fontSize: 13 }}><span style={{ flex: 2 }} /><span style={{ flex: 1, textAlign: 'center' }}>Drill apps</span><span style={{ flex: 1, textAlign: 'center' }}>Chat-only apps</span><span style={{ flex: 1, textAlign: 'center' }}>Kotoba</span></div>
          {rows.map(r => <div key={r[0]} className="kt-item" style={{ cursor: 'default' }}><span style={{ flex: 2, fontSize: 15 }}>{r[0]}</span>{[1, 2, 3].map(i => <span key={i} style={{ flex: 1, display: 'grid', placeItems: 'center', color: r[i] === 'y' ? 'var(--kt-green)' : r[i] === 'n' ? 'var(--kt-sub)' : 'var(--kt-orange)' }}>{mark(r[i])}</span>)}</div>)}
        </div>
      </section>
      <footer className="kt-sub" style={{ textAlign: 'center', padding: '32px 24px 48px' }}>Kotoba · 言葉 means “words”</footer>
    </div>
  )
}

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:login */
/* @arkzen:web:page:layout:+guest */

const LoginPage = () => {
  const nav = useNav()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null)
    try { await login(email, password) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in') }
  }
  return (
    <div className="kt-hero kt-split" style={{ minHeight: '100vh', color: 'var(--kt-text)' }}>
      <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={submit} className="kt-card" style={{ width: '100%', maxWidth: 420, padding: 36, borderRadius: 36 }}>
        <div className="kt-brand" style={{ padding: 0, marginBottom: 18 }}><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        <h1 className="kt-title" style={{ fontSize: 28 }}>Welcome back</h1>
        <p className="kt-sub" style={{ margin: '6px 0 20px' }}>Sign in to continue your streak.</p>
        {error && <div role="alert" className="kt-chip" style={{ display: 'flex', background: 'rgba(155, 59, 52, 0.12)', color: 'var(--kt-red)', padding: '10px 14px', borderRadius: 16, marginBottom: 14, fontSize: 14 }}>{error}</div>}
        <div className="kt-stack">
          <div><label className="kt-label" htmlFor="kt-email">Email</label><input id="kt-email" className="kt-input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-pass">Password</label><input id="kt-pass" className="kt-input" type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} /></div>
          <button className="kt-btn primary block" type="submit" disabled={isLoading}>{isLoading ? 'Signing in…' : 'Sign in'}</button>
          <button className="kt-btn block" type="button" onClick={() => { setEmail('demo@kotoba.app'); setPassword('password123') }}>Use demo account</button>
        </div>
        <p className="kt-sub" style={{ textAlign: 'center', marginTop: 18 }}>New here? <a style={{ color: 'var(--kt-blue)', cursor: 'pointer' }} onClick={() => nav.go('register')}>Create an account</a></p>
      </form>
      </div>
      <div className="kt-hide-m" style={{ padding: 20 }}><div className="kt-hero-art" style={{ height: '100%', aspectRatio: 'auto' }}><img className="kt-photo" src="https://picsum.photos/seed/kotoba-words/900/1125?grayscale" alt="" /></div></div>
    </div>
  )
}

/* @arkzen:web:page:login:end */

/* @arkzen:web:page:register */
/* @arkzen:web:page:layout:+guest */

const RegisterPage = () => {
  const nav = useNav()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try { await register(name, email, password, confirm) } catch (err) { setError(err instanceof Error ? err.message : 'Unable to create account') }
  }
  return (
    <div className="kt-hero kt-split" style={{ minHeight: '100vh', color: 'var(--kt-text)' }}>
      <div style={{ display: 'grid', placeItems: 'center', padding: 20 }}>
      <form onSubmit={submit} className="kt-card" style={{ width: '100%', maxWidth: 420, padding: 36, borderRadius: 36 }}>
        <div className="kt-brand" style={{ padding: 0, marginBottom: 18 }}><img className="kt-logo" src="https://api.iconify.design/lucide/languages.svg?color=%23121212" alt="" width={28} height={28} />Kotoba</div>
        <h1 className="kt-title" style={{ fontSize: 28 }}>Create your account</h1>
        <p className="kt-sub" style={{ margin: '6px 0 20px' }}>Free forever. Takes under a minute.</p>
        {error && <div role="alert" className="kt-chip" style={{ display: 'flex', background: 'rgba(155, 59, 52, 0.12)', color: 'var(--kt-red)', padding: '10px 14px', borderRadius: 16, marginBottom: 14, fontSize: 14 }}>{error}</div>}
        <div className="kt-stack">
          <div><label className="kt-label" htmlFor="kt-name">Name</label><input id="kt-name" className="kt-input" autoComplete="name" required value={name} onChange={e => setName(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-email">Email</label><input id="kt-email" className="kt-input" type="email" autoComplete="email" required value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-pass">Password</label><input id="kt-pass" className="kt-input" type="password" autoComplete="new-password" minLength={8} required value={password} onChange={e => setPassword(e.target.value)} /></div>
          <div><label className="kt-label" htmlFor="kt-conf">Confirm password</label><input id="kt-conf" className="kt-input" type="password" autoComplete="new-password" minLength={8} required value={confirm} onChange={e => setConfirm(e.target.value)} /></div>
          <button className="kt-btn primary block" type="submit" disabled={isLoading}>{isLoading ? 'Creating…' : 'Create account'}</button>
        </div>
        <p className="kt-sub" style={{ textAlign: 'center', marginTop: 18 }}>Already learning with us? <a style={{ color: 'var(--kt-blue)', cursor: 'pointer' }} onClick={() => nav.go('login')}>Sign in</a></p>
      </form>
      </div>
      <div className="kt-hide-m" style={{ padding: 20 }}><div className="kt-hero-art" style={{ height: '100%', aspectRatio: 'auto' }}><img className="kt-photo" src="https://picsum.photos/seed/kotoba-words/900/1125?grayscale" alt="" /></div></div>
    </div>
  )
}

/* @arkzen:web:page:register:end */

/* @arkzen:web:page:dashboard */
/* @arkzen:web:page:layout:+auth:shell */

const DashboardPage = () => {
  const nav = useNav()
  const { data, loading, error, reload } = useApi<any>('/home')
  const [writing, setWriting] = useState(false)
  const [onb, setOnb] = useState(false)
  const p: KProfile | undefined = data?.profile
  useEffect(() => { if (p && !p.onboarded) setOnb(true) }, [p?.id, p?.onboarded])
  const h = new Date().getHours()
  const hi = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const goal = p?.daily_goal ?? 3
  const today = data?.today_activity ?? 0

  if (loading && !data) return <Skeletons n={4} h={110} />
  if (error && !data) return <Empty icon="wifi-off" title="Cannot reach Kotoba" text={error} action={<button className="kt-btn primary" onClick={reload}>Try again</button>} />

  const plan = [
    { emoji: 'target', title: data?.mission?.title ?? 'Daily mission', text: data?.mission_done ? 'Done for today. Nice work!' : data?.mission?.prompt, done: !!data?.mission_done, cta: 'Write', run: () => setWriting(true) },
    { emoji: 'book-open', title: data?.next_lesson ? `Lesson: ${data.next_lesson.title}` : 'Lessons', text: data?.next_lesson ? `Next up in ${data.next_lesson.unit}` : 'You finished every lesson for this language. Try a mission or chat.', done: !data?.next_lesson, cta: 'Start', run: () => nav.go('learn') },
    { emoji: 'brain', title: `Review ${data?.due ?? 0} card${data?.due === 1 ? '' : 's'}`, text: data?.due ? 'Right before you forget them.' : 'Nothing due. Save new words from posts and chats.', done: !data?.due, cta: 'Review', run: () => nav.go('review') },
    { emoji: 'handshake', title: 'Help a learner', text: `${data?.help_needed ?? 0} post${data?.help_needed === 1 ? '' : 's'} in ${langName(p?.native_lang)} could use your eyes. Teaching is the fastest way to stay humble.`, done: !data?.help_needed, cta: 'Help', run: () => nav.go('feed#help') },
  ]
  return (
    <div className="kt-stack" style={{ gap: 24 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">{hi}, {p?.display_name?.split(' ')[0] ?? 'friend'}</h1><p className="kt-subtitle">Learning {langName(p?.learning_lang)} · Level {p?.level}</p></div>
        <div className="kt-row kt-wrap"><span className="kt-chip orange" style={{ fontSize: 14, padding: '8px 14px' }}><Ico n="flame" size={15} />{p?.streak ?? 0} day streak</span><span className="kt-chip blue" style={{ fontSize: 14, padding: '8px 14px' }}><Ico n="star" size={15} />{p?.xp ?? 0} XP</span></div>
      </div>

      <div className="kt-grid" style={{ gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)' }}>
        <div className="kt-card">
          <div className="kt-row kt-between" style={{ marginBottom: 12 }}><h2 className="kt-h2">Today’s plan</h2><span className="kt-sub">{plan.filter(x => x.done).length}/{plan.length} done</span></div>
          <div className="kt-list" style={{ border: 0, borderRadius: 0 }}>{plan.map(s => (
            <div key={s.title} className="kt-item" style={{ cursor: 'default', padding: '14px 0', opacity: s.done ? 0.6 : 1 }}>
              <div style={{ width: 44, display: 'grid', placeItems: 'center' }}><Ico n={s.done ? 'check' : s.emoji} size={26} /></div>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{s.title}</div><div className="kt-sub" style={{ marginTop: 2 }}>{s.text}</div></div>
              <button className={`kt-btn sm ${s.done ? '' : 'tint'}`} onClick={s.run}>{s.cta}</button>
            </div>
          ))}</div>
        </div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', gap: 12, textAlign: 'center' }}>
          <Ring value={Math.min(today, goal)} max={goal} size={150} stroke={14} color={today >= goal ? '#3f6b4f' : 'currentColor'}><div><div style={{ fontSize: 36, fontWeight: 700 }}>{today}<span className="kt-sub" style={{ fontSize: 18 }}>/{goal}</span></div><div className="kt-sub">today</div></div></Ring>
          <div className="kt-sub">{today >= goal ? 'Daily goal reached' : `${goal - today} more to hit your goal`}</div>
        </div>
      </div>

      <div className="kt-grid c4 keep2">
        {[['Partners', 'compass', 'Find people to practice with', 'partners'], ['Circles', 'users', `${data?.circles ?? 0} joined`, 'circles'], ['Progress', 'trending-up', 'See how you are growing', 'progress'], ['Messages', 'message-circle', 'Pick up a conversation', 'chat']].map(([t, e, s, k]) => (
          <button key={t} className="kt-card" style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit' }} onClick={() => nav.go(k)}><Ico n={e} size={26} /><div style={{ fontWeight: 700, marginTop: 10 }}>{t}</div><div className="kt-sub">{s}</div></button>
        ))}
      </div>

      <Sheet open={writing} onClose={() => setWriting(false)} title={data?.mission?.title ?? 'Daily mission'} wide>
        <p style={{ margin: '0 0 6px', fontSize: 16, lineHeight: 1.5 }}>{data?.mission?.prompt}</p>
        {data?.mission?.hint && <p className="kt-sub" style={{ margin: '0 0 14px' }}>Hint: {data.mission.hint}</p>}
        <ComposeBox lang={p?.learning_lang ?? 'es'} kind="mission" missionId={data?.mission?.id} onPosted={() => { setWriting(false); reload() }} placeholder={`Write your answer in ${langName(p?.learning_lang)}…`} />
      </Sheet>
      <OnboardingSheet open={onb} profile={p} onDone={() => { setOnb(false); reload() }} />
    </div>
  )
}

/* @arkzen:web:page:dashboard:end */

/* @arkzen:web:page:feed */
/* @arkzen:web:page:layout:+auth:shell */

const FeedPage = () => {
  const { profile } = useProfile()
  const [scope, setScope] = useState('all')
  const [lang, setLang] = useState('all')
  const [posts, setPosts] = useState<KPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)

  useEffect(() => { if (window.location.hash === '#help') setScope('help') }, [])
  const load = useCallback(async () => {
    setError(null)
    try { const r = await kt<{ data: KPost[] }>(`/feed?scope=${scope}${lang !== 'all' ? `&lang=${lang}` : ''}`); setPosts(r.data) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the feed'); setPosts([]) }
  }, [scope, lang])
  useEffect(() => { setPosts(null); load() }, [load])

  return (
    <div className="kt-stack" style={{ gap: 20 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Community</h1><p className="kt-subtitle">Write, get corrected, return the favour.</p></div>
      </div>
      <ComposeBox lang={profile?.learning_lang ?? 'es'} onPosted={p => setPosts(list => [p, ...(list ?? [])])} />
      <div className="kt-row kt-between kt-wrap">
        <Segmented value={scope} onChange={setScope} options={[{ value: 'all', label: 'For you' }, { value: 'following', label: 'Following' }, { value: 'help', label: `Needs ${langName(profile?.native_lang) || 'help'} help` }, { value: 'mine', label: 'Mine' }]} />
        <select className="kt-select" style={{ width: 'auto', padding: '8px 12px', fontSize: 14 }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Filter by language">
          <option value="all">All languages</option>{LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>
      {posts === null && <Skeletons n={3} h={170} />}
      {error && <Empty icon="wifi-off" title="Feed unavailable" text={error} action={<button className="kt-btn primary" onClick={load}>Retry</button>} />}
      {posts && !error && posts.length === 0 && <Empty icon="pen-line" title="Nothing here yet" text={scope === 'help' ? `No unanswered ${langName(profile?.native_lang)} posts right now. Check back soon.` : 'Be the first to post something in your target language.'} />}
      <div className="kt-stack" style={{ gap: 16 }}>{posts?.map(p => <PostCard key={p.id} post={p} meId={profile?.user_id} onProfile={setViewing} onDeleted={id => setPosts(l => (l ?? []).filter(x => x.id !== id))} />)}</div>
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}

/* @arkzen:web:page:feed:end */

/* @arkzen:web:page:learn */
/* @arkzen:web:page:layout:+auth:shell */

const LearnPage = () => {
  const { profile } = useProfile()
  const [lang, setLang] = useState<string | null>(null)
  const active = lang ?? profile?.learning_lang ?? null
  const { data, loading, error, reload } = useApi<{ data: any[] }>(active ? `/lessons?lang=${active}` : null)
  const [playing, setPlaying] = useState<any | null>(null)
  const lessons = data?.data ?? []
  const units = Array.from(new Set(lessons.map(l => l.unit)))
  const doneCount = lessons.filter(l => l.done).length

  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Learn</h1><p className="kt-subtitle">Short lessons built around phrases you will actually say.</p></div>
        <select className="kt-select" style={{ width: 'auto' }} value={active ?? ''} onChange={e => setLang(e.target.value)} aria-label="Language">
          {LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
        </select>
      </div>
      {lessons.length > 0 && <div className="kt-card"><div className="kt-row kt-between"><b>{langName(active)} path</b><span className="kt-sub">{doneCount}/{lessons.length} lessons</span></div><div className="kt-bar" style={{ marginTop: 10 }}><div style={{ width: `${(doneCount / lessons.length) * 100}%` }} /></div></div>}
      {(loading && !data) && <Skeletons n={3} h={100} />}
      {error && <Empty icon="wifi-off" title="Could not load lessons" text={error} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />}
      {data && lessons.length === 0 && <Empty icon="globe" title={`Lessons for ${langName(active)} are on the way`} text="Meanwhile the fastest way to learn is to write in the community, chat with a partner and build your deck. Or try a language with lessons available." action={<div className="kt-row" style={{ justifyContent: 'center' }}>{['es', 'ja', 'en'].map(c => <button key={c} className="kt-btn tint sm" onClick={() => setLang(c)}>{langName(c)}</button>)}</div>} />}
      {units.map(u => (
        <section key={u as string}>
          <h2 className="kt-h2" style={{ marginBottom: 12 }}>{u as string}</h2>
          <div className="kt-grid c3">{lessons.filter(l => l.unit === u).map(l => (
            <button key={l.id} className="kt-card" onClick={() => setPlaying(l)} style={{ textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', color: 'inherit', position: 'relative' }}>
              <Ico n={l.emoji ?? 'book'} size={30} />
              <div style={{ fontWeight: 600, fontSize: 17, margin: '8px 0 4px' }}>{l.title}</div>
              <div className="kt-row kt-wrap"><span className="kt-chip">{l.level}</span><span className="kt-chip orange">+{l.xp} XP</span>{l.done && <span className="kt-chip green"><Check size={12} />Best {l.best}%</span>}</div>
            </button>
          ))}</div>
        </section>
      ))}
      {playing && <LessonPlayer lesson={playing} onClose={() => setPlaying(null)} onDone={() => { setPlaying(null); reload() }} />}
    </div>
  )
}

/* @arkzen:web:page:learn:end */

/* @arkzen:web:page:review */
/* @arkzen:web:page:layout:+auth:shell */

const ReviewPage = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('review')
  const [q, setQ] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ total: 0, due: 0 })
  const [deck, setDeck] = useState<any[]>([])
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [lang, setLang] = useState('es')
  useEffect(() => { if (profile) setLang(profile.learning_lang) }, [profile?.id])

  const loadDue = useCallback(async () => {
    setLoading(true)
    try { const r = await kt<any>('/vocab?due=1'); setQueue(shuffle(r.data)); setCounts({ total: r.total, due: r.due_count }); setFlipped(false); setReviewed(0) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load cards', 'err') }
    finally { setLoading(false) }
  }, [])
  const loadDeck = useCallback(async () => {
    try { const r = await kt<any>(`/vocab${q ? `?q=${encodeURIComponent(q)}` : ''}`); setDeck(r.data); setCounts({ total: r.total, due: r.due_count }) } catch { /* ignore */ }
  }, [q])
  useEffect(() => { loadDue() }, [loadDue])
  useEffect(() => { if (tab === 'deck') loadDeck() }, [tab, loadDeck])

  const card = queue[0]
  const grade = async (g: number) => {
    if (!card) return
    const c = card
    setQueue(list => g === 0 ? [...list.slice(1), c] : list.slice(1)); setFlipped(false); if (g > 0) setReviewed(n => n + 1)
    try { await kt(`/vocab/${c.id}/review`, { json: { grade: g } }) } catch (e) { toast('Could not save that review', 'err') }
  }
  useEffect(() => {
    if (tab !== 'review') return
    const h = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      if (e.key === ' ') { e.preventDefault(); setFlipped(f => !f) }
      if (flipped && ['1', '2', '3', '4'].includes(e.key)) grade(Number(e.key) - 1)
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  })
  const add = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { const r = await kt<any>('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), example: example.trim() || null, lang, source: 'manual' } }); toast(r.created ? 'Added to your deck' : 'Already in your deck', r.created ? 'ok' : 'err'); setTerm(''); setMeaning(''); setExample(''); loadDeck() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async (id: number) => { try { await kt(`/vocab/${id}`, { method: 'DELETE' }); setDeck(d => d.filter(x => x.id !== id)) } catch { toast('Could not delete', 'err') } }
  const hints = card ? [['Again', '#9b3b34', 'now'], ['Hard', '#8a6a2f', card.reps === 0 ? '1d' : 'soon'], ['Good', '#121212', card.reps === 0 ? '1d' : card.reps === 1 ? '4d' : `${Math.max(1, Math.round((card.interval_days || 1) * card.ease))}d`], ['Easy', '#3f6b4f', card.reps === 0 ? '3d' : card.reps === 1 ? '7d' : `${Math.max(2, Math.round((card.interval_days || 1) * card.ease * 1.3))}d`]] : []

  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Review</h1><p className="kt-subtitle">{counts.due} due · {counts.total} words in your deck</p></div>
        <Segmented value={tab} onChange={setTab} options={[{ value: 'review', label: 'Review' }, { value: 'deck', label: 'Deck' }, { value: 'add', label: 'Add word' }]} />
      </div>

      {tab === 'review' && (loading ? <Skeletons n={1} h={280} /> : card ? (
        <div className="kt-stack" style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
          <div className="kt-bar"><div style={{ width: `${(reviewed / Math.max(1, reviewed + queue.length)) * 100}%` }} /></div>
          <button className="kt-card dark kt-card-flip" onClick={() => setFlipped(f => !f)} aria-label="Flip card" style={{ fontFamily: 'inherit', color: 'inherit' }}>
            <div>
              <span className="kt-chip">{langName(card.lang)}</span>
              <div style={{ fontSize: 44, fontWeight: 700, margin: '18px 0 6px', letterSpacing: '-0.02em', fontFamily: ['ja', 'zh', 'ko'].includes(card.lang) ? 'var(--kt-serif)' : undefined }}>{card.term}</div>
              {flipped ? <div><div style={{ fontSize: 24, opacity: 0.75 }}>{card.meaning}</div>{card.example && <p className="kt-sub" style={{ maxWidth: 420, margin: '14px auto 0', fontStyle: 'italic' }}>“{card.example.slice(0, 160)}”</p>}</div> : <div className="kt-sub">Tap or press space to reveal</div>}
            </div>
          </button>
          {flipped ? <div className="kt-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>{hints.map((h, n) => <button key={h[0]} className="kt-btn" style={{ height: 62, flexDirection: 'column', gap: 2, color: h[1] }} onClick={() => grade(n)}><span>{h[0]}</span><span className="kt-sub" style={{ fontSize: 11 }}>{h[2]}</span></button>)}</div> : <button className="kt-btn primary block" onClick={() => setFlipped(true)}>Show answer</button>}
        </div>
      ) : (
        <Empty icon="party-popper" title={counts.total === 0 ? 'Your deck is empty' : 'All caught up!'} text={counts.total === 0 ? 'Finish a lesson, select words in the community feed, or add your own.' : `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Come back tomorrow, your next cards are scheduled.`} action={<button className="kt-btn primary" onClick={() => setTab('add')}>Add a word</button>} />
      ))}

      {tab === 'deck' && (
        <div className="kt-stack">
          <input className="kt-input" value={q} onChange={e => setQ(e.target.value)} placeholder="Search your deck" aria-label="Search deck" />
          {deck.length === 0 ? <Empty icon="layers" title="No cards found" /> : <div className="kt-list">{deck.map(c => (
            <div key={c.id} className="kt-item" style={{ cursor: 'default' }}>
              <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600 }}>{c.term} <span className="kt-chip">{c.lang.toUpperCase()}</span></div><div className="kt-sub">{c.meaning}</div></div>
              <span className={`kt-chip ${c.reps >= 4 ? 'green' : c.reps > 0 ? 'blue' : ''}`}>{c.reps >= 4 ? 'Mastered' : c.reps > 0 ? `${c.reps}x` : 'New'}</span>
              <button className="kt-icon-btn" aria-label={`Delete ${c.term}`} onClick={() => remove(c.id)}><X size={16} /></button>
            </div>
          ))}</div>}
        </div>
      )}

      {tab === 'add' && (
        <div className="kt-card kt-stack" style={{ maxWidth: 560 }}>
          <LangSelect label="Language" value={lang} onChange={setLang} />
          <div><label className="kt-label">Word or phrase</label><input className="kt-input" value={term} onChange={e => setTerm(e.target.value)} /></div>
          <div><label className="kt-label">Meaning</label><input className="kt-input" value={meaning} onChange={e => setMeaning(e.target.value)} /></div>
          <div><label className="kt-label">Example sentence (optional)</label><input className="kt-input" value={example} onChange={e => setExample(e.target.value)} /></div>
          <button className="kt-btn primary" onClick={add} disabled={!term.trim() || !meaning.trim()}><Plus size={16} />Add to deck</button>
        </div>
      )}
    </div>
  )
}

/* @arkzen:web:page:review:end */

/* @arkzen:web:page:partners */
/* @arkzen:web:page:layout:+auth:shell */

const PartnersPage = () => {
  const nav = useNav()
  const [mode, setMode] = useState('exchange')
  const [q, setQ] = useState('')
  const [list, setList] = useState<KProfile[] | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile[] }>(`/partners?mode=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`); setList(r.data) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load partners', 'err'); setList([]) }
  }, [mode, q])
  useEffect(() => { const t = setTimeout(load, 250); return () => clearTimeout(t) }, [load])
  const hello = async (p: KProfile) => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: p.user_id } }); nav.go(`chat#c=${r.data.id}`) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const follow = async (p: KProfile) => {
    try { const r = await kt<{ following: boolean }>(`/follow/${p.user_id}`, { json: {} }); setList(l => (l ?? []).map(x => x.user_id === p.user_id ? { ...x, following: r.following } : x)) }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Partners</h1><p className="kt-subtitle">People who speak what you are learning, and want what you speak.</p></div></div>
      <div className="kt-row kt-between kt-wrap">
        <Segmented value={mode} onChange={setMode} options={[{ value: 'exchange', label: 'Language exchange' }, { value: 'all', label: 'Everyone' }]} />
        <input className="kt-input" style={{ maxWidth: 280 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Search name, interest or country" aria-label="Search partners" />
      </div>
      {list === null && <Skeletons n={3} h={150} />}
      {list && list.length === 0 && <Empty icon="compass" title="No matches yet" text="Try the Everyone tab, or invite a friend who speaks your target language." />}
      <div className="kt-grid c2">{list?.map(p => (
        <div key={p.id} className="kt-card kt-stack" style={{ gap: 12 }}>
          <div className="kt-row">
            <button style={{ border: 0, background: 'none', padding: 0, cursor: 'pointer' }} aria-label={`Open ${p.display_name}`} onClick={() => setViewing(p.user_id)}><Avatar name={p.display_name} color={p.avatar_color} size={52} /></button>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 17 }}>{p.display_name}</div><div className="kt-sub">{p.country ?? '—'} · {p.streak} day streak</div></div>
            <div style={{ textAlign: 'right' }}><div style={{ fontSize: 22, fontWeight: 700, color: (p.score ?? 0) >= 70 ? '#3f6b4f' : 'var(--kt-blue)' }}>{p.score}%</div><div className="kt-sub" style={{ fontSize: 11 }}>match</div></div>
          </div>
          <div className="kt-row kt-wrap"><span className="kt-chip green">Speaks {langName(p.native_lang)}</span><span className="kt-chip blue">Learning {p.level}</span>{p.shared?.slice(0, 3).map(s => <span key={s} className="kt-chip purple">{s}</span>)}</div>
          {p.bio && <p className="kt-sub" style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{p.bio}</p>}
          <div className="kt-row"><button className="kt-btn primary sm" style={{ flex: 1 }} onClick={() => hello(p)}><MessageCircle size={15} />Say hello</button><button className="kt-btn sm" onClick={() => follow(p)}>{p.following ? 'Following' : 'Follow'}</button></div>
        </div>
      ))}</div>
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </div>
  )
}

/* @arkzen:web:page:partners:end */

/* @arkzen:web:page:chat */
/* @arkzen:web:page:layout:+auth:shell */

const ChatPage = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('dm')
  const [convs, setConvs] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [active, setActive] = useState<{ kind: 'dm' | 'circle'; id: number; title: string; sub?: string; color?: string } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [fixing, setFixing] = useState<any | null>(null)
  const [fixText, setFixText] = useState('')
  const [fixNote, setFixNote] = useState('')
  const [sending, setSending] = useState(false)
  const bottom = useRef<HTMLDivElement>(null)
  const me = profile?.user_id

  const loadLists = useCallback(async () => {
    try {
      const [c, ci] = await Promise.all([kt<any>('/conversations'), kt<any>('/circles')])
      setConvs(c.data); setCircles(ci.data.filter((x: any) => x.joined))
      return { convs: c.data, circles: ci.data.filter((x: any) => x.joined) }
    } catch { return { convs: [], circles: [] } }
  }, [])
  const open = useCallback(async (a: NonNullable<typeof active>) => {
    setActive(a); setMsgs([])
    try { const r = await kt<any>(`/messages?${a.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${a.id}`); setMsgs(r.data) } catch (e) { toast(e instanceof Error ? e.message : 'Could not load messages', 'err') }
  }, [])
  const fromDm = (c: any) => ({ kind: 'dm' as const, id: c.id, title: c.with.display_name, sub: `${langName(c.with.native_lang)}`, color: c.with.avatar_color })
  const fromCircle = (c: any) => ({ kind: 'circle' as const, id: c.id, title: c.name, sub: `${langName(c.lang)} · ${c.members_count} members`, color: '#121212' })

  useEffect(() => {
    loadLists().then(l => {
      const m = window.location.hash.match(/#(c|circle)=(\d+)/)
      if (m) {
        const id = Number(m[2])
        if (m[1] === 'c') { const c = l.convs.find((x: any) => x.id === id); if (c) open(fromDm(c)) }
        else { setTab('circle'); const c = l.circles.find((x: any) => x.id === id); if (c) open(fromCircle(c)) }
      }
    })
  }, [])
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs.length])

  useRealtime('kotoba.message-created', (raw: any) => {
    const m = raw?.data ?? raw
    if (!m) return
    const mine = active && ((active.kind === 'dm' && m.conversation_id === active.id) || (active.kind === 'circle' && m.circle_id === active.id))
    if (mine) setMsgs(list => list.some(x => x.id === m.id) ? list.map(x => x.id === m.id ? m : x) : [...list, m])
    else if (!m.updated) toast(`${m.sender_name}: ${String(m.body).slice(0, 60)}`)
    loadLists()
  })
  // Gentle polling fallback in case the socket is unavailable
  useEffect(() => {
    if (!active) return
    const t = setInterval(async () => {
      const last = msgs.length ? msgs[msgs.length - 1].id : 0
      try { const r = await kt<any>(`/messages?${active.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${active.id}&after_id=${last}`); if (r.data.length) setMsgs(l => [...l, ...r.data.filter((n: any) => !l.some(x => x.id === n.id))]) } catch { /* ignore */ }
    }, 9000)
    return () => clearInterval(t)
  }, [active, msgs.length])

  const send = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    try {
      const r = await kt<any>('/messages', { json: { body: text.trim(), lang: profile?.learning_lang, [active.kind === 'dm' ? 'conversation_id' : 'circle_id']: active.id } })
      setMsgs(l => [...l, r.data]); setText(''); loadLists()
    } catch (e) { toast(e instanceof Error ? e.message : 'Message not sent', 'err') }
    finally { setSending(false) }
  }
  const sendFix = async () => {
    if (!fixing || !fixText.trim() || fixText.trim() === fixing.body.trim()) { toast('Edit the text to suggest a correction', 'err'); return }
    try { const r = await kt<any>(`/messages/${fixing.id}/correct`, { json: { corrected: fixText.trim(), note: fixNote.trim() || null } }); setMsgs(l => l.map(x => x.id === fixing.id ? r.data : x)); setFixing(null); setFixNote(''); toast('Correction sent. +10 XP') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const saveWord = async (m: any) => {
    const s = window.getSelection()?.toString().trim() ?? ''
    if (!s) { toast('Select a word in the message first', 'err'); return }
    const meaning = window.prompt(`What does “${s}” mean?`)
    if (!meaning) return
    try { await kt('/vocab', { json: { term: s, meaning, lang: m.lang ?? profile?.learning_lang, example: m.body, source: 'chat' } }); toast('Saved to your deck') } catch (e) { toast('Could not save', 'err') }
  }

  const list = tab === 'dm' ? convs : circles
  return (
    <div className="kt-stack" style={{ gap: 16 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Messages</h1><p className="kt-subtitle">Chat, then fix each other’s mistakes in place.</p></div></div>
      <div className={`kt-chat ${active ? 'thread-open' : ''}`}>
        <div className="kt-chat-list kt-stack" style={{ gap: 10, minHeight: 0, overflowY: 'auto' }}>
          <Segmented value={tab} onChange={setTab} options={[{ value: 'dm', label: 'Direct' }, { value: 'circle', label: 'Circles' }]} />
          {list.length === 0 && <Empty icon={tab === 'dm' ? 'message-circle' : 'users'} title={tab === 'dm' ? 'No chats yet' : 'No circles joined'} text={tab === 'dm' ? 'Find a partner and say hello.' : 'Join a study circle to chat in a group.'} />}
          <div className="kt-list">{list.map((c: any) => {
            const a = tab === 'dm' ? fromDm(c) : fromCircle(c)
            return (
              <button key={`${tab}${c.id}`} className={`kt-item ${active?.kind === a.kind && active.id === a.id ? 'on' : ''}`} onClick={() => open(a)}>
                {tab === 'dm' ? <Avatar name={c.with.display_name} color={c.with.avatar_color} /> : <div className="kt-avatar" style={{ width: 40, height: 40, background: 'var(--kt-surface2)', fontSize: 20 }}><Ico n={c.emoji} size={19} /></div>}
                <div style={{ minWidth: 0, flex: 1 }}><div style={{ fontWeight: 600 }}>{tab === 'dm' ? c.with.display_name : c.name}</div><div className="kt-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{tab === 'dm' ? (c.last_message ?? 'Say hello') : `${langName(c.lang)} · ${c.members_count} members`}</div></div>
              </button>
            )
          })}</div>
        </div>
        <div className="kt-card kt-chat-thread">
          {!active ? <div style={{ margin: 'auto', textAlign: 'center' }} className="kt-sub"><div style={{ display: 'grid', placeItems: 'center', marginBottom: 8 }}><Ico n="message-circle" size={34} /></div>Select a conversation</div> : (
            <>
              <div className="kt-row" style={{ padding: '12px 16px', borderBottom: '1px solid var(--kt-line)' }}>
                <button className="kt-icon-btn kt-only-m" aria-label="Back" onClick={() => setActive(null)}>‹</button>
                <div><div style={{ fontWeight: 600 }}>{active.title}</div><div className="kt-sub">{active.sub}</div></div>
              </div>
              <div className="kt-chat-scroll">
                {msgs.length === 0 && <div className="kt-sub" style={{ margin: 'auto' }}>No messages yet. Write the first one in your target language!</div>}
                {msgs.map(m => {
                  const own = m.sender_id === me
                  return (
                    <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: own ? 'flex-end' : 'flex-start', gap: 2 }}>
                      {!own && active.kind === 'circle' && <span className="kt-sub" style={{ fontSize: 12, marginLeft: 8 }}>{m.sender_name}</span>}
                      <div className={`kt-bubble ${own ? 'me' : 'them'}`}>{m.body}</div>
                      {m.corrected && <div className="kt-fix" style={{ maxWidth: '76%' }}><div style={{ fontSize: 12, fontWeight: 600, marginBottom: 2 }}>Suggested</div><Diff from={m.body} to={m.corrected} />{m.note && <div className="kt-sub" style={{ marginTop: 4 }}>{m.note}</div>}</div>}
                      <div className="kt-row" style={{ gap: 2 }}>
                        <span className="kt-sub" style={{ fontSize: 11 }}>{timeAgo(m.created_at)}</span>
                        {!own && <button className="kt-btn ghost sm" style={{ height: 24, padding: '0 8px', fontSize: 12 }} onClick={() => { setFixing(m); setFixText(m.corrected ?? m.body) }}>Correct</button>}
                        <button className="kt-btn ghost sm" style={{ height: 24, padding: '0 8px', fontSize: 12 }} onClick={() => saveWord(m)}>Save word</button>
                      </div>
                    </div>
                  )
                })}
                <div ref={bottom} />
              </div>
              <div className="kt-chat-input">
                <input className="kt-input" value={text} onChange={e => setText(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder={`Write in ${langName(profile?.learning_lang)}…`} aria-label="Message" />
                <button className="kt-btn primary" onClick={send} disabled={sending || !text.trim()} aria-label="Send"><Send size={16} /></button>
              </div>
            </>
          )}
        </div>
      </div>
      <Sheet open={!!fixing} onClose={() => setFixing(null)} title="Suggest a correction">
        {fixing && <div className="kt-stack">
          <div className="kt-card flat"><div className="kt-label">Original</div>{fixing.body}</div>
          <div><label className="kt-label">Your correction</label><textarea className="kt-textarea" style={{ minHeight: 70 }} value={fixText} onChange={e => setFixText(e.target.value)} /></div>
          <div className="kt-card flat"><div className="kt-label">Preview</div><Diff from={fixing.body} to={fixText} /></div>
          <input className="kt-input" value={fixNote} onChange={e => setFixNote(e.target.value)} placeholder="Short explanation (optional but kind)" />
          <button className="kt-btn primary" onClick={sendFix}>Send correction</button>
        </div>}
      </Sheet>
    </div>
  )
}

/* @arkzen:web:page:chat:end */

/* @arkzen:web:page:circles */
/* @arkzen:web:page:layout:+auth:shell */

const CirclesPage = () => {
  const nav = useNav()
  const { profile } = useProfile()
  const [lang, setLang] = useState('all')
  const { data, loading, error, reload, setData } = useApi<{ data: any[] }>(`/circles${lang !== 'all' ? `?lang=${lang}` : ''}`, [lang])
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ name: '', emoji: 'message-circle', lang: 'es', level: 'A1', description: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) setF(x => ({ ...x, lang: profile.learning_lang, level: profile.level })) }, [profile?.id])

  const toggle = async (c: any) => {
    try {
      const r = await kt<{ joined: boolean; members_count: number }>(`/circles/${c.id}/join`, { json: {} })
      setData(d => d ? { data: d.data.map(x => x.id === c.id ? { ...x, joined: r.joined, members_count: r.members_count } : x) } : d)
      toast(r.joined ? `Joined ${c.name}` : `Left ${c.name}`)
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const create = async () => {
    if (!f.name.trim()) return
    setBusy(true)
    try { await kt('/circles', { json: { ...f, name: f.name.trim(), description: f.description.trim() || null } }); setCreating(false); setF(x => ({ ...x, name: '', description: '' })); toast('Circle created'); reload() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const emojis = ['message-circle', 'sun', 'flower', 'coffee', 'headphones', 'book-open', 'globe', 'gamepad', 'utensils', 'trophy']
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}>
        <div><h1 className="kt-title">Circles</h1><p className="kt-subtitle">Small study groups with a shared language and level.</p></div>
        <div className="kt-row">
          <select className="kt-select" style={{ width: 'auto' }} value={lang} onChange={e => setLang(e.target.value)} aria-label="Language filter"><option value="all">All</option>{LANGS.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}</select>
          <button className="kt-btn primary" onClick={() => setCreating(true)}><Plus size={16} />New circle</button>
        </div>
      </div>
      {loading && !data && <Skeletons n={3} h={140} />}
      {error && <Empty icon="wifi-off" title="Could not load circles" text={error} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />}
      {data && data.data.length === 0 && <Empty icon="users" title="No circles here yet" text="Start one. Small groups with a clear goal are where people actually stick around." action={<button className="kt-btn primary" onClick={() => setCreating(true)}>Create a circle</button>} />}
      <div className="kt-grid c2">{data?.data.map(c => (
        <div key={c.id} className="kt-card kt-stack" style={{ gap: 10 }}>
          <div className="kt-row"><div className="kt-avatar" style={{ width: 52, height: 52, background: 'var(--kt-surface2)', fontSize: 26 }}><Ico n={c.emoji} size={24} /></div>
            <div style={{ flex: 1, minWidth: 0 }}><div style={{ fontWeight: 600, fontSize: 17 }}>{c.name}</div><div className="kt-sub">{c.members_count} member{c.members_count === 1 ? '' : 's'}</div></div>
            <span className="kt-chip blue">{c.level}</span></div>
          {c.description && <p className="kt-sub" style={{ margin: 0, fontSize: 15, lineHeight: 1.45 }}>{c.description}</p>}
          <div className="kt-row">
            {c.joined && <button className="kt-btn primary sm" style={{ flex: 1 }} onClick={() => nav.go(`chat#circle=${c.id}`)}><MessageCircle size={15} />Open chat</button>}
            <button className={`kt-btn sm ${c.joined ? '' : 'tint'}`} style={{ flex: c.joined ? undefined : 1 }} onClick={() => toggle(c)}>{c.joined ? 'Leave' : 'Join circle'}</button>
          </div>
        </div>
      ))}</div>
      <Sheet open={creating} onClose={() => setCreating(false)} title="New circle">
        <div className="kt-stack">
          <div><label className="kt-label">Icon</label><div className="kt-row kt-wrap">{emojis.map(e => <button key={e} className="kt-icon-btn" style={{ width: 42, height: 42, fontSize: 20, outline: f.emoji === e ? '3px solid var(--kt-text)' : 'none' }} onClick={() => setF({ ...f, emoji: e })} aria-label={`Icon ${e}`}><Ico n={e} size={20} /></button>)}</div></div>
          <div><label className="kt-label">Name</label><input className="kt-input" value={f.name} maxLength={80} onChange={e => setF({ ...f, name: e.target.value })} placeholder="Tokyo Night Owls" /></div>
          <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}><LangSelect label="Language" value={f.lang} onChange={v => setF({ ...f, lang: v })} /><div><label className="kt-label">Level</label><select className="kt-select" value={f.level} onChange={e => setF({ ...f, level: e.target.value })}>{LEVELS.map(l => <option key={l}>{l}</option>)}</select></div></div>
          <div><label className="kt-label">What is it for?</label><textarea className="kt-textarea" style={{ minHeight: 70 }} value={f.description} onChange={e => setF({ ...f, description: e.target.value })} placeholder="Daily 5-minute check-ins, no pressure." /></div>
          <button className="kt-btn primary" disabled={busy || !f.name.trim()} onClick={create}>{busy ? 'Creating…' : 'Create circle'}</button>
        </div>
      </Sheet>
    </div>
  )
}

/* @arkzen:web:page:circles:end */

/* @arkzen:web:page:progress */
/* @arkzen:web:page:layout:+auth:shell */

const ProgressPage = () => {
  const { data, loading, error, reload } = useApi<any>('/progress')
  if (loading && !data) return <Skeletons n={4} h={140} />
  if (error || !data) return <Empty icon="wifi-off" title="Could not load progress" text={error ?? ''} action={<button className="kt-btn primary" onClick={reload}>Retry</button>} />
  const p: KProfile = data.profile
  const s = data.stats
  const series: { date: string; count: number }[] = data.series
  const max = Math.max(1, ...series.map(x => x.count))
  const activeDays = series.filter(x => x.count > 0).length
  const badges = [
    { e: 'pen-line', t: 'First post', ok: s.posts >= 1 }, { e: 'flame', t: '7-day streak', ok: p.best_streak >= 7 },
    { e: 'brain', t: '25 words', ok: s.cards >= 25 }, { e: 'graduation-cap', t: '3 lessons', ok: s.lessons >= 3 },
    { e: 'handshake', t: 'First correction', ok: s.corrections_given >= 1 }, { e: 'message-circle', t: '50 messages', ok: s.messages_sent >= 50 },
    { e: 'medal', t: 'Word master', ok: s.mastered >= 10 }, { e: 'star', t: 'Level 5', ok: data.level >= 5 },
  ]
  const tiles = [
    ['Words written', s.words_written, 'pen-line'], ['Messages sent', s.messages_sent, 'message-circle'], ['Posts', s.posts, 'file-text'], ['Lessons done', s.lessons, 'graduation-cap'],
    ['Words in deck', s.cards, 'layers'], ['Mastered', s.mastered, 'medal'], ['Corrections given', s.corrections_given, 'handshake'], ['Corrections received', s.corrections_received, 'pencil'],
  ]
  return (
    <div className="kt-stack" style={{ gap: 22 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Progress</h1><p className="kt-subtitle">What you produce matters more than what you tap.</p></div></div>
      <div className="kt-grid c3">
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', gap: 10, textAlign: 'center' }}>
          <Ring value={data.level_progress} max={100} size={140} stroke={14} color="#4a4a4a"><div><div style={{ fontSize: 34, fontWeight: 700 }}>{data.level}</div><div className="kt-sub">level</div></div></Ring>
          <div className="kt-sub">{p.xp} XP · {100 - data.level_progress} to next level</div>
        </div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ display: 'grid', placeItems: 'center', marginBottom: 6 }}><Ico n="flame" size={44} /></div><div style={{ fontSize: 40, fontWeight: 700 }}>{p.streak}</div><div className="kt-sub">day streak · best {p.best_streak}</div></div></div>
        <div className="kt-card" style={{ display: 'grid', placeItems: 'center', textAlign: 'center' }}><div><div style={{ display: 'grid', placeItems: 'center', marginBottom: 6 }}><Ico n="calendar" size={44} /></div><div style={{ fontSize: 40, fontWeight: 700 }}>{activeDays}<span className="kt-sub" style={{ fontSize: 20 }}>/14</span></div><div className="kt-sub">active days, last two weeks</div></div></div>
      </div>
      <div className="kt-card">
        <div className="kt-row kt-between" style={{ marginBottom: 14 }}><h2 className="kt-h2">Last 14 days</h2><span className="kt-sub">posts, messages and lessons</span></div>
        <div className="kt-bars" role="img" aria-label="Activity over the last 14 days">{series.map(d => <div key={d.date} title={`${d.date}: ${d.count}`} style={{ height: `${Math.max(4, (d.count / max) * 100)}%`, opacity: d.count ? 1 : 0.18 }} />)}</div>
        <div className="kt-row kt-between kt-sub" style={{ marginTop: 8, fontSize: 12 }}><span>{series[0]?.date.slice(5)}</span><span>today</span></div>
      </div>
      <div className="kt-grid c4 keep2">{tiles.map(t => <div key={t[0] as string} className="kt-card" style={{ padding: 16 }}><Ico n={t[2] as string} size={22} /><div style={{ fontSize: 28, fontWeight: 700, marginTop: 4 }}>{t[1]}</div><div className="kt-sub">{t[0]}</div></div>)}</div>
      {s.corrections_received > 0 && <div className="kt-card"><div className="kt-row kt-between"><b>Corrections you accepted</b><span className="kt-sub">{s.corrections_accepted}/{s.corrections_received}</span></div><div className="kt-bar" style={{ marginTop: 10 }}><div style={{ width: `${(s.corrections_accepted / s.corrections_received) * 100}%`, background: '#3f6b4f' }} /></div><p className="kt-sub" style={{ margin: '10px 0 0' }}>Accepting a fix is how it sticks. Review the ones you skipped.</p></div>}
      <div><h2 className="kt-h2" style={{ marginBottom: 12 }}>Milestones</h2><div className="kt-grid c4 keep2">{badges.map(b => <div key={b.t} className="kt-card" style={{ padding: 16, textAlign: 'center', opacity: b.ok ? 1 : 0.4 }}><div style={{ display: 'grid', placeItems: 'center' }}><Ico n={b.e} size={30} /></div><div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{b.t}</div></div>)}</div></div>
    </div>
  )
}

/* @arkzen:web:page:progress:end */

/* @arkzen:web:page:profile */
/* @arkzen:web:page:layout:+auth:shell */

const ProfilePage = () => {
  const { user, logout } = useAuthStore()
  const { profile, setProfile } = useProfile()
  const nav = useNav()
  const [f, setF] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) setF({ display_name: profile.display_name, bio: profile.bio ?? '', country: profile.country ?? '', native_lang: profile.native_lang, learning_lang: profile.learning_lang, level: profile.level, interests: profile.interests ?? '', avatar_color: profile.avatar_color, daily_goal: String(profile.daily_goal) }) }, [profile?.id])
  if (!f || !profile) return <Skeletons n={3} h={140} />
  const dirty = JSON.stringify(f) !== JSON.stringify({ display_name: profile.display_name, bio: profile.bio ?? '', country: profile.country ?? '', native_lang: profile.native_lang, learning_lang: profile.learning_lang, level: profile.level, interests: profile.interests ?? '', avatar_color: profile.avatar_color, daily_goal: String(profile.daily_goal) })
  const save = async () => {
    if (f.native_lang === f.learning_lang) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { const r = await kt<{ data: KProfile }>('/me', { method: 'PUT', json: { ...f, daily_goal: Number(f.daily_goal), bio: f.bio || null, country: f.country || null, interests: f.interests || null } }); setProfile(r.data); toast('Profile saved') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const out = async () => { try { await logout() } catch { /* ignore */ } nav.go('login') }
  return (
    <div className="kt-stack" style={{ gap: 22, maxWidth: 720 }}>
      <div className="kt-head" style={{ marginBottom: 0 }}><div><h1 className="kt-title">Profile</h1><p className="kt-subtitle">{(user as any)?.email}</p></div></div>
      <div className="kt-card kt-stack">
        <div className="kt-row"><Avatar name={f.display_name} color={f.avatar_color} size={72} />
          <div className="kt-row kt-wrap">{COLORS.map(c => <button key={c} aria-label={`Color ${c}`} onClick={() => setF({ ...f, avatar_color: c })} style={{ width: 28, height: 28, borderRadius: '50%', background: c, border: 0, cursor: 'pointer', outline: f.avatar_color === c ? '3px solid var(--kt-text)' : 'none', outlineOffset: 2 }} />)}</div></div>
        <div><label className="kt-label">Display name</label><input className="kt-input" maxLength={60} value={f.display_name} onChange={e => setF({ ...f, display_name: e.target.value })} /></div>
        <div><label className="kt-label">Bio</label><textarea className="kt-textarea" style={{ minHeight: 76 }} maxLength={300} value={f.bio} onChange={e => setF({ ...f, bio: e.target.value })} placeholder="Tell partners what you like to talk about" /></div>
        <div><label className="kt-label">Country</label><input className="kt-input" value={f.country} onChange={e => setF({ ...f, country: e.target.value })} /></div>
      </div>
      <div className="kt-card kt-stack">
        <h2 className="kt-h2">Languages</h2>
        <div className="kt-grid c2" style={{ gridTemplateColumns: '1fr 1fr' }}><LangSelect label="I speak" value={f.native_lang} onChange={v => setF({ ...f, native_lang: v })} /><LangSelect label="I am learning" value={f.learning_lang} onChange={v => setF({ ...f, learning_lang: v })} /></div>
        <div><label className="kt-label">Level</label><Segmented value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></div>
        <div><label className="kt-label">Daily goal</label><Segmented value={f.daily_goal} onChange={v => setF({ ...f, daily_goal: v })} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></div>
        <div><label className="kt-label">Interests</label><InterestPicker value={f.interests} onChange={v => setF({ ...f, interests: v })} /></div>
      </div>
      <div className="kt-row kt-between kt-wrap"><button className="kt-btn danger" onClick={out}>Sign out</button><button className="kt-btn primary" disabled={!dirty || busy} onClick={save}>{busy ? 'Saving…' : 'Save changes'}</button></div>
    </div>
  )
}

/* @arkzen:web:page:profile:end */

/* @arkzen:native:components:shared */

/* @arkzen:import:expo */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import { useRouter } from 'expo-router'
import { Flame, WifiOff, Handshake, PenLine, Users, Globe, Brain, Compass, GraduationCap, Target, BookOpen, PartyPopper, Layers, Medal, Check, TrendingUp, MessageCircle, Lightbulb, CalendarDays, Sprout, Star, FileText, Book, Home, Newspaper, User, Heart, Hand, Pencil, Sun, Flower2, Coffee, Headphones, Gamepad2, Utensils, Trophy, Clock, History, Sparkles, X } from 'lucide-react-native'
import { SvgUri } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { arkzenFetch, useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('kotoba')

export const useNav = () => {
  const r = useRouter()
  return { go: (p: string) => r.push((p ? `/kotoba/${p}` : '/kotoba') as any) }
}
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { View, Text, TextInput, TouchableOpacity, Pressable, ScrollView, ActivityIndicator, Modal, KeyboardAvoidingView, Platform, RefreshControl } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { Flame, WifiOff, Handshake, PenLine, Users, Globe, Brain, Compass, GraduationCap, Target, BookOpen, PartyPopper, Layers, Medal, Check, TrendingUp, MessageCircle, Lightbulb, CalendarDays, Sprout, Star, FileText, Book, Home, Newspaper, User, Heart, Hand, Pencil, Sun, Flower2, Coffee, Headphones, Gamepad2, Utensils, Trophy, Clock, History, Sparkles, X } from 'lucide-react-native'
import { SvgUri } from 'react-native-svg'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { arkzenFetch, useAuthStore, setActiveTatemono } from '@/arkzen/core/stores/authStore'

setActiveTatemono('kotoba')

export const useNav = () => {
  const n = useNavigation<any>()
  return { go: (p: string) => n.navigate(p ? `kotoba/${p}` : 'kotoba/index') }
}
/* @arkzen:import:rn:end */

// ─── Theme (paper + ink) ──────────────────────────────────────
export const TH = {
  bg: '#e9e4da', card: '#f5f1e9', fill: '#e0d9cb', text: '#121212', sub: '#6b655b', line: 'rgba(18,18,18,0.14)',
  blue: '#121212', green: '#3f6b4f', orange: '#8a6a2f', red: '#9b3b34', purple: '#4a4a4a',
}
export const SHADOW = { shadowColor: '#121212', shadowOpacity: 0.07, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 2 }

export type KProfile = {
  id: number; user_id: number; display_name: string; bio?: string | null; native_lang: string; learning_lang: string
  level: string; country?: string | null; interests?: string | null; avatar_color: string; xp: number; streak: number
  best_streak: number; daily_goal: number; words_written: number; messages_sent: number; onboarded: boolean
  score?: number; shared?: string[]; following?: boolean
}
export type KPost = {
  id: number; user_id: number; author_name: string; author_color?: string | null; author_native?: string | null
  lang: string; kind: string; mission_id?: number | null; body: string; translation?: string | null
  likes_count: number; comments_count: number; corrections_count: number; liked?: boolean; created_at?: string
}
export type KComment = {
  id: number; post_id: number; user_id: number; author_name: string; author_color?: string | null; body: string
  is_correction: boolean; corrected?: string | null; explanation?: string | null; accepted: boolean; created_at?: string
}

export const LANGS = [
  { code: 'en', name: 'English' }, { code: 'es', name: 'Spanish' },
  { code: 'ja', name: 'Japanese' }, { code: 'fr', name: 'French' },
  { code: 'ko', name: 'Korean' }, { code: 'de', name: 'German' },
  { code: 'pt', name: 'Portuguese' }, { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Mandarin' }, { code: 'tl', name: 'Filipino' },
]
export const LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']
export const COLORS = ['#121212', '#4a4a4a', '#3f6b4f', '#8a6a2f', '#7a3b34', '#4a5a6a', '#6b5a7a']
export const langName = (c?: string | null) => LANGS.find(l => l.code === c)?.name ?? (c ?? '')

// Tiny cross-screen state (RN has no URL hash)
export const pending: { chat: { kind: 'dm' | 'circle'; id: number } | null; feedScope: string | null } = { chat: null, feedScope: null }

// ─── Network + helpers ────────────────────────────────────────
// The request function is an ALL_CAPS const on purpose: the engine writes it to
// constants.tsx, which the generated hooks.tsx can import (it can NOT import
// utils.tsx, where a plain `kt` function would be emitted). `kt` stays as the
// short alias every screen already calls.
export const KT_REQUEST = async function <T = any>(path: string, opts: { method?: string; json?: any } = {}): Promise<T> {
  const init: RequestInit = { method: opts.method ?? (opts.json !== undefined ? 'POST' : 'GET') }
  if (opts.json !== undefined) init.body = JSON.stringify(opts.json)
  const res = await arkzenFetch(`/api/kotoba${path}`, init)
  let data: any = null
  try { data = await res.json() } catch { data = null }
  if (!res.ok) {
    const first = data?.errors ? (Object.values(data.errors)[0] as string[] | undefined)?.[0] : undefined
    throw new Error(first ?? data?.message ?? `Request failed (${res.status})`)
  }
  return data as T
}
export const kt = KT_REQUEST

export function toast(message: string, kind: 'ok' | 'err' = 'ok') {
  const bus = (globalThis as any).__ktToast
  if (typeof bus === 'function') bus(message, kind)
}

export function timeAgo(ts?: string | null) {
  if (!ts) return ''
  const s = Math.max(1, Math.floor((Date.now() - new Date(ts).getTime()) / 1000))
  if (s < 60) return 'now'
  if (s < 3600) return `${Math.floor(s / 60)}m`
  if (s < 86400) return `${Math.floor(s / 3600)}h`
  return `${Math.floor(s / 86400)}d`
}
export const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\p{L}\p{N}\s]/gu, '').replace(/\s+/g, ' ').trim()
export const shuffle = <T,>(a: T[]): T[] => { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [r[i], r[j]] = [r[j], r[i]] } return r }

export function diffText(a: string, b: string) {
  const split = (s: string) => (/\s/.test(s) ? s.split(/(\s+)/).filter(Boolean) : Array.from(s))
  const x = split(a), y = split(b)
  const dp: number[][] = Array.from({ length: x.length + 1 }, () => new Array(y.length + 1).fill(0))
  for (let i = x.length - 1; i >= 0; i--) for (let j = y.length - 1; j >= 0; j--) dp[i][j] = x[i] === y[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1])
  const out: { t: 'same' | 'del' | 'add'; s: string }[] = []
  let i = 0, j = 0
  while (i < x.length && j < y.length) {
    if (x[i] === y[j]) { out.push({ t: 'same', s: x[i] }); i++; j++ }
    else if (dp[i + 1][j] >= dp[i][j + 1]) { out.push({ t: 'del', s: x[i] }); i++ }
    else { out.push({ t: 'add', s: y[j] }); j++ }
  }
  while (i < x.length) out.push({ t: 'del', s: x[i++] })
  while (j < y.length) out.push({ t: 'add', s: y[j++] })
  return out
}

export function useApi<T = any>(path: string | null, deps: any[] = []) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState<boolean>(!!path)
  const [error, setError] = useState<string | null>(null)
  const load = useCallback(async () => {
    if (!path) return
    setLoading(true); setError(null)
    try { setData(await KT_REQUEST<T>(path)) }
    catch (e) { setError(e instanceof Error ? e.message : 'Something went wrong') }
    finally { setLoading(false) }
  }, [path])
  useEffect(() => { load() }, [load, ...deps])
  return { data, loading, error, reload: load, setData }
}

export function useRealtime(event: string, cb: (data: any) => void) {
  const ref = useRef(cb)
  ref.current = cb
  useEffect(() => {
    const g = globalThis as any
    g.__ktBus = g.__ktBus ?? new Set()
    const h = (e: string, d: any) => { if (e === event) ref.current(d) }
    g.__ktBus.add(h)
    return () => { g.__ktBus.delete(h) }
  }, [event])
}

export function useProfile() {
  const [profile, setProfile] = useState<KProfile | null>(null)
  const load = useCallback(async () => {
    try { const r = await KT_REQUEST<{ data: KProfile }>('/me'); setProfile(r.data) } catch { /* auth layout handles it */ }
  }, [])
  useEffect(() => { load() }, [load])
  return { profile, setProfile, reload: load }
}

// ─── UI atoms ─────────────────────────────────────────────────
export const Avatar = ({ name, color = '#121212', size = 40 }: { name?: string; color?: string | null; size?: number }) => (
  <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color ?? '#121212', alignItems: 'center', justifyContent: 'center' }}>
    <Text style={{ color: '#f5f1e9', fontWeight: '700', fontSize: size * 0.42 }}>{(name || '?').trim().slice(0, 1).toUpperCase()}</Text>
  </View>
)

export const Card = ({ children, style, onPress }: { children: React.ReactNode; style?: any; onPress?: () => void }) => {
  const base = { backgroundColor: TH.card, borderRadius: 28, padding: 18, borderWidth: 1, borderColor: TH.line, ...SHADOW }
  return onPress ? <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[base, style]}>{children}</TouchableOpacity> : <View style={[base, style]}>{children}</View>
}

export const Btn = ({ label, onPress, kind = 'fill', disabled, small, style, icon, iconFilled }: { label: string; onPress: () => void; kind?: 'primary' | 'tint' | 'fill' | 'danger' | 'ghost'; disabled?: boolean; small?: boolean; style?: any; icon?: string; iconFilled?: boolean }) => {
  const bg = kind === 'primary' ? TH.blue : kind === 'fill' ? TH.fill : 'transparent'
  const fg = kind === 'primary' ? TH.card : kind === 'danger' ? TH.red : TH.text
  const ring = kind === 'tint' ? TH.text : kind === 'danger' ? TH.red : 'transparent'
  return (
    <TouchableOpacity accessibilityRole="button" accessibilityLabel={label} disabled={disabled} activeOpacity={0.8} onPress={onPress}
      style={[{ height: small ? 36 : 50, paddingHorizontal: small ? 16 : 24, borderRadius: 999, backgroundColor: bg, borderWidth: 1.5, borderColor: ring, flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', opacity: disabled ? 0.4 : 1 }, style]}>
      {icon ? <Ico n={icon} size={small ? 15 : 18} color={fg} fill={iconFilled} /> : null}
      <Text style={{ color: fg, fontWeight: '600', fontSize: small ? 14 : 16 }}>{label}</Text>
    </TouchableOpacity>
  )
}

export const Chip = ({ label, tone = 'gray', onPress, on }: { label: string; tone?: 'gray' | 'blue' | 'green' | 'orange' | 'purple'; onPress?: () => void; on?: boolean }) => {
  const m: any = { gray: [TH.fill, TH.sub, 'transparent'], blue: [TH.blue, TH.card, 'transparent'], green: ['transparent', TH.green, TH.green], orange: ['transparent', TH.orange, TH.orange], purple: ['transparent', TH.purple, TH.purple] }
  const [bg, fg, ring] = on ? m.blue : m[tone]
  const inner = <View style={{ backgroundColor: bg, borderWidth: 1.5, borderColor: ring, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' }}><Text style={{ color: fg, fontSize: 12, fontWeight: '600' }}>{label}</Text></View>
  return onPress ? <TouchableOpacity onPress={onPress} style={{ marginRight: 6, marginBottom: 6 }}>{inner}</TouchableOpacity> : <View style={{ marginRight: 6, marginBottom: 6 }}>{inner}</View>
}

export const Seg = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) => (
  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
    <View style={{ flexDirection: 'row', backgroundColor: TH.fill, borderRadius: 999, padding: 4 }}>
      {options.map(o => (
        <TouchableOpacity key={o.value} accessibilityRole="tab" accessibilityState={{ selected: value === o.value }} onPress={() => onChange(o.value)}
          style={{ paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999, backgroundColor: value === o.value ? TH.blue : 'transparent' }}>
          <Text style={{ fontWeight: value === o.value ? '700' : '500', fontSize: 14, color: value === o.value ? TH.card : TH.text }}>{o.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  </ScrollView>
)

export const Field = ({ label, value, onChangeText, placeholder, multiline, secure, keyboard, autoCap }: { label?: string; value: string; onChangeText: (t: string) => void; placeholder?: string; multiline?: boolean; secure?: boolean; keyboard?: any; autoCap?: any }) => (
  <View>
    {label && <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Text>}
    <TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={TH.sub} multiline={multiline} secureTextEntry={secure} keyboardType={keyboard} autoCapitalize={autoCap ?? 'none'} accessibilityLabel={label ?? placeholder}
      style={{ backgroundColor: TH.card, borderWidth: 1, borderColor: TH.line, borderRadius: 18, paddingHorizontal: 16, paddingVertical: multiline ? 12 : 13, fontSize: 16, color: TH.text, minHeight: multiline ? 90 : undefined, textAlignVertical: multiline ? 'top' : 'center' }} />
  </View>
)

export const Sheet = ({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: React.ReactNode }) => (
  <Modal visible={open} transparent animationType="slide" onRequestClose={onClose}>
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(18,18,18,0.45)' }}>
      <Pressable style={{ flex: 1 }} onPress={onClose} accessibilityLabel="Dismiss" />
      <View style={{ backgroundColor: TH.card, borderTopLeftRadius: 32, borderTopRightRadius: 32, maxHeight: '90%', paddingTop: 10 }}>
        <View style={{ alignSelf: 'center', width: 38, height: 5, borderRadius: 3, backgroundColor: TH.line, marginBottom: 8 }} />
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 8 }}>
          <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>{title}</Text>
          <TouchableOpacity onPress={onClose} accessibilityLabel="Close" style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Ico n="close" size={16} color={TH.sub} /></TouchableOpacity>
        </View>
        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ padding: 20, paddingTop: 8, paddingBottom: 36, gap: 14 }}>{children}</ScrollView>
      </View>
    </KeyboardAvoidingView>
  </Modal>
)

// Icons are lucide SVGs addressed by a short key (the same keys circles and lessons store).
export const Ico = ({ n, size = 20, color, fill }: { n?: string | null; size?: number; color?: string; fill?: boolean }) => {
  const map: Record<string, any> = {
    'flame': Flame, 'wifi-off': WifiOff, 'handshake': Handshake, 'pen-line': PenLine, 'users': Users, 'globe': Globe, 'brain': Brain,
    'compass': Compass, 'graduation-cap': GraduationCap, 'target': Target, 'book-open': BookOpen, 'party-popper': PartyPopper, 'layers': Layers,
    'medal': Medal, 'check': Check, 'trending-up': TrendingUp, 'message-circle': MessageCircle, 'lightbulb': Lightbulb, 'calendar': CalendarDays,
    'sprout': Sprout, 'star': Star, 'file-text': FileText, 'book': Book, 'home': Home, 'newspaper': Newspaper, 'user': User, 'heart': Heart,
    'hand': Hand, 'pencil': Pencil, 'sun': Sun, 'flower': Flower2, 'coffee': Coffee, 'headphones': Headphones, 'gamepad': Gamepad2,
    'utensils': Utensils, 'trophy': Trophy, 'clock': Clock, 'history': History, 'close': X,
  }
  const C = (n && map[n]) || Sparkles
  const c = color ?? TH.text
  return <C size={size} color={c} strokeWidth={1.7} fill={fill ? c : 'none'} />
}

// Brand mark: an SVG served online (Iconify), not a bundled asset.
export const Logo = ({ size = 28 }: { size?: number }) => (
  <SvgUri uri="https://api.iconify.design/lucide/languages.svg?color=%23121212" width={size} height={size} />
)

export const Empty = ({ icon, title, text, children }: { icon?: string; title: string; text?: string; children?: React.ReactNode }) => (
  <View style={{ alignItems: 'center', padding: 32, gap: 6 }}>
    <Ico n={icon ?? 'sprout'} size={34} />
    <Text style={{ fontSize: 18, fontWeight: '700', color: TH.text, textAlign: 'center' }}>{title}</Text>
    {text && <Text style={{ color: TH.sub, textAlign: 'center', fontSize: 15, lineHeight: 21 }}>{text}</Text>}
    {children && <View style={{ marginTop: 10 }}>{children}</View>}
  </View>
)

export const Skel = ({ n = 3, h = 100 }: { n?: number; h?: number }) => (
  <View style={{ gap: 12 }}>{Array.from({ length: n }).map((_, i) => <View key={i} style={{ height: h, borderRadius: 28, backgroundColor: TH.fill }} />)}</View>
)

export const Bar = ({ value, max, color = TH.blue }: { value: number; max: number; color?: string }) => (
  <View style={{ height: 8, borderRadius: 4, backgroundColor: TH.fill, overflow: 'hidden' }}><View style={{ height: 8, borderRadius: 4, width: `${Math.max(0, Math.min(100, max ? (value / max) * 100 : 0))}%`, backgroundColor: color }} /></View>
)

// Realtime socket + toast host. Mounted once per screen through <Screen/>; the socket is shared and ref-counted so it
// connects once per session no matter how many screens are in the stack.
export const ShellFx = () => {
  const { user } = useAuthStore()
  const insets = useSafeAreaInsets()
  const [toasts, setToasts] = useState<{ id: number; message: string; kind: string }[]>([])
  const uid = (user as any)?.id as number | undefined

  useEffect(() => {
    const g = globalThis as any
    const host = (message: string, kind: string) => {
      const id = Date.now() + Math.random()
      setToasts(t => [...t, { id, message, kind }])
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
    }
    g.__ktHosts = [...(g.__ktHosts ?? []), host]
    g.__ktToast = (message: string, kind: string) => { const hs = g.__ktHosts ?? []; hs[hs.length - 1]?.(message, kind) }
    return () => { g.__ktHosts = (g.__ktHosts ?? []).filter((h: any) => h !== host) }
  }, [])

  // Realtime: one Reverb socket per session, fanned out through a global bus
  useEffect(() => {
    if (!uid) return
    const g = globalThis as any
    const rtState = (g.__ktRt = g.__ktRt ?? { uid: 0, users: 0, close: null as null | (() => void) })
    rtState.users += 1
    if (rtState.uid === uid && rtState.close) return () => { rtState.users -= 1; if (rtState.users <= 0 && rtState.close) { rtState.close(); rtState.close = null; rtState.uid = 0 } }
    rtState.close?.()
    let closed = false
    let retry = 0
    let timer: any
    let ws: WebSocket | null = null
    let host = 'localhost'
    let port = '8080'
    let key = 'arkzen-key'
    let secure = false
    try {
      host = process.env.EXPO_PUBLIC_REVERB_HOST ?? host
      port = process.env.EXPO_PUBLIC_REVERB_PORT ?? port
      key = process.env.EXPO_PUBLIC_REVERB_APP_KEY ?? key
      secure = (process.env.EXPO_PUBLIC_REVERB_SCHEME ?? 'ws') === 'wss'
    } catch { /* defaults */ }
    const emit = (event: string, data: any) => { const g = globalThis as any; g.__ktBus?.forEach((h: any) => h(event, data)) }
    const connect = () => {
      if (closed) return
      ws = new WebSocket(`${secure ? 'wss' : 'ws'}://${host}:${port}/app/${key}?protocol=7&client=js&version=8.4.0`)
      ws.onmessage = async (ev: any) => {
        let msg: any
        try { msg = JSON.parse(ev.data) } catch { return }
        if (msg.event === 'pusher:connection_established') {
          retry = 0
          const socketId = JSON.parse(msg.data).socket_id
          const channel = `private-kotoba.${uid}`
          try {
            const res = await arkzenFetch('/api/kotoba/auth/broadcasting/auth', { method: 'POST', body: JSON.stringify({ socket_id: socketId, channel_name: channel }) })
            if (!res.ok) return
            const auth = await res.json()
            ws?.send(JSON.stringify({ event: 'pusher:subscribe', data: { channel, auth: auth.auth } }))
          } catch { /* retry on reconnect */ }
        } else if (msg.event === 'pusher:ping') {
          ws?.send(JSON.stringify({ event: 'pusher:pong', data: {} }))
        } else if (typeof msg.event === 'string' && msg.event.startsWith('kotoba.')) {
          let data: any = msg.data
          try { data = typeof msg.data === 'string' ? JSON.parse(msg.data) : msg.data } catch { /* raw */ }
          emit(msg.event, data)
          if (msg.event === 'kotoba.alert-created') { const a = data?.data ?? data; (globalThis as any).__ktToast?.(a?.text ?? 'New notification', 'ok') }
        }
      }
      ws.onclose = () => { if (closed) return; retry = Math.min(retry + 1, 6); timer = setTimeout(connect, 1000 * 2 ** retry) }
      ws.onerror = () => { try { ws?.close() } catch { /* ignore */ } }
    }
    connect()
    rtState.uid = uid
    rtState.close = () => { closed = true; clearTimeout(timer); try { ws?.close() } catch { /* ignore */ } }
    return () => { rtState.users -= 1; if (rtState.users <= 0 && rtState.close) { rtState.close(); rtState.close = null; rtState.uid = 0 } }
  }, [uid])


  return (
    <View pointerEvents="none" style={{ position: 'absolute', top: insets.top + 8, left: 16, right: 16, gap: 8 }}>
      {toasts.map(t => <View key={t.id} style={{ backgroundColor: t.kind === 'err' ? '#9b3b34' : '#121212', borderRadius: 999, paddingVertical: 12, paddingHorizontal: 20 }}><Text style={{ fontSize: 14, fontWeight: '600', color: '#f5f1e9' }}>{t.message}</Text></View>)}
    </View>
  )
}

export const Screen = ({ title, subtitle, right, children, onRefresh, refreshing }: { title: string; subtitle?: string; right?: React.ReactNode; children: React.ReactNode; onRefresh?: () => void; refreshing?: boolean }) => (
  <View style={{ flex: 1 }}>
  <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 16 }} keyboardShouldPersistTaps="handled"
    refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} /> : undefined}>
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
      <View style={{ flex: 1 }}>
        <Text accessibilityRole="header" style={{ fontSize: 32, fontWeight: '800', letterSpacing: -0.8, color: TH.text }}>{title}</Text>
        {subtitle && <Text style={{ fontSize: 16, color: TH.sub, marginTop: 4 }}>{subtitle}</Text>}
      </View>
      {right}
    </View>
    {children}
  </ScrollView>
  <ShellFx />
  </View>
)

export const LangPicker = ({ label, value, onChange }: { label?: string; value: string; onChange: (v: string) => void }) => (
  <View>
    {label && <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 1.2 }}>{label}</Text>}
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {LANGS.map(l => <Chip key={l.code} label={`${l.name}`} on={value === l.code} onPress={() => onChange(l.code)} />)}
    </ScrollView>
  </View>
)

export const Diff = ({ from, to, size = 15 }: { from: string; to: string; size?: number }) => (
  <Text style={{ fontSize: size, color: TH.text, lineHeight: size * 1.5 }}>
    {diffText(from, to).map((p, i) => <Text key={i} style={p.t === 'del' ? { color: TH.red, textDecorationLine: 'line-through', backgroundColor: 'rgba(155, 59, 52, 0.14)' } : p.t === 'add' ? { color: '#3f6b4f', fontWeight: '700', backgroundColor: 'rgba(63, 107, 79, 0.2)' } : undefined}>{p.s}</Text>)}
  </Text>
)

export const InterestPicker = ({ value, onChange }: { value: string; onChange: (v: string) => void }) => {
  const all = ['travel', 'food', 'music', 'anime', 'football', 'books', 'coffee', 'photography', 'gaming', 'movies', 'fitness', 'tech']
  const cur = value.split(',').map(s => s.trim()).filter(Boolean)
  const flip = (i: string) => onChange((cur.includes(i) ? cur.filter(x => x !== i) : [...cur, i]).join(','))
  return <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>{all.map(i => <Chip key={i} label={i} on={cur.includes(i)} onPress={() => flip(i)} />)}</View>
}

// ─── Compose box ──────────────────────────────────────────────
export const ComposeBox = ({ lang: initialLang, kind = 'moment', missionId, placeholder, onPosted }: { lang: string; kind?: 'moment' | 'question' | 'mission'; missionId?: number | null; placeholder?: string; onPosted?: (p: KPost) => void }) => {
  const [body, setBody] = useState('')
  const [lang, setLang] = useState(initialLang)
  const [tr, setTr] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [busy, setBusy] = useState(false)
  useEffect(() => setLang(initialLang), [initialLang])
  const submit = async () => {
    if (!body.trim()) return
    setBusy(true)
    try {
      const r = await kt<{ data: KPost }>('/posts', { json: { body: body.trim(), lang, kind, mission_id: missionId ?? null, translation: tr.trim() || null } })
      setBody(''); setTr(''); setShowTr(false)
      toast(kind === 'mission' ? 'Mission complete! +20 XP' : 'Posted! +10 XP')
      onPosted?.(r.data)
    } catch (e) { toast(e instanceof Error ? e.message : 'Could not post', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Card style={{ gap: 12 }}>
      <Field value={body} onChangeText={setBody} multiline autoCap="sentences" placeholder={placeholder ?? `Write in ${langName(lang)}. Mistakes are welcome.`} />
      {showTr && <Field value={tr} onChangeText={setTr} multiline autoCap="sentences" placeholder="Add a translation (optional)" />}
      <LangPicker value={lang} onChange={setLang} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Btn small kind="ghost" label={showTr ? 'Hide translation' : 'Add translation'} onPress={() => setShowTr(s => !s)} />
        <Btn small kind="primary" label={busy ? 'Posting…' : kind === 'mission' ? 'Complete mission' : 'Post'} disabled={busy || !body.trim()} onPress={submit} />
      </View>
    </Card>
  )
}

// ─── Post card ────────────────────────────────────────────────
export const PostCard = ({ post, meId, onProfile, onDeleted }: { post: KPost; meId?: number; onProfile?: (id: number) => void; onDeleted?: (id: number) => void }) => {
  const [p, setP] = useState<KPost>(post)
  const [open, setOpen] = useState(false)
  const [comments, setComments] = useState<KComment[] | null>(null)
  const [mode, setMode] = useState('comment')
  const [text, setText] = useState('')
  const [fixed, setFixed] = useState(post.body)
  const [why, setWhy] = useState('')
  const [showTr, setShowTr] = useState(false)
  const [saveOpen, setSaveOpen] = useState(false)
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [busy, setBusy] = useState(false)
  useEffect(() => setP(post), [post])
  const mine = meId === p.user_id

  const like = async () => {
    setP(x => ({ ...x, liked: !x.liked, likes_count: x.likes_count + (x.liked ? -1 : 1) }))
    try { const r = await kt<{ liked: boolean; likes_count: number }>(`/posts/${p.id}/like`, { json: {} }); setP(x => ({ ...x, liked: r.liked, likes_count: r.likes_count })) } catch { setP(post) }
  }
  const toggle = async () => {
    const next = !open
    setOpen(next)
    if (next && comments === null) { try { const r = await kt<{ data: KComment[] }>(`/posts/${p.id}/comments`); setComments(r.data) } catch { toast('Could not load comments', 'err') } }
  }
  const send = async () => {
    if (!text.trim()) return
    if (mode === 'fix' && (!fixed.trim() || fixed.trim() === p.body.trim())) { toast('Edit the text to suggest a correction', 'err'); return }
    setBusy(true)
    try {
      const r = await kt<{ data: KComment }>(`/posts/${p.id}/comments`, { json: { body: text.trim(), is_correction: mode === 'fix', corrected: mode === 'fix' ? fixed.trim() : null, explanation: mode === 'fix' ? why.trim() || null : null } })
      setComments(c => [...(c ?? []), r.data])
      setP(x => ({ ...x, comments_count: x.comments_count + 1, corrections_count: x.corrections_count + (r.data.is_correction ? 1 : 0) }))
      setText(''); setWhy(''); setMode('comment'); setFixed(p.body)
      toast(r.data.is_correction ? 'Correction sent. +15 XP' : 'Comment sent. +5 XP')
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const accept = async (c: KComment) => {
    try { await kt(`/comments/${c.id}/accept`, { json: {} }); setComments(l => (l ?? []).map(x => x.id === c.id ? { ...x, accepted: true } : x)); toast('Correction accepted') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const save = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), lang: p.lang, example: p.body, source: 'feed' } }); toast(`Saved “${term.trim()}”`); setSaveOpen(false); setTerm(''); setMeaning('') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async () => { try { await kt(`/posts/${p.id}`, { method: 'DELETE' }); onDeleted?.(p.id) } catch { toast('Could not delete', 'err') } }
  const words = /\s/.test(p.body) ? p.body.split(/(\s+)/) : [p.body]

  return (
    <Card style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <TouchableOpacity onPress={() => onProfile?.(p.user_id)} accessibilityLabel={`Open ${p.author_name}`}><Avatar name={p.author_name} color={p.author_color} /></TouchableOpacity>
        <View style={{ flex: 1 }}><Text style={{ fontWeight: '600', fontSize: 16, color: TH.text }}>{p.author_name}</Text><Text style={{ color: TH.sub, fontSize: 13 }}>Native {langName(p.author_native)} · {timeAgo(p.created_at)}</Text></View>
        <Chip tone="blue" label={`${langName(p.lang)}`} />
      </View>
      <Text style={{ fontSize: 18, lineHeight: 27, color: TH.text }}>
        {words.map((w, i) => /^\s+$/.test(w) || w.length > 40 ? <Text key={i}>{w}</Text> : <Text key={i} onPress={() => { setTerm(w.replace(/[.,!?¡¿;:()"“”]/g, '')); setSaveOpen(true) }}>{w}</Text>)}
      </Text>
      {p.translation && <TouchableOpacity onPress={() => setShowTr(s => !s)}><Text style={{ color: TH.blue, fontSize: 14, fontWeight: '600' }}>{showTr ? 'Hide translation' : 'Show translation'}</Text>{showTr && <Text style={{ color: TH.sub, fontSize: 15, marginTop: 4 }}>{p.translation}</Text>}</TouchableOpacity>}
      <Text style={{ color: TH.sub, fontSize: 12 }}>Tip: tap any word to save it to your deck.</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <Btn small kind="ghost" icon="heart" iconFilled={p.liked} label={String(p.likes_count)} onPress={like} />
        <Btn small kind="ghost" icon="message-circle" label={String(p.comments_count)} onPress={toggle} />
        {p.corrections_count > 0 ? <Chip tone="green" label={`${p.corrections_count} correction${p.corrections_count > 1 ? 's' : ''}`} /> : !mine ? <Chip tone="orange" label="Needs feedback" /> : null}
        {mine && <Btn small kind="ghost" label="Delete" onPress={remove} />}
      </View>
      {open && (
        <View style={{ gap: 12, borderTopWidth: 1, borderTopColor: TH.line, paddingTop: 12 }}>
          {comments === null && <ActivityIndicator />}
          {comments?.length === 0 && <Text style={{ color: TH.sub }}>No comments yet. Be the first to help.</Text>}
          {comments?.map(c => (
            <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
              <Avatar name={c.author_name} color={c.author_color} size={30} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontSize: 14, color: TH.text }}><Text style={{ fontWeight: '700' }}>{c.author_name}</Text> <Text style={{ color: TH.sub }}>{timeAgo(c.created_at)}</Text></Text>
                <Text style={{ fontSize: 15, color: TH.text }}>{c.body}</Text>
                {c.is_correction && c.corrected && (
                  <View style={{ backgroundColor: 'rgba(63, 107, 79, 0.14)', borderRadius: 14, padding: 10, gap: 6, borderWidth: 1, borderColor: 'rgba(63, 107, 79, 0.35)' }}>
                    <Text style={{ fontSize: 12, fontWeight: '700', color: TH.text }}>Suggested correction {c.accepted ? '· Accepted' : ''}</Text>
                    <Diff from={p.body} to={c.corrected} />
                    {c.explanation && <Text style={{ color: TH.sub, fontSize: 14 }}>{c.explanation}</Text>}
                    {mine && !c.accepted && <Btn small kind="tint" label="Accept and thank" onPress={() => accept(c)} />}
                  </View>
                )}
              </View>
            </View>
          ))}
          {!mine && <Seg value={mode} onChange={setMode} options={[{ value: 'comment', label: 'Comment' }, { value: 'fix', label: 'Suggest correction' }]} />}
          {mode === 'fix' && <><Field value={fixed} onChangeText={setFixed} multiline autoCap="sentences" /><Field value={why} onChangeText={setWhy} placeholder="Why? A short explanation helps" autoCap="sentences" /></>}
          <Field value={text} onChangeText={setText} placeholder={mode === 'fix' ? 'Add a friendly note' : 'Write a comment'} autoCap="sentences" />
          <Btn kind="primary" label={busy ? 'Sending…' : 'Send'} disabled={busy || !text.trim()} onPress={send} />
        </View>
      )}
      <Sheet open={saveOpen} onClose={() => setSaveOpen(false)} title="Save to your deck">
        <Field label="Word or phrase" value={term} onChangeText={setTerm} />
        <Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" />
        <Btn kind="primary" label="Save" disabled={!term.trim() || !meaning.trim()} onPress={save} />
      </Sheet>
    </Card>
  )
}

// ─── Lesson player ────────────────────────────────────────────
export const LessonPlayer = ({ lesson, onClose, onDone }: { lesson: any; onClose: () => void; onDone: () => void }) => {
  const data = useMemo(() => { try { return JSON.parse(lesson.content) } catch { return { ex: [], v: [] } } }, [lesson])
  const ex: any[] = data.ex ?? []
  const [i, setI] = useState(0)
  const [status, setStatus] = useState<'idle' | 'right' | 'wrong'>('idle')
  const [correct, setCorrect] = useState(0)
  const [sel, setSel] = useState<number | null>(null)
  const [typed, setTyped] = useState('')
  const [picked, setPicked] = useState<number[]>([])
  const [left, setLeft] = useState<number | null>(null)
  const [done, setDone] = useState<number[]>([])
  const [result, setResult] = useState<{ xp: number; cards_added: number; score: number } | null>(null)
  const cur = ex[i]
  const order = useMemo<number[]>(() => shuffle<number>((cur?.o ?? cur?.w ?? []).map((_: any, k: number) => k)), [i, lesson])
  const rightOrder = useMemo<number[]>(() => shuffle<number>((cur?.p ?? []).map((_: any, k: number) => k)), [i, lesson])
  const reset = () => { setStatus('idle'); setSel(null); setTyped(''); setPicked([]); setLeft(null); setDone([]) }
  const verdict = (ok: boolean) => { setStatus(ok ? 'right' : 'wrong'); if (ok) setCorrect(c => c + 1) }
  const check = () => {
    if (cur.t === 'choose') verdict(sel === cur.a)
    else if (cur.t === 'type') verdict((cur.a as string[]).some(x => norm(x) === norm(typed)))
    else if (cur.t === 'order') verdict(picked.map(k => cur.w[k]).join('').replace(/\s/g, '') === String(cur.a).replace(/\s/g, ''))
  }
  const next = async () => {
    if (i + 1 < ex.length) { setI(i + 1); reset(); return }
    const score = Math.round((correct / Math.max(1, ex.length)) * 100)
    try { const r = await kt<{ xp: number; cards_added: number }>(`/lessons/${lesson.id}/complete`, { json: { score } }); setResult({ ...r, score }) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not save progress', 'err'); setResult({ xp: 0, cards_added: 0, score }) }
  }
  const pickMatch = (side: 'l' | 'r', k: number) => {
    if (status !== 'idle' || done.includes(k)) return
    if (side === 'l') { setLeft(k); return }
    if (left === null) return
    if (left === k) { const nd = [...done, k]; setDone(nd); setLeft(null); if (nd.length === cur.p.length) verdict(true) }
    else { setLeft(null); toast('Not a match, try again', 'err') }
  }
  const canCheck = cur?.t === 'choose' ? sel !== null : cur?.t === 'type' ? typed.trim().length > 0 : cur?.t === 'order' ? picked.length === cur.w.length : false
  const answerText = !cur ? '' : cur.t === 'choose' ? cur.o[cur.a] : cur.t === 'type' ? cur.a[0] : String(cur.a ?? '')

  return (
    <Modal visible animationType="slide" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: TH.bg, paddingTop: Platform.OS === 'ios' ? 54 : 30 }}>
        {result ? (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30, gap: 10 }}>
            <Ico n={result.score >= 70 ? 'party-popper' : 'medal'} size={56} />
            <Text style={{ fontSize: 44, fontWeight: '800', color: TH.text }}>{result.score}%</Text>
            <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{result.score >= 70 ? 'Nicely done!' : 'Good effort!'}</Text>
            <Text style={{ color: TH.sub, fontSize: 16, textAlign: 'center' }}>+{result.xp} XP{result.cards_added > 0 ? ` · ${result.cards_added} new words in your deck` : ''}</Text>
            <Btn kind="primary" label="Continue" onPress={onDone} style={{ alignSelf: 'stretch', marginTop: 20 }} />
          </View>
        ) : !cur ? <Empty title="This lesson is empty"><Btn label="Close" onPress={onClose} /></Empty> : (
          <>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 20, paddingBottom: 10 }}>
              <TouchableOpacity onPress={onClose} accessibilityLabel="Quit lesson" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: TH.card, alignItems: 'center', justifyContent: 'center' }}><Ico n="close" size={18} /></TouchableOpacity>
              <View style={{ flex: 1 }}><Bar value={i} max={ex.length} /></View>
              <Text style={{ color: TH.sub }}>{i + 1}/{ex.length}</Text>
            </View>
            <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} keyboardShouldPersistTaps="handled">
              <Text style={{ fontSize: 26, fontWeight: '800', color: TH.text, marginBottom: 10 }}>{cur.q}</Text>
              {cur.t === 'choose' && order.map((k: number) => (
                <TouchableOpacity key={k} disabled={status !== 'idle'} onPress={() => setSel(k)} style={{ backgroundColor: TH.card, borderRadius: 16, padding: 18, borderWidth: 2, borderColor: sel === k ? TH.blue : 'transparent' }}><Text style={{ fontSize: 18, color: TH.text }}>{cur.o[k]}</Text></TouchableOpacity>
              ))}
              {cur.t === 'type' && <Field value={typed} onChangeText={setTyped} placeholder="Type your answer" />}
              {cur.t === 'order' && (
                <>
                  <View style={{ minHeight: 70, backgroundColor: TH.card, borderRadius: 16, padding: 10, flexDirection: 'row', flexWrap: 'wrap' }}>{picked.map((k, n) => <Chip key={n} on label={cur.w[k]} onPress={() => status === 'idle' && setPicked(picked.filter((_, m) => m !== n))} />)}</View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{order.filter((k: number) => !picked.includes(k)).map((k: number) => <Btn key={k} label={cur.w[k]} onPress={() => status === 'idle' && setPicked([...picked, k])} />)}</View>
                </>
              )}
              {cur.t === 'match' && (
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <View style={{ flex: 1, gap: 10 }}>{cur.p.map((pair: string[], k: number) => <TouchableOpacity key={k} disabled={done.includes(k)} onPress={() => pickMatch('l', k)} style={{ backgroundColor: TH.card, borderRadius: 14, padding: 16, opacity: done.includes(k) ? 0.35 : 1, borderWidth: 2, borderColor: left === k ? TH.blue : 'transparent' }}><Text style={{ fontSize: 16, textAlign: 'center', color: TH.text }}>{pair[0]}</Text></TouchableOpacity>)}</View>
                  <View style={{ flex: 1, gap: 10 }}>{rightOrder.map((k: number) => <TouchableOpacity key={k} disabled={done.includes(k)} onPress={() => pickMatch('r', k)} style={{ backgroundColor: TH.card, borderRadius: 14, padding: 16, opacity: done.includes(k) ? 0.35 : 1 }}><Text style={{ fontSize: 16, textAlign: 'center', color: TH.text }}>{cur.p[k][1]}</Text></TouchableOpacity>)}</View>
                </View>
              )}
            </ScrollView>
            <View style={{ padding: 20, paddingBottom: 34, backgroundColor: status === 'right' ? 'rgba(63, 107, 79, 0.2)' : status === 'wrong' ? 'rgba(155, 59, 52, 0.16)' : TH.card, gap: 10 }}>
              {status === 'right' && <Text style={{ color: '#3f6b4f', fontWeight: '800', fontSize: 18 }}>Correct!</Text>}
              {status === 'wrong' && <View><Text style={{ color: TH.red, fontWeight: '800', fontSize: 18 }}>Not quite</Text>{cur.t !== 'match' && <Text style={{ color: TH.sub }}>Answer: {answerText}</Text>}</View>}
              {status === 'idle' ? (cur.t === 'match' ? <Btn label="Skip" onPress={() => verdict(false)} /> : <Btn kind="primary" label="Check" disabled={!canCheck} onPress={check} />) : <Btn kind="primary" label={i + 1 < ex.length ? 'Continue' : 'Finish'} onPress={next} />}
            </View>
          </>
        )}
      </View>
    </Modal>
  )
}

// ─── Profile + onboarding sheets ──────────────────────────────
export const ProfileSheet = ({ userId, onClose }: { userId: number | null; onClose: () => void }) => {
  const nav = useNav()
  const [d, setD] = useState<any>(null)
  useEffect(() => {
    setD(null)
    if (userId) kt(`/profile/${userId}`).then(setD).catch(e => { toast(e instanceof Error ? e.message : 'Profile not found', 'err'); onClose() })
  }, [userId])
  const follow = async () => { try { const r = await kt<{ following: boolean }>(`/follow/${userId}`, { json: {} }); setD((x: any) => ({ ...x, following: r.following, followers: x.followers + (r.following ? 1 : -1) })) } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') } }
  const message = async () => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: userId } }); pending.chat = { kind: 'dm', id: r.data.id }; onClose(); nav.go('chat') } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const p: KProfile | undefined = d?.data
  return (
    <Sheet open={!!userId} onClose={onClose} title="Profile">
      {!p ? <ActivityIndicator /> : (
        <>
          <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}><Avatar name={p.display_name} color={p.avatar_color} size={64} /><View><Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{p.display_name}</Text><Text style={{ color: TH.sub }}>{p.country ?? 'Somewhere on Earth'}</Text></View></View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}><Chip tone="green" label={`Speaks ${langName(p.native_lang)}`} /><Chip tone="blue" label={`Learning ${langName(p.learning_lang)} · ${p.level}`} /><Chip tone="orange" label={`${p.streak} day streak`} /></View>
          {p.bio && <Text style={{ fontSize: 16, lineHeight: 23, color: TH.text }}>{p.bio}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}>{[['Posts', d.post_count], ['Followers', d.followers], ['Following', d.following_count]].map(([k, v]) => <View key={k as string} style={{ flex: 1, backgroundColor: TH.fill, borderRadius: 14, padding: 12, alignItems: 'center' }}><Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>{v}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{k}</Text></View>)}</View>
          <View style={{ flexDirection: 'row', gap: 10 }}><Btn kind="primary" label="Message" onPress={message} style={{ flex: 1 }} /><Btn label={d.following ? 'Following' : 'Follow'} onPress={follow} /></View>
        </>
      )}
    </Sheet>
  )
}

export const OnboardingSheet = ({ open, profile, onDone }: { open: boolean; profile?: KProfile; onDone: () => void }) => {
  const [native, setNative] = useState('en')
  const [learning, setLearning] = useState('es')
  const [level, setLevel] = useState('A1')
  const [interests, setInterests] = useState('')
  const [goal, setGoal] = useState('3')
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) { setNative(profile.native_lang); setLearning(profile.learning_lang); setLevel(profile.level) } }, [profile?.id])
  const save = async () => {
    if (native === learning) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { await kt('/me', { method: 'PUT', json: { native_lang: native, learning_lang: learning, level, interests, daily_goal: Number(goal), onboarded: true } }); toast('You are all set!'); onDone() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  return (
    <Sheet open={open} onClose={() => {}} title="Welcome to Kotoba">
      <Text style={{ color: TH.sub, fontSize: 15 }}>Two quick questions so we can match you with the right people, missions and lessons.</Text>
      <LangPicker label="I speak" value={native} onChange={setNative} />
      <LangPicker label="I am learning" value={learning} onChange={setLearning} />
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>My level</Text><Seg value={level} onChange={setLevel} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Things I like talking about</Text><InterestPicker value={interests} onChange={setInterests} /></View>
      <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Daily goal</Text><Seg value={goal} onChange={setGoal} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></View>
      <Btn kind="primary" label={busy ? 'Saving…' : 'Start learning'} disabled={busy} onPress={save} />
    </Sheet>
  )
}

/* @arkzen:native:components:shared:end */

/* @arkzen:native:layout:shell */

/* @arkzen:import:expo */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter, usePathname } from 'expo-router'
import { Home, Newspaper, GraduationCap, Layers, MessageCircle, User } from 'lucide-react-native'

const useTabNav = () => {
  const r = useRouter()
  const p = usePathname() ?? ''
  return { go: (k: string) => r.push(`/kotoba/${k}` as any), active: p.split('/').filter(Boolean).pop() ?? '' }
}
/* @arkzen:import:expo:end */

/* @arkzen:import:rn */
import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { useNavigation, useRoute } from '@react-navigation/native'
import { Home, Newspaper, GraduationCap, Layers, MessageCircle, User } from 'lucide-react-native'

const useTabNav = () => {
  const n = useNavigation<any>()
  const r = useRoute()
  return { go: (k: string) => n.navigate(`kotoba/${k}`), active: (r.name ?? '').split('/').pop() ?? '' }
}
/* @arkzen:import:rn:end */

const TABS = [
  { key: 'dashboard', label: 'Home', icon: Home }, { key: 'feed', label: 'Feed', icon: Newspaper }, { key: 'learn', label: 'Learn', icon: GraduationCap },
  { key: 'review', label: 'Review', icon: Layers }, { key: 'chat', label: 'Chat', icon: MessageCircle }, { key: 'profile', label: 'Me', icon: User },
]

// The shell is only chrome (tab bar). Realtime and toasts live in the shared <ShellFx/> component, mounted by <Screen>,
// because layouts cannot use the '@/arkzen' import alias (their generated file sits in a different folder).
export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const nav = useTabNav()
  const insets = useSafeAreaInsets()

  return (
    <View style={{ flex: 1, backgroundColor: '#e9e4da' }}>
      <SafeAreaView edges={['top']} style={{ flex: 1 }}>{children}</SafeAreaView>
      <View accessibilityRole="tablist" style={{ flexDirection: 'row', marginHorizontal: 14, marginBottom: Math.max(insets.bottom, 10), padding: 6, backgroundColor: '#f5f1e9', borderRadius: 999, borderWidth: 1, borderColor: 'rgba(18,18,18,0.12)' }}>
        {TABS.map(t => {
          const on = nav.active === t.key
          const Icon = t.icon
          return (
            <TouchableOpacity key={t.key} accessibilityRole="tab" accessibilityLabel={t.label} accessibilityState={{ selected: on }} onPress={() => nav.go(t.key)} style={{ flex: 1, alignItems: 'center', gap: 2, paddingVertical: 7, borderRadius: 999, backgroundColor: on ? '#121212' : 'transparent' }}>
              <Icon size={20} color={on ? '#f5f1e9' : '#6b655b'} strokeWidth={1.8} />
              <Text style={{ fontSize: 10, fontWeight: '600', color: on ? '#f5f1e9' : '#6b655b' }}>{t.label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

/* @arkzen:native:layout:shell:end */

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:+guest */

const IndexScreen = () => {
  const nav = useNav()
  return (
    <ScrollView style={{ flex: 1, backgroundColor: TH.bg }} contentContainerStyle={{ padding: 24, paddingTop: 56, paddingBottom: 44, gap: 22 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}><Logo /><Text style={{ fontSize: 20, fontWeight: '800', letterSpacing: -0.6, color: TH.text }}>Kotoba</Text></View>
      <View style={{ height: 320, borderRadius: 36, overflow: 'hidden', backgroundColor: TH.fill }}>
        <Image source={{ uri: 'https://picsum.photos/seed/kotoba-words/900/1125?grayscale' }} style={{ width: '100%', height: '100%' }} resizeMode="cover" />
        <View style={{ position: 'absolute', left: 14, right: 14, bottom: 14, borderRadius: 26, backgroundColor: TH.text, paddingVertical: 16, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View><Text style={{ color: 'rgba(245,241,233,0.6)', fontSize: 12 }}>kotoba</Text><Text style={{ color: TH.card, fontSize: 20, fontWeight: '700' }}>Words</Text></View>
          <Text style={{ color: TH.card, fontSize: 40, fontWeight: '700', fontFamily: Platform.OS === 'ios' ? 'Hiragino Mincho ProN' : 'serif' }}>言葉</Text>
        </View>
      </View>
      <Text style={{ fontSize: 11, fontWeight: '600', letterSpacing: 1.6, color: TH.sub, textTransform: 'uppercase' }}>Social language learning</Text>
      <Text style={{ fontSize: 44, fontWeight: '800', letterSpacing: -1.8, color: TH.text, lineHeight: 46, marginTop: -12 }}>Learn by talking, not by tapping.</Text>
      <Text style={{ fontSize: 17, color: TH.sub, lineHeight: 26 }}>Write real posts, get corrected by native speakers, and turn every mistake into a flashcard.</Text>
      <View style={{ gap: 10 }}>
        <Btn kind="primary" label="Create free account" onPress={() => nav.go('register')} />
        <Btn kind="tint" label="I have an account" onPress={() => nav.go('login')} />
      </View>
    </ScrollView>
  )
}

/* @arkzen:native:page:index:end */

/* @arkzen:native:page:login */
/* @arkzen:native:page:layout:+guest */

const LoginScreen = () => {
  const nav = useNav()
  const { login, isLoading } = useAuthStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async () => {
    setError(null)
    try { await login(email.trim(), password) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to sign in') }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: TH.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <Card style={{ padding: 28, gap: 14, borderRadius: 36 }}>
          <Logo /><Text style={{ fontSize: 32, fontWeight: '800', letterSpacing: -1, color: TH.text }}>Welcome back</Text>
          <Text style={{ color: TH.sub, fontSize: 16 }}>Sign in to continue your streak.</Text>
          {error && <View accessibilityRole="alert" style={{ backgroundColor: 'rgba(155, 59, 52, 0.14)', padding: 12, borderRadius: 12 }}><Text style={{ color: TH.red }}>{error}</Text></View>}
          <Field label="Email" value={email} onChangeText={setEmail} keyboard="email-address" />
          <Field label="Password" value={password} onChangeText={setPassword} secure />
          <Btn kind="primary" label={isLoading ? 'Signing in…' : 'Sign in'} disabled={isLoading || !email || !password} onPress={submit} />
          <Btn label="Use demo account" onPress={() => { setEmail('demo@kotoba.app'); setPassword('password123') }} />
          <Btn kind="ghost" label="New here? Create an account" onPress={() => nav.go('register')} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:login:end */

/* @arkzen:native:page:register */
/* @arkzen:native:page:layout:+guest */

const RegisterScreen = () => {
  const nav = useNav()
  const { register, isLoading } = useAuthStore()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const submit = async () => {
    setError(null)
    if (password !== confirm) { setError('Passwords do not match'); return }
    try { await register(name.trim(), email.trim(), password, confirm) } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create account') }
  }
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, backgroundColor: TH.bg }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} keyboardShouldPersistTaps="handled">
        <Card style={{ padding: 28, gap: 14, borderRadius: 36 }}>
          <Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>Create your account</Text>
          <Text style={{ color: TH.sub, fontSize: 16 }}>Free forever. Takes under a minute.</Text>
          {error && <View accessibilityRole="alert" style={{ backgroundColor: 'rgba(155, 59, 52, 0.14)', padding: 12, borderRadius: 12 }}><Text style={{ color: TH.red }}>{error}</Text></View>}
          <Field label="Name" value={name} onChangeText={setName} autoCap="words" />
          <Field label="Email" value={email} onChangeText={setEmail} keyboard="email-address" />
          <Field label="Password (8+ characters)" value={password} onChangeText={setPassword} secure />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secure />
          <Btn kind="primary" label={isLoading ? 'Creating…' : 'Create account'} disabled={isLoading || !name || !email || password.length < 8} onPress={submit} />
          <Btn kind="ghost" label="Already learning with us? Sign in" onPress={() => nav.go('login')} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

/* @arkzen:native:page:register:end */

/* @arkzen:native:page:dashboard */
/* @arkzen:native:page:layout:+auth:shell */

const DashboardScreen = () => {
  const nav = useNav()
  const { data, loading, error, reload } = useApi<any>('/home')
  const [writing, setWriting] = useState(false)
  const [onb, setOnb] = useState(false)
  const p: KProfile | undefined = data?.profile
  useEffect(() => { if (p && !p.onboarded) setOnb(true) }, [p?.id, p?.onboarded])
  const h = new Date().getHours()
  const hi = h < 5 ? 'Still up' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
  const goal = p?.daily_goal ?? 3
  const today = data?.today_activity ?? 0

  const plan = [
    { e: 'target', t: data?.mission?.title ?? 'Daily mission', s: data?.mission_done ? 'Done for today. Nice work!' : data?.mission?.prompt, done: !!data?.mission_done, cta: 'Write', run: () => setWriting(true) },
    { e: 'book-open', t: data?.next_lesson ? `Lesson: ${data.next_lesson.title}` : 'Lessons', s: data?.next_lesson ? `Next up in ${data.next_lesson.unit}` : 'All lessons done for this language.', done: !data?.next_lesson, cta: 'Start', run: () => nav.go('learn') },
    { e: 'brain', t: `Review ${data?.due ?? 0} card${data?.due === 1 ? '' : 's'}`, s: data?.due ? 'Right before you forget them.' : 'Nothing due right now.', done: !data?.due, cta: 'Review', run: () => nav.go('review') },
    { e: 'handshake', t: 'Help a learner', s: `${data?.help_needed ?? 0} post${data?.help_needed === 1 ? '' : 's'} in ${langName(p?.native_lang)} need your eyes.`, done: !data?.help_needed, cta: 'Help', run: () => { pending.feedScope = 'help'; nav.go('feed') } },
  ]
  return (
    <Screen title={`${hi}, ${p?.display_name?.split(' ')[0] ?? 'friend'}`} subtitle={p ? `Learning ${langName(p.learning_lang)} · ${p.level}` : undefined} onRefresh={reload} refreshing={loading && !!data}>
      {loading && !data && <Skel n={3} h={110} />}
      {error && !data && <Empty icon="wifi-off" title="Cannot reach Kotoba" text={error}><Btn kind="primary" label="Try again" onPress={reload} /></Empty>}
      {data && (
        <>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Ico n="flame" size={24} /><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{p?.streak ?? 0}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>day streak</Text></Card>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Ico n="star" size={24} /><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{p?.xp ?? 0}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>XP</Text></Card>
            <Card style={{ flex: 1, alignItems: 'center', padding: 14 }}><Ico n="target" size={24} /><Text style={{ fontSize: 24, fontWeight: '800', color: TH.text }}>{Math.min(today, goal)}/{goal}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>today</Text></Card>
          </View>
          <Card style={{ gap: 4 }}>
            <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text, marginBottom: 6 }}>Today’s plan</Text>
            {plan.map((s, i) => (
              <View key={s.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderTopColor: TH.line, opacity: s.done ? 0.6 : 1 }}>
                <View style={{ width: 40, alignItems: 'center' }}><Ico n={s.done ? 'check' : s.e} size={24} /></View>
                <View style={{ flex: 1 }}><Text style={{ fontWeight: '600', fontSize: 16, color: TH.text }}>{s.t}</Text><Text numberOfLines={2} style={{ color: TH.sub, fontSize: 14, marginTop: 2 }}>{s.s}</Text></View>
                <Btn small kind={s.done ? 'fill' : 'tint'} label={s.cta} onPress={s.run} />
              </View>
            ))}
          </Card>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {[['Partners', 'compass', 'Find people', 'partners'], ['Circles', 'users', `${data.circles ?? 0} joined`, 'circles'], ['Progress', 'trending-up', 'See growth', 'progress']].map(([t, e, s, k]) => (
              <Card key={t} onPress={() => nav.go(k)} style={{ flexGrow: 1, flexBasis: '30%' }}><Ico n={e} size={24} /><Text style={{ fontWeight: '700', marginTop: 8, color: TH.text }}>{t}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{s}</Text></Card>
            ))}
          </View>
        </>
      )}
      <Sheet open={writing} onClose={() => setWriting(false)} title={data?.mission?.title ?? 'Daily mission'}>
        <Text style={{ fontSize: 16, lineHeight: 23, color: TH.text }}>{data?.mission?.prompt}</Text>
        {data?.mission?.hint && <Text style={{ color: TH.sub }}>Hint: {data.mission.hint}</Text>}
        <ComposeBox lang={p?.learning_lang ?? 'es'} kind="mission" missionId={data?.mission?.id} onPosted={() => { setWriting(false); reload() }} placeholder={`Write your answer in ${langName(p?.learning_lang)}…`} />
      </Sheet>
      <OnboardingSheet open={onb} profile={p} onDone={() => { setOnb(false); reload() }} />
    </Screen>
  )
}

/* @arkzen:native:page:dashboard:end */

/* @arkzen:native:page:feed */
/* @arkzen:native:page:layout:+auth:shell */

const FeedScreen = () => {
  const { profile } = useProfile()
  const [scope, setScope] = useState(pending.feedScope ?? 'all')
  const [lang, setLang] = useState('all')
  const [posts, setPosts] = useState<KPost[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  useEffect(() => { pending.feedScope = null }, [])
  const load = useCallback(async () => {
    setError(null)
    try { const r = await kt<{ data: KPost[] }>(`/feed?scope=${scope}${lang !== 'all' ? `&lang=${lang}` : ''}`); setPosts(r.data) }
    catch (e) { setError(e instanceof Error ? e.message : 'Could not load the feed'); setPosts([]) }
  }, [scope, lang])
  useEffect(() => { setPosts(null); load() }, [load])
  return (
    <Screen title="Community" subtitle="Write, get corrected, return the favour." onRefresh={async () => { setRefreshing(true); await load(); setRefreshing(false) }} refreshing={refreshing}>
      <ComposeBox lang={profile?.learning_lang ?? 'es'} onPosted={p => setPosts(l => [p, ...(l ?? [])])} />
      <Seg value={scope} onChange={setScope} options={[{ value: 'all', label: 'For you' }, { value: 'following', label: 'Following' }, { value: 'help', label: 'Needs help' }, { value: 'mine', label: 'Mine' }]} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Chip label="All" on={lang === 'all'} onPress={() => setLang('all')} />
        {LANGS.map(l => <Chip key={l.code} label={`${l.name}`} on={lang === l.code} onPress={() => setLang(l.code)} />)}
      </ScrollView>
      {posts === null && <Skel n={3} h={160} />}
      {error && <Empty icon="wifi-off" title="Feed unavailable" text={error}><Btn kind="primary" label="Retry" onPress={load} /></Empty>}
      {posts && !error && posts.length === 0 && <Empty icon="pen-line" title="Nothing here yet" text="Be the first to post something in your target language." />}
      {posts?.map(p => <PostCard key={p.id} post={p} meId={profile?.user_id} onProfile={setViewing} onDeleted={id => setPosts(l => (l ?? []).filter(x => x.id !== id))} />)}
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </Screen>
  )
}

/* @arkzen:native:page:feed:end */

/* @arkzen:native:page:learn */
/* @arkzen:native:page:layout:+auth:shell */

const LearnScreen = () => {
  const { profile } = useProfile()
  const [lang, setLang] = useState<string | null>(null)
  const active = lang ?? profile?.learning_lang ?? null
  const { data, loading, error, reload } = useApi<{ data: any[] }>(active ? `/lessons?lang=${active}` : null)
  const [playing, setPlaying] = useState<any | null>(null)
  const lessons = data?.data ?? []
  const units = Array.from(new Set(lessons.map(l => l.unit)))
  const doneCount = lessons.filter(l => l.done).length
  return (
    <Screen title="Learn" subtitle="Short lessons built around phrases you will actually say." onRefresh={reload} refreshing={loading && !!data}>
      <LangPicker value={active ?? 'es'} onChange={setLang} />
      {lessons.length > 0 && <Card style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '700', color: TH.text }}>{langName(active)} path</Text><Text style={{ color: TH.sub }}>{doneCount}/{lessons.length}</Text></View><Bar value={doneCount} max={lessons.length} /></Card>}
      {loading && !data && <Skel n={3} h={90} />}
      {error && <Empty icon="wifi-off" title="Could not load lessons" text={error}><Btn kind="primary" label="Retry" onPress={reload} /></Empty>}
      {data && lessons.length === 0 && <Empty icon="globe" title={`Lessons for ${langName(active)} are on the way`} text="Meanwhile, write in the community, chat with a partner and build your deck. Spanish, Japanese and English have lessons today." />}
      {units.map(u => (
        <View key={u as string} style={{ gap: 10 }}>
          <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>{u as string}</Text>
          {lessons.filter(l => l.unit === u).map(l => (
            <Card key={l.id} onPress={() => setPlaying(l)} style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Ico n={l.emoji ?? 'book'} size={30} />
              <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{l.title}</Text><View style={{ flexDirection: 'row', marginTop: 6 }}><Chip label={l.level} /><Chip tone="orange" label={`+${l.xp} XP`} />{l.done && <Chip tone="green" label={`Best ${l.best}%`} />}</View></View>
              <Text style={{ color: TH.sub, fontSize: 22 }}>›</Text>
            </Card>
          ))}
        </View>
      ))}
      {playing && <LessonPlayer lesson={playing} onClose={() => setPlaying(null)} onDone={() => { setPlaying(null); reload() }} />}
    </Screen>
  )
}

/* @arkzen:native:page:learn:end */

/* @arkzen:native:page:review */
/* @arkzen:native:page:layout:+auth:shell */

const ReviewScreen = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('review')
  const [q, setQ] = useState('')
  const [queue, setQueue] = useState<any[]>([])
  const [flipped, setFlipped] = useState(false)
  const [reviewed, setReviewed] = useState(0)
  const [loading, setLoading] = useState(true)
  const [counts, setCounts] = useState({ total: 0, due: 0 })
  const [deck, setDeck] = useState<any[]>([])
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [example, setExample] = useState('')
  const [lang, setLang] = useState('es')
  useEffect(() => { if (profile) setLang(profile.learning_lang) }, [profile?.id])

  const loadDue = useCallback(async () => {
    setLoading(true)
    try { const r = await kt<any>('/vocab?due=1'); setQueue(shuffle(r.data)); setCounts({ total: r.total, due: r.due_count }); setFlipped(false); setReviewed(0) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load cards', 'err') }
    finally { setLoading(false) }
  }, [])
  const loadDeck = useCallback(async () => {
    try { const r = await kt<any>(`/vocab${q ? `?q=${encodeURIComponent(q)}` : ''}`); setDeck(r.data); setCounts({ total: r.total, due: r.due_count }) } catch { /* ignore */ }
  }, [q])
  useEffect(() => { loadDue() }, [loadDue])
  useEffect(() => { if (tab === 'deck') loadDeck() }, [tab, loadDeck])

  const card = queue[0]
  const grade = async (g: number) => {
    if (!card) return
    const c = card
    setQueue(list => g === 0 ? [...list.slice(1), c] : list.slice(1)); setFlipped(false); if (g > 0) setReviewed(n => n + 1)
    try { await kt(`/vocab/${c.id}/review`, { json: { grade: g } }) } catch { toast('Could not save that review', 'err') }
  }
  const add = async () => {
    if (!term.trim() || !meaning.trim()) return
    try { const r = await kt<any>('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), example: example.trim() || null, lang, source: 'manual' } }); toast(r.created ? 'Added to your deck' : 'Already in your deck', r.created ? 'ok' : 'err'); setTerm(''); setMeaning(''); setExample('') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const remove = async (id: number) => { try { await kt(`/vocab/${id}`, { method: 'DELETE' }); setDeck(d => d.filter(x => x.id !== id)) } catch { toast('Could not delete', 'err') } }
  const grades: [string, string][] = [['Again', TH.red], ['Hard', TH.orange], ['Good', TH.blue], ['Easy', TH.green]]

  return (
    <Screen title="Review" subtitle={`${counts.due} due · ${counts.total} words`} onRefresh={tab === 'deck' ? loadDeck : loadDue} refreshing={false}>
      <Seg value={tab} onChange={setTab} options={[{ value: 'review', label: 'Review' }, { value: 'deck', label: 'Deck' }, { value: 'add', label: 'Add word' }]} />
      {tab === 'review' && (loading ? <Skel n={1} h={260} /> : card ? (
        <View style={{ gap: 14 }}>
          <Bar value={reviewed} max={reviewed + queue.length} />
          <TouchableOpacity activeOpacity={0.9} onPress={() => setFlipped(f => !f)} accessibilityLabel="Flip card">
            <Card style={{ minHeight: 260, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 10 }}>
              <Chip tone="blue" label={`${langName(card.lang)}`} />
              <Text style={{ fontSize: 38, fontWeight: '800', color: TH.text, textAlign: 'center' }}>{card.term}</Text>
              {flipped ? <><Text style={{ fontSize: 24, color: TH.blue, textAlign: 'center' }}>{card.meaning}</Text>{card.example && <Text style={{ color: TH.sub, fontStyle: 'italic', textAlign: 'center' }}>“{String(card.example).slice(0, 140)}”</Text>}</> : <Text style={{ color: TH.sub }}>Tap to reveal</Text>}
            </Card>
          </TouchableOpacity>
          {flipped ? <View style={{ flexDirection: 'row', gap: 8 }}>{grades.map(([l, c], n) => <TouchableOpacity key={l} accessibilityLabel={l} onPress={() => grade(n)} style={{ flex: 1, height: 54, borderRadius: 14, backgroundColor: TH.card, alignItems: 'center', justifyContent: 'center', ...SHADOW }}><Text style={{ color: c, fontWeight: '700' }}>{l}</Text></TouchableOpacity>)}</View> : <Btn kind="primary" label="Show answer" onPress={() => setFlipped(true)} />}
        </View>
      ) : (
        <Empty icon="party-popper" title={counts.total === 0 ? 'Your deck is empty' : 'All caught up!'} text={counts.total === 0 ? 'Finish a lesson, tap words in the feed, or add your own.' : `You reviewed ${reviewed} card${reviewed === 1 ? '' : 's'}. Your next cards are scheduled.`}><Btn kind="primary" label="Add a word" onPress={() => setTab('add')} /></Empty>
      ))}
      {tab === 'deck' && (
        <View style={{ gap: 12 }}>
          <Field value={q} onChangeText={setQ} placeholder="Search your deck" />
          {deck.length === 0 ? <Empty icon="layers" title="No cards found" /> : deck.map(c => (
            <Card key={c.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14 }}>
              <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 16, color: TH.text }}>{c.term} · {c.lang.toUpperCase()}</Text><Text style={{ color: TH.sub }}>{c.meaning}</Text></View>
              <Chip tone={c.reps >= 4 ? 'green' : c.reps > 0 ? 'blue' : 'gray'} label={c.reps >= 4 ? 'Mastered' : c.reps > 0 ? `${c.reps}x` : 'New'} />
              <TouchableOpacity accessibilityLabel={`Delete ${c.term}`} onPress={() => remove(c.id)}><Ico n="close" size={18} color={TH.sub} /></TouchableOpacity>
            </Card>
          ))}
        </View>
      )}
      {tab === 'add' && (
        <Card style={{ gap: 14 }}>
          <LangPicker label="Language" value={lang} onChange={setLang} />
          <Field label="Word or phrase" value={term} onChangeText={setTerm} />
          <Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" />
          <Field label="Example sentence (optional)" value={example} onChangeText={setExample} autoCap="sentences" />
          <Btn kind="primary" label="Add to deck" disabled={!term.trim() || !meaning.trim()} onPress={add} />
        </Card>
      )}
    </Screen>
  )
}

/* @arkzen:native:page:review:end */

/* @arkzen:native:page:partners */
/* @arkzen:native:page:layout:+auth:shell */

const PartnersScreen = () => {
  const nav = useNav()
  const [mode, setMode] = useState('exchange')
  const [q, setQ] = useState('')
  const [list, setList] = useState<KProfile[] | null>(null)
  const [viewing, setViewing] = useState<number | null>(null)
  const load = useCallback(async () => {
    try { const r = await kt<{ data: KProfile[] }>(`/partners?mode=${mode}${q ? `&q=${encodeURIComponent(q)}` : ''}`); setList(r.data) }
    catch (e) { toast(e instanceof Error ? e.message : 'Could not load partners', 'err'); setList([]) }
  }, [mode, q])
  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])
  const hello = async (p: KProfile) => {
    try { const r = await kt<{ data: { id: number } }>('/conversations', { json: { user_id: p.user_id } }); pending.chat = { kind: 'dm', id: r.data.id }; nav.go('chat') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const follow = async (p: KProfile) => {
    try { const r = await kt<{ following: boolean }>(`/follow/${p.user_id}`, { json: {} }); setList(l => (l ?? []).map(x => x.user_id === p.user_id ? { ...x, following: r.following } : x)) } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  return (
    <Screen title="Partners" subtitle="People who speak what you learn, and want what you speak." onRefresh={load} refreshing={false}>
      <Seg value={mode} onChange={setMode} options={[{ value: 'exchange', label: 'Language exchange' }, { value: 'all', label: 'Everyone' }]} />
      <Field value={q} onChangeText={setQ} placeholder="Search name, interest or country" />
      {list === null && <Skel n={3} h={140} />}
      {list && list.length === 0 && <Empty icon="compass" title="No matches yet" text="Try the Everyone tab, or invite a friend who speaks your target language." />}
      {list?.map(p => (
        <Card key={p.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <TouchableOpacity onPress={() => setViewing(p.user_id)} accessibilityLabel={`Open ${p.display_name}`}><Avatar name={p.display_name} color={p.avatar_color} size={50} /></TouchableOpacity>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{p.display_name}</Text><Text style={{ color: TH.sub }}>{p.country ?? '—'} · {p.streak} day streak</Text></View>
            <View style={{ alignItems: 'flex-end' }}><Text style={{ fontSize: 22, fontWeight: '800', color: (p.score ?? 0) >= 70 ? '#3f6b4f' : TH.blue }}>{p.score}%</Text><Text style={{ color: TH.sub, fontSize: 11 }}>match</Text></View>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}><Chip tone="green" label={`Speaks ${langName(p.native_lang)}`} /><Chip tone="blue" label={`Learning ${p.level}`} />{p.shared?.slice(0, 3).map(s => <Chip key={s} tone="purple" label={s} />)}</View>
          {p.bio && <Text style={{ color: TH.sub, fontSize: 15, lineHeight: 21 }}>{p.bio}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}><Btn small kind="primary" label="Say hello" onPress={() => hello(p)} style={{ flex: 1 }} /><Btn small label={p.following ? 'Following' : 'Follow'} onPress={() => follow(p)} /></View>
        </Card>
      ))}
      <ProfileSheet userId={viewing} onClose={() => setViewing(null)} />
    </Screen>
  )
}

/* @arkzen:native:page:partners:end */

/* @arkzen:native:page:chat */
/* @arkzen:native:page:layout:+auth:shell */

const ChatScreen = () => {
  const { profile } = useProfile()
  const [tab, setTab] = useState('dm')
  const [convs, setConvs] = useState<any[]>([])
  const [circles, setCircles] = useState<any[]>([])
  const [active, setActive] = useState<{ kind: 'dm' | 'circle'; id: number; title: string; sub?: string } | null>(null)
  const [msgs, setMsgs] = useState<any[]>([])
  const [text, setText] = useState('')
  const [fixing, setFixing] = useState<any | null>(null)
  const [fixText, setFixText] = useState('')
  const [fixNote, setFixNote] = useState('')
  const [saving, setSaving] = useState<any | null>(null)
  const [term, setTerm] = useState('')
  const [meaning, setMeaning] = useState('')
  const [sending, setSending] = useState(false)
  const scroller = useRef<ScrollView>(null)
  const me = profile?.user_id

  const loadLists = useCallback(async () => {
    try {
      const [c, ci] = await Promise.all([kt<any>('/conversations'), kt<any>('/circles')])
      const joined = ci.data.filter((x: any) => x.joined)
      setConvs(c.data); setCircles(joined)
      return { convs: c.data, circles: joined }
    } catch { return { convs: [], circles: [] } }
  }, [])
  const open = useCallback(async (a: NonNullable<typeof active>) => {
    setActive(a); setMsgs([])
    try { const r = await kt<any>(`/messages?${a.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${a.id}`); setMsgs(r.data) } catch (e) { toast(e instanceof Error ? e.message : 'Could not load messages', 'err') }
  }, [])
  const fromDm = (c: any) => ({ kind: 'dm' as const, id: c.id, title: c.with.display_name, sub: `${langName(c.with.native_lang)}` })
  const fromCircle = (c: any) => ({ kind: 'circle' as const, id: c.id, title: c.name, sub: `${langName(c.lang)} · ${c.members_count} members` })

  useEffect(() => {
    loadLists().then(l => {
      const t = pending.chat
      pending.chat = null
      if (!t) return
      if (t.kind === 'dm') { const c = l.convs.find((x: any) => x.id === t.id); if (c) open(fromDm(c)) }
      else { setTab('circle'); const c = l.circles.find((x: any) => x.id === t.id); if (c) open(fromCircle(c)) }
    })
  }, [])

  useRealtime('kotoba.message-created', (raw: any) => {
    const m = raw?.data ?? raw
    if (!m) return
    const mine = active && ((active.kind === 'dm' && m.conversation_id === active.id) || (active.kind === 'circle' && m.circle_id === active.id))
    if (mine) setMsgs(list => list.some(x => x.id === m.id) ? list.map(x => x.id === m.id ? m : x) : [...list, m])
    loadLists()
  })
  useEffect(() => {
    if (!active) return
    const t = setInterval(async () => {
      const last = msgs.length ? msgs[msgs.length - 1].id : 0
      try { const r = await kt<any>(`/messages?${active.kind === 'dm' ? 'conversation_id' : 'circle_id'}=${active.id}&after_id=${last}`); if (r.data.length) setMsgs(l => [...l, ...r.data.filter((n: any) => !l.some(x => x.id === n.id))]) } catch { /* ignore */ }
    }, 7000)
    return () => clearInterval(t)
  }, [active, msgs.length])

  const send = async () => {
    if (!text.trim() || !active) return
    setSending(true)
    try {
      const r = await kt<any>('/messages', { json: { body: text.trim(), lang: profile?.learning_lang, [active.kind === 'dm' ? 'conversation_id' : 'circle_id']: active.id } })
      setMsgs(l => [...l, r.data]); setText(''); loadLists()
      setTimeout(() => scroller.current?.scrollToEnd({ animated: true }), 50)
    } catch (e) { toast(e instanceof Error ? e.message : 'Message not sent', 'err') }
    finally { setSending(false) }
  }
  const sendFix = async () => {
    if (!fixing || !fixText.trim() || fixText.trim() === fixing.body.trim()) { toast('Edit the text to suggest a correction', 'err'); return }
    try { const r = await kt<any>(`/messages/${fixing.id}/correct`, { json: { corrected: fixText.trim(), note: fixNote.trim() || null } }); setMsgs(l => l.map(x => x.id === fixing.id ? r.data : x)); setFixing(null); setFixNote(''); toast('Correction sent. +10 XP') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const saveWord = async () => {
    if (!saving || !term.trim() || !meaning.trim()) return
    try { await kt('/vocab', { json: { term: term.trim(), meaning: meaning.trim(), lang: saving.lang ?? profile?.learning_lang, example: saving.body, source: 'chat' } }); toast('Saved to your deck'); setSaving(null); setTerm(''); setMeaning('') } catch { toast('Could not save', 'err') }
  }

  if (active) {
    return (
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, backgroundColor: TH.card, borderBottomWidth: 1, borderBottomColor: TH.line }}>
          <TouchableOpacity onPress={() => { setActive(null); loadLists() }} accessibilityLabel="Back" style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20, color: TH.blue }}>‹</Text></TouchableOpacity>
          <View><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{active.title}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>{active.sub}</Text></View>
        </View>
        <ScrollView ref={scroller} style={{ flex: 1 }} contentContainerStyle={{ padding: 14, gap: 10 }} onContentSizeChange={() => scroller.current?.scrollToEnd({ animated: false })} keyboardShouldPersistTaps="handled">
          {msgs.length === 0 && <Text style={{ color: TH.sub, textAlign: 'center', marginTop: 40 }}>No messages yet. Write the first one in your target language!</Text>}
          {msgs.map(m => {
            const own = m.sender_id === me
            return (
              <View key={m.id} style={{ alignItems: own ? 'flex-end' : 'flex-start', gap: 3 }}>
                {!own && active.kind === 'circle' && <Text style={{ color: TH.sub, fontSize: 12, marginLeft: 8 }}>{m.sender_name}</Text>}
                <View style={{ maxWidth: '80%', paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, backgroundColor: own ? TH.blue : TH.fill, borderBottomRightRadius: own ? 6 : 20, borderBottomLeftRadius: own ? 20 : 6 }}><Text style={{ fontSize: 16, color: own ? TH.card : TH.text }}>{m.body}</Text></View>
                {m.corrected && <View style={{ maxWidth: '80%', padding: 10, borderRadius: 14, backgroundColor: 'rgba(63, 107, 79, 0.14)', borderWidth: 1, borderColor: 'rgba(63, 107, 79, 0.35)', gap: 4 }}><Text style={{ fontSize: 12, fontWeight: '700', color: TH.text }}>Suggested</Text><Diff from={m.body} to={m.corrected} size={14} />{m.note && <Text style={{ color: TH.sub, fontSize: 13 }}>{m.note}</Text>}</View>}
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <Text style={{ color: TH.sub, fontSize: 11 }}>{timeAgo(m.created_at)}</Text>
                  {!own && <Btn small kind="ghost" label="Correct" onPress={() => { setFixing(m); setFixText(m.corrected ?? m.body) }} style={{ height: 26, paddingHorizontal: 8 }} />}
                  <Btn small kind="ghost" label="Save word" onPress={() => { setSaving(m); setTerm('') ; setMeaning('') }} style={{ height: 26, paddingHorizontal: 8 }} />
                </View>
              </View>
            )
          })}
        </ScrollView>
        <View style={{ flexDirection: 'row', gap: 8, padding: 10, backgroundColor: TH.card, borderTopWidth: 1, borderTopColor: TH.line, alignItems: 'center' }}>
          <View style={{ flex: 1 }}><Field value={text} onChangeText={setText} placeholder={`Write in ${langName(profile?.learning_lang)}…`} autoCap="sentences" /></View>
          <Btn kind="primary" label="Send" disabled={sending || !text.trim()} onPress={send} />
        </View>
        <Sheet open={!!fixing} onClose={() => setFixing(null)} title="Suggest a correction">
          {fixing && <><Card style={{ backgroundColor: TH.fill, shadowOpacity: 0 }}><Text style={{ color: TH.sub, fontSize: 12, fontWeight: '700' }}>ORIGINAL</Text><Text style={{ fontSize: 16, color: TH.text }}>{fixing.body}</Text></Card>
            <Field label="Your correction" value={fixText} onChangeText={setFixText} multiline autoCap="sentences" />
            <Card style={{ backgroundColor: TH.fill, shadowOpacity: 0 }}><Diff from={fixing.body} to={fixText} /></Card>
            <Field value={fixNote} onChangeText={setFixNote} placeholder="Short explanation (optional but kind)" autoCap="sentences" />
            <Btn kind="primary" label="Send correction" onPress={sendFix} /></>}
        </Sheet>
        <Sheet open={!!saving} onClose={() => setSaving(null)} title="Save a word">
          {saving && <><Text style={{ color: TH.sub, fontSize: 15 }}>“{saving.body}”</Text><Field label="Word or phrase" value={term} onChangeText={setTerm} /><Field label="Meaning" value={meaning} onChangeText={setMeaning} autoCap="sentences" /><Btn kind="primary" label="Save to deck" disabled={!term.trim() || !meaning.trim()} onPress={saveWord} /></>}
        </Sheet>
      </KeyboardAvoidingView>
    )
  }

  const list = tab === 'dm' ? convs : circles
  return (
    <Screen title="Messages" subtitle="Chat, then fix each other’s mistakes in place." onRefresh={loadLists} refreshing={false}>
      <Seg value={tab} onChange={setTab} options={[{ value: 'dm', label: 'Direct' }, { value: 'circle', label: 'Circles' }]} />
      {list.length === 0 && <Empty icon={tab === 'dm' ? 'message-circle' : 'users'} title={tab === 'dm' ? 'No chats yet' : 'No circles joined'} text={tab === 'dm' ? 'Find a partner and say hello.' : 'Join a study circle to chat in a group.'} />}
      {list.map((c: any) => (
        <Card key={`${tab}${c.id}`} onPress={() => open(tab === 'dm' ? fromDm(c) : fromCircle(c))} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
          {tab === 'dm' ? <Avatar name={c.with.display_name} color={c.with.avatar_color} /> : <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Ico n={c.emoji} size={19} /></View>}
          <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 16, color: TH.text }}>{tab === 'dm' ? c.with.display_name : c.name}</Text><Text numberOfLines={1} style={{ color: TH.sub }}>{tab === 'dm' ? (c.last_message ?? 'Say hello') : `${langName(c.lang)} · ${c.members_count} members`}</Text></View>
          <Text style={{ color: TH.sub, fontSize: 22 }}>›</Text>
        </Card>
      ))}
    </Screen>
  )
}

/* @arkzen:native:page:chat:end */

/* @arkzen:native:page:circles */
/* @arkzen:native:page:layout:+auth:shell */

const CirclesScreen = () => {
  const nav = useNav()
  const { profile } = useProfile()
  const [lang, setLang] = useState('all')
  const { data, loading, error, reload, setData } = useApi<{ data: any[] }>(`/circles${lang !== 'all' ? `?lang=${lang}` : ''}`, [lang])
  const [creating, setCreating] = useState(false)
  const [f, setF] = useState({ name: '', emoji: 'message-circle', lang: 'es', level: 'A1', description: '' })
  const [busy, setBusy] = useState(false)
  useEffect(() => { if (profile) setF(x => ({ ...x, lang: profile.learning_lang, level: profile.level })) }, [profile?.id])
  const toggle = async (c: any) => {
    try {
      const r = await kt<{ joined: boolean; members_count: number }>(`/circles/${c.id}/join`, { json: {} })
      setData(d => d ? { data: d.data.map(x => x.id === c.id ? { ...x, joined: r.joined, members_count: r.members_count } : x) } : d)
      toast(r.joined ? `Joined ${c.name}` : `Left ${c.name}`)
    } catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
  }
  const create = async () => {
    if (!f.name.trim()) return
    setBusy(true)
    try { await kt('/circles', { json: { ...f, name: f.name.trim(), description: f.description.trim() || null } }); setCreating(false); setF(x => ({ ...x, name: '', description: '' })); toast('Circle created'); reload() }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const emojis = ['message-circle', 'sun', 'flower', 'coffee', 'headphones', 'book-open', 'globe', 'gamepad', 'utensils', 'trophy']
  return (
    <Screen title="Circles" subtitle="Small study groups with a shared language." onRefresh={reload} refreshing={loading && !!data}
      right={<Btn small kind="primary" label="+ New" onPress={() => setCreating(true)} />}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }}>
        <Chip label="All" on={lang === 'all'} onPress={() => setLang('all')} />
        {LANGS.map(l => <Chip key={l.code} label={`${l.name}`} on={lang === l.code} onPress={() => setLang(l.code)} />)}
      </ScrollView>
      {loading && !data && <Skel n={3} h={130} />}
      {error && <Empty icon="wifi-off" title="Could not load circles" text={error}><Btn kind="primary" label="Retry" onPress={reload} /></Empty>}
      {data && data.data.length === 0 && <Empty icon="users" title="No circles here yet" text="Start one. Small groups with a clear goal are where people stick around."><Btn kind="primary" label="Create a circle" onPress={() => setCreating(true)} /></Empty>}
      {data?.data.map(c => (
        <Card key={c.id} style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 50, height: 50, borderRadius: 25, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center' }}><Ico n={c.emoji} size={24} /></View>
            <View style={{ flex: 1 }}><Text style={{ fontWeight: '700', fontSize: 17, color: TH.text }}>{c.name}</Text><Text style={{ color: TH.sub }}>{c.members_count} member{c.members_count === 1 ? '' : 's'}</Text></View>
            <Chip tone="blue" label={`${c.level}`} />
          </View>
          {c.description && <Text style={{ color: TH.sub, fontSize: 15, lineHeight: 21 }}>{c.description}</Text>}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {c.joined && <Btn small kind="primary" label="Open chat" onPress={() => { pending.chat = { kind: 'circle', id: c.id }; nav.go('chat') }} style={{ flex: 1 }} />}
            <Btn small kind={c.joined ? 'fill' : 'tint'} label={c.joined ? 'Leave' : 'Join circle'} onPress={() => toggle(c)} style={c.joined ? undefined : { flex: 1 }} />
          </View>
        </Card>
      ))}
      <Sheet open={creating} onClose={() => setCreating(false)} title="New circle">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{emojis.map(e => <TouchableOpacity key={e} accessibilityLabel={`Icon ${e}`} onPress={() => setF({ ...f, emoji: e })} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: TH.fill, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: f.emoji === e ? TH.blue : 'transparent' }}><Ico n={e} size={19} /></TouchableOpacity>)}</View>
        <Field label="Name" value={f.name} onChangeText={v => setF({ ...f, name: v })} placeholder="Tokyo Night Owls" autoCap="words" />
        <LangPicker label="Language" value={f.lang} onChange={v => setF({ ...f, lang: v })} />
        <View><Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase' }}>Level</Text><Seg value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
        <Field label="What is it for?" value={f.description} onChangeText={v => setF({ ...f, description: v })} multiline autoCap="sentences" placeholder="Daily 5-minute check-ins, no pressure." />
        <Btn kind="primary" label={busy ? 'Creating…' : 'Create circle'} disabled={busy || !f.name.trim()} onPress={create} />
      </Sheet>
    </Screen>
  )
}

/* @arkzen:native:page:circles:end */

/* @arkzen:native:page:progress */
/* @arkzen:native:page:layout:+auth:shell */

const ProgressScreen = () => {
  const { data, loading, error, reload } = useApi<any>('/progress')
  if (loading && !data) return <Screen title="Progress"><Skel n={3} h={130} /></Screen>
  if (error || !data) return <Screen title="Progress"><Empty icon="wifi-off" title="Could not load progress" text={error ?? ''}><Btn kind="primary" label="Retry" onPress={reload} /></Empty></Screen>
  const p: KProfile = data.profile
  const s = data.stats
  const series: { date: string; count: number }[] = data.series
  const max = Math.max(1, ...series.map(x => x.count))
  const activeDays = series.filter(x => x.count > 0).length
  const badges = [
    ['pen-line', 'First post', s.posts >= 1], ['flame', '7-day streak', p.best_streak >= 7], ['brain', '25 words', s.cards >= 25], ['graduation-cap', '3 lessons', s.lessons >= 3],
    ['handshake', 'First correction', s.corrections_given >= 1], ['message-circle', '50 messages', s.messages_sent >= 50], ['medal', 'Word master', s.mastered >= 10], ['star', 'Level 5', data.level >= 5],
  ] as [string, string, boolean][]
  const tiles = [['Words written', s.words_written, 'pen-line'], ['Messages sent', s.messages_sent, 'message-circle'], ['Posts', s.posts, 'file-text'], ['Lessons done', s.lessons, 'graduation-cap'], ['Words in deck', s.cards, 'layers'], ['Mastered', s.mastered, 'medal'], ['Corrections given', s.corrections_given, 'handshake'], ['Corrections received', s.corrections_received, 'pencil']]
  return (
    <Screen title="Progress" subtitle="What you produce matters more than what you tap." onRefresh={reload} refreshing={loading}>
      <Card style={{ gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' }}><View><Text style={{ color: TH.sub, fontWeight: '600' }}>LEVEL</Text><Text style={{ fontSize: 44, fontWeight: '800', color: TH.text }}>{data.level}</Text></View><Text style={{ color: TH.sub }}>{p.xp} XP · {100 - data.level_progress} to next</Text></View>
        <Bar value={data.level_progress} max={100} color={TH.purple} />
      </Card>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Card style={{ flex: 1, alignItems: 'center' }}><Ico n="flame" size={32} /><Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>{p.streak}</Text><Text style={{ color: TH.sub, fontSize: 12 }}>streak · best {p.best_streak}</Text></Card>
        <Card style={{ flex: 1, alignItems: 'center' }}><Ico n="calendar" size={32} /><Text style={{ fontSize: 30, fontWeight: '800', color: TH.text }}>{activeDays}/14</Text><Text style={{ color: TH.sub, fontSize: 12 }}>active days</Text></Card>
      </View>
      <Card style={{ gap: 10 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>Last 14 days</Text>
        <View accessibilityLabel="Activity over the last 14 days" style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 4, height: 110 }}>{series.map(d => <View key={d.date} style={{ flex: 1, height: `${Math.max(4, (d.count / max) * 100)}%`, borderRadius: 5, backgroundColor: TH.blue, opacity: d.count ? 1 : 0.18 }} />)}</View>
      </Card>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{tiles.map(t => <Card key={t[0] as string} style={{ width: '47.5%', padding: 14 }}><Ico n={t[2] as string} size={20} /><Text style={{ fontSize: 26, fontWeight: '800', color: TH.text }}>{t[1]}</Text><Text style={{ color: TH.sub, fontSize: 13 }}>{t[0]}</Text></Card>)}</View>
      {s.corrections_received > 0 && <Card style={{ gap: 8 }}><View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><Text style={{ fontWeight: '700', color: TH.text }}>Corrections you accepted</Text><Text style={{ color: TH.sub }}>{s.corrections_accepted}/{s.corrections_received}</Text></View><Bar value={s.corrections_accepted} max={s.corrections_received} color={TH.green} /></Card>}
      <Text style={{ fontSize: 22, fontWeight: '700', color: TH.text }}>Milestones</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>{badges.map(b => <Card key={b[1]} style={{ width: '47.5%', alignItems: 'center', padding: 14, opacity: b[2] ? 1 : 0.4 }}><Ico n={b[0]} size={28} /><Text style={{ fontWeight: '600', fontSize: 13, marginTop: 4, color: TH.text }}>{b[1]}</Text></Card>)}</View>
    </Screen>
  )
}

/* @arkzen:native:page:progress:end */

/* @arkzen:native:page:profile */
/* @arkzen:native:page:layout:+auth:shell */

const ProfileScreen = () => {
  const { user, logout } = useAuthStore()
  const nav = useNav()
  const { profile, setProfile } = useProfile()
  const [f, setF] = useState<any>(null)
  const [busy, setBusy] = useState(false)
  const snapshot = (p: KProfile) => ({ display_name: p.display_name, bio: p.bio ?? '', country: p.country ?? '', native_lang: p.native_lang, learning_lang: p.learning_lang, level: p.level, interests: p.interests ?? '', avatar_color: p.avatar_color, daily_goal: String(p.daily_goal) })
  useEffect(() => { if (profile) setF(snapshot(profile)) }, [profile?.id])
  if (!f || !profile) return <Screen title="Profile"><Skel n={3} h={130} /></Screen>
  const dirty = JSON.stringify(f) !== JSON.stringify(snapshot(profile))
  const save = async () => {
    if (f.native_lang === f.learning_lang) { toast('Pick two different languages', 'err'); return }
    setBusy(true)
    try { const r = await kt<{ data: KProfile }>('/me', { method: 'PUT', json: { ...f, daily_goal: Number(f.daily_goal), bio: f.bio || null, country: f.country || null, interests: f.interests || null } }); setProfile(r.data); toast('Profile saved') }
    catch (e) { toast(e instanceof Error ? e.message : 'Failed', 'err') }
    finally { setBusy(false) }
  }
  const label = (t: string) => <Text style={{ fontSize: 12, fontWeight: '600', color: TH.sub, marginBottom: 6, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>{t}</Text>
  return (
    <Screen title="Profile" subtitle={(user as any)?.email}>
      <View style={{ flexDirection: 'row', gap: 10 }}>
        {[['compass', 'Partners', 'partners'], ['users', 'Circles', 'circles'], ['trending-up', 'Progress', 'progress']].map(([e, t, k]) => <Card key={t} onPress={() => nav.go(k)} style={{ flex: 1, alignItems: 'center', padding: 12 }}><Ico n={e} size={22} /><Text style={{ fontWeight: '600', fontSize: 13, color: TH.text, marginTop: 6 }}>{t}</Text></Card>)}
      </View>
      <Card style={{ gap: 14 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <Avatar name={f.display_name} color={f.avatar_color} size={70} />
          <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>{COLORS.map(c => <TouchableOpacity key={c} accessibilityLabel={`Color ${c}`} onPress={() => setF({ ...f, avatar_color: c })} style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: c, borderWidth: 3, borderColor: f.avatar_color === c ? TH.text : 'transparent' }} />)}</View>
        </View>
        <Field label="Display name" value={f.display_name} onChangeText={v => setF({ ...f, display_name: v })} autoCap="words" />
        <Field label="Bio" value={f.bio} onChangeText={v => setF({ ...f, bio: v })} multiline autoCap="sentences" />
        <Field label="Country" value={f.country} onChangeText={v => setF({ ...f, country: v })} autoCap="words" />
      </Card>
      <Card style={{ gap: 14 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', color: TH.text }}>Languages</Text>
        <LangPicker label="I speak" value={f.native_lang} onChange={v => setF({ ...f, native_lang: v })} />
        <LangPicker label="I am learning" value={f.learning_lang} onChange={v => setF({ ...f, learning_lang: v })} />
        <View>{label('Level')}<Seg value={f.level} onChange={v => setF({ ...f, level: v })} options={LEVELS.map(l => ({ value: l, label: l }))} /></View>
        <View>{label('Daily goal')}<Seg value={f.daily_goal} onChange={v => setF({ ...f, daily_goal: v })} options={['1', '3', '5', '10'].map(g => ({ value: g, label: g }))} /></View>
        <View>{label('Interests')}<InterestPicker value={f.interests} onChange={v => setF({ ...f, interests: v })} /></View>
      </Card>
      <Btn kind="primary" label={busy ? 'Saving…' : 'Save changes'} disabled={!dirty || busy} onPress={save} />
      <Btn kind="danger" label="Sign out" onPress={async () => { try { await logout() } catch { /* ignore */ } nav.go('login') }} />
    </Screen>
  )
}

/* @arkzen:native:page:profile:end */