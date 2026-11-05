// Package rt is the host-side binding surface for the engine's yaegi
// runtime. Interpreted :go handler bodies see exactly one synthesized
// package ("arkzen/rt") exporting these types and functions; everything
// else in the interpreted universe is generated per module from the DSL
// registration (model facades, scopes, records, shims).
package rt

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"fmt"
	"math"
	"net/http"
	"reflect"
	"sort"
	"strconv"
	"strings"
	"sync"
	"sync/atomic"
	"time"
	"unsafe"
)

// ----------------------------------------------------------------- session

type Session struct {
	ID       int64
	W        http.ResponseWriter
	R        *http.Request
	Request  *Request
	Response *Response
	Database *Database
	Params   Params
	Context  context.Context
	Services *Services
	// Bridge executes another operation of the same module within this
	// session; interpreted cross-handler calls (community_seed etc.) go
	// through it.
	Bridge func(op string) any
}

// Services bundles the engine capabilities an interpreted handler may use
// beyond plain SQL: realtime broadcast, logging, mail and notification
// delivery. Backend injects the concrete implementations per module.
type Services struct {
	Broadcast    func(section string, target any, payload map[string]any) error
	Log          func(level, message string, meta map[string]any)
	MailSend     func(key, to string, data map[string]any) (map[string]any, error)
	MailClass    func(key string) string
	NotifySend   func(user *User, key, message string) error
	NotifyClass  func(key string) string
	ResolvedName func(key string) string
}

var (
	sessions   sync.Map
	sessionSeq atomic.Int64
)

func PutSession(s *Session) { sessions.Store(s.ID, s) }

func ReleaseSession(id int64) { sessions.Delete(id) }

func NewSessionID() int64 { return sessionSeq.Add(1) }

func Get(id int64) *Session {
	v, ok := sessions.Load(id)
	if !ok {
		return nil
	}
	return v.(*Session)
}

// ----------------------------------------------------------------- request

type Request struct {
	r         *http.Request
	route     map[string]string
	body      map[string]any
	bodyRead  bool
	lookup    func() (*User, bool)
	baseURLFn func() string
}

func NewRequest(r *http.Request, route map[string]string, lookup func() (*User, bool), base func() string) *Request {
	if route == nil {
		route = map[string]string{}
	}
	return &Request{r: r, route: route, body: map[string]any{}, lookup: lookup, baseURLFn: base}
}

func (q *Request) decode() {
	if q.bodyRead || q.r.Body == nil {
		return
	}
	q.bodyRead = true
	decoder := json.NewDecoder(q.r.Body)
	var raw json.RawMessage
	if err := decoder.Decode(&raw); err == nil {
		_ = json.Unmarshal(raw, &q.body)
	}
}

func (q *Request) JSON() (map[string]any, error) {
	q.decode()
	if q.body == nil {
		return nil, errors.New("request body must be a JSON object")
	}
	return q.body, nil
}

func (q *Request) Input(name string) string {
	q.decode()
	return stringify(q.body[name])
}

func (q *Request) InputOr(name, fallback string) string {
	value := strings.TrimSpace(q.Input(name))
	if value == "" {
		return fallback
	}
	return value
}

func (q *Request) String(name string) string { return q.Input(name) }

func (q *Request) Int(name string) int {
	value := q.NullableInt(name)
	if value == nil {
		return 0
	}
	return *value
}

func (q *Request) IntOr(name string, fallback int) int {
	value := q.NullableInt(name)
	if value == nil {
		return fallback
	}
	return *value
}

func (q *Request) NullableInt(name string) *int {
	q.decode()
	return toNullableInt(q.body[name])
}

func toNullableInt(value any) *int {
	switch typed := value.(type) {
	case float64:
		rounded := int(typed)
		return &rounded
	case int64:
		parsed := int(typed)
		return &parsed
	case int:
		return &typed
	case string:
		if parsed, err := strconv.ParseInt(strings.TrimSpace(typed), 10, 64); err == nil {
			result := int(parsed)
			return &result
		}
	case bool:
		if typed {
			parsed := 1
			return &parsed
		}
	}
	return nil
}

func (q *Request) Float(name string) (float64, bool) {
	q.decode()
	switch typed := q.body[name].(type) {
	case float64:
		return typed, true
	case string:
		parsed, err := strconv.ParseFloat(strings.TrimSpace(typed), 64)
		return parsed, err == nil
	default:
		return 0, false
	}
}

func (q *Request) Bool(name string) bool {
	q.decode()
	return AsBool(q.body[name])
}

func (q *Request) Only(names ...string) map[string]any {
	q.decode()
	result := map[string]any{}
	for _, name := range names {
		if value, exists := q.body[name]; exists {
			result[name] = value
		}
	}
	return result
}

func (q *Request) QueryInt(name string, fallback ...int) int {
	defaultValue := 0
	if len(fallback) > 0 {
		defaultValue = fallback[0]
	}
	if q.r.URL == nil {
		return defaultValue
	}
	parsed, err := strconv.ParseInt(strings.TrimSpace(q.r.URL.Query().Get(name)), 10, 64)
	if err != nil {
		return defaultValue
	}
	return int(parsed)
}

func (q *Request) QueryString(name, fallback string) string {
	if q.r.URL == nil {
		return fallback
	}
	value := q.r.URL.Query().Get(name)
	if value == "" {
		return fallback
	}
	return value
}

func (q *Request) Header(name string) string { return q.r.Header.Get(name) }

func (q *Request) Route(name string) string { return q.route[name] }

func (q *Request) User() *User {
	if q.lookup == nil {
		return nil
	}
	user, ok := q.lookup()
	if !ok {
		return nil
	}
	return user
}

func (q *Request) Method() string { return q.r.Method }

func (q *Request) Path() string { return q.r.URL.Path }

func (q *Request) URL() string {
	if q.r.URL == nil {
		return "/"
	}
	return q.baseURL() + q.r.URL.RequestURI()
}

func (q *Request) BaseURL() string { return q.baseURL() }

func (q *Request) baseURL() string {
	if q.baseURLFn != nil {
		return q.baseURLFn()
	}
	return "http://" + q.r.Host
}

// -------------------------------------------------------------------- user

type User struct {
	ID    int    `json:"id"`
	Name  string `json:"name"`
	Email string `json:"email"`
	Role  string `json:"role"`

	store *Database
}

func NewUser(id int, name, email, role string, store *Database) *User {
	return &User{ID: id, Name: name, Email: email, Role: role, store: store}
}

func (u *User) Update(ctx context.Context, values map[string]any) error {
	if u == nil || u.store == nil {
		return errors.New("user store is unavailable")
	}
	_, err := u.store.UpdateRow("users", u.ID, values)
	return err
}

func (u *User) Refresh(ctx context.Context) (*User, error) {
	if u == nil || u.store == nil {
		return nil, errors.New("user store is unavailable")
	}
	raw, err := u.store.FindByKey("users", u.ID)
	if err != nil {
		return nil, err
	}
	if raw == nil {
		return nil, errors.New("user row is missing")
	}
	refreshed := &User{ID: u.ID, store: u.store}
	refreshed.Name = stringify(raw["name"])
	refreshed.Email = stringify(raw["email"])
	refreshed.Role = stringify(raw["role"])
	return refreshed, nil
}

// --------------------------------------------------------------- parameters

type Params []string

func (p Params) String(index int) string {
	if index < 0 || index >= len(p) {
		return ""
	}
	return p[index]
}

func (p Params) Int(index int) int {
	value := p.NullableInt(index)
	if value == nil {
		return 0
	}
	return *value
}

func (p Params) NullableInt(index int) *int {
	raw := p.String(index)
	parsed, err := strconv.ParseInt(strings.TrimSpace(raw), 10, 64)
	if err != nil {
		return nil
	}
	result := int(parsed)
	return &result
}

// ----------------------------------------------------------------- response

type Result struct {
	Status  int
	Payload any
}

type Response struct{}

func NewResponse() *Response { return &Response{} }

// JSON accepts response.JSON(payload) or response.JSON(status, payload).
func (resp *Response) JSON(args ...any) *Result {
	status := 200
	payload := args
	if len(args) > 1 {
		if candidate, ok := numericInt(args[0]); ok && candidate >= 100 && candidate <= 599 {
			status = candidate
			payload = args[1:]
		}
	}
	var body any
	if len(payload) == 1 {
		body = payload[0]
	} else if len(payload) > 1 {
		body = payload
	}
	return &Result{Status: status, Payload: body}
}

func (resp *Response) Error(status int, message string) *Result {
	return &Result{Status: status, Payload: map[string]string{"message": message}}
}

// ------------------------------------------------------------------ filters

type Where struct {
	Column string
	Op     string // =, !=, <, <=, >, >=, like, notlike, in, notin, isnull, isnotnull
	Value  any
	Values []any // for in/notin
}

// Filter is one query predicate set: all Wheres are ANDed, every OrGroup is
// appended as an OR'd parenthesised group (Laravel's whereAny).
type Filter struct {
	Wheres   []Where
	OrGroups [][]Where
}

func SimpleFilter(wheres ...Where) Filter {
	return Filter{Wheres: wheres}
}

type Order struct {
	Column     string
	Descending bool
}

func NewWhere(args ...any) Where {
	switch len(args) {
	case 2:
		return Where{Column: stringify(args[0]), Op: "=", Value: args[1]}
	case 3:
		return Where{Column: stringify(args[0]), Op: stringify(args[1]), Value: args[2]}
	default:
		return Where{}
	}
}

// MakeWhere builds a Where value. yaegi cannot construct host struct literals
// (rt.Where{...}) in interpreted code, so every interpreted scaffolding helper
// routes through this constructor instead.
func MakeWhere(column, op string, value any, values []any) Where {
	return Where{Column: column, Op: op, Value: value, Values: values}
}

// MakeFilter builds a Filter value; see MakeWhere for why this exists.
func MakeFilter(wheres []Where, orGroups [][]Where) Filter {
	return Filter{Wheres: wheres, OrGroups: orGroups}
}

// ParseWhereKV supports operator-suffixed keys like "due_date<=" and "term like".
func ParseWhereKV(column string, value any) Where {
	trimmed := strings.TrimSpace(column)
	lower := strings.ToLower(trimmed)
	for _, operator := range []string{"not like", "like"} {
		if strings.HasSuffix(lower, " "+operator) {
			return Where{Column: strings.TrimSpace(trimmed[:len(trimmed)-len(operator)-1]), Op: operator, Value: value}
		}
	}
	for _, operator := range []string{"<=", ">=", "!=", "<", ">", "="} {
		if strings.HasSuffix(trimmed, operator) {
			return Where{Column: strings.TrimSpace(strings.TrimSuffix(trimmed, operator)), Op: operator, Value: value}
		}
	}
	return Where{Column: trimmed, Op: "=", Value: value}
}

func NewOrder(column, direction string) Order {
	return Order{Column: column, Descending: strings.EqualFold(strings.TrimSpace(direction), "desc")}
}

func FlattenValues(values any) []any {
	if values == nil {
		return nil
	}
	switch typed := values.(type) {
	case []any:
		return typed
	case []string:
		out := make([]any, 0, len(typed))
		for _, item := range typed {
			out = append(out, item)
		}
		return out
	case []int:
		out := make([]any, 0, len(typed))
		for _, item := range typed {
			out = append(out, item)
		}
		return out
	case []int64:
		out := make([]any, 0, len(typed))
		for _, item := range typed {
			out = append(out, item)
		}
		return out
	}
	reflected := reflect.ValueOf(values)
	if reflected.Kind() == reflect.Slice {
		out := make([]any, 0, reflected.Len())
		for index := 0; index < reflected.Len(); index++ {
			out = append(out, reflected.Index(index).Interface())
		}
		return out
	}
	return []any{values}
}

// ----------------------------------------------------------------- database

type Database struct {
	db       *sql.DB
	postgres bool
	tables   map[string][]string
	module   string
}

func NewDatabase(db *sql.DB, module string, postgres bool) *Database {
	return &Database{db: db, module: module, postgres: postgres, tables: map[string][]string{}}
}

func (d *Database) DB() *sql.DB { return d.db }

func (d *Database) Columns(table string) []string {
	if columns, exists := d.tables[table]; exists {
		return columns
	}
	rows, err := d.db.Query("SELECT * FROM " + quote(table) + " LIMIT 0")
	if err != nil {
		return nil
	}
	defer rows.Close()
	columns, err := rows.Columns()
	if err != nil {
		return nil
	}
	d.tables[table] = columns
	return columns
}

func (d *Database) PrimaryKey(table string) string {
	if _, exists := d.columnSet(table)["id"]; exists {
		return "id"
	}
	for _, column := range d.Columns(table) {
		if strings.HasSuffix(column, "_id") {
			return column
		}
	}
	return "id"
}

func (d *Database) columnSet(table string) map[string]bool {
	set := map[string]bool{}
	for _, column := range d.Columns(table) {
		set[column] = true
	}
	return set
}

// Insert stores one row and returns the stored record.
func (d *Database) Insert(table string, values map[string]any) (map[string]any, error) {
	columns := d.columnSet(table)
	if len(columns) == 0 {
		return nil, fmt.Errorf("table %q is not available", table)
	}
	primary := d.PrimaryKey(table)
	input := map[string]any{}
	for name, value := range values {
		if !columns[name] {
			return nil, fmt.Errorf("unknown field %q for table %q", name, table)
		}
		input[name] = value
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	if columns["created_at"] {
		if _, supplied := input["created_at"]; !supplied {
			input["created_at"] = now
		}
	}
	if columns["updated_at"] {
		if _, supplied := input["updated_at"]; !supplied {
			input["updated_at"] = now
		}
	}
	names := make([]string, 0, len(input))
	for name := range input {
		names = append(names, name)
	}
	sort.Strings(names)
	var builder strings.Builder
	builder.WriteString("INSERT INTO " + quote(table) + " (")
	placeholders := make([]string, 0, len(names))
	args := make([]any, 0, len(names))
	for index, name := range names {
		if index > 0 {
			builder.WriteString(",")
		}
		builder.WriteString(quote(name))
		placeholders = append(placeholders, "?")
		args = append(args, coerce(input[name]))
	}
	builder.WriteString(") VALUES (")
	builder.WriteString(strings.Join(placeholders, ","))
	builder.WriteString(")")
	var lookup any
	if supplied, has := input[primary]; has {
		lookup = supplied
		if _, err := d.db.Exec(builder.String(), args...); err != nil {
			return nil, err
		}
	} else if d.postgres {
		builder.WriteString(" RETURNING " + quote(primary))
		if err := d.db.QueryRow(builder.String(), args...).Scan(&lookup); err != nil {
			return nil, err
		}
	} else {
		result, err := d.db.Exec(builder.String(), args...)
		if err != nil {
			return nil, err
		}
		lookup, err = result.LastInsertId()
		if err != nil {
			return nil, err
		}
	}
	rows, err := d.SelectRow(table, SimpleFilter(Where{Column: primary, Op: "=", Value: lookup}), nil, 1, 0)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, errors.New("created row could not be loaded")
	}
	return rows[0], nil
}

func (d *Database) SelectRowByKey(table string, key int64) (map[string]any, error) {
	return d.FindByKey(table, key)
}

// FindByKey loads one row by primary key; the key may be any scalar the
// column stores (integer ids, string uuids, ...).
func (d *Database) FindByKey(table string, key any) (map[string]any, error) {
	rows, err := d.SelectRow(table, SimpleFilter(Where{Column: d.PrimaryKey(table), Op: "=", Value: key}), nil, 1, 0)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return rows[0], nil
}

func (d *Database) SelectRow(table string, filter Filter, orders []Order, limit, offset int) ([]map[string]any, error) {
	query, args := d.buildSelect(table, filter, orders, limit, offset)
	rows, err := d.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanMaps(rows)
}

func (d *Database) buildSelect(table string, filter Filter, orders []Order, limit, offset int) (string, []any) {
	var builder strings.Builder
	builder.WriteString("SELECT * FROM " + quote(table))
	clause, args := filterClause(filter)
	builder.WriteString(clause)
	if len(orders) > 0 {
		builder.WriteString(" ORDER BY ")
		for index, order := range orders {
			if index > 0 {
				builder.WriteString(", ")
			}
			builder.WriteString(quote(order.Column))
			if order.Descending {
				builder.WriteString(" DESC")
			}
		}
	}
	if limit > 0 {
		builder.WriteString(" LIMIT ?")
		args = append(args, limit)
	}
	if offset > 0 {
		builder.WriteString(" OFFSET ?")
		args = append(args, offset)
	}
	return builder.String(), args
}

func (d *Database) Count(table string, filter Filter) (int64, error) {
	query := "SELECT COUNT(*) FROM " + quote(table)
	clause, args := filterClause(filter)
	query += clause
	var count int64
	if err := d.db.QueryRow(query, args...).Scan(&count); err != nil {
		return 0, err
	}
	return count, nil
}

func (d *Database) Exists(table string, filter Filter) (bool, error) {
	rows, err := d.SelectRow(table, filter, nil, 1, 0)
	if err != nil {
		return false, err
	}
	return len(rows) > 0, nil
}

func (d *Database) Aggregate(table string, filter Filter, function, column string) (float64, error) {
	upper := strings.ToUpper(function)
	if upper != "MAX" && upper != "MIN" && upper != "SUM" && upper != "AVG" && upper != "COUNT" {
		return 0, fmt.Errorf("unsupported aggregate function %q", function)
	}
	query := "SELECT COALESCE(" + upper + "(" + quote(column) + "), 0) FROM " + quote(table)
	clause, args := filterClause(filter)
	query += clause
	var value float64
	if err := d.db.QueryRow(query, args...).Scan(&value); err != nil {
		return 0, err
	}
	return value, nil
}

func (d *Database) SelectFiltered(table string, filter Filter, orders []Order, limit int) ([]map[string]any, error) {
	return d.SelectRow(table, filter, orders, limit, 0)
}

func (d *Database) Pluck(table string, filter Filter, orders []Order, limit int, column string) ([]any, error) {
	rows, err := d.SelectRow(table, filter, orders, limit, 0)
	if err != nil {
		return nil, err
	}
	values := make([]any, 0, len(rows))
	for _, row := range rows {
		values = append(values, row[column])
	}
	return values, nil
}

func (d *Database) UpdateRows(table string, filter Filter, values map[string]any) (int64, error) {
	if len(values) == 0 {
		return 0, nil
	}
	columns := d.columnSet(table)
	primary := d.PrimaryKey(table)
	names := make([]string, 0, len(values))
	for name := range values {
		if name == primary {
			continue
		}
		if !columns[name] {
			return 0, fmt.Errorf("unknown field %q for table %q", name, table)
		}
		names = append(names, name)
	}
	if len(names) == 0 {
		return 0, nil
	}
	sort.Strings(names)
	var builder strings.Builder
	builder.WriteString("UPDATE " + quote(table) + " SET ")
	args := []any{}
	for index, name := range names {
		if index > 0 {
			builder.WriteString(", ")
		}
		builder.WriteString(quote(name) + " = ?")
		args = append(args, coerce(values[name]))
	}
	if columns["updated_at"] {
		if _, exists := values["updated_at"]; !exists {
			builder.WriteString(", " + quote("updated_at") + " = ?")
			args = append(args, time.Now().UTC().Format(time.RFC3339Nano))
		}
	}
	clause, whereArgs := filterClause(filter)
	builder.WriteString(clause)
	args = append(args, whereArgs...)
	result, err := d.db.Exec(builder.String(), args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// IncrementRows applies an atomic +/- delta to one column.
func (d *Database) IncrementRows(table string, filter Filter, column string, delta int) (int64, error) {
	if !d.columnSet(table)[column] {
		return 0, fmt.Errorf("unknown field %q for table %q", column, table)
	}
	clause, args := filterClause(filter)
	query := "UPDATE " + quote(table) + " SET " + quote(column) + " = COALESCE(" + quote(column) + ", 0) + ?" + clause
	result, err := d.db.Exec(query, append([]any{coerce(delta)}, args...)...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

func (d *Database) UpdateRow(table string, key any, values map[string]any) (map[string]any, error) {
	if _, err := d.UpdateRows(table, SimpleFilter(Where{Column: d.PrimaryKey(table), Op: "=", Value: key}), values); err != nil {
		return nil, err
	}
	return d.FindByKey(table, key)
}

// IncrementByKey atomically changes one column of the row with the given key.
func (d *Database) IncrementByKey(table string, key any, column string, delta int) error {
	if _, err := d.IncrementRows(table, SimpleFilter(Where{Column: d.PrimaryKey(table), Op: "=", Value: key}), column, delta); err != nil {
		return err
	}
	return nil
}

// IncrementFilter atomically changes one column across every row matching a
// filter; it exists for interpreted scope chains.
func (d *Database) IncrementFilter(table string, filter Filter, column string, delta int) error {
	_, err := d.IncrementRows(table, filter, column, delta)
	return err
}

func (d *Database) DeleteRows(table string, filter Filter) (int64, error) {
	query := "DELETE FROM " + quote(table)
	clause, args := filterClause(filter)
	query += clause
	result, err := d.db.Exec(query, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// LoadWith reloads a row by primary key and eagerly attaches relations
// (relation name -> foreign key "<relation>_id" -> table "<relation>s").
func (d *Database) LoadWith(table string, key any, relations []string) (map[string]any, error) {
	row, err := d.FindByKey(table, key)
	if err != nil || row == nil {
		return row, err
	}
	extras := map[string]any{}
	for _, relation := range relations {
		related, relErr := d.Related(table, relation, row)
		if relErr != nil {
			return nil, relErr
		}
		if related != nil {
			extras[relation] = related
		}
	}
	if len(extras) > 0 {
		row["__extras__"] = extras
	}
	return row, nil
}

func (d *Database) Related(childTable, relation string, row map[string]any) (map[string]any, error) {
	foreignKey := relation + "_id"
	value, exists := row[foreignKey]
	if !exists || value == nil {
		return nil, nil
	}
	target := pluralize(relation)
	if len(d.Columns(target)) == 0 {
		return nil, nil
	}
	rows, err := d.SelectRow(target, SimpleFilter(Where{Column: d.PrimaryKey(target), Op: "=", Value: value}), nil, 1, 0)
	if err != nil {
		return nil, err
	}
	if len(rows) == 0 {
		return nil, nil
	}
	return rows[0], nil
}

// Query executes raw SQL and returns all matching rows.
func (d *Database) Query(sqlText string, args ...any) ([]map[string]any, error) {
	rows, err := d.db.Query(sqlText, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	return scanMaps(rows)
}

// QueryRow executes raw SQL returning at most one row.
func (d *Database) QueryRow(sqlText string, args ...any) *sql.Row {
	return d.db.QueryRow(sqlText, args...)
}

// Exec runs a raw statement and reports affected rows.
func (d *Database) Exec(sqlText string, args ...any) (int64, error) {
	result, err := d.db.Exec(sqlText, args...)
	if err != nil {
		return 0, err
	}
	return result.RowsAffected()
}

// Paginate builds a Laravel-shaped paginator payload.
func (d *Database) Paginate(table string, filter Filter, orders []Order, perPage, page int64, baseURL string) (map[string]any, error) {
	if perPage < 1 {
		perPage = 15
	}
	if page < 1 {
		page = 1
	}
	total, err := d.Count(table, filter)
	if err != nil {
		return nil, err
	}
	rows, err := d.SelectRow(table, filter, orders, int(perPage), int((page-1)*perPage))
	if err != nil {
		return nil, err
	}
	lastPage := int64((total + perPage - 1) / perPage)
	if lastPage < 1 {
		lastPage = 1
	}
	pageURL := func(number int64) string {
		separator := "?"
		if strings.Contains(baseURL, "?") {
			separator = "&"
		}
		return fmt.Sprintf("%s%spage=%d&per_page=%d", baseURL, separator, number, perPage)
	}
	response := map[string]any{
		"current_page": page, "data": rows,
		"first_page_url": pageURL(1), "last_page": lastPage,
		"last_page_url": pageURL(lastPage), "path": baseURL,
		"per_page": perPage, "total": total,
		"next_page_url": nil, "prev_page_url": nil, "from": nil, "to": nil,
	}
	if page > 1 {
		response["prev_page_url"] = pageURL(page - 1)
	}
	if page < lastPage {
		response["next_page_url"] = pageURL(page + 1)
	}
	if len(rows) > 0 {
		response["from"] = (page-1)*perPage + 1
		response["to"] = (page-1)*perPage + int64(len(rows))
	}
	return response, nil
}

func filterClause(filter Filter) (string, []any) {
	if len(filter.Wheres) == 0 && len(filter.OrGroups) == 0 {
		return "", nil
	}
	var builder strings.Builder
	args := []any{}
	builder.WriteString(" WHERE")
	firstClause := true
	writeFragment := func(fragment string, fragmentArgs []any) {
		if firstClause {
			firstClause = false
		} else {
			builder.WriteString(" AND")
		}
		builder.WriteString(" " + fragment)
		args = append(args, fragmentArgs...)
	}
	for _, where := range filter.Wheres {
		fragment, fragmentArgs := whereFragment(where)
		writeFragment(fragment, fragmentArgs)
	}
	for _, group := range filter.OrGroups {
		if len(group) == 0 {
			continue
		}
		var inner strings.Builder
		innerArgs := []any{}
		for index, where := range group {
			if index > 0 {
				inner.WriteString(" OR")
			}
			fragment, fragmentArgs := whereFragment(where)
			inner.WriteString(" " + fragment)
			innerArgs = append(innerArgs, fragmentArgs...)
		}
		writeFragment("("+strings.TrimPrefix(inner.String(), " ")+")", innerArgs)
	}
	return builder.String(), args
}

func whereFragment(where Where) (string, []any) {
	switch strings.ToLower(where.Op) {
	case "raw":
		return "DATE(" + quote(where.Column) + ") = ?", []any{coerce(where.Value)}
	case "isnull":
		return quote(where.Column) + " IS NULL", nil
	case "isnotnull":
		return quote(where.Column) + " IS NOT NULL", nil
	case "in", "notin":
		values := where.Values
		if len(values) == 0 {
			values = FlattenValues(where.Value)
		}
		if len(values) == 0 {
			if strings.ToLower(where.Op) == "in" {
				return "1 = 0", nil
			}
			return "1 = 1", nil
		}
		var builder strings.Builder
		builder.WriteString(quote(where.Column))
		if strings.ToLower(where.Op) == "in" {
			builder.WriteString(" IN (")
		} else {
			builder.WriteString(" NOT IN (")
		}
		args := make([]any, 0, len(values))
		for index, value := range values {
			if index > 0 {
				builder.WriteString(", ")
			}
			builder.WriteString("?")
			args = append(args, coerce(value))
		}
		builder.WriteString(")")
		return builder.String(), args
	case "notlike", "not like":
		return quote(where.Column) + " NOT LIKE ?", []any{coerce(where.Value)}
	case "like":
		return quote(where.Column) + " LIKE ?", []any{coerce(where.Value)}
	default:
		return quote(where.Column) + " " + normalizeOp(where.Op) + " ?", []any{coerce(where.Value)}
	}
}

// KeyOrValue settings facades (DtrSetting-style key/value tables).
func (d *Database) SettingValue(table, key, fallback string) string {
	rows, err := d.SelectRow(table, SimpleFilter(Where{Column: "key", Op: "=", Value: key}), nil, 1, 0)
	if err != nil || len(rows) == 0 {
		return fallback
	}
	value := stringify(rows[0]["value"])
	if value == "" {
		return fallback
	}
	return value
}

func (d *Database) SettingFloatValue(table, key string, fallback float64) float64 {
	rows, err := d.SelectRow(table, SimpleFilter(Where{Column: "key", Op: "=", Value: key}), nil, 1, 0)
	if err != nil || len(rows) == 0 {
		return fallback
	}
	value, isNumeric := rows[0]["value"].(float64)
	if !isNumeric {
		parsed, parseErr := strconv.ParseFloat(strings.TrimSpace(stringify(rows[0]["value"])), 64)
		if parseErr != nil {
			return fallback
		}
		return parsed
	}
	return value
}

func (d *Database) SettingUpdateOrCreate(table, key, value string) error {
	rows, err := d.SelectRow(table, SimpleFilter(Where{Column: "key", Op: "=", Value: key}), nil, 1, 0)
	if err != nil {
		return err
	}
	if len(rows) == 0 {
		_, insertErr := d.Insert(table, map[string]any{"key": key, "value": value})
		return insertErr
	}
	_, err = d.UpdateRows(table, SimpleFilter(Where{Column: "key", Op: "=", Value: key}), map[string]any{"value": value})
	return err
}

// ------------------------------------------------------------------ helpers

func quote(identifier string) string { return `"` + strings.ReplaceAll(identifier, `"`, `""`) + `"` }

func normalizeOp(op string) string {
	switch op {
	case "=", "==":
		return "="
	case "!=":
		return "<>"
	case "":
		return "="
	default:
		return op
	}
}

func coerce(value any) any {
	if value != nil {
		// Drivers cannot bind pointers; dereference typed pointers first.
		reflected := reflect.ValueOf(value)
		if reflected.Kind() == reflect.Pointer {
			if reflected.IsNil() {
				return nil
			}
			value = reflected.Elem().Interface()
		}
	}
	switch typed := value.(type) {
	case nil:
		return nil
	case time.Time:
		return typed.UTC().Format(time.RFC3339Nano)
	case int:
		return int64(typed)
	case float64:
		if typed == math.Trunc(typed) && math.Abs(typed) < 1<<53 {
			return int64(typed)
		}
		return typed
	case []any, map[string]any:
		encoded, err := json.Marshal(typed)
		if err != nil {
			return fmt.Sprint(typed)
		}
		return string(encoded)
	default:
		return value
	}
}

func stringify(value any) string {
	switch typed := value.(type) {
	case nil:
		return ""
	case string:
		return typed
	case []byte:
		return string(typed)
	case float64:
		if typed == math.Trunc(typed) && math.Abs(typed) < 1<<53 {
			return strconv.FormatInt(int64(typed), 10)
		}
		return strconv.FormatFloat(typed, 'f', -1, 64)
	case bool:
		return strconv.FormatBool(typed)
	default:
		return fmt.Sprint(typed)
	}
}

func numericInt(value any) (int, bool) {
	switch typed := value.(type) {
	case int:
		return typed, true
	case int64:
		return int(typed), true
	case float64:
		return int(typed), typed == math.Trunc(typed)
	default:
		return 0, false
	}
}

func pluralize(name string) string {
	if strings.HasSuffix(name, "y") {
		return strings.TrimSuffix(name, "y") + "ies"
	}
	if strings.HasSuffix(name, "s") {
		return name
	}
	return name + "s"
}

func AsString(value any) string {
	if value == nil {
		return ""
	}
	if raw, ok := value.([]byte); ok {
		return string(raw)
	}
	if typed, ok := value.(time.Time); ok {
		return typed.UTC().Format(time.RFC3339Nano)
	}
	return stringify(value)
}

func AsInt64(value any) int64 {
	switch typed := value.(type) {
	case nil:
		return 0
	case int64:
		return typed
	case int:
		return int64(typed)
	case float64:
		return int64(typed)
	case bool:
		if typed {
			return 1
		}
		return 0
	case []byte:
		parsed, _ := strconv.ParseInt(string(typed), 10, 64)
		return parsed
	case time.Time:
		return typed.Unix()
	default:
		parsed, _ := strconv.ParseInt(stringify(value), 10, 64)
		return parsed
	}
}

func AsFloat64(value any) float64 {
	switch typed := value.(type) {
	case nil:
		return 0
	case float64:
		return typed
	case int64:
		return float64(typed)
	case int:
		return float64(typed)
	case []byte:
		parsed, _ := strconv.ParseFloat(string(typed), 64)
		return parsed
	default:
		parsed, _ := strconv.ParseFloat(stringify(value), 64)
		return parsed
	}
}

func AsBool(value any) bool {
	switch typed := value.(type) {
	case bool:
		return typed
	case int64:
		return typed != 0
	case int:
		return typed != 0
	case float64:
		return typed != 0
	case string:
		return typed == "true" || typed == "1"
	default:
		return false
	}
}

func AsTime(value any) string { return AsString(value) }

func AsMap(value any) map[string]any {
	if typed, ok := value.(map[string]any); ok {
		return typed
	}
	return map[string]any{}
}

func IsEmail(value string) bool {
	at := strings.LastIndexByte(value, '@')
	return at > 0 && at < len(value)-3 && strings.Contains(value[at+1:], ".")
}

// IsOneOf reports whether value matches any of the allowed candidates.
func IsOneOf(value string, candidates ...string) bool {
	for _, candidate := range candidates {
		if value == candidate {
			return true
		}
	}
	return false
}

// NullableInt converts a raw column value into a nullable integer.
func NullableInt(value any) *int {
	return toNullableInt(value)
}

// NullableFloat converts a raw column value into a nullable float.
func NullableFloat(value any) *float64 {
	if value == nil {
		return nil
	}
	parsed := AsFloat64(value)
	return &parsed
}

// NullableString converts a raw column value into a nullable string.
func NullableString(value any) *string {
	if value == nil {
		return nil
	}
	text := AsString(value)
	return &text
}

// NullableBool converts a raw column value into a nullable boolean.
func NullableBool(value any) *bool {
	if value == nil {
		return nil
	}
	parsed := AsBool(value)
	return &parsed
}

// NullableTime converts a raw column value into a nullable timestamp.
func NullableTime(value any) *time.Time {
	if value == nil {
		return nil
	}
	parsed, err := ParseTimeValue(value)
	if err != nil {
		return nil
	}
	return &parsed
}

func scanMaps(rows *sql.Rows) ([]map[string]any, error) {
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

// ------------------------------------------------------------- result write

// EncodeResult serialises a handler result. Interpreted model records carry
// an exported Extras map (eager-loaded relations) which is merged inline
// like Laravel does.
func EncodeResult(payload any) ([]byte, error) {
	value := reflect.ValueOf(payload)
	return encodeValue(value)
}

// ToGeneric encodes a value through EncodeResult and decodes it back into a
// generic map, so interpreted MarshalJSON methods can merge extras.
func ToGeneric(value any) (map[string]any, error) {
	encoded, err := EncodeResult(value)
	if err != nil {
		return nil, err
	}
	var object map[string]any
	if err := json.Unmarshal(encoded, &object); err != nil {
		return nil, err
	}
	return object, nil
}

func encodeValue(value reflect.Value) ([]byte, error) {
	normalized, err := normalizeValue(value)
	if err != nil {
		return nil, err
	}
	return json.Marshal(normalized)
}

// normalizeValue converts any interpreted value tree into plain host types
// before the final marshal. yaegi-materialised struct types are invisible to
// the host encoding/json field scanner (they serialise as empty objects), so
// structs are walked by reflection here using their json tags, with the
// generated Extras map merged inline and wrapper Rec pointers unwrapped.
func normalizeValue(value reflect.Value) (any, error) {
	for value.IsValid() && (value.Kind() == reflect.Interface || value.Kind() == reflect.Pointer) {
		if value.IsNil() {
			return nil, nil
		}
		value = value.Elem()
	}
	if !value.IsValid() {
		return nil, nil
	}
	switch value.Kind() {
	case reflect.Struct:
		if value.Type().PkgPath() == "github.com/traefik/yaegi/interp" && value.Type().Name() == "valueInterface" {
			base := value
			if !base.CanAddr() {
				holder := reflect.New(base.Type()).Elem()
				holder.Set(base)
				base = holder
			}
			if inner := base.FieldByName("value"); inner.IsValid() {
				unwrapped := reflect.NewAt(inner.Type(), unsafe.Pointer(inner.UnsafeAddr())).Elem()
				// yaegi boxes interpreted interface values as
				// interp.valueInterface{node, reflect.Value}; the payload
				// itself lives inside that reflect.Value.
				if unwrapped.IsValid() && unwrapped.CanInterface() && unwrapped.Type() == reflect.TypeOf(reflect.Value{}) {
					if nested, ok := unwrapped.Interface().(reflect.Value); ok {
						return normalizeValue(nested)
					}
				}
				return normalizeValue(unwrapped)
			}
			return nil, nil
		}
		if value.Type() == reflect.TypeOf(time.Time{}) {
			return value.Interface(), nil
		}
		if _, ok := value.Interface().(json.Marshaler); ok {
			return value.Interface(), nil
		}
		return normalizeStruct(value)
	case reflect.Slice, reflect.Array:
		if value.Type() == reflect.TypeOf([]byte{}) {
			return string(value.Bytes()), nil
		}
		if value.Kind() == reflect.Array && value.Type().Elem().Kind() == reflect.Uint8 {
			return string(value.Bytes()), nil
		}
		items := make([]any, 0, value.Len())
		for index := 0; index < value.Len(); index++ {
			item, err := normalizeValue(value.Index(index))
			if err != nil {
				return nil, err
			}
			items = append(items, item)
		}
		return items, nil
	case reflect.Map:
		object := map[string]any{}
		iterator := value.MapKeys()
		for _, key := range iterator {
			encoded, err := normalizeValue(key)
			if err != nil {
				return nil, err
			}
			name := fmt.Sprint(encoded)
			item, err := normalizeValue(value.MapIndex(key))
			if err != nil {
				return nil, err
			}
			object[name] = item
		}
		return object, nil
	case reflect.Chan, reflect.Func:
		return nil, nil
	default:
		return value.Interface(), nil
	}
}

func normalizeStruct(value reflect.Value) (any, error) {
	object := map[string]any{}
	var embedded reflect.Value
	var extras reflect.Value
	structure := value.Type()
	for index := 0; index < structure.NumField(); index++ {
		field := structure.Field(index)
		if !field.IsExported() {
			continue
		}
		fieldValue := value.Field(index)
		if field.Name == "Rec" && (fieldValue.Kind() == reflect.Pointer || fieldValue.Kind() == reflect.Interface) {
			embedded = fieldValue
			continue
		}
		if field.Name == "Extras" && fieldValue.Kind() == reflect.Map {
			extras = fieldValue
			continue
		}
		name := strings.Split(field.Tag.Get("json"), ",")[0]
		if name == "-" {
			continue
		}
		if name == "" {
			name = field.Name
		}
		omitEmpty := strings.Contains(field.Tag.Get("json"), ",omitempty")
		if omitEmpty && fieldValue.IsZero() {
			continue
		}
		item, err := normalizeValue(fieldValue)
		if err != nil {
			return nil, err
		}
		object[name] = item
	}
	if embedded.IsValid() && !embedded.IsNil() {		inner, err := normalizeValue(embedded)
		if err != nil {
			return nil, err
		}
		if fields, ok := inner.(map[string]any); ok {
			for key, item := range fields {
				if _, exists := object[key]; !exists {
					object[key] = item
				}
			}
		}
	}
	if extras.IsValid() && extras.Len() > 0 {
		inner, err := normalizeValue(extras)
		if err != nil {
			return nil, err
		}
		if fields, ok := inner.(map[string]any); ok {
			for key, item := range fields {
				object[key] = item
			}
		}
	}
	return object, nil
}

// ------------------------------------------------------------ row hydration

// Hydrate copies a database row into a struct pointer, matching fields by
// their `db` column tag. Interpreted model records declare columns with db
// tags; relation and extra fields omit them.
func Hydrate(row map[string]any, target any) error {
	value := reflect.ValueOf(target)
	if !value.IsValid() || value.Kind() != reflect.Pointer || value.IsNil() {
		return errors.New("rt.Hydrate requires a non-nil struct pointer")
	}
	element := value.Elem()
	if element.Kind() != reflect.Struct {
		return errors.New("rt.Hydrate requires a struct pointer")
	}
	structure := element.Type()
	for index := 0; index < structure.NumField(); index++ {
		field := structure.Field(index)
		column := field.Tag.Get("db")
		if column == "" {
			// Relation fields carry an `orm` tag because their field name
			// can collide with the foreign-key column's field.
			column = field.Tag.Get("orm")
		}
		if column == "" || column == "-" {
			continue
		}
		raw, exists := row[column]
		if !exists {
			continue
		}
		if err := assignField(element.Field(index), raw); err != nil {
			return fmt.Errorf("hydrate %s.%s: %w", structure.Name(), field.Name, err)
		}
	}
	return nil
}

func assignField(field reflect.Value, raw any) error {
	if raw == nil {
		switch field.Kind() {
		case reflect.Pointer, reflect.Interface, reflect.Slice, reflect.Map:
			field.Set(reflect.Zero(field.Type()))
		}
		return nil
	}
	target := field
	if target.Kind() == reflect.Pointer {
		if target.IsNil() {
			target.Set(reflect.New(target.Type().Elem()))
		}
		target = target.Elem()
	}
	switch target.Kind() {
	case reflect.Interface:
		target.Set(reflect.ValueOf(raw))
		return nil
	case reflect.String:
		target.SetString(AsString(raw))
		return nil
	case reflect.Bool:
		target.SetBool(AsBool(raw))
		return nil
	case reflect.Int, reflect.Int8, reflect.Int16, reflect.Int32, reflect.Int64:
		target.SetInt(AsInt64(raw))
		return nil
	case reflect.Uint, reflect.Uint8, reflect.Uint16, reflect.Uint32, reflect.Uint64:
		target.SetUint(uint64(AsInt64(raw)))
		return nil
	case reflect.Float32, reflect.Float64:
		target.SetFloat(AsFloat64(raw))
		return nil
	case reflect.Slice:
		if target.Type().Elem().Kind() == reflect.Uint8 {
			target.SetBytes([]byte(AsString(raw)))
			return nil
		}
	case reflect.Struct:
		if target.Type() == reflect.TypeOf(time.Time{}) {
			parsed, err := ParseTimeValue(raw)
			if err != nil {
				return err
			}
			target.Set(reflect.ValueOf(parsed))
			return nil
		}
	}
	return fmt.Errorf("cannot store %T in %s", raw, field.Type())
}

var timeLayouts = []string{
	time.RFC3339Nano, time.RFC3339,
	"2006-01-02 15:04:05.999999999-07:00", "2006-01-02 15:04:05Z07:00",
	"2006-01-02 15:04:05", "2006-01-02T15:04:05", "2006-01-02",
	"15:04:05",
}

// ParseTimeValue converts stored column values back into time.Time.
func ParseTimeValue(raw any) (time.Time, error) {
	switch typed := raw.(type) {
	case time.Time:
		return typed, nil
	case float64:
		return time.Unix(int64(typed), 0), nil
	case int64:
		return time.Unix(typed, 0), nil
	}
	text := strings.TrimSpace(AsString(raw))
	if text == "" {
		return time.Time{}, nil
	}
	for _, layout := range timeLayouts {
		if parsed, err := time.Parse(layout, text); err == nil {
			return parsed, nil
		}
	}
	if parsed, err := strconv.ParseFloat(text, 64); err == nil {
		return time.Unix(int64(parsed), 0), nil
	}
	return time.Time{}, fmt.Errorf("unsupported time value %q", text)
}

// StructToMap projects a record's `db`-tagged fields onto column names,
// dereferencing nullable pointers and rendering times like JSON responses.
func StructToMap(value any) map[string]any {
	result := map[string]any{}
	reflected := reflect.ValueOf(value)
	for reflected.IsValid() && reflected.Kind() == reflect.Pointer {
		if reflected.IsNil() {
			return result
		}
		reflected = reflected.Elem()
	}
	if !reflected.IsValid() || reflected.Kind() != reflect.Struct {
		return result
	}
	structure := reflected.Type()
	for index := 0; index < structure.NumField(); index++ {
		field := structure.Field(index)
		column := field.Tag.Get("db")
		if column == "" || column == "-" {
			continue
		}
		fieldValue := reflected.Field(index)
		for fieldValue.Kind() == reflect.Pointer {
			if fieldValue.IsNil() {
				result[column] = nil
				fieldValue = reflect.Value{}
				break
			}
			fieldValue = fieldValue.Elem()
		}
		if !fieldValue.IsValid() {
			continue
		}
		if fieldValue.Kind() == reflect.Struct && fieldValue.Type() == reflect.TypeOf(time.Time{}) {
			result[column] = fieldValue.Interface().(time.Time).Format(time.RFC3339Nano)
			continue
		}
		result[column] = fieldValue.Interface()
	}
	return result
}
