package backend

import (
	"database/sql"
	"encoding/json"

	"fmt"

	"net/http"

	"strconv"
	"strings"
	"time"
)

func (h *Handler) sendMail(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	mail, _ := input["mail"].(string)
	to, _ := input["to"].(string)
	definitions, err := mailDefinitions(match.registration)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to load mail definitions"})
		return
	}
	definition, exists := definitions[mail]
	if !exists || !validEmail(to) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{"mail must be supported and to must be a valid email address"},
		})
		return
	}
	data, err := mailData(input)
	if err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{err.Error()}})
		return
	}
	htmlBody, err := renderMail(definition, data)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to render mail template"})
		return
	}
	if err := sendRenderedMail(to, definition.subject, htmlBody); err != nil {
		writeJSON(w, http.StatusBadGateway, map[string]string{"message": err.Error()})
		return
	}
	module := match.registration.Name
	db, columns, primary, ready := openActionTable(w, h, module, "mail_logs")
	if !ready {
		return
	}
	defer db.Close()
	class := strings.ReplaceAll(strings.Title(strings.ReplaceAll(mail, "-", " ")), " ", "")
	recordInput := map[string]any{
		"to_email": to, "subject": definition.subject, "mail_class": class, "status": "sent",
	}
	if user, _, authenticated, authErr := h.resolveAuthUser(r, module); authErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	} else if authenticated {
		recordInput["user_id"] = user.ID
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("mail_logs"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record mail delivery"})
		return
	}
	writeJSON(w, http.StatusCreated, record)
}

func goClassName(name string) string {
	parts := strings.FieldsFunc(name, func(character rune) bool { return character == '-' || character == '_' })
	for index, part := range parts {
		if part != "" {
			parts[index] = strings.ToUpper(part[:1]) + part[1:]
		}
	}
	return strings.Join(parts, "")
}

func requestBaseURL(r *http.Request) string {
	scheme := "http"
	if r.TLS != nil {
		scheme = "https"
	}
	if forwarded := strings.TrimSpace(strings.Split(r.Header.Get("X-Forwarded-Proto"), ",")[0]); forwarded == "http" || forwarded == "https" {
		scheme = forwarded
	}
	host := r.Host
	if host == "" && r.URL != nil {
		host = r.URL.Host
	}
	return scheme + "://" + host
}

func (h *Handler) fireEvent(w http.ResponseWriter, r *http.Request, registration Registration) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	eventName, valid := input["event"].(string)
	if !valid || strings.TrimSpace(eventName) == "" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "event" is required`}})
		return
	}
	var event eventDefinition
	found := false
	for _, definition := range eventDefinitions(registration) {
		if normalizeEventIdentifier(definition.name) == normalizeEventIdentifier(eventName) {
			event = definition
			found = true
			break
		}
	}
	if !found || len(event.listeners) == 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "event" has an unsupported value`}})
		return
	}
	eventData := map[string]any{}
	if rawPayload, supplied := input["payload"]; supplied {
		var isObject bool
		eventData, isObject = rawPayload.(map[string]any)
		if !isObject {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "payload" must be an object`}})
			return
		}
	}
	jobs := make([]queuedJob, 0, len(event.listeners))
	for _, listener := range event.listeners {
		logEventName, logListenerName, err := goEventLogFields(listener.body)
		if err != nil {
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": fmt.Sprintf("Go listener %q is not supported: %v", listener.name, err)})
			return
		}
		if normalizeEventIdentifier(logListenerName) != normalizeEventIdentifier(listener.name) ||
			normalizeEventIdentifier(logEventName) != normalizeEventIdentifier(event.name) {
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": fmt.Sprintf("Go listener body does not match event %q and listener %q", event.name, listener.name)})
			return
		}
		jobs = append(jobs, queuedJob{
			Kind: "event_listener", Module: "events-test", Name: listener.name,
			EventName: logEventName, EventData: eventData, ListenerBody: listener.body,
			Tries: 3, Timeout: 60,
		})
	}
	db, err := openModuleDatabase(h.service.storageDir, "events-test")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	if strings.EqualFold(envOr("QUEUE_CONNECTION", "database"), "sync") {
		for _, job := range jobs {
			if err := executeGoEventListener(r.Context(), db, job); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not execute event listener"})
				return
			}
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"message": "Event fired"})
		return
	}
	if err := ensureQueueTables(db); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to initialize event listener queue"})
		return
	}
	tx, err := db.BeginTx(r.Context(), nil)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to queue event listeners"})
		return
	}
	defer tx.Rollback()
	now := time.Now().Unix()
	for _, job := range jobs {
		encoded, err := json.Marshal(job)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to encode event listener"})
			return
		}
		if _, err := tx.ExecContext(r.Context(), `INSERT INTO "jobs" ("queue", "payload", "available_at", "created_at") VALUES (?, ?, ?, ?)`,
			"default", string(encoded), now, now); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to queue event listener"})
			return
		}
	}
	if err := tx.Commit(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to queue event listeners"})
		return
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"message": "Event fired"})
}

func normalizeEventIdentifier(value string) string {
	var normalized strings.Builder
	for _, character := range strings.ToLower(value) {
		if character >= 'a' && character <= 'z' || character >= '0' && character <= '9' {
			normalized.WriteRune(character)
		}
	}
	return normalized.String()
}

func (h *Handler) sendBroadcastMessage(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	content, valid := input["content"].(string)
	if !valid || strings.TrimSpace(content) == "" || len([]rune(content)) > 500 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"content is required and must be at most 500 characters"}})
		return
	}
	channel := "public"
	if value, valid := input["channel_type"].(string); valid && value != "" {
		channel = value
	}
	if channel != "public" && channel != "private" && channel != "presence" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Unknown broadcast channel type."})
		return
	}
	var user authUser
	var authenticated bool
	if match.registration.Auth && (channel == "private" || channel == "presence" || bearerToken(r) != "") {
		var err error
		user, _, authenticated, err = h.resolveAuthUser(r, match.registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve broadcast user"})
			return
		}
	}
	if (channel == "private" || channel == "presence") && !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	userID := int64(0)
	if authenticated {
		userID = user.ID
	}
	realtimeChannel, eventName, configured := resolveBroadcastEvent(match.registration, channel, userID)
	if !configured {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": fmt.Sprintf("No %s broadcast channel is configured.", channel)})
		return
	}
	db, columns, primary, ready := openActionTable(w, h, match.registration.Name, match.api.Table)
	if !ready {
		return
	}
	defer db.Close()
	recordInput := map[string]any{"content": content, "channel_type": channel}
	if _, exists := columns["user_id"]; exists {
		if authenticated {
			recordInput["user_id"] = user.ID
		} else {
			recordInput["user_id"] = nil
		}
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier(match.api.Table), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record broadcast message"})
		return
	}
	h.realtime.BroadcastTo(realtimeChannel, eventName, record)
	writeJSON(w, http.StatusCreated, map[string]any{
		"data": record, "broadcast": map[string]any{"event": "message-sent-" + channel, "channel_type": channel, "delivered": false},
	})
}

func (h *Handler) pollBroadcastMessages(w http.ResponseWriter, r *http.Request, registration Registration, api APIBlock, path string) {
	channel, matched := matchRoute("/api/"+registration.Name+"/sse-poll/{channelType}", path)
	if !matched || (channel != "public" && channel != "private" && channel != "presence") {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Unknown broadcast channel type."})
		return
	}
	if api.Table == "" {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Broadcast table is not configured"})
		return
	}
	columns, primary := map[string]struct{}{}, ""
	db, err := openModuleDatabase(h.service.storageDir, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open broadcast database"})
		return
	}
	defer db.Close()
	columns, primary, err = inspectColumns(db, api.Table)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect broadcast table"})
		return
	}
	if _, exists := columns["channel_type"]; !exists {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Broadcast table has no channel_type column"})
		return
	}
	if channel == "private" {
		if _, exists := columns["user_id"]; !exists {
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Private broadcast polling requires a user_id column."})
			return
		}
	}

	var user authUser
	var authenticated bool
	if channel == "private" || channel == "presence" {
		if !registration.Auth {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
			return
		}
		var resolveErr error
		user, _, authenticated, resolveErr = h.resolveAuthUser(r, registration.Name)
		if resolveErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve broadcast user"})
			return
		}
		if !authenticated {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
			return
		}
	}

	afterID := int64(0)
	if raw := r.URL.Query().Get("after_id"); raw != "" {
		parsed, parseErr := strconv.ParseInt(raw, 10, 64)
		if parseErr != nil || parsed < 0 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "after_id must be a non-negative integer"})
			return
		}
		afterID = parsed
	}
	query := "SELECT * FROM " + quoteIdentifier(api.Table) +
		" WHERE " + quoteIdentifier("channel_type") + " = ? AND " + quoteIdentifier(primary) + " > ?"
	args := []any{channel, afterID}
	if channel == "private" {
		query += " AND " + quoteIdentifier("user_id") + " = ?"
		args = append(args, user.ID)
	}
	query += " ORDER BY " + quoteIdentifier(primary) + " LIMIT 50"
	rows, err := db.Query(query, args...)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read broadcast messages"})
		return
	}
	records, err := scanRecords(rows)
	_ = rows.Close()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read broadcast messages"})
		return
	}
	messages := make([]map[string]any, 0, len(records))
	lastID := afterID
	userID := int64(0)
	if authenticated {
		userID = user.ID
	}
	_, eventName, hasEvent := resolveBroadcastEvent(registration, channel, userID)
	for _, record := range records {
		if id, ok := record[primary].(int64); ok && id > lastID {
			lastID = id
		}
		messages = append(messages, map[string]any{
			"event": nullableString(eventName, hasEvent),
			"data":  record,
		})
	}
	writeJSON(w, http.StatusOK, map[string]any{"messages": messages, "last_id": lastID})
}

func openActionTable(w http.ResponseWriter, h *Handler, module, table string) (*sql.DB, map[string]struct{}, string, bool) {
	db, err := openModuleDatabase(h.service.storageDir, module)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return nil, nil, "", false
	}
	columns, primary, err := inspectColumns(db, table)
	if err != nil {
		_ = db.Close()
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
		return nil, nil, "", false
	}
	return db, columns, primary, true
}

func validEmail(value string) bool {
	at := strings.LastIndexByte(value, '@')
	return at > 0 && at < len(value)-3 && strings.Contains(value[at+1:], ".")
}
