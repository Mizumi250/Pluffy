package backend

import (
	"encoding/json"
	"fmt"
	"regexp"
	"strings"
)

var (
	moduleNamePattern = regexp.MustCompile(`^[a-z0-9][a-z0-9-]*$`)
	sqlNamePattern    = regexp.MustCompile(`^[a-zA-Z_][a-zA-Z0-9_]*$`)
)

type BuildPayload struct {
	Name           string               `json:"name"`
	BackendVariant string               `json:"backendVariant"`
	Auth           bool                 `json:"auth"`
	AuthSeed       *AuthSeed            `json:"authSeed"`
	Databases      []DatabaseDefinition `json:"databases"`
	APIs           []APIBlock           `json:"apis"`
	CustomRoutes   []CustomRoute        `json:"customRoutes"`
	Realtimes      []string             `json:"realtimes"`
	Events         []string             `json:"events"`
	Jobs           []string             `json:"jobs"`
	Notifications  []string             `json:"notifications"`
	Consoles       []string             `json:"consoles"`
	Mails          []string             `json:"mails"`
	PolicySnippets map[string]string    `json:"policySnippets"`
}

type AuthSeed struct {
	Users []AuthSeedUser `json:"users"`
}

type AuthSeedUser struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

type CustomRoute struct {
	Controller string             `json:"controller"`
	Middleware []string           `json:"middleware"`
	Routes     []CustomRouteEntry `json:"routes"`
}

type CustomRouteEntry struct {
	Method  string `json:"method"`
	Route   string `json:"route"`
	Handler string `json:"handler"`
	Body    string `json:"body"`
}

type DatabaseDefinition struct {
	Table       string                      `json:"table"`
	Columns     map[string]ColumnDefinition `json:"columns"`
	Timestamps  *bool                       `json:"timestamps"`
	SoftDeletes bool                        `json:"softDeletes"`
	Seeder      *SeederDefinition           `json:"seeder"`
}

type SeederDefinition struct {
	Count int                          `json:"count"`
	Data  []map[string]json.RawMessage `json:"data"`
}

type ColumnDefinition struct {
	Type          string          `json:"type"`
	Nullable      *bool           `json:"nullable"`
	Unique        bool            `json:"unique"`
	Primary       bool            `json:"primary"`
	AutoIncrement *bool           `json:"autoIncrement"`
	Default       json.RawMessage `json:"default"`
	Foreign       string          `json:"foreign"`
	OnDelete      string          `json:"onDelete"`
}

type APIBlock struct {
	Name        string                    `json:"name"`
	Model       string                    `json:"model"`
	Controller  string                    `json:"controller"`
	Table       string                    `json:"table"`
	Prefix      string                    `json:"prefix"`
	Middleware  []string                  `json:"middleware"`
	Policy      bool                      `json:"policy"`
	SoftDeletes bool                      `json:"softDeletes,omitempty"`
	Endpoints   map[string]EndpointConfig `json:"endpoints"`
}

type EndpointConfig struct {
	Method     string            `json:"method"`
	Route      string            `json:"route"`
	Body       string            `json:"body"`
	Type       string            `json:"type"`
	Validation map[string]string `json:"validation"`
	Response   struct {
		Type  string `json:"type"`
		Value string `json:"value"`
	} `json:"response"`
}

func ValidateBuild(payload BuildPayload) []string {
	var problems []string
	if payload.Name == "" {
		problems = append(problems, `Missing "name"`)
	} else if !moduleNamePattern.MatchString(payload.Name) {
		problems = append(problems, fmt.Sprintf("Invalid tatemono name %q (lowercase letters, digits, dashes)", payload.Name))
	}
	if payload.BackendVariant != "" && payload.BackendVariant != "go" {
		problems = append(problems, fmt.Sprintf("Payload was parsed for the :%s variant but this backend (go) reads :go. Switch the active backend and let the watcher rebuild.", payload.BackendVariant))
	}
	if payload.AuthSeed != nil && len(payload.AuthSeed.Users) > 0 && !payload.Auth {
		problems = append(problems, "authSeed requires auth to be enabled")
	}
	if payload.Auth && payload.AuthSeed != nil {
		for index, user := range payload.AuthSeed.Users {
			if strings.TrimSpace(user.Email) != "" && !validAuthEmail(user.Email) {
				problems = append(problems, fmt.Sprintf("Invalid auth seed email at row %d", index+1))
			}
		}
	}

	tables := make(map[string]struct{}, len(payload.Databases))
	for _, database := range payload.Databases {
		if strings.TrimSpace(database.Table) == "" {
			problems = append(problems, "database block without a table")
			continue
		}
		if !sqlNamePattern.MatchString(database.Table) {
			problems = append(problems, fmt.Sprintf("Invalid database table name %q", database.Table))
		}
		if _, exists := tables[database.Table]; exists {
			problems = append(problems, fmt.Sprintf("Duplicate database table %q", database.Table))
		}
		tables[database.Table] = struct{}{}
		for column, definition := range database.Columns {
			if !sqlNamePattern.MatchString(column) {
				problems = append(problems, fmt.Sprintf("Invalid column name %q in table %q", column, database.Table))
			}
			if _, err := sqliteType(definition.Type); err != nil {
				problems = append(problems, fmt.Sprintf("Invalid type for %s.%s: %v", database.Table, column, err))
			}
			if len(definition.Default) > 0 && !validDefault(definition.Default) {
				problems = append(problems, fmt.Sprintf("Invalid default for %s.%s: expected a string, number, boolean, or null", database.Table, column))
			}
		}
		var seedRows []map[string]json.RawMessage
		if database.Seeder != nil {
			seedRows = database.Seeder.Data
		}
		for rowIndex, row := range seedRows {
			for column, value := range row {
				if !sqlNamePattern.MatchString(column) {
					problems = append(problems, fmt.Sprintf("Invalid seed column %q in table %q", column, database.Table))
					continue
				}
				_, declared := database.Columns[column]
				timestamps := database.Timestamps == nil || *database.Timestamps
				if !declared && column == "id" {
					hasPrimary := false
					for _, definition := range database.Columns {
						if definition.Primary {
							hasPrimary = true
							break
						}
					}
					declared = !hasPrimary
				}
				if !declared && !(timestamps && (column == "created_at" || column == "updated_at")) {
					problems = append(problems, fmt.Sprintf("Seed column %q is not declared in table %q", column, database.Table))
					continue
				}
				if !validDefault(value) {
					problems = append(problems, fmt.Sprintf("Invalid seed value for %s.%s at row %d: expected a scalar", database.Table, column, rowIndex+1))
				}
			}
		}
	}
	routeSignatures := make(map[string]string)
	for index, api := range payload.APIs {
		if strings.TrimSpace(api.Model) == "" || strings.TrimSpace(api.Controller) == "" {
			problems = append(problems, "api block needs model and controller")
		}
		table := resolveAPITable(api, payload.Databases, len(payload.Notifications) > 0)
		if table == "" {
			problems = append(problems, fmt.Sprintf("api block %q model %q does not match a declared database table", api.Name, api.Model))
		}
		prefix := api.Prefix
		if prefix == "" {
			prefix = "/api/" + payload.Name
		}
		if !validRoutePath(prefix) {
			problems = append(problems, fmt.Sprintf("api block %q has an invalid prefix %q", api.Name, prefix))
		}
		endpoints := api.Endpoints
		if endpoints == nil {
			endpoints = defaultEndpoints()
		}
		for operation, endpoint := range endpoints {
			if endpoint.Method != "" && !validHTTPMethod(endpoint.Method) {
				problems = append(problems, fmt.Sprintf("api block %q endpoint %q has unsupported method %q", api.Name, operation, endpoint.Method))
			}
			if endpoint.Route != "" && !validRoutePath(endpoint.Route) {
				problems = append(problems, fmt.Sprintf("api block %q endpoint %q has an invalid route %q", api.Name, operation, endpoint.Route))
			}
			if endpointMethod(operation, endpoint) == "" {
				problems = append(problems, fmt.Sprintf("api block %q endpoint %q needs an explicit :method because it is not a CRUD operation", api.Name, operation))
			}
			if method := endpointMethod(operation, endpoint); method != "" &&
				(endpoint.Route == "" || validRoutePath(endpoint.Route)) {
				signature := routeSignature(method, joinRoute(prefix, endpointRoute(operation, endpoint)))
				if previous, exists := routeSignatures[signature]; exists {
					problems = append(problems, fmt.Sprintf("API route %q is declared by both %q and %q", signature, previous, api.Name))
				} else {
					routeSignatures[signature] = api.Name
				}
			}
		}
		if api.Policy {
			for _, method := range []string{"update", "delete"} {
				if _, exists := endpoints[method]; !exists {
					continue
				}
				if !validGoPolicySnippet(payload.PolicySnippets[method]) {
					problems = append(problems, fmt.Sprintf("api block %q enables policy but the Go engine does not support its %q policy", api.Name, method))
				}
			}
		}
		for previous := 0; previous < index; previous++ {
			if payload.APIs[previous].Name == api.Name && api.Name != "" {
				problems = append(problems, fmt.Sprintf("Duplicate api block name %q", api.Name))
				break
			}
		}
	}
	for _, customRoute := range payload.CustomRoutes {
		for _, route := range customRoute.Routes {
			if strings.TrimSpace(route.Body) == "" {
				problems = append(problems, fmt.Sprintf("custom route handler %q requires a :go handler body", route.Handler))
			}
			if !validHTTPMethod(route.Method) {
				problems = append(problems, fmt.Sprintf("custom route handler %q has unsupported method %q", route.Handler, route.Method))
			}
			if !validRoutePath(route.Route) {
				problems = append(problems, fmt.Sprintf("custom route handler %q has an invalid route %q", route.Handler, route.Route))
			}
		}
	}
	return problems
}

// isCapabilityEndpoint reports the engine-served DSL endpoint types that a
// route of any operation can declare (job dispatch, mail send, scheduler
// command, event fire, broadcast message, database notification).
func isCapabilityEndpoint(endpointType string) bool {
	switch endpointType {
	case "job_dispatch", "mail_send", "command_run", "event_fire", "broadcast", "notification_trigger":
		return true
	default:
		return false
	}
}

func routeSignature(method, path string) string {
	segments := strings.Split(path, "/")
	for index, segment := range segments {
		if len(segment) > 2 && segment[0] == '{' && segment[len(segment)-1] == '}' {
			segments[index] = "{}"
		}
	}
	return method + " " + strings.Join(segments, "/")
}

func resolveAPITable(api APIBlock, databases []DatabaseDefinition, hasNotifications bool) string {
	for _, database := range databases {
		if api.Table != "" && database.Table == api.Table {
			return database.Table
		}
	}
	if api.Table != "" {
		if api.Table == "notifications" && hasNotifications {
			return "notifications"
		}
		return ""
	}
	for _, database := range databases {
		if api.Name != "" && strings.EqualFold(api.Name, database.Table) {
			return database.Table
		}
	}
	model := normalizedName(api.Model)
	for _, database := range databases {
		table := normalizedName(database.Table)
		if model != "" && (table == model || singularTableName(table) == model) {
			return database.Table
		}
	}
	if hasNotifications && model == "notification" {
		return "notifications"
	}
	if len(databases) == 1 {
		return databases[0].Table
	}
	return ""
}

func singularTableName(table string) string {
	if strings.HasSuffix(table, "ies") && len(table) > 3 {
		return strings.TrimSuffix(table, "ies") + "y"
	}
	if strings.HasSuffix(table, "s") && !strings.HasSuffix(table, "ss") {
		return strings.TrimSuffix(table, "s")
	}
	return table
}

func normalizedName(value string) string {
	var result strings.Builder
	for _, r := range strings.ToLower(value) {
		if r >= 'a' && r <= 'z' || r >= '0' && r <= '9' {
			result.WriteRune(r)
		}
	}
	return result.String()
}

func isCRUDOperation(operation string) bool {
	switch operation {
	case "index", "show", "store", "update", "destroy":
		return true
	default:
		return false
	}
}

func validHTTPMethod(method string) bool {
	switch strings.ToUpper(method) {
	case "GET", "POST", "PUT", "PATCH", "DELETE":
		return true
	default:
		return false
	}
}

func validRoutePath(path string) bool {
	if path == "" || path[0] != '/' || strings.ContainsAny(path, "?#\\") {
		return false
	}
	for _, segment := range strings.Split(path, "/") {
		if segment == "." || segment == ".." {
			return false
		}
		if strings.ContainsAny(segment, "{}") && (len(segment) < 3 || segment[0] != '{' || segment[len(segment)-1] != '}' || !sqlNamePattern.MatchString(segment[1:len(segment)-1])) {
			return false
		}
	}
	return true
}

func validDefault(raw json.RawMessage) bool {
	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return false
	}
	switch value.(type) {
	case nil, string, bool, float64:
		return true
	default:
		return false
	}
}
