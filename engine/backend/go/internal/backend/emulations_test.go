package backend

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"
)

func TestAsyncAndRealtimeModuleEmulations(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	builds := []string{
		`{"name":"job-test","backendVariant":"go","databases":[{"table":"job_results","columns":{"job_name":{"type":"string","nullable":false},"status":{"type":"string","nullable":false},"result":{"type":"text"},"processed_at":{"type":"datetime"}}}],"apis":[{"model":"JobResult","controller":"JobResultController","prefix":"/api/job-test","endpoints":{"store":{"method":"POST","route":"/dispatch","type":"job_dispatch"}}}]}`,
		`{"name":"scheduler-test","backendVariant":"go","databases":[{"table":"command_runs","columns":{"command_name":{"type":"string","nullable":false},"signature":{"type":"string","nullable":false},"exit_code":{"type":"integer","default":0},"output":{"type":"text"},"triggered_by":{"type":"string","default":"manual"},"duration_ms":{"type":"integer"}}}],"apis":[{"model":"CommandRun","controller":"CommandRunController","prefix":"/api/scheduler-test","endpoints":{"store":{"method":"POST","route":"/run","type":"command_run"},"destroy":{"method":"DELETE","route":"/runs","response":{"type":"message","value":"Runs cleared"}}}}]}`,
		`{"name":"events-test","backendVariant":"go","databases":[{"table":"event_log","columns":{"event_name":{"type":"string","nullable":false},"listener_name":{"type":"string","nullable":false},"status":{"type":"string","default":"completed"},"payload":{"type":"text"},"duration_ms":{"type":"integer"}}}],"apis":[{"model":"EventLog","controller":"EventLogController","prefix":"/api/events-test","endpoints":{"store":{"method":"POST","route":"/fire","type":"event_fire"},"clearLog":{"method":"POST","route":"/log/clear","response":{"type":"message","value":"Log cleared"}}}}]}`,
		`{"name":"broadcast-test","backendVariant":"go","auth":true,"authSeed":{"users":[{"name":"Broadcast User","email":"broadcast@arkzen.local","password":"password"}]},"databases":[{"table":"messages","columns":{"user_id":{"type":"integer"},"content":{"type":"string","nullable":false},"channel_type":{"type":"string"}}}],"apis":[{"model":"Message","controller":"MessageController","prefix":"/api/broadcast-test/messages","endpoints":{"store":{"method":"POST","route":"/","type":"broadcast"}}}]}`,
	}
	for _, build := range builds {
		if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
			t.Fatalf("build failed: status %d, response %s", response.Code, response.Body.String())
		}
	}

	job := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"process-data"}`, "")
	if job.Code != http.StatusCreated || !bytes.Contains(job.Body.Bytes(), []byte(`"status":"completed"`)) {
		t.Fatalf("job emulation status %d: %s", job.Code, job.Body.String())
	}
	invalidJob := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"arbitrary"}`, "")
	if invalidJob.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported job status = %d, body = %s", invalidJob.Code, invalidJob.Body.String())
	}
	failedJob := perform(handler, http.MethodPost, "/api/job-test/dispatch", `{"job":"always-fails"}`, "")
	if failedJob.Code != http.StatusCreated || !bytes.Contains(failedJob.Body.Bytes(), []byte(`"status":"failed"`)) || !bytes.Contains(failedJob.Body.Bytes(), []byte(`"configured_tries":2`)) {
		t.Fatalf("failed-job emulation status %d: %s", failedJob.Code, failedJob.Body.String())
	}

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

	event := perform(handler, http.MethodPost, "/api/events-test/fire", `{"event":"OrderPlaced","payload":{"order_id":7}}`, "")
	if event.Code != http.StatusCreated {
		t.Fatalf("event emulation status %d: %s", event.Code, event.Body.String())
	}
	var eventBody struct {
		Listeners []string `json:"listeners"`
		Data      []any    `json:"data"`
	}
	if err := json.Unmarshal(event.Body.Bytes(), &eventBody); err != nil || len(eventBody.Listeners) != 3 || len(eventBody.Data) != 3 {
		t.Fatalf("event listener results = %#v, error = %v", eventBody, err)
	}
	if response := perform(handler, http.MethodPost, "/api/events-test/fire", `{"event":"arbitrary"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported event status = %d, body = %s", response.Code, response.Body.String())
	}
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
		Token string `json:"token"`
	}
	if login.Code != http.StatusOK || json.Unmarshal(login.Body.Bytes(), &loginBody) != nil || loginBody.Token == "" {
		t.Fatalf("broadcast auth login status %d: %s", login.Code, login.Body.String())
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
	privatePoll := httptest.NewRequest(http.MethodGet, "/api/broadcast-test/sse-poll/private?after_id=0", nil)
	privatePoll.Header.Set("Authorization", "Bearer "+loginBody.Token)
	privatePollResponse := httptest.NewRecorder()
	handler.ServeHTTP(privatePollResponse, privatePoll)
	if privatePollResponse.Code != http.StatusOK ||
		!bytes.Contains(privatePollResponse.Body.Bytes(), []byte(`"event":"broadcast-test.message-sent-private"`)) ||
		!bytes.Contains(privatePollResponse.Body.Bytes(), []byte(`"content":"Private hello"`)) {
		t.Fatalf("private broadcast poll status %d: %s", privatePollResponse.Code, privatePollResponse.Body.String())
	}
}

func TestDTRGeofencingEmulation(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
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
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	db, err := openModuleDatabase(storage, "dtr-geofencing")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO "employees" ("id","name","email","is_active") VALUES (1,'Ada','ada@example.com',1)`); err != nil {
		t.Fatal(err)
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

func TestQueueFlowHandlerAllowlistAndStateTransitions(t *testing.T) {
	storage := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storage})
	if err != nil {
		t.Fatal(err)
	}
	build := `{
		"name":"queue-flow","backendVariant":"go",
		"databases":[
			{"table":"queues","columns":{"name":{"type":"string"},"prefix":{"type":"string","default":"Q"},"is_active":{"type":"boolean","default":true},"avg_wait_minutes":{"type":"integer","default":5}}},
			{"table":"tickets","columns":{"queue_id":{"type":"integer"},"ticket_number":{"type":"string"},"customer_name":{"type":"string"},"status":{"type":"string"},"position":{"type":"integer"},"called_at":{"type":"datetime"},"served_at":{"type":"datetime"}}}
		],
		"apis":[
			{"model":"Queue","controller":"QueueController","prefix":"/api/queue-flow","endpoints":{"index":{"method":"GET","route":"/queues"}}},
			{"model":"Ticket","controller":"TicketController","prefix":"/api/queue-flow","endpoints":{"index":{"method":"GET","route":"/tickets"}}}
		],
		"customRoutes":[{"controller":"QueueController","middleware":[],"routes":[
			{"method":"POST","route":"/api/queue-flow/join","handler":"join_queue"},
			{"method":"POST","route":"/api/queue-flow/call-next","handler":"call_next"},
			{"method":"GET","route":"/api/queue-flow/status/{queue_id}","handler":"queue_status"},
			{"method":"GET","route":"/api/queue-flow/my-ticket/{queue_id}/{ticket_number}","handler":"my_ticket"}
		]}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	db, err := openModuleDatabase(storage, "queue-flow")
	if err != nil {
		t.Fatal(err)
	}
	if _, err := db.Exec(`INSERT INTO "queues" ("id","name","prefix","is_active","avg_wait_minutes") VALUES (1,'General','G',1,5)`); err != nil {
		t.Fatal(err)
	}
	_ = db.Close()

	joined := perform(handler, http.MethodPost, "/api/queue-flow/join", `{"queue_id":1,"customer_name":"Ada"}`, "")
	if joined.Code != http.StatusOK || !bytes.Contains(joined.Body.Bytes(), []byte(`"ticket_number":"G-001"`)) {
		t.Fatalf("join status %d: %s", joined.Code, joined.Body.String())
	}
	if next := perform(handler, http.MethodPost, "/api/queue-flow/call-next", `{"queue_id":1}`, ""); next.Code != http.StatusOK || !bytes.Contains(next.Body.Bytes(), []byte(`"status":"serving"`)) {
		t.Fatalf("call-next status %d: %s", next.Code, next.Body.String())
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
	_ = db.Close()
	summary := httptest.NewRecorder()
	handler.ServeHTTP(summary, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/stats/summary", nil))
	for _, expected := range []string{`"total_active":1`, `"total_atm":1`, `"total_basic_pay":1000`, `"total_deductions":65`, `"net_pay":935`} {
		if summary.Code != http.StatusOK || !bytes.Contains(summary.Body.Bytes(), []byte(expected)) {
			t.Fatalf("payroll summary missing %s, status %d: %s", expected, summary.Code, summary.Body.String())
		}
	}
	group := httptest.NewRecorder()
	handler.ServeHTTP(group, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/group/GROUP%20A", nil))
	if group.Code != http.StatusOK || !bytes.Contains(group.Body.Bytes(), []byte(`"jor_number":1`)) {
		t.Fatalf("payroll group status %d: %s", group.Code, group.Body.String())
	}
	appointments := httptest.NewRecorder()
	handler.ServeHTTP(appointments, httptest.NewRequest(http.MethodGet, "/api/jo-payroll/job-orders/appointments/list", nil))
	if appointments.Code != http.StatusOK || !bytes.Contains(appointments.Body.Bytes(), []byte(`"appointment_order":1`)) {
		t.Fatalf("payroll appointments status %d: %s", appointments.Code, appointments.Body.String())
	}

	mailBuild := `{"name":"mail-test","backendVariant":"go","databases":[{"table":"mail_logs","columns":{"user_id":{"type":"integer"},"to_email":{"type":"string"},"subject":{"type":"string"},"mail_class":{"type":"string"},"status":{"type":"string"},"error":{"type":"text"}}}],"apis":[{"model":"MailLog","controller":"MailLogController","prefix":"/api/mail-test","middleware":[],"endpoints":{"store":{"method":"POST","route":"/send","type":"mail_send"}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", mailBuild, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("mail build status %d: %s", response.Code, response.Body.String())
	}
	mail := perform(handler, http.MethodPost, "/api/mail-test/send", `{"mail":"welcome-mail","to":"ada@example.com"}`, "")
	if mail.Code != http.StatusCreated || !bytes.Contains(mail.Body.Bytes(), []byte(`"status":"simulated"`)) {
		t.Fatalf("mail simulation status %d: %s", mail.Code, mail.Body.String())
	}
	if response := perform(handler, http.MethodPost, "/api/mail-test/send", `{"mail":"unknown","to":"ada@example.com"}`, ""); response.Code != http.StatusUnprocessableEntity {
		t.Fatalf("unsupported mail status %d: %s", response.Code, response.Body.String())
	}
}

func TestBodyMailAndNotificationSimulationEmulations(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"body-mail-notification","backendVariant":"go","databases":[{"table":"send_log","columns":{"user_id":{"type":"integer"},"to_email":{"type":"string"},"subject":{"type":"string"},"mail_class":{"type":"string"},"kind":{"type":"string"},"status":{"type":"string"},"error":{"type":"text"}}}],"apis":[{"model":"SendLog","controller":"SendLogController","prefix":"/api/body-mail-notification","middleware":[],"endpoints":{"sendMail":{"method":"POST","route":"/send-mail"},"notify":{"method":"POST","route":"/notify"}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	mail := perform(handler, http.MethodPost, "/api/body-mail-notification/send-mail", `{"mail":"receipt","to":"buyer@example.com"}`, "")
	if mail.Code != http.StatusCreated || !bytes.Contains(mail.Body.Bytes(), []byte(`"kind":"mail"`)) || !bytes.Contains(mail.Body.Bytes(), []byte(`"status":"simulated"`)) {
		t.Fatalf("mail simulation status %d: %s", mail.Code, mail.Body.String())
	}
	notification := perform(handler, http.MethodPost, "/api/body-mail-notification/notify", `{"notification":"summary","message":"Daily summary"}`, "")
	if notification.Code != http.StatusCreated || !bytes.Contains(notification.Body.Bytes(), []byte(`"kind":"notification"`)) {
		t.Fatalf("notification simulation status %d: %s", notification.Code, notification.Body.String())
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
		{"roles-test", "role_audit_logs", "RoleAuditLog", "/admin-only", "adminOnly", `["auth"]`},
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

func TestPayloadRetainsEndpointType(t *testing.T) {
	var payload BuildPayload
	if err := json.Unmarshal([]byte(`{"name":"job-test","apis":[{"model":"JobResult","controller":"C","endpoints":{"store":{"method":"POST","route":"/dispatch","type":"job_dispatch"}}}]}`), &payload); err != nil {
		t.Fatal(err)
	}
	if got := payload.APIs[0].Endpoints["store"].Type; got != "job_dispatch" {
		t.Fatalf("endpoint type = %q", got)
	}
}
