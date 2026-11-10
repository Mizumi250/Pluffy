package backend

import (
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"sort"
	"strconv"
	"strings"
	"time"
)

type jobDefinition struct {
	name    string
	queue   string
	tries   int
	timeout time.Duration
	body    string
}

type queuedJob struct {
	Kind         string         `json:"kind,omitempty"`
	Module       string         `json:"module"`
	Name         string         `json:"name"`
	Data         map[string]any `json:"data"`
	EventName    string         `json:"eventName,omitempty"`
	EventTable   string         `json:"eventTable,omitempty"`
	EventData    map[string]any `json:"eventData,omitempty"`
	ListenerBody string         `json:"listenerBody,omitempty"`
	Tries        int            `json:"tries"`
	Timeout      int            `json:"timeout"`
}

type eventListenerDefinition struct {
	name string
	body string
}

type eventDefinition struct {
	name      string
	listeners []eventListenerDefinition
}

var errGoConsoleBodyUnavailable = errors.New("Go console has no :go body")
var errGoConsoleFallbackUnavailable = errors.New("Go console has no built-in fallback")

func runtimeDSLSections(rawSections []string, allowedFields ...string) []string {
	allowed := make(map[string]struct{}, len(allowedFields))
	for _, field := range allowedFields {
		allowed[field] = struct{}{}
	}
	sections := parseRealtimeSections(rawSections)
	result := make([]string, 0, len(sections))
	for _, section := range sections {
		fields := make([]string, 0, len(section.values))
		for field := range section.values {
			if _, keep := allowed[field]; keep {
				fields = append(fields, field)
			}
		}
		sort.Strings(fields)
		var normalized strings.Builder
		normalized.WriteString(section.name)
		normalized.WriteString(":\n")
		for _, field := range fields {
			normalized.WriteString("  ")
			normalized.WriteString(field)
			normalized.WriteString(": ")
			normalized.WriteString(section.values[field])
			normalized.WriteByte('\n')
		}
		result = append(result, normalized.String())
	}
	return result
}

func jobDefinitions(registration Registration) map[string]jobDefinition {
	definitions := make(map[string]jobDefinition)
	for _, section := range parseRealtimeSections(registration.Jobs) {
		queue := section.values["queue"]
		if queue == "" {
			queue = "default"
		}
		tries, err := strconv.Atoi(section.values["tries"])
		if err != nil || tries < 1 {
			tries = 1
		}
		timeout, err := strconv.Atoi(section.values["timeout"])
		if err != nil || timeout < 1 {
			timeout = 60
		}
		definitions[section.name] = jobDefinition{
			name: section.name, queue: queue, tries: tries, timeout: time.Duration(timeout) * time.Second,
			body: decodeInterpretedBody(section.values["body"]),
		}
	}
	return definitions
}

func eventDefinitions(registration Registration) []eventDefinition {
	listenerBodies := make(map[string]string)
	for _, section := range parseRealtimeSections(registration.Events) {
		if encoded := strings.TrimSpace(section.values["listener_bodies"]); encoded != "" {
			decoded, err := base64.StdEncoding.DecodeString(encoded)
			if err != nil {
				continue
			}
			var encodedBodies map[string]string
			if err := json.Unmarshal(decoded, &encodedBodies); err != nil {
				continue
			}
			for name, body := range encodedBodies {
				bodyBytes, err := base64.StdEncoding.DecodeString(body)
				if err == nil {
					listenerBodies[name] = string(bodyBytes)
				}
			}
		}
	}

	var definitions []eventDefinition
	for _, section := range parseRealtimeSections(registration.Events) {
		rawListeners := strings.TrimSpace(section.values["listeners"])
		rawListeners = strings.TrimPrefix(strings.TrimSuffix(rawListeners, "]"), "[")
		definition := eventDefinition{name: section.name}
		for _, rawName := range strings.Split(rawListeners, ",") {
			name := strings.Trim(strings.TrimSpace(rawName), `"'`)
			if name == "" {
				continue
			}
			definition.listeners = append(definition.listeners, eventListenerDefinition{
				name: name, body: listenerBodies[name],
			})
		}
		definitions = append(definitions, definition)
	}
	return definitions
}

func ensureQueueTables(db *sql.DB) error {
	idType := `INTEGER PRIMARY KEY AUTOINCREMENT`
	timeType := "INTEGER"
	if configuredDialect() == postgresDialect {
		idType = `BIGSERIAL PRIMARY KEY`
		timeType = "BIGINT"
	}
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS "jobs" (
		"id" ` + idType + `,
		"queue" TEXT NOT NULL,
		"payload" TEXT NOT NULL,
		"attempts" INTEGER NOT NULL DEFAULT 0,
		"reserved_at" ` + timeType + ` NULL,
		"available_at" ` + timeType + ` NOT NULL,
		"created_at" ` + timeType + ` NOT NULL
	)`); err != nil {
		return fmt.Errorf("create jobs table: %w", err)
	}
	if _, err := db.Exec(`CREATE INDEX IF NOT EXISTS "jobs_queue_index" ON "jobs" ("queue")`); err != nil {
		return fmt.Errorf("index jobs queue: %w", err)
	}
	if _, err := db.Exec(`CREATE TABLE IF NOT EXISTS "failed_jobs" (
		"id" ` + idType + `,
		"queue" TEXT NOT NULL,
		"payload" TEXT NOT NULL,
		"exception" TEXT NOT NULL,
		"failed_at" TEXT NOT NULL
	)`); err != nil {
		return fmt.Errorf("create failed_jobs table: %w", err)
	}
	return nil
}

func (h *Handler) dispatchQueuedJob(w http.ResponseWriter, registration Registration, name string, data map[string]any) bool {
	definition, exists := jobDefinitions(registration)[name]
	if !exists {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{`Field "job" has an unsupported value`},
		})
		return false
	}
	if strings.TrimSpace(definition.body) == "" {
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": fmt.Sprintf("Go job %q has no :go body to execute", name),
		})
		return false
	}
	payload := queuedJob{
		Kind: "job", Module: registration.Name, Name: name, Data: data,
		Tries: definition.tries, Timeout: int(definition.timeout.Seconds()),
	}
	encoded, err := json.Marshal(payload)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Job data must be valid JSON"})
		return false
	}
	db, err := openModuleDatabase(h.service.storageDir, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return false
	}
	defer db.Close()
	if strings.EqualFold(envOr("QUEUE_CONNECTION", "database"), "sync") {
		jobCtx, cancel := context.WithTimeout(context.Background(), definition.timeout)
		defer cancel()
		if err := h.executeGoJob(jobCtx, registration, payload); err != nil {
			if recordErr := recordFailedJobResult(db, registration, name, err.Error(), time.Now()); recordErr != nil {
				log.Printf("record failed job result for %s:%s: %v", registration.Name, name, recordErr)
			}
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
			return false
		}
		writeJSON(w, http.StatusAccepted, map[string]string{"message": "Job dispatched"})
		return true
	}
	if err := ensureQueueTables(db); err != nil {
		log.Printf("initialize %s queue: %v", registration.Name, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to initialize queue"})
		return false
	}
	now := time.Now().Unix()
	if _, err := db.Exec(`INSERT INTO "jobs" ("queue", "payload", "attempts", "reserved_at", "available_at", "created_at")
		VALUES (?, ?, 0, NULL, ?, ?)`, definition.queue, string(encoded), now, now); err != nil {
		log.Printf("enqueue %s job: %v", name, err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to dispatch job"})
		return false
	}
	writeJSON(w, http.StatusAccepted, map[string]string{"message": "Job dispatched"})
	return true
}

func queueNames(registration Registration) []string {
	names := strings.Split(envOr("QUEUE_NAMES", "default,heavy"), ",")
	seen := make(map[string]struct{}, len(names))
	result := make([]string, 0, len(names))
	appendQueue := func(name string) {
		if name = strings.TrimSpace(name); name != "" {
			if _, exists := seen[name]; exists {
				return
			}
			seen[name] = struct{}{}
			result = append(result, name)
		}
	}
	for _, name := range names {
		appendQueue(name)
	}
	declaredQueues := make([]string, 0)
	for _, definition := range jobDefinitions(registration) {
		declaredQueues = append(declaredQueues, definition.queue)
	}
	sort.Strings(declaredQueues)
	for _, name := range declaredQueues {
		appendQueue(name)
	}
	return result
}

func (h *Handler) StartBackgroundWorkers(ctx context.Context) {
	log.Print("Go database queue worker and cron scheduler started")
	h.backgroundWait.Add(2)
	go h.queueWorker(ctx)
	go h.scheduler(ctx)
}

func (h *Handler) WaitBackgroundWorkers() {
	h.backgroundWait.Wait()
}

func envOr(key, fallback string) string {
	if value := strings.TrimSpace(getenv(key)); value != "" {
		return value
	}
	return fallback
}

func (h *Handler) queueWorker(ctx context.Context) {
	defer h.backgroundWait.Done()
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		if ctx.Err() != nil {
			return
		}
		worked := false
		for _, registration := range h.service.Registrations() {
			if len(jobDefinitions(registration)) == 0 && len(eventDefinitions(registration)) == 0 {
				continue
			}
			for _, queue := range queueNames(registration) {
				worked = h.workQueueOnce(ctx, registration, queue) || worked
			}
		}
		if worked {
			continue
		}
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (h *Handler) workQueueOnce(ctx context.Context, registration Registration, queue string) bool {
	db, err := openModuleDatabase(h.service.storageDir, registration.Name)
	if err != nil {
		log.Printf("open %s queue database: %v", registration.Name, err)
		return false
	}
	defer db.Close()
	var tableExists int
	tableQuery := `SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'jobs'`
	if configuredDialect() == postgresDialect {
		tableQuery = `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = current_schema() AND table_name = 'jobs'`
	}
	if err := db.QueryRow(tableQuery).Scan(&tableExists); err != nil {
		log.Printf("check %s queue table: %v", registration.Name, err)
		return false
	}
	if tableExists == 0 {
		return false
	}
	now := time.Now().Unix()
	staleReservation := now - int64((5*time.Minute)/time.Second)
	tx, err := db.BeginTx(ctx, nil)
	if err != nil {
		log.Printf("begin %s queue transaction: %v", registration.Name, err)
		return false
	}
	defer tx.Rollback()
	var id int64
	var rawPayload string
	var attempts int
	selectJob := `SELECT "id", "payload", "attempts" FROM "jobs"
		WHERE "queue" = ? AND ("reserved_at" IS NULL OR "reserved_at" < ?) AND "available_at" <= ?
		ORDER BY "id" LIMIT 1`
	if configuredDialect() == postgresDialect {
		selectJob += " FOR UPDATE SKIP LOCKED"
	}
	err = tx.QueryRowContext(ctx, selectJob, queue, staleReservation, now).Scan(&id, &rawPayload, &attempts)
	if errors.Is(err, sql.ErrNoRows) {
		return false
	}
	if err != nil {
		log.Printf("read %s queue job: %v", registration.Name, err)
		return false
	}
	result, err := tx.ExecContext(ctx, `UPDATE "jobs" SET "reserved_at" = ?, "attempts" = ?
		WHERE "id" = ? AND ("reserved_at" IS NULL OR "reserved_at" < ?)`, now, attempts+1, id, staleReservation)
	if err != nil {
		log.Printf("reserve %s queue job: %v", registration.Name, err)
		return false
	}
	claimed, err := result.RowsAffected()
	if err != nil || claimed == 0 {
		return false
	}
	if err := tx.Commit(); err != nil {
		log.Printf("claim %s queue job: %v", registration.Name, err)
		return false
	}

	var payload queuedJob
	if err := json.Unmarshal([]byte(rawPayload), &payload); err != nil {
		h.failQueuedJob(db, queue, id, rawPayload, attempts+1, 1, err)
		return true
	}
	kind := payload.Kind
	if kind == "" {
		kind = "job"
	}
	definition, exists := jobDefinitions(registration)[payload.Name]
	timeout := time.Duration(payload.Timeout) * time.Second
	tries := payload.Tries
	if kind == "job" {
		if !exists {
			h.failQueuedJob(db, queue, id, rawPayload, attempts+1, tries, fmt.Errorf("unknown job %q", payload.Name))
			return true
		}
		if timeout <= 0 {
			timeout = definition.timeout
		}
		if tries < 1 {
			tries = definition.tries
		}
	} else if kind == "event_listener" {
		if timeout <= 0 {
			timeout = 60 * time.Second
		}
		if tries < 1 {
			tries = 3
		}
	} else {
		h.failQueuedJob(db, queue, id, rawPayload, attempts+1, tries, fmt.Errorf("unknown queue work kind %q", kind))
		return true
	}
	jobCtx, cancel := context.WithTimeout(ctx, timeout)
	if kind == "event_listener" {
		err = h.executeGoEventListener(jobCtx, registration, payload)
	} else {
		err = h.executeGoJob(jobCtx, registration, payload)
	}
	cancel()
	if errors.Is(err, context.Canceled) && ctx.Err() != nil {
		_, releaseErr := db.Exec(`UPDATE "jobs" SET "reserved_at" = NULL, "available_at" = ? WHERE "id" = ?`, time.Now().Unix(), id)
		if releaseErr != nil {
			log.Printf("release interrupted %s job: %v", payload.Name, releaseErr)
		}
		return true
	}
	if err == nil {
		_, err = db.Exec(`DELETE FROM "jobs" WHERE "id" = ?`, id)
		if err != nil {
			log.Printf("delete completed %s job: %v", payload.Name, err)
		} else {
			log.Printf("Processed %s (%s)", payload.Name, registration.Name)
		}
		return true
	}
	if attempts+1 >= tries {
		h.failQueuedJob(db, queue, id, rawPayload, attempts+1, tries, err)
		if kind == "job" {
			if recordErr := recordFailedJobResult(db, registration, payload.Name, err.Error(), time.Now()); recordErr != nil {
				log.Printf("record failed job result for %s:%s: %v", registration.Name, payload.Name, recordErr)
			}
		}
		return true
	}
	if _, updateErr := db.Exec(`UPDATE "jobs" SET "reserved_at" = NULL, "available_at" = ? WHERE "id" = ?`,
		time.Now().Add(5*time.Second).Unix(), id); updateErr != nil {
		log.Printf("schedule retry for %s job: %v", payload.Name, updateErr)
	} else {
		log.Printf("Retrying %s (attempt %d/%d): %v", payload.Name, attempts+1, tries, err)
	}
	return true
}

func (h *Handler) failQueuedJob(db *sql.DB, queue string, id int64, payload string, attempts, tries int, cause error) {
	if _, err := db.Exec(`INSERT INTO "failed_jobs" ("queue", "payload", "exception", "failed_at")
		VALUES (?, ?, ?, ?)`, queue, payload, cause.Error(), time.Now().UTC().Format(time.RFC3339Nano)); err != nil {
		log.Printf("record failed queue job: %v", err)
		return
	}
	if _, err := db.Exec(`DELETE FROM "jobs" WHERE "id" = ?`, id); err != nil {
		log.Printf("delete failed queue job: %v", err)
	}
	log.Printf("Failed job after %d attempt(s): %v (configured tries: %d)", attempts, cause, tries)
}

func (h *Handler) executeGoJob(ctx context.Context, registration Registration, payload queuedJob) error {
	definition, exists := jobDefinitions(registration)[payload.Name]
	if !exists || strings.TrimSpace(definition.body) == "" {
		return fmt.Errorf("Go job body %q is unavailable in module %q", payload.Name, registration.Name)
	}
	runtime, err := h.service.moduleRuntimeFor(registration.Name)
	if err != nil {
		return fmt.Errorf("initialize Go job runtime for %q: %w", registration.Name, err)
	}
	return runtime.ExecuteJob(ctx, payload.Name, payload.Data, registration)
}

func (h *Handler) executeGoEventListener(ctx context.Context, registration Registration, payload queuedJob) error {
	if payload.Module != registration.Name || payload.Kind != "event_listener" || payload.Name == "" {
		return fmt.Errorf("Go event listener is unavailable for %s:%s", payload.Module, payload.Name)
	}
	if err := ctx.Err(); err != nil {
		return err
	}
	found := false
	for _, event := range eventDefinitions(registration) {
		if normalizeEventIdentifier(event.name) != normalizeEventIdentifier(payload.EventName) {
			continue
		}
		for _, listener := range event.listeners {
			if listener.name == payload.Name && listener.body == payload.ListenerBody {
				found = true
				break
			}
		}
	}
	if !found {
		return fmt.Errorf("listener %q is not declared for event %q", payload.Name, payload.EventName)
	}
	runtime, err := h.service.moduleRuntimeFor(registration.Name)
	if err != nil {
		return fmt.Errorf("initialize Go listener runtime for %q: %w", payload.Name, err)
	}
	for _, event := range eventDefinitions(registration) {
		if normalizeEventIdentifier(event.name) == normalizeEventIdentifier(payload.EventName) {
			return runtime.ExecuteListener(ctx, event.name, payload.Name, payload.EventData, registration)
		}
	}
	return fmt.Errorf("event %q is no longer declared for listener %q", payload.EventName, payload.Name)
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

func recordFailedJobResult(db *sql.DB, registration Registration, name, result string, processedAt time.Time) error {
	table := ""
	for _, api := range registration.APIs {
		if api.Model == "JobResult" {
			table = api.Table
			break
		}
	}
	if table == "" {
		return nil
	}
	columns, primary, err := inspectColumns(db, table)
	if err != nil {
		return err
	}
	input := map[string]any{"job_name": name, "status": "failed", "result": result, "processed_at": processedAt.UTC().Format(time.RFC3339Nano)}
	prepareTimestamps(input, columns, true)
	_, err = insertRecord(db, quoteIdentifier(table), input, columns, primary)
	return err
}

func (h *Handler) scheduler(ctx context.Context) {
	defer h.backgroundWait.Done()
	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()
	for {
		if ctx.Err() != nil {
			return
		}
		h.runScheduledCommandsAt(time.Now())
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
		}
	}
}

func (h *Handler) runScheduledCommandsAt(now time.Time) {
	for _, registration := range h.service.Registrations() {
		for _, section := range parseRealtimeSections(registration.Consoles) {
			expression := section.values["schedule"]
			if expression == "" || !cronMatches(expression, now) {
				continue
			}
			minute := now.Format("2006-01-02T15:04")
			key := registration.Name + ":" + section.name
			h.scheduleMu.Lock()
			if h.scheduledMinutes[key] == minute {
				h.scheduleMu.Unlock()
				continue
			}
			h.scheduledMinutes[key] = minute
			h.scheduleMu.Unlock()
			if err := h.executeGoConsole(context.Background(), registration, section.name, "schedule"); err != nil {
				log.Printf("scheduled command %s failed: %v", key, err)
			} else {
				log.Printf("Scheduled command completed: %s", key)
			}
		}
	}
}

func cronMatches(expression string, now time.Time) bool {
	fields := strings.Fields(expression)
	if len(fields) != 5 {
		return false
	}
	values := []int{now.Minute(), now.Hour(), now.Day(), int(now.Month()), int(now.Weekday())}
	mins := []int{0, 0, 1, 1, 0}
	maxs := []int{59, 23, 31, 12, 6}
	for index, field := range fields {
		if !cronFieldMatches(field, values[index], mins[index], maxs[index]) {
			return false
		}
	}
	return true
}

func cronFieldMatches(expression string, value, minimum, maximum int) bool {
	for _, part := range strings.Split(expression, ",") {
		stepParts := strings.Split(part, "/")
		step := 1
		if len(stepParts) == 2 {
			parsed, err := strconv.Atoi(stepParts[1])
			if err != nil || parsed < 1 {
				continue
			}
			step = parsed
		} else if len(stepParts) != 1 {
			continue
		}
		from, to := minimum, maximum
		switch {
		case stepParts[0] == "*":
		case strings.Contains(stepParts[0], "-"):
			bounds := strings.Split(stepParts[0], "-")
			if len(bounds) != 2 {
				continue
			}
			var err error
			from, err = strconv.Atoi(bounds[0])
			if err != nil {
				continue
			}
			to, err = strconv.Atoi(bounds[1])
			if err != nil {
				continue
			}
		default:
			parsed, err := strconv.Atoi(stepParts[0])
			if err != nil {
				continue
			}
			from, to = parsed, parsed
		}
		if from < minimum || to > maximum || from > to || value < from || value > to {
			continue
		}
		if (value-from)%step == 0 {
			return true
		}
	}
	return false
}

func (h *Handler) executeGoConsole(ctx context.Context, registration Registration, name, triggeredBy string) error {
	var body string
	for _, section := range parseRealtimeSections(registration.Consoles) {
		if section.name == name {
			body = decodeInterpretedBody(section.values["body"])
			break
		}
	}
	if strings.TrimSpace(body) == "" {
		_, err := recordCommandRun(h.service.storageDir, registration.Name, name, triggeredBy)
		if errors.Is(err, errGoConsoleFallbackUnavailable) {
			return fmt.Errorf("%w: %q", errGoConsoleBodyUnavailable, name)
		}
		return err
	}
	runtime, err := h.service.moduleRuntimeFor(registration.Name)
	if err != nil {
		return fmt.Errorf("initialize Go console runtime for %q: %w", registration.Name, err)
	}
	return runtime.ExecuteConsole(ctx, name, map[string]any{"triggered_by": triggeredBy}, registration)
}

func recordCommandRun(storageDir, module, name, triggeredBy string) (map[string]any, error) {
	outputs := map[string]string{
		"cleanup-temp":    "Cleanup completed successfully.",
		"generate-report": "Daily report generated successfully.",
		"ping-health":     "All services healthy.",
		"sync-data":       "Data synced successfully.",
	}
	output, exists := outputs[name]
	if !exists {
		return nil, fmt.Errorf("%w: %q", errGoConsoleFallbackUnavailable, name)
	}
	db, err := openModuleDatabase(storageDir, module)
	if err != nil {
		return nil, err
	}
	defer db.Close()
	columns, primary, err := inspectColumns(db, "command_runs")
	if err != nil {
		return nil, err
	}
	input := map[string]any{
		"command_name": name, "signature": module + ":" + name, "exit_code": 0,
		"output": output, "triggered_by": triggeredBy, "duration_ms": int64(0),
	}
	prepareTimestamps(input, columns, true)
	return insertRecord(db, quoteIdentifier("command_runs"), input, columns, primary)
}

func getenv(key string) string {
	return os.Getenv(key)
}
