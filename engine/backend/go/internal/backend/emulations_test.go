package backend

import (
	"bytes"
	"context"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/gorilla/websocket"
)

func TestAsyncAndRealtimeModuleEmulations(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	builds := []string{
		`{"name":"job-test","backendVariant":"go","jobs":["process-data:\n  queue: default\n  tries: 3\n  timeout: 30","heavy-computation:\n  queue: heavy\n  tries: 1\n  timeout: 120","always-fails:\n  queue: default\n  tries: 2\n  timeout: 10"],"databases":[{"table":"job_results","columns":{"job_name":{"type":"string","nullable":false},"status":{"type":"string","nullable":false},"result":{"type":"text"},"processed_at":{"type":"datetime"}}}],"apis":[{"model":"JobResult","controller":"JobResultController","prefix":"/api/job-test","endpoints":{"store":{"method":"POST","route":"/dispatch","type":"job_dispatch"}}}]}`,
		`{"name":"scheduler-test","backendVariant":"go","consoles":["ping-health:\n  schedule: '0 8 * * *'"],"databases":[{"table":"command_runs","columns":{"command_name":{"type":"string","nullable":false},"signature":{"type":"string","nullable":false},"exit_code":{"type":"integer","default":0},"output":{"type":"text"},"triggered_by":{"type":"string","default":"manual"},"duration_ms":{"type":"integer"}}}],"apis":[{"model":"CommandRun","controller":"CommandRunController","prefix":"/api/scheduler-test","endpoints":{"store":{"method":"POST","route":"/run","type":"command_run"},"destroy":{"method":"DELETE","route":"/runs","response":{"type":"message","value":"Runs cleared"}}}}]}`,
		fmt.Sprintf(`{"name":"events-test","backendVariant":"go","events":%s,"databases":[{"table":"event_log","columns":{"event_name":{"type":"string","nullable":false},"listener_name":{"type":"string","nullable":false},"status":{"type":"string","default":"completed"},"payload":{"type":"text"},"duration_ms":{"type":"integer"}}}],"apis":[{"model":"EventLog","controller":"EventLogController","prefix":"/api/events-test","endpoints":{"store":{"method":"POST","route":"/fire","type":"event_fire"},"clearLog":{"method":"POST","route":"/log/clear","response":{"type":"message","value":"Log cleared"}}}}]}`, testEventSectionsJSON(t)),
		`{"name":"broadcast-test","backendVariant":"go","auth":true,"authSeed":{"users":[{"name":"Broadcast User","email":"broadcast@arkzen.local","password":"password"}]},"databases":[{"table":"messages","columns":{"user_id":{"type":"integer"},"content":{"type":"string","nullable":false},"channel_type":{"type":"string"}}}],"apis":[{"model":"Message","controller":"MessageController","prefix":"/api/broadcast-test/messages","endpoints":{"store":{"method":"POST","route":"/","type":"broadcast"}}}],"realtimes":["broadcast-test-public:\n  type: public","broadcast-test.{id}:\n  type: private","message-sent-private:\n  channel: broadcast-test.{id}\n  type: private","broadcast-test-presence:\n  type: presence","message-sent-presence:\n  channel: broadcast-test-presence\n  type: presence","message-sent-public:\n  channel: broadcast-test-public\n  type: public"]}`,
	}
	for _, build := range builds {
		if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
			t.Fatalf("build failed: status %d, response %s", response.Code, response.Body.String())
		}
	}

	workerContext, stopWorker := context.WithCancel(context.Background())
	defer func() {
		stopWorker()
		handler.WaitBackgroundWorkers()
	}()
	job := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"process-data"}`, "")
	if job.Code != http.StatusAccepted || !bytes.Contains(job.Body.Bytes(), []byte(`"Job dispatched"`)) {
		t.Fatalf("job dispatch status %d: %s", job.Code, job.Body.String())
	}
	handler.StartBackgroundWorkers(workerContext)
	waitForJobResult(t, handler, "process-data", "completed", 8*time.Second)
	heavyJob := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"heavy-computation"}`, "")
	if heavyJob.Code != http.StatusAccepted {
		t.Fatalf("heavy-job dispatch status %d: %s", heavyJob.Code, heavyJob.Body.String())
	}
	waitForJobResult(t, handler, "heavy-computation", "completed", 8*time.Second)
	jobDB, err := openModuleDatabase(storage, "job-test")
	if err != nil {
		t.Fatal(err)
	}
	if err := ensureQueueTables(jobDB); err != nil {
		t.Fatal(err)
	}
	_ = jobDB.Close()
	invalidJob := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"arbitrary"}`, "")
	if invalidJob.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported job status = %d, body = %s", invalidJob.Code, invalidJob.Body.String())
	}
	failedJob := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"always-fails"}`, "")
	if failedJob.Code != http.StatusAccepted {
		t.Fatalf("failed-job dispatch status %d: %s", failedJob.Code, failedJob.Body.String())
	}
	waitForJobResult(t, handler, "always-fails", "failed", 10*time.Second)
	var failedJobs int
	jobDB, err = openModuleDatabase(storage, "job-test")
	if err != nil {
		t.Fatal(err)
	}
	if err := jobDB.QueryRow(`SELECT COUNT(*) FROM "failed_jobs"`).Scan(&failedJobs); err != nil || failedJobs != 1 {
		t.Fatalf("failed queue records = %d, error = %v", failedJobs, err)
	}
	var pendingJobs int
	if err := jobDB.QueryRow(`SELECT COUNT(*) FROM "jobs"`).Scan(&pendingJobs); err != nil || pendingJobs != 0 {
		t.Fatalf("pending queue records = %d, error = %v", pendingJobs, err)
	}
	_ = jobDB.Close()

	scheduledAt := time.Date(2026, time.January, 1, 8, 0, 0, 0, time.Local)
	if !cronMatches("0 8 * * *", scheduledAt) || cronMatches("0 9 * * *", scheduledAt) {
		t.Fatal("cron matcher did not honor the configured hour")
	}
	handler.runScheduledCommandsAt(scheduledAt)
	schedulerDB, err := openModuleDatabase(storage, "scheduler-test")
	if err != nil {
		t.Fatal(err)
	}
	var scheduledCount int
	if err := schedulerDB.QueryRow(`SELECT COUNT(*) FROM "command_runs" WHERE "triggered_by" = 'schedule'`).Scan(&scheduledCount); err != nil || scheduledCount != 1 {
		t.Fatalf("scheduled command runs = %d, error = %v", scheduledCount, err)
	}
	_ = schedulerDB.Close()
	command := perform(handler, http.MethodPost, "/api/scheduler-test/run", `{"command":"generate-report","triggered_by":"schedule"}`, "")
	if command.Code != http.StatusCreated || !bytes.Contains(command.Body.Bytes(), []byte(`"signature":"scheduler-test:generate-report"`)) {
		t.Fatalf("command emulation status %d: %s", command.Code, command.Body.String())
	}

	if response := perform(handler, http.MethodPost, "/api/scheduler-test/run", `{"command":"arbitrary shell"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported command status = %d, body = %s", response.Code, response.Body.String())
	}
	if response := perform(handler, http.MethodDelete, "/api/scheduler-test/runs", "", ""); response.Code != http.StatusOK {
		t.Fatalf("clear scheduler runs status = %d, body = %s", response.Code, response.Body.String())
	}

	for _, testCase := range []struct {
		input     string
		eventName string
		listeners int
	}{
		{`{"event":"user-signed-up","payload":{"user_id":1}}`, "UserSignedUp", 3},
		{`{"event":"OrderPlaced","payload":{"order_id":7}}`, "OrderPlaced", 3},
		{`{"event":"data-exported","payload":{"export_id":"EXP-1"}}`, "DataExported", 2},
	} {
		event := perform(handler, http.MethodPost, "/api/events-test/fire", testCase.input, "")
		if event.Code != http.StatusAccepted || !bytes.Contains(event.Body.Bytes(), []byte(`"message":"Event fired"`)) {
			t.Fatalf("event emulation status %d: %s", event.Code, event.Body.String())
		}
		waitForEventListeners(t, handler, storage, testCase.eventName, testCase.listeners)
	}
	if response := perform(handler, http.MethodPost, "/api/events-test/fire", `{"event":"arbitrary"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported event status = %d, body = %s", response.Code, response.Body.String())
	}
	if response := perform(handler, http.MethodPost, "/api/events-test/fire", `{"event":"order-placed","payload":"invalid"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("invalid event payload status = %d, body = %s", response.Code, response.Body.String())
	}
	eventDB, err := openModuleDatabase(storage, "events-test")
	if err != nil {
		t.Fatal(err)
	}
	var payload string
	if err := eventDB.QueryRow(`SELECT "payload" FROM "event_log" WHERE "event_name" = 'OrderPlaced' LIMIT 1`).Scan(&payload); err != nil ||
		!strings.Contains(payload, `"order_id":7`) {
		t.Fatalf("event payload was not propagated: %q, error = %v", payload, err)
	}
	_ = eventDB.Close()
	stopWorker()
	handler.WaitBackgroundWorkers()
	if response := perform(handler, http.MethodPost, "/api/events-test/log/clear", "", ""); response.Code != http.StatusOK {
		t.Fatalf("clear event log status = %d, body = %s", response.Code, response.Body.String())
	}

	message := perform(handler, http.MethodPost, "/api/broadcast-test/messages/", `{"content":"Hello","channel_type":"public"}`, "")
	if message.Code != http.StatusCreated || !bytes.Contains(message.Body.Bytes(), []byte(`"delivered":false`)) {
		t.Fatalf("broadcast emulation status %d: %s", message.Code, message.Body.String())
	}
	login := perform(handler, http.MethodPost, "/api/broadcast-test/auth/login",
		`{"email":"broadcast@arkzen.local","password":"password"}`, "")
	var loginBody struct {
		Token string   `json:"token"`
		User  authUser `json:"user"`
	}
	if login.Code != http.StatusOK || json.Unmarshal(login.Body.Bytes(), &loginBody) != nil || loginBody.Token == "" {
		t.Fatalf("broadcast auth login status %d: %s", login.Code, login.Body.String())
	}

	realtimeServer := httptest.NewServer(handler.realtime)
	defer realtimeServer.Close()
	realtimeURL := "ws" + strings.TrimPrefix(realtimeServer.URL, "http") + "/app/arkzen-key"
	socket, _, err := websocket.DefaultDialer.Dial(realtimeURL, nil)
	if err != nil {
		t.Fatalf("connect Go realtime websocket: %v", err)
	}
	defer socket.Close()
	_ = socket.SetReadDeadline(time.Now().Add(2 * time.Second))
	var realtimeEvent struct {
		Event   string `json:"event"`
		Channel string `json:"channel"`
		Data    string `json:"data"`
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil || realtimeEvent.Event != "pusher:connection_established" {
		t.Fatalf("realtime connection event = %#v, error = %v", realtimeEvent, err)
	}
	var connectionData struct {
		SocketID string `json:"socket_id"`
	}
	if err := json.Unmarshal([]byte(realtimeEvent.Data), &connectionData); err != nil || connectionData.SocketID == "" {
		t.Fatalf("invalid realtime connection data %q: %v", realtimeEvent.Data, err)
	}
	if err := socket.WriteJSON(map[string]any{
		"event": "pusher:subscribe", "data": map[string]any{"channel": "broadcast-test-public"},
	}); err != nil {
		t.Fatal(err)
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "pusher_internal:subscription_succeeded" ||
		realtimeEvent.Channel != "broadcast-test-public" {
		t.Fatalf("public subscription event = %#v, error = %v", realtimeEvent, err)
	}
	liveMessage := perform(handler, http.MethodPost, "/api/broadcast-test/messages/",
		`{"content":"Live message","channel_type":"public"}`, "")
	if liveMessage.Code != http.StatusCreated {
		t.Fatalf("live public broadcast status %d: %s", liveMessage.Code, liveMessage.Body.String())
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil || realtimeEvent.Event != "broadcast-test.message-sent-public" {
		t.Fatalf("live broadcast event = %#v, error = %v", realtimeEvent, err)
	}
	var livePayload map[string]any
	if err := json.Unmarshal([]byte(realtimeEvent.Data), &livePayload); err != nil || livePayload["content"] != "Live message" {
		t.Fatalf("live broadcast payload = %#v, error = %v", livePayload, err)
	}

	authorize := func(channel string) map[string]any {
		t.Helper()
		body, err := json.Marshal(map[string]string{"socket_id": connectionData.SocketID, "channel_name": channel})
		if err != nil {
			t.Fatal(err)
		}
		authRequest := httptest.NewRequest(http.MethodPost, "/api/broadcast-test/auth/broadcasting/auth", bytes.NewReader(body))
		authRequest.Header.Set("Authorization", "Bearer "+loginBody.Token)
		authResponse := httptest.NewRecorder()
		handler.ServeHTTP(authResponse, authRequest)
		var result map[string]any
		if authResponse.Code != http.StatusOK || json.Unmarshal(authResponse.Body.Bytes(), &result) != nil || result["auth"] == nil {
			t.Fatalf("broadcast channel authorization status %d: %s", authResponse.Code, authResponse.Body.String())
		}
		return result
	}
	privateChannel := "private-broadcast-test." + fmt.Sprint(loginBody.User.ID)
	privateAuthorization := authorize(privateChannel)
	if err := socket.WriteJSON(map[string]any{
		"event": "pusher:subscribe",
		"data":  map[string]any{"channel": privateChannel, "auth": privateAuthorization["auth"]},
	}); err != nil {
		t.Fatal(err)
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "pusher_internal:subscription_succeeded" ||
		realtimeEvent.Channel != privateChannel {
		t.Fatalf("private subscription event = %#v, error = %v", realtimeEvent, err)
	}
	presenceChannel := "presence-broadcast-test-presence"
	presenceAuthorization := authorize(presenceChannel)
	channelData, ok := presenceAuthorization["channel_data"].(string)
	if !ok || channelData == "" {
		t.Fatalf("presence authorization missing channel data: %#v", presenceAuthorization)
	}
	if err := socket.WriteJSON(map[string]any{
		"event": "pusher:subscribe",
		"data": map[string]any{
			"channel": presenceChannel, "auth": presenceAuthorization["auth"], "channel_data": channelData,
		},
	}); err != nil {
		t.Fatal(err)
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "pusher_internal:subscription_succeeded" ||
		realtimeEvent.Channel != presenceChannel {
		t.Fatalf("presence subscription event = %#v, error = %v", realtimeEvent, err)
	}
	var presenceMembers map[string]any
	if err := json.Unmarshal([]byte(realtimeEvent.Data), &presenceMembers); err != nil ||
		!bytes.Contains([]byte(realtimeEvent.Data), []byte(`"count":1`)) {
		t.Fatalf("presence member response = %#v, error = %v", presenceMembers, err)
	}

	for _, channel := range []string{"public", "private", "presence"} {
		poll := httptest.NewRequest(http.MethodGet, "/api/broadcast-test/sse-poll/"+channel+"?after_id=0", nil)
		if channel != "public" {
			poll.Header.Set("Authorization", "Bearer "+loginBody.Token)
		}
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, poll)
		if response.Code != http.StatusOK ||
			!bytes.Contains(response.Body.Bytes(), []byte(`"messages":`)) ||
			!bytes.Contains(response.Body.Bytes(), []byte(`"last_id":`)) {
			t.Fatalf("%s broadcast poll status %d: %s", channel, response.Code, response.Body.String())
		}
	}

	privateWithoutAuth := perform(handler, http.MethodPost, "/api/broadcast-test/messages/",
		`{"content":"Private hello","channel_type":"private"}`, "")
	if privateWithoutAuth.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated private broadcast status %d: %s", privateWithoutAuth.Code, privateWithoutAuth.Body.String())
	}
	privateRequest := httptest.NewRequest(http.MethodPost, "/api/broadcast-test/messages/",
		bytes.NewBufferString(`{"content":"Private hello","channel_type":"private"}`))
	privateRequest.Header.Set("Authorization", "Bearer "+loginBody.Token)
	privateResponse := httptest.NewRecorder()
	handler.ServeHTTP(privateResponse, privateRequest)
	if privateResponse.Code != http.StatusCreated {
		t.Fatalf("authenticated private broadcast status %d: %s", privateResponse.Code, privateResponse.Body.String())
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "broadcast-test.message-sent-private" ||
		realtimeEvent.Channel != privateChannel {
		t.Fatalf("live private broadcast event = %#v, error = %v", realtimeEvent, err)
	}
	privatePoll := httptest.NewRequest(http.MethodGet, "/api/broadcast-test/sse-poll/private?after_id=0", nil)
	privatePoll.Header.Set("Authorization", "Bearer "+loginBody.Token)
	privatePollResponse := httptest.NewRecorder()
	handler.ServeHTTP(privatePollResponse, privatePoll)
	if privatePollResponse.Code != http.StatusOK ||
		!bytes.Contains(privatePollResponse.Body.Bytes(), []byte(`"event":"broadcast-test.message-sent-private"`)) ||
		!bytes.Contains(privatePollResponse.Body.Bytes(), []byte(`"content":"Private hello"`)) {
		t.Fatalf("private broadcast poll status %d: %s", privatePollResponse.Code, privatePollResponse.Body.String())
	}
	presenceRequest := httptest.NewRequest(http.MethodPost, "/api/broadcast-test/messages/",
		bytes.NewBufferString(`{"content":"Presence hello","channel_type":"presence"}`))
	presenceRequest.Header.Set("Authorization", "Bearer "+loginBody.Token)
	presenceResponse := httptest.NewRecorder()
	handler.ServeHTTP(presenceResponse, presenceRequest)
	if presenceResponse.Code != http.StatusCreated {
		t.Fatalf("authenticated presence broadcast status %d: %s", presenceResponse.Code, presenceResponse.Body.String())
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "broadcast-test.message-sent-presence" ||
		realtimeEvent.Channel != presenceChannel {
		t.Fatalf("live presence broadcast event = %#v, error = %v", realtimeEvent, err)
	}
}

func testEventSectionsJSON(t *testing.T) string {
	t.Helper()
	definitions := []struct {
		name      string
		listeners []string
		event     string
	}{
		{"user-signed-up", []string{"SendWelcomeEmail", "UpdateUserStats", "NotifyAdmins"}, "UserSignedUp"},
		{"order-placed", []string{"ProcessPayment", "UpdateInventory", "SendOrderConfirmation"}, "OrderPlaced"},
		{"data-exported", []string{"LogExportActivity", "CleanupTempFiles"}, "DataExported"},
	}
	sections := make([]string, 0, len(definitions))
	for _, definition := range definitions {
		listenerBodies := make(map[string]string, len(definition.listeners))
		for _, listener := range definition.listeners {
			body := fmt.Sprintf(`started := time.Now()
if _, err := EventLog.Create(ctx, map[string]any{
    "event_name": %q, "listener_name": %q,
    "status": "completed", "payload": event.Data,
    "duration_ms": time.Since(started).Milliseconds(),
}); err != nil {
    return err
}`, definition.event, listener)
			listenerBodies[listener] = base64.StdEncoding.EncodeToString([]byte(body))
		}
		encodedBodies, err := json.Marshal(listenerBodies)
		if err != nil {
			t.Fatal(err)
		}
		bodyMap := base64.StdEncoding.EncodeToString(encodedBodies)
		sections = append(sections, fmt.Sprintf("%s:\n  listeners: [%s]\n  listener_bodies: '%s'",
			definition.name, strings.Join(definition.listeners, ", "), bodyMap))
	}
	encodedSections, err := json.Marshal(sections)
	if err != nil {
		t.Fatal(err)
	}
	return string(encodedSections)
}

func testMailSectionsJSON(t *testing.T) string {
	t.Helper()
	definitions := []struct {
		name, subject, body string
	}{
		{
			"welcome-mail", "Welcome to Arkzen",
			`<p>Welcome, {{ index . "username" }}!</p><p>Thanks for joining {{ index . "app_name" }}.</p>`,
		},
		{
			"order-confirmation", "Your order has been confirmed",
			`<p>Hi {{ index . "customer_name" }},</p><p>Your order {{ index . "order_id" }} has been confirmed.</p><p>Total: {{ index . "total" }}</p>`,
		},
		{
			"password-reset", "Reset your password",
			`<p>Use this link to reset your password:</p><p><a href="{{ index . "reset_url" }}">Reset password</a></p>`,
		},
	}
	sections := make([]string, 0, len(definitions))
	for _, definition := range definitions {
		sections = append(sections, fmt.Sprintf("%s:\n  subject: %q\n  blade_body: '%s'",
			definition.name, definition.subject, base64.StdEncoding.EncodeToString([]byte(definition.body))))
	}
	encodedSections, err := json.Marshal(sections)
	if err != nil {
		t.Fatal(err)
	}
	return string(encodedSections)
}

func waitForEventListeners(t *testing.T, handler *Handler, storage, eventName string, expected int) {
	t.Helper()
	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		db, err := openModuleDatabase(storage, "events-test")
		if err != nil {
			t.Fatal(err)
		}
		var count int
		err = db.QueryRow(`SELECT COUNT(*) FROM "event_log" WHERE "event_name" = ?`, eventName).Scan(&count)
		_ = db.Close()
		if err != nil {
			t.Fatal(err)
		}
		if count == expected {
			return
		}
		time.Sleep(25 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %d %s listeners", expected, eventName)
}

func waitForJobResult(t *testing.T, handler *Handler, name, status string, timeout time.Duration) {
	t.Helper()
	deadline := time.Now().Add(timeout)
	for time.Now().Before(deadline) {
		db, err := openModuleDatabase(handler.service.storageDir, "job-test")
		if err != nil {
			t.Fatal(err)
		}
		var count int
		err = db.QueryRow(`SELECT COUNT(*) FROM "job_results" WHERE "job_name" = ? AND "status" = ?`, name, status).Scan(&count)
		_ = db.Close()
		if err == nil && count > 0 {
			return
		}
		time.Sleep(100 * time.Millisecond)
	}
	t.Fatalf("timed out waiting for %s job status %s", name, status)
}

func TestDTRGeofencingGoHandlers(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	closeTestModuleRuntime(t, handler, "dtr-geofencing")
	build := `{
		"name":"dtr-geofencing","backendVariant":"go",
		"databases":[
			{"table":"employees","columns":{"name":{"type":"string"},"email":{"type":"string"},"is_active":{"type":"boolean","default":true}}},
			{"table":"time_records","columns":{"employee_id":{"type":"integer"},"type":{"type":"string"},"timestamp":{"type":"datetime"},"latitude":{"type":"decimal"},"longitude":{"type":"decimal"},"within_geofence":{"type":"boolean"},"notes":{"type":"text"}}},
			{"table":"dtr_settings","columns":{"key":{"type":"string","unique":true},"value":{"type":"text"}}}
		],
		"apis":[
			{"model":"Employee","controller":"EmployeeController","prefix":"/api/dtr","endpoints":{"index":{"method":"GET","route":"/employees"}}},
			{"model":"TimeRecord","controller":"TimeRecordController","prefix":"/api/dtr","endpoints":{
				"my_records":{"method":"GET","route":"/my-records/{employee_id}"},
				"check_in":{"method":"POST","route":"/check-in"},
				"check_out":{"method":"POST","route":"/check-out"}
			}},
			{"model":"DtrSetting","controller":"DtrSettingController","prefix":"/api/dtr","endpoints":{
				"toggle_geofencing":{"method":"POST","route":"/settings/toggle-geofencing"},
				"update_office":{"method":"POST","route":"/settings/office"}
			}}
		]
	}`
	var buildPayload map[string]any
	if err := json.Unmarshal([]byte(build), &buildPayload); err != nil {
		t.Fatal(err)
	}
	endpointBodies := map[string]string{}
	for _, operation := range []string{"my_records", "check_in", "check_out", "toggle_geofencing", "update_office"} {
		endpointBodies[operation] = goTatemonoBody(t, "dtr-geofencing", "endpoint", operation)
	}
	for _, rawAPI := range buildPayload["apis"].([]any) {
		api := rawAPI.(map[string]any)
		endpoints := api["endpoints"].(map[string]any)
		for operation, body := range endpointBodies {
			if endpoint, exists := endpoints[operation]; exists {
				endpoint.(map[string]any)["body"] = body
			}
		}
	}
	buildBytes, err := json.Marshal(buildPayload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(buildBytes), "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	db, err := openModuleDatabase(storage, "dtr-geofencing")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO "employees" ("id","name","email","is_active") VALUES (1,'Ada','ada@example.com',1)`); err != nil {
		t.Fatal(err)
	}
	for _, setting := range [][2]string{
		{"geofencing_enabled", "true"},
		{"office_latitude", "14.599512"},
		{"office_longitude", "120.984219"},
		{"geofence_radius_meters", "100"},
	} {
		if _, err := db.Exec(`INSERT INTO "dtr_settings" ("key","value") VALUES (?,?)`, setting[0], setting[1]); err != nil {
			_ = db.Close()
			t.Fatal(err)
		}
	}
	_ = db.Close()

	outside := perform(handler, http.MethodPost, "/api/dtr/check-in", `{"employee_id":1,"latitude":14.61,"longitude":121}`, "")
	if outside.Code != http.StatusForbidden || !bytes.Contains(outside.Body.Bytes(), []byte("Geofence violation")) {
		t.Fatalf("outside geofence status %d: %s", outside.Code, outside.Body.String())
	}
	checkIn := perform(handler, http.MethodPost, "/api/dtr/check-in", `{"employee_id":1,"latitude":14.599512,"longitude":120.984219}`, "")
	if checkIn.Code != http.StatusOK || !bytes.Contains(checkIn.Body.Bytes(), []byte(`"within_geofence":true`)) {
		t.Fatalf("check-in status %d: %s", checkIn.Code, checkIn.Body.String())
	}
	checkOut := perform(handler, http.MethodPost, "/api/dtr/check-out", `{"employee_id":1,"latitude":14.599512,"longitude":120.984219}`, "")
	if checkOut.Code != http.StatusOK || !bytes.Contains(checkOut.Body.Bytes(), []byte(`"type":"out"`)) {
		t.Fatalf("check-out status %d: %s", checkOut.Code, checkOut.Body.String())
	}
	db, err = openModuleDatabase(storage, "dtr-geofencing")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO "employees" ("id","name","email","is_active") VALUES (2,'Grace','grace@example.com',0)`); err != nil {
		_ = db.Close()
		t.Fatal(err)
	}
	_ = db.Close()
	inactiveCheckIn := perform(handler, http.MethodPost, "/api/dtr/check-in", `{"employee_id":2,"latitude":14.599512,"longitude":120.984219}`, "")
	if inactiveCheckIn.Code != http.StatusOK || !bytes.Contains(inactiveCheckIn.Body.Bytes(), []byte(`"within_geofence":true`)) {
		t.Fatalf("inactive employee check-in status %d: %s", inactiveCheckIn.Code, inactiveCheckIn.Body.String())
	}
	records := httptest.NewRecorder()
	handler.ServeHTTP(records, httptest.NewRequest(http.MethodGet, "/api/dtr/my-records/1", nil))
	if records.Code != http.StatusOK || !bytes.Contains(records.Body.Bytes(), []byte(`"type":"in"`)) || !bytes.Contains(records.Body.Bytes(), []byte(`"type":"out"`)) {
		t.Fatalf("employee records status %d: %s", records.Code, records.Body.String())
	}
	if response := perform(handler, http.MethodPost, "/api/dtr/settings/toggle-geofencing", `{"enabled":false}`, ""); response.Code != http.StatusOK || !bytes.Contains(response.Body.Bytes(), []byte(`"geofencing_enabled":false`)) {
		t.Fatalf("toggle geofencing status %d: %s", response.Code, response.Body.String())
	}
	if response := perform(handler, http.MethodPost, "/api/dtr/settings/office", `{"lat":14.6,"lng":120.98,"radius":250}`, ""); response.Code != http.StatusOK || !bytes.Contains(response.Body.Bytes(), []byte(`"success":true`)) {
		t.Fatalf("update office status %d: %s", response.Code, response.Body.String())
	}
}

func goTatemonoBody(t *testing.T, module, section, operation string) string {
	t.Helper()
	_, testFile, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("could not locate Go backend test source")
	}
	repositoryRoot := filepath.Join(filepath.Dir(testFile), "..", "..", "..", "..", "..")
	sourcePath := filepath.Join(repositoryRoot, "tatemonos", module, "core.tsx")
	source, err := os.ReadFile(sourcePath)
	if err != nil {
		t.Fatalf("read %s Tatemono source: %v", module, err)
	}
	opening := "/* @arkzen:" + section + ":go:" + operation
	closing := opening + ":end */"
	start := strings.Index(string(source), opening)
	if start < 0 {
		t.Fatalf("Go %s %q not found in %s", section, operation, sourcePath)
	}
	bodyStart := strings.Index(string(source[start:]), "*/")
	if bodyStart < 0 {
		t.Fatalf("Go %s %q has no opening delimiter", section, operation)
	}
	bodyStart += start + len("*/")
	bodyEnd := strings.Index(string(source[bodyStart:]), closing)
	if bodyEnd < 0 {
		t.Fatalf("Go %s %q has no closing delimiter", section, operation)
	}
	body := strings.TrimSpace(string(source[bodyStart : bodyStart+bodyEnd]))
	return base64.StdEncoding.EncodeToString([]byte(body))
}

func closeTestModuleRuntime(t *testing.T, handler *Handler, module string) {
	t.Helper()
	t.Cleanup(func() {
		handler.service.mu.Lock()
		if runtime := handler.service.runtimes[module]; runtime != nil && runtime.database != nil {
			if err := runtime.database.Close(); err != nil {
				t.Errorf("close %s module runtime: %v", module, err)
			}
		}
		handler.service.mu.Unlock()
		if database, exists := sharedModuleDatabases.LoadAndDelete(module); exists {
			if err := database.(*sql.DB).Close(); err != nil {
				t.Errorf("close %s shared module database: %v", module, err)
			}
		}
	})
}

func TestQueueFlowHandlerAllowlistAndStateTransitions(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	closeTestModuleRuntime(t, handler, "queue-flow")
	build := `{
		"name":"queue-flow","backendVariant":"go",
		"databases":[
			{"table":"queues","columns":{"name":{"type":"string","nullable":false},"description":{"type":"string","nullable":true},"prefix":{"type":"string","default":"Q"},"is_active":{"type":"boolean","default":true},"avg_wait_minutes":{"type":"integer","default":5}},"seeder":{"count":2,"data":[
				{"name":"General","description":"General service queue","prefix":"G","is_active":true,"avg_wait_minutes":5},
				{"name":"Priority","description":"Priority service queue","prefix":"P","is_active":true,"avg_wait_minutes":3}
			]}},
			{"table":"tickets","columns":{"queue_id":{"type":"integer"},"ticket_number":{"type":"string"},"customer_name":{"type":"string"},"status":{"type":"string"},"position":{"type":"integer"},"called_at":{"type":"datetime"},"served_at":{"type":"datetime"}}}
		],
		"apis":[
			{"model":"Queue","controller":"QueueController","table":"queues","prefix":"/api/queue-flow","endpoints":{"index":{"method":"GET","route":"/queues","response":{"type":"collection"}}}},
			{"model":"Ticket","controller":"TicketController","prefix":"/api/queue-flow","endpoints":{"index":{"method":"GET","route":"/tickets"}}}
		],
		"realtimes":["queue-flow.{queueId}:\n  type: public","queue-updated:\n  channel: queue-flow.{queueId}\n  type: public"],
		"customRoutes":[{"controller":"QueueController","middleware":[],"routes":[
			{"method":"POST","route":"/api/queue-flow/join","handler":"join_queue"},
			{"method":"POST","route":"/api/queue-flow/call-next","handler":"call_next"},
			{"method":"GET","route":"/api/queue-flow/status/{queue_id}","handler":"queue_status"},
			{"method":"GET","route":"/api/queue-flow/my-ticket/{queue_id}/{ticket_number}","handler":"my_ticket"}
		]}]
	}`
	var buildPayload map[string]any
	if err := json.Unmarshal([]byte(build), &buildPayload); err != nil {
		t.Fatal(err)
	}
	handlerBodies := map[string]string{}
	for _, operation := range []string{"join_queue", "call_next", "queue_status", "my_ticket"} {
		handlerBodies[operation] = goTatemonoBody(t, "queue-flow", "handler", operation)
	}
	for _, rawGroup := range buildPayload["customRoutes"].([]any) {
		group := rawGroup.(map[string]any)
		for _, rawRoute := range group["routes"].([]any) {
			route := rawRoute.(map[string]any)
			if body, exists := handlerBodies[route["handler"].(string)]; exists {
				route["body"] = body
			}
		}
	}
	buildBytes, err := json.Marshal(buildPayload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(buildBytes), "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	queues := perform(handler, http.MethodGet, "/api/queue-flow/queues", "", "")
	if queues.Code != http.StatusOK || !bytes.Contains(queues.Body.Bytes(), []byte(`"data":[`)) ||
		!bytes.Contains(queues.Body.Bytes(), []byte(`"name":"General"`)) ||
		!bytes.Contains(queues.Body.Bytes(), []byte(`"is_active":1`)) {
		t.Fatalf("seeded queues status %d: %s", queues.Code, queues.Body.String())
	}
	initialStatus := perform(handler, http.MethodGet, "/api/queue-flow/status/1", "", "")
	if initialStatus.Code != http.StatusOK || !bytes.Contains(initialStatus.Body.Bytes(), []byte(`"queue":{"avg_wait_minutes":5`)) ||
		!bytes.Contains(initialStatus.Body.Bytes(), []byte(`"waiting":[]`)) ||
		!bytes.Contains(initialStatus.Body.Bytes(), []byte(`"total_waiting":0`)) {
		t.Fatalf("initial queue status %d: %s", initialStatus.Code, initialStatus.Body.String())
	}

	realtimeServer := httptest.NewServer(handler.realtime)
	defer realtimeServer.Close()
	realtimeURL := "ws" + strings.TrimPrefix(realtimeServer.URL, "http") + "/app/arkzen-key"
	socket, _, err := websocket.DefaultDialer.Dial(realtimeURL, nil)
	if err != nil {
		t.Fatalf("connect queue realtime websocket: %v", err)
	}
	defer socket.Close()
	_ = socket.SetReadDeadline(time.Now().Add(2 * time.Second))
	var realtimeEvent struct {
		Event   string `json:"event"`
		Channel string `json:"channel"`
		Data    string `json:"data"`
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil || realtimeEvent.Event != "pusher:connection_established" {
		t.Fatalf("queue realtime connection event = %#v, error = %v", realtimeEvent, err)
	}
	if err := socket.WriteJSON(map[string]any{
		"event": "pusher:subscribe", "data": map[string]any{"channel": "queue-flow.1"},
	}); err != nil {
		t.Fatal(err)
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil ||
		realtimeEvent.Event != "pusher_internal:subscription_succeeded" ||
		realtimeEvent.Channel != "queue-flow.1" {
		t.Fatalf("queue realtime subscription event = %#v, error = %v", realtimeEvent, err)
	}
	joined := perform(handler, http.MethodPost, "/api/queue-flow/join", `{"queue_id":1,"customer_name":"Ada"}`, "")
	if joined.Code != http.StatusOK || !bytes.Contains(joined.Body.Bytes(), []byte(`"ticket_number":"G-001"`)) {
		t.Fatalf("join status %d: %s", joined.Code, joined.Body.String())
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil || realtimeEvent.Event != "queue-flow.queue-updated" ||
		realtimeEvent.Channel != "queue-flow.1" {
		t.Fatalf("queue joined broadcast = %#v, error = %v", realtimeEvent, err)
	}
	var joinedEvent map[string]any
	if err := json.Unmarshal([]byte(realtimeEvent.Data), &joinedEvent); err != nil ||
		joinedEvent["action"] != "joined" {
		t.Fatalf("queue joined broadcast payload = %#v, error = %v", joinedEvent, err)
	}
	if next := perform(handler, http.MethodPost, "/api/queue-flow/call-next", `{"queue_id":1}`, ""); next.Code != http.StatusOK || !bytes.Contains(next.Body.Bytes(), []byte(`"status":"serving"`)) {
		t.Fatalf("call-next status %d: %s", next.Code, next.Body.String())
	}
	if err := socket.ReadJSON(&realtimeEvent); err != nil || realtimeEvent.Event != "queue-flow.queue-updated" {
		t.Fatalf("queue called broadcast = %#v, error = %v", realtimeEvent, err)
	}
	if err := json.Unmarshal([]byte(realtimeEvent.Data), &joinedEvent); err != nil ||
		joinedEvent["action"] != "called" {
		t.Fatalf("queue called broadcast payload = %#v, error = %v", joinedEvent, err)
	}
	status := httptest.NewRecorder()
	handler.ServeHTTP(status, httptest.NewRequest(http.MethodGet, "/api/queue-flow/status/1", nil))
	if status.Code != http.StatusOK || !bytes.Contains(status.Body.Bytes(), []byte(`"total_waiting":0`)) {
		t.Fatalf("queue status %d: %s", status.Code, status.Body.String())
	}
	ticket := httptest.NewRecorder()
	handler.ServeHTTP(ticket, httptest.NewRequest(http.MethodGet, "/api/queue-flow/my-ticket/1/G-001", nil))
	if ticket.Code != http.StatusOK || !bytes.Contains(ticket.Body.Bytes(), []byte(`"is_serving":true`)) {
		t.Fatalf("my-ticket status %d: %s", ticket.Code, ticket.Body.String())
	}
	db, err := openModuleDatabase(storage, "queue-flow")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`UPDATE "queues" SET "is_active" = 0 WHERE "id" = 2`); err != nil {
		_ = db.Close()
		t.Fatal(err)
	}
	_ = db.Close()
	inactiveJoin := perform(handler, http.MethodPost, "/api/queue-flow/join", `{"queue_id":2,"customer_name":"Grace"}`, "")
	if inactiveJoin.Code != http.StatusOK || !bytes.Contains(inactiveJoin.Body.Bytes(), []byte(`"ticket_number":"P-001"`)) {
		t.Fatalf("inactive queue join status %d: %s", inactiveJoin.Code, inactiveJoin.Body.String())
	}
}

func TestPayrollAndMailSimulationEmulations(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	payroll := `{"name":"jo-payroll","backendVariant":"go","databases":[{"table":"job_orders","columns":{"jor_number":{"type":"integer"},"name_of_jo":{"type":"string"},"job_title":{"type":"string"},"funding":{"type":"string"},"basic_pay":{"type":"decimal"},"disbursement_type":{"type":"string"},"jor_pyrl_group":{"type":"string"},"sss_amount":{"type":"decimal"},"hdmf_premium":{"type":"decimal"},"hdmf_mpl":{"type":"decimal"},"calamity_loan":{"type":"decimal"},"appointment_date":{"type":"date"},"appointment_order":{"type":"integer"},"status":{"type":"string"}}}],"apis":[{"model":"JobOrder","controller":"JobOrderController","prefix":"/api/jo-payroll","endpoints":{"summary":{"method":"GET","route":"/job-orders/stats/summary"},"byGroup":{"method":"GET","route":"/job-orders/group/{group}"},"appointments":{"method":"GET","route":"/job-orders/appointments/list"}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", payroll, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("payroll build status %d: %s", response.Code, response.Body.String())
	}
	db, err := openModuleDatabase(storage, "jo-payroll")
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(`INSERT INTO "job_orders" ("jor_number","name_of_jo","job_title","funding","basic_pay","disbursement_type","jor_pyrl_group","sss_amount","hdmf_premium","hdmf_mpl","calamity_loan","appointment_date","appointment_order","status") VALUES (1,'Ada','Clerk','Admin',1000,'ATM','GROUP A',50,10,5,0,'2026-01-01',1,'active')`)
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO "job_orders" ("jor_number","jor_pyrl_group","status") VALUES (2,'GROUP A','inactive')`); err != nil {
		_ = db.Close()
		t.Fatal(err)
	}
	_ = db.Close()
	summary := httptest.NewRecorder()
	handler.ServeHTTP(summary, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/stats/summary", nil))
	for _, expected := range []string{`"total_active":1`, `"total_inactive":1`, `"total_atm":1`, `"total_basic_pay":1000`, `"total_deductions":65`, `"net_pay":935`} {
		if summary.Code != http.StatusOK || !bytes.Contains(summary.Body.Bytes(), []byte(expected)) {
			t.Fatalf("payroll summary missing %s, status %d: %s", expected, summary.Code, summary.Body.String())
		}
	}
	group := httptest.NewRecorder()
	handler.ServeHTTP(group, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/group/GROUP%20A", nil))
	if group.Code != http.StatusOK || !bytes.Contains(group.Body.Bytes(), []byte(`"jor_number":1`)) ||
		bytes.Contains(group.Body.Bytes(), []byte(`"jor_number":2`)) {
		t.Fatalf("payroll group status %d: %s", group.Code, group.Body.String())
	}
	appointments := httptest.NewRecorder()
	handler.ServeHTTP(appointments, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/appointments/list", nil))
	if appointments.Code != http.StatusOK || !bytes.Contains(appointments.Body.Bytes(), []byte(`"appointment_order":1`)) {
		t.Fatalf("payroll appointments status %d: %s", appointments.Code, appointments.Body.String())
	}

	t.Setenv("MAIL_MAILER", "log")
	mailBuild := fmt.Sprintf(`{"name":"mail-test","backendVariant":"go","mails":%s,"databases":[{"table":"mail_logs","columns":{"user_id":{"type":"integer"},"to_email":{"type":"string"},"subject":{"type":"string"},"mail_class":{"type":"string"},"status":{"type":"string"},"error":{"type":"text"}}}],"apis":[{"model":"MailLog","controller":"MailLogController","prefix":"/api/mail-test","middleware":[],"endpoints":{"store":{"method":"POST","route":"/send","type":"mail_send"}}}]}`, testMailSectionsJSON(t))
	if response := perform(handler, http.MethodPost, "/arkzen/build", mailBuild, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("mail build status %d: %s", response.Code, response.Body.String())
	}
	var mailRegistration Registration
	for _, registration := range handler.service.Registrations() {
		if registration.Name == "mail-test" {
			mailRegistration = registration
			break
		}
	}
	definitions, err := mailDefinitions(mailRegistration)
	if err != nil {
		t.Fatal(err)
	}
	rendered, err := renderMail(definitions["welcome-mail"], map[string]any{"username": "<Ada>", "app_name": "Arkzen"})
	if err != nil || !strings.Contains(rendered, "&lt;Ada&gt;") || !strings.Contains(rendered, "Arkzen") {
		t.Fatalf("Go mail template did not render safely: %q, error = %v", rendered, err)
	}
	mail := perform(handler, http.MethodPost, "/api/mail-test/send", `{"mail":"welcome-mail","to":"ada@example.com","data":{"username":"Ada","app_name":"Arkzen"}}`, "")
	if mail.Code != http.StatusCreated || !bytes.Contains(mail.Body.Bytes(), []byte(`"status":"sent"`)) ||
		!bytes.Contains(mail.Body.Bytes(), []byte(`"subject":"Welcome to Arkzen"`)) ||
		!bytes.Contains(mail.Body.Bytes(), []byte(`"mail_class":"WelcomeMail"`)) ||
		bytes.Contains(mail.Body.Bytes(), []byte("External email delivery is not performed")) {
		t.Fatalf("mail log did not match the other engines' log-mailer behavior: %d %s", mail.Code, mail.Body.String())
	}
	if response := perform(handler, http.MethodPost, "/api/mail-test/send", `{"mail":"unknown","to":"ada@example.com"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported mail status %d: %s", response.Code, response.Body.String())
	}
}

func TestBodyMailAndNotificationSimulationEmulations(t *testing.T) {
	t.Setenv("MAIL_MAILER", "log")
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	closeTestModuleRuntime(t, handler, "body-mail-notification")
	notificationSections, err := json.Marshal([]string{
		"summary:\n  channels: [mail, database]\n  message: \"Here is your activity summary.\"\n  toMail_body: 'summary notification body'",
	})
	if err != nil {
		t.Fatal(err)
	}
	mailSections, err := json.Marshal([]string{
		"welcome:\n  subject: \"Welcome\"\n  blade_body: 'V2VsY29tZSE='",
		"receipt:\n  subject: \"Receipt\"\n  blade_body: 'UmVjZWlwdCE='",
		"alert:\n  subject: \"Alert\"\n  blade_body: 'QWxlcnQh'",
	})
	if err != nil {
		t.Fatal(err)
	}
	build := fmt.Sprintf(`{"name":"body-mail-notification","backendVariant":"go","auth":true,"authSeed":{"users":[{"name":"Mail Test","email":"mail-test@example.com","password":"password"}]},"mails":%s,"notifications":%s,"databases":[{"table":"send_log","columns":{"user_id":{"type":"integer"},"to_email":{"type":"string"},"subject":{"type":"string"},"mail_class":{"type":"string"},"kind":{"type":"string"},"status":{"type":"string"},"error":{"type":"text"}}}],"apis":[{"model":"SendLog","controller":"SendLogController","prefix":"/api/body-mail-notification","middleware":["auth"],"endpoints":{"sendMail":{"method":"POST","route":"/send-mail"},"notify":{"method":"POST","route":"/notify"}}}]}`, mailSections, notificationSections)
	var buildPayload map[string]any
	if err := json.Unmarshal([]byte(build), &buildPayload); err != nil {
		t.Fatal(err)
	}
	endpoints := buildPayload["apis"].([]any)[0].(map[string]any)["endpoints"].(map[string]any)
	endpoints["sendMail"].(map[string]any)["body"] = goTatemonoBody(t, "body-mail-notification", "endpoint", "sendMail")
	endpoints["notify"].(map[string]any)["body"] = goTatemonoBody(t, "body-mail-notification", "endpoint", "notify")
	buildBytes, err := json.Marshal(buildPayload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(buildBytes), "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	login := perform(handler, http.MethodPost, "/api/body-mail-notification/auth/login",
		`{"email":"mail-test@example.com","password":"password"}`, "")
	var loginBody struct {
		Token string `json:"token"`
	}
	if login.Code != http.StatusOK || json.Unmarshal(login.Body.Bytes(), &loginBody) != nil || loginBody.Token == "" {
		t.Fatalf("body mail auth login status %d: %s", login.Code, login.Body.String())
	}
	authenticatedPost := func(path, body string) *httptest.ResponseRecorder {
		t.Helper()
		request := httptest.NewRequest(http.MethodPost, path, strings.NewReader(body))
		request.Header.Set("Authorization", "Bearer "+loginBody.Token)
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		return response
	}
	mail := authenticatedPost("/api/body-mail-notification/send-mail", `{"mail":"receipt","to":"buyer@example.com"}`)
	if mail.Code != http.StatusCreated || !bytes.Contains(mail.Body.Bytes(), []byte(`"kind":"mail"`)) ||
		!bytes.Contains(mail.Body.Bytes(), []byte(`"status":"sent"`)) ||
		!bytes.Contains(mail.Body.Bytes(), []byte(`"mail_class":"ReceiptMail"`)) {
		t.Fatalf("mail delivery log status %d: %s", mail.Code, mail.Body.String())
	}
	notification := authenticatedPost("/api/body-mail-notification/notify", `{"notification":"summary","message":"Daily summary"}`)
	if notification.Code != http.StatusCreated || !bytes.Contains(notification.Body.Bytes(), []byte(`"kind":"notification"`)) ||
		!bytes.Contains(notification.Body.Bytes(), []byte(`"status":"sent"`)) ||
		!bytes.Contains(notification.Body.Bytes(), []byte(`"mail_class":"SummaryNotification"`)) {
		t.Fatalf("notification delivery log status %d: %s", notification.Code, notification.Body.String())
	}
}

func TestNotificationTestBuildAuthInboxAndActions(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	build := `{
		"name":"notification-test","backendVariant":"go","auth":true,
		"notifications":[
			"database-ping:\n  channels: [database]\n  message: \"You have a new database notification\"\n  subject: \"Database Ping\"",
			"broadcast-ping:\n  channels: [broadcast, database]\n  channel_type: private\n  message: \"Real-time notification received on your private channel!\"\n  subject: \"Broadcast Ping (Private)\""
		],
		"apis":[{"model":"Notification","controller":"NotificationController","prefix":"/api/notification-test","middleware":["auth"],"endpoints":{
			"index":{"method":"GET","route":"/inbox","response":{"type":"collection"}},
			"store":{"method":"POST","route":"/trigger","type":"notification_trigger","validation":{"notification":"required|string"}},
			"destroy":{"method":"DELETE","route":"/inbox/{id}","response":{"type":"message","value":"Notification deleted"}},
			"readAll":{"method":"POST","route":"/inbox/read-all","response":{"type":"message","value":"All notifications marked as read"}}
		}}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("notification-test build status %d: %s", response.Code, response.Body.String())
	}
	register := perform(handler, http.MethodPost, "/api/notification-test/auth/register",
		`{"name":"Notification User","email":"notify@example.com","password":"password123","password_confirmation":"password123"}`, "")
	var authResult struct {
		Token string   `json:"token"`
		User  authUser `json:"user"`
	}
	if register.Code != http.StatusCreated || json.Unmarshal(register.Body.Bytes(), &authResult) != nil || authResult.Token == "" {
		t.Fatalf("notification-test registration status %d: %s", register.Code, register.Body.String())
	}
	login := perform(handler, http.MethodPost, "/api/notification-test/auth/login",
		`{"email":"notify@example.com","password":"password123"}`, "")
	if login.Code != http.StatusOK {
		t.Fatalf("notification-test login status %d: %s", login.Code, login.Body.String())
	}
	if err := json.Unmarshal(login.Body.Bytes(), &authResult); err != nil || authResult.Token == "" {
		t.Fatalf("notification-test login response: %s (error: %v)", login.Body.String(), err)
	}
	authRequest := func(method, path, body string) *httptest.ResponseRecorder {
		t.Helper()
		request := httptest.NewRequest(method, path, strings.NewReader(body))
		request.Header.Set("Authorization", "Bearer "+authResult.Token)
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		return response
	}
	broadcastAuth := authRequest(http.MethodPost, "/api/notification-test/auth/broadcasting/auth",
		fmt.Sprintf(`{"socket_id":"123.456","channel_name":"private-notification-test.%d"}`, authResult.User.ID))
	if broadcastAuth.Code != http.StatusOK || !bytes.Contains(broadcastAuth.Body.Bytes(), []byte(`"auth":"arkzen-key:`)) {
		t.Fatalf("notification private-channel authorization status %d: %s", broadcastAuth.Code, broadcastAuth.Body.String())
	}
	initial := authRequest(http.MethodGet, "/api/notification-test/inbox", "")
	if initial.Code != http.StatusOK || !bytes.Contains(initial.Body.Bytes(), []byte(`"data":[]`)) {
		t.Fatalf("empty notification inbox status %d: %s", initial.Code, initial.Body.String())
	}
	triggered := authRequest(http.MethodPost, "/api/notification-test/trigger", `{"notification":"database-ping"}`)
	if triggered.Code != http.StatusCreated || !bytes.Contains(triggered.Body.Bytes(), []byte(`"type":"database-ping"`)) {
		t.Fatalf("database notification trigger status %d: %s", triggered.Code, triggered.Body.String())
	}
	inbox := authRequest(http.MethodGet, "/api/notification-test/inbox", "")
	var inboxResult struct {
		Data []struct {
			ID     string  `json:"id"`
			ReadAt *string `json:"read_at"`
			Data   string  `json:"data"`
		} `json:"data"`
	}
	if inbox.Code != http.StatusOK || json.Unmarshal(inbox.Body.Bytes(), &inboxResult) != nil || len(inboxResult.Data) != 1 {
		t.Fatalf("notification inbox status %d: %s", inbox.Code, inbox.Body.String())
	}
	if !strings.Contains(inboxResult.Data[0].Data, "You have a new database notification") {
		t.Fatalf("notification inbox data = %s", inboxResult.Data[0].Data)
	}
	read := authRequest(http.MethodPost, "/api/notification-test/inbox/read-all", "")
	if read.Code != http.StatusOK || !bytes.Contains(read.Body.Bytes(), []byte("All notifications marked as read")) {
		t.Fatalf("mark notifications read status %d: %s", read.Code, read.Body.String())
	}
	updatedInbox := authRequest(http.MethodGet, "/api/notification-test/inbox", "")
	if updatedInbox.Code != http.StatusOK || !bytes.Contains(updatedInbox.Body.Bytes(), []byte(`"read_at":"`)) {
		t.Fatalf("read notification inbox status %d: %s", updatedInbox.Code, updatedInbox.Body.String())
	}
	deleted := authRequest(http.MethodDelete, "/api/notification-test/inbox/"+inboxResult.Data[0].ID, "")
	if deleted.Code != http.StatusOK || !bytes.Contains(deleted.Body.Bytes(), []byte("Notification deleted")) {
		t.Fatalf("delete notification status %d: %s", deleted.Code, deleted.Body.String())
	}
	missing := authRequest(http.MethodGet, "/api/notification-test/inbox", "")
	if missing.Code != http.StatusOK || !bytes.Contains(missing.Body.Bytes(), []byte(`"data":[]`)) {
		t.Fatalf("notification inbox after delete status %d: %s", missing.Code, missing.Body.String())
	}
}

func TestRolesTestAuthAndAuditEmulation(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	build := `{
		"name":"roles-test","backendVariant":"go","auth":true,
		"authSeed":{"users":[
			{"name":"Admin User","email":"admin@roles-test.com","password":"password123","role":"admin"},
			{"name":"Regular User","email":"user@roles-test.com","password":"password123","role":"user"}
		]},
		"databases":[{"table":"role_audit_logs","columns":{
			"user_id":{"type":"integer","nullable":true},
			"action":{"type":"string"},
			"role_required":{"type":"string"},
			"granted":{"type":"boolean"}
		},"timestamps":true}],
		"apis":[{"model":"RoleAuditLog","controller":"RoleAuditLogController","table":"role_audit_logs","prefix":"/api/roles-test","middleware":["auth"],"endpoints":{
			"index":{"method":"GET","route":"/logs","response":{"type":"collection"}},
			"adminOnly":{"method":"GET","route":"/admin-only","type":"role_admin_only"},
			"userOnly":{"method":"GET","route":"/user-only","type":"role_user_only"},
			"promote":{"method":"POST","route":"/promote","type":"role_promote"},
			"demote":{"method":"POST","route":"/demote","type":"role_demote"}
		}}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}

	login := func(email string) string {
		t.Helper()
		response := perform(handler, http.MethodPost, "/api/roles-test/auth/login",
			fmt.Sprintf(`{"email":%q,"password":"password123"}`, email), "")
		if response.Code != http.StatusOK {
			t.Fatalf("login %s status %d: %s", email, response.Code, response.Body.String())
		}
		var result struct {
			Token string `json:"token"`
		}
		if err := json.Unmarshal(response.Body.Bytes(), &result); err != nil || result.Token == "" {
			t.Fatalf("login %s returned no token: %s (error: %v)", email, response.Body.String(), err)
		}
		return result.Token
	}
	request := func(method, path, token string) *httptest.ResponseRecorder {
		t.Helper()
		req := httptest.NewRequest(method, path, nil)
		req.Header.Set("Authorization", "Bearer "+token)
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, req)
		return response
	}

	adminToken := login("admin@roles-test.com")
	userToken := login("user@roles-test.com")
	if response := request(http.MethodGet, "/api/roles-test/admin-only", ""); response.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated admin route status %d: %s", response.Code, response.Body.String())
	}
	if response := request(http.MethodGet, "/api/roles-test/admin-only", userToken); response.Code != http.StatusForbidden ||
		!bytes.Contains(response.Body.Bytes(), []byte("admin role required")) {
		t.Fatalf("regular user admin route status %d: %s", response.Code, response.Body.String())
	}
	if response := request(http.MethodGet, "/api/roles-test/user-only", userToken); response.Code != http.StatusOK ||
		!bytes.Contains(response.Body.Bytes(), []byte("open to all authenticated users")) {
		t.Fatalf("user route status %d: %s", response.Code, response.Body.String())
	}
	if response := request(http.MethodGet, "/api/roles-test/admin-only", adminToken); response.Code != http.StatusOK ||
		!bytes.Contains(response.Body.Bytes(), []byte("you are admin")) {
		t.Fatalf("admin route status %d: %s", response.Code, response.Body.String())
	}

	promoted := request(http.MethodPost, "/api/roles-test/promote", userToken)
	if promoted.Code != http.StatusOK || !bytes.Contains(promoted.Body.Bytes(), []byte(`"role":"admin"`)) {
		t.Fatalf("promote status %d: %s", promoted.Code, promoted.Body.String())
	}
	if response := request(http.MethodGet, "/api/roles-test/admin-only", userToken); response.Code != http.StatusOK {
		t.Fatalf("promoted user admin route status %d: %s", response.Code, response.Body.String())
	}
	demoted := request(http.MethodPost, "/api/roles-test/demote", userToken)
	if demoted.Code != http.StatusOK || !bytes.Contains(demoted.Body.Bytes(), []byte(`"role":"user"`)) {
		t.Fatalf("demote status %d: %s", demoted.Code, demoted.Body.String())
	}
	if response := request(http.MethodGet, "/api/roles-test/admin-only", userToken); response.Code != http.StatusForbidden {
		t.Fatalf("demoted user admin route status %d: %s", response.Code, response.Body.String())
	}
	logs := request(http.MethodGet, "/api/roles-test/logs", adminToken)
	if logs.Code != http.StatusOK || !bytes.Contains(logs.Body.Bytes(), []byte(`"granted":0`)) ||
		!bytes.Contains(logs.Body.Bytes(), []byte(`"action":"GET /admin-only"`)) {
		t.Fatalf("role audit logs status %d: %s", logs.Code, logs.Body.String())
	}
}

func TestKotobaBuildSeedsUsersAndEnablesLogin(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	closeTestModuleRuntime(t, handler, "kotoba")
	routes := []CustomRouteEntry{
		{Method: "GET", Route: "/api/kotoba/me", Handler: "me"},
		{Method: "PUT", Route: "/api/kotoba/me", Handler: "update_me"},
		{Method: "GET", Route: "/api/kotoba/home", Handler: "home"},
		{Method: "POST", Route: "/api/kotoba/activity", Handler: "bump"},
		{Method: "POST", Route: "/api/kotoba/internal/notify", Handler: "notify"},
		{Method: "POST", Route: "/api/kotoba/internal/seed", Handler: "community_seed"},
		{Method: "GET", Route: "/api/kotoba/feed", Handler: "feed"},
		{Method: "POST", Route: "/api/kotoba/posts", Handler: "create_post"},
		{Method: "DELETE", Route: "/api/kotoba/posts/{id}", Handler: "delete_post"},
		{Method: "POST", Route: "/api/kotoba/posts/{id}/like", Handler: "toggle_like"},
		{Method: "GET", Route: "/api/kotoba/posts/{id}/comments", Handler: "list_comments"},
		{Method: "POST", Route: "/api/kotoba/posts/{id}/comments", Handler: "add_comment"},
		{Method: "POST", Route: "/api/kotoba/comments/{id}/accept", Handler: "accept_correction"},
		{Method: "GET", Route: "/api/kotoba/lessons", Handler: "list_lessons"},
		{Method: "POST", Route: "/api/kotoba/lessons/{id}/complete", Handler: "complete_lesson"},
		{Method: "GET", Route: "/api/kotoba/vocab", Handler: "list_cards"},
		{Method: "POST", Route: "/api/kotoba/vocab", Handler: "add_card"},
		{Method: "POST", Route: "/api/kotoba/vocab/{id}/review", Handler: "review_card"},
		{Method: "DELETE", Route: "/api/kotoba/vocab/{id}", Handler: "delete_card"},
		{Method: "GET", Route: "/api/kotoba/partners", Handler: "partners"},
		{Method: "GET", Route: "/api/kotoba/profile/{id}", Handler: "view_profile"},
		{Method: "POST", Route: "/api/kotoba/follow/{id}", Handler: "toggle_follow"},
		{Method: "GET", Route: "/api/kotoba/conversations", Handler: "list_conversations"},
		{Method: "POST", Route: "/api/kotoba/conversations", Handler: "start_conversation"},
		{Method: "GET", Route: "/api/kotoba/messages", Handler: "list_messages"},
		{Method: "POST", Route: "/api/kotoba/messages", Handler: "send_message"},
		{Method: "POST", Route: "/api/kotoba/messages/{id}/correct", Handler: "correct_message"},
		{Method: "GET", Route: "/api/kotoba/circles", Handler: "list_circles"},
		{Method: "POST", Route: "/api/kotoba/circles", Handler: "create_circle"},
		{Method: "POST", Route: "/api/kotoba/circles/{id}/join", Handler: "toggle_join"},
		{Method: "GET", Route: "/api/kotoba/alerts", Handler: "list_alerts"},
		{Method: "POST", Route: "/api/kotoba/alerts/read", Handler: "read_alerts"},
		{Method: "GET", Route: "/api/kotoba/progress", Handler: "progress"},
	}
	for index := range routes {
		routes[index].Body = goTatemonoBody(t, "kotoba", "handler", routes[index].Handler)
	}
	nullableInt := true
	payload := BuildPayload{
		Name:           "kotoba",
		BackendVariant: "go",
		Auth:           true,
		AuthSeed: &AuthSeed{Users: []AuthSeedUser{
			{Name: "Aiko Tanaka", Email: "aiko@kotoba.app", Password: "password123"},
			{Name: "Mateo Rivera", Email: "mateo@kotoba.app", Password: "password123"},
			{Name: "Sofia Laurent", Email: "sofia@kotoba.app", Password: "password123"},
			{Name: "Demo Learner", Email: "demo@kotoba.app", Password: "password123"},
		}},
		Databases: []DatabaseDefinition{
			{
				Table: "profiles",
				Columns: map[string]ColumnDefinition{
					"id":            {Type: "integer", Primary: true},
					"user_id":       {Type: "integer"},
					"display_name":  {Type: "string"},
					"avatar_color":  {Type: "string"},
					"native_lang":   {Type: "string"},
					"learning_lang": {Type: "string"},
					"level":         {Type: "string"},
					"country":       {Type: "string"},
					"bio":           {Type: "text"},
					"interests":     {Type: "string"},
					"xp":            {Type: "integer"},
					"streak":        {Type: "integer"},
					"best_streak":   {Type: "integer"},
					"last_active":   {Type: "date"},
					"daily_goal":    {Type: "integer"},
					"words_written": {Type: "integer"},
					"messages_sent": {Type: "integer"},
					"onboarded":     {Type: "boolean"},
				},
			},
			{
				Table: "posts",
				Columns: map[string]ColumnDefinition{
					"id":                {Type: "integer", Primary: true},
					"user_id":           {Type: "integer"},
					"author_name":       {Type: "string"},
					"author_color":      {Type: "string"},
					"author_native":     {Type: "string"},
					"body":              {Type: "text"},
					"lang":              {Type: "string"},
					"kind":              {Type: "string"},
					"mission_id":        {Type: "integer"},
					"translation":       {Type: "text"},
					"likes_count":       {Type: "integer"},
					"corrections_count": {Type: "integer"},
					"comments_count":    {Type: "integer"},
				},
			},
			{
				Table: "likes",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "post_id": {Type: "integer"}, "user_id": {Type: "integer"},
				},
			},
			{
				Table: "comments",
				Columns: map[string]ColumnDefinition{
					"id":            {Type: "integer", Primary: true},
					"post_id":       {Type: "integer"},
					"user_id":       {Type: "integer"},
					"author_name":   {Type: "string"},
					"author_color":  {Type: "string"},
					"body":          {Type: "text"},
					"is_correction": {Type: "boolean"},
					"corrected":     {Type: "text"},
					"explanation":   {Type: "text"},
					"accepted":      {Type: "boolean"},
				},
			},
			{
				Table: "follows",
				Columns: map[string]ColumnDefinition{
					"id":           {Type: "integer", Primary: true},
					"follower_id":  {Type: "integer"},
					"following_id": {Type: "integer"},
				},
			},
			{
				Table: "circles",
				Columns: map[string]ColumnDefinition{
					"id":            {Type: "integer", Primary: true},
					"name":          {Type: "string"},
					"emoji":         {Type: "string"},
					"lang":          {Type: "string"},
					"level":         {Type: "string"},
					"description":   {Type: "text"},
					"owner_id":      {Type: "integer"},
					"members_count": {Type: "integer"},
				},
			},
			{
				Table: "missions",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "lang": {Type: "string"}, "position": {Type: "integer"},
				},
			},
			{
				Table: "vocab_cards",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "user_id": {Type: "integer"},
					"lang": {Type: "string"}, "term": {Type: "string"}, "meaning": {Type: "string"},
					"example": {Type: "text"}, "source": {Type: "string"}, "due_date": {Type: "date"},
					"ease": {Type: "float"}, "interval_days": {Type: "integer"},
					"reps": {Type: "integer"}, "lapses": {Type: "integer"},
				},
			},
			{
				Table: "lesson_results",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "user_id": {Type: "integer"},
					"lesson_id": {Type: "integer"}, "score": {Type: "integer"}, "best": {Type: "integer"},
				},
			},
			{
				Table: "lessons",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "lang": {Type: "string"},
					"unit": {Type: "string"}, "title": {Type: "string"}, "emoji": {Type: "string"},
					"level": {Type: "string"}, "position": {Type: "integer"},
					"xp": {Type: "integer"}, "content": {Type: "text"},
				},
			},
			{
				Table: "alerts",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "user_id": {Type: "integer"},
					"kind": {Type: "string"}, "text": {Type: "text"}, "ref": {Type: "integer"},
					"is_read": {Type: "boolean"},
				},
			},
			{
				Table: "conversations",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "user_a": {Type: "integer"},
					"user_b": {Type: "integer"}, "last_message": {Type: "text"}, "last_at": {Type: "datetime"},
				},
			},
			{
				Table: "messages",
				Columns: map[string]ColumnDefinition{
					"id":              {Type: "integer", Primary: true},
					"conversation_id": {Type: "integer", Nullable: &nullableInt},
					"circle_id":       {Type: "integer", Nullable: &nullableInt},
					"sender_id":       {Type: "integer"},
					"sender_name":     {Type: "string"},
					"sender_color":    {Type: "string"},
					"body":            {Type: "text"},
					"lang":            {Type: "string"},
					"corrected":       {Type: "text"},
					"note":            {Type: "text"},
					"corrected_by":    {Type: "integer"},
				},
			},
			{
				Table: "circle_members",
				Columns: map[string]ColumnDefinition{
					"id": {Type: "integer", Primary: true}, "circle_id": {Type: "integer"}, "user_id": {Type: "integer"},
				},
			},
		},
		APIs: []APIBlock{{
			Model: "Profile", Controller: "ProfileController", Prefix: "/api/kotoba/x/profiles",
			Middleware: []string{"auth:sanctum"},
			Endpoints:  map[string]EndpointConfig{"status": {Method: "GET", Route: "/status"}},
		}},
		CustomRoutes: []CustomRoute{{
			Controller: "KotobaController", Middleware: []string{"auth:sanctum"}, Routes: routes,
		}},
	}
	build, err := json.Marshal(payload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(build), "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("Kotoba build status %d: %s", response.Code, response.Body.String())
	}
	login := perform(handler, http.MethodPost, "/api/kotoba/auth/login",
		`{"email":"demo@kotoba.app","password":"password123"}`, "")
	if login.Code != http.StatusOK || !bytes.Contains(login.Body.Bytes(), []byte(`"email":"demo@kotoba.app"`)) {
		t.Fatalf("Kotoba seeded login status %d: %s", login.Code, login.Body.String())
	}

	protected := httptest.NewRecorder()
	handler.ServeHTTP(protected, httptest.NewRequest(http.MethodGet, "/api/kotoba/me", nil))
	if protected.Code != http.StatusUnauthorized {
		t.Fatalf("Kotoba custom route auth status %d: %s", protected.Code, protected.Body.String())
	}
	var loginResponse struct {
		Token string `json:"token"`
	}
	if err := json.Unmarshal(login.Body.Bytes(), &loginResponse); err != nil || loginResponse.Token == "" {
		t.Fatalf("Kotoba login returned no token: %s (error: %v)", login.Body.String(), err)
	}
	protectedRequest := httptest.NewRequest(http.MethodGet, "/api/kotoba/me", nil)
	protectedRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	protected = httptest.NewRecorder()
	handler.ServeHTTP(protected, protectedRequest)
	if protected.Code != http.StatusOK {
		t.Fatalf("Kotoba me handler status %d: %s", protected.Code, protected.Body.String())
	}
	runtime, err := handler.service.moduleRuntimeFor("kotoba")
	if err != nil {
		t.Fatalf("load Kotoba runtime: %v", err)
	}
	for table, want := range map[string]int{
		"posts": 5, "comments": 2, "follows": 2,
		"circles": 3, "circle_members": 3, "messages": 3,
	} {
		var got int
		if err := runtime.database.QueryRow(`SELECT COUNT(*) FROM "` + table + `"`).Scan(&got); err != nil || got != want {
			t.Errorf("Kotoba community seed %s count = %d, want %d (error: %v)", table, got, want, err)
		}
	}
	var circleID int
	var ownerID int
	if err := runtime.database.QueryRow(`SELECT "id", "owner_id" FROM "circles" ORDER BY "id" LIMIT 1`).Scan(&circleID, &ownerID); err != nil {
		t.Fatalf("load Kotoba circle for join test: %v", err)
	}
	homeRequest := httptest.NewRequest(http.MethodGet, "/api/kotoba/home", nil)
	homeRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	home := httptest.NewRecorder()
	handler.ServeHTTP(home, homeRequest)
	if home.Code != http.StatusOK || !bytes.Contains(home.Body.Bytes(), []byte(`"profile"`)) {
		t.Fatalf("Kotoba home handler status %d: %s", home.Code, home.Body.String())
	}
	joinRequest := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/kotoba/circles/%d/join", circleID), bytes.NewBufferString(`{}`))
	joinRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	joinRequest.Header.Set("Content-Type", "application/json")
	joined := httptest.NewRecorder()
	handler.ServeHTTP(joined, joinRequest)
	if joined.Code != http.StatusOK || !bytes.Contains(joined.Body.Bytes(), []byte(`"joined":true`)) {
		t.Fatalf("Kotoba join circle status %d: %s", joined.Code, joined.Body.String())
	}
	sendMessageRequest := httptest.NewRequest(
		http.MethodPost,
		"/api/kotoba/messages",
		bytes.NewBufferString(fmt.Sprintf(`{"circle_id":%d,"body":"Hello circle","lang":"en"}`, circleID)),
	)
	sendMessageRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	sendMessageRequest.Header.Set("Content-Type", "application/json")
	sentMessage := httptest.NewRecorder()
	handler.ServeHTTP(sentMessage, sendMessageRequest)
	if sentMessage.Code != http.StatusCreated {
		t.Fatalf("Kotoba circle send message status %d: %s", sentMessage.Code, sentMessage.Body.String())
	}
	messagesRequest := httptest.NewRequest(
		http.MethodGet,
		fmt.Sprintf("/api/kotoba/messages?circle_id=%d", circleID),
		nil,
	)
	messagesRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	messages := httptest.NewRecorder()
	handler.ServeHTTP(messages, messagesRequest)
	if messages.Code != http.StatusOK || !bytes.Contains(messages.Body.Bytes(), []byte(`"data":[`)) {
		t.Fatalf("Kotoba circle chat messages status %d: %s", messages.Code, messages.Body.String())
	}
	circlesRequest := httptest.NewRequest(http.MethodGet, "/api/kotoba/circles", nil)
	circlesRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	circles := httptest.NewRecorder()
	handler.ServeHTTP(circles, circlesRequest)
	var circleList struct {
		Data []struct {
			ID           int  `json:"id"`
			Joined       bool `json:"joined"`
			MembersCount int  `json:"members_count"`
		} `json:"data"`
	}
	if err := json.Unmarshal(circles.Body.Bytes(), &circleList); err != nil {
		t.Fatalf("decode Kotoba circle list: %v", err)
	}
	foundJoined := false
	for _, circle := range circleList.Data {
		if circle.ID == circleID {
			foundJoined = circle.Joined && circle.MembersCount == 2
			break
		}
	}
	if circles.Code != http.StatusOK || !foundJoined {
		t.Fatalf("Kotoba joined circle missing from list: status %d, body %s", circles.Code, circles.Body.String())
	}
	leaveRequest := httptest.NewRequest(http.MethodPost, fmt.Sprintf("/api/kotoba/circles/%d/join", circleID), bytes.NewBufferString(`{}`))
	leaveRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	leaveRequest.Header.Set("Content-Type", "application/json")
	left := httptest.NewRecorder()
	handler.ServeHTTP(left, leaveRequest)
	if left.Code != http.StatusOK || !bytes.Contains(left.Body.Bytes(), []byte(`"joined":false`)) {
		t.Fatalf("Kotoba leave circle status %d: %s", left.Code, left.Body.String())
	}
	circlesRequest = httptest.NewRequest(http.MethodGet, "/api/kotoba/circles", nil)
	circlesRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	circles = httptest.NewRecorder()
	handler.ServeHTTP(circles, circlesRequest)
	if err := json.Unmarshal(circles.Body.Bytes(), &circleList); err != nil {
		t.Fatalf("decode Kotoba circle list after leave: %v", err)
	}
	foundLeft := false
	for _, circle := range circleList.Data {
		if circle.ID == circleID {
			foundLeft = !circle.Joined && circle.MembersCount == 1
			break
		}
	}
	if circles.Code != http.StatusOK || !foundLeft {
		t.Fatalf("Kotoba left circle still appears joined: status %d, body %s", circles.Code, circles.Body.String())
	}
	for _, route := range routes {
		if route.Handler == "me" || route.Handler == "home" || route.Handler == "community_seed" {
			continue
		}
		path := strings.ReplaceAll(route.Route, "{id}", "1")
		body := ""
		if route.Method != http.MethodGet && route.Method != http.MethodDelete {
			body = `{}`
		}
		switch route.Handler {
		case "complete_lesson":
			body = `{"score":101}`
		case "create_post":
			body = `{"body":"","lang":""}`
		case "add_comment":
			body = `{"body":""}`
		case "send_message":
			body = `{"body":"","lang":""}`
		case "correct_message":
			body = `{"corrected":""}`
		}
		request := httptest.NewRequest(route.Method, path, bytes.NewBufferString(body))
		request.Header.Set("Authorization", "Bearer "+loginResponse.Token)
		if body != "" {
			request.Header.Set("Content-Type", "application/json")
		}
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code == http.StatusNotImplemented ||
			response.Code == http.StatusMethodNotAllowed ||
			(response.Code == http.StatusNotFound && strings.Contains(response.Body.String(), `"message":"Not Found"`)) {
			t.Errorf("Kotoba Go handler %q was not executed: status %d, body %s",
				route.Handler, response.Code, response.Body.String())
		}
	}
	for _, testCase := range []struct {
		method, path, body string
	}{
		{http.MethodPost, "/api/kotoba/posts", `{"body":"","lang":""}`},
		{http.MethodPost, "/api/kotoba/posts/1/comments", `{"body":""}`},
		{http.MethodPost, "/api/kotoba/lessons/999/complete", `{"score":101}`},
		{http.MethodPost, "/api/kotoba/messages", `{"body":"","lang":""}`},
		{http.MethodPost, "/api/kotoba/messages/1/correct", `{"corrected":""}`},
	} {
		request := httptest.NewRequest(testCase.method, testCase.path, bytes.NewBufferString(testCase.body))
		request.Header.Set("Authorization", "Bearer "+loginResponse.Token)
		request.Header.Set("Content-Type", "application/json")
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, request)
		if response.Code != http.StatusUnprocessableEntity {
			t.Errorf("Kotoba handler %s status = %d, want %d: %s",
				testCase.path, response.Code, http.StatusUnprocessableEntity, response.Body.String())
		}
	}
}

func TestProtectedTargetModulesDoNotPretendToAuthenticate(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	fixtures := []struct {
		name, table, model, route, operation, middleware string
	}{
		{"mail-test", "mail_logs", "MailLog", "/send", "store", `["auth"]`},
		{"body-mail-notification", "send_log", "SendLog", "/send-mail", "sendMail", `["auth"]`},
		{"notification-test", "notifications", "Notification", "/inbox", "index", `["auth"]`},
		{"kotoba", "profiles", "Profile", "/", "index", `["auth:sanctum"]`},
	}
	for _, fixture := range fixtures {
		build := fmt.Sprintf(`{"name":%q,"backendVariant":"go","databases":[{"table":%q,"columns":{"value":{"type":"string"}}}],"apis":[{"model":%q,"controller":"TestController","prefix":%q,"middleware":%s,"endpoints":{%q:{"method":"GET","route":%q}}}]}`,
			fixture.name, fixture.table, fixture.model, "/api/"+fixture.name, fixture.middleware, fixture.operation, fixture.route)
		if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
			t.Fatalf("build %s status %d: %s", fixture.name, response.Code, response.Body.String())
		}
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/"+fixture.name+fixture.route, nil))
		if response.Code != http.StatusNotImplemented {
			t.Errorf("%s auth status = %d, body = %s", fixture.name, response.Code, response.Body.String())
		}
	}
}

func TestAuthOnlyModuleSupportsRegisterLoginMeAndLogout(t *testing.T) {
	storage := testStorageDir(t)
	databaseDir := filepath.Join(storage, "databases")
	if err := os.MkdirAll(databaseDir, 0o755); err != nil {
		t.Fatal(err)
	}
	legacyDB, err := sql.Open("sqlite", filepath.Join(databaseDir, "auth-test.sqlite"))
	if err != nil {
		t.Fatal(err)
	}
	if _, err := legacyDB.Exec(`CREATE TABLE "users" (
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"name" TEXT NOT NULL,
		"email" TEXT NOT NULL UNIQUE,
		"password" TEXT NOT NULL,
		"role" TEXT NOT NULL DEFAULT 'user',
		"created_at" TEXT NULL,
		"updated_at" TEXT NULL
	)`); err != nil {
		_ = legacyDB.Close()
		t.Fatal(err)
	}
	if err := legacyDB.Close(); err != nil {
		t.Fatal(err)
	}
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storage}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"auth-test","backendVariant":"go","auth":true,"authSeed":{"users":[{"name":"Seeded User","email":"seeded@arkzen.local","password":"password","role":"user"}]}}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("auth-only build status %d: %s", response.Code, response.Body.String())
	}

	seededLogin := perform(handler, http.MethodPost, "/api/auth-test/auth/login",
		`{"email":"seeded@arkzen.local","password":"password"}`, "")
	if seededLogin.Code != http.StatusOK {
		t.Fatalf("seeded user login status = %d: %s", seededLogin.Code, seededLogin.Body.String())
	}
	invalidLogin := perform(handler, http.MethodPost, "/api/auth-test/auth/login",
		`{"email":"missing@arkzen.local","password":"password"}`, "")
	if invalidLogin.Code != http.StatusUnprocessableEntity ||
		!bytes.Contains(invalidLogin.Body.Bytes(), []byte(`"message":"The given data was invalid."`)) ||
		!bytes.Contains(invalidLogin.Body.Bytes(), []byte(`"email":["The provided credentials are incorrect."]`)) {
		t.Fatalf("invalid login response = %d: %s", invalidLogin.Code, invalidLogin.Body.String())
	}

	unauthenticated := httptest.NewRecorder()
	handler.ServeHTTP(unauthenticated, httptest.NewRequest(http.MethodGet, "/api/auth-test/auth/me", nil))
	if unauthenticated.Code != http.StatusUnauthorized {
		t.Fatalf("unauthenticated /me status = %d: %s", unauthenticated.Code, unauthenticated.Body.String())
	}

	registered := perform(handler, http.MethodPost, "/api/auth-test/auth/register",
		`{"name":"Test User","email":"test@arkzen.local","password":"password","password_confirmation":"password"}`, "")
	if registered.Code != http.StatusCreated {
		t.Fatalf("register status = %d: %s", registered.Code, registered.Body.String())
	}
	var registerResponse struct {
		User  authUser `json:"user"`
		Token string   `json:"token"`
	}
	if err := json.Unmarshal(registered.Body.Bytes(), &registerResponse); err != nil || registerResponse.Token == "" {
		t.Fatalf("invalid register response: %s (error %v)", registered.Body.String(), err)
	}
	if bytes.Contains(registered.Body.Bytes(), []byte(`"password"`)) {
		t.Fatalf("registration leaked password: %s", registered.Body.String())
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatal(err)
	}
	login := perform(restarted, http.MethodPost, "/api/auth-test/auth/login",
		`{"email":"test@arkzen.local","password":"password"}`, "")
	if login.Code != http.StatusOK {
		t.Fatalf("login status = %d: %s", login.Code, login.Body.String())
	}
	var loginResponse struct {
		User  authUser `json:"user"`
		Token string   `json:"token"`
	}
	if err := json.Unmarshal(login.Body.Bytes(), &loginResponse); err != nil || loginResponse.Token == "" {
		t.Fatalf("invalid login response: %s (error %v)", login.Body.String(), err)
	}

	meRequest := httptest.NewRequest(http.MethodGet, "/api/auth-test/auth/me", nil)
	meRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	me := httptest.NewRecorder()
	restarted.ServeHTTP(me, meRequest)
	if me.Code != http.StatusOK || !bytes.Contains(me.Body.Bytes(), []byte(`"email":"test@arkzen.local"`)) {
		t.Fatalf("authenticated /me status = %d: %s", me.Code, me.Body.String())
	}

	logoutRequest := httptest.NewRequest(http.MethodPost, "/api/auth-test/auth/logout", nil)
	logoutRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	logout := httptest.NewRecorder()
	restarted.ServeHTTP(logout, logoutRequest)
	if logout.Code != http.StatusOK {
		t.Fatalf("logout status = %d: %s", logout.Code, logout.Body.String())
	}
	meAfterLogoutRequest := httptest.NewRequest(http.MethodGet, "/api/auth-test/auth/me", nil)
	meAfterLogoutRequest.Header.Set("Authorization", "Bearer "+loginResponse.Token)
	meAfterLogout := httptest.NewRecorder()
	restarted.ServeHTTP(meAfterLogout, meAfterLogoutRequest)
	if meAfterLogout.Code != http.StatusUnauthorized {
		t.Fatalf("revoked token /me status = %d: %s", meAfterLogout.Code, meAfterLogout.Body.String())
	}
}

func TestQueueFlowRejectsUnlistedCustomHandler(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"queue-flow","backendVariant":"go","databases":[{"table":"queues","columns":{"name":{"type":"string"}}}],"customRoutes":[{"routes":[{"method":"GET","route":"/api/queue-flow/unlisted","handler":"executeSource","body":"arbitrary Go"}]}]}`
	response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret")
	if response.Code != http.StatusUnprocessableEntity || !bytes.Contains(response.Body.Bytes(), []byte("not supported")) {
		t.Fatalf("unlisted handler build status %d: %s", response.Code, response.Body.String())
	}
}

func TestEndpointEmulationTypesAreModuleScoped(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"crud-test","backendVariant":"go","databases":[{"table":"items","columns":{"name":{"type":"string"}}}],"apis":[{"model":"Item","controller":"ItemController","prefix":"/api/crud-test","endpoints":{"store":{"method":"POST","route":"/items","type":"job_dispatch"}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	response := perform(handler, http.MethodPost, "/api/crud-test/items", `{"job":"process-data"}`, "")
	if response.Code != http.StatusNotImplemented || !bytes.Contains(response.Body.Bytes(), []byte("job_dispatch")) {
		t.Fatalf("cross-module action status %d: %s", response.Code, response.Body.String())
	}
}

func TestCrudTestVariantUsesGenericSchemaAwareCRUD(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"crud-test","backendVariant":"go","databases":[{"table":"items","columns":{"name":{"type":"string","nullable":false},"status":{"type":"string","default":"active"}}}],"apis":[{"model":"Item","controller":"ItemController","prefix":"/api/crud-test","endpoints":{"index":{"method":"GET","route":"/items"},"store":{"method":"POST","route":"/items"},"show":{"method":"GET","route":"/items/{id}"},"update":{"method":"PUT","route":"/items/{id}"},"destroy":{"method":"DELETE","route":"/items/{id}","response":{"type":"message","value":"Item deleted"}}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	created := perform(handler, http.MethodPost, "/api/crud-test/items", `{"name":"Sample"}`, "")
	if created.Code != http.StatusCreated || !bytes.Contains(created.Body.Bytes(), []byte(`"name":"Sample"`)) {
		t.Fatalf("create status %d: %s", created.Code, created.Body.String())
	}
}

func TestCrudTestGoPolicyBlocksArchivedMutations(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	payload := BuildPayload{
		Name:           "crud-test",
		BackendVariant: "go",
		PolicySnippets: map[string]string{
			"update": base64.StdEncoding.EncodeToString([]byte(`return item == nil || item.Status != "archived"`)),
			"delete": base64.StdEncoding.EncodeToString([]byte(`return item == nil || item.Status != "archived"`)),
		},
		Databases: []DatabaseDefinition{{
			Table: "items",
			Columns: map[string]ColumnDefinition{
				"name":   {Type: "string", Nullable: boolPointer(false)},
				"status": {Type: "string", Default: json.RawMessage(`"active"`)},
			},
			Seeder: &SeederDefinition{Data: []map[string]json.RawMessage{
				{"name": json.RawMessage(`"Archived"`), "status": json.RawMessage(`"archived"`)},
				{"name": json.RawMessage(`"Active"`), "status": json.RawMessage(`"active"`)},
			}},
		}},
		APIs: []APIBlock{{
			Model: "Item", Controller: "ItemController", Prefix: "/api/crud-test",
			Policy: true,
			Endpoints: map[string]EndpointConfig{
				"update":  {Method: http.MethodPut, Route: "/items/{id}"},
				"destroy": {Method: http.MethodDelete, Route: "/items/{id}"},
			},
		}},
	}
	build, err := json.Marshal(payload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(build), "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	for _, action := range []struct {
		method, path, body string
	}{
		{http.MethodPut, "/api/crud-test/items/1", `{"name":"Changed"}`},
		{http.MethodDelete, "/api/crud-test/items/1", ""},
	} {
		if response := perform(handler, action.method, action.path, action.body, ""); response.Code != http.StatusForbidden {
			t.Errorf("archived %s status = %d, want 403: %s", action.method, response.Code, response.Body.String())
		}
	}
	if response := perform(handler, http.MethodPut, "/api/crud-test/items/2", `{"name":"Changed"}`, ""); response.Code != http.StatusOK {
		t.Fatalf("active update status %d: %s", response.Code, response.Body.String())
	}
	if response := perform(handler, http.MethodDelete, "/api/crud-test/items/2", "", ""); response.Code != http.StatusOK {
		t.Fatalf("active delete status %d: %s", response.Code, response.Body.String())
	}
}

func TestPayloadRetainsEndpointType(t *testing.T) {
	var payload BuildPayload
	if err := json.Unmarshal([]byte(`{"name":"job-test","apis":[{"model":"JobResult","controller":"C","endpoints":{"store":{"method":"POST","route":"/dispatch","type":"job_dispatch"}}}]}`), &payload); err != nil {
		t.Fatal(err)
	}
	if got := payload.APIs[0].Endpoints["store"].Type; got != "job_dispatch" {
		t.Fatalf("endpoint type = %q", got)
	}
}
