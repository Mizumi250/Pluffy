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
	case module == "job-test" && match.endpoint.Type == "job_dispatch" && match.operation == "store":
		h.dispatchJob(w, r)
		return true
	case module == "mail-test" && match.endpoint.Type == "mail_send" && match.operation == "store":
		h.simulateMail(w, r, match, "mail-test")
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
		h.fireEvent(w, r)
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

func (h *Handler) dispatchJob(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, valid := input["job"].(string)
	if !valid || (name != "process-data" && name != "heavy-computation" && name != "always-fails") {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{`Field "job" has an unsupported value`},
		})
		return
	}
	resultText := "Data processed successfully (Go synchronous emulation)"
	status := "completed"
	configuredTries := 3
	if name == "heavy-computation" {
		resultText = "Heavy computation completed (Go synchronous emulation)"
		configuredTries = 1
	}
	if name == "always-fails" {
		resultText = "This job always fails (Go synchronous emulation)"
		status = "failed"
		configuredTries = 2
	}
	db, columns, primary, ready := openActionTable(w, h, "job-test", "job_results")
	if !ready {
		return
	}
	defer db.Close()
	now := time.Now().UTC().Format(time.RFC3339Nano)
	recordInput := map[string]any{
		"job_name": name, "status": status, "result": resultText, "processed_at": now,
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("job_results"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record job result"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{
		"data": record, "emulated": true, "configured_tries": configuredTries,
		"queue": map[string]string{"process-data": "default", "heavy-computation": "heavy", "always-fails": "default"}[name],
	})
}

func (h *Handler) simulateMail(w http.ResponseWriter, r *http.Request, match matchedEndpoint, module string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	mail, _ := input["mail"].(string)
	to, _ := input["to"].(string)
	allowed := map[string]string{
		"welcome-mail":       "Welcome to Arkzen",
		"order-confirmation": "Your order has been confirmed",
		"password-reset":     "Reset your password",
	}
	if _, exists := allowed[mail]; !exists || !validEmail(to) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{"mail must be supported and to must be a valid email address"},
		})
		return
	}
	db, columns, primary, ready := openActionTable(w, h, module, "mail_logs")
	if !ready {
		return
	}
	defer db.Close()
	class := strings.ReplaceAll(strings.Title(strings.ReplaceAll(mail, "-", " ")), " ", "")
	recordInput := map[string]any{
		"to_email": to, "subject": allowed[mail], "mail_class": class, "status": "simulated",
		"error": "External email delivery is not performed by the Go engine",
	}
	if module == "body-mail-notification" {
		recordInput["subject"] = mail
		recordInput["kind"] = "mail"
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("mail_logs"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record mail simulation"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record, "emulated": true})
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
		db, columns, primary, ready := openActionTable(w, h, "body-mail-notification", "send_log")
		if !ready {
			return
		}
		defer db.Close()
		recordInput := map[string]any{
			"to_email": to, "subject": mail, "mail_class": mail, "kind": "mail", "status": "simulated",
			"error": "External email delivery is not performed by the Go engine",
		}
		prepareTimestamps(recordInput, columns, true)
		record, err := insertRecord(db, quoteIdentifier("send_log"), recordInput, columns, primary)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record mail simulation"})
			return
		}
		writeJSON(w, http.StatusCreated, map[string]any{"data": record, "emulated": true})
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
	if message == "" {
		message = notification
	}
	db, columns, primary, ready := openActionTable(w, h, "body-mail-notification", "send_log")
	if !ready {
		return
	}
	defer db.Close()
	recordInput := map[string]any{
		"subject": notification, "mail_class": notification, "kind": "notification", "status": "simulated",
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("send_log"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record notification simulation"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record, "message": message, "emulated": true})
}

func (h *Handler) runCommand(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, _ := input["command"].(string)
	outputs := map[string]string{
		"cleanup-temp":    "Cleanup completed successfully.",
		"generate-report": "Report generated successfully.",
		"ping-health":     "Health check passed.",
		"sync-data":       "Data synchronized successfully.",
	}
	output, exists := outputs[name]
	if !exists {
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
	db, columns, primary, ready := openActionTable(w, h, "scheduler-test", "command_runs")
	if !ready {
		return
	}
	defer db.Close()
	recordInput := map[string]any{
		"command_name": name, "signature": "scheduler-test:" + name, "exit_code": 0,
		"output": output, "triggered_by": triggeredBy, "duration_ms": 0,
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, quoteIdentifier("command_runs"), recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record command run"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record, "emulated": true})
}

func (h *Handler) fireEvent(w http.ResponseWriter, r *http.Request) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	event, _ := input["event"].(string)
	listeners := map[string][]string{
		"UserSignedUp": {"SendWelcomeEmail", "UpdateUserStats", "NotifyAdmins"},
		"OrderPlaced":  {"ProcessPayment", "UpdateInventory", "SendOrderConfirmation"},
		"DataExported": {"LogExportActivity", "CleanupTempFiles"},
	}
	names, exists := listeners[event]
	if !exists {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{`Field "event" has an unsupported value`}})
		return
	}
	payload, err := json.Marshal(input["payload"])
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "payload must be JSON serializable"})
		return
	}
	db, columns, primary, ready := openActionTable(w, h, "events-test", "event_log")
	if !ready {
		return
	}
	defer db.Close()
	records := make([]map[string]any, 0, len(names))
	for _, listener := range names {
		recordInput := map[string]any{
			"event_name": event, "listener_name": listener, "status": "completed",
			"payload": string(payload), "duration_ms": 0,
		}
		prepareTimestamps(recordInput, columns, true)
		record, insertErr := insertRecord(db, quoteIdentifier("event_log"), recordInput, columns, primary)
		if insertErr != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record event listener"})
			return
		}
		records = append(records, record)
	}
	writeJSON(w, http.StatusCreated, map[string]any{"event": event, "listeners": names, "data": records, "emulated": true})
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
	db, columns, primary, ready := openActionTable(w, h, "broadcast-test", match.api.Table)
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
	for _, record := range records {
		if id, ok := record[primary].(int64); ok && id > lastID {
			lastID = id
		}
		messages = append(messages, map[string]any{
			"event": "broadcast-test.message-sent-" + channel,
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
	if err := db.QueryRow(`SELECT 1 FROM "employees" WHERE "id" = ? AND "is_active" = 1`, int64(employeeID)).Scan(&employeeExists); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Active employee not found"})
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
		if row["status"] == "inactive" {
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
	if err := db.QueryRow(`SELECT "prefix", "avg_wait_minutes" FROM "queues" WHERE "id" = ? AND "is_active" = 1`, int64(queueID)).Scan(&prefix, &average); err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Active queue not found"})
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
	writeJSON(w, http.StatusOK, map[string]any{
		"ticket": record, "position": position, "estimated_wait": (position - 1) * average,
		"broadcast": map[string]any{"delivered": false, "action": "joined"},
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
	writeJSON(w, http.StatusOK, map[string]any{"ticket": record, "broadcast": map[string]any{"delivered": false, "action": "called"}})
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
