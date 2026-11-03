package backend

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

func (h *Handler) serveBuiltinAPI(w http.ResponseWriter, r *http.Request, match matchedEndpoint) bool {
	module := match.registration.Name
	switch {
	case module == "notification-test" && (match.operation == "index" || match.operation == "store" || match.operation == "destroy" || match.operation == "readAll"):
		h.serveNotificationTestAction(w, r, match)
		return true
	case module == "roles-test" && (match.operation == "adminOnly" || match.operation == "userOnly" || match.operation == "promote" || match.operation == "demote"):
		h.serveRolesTestAction(w, r, match)
		return true
	case module == "job-test" && match.endpoint.Type == "job_dispatch" && match.operation == "store":
		h.dispatchJob(w, r)
		return true
	case module == "mail-test" && match.endpoint.Type == "mail_send" && match.operation == "store":
		h.sendMail(w, r, match)
		return true
	case module == "body-mail-notification" && (match.operation == "sendMail" || match.operation == "notify"):
		h.simulateBodyMailAction(w, r, match)
		return true
	case module == "scheduler-test" && match.endpoint.Type == "command_run" && match.operation == "store":
		h.runCommand(w, r)
		return true
	case module == "scheduler-test" && match.operation == "destroy" && match.id == "":
		h.clearTable(w, "command_runs", match)
		return true
	case module == "events-test" && match.endpoint.Type == "event_fire" && match.operation == "store":
		h.fireEvent(w, r, match.registration)
		return true
	case module == "events-test" && match.operation == "clearLog":
		h.clearTable(w, "event_log", match)
		return true
	case module == "body-mail-notification" && match.operation == "clearLog":
		h.clearTable(w, "send_log", match)
		return true
	case module == "broadcast-test" && match.endpoint.Type == "broadcast" && match.operation == "store":
		h.sendBroadcastMessage(w, r, match)
		return true
	case module == "dtr-geofencing" && match.operation == "my_records":
		h.employeeRecords(w, match)
		return true
	case module == "dtr-geofencing" && (match.operation == "check_in" || match.operation == "check_out"):
		h.recordAttendance(w, r, match)
		return true
	case module == "dtr-geofencing" && match.operation == "toggle_geofencing":
		h.toggleGeofencing(w, r)
		return true
	case module == "dtr-geofencing" && match.operation == "update_office":
		h.updateOffice(w, r)
		return true
	case module == "jo-payroll" && match.operation == "summary":
		h.payrollSummary(w)
		return true
	case module == "jo-payroll" && match.operation == "byGroup":
		h.payrollByGroup(w, match.id)
		return true
	case module == "jo-payroll" && match.operation == "appointments":
		h.payrollAppointments(w)
		return true
	}
	if match.endpoint.Type != "" && match.endpoint.Type != "collection" && match.endpoint.Type != "single" &&
		match.endpoint.Type != "array" && match.endpoint.Type != "paginated" && match.endpoint.Type != "message" {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": fmt.Sprintf("Go emulation for %s operation %q is not implemented", module, match.endpoint.Type),
		})
		return true
	}
	if isSupportedNamedEndpoint(module, match.operation) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": fmt.Sprintf("Go emulation for %s operation %q requires unsupported authentication or framework state", module, match.operation),
		})
		return true
	}
	return false
}

func (h *Handler) serveRolesTestAction(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	user, _, authenticated, err := h.resolveAuthUser(r, match.registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}

	switch match.operation {
	case "adminOnly", "userOnly":
		db, columns, primary, ready := openActionTable(w, h, match.registration.Name, "role_audit_logs")
		if !ready {
			return
		}
		defer db.Close()

		granted := match.operation == "userOnly" || user.Role == "admin"
		requiredRole, action := "user", "GET /user-only"
		if match.operation == "adminOnly" {
			requiredRole, action = "admin", "GET /admin-only"
		}
		recordInput := map[string]any{
			"user_id": user.ID, "action": action,
			"role_required": requiredRole, "granted": granted,
		}
		prepareTimestamps(recordInput, columns, true)
		if _, err := insertRecord(db, quoteIdentifier("role_audit_logs"), recordInput, columns, primary); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record role access"})
			return
		}
		if match.operation == "adminOnly" && !granted {
			writeJSON(w, http.StatusForbidden, map[string]string{"message": "✗ Access denied — admin role required"})
			return
		}
		message := "✓ Access granted — open to all authenticated users"
		if match.operation == "adminOnly" {
			message = "✓ Access granted — you are admin"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
	case "promote", "demote":
		role := "admin"
		message := "Promoted to admin"
		if match.operation == "demote" {
			role = "user"
			message = "Demoted to user"
		}
		db, columns, _, ready := openActionTable(w, h, match.registration.Name, "users")
		if !ready {
			return
		}
		defer db.Close()
		if _, exists := columns["role"]; !exists {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Auth users table does not have a role column"})
			return
		}
		now := time.Now().UTC().Format(time.RFC3339Nano)
		if _, err := db.Exec(`UPDATE "users" SET "role" = ?, "updated_at" = ? WHERE "id" = ?`, role, now, user.ID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not update authenticated user role"})
			return
		}
		user.Role = role
		user.UpdatedAt = now
		writeJSON(w, http.StatusOK, map[string]any{"message": message, "user": user})
	}
}

func (h *Handler) dispatchJob(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, valid := input["job"].(string)
	if !valid {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{`Field "job" has an unsupported value`},
		})
		return
	}
	var registration Registration
	for _, current := range h.service.Registrations() {
		if current.Name == "job-test" {
			registration = current
			break
		}
	}
	if registration.Name == "" {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Job module is not registered"})
		return
	}
	data, _ := input["data"].(map[string]any)
	h.dispatchQueuedJob(w, registration, name, data)
}

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

func (h *Handler) simulateBodyMailAction(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	if match.operation == "sendMail" {
		input, ok := readObjectBody(w, r)
		if !ok {
			return
		}
		mail, _ := input["mail"].(string)
		to, _ := input["to"].(string)
		if (mail != "welcome" && mail != "receipt" && mail != "alert") || !validEmail(to) {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"supported mail and valid to address are required"}})
			return
		}
		definitions, err := mailDefinitions(match.registration)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to load mail definitions"})
			return
		}
		definition, exists := definitions[mail]
		if !exists {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"mail must name a declared template"}})
			return
		}
		mailData := map[string]map[string]any{
			"welcome": {"name": "Test User", "app_name": "Arkzen"},
			"receipt": {"order_id": "ORD-001", "amount": "$9.99", "item_name": "Arkzen Test Item"},
			"alert":   {"alert_message": "This is a test alert from Arkzen.", "action_url": requestBaseURL(r)},
		}
		htmlBody, err := renderMail(definition, mailData[mail])
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to render mail template"})
			return
		}
		user, _, authenticated, err := h.resolveAuthUser(r, "body-mail-notification")
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
			return
		}
		var userRef any
		if authenticated {
			userRef = user.ID
		}
		status := "sent"
		deliveryErr := sendRenderedMail(to, definition.subject, htmlBody)
		if deliveryErr != nil {
			status = "failed"
		}
		db, columns, primary, ready := openActionTable(w, h, "body-mail-notification", "send_log")
		if !ready {
			return
		}
		defer db.Close()
		recordInput := map[string]any{
			"user_id": userRef, "to_email": to, "subject": mail,
			"mail_class": goClassName(mail) + "Mail", "kind": "mail", "status": status,
		}
		if deliveryErr != nil {
			recordInput["error"] = deliveryErr.Error()
		}
		prepareTimestamps(recordInput, columns, true)
		record, err := insertRecord(db, quoteIdentifier("send_log"), recordInput, columns, primary)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record mail delivery"})
			return
		}
		writeJSON(w, http.StatusCreated, map[string]any{"data": record})
		return
	}
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	notification, _ := input["notification"].(string)
	if notification != "action-required" && notification != "summary" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notification must be action-required or summary"}})
		return
	}
	message, _ := input["message"].(string)
	if len(message) > 255 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"message must be at most 255 characters"}})
		return
	}
	user, _, authenticated, err := h.resolveAuthUser(r, "body-mail-notification")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated"})
		return
	}
	var notificationSection *realtimeSection
	for _, section := range parseRealtimeSections(match.registration.Notifications) {
		if section.name == notification {
			notificationSection = &section
			break
		}
	}
	if notificationSection == nil || notificationSection.values["toMail_body"] == "" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notification must have a Go implementation"}})
		return
	}
	defaultMessage := notificationSection.values["message"]
	if message == "" {
		message = defaultMessage
	}
	subject := "⚠ Action Required — toMail_body injection test"
	lines := []string{message, "This toMail() body was injected via the Arkzen DSL — not a stub."}
	actionLabel := "Review Now"
	salutation := "NotificationBuilder v3.9 toMail_body injection confirmed ✓"
	if notification == "summary" {
		subject = "📊 Activity Summary — toMail_body injection test"
		lines = []string{message, "Notifications: 2 unread | Mails: 3 sent | Status: All healthy"}
		actionLabel = "View Dashboard"
		salutation = "Cheers, Arkzen Engine"
	}
	templateData := map[string]any{
		"Subject": subject, "Message": message, "Lines": lines,
		"ActionLabel": actionLabel, "ActionURL": "/",
		"Salutation": salutation,
	}
	htmlBody, err := renderMail(mailDefinition{
		name: notification, subject: subject,
		template: `<h2>{{.Subject}}</h2><p>{{index .Lines 0}}</p><p>{{index .Lines 1}}</p><a href="{{.ActionURL}}">{{.ActionLabel}}</a><p>{{.Salutation}}</p>`,
	}, templateData)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to render notification"})
		return
	}
	status := "sent"
	deliveryErr := sendRenderedMail(user.Email, subject, htmlBody)
	if deliveryErr != nil {
		status = "failed"
	}
	db, columns, primary, ready := openActionTable(w, h, "body-mail-notification", "send_log")
	if !ready {
		return
	}
	defer db.Close()
	recordInput := map[string]any{
		"user_id": user.ID, "to_email": user.Email, "subject": notification,
		"mail_class": goClassName(notification) + "Notification", "kind": "notification", "status": status,
	}
	if deliveryErr != nil {
		recordInput["error"] = deliveryErr.Error()
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("send_log"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record notification delivery"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record})
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

func (h *Handler) runCommand(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, _ := input["command"].(string)
	if _, exists := map[string]struct{}{
		"cleanup-temp": {}, "generate-report": {}, "ping-health": {}, "sync-data": {},
	}[name]; !exists {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "command" has an unsupported value`}})
		return
	}
	triggeredBy := "manual"
	if value, valid := input["triggered_by"].(string); valid && value != "" {
		if value != "manual" && value != "schedule" {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "triggered_by" has an unsupported value`}})
			return
		}
		triggeredBy = value
	}
	record, err := recordCommandRun(h.service.storageDir, "scheduler-test", name, triggeredBy)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record command run"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record, "emulated": true})
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

func (h *Handler) employeeRecords(w http.ResponseWriter, match matchedEndpoint) {
	if _, err := strconv.ParseInt(match.id, 10, 64); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "employee_id must be an integer"})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, "dtr-geofencing")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	rows, err := db.Query(`SELECT * FROM "time_records" WHERE "employee_id" = ? ORDER BY "timestamp" DESC LIMIT 50`, match.id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load employee records"})
		return
	}
	records, err := scanRecords(rows)
	_ = rows.Close()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not read employee records"})
		return
	}
	for _, record := range records {
		employee, queryErr := queryOne(db, `SELECT * FROM "employees" WHERE "id" = ?`, record["employee_id"])
		if queryErr == nil {
			record["employee"] = employee
		}
	}
	writeJSON(w, http.StatusOK, records)
}

func (h *Handler) recordAttendance(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	employeeID, ok := numericValue(input["employee_id"])
	if !ok || employeeID < 1 || math.Trunc(employeeID) != employeeID {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"employee_id must be a positive integer"}})
		return
	}
	db, columns, primary, ready := openActionTable(w, h, "dtr-geofencing", "time_records")
	if !ready {
		return
	}
	defer db.Close()
	var employeeExists int
	if err := db.QueryRow(`SELECT 1 FROM "employees" WHERE "id" = ?`, int64(employeeID)).Scan(&employeeExists); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Employee not found"})
		return
	}
	now := time.Now().UTC()
	recordType := "in"
	action := "check in"
	if match.operation == "check_out" {
		recordType = "out"
		action = "check out"
	}
	enabled := settingValue(db, "geofencing_enabled", "true") == "true"
	within := true
	latitude, hasLatitude := numericValue(input["latitude"])
	longitude, hasLongitude := numericValue(input["longitude"])
	if value, exists := input["latitude"]; exists && value != nil && (!hasLatitude || math.Abs(latitude) > 90) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"latitude must be between -90 and 90"}})
		return
	}
	if value, exists := input["longitude"]; exists && value != nil && (!hasLongitude || math.Abs(longitude) > 180) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"longitude must be between -180 and 180"}})
		return
	}
	if value, exists := input["notes"]; exists && value != nil {
		if _, valid := value.(string); !valid {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notes must be a string"}})
			return
		}
	}
	if hasLatitude && hasLongitude && enabled {
		officeLatitude, _ := strconv.ParseFloat(settingValue(db, "office_latitude", "14.599512"), 64)
		officeLongitude, _ := strconv.ParseFloat(settingValue(db, "office_longitude", "120.984219"), 64)
		radius, _ := strconv.ParseFloat(settingValue(db, "geofence_radius_meters", "100"), 64)
		distance := distanceMeters(latitude, longitude, officeLatitude, officeLongitude)
		within = distance <= radius
		if !within {
			writeJSON(w, http.StatusForbidden, map[string]any{
				"error":    "Geofence violation",
				"message":  fmt.Sprintf("You must be within %.0f meters of the office to %s.", radius, action),
				"distance": math.Round(distance*10) / 10,
			})
			return
		}
	}
	recordInput := map[string]any{
		"employee_id": int64(employeeID), "type": recordType,
		"timestamp": now.Format(time.RFC3339), "within_geofence": within,
		"latitude": input["latitude"], "longitude": input["longitude"], "notes": input["notes"],
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("time_records"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record attendance"})
		return
	}
	if employee, queryErr := queryOne(db, `SELECT * FROM "employees" WHERE "id" = ?`, int64(employeeID)); queryErr == nil {
		record["employee"] = employee
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true, "record": record, "within_geofence": within,
		"geofencing_enabled": enabled, "emulated": true,
	})
}

func (h *Handler) toggleGeofencing(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, "dtr-geofencing")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	value, _ := input["enabled"].(bool)
	storeSetting(db, "geofencing_enabled", strconv.FormatBool(value))
	writeJSON(w, http.StatusOK, map[string]any{"success": true, "geofencing_enabled": value})
}

func (h *Handler) updateOffice(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	inputKeys := map[string]string{
		"lat": "office_latitude", "lng": "office_longitude", "radius": "geofence_radius_meters",
	}
	values := make(map[string]string)
	for inputKey, key := range inputKeys {
		if value, exists := input[inputKey]; exists {
			number, valid := numericValue(value)
			if !valid || (key == "geofence_radius_meters" && number <= 0) ||
				(key != "geofence_radius_meters" && math.Abs(number) > 180) ||
				(key == "office_latitude" && math.Abs(number) > 90) {
				writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{key + " must be a valid coordinate or positive radius"}})
				return
			}
			values[key] = strconv.FormatFloat(number, 'f', -1, 64)
		}
	}
	if len(values) == 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"at least one supported office setting is required"}})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, "dtr-geofencing")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	for key, value := range values {
		storeSetting(db, key, value)
	}
	writeJSON(w, http.StatusOK, map[string]any{"success": true})
}

func (h *Handler) payrollSummary(w http.ResponseWriter) {
	rows, err := h.payrollRows()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load payroll summary"})
		return
	}
	summary := map[string]any{
		"total_active": 0, "total_inactive": 0, "total_atm": 0, "total_cash": 0,
		"total_basic_pay": float64(0), "total_sss": float64(0), "total_hdmf_premium": float64(0),
		"total_hdmf_mpl": float64(0), "total_calamity_loan": float64(0),
	}
	funding := map[string]map[string]any{}
	groups := map[string]int{}
	for _, row := range rows {
		if row["status"] != "active" {
			summary["total_inactive"] = summary["total_inactive"].(int) + 1
			continue
		}
		summary["total_active"] = summary["total_active"].(int) + 1
		if row["disbursement_type"] == "ATM" {
			summary["total_atm"] = summary["total_atm"].(int) + 1
		} else if row["disbursement_type"] == "CASH" {
			summary["total_cash"] = summary["total_cash"].(int) + 1
		}
		for _, field := range []string{"basic_pay", "sss_amount", "hdmf_premium", "hdmf_mpl", "calamity_loan"} {
			summary[fieldTotalName(field)] = summary[fieldTotalName(field)].(float64) + recordNumber(row[field])
		}
		fundingName := fmt.Sprint(row["funding"])
		if funding[fundingName] == nil {
			funding[fundingName] = map[string]any{"count": 0, "total_pay": float64(0)}
		}
		funding[fundingName]["count"] = funding[fundingName]["count"].(int) + 1
		funding[fundingName]["total_pay"] = funding[fundingName]["total_pay"].(float64) + recordNumber(row["basic_pay"])
		groups[fmt.Sprint(row["jor_pyrl_group"])]++
	}
	totalDeductions := summary["total_sss"].(float64) + summary["total_hdmf_premium"].(float64) +
		summary["total_hdmf_mpl"].(float64) + summary["total_calamity_loan"].(float64)
	summary["total_deductions"] = totalDeductions
	summary["net_pay"] = summary["total_basic_pay"].(float64) - totalDeductions
	summary["funding_breakdown"] = funding
	summary["group_breakdown"] = groups
	writeJSON(w, http.StatusOK, summary)
}

func (h *Handler) payrollByGroup(w http.ResponseWriter, group string) {
	rows, err := h.payrollRows()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load payroll group"})
		return
	}
	filtered := make([]map[string]any, 0)
	for _, row := range rows {
		if fmt.Sprint(row["jor_pyrl_group"]) == group && fmt.Sprint(row["status"]) == "active" {
			filtered = append(filtered, row)
		}
	}
	sort.SliceStable(filtered, func(i, j int) bool {
		return recordNumber(filtered[i]["jor_number"]) < recordNumber(filtered[j]["jor_number"])
	})
	writeJSON(w, http.StatusOK, filtered)
}

func (h *Handler) payrollAppointments(w http.ResponseWriter) {
	rows, err := h.payrollRows()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load appointments"})
		return
	}
	filtered := rows[:0]
	for _, row := range rows {
		if row["appointment_order"] != nil {
			filtered = append(filtered, row)
		}
	}
	rows = filtered
	sort.SliceStable(rows, func(i, j int) bool {
		return recordNumber(rows[i]["appointment_order"]) < recordNumber(rows[j]["appointment_order"])
	})
	writeJSON(w, http.StatusOK, rows)
}

func (h *Handler) payrollRows() ([]map[string]any, error) {
	db, err := openModuleDatabase(h.service.storageDir, "jo-payroll")
	if err != nil {
		return nil, err
	}
	defer db.Close()
	rows, err := db.Query(`SELECT * FROM "job_orders" ORDER BY "jor_number"`)
	if err != nil {
		return nil, err
	}
	result, scanErr := scanRecords(rows)
	closeErr := rows.Close()
	if scanErr != nil {
		return nil, scanErr
	}
	if closeErr != nil {
		return nil, closeErr
	}
	return result, nil
}

func (h *Handler) serveQueueRoute(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	db, err := openModuleDatabase(h.service.storageDir, "queue-flow")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	params, ok := routeParams(match.endpoint.Route, r.URL.Path)
	if !ok {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Invalid queue route parameters"})
		return
	}
	switch match.customHandler {
	case "join_queue":
		h.joinQueue(w, r, db)
	case "call_next":
		h.callNext(w, r, db)
	case "queue_status":
		h.queueStatus(w, db, params["queue_id"])
	case "my_ticket":
		h.myTicket(w, db, params["queue_id"], params["ticket_number"])
	default:
		writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Queue route handler is not implemented"})
	}
}

func (h *Handler) joinQueue(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	queueID, valid := numericValue(input["queue_id"])
	if !valid || queueID < 1 || math.Trunc(queueID) != queueID {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"queue_id must be a positive integer"}})
		return
	}
	var prefix string
	var average int
	if err := db.QueryRow(`SELECT "prefix", "avg_wait_minutes" FROM "queues" WHERE "id" = ?`, int64(queueID)).Scan(&prefix, &average); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Queue not found"})
		return
	}
	var position int
	if err := db.QueryRow(`SELECT COALESCE(MAX("position"), 0) + 1 FROM "tickets" WHERE "queue_id" = ? AND "status" IN ('waiting','serving')`, int64(queueID)).Scan(&position); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not determine queue position"})
		return
	}
	customer, _ := input["customer_name"].(string)
	if customer == "" {
		customer = "Guest"
	}
	dbColumns, primary, err := inspectColumns(db, "tickets")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not inspect tickets"})
		return
	}
	recordInput := map[string]any{
		"queue_id": int64(queueID), "ticket_number": fmt.Sprintf("%s-%03d", prefix, position),
		"customer_name": customer, "status": "waiting", "position": position,
	}
	prepareTimestamps(recordInput, dbColumns, true)
	record, err := insertRecord(db, quoteIdentifier("tickets"), recordInput, dbColumns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not create queue ticket"})
		return
	}
	h.realtime.BroadcastTo(
		"queue-flow."+strconv.FormatInt(int64(queueID), 10),
		"queue-flow.queue-updated",
		map[string]any{"queue_id": int64(queueID), "action": "joined", "ticket": record},
	)
	writeJSON(w, http.StatusOK, map[string]any{
		"ticket": record, "position": position, "estimated_wait": (position - 1) * average,
	})
}

func (h *Handler) callNext(w http.ResponseWriter, r *http.Request, db *sql.DB) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	queueID, valid := numericValue(input["queue_id"])
	if !valid || queueID < 1 || math.Trunc(queueID) != queueID {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"queue_id must be a positive integer"}})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	if _, err := db.Exec(`UPDATE "tickets" SET "status" = 'done', "served_at" = ? WHERE "queue_id" = ? AND "status" = 'serving'`, now, int64(queueID)); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not finish current ticket"})
		return
	}
	var id int64
	err := db.QueryRow(`SELECT "id" FROM "tickets" WHERE "queue_id" = ? AND "status" = 'waiting' ORDER BY "position" LIMIT 1`, int64(queueID)).Scan(&id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusOK, map[string]any{"message": "No more tickets in queue", "ticket": nil})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not find next ticket"})
		return
	}
	if _, err := db.Exec(`UPDATE "tickets" SET "status" = 'serving', "called_at" = ? WHERE "id" = ?`, now, id); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not call next ticket"})
		return
	}
	record, err := queryOne(db, `SELECT * FROM "tickets" WHERE "id" = ?`, id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load next ticket"})
		return
	}
	h.realtime.BroadcastTo(
		"queue-flow."+strconv.FormatInt(int64(queueID), 10),
		"queue-flow.queue-updated",
		map[string]any{"queue_id": int64(queueID), "action": "called", "ticket": record},
	)
	writeJSON(w, http.StatusOK, map[string]any{"ticket": record})
}

func (h *Handler) queueStatus(w http.ResponseWriter, db *sql.DB, queueID string) {
	queue, err := queryOne(db, `SELECT * FROM "queues" WHERE "id" = ?`, queueID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Queue not found"})
		return
	}
	serving, _ := queryOne(db, `SELECT * FROM "tickets" WHERE "queue_id" = ? AND "status" = 'serving' ORDER BY "position" LIMIT 1`, queueID)
	waitingRows, err := db.Query(`SELECT * FROM "tickets" WHERE "queue_id" = ? AND "status" = 'waiting' ORDER BY "position"`, queueID)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load waiting tickets"})
		return
	}
	waiting, scanErr := scanRecords(waitingRows)
	_ = waitingRows.Close()
	if scanErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not read waiting tickets"})
		return
	}
	var done int
	if err := db.QueryRow(`SELECT COUNT(*) FROM "tickets" WHERE "queue_id" = ? AND "status" = 'done'`, queueID).Scan(&done); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not count completed tickets"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"queue": queue, "serving": serving, "waiting": waiting, "done_count": done, "total_waiting": len(waiting)})
}

func (h *Handler) myTicket(w http.ResponseWriter, db *sql.DB, queueID, ticketNumber string) {
	ticket, err := queryOne(db, `SELECT * FROM "tickets" WHERE "queue_id" = ? AND "ticket_number" = ?`, queueID, ticketNumber)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Ticket not found"})
		return
	}
	var ahead int
	if err := db.QueryRow(`SELECT COUNT(*) FROM "tickets" WHERE "queue_id" = ? AND "status" = 'waiting' AND "position" < ?`, queueID, ticket["position"]).Scan(&ahead); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not determine ticket position"})
		return
	}
	var average int
	_ = db.QueryRow(`SELECT "avg_wait_minutes" FROM "queues" WHERE "id" = ?`, queueID).Scan(&average)
	if average == 0 {
		average = 5
	}
	position := 0
	if ticket["status"] == "waiting" {
		position = ahead + 1
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"ticket": ticket, "position": position, "estimated_wait": ahead * average,
		"is_serving": ticket["status"] == "serving", "is_done": ticket["status"] == "done",
	})
}

func (h *Handler) clearTable(w http.ResponseWriter, table string, match matchedEndpoint) {
	db, err := openModuleDatabase(h.service.storageDir, match.registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()
	if _, err := db.Exec("DELETE FROM " + quoteIdentifier(table)); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not clear records"})
		return
	}
	message := "Runs cleared"
	if table == "event_log" {
		message = "Log cleared"
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": message})
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

func routeParams(pattern, path string) (map[string]string, bool) {
	want := strings.Split(strings.Trim(pattern, "/"), "/")
	got := strings.Split(strings.Trim(path, "/"), "/")
	if len(want) != len(got) {
		return nil, false
	}
	result := make(map[string]string)
	for index, segment := range want {
		value, err := urlPathUnescape(got[index])
		if err != nil {
			return nil, false
		}
		if len(segment) > 2 && segment[0] == '{' && segment[len(segment)-1] == '}' {
			result[segment[1:len(segment)-1]] = value
		} else if segment != value {
			return nil, false
		}
	}
	return result, true
}

func urlPathUnescape(value string) (string, error) {
	return url.PathUnescape(value)
}

func settingValue(db *sql.DB, key, fallback string) string {
	var value string
	if err := db.QueryRow(`SELECT "value" FROM "dtr_settings" WHERE "key" = ?`, key).Scan(&value); err != nil {
		return fallback
	}
	return value
}

func storeSetting(db *sql.DB, key, value string) {
	_, _ = db.Exec(`INSERT INTO "dtr_settings" ("key", "value") VALUES (?, ?) ON CONFLICT("key") DO UPDATE SET "value" = excluded."value"`, key, value)
}

func distanceMeters(latitude, longitude, officeLatitude, officeLongitude float64) float64 {
	const earthRadius = 6371000
	radians := func(degrees float64) float64 { return degrees * math.Pi / 180 }
	dLat := radians(officeLatitude - latitude)
	dLon := radians(officeLongitude - longitude)
	a := math.Sin(dLat/2)*math.Sin(dLat/2) +
		math.Cos(radians(latitude))*math.Cos(radians(officeLatitude))*math.Sin(dLon/2)*math.Sin(dLon/2)
	return earthRadius * 2 * math.Atan2(math.Sqrt(a), math.Sqrt(1-a))
}

func fieldTotalName(field string) string {
	switch field {
	case "basic_pay":
		return "total_basic_pay"
	case "sss_amount":
		return "total_sss"
	case "hdmf_premium":
		return "total_hdmf_premium"
	case "hdmf_mpl":
		return "total_hdmf_mpl"
	default:
		return "total_calamity_loan"
	}
}

func recordNumber(value any) float64 {
	number, _ := numericValue(value)
	if number == 0 {
		if text, ok := value.(string); ok {
			number, _ = strconv.ParseFloat(text, 64)
		}
	}
	return number
}

func validEmail(value string) bool {
	at := strings.LastIndexByte(value, '@')
	return at > 0 && at < len(value)-3 && strings.Contains(value[at+1:], ".")
}

func queryOne(db *sql.DB, query string, args ...any) (map[string]any, error) {
	rows, err := db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	records, scanErr := scanRecords(rows)
	closeErr := rows.Close()
	if scanErr != nil {
		return nil, scanErr
	}
	if closeErr != nil {
		return nil, closeErr
	}
	if len(records) == 0 {
		return nil, sql.ErrNoRows
	}
	return records[0], nil
}
