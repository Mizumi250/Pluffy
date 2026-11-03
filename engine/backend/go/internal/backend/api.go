package backend

import (
	"database/sql"
	"errors"
	"fmt"
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
	registration Registration
	api          APIBlock
	operation    string
	endpoint     EndpointConfig
	id           string
}

func (h *Handler) apiOrNotFound(w http.ResponseWriter, r *http.Request) {
	path := normalizeRequestPath(r.URL.Path)
	registrations := h.service.Registrations()
	var pathMatch *matchedEndpoint
	var methodMatch *matchedEndpoint
	methodMatches := 0
	var allowed []string
	for _, registration := range registrations {
		for _, api := range registration.APIs {
			operations := make([]string, 0, len(api.Endpoints))
			for operation := range api.Endpoints {
				operations = append(operations, operation)
			}
			sort.Strings(operations)
			for _, operation := range operations {
				endpoint := api.Endpoints[operation]
				route := endpointRoute(operation, endpoint)
				fullPath := joinRoute(api.Prefix, route)
				id, matched := matchRoute(fullPath, path)
				if !matched {
					continue
				}
				if pathMatch == nil {
					candidate := matchedEndpoint{
						registration: registration, api: api,
						operation: operation, endpoint: endpoint, id: id,
					}
					pathMatch = &candidate
				}
				method := endpointMethod(operation, endpoint)
				if method == r.Method {
					candidate := matchedEndpoint{
						registration: registration, api: api,
						operation: operation, endpoint: endpoint, id: id,
					}
					methodMatch = &candidate
					methodMatches++
				}
				allowed = append(allowed, method)
			}
		}
	}
	if methodMatches > 1 {
		writeJSON(w, http.StatusConflict, map[string]string{"message": "Ambiguous API route registration"})
		return
	}
	if methodMatch != nil {
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
		h.indexRecords(w, r, db, table, match.api, primaryKey)
	case "show":
		h.showRecord(w, db, table, match.api, primaryKey, match.id)
	case "store":
		h.storeRecord(w, r, db, table, match.api, columns, primaryKey)
	case "update":
		h.updateRecord(w, r, db, table, match.api, columns, primaryKey, match.id)
	case "destroy":
		h.destroyRecord(w, db, table, match.api, primaryKey, match.id)
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Unsupported API operation"})
	}
}

func openModuleDatabase(storageDir, module string) (*sql.DB, error) {
	database, err := sql.Open("sqlite", moduleDatabasePath(storageDir, module))
	if err != nil {
		return nil, err
	}
	database.SetMaxOpenConns(1)
	if err := database.Ping(); err != nil {
		_ = database.Close()
		return nil, err
	}
	return database, nil
}

func inspectColumns(db *sql.DB, table string) (map[string]struct{}, string, error) {
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

func (h *Handler) indexRecords(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, api APIBlock, primary string) {
	query := "SELECT * FROM " + table
	args := []any{}
	if api.SoftDeletes {
		query += " WHERE \"deleted_at\" IS NULL"
	}
	query += " ORDER BY " + quoteIdentifier(primary)
	if raw := r.URL.Query().Get("per_page"); raw != "" {
		limit, err := strconv.Atoi(raw)
		if err != nil || limit < 1 || limit > 1000 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "per_page must be an integer from 1 to 1000"})
			return
		}
		query += " LIMIT ?"
		args = append(args, limit)
	} else if api.Endpoints["index"].Response.Type == "paginated" {
		query += " LIMIT 15"
	}
	if raw := r.URL.Query().Get("page"); raw != "" {
		page, err := strconv.Atoi(raw)
		if err != nil || page < 1 || page > 1000000 {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "page must be an integer from 1 to 1000000"})
			return
		}
		if len(args) == 0 {
			if api.Endpoints["index"].Response.Type == "paginated" {
				query = strings.TrimSuffix(query, " ORDER BY "+quoteIdentifier(primary)) + " LIMIT 15"
			} else {
				query += " LIMIT -1"
			}
		}
		query += " OFFSET ?"
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
	writeJSON(w, http.StatusOK, map[string]any{"data": records, "count": len(records)})
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
	if problems := validateInput(input, api.Endpoints["store"].Validation, columns, true); len(problems) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": problems})
		return
	}
	if err := validateUniqueValues(db, table, input, api.Endpoints["store"].Validation, columns, "", ""); err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{err.Error()}})
		return
	}
	prepareTimestamps(input, columns, true)
	record, err := insertRecord(db, table, input, columns, primary)
	if err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": "Unable to create record: " + err.Error()})
		return
	}
	writeJSON(w, http.StatusCreated, map[string]any{"data": record})
}

func (h *Handler) updateRecord(w http.ResponseWriter, r *http.Request, db *sql.DB, table string, api APIBlock, columns map[string]struct{}, primary, id string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	if len(input) == 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"At least one field is required"}})
		return
	}
	if problems := validateInput(input, api.Endpoints["update"].Validation, columns, false); len(problems) > 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": problems})
		return
	}
	if err := validateUniqueValues(db, table, input, api.Endpoints["update"].Validation, columns, primary, id); err != nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{err.Error()}})
		return
	}
	prepareTimestamps(input, columns, false)
	if err := updateRecordFields(db, table, input, columns, primary, id, api.SoftDeletes); err != nil {
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

func (h *Handler) destroyRecord(w http.ResponseWriter, db *sql.DB, table string, api APIBlock, primary, id string) {
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
	result, err := db.Exec(query, args...)
	if err != nil {
		return nil, err
	}
	id, err := result.LastInsertId()
	if err != nil {
		return nil, err
	}
	lookup := any(id)
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

func validateInput(input map[string]any, rules map[string]string, columns map[string]struct{}, creating bool) []string {
	var problems []string
	for name := range input {
		if _, exists := columns[name]; !exists || name == "id" || name == "created_at" || name == "updated_at" || name == "deleted_at" {
			problems = append(problems, fmt.Sprintf("Field %q is not writable", name))
			continue
		}
	}
	for name, ruleSet := range rules {
		value, provided := input[name]
		rules := strings.Split(ruleSet, "|")
		required := false
		nullable := false
		for _, rule := range rules {
			switch rule {
			case "required":
				required = true
			case "nullable":
				nullable = true
			}
		}
		if !provided {
			if required && creating {
				problems = append(problems, fmt.Sprintf("Field %q is required", name))
			}
			continue
		}
		if value == nil && nullable {
			if required {
				problems = append(problems, fmt.Sprintf("Field %q is required", name))
				continue
			}
			continue
		}
		if required {
			if text, ok := value.(string); ok && strings.TrimSpace(text) == "" {
				problems = append(problems, fmt.Sprintf("Field %q is required", name))
				continue
			}
		}
		for _, rule := range rules {
			if err := validateRule(value, rule); err != nil {
				problems = append(problems, fmt.Sprintf("Field %q %s", name, err))
			}
		}
	}
	return problems
}

func validateRule(value any, rule string) error {
	if value == nil {
		return nil
	}
	switch {
	case rule == "required" || rule == "sometimes" || rule == "nullable" || rule == "":
		return nil
	case rule == "string":
		if _, ok := value.(string); !ok {
			return errors.New("must be a string")
		}
	case rule == "integer":
		if _, ok := numericValue(value); !ok {
			return errors.New("must be an integer")
		} else if _, err := strconv.ParseInt(fmt.Sprint(value), 10, 64); err != nil {
			return errors.New("must be an integer")
		}
	case rule == "numeric":
		if _, ok := numericValue(value); !ok {
			return errors.New("must be numeric")
		}
	case rule == "boolean":
		switch value.(type) {
		case bool:
		default:
			return errors.New("must be a boolean")
		}
	case strings.HasPrefix(rule, "max:"):
		limit, err := strconv.ParseFloat(strings.TrimPrefix(rule, "max:"), 64)
		if err != nil {
			return nil
		}
		if text, ok := value.(string); ok && float64(len([]rune(text))) > limit {
			return fmt.Errorf("must have at most %s characters", strings.TrimPrefix(rule, "max:"))
		}
		if number, ok := numericValue(value); ok && number > limit {
			return fmt.Errorf("must be at most %s", strings.TrimPrefix(rule, "max:"))
		}
	case strings.HasPrefix(rule, "min:"):
		limit, err := strconv.ParseFloat(strings.TrimPrefix(rule, "min:"), 64)
		if err != nil {
			return nil
		}
		if text, ok := value.(string); ok && float64(len([]rune(text))) < limit {
			return fmt.Errorf("must have at least %s characters", strings.TrimPrefix(rule, "min:"))
		}
		if number, ok := numericValue(value); ok && number < limit {
			return fmt.Errorf("must be at least %s", strings.TrimPrefix(rule, "min:"))
		}
	case strings.HasPrefix(rule, "in:"):
		text := fmt.Sprint(value)
		for _, option := range strings.Split(strings.TrimPrefix(rule, "in:"), ",") {
			if text == option {
				return nil
			}
		}
		return errors.New("has an unsupported value")
	}
	return nil
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

func validateUniqueValues(db *sql.DB, table string, input map[string]any, rules map[string]string, columns map[string]struct{}, primary, exceptID string) error {
	for name, ruleSet := range rules {
		if !strings.Contains("|"+ruleSet+"|", "|unique:") {
			continue
		}
		value, supplied := input[name]
		if !supplied || value == nil {
			continue
		}
		if _, exists := columns[name]; !exists {
			continue
		}
		query := "SELECT 1 FROM " + table + " WHERE " + quoteIdentifier(name) + " = ?"
		args := []any{value}
		if exceptID != "" {
			query += " AND " + quoteIdentifier(primary) + " != ?"
			args = append(args, exceptID)
		}
		var found int
		err := db.QueryRow(query, args...).Scan(&found)
		if err == nil {
			return fmt.Errorf("Field %q must be unique", name)
		}
		if !errors.Is(err, sql.ErrNoRows) {
			return err
		}
	}
	return nil
}
