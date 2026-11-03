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

	_ "modernc.org/sqlite"
)

func TestEngineContractAndPersistentRegistration(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}

	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}

	health := httptest.NewRecorder()
	handler.ServeHTTP(health, httptest.NewRequest(http.MethodGet, "/arkzen/health", nil))
	if health.Code != http.StatusOK {
		t.Fatalf("health status = %d, want %d", health.Code, http.StatusOK)
	}
	var healthBody map[string]any
	if err := json.Unmarshal(health.Body.Bytes(), &healthBody); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	if healthBody["status"] != "ok" || healthBody["backend"] != "go" {
		t.Fatalf("unexpected health response: %#v", healthBody)
	}

	buildBody := `{"name":"go-contract","backendVariant":"go","databases":[{"table":"items","columns":{"title":{"type":"string","nullable":false}}}]}`
	unauthorized := perform(handler, http.MethodPost, "/arkzen/build", buildBody, "")
	if unauthorized.Code != http.StatusForbidden {
		t.Fatalf("unauthorized build status = %d, want %d", unauthorized.Code, http.StatusForbidden)
	}

	invalid := perform(handler, http.MethodPost, "/arkzen/build", `{"name":"Invalid Name"}`, config.Secret)
	if invalid.Code != http.StatusUnprocessableEntity {
		t.Fatalf("invalid build status = %d, want %d", invalid.Code, http.StatusUnprocessableEntity)
	}

	built := perform(handler, http.MethodPost, "/arkzen/build", buildBody, config.Secret)
	if built.Code != http.StatusOK {
		t.Fatalf("build status = %d, response = %s", built.Code, built.Body.String())
	}
	var buildResponse map[string]any
	if err := json.Unmarshal(built.Body.Bytes(), &buildResponse); err != nil {
		t.Fatalf("decode build response: %v", err)
	}
	if buildResponse["success"] != true {
		t.Fatalf("build response is not successful: %s", built.Body.String())
	}

	databasePath := filepath.Join(storageDir, "databases", "go-contract.sqlite")
	db, err := sql.Open("sqlite", databasePath)
	if err != nil {
		t.Fatalf("open generated SQLite database: %v", err)
	}
	var tableCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM sqlite_master WHERE type = 'table' AND name = 'items'`).Scan(&tableCount); err != nil {
		t.Fatalf("query generated table: %v", err)
	}
	if tableCount != 1 {
		t.Fatalf("items table count = %d, want 1", tableCount)
	}
	var timestampCount int
	if err := db.QueryRow(`SELECT COUNT(*) FROM pragma_table_info('items') WHERE name IN ('created_at', 'updated_at')`).Scan(&timestampCount); err != nil {
		t.Fatalf("query generated timestamps: %v", err)
	}
	if timestampCount != 2 {
		t.Fatalf("timestamp column count = %d, want 2", timestampCount)
	}
	if err := db.Close(); err != nil {
		t.Fatalf("close generated database: %v", err)
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	registry := httptest.NewRecorder()
	restarted.ServeHTTP(registry, httptest.NewRequest(http.MethodGet, "/arkzen/registry", nil))
	if registry.Code != http.StatusOK || !bytes.Contains(registry.Body.Bytes(), []byte(`"go-contract"`)) {
		t.Fatalf("registration did not persist across restart: status %d, body %s", registry.Code, registry.Body.String())
	}

	removed := perform(restarted, http.MethodPost, "/arkzen/remove", `{"name":"go-contract"}`, config.Secret)
	if removed.Code != http.StatusOK {
		t.Fatalf("remove status = %d, response = %s", removed.Code, removed.Body.String())
	}
	if _, err := os.Stat(databasePath); !os.IsNotExist(err) {
		t.Fatalf("database still exists after remove (stat error = %v)", err)
	}
	missing := perform(restarted, http.MethodPost, "/arkzen/remove", `{"name":"go-contract"}`, config.Secret)
	if missing.Code != http.StatusNotFound {
		t.Fatalf("removing unknown module status = %d, want %d", missing.Code, http.StatusNotFound)
	}
}

func TestBuildRejectsWrongVariantAndMalformedJSON(t *testing.T) {
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: testStorageDir(t)})
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	wrongVariant := perform(handler, http.MethodPost, "/arkzen/build", `{"name":"sample","backendVariant":"py"}`, "test-secret")
	if wrongVariant.Code != http.StatusUnprocessableEntity {
		t.Fatalf("wrong variant status = %d, want %d", wrongVariant.Code, http.StatusUnprocessableEntity)
	}
	malformed := perform(handler, http.MethodPost, "/arkzen/build", `{"name":`, "test-secret")
	if malformed.Code != http.StatusBadRequest {
		t.Fatalf("malformed JSON status = %d, want %d", malformed.Code, http.StatusBadRequest)
	}
}

func TestBuildRegistersLiveCRUDRoutesAndPersistsThem(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	build := `{
		"name":"crud-module",
		"backendVariant":"go",
		"databases":[{"table":"items","timestamps":false,"columns":{
			"title":{"type":"string","nullable":false},
			"quantity":{"type":"integer","default":0}
		}}],
		"apis":[{"name":"items","model":"Item","controller":"ItemController","prefix":"/api/inventory","endpoints":{
			"index":{"method":"GET","route":"/items","response":{"type":"collection"}},
			"show":{"method":"GET","route":"/items/{id}","response":{"type":"single"}},
			"store":{"method":"POST","route":"/items","validation":{"title":"required|string|max:20","quantity":"integer|min:0"}},
			"update":{"method":"PUT","route":"/items/{id}","validation":{"title":"sometimes|string|max:20"}},
			"destroy":{"method":"DELETE","route":"/items/{id}","response":{"type":"message","value":"Item removed"}}
		}}]
	}`
	built := perform(handler, http.MethodPost, "/arkzen/build", build, config.Secret)
	if built.Code != http.StatusOK {
		t.Fatalf("build status = %d, response = %s", built.Code, built.Body.String())
	}

	created := perform(handler, http.MethodPost, "/api/inventory/items", `{"title":"Keyboard","quantity":4}`, "")
	if created.Code != http.StatusCreated {
		t.Fatalf("store status = %d, response = %s", created.Code, created.Body.String())
	}
	var createdResponse struct {
		Data map[string]any `json:"data"`
	}
	if err := json.Unmarshal(created.Body.Bytes(), &createdResponse); err != nil {
		t.Fatalf("decode store response: %v", err)
	}
	id := int(createdResponse.Data["id"].(float64))
	if createdResponse.Data["title"] != "Keyboard" {
		t.Fatalf("created response data = %#v", createdResponse.Data)
	}

	list := httptest.NewRecorder()
	handler.ServeHTTP(list, httptest.NewRequest(http.MethodGet, "/api/inventory/items", nil))
	if list.Code != http.StatusOK || !bytes.Contains(list.Body.Bytes(), []byte(`"count":1`)) {
		t.Fatalf("index response status = %d, body = %s", list.Code, list.Body.String())
	}
	show := httptest.NewRecorder()
	handler.ServeHTTP(show, httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/inventory/items/%d", id), nil))
	if show.Code != http.StatusOK || !bytes.Contains(show.Body.Bytes(), []byte(`"title":"Keyboard"`)) {
		t.Fatalf("show response status = %d, body = %s", show.Code, show.Body.String())
	}
	invalid := perform(handler, http.MethodPut, fmt.Sprintf("/api/inventory/items/%d", id), `{"title":"this title is too long to pass validation"}`, "")
	if invalid.Code != http.StatusUnprocessableEntity {
		t.Fatalf("invalid update status = %d, want %d", invalid.Code, http.StatusUnprocessableEntity)
	}
	updated := perform(handler, http.MethodPut, fmt.Sprintf("/api/inventory/items/%d", id), `{"title":"Mouse"}`, "")
	if updated.Code != http.StatusOK || !bytes.Contains(updated.Body.Bytes(), []byte(`"title":"Mouse"`)) {
		t.Fatalf("update status = %d, body = %s", updated.Code, updated.Body.String())
	}
	methodNotAllowed := httptest.NewRecorder()
	handler.ServeHTTP(methodNotAllowed, httptest.NewRequest(http.MethodPatch, "/api/inventory/items", nil))
	if methodNotAllowed.Code != http.StatusMethodNotAllowed {
		t.Fatalf("unsupported method status = %d, want %d", methodNotAllowed.Code, http.StatusMethodNotAllowed)
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	persisted := httptest.NewRecorder()
	restarted.ServeHTTP(persisted, httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/inventory/items/%d", id), nil))
	if persisted.Code != http.StatusOK || !bytes.Contains(persisted.Body.Bytes(), []byte(`"title":"Mouse"`)) {
		t.Fatalf("persisted show status = %d, body = %s", persisted.Code, persisted.Body.String())
	}
	deleted := httptest.NewRecorder()
	restarted.ServeHTTP(deleted, httptest.NewRequest(http.MethodDelete, fmt.Sprintf("/api/inventory/items/%d", id), nil))
	if deleted.Code != http.StatusOK || !bytes.Contains(deleted.Body.Bytes(), []byte("Item removed")) {
		t.Fatalf("destroy status = %d, body = %s", deleted.Code, deleted.Body.String())
	}
	missing := httptest.NewRecorder()
	restarted.ServeHTTP(missing, httptest.NewRequest(http.MethodGet, fmt.Sprintf("/api/inventory/items/%d", id), nil))
	if missing.Code != http.StatusNotFound {
		t.Fatalf("show after destroy status = %d, want %d", missing.Code, http.StatusNotFound)
	}
}

func TestRequireJSONMiddlewareEnforcesContentType(t *testing.T) {
	storageDir := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir})
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	build := `{
		"name":"middleware-test",
		"backendVariant":"go",
		"databases":[{"table":"ping_logs","columns":{"message":{"type":"string","nullable":false}}}],
		"apis":[{"model":"PingLog","controller":"PingLogController","table":"ping_logs","prefix":"/api/middleware-test","middleware":["requireJson"],"endpoints":{
			"store":{"method":"POST","route":"/ping","validation":{"message":"required|string"}}
		}}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", response.Code, response.Body.String())
	}

	withoutContentType := httptest.NewRecorder()
	handler.ServeHTTP(withoutContentType, httptest.NewRequest(http.MethodPost, "/api/middleware-test/ping", bytes.NewBufferString(`{"message":"blocked"}`)))
	if withoutContentType.Code != http.StatusUnsupportedMediaType || !bytes.Contains(withoutContentType.Body.Bytes(), []byte("application/json")) {
		t.Fatalf("missing content type status = %d, body = %s", withoutContentType.Code, withoutContentType.Body.String())
	}

	withContentType := httptest.NewRequest(http.MethodPost, "/api/middleware-test/ping", bytes.NewBufferString(`{"message":"accepted"}`))
	withContentType.Header.Set("Content-Type", "application/json; charset=utf-8")
	accepted := httptest.NewRecorder()
	handler.ServeHTTP(accepted, withContentType)
	if accepted.Code != http.StatusCreated {
		t.Fatalf("JSON content type status = %d, body = %s", accepted.Code, accepted.Body.String())
	}
}

func TestRegistryUsesPluffRootMetadata(t *testing.T) {
	root := testStorageDir(t)
	if err := os.WriteFile(filepath.Join(root, "arkzen.json"), []byte(`{"project":"demo-project","activeStack":"react-inertia","activeBackend":"go","activeDatabase":"sqlite"}`), 0o600); err != nil {
		t.Fatalf("write root registry: %v", err)
	}
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: filepath.Join(root, "storage"), RootDir: root})
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/arkzen/registry", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("registry status = %d, body = %s", response.Code, response.Body.String())
	}
	for _, field := range []string{`"project":"demo-project"`, `"activeStack":"react-inertia"`, `"activeBackend":"go"`, `"activeDatabase":"sqlite"`, `"modules":[]`} {
		if !bytes.Contains(response.Body.Bytes(), []byte(field)) {
			t.Fatalf("registry response missing %s: %s", field, response.Body.String())
		}
	}
}

func TestBuildSeedsDeclaredRowsAndResetsSeedsOnRebuild(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	build := `{
		"name":"inventory-management",
		"backendVariant":"go",
		"databases":[{"table":"inventories","timestamps":false,"columns":{
			"name":{"type":"string","nullable":false},
			"sku":{"type":"string","unique":true,"nullable":false},
			"quantity":{"type":"integer","default":0,"nullable":false},
			"price":{"type":"decimal","nullable":false},
			"category":{"type":"string","nullable":true},
			"description":{"type":"text","nullable":true}
		},"seeder":{"count":5,"data":[
			{"name":"Wireless Keyboard","sku":"WK-001","quantity":50,"price":1299.00,"category":"Electronics","description":"Compact wireless keyboard"},
			{"name":"USB Hub 4-Port","sku":"UH-001","quantity":120,"price":450.00,"category":"Electronics","description":"4-port USB 3.0 hub"},
			{"name":"Notebook A5","sku":"NB-001","quantity":200,"price":85.00,"category":"Stationery","description":"A5 lined notebook"},
			{"name":"Office Chair","sku":"OC-001","quantity":15,"price":8500.00,"category":"Furniture","description":"Ergonomic office chair"},
			{"name":"Monitor Stand","sku":"MS-001","quantity":30,"price":750.00,"category":"Furniture","description":"Adjustable monitor stand"}
		]}}],
		"apis":[{"model":"Inventory","controller":"InventoryController","table":"inventories","prefix":"/api/inventories","endpoints":{
			"index":{"method":"GET","route":"/","response":{"type":"collection"}},
			"store":{"method":"POST","route":"/","validation":{"name":"required|string","sku":"required|string","quantity":"required|integer","price":"required|numeric"}}
		}}]
	}`
	built := perform(handler, http.MethodPost, "/arkzen/build", build, config.Secret)
	if built.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", built.Code, built.Body.String())
	}
	if !bytes.Contains(built.Body.Bytes(), []byte(`"Seeded 5 rows: inventories (reset)"`)) {
		t.Fatalf("build response did not report seeding: %s", built.Body.String())
	}

	list := httptest.NewRecorder()
	handler.ServeHTTP(list, httptest.NewRequest(http.MethodGet, "/api/inventories/", nil))
	if list.Code != http.StatusOK || !bytes.Contains(list.Body.Bytes(), []byte(`"count":5`)) ||
		!bytes.Contains(list.Body.Bytes(), []byte(`"sku":"WK-001"`)) ||
		!bytes.Contains(list.Body.Bytes(), []byte(`"sku":"OC-001"`)) ||
		!bytes.Contains(list.Body.Bytes(), []byte(`"sku":"MS-001"`)) {
		t.Fatalf("seeded inventory response status = %d, body = %s", list.Code, list.Body.String())
	}

	added := perform(handler, http.MethodPost, "/api/inventories/", `{"name":"Temporary","sku":"TMP-001","quantity":1,"price":2}`, "")
	if added.Code != http.StatusCreated {
		t.Fatalf("store temporary item status = %d, body = %s", added.Code, added.Body.String())
	}
	rebuilt := perform(handler, http.MethodPost, "/arkzen/build", build, config.Secret)
	if rebuilt.Code != http.StatusOK {
		t.Fatalf("rebuild status = %d, body = %s", rebuilt.Code, rebuilt.Body.String())
	}
	list = httptest.NewRecorder()
	handler.ServeHTTP(list, httptest.NewRequest(http.MethodGet, "/api/inventories/", nil))
	if list.Code != http.StatusOK || !bytes.Contains(list.Body.Bytes(), []byte(`"count":5`)) ||
		bytes.Contains(list.Body.Bytes(), []byte(`"sku":"TMP-001"`)) {
		t.Fatalf("rebuild did not reset rows to declared seeds: status = %d, body = %s", list.Code, list.Body.String())
	}
}

func TestCustomEndpointEchoAndStatsEmulation(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	build := `{
		"name":"body-endpoint-handler",
		"backendVariant":"go",
		"databases":[{"table":"probe_results","columns":{
			"source":{"type":"string","nullable":false},
			"probe":{"type":"string","nullable":false},
			"payload":{"type":"text","nullable":true},
			"result":{"type":"text","nullable":true},
			"ok":{"type":"boolean","default":true}
		}}],
		"apis":[{"model":"ProbeResult","controller":"ProbeResultController","table":"probe_results","prefix":"/api/body-endpoint-handler","endpoints":{
			"echo":{"method":"POST","route":"/echo","body":"ZWNobyBib2R5"},
			"stats":{"method":"GET","route":"/stats","body":"c3RhdHMgYm9keQ=="}
		}}],
		"customRoutes":[{"controller":"ProbeUtilController","middleware":[],"routes":[
			{"method":"GET","route":"/api/body-endpoint-handler/ping","handler":"ping","body":"cGluZyBib2R5"},
			{"method":"POST","route":"/api/body-endpoint-handler/record-handler","handler":"recordHandler","body":"cmVjb3JkIGJvZHk="},
			{"method":"GET","route":"/api/body-endpoint-handler/latest","handler":"latest","body":"bGF0ZXN0IGJvZHk="}
		]}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, config.Secret); response.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", response.Code, response.Body.String())
	}

	echo := perform(handler, http.MethodPost, "/api/body-endpoint-handler/echo", `{"message":"hello","count":2}`, "")
	if echo.Code != http.StatusOK {
		t.Fatalf("echo status = %d, body = %s", echo.Code, echo.Body.String())
	}
	for _, field := range []string{`"injected":true`, `"field_count":2`, `"message":"hello"`, `"probe_id":1`} {
		if !bytes.Contains(echo.Body.Bytes(), []byte(field)) {
			t.Fatalf("echo response missing %s: %s", field, echo.Body.String())
		}
	}

	stats := httptest.NewRecorder()
	handler.ServeHTTP(stats, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/stats", nil))
	if stats.Code != http.StatusOK {
		t.Fatalf("stats status = %d, body = %s", stats.Code, stats.Body.String())
	}
	for _, field := range []string{`"total":1`, `"passed":1`, `"failed":0`, `"sources":["endpoint-body"]`} {
		if !bytes.Contains(stats.Body.Bytes(), []byte(field)) {
			t.Fatalf("stats response missing %s: %s", field, stats.Body.String())
		}
	}

	ping := httptest.NewRecorder()
	handler.ServeHTTP(ping, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/ping", nil))
	if ping.Code != http.StatusOK || !bytes.Contains(ping.Body.Bytes(), []byte(`"handler":"ping"`)) {
		t.Fatalf("ping status = %d, body = %s", ping.Code, ping.Body.String())
	}

	record := perform(handler, http.MethodPost, "/api/body-endpoint-handler/record-handler", `{"probe":"handler check","payload":"sample"}`, "")
	if record.Code != http.StatusOK || !bytes.Contains(record.Body.Bytes(), []byte(`"probe":"handler check"`)) {
		t.Fatalf("record handler status = %d, body = %s", record.Code, record.Body.String())
	}
	latest := httptest.NewRecorder()
	handler.ServeHTTP(latest, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/latest", nil))
	if latest.Code != http.StatusOK || !bytes.Contains(latest.Body.Bytes(), []byte(`"count":2`)) {
		t.Fatalf("latest status = %d, body = %s", latest.Code, latest.Body.String())
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	persisted := httptest.NewRecorder()
	restarted.ServeHTTP(persisted, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/latest", nil))
	if persisted.Code != http.StatusOK || !bytes.Contains(persisted.Body.Bytes(), []byte(`"count":2`)) {
		t.Fatalf("persisted custom route status = %d, body = %s", persisted.Code, persisted.Body.String())
	}
}

func TestLowStockEndpointEmulation(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	build := `{
		"name":"inventory-management",
		"backendVariant":"go",
		"databases":[{"table":"inventories","timestamps":false,"columns":{
			"name":{"type":"string","nullable":false},
			"quantity":{"type":"integer","default":0}
		}}],
		"apis":[{"name":"inventories","model":"Inventory","controller":"InventoryController","table":"inventories","prefix":"/api/inventories","endpoints":{
			"store":{"method":"POST","route":"/","validation":{"name":"required|string","quantity":"required|integer|min:0"}},
			"lowStock":{"method":"GET","route":"/low-stock","body":"bG93IHN0b2NrIGVtdWxhdGlvbg=="}
		}}]
	}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, config.Secret); response.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", response.Code, response.Body.String())
	}
	for _, item := range []struct {
		name     string
		quantity int
	}{{"zero", 0}, {"low", 15}, {"boundary", 20}, {"stocked", 50}} {
		body := fmt.Sprintf(`{"name":%q,"quantity":%d}`, item.name, item.quantity)
		if response := perform(handler, http.MethodPost, "/api/inventories/", body, ""); response.Code != http.StatusCreated {
			t.Fatalf("store %q status = %d, body = %s", item.name, response.Code, response.Body.String())
		}
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/inventories/low-stock", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("low-stock status = %d, body = %s", response.Code, response.Body.String())
	}
	for _, field := range []string{`"count":2`, `"name":"zero"`, `"name":"low"`} {
		if !bytes.Contains(response.Body.Bytes(), []byte(field)) {
			t.Fatalf("low-stock response missing %s: %s", field, response.Body.String())
		}
	}
	if bytes.Index(response.Body.Bytes(), []byte(`"name":"zero"`)) > bytes.Index(response.Body.Bytes(), []byte(`"name":"low"`)) {
		t.Fatalf("low-stock records are not quantity-ordered: %s", response.Body.String())
	}
}

func perform(handler http.Handler, method, path, body, secret string) *httptest.ResponseRecorder {
	request := httptest.NewRequest(method, path, bytes.NewBufferString(body))
	if secret != "" {
		request.Header.Set("X-Arkzen-Secret", secret)
	}
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	return response
}

func testStorageDir(t *testing.T) string {
	t.Helper()
	base := filepath.Join("testdata")
	if err := os.MkdirAll(base, 0o755); err != nil {
		t.Fatalf("create test storage base: %v", err)
	}
	directory, err := os.MkdirTemp(base, "engine-test-")
	if err != nil {
		t.Fatalf("create test storage: %v", err)
	}
	t.Cleanup(func() {
		if err := os.RemoveAll(directory); err != nil {
			t.Errorf("remove test storage: %v", err)
		}
	})
	return directory
}
