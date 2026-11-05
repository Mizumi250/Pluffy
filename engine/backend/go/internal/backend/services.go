package backend

import (
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/pluff/pluff/engine/backend/go/internal/modulespec"
	"github.com/pluff/pluff/engine/backend/go/internal/rt"
)

// engineServices is the concrete modulespec.Services handed to the compiled
// generated/<slug> packages at Install time. Generated routes call straight
// into these methods — there is no secondary path matching. CRUD reuses the
// schema-aware helpers; custom endpoints either run a DSL capability, execute
// a base64 `:go` body on the yaegi runtime, or answer with the declared
// message response.
type engineServices struct {
	handler *Handler
}

var _ modulespec.Services = engineServices{}

func (s engineServices) registration(name string) (Registration, bool) {
	return s.handler.service.store.Registration(name)
}

// ------------------------------------------------------------- middleware

func (s engineServices) allow(w http.ResponseWriter, r *http.Request, registration Registration, middleware []string) bool {
	for _, name := range middleware {
		switch name {
		case "auth", "auth:sanctum":
			if !registration.Auth {
				writeJSON(w, http.StatusNotImplemented, map[string]string{
					"message": "Authentication middleware is not enabled for this module",
				})
				return false
			}
			_, _, ok, err := s.handler.resolveAuthUser(r, registration.Name)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
				return false
			}
			if !ok {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
				return false
			}
		case "requireJson":
			contentType := strings.ToLower(strings.TrimSpace(strings.Split(r.Header.Get("Content-Type"), ";")[0]))
			if contentType != "application/json" && !strings.HasSuffix(contentType, "+json") {
				writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{
					"message": "Content-Type: application/json is required for this endpoint.",
					"hint":    "Set the Content-Type header to application/json",
				})
				return false
			}
		default:
			writeJSON(w, http.StatusNotImplemented, map[string]string{
				"message": fmt.Sprintf("Middleware %q is not implemented by the Go engine", name),
			})
			return false
		}
	}
	return true
}

// ------------------------------------------------------------------- CRUD

func (s engineServices) tableContext(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) (*sql.DB, APIBlock, string, bool) {
	registration, known := s.registration(module.Name)
	if !known {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Module is not registered"})
		return nil, APIBlock{}, "", false
	}
	if !s.allow(w, r, registration, module.Middleware) {
		return nil, APIBlock{}, "", false
	}
	db, err := openModuleDatabase(s.handler.service.storageDir, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return nil, APIBlock{}, "", false
	}
	_, primaryKey, err := inspectColumns(db, module.Table)
	if err != nil {
		_ = db.Close()
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
		return nil, APIBlock{}, "", false
	}
	return db, apiBlockFromSpec(registration, module, spec), primaryKey, true
}

// apiBlockFromSpec reconstructs the API-shaped context the CRUD helpers
// expect from the compile-time module and endpoint specs.
func apiBlockFromSpec(registration Registration, module modulespec.APIModule, spec modulespec.EndpointSpec) APIBlock {
	responseType := spec.ResponseType
	if spec.Paginated {
		responseType = "paginated"
	}
	api := APIBlock{
		Name:        spec.Operation,
		Table:       module.Table,
		Middleware:  module.Middleware,
		Policy:      len(module.Policies) > 0,
		SoftDeletes: module.SoftDeletes,
		Endpoints:   map[string]EndpointConfig{},
	}
	base := EndpointConfig{
		Method:     spec.Method,
		Type:       spec.Type,
		Validation: spec.Validation,
	}
	base.Response.Type = responseType
	base.Response.Value = spec.ResponseValue
	api.Endpoints[spec.Operation] = base
	// CRUD helpers look up validation and responses by canonical operation.
	for _, alias := range []string{"index", "store", "update", "destroy"} {
		if _, exists := api.Endpoints[alias]; !exists {
			api.Endpoints[alias] = base
		}
	}
	return api
}

func (s engineServices) List(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	db, api, primaryKey, ok := s.tableContext(w, r, module, spec)
	if !ok {
		return
	}
	defer db.Close()
	s.handler.indexRecords(w, r, db, quoteIdentifier(module.Table), api, primaryKey, module.Name)
}

func (s engineServices) Read(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	db, api, primaryKey, ok := s.tableContext(w, r, module, spec)
	if !ok {
		return
	}
	defer db.Close()
	s.handler.showRecord(w, db, quoteIdentifier(module.Table), api, primaryKey, routeID(r, spec))
}

func (s engineServices) Create(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	db, api, primaryKey, ok := s.tableContext(w, r, module, spec)
	if !ok {
		return
	}
	defer db.Close()
	columns, _, err := inspectColumns(db, module.Table)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
		return
	}
	s.handler.storeRecord(w, r, db, quoteIdentifier(module.Table), api, columns, primaryKey)
}

func (s engineServices) Modify(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	db, api, primaryKey, ok := s.tableContext(w, r, module, spec)
	if !ok {
		return
	}
	defer db.Close()
	columns, _, err := inspectColumns(db, module.Table)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
		return
	}
	s.handler.updateRecord(w, r, db, quoteIdentifier(module.Table), api, columns, primaryKey, routeID(r, spec), module.Policies)
}

func (s engineServices) Remove(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	db, api, primaryKey, ok := s.tableContext(w, r, module, spec)
	if !ok {
		return
	}
	defer db.Close()
	s.handler.destroyRecord(w, db, quoteIdentifier(module.Table), api, primaryKey, routeID(r, spec), module.Policies)
}

// routeID reads the {id} route parameter from chi, falling back to the
// first trailing path segment for direct (non-chi) executions.
func routeID(r *http.Request, spec modulespec.EndpointSpec) string {
	if value := chi.URLParam(r, "id"); value != "" {
		return value
	}
	relative := strings.TrimPrefix(normalizeRequestPath(r.URL.Path), spec.Path)
	relative = strings.Trim(relative, "/")
	if index := strings.Index(relative, "/"); index >= 0 {
		relative = relative[:index]
	}
	return relative
}

// --------------------------------------------------------------- custom

func (s engineServices) Custom(w http.ResponseWriter, r *http.Request, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	registration, known := s.registration(module.Name)
	if !known {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Module is not registered"})
		return
	}
	if !s.allow(w, r, registration, module.Middleware) {
		return
	}
	if isCapabilityEndpoint(spec.Type) {
		s.runCapability(w, r, registration, module, spec)
		return
	}
	if strings.TrimSpace(spec.Body) != "" {
		runtime, err := s.handler.service.moduleRuntimeFor(registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": err.Error()})
			return
		}
		result := runtime.Execute(w, r, spec, registration)
		switch {
		case result.Problem != "":
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": result.Problem})
		case result.Status != 0:
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(result.Status)
			_, _ = w.Write(result.Bytes)
		default:
			writeJSON(w, http.StatusOK, map[string]string{"message": "ok"})
		}
		return
	}
	if spec.ResponseType == "message" {
		message := spec.ResponseValue
		if message == "" {
			message = "ok"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
		return
	}
	writeJSON(w, http.StatusNotImplemented, map[string]string{
		"message": fmt.Sprintf("Go engine has no handler body or response for operation %q", spec.Operation),
	})
}

func (s engineServices) runCapability(w http.ResponseWriter, r *http.Request, registration Registration, module modulespec.APIModule, spec modulespec.EndpointSpec) {
	api := apiBlockFromSpec(registration, module, spec)
	match := matchedEndpoint{
		registration: registration,
		api:          api,
		operation:    spec.Operation,
		endpoint:     api.Endpoints[spec.Operation],
		id:           routeID(r, spec),
	}
	switch spec.Type {
	case "job_dispatch":
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
		data, _ := input["data"].(map[string]any)
		s.handler.dispatchQueuedJob(w, registration, name, data)
	case "mail_send":
		s.handler.sendMail(w, r, match)
	case "command_run":
		s.commandRun(w, r, registration)
	case "event_fire":
		s.handler.fireEvent(w, r, registration)
	case "broadcast":
		s.handler.sendBroadcastMessage(w, r, match)
	case "notification_trigger":
		s.notificationAction(w, r, registration, spec)
	default:
		writeJSON(w, http.StatusNotImplemented, map[string]string{
			"message": fmt.Sprintf("Go engine does not serve endpoint type %q", spec.Type),
		})
	}
}

// commandRun executes a declared console command: any name listed in the
// module's :consoles blocks, recorded as a command_runs row.
func (s engineServices) commandRun(w http.ResponseWriter, r *http.Request, registration Registration) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, valid := input["command"].(string)
	if !valid {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{`Field "command" has an unsupported value`},
		})
		return
	}
	declared := false
	for _, section := range parseRealtimeSections(registration.Consoles) {
		if section.name == name {
			declared = true
			break
		}
	}
	if !declared {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
			"message": "Validation failed", "errors": []string{`Field "command" has an unsupported value`},
		})
		return
	}
	triggeredBy := "manual"
	if value, supplied := input["triggered_by"].(string); supplied && value != "" {
		if value != "manual" && value != "schedule" {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
				"message": "Validation failed", "errors": []string{`Field "triggered_by" has an unsupported value`},
			})
			return
		}
		triggeredBy = value
	}
	record, err := recordCommandRun(s.handler.service.storageDir, registration.Name, name, triggeredBy)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record command run"})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record, "emulated": true})
}

// notificationAction serves the notification_trigger capability for the
// calling user: list mine, trigger one, delete one, or mark all read.
func (s engineServices) notificationAction(w http.ResponseWriter, r *http.Request, registration Registration, spec modulespec.EndpointSpec) {
	user, _, authenticated, err := s.handler.resolveAuthUser(r, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	db, err := openModuleDatabase(s.handler.service.storageDir, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open notification database"})
		return
	}
	defer db.Close()

	switch spec.Operation {
	case "index":
		rows, err := db.Query(`SELECT * FROM "notifications" WHERE "notifiable_type" = 'user' AND "notifiable_id" = ? ORDER BY "created_at" DESC`, user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to load notifications"})
			return
		}
		records, err := scanRecords(rows)
		_ = rows.Close()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read notifications"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": records})
	case "store":
		s.handler.triggerNotification(w, r, db, registration, user)
	case "destroy":
		result, err := db.Exec(`DELETE FROM "notifications" WHERE "id" = ? AND "notifiable_type" = 'user' AND "notifiable_id" = ?`, routeID(r, spec), user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to delete notification"})
			return
		}
		affected, err := result.RowsAffected()
		if err != nil || affected == 0 {
			writeJSON(w, http.StatusNotFound, map[string]string{"message": "Notification not found"})
			return
		}
		message := spec.ResponseValue
		if message == "" {
			message = "Notification deleted"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
	default:
		now := time.Now().UTC().Format(time.RFC3339Nano)
		if _, err := db.Exec(`UPDATE "notifications" SET "read_at" = ?, "updated_at" = ? WHERE "notifiable_type" = 'user' AND "notifiable_id" = ? AND "read_at" IS NULL`, now, now, user.ID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to mark notifications as read"})
			return
		}
		message := spec.ResponseValue
		if message == "" {
			message = "All notifications marked as read"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
	}
}

// ------------------------------------------------------- poll and fallback

func (s engineServices) BroadcastPoll(w http.ResponseWriter, r *http.Request, module modulespec.APIModule) {
	registration, known := s.registration(module.Name)
	if !known {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Module is not registered"})
		return
	}
	s.handler.pollBroadcastMessages(w, r, registration, APIBlock{Table: module.Table}, normalizeRequestPath(r.URL.Path))
}

func (s engineServices) Fallback(w http.ResponseWriter, r *http.Request) {
	path := normalizeRequestPath(r.URL.Path)
	for _, registration := range s.handler.service.Registrations() {
		if s.handler.serveAuthRoute(w, r, registration, path) {
			return
		}
	}
	writeJSON(w, http.StatusNotFound, map[string]string{"message": "Not Found"})
}

// ----------------------------------------------- engine-wide service hooks

// installRuntimeHooks wires the interpreted-runtime adapters: authenticated
// user lookup, realtime broadcast fan-out, and structured logging.
func (h *Handler) installRuntimeHooks() {
	h.service.logMessage = func(level, module, message string, meta map[string]any) {
		if len(meta) > 0 {
			log.Printf("[%s] %s: %s %v", level, module, message, meta)
			return
		}
		log.Printf("[%s] %s: %s", level, module, message)
	}
	h.service.broadcast = func(moduleName, section string, target any, payload map[string]any) error {
		registration, known := h.service.store.Registration(moduleName)
		if !known {
			return errModuleNotRegistered
		}
		userID := int64(0)
		switch value := target.(type) {
		case int:
			userID = int64(value)
		case int64:
			userID = value
		case float64:
			userID = int64(value)
		}
		channel, event, configured := resolveSectionBroadcastEvent(registration, section, userID, payload)
		if !configured {
			return fmt.Errorf("broadcast section %q is not configured for module %q", section, moduleName)
		}
		h.realtime.BroadcastTo(channel, event, payload)
		return nil
	}
	moduleUserResolver = func(r *http.Request, registration Registration) (*rt.User, bool) {
		user, _, authenticated, err := h.resolveAuthUser(r, registration.Name)
		if err != nil || !authenticated {
			return nil, false
		}
		return newRTUser(h.service.storageDir, registration.Name, user), true
	}
}

func newRTUser(storageDir, module string, user authUser) *rt.User {
	db, err := sharedModuleDatabase(storageDir, module)
	if err != nil {
		return rt.NewUser(int(user.ID), user.Name, user.Email, user.Role, nil)
	}
	return rt.NewUser(int(user.ID), user.Name, user.Email, user.Role, rt.NewDatabase(db, module, configuredDialect() == postgresDialect))
}

// sharedModuleDatabase caches one handle per module for interpreted user
// hydration; sqlite handles here are cheap and safe for concurrent use.
var sharedModuleDatabases sync.Map

func sharedModuleDatabase(storageDir, module string) (*sql.DB, error) {
	if cached, exists := sharedModuleDatabases.Load(module); exists {
		return cached.(*sql.DB), nil
	}
	db, err := openModuleDatabase(storageDir, module)
	if err != nil {
		return nil, err
	}
	actual, loaded := sharedModuleDatabases.LoadOrStore(module, db)
	if loaded {
		_ = db.Close()
	}
	return actual.(*sql.DB), nil
}

// resolveSectionBroadcastEvent mirrors resolveBroadcastEvent but selects the
// realtime section by DSL section name instead of channel type.
func resolveSectionBroadcastEvent(registration Registration, section string, userID int64, payload map[string]any) (string, string, bool) {
	for _, candidate := range parseRealtimeSections(registration.Realtimes) {
		if section != "" && candidate.name != section {
			continue
		}
		channel := candidate.values["channel"]
		if channel == "" {
			continue
		}
		resolved := realtimePlaceholder.ReplaceAllStringFunc(channel, func(placeholder string) string {
			name := strings.Trim(placeholder, "{}")
			switch name {
			case "id", "user_id":
				if userID > 0 {
					return strconv.FormatInt(userID, 10)
				}
			}
			normalizedName := strings.ToLower(strings.NewReplacer("_", "", "-", "").Replace(name))
			for key, value := range payload {
				if strings.ToLower(strings.NewReplacer("_", "", "-", "").Replace(key)) == normalizedName && value != nil {
					return fmt.Sprint(value)
				}
			}
			return ""
		})
		if resolved == "" || realtimePlaceholder.MatchString(resolved) {
			continue
		}
		prefix := ""
		if channelType := candidate.values["type"]; channelType == "private" || channelType == "presence" {
			prefix = channelType + "-"
		}
		return prefix + resolved, registration.Name + "." + candidate.name, true
	}
	return "", "", false
}
