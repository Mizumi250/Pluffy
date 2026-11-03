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
