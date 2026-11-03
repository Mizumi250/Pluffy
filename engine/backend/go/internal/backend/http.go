package backend

import (
	"crypto/subtle"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"

	"github.com/go-chi/chi/v5"
)

const maxRequestBody = 10 << 20

var errBodyTooLarge = errors.New("request body exceeds 10 MiB")

type Handler struct {
	secret           string
	service          *Service
	rootDir          string
	realtime         *RealtimeHub
	router           http.Handler
	scheduleMu       sync.Mutex
	scheduledMinutes map[string]string
	backgroundWait   sync.WaitGroup
}

func NewHandler(config Config) (*Handler, error) {
	if config.Port < 1 || config.Port > 65535 {
		return nil, errors.New("port must be an integer from 1 to 65535")
	}
	if strings.TrimSpace(config.Secret) == "" {
		return nil, errors.New("engine secret must not be empty")
	}
	service, err := NewService(config.StorageDir)
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
	router := chi.NewRouter()
	router.NotFound(handler.apiOrNotFound)
	router.Get("/arkzen/health", handler.health)
	router.Get("/arkzen/registry", handler.registry)
	router.Method(http.MethodPost, "/arkzen/build", handler.authenticate(http.HandlerFunc(handler.build)))
	router.Method(http.MethodPost, "/arkzen/remove", handler.authenticate(http.HandlerFunc(handler.remove)))
	handler.router = router
	return handler, nil
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	h.router.ServeHTTP(w, r)
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
	metadata["modules"] = h.service.Registrations()
	writeJSON(w, http.StatusOK, metadata)
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
	if len(registration.APIs) > 0 {
		steps = append(steps, "CRUD API routes registered")
	}
	steps = append(steps, "Module registration persisted")
	writeJSON(w, http.StatusOK, map[string]any{
		"success": true,
		"message": "Tatemono registered and isolated SQLite schema initialized",
		"steps":   steps,
		"registry": map[string]any{
			"name": registration.Name, "backendVariant": registration.BackendVariant,
			"tables": registration.Tables, "registeredAt": registration.RegisteredAt,
		},
	})
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
		"steps":  []string{"Module registration removed", "Isolated SQLite database removed"},
		"errors": []string{},
	})
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
