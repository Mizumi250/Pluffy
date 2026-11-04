package backend

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

type kotobaUser struct {
	ID    int64
	Name  string
	Email string
}

func (h *Handler) serveKotobaRoute(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	user, _, authenticated, err := h.resolveAuthUser(r, "kotoba")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated && match.customHandler != "community_seed" {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, "kotoba")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open Kotoba database"})
		return
	}
	defer db.Close()

	body := map[string]any{}
	if r.Method != http.MethodGet && r.Method != http.MethodDelete {
		var ok bool
		body, ok = readObjectBody(w, r)
		if !ok {
			return
		}
	}
	u := kotobaUser{ID: user.ID, Name: user.Name, Email: user.Email}
	h.runKotobaHandler(w, r, db, match, u, body)
}

func (h *Handler) runKotobaHandler(w http.ResponseWriter, r *http.Request, db *sql.DB, match matchedEndpoint, user kotobaUser, body map[string]any) {
	id, _ := strconv.ParseInt(match.id, 10, 64)
	switch match.customHandler {
	case "me":
		h.kotobaMe(w, db, user)
	case "update_me":
		h.kotobaUpdateMe(w, db, user, body)
	case "bump":
		h.kotobaBump(w, db, user, body)
	case "notify":
		h.kotobaNotify(w, db, body)
	case "community_seed":
		h.kotobaSeed(w, db)
	case "home":
		h.kotobaHome(w, db, user)
	case "feed":
		h.kotobaFeed(w, r, db, user)
	case "create_post":
		h.kotobaCreatePost(w, db, user, body)
	case "delete_post":
		h.kotobaDeletePost(w, db, user, id)
	case "toggle_like":
		h.kotobaToggleLike(w, db, user, id)
	case "list_comments":
		h.kotobaListComments(w, db, id)
	case "add_comment":
		h.kotobaAddComment(w, db, user, id, body)
	case "accept_correction":
		h.kotobaAcceptCorrection(w, db, user, id)
	case "list_lessons":
		h.kotobaListLessons(w, r, db, user)
	case "complete_lesson":
		h.kotobaCompleteLesson(w, db, user, id, body)
	case "list_cards":
		h.kotobaListCards(w, r, db, user)
	case "add_card":
		h.kotobaAddCard(w, db, user, body)
	case "review_card":
		h.kotobaReviewCard(w, db, user, id, body)
	case "delete_card":
		h.kotobaDeleteCard(w, db, user, id)
	case "partners":
		h.kotobaPartners(w, r, db, user)
	case "view_profile":
		h.kotobaViewProfile(w, db, user, id)
	case "toggle_follow":
		h.kotobaToggleFollow(w, db, user, id)
	case "list_conversations":
		h.kotobaListConversations(w, db, user)
	case "start_conversation":
		h.kotobaStartConversation(w, db, user, body)
	case "list_messages":
		h.kotobaListMessages(w, r, db, user)
	case "send_message":
		h.kotobaSendMessage(w, db, user, body)
	case "correct_message":
		h.kotobaCorrectMessage(w, db, user, id, body)
	case "list_circles":
		h.kotobaListCircles(w, r, db, user)
	case "create_circle":
		h.kotobaCreateCircle(w, db, user, body)
	case "toggle_join":
		h.kotobaToggleJoin(w, db, user, id)
	case "list_alerts":
		h.kotobaListAlerts(w, db, user)
	case "read_alerts":
		h.kotobaReadAlerts(w, db, user)
	case "progress":
		h.kotobaProgress(w, db, user)
	default:
		writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Unknown Kotoba handler"})
	}
}

func kotobaTable(name string) string { return quoteIdentifier(name) }

func kotobaDateColumn(name string) string {
	column := quoteIdentifier(name)
	if configuredDialect() == postgresDialect {
		return "CAST(CAST(" + column + " AS TIMESTAMP) AS DATE)"
	}
	return "date(" + column + ")"
}

func kotobaRows(db *sql.DB, query string, args ...any) ([]map[string]any, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanRecords(rows)
}

func kotobaFirst(db *sql.DB, query string, args ...any) (map[string]any, error) {
	rows, err := kotobaRows(db, query, args...)
	if err != nil || len(rows) == 0 {
		return nil, err
	}
	return rows[0], nil
}

func kotobaColumns(db *sql.DB, table string) (map[string]struct{}, error) {
	columns, _, err := inspectColumns(db, table)
	return columns, err
}

func kotobaInsert(db *sql.DB, table string, values map[string]any) (map[string]any, error) {
	columns, err := kotobaColumns(db, table)
	if err != nil {
		return nil, err
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	if _, ok := columns["created_at"]; ok {
		if _, supplied := values["created_at"]; !supplied {
			values["created_at"] = now
		}
	}
	if _, ok := columns["updated_at"]; ok {
		values["updated_at"] = now
	}
	names := make([]string, 0, len(values))
	for name := range values {
		if _, ok := columns[name]; ok {
			names = append(names, name)
		}
	}
	// The ordering is stable so statements remain easy to reason about and test.
	sort.Strings(names)
	if len(names) == 0 {
		return kotobaFirst(db, "INSERT INTO "+kotobaTable(table)+" DEFAULT VALUES RETURNING *")
	}
	marks, quoted, args := make([]string, len(names)), make([]string, len(names)), make([]any, len(names))
	for i, name := range names {
		quoted[i], marks[i], args[i] = quoteIdentifier(name), "?", values[name]
	}
	return kotobaFirst(db, "INSERT INTO "+kotobaTable(table)+" ("+strings.Join(quoted, ",")+") VALUES ("+strings.Join(marks, ",")+") RETURNING *", args...)
}

func kotobaUpdate(db *sql.DB, table string, id int64, values map[string]any) error {
	columns, err := kotobaColumns(db, table)
	if err != nil {
		return err
	}
	if _, ok := columns["updated_at"]; ok {
		values["updated_at"] = time.Now().UTC().Format(time.RFC3339Nano)
	}
	names := make([]string, 0, len(values))
	for name := range values {
		if _, ok := columns[name]; ok {
			names = append(names, name)
		}
	}
	sort.Strings(names)
	if len(names) == 0 {
		return nil
	}
	assignments, args := make([]string, len(names)), make([]any, 0, len(names)+1)
	for i, name := range names {
		assignments[i] = quoteIdentifier(name) + " = ?"
		args = append(args, values[name])
	}
	args = append(args, id)
	_, err = db.Exec("UPDATE "+kotobaTable(table)+" SET "+strings.Join(assignments, ",")+" WHERE id = ?", args...)
	return err
}

func kotobaText(v any) string {
	if v == nil {
		return ""
	}
	switch value := v.(type) {
	case string:
		return value
	case json.Number:
		return value.String()
	default:
		return fmt.Sprint(value)
	}
}

func kotobaInt(v any) int64 {
	switch value := v.(type) {
	case int:
		return int64(value)
	case int64:
		return value
	case float64:
		return int64(value)
	case json.Number:
		n, _ := value.Int64()
		return n
	case string:
		n, _ := strconv.ParseInt(value, 10, 64)
		return n
	default:
		return 0
	}
}

func kotobaFloat(v any) float64 {
	switch value := v.(type) {
	case float64:
		return value
	case int64:
		return float64(value)
	case int:
		return float64(value)
	case string:
		number, _ := strconv.ParseFloat(value, 64)
		return number
	case []byte:
		number, _ := strconv.ParseFloat(string(value), 64)
		return number
	default:
		return 0
	}
}

func minInt64(a, b int64) int64 {
	if a < b {
		return a
	}
	return b
}

func kotobaBool(v any) bool {
	switch value := v.(type) {
	case bool:
		return value
	case int64:
		return value != 0
	case int:
		return value != 0
	case float64:
		return value != 0
	case string:
		return value == "1" || strings.EqualFold(value, "true")
	default:
		return false
	}
}

func kotobaError(w http.ResponseWriter, status int, message string) {
	writeJSON(w, status, map[string]string{"message": message})
}

func kotobaProfile(db *sql.DB, user kotobaUser) (map[string]any, error) {
	profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, user.ID)
	if err != nil || profile != nil {
		return profile, err
	}
	return kotobaInsert(db, "profiles", map[string]any{"user_id": user.ID, "display_name": user.Name, "avatar_color": "#121212"})
}

func kotobaBumpProfile(db *sql.DB, userID, xp, words, messages int64) error {
	profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, userID)
	if err != nil {
		return err
	}
	if profile == nil {
		return sql.ErrNoRows
	}
	now := time.Now().UTC()
	today := now.Format("2006-01-02")
	streak := kotobaInt(profile["streak"])
	if kotobaText(profile["last_active"]) != today {
		if kotobaText(profile["last_active"]) == now.AddDate(0, 0, -1).Format("2006-01-02") {
			streak++
		} else {
			streak = 1
		}
	}
	best := maxInt64(kotobaInt(profile["best_streak"]), streak)
	updates := map[string]any{
		"xp":            kotobaInt(profile["xp"]) + xp,
		"words_written": kotobaInt(profile["words_written"]) + words,
		"messages_sent": kotobaInt(profile["messages_sent"]) + messages,
		"streak":        streak, "best_streak": best, "last_active": today,
	}
	return kotobaUpdate(db, "profiles", kotobaInt(profile["id"]), updates)
}

func kotobaAddXP(db *sql.DB, userID, xp int64) error {
	columns, err := kotobaColumns(db, "profiles")
	if err != nil {
		return err
	}
	if _, ok := columns["xp"]; !ok {
		return nil
	}
	_, err = db.Exec(`UPDATE "profiles" SET "xp"=COALESCE("xp",0)+? WHERE "user_id"=?`, xp, userID)
	return err
}

func (h *Handler) kotobaMe(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	if _, err := kotobaColumns(db, "posts"); err == nil {
		if _, err := kotobaSeedData(db); err != nil {
			kotobaError(w, 500, "Could not seed the community")
			return
		}
	}
	profile, err := kotobaProfile(db, user)
	if err != nil {
		kotobaError(w, 500, "Could not load learner profile")
		return
	}
	writeJSON(w, 200, map[string]any{"data": profile, "user": map[string]any{"id": user.ID, "name": user.Name, "email": user.Email}})
}

func (h *Handler) kotobaUpdateMe(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	profile, err := kotobaProfile(db, user)
	if err != nil || profile == nil {
		kotobaError(w, 500, "Could not load learner profile")
		return
	}
	allowed := map[string]bool{"display_name": true, "bio": true, "native_lang": true, "learning_lang": true, "level": true, "country": true, "interests": true, "daily_goal": true, "onboarded": true}
	updates := make(map[string]any)
	for key, value := range body {
		if allowed[key] {
			updates[key] = value
		}
	}
	if len(updates) == 0 {
		kotobaError(w, 422, "Provide at least one profile field to update")
		return
	}
	if err := kotobaUpdate(db, "profiles", kotobaInt(profile["id"]), updates); err != nil {
		kotobaError(w, 422, "Could not update learner profile")
		return
	}
	profile, _ = kotobaFirst(db, `SELECT * FROM "profiles" WHERE "id" = ?`, profile["id"])
	writeJSON(w, 200, map[string]any{"data": profile})
}

func (h *Handler) kotobaBump(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	xp, words, messages := kotobaInt(body["xp"]), kotobaInt(body["words"]), kotobaInt(body["messages"])
	if xp < 0 || words < 0 || messages < 0 {
		kotobaError(w, 422, "Activity amounts cannot be negative")
		return
	}
	if err := kotobaBumpProfile(db, user.ID, xp, words, messages); err != nil {
		kotobaError(w, 404, "Learner profile not found")
		return
	}
	profile, _ := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, user.ID)
	writeJSON(w, 200, map[string]any{"data": profile, "xp_awarded": xp})
}

func (h *Handler) kotobaNotify(w http.ResponseWriter, db *sql.DB, body map[string]any) {
	target, kind, text := kotobaInt(body["user_id"]), kotobaText(body["kind"]), kotobaText(body["text"])
	if target <= 0 || kind == "" || text == "" || utf8.RuneCountInString(text) > 500 {
		kotobaError(w, 422, "Alert kind and text are required")
		return
	}
	row, err := kotobaInsert(db, "alerts", map[string]any{"user_id": target, "kind": kind, "text": text, "ref": body["ref"], "is_read": false})
	if err != nil {
		kotobaError(w, 500, "Could not create alert")
		return
	}
	writeJSON(w, 200, map[string]any{"data": row})
}

func (h *Handler) kotobaSeed(w http.ResponseWriter, db *sql.DB) {
	seeded, err := kotobaSeedData(db)
	if err != nil {
		kotobaError(w, 500, "Could not seed the community")
		return
	}
	writeJSON(w, 200, map[string]any{"seeded": seeded})
}

func kotobaSeedData(db *sql.DB) (bool, error) {
	var postCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM "posts"`).Scan(&postCount); err != nil {
		return false, err
	}
	if postCount > 0 {
		return false, nil
	}
	return kotobaSeedCommunityContent(db, postCount == 0)
}

func kotobaSeedCommunityContent(db *sql.DB, seedPosts bool) (bool, error) {
	type person struct {
		email, displayName, nativeLang, learningLang, level, country, bio, interests, color string
		xp, streak                                                                          int64
	}
	people := []person{
		{"aiko@kotoba.app", "Aiko Tanaka", "ja", "en", "A2", "Japan", "Osaka native. I love ramen, film cameras and teaching Japanese.", "travel,food,photography", "#7a3b34", 240, 12},
		{"mateo@kotoba.app", "Mateo Rivera", "es", "en", "B1", "Mexico", "From Mexico City. Football, tacos and bad puns in two languages.", "football,food,music", "#3f6b4f", 180, 6},
		{"sofia@kotoba.app", "Sofia Laurent", "en", "ja", "A2", "Canada", "English teacher learning Japanese. Coffee first, grammar second.", "books,coffee,anime", "#4a4a4a", 320, 21},
	}
	profiles := make(map[string]map[string]any, len(people))
	today := time.Now().UTC().Format("2006-01-02")
	for _, seed := range people {
		user, err := kotobaFirst(db, `SELECT * FROM "users" WHERE "email"=?`, seed.email)
		if err != nil {
			return false, err
		}
		if user == nil {
			continue
		}
		userID := kotobaInt(user["id"])
		profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id"=?`, userID)
		if err != nil {
			return false, err
		}
		fields := map[string]any{
			"user_id": userID, "display_name": seed.displayName, "native_lang": seed.nativeLang,
			"learning_lang": seed.learningLang, "level": seed.level, "country": seed.country,
			"bio": seed.bio, "interests": seed.interests, "avatar_color": seed.color,
			"xp": seed.xp, "streak": seed.streak, "best_streak": seed.streak,
			"last_active": today, "onboarded": true,
		}
		if profile == nil {
			profile, err = kotobaInsert(db, "profiles", fields)
		} else {
			err = kotobaUpdate(db, "profiles", kotobaInt(profile["id"]), fields)
			if err == nil {
				profile, err = kotobaFirst(db, `SELECT * FROM "profiles" WHERE "id"=?`, profile["id"])
			}
		}
		if err != nil {
			return false, err
		}
		profiles[seed.email] = profile
	}
	if len(profiles) == 0 {
		return false, nil
	}
	seeded := seedPosts
	if seedPosts {
		addPost := func(email, lang, kind, body, translation string, likes int64) (map[string]any, error) {
			profile := profiles[email]
			if profile == nil {
				return nil, nil
			}
			var translated any
			if translation != "" {
				translated = translation
			}
			return kotobaInsert(db, "posts", map[string]any{
				"user_id": profile["user_id"], "author_name": profile["display_name"],
				"author_color": profile["avatar_color"], "author_native": profile["native_lang"],
				"lang": lang, "kind": kind, "body": body, "translation": translated, "likes_count": likes,
			})
		}
		firstPost, err := addPost("aiko@kotoba.app", "en", "moment", "Yesterday I go to the park with my friend. We eated ice cream and it was very delicious!", "", 4)
		if err != nil {
			return false, err
		}
		if _, err := addPost("mateo@kotoba.app", "en", "moment", "Today I learned a new word: serendipity. It means finding something good by luck.", "", 7); err != nil {
			return false, err
		}
		japanesePost, err := addPost("sofia@kotoba.app", "ja", "moment", "きょうは あめが ふっています。コーヒーを のみながら ほんを よみます。", "It is raining today. I will read a book while drinking coffee.", 5)
		if err != nil {
			return false, err
		}
		if _, err := addPost("mateo@kotoba.app", "es", "question", "Pregunta para ustedes: cual es su comida favorita? La mia son los tacos al pastor.", "Question for you all: what is your favorite food? Mine are tacos al pastor.", 3); err != nil {
			return false, err
		}
		if _, err := addPost("aiko@kotoba.app", "ja", "moment", "こんにちは！わたしは アイコです。にほんの おおさかから きました。", "Hello! I am Aiko. I came from Osaka, Japan.", 9); err != nil {
			return false, err
		}
		sofia, aiko := profiles["sofia@kotoba.app"], profiles["aiko@kotoba.app"]
		if firstPost != nil && sofia != nil {
			if _, err := kotobaInsert(db, "comments", map[string]any{
				"post_id": firstPost["id"], "user_id": sofia["user_id"],
				"author_name": sofia["display_name"], "author_color": sofia["avatar_color"],
				"body": "Nice story! A few small fixes:", "is_correction": true,
				"corrected":   "Yesterday I went to the park with my friend. We ate ice cream and it was delicious!",
				"explanation": "Use the past tense: go becomes went and eat becomes ate. Also, delicious already means very tasty, so you do not need very.",
			}); err != nil {
				return false, err
			}
			if _, err := db.Exec(`UPDATE "posts" SET "comments_count"=1,"corrections_count"=1 WHERE "id"=?`, firstPost["id"]); err != nil {
				return false, err
			}
		}
		if japanesePost != nil && aiko != nil {
			if _, err := kotobaInsert(db, "comments", map[string]any{
				"post_id": japanesePost["id"], "user_id": aiko["user_id"],
				"author_name": aiko["display_name"], "author_color": aiko["avatar_color"],
				"body": "すてきですね！Very cozy. Your sentence is perfect.", "is_correction": false,
			}); err != nil {
				return false, err
			}
			if _, err := db.Exec(`UPDATE "posts" SET "comments_count"=1 WHERE "id"=?`, japanesePost["id"]); err != nil {
				return false, err
			}
		}
		if aiko != nil && sofia != nil {
			for _, follow := range [][2]any{
				{aiko["user_id"], sofia["user_id"]},
				{sofia["user_id"], aiko["user_id"]},
			} {
				if _, err := kotobaInsert(db, "follows", map[string]any{"follower_id": follow[0], "following_id": follow[1]}); err != nil {
					return false, err
				}
			}
		}
	}

	circles := []struct {
		name, emoji, lang, level, description, owner string
	}{
		{"English Morning Club", "sun", "en", "A2", "Short daily check-ins in English. Be kind and correct gently.", "sofia@kotoba.app"},
		{"Japanese for Beginners", "flower", "ja", "A1", "Hiragana, greetings and first sentences. Ask anything.", "aiko@kotoba.app"},
		{"Spanish Cafe Talk", "coffee", "es", "A2", "Relaxed conversation practice over virtual coffee.", "mateo@kotoba.app"},
	}
	for _, seed := range circles {
		owner := profiles[seed.owner]
		if owner == nil {
			continue
		}
		circle, err := kotobaInsert(db, "circles", map[string]any{
			"name": seed.name, "emoji": seed.emoji, "lang": seed.lang, "level": seed.level,
			"description": seed.description, "owner_id": owner["user_id"], "members_count": 1,
		})
		if err != nil {
			return false, err
		}
		if _, err := kotobaInsert(db, "circle_members", map[string]any{
			"circle_id": circle["id"], "user_id": owner["user_id"],
		}); err != nil {
			return false, err
		}
		welcome := "Welcome to " + seed.name + "! Introduce yourself in your target language."
		if _, err := kotobaInsert(db, "messages", map[string]any{
			"circle_id": circle["id"], "sender_id": owner["user_id"],
			"sender_name": owner["display_name"], "sender_color": owner["avatar_color"],
			"body": welcome, "lang": seed.lang,
		}); err != nil {
			return false, err
		}
	}
	return seeded, nil
}

func (h *Handler) kotobaHome(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	if _, err := kotobaSeedData(db); err != nil {
		kotobaError(w, 500, "Could not seed the community")
		return
	}
	profile, err := kotobaProfile(db, user)
	if err != nil || profile == nil {
		kotobaError(w, 500, "Could not load learner profile")
		return
	}
	lang := kotobaText(profile["learning_lang"])
	today := time.Now().UTC().Format("2006-01-02")
	missions, _ := kotobaRows(db, `SELECT * FROM "missions" WHERE "lang" IN (?, 'any') ORDER BY "position"`, lang)
	var mission any
	if len(missions) > 0 {
		mission = missions[time.Now().YearDay()%len(missions)]
	}
	nextLesson, _ := kotobaFirst(db, `SELECT * FROM "lessons" WHERE "lang"=? AND "id" NOT IN (SELECT "lesson_id" FROM "lesson_results" WHERE "user_id"=?) ORDER BY "position" LIMIT 1`, lang, user.ID)
	var due, unread, posts, messages, lessons, circles int
	_ = db.QueryRow(`SELECT COUNT(*) FROM "vocab_cards" WHERE "user_id" = ? AND ("due_date" IS NULL OR "due_date" <= ?)`, user.ID, today).Scan(&due)
	_ = db.QueryRow(`SELECT COUNT(*) FROM "alerts" WHERE "user_id" = ? AND "is_read" = 0`, user.ID).Scan(&unread)
	_ = db.QueryRow(`SELECT COUNT(*) FROM "posts" WHERE "user_id" = ? AND `+kotobaDateColumn("created_at")+` = ?`, user.ID, today).Scan(&posts)
	_ = db.QueryRow(`SELECT COUNT(*) FROM "messages" WHERE "sender_id" = ? AND `+kotobaDateColumn("created_at")+` = ?`, user.ID, today).Scan(&messages)
	_ = db.QueryRow(`SELECT COUNT(*) FROM "lesson_results" WHERE "user_id" = ? AND `+kotobaDateColumn("updated_at")+` = ?`, user.ID, today).Scan(&lessons)
	_ = db.QueryRow(`SELECT COUNT(*) FROM "circle_members" WHERE "user_id" = ?`, user.ID).Scan(&circles)
	helpNeeded := 0
	_ = db.QueryRow(`SELECT COUNT(*) FROM "posts" WHERE "corrections_count"=0 AND "user_id"<>? AND "lang"=?`, user.ID, profile["native_lang"]).Scan(&helpNeeded)
	missionDone := false
	if selected, ok := mission.(map[string]any); ok {
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM "posts" WHERE "user_id"=? AND "mission_id"=? AND `+kotobaDateColumn("created_at")+`=?`, user.ID, selected["id"], today).Scan(&count)
		missionDone = count > 0
	}
	writeJSON(w, 200, map[string]any{"profile": profile, "mission": mission, "mission_done": missionDone, "due": due, "next_lesson": nextLesson, "unread": unread, "today_activity": posts + messages + lessons, "help_needed": helpNeeded, "circles": circles})
}

func (h *Handler) kotobaFeed(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	query := `SELECT p.*, EXISTS(SELECT 1 FROM "likes" l WHERE l."post_id"=p."id" AND l."user_id"=?) AS liked FROM "posts" p`
	args := []any{user.ID}
	hasWhere := false
	switch r.URL.Query().Get("scope") {
	case "mine":
		query += ` WHERE p."user_id" = ?`
		args = append(args, user.ID)
		hasWhere = true
	case "following":
		query += ` WHERE (p."user_id" IN (SELECT "following_id" FROM "follows" WHERE "follower_id" = ?) OR p."user_id" = ?)`
		args = append(args, user.ID, user.ID)
		hasWhere = true
	case "help":
		profile, _ := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, user.ID)
		query += ` WHERE p."user_id" <> ? AND p."corrections_count" = 0 AND p."lang" = ?`
		args = append(args, user.ID, kotobaText(profile["native_lang"]))
		hasWhere = true
	}
	if lang := r.URL.Query().Get("lang"); lang != "" {
		if hasWhere {
			query += ` AND p."lang" = ?`
		} else {
			query += ` WHERE p."lang" = ?`
			hasWhere = true
		}
		args = append(args, lang)
	}
	if mission := r.URL.Query().Get("mission_id"); mission != "" {
		if hasWhere {
			query += ` AND p."mission_id" = ?`
		} else {
			query += ` WHERE p."mission_id" = ?`
		}
		args = append(args, mission)
	}
	query += ` ORDER BY p."id" DESC LIMIT 40`
	rows, err := kotobaRows(db, query, args...)
	if err != nil {
		kotobaError(w, 500, "Could not load community feed")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaCreatePost(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	text, lang := strings.TrimSpace(kotobaText(body["body"])), kotobaText(body["lang"])
	kind, translation := kotobaText(bodyOr(body, "kind", "moment")), kotobaText(body["translation"])
	if text == "" || utf8.RuneCountInString(text) > 1500 || lang == "" || len(lang) > 8 ||
		(kind != "moment" && kind != "question" && kind != "mission") || utf8.RuneCountInString(translation) > 1500 {
		kotobaError(w, 422, "Post fields are invalid")
		return
	}
	profile, err := kotobaProfile(db, user)
	if err != nil {
		kotobaError(w, 500, "Could not load learner profile")
		return
	}
	post, err := kotobaInsert(db, "posts", map[string]any{"user_id": user.ID, "author_name": profile["display_name"], "author_color": profile["avatar_color"], "author_native": profile["native_lang"], "lang": lang, "kind": kind, "mission_id": nullablePositive(body["mission_id"]), "body": text, "translation": translation, "likes_count": 0, "comments_count": 0, "corrections_count": 0})
	if err != nil {
		kotobaError(w, 500, "Could not create post")
		return
	}
	words := int64(len(strings.Fields(text)))
	xp := int64(10)
	if kind == "mission" {
		xp = 20
	}
	_ = kotobaBumpProfile(db, user.ID, xp, maxInt64(words, 1), 0)
	post["liked"] = false
	writeJSON(w, 201, map[string]any{"data": post})
}

func bodyOr(body map[string]any, key, fallback string) any {
	if body[key] == nil || kotobaText(body[key]) == "" {
		return fallback
	}
	return body[key]
}

func nullablePositive(v any) any {
	if kotobaInt(v) > 0 {
		return kotobaInt(v)
	}
	return nil
}

func maxInt64(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}

func (h *Handler) kotobaDeletePost(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	post, err := kotobaFirst(db, `SELECT * FROM "posts" WHERE "id" = ?`, id)
	if err != nil || post == nil || kotobaInt(post["user_id"]) != user.ID {
		kotobaError(w, 404, "Post not found")
		return
	}
	_, _ = db.Exec(`DELETE FROM "posts" WHERE "id" = ?`, id)
	writeJSON(w, 200, map[string]any{"message": "Post deleted"})
}

func (h *Handler) kotobaToggleLike(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	post, err := kotobaFirst(db, `SELECT * FROM "posts" WHERE "id" = ?`, id)
	if err != nil || post == nil {
		kotobaError(w, 404, "Post not found.")
		return
	}
	like, err := kotobaFirst(db, `SELECT "id" FROM "likes" WHERE "post_id" = ? AND "user_id" = ?`, id, user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not update like")
		return
	}
	if like != nil {
		_, _ = db.Exec(`DELETE FROM "likes" WHERE "id" = ?`, like["id"])
		minimum := `MAX(0, "likes_count" - 1)`
		if configuredDialect() == postgresDialect {
			minimum = `GREATEST(0, "likes_count" - 1)`
		}
		_, _ = db.Exec(`UPDATE "posts" SET "likes_count" = `+minimum+` WHERE "id" = ?`, id)
	} else {
		_, err = kotobaInsert(db, "likes", map[string]any{"post_id": id, "user_id": user.ID})
		if err != nil {
			kotobaError(w, 500, "Could not update like")
			return
		}
		_, _ = db.Exec(`UPDATE "posts" SET "likes_count" = "likes_count" + 1 WHERE "id" = ?`, id)
		if kotobaInt(post["user_id"]) != user.ID {
			profile, _ := kotobaProfile(db, user)
			_, _ = kotobaInsert(db, "alerts", map[string]any{"user_id": post["user_id"], "kind": "like", "text": kotobaText(profile["display_name"]) + " liked your post", "ref": id, "is_read": false})
		}
	}
	updated, _ := kotobaFirst(db, `SELECT "likes_count" FROM "posts" WHERE "id" = ?`, id)
	liked := like == nil
	writeJSON(w, 200, map[string]any{"liked": liked, "likes_count": updated["likes_count"]})
}

func (h *Handler) kotobaListComments(w http.ResponseWriter, db *sql.DB, id int64) {
	rows, err := kotobaRows(db, `SELECT * FROM "comments" WHERE "post_id" = ? ORDER BY "id"`, id)
	if err != nil {
		kotobaError(w, 500, "Could not load comments")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaAddComment(w http.ResponseWriter, db *sql.DB, user kotobaUser, postID int64, body map[string]any) {
	post, err := kotobaFirst(db, `SELECT * FROM "posts" WHERE "id" = ?`, postID)
	if err != nil || post == nil {
		kotobaError(w, 404, "Post not found.")
		return
	}
	text := strings.TrimSpace(kotobaText(body["body"]))
	corrected, explanation := kotobaText(body["corrected"]), kotobaText(body["explanation"])
	if text == "" || len(text) > 1000 || len(corrected) > 1500 || len(explanation) > 1000 {
		kotobaError(w, 422, "Comment fields are invalid")
		return
	}
	profile, _ := kotobaProfile(db, user)
	correction := kotobaBool(body["is_correction"]) && strings.TrimSpace(kotobaText(body["corrected"])) != ""
	comment, err := kotobaInsert(db, "comments", map[string]any{"post_id": postID, "user_id": user.ID, "author_name": profile["display_name"], "author_color": profile["avatar_color"], "body": text, "is_correction": correction, "corrected": corrected, "explanation": explanation, "accepted": false})
	if err != nil {
		kotobaError(w, 500, "Could not create comment")
		return
	}
	corrections := 0
	if correction {
		corrections = 1
	}
	_, _ = db.Exec(`UPDATE "posts" SET "comments_count" = "comments_count" + 1, "corrections_count" = "corrections_count" + ? WHERE "id" = ?`, corrections, postID)
	xp, kind := int64(5), "comment"
	notice := kotobaText(profile["display_name"]) + " commented on your post"
	if correction {
		xp, kind = 15, "correction"
		notice = kotobaText(profile["display_name"]) + " corrected your post"
	}
	_, _ = kotobaInsert(db, "alerts", map[string]any{"user_id": post["user_id"], "kind": kind, "text": notice, "ref": postID, "is_read": false})
	_ = kotobaBumpProfile(db, user.ID, xp, 0, 0)
	writeJSON(w, 201, map[string]any{"data": comment})
}

func (h *Handler) kotobaAcceptCorrection(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	comment, err := kotobaFirst(db, `SELECT * FROM "comments" WHERE "id" = ?`, id)
	if err != nil || comment == nil {
		kotobaError(w, 404, "Correction not found")
		return
	}
	post, err := kotobaFirst(db, `SELECT * FROM "posts" WHERE "id" = ?`, comment["post_id"])
	if err != nil || post == nil {
		kotobaError(w, 404, "Post not found.")
		return
	}
	if kotobaInt(post["user_id"]) != user.ID {
		kotobaError(w, 403, "Only the post author can accept a correction")
		return
	}
	if !kotobaBool(comment["is_correction"]) || strings.TrimSpace(kotobaText(comment["corrected"])) == "" {
		kotobaError(w, 422, "This comment has no proposed correction")
		return
	}
	if err := kotobaUpdate(db, "comments", id, map[string]any{"accepted": true}); err != nil {
		kotobaError(w, 500, "Could not accept correction")
		return
	}
	_ = kotobaUpdate(db, "posts", kotobaInt(post["id"]), map[string]any{"body": comment["corrected"], "corrections_count": kotobaInt(post["corrections_count"]) + 1})
	post["body"] = comment["corrected"]
	writeJSON(w, 200, map[string]any{"message": "Correction accepted", "post": post})
}

func (h *Handler) kotobaListLessons(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	profile, _ := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, user.ID)
	if profile == nil {
		kotobaError(w, 404, "Learner profile not found")
		return
	}
	rows, err := kotobaRows(db, `SELECT * FROM "lessons" WHERE "lang" = ? AND "level" = ? ORDER BY "position"`, profile["learning_lang"], profile["level"])
	if err != nil {
		kotobaError(w, 500, "Could not load lessons")
		return
	}
	for _, lesson := range rows {
		result, _ := kotobaFirst(db, `SELECT * FROM "lesson_results" WHERE "user_id" = ? AND "lesson_id" = ?`, user.ID, lesson["id"])
		lesson["result"] = result
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaCompleteLesson(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64, body map[string]any) {
	score := kotobaInt(body["score"])
	if score < 0 || score > 100 {
		kotobaError(w, 422, "Score must be between 0 and 100")
		return
	}
	lesson, err := kotobaFirst(db, `SELECT * FROM "lessons" WHERE "id" = ?`, id)
	if err != nil || lesson == nil {
		kotobaError(w, 404, "Lesson not found")
		return
	}
	result, err := kotobaFirst(db, `SELECT * FROM "lesson_results" WHERE "user_id" = ? AND "lesson_id" = ?`, user.ID, id)
	if err != nil {
		kotobaError(w, 500, "Could not load lesson progress")
		return
	}
	first := result == nil
	best := score
	if !first && kotobaInt(result["best"]) > best {
		best = kotobaInt(result["best"])
	}
	values := map[string]any{"user_id": user.ID, "lesson_id": id, "score": score, "best": best}
	if result == nil {
		result, err = kotobaInsert(db, "lesson_results", values)
	} else {
		err = kotobaUpdate(db, "lesson_results", kotobaInt(result["id"]), values)
	}
	if err != nil {
		kotobaError(w, 500, "Could not save lesson progress")
		return
	}
	xp := int64(5)
	if first {
		baseXP := kotobaInt(lesson["xp"])
		if baseXP < 1 {
			baseXP = 15
		}
		xp = int64(math.Round(float64(baseXP) * math.Max(0.4, float64(score)/100)))
	}
	_ = kotobaAddXP(db, user.ID, xp)
	added := 0
	var content struct {
		V [][]string `json:"v"`
	}
	if json.Unmarshal([]byte(kotobaText(lesson["content"])), &content) == nil {
		for _, pair := range content.V {
			if len(pair) < 2 || strings.TrimSpace(pair[0]) == "" {
				continue
			}
			existing, _ := kotobaFirst(db, `SELECT "id" FROM "vocab_cards" WHERE "user_id" = ? AND "lang" = ? AND "term" = ?`, user.ID, lesson["lang"], pair[0])
			if existing != nil {
				continue
			}
			if _, err := kotobaInsert(db, "vocab_cards", map[string]any{"user_id": user.ID, "lang": lesson["lang"], "term": pair[0], "meaning": pair[1], "source": "lesson", "due_date": time.Now().Format("2006-01-02")}); err == nil {
				added++
			}
		}
	}
	writeJSON(w, 200, map[string]any{"xp": xp, "cards_added": added, "first": first})
}

func (h *Handler) kotobaListCards(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	query := `SELECT * FROM "vocab_cards" WHERE "user_id" = ?`
	args := []any{user.ID}
	if lang := r.URL.Query().Get("lang"); lang != "" {
		query += ` AND "lang" = ?`
		args = append(args, lang)
	}
	countQuery := `SELECT COUNT(*) FROM "vocab_cards" WHERE "user_id" = ?`
	countArgs := []any{user.ID}
	if lang := r.URL.Query().Get("lang"); lang != "" {
		countQuery += ` AND "lang" = ?`
		countArgs = append(countArgs, lang)
	}
	var total, due int
	_ = db.QueryRow(countQuery, countArgs...).Scan(&total)
	dueQuery := countQuery + ` AND ("due_date" IS NULL OR "due_date" <= ?)`
	dueArgs := append(append([]any(nil), countArgs...), time.Now().Format("2006-01-02"))
	_ = db.QueryRow(dueQuery, dueArgs...).Scan(&due)
	if r.URL.Query().Get("due") == "1" {
		query += ` AND ("due_date" IS NULL OR "due_date" <= ?)`
		args = append(args, time.Now().Format("2006-01-02"))
	}
	if search := r.URL.Query().Get("q"); search != "" {
		query += ` AND ("term" LIKE ? OR "meaning" LIKE ?)`
		args = append(args, "%"+search+"%", "%"+search+"%")
	}
	query += ` ORDER BY "due_date", "id"`
	query += ` LIMIT 200`
	rows, err := kotobaRows(db, query, args...)
	if err != nil {
		kotobaError(w, 500, "Could not load vocabulary cards")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows, "total": total, "due_count": due})
}

func (h *Handler) kotobaAddCard(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	term, meaning, lang := strings.TrimSpace(kotobaText(body["term"])), strings.TrimSpace(kotobaText(body["meaning"])), kotobaText(body["lang"])
	if term == "" || meaning == "" || lang == "" || len(lang) > 8 {
		kotobaError(w, 422, "Term, meaning, and a valid language code are required")
		return
	}
	card, _ := kotobaFirst(db, `SELECT * FROM "vocab_cards" WHERE "user_id" = ? AND "lang" = ? AND "term" = ?`, user.ID, lang, term)
	created := card == nil
	var err error
	if created {
		card, err = kotobaInsert(db, "vocab_cards", map[string]any{"user_id": user.ID, "term": term, "meaning": meaning, "lang": lang, "example": body["example"], "source": bodyOr(body, "source", "manual"), "interval_days": 0, "ease": 2.5, "reps": 0, "lapses": 0, "due_date": time.Now().Format("2006-01-02")})
	}
	if err != nil {
		kotobaError(w, 500, "Could not add vocabulary card")
		return
	}
	status := http.StatusOK
	if created {
		status = http.StatusCreated
	}
	writeJSON(w, status, map[string]any{"data": card, "created": created})
}

func (h *Handler) kotobaReviewCard(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64, body map[string]any) {
	card, err := kotobaFirst(db, `SELECT * FROM "vocab_cards" WHERE "id" = ? AND "user_id" = ?`, id, user.ID)
	if err != nil || card == nil {
		kotobaError(w, 404, "Vocabulary card not found")
		return
	}
	grade := kotobaInt(body["grade"])
	if body["grade"] == nil {
		grade = 2
	}
	grade = maxInt64(0, minInt64(grade, 3))
	ease, interval := kotobaFloat(card["ease"]), kotobaInt(card["interval_days"])
	reps, lapses := kotobaInt(card["reps"]), kotobaInt(card["lapses"])
	due := time.Now()
	if grade == 0 {
		reps, lapses = 0, lapses+1
		ease = math.Max(1.3, ease-0.2)
		interval = 0
	} else {
		reps++
		switch reps {
		case 1:
			interval = 1
			if grade == 3 {
				interval = 3
			}
		case 2:
			interval = 4
			if grade == 1 {
				interval = 2
			} else if grade == 3 {
				interval = 7
			}
		default:
			multiplier := ease
			if grade == 1 {
				multiplier = 1.2
			} else if grade == 3 {
				multiplier = ease * 1.3
			}
			interval = int64(math.Round(float64(interval) * multiplier))
			if interval < 1 {
				interval = 1
			}
		}
		if grade == 1 {
			ease = math.Max(1.3, ease-0.15)
		} else if grade == 3 {
			ease += 0.15
		}
		due = due.AddDate(0, 0, int(interval))
	}
	dueDate := due.Format("2006-01-02")
	if err := kotobaUpdate(db, "vocab_cards", id, map[string]any{"ease": ease, "interval_days": interval, "reps": reps, "lapses": lapses, "due_date": dueDate}); err != nil {
		kotobaError(w, 500, "Could not review vocabulary card")
		return
	}
	card, _ = kotobaFirst(db, `SELECT * FROM "vocab_cards" WHERE "id" = ?`, id)
	_ = kotobaAddXP(db, user.ID, 2)
	writeJSON(w, 200, map[string]any{"data": card})
}

func (h *Handler) kotobaDeleteCard(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	result, err := db.Exec(`DELETE FROM "vocab_cards" WHERE "id" = ? AND "user_id" = ?`, id, user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not delete vocabulary card")
		return
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		kotobaError(w, 404, "Vocabulary card not found")
		return
	}
	writeJSON(w, 200, map[string]any{"message": "Vocabulary card deleted"})
}

func (h *Handler) kotobaPartners(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, user.ID)
	if err != nil || profile == nil {
		kotobaError(w, 404, "Learner profile not found")
		return
	}
	rows, err := kotobaRows(db, `SELECT p.*, EXISTS(SELECT 1 FROM "follows" f WHERE f."follower_id"=? AND f."following_id"=p."user_id") AS following FROM "profiles" p WHERE p."user_id"<>? AND p."learning_lang"=? ORDER BY p."xp" DESC LIMIT 40`, user.ID, user.ID, profile["native_lang"])
	if err != nil {
		kotobaError(w, 500, "Could not load language partners")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaViewProfile(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id" = ?`, id)
	if err != nil || profile == nil {
		kotobaError(w, 404, "Learner profile not found")
		return
	}
	var following int
	_ = db.QueryRow(`SELECT COUNT(*) FROM "follows" WHERE "follower_id" = ? AND "following_id" = ?`, user.ID, id).Scan(&following)
	followers, _ := kotobaRows(db, `SELECT COUNT(*) AS count FROM "follows" WHERE "following_id" = ?`, id)
	posts, _ := kotobaRows(db, `SELECT * FROM "posts" WHERE "user_id" = ? ORDER BY "created_at" DESC LIMIT 30`, id)
	writeJSON(w, 200, map[string]any{"profile": profile, "posts": posts, "is_following": following > 0, "followers_count": followers[0]["count"]})
}

func (h *Handler) kotobaToggleFollow(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	if id == user.ID {
		kotobaError(w, 422, "You cannot follow yourself")
		return
	}
	target, err := kotobaFirst(db, `SELECT "id" FROM "profiles" WHERE "user_id" = ?`, id)
	if err != nil || target == nil {
		kotobaError(w, 404, "Learner profile not found")
		return
	}
	follow, err := kotobaFirst(db, `SELECT "id" FROM "follows" WHERE "follower_id" = ? AND "following_id" = ?`, user.ID, id)
	if err != nil {
		kotobaError(w, 500, "Could not update follow")
		return
	}
	if follow != nil {
		_, _ = db.Exec(`DELETE FROM "follows" WHERE "id" = ?`, follow["id"])
	} else if _, err := kotobaInsert(db, "follows", map[string]any{"follower_id": user.ID, "following_id": id}); err != nil {
		kotobaError(w, 500, "Could not update follow")
		return
	} else {
		_, _ = kotobaInsert(db, "alerts", map[string]any{"user_id": id, "kind": "follow", "text": user.Name + " started following you.", "ref": user.ID, "is_read": false})
	}
	writeJSON(w, 200, map[string]any{"following": follow == nil})
}

func (h *Handler) kotobaListConversations(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	rows, err := kotobaRows(db, `SELECT * FROM "conversations" WHERE "user_a"=? OR "user_b"=? ORDER BY "last_at" DESC, "id" DESC`, user.ID, user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not load conversations")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaStartConversation(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	partner := kotobaInt(body["user_id"])
	if partner <= 0 || partner == user.ID {
		kotobaError(w, 422, "A valid conversation partner is required")
		return
	}
	a, b := user.ID, partner
	if a > b {
		a, b = b, a
	}
	conversation, err := kotobaFirst(db, `SELECT * FROM "conversations" WHERE "user_a" = ? AND "user_b" = ?`, a, b)
	if err != nil {
		kotobaError(w, 500, "Could not load conversation")
		return
	}
	if conversation == nil {
		conversation, err = kotobaInsert(db, "conversations", map[string]any{"user_a": a, "user_b": b})
		if err != nil {
			kotobaError(w, 500, "Could not start conversation")
			return
		}
	}
	writeJSON(w, 201, map[string]any{"data": conversation})
}

func (h *Handler) kotobaListMessages(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	conversationID, circleID := r.URL.Query().Get("conversation_id"), r.URL.Query().Get("circle_id")
	if conversationID != "" {
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM "conversations" WHERE "id"=? AND ("user_a"=? OR "user_b"=?)`, conversationID, user.ID, user.ID).Scan(&count)
		if count == 0 {
			kotobaError(w, 403, "You are not a member of this conversation")
			return
		}
		query := `SELECT * FROM "messages" WHERE "conversation_id"=?`
		args := []any{conversationID}
		if after := kotobaInt(r.URL.Query().Get("after_id")); after > 0 {
			query += ` AND "id" > ?`
			args = append(args, after)
		}
		query += ` ORDER BY "id" DESC LIMIT 100`
		rows, err := kotobaRows(db, query, args...)
		if err != nil {
			kotobaError(w, 500, "Could not load messages")
			return
		}
		reverseRows(rows)
		writeJSON(w, 200, map[string]any{"data": rows})
		return
	}
	if circleID != "" {
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM "circle_members" WHERE "circle_id"=? AND "user_id"=?`, circleID, user.ID).Scan(&count)
		if count == 0 {
			kotobaError(w, 403, "You are not a member of this circle")
			return
		}
		query := `SELECT * FROM "messages" WHERE "circle_id"=?`
		args := []any{circleID}
		if after := kotobaInt(r.URL.Query().Get("after_id")); after > 0 {
			query += ` AND "id" > ?`
			args = append(args, after)
		}
		query += ` ORDER BY "id" DESC LIMIT 100`
		rows, err := kotobaRows(db, query, args...)
		if err != nil {
			kotobaError(w, 500, "Could not load messages")
			return
		}
		reverseRows(rows)
		writeJSON(w, 200, map[string]any{"data": rows})
		return
	}

	kotobaError(w, 422, "A conversation_id or circle_id is required")
}

func reverseRows(rows []map[string]any) {
	for left, right := 0, len(rows)-1; left < right; left, right = left+1, right-1 {
		rows[left], rows[right] = rows[right], rows[left]
	}
}

func (h *Handler) kotobaSendMessage(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	text, lang := strings.TrimSpace(kotobaText(body["body"])), kotobaText(body["lang"])
	conversationID, circleID := nullablePositive(body["conversation_id"]), nullablePositive(body["circle_id"])
	if text == "" || len(text) > 2000 || len(lang) > 8 {
		kotobaError(w, 422, "Message must be 1–2000 characters and specify one conversation or circle")
		return
	}
	profile, _ := kotobaProfile(db, user)
	scope := "dm"
	if conversationID != nil {
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM "conversations" WHERE "id"=? AND ("user_a"=? OR "user_b"=?)`, conversationID, user.ID, user.ID).Scan(&count)
		if count == 0 {
			kotobaError(w, 403, "You are not a member of this conversation")
			return
		}
		circleID = nil
	} else {
		if circleID == nil {
			kotobaError(w, 422, "conversation_id or circle_id required")
			return
		}
		var count int
		_ = db.QueryRow(`SELECT COUNT(*) FROM "circle_members" WHERE "circle_id"=? AND "user_id"=?`, circleID, user.ID).Scan(&count)
		if count == 0 {
			kotobaError(w, 403, "You are not a member of this circle")
			return
		}
		scope = "circle"
	}
	message, err := kotobaInsert(db, "messages", map[string]any{"conversation_id": conversationID, "circle_id": circleID, "sender_id": user.ID, "sender_name": profile["display_name"], "sender_color": profile["avatar_color"], "body": text, "lang": lang})
	if err != nil {
		kotobaError(w, 500, "Could not send message")
		return
	}
	if conversationID != nil {
		preview := text
		if len(preview) > 200 {
			preview = preview[:200]
		}
		now := time.Now().UTC().Format(time.RFC3339Nano)
		_, _ = db.Exec(`UPDATE "conversations" SET "last_message"=?, "last_at"=?, "updated_at"=? WHERE "id"=?`, preview, now, now, conversationID)
	}
	payload := map[string]any{}
	for key, value := range message {
		payload[key] = value
	}
	payload["scope"] = scope
	words := int64(len(strings.Fields(text)))
	_ = kotobaBumpProfile(db, user.ID, 3, maxInt64(words, 1), 1)
	writeJSON(w, 201, map[string]any{"data": payload})
}

func (h *Handler) kotobaCorrectMessage(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64, body map[string]any) {
	message, err := kotobaFirst(db, `SELECT * FROM "messages" WHERE "id" = ?`, id)
	if err != nil || message == nil {
		kotobaError(w, 404, "Message not found")
		return
	}
	if kotobaInt(message["sender_id"]) == user.ID {
		kotobaError(w, 422, "You cannot correct your own message")
		return
	}
	corrected := strings.TrimSpace(kotobaText(body["corrected"]))
	note := kotobaText(body["note"])
	if corrected == "" || len(corrected) > 2000 || len(note) > 500 {
		kotobaError(w, 422, "Correction is required and note must be at most 500 characters")
		return
	}
	scope := "dm"
	member := false
	recipients := []int64{}
	if message["conversation_id"] != nil {
		conversation, _ := kotobaFirst(db, `SELECT * FROM "conversations" WHERE "id"=?`, message["conversation_id"])
		if conversation != nil {
			recipients = []int64{kotobaInt(conversation["user_a"]), kotobaInt(conversation["user_b"])}
		}
	} else if message["circle_id"] != nil {
		scope = "circle"
		members, _ := kotobaRows(db, `SELECT "user_id" FROM "circle_members" WHERE "circle_id"=?`, message["circle_id"])
		for _, row := range members {
			recipients = append(recipients, kotobaInt(row["user_id"]))
		}
	}
	for _, recipient := range recipients {
		member = member || recipient == user.ID
	}
	if !member {
		kotobaError(w, 403, "Not allowed")
		return
	}
	if err := kotobaUpdate(db, "messages", id, map[string]any{"corrected": corrected, "note": body["note"], "corrected_by": user.ID}); err != nil {
		kotobaError(w, 500, "Could not save correction")
		return
	}
	message, _ = kotobaFirst(db, `SELECT * FROM "messages" WHERE "id"=?`, id)
	message["scope"], message["updated"] = scope, true
	profile, _ := kotobaProfile(db, user)
	_, _ = kotobaInsert(db, "alerts", map[string]any{"user_id": message["sender_id"], "kind": "correction", "text": kotobaText(profile["display_name"]) + " suggested a correction in chat", "ref": id, "is_read": false})
	_ = kotobaBumpProfile(db, user.ID, 10, 0, 0)
	writeJSON(w, 200, map[string]any{"data": message})
}

func (h *Handler) kotobaListCircles(w http.ResponseWriter, r *http.Request, db *sql.DB, user kotobaUser) {
	query := `SELECT c.*, EXISTS(SELECT 1 FROM "circle_members" m WHERE m."circle_id"=c."id" AND m."user_id"=?) AS joined FROM "circles" c`
	args := []any{user.ID}
	if lang := r.URL.Query().Get("lang"); lang != "" {
		query += ` WHERE c."lang"=?`
		args = append(args, lang)
	}
	query += ` ORDER BY c."members_count" DESC, c."id" DESC LIMIT 60`
	rows, err := kotobaRows(db, query, args...)
	if err != nil {
		kotobaError(w, 500, "Could not load circles")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaCreateCircle(w http.ResponseWriter, db *sql.DB, user kotobaUser, body map[string]any) {
	name, lang := strings.TrimSpace(kotobaText(body["name"])), kotobaText(body["lang"])
	if name == "" || utf8.RuneCountInString(name) > 80 || lang == "" || len(lang) > 8 {
		kotobaError(w, 422, "Circle name and language are required")
		return
	}
	level := kotobaText(bodyOr(body, "level", "A1"))
	if !map[string]bool{"A1": true, "A2": true, "B1": true, "B2": true, "C1": true, "C2": true}[level] {
		kotobaError(w, 422, "Invalid language level")
		return
	}
	circle, err := kotobaInsert(db, "circles", map[string]any{"name": name, "emoji": bodyOr(body, "emoji", "message-circle"), "lang": lang, "level": level, "description": body["description"], "owner_id": user.ID, "members_count": 1})
	if err != nil {
		kotobaError(w, 500, "Could not create circle")
		return
	}
	_, _ = kotobaInsert(db, "circle_members", map[string]any{"circle_id": circle["id"], "user_id": user.ID})
	writeJSON(w, 201, map[string]any{"data": circle, "joined": true})
}

func (h *Handler) kotobaToggleJoin(w http.ResponseWriter, db *sql.DB, user kotobaUser, id int64) {
	circle, err := kotobaFirst(db, `SELECT * FROM "circles" WHERE "id" = ?`, id)
	if err != nil || circle == nil {
		kotobaError(w, 404, "Circle not found")
		return
	}
	member, err := kotobaFirst(db, `SELECT * FROM "circle_members" WHERE "circle_id" = ? AND "user_id" = ?`, id, user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not update circle membership")
		return
	}
	joined := member == nil
	if joined {
		_, err = kotobaInsert(db, "circle_members", map[string]any{"circle_id": id, "user_id": user.ID})
	} else {
		if kotobaInt(circle["owner_id"]) == user.ID {
			kotobaError(w, 422, "Owners cannot leave their own circle")
			return
		}
		_, err = db.Exec(`DELETE FROM "circle_members" WHERE "id" = ?`, member["id"])
	}
	if err != nil {
		kotobaError(w, 500, "Could not update circle membership")
		return
	}
	if joined {
		_, _ = db.Exec(`UPDATE "circles" SET "members_count" = "members_count" + 1, "updated_at"=? WHERE "id"=?`, time.Now().UTC().Format(time.RFC3339Nano), id)
	} else if kotobaInt(circle["members_count"]) > 1 {
		_, _ = db.Exec(`UPDATE "circles" SET "members_count" = "members_count" - 1, "updated_at"=? WHERE "id"=?`, time.Now().UTC().Format(time.RFC3339Nano), id)
	}
	var members int64
	_ = db.QueryRow(`SELECT "members_count" FROM "circles" WHERE "id"=?`, id).Scan(&members)
	writeJSON(w, 200, map[string]any{"joined": joined, "members_count": members})
}

func (h *Handler) kotobaListAlerts(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	rows, err := kotobaRows(db, `SELECT * FROM "alerts" WHERE "user_id" = ? ORDER BY "id" DESC LIMIT 40`, user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not load alerts")
		return
	}
	writeJSON(w, 200, map[string]any{"data": rows})
}

func (h *Handler) kotobaReadAlerts(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	result, err := db.Exec(`UPDATE "alerts" SET "is_read"=1, "updated_at"=? WHERE "user_id"=? AND "is_read"=0`, time.Now().UTC().Format(time.RFC3339Nano), user.ID)
	if err != nil {
		kotobaError(w, 500, "Could not mark alerts as read")
		return
	}
	updated, _ := result.RowsAffected()
	writeJSON(w, 200, map[string]any{"message": "Alerts marked as read", "updated": updated})
}

func (h *Handler) kotobaProgress(w http.ResponseWriter, db *sql.DB, user kotobaUser) {
	profile, err := kotobaFirst(db, `SELECT * FROM "profiles" WHERE "user_id"=?`, user.ID)
	if err != nil || profile == nil {
		kotobaError(w, 500, "Could not load learner profile")
		return
	}
	start := time.Now().UTC().Truncate(24*time.Hour).AddDate(0, 0, -13)
	days := map[string]int{}
	for offset := 0; offset < 14; offset++ {
		days[start.AddDate(0, 0, offset).Format("2006-01-02")] = 0
	}
	activityQueries := []struct {
		query string
		args  []any
		date  string
	}{
		{`SELECT "created_at" AS activity_at FROM "posts" WHERE "user_id"=? AND "created_at">=?`, []any{user.ID, start.Format(time.RFC3339Nano)}, "created_at"},
		{`SELECT "created_at" AS activity_at FROM "messages" WHERE "sender_id"=? AND "created_at">=?`, []any{user.ID, start.Format(time.RFC3339Nano)}, "created_at"},
		{`SELECT "updated_at" AS activity_at FROM "lesson_results" WHERE "user_id"=? AND "updated_at">=?`, []any{user.ID, start.Format(time.RFC3339Nano)}, "updated_at"},
	}
	for _, activity := range activityQueries {
		rows, _ := kotobaRows(db, activity.query, activity.args...)
		for _, row := range rows {
			day := kotobaText(row["activity_at"])
			if len(day) >= 10 {
				days[day[:10]]++
			}
		}
	}
	series := make([]map[string]any, 0, 14)
	for offset := 0; offset < 14; offset++ {
		date := start.AddDate(0, 0, offset).Format("2006-01-02")
		series = append(series, map[string]any{"date": date, "count": days[date]})
	}
	count := func(query string, args ...any) int {
		var value int
		_ = db.QueryRow(query, args...).Scan(&value)
		return value
	}
	postIDs, _ := kotobaRows(db, `SELECT "id" FROM "posts" WHERE "user_id"=?`, user.ID)
	var postIDValues []any
	for _, post := range postIDs {
		postIDValues = append(postIDValues, post["id"])
	}
	correctionsReceived, correctionsAccepted := 0, 0
	if len(postIDValues) > 0 {
		marks := strings.TrimRight(strings.Repeat("?,", len(postIDValues)), ",")
		correctionsReceived = count(`SELECT COUNT(*) FROM "comments" WHERE "is_correction"=1 AND "post_id" IN (`+marks+`)`, postIDValues...)
		correctionsAccepted = count(`SELECT COUNT(*) FROM "comments" WHERE "is_correction"=1 AND "accepted"=1 AND "post_id" IN (`+marks+`)`, postIDValues...)
	}
	xp := kotobaInt(profile["xp"])
	writeJSON(w, 200, map[string]any{
		"profile": profile, "series": series,
		"stats": map[string]any{
			"cards":                count(`SELECT COUNT(*) FROM "vocab_cards" WHERE "user_id"=?`, user.ID),
			"mastered":             count(`SELECT COUNT(*) FROM "vocab_cards" WHERE "user_id"=? AND "reps">=4`, user.ID),
			"lessons":              count(`SELECT COUNT(*) FROM "lesson_results" WHERE "user_id"=?`, user.ID),
			"posts":                len(postIDs),
			"corrections_given":    count(`SELECT COUNT(*) FROM "comments" WHERE "user_id"=? AND "is_correction"=1`, user.ID),
			"corrections_received": correctionsReceived, "corrections_accepted": correctionsAccepted,
			"words_written": profile["words_written"], "messages_sent": profile["messages_sent"],
		},
		"level": xp/100 + 1, "level_progress": xp % 100,
	})
}
