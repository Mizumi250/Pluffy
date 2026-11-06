package backend

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"log"
	"mime"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/pluff/pluff/engine/backend/go/generated"
)

const maxRequestBody = 10 << 20
const maxMultipartRequestBody = 50 << 20

var errBodyTooLarge = errors.New("request body exceeds 10 MiB")

type Handler struct {
	secret           string
	service          *Service
	rootDir          string
	realtime         *RealtimeHub
	router           http.Handler
	scheduleMu       sync.Mutex
	scheduledMinutes map[string]string
	recompileMu      sync.Mutex
	recompileTimer   *time.Timer
	backgroundWait   sync.WaitGroup
}

func NewHandler(config Config) (*Handler, error) {
	if config.Port < 1 || config.Port > 65535 {
		return nil, errors.New("port must be an integer from 1 to 65535")
	}
	if strings.TrimSpace(config.Secret) == "" {
		return nil, errors.New("engine secret must not be empty")
	}
	config.applyGeneratedDir()
	service, err := NewService(config)
	if err != nil {
		return nil, err
	}
	if config.RealtimeAppKey == "" {
		config.RealtimeAppKey = "arkzen-key"
	}
	if config.RealtimeSecret == "" {
		config.RealtimeSecret = "arkzen-secret"
	}
	handler := &Handler{
		secret: config.Secret, service: service, rootDir: config.RootDir,
		realtime:         NewRealtimeHub(config.RealtimeAppKey, config.RealtimeSecret),
		scheduledMinutes: make(map[string]string),
	}
	handler.installRuntimeHooks()
	services := engineServices{handler: handler}
	router := chi.NewRouter()
	generated.InstallAll(router, services)
	router.NotFound(services.Fallback)
	router.Handle("/storage/*", http.HandlerFunc(handler.serveStorage))
	router.Get("/arkzen/health", handler.health)
	router.Get("/arkzen/registry", handler.registry)
	router.Get("/arkzen/expo-registry", handler.expoRegistry)
	router.Method(http.MethodPost, "/arkzen/build", handler.authenticate(http.HandlerFunc(handler.build)))
	router.Method(http.MethodPost, "/arkzen/remove", handler.authenticate(http.HandlerFunc(handler.remove)))
	handler.router = router
	// On boot, NewService may rewrite registry.go to match the modules already
	// in the store — but this binary was compiled against the previous registry.
	// Verify the freshly regenerated tree compiles, then hand off to the
	// supervisor so the running process boots with the real routes installed.
	if service.registryChanged {
		if err := service.verifyCompiledModules(); err != nil {
			log.Printf("startup module verification failed: %v", err)
		} else {
			service.markCompiled()
			handler.scheduleRestart()
		}
	}
	return handler, nil
}

// scheduleRecompile debounces the engine-wide recompile that follows a
// tatemono build. The watcher pushes dozens of builds when start.js boots;
// each one would otherwise hold the service lock through a full `go build`
// and trigger its own restart. Instead, builds return fast (generation +
// registry only), and this timer fires a single verification once the burst
// settles — restarting only when the generated tree actually changed from
// what the running binary was compiled from.
func (h *Handler) scheduleRecompile() {
	h.recompileMu.Lock()
	defer h.recompileMu.Unlock()
	if h.recompileTimer != nil {
		h.recompileTimer.Stop()
	}
	h.recompileTimer = time.AfterFunc(3*time.Second, func() {
		if !h.service.generatedChanged() {
			return
		}
		if err := h.service.verifyCompiledModules(); err != nil {
			log.Printf("generated modules failed to compile: %v", err)
			return
		}
		h.service.markCompiled()
		h.scheduleRestart()
	})
}

// scheduleRestart exits the process after the current response is flushed;
// the start.js supervisor relaunches the engine so the freshly compiled
// generated modules (and reset yaegi universes) take effect. It only self-
// terminates under the supervisor (ARKZEN_GO_AUTORESTART=1); otherwise it
// just logs the requirement so tests and manual runs are never killed.
func (h *Handler) scheduleRestart() {
	if os.Getenv("ARKZEN_GO_AUTORESTART") != "1" {
		log.Printf("engine restart required to load recompiled tatemono modules (set ARKZEN_GO_AUTORESTART=1 to auto-restart)")
		return
	}
	go func() {
		time.Sleep(500 * time.Millisecond)
		log.Printf("restarting Go engine to load recompiled tatemono modules")
		os.Exit(75)
	}()
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.router.ServeHTTP(w, r)
}

func (h *Handler) serveStorage(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.WriteHeader(http.StatusMethodNotAllowed)
		return
	}
	relative := strings.TrimPrefix(r.URL.Path, "/storage/")
	relative = filepath.FromSlash(relative)
	if relative == "." || relative == "" || strings.Contains(relative, "..") {
		http.NotFound(w, r)
		return
	}
	full := filepath.Join(h.service.storageDir, relative)
	info, err := os.Stat(full)
	if err != nil || info.IsDir() {
		http.NotFound(w, r)
		return
	}
	name := filepath.Base(full)
	contentType := mime.TypeByExtension(strings.ToLower(filepath.Ext(name)))
	if contentType == "" {
		contentType = "application/octet-stream"
	}
	if strings.HasPrefix(contentType, "image/") {
		w.Header().Set("Content-Disposition", fmt.Sprintf(`inline; filename="%s"`, safeUploadName(name)))
	} else {
		w.Header().Set("Content-Disposition", fmt.Sprintf(`attachment; filename="%s"`, safeUploadName(name)))
	}
	w.Header().Set("Content-Type", contentType)
	http.ServeFile(w, r, full)
}

func (h *Handler) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{
		"status":  "ok",
		"engine":  "Pluff Go Backend Engine",
		"backend": "go",
		"variant": "go",
		"version": "1.0.0",
	})
}

func (h *Handler) registry(w http.ResponseWriter, _ *http.Request) {
	metadata, err := readRegistryMetadata(h.rootDir)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	modules, err := enrichRegistryModules(h.rootDir, h.service.Registrations(), metadata["activeBackend"].(string))
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	metadata["modules"] = modules
	writeJSON(w, http.StatusOK, metadata)
}

func (h *Handler) expoRegistry(w http.ResponseWriter, _ *http.Request) {
	registry, err := readExpoRegistry(h.rootDir)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, registry)
}

func (h *Handler) authenticate(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		provided := r.Header.Get("X-Arkzen-Secret")
		if len(provided) != len(h.secret) || subtle.ConstantTimeCompare([]byte(provided), []byte(h.secret)) != 1 {
			writeJSON(w, http.StatusForbidden, map[string]string{"message": "Invalid engine secret."})
			return
		}
		next.ServeHTTP(w, r)
	})
}

func (h *Handler) build(w http.ResponseWriter, r *http.Request) {
	var payload BuildPayload
	if err := decodeBody(w, r, &payload); err != nil {
		writeDecodeError(w, err)
		return
	}
	problems := ValidateBuild(payload)
	if len(problems) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"success": false, "message": "Validation failed", "errors": problems, "steps": []string{},
		})
		return
	}
	registration, err := h.service.Build(payload)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]any{
			"success": false, "message": "Build failed", "errors": []string{err.Error()},
		})
		return
	}
	steps := []string{"Isolated SQLite database ready", "Declared tables ready"}
	if payload.Auth {
		steps = append(steps, "Auth tables ready")
		if payload.AuthSeed != nil && len(payload.AuthSeed.Users) > 0 {
			steps = append(steps, fmt.Sprintf("Seeded %d auth user(s)", len(payload.AuthSeed.Users)))
		}
	}
	for _, database := range payload.Databases {
		if database.Seeder != nil && len(database.Seeder.Data) > 0 {
			steps = append(steps, fmt.Sprintf("Seeded %d rows: %s (reset)", len(database.Seeder.Data), database.Table))
		}
	}
	steps = append(steps, fmt.Sprintf("Generated %d Go module files", len(registration.GeneratedFiles)))
	if len(registration.APIs) > 0 {
		steps = append(steps, fmt.Sprintf("Registered %d generated API routes", len(registration.GeneratedRoutes)))
	}
	steps = append(steps, "Module registration persisted")
	models := make([]string, 0, len(registration.Databases))
	controllers := make([]string, 0, len(registration.APIs))
	for _, api := range registration.APIs {
		controllers = append(controllers, api.Controller)
	}
	for _, database := range registration.Databases {
		model := singularTableName(database.Table)
		for _, api := range registration.APIs {
			if api.Table == database.Table {
				model = api.Model
				break
			}
		}
		models = append(models, model)
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Build complete",
		"steps":   append(steps, "Generated module sources written", "Engine recompile scheduled"),
		"errors":  []string{},
		"registry": map[string]any{
			"name": registration.Name, "backendVariant": registration.BackendVariant,
			"tables": registration.Tables, "models": models, "controllers": controllers,
			"routes": len(registration.GeneratedRoutes), "generatedFiles": registration.GeneratedFiles,
			"registeredAt": registration.RegisteredAt,
		},
	})
	h.scheduleRecompile()
}

func (h *Handler) remove(w http.ResponseWriter, r *http.Request) {
	var payload struct {
		Name string `json:"name"`
	}
	if err := decodeBody(w, r, &payload); err != nil {
		writeDecodeError(w, err)
		return
	}
	if payload.Name == "" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"success": false, "message": "Validation failed", "errors": []string{`Missing "name"`},
		})
		return
	}
	if !moduleNamePattern.MatchString(payload.Name) {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"success": false, "message": "Validation failed",
			"errors": []string{"Invalid tatemono name (lowercase letters, digits, dashes)"},
		})
		return
	}
	if err := h.service.Remove(payload.Name); err != nil {
		if errors.Is(err, errModuleNotRegistered) {
			writeJSON(w, http.StatusNotFound, map[string]any{"success": false, "message": err.Error()})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]any{"success": false, "message": err.Error()})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true, "message": "Module removed",
		"steps":  []string{"Module registration removed", "Isolated SQLite database removed", "Engine recompiled; restarting to drop module routes"},
		"errors": []string{},
	})
	h.scheduleRecompile()
}

func decodeBody(w http.ResponseWriter, r *http.Request, destination any) error {
	r.Body = http.MaxBytesReader(w, r.Body, maxRequestBody)
	decoder := json.NewDecoder(r.Body)
	if err := decoder.Decode(destination); err != nil {
		var tooLarge *http.MaxBytesError
		if errors.As(err, &tooLarge) {
			return errBodyTooLarge
		}
		return errors.New("request body must contain valid JSON")
	}
	var extra any
	if err := decoder.Decode(&extra); !errors.Is(err, io.EOF) {
		return errors.New("request body must contain exactly one JSON value")
	}
	return nil
}

func writeDecodeError(w http.ResponseWriter, err error) {
	status := http.StatusBadRequest
	if errors.Is(err, errBodyTooLarge) {
		status = http.StatusRequestEntityTooLarge
	}
	writeJSON(w, status, map[string]string{"message": err.Error()})
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}
