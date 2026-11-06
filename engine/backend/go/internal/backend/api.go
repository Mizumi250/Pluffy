package backend

import (
	"crypto/rand"
	"database/sql"
	"errors"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"net/http"
	"net/url"
	"os"
	"path"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"time"

	"github.com/pluff/pluff/engine/backend/go/internal/modulespec"
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

func uploadPublicURL(diskPath string) string {
	if diskPath == "" {
		return ""
	}
	if strings.HasPrefix(diskPath, "/storage/") {
		return diskPath
	}
	return "/storage/" + strings.TrimPrefix(strings.ReplaceAll(diskPath, "\\", "/"), "/")
}

func enrichUploadRecords(records []map[string]any) {
	for _, record := range records {
		diskPath, _ := record["disk_path"].(string)
		url := uploadPublicURL(diskPath)
		record["url"] = url
		if isImage, _ := record["is_image"].(bool); isImage {
			record["image_url"] = url
		} else {
			record["image_url"] = nil
		}
	}
}

func safeUploadName(name string) string {
	name = filepath.Base(strings.ReplaceAll(name, "\\", "/"))
	name = strings.Map(func(r rune) rune {
		switch {
		case r >= 32 && r != 127 && r != '"' && r != '/' && r != '\\':
			return r
		default:
			return '_'
		}
	}, name)
	if name == "" || name == "." || name == ".." {
		return "file"
	}
	return name
}

func (h *Handler) uploadStore(w http.ResponseWriter, r *http.Request, db *sql.DB, module modulespec.APIModule, spec modulespec.EndpointSpec, primary string) {
	r.Body = http.MaxBytesReader(w, r.Body, maxMultipartRequestBody)
	if err := r.ParseMultipartForm(maxMultipartRequestBody); err != nil {
		if errors.Is(err, http.ErrNotSupported) {
			writeJSON(w, http.StatusUnsupportedMediaType, map[string]string{"message": "Content-Type must be multipart/form-data"})
		} else {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Unable to parse multipart form: " + err.Error()})
		}
		return
	}
	if r.MultipartForm == nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"message": "The files field is required"})
		return
	}
	files := make([]*multipart.FileHeader, 0)
	for field, headers := range r.MultipartForm.File {
		indexName := strings.TrimPrefix(field, "files.")
		plainIndexName := indexName != "" && strings.Trim(indexName, "0123456789") == ""
		if field == "files" || field == "files[]" || (strings.HasPrefix(field, "files.") && plainIndexName) {
			files = append(files, headers...)
		}
	}
	if len(files) == 0 {
		problems := newValidationErrors()
		problems.add("files", "The files field is required.")
		writeValidationErrors(w, problems)
		return
	}

	var userID any
	registration, known := h.service.store.Registration(module.Name)
	if known && registration.Auth {
		if user, _, authenticated, err := h.resolveAuthUser(r, module.Name); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
			return
		} else if authenticated {
			userID = user.ID
		}
	}

	created := make([]map[string]any, 0, len(files))
	for _, header := range files {
		if header.Size > 10*1024*1024 {
			problems := newValidationErrors()
			problems.add("files", "The file may not be greater than 10240 kilobytes.")
			writeValidationErrors(w, problems)
			return
		}
		src, err := header.Open()
		if err != nil {
			writeJSON(w, http.StatusBadRequest, map[string]string{"message": "Unable to read uploaded file"})
			return
		}
		random := make([]byte, 16)
		if _, err := rand.Read(random); err != nil {
			src.Close()
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to generate file name"})
			return
		}
		storedName := fmt.Sprintf("%x", random)
		ext := strings.ToLower(filepath.Ext(safeUploadName(header.Filename)))
		if ext != "" {
			storedName += ext
		}
		diskPath := path.Join("arkzen", module.Name, storedName)
		fullPath := filepath.Join(h.service.storageDir, filepath.FromSlash(diskPath))
		if err := os.MkdirAll(filepath.Dir(fullPath), 0o755); err != nil {
			src.Close()
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to create upload directory"})
			return
		}
		dst, err := os.OpenFile(fullPath, os.O_WRONLY|os.O_CREATE|os.O_EXCL, 0o644)
		if err != nil {
			src.Close()
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to store uploaded file"})
			return
		}
		size, copyErr := io.Copy(dst, src)
		dst.Close()
		src.Close()
		if copyErr != nil {
			_ = os.Remove(fullPath)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to store uploaded file"})
			return
		}
		mimeType := header.Header.Get("Content-Type")
		if mimeType == "" {
			mimeType = mime.TypeByExtension(ext)
		}
		if mimeType == "" {
			mimeType = "application/octet-stream"
		}
		isImage := strings.HasPrefix(strings.ToLower(mimeType), "image/")
		input := map[string]any{
			"original_name": safeUploadName(header.Filename),
			"stored_name":   storedName,
			"mime_type":     mimeType,
			"size_bytes":    size,
			"disk_path":     diskPath,
			"is_image":      isImage,
		}
		if userID != nil {
			input["user_id"] = userID
		}
		prepareTimestamps(input, map[string]struct{}{}, true)
		columns, _, err := inspectColumns(db, module.Table)
		if err != nil {
			_ = os.Remove(fullPath)
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to inspect module table"})
			return
		}
		record, err := insertRecord(db, quoteIdentifier(module.Table), input, columns, primary)
		if err != nil {
			_ = os.Remove(fullPath)
			writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": "Unable to create record: " + err.Error()})
			return
		}
		created = append(created, record)
	}
	enrichUploadRecords(created)
	writeJSON(w, http.StatusCreated, map[string]any{"data": created})
}

func (h *Handler) uploadIndex(w http.ResponseWriter, r *http.Request, db *sql.DB, table string) {
	rows, err := db.Query("SELECT * FROM " + quoteIdentifier(table) + " ORDER BY \"id\" DESC")
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
	enrichUploadRecords(records)
	writeJSON(w, http.StatusOK, map[string]any{"data": records, "count": len(records)})
}

func (h *Handler) uploadDestroy(w http.ResponseWriter, db *sql.DB, table, id string) {
	var diskPath string
	err := db.QueryRow("SELECT \"disk_path\" FROM "+quoteIdentifier(table)+" WHERE \"id\" = ?", id).Scan(&diskPath)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read record"})
		return
	}
	if diskPath != "" {
		fullPath := filepath.Join(h.service.storageDir, filepath.FromSlash(diskPath))
		if err := os.Remove(fullPath); err != nil && !os.IsNotExist(err) {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to delete uploaded file"})
			return
		}
	}
	result, err := db.Exec("DELETE FROM "+quoteIdentifier(table)+" WHERE \"id\" = ?", id)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to delete record"})
		return
	}
	affected, _ := result.RowsAffected()
	if affected == 0 {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"message": "File deleted"})
}

func (h *Handler) uploadURL(w http.ResponseWriter, r *http.Request, db *sql.DB, table, id string) {
	var diskPath, storedName, mimeType, originalName string
	err := db.QueryRow("SELECT \"disk_path\",\"stored_name\",\"mime_type\",\"original_name\" FROM "+quoteIdentifier(table)+" WHERE \"id\" = ?", id).Scan(&diskPath, &storedName, &mimeType, &originalName)
	if errors.Is(err, sql.ErrNoRows) {
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Record not found"})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read record"})
		return
	}
	fullPath := filepath.Join(h.service.storageDir, filepath.FromSlash(diskPath))
	info, err := os.Stat(fullPath)
	if err != nil || info.IsDir() {
		http.NotFound(w, nil)
		return
	}
	if mimeType == "" {
		mimeType = mime.TypeByExtension(strings.ToLower(filepath.Ext(storedName)))
	}
	if mimeType == "" {
		mimeType = "application/octet-stream"
	}
	name := safeUploadName(originalName)
	if name == "" || name == "." || name == ".." {
		name = safeUploadName(storedName)
	}
	disposition := "attachment"
	if strings.HasPrefix(strings.ToLower(mimeType), "image/") {
		disposition = "inline"
	}
	w.Header().Set("Content-Type", mimeType)
	w.Header().Set("Content-Disposition", fmt.Sprintf(`%s; filename="%s"`, disposition, name))
	file, err := os.Open(fullPath)
	if err != nil {
		http.NotFound(w, nil)
		return
	}
	defer file.Close()
	http.ServeContent(w, r, name, info.ModTime(), file)
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
