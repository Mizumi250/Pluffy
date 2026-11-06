package backend

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"fmt"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"

	"github.com/pluff/pluff/engine/backend/go/internal/modulespec"
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
	generatedDirectory := filepath.Join(generatedDirFor(storageDir), "go-contract")
	for _, name := range []string{"models.go", "module.go"} {
		if _, err := os.Stat(filepath.Join(generatedDirectory, name)); err != nil {
			t.Fatalf("generated source %q is missing: %v", name, err)
		}
	}
	registrations := handler.service.Registrations()
	if len(registrations) != 1 || len(registrations[0].GeneratedRoutes) != 0 || len(registrations[0].GeneratedFiles) != 2 {
		t.Fatalf("generated registration metadata = %#v", registrations)
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

	if err := os.RemoveAll(generatedDirectory); err != nil {
		t.Fatalf("remove generated sources before restart: %v", err)
	}
	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	if _, err := os.Stat(filepath.Join(generatedDirectory, "module.go")); err != nil {
		t.Fatalf("generated module was not restored on startup: %v", err)
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
	if _, err := os.Stat(generatedDirectory); !os.IsNotExist(err) {
		t.Fatalf("generated module sources still exist after remove (stat error = %v)", err)
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

func TestBuildGeneratesCRUDRoutesAndPersistsThem(t *testing.T) {
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
	generatedDirectory := filepath.Join(generatedDirFor(storageDir), "crud-module")
	for _, name := range []string{"models.go", "module.go"} {
		if _, err := os.Stat(filepath.Join(generatedDirectory, name)); err != nil {
			t.Fatalf("generated source %q is missing: %v", name, err)
		}
	}
	registrations := handler.service.Registrations()
	if len(registrations) != 1 || len(registrations[0].GeneratedRoutes) != 5 || len(registrations[0].GeneratedFiles) != 2 {
		t.Fatalf("generated registration metadata = %#v", registrations)
	}
	moduleSource, err := os.ReadFile(filepath.Join(generatedDirectory, "module.go"))
	if err != nil {
		t.Fatalf("read generated module source: %v", err)
	}
	for _, expected := range []string{
		`"/api/inventory/items"`,
		`"/api/inventory/items/{id}"`,
		"svc.List",
		"svc.Read",
		"svc.Create",
		"svc.Modify",
		"svc.Remove",
	} {
		if !bytes.Contains(moduleSource, []byte(expected)) {
			t.Errorf("generated module source does not contain %q", expected)
		}
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	registry := httptest.NewRecorder()
	restarted.ServeHTTP(registry, httptest.NewRequest(http.MethodGet, "/arkzen/registry", nil))
	if registry.Code != http.StatusOK || !bytes.Contains(registry.Body.Bytes(), []byte(`"crud-module"`)) {
		t.Fatalf("registration did not persist across restart: status %d, body %s", registry.Code, registry.Body.String())
	}
}

func TestPaginatedIndexMatchesFrameworkPaginatorShape(t *testing.T) {
	storageDir := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir})
	if err != nil {
		t.Fatal(err)
	}
	build := `{"name":"pagination-test","backendVariant":"go","databases":[{"table":"event_log","timestamps":false,"columns":{"event_name":{"type":"string","nullable":false}}}],"apis":[{"model":"EventLog","controller":"EventLogController","table":"event_log","prefix":"/api/events-test","endpoints":{"index":{"method":"GET","route":"/log","response":{"type":"paginated"}}}}]}`
	if response := perform(handler, http.MethodPost, "/arkzen/build", build, "test-secret"); response.Code != http.StatusOK {
		t.Fatalf("build status %d: %s", response.Code, response.Body.String())
	}
	db, err := openModuleDatabase(storageDir, "pagination-test")
	if err != nil {
		t.Fatal(err)
	}
	for _, event := range []string{"first", "second", "third"} {
		if _, err := db.Exec(`INSERT INTO "event_log" ("event_name") VALUES (?)`, event); err != nil {
			_ = db.Close()
			t.Fatal(err)
		}
	}
	_ = db.Close()

	request := httptest.NewRequest(http.MethodGet, "/api/events-test/log?per_page=2&page=2", nil)
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, request)
	var page struct {
		CurrentPage int              `json:"current_page"`
		Data        []map[string]any `json:"data"`
		PerPage     int              `json:"per_page"`
		Total       int              `json:"total"`
		LastPage    int              `json:"last_page"`
		From        int              `json:"from"`
		To          int              `json:"to"`
		NextPageURL *string          `json:"next_page_url"`
		PrevPageURL *string          `json:"prev_page_url"`
	}
	if response.Code != http.StatusOK || json.Unmarshal(response.Body.Bytes(), &page) != nil {
		t.Fatalf("paginated index status %d: %s", response.Code, response.Body.String())
	}
	if page.CurrentPage != 2 || page.PerPage != 2 || page.Total != 3 || page.LastPage != 2 ||
		page.From != 3 || page.To != 3 || len(page.Data) != 1 || page.Data[0]["event_name"] != "third" ||
		page.NextPageURL != nil || page.PrevPageURL == nil {
		t.Fatalf("unexpected paginator response: %#v; body = %s", page, response.Body.String())
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

func TestRegistryEnrichesModuleCompatibilityLikeHub(t *testing.T) {
	root := testStorageDir(t)
	if err := os.WriteFile(filepath.Join(root, "arkzen.json"), []byte(`{"activeStack":"expo","activeBackend":"go"}`), 0o600); err != nil {
		t.Fatalf("write root registry: %v", err)
	}
	sourcePath := filepath.Join(root, "tatemonos", "sample", "core.tsx")
	if err := os.MkdirAll(filepath.Dir(sourcePath), 0o700); err != nil {
		t.Fatalf("create Tatemono source directory: %v", err)
	}
	source := `/* @arkzen:meta
name: sample
auth: true
backend: rust
*/
/* @arkzen:web:page:index */
/* @arkzen:native:page:index */
/* @arkzen:native:page:lynx:index */
/* @arkzen:desktop:config */
/* @arkzen:endpoint:go:listUsers */
return true
/* @arkzen:endpoint:go:listUsers:end */
/* @arkzen:endpoint:ts:listUsers */
return true
/* @arkzen:endpoint:ts:listUsers:end */
`
	if err := os.WriteFile(sourcePath, []byte(source), 0o600); err != nil {
		t.Fatalf("write Tatemono source: %v", err)
	}
	staticSourcePath := filepath.Join(root, "tatemonos", "static-native", "core.tsx")
	if err := os.MkdirAll(filepath.Dir(staticSourcePath), 0o700); err != nil {
		t.Fatalf("create static Tatemono source directory: %v", err)
	}
	staticSource := `/* @arkzen:meta
name: static-native
*/
/* @arkzen:native:page:index */
`
	if err := os.WriteFile(staticSourcePath, []byte(staticSource), 0o600); err != nil {
		t.Fatalf("write static Tatemono source: %v", err)
	}
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: filepath.Join(root, "storage"), RootDir: root})
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	if err := handler.service.store.Register(Registration{Name: "sample", BackendVariant: "go"}); err != nil {
		t.Fatalf("register module: %v", err)
	}

	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/arkzen/registry", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("registry status = %d, body = %s", response.Code, response.Body.String())
	}
	var body struct {
		Modules []struct {
			Name     string   `json:"name"`
			Frontend []string `json:"frontend"`
			Backend  []string `json:"backend"`
		} `json:"modules"`
	}
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode registry response: %v", err)
	}
	if len(body.Modules) != 2 {
		t.Fatalf("unexpected registry modules: %+v", body.Modules)
	}
	modulesByName := make(map[string]struct {
		Name     string   `json:"name"`
		Frontend []string `json:"frontend"`
		Backend  []string `json:"backend"`
	})
	for _, module := range body.Modules {
		modulesByName[module.Name] = module
	}
	module, exists := modulesByName["sample"]
	if !exists {
		t.Fatalf("registered module missing from registry: %+v", body.Modules)
	}
	expectedFrontend := []string{"Next.js", "React + Vite", "React + Inertia", "Astro", "TanStack Start", "Expo", "React Native", "Lynx", "Tauri", "Electron"}
	expectedBackend := []string{"Go", "Express", "Rust"}
	if fmt.Sprint(module.Frontend) != fmt.Sprint(expectedFrontend) {
		t.Fatalf("frontend badges = %#v, want %#v", module.Frontend, expectedFrontend)
	}
	if fmt.Sprint(module.Backend) != fmt.Sprint(expectedBackend) {
		t.Fatalf("backend badges = %#v, want %#v", module.Backend, expectedBackend)
	}
	staticModule, exists := modulesByName["static-native"]
	if !exists {
		t.Fatalf("source-only module missing from registry: %+v", body.Modules)
	}
	if fmt.Sprint(staticModule.Frontend) != fmt.Sprint([]string{"Expo", "React Native"}) {
		t.Fatalf("source-only frontend badges = %#v", staticModule.Frontend)
	}
	if len(staticModule.Backend) != 0 {
		t.Fatalf("source-only backend badges = %#v", staticModule.Backend)
	}
}

func TestExpoRegistryServesNativeModulesFromPluffRoot(t *testing.T) {
	root := testStorageDir(t)
	if err := os.WriteFile(filepath.Join(root, "arkzen.json"), []byte(`{"activeBackend":"go"}`), 0o600); err != nil {
		t.Fatalf("write root registry: %v", err)
	}
	registryPath := filepath.Join(root, "engine", "frontend", "expo", "expo-registry.json")
	if err := os.MkdirAll(filepath.Dir(registryPath), 0o700); err != nil {
		t.Fatalf("create Expo registry directory: %v", err)
	}
	registryData := `{"engine":"1.0.0","project":"expo","modules":[{"name":"crud-test","status":"active","screens":["index"]}]}`
	if err := os.WriteFile(registryPath, []byte(registryData), 0o600); err != nil {
		t.Fatalf("write Expo registry: %v", err)
	}
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: filepath.Join(root, "storage"), RootDir: root})
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}

	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/arkzen/expo-registry", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("Expo registry status = %d, body = %s", response.Code, response.Body.String())
	}
	for _, field := range []string{`"project":"expo"`, `"name":"crud-test"`, `"screens":["index"]`} {
		if !bytes.Contains(response.Body.Bytes(), []byte(field)) {
			t.Fatalf("Expo registry response missing %s: %s", field, response.Body.String())
		}
	}

	if err := os.Remove(registryPath); err != nil {
		t.Fatalf("remove Expo registry fixture: %v", err)
	}
	missing := httptest.NewRecorder()
	handler.ServeHTTP(missing, httptest.NewRequest(http.MethodGet, "/arkzen/expo-registry", nil))
	if missing.Code != http.StatusOK || !bytes.Contains(missing.Body.Bytes(), []byte(`"modules":[]`)) {
		t.Fatalf("missing Expo registry status = %d, body = %s", missing.Code, missing.Body.String())
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
	closeTestModuleRuntime(t, handler, "body-endpoint-handler")
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
	var buildPayload map[string]any
	if err := json.Unmarshal([]byte(build), &buildPayload); err != nil {
		t.Fatal(err)
	}
	apis := buildPayload["apis"].([]any)
	endpoints := apis[0].(map[string]any)["endpoints"].(map[string]any)
	for _, operation := range []string{"echo", "stats"} {
		endpoints[operation].(map[string]any)["body"] = goTatemonoBody(t, "body-endpoint-handler", "endpoint", operation)
	}
	customRoutes := buildPayload["customRoutes"].([]any)
	routes := customRoutes[0].(map[string]any)["routes"].([]any)
	for _, rawRoute := range routes {
		route := rawRoute.(map[string]any)
		route["body"] = goTatemonoBody(t, "body-endpoint-handler", "handler", route["handler"].(string))
	}
	buildBytes, err := json.Marshal(buildPayload)
	if err != nil {
		t.Fatal(err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(buildBytes), config.Secret); response.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", response.Code, response.Body.String())
	}

	echo := perform(handler, http.MethodPost, "/api/body-endpoint-handler/echo", `{"message":"hello","count":2}`, "")
	if echo.Code != http.StatusOK {
		t.Fatalf("echo status = %d, body = %s", echo.Code, echo.Body.String())
	}
	for _, field := range []string{`"injected":true`, `"method":"echo"`, `"field_count":2`, `"message":"hello"`, `"probe_id":1`} {
		if !bytes.Contains(echo.Body.Bytes(), []byte(field)) {
			t.Fatalf("echo response missing %s: %s", field, echo.Body.String())
		}
	}

	stats := httptest.NewRecorder()
	handler.ServeHTTP(stats, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/stats", nil))
	if stats.Code != http.StatusOK {
		t.Fatalf("stats status = %d, body = %s", stats.Code, stats.Body.String())
	}
	for _, field := range []string{`"injected":true`, `"method":"stats"`, `"total":1`, `"passed":1`, `"failed":0`, `"sources":["endpoint-body"]`} {
		if !bytes.Contains(stats.Body.Bytes(), []byte(field)) {
			t.Fatalf("stats response missing %s: %s", field, stats.Body.String())
		}
	}

	ping := httptest.NewRecorder()
	handler.ServeHTTP(ping, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/ping", nil))
	if ping.Code != http.StatusOK || !bytes.Contains(ping.Body.Bytes(), []byte(`"handler":"ping"`)) ||
		!bytes.Contains(ping.Body.Bytes(), []byte(`"builder":"CustomRouteBuilder Go emulation"`)) {
		t.Fatalf("ping status = %d, body = %s", ping.Code, ping.Body.String())
	}

	record := perform(handler, http.MethodPost, "/api/body-endpoint-handler/record-handler", `{"probe":"handler check","payload":"sample"}`, "")
	if record.Code != http.StatusOK || !bytes.Contains(record.Body.Bytes(), []byte(`"probe":"handler check"`)) {
		t.Fatalf("record handler status = %d, body = %s", record.Code, record.Body.String())
	}
	latest := httptest.NewRecorder()
	handler.ServeHTTP(latest, httptest.NewRequest(http.MethodGet, "/api/body-endpoint-handler/latest", nil))
	if latest.Code != http.StatusOK || !bytes.Contains(latest.Body.Bytes(), []byte(`"count":2`)) ||
		!bytes.Contains(latest.Body.Bytes(), []byte(`"handler":"latest"`)) {
		t.Fatalf("latest status = %d, body = %s", latest.Code, latest.Body.String())
	}

	restarted, err := NewHandler(config)
	if err != nil {
		t.Fatalf("restart handler: %v", err)
	}
	closeTestModuleRuntime(t, restarted, "body-endpoint-handler")
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
			"show":{"method":"GET","route":"/{id}"},
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
	item := httptest.NewRecorder()
	handler.ServeHTTP(item, httptest.NewRequest(http.MethodGet, "/api/inventories/1", nil))
	if item.Code != http.StatusOK || !bytes.Contains(item.Body.Bytes(), []byte(`"name":"zero"`)) {
		t.Fatalf("parameter route stopped matching after static route: status = %d, body = %s", item.Code, item.Body.String())
	}
}

func TestCustomHandlerCanCallAnotherCustomHandler(t *testing.T) {
	storageDir := testStorageDir(t)
	config := Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir}
	handler, err := NewHandler(config)
	if err != nil {
		t.Fatalf("NewHandler() error = %v", err)
	}
	closeTestModuleRuntime(t, handler, "handler-bridge-test")

	payload := BuildPayload{
		Name:           "handler-bridge-test",
		BackendVariant: "go",
		CustomRoutes: []CustomRoute{{
			Controller: "BridgeController",
			Routes: []CustomRouteEntry{
				{
					Method:  http.MethodGet,
					Route:   "/api/handler-bridge-test/home",
					Handler: "home",
					Body: `if err := community_seed(ctx); err != nil {
	return response.Error(500, "seed failed")
}
return response.JSON("home")`,
				},
				{
					Method:  http.MethodPost,
					Route:   "/api/handler-bridge-test/internal/seed",
					Handler: "community_seed",
					Body:    `return nil`,
				},
				{
					Method:  http.MethodGet,
					Route:   "/api/handler-bridge-test/failing-home",
					Handler: "failing_home",
					Body: `if err := failing_seed(ctx); err != nil {
	return response.Error(500, err.Error())
}
return response.JSON("unexpected")`,
				},
				{
					Method:  http.MethodPost,
					Route:   "/api/handler-bridge-test/internal/failing-seed",
					Handler: "failing_seed",
					Body:    `return response.Error(503, "not available")`,
				},
			},
		}},
	}
	build, err := json.Marshal(payload)
	if err != nil {
		t.Fatalf("marshal build payload: %v", err)
	}
	if response := perform(handler, http.MethodPost, "/arkzen/build", string(build), config.Secret); response.Code != http.StatusOK {
		t.Fatalf("build status = %d, body = %s", response.Code, response.Body.String())
	}

	registration, exists := handler.service.store.Registration(payload.Name)
	if !exists {
		t.Fatal("handler bridge module was not registered")
	}
	runtime, err := handler.service.moduleRuntimeFor(payload.Name)
	if err != nil {
		t.Fatalf("load handler bridge runtime: %v", err)
	}
	response := runtime.Execute(
		httptest.NewRecorder(),
		httptest.NewRequest(http.MethodGet, "/api/handler-bridge-test/home", nil),
		modulespec.EndpointSpec{
			Operation: "home",
			Method:    http.MethodGet,
			Body:      payload.CustomRoutes[0].Routes[0].Body,
		},
		registration,
	)
	if response.Problem != "" || response.Status != http.StatusOK ||
		!bytes.Contains(response.Bytes, []byte(`"home"`)) {
		t.Fatalf("home execution = status %d, problem %q, body %s", response.Status, response.Problem, response.Bytes)
	}
	failed := runtime.Execute(
		httptest.NewRecorder(),
		httptest.NewRequest(http.MethodGet, "/api/handler-bridge-test/failing-home", nil),
		modulespec.EndpointSpec{
			Operation: "failing_home",
			Method:    http.MethodGet,
			Body:      payload.CustomRoutes[0].Routes[2].Body,
		},
		registration,
	)
	if failed.Problem != "" || failed.Status != http.StatusInternalServerError ||
		!bytes.Contains(failed.Bytes, []byte(`"handler failing_seed failed with status 503"`)) {
		t.Fatalf("failing handler bridge = status %d, problem %q, body %s", failed.Status, failed.Problem, failed.Bytes)
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

func TestUploadDSLMultipartIndexDestroyAndStatic(t *testing.T) {
	storageDir := testStorageDir(t)
	handler, err := NewHandler(Config{Port: 8000, Secret: "test-secret", StorageDir: storageDir})
	if err != nil {
		t.Fatal(err)
	}
	payload := `{"name":"upload-test","backendVariant":"go","databases":[{"table":"uploaded_files","timestamps":true,"columns":{"original_name":{"type":"string","nullable":false},"stored_name":{"type":"string","nullable":false},"mime_type":{"type":"string","nullable":false},"size_bytes":{"type":"integer","nullable":false},"disk_path":{"type":"string","nullable":false},"is_image":{"type":"boolean","nullable":false},"user_id":{"type":"integer","nullable":true}}}],"apis":[{"model":"UploadedFile","controller":"UploadedFileController","table":"uploaded_files","prefix":"/api/upload-test/files","endpoints":{"store":{"method":"POST","route":"/","type":"upload","validation":{"files":"required|array","files.*":"file|max:10240"},"response":{"type":"collection"}},"index":{"method":"GET","route":"/","type":"upload_index","response":{"type":"collection"}},"destroy":{"method":"DELETE","route":"/{id}","type":"upload_destroy","response":{"type":"message","value":"File deleted"}},"fileUrl":{"method":"GET","route":"/{id}/url","type":"upload_url","response":{"type":"single"}}}}]}`
	build := httptest.NewRecorder()
	req := httptest.NewRequest(http.MethodPost, "/arkzen/build", strings.NewReader(payload))
	req.Header.Set("X-Arkzen-Secret", "test-secret")
	handler.ServeHTTP(build, req)
	if build.Code != http.StatusOK {
		t.Fatalf("build status=%d body=%s", build.Code, build.Body.String())
	}

	var body bytes.Buffer
	writer := multipart.NewWriter(&body)
	for _, name := range []string{"first.txt", "second.txt"} {
		file, err := writer.CreateFormFile("files[]", name)
		if err != nil {
			t.Fatal(err)
		}
		if _, err := file.Write(bytes.Repeat([]byte("x"), 6<<20)); err != nil {
			t.Fatal(err)
		}
	}
	_ = writer.Close()
	upload := httptest.NewRecorder()
	req = httptest.NewRequest(http.MethodPost, "/api/upload-test/files", &body)
	req.Header.Set("Content-Type", writer.FormDataContentType())
	handler.ServeHTTP(upload, req)
	if upload.Code != http.StatusCreated {
		t.Fatalf("upload status=%d body=%s", upload.Code, upload.Body.String())
	}

	index := httptest.NewRecorder()
	handler.ServeHTTP(index, httptest.NewRequest(http.MethodGet, "/api/upload-test/files", nil))
	if index.Code != http.StatusOK || !bytes.Contains(index.Body.Bytes(), []byte(`"/storage/arkzen/upload-test/`)) {
		t.Fatalf("index status=%d body=%s", index.Code, index.Body.String())
	}
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
	storage := filepath.Join(directory, "storage")
	if err := os.MkdirAll(storage, 0o755); err != nil {
		t.Fatalf("create isolated test storage: %v", err)
	}
	t.Cleanup(func() {
		if err := os.RemoveAll(directory); err != nil {
			t.Errorf("remove test storage: %v", err)
		}
	})
	return storage
}
