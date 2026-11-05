package backend

import (
	"crypto/sha256"
	"database/sql"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"path"
	"reflect"
	"regexp"
	"runtime/debug"
	"sort"
	"strings"
	"sync"
	"time"
	"unicode"

	"github.com/go-chi/chi/v5"
	"github.com/pluff/pluff/engine/backend/go/internal/modulespec"
	"github.com/pluff/pluff/engine/backend/go/internal/rt"
	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

// runtime.go turns a DSL registration into the interpreted Go universe that
// serves custom `:go` handler bodies. Each (module, operation) pair owns one
// yaegi interpreter holding the generated prelude (records, scopes, facades)
// plus its own wrapper function; per-request state travels through the
// arkzen/rt host package so one compiled universe can serve many sessions.
//
// Binding rule: model facades are package-level vars named after the DSL
// model ("Profile"), so record types are named "<Model>Record" and handler
// bodies get a generation-time rewrite of type-position uses ("*Profile" ->
// "*ProfileRecord").

type runtimeField struct {
	Column   string
	Name     string
	GoType   string
	Nullable bool
	Kind     string // integer|float|boolean|datetime|date|json|text|extra
}

type runtimeModel struct {
	Table      string
	Name       string // facade var name, e.g. "Profile"
	Record     string // struct type name, e.g. "ProfileRecord"
	Fields     []runtimeField
	SoftDelete bool
	KeyValue   bool
	ThreeArg   bool // FirstOrCreate returns (record, created, error)
}

type runtimeEntry struct {
	mutex    sync.Mutex
	function reflect.Value
	compiled bool
	failure  string
}

type moduleRuntime struct {
	module     string
	stem       string
	prelude    []string
	imports    []string
	models     []runtimeModel
	operations map[string]string // op key -> decoded body
	services   rt.Services
	database   *sql.DB
	postgres   bool
	entries    map[string]*runtimeEntry
	entriesMu  sync.Mutex
}

// ------------------------------------------------------------ service side

func (s *Service) moduleRuntimeFor(name string) (*moduleRuntime, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	if s.runtimes == nil {
		s.runtimes = map[string]*moduleRuntime{}
	}
	if runtime, exists := s.runtimes[name]; exists {
		return runtime, nil
	}
	registration, known := s.store.Registration(name)
	if !known {
		return nil, fmt.Errorf("module %q is not registered", name)
	}
	runtime, err := s.newModuleRuntime(registration)
	if err != nil {
		return nil, err
	}
	s.runtimes[name] = runtime
	return runtime, nil
}

func (s *Service) invalidateModuleRuntime(name string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.dropModuleRuntimeLocked(name)
}

// dropModuleRuntimeLocked forgets a module's interpreter. The caller must
// already hold s.mu (Build and Remove do); taking it again here would
// deadlock, because sync.Mutex is not reentrant.
func (s *Service) dropModuleRuntimeLocked(name string) {
	delete(s.runtimes, name)
}

func (s *Service) newModuleRuntime(registration Registration) (*moduleRuntime, error) {
	runtime := &moduleRuntime{
		module:     registration.Name,
		stem:       interpretedStem(registration.Name),
		operations: registrationBodies(registration),
		entries:    map[string]*runtimeEntry{},
	}
	if len(runtime.operations) == 0 {
		return runtime, nil
	}
	database, err := openModuleDatabase(s.storageDir, registration.Name)
	if err != nil {
		return nil, err
	}
	runtime.database = database
	runtime.postgres = configuredDialect() == postgresDialect
	models, err := s.runtimeModels(registration, database, runtime.postgres, runtime.operations)
	if err != nil {
		_ = database.Close()
		return nil, err
	}
	runtime.services = s.runtimeServices(registration, database)
	runtime.models = models
	runtime.prelude = generateInterpPrelude(models, runtime.stem, runtime.operations)
	runtime.imports = hoistedImports(runtime.operations)
	return runtime, nil
}

func registrationBodies(registration Registration) map[string]string {
	operations := map[string]string{}
	for _, api := range registration.APIs {
		for operation, endpoint := range api.Endpoints {
			if strings.TrimSpace(endpoint.Body) != "" {
				operations["op:"+operation] = decodeInterpretedBody(endpoint.Body)
			}
		}
	}
	for _, group := range registration.CustomRoutes {
		for _, route := range group.Routes {
			if strings.TrimSpace(route.Body) != "" {
				operations["route:"+route.Handler] = decodeInterpretedBody(route.Body)
			}
		}
	}
	return operations
}

// decodeInterpretedBody accepts either the base64 form the DSL exporter uses
// or plain source.
func decodeInterpretedBody(encoded string) string {
	trimmed := strings.TrimSpace(encoded)
	if decoded, err := base64.StdEncoding.DecodeString(trimmed); err == nil {
		text := string(decoded)
		if strings.ContainsAny(text, "{}") || strings.Contains(text, ":=") || strings.Contains(text, "return ") {
			return text
		}
	}
	return encoded
}

var interpretedImportPattern = regexp.MustCompile(`(?m)^import\s+"([\w./-]+)"\s*$`)

var hoistedImportAllowlist = map[string]bool{
	"context": true, "errors": true, "fmt": true, "math": true, "reflect": true,
	"sort": true, "strconv": true, "strings": true, "time": true, "regexp": true,
	"encoding/json": true, "database/sql": true,
}

func hoistedImports(operations map[string]string) []string {
	found := map[string]bool{"context": true, "database/sql": true, "encoding/json": true,
		"errors": true, "fmt": true, "math": true, "reflect": true, "sort": true,
		"strconv": true, "strings": true, "time": true}
	for _, body := range operations {
		for _, match := range interpretedImportPattern.FindAllStringSubmatch(body, -1) {
			if hoistedImportAllowlist[match[1]] {
				found[match[1]] = true
			}
		}
	}
	imports := make([]string, 0, len(found))
	for name := range found {
		imports = append(imports, fmt.Sprintf("import %q", name))
	}
	sort.Strings(imports)
	return imports
}

func interpretedStem(module string) string {
	var builder strings.Builder
	capitalize := true
	for _, character := range module {
		if character == '-' || character == '_' || character == '.' {
			capitalize = true
			continue
		}
		if !unicode.IsLetter(character) && !unicode.IsDigit(character) {
			continue
		}
		if capitalize {
			builder.WriteRune(unicode.ToUpper(character))
			capitalize = false
			continue
		}
		builder.WriteRune(character)
	}
	name := builder.String()
	if name == "" {
		return "Module"
	}
	return name
}

// ----------------------------------------------------------- body rewrite

var interpretedRewriteGuard = regexp.MustCompile(`(?s)"(?:[^"\\\n]|\\.)*"|` + "`(?:[^`\\\\]|\\\\.)*`")

// rewriteInterpretedBody maps model names used in type positions onto their
// record structs; the facade var binding owns the plain model name.
func rewriteInterpretedBody(body string, models []runtimeModel) string {
	island := 0
	islands := map[int]string{}
	body = interpretedRewriteGuard.ReplaceAllStringFunc(body, func(match string) string {
		islands[island] = match
		replacement := fmt.Sprintf("\x00%d\x00", island)
		island++
		return replacement
	})
	for _, model := range models {
		body = rewritePointerTypes(body, model.Name, model.Record)
	}
	for index := 0; index < island; index++ {
		body = strings.ReplaceAll(body, fmt.Sprintf("\x00%d\x00", index), islands[index])
	}
	return body
}

// rewritePointerTypes maps every standalone "*Name" pointer-type token onto
// "*Record". Go's RE2 has no negative lookahead, so the two guards the old
// regexp encoded — the token must not continue into a longer identifier
// (?![A-Za-z0-9_]) and must not be a dereference/member access (*x.y, so not
// followed by an optional-space dot) — are applied by scanning by hand.
func rewritePointerTypes(body, name, record string) string {
	needle := "*" + name
	replacement := "*" + record
	var out strings.Builder
	out.Grow(len(body))
	for index := 0; index < len(body); {
		if strings.HasPrefix(body[index:], needle) {
			end := index + len(needle)
			if end == len(body) || !isIdentifierByte(body[end]) {
				if !isFollowedByDot(body[end:]) {
					out.WriteString(replacement)
					index = end
					continue
				}
			}
		}
		out.WriteByte(body[index])
		index++
	}
	return out.String()
}

func isIdentifierByte(character byte) bool {
	return character == '_' ||
		(character >= 'a' && character <= 'z') ||
		(character >= 'A' && character <= 'Z') ||
		(character >= '0' && character <= '9')
}

func isFollowedByDot(remainder string) bool {
	for _, character := range remainder {
		if character == ' ' || character == '\t' {
			continue
		}
		return character == '.'
	}
	return false
}

// ------------------------------------------------------------ model schema

type runtimeTableSchema struct {
	columns  []string
	primary  string
	nullable map[string]bool
	kinds    map[string]string
}

// runtimeModels derives the interpreted model set from the registration,
// falling back to live schema introspection when the stored registry lacks
// database blocks (registries written by older engines).
func (s *Service) runtimeModels(registration Registration, database *sql.DB, postgres bool,
	operations map[string]string) ([]runtimeModel, error) {
	schemas := map[string]runtimeTableSchema{}
	load := func(table string) error {
		if _, exists := schemas[table]; exists {
			return nil
		}
		if definition, known := registrationDatabase(definitionByTable(registration), table); known && len(definition.Columns) > 0 {
			schema := runtimeTableSchema{nullable: map[string]bool{}, kinds: map[string]string{}, primary: "id"}
			for column, columnDefinition := range definition.Columns {
				schema.columns = append(schema.columns, column)
				schema.nullable[column] = columnDefinition.Nullable != nil && *columnDefinition.Nullable
				schema.kinds[column] = strings.ToLower(columnDefinition.Type)
				if columnDefinition.Primary {
					schema.primary = column
				}
			}
			sort.Strings(schema.columns)
			schemas[table] = schema
			return nil
		}
		columns, primary, nullable, kinds, err := introspectColumnsForRuntime(database, postgres, table)
		if err != nil {
			return err
		}
		schemas[table] = runtimeTableSchema{columns: columns, primary: primary, nullable: nullable, kinds: kinds}
		return nil
	}

	tables := make([]string, 0, len(registration.Databases))
	for _, definition := range registration.Databases {
		tables = append(tables, definition.Table)
	}
	if len(registration.Databases) == 0 {
		discovered, err := listRuntimeTables(database, postgres)
		if err != nil {
			return nil, err
		}
		tables = discovered
	}
	excluded := map[string]bool{"personal_access_tokens": true, "jobs": true, "failed_jobs": true}
	var included []string
	for _, table := range tables {
		if excluded[table] {
			continue
		}
		included = append(included, table)
	}
	if registration.Auth && !containsString(included, "users") {
		included = append(included, "users")
	}

	modelByTable := map[string]string{}
	for _, api := range registration.APIs {
		if api.Table != "" && api.Model != "" {
			if _, exists := modelByTable[api.Table]; !exists {
				modelByTable[api.Table] = exportedGoIdentifier(api.Model)
			}
		}
	}

	bodies := make([]string, 0, len(operations))
	for _, body := range operations {
		bodies = append(bodies, body)
	}
	assigned := assignedFieldsFrom(bodies)

	usedNames := map[string]int{}
	var models []runtimeModel
	for _, table := range included {
		if err := load(table); err != nil {
			return nil, err
		}
		schema := schemas[table]
		if len(schema.columns) == 0 {
			continue
		}
		name := modelByTable[table]
		if name == "" {
			name = exportedGoIdentifier(singularTableName(table))
		}
		if name == "" {
			continue
		}
		unique := uniqueGoIdentifier(name, usedNames)
		if unique != name {
			name = unique
		}
		definition := definitionByTable(registration)[table]
		model := runtimeModel{Table: table, Name: name, Record: name + "Record", SoftDelete: definition.SoftDeletes}
		fieldNames := map[string]bool{"Extras": true, "With": true}
		for _, column := range schema.columns {
			field := interpretedField(column, schema.kinds[column], column == schema.primary, schema.nullable[column])
			if field.Name == "" || fieldNames[field.Name] {
				continue
			}
			if column == "deleted_at" {
				model.SoftDelete = true
			}
			fieldNames[field.Name] = true
			model.Fields = append(model.Fields, field)
		}
		if !fieldNames["CreatedAt"] {
			model.Fields = append(model.Fields, runtimeField{Column: "created_at", Name: "CreatedAt", GoType: "time.Time", Kind: "datetime"})
			fieldNames["CreatedAt"] = true
		}
		if !fieldNames["UpdatedAt"] {
			model.Fields = append(model.Fields, runtimeField{Column: "updated_at", Name: "UpdatedAt", GoType: "time.Time", Kind: "datetime"})
			fieldNames["UpdatedAt"] = true
		}
		for _, extra := range assigned {
			if fieldNames[extra] || unicode.IsLower([]rune(extra)[0]) {
				continue
			}
			isModel := false
			for _, candidate := range included {
				candidateName := exportedGoIdentifier(singularTableName(candidate))
				if candidateName == extra {
					isModel = true
					break
				}
			}
			if isModel || extra == "Mailer" || extra == "Log" || extra == "NotificationService" {
				continue
			}
			fieldNames[extra] = true
			model.Fields = append(model.Fields, runtimeField{Column: extra, Name: extra, GoType: "interface{}", Kind: "extra"})
		}
		if _, exists := schemas[table].kinds["key"]; exists {
			model.KeyValue = isKeyValueModel(model, operations)
		}
		if three, found := firstOrCreateArity(bodies, model.Name); found {
			model.ThreeArg = three
		}
		models = append(models, model)
	}
	return models, nil
}

func definitionByTable(registration Registration) map[string]DatabaseDefinition {
	result := map[string]DatabaseDefinition{}
	for _, definition := range registration.Databases {
		result[definition.Table] = definition
	}
	return result
}

func registrationDatabase(definitions map[string]DatabaseDefinition, table string) (DatabaseDefinition, bool) {
	definition, exists := definitions[table]
	return definition, exists
}

func containsString(values []string, want string) bool {
	for _, value := range values {
		if value == want {
			return true
		}
	}
	return false
}

func interpretedField(column, kind string, isPrimary, isNullable bool) runtimeField {
	field := runtimeField{Column: column, Name: runtimeFieldName(column), Kind: kind}
	switch kind {
	case "datetime":
		if isNullable || column == "deleted_at" {
			field.GoType, field.Nullable = "*time.Time", true
			return field
		}
		field.GoType = "time.Time"
	case "date":
		field.GoType = "string"
	case "integer", "biginteger", "foreignid":
		field.GoType = "int"
		if isNullable && !isPrimary {
			field.GoType, field.Nullable = "*int", true
		}
	case "float", "decimal", "double":
		field.GoType = "float64"
	case "boolean":
		field.GoType = "bool"
	case "json":
		field.GoType = "interface{}"
	default:
		field.GoType = "string"
	}
	return field
}

var runtimeAcronyms = map[string]string{
	"id": "ID", "sss": "SSS", "hdmf": "HDMF", "atm": "ATM", "xp": "XP",
	"mpl": "MPL", "url": "URL", "api": "API", "pdf": "PDF", "ui": "UI", "jl": "JL",
}

func runtimeFieldName(column string) string {
	var builder strings.Builder
	for _, part := range strings.FieldsFunc(column, func(r rune) bool { return r == '_' || r == '-' }) {
		if acronym, exists := runtimeAcronyms[strings.ToLower(part)]; exists {
			builder.WriteString(acronym)
			continue
		}
		runes := []rune(part)
		builder.WriteRune(unicode.ToUpper(runes[0]))
		builder.WriteString(strings.ToLower(string(runes[1:])))
	}
	name := builder.String()
	if name == "" {
		return ""
	}
	if unicode.IsDigit([]rune(name)[0]) {
		name = "F" + name
	}
	if token := name; token != "" && strings.ToLower(token) == token {
		name = strings.ToUpper(string(token[0])) + token[1:]
	}
	return name
}

var assignedFieldPattern = regexp.MustCompile(`\.([A-Z][A-Za-z0-9]*)\s*(,[^=\n]*)?=`)

func assignedFieldsFrom(bodies []string) []string {
	result := map[string]bool{}
	ignored := map[string]bool{"Extras": true, "DB": true}
	for _, body := range bodies {
		for _, match := range assignedFieldPattern.FindAllStringSubmatchIndex(body, -1) {
			if match[1] < len(body) && body[match[1]] == '=' {
				continue
			}
			name := body[match[2]:match[3]]
			if name == "" || ignored[name] || strings.HasSuffix(name, "Record") || strings.HasSuffix(name, "FacadeT") {
				continue
			}
			result[name] = true
		}
	}
	keys := make([]string, 0, len(result))
	for key := range result {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	return keys
}

func isKeyValueModel(model runtimeModel, operations map[string]string) bool {
	hasKey, hasValue := false, false
	for _, field := range model.Fields {
		switch field.Column {
		case "key":
			hasKey = true
		case "value":
			hasValue = true
		}
	}
	if !hasKey || !hasValue {
		return false
	}
	pattern := regexp.MustCompile(regexp.QuoteMeta(model.Name) + `\.(Value|FloatValue|UpdateOrCreate)\(`)
	for _, body := range operations {
		if pattern.MatchString(body) {
			return true
		}
	}
	return false
}

var firstOrCreateThreePattern = regexp.MustCompile(`(?m)^\s*\w+,\s*\w+,\s*\w+\s*:?=\s*([A-Z]\w*)\.FirstOrCreate\(`)
var firstOrCreateTwoPattern = regexp.MustCompile(`(?m)^\s*\w+,\s*\w+\s*:?=\s*([A-Z]\w*)\.FirstOrCreate\(`)

func firstOrCreateArity(bodies []string, modelName string) (threeArg bool, found bool) {
	for _, body := range bodies {
		for _, match := range firstOrCreateThreePattern.FindAllStringSubmatch(body, -1) {
			if match[1] == modelName {
				return true, true
			}
		}
		for _, match := range firstOrCreateTwoPattern.FindAllStringSubmatch(body, -1) {
			if match[1] == modelName {
				return false, true
			}
		}
	}
	return false, false
}

// ------------------------------------------------------------- db accessors

func listRuntimeTables(database *sql.DB, postgres bool) ([]string, error) {
	var rows *sql.Rows
	var err error
	if postgres {
		rows, err = database.Query(`SELECT table_name FROM information_schema.tables WHERE table_schema = current_schema() ORDER BY table_name`)
	} else {
		rows, err = database.Query(`SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name`)
	}
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var tables []string
	for rows.Next() {
		var name string
		if scanErr := rows.Scan(&name); scanErr != nil {
			return nil, scanErr
		}
		tables = append(tables, name)
	}
	return tables, rows.Err()
}

func introspectColumnsForRuntime(database *sql.DB, postgres bool, table string) ([]string, string, map[string]bool, map[string]string, error) {
	var rows *sql.Rows
	var err error
	if postgres {
		rows, err = database.Query(`SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = $1 ORDER BY ordinal_position`, table)
	} else {
		rows, err = database.Query(`PRAGMA table_info("` + strings.ReplaceAll(table, `"`, "") + `")`)
	}
	if err != nil {
		return nil, "", nil, nil, err
	}
	defer rows.Close()
	var names []string
	nullable := map[string]bool{}
	kinds := map[string]string{}
	primary := "id"
	hasID := false
	for rows.Next() {
		if postgres {
			var name, dataType, isNullable string
			if scanErr := rows.Scan(&name, &dataType, &isNullable); scanErr != nil {
				return nil, "", nil, nil, scanErr
			}
			names = append(names, name)
			nullable[name] = strings.EqualFold(isNullable, "YES")
			kinds[name] = runtimePostgresKind(dataType)
			if name == "id" {
				hasID = true
			}
			continue
		}
		var cid, notNull, pk int
		var name, declared string
		var defaultValue sql.NullString
		if scanErr := rows.Scan(&cid, &name, &declared, &notNull, &defaultValue, &pk); scanErr != nil {
			return nil, "", nil, nil, scanErr
		}
		names = append(names, name)
		nullable[name] = notNull == 0
		kinds[name] = runtimeSQLiteKind(declared, name)
		if pk == 1 {
			primary = name
		}
		if name == "id" {
			hasID = true
		}
	}
	if len(names) == 0 {
		return nil, "", nil, nil, nil
	}
	if !hasID && primary == "id" {
		for _, name := range names {
			if strings.HasSuffix(name, "_id") {
				primary = name
				break
			}
		}
	}
	return names, primary, nullable, kinds, rows.Err()
}

func runtimeSQLiteKind(declared, column string) string {
	switch strings.ToUpper(declared) {
	case "INTEGER":
		if strings.HasSuffix(column, "_at") || strings.HasSuffix(column, "_date") || column == "timestamp" || strings.HasSuffix(column, "_time") {
			return "datetime"
		}
		return "integer"
	case "REAL", "FLOAT", "DOUBLE", "NUMERIC", "DECIMAL":
		return "float"
	case "BOOLEAN", "BOOL":
		return "boolean"
	case "DATE":
		return "date"
	case "DATETIME", "TIMESTAMP":
		return "datetime"
	case "JSON", "JSONB", "BLOB":
		return "json"
	default:
		return "text"
	}
}

func runtimePostgresKind(dataType string) string {
	switch strings.ToLower(dataType) {
	case "integer", "bigint", "smallint", "serial", "bigserial", "int", "int4", "int8":
		return "integer"
	case "real", "double precision", "numeric", "decimal", "money", "float8":
		return "float"
	case "boolean", "bool":
		return "boolean"
	case "date":
		return "date"
	case "timestamp", "timestamp without time zone", "timestamp with time zone", "timestamptz", "time", "interval":
		return "datetime"
	case "json", "jsonb", "bytea":
		return "json"
	default:
		return "text"
	}
}

// ----------------------------------------------------------- prelude text

// preludeStdlibPackages are always bound into a module's yaegi universe
// because the generated prelude/wrapper scaffolding references fmt, strings,
// context, time and encoding/json regardless of the user handler body's own
// imports.
var preludeStdlibPackages = []string{"fmt", "strings", "context", "time", "encoding/json", "reflect"}

// eventsFacadeIdentifier finds <Name>Events receivers used in handler bodies.
var eventsFacadeIdentifier = regexp.MustCompile(`\b([A-Z][A-Za-z0-9]*Events)\b`)

func generateInterpPrelude(models []runtimeModel, stem string, operations map[string]string) []string {
	// Prelude statements are Eval'd sequentially into the module's yaegi
	// universe, and yaegi type-checks a function body at definition time —
	// so every helper must be declared before the first function that calls
	// it. Leaf helpers come first, session/service accessors next, the rt*
	// wrappers, then the facade types, then per-model scaffolding, and only
	// finally currentUserRecord (which references the UserRecord scaffolding).
	statements := []string{
		`var __sid int64`,
		`func IsEmail(value string) bool { return rt.IsEmail(value) }`,
		`func IsOneOf(value string, candidates ...string) bool { return rt.IsOneOf(value, candidates...) }`,
		`func runtimeSession() *rt.Session { return rt.Get(__sid) }`,
		`func database() *rt.Database { return runtimeSession().Database }`,
		`func params() rt.Params { return runtimeSession().Params }`,
		`func runtimeServices() rt.Services { s := runtimeSession(); if s == nil || s.Services == nil { return rt.Services{} }; return *s.Services }`,
		`func classNameFromKey(key string) string { parts := strings.Split(strings.ReplaceAll(key, "_", "-"), "-"); out := ""; for _, part := range parts { if part == "" { continue }; runes := []rune(part); out += strings.ToUpper(string(runes[0])) + string(runes[1:]) }; return out }`,
		`func mergeMeta(metas []map[string]interface{}) map[string]interface{} { if len(metas) > 0 && metas[0] != nil { return metas[0] }; return map[string]interface{}{} }`,
		`func rtBroadcast(section string, target interface{}, payload map[string]interface{}) error { f := runtimeServices().Broadcast; if f == nil { return fmt.Errorf("realtime services are unavailable") }; return f(section, target, payload) }`,
		`func rtLog(level string, message string, meta map[string]interface{}) { f := runtimeServices().Log; if f != nil { f(level, message, meta) } }`,
		`func rtMailClass(key string) string { f := runtimeServices().MailClass; if f == nil { return classNameFromKey(key) }; return f(key) }`,
		`func rtMailSend(key string, to string, data map[string]interface{}) (map[string]interface{}, error) { f := runtimeServices().MailSend; if f == nil { return nil, fmt.Errorf("mail services are unavailable") }; return f(key, to, data) }`,
		`func rtNotifyClass(key string) string { f := runtimeServices().NotifyClass; if f == nil { return classNameFromKey(key) }; return f(key) }`,
		`func rtNotifySend(user *rt.User, key string, message string) error { f := runtimeServices().NotifySend; if f == nil { return fmt.Errorf("notification services are unavailable") }; return f(user, key, message) }`,
		`func runtimeResolvedName(key string) string { f := runtimeServices().ResolvedName; if f == nil { return key }; return f(key) }`,
		`type MailerFacadeT struct{}`,
		`func (m MailerFacadeT) ClassName(key string) string { return rtMailClass(key) }`,
		`func (m MailerFacadeT) RenderAndSend(ctx context.Context, key string, to string, data map[string]interface{}) (map[string]interface{}, error) { return rtMailSend(key, to, data) }`,
		`var Mailer = MailerFacadeT{}`,
		`type NotificationServiceFacadeT struct{}`,
		`func (n NotificationServiceFacadeT) ClassName(key string) string { return rtNotifyClass(key) }`,
		`func (n NotificationServiceFacadeT) Send(ctx context.Context, user *rt.User, key string, message string) error { return rtNotifySend(user, key, message) }`,
		`var NotificationService = NotificationServiceFacadeT{}`,
		`type LogFacadeT struct{}`,
		`func (l LogFacadeT) Info(message string, meta ...map[string]interface{}) { rtLog("info", message, mergeMeta(meta)) }`,
		`func (l LogFacadeT) Warn(message string, meta ...map[string]interface{}) { rtLog("warn", message, mergeMeta(meta)) }`,
		`func (l LogFacadeT) Error(message string, meta ...map[string]interface{}) { rtLog("error", message, mergeMeta(meta)) }`,
		`var Log = LogFacadeT{}`,
	}
	statements = append(statements, fmt.Sprintf(
		"type %sEventsFacadeT struct{}\nfunc (e %sEventsFacadeT) Broadcast(ctx context.Context, arg interface{}, payload map[string]interface{}) error { section := %q; var target interface{}; if name, ok := arg.(string); ok { section = name } else { section = \"\"; target = arg }; return rtBroadcast(section, target, payload) }\nvar %sEvents = %sEventsFacadeT{}",
		stem, stem, stem, stem, stem))
	// Handler bodies may address the realtime facade under a module-chosen
	// name (QueueEvents, MessageEvents, ...) instead of the derived stem;
	// scaffold every identifier they reference so all of them broadcast
	// through the module channel like the compiled modules do.
	facadeNames := map[string]bool{}
	for _, body := range operations {
		for _, match := range eventsFacadeIdentifier.FindAllString(body, -1) {
			facadeNames[match] = true
		}
	}
	stemEvents := stem + "Events"
	for name := range facadeNames {
		if name == stemEvents {
			continue
		}
		statements = append(statements, fmt.Sprintf(
			"type %sFacadeT struct{}\nfunc (e %sFacadeT) Broadcast(ctx context.Context, arg interface{}, payload map[string]interface{}) error { section := %q; var target interface{}; if name, ok := arg.(string); ok { section = name } else { section = \"\"; target = arg }; return rtBroadcast(section, target, payload) }\nvar %s = %sFacadeT{}",
			name, name, stem, name, name))
	}
	for _, model := range models {
		statements = append(statements, generateModelPrelude(model)...)
	}
	// currentUserRecord is only valid for modules that scaffold a UserRecord
	// (i.e. own a users table); referencing it otherwise would break the
	// prelude for every non-auth tatemono.
	for _, model := range models {
		if model.Record != "UserRecord" {
			continue
		}
		statements = append(statements, `func currentUserRecord() *UserRecord { u := runtimeSession().Request.User(); if u == nil { return nil }; row, err := database().FindByKey("users", u.ID); if err != nil || row == nil { return &UserRecord{ID: u.ID, Name: u.Name, Email: u.Email, Role: u.Role} }; rec, herr := hydrateUserRecord(row); if herr != nil || rec == nil { return &UserRecord{ID: u.ID, Name: u.Name, Email: u.Email, Role: u.Role} }; rec.Role = u.Role; return rec }`)
		break
	}
	return statements
}

func generateModelPrelude(model runtimeModel) []string {
	record := model.Record
	scope := record + "Scope"
	wrapper := record + "Wrapper"
	facadeType := record + "FacadeT"
	primaryColumn := modelPrimaryColumn(model)
	primaryField := modelPrimaryField(model)

	var fieldLines []string
	var encodeLines []string
	for _, field := range model.Fields {
		fieldLines = append(fieldLines, fmt.Sprintf("\t%s %s %s", field.Name, field.GoType, runtimeFieldTag(field)))
		switch {
		case field.Kind == "extra":
			encodeLines = append(encodeLines, fmt.Sprintf("\tout[%q] = r.%s", strings.ToLower(field.Name), field.Name))
		case field.Kind == "datetime":
			if field.Nullable {
				encodeLines = append(encodeLines, fmt.Sprintf("\tif r.%s != nil {\n\t\tout[%q] = r.%s.UTC().Format(time.RFC3339Nano)\n\t}", field.Name, field.Column, field.Name))
			} else {
				encodeLines = append(encodeLines, fmt.Sprintf("\tout[%q] = r.%s.UTC().Format(time.RFC3339Nano)", field.Column, field.Name))
			}
		case field.Kind == "json":
			encodeLines = append(encodeLines, fmt.Sprintf("\tout[%q] = rt.AsString(r.%s)", field.Column, field.Name))
		default:
			encodeLines = append(encodeLines, fmt.Sprintf("\tout[%q] = r.%s", field.Column, field.Name))
		}
	}
	fieldLines = append(fieldLines, "\tExtras map[string]interface{} `json:\"-\"`")

	encodeLines = append([]string{"\tout := map[string]interface{}{}"}, encodeLines...)
	encodeLines = append(encodeLines, "\tif len(r.Extras) > 0 {\n\t\tfor k, v := range r.Extras {\n\t\t\tout[k] = v\n\t\t}\n\t}")

	var statements []string
	statements = append(statements,
		fmt.Sprintf("type %s struct {\n%s\n}", record, strings.Join(fieldLines, "\n")),
		fmt.Sprintf("func marshal%s(r *%s) map[string]interface{} {\n\tif r == nil {\n\t\treturn nil\n\t}\n%s\n\treturn out\n}", record, record, strings.Join(encodeLines, "\n")),
		fmt.Sprintf(`func hydrate%s(row map[string]interface{}) (*%s, error) {
	if row == nil {
		return nil, nil
	}
	rec := &%s{}
	if err := rt.Hydrate(row, rec); err != nil {
		return nil, err
	}
	return rec, nil
}`, record, record, record),
	)

	if model.KeyValue {
		statements = append(statements,
			fmt.Sprintf(`type %sKV struct{}
func (k %sKV) Value(ctx context.Context, key string) string { return database().SettingValue(%q, key, "") }
func (k %sKV) FloatValue(ctx context.Context, key string) float64 { return database().SettingFloatValue(%q, key, 0) }
func (k %sKV) UpdateOrCreate(ctx context.Context, key string, value string) error { return database().SettingUpdateOrCreate(%q, key, value) }
var %s = %sKV{}`, record, record, model.Table, record, model.Table, record, model.Table, model.Name, record))
		return statements
	}

	statements = append(statements,
		fmt.Sprintf("type %ss []*%s", record, record),
		fmt.Sprintf("func (l %ss) Reverse() %ss { out := %ss{}; for i := len(l)-1; i >= 0; i-- { out = append(out, l[i]) }; return out }", record, record, record),
		fmt.Sprintf("type %s struct { Rec *%s `json:\"-\"`; Extras map[string]interface{} `json:\"-\"`; Rels []string `json:\"-\"` }", wrapper, record),
		fmt.Sprintf("type %s struct { table string; wheres []rt.Where; ors [][]rt.Where; orders []rt.Order; limitValue int; relations []string }", scope),
		fmt.Sprintf("func new%s() *%s { return &%s{table: %q} }", scope, scope, scope, model.Table),
	)

	scopeMethods := []string{
		fmt.Sprintf("func (s *%s) Where(args ...interface{}) *%s { s.wheres = append(s.wheres, rt.NewWhere(args...)); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereIn(column string, values interface{}) *%s { s.wheres = append(s.wheres, rt.MakeWhere(column, \"in\", nil, rt.FlattenValues(values))); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereNotIn(column string, values interface{}) *%s { s.wheres = append(s.wheres, rt.MakeWhere(column, \"notin\", nil, rt.FlattenValues(values))); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereNot(column string, value interface{}) *%s { s.wheres = append(s.wheres, rt.MakeWhere(column, \"!=\", value, nil)); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereAny(values map[string]interface{}) *%s { group := []rt.Where{}; for column, value := range values { group = append(group, rt.ParseWhereKV(column, value)) }; s.ors = append(s.ors, group); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereDate(column string, day string) *%s { s.wheres = append(s.wheres, rt.MakeWhere(column, \"raw\", day, nil)); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) WhereNotNull(column string) *%s { s.wheres = append(s.wheres, rt.MakeWhere(column, \"isnotnull\", nil, nil)); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) OrderBy(column string, direction ...string) *%s { dir := \"asc\"; if len(direction) > 0 { dir = direction[0] }; s.orders = append(s.orders, rt.NewOrder(column, dir)); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) Limit(value int) *%s { s.limitValue = value; return s }", scope, scope),
		fmt.Sprintf("func (s *%s) With(rel ...string) *%s { s.relations = append(s.relations, rel...); return s }", scope, scope),
		fmt.Sprintf("func (s *%s) buildFilter() rt.Filter { return rt.MakeFilter(s.wheres, s.ors) }", scope),
		fmt.Sprintf(`func (s *%s) attachRelations(rec *%s, row map[string]interface{}) {
	for _, rel := range s.relations {
		related, err := database().Related(s.table, rel, row)
		if err == nil && related != nil {
			if rec.Extras == nil {
				rec.Extras = map[string]interface{}{}
			}
			rec.Extras[rel] = related
		}
	}
}`, scope, record),
		fmt.Sprintf(`func (s *%s) rows(ctx context.Context) ([]map[string]interface{}, error) {
	return database().SelectFiltered(s.table, s.buildFilter(), s.orders, s.limitValue)
}`, scope),
		fmt.Sprintf(`func (s *%s) Get(ctx context.Context) (%ss, error) {
	rows, err := s.rows(ctx)
	if err != nil {
		return nil, err
	}
	out := %ss{}
	for _, row := range rows {
		rec, hydrateErr := hydrate%s(row)
		if hydrateErr != nil {
			return nil, hydrateErr
		}
		s.attachRelations(rec, row)
		out = append(out, rec)
	}
	return out, nil
}`, scope, record, record, record),
		fmt.Sprintf(`func (s *%s) First(ctx context.Context) (*%s, error) {
	rows, err := s.rows(ctx)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	rec, hydrateErr := hydrate%s(rows[0])
	if hydrateErr != nil {
		return nil, hydrateErr
	}
	s.attachRelations(rec, rows[0])
	return rec, nil
}`, scope, record, record),
		fmt.Sprintf("func (s *%s) Count(ctx context.Context) (int, error) { n, err := database().Count(s.table, s.buildFilter()); return int(n), err }", scope),
		fmt.Sprintf("func (s *%s) Exists(ctx context.Context) (bool, error) { return database().Exists(s.table, s.buildFilter()) }", scope),
		fmt.Sprintf("func (s *%s) Max(ctx context.Context, column string) (int, error) { v, err := database().Aggregate(s.table, s.buildFilter(), \"MAX\", column); return int(v), err }", scope),
		fmt.Sprintf(`func (s *%s) Pluck(ctx context.Context, column string) ([]interface{}, error) {
	values, err := database().Pluck(s.table, s.buildFilter(), s.orders, s.limitValue, column)
	if err != nil {
		return nil, err
	}
	out := []interface{}{}
	for _, value := range values {
		if value != nil {
			out = append(out, value)
		}
	}
	return out, nil
}`, scope),
		fmt.Sprintf(`func (s *%s) PluckInt(ctx context.Context, column string) ([]int, error) {
	raw, err := s.Pluck(ctx, column)
	if err != nil {
		return nil, err
	}
	out := []int{}
	for _, value := range raw {
		out = append(out, int(rt.AsInt64(value)))
	}
	return out, nil
}`, scope),
		fmt.Sprintf("func (s *%s) Update(ctx context.Context, values map[string]interface{}) (int, error) { n, err := database().UpdateRows(s.table, s.buildFilter(), values); return int(n), err }", scope),
		fmt.Sprintf("func (s *%s) Delete(ctx context.Context) (int, error) { n, err := database().DeleteRows(s.table, s.buildFilter()); return int(n), err }", scope),
		fmt.Sprintf("func (s *%s) Increment(ctx context.Context, column string, delta int) error { return database().IncrementFilter(s.table, s.buildFilter(), column, delta) }", scope),
		fmt.Sprintf(`func (s *%s) Paginate(ctx context.Context, perPage int, rest ...interface{}) (map[string]interface{}, error) {
	page := 1
	base := ""
	if len(rest) > 0 {
		page = int(rt.AsInt64(rest[0]))
	}
	if len(rest) > 1 {
		base = rt.AsString(rest[1])
	}
	return database().Paginate(s.table, s.buildFilter(), s.orders, int64(perPage), int64(page), base)
}`, scope),
	}
	statements = append(statements, scopeMethods...)

	recordMethods := []string{
		// Accessors first: yaegi type-checks a method body when the method is
		// defined, so Update/Save/Delete/Refresh/Increment/Decrement (which all
		// call r.tableName()/r.primaryColumn()/r.primaryValue()) must come after
		// these three leaf helpers.
		fmt.Sprintf("func (r *%s) tableName() string { return %q }", record, model.Table),
		fmt.Sprintf("func (r *%s) primaryColumn() string { return %q }", record, primaryColumn),
		fmt.Sprintf(`func (r *%s) primaryValue() interface{} {
	if r == nil {
		return nil
	}
	f := reflect.ValueOf(r).Elem().FieldByName(%q)
	if !f.IsValid() {
		return nil
	}
	return f.Interface()
}`, record, primaryField),
		fmt.Sprintf(`func (r *%s) Update(ctx context.Context, values map[string]interface{}) error {
	row, err := database().UpdateRow(r.tableName(), r.primaryValue(), values)
	if err != nil {
		return err
	}
	fresh, hydrateErr := hydrate%s(row)
	if hydrateErr != nil {
		return hydrateErr
	}
	if fresh != nil {
		*r = *fresh
	}
	return nil
}`, record, record),
		fmt.Sprintf(`func (r *%s) Save(ctx context.Context) error {
	values := rt.StructToMap(r)
	row, err := database().UpdateRow(r.tableName(), r.primaryValue(), values)
	if err != nil {
		return err
	}
	fresh, hydrateErr := hydrate%s(row)
	if hydrateErr != nil {
		return hydrateErr
	}
	if fresh != nil {
		*r = *fresh
	}
	return nil
}`, record, record),
		fmt.Sprintf(`func (r *%s) Delete(ctx context.Context) (int, error) {
	n, err := database().DeleteRows(r.tableName(), rt.SimpleFilter(rt.MakeWhere(r.primaryColumn(), "=", r.primaryValue(), nil)))
	return int(n), err
}`, record),
		fmt.Sprintf(`func (r *%s) Refresh(ctx context.Context) (*%s, error) {
	row, err := database().FindByKey(r.tableName(), r.primaryValue())
	if err != nil || row == nil {
		return r, err
	}
	fresh, hydrateErr := hydrate%s(row)
	if hydrateErr != nil {
		return r, nil
	}
	if fresh != nil {
		*r = *fresh
	}
	return r, nil
}`, record, record, record),
		fmt.Sprintf("func (r *%s) Increment(ctx context.Context, column string, delta int) error { return database().IncrementByKey(r.tableName(), r.primaryValue(), column, delta) }", record),
		fmt.Sprintf("func (r *%s) Decrement(ctx context.Context, column string, delta int) error { return database().IncrementByKey(r.tableName(), r.primaryValue(), column, -delta) }", record),
		fmt.Sprintf("func (r *%s) ToMap() map[string]interface{} { return marshal%s(r) }", record, record),
		fmt.Sprintf("func (r *%s) With(args ...interface{}) *%s { w := &%s{Rec: r}; if len(args) == 1 { w.Rels = append(w.Rels, rt.AsString(args[0])) } else if len(args) >= 2 { if w.Extras == nil { w.Extras = map[string]interface{}{} }; w.Extras[rt.AsString(args[0])] = args[1] }; return w }", record, wrapper, wrapper),
	}
	statements = append(statements, recordMethods...)

	wrapperMethods := []string{
		fmt.Sprintf(`func (w *%s) Load(ctx context.Context) (*%s, error) {
	rel := ""
	if len(w.Rels) > 0 {
		rel = w.Rels[0]
	}
	if rel == "" || w.Rec == nil {
		return w.Rec, nil
	}
	related, err := database().Related(w.Rec.tableName(), rel, rt.StructToMap(w.Rec))
	if err != nil {
		return nil, err
	}
	if related != nil {
		if w.Rec.Extras == nil {
			w.Rec.Extras = map[string]interface{}{}
		}
		w.Rec.Extras[rel] = related
	}
	return w.Rec, nil
}`, wrapper, record),
		fmt.Sprintf(`func (w *%s) MarshalJSON() ([]byte, error) {
	base := marshal%s(w.Rec)
	if base == nil {
		base = map[string]interface{}{}
	}
	for key, value := range w.Extras {
		base[key] = value
	}
	return json.Marshal(base)
}`, wrapper, record),
	}
	statements = append(statements, wrapperMethods...)

	facadeMethods := []string{
		fmt.Sprintf("type %s struct{}", facadeType),
		fmt.Sprintf("func (f %s) Query() *%s { return new%s() }", facadeType, scope, scope),
		fmt.Sprintf(`func (f %s) Create(ctx context.Context, values map[string]interface{}) (*%s, error) {
	row, err := database().Insert(%q, values)
	if err != nil {
		return nil, err
	}
	return hydrate%s(row)
}`, facadeType, record, model.Table, record),
		fmt.Sprintf(`func (f %s) Find(ctx context.Context, key interface{}) (*%s, error) {
	row, err := database().FindByKey(%q, key)
	if err != nil || row == nil {
		return nil, err
	}
	return hydrate%s(row)
}`, facadeType, record, model.Table, record),
		fmt.Sprintf(`func (f %s) FindOrFail(ctx context.Context, key interface{}) (*%s, error) {
	row, err := database().FindByKey(%q, key)
	if err != nil {
		return nil, err
	}
	if row == nil {
		return nil, fmt.Errorf("%%s not found", %q)
	}
	return hydrate%s(row)
}`, facadeType, record, model.Table, model.Name, record),
	}
	if model.ThreeArg {
		facadeMethods = append(facadeMethods, fmt.Sprintf(`func (f %s) FirstOrCreate(ctx context.Context, attributes map[string]interface{}, values map[string]interface{}) (*%s, bool, error) {
	scope := new%s()
	for column, value := range attributes {
		scope = scope.Where(column, value)
	}
	found, err := scope.First(ctx)
	if err != nil {
		return nil, false, err
	}
	if found != nil {
		return found, false, nil
	}
	merged := map[string]interface{}{}
	for column, value := range attributes {
		merged[column] = value
	}
	for column, value := range values {
		merged[column] = value
	}
	created, err := database().Insert(%q, merged)
	if err != nil {
		return nil, false, err
	}
	rec, err := hydrate%s(created)
	if err != nil {
		return nil, false, err
	}
	return rec, true, nil
}`, facadeType, record, scope, model.Table, record))
	} else {
		facadeMethods = append(facadeMethods, fmt.Sprintf(`func (f %s) FirstOrCreate(ctx context.Context, attributes map[string]interface{}, values map[string]interface{}) (*%s, error) {
	scope := new%s()
	for column, value := range attributes {
		scope = scope.Where(column, value)
	}
	found, err := scope.First(ctx)
	if err != nil {
		return nil, err
	}
	if found != nil {
		return found, nil
	}
	merged := map[string]interface{}{}
	for column, value := range attributes {
		merged[column] = value
	}
	for column, value := range values {
		merged[column] = value
	}
	created, err := database().Insert(%q, merged)
	if err != nil {
		return nil, err
	}
	return hydrate%s(created)
}`, facadeType, record, scope, model.Table, record))
	}
	facadeMethods = append(facadeMethods, fmt.Sprintf("var %s = %s{}", model.Name, facadeType))
	statements = append(statements, facadeMethods...)
	return statements
}

func runtimeFieldTag(field runtimeField) string {
	if field.Kind == "extra" {
		return fmt.Sprintf("`json:%q`", strings.ToLower(field.Name))
	}
	jsonName := field.Column
	if field.Nullable {
		jsonName += ",omitempty"
	}
	return fmt.Sprintf("`json:%q db:%q`", jsonName, field.Column)
}

func modelPrimaryColumn(model runtimeModel) string {
	for _, field := range model.Fields {
		if field.Column == "id" {
			return "id"
		}
	}
	for _, field := range model.Fields {
		if strings.HasSuffix(field.Column, "_id") {
			return field.Column
		}
	}
	return "id"
}

func modelPrimaryField(model runtimeModel) string {
	column := modelPrimaryColumn(model)
	for _, field := range model.Fields {
		if field.Column == column {
			return field.Name
		}
	}
	return runtimeFieldName(column)
}

// --------------------------------------------------------------- execution

type interpretedRun struct {
	Status  int
	Bytes   []byte
	Problem string
}

// Execute compiles (and caches) the operation's universe, runs it against a
// fresh session, and returns the encoded response.
func (m *moduleRuntime) Execute(w http.ResponseWriter, r *http.Request, spec modulespec.EndpointSpec, module Registration) (run interpretedRun) {
	// Interpreted bodies can panic (nil dereference, bad type assertion). Left
	// unrecovered, net/http drops the connection and the client sees a bare
	// "socket hang up"; answer a JSON 500 and log the stack instead.
	defer func() {
		if recovered := recover(); recovered != nil {
			log.Printf("[error] %s: interpreted handler %q panicked: %v\n%s", module.Name, spec.Operation, recovered, debug.Stack())
			payload, _ := json.Marshal(map[string]string{"message": fmt.Sprintf("Handler %q panicked: %v", spec.Operation, recovered)})
			run = interpretedRun{Status: http.StatusInternalServerError, Bytes: payload}
		}
	}()
	anyValue, runErr, problem := m.run(w, r, spec, module)
	if problem != "" {
		return interpretedRun{Problem: problem}
	}
	if runErr != nil {
		payload, _ := json.Marshal(map[string]string{"message": runErr.Error()})
		return interpretedRun{Status: 500, Bytes: payload}
	}
	if result, ok := anyValue.(*rt.Result); ok && result != nil {
		payload, err := rt.EncodeResult(result.Payload)
		if err != nil {
			return interpretedRun{Problem: err.Error()}
		}
		status := result.Status
		if status == 0 {
			status = 200
		}
		return interpretedRun{Status: status, Bytes: payload}
	}
	if anyValue == nil {
		payload, _ := json.Marshal(map[string]string{"message": "ok"})
		return interpretedRun{Status: 200, Bytes: payload}
	}
	payload, err := rt.EncodeResult(anyValue)
	if err != nil {
		return interpretedRun{Problem: err.Error()}
	}
	return interpretedRun{Status: 200, Bytes: payload}
}

func (m *moduleRuntime) run(w http.ResponseWriter, r *http.Request, spec modulespec.EndpointSpec, module Registration) (any, error, string) {
	if strings.TrimSpace(spec.Body) == "" {
		return nil, nil, "handler body is empty"
	}
	entry, problem := m.entryFor(spec.Operation, module)
	if problem != "" {
		return nil, nil, problem
	}
	entry.mutex.Lock()
	defer entry.mutex.Unlock()
	if entry.failure != "" {
		return nil, nil, entry.failure
	}
	if !entry.compiled {
		if err := m.compileEntry(entry, spec, module); err != nil {
			entry.failure = err.Error()
			return nil, nil, entry.failure
		}
	}
	sessionID := rt.NewSessionID()
	route := chiRouteParams(r)
	base := requestBaseURL(r)
	session := &rt.Session{
		ID:       sessionID,
		W:        w,
		R:        r,
		Context:  r.Context(),
		Database: rt.NewDatabase(m.database, m.module, m.postgres),
		Params:   interpretParams(r, spec),
		Services: &m.services,
	}
	session.Bridge = func(op string) any {
		value, err, problem := m.runOperation(session, sessionID, op, module)
		if problem != "" {
			return fmt.Errorf("%s", problem)
		}
		if err != nil {
			return err
		}
		return value
	}
	session.Request = rt.NewRequest(r, route, func() (*rt.User, bool) {
		return interpretedRequestUser(r, module)
	}, func() string { return base })
	session.Response = rt.NewResponse()
	rt.PutSession(session)
	defer rt.ReleaseSession(sessionID)
	values := entry.function.Call([]reflect.Value{reflect.ValueOf(sessionID)})
	var result any
	if len(values) > 0 && values[0].IsValid() && values[0].CanInterface() {
		result = values[0].Interface()
	}
	return result, nil, ""
}

// runOperation executes another operation of the same module in an existing
// session (cross-handler calls such as community_seed).
func (m *moduleRuntime) runOperation(session *rt.Session, sessionID int64, op string, module Registration) (any, error, string) {
	key := "op:" + op
	if _, exists := m.operations[key]; !exists {
		key = "route:" + op
	}
	if _, exists := m.operations[key]; !exists {
		return nil, nil, fmt.Sprintf("operation %q is not defined in module %q", op, m.module)
	}
	spec := modulespec.EndpointSpec{Operation: op}
	for _, api := range module.APIs {
		for operation, endpoint := range api.Endpoints {
			if operation == op && strings.TrimSpace(endpoint.Body) != "" {
				spec = modulespec.EndpointSpec{Operation: operation, Body: endpoint.Body}
			}
		}
	}
	entry, problem := m.entryFor(op, module)
	if problem != "" {
		return nil, nil, problem
	}
	entry.mutex.Lock()
	defer entry.mutex.Unlock()
	if entry.failure != "" {
		return nil, nil, entry.failure
	}
	if !entry.compiled {
		if err := m.compileEntry(entry, spec, module); err != nil {
			entry.failure = err.Error()
			return nil, nil, entry.failure
		}
	}
	values := entry.function.Call([]reflect.Value{reflect.ValueOf(sessionID)})
	var result any
	if len(values) > 0 && values[0].IsValid() && values[0].CanInterface() {
		result = values[0].Interface()
	}
	return result, nil, ""
}

func (m *moduleRuntime) entryFor(operation string, module Registration) (*runtimeEntry, string) {
	key := "op:" + operation
	body, exists := m.operations[key]
	if !exists {
		key = "route:" + operation
		body, exists = m.operations[key]
	}
	if !exists {
		return nil, fmt.Sprintf("handler %q has no :go body in module %q", operation, m.module)
	}
	digest := fmt.Sprintf("%x", sha256.Sum256([]byte(body)))
	mapKey := key + "|" + digest
	m.entriesMu.Lock()
	defer m.entriesMu.Unlock()
	if entry, exists := m.entries[mapKey]; exists {
		return entry, ""
	}
	entry := &runtimeEntry{}
	m.entries[mapKey] = entry
	return entry, ""
}

func (m *moduleRuntime) compileEntry(entry *runtimeEntry, spec modulespec.EndpointSpec, module Registration) error {
	body, exists := m.operations["op:"+spec.Operation]
	if !exists {
		body = m.operations["route:"+spec.Operation]
	}
	if body == "" {
		return fmt.Errorf("handler %q has no :go body", spec.Operation)
	}
	interpreter := interp.New(interp.Options{})
	interpreter.Use(stdlib.Symbols)
	interpreter.Use(rtYaegiExports())
	for _, statement := range m.imports {
		if _, err := interpreter.Eval(statement); err != nil {
			return fmt.Errorf("import statement %q failed: %w", statement, err)
		}
	}
	if _, err := interpreter.Eval(`import "arkzen/rt"`); err != nil {
		return fmt.Errorf("bind arkzen/rt: %w", err)
	}
	// The generated prelude scaffolding itself calls fmt.Errorf, strings.*,
	// context.Context and time.* regardless of what the user handler body
	// imports, so these must always be bound before the prelude is Eval'd.
	// A body may already import one of them, in which case yaegi reports a
	// harmless "redeclared" error — treat that as already-bound.
	for _, pkg := range preludeStdlibPackages {
		if _, err := interpreter.Eval(`import "` + pkg + `"`); err != nil && !strings.Contains(err.Error(), "redeclared") {
			return fmt.Errorf("bind prelude package %q: %w", pkg, err)
		}
	}
	for statementIndex, statement := range m.prelude {
		if _, err := interpreter.Eval(statement); err != nil {
			return fmt.Errorf("generated prelude failed at statement %d: %w", statementIndex, err)
		}
	}
	rewritten := rewriteInterpretedBody(body, m.models)
	wrapper := m.wrapperSource(spec.Operation, module, rewritten)
	if _, err := interpreter.Eval(wrapper); err != nil {
		return fmt.Errorf("handler %q did not compile: %w", spec.Operation, err)
	}
	value, err := interpreter.Eval("__run")
	if err != nil {
		return fmt.Errorf("handler %q could not be bound: %w", spec.Operation, err)
	}
	if !value.CanInterface() {
		return fmt.Errorf("handler %q produced an unusable function", spec.Operation)
	}
	function, ok := value.Interface().(func(int64) any)
	if !ok {
		return fmt.Errorf("handler %q has an unexpected signature", spec.Operation)
	}
	entry.function = reflect.ValueOf(function)
	entry.compiled = true
	return nil
}

func (m *moduleRuntime) wrapperSource(operation string, module Registration, rewritten string) string {
	var builder strings.Builder
	builder.WriteString("func __run(id int64) any {\n")
	builder.WriteString("\t__sid = id\n")
	builder.WriteString("\t__s := rt.Get(id)\n")
	builder.WriteString("\tif __s == nil {\n\t\treturn fmt.Errorf(\"runtime session is missing\")\n\t}\n")
	builder.WriteString("\trequest := func() *rt.Request { return __s.Request }()\n")
	builder.WriteString("\tresponse := func() *rt.Response { return __s.Response }()\n")
	builder.WriteString("\tdatabase := func() *rt.Database { return __s.Database }()\n")
	builder.WriteString("\tparams := func() rt.Params { return __s.Params }()\n")
	builder.WriteString("\tctx := func() context.Context { return __s.Context }()\n")
	helpers := map[string]bool{}
	for key := range m.operations {
		_, name, found := strings.Cut(key, ":")
		if !found || name == operation || !isGoIdentifier(name) {
			continue
		}
		referenced := false
		for otherKey, other := range m.operations {
			if otherKey == "op:"+name || otherKey == "route:"+name {
				continue
			}
			if regexp.MustCompile(`\b` + regexp.QuoteMeta(name) + `\(`).MatchString(other) {
				referenced = true
				break
			}
		}
		if referenced {
			helpers[name] = true
		}
	}
	helperNames := make([]string, 0, len(helpers))
	for name := range helpers {
		helperNames = append(helperNames, name)
	}
	sort.Strings(helperNames)
	for _, name := range helperNames {
		builder.WriteString(fmt.Sprintf("\t%s := func(c context.Context) error {\n", name))
		builder.WriteString("\t\tv := __s.Bridge(\"" + name + "\")\n")
		builder.WriteString("\t\tif v == nil {\n\t\t\treturn nil\n\t\t}\n")
		builder.WriteString("\t\tif e, ok := v.(error); ok && e != nil {\n\t\t\treturn e\n\t\t}\n")
		builder.WriteString("\t\tif res, ok := v.(*rt.Result); ok && res != nil && res.Status >= 400 {\n\t\t\treturn fmt.Errorf(\"handler " + name + " failed with status %d\", res.Status)\n\t\t}\n")
		builder.WriteString("\t\treturn nil\n\t}\n")
	}
	builder.WriteString("\treturn func() any {\n")
	builder.WriteString(rewritten)
	builder.WriteString("\n\t\treturn nil\n\t}()\n}\n")
	return builder.String()
}

func isGoIdentifier(name string) bool {
	if name == "" {
		return false
	}
	for index, character := range name {
		if character == '_' || (character >= 'a' && character <= 'z') || (character >= 'A' && character <= 'Z') || (index > 0 && character >= '0' && character <= '9') {
			continue
		}
		return false
	}
	return true
}

// rtYaegiExports registers the arkzen/rt host package symbols with yaegi.
func rtYaegiExports() interp.Exports {
	return interp.Exports{"arkzen/rt/rt": map[string]reflect.Value{
		"Session":        reflect.ValueOf((*rt.Session)(nil)),
		"Services":       reflect.ValueOf((*rt.Services)(nil)),
		"Request":        reflect.ValueOf((*rt.Request)(nil)),
		"Response":       reflect.ValueOf((*rt.Response)(nil)),
		"Result":         reflect.ValueOf((*rt.Result)(nil)),
		"User":           reflect.ValueOf((*rt.User)(nil)),
		"Params":         reflect.ValueOf(rt.Params(nil)),
		"Database":       reflect.ValueOf((*rt.Database)(nil)),
		"Where":          reflect.ValueOf(rt.Where{}),
		"Filter":         reflect.ValueOf(rt.Filter{}),
		"Order":          reflect.ValueOf(rt.Order{}),
		"Get":            reflect.ValueOf(rt.Get),
		"PutSession":     reflect.ValueOf(rt.PutSession),
		"ReleaseSession": reflect.ValueOf(rt.ReleaseSession),
		"NewSessionID":   reflect.ValueOf(rt.NewSessionID),
		"NewDatabase":    reflect.ValueOf(rt.NewDatabase),
		"NewRequest":     reflect.ValueOf(rt.NewRequest),
		"NewResponse":    reflect.ValueOf(rt.NewResponse),
		"NewUser":        reflect.ValueOf(rt.NewUser),
		"SimpleFilter":   reflect.ValueOf(rt.SimpleFilter),
		"NewWhere":       reflect.ValueOf(rt.NewWhere),
		"MakeWhere":      reflect.ValueOf(rt.MakeWhere),
		"MakeFilter":     reflect.ValueOf(rt.MakeFilter),
		"ParseWhereKV":   reflect.ValueOf(rt.ParseWhereKV),
		"NewOrder":       reflect.ValueOf(rt.NewOrder),
		"FlattenValues":  reflect.ValueOf(rt.FlattenValues),
		"Hydrate":        reflect.ValueOf(rt.Hydrate),
		"StructToMap":    reflect.ValueOf(rt.StructToMap),
		"EncodeResult":   reflect.ValueOf(rt.EncodeResult),
		"ToGeneric":      reflect.ValueOf(rt.ToGeneric),
		"ParseTimeValue": reflect.ValueOf(rt.ParseTimeValue),
		"AsString":       reflect.ValueOf(rt.AsString),
		"AsInt64":        reflect.ValueOf(rt.AsInt64),
		"AsFloat64":      reflect.ValueOf(rt.AsFloat64),
		"AsBool":         reflect.ValueOf(rt.AsBool),
		"AsMap":          reflect.ValueOf(rt.AsMap),
		"IsEmail":        reflect.ValueOf(rt.IsEmail),
		"IsOneOf":        reflect.ValueOf(rt.IsOneOf),
	}}
}

func interpretParams(r *http.Request, spec modulespec.EndpointSpec) rt.Params {
	if routeContext := chi.RouteContext(r.Context()); routeContext != nil && len(routeContext.URLParams.Values) > 0 {
		return rt.Params(append([]string(nil), routeContext.URLParams.Values...))
	}

	requestPath := strings.Split(strings.Trim(path.Clean(r.URL.Path), "/"), "/")
	routePath := strings.Split(strings.Trim(path.Clean(spec.Path), "/"), "/")
	if len(requestPath) != len(routePath) {
		return rt.Params{}
	}
	params := make(rt.Params, 0)
	for index, segment := range routePath {
		if strings.HasPrefix(segment, "{") && strings.HasSuffix(segment, "}") {
			params = append(params, requestPath[index])
		}
	}
	return params
}

func chiRouteParams(r *http.Request) map[string]string {
	result := map[string]string{}
	if routeContext := chi.RouteContext(r.Context()); routeContext != nil {
		for index, key := range routeContext.URLParams.Keys {
			if index < len(routeContext.URLParams.Values) {
				result[key] = routeContext.URLParams.Values[index]
			}
		}
	}
	if len(result) == 0 && r.URL != nil {
		// Endpoint patterns use {name} segments; fall back to splitting the
		// spec path when chi params are absent (direct execution).
	}
	return result
}

func interpretedRequestUser(r *http.Request, module Registration) (*rt.User, bool) {
	resolver := moduleUserResolver
	if resolver == nil {
		return nil, false
	}
	return resolver(r, module)
}

// moduleUserResolver is installed by the HTTP layer so interpreted handlers
// can resolve authenticated users through the engine's token store.
var moduleUserResolver func(r *http.Request, module Registration) (*rt.User, bool)

// --------------------------------------------------------- service adapters

func (s *Service) runtimeServices(registration Registration, database *sql.DB) rt.Services {
	name := registration.Name
	broadcast := s.broadcast
	if broadcast == nil {
		broadcast = func(module, section string, target any, payload map[string]any) error { return nil }
	}
	logger := s.logMessage
	if logger == nil {
		logger = func(level, module, message string, meta map[string]any) {}
	}
	mailClass := func(key string) string { return classNameWithSuffix(key, "Mail") }
	mailSend := func(key, to string, data map[string]any) (map[string]any, error) {
		return map[string]any{"status": "sent", "to": to, "mail": key}, nil
	}
	if definitions, err := mailDefinitions(registration); err == nil && len(definitions) > 0 {
		mailClass = func(key string) string { return classNameWithSuffix(key, "Mail") }
		mailSend = func(key, to string, data map[string]any) (map[string]any, error) {
			definition, exists := definitions[key]
			if !exists {
				return nil, fmt.Errorf("mail %q is not defined by module %q", key, name)
			}
			htmlBody, err := renderMail(definition, data)
			if err != nil {
				return nil, err
			}
			if err := sendRenderedMail(to, definition.subject, htmlBody); err != nil {
				return nil, err
			}
			return map[string]any{"status": "sent", "to": to, "subject": definition.subject, "mail_class": classNameWithSuffix(key, "Mail")}, nil
		}
	}
	notificationClass := func(key string) string { return classNameWithSuffix(key, "Notification") }
	notifySend := func(user *rt.User, key, message string) error {
		var definition *realtimeSection
		for _, section := range parseRealtimeSections(registration.Notifications) {
			if section.name == key {
				selected := section
				definition = &selected
				break
			}
		}
		if strings.TrimSpace(message) == "" {
			message = key
		}
		subject := key
		if definition != nil {
			if value := definition.values["message"]; value != "" {
				message = value
			}
			if value := definition.values["subject"]; value != "" {
				subject = value
			}
		}
		data := map[string]any{
			"type":     "NotificationTest\\" + goClassName(key) + "Notification",
			"message":  message,
			"tatemono": name,
		}
		encoded, err := json.Marshal(data)
		if err != nil {
			return err
		}
		channels := []string{"database"}
		if definition != nil {
			if declared := notificationChannels(definition.values["channels"]); len(declared) > 0 {
				channels = declared
			}
		}
		for _, channel := range channels {
			switch channel {
			case "database":
				if database == nil {
					return fmt.Errorf("module database is unavailable")
				}
				id, err := newNotificationID()
				if err != nil {
					return err
				}
				now := time.Now().UTC().Format(time.RFC3339Nano)
				_, err = database.Exec(`INSERT INTO "notifications" ("id","type","notifiable_type","notifiable_id","data","read_at","created_at","updated_at") VALUES (?, ?, 'user', ?, ?, NULL, ?, ?)`,
					id, data["type"], user.ID, string(encoded), now, now)
				if err != nil {
					return fmt.Errorf("store database notification: %w", err)
				}
			case "mail":
				if err := sendRenderedMail(user.Email, subject, "<p>"+htmlEscape(message)+"</p>"); err != nil {
					return err
				}
			case "broadcast":
				if err := broadcast(name, "notifications", float64(user.ID), map[string]any{"message": message, "data": data}); err != nil {
					return err
				}
			}
		}
		return nil
	}
	resolvedNames := map[string]string{}
	for _, section := range parseRealtimeSections(registration.Realtimes) {
		channel := section.values["channel"]
		if channel == "" {
			continue
		}
		resolved := realtimePlaceholder.ReplaceAllStringFunc(channel, func(string) string { return "" })
		if resolved == "" || realtimePlaceholder.MatchString(resolved) {
			continue
		}
		prefix := ""
		if channelType := section.values["type"]; channelType == "private" || channelType == "presence" {
			prefix = channelType + "-"
		}
		resolvedNames[section.name] = prefix + resolved
	}
	return rt.Services{
		Broadcast: func(section string, target any, payload map[string]any) error {
			return broadcast(name, section, target, payload)
		},
		Log:         func(level, message string, meta map[string]any) { logger(level, name, message, meta) },
		MailSend:    mailSend,
		MailClass:   mailClass,
		NotifySend:  func(user *rt.User, key, message string) error { return notifySend(user, key, message) },
		NotifyClass: notificationClass,
		ResolvedName: func(key string) string {
			if value, exists := resolvedNames[key]; exists {
				return value
			}
			return key
		},
	}
}

func classNameWithSuffix(key, suffix string) string {
	name := goClassName(key)
	if strings.HasSuffix(name, suffix) {
		return name
	}
	return name + suffix
}
