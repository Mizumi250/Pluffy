package backend

import (
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"mime"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"time"
)

func defaultEndpoints() map[string]EndpointConfig {
	return map[string]EndpointConfig{
		"index":   {Method: http.MethodGet, Route: "/"},
		"show":    {Method: http.MethodGet, Route: "/{id}"},
		"store":   {Method: http.MethodPost, Route: "/"},
		"update":  {Method: http.MethodPut, Route: "/{id}"},
		"destroy": {Method: http.MethodDelete, Route: "/{id}"},
	}
}

func normalizeRoutePath(path string) string {
	if path == "" || path == "/" {
		return "/"
	}
	return "/" + strings.Trim(path, "/")
}

func endpointRoute(operation string, endpoint EndpointConfig) string {
	if endpoint.Route != "" {
		return normalizeRoutePath(endpoint.Route)
	}
	switch operation {
	case "index", "store":
		return "/"
	default:
		return "/{id}"
	}
}

func endpointMethod(operation string, endpoint EndpointConfig) string {
	if endpoint.Method != "" {
		return strings.ToUpper(endpoint.Method)
	}
	switch operation {
	case "index", "show":
		return http.MethodGet
	case "store":
		return http.MethodPost
	case "update":
		return http.MethodPut
	case "destroy":
		return http.MethodDelete
	default:
		return ""
	}
}

type matchedEndpoint struct {
	registration  Registration
	api           APIBlock
	operation     string
	endpoint      EndpointConfig
	id            string
	customHandler string
}

func (h *Handler) apiOrNotFound(w http.ResponseWriter, r *http.Request) {
	path := normalizeRequestPath(r.URL.Path)
	registrations := h.service.Registrations()
	for _, registration := range registrations {
		if h.serveAuthRoute(w, r, registration, path) {
			return
		}
		if r.Method == http.MethodGet {
			for _, route := range registration.GeneratedRoutes {
				if route.Kind != "api" || route.APIIndex < 0 || route.APIIndex >= len(registration.APIs) || route.Operation == "" {
					continue
				}
				endpoint, exists := registration.APIs[route.APIIndex].Endpoints[route.Operation]
				if !exists || endpoint.Type != "broadcast" {
					continue
				}
				_, matched := matchRoute("/api/"+registration.Name+"/sse-poll/{channelType}", path)
				if matched {
					h.pollBroadcastMessages(w, r, registration, registration.APIs[route.APIIndex], path)
					return
				}
			}
		}
	}
	var pathMatch *matchedEndpoint
	var pathSpecificity routeSpecificity
	var methodMatch *matchedEndpoint
	var methodSpecificity routeSpecificity
	methodMatches := 0
	var allowed []string
	for _, registration := range registrations {
		for _, route := range registration.GeneratedRoutes {
			id, matched := matchRoute(route.Pattern, path)
			if !matched {
				continue
			}
			candidate, ok := generatedRouteCandidate(registration, route, id)
			if !ok {
				continue
			}
			specificity := routePatternSpecificity(route.Pattern)
			if pathMatch == nil || specificity.moreSpecificThan(pathSpecificity) {
				pathCandidate := candidate
				if route.Kind == "custom" {
					pathCandidate.operation = route.Method
				}
				pathMatch = &pathCandidate
				pathSpecificity = specificity
				allowed = []string{strings.ToUpper(route.Method)}
			} else if specificity.equal(pathSpecificity) {
				allowed = append(allowed, strings.ToUpper(route.Method))
			}
			if strings.EqualFold(route.Method, r.Method) {
				if methodMatch == nil || specificity.moreSpecificThan(methodSpecificity) {
					methodMatch = &candidate
					methodSpecificity = specificity
					methodMatches = 1
				} else if specificity.equal(methodSpecificity) {
					methodMatches++
				}
			}
		}
	}
	if methodMatches > 1 {
		writeJSON(w, http.StatusConflict, map[string]string{"message": "Ambiguous API route registration"})
		return
	}
	if methodMatch != nil {
		if !h.runMiddleware(w, r, *methodMatch) {
			return
		}
		h.serveAPI(w, r, *methodMatch)
		return
	}
	if pathMatch != nil {
		sort.Strings(allowed)
		w.Header().Set("Allow", strings.Join(uniqueStrings(allowed), ", "))
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
		return
	}
	writeJSON(w, http.StatusNotFound, map[string]string{"message": "Not Found"})
}

func generatedRouteCandidate(registration Registration, route GeneratedRoute, id string) (matchedEndpoint, bool) {
	candidate := matchedEndpoint{registration: registration, id: id}
	switch route.Kind {
	case "api":
		if route.APIIndex < 0 || route.APIIndex >= len(registration.APIs) {
			return matchedEndpoint{}, false
		}
		api := registration.APIs[route.APIIndex]
		endpoint, exists := api.Endpoints[route.Operation]
		if !exists {
			return matchedEndpoint{}, false
		}
		candidate.api = api
		candidate.operation = route.Operation
		candidate.endpoint = endpoint
	case "custom":
		if route.CustomGroupIndex < 0 || route.CustomGroupIndex >= len(registration.CustomRoutes) {
			return matchedEndpoint{}, false
		}
		group := registration.CustomRoutes[route.CustomGroupIndex]
		if route.CustomRouteIndex < 0 || route.CustomRouteIndex >= len(group.Routes) {
			return matchedEndpoint{}, false
		}
		custom := group.Routes[route.CustomRouteIndex]
		candidate.api = APIBlock{Table: "probe_results", Middleware: group.Middleware}
		candidate.endpoint = EndpointConfig{Method: custom.Method, Route: custom.Route, Body: custom.Body}
		candidate.customHandler = custom.Handler
	default:
		return matchedEndpoint{}, false
	}
	return candidate, true
}

type routeSpecificity struct {
	staticSegments    int
	parameterSegments int
	segmentCount      int
}

func routePatternSpecificity(pattern string) routeSpecificity {
	specificity := routeSpecificity{}
	for _, segment := range strings.Split(strings.Trim(pattern, "/"), "/") {
		if segment == "" {
			continue
		}
		specificity.segmentCount++
		if strings.HasPrefix(segment, "{") && strings.HasSuffix(segment, "}") {
			specificity.parameterSegments++
		} else {
			specificity.staticSegments++
		}
	}
	return specificity
}

func (specificity routeSpecificity) moreSpecificThan(other routeSpecificity) bool {
	if specificity.staticSegments != other.staticSegments {
		return specificity.staticSegments > other.staticSegments
	}
	if specificity.parameterSegments != other.parameterSegments {
		return specificity.parameterSegments < other.parameterSegments
	}
	return specificity.segmentCount > other.segmentCount
}

func (specificity routeSpecificity) equal(other routeSpecificity) bool {
	return specificity == other
}

func (h *Handler) runMiddleware(w http.ResponseWriter, r *http.Request, match matchedEndpoint) bool {
	for _, middleware := range match.api.Middleware {
		switch middleware {
		case "auth", "auth:sanctum":
			if !match.registration.Auth {
				writeJSON(w, http.StatusNotImplemented, map[string]string{
					"message": "Authentication middleware is not enabled for this module",
				})
				return false
			}
			_, _, ok, err := h.resolveAuthUser(r, match.registration.Name)
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
				return false
			}
			if !ok {
				writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
				return false
			}
		case "requireJson":
			contentType, _, err := mime.ParseMediaType(r.Header.Get("Content-Type"))
			if err != nil || !isJSONMediaType(contentType) {
				writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{
					"message": "Content-Type: application/json is required for this endpoint.",
					"hint":    "Set the Content-Type header to application/json",
				})
				return false
			}
		default:
			writeJSON(w, http.StatusNotImplemented, map[string]string{
				"message": fmt.Sprintf("Middleware %q is not implemented by the Go engine", middleware),
			})
			return false
		}
	}
	return true
}

func isJSONMediaType(mediaType string) bool {
	mediaType = strings.ToLower(mediaType)
	return mediaType == "application/json" || strings.HasSuffix(mediaType, "+json")
}

func normalizeRequestPath(path string) string {
	if path == "" || path == "/" {
		return "/"
	}
	return "/" + strings.Trim(path, "/")
}

func joinRoute(prefix, route string) string {
	prefix = normalizeRoutePath(prefix)
	route = normalizeRoutePath(route)
	if route == "/" {
		return prefix
	}
	if prefix == "/" {
		return route
	}
	return strings.TrimSuffix(prefix, "/") + route
}

func matchRoute(pattern, path string) (string, bool) {
	want := strings.Split(strings.Trim(pattern, "/"), "/")
	got := strings.Split(strings.Trim(path, "/"), "/")
	if pattern == "/" {
		want = nil
	}
	if path == "/" {
		got = nil
	}
	if len(want) != len(got) {
		return "", false
	}
	id := ""
	for index, segment := range want {
		if len(segment) > 2 && segment[0] == '{' && segment[len(segment)-1] == '}' {
			value, err := url.PathUnescape(got[index])
			if err != nil || value == "" || strings.Contains(value, "/") {
				return "", false
			}
			id = value
			continue
		}
		value, err := url.PathUnescape(got[index])
		if err != nil || segment != value {
			return "", false
		}
	}
	return id, true
}

func uniqueStrings(values []string) []string {
	result := values[:0]
	seen := make(map[string]struct{}, len(values))
	for _, value := range values {
		if _, exists := seen[value]; exists || value == "" {
			continue
		}
		seen[value] = struct{}{}
		result = append(result, value)
	}
	return result
}

func (h *Handler) serveAPI(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	if match.customHandler != "" {
		h.serveCustomRoute(w, r, match)
		return
	}
	if h.serveBuiltinAPI(w, r, match) {
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, match.registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
		return
	}
	defer db.Close()

	columns, primaryKey, err := inspectColumns(db, match.api.Table)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
		return
	}
	table := quoteIdentifier(match.api.Table)
	switch match.operation {
	case "index":
		h.indexRecords(w, r, db, table, match.api, primaryKey, match.registration.Name)
	case "show":
		h.showRecord(w, db, table, match.api, primaryKey, match.id)
	case "store":
		h.storeRecord(w, r, db, table, match.api, columns, primaryKey)
	case "update":
		h.updateRecord(w, r, db, table, match.api, columns, primaryKey, match.id, match.registration.PolicySnippets)
	case "destroy":
		h.destroyRecord(w, db, table, match.api, primaryKey, match.id, match.registration.PolicySnippets)
	case "echo":
		h.echoProbe(w, r, db, table, columns, primaryKey)
	case "stats":
		h.probeStats(w, db, match.api.Table, columns)
	case "lowStock":
		h.lowStock(w, db, match.api.Table)
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Unsupported API operation"})
	}
}

func (h *Handler) lowStock(w http.ResponseWriter, db *sql.DB, tableName string) {
	rows, err := db.Query("SELECT * FROM "+quoteIdentifier(tableName)+` WHERE "quantity" < ? ORDER BY "quantity" ASC`, 20)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to query low-stock inventory"})
		return
	}
	records, scanErr := scanRecords(rows)
	closeErr := rows.Close()
	if scanErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read low-stock inventory"})
		return
	}
	if closeErr != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to finish reading low-stock inventory"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": records, "count": len(records)})
}

func (h *Handler) echoProbe(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, columns map[string]struct{}, primary string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	payload, err := json.Marshal(input)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not encode echo payload"})
		return
	}
	recordInput := map[string]any{
		"source":  "endpoint-body",
		"probe":   "echo",
		"payload": string(payload),
		"result":  fmt.Sprintf("Echoed %d field(s) — Go endpoint emulation", len(input)),
		"ok":      true,
	}
	prepareTimestamps(recordInput, columns, true)
	record, err := insertRecord(db, table, recordInput, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record echo probe"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"injected": true, "builder": "Go endpoint emulation", "method": "echo",
		"field_count": len(input), "echo": input, "probe_id": record[primary],
	})
}

func (h *Handler) probeStats(w http.ResponseWriter, db *sql.DB, table string, columns map[string]struct{}) {
	for _, column := range []string{"source", "ok"} {
		if _, exists := columns[column]; !exists {
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Go endpoint emulation for stats requires source and ok columns"})
			return
		}
	}
	var total, passed, failed int
	query := "SELECT COUNT(*), COALESCE(SUM(CASE WHEN \"ok\" THEN 1 ELSE 0 END), 0), COALESCE(SUM(CASE WHEN NOT \"ok\" THEN 1 ELSE 0 END), 0) FROM " + quoteIdentifier(table)
	if err := db.QueryRow(query).Scan(&total, &passed, &failed); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": fmt.Sprintf("Could not load probe statistics: %v", err)})
		return
	}
	rows, err := db.Query("SELECT DISTINCT \"source\" FROM " + quoteIdentifier(table) + " ORDER BY \"source\"")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load probe sources"})
		return
	}
	defer rows.Close()
	sources := []string{}
	for rows.Next() {
		var source string
		if err := rows.Scan(&source); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not read probe sources"})
			return
		}
		sources = append(sources, source)
	}
	if err := rows.Err(); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not read probe sources"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"injected": true, "builder": "Go endpoint emulation", "method": "stats",
		"total": total, "passed": passed, "failed": failed, "sources": sources,
	})
}

func (h *Handler) serveCustomRoute(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	if match.registration.Name == "queue-flow" {
		h.serveQueueRoute(w, r, match)
		return
	}
	if match.registration.Name == "kotoba" {
		h.serveKotobaRoute(w, r, match)
		return
	}
	switch match.customHandler {
	case "ping":
		writeJSON(w, http.StatusOK, map[string]any{
			"injected": true, "builder": "CustomRouteBuilder Go emulation",
			"handler": "ping", "status": "ok",
			"timestamp": time.Now().UTC().Format(time.RFC3339),
			"message":   "CustomRouteBuilder handler body injection confirmed",
		})
	case "recordHandler":
		input, ok := readObjectBody(w, r)
		if !ok {
			return
		}
		probe, valid := input["probe"].(string)
		if !valid || strings.TrimSpace(probe) == "" || len([]rune(probe)) > 100 {
			writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
				"message": "Validation failed",
				"errors":  []string{"probe is required, string, and at most 100 characters"},
			})
			return
		}
		if value, exists := input["payload"]; exists && value != nil {
			if _, valid := value.(string); !valid {
				writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
					"message": "Validation failed", "errors": []string{"payload must be a string"},
				})
				return
			}
		}
		okValue := true
		if value, exists := input["ok"]; exists {
			boolean, valid := value.(bool)
			if !valid {
				writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
					"message": "Validation failed", "errors": []string{"ok must be a boolean"},
				})
				return
			}
			okValue = boolean
		}
		db, err := openModuleDatabase(h.service.storageDir, match.registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
			return
		}
		defer db.Close()
		columns, primary, err := inspectColumns(db, match.api.Table)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect probe table"})
			return
		}
		recordInput := map[string]any{
			"source": "handler-body", "probe": probe, "payload": input["payload"],
			"result": "Recorded via CustomRouteBuilder handler body injection", "ok": okValue,
		}
		prepareTimestamps(recordInput, columns, true)
		record, err := insertRecord(db, quoteIdentifier(match.api.Table), recordInput, columns, primary)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not record probe"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"injected": true, "builder": "CustomRouteBuilder Go emulation",
			"handler": "recordHandler", "probe_id": record[primary], "probe": probe,
		})
	case "latest":
		db, err := openModuleDatabase(h.service.storageDir, match.registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open module database"})
			return
		}
		defer db.Close()
		records, err := db.Query(`SELECT * FROM "probe_results" ORDER BY "id" DESC LIMIT 5`)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not load latest probes"})
			return
		}
		defer records.Close()
		rows, err := scanRecords(records)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Could not read latest probes"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{
			"injected": true, "builder": "CustomRouteBuilder Go emulation",
			"handler": "latest", "count": len(rows), "results": rows,
		})
	default:
		writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Custom route handler is not implemented by the Go engine"})
	}
}

func openModuleDatabase(storageDir, module string) (*sql.DB, error) {
	driver, dataSource := "sqlite", moduleDatabasePath(storageDir, module)
	if configuredDialect() == postgresDialect {
		driver, dataSource = "arkzen-postgres", postgresConnectionString(moduleDatabaseName(module))
	}
	database, err := sql.Open(driver, dataSource)
	if err != nil {
		return nil, err
	}
	if configuredDialect() == sqliteDialect {
		database.SetMaxOpenConns(1)
	}
	if err := database.Ping(); err != nil {
		_ = database.Close()
		return nil, err
	}
	if configuredDialect() == sqliteDialect {
		if _, err := database.Exec("PRAGMA busy_timeout = 5000"); err != nil {
			_ = database.Close()
			return nil, err
		}
	}
	return database, nil
}

func inspectColumns(db *sql.DB, table string) (map[string]struct{}, string, error) {
	if configuredDialect() == postgresDialect {
		rows, err := db.Query(`SELECT c.column_name, EXISTS (
			SELECT 1 FROM information_schema.key_column_usage k
			JOIN information_schema.table_constraints t ON t.constraint_name = k.constraint_name
				AND t.table_schema = k.table_schema AND t.table_name = k.table_name
			WHERE t.constraint_type = 'PRIMARY KEY' AND k.table_schema = c.table_schema
				AND k.table_name = c.table_name AND k.column_name = c.column_name
		) FROM information_schema.columns c
		WHERE c.table_schema = current_schema() AND c.table_name = ? ORDER BY c.ordinal_position`, table)
		if err != nil {
			return nil, "", err
		}
		defer rows.Close()
		columns := make(map[string]struct{})
		primary := ""
		for rows.Next() {
			var name string
			var isPrimary bool
			if err := rows.Scan(&name, &isPrimary); err != nil {
				return nil, "", err
			}
			columns[name] = struct{}{}
			if isPrimary {
				primary = name
			}
		}
		if err := rows.Err(); err != nil {
			return nil, "", err
		}
		if len(columns) == 0 {
			return nil, "", fmt.Errorf("table %q does not exist", table)
		}
		if primary == "" {
			if _, exists := columns["id"]; exists {
				primary = "id"
			} else {
				return nil, "", fmt.Errorf("table %q has no primary key", table)
			}
		}
		return columns, primary, nil
	}
	rows, err := db.Query("PRAGMA table_info(" + quoteIdentifier(table) + ")")
	if err != nil {
		return nil, "", err
	}
	defer rows.Close()
	columns := make(map[string]struct{})
	primary := ""
	for rows.Next() {
		var cid, notNull, primaryKey int
		var name, dataType string
		var defaultValue any
		if err := rows.Scan(&cid, &name, &dataType, &notNull, &defaultValue, &primaryKey); err != nil {
			return nil, "", err
		}
		columns[name] = struct{}{}
		if primaryKey > 0 {
			primary = name
		}
	}
	if err := rows.Err(); err != nil {
		return nil, "", err
	}
	if len(columns) == 0 {
		return nil, "", fmt.Errorf("table %q does not exist", table)
	}
	if primary == "" {
		if _, exists := columns["id"]; exists {
			primary = "id"
		} else {
			return nil, "", fmt.Errorf("table %q has no primary key", table)
		}
	}
	return columns, primary, nil
}

func (h *Handler) indexRecords(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, api APIBlock, primary, module string) {
	paginated := api.Endpoints["index"].Response.Type == "paginated"
	query := "SELECT * FROM " + table
	args := []any{}
	if api.SoftDeletes {
		query += " WHERE \"deleted_at\" IS NULL"
	}
	orderColumn := primary
	descending := false
	order := " ORDER BY " + quoteIdentifier(orderColumn)
	if descending {
		order += " DESC, " + quoteIdentifier(primary) + " DESC"
	}
	query += order
	limit := 0
	if raw := r.URL.Query().Get("per_page"); raw != "" {
		var err error
		limit, err = strconv.Atoi(raw)
		if err != nil || limit < 1 || limit > 1000 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "per_page must be an integer from 1 to 1000"})
			return
		}
	} else if paginated {
		limit = 15
	}
	page := 1
	if raw := r.URL.Query().Get("page"); raw != "" {
		var err error
		page, err = strconv.Atoi(raw)
		if err != nil || page < 1 || page > 1000000 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "page must be an integer from 1 to 1000000"})
			return
		}
	}
	if limit > 0 {
		query += " LIMIT ? OFFSET ?"
		args = append(args, limit, (page-1)*limit)
	} else if page > 1 {
		if configuredDialect() == postgresDialect {
			query += " LIMIT ALL OFFSET ?"
		} else {
			query += " LIMIT -1 OFFSET ?"
		}
		args = append(args, (page-1)*15)
	}
	rows, err := db.Query(query, args...)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read records"})
		return
	}
	records, err := scanRecords(rows)
	_ = rows.Close()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read records"})
		return
	}
	if paginated {
		countQuery := "SELECT COUNT(*) FROM " + table
		if api.SoftDeletes {
			countQuery += ` WHERE "deleted_at" IS NULL`
		}
		var total int
		if err := db.QueryRow(countQuery).Scan(&total); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to count records"})
			return
		}
		writeJSON(w, http.StatusOK, paginatorResponse(r, records, total, page, limit))
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": records, "count": len(records)})
}

func paginatorResponse(r *http.Request, records []map[string]any, total, page, perPage int) map[string]any {
	lastPage := (total + perPage - 1) / perPage
	if lastPage < 1 {
		lastPage = 1
	}
	var from, to any
	if len(records) > 0 {
		from = (page-1)*perPage + 1
		to = (page-1)*perPage + len(records)
	}
	pageURL := func(number int) string {
		query := r.URL.Query()
		query.Set("page", strconv.Itoa(number))
		query.Set("per_page", strconv.Itoa(perPage))
		copy := *r.URL
		copy.RawQuery = query.Encode()
		if r.Host == "" {
			return copy.String()
		}
		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}
		return scheme + "://" + r.Host + copy.String()
	}
	var previousURL, nextURL any
	if page > 1 {
		previousURL = pageURL(page - 1)
	}
	if page < lastPage {
		nextURL = pageURL(page + 1)
	}
	path := r.URL.Path
	if r.Host != "" {
		scheme := "http"
		if r.TLS != nil {
			scheme = "https"
		}
		path = scheme + "://" + r.Host + path
	}
	return map[string]any{
		"current_page": page, "data": records,
		"first_page_url": pageURL(1), "from": from,
		"last_page": lastPage, "last_page_url": pageURL(lastPage),
		"next_page_url": nextURL, "path": path, "per_page": perPage,
		"prev_page_url": previousURL, "to": to, "total": total,
	}
}

func (h *Handler) showRecord(w http.ResponseWriter, db *sql.DB, table string, api APIBlock, primary, id string) {
	record, err := selectRecord(db, table, api, primary, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read record"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": record})
}

func (h *Handler) storeRecord(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, api APIBlock, columns map[string]struct{}, primary string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	validated, problems, err := validateCRUDInput(db, table, input, api.Endpoints["store"].Validation, columns, primary, "")
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to validate request"})
		return
	}
	if problems.any() {
		writeValidationErrors(w, problems)
		return
	}
	input = validated
	prepareTimestamps(input, columns, true)
	record, err := insertRecord(db, table, input, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": "Unable to create record: " + err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record})
}

func (h *Handler) updateRecord(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, api APIBlock, columns map[string]struct{}, primary, id string, policies map[string]string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	validated, problems, err := validateCRUDInput(db, table, input, api.Endpoints["update"].Validation, columns, primary, id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to validate request"})
		return
	}
	if problems.any() {
		writeValidationErrors(w, problems)
		return
	}
	input = validated
	if api.Policy && !h.authorizeCRUDPolicy(w, db, api, policies, "update", primary, id) {
		return
	}
	prepareTimestamps(input, columns, false)
	if len(input) == 0 {
		if _, err := selectRecord(db, table, api, primary, id); errors.Is(err, sql.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
			return
		}
	} else if err := updateRecordFields(db, table, input, columns, primary, id, api.SoftDeletes); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
			return
		}
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": "Unable to update record: " + err.Error()})
		return
	}
	record, err := selectRecord(db, table, api, primary, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read updated record"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"data": record})
}

func (h *Handler) destroyRecord(w http.ResponseWriter, db *sql.DB, table string, api APIBlock, primary, id string, policies map[string]string) {
	if api.Policy && !h.authorizeCRUDPolicy(w, db, api, policies, "delete", primary, id) {
		return
	}
	var result sql.Result
	var err error
	if api.SoftDeletes {
		if !apiColumnExists(db, api.Table, "deleted_at") {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Soft deletes are enabled but deleted_at is missing"})
			return
		}
		result, err = db.Exec("UPDATE "+table+" SET \"deleted_at\" = CURRENT_TIMESTAMP WHERE "+quoteIdentifier(primary)+" = ? AND \"deleted_at\" IS NULL", id)
	} else {
		result, err = db.Exec("DELETE FROM "+table+" WHERE "+quoteIdentifier(primary)+" = ?", id)
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to delete record"})
		return
	}
	affected, err := result.RowsAffected()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to confirm deletion"})
		return
	}
	if affected == 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	message := api.Endpoints["destroy"].Response.Value
	if message == "" {
		message = "Record deleted"
	}
	writeJSON(w, http.StatusOK, map[string]string{"message": message})
}

func (h *Handler) authorizeCRUDPolicy(w http.ResponseWriter, db *sql.DB, api APIBlock, policies map[string]string, action, primary, id string) bool {
	if !validGoPolicySnippet(policies[action]) {
		writeJSON(w, http.StatusNotImplemented, map[string]string{"message": "Go policy implementation is unavailable"})
		return false
	}
	record, err := selectRecord(db, quoteIdentifier(api.Table), api, primary, id)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return false
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to evaluate record policy"})
		return false
	}
	allowed, err := evaluateGoPolicy(policies[action], record)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to evaluate record policy"})
		return false
	}
	if !allowed {
		writeJSON(w, http.StatusForbidden, map[string]string{"message": "This action is unauthorized."})
		return false
	}
	return true
}

func apiColumnExists(db *sql.DB, table, name string) bool {
	columns, _, err := inspectColumns(db, table)
	if err != nil {
		return false
	}
	_, exists := columns[name]
	return exists
}

func selectRecord(db *sql.DB, table string, api APIBlock, primary, id string) (map[string]any, error) {
	query := "SELECT * FROM " + table + " WHERE " + quoteIdentifier(primary) + " = ?"
	if api.SoftDeletes {
		query += " AND \"deleted_at\" IS NULL"
	}
	rows, err := db.Query(query, id)
	if err != nil {
		return nil, err
	}
	records, err := scanRecords(rows)
	_ = rows.Close()
	if err != nil {
		return nil, err
	}
	if len(records) == 0 {
		return nil, sql.ErrNoRows
	}
	return records[0], nil
}

func scanRecords(rows *sql.Rows) ([]map[string]any, error) {
	names, err := rows.Columns()
	if err != nil {
		return nil, err
	}
	records := make([]map[string]any, 0)
	for rows.Next() {
		values := make([]any, len(names))
		destinations := make([]any, len(names))
		for index := range values {
			destinations[index] = &values[index]
		}
		if err := rows.Scan(destinations...); err != nil {
			return nil, err
		}
		record := make(map[string]any, len(names))
		for index, name := range names {
			switch value := values[index].(type) {
			case []byte:
				record[name] = string(value)
			default:
				record[name] = value
			}
		}
		records = append(records, record)
	}
	return records, rows.Err()
}

func readObjectBody(w http.ResponseWriter, r *http.Request) (map[string]any, bool) {
	var input map[string]any
	if err := decodeBody(w, r, &input); err != nil {
		writeDecodeError(w, err)
		return nil, false
	}
	if input == nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Request body must be a JSON object"})
		return nil, false
	}
	return input, true
}

func insertRecord(db *sql.DB, table string, input map[string]any, columns map[string]struct{}, primary string) (map[string]any, error) {
	names := make([]string, 0, len(input))
	for name := range input {
		names = append(names, name)
	}
	sort.Strings(names)
	var query string
	var args []any
	if len(names) == 0 {
		query = "INSERT INTO " + table + " DEFAULT VALUES"
	} else {
		placeholders := make([]string, len(names))
		quoted := make([]string, len(names))
		for index, name := range names {
			if _, exists := columns[name]; !exists {
				return nil, fmt.Errorf("unknown field %q", name)
			}
			quoted[index] = quoteIdentifier(name)
			placeholders[index] = "?"
			args = append(args, input[name])
		}
		query = "INSERT INTO " + table + " (" + strings.Join(quoted, ",") + ") VALUES (" + strings.Join(placeholders, ",") + ")"
	}
	var lookup any
	if configuredDialect() == postgresDialect {
		if err := db.QueryRow(query+" RETURNING "+quoteIdentifier(primary), args...).Scan(&lookup); err != nil {
			return nil, err
		}
	} else {
		result, err := db.Exec(query, args...)
		if err != nil {
			return nil, err
		}
		id, err := result.LastInsertId()
		if err != nil {
			return nil, err
		}
		lookup = id
	}
	if value, supplied := input[primary]; supplied {
		lookup = value
	}
	rows, err := db.Query("SELECT * FROM "+table+" WHERE "+quoteIdentifier(primary)+" = ?", lookup)
	if err != nil {
		return nil, err
	}
	records, err := scanRecords(rows)
	_ = rows.Close()
	if err != nil {
		return nil, err
	}
	if len(records) != 1 {
		return nil, errors.New("created row could not be loaded")
	}
	return records[0], nil
}

func updateRecordFields(db *sql.DB, table string, input map[string]any, columns map[string]struct{}, primary, id string, softDeletes bool) error {
	names := make([]string, 0, len(input))
	for name := range input {
		if name == primary || name == "id" {
			continue
		}
		if _, exists := columns[name]; !exists {
			return fmt.Errorf("unknown field %q", name)
		}
		names = append(names, name)
	}
	if len(names) == 0 {
		return errors.New("no writable fields provided")
	}
	sort.Strings(names)
	sets := make([]string, len(names))
	args := make([]any, 0, len(names)+1)
	for index, name := range names {
		sets[index] = quoteIdentifier(name) + " = ?"
		args = append(args, input[name])
	}
	args = append(args, id)
	where := quoteIdentifier(primary) + " = ?"
	if softDeletes {
		where += ` AND "deleted_at" IS NULL`
	}
	result, err := db.Exec("UPDATE "+table+" SET "+strings.Join(sets, ", ")+" WHERE "+where, args...)
	if err != nil {
		return err
	}
	affected, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if affected == 0 {
		var exists int
		err := db.QueryRow("SELECT 1 FROM "+table+" WHERE "+where, id).Scan(&exists)
		if errors.Is(err, sql.ErrNoRows) {
			return sql.ErrNoRows
		}
		return err
	}
	return nil
}

func prepareTimestamps(input map[string]any, columns map[string]struct{}, creating bool) {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	if creating {
		if _, exists := columns["created_at"]; exists {
			if _, supplied := input["created_at"]; !supplied {
				input["created_at"] = now
			}
		}
	}
	if _, exists := columns["updated_at"]; exists {
		input["updated_at"] = now
	}
}

func numericValue(value any) (float64, bool) {
	switch typed := value.(type) {
	case float64:
		return typed, true
	case int:
		return float64(typed), true
	case int64:
		return float64(typed), true
	default:
		return 0, false
	}
}
