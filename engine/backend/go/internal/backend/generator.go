package backend

import (
	"errors"
	"fmt"
	"go/format"
	"go/parser"
	"go/token"
	"os"
	"path/filepath"
	"sort"
	"strconv"
	"strings"
	"unicode"
)

type generatedModule struct {
	Files  map[string][]byte
	Routes []GeneratedRoute
}

type generatedModel struct {
	Name       string
	Definition DatabaseDefinition
}

func generatedFileNames(files map[string][]byte) []string {
	names := make([]string, 0, len(files))
	for name := range files {
		names = append(names, name)
	}
	sort.Strings(names)
	return names
}

// generateGoModule compiles a Registration into a real, importable Go
// package (generated/<slug>) whose Install function registers compiled chi
// routes onto the live router. The package imports only
// internal/modulespec — never this package — so the generated tree is built
// into the server binary on every engine build.
func generateGoModule(registration Registration) (generatedModule, error) {
	packageName := goPackageName(registration.Name)
	models := generateModels(registration)
	routes := generateRoutes(registration)
	files := map[string]string{
		"models.go": generateModelsSource(packageName, registration.Name, models),
		"module.go": generateInstallSource(packageName, registration),
	}

	generatedFiles := make(map[string][]byte, len(files))
	fileSet := token.NewFileSet()
	for name, source := range files {
		formatted, err := format.Source([]byte(source))
		if err != nil {
			return generatedModule{}, fmt.Errorf("format generated %s: %w", name, err)
		}
		if _, err := parser.ParseFile(fileSet, name, formatted, parser.AllErrors); err != nil {
			return generatedModule{}, fmt.Errorf("parse generated %s: %w", name, err)
		}
		generatedFiles[name] = formatted
	}

	return generatedModule{Files: generatedFiles, Routes: routes}, nil
}

func generateRoutes(registration Registration) []GeneratedRoute {
	routes := make([]GeneratedRoute, 0)
	for apiIndex, api := range registration.APIs {
		for _, operation := range sortedEndpointOperations(api) {
			endpoint := api.Endpoints[operation]
			routes = append(routes, GeneratedRoute{
				Kind:       "api",
				APIIndex:   apiIndex,
				Operation:  operation,
				Method:     endpointMethod(operation, endpoint),
				Pattern:    joinRoute(api.Prefix, endpointRoute(operation, endpoint)),
				Controller: api.Controller,
			})
		}
	}
	for groupIndex, group := range registration.CustomRoutes {
		for routeIndex, route := range group.Routes {
			routes = append(routes, GeneratedRoute{
				Kind:             "custom",
				CustomGroupIndex: groupIndex,
				CustomRouteIndex: routeIndex,
				Method:           strings.ToUpper(route.Method),
				Pattern:          normalizeRoutePath(route.Route),
				Controller:       group.Controller,
				Handler:          route.Handler,
			})
		}
	}
	sort.SliceStable(routes, func(i, j int) bool {
		return routes[i].Pattern != routes[j].Pattern &&
			routePatternSpecificity(routes[i].Pattern).moreSpecificThan(routePatternSpecificity(routes[j].Pattern))
	})
	return routes
}

func generateModels(registration Registration) []generatedModel {
	modelByTable := make(map[string]string, len(registration.APIs))
	for _, api := range registration.APIs {
		if api.Table != "" && api.Model != "" {
			if _, exists := modelByTable[api.Table]; !exists {
				modelByTable[api.Table] = api.Model
			}
		}
	}

	usedNames := make(map[string]int)
	models := make([]generatedModel, 0, len(registration.Databases))
	for _, database := range registration.Databases {
		name := modelByTable[database.Table]
		if name == "" {
			name = singularTableName(database.Table)
		}
		name = uniqueGoIdentifier(exportedGoIdentifier(name), usedNames)
		models = append(models, generatedModel{Name: name, Definition: database})
	}
	return models
}

// generateInstallSource emits the module package's compiled route table:
// one chi registration per DSL endpoint, delegating to engine services.
func generateInstallSource(packageName string, registration Registration) string {
	var body strings.Builder

	if registration.Auth {
		body.WriteString("\n\t// Engine-owned auth routes are served dynamically by the fallback handler.\n")
		body.WriteString("\tr.Method(http.MethodGet, \"/api/\"+ModuleName+\"/auth/*\", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { svc.Fallback(w, req) }))\n")
		body.WriteString("\tr.Method(http.MethodPost, \"/api/\"+ModuleName+\"/auth/*\", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { svc.Fallback(w, req) }))\n")
		body.WriteString("\tr.Method(http.MethodDelete, \"/api/\"+ModuleName+\"/auth/*\", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { svc.Fallback(w, req) }))\n")
	}

	usedVars := map[string]int{}
	for _, api := range registration.APIs {
		writeAPISpec(&body, registration.Name, api, registration, usedVars)
	}
	writeCustomRoutes(&body, registration)
	if hasBroadcastEndpoints(registration) {
		fmt.Fprintf(&body, "\n\tbroadcastModule := modulespec.APIModule{Name: ModuleName, Table: %s}\n",
			strconv.Quote(broadcastTable(registration)))
		body.WriteString("\tr.Method(http.MethodGet, \"/api/\"+ModuleName+\"/sse-poll/{channelType}\", http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { svc.BroadcastPoll(w, req, broadcastModule) }))\n")
	}

	var source strings.Builder
	fmt.Fprintf(&source, "package %s\n\nimport (\n", packageName)
	if strings.Contains(body.String(), "http.") {
		source.WriteString("\t\"net/http\"\n\n")
	}
	source.WriteString("\t\"github.com/go-chi/chi/v5\"\n")
	source.WriteString("\t\"github.com/pluff/pluff/engine/backend/go/internal/modulespec\"\n")
	source.WriteString(")\n\n// Install registers this tatemono's compiled routes. Generated by the Go\n// backend engine from the DSL build payload — do not edit by hand.\nfunc Install(r chi.Router, svc modulespec.Services) {\n")
	source.WriteString(body.String())
	source.WriteString("}\n")
	return source.String()
}

func writeAPISpec(source *strings.Builder, moduleName string, api APIBlock, registration Registration, usedVars map[string]int) {
	modBase := "mod" + exportedGoIdentifier(api.Controller)
	usedVars[modBase]++
	varName := modBase
	if usedVars[modBase] > 1 {
		varName = fmt.Sprintf("%s%d", modBase, usedVars[modBase])
	}
	fmt.Fprintf(source, "\n\t%s := modulespec.APIModule{Name: %s, Table: %s, Middleware: []string{%s}, SoftDeletes: %v%s}\n",
		varName,
		strconv.Quote(moduleName),
		strconv.Quote(api.Table),
		quotedCSV(api.Middleware),
		api.SoftDeletes,
		policiesLiteral(api, registration))

	for _, operation := range sortedEndpointOperations(api) {
		endpoint := api.Endpoints[operation]
		specBase := "spec" + exportedGoIdentifier(operation)
		usedVars[specBase]++
		specVar := specBase
		if usedVars[specBase] > 1 {
			specVar = fmt.Sprintf("%s%d", specBase, usedVars[specBase])
		}
		fmt.Fprintf(source, "\t%s := modulespec.EndpointSpec%s\n", specVar, endpointSpecLiteral(operation, api, endpoint))
		handler := "svc.Custom"
		if isCRUDOperation(operation) && strings.TrimSpace(endpoint.Body) == "" && !isCapabilityEndpoint(endpoint.Type) {
			handler = crudHandlerName(operation)
		}
		pattern := strconv.Quote(joinRoute(api.Prefix, endpointRoute(operation, endpoint)))
		fmt.Fprintf(source, "\tr.Method(%s, %s, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { %s(w, req, %s, %s) }))\n",
			strconv.Quote(endpointMethod(operation, endpoint)), pattern, handler, varName, specVar)
	}
}

func writeCustomRoutes(source *strings.Builder, registration Registration) {
	if len(registration.CustomRoutes) == 0 {
		return
	}
	defaultTable := ""
	if len(registration.APIs) > 0 {
		defaultTable = registration.APIs[0].Table
	}
	fmt.Fprintf(source, "\n\tcustomModule := modulespec.APIModule{Name: ModuleName, Table: %s, Middleware: []string{%s}}\n",
		strconv.Quote(defaultTable), quotedCSV(customRouteMiddleware(registration)))
	customSpecCount := 0
	for _, group := range registration.CustomRoutes {
		for _, route := range group.Routes {
			specVar := fmt.Sprintf("customSpec%d", customSpecCount)
			customSpecCount++
			fmt.Fprintf(source, "\t%s := modulespec.EndpointSpec{Operation: %s, Method: %s, Path: %s, Body: %s}\n",
				specVar, strconv.Quote(route.Handler), strconv.Quote(strings.ToUpper(route.Method)),
				strconv.Quote(normalizeRoutePath(route.Route)), strconv.Quote(route.Body))
			fmt.Fprintf(source, "\tr.Method(%s, %s, http.HandlerFunc(func(w http.ResponseWriter, req *http.Request) { svc.Custom(w, req, customModule, %s) }))\n",
				strconv.Quote(strings.ToUpper(route.Method)), strconv.Quote(normalizeRoutePath(route.Route)), specVar)
		}
	}
}

func customRouteMiddleware(registration Registration) []string {
	seen := map[string]bool{}
	var middleware []string
	for _, group := range registration.CustomRoutes {
		for _, name := range group.Middleware {
			if !seen[name] {
				seen[name] = true
				middleware = append(middleware, name)
			}
		}
	}
	return middleware
}

func endpointSpecLiteral(operation string, api APIBlock, endpoint EndpointConfig) string {
	fields := []string{
		"Operation: " + strconv.Quote(operation),
		"Method: " + strconv.Quote(endpointMethod(operation, endpoint)),
		"Path: " + strconv.Quote(joinRoute(api.Prefix, endpointRoute(operation, endpoint))),
		"Body: " + strconv.Quote(endpoint.Body),
		"Type: " + strconv.Quote(endpoint.Type),
		"ResponseType: " + strconv.Quote(endpoint.Response.Type),
		"ResponseValue: " + strconv.Quote(endpoint.Response.Value),
	}
	if endpoint.Response.Type == "paginated" {
		fields = append(fields, "Paginated: true")
	}
	if len(endpoint.Validation) > 0 {
		names := make([]string, 0, len(endpoint.Validation))
		for name := range endpoint.Validation {
			names = append(names, name)
		}
		sort.Strings(names)
		pairs := make([]string, 0, len(names))
		for _, name := range names {
			pairs = append(pairs, strconv.Quote(name)+": "+strconv.Quote(endpoint.Validation[name]))
		}
		fields = append(fields, "Validation: map[string]string{"+strings.Join(pairs, ", ")+"}")
	}
	return "{" + strings.Join(fields, ", ") + "}"
}

func policiesLiteral(api APIBlock, registration Registration) string {
	if !api.Policy {
		return ""
	}
	names := make([]string, 0, len(registration.PolicySnippets))
	for name := range registration.PolicySnippets {
		names = append(names, name)
	}
	sort.Strings(names)
	pairs := make([]string, 0, len(names))
	for _, name := range names {
		pairs = append(pairs, strconv.Quote(name)+": "+strconv.Quote(registration.PolicySnippets[name]))
	}
	return ", Policies: map[string]string{" + strings.Join(pairs, ", ") + "}"
}

func sortedEndpointOperations(api APIBlock) []string {
	operations := make([]string, 0, len(api.Endpoints))
	for operation := range api.Endpoints {
		operations = append(operations, operation)
	}
	sort.Strings(operations)
	return operations
}

func crudHandlerName(operation string) string {
	switch operation {
	case "index":
		return "svc.List"
	case "show":
		return "svc.Read"
	case "store":
		return "svc.Create"
	case "update":
		return "svc.Modify"
	default:
		return "svc.Remove"
	}
}

func hasBroadcastEndpoints(registration Registration) bool {
	for _, api := range registration.APIs {
		for _, endpoint := range api.Endpoints {
			if endpoint.Type == "broadcast" {
				return true
			}
		}
	}
	return false
}

func broadcastTable(registration Registration) string {
	for _, api := range registration.APIs {
		for _, endpoint := range api.Endpoints {
			if endpoint.Type == "broadcast" {
				return api.Table
			}
		}
	}
	return ""
}

func quotedCSV(values []string) string {
	quoted := make([]string, 0, len(values))
	for _, value := range values {
		quoted = append(quoted, strconv.Quote(value))
	}
	return strings.Join(quoted, ", ")
}

// generateRegistrySource emits the generated/ package that imports every
// compiled module and installs it onto the router. Modules live in
// directories named after the tatemono (dashes allowed); the package name
// inside is the Go-safe form.
func generateRegistrySource(moduleNames []string) string {
	var imports strings.Builder
	var calls strings.Builder
	used := map[string]int{}
	for _, name := range moduleNames {
		packageName := goPackageName(name)
		used[packageName]++
		alias := "mod_" + packageName
		if used[packageName] > 1 {
			alias = fmt.Sprintf("%s%d", alias, used[packageName])
		}
		fmt.Fprintf(&imports, "\t%s \"github.com/pluff/pluff/engine/backend/go/generated/%s\"\n", alias, name)
		fmt.Fprintf(&calls, "\t%s.Install(r, svc)\n", alias)
	}
	return fmt.Sprintf(`// Code generated by the Go backend engine. Do not edit.
package generated

import (
	"github.com/go-chi/chi/v5"
	"github.com/pluff/pluff/engine/backend/go/internal/modulespec"
%s
)

// InstallAll registers every compiled tatemono module onto the live router.
func InstallAll(r chi.Router, svc modulespec.Services) {
%s}
`, imports.String(), calls.String())
}

func generateModelsSource(packageName, moduleName string, models []generatedModel) string {
	var source strings.Builder
	fmt.Fprintf(&source, "package %s\n\n", packageName)
	fmt.Fprintf(&source, "const ModuleName = %s\n\n", strconv.Quote(moduleName))
	modelNames := make([]string, 0, len(models))
	for _, model := range models {
		modelNames = append(modelNames, model.Name)
		fmt.Fprintf(&source, "type %s struct {\n", model.Name)
		columns := make([]string, 0, len(model.Definition.Columns))
		for column := range model.Definition.Columns {
			columns = append(columns, column)
		}
		sort.Strings(columns)
		fieldNames := make(map[string]int)
		for _, column := range columns {
			definition := model.Definition.Columns[column]
			field := uniqueGoIdentifier(exportedGoIdentifier(column), fieldNames)
			fieldType := goColumnType(definition.Type)
			if definition.Nullable != nil && *definition.Nullable {
				fieldType = "*" + fieldType
			}
			fmt.Fprintf(&source, "\t%s %s `json:%s db:%s`\n", field, fieldType,
				strconv.Quote(column), strconv.Quote(column))
		}
		timestamps := model.Definition.Timestamps == nil || *model.Definition.Timestamps
		if timestamps {
			addGeneratedField(&source, fieldNames, "CreatedAt", "string", "created_at")
			addGeneratedField(&source, fieldNames, "UpdatedAt", "string", "updated_at")
		}
		if model.Definition.SoftDeletes {
			addGeneratedField(&source, fieldNames, "DeletedAt", "*string", "deleted_at")
		}
		source.WriteString("}\n\n")
	}
	writeStringSlice(&source, "GeneratedModelNames", modelNames)
	return source.String()
}

func writeStringSlice(source *strings.Builder, name string, values []string) {
	fmt.Fprintf(source, "var %s = []string{", name)
	for _, value := range values {
		fmt.Fprintf(source, "%s,", strconv.Quote(value))
	}
	source.WriteString("}\n")
}

func addGeneratedField(source *strings.Builder, used map[string]int, name, fieldType, column string) {
	field := uniqueGoIdentifier(name, used)
	fmt.Fprintf(source, "\t%s %s `json:%s db:%s`\n", field, fieldType,
		strconv.Quote(column), strconv.Quote(column))
}

func goColumnType(kind string) string {
	switch strings.ToLower(kind) {
	case "integer", "biginteger", "foreignid":
		return "int64"
	case "float", "decimal":
		return "float64"
	case "boolean":
		return "bool"
	case "json":
		return "[]byte"
	default:
		return "string"
	}
}

func goPackageName(module string) string {
	var packageName strings.Builder
	for _, character := range strings.ToLower(module) {
		if unicode.IsLetter(character) || unicode.IsDigit(character) || character == '_' {
			packageName.WriteRune(character)
		} else {
			packageName.WriteRune('_')
		}
	}
	name := strings.Trim(packageName.String(), "_")
	if name == "" {
		name = "module"
	}
	if unicode.IsDigit([]rune(name)[0]) {
		name = "module_" + name
	}
	if token.Lookup(name).IsKeyword() {
		name += "_module"
	}
	return name
}

func exportedGoIdentifier(value string) string {
	var identifier strings.Builder
	capitalize := true
	for _, character := range value {
		if !unicode.IsLetter(character) && !unicode.IsDigit(character) && character != '_' {
			capitalize = true
			continue
		}
		if character == '_' {
			capitalize = true
			continue
		}
		if capitalize {
			identifier.WriteRune(unicode.ToUpper(character))
			capitalize = false
		} else {
			identifier.WriteRune(character)
		}
	}
	name := identifier.String()
	if name == "" {
		name = "Generated"
	}
	if unicode.IsDigit([]rune(name)[0]) {
		name = "Generated" + name
	}
	if token.Lookup(name).IsKeyword() {
		name += "Generated"
	}
	return name
}

func uniqueGoIdentifier(name string, used map[string]int) string {
	used[name]++
	if used[name] == 1 {
		return name
	}
	return fmt.Sprintf("%s%d", name, used[name])
}

func writeGeneratedModule(root, name string, files map[string][]byte) error {
	if err := os.MkdirAll(root, 0o755); err != nil {
		return fmt.Errorf("create generated source directory: %w", err)
	}
	target := filepath.Join(root, name)
	if err := os.MkdirAll(target, 0o755); err != nil {
		return fmt.Errorf("create generated module directory: %w", err)
	}

	written := make(map[string]struct{}, len(files))
	for relativePath, contents := range files {
		cleanPath := filepath.Clean(filepath.FromSlash(relativePath))
		destination := filepath.Join(target, cleanPath)
		relative, err := filepath.Rel(target, destination)
		if err != nil || relative == ".." || strings.HasPrefix(relative, ".."+string(filepath.Separator)) {
			return fmt.Errorf("generated source path %q escapes module directory", relativePath)
		}
		if err := os.MkdirAll(filepath.Dir(destination), 0o755); err != nil {
			return fmt.Errorf("create generated source subdirectory: %w", err)
		}
		if err := os.WriteFile(destination, contents, 0o644); err != nil {
			return fmt.Errorf("write generated source %q: %w", relativePath, err)
		}
		written[filepath.Clean(relative)] = struct{}{}
	}

	if err := filepath.WalkDir(target, func(path string, entry os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if entry.IsDir() {
			return nil
		}
		relative, err := filepath.Rel(target, path)
		if err != nil {
			return err
		}
		if _, exists := written[filepath.Clean(relative)]; exists {
			return nil
		}
		if err := os.Remove(path); err != nil && !errors.Is(err, os.ErrNotExist) {
			return err
		}
		return nil
	}); err != nil {
		return fmt.Errorf("remove stale generated sources: %w", err)
	}
	return nil
}

func removeGeneratedModule(root, name string) error {
	path := filepath.Join(root, name)
	if err := os.RemoveAll(path); err != nil {
		return fmt.Errorf("remove generated module sources: %w", err)
	}
	return nil
}
