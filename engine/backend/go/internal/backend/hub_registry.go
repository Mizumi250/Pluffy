package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"regexp"
	"strings"
	"time"
)

var (
	hubVariantBlockPattern = regexp.MustCompile(`(?m)^/\* @arkzen:(endpoint|handler|middleware|policy|listener|listeners|job|jobs|console|mail|notification|notifications):(?:(php|ts|py|java|cs|go|rs):)?([a-zA-Z0-9_-]+)(?:\s+\*/)?\s*$`)
	hubWebPattern          = regexp.MustCompile(`@arkzen:(web:|meta:web\b)`)
	hubAppPattern          = regexp.MustCompile(`/\* @arkzen:native:page:(lynx:)?[a-zA-Z0-9_-]+`)
	hubLynxPattern         = regexp.MustCompile(`/\* @arkzen:native:page:lynx:[a-zA-Z0-9_-]+`)
	hubPagePattern         = regexp.MustCompile(`/\* @arkzen:(?:web|native):page:(?:lynx:)?([a-zA-Z0-9_-]+)`)
	hubDesktopPattern      = regexp.MustCompile(`@arkzen:desktop:|desktopConfig|@arkzen:meta:desktop`)
	hubBackendPattern      = regexp.MustCompile(`auth:\s*true|@arkzen:(api|database|auth|jobs|events|mail|notifications|routes|realtime|console|store)`)
)

func readRegistryMetadata(root string) (map[string]any, error) {
	metadata := map[string]any{
		"project":        "pluff",
		"activeStack":    "nextjs",
		"activeBackend":  "go",
		"activeDatabase": "sqlite",
	}
	if root == "" {
		return metadata, nil
	}
	absolute, err := filepath.Abs(root)
	if err != nil {
		return nil, fmt.Errorf("resolve registry root: %w", err)
	}
	rootInfo, err := os.Stat(absolute)
	if err != nil {
		return nil, fmt.Errorf("inspect PLUFF_ROOT: %w", err)
	}
	if !rootInfo.IsDir() {
		return nil, errors.New("PLUFF_ROOT must refer to a directory")
	}
	registryPath := filepath.Join(absolute, "arkzen.json")
	info, err := os.Lstat(registryPath)
	if errors.Is(err, os.ErrNotExist) {
		metadata["project"] = filepath.Base(absolute)
		return metadata, nil
	}
	if err != nil {
		return nil, fmt.Errorf("inspect root registry: %w", err)
	}
	if !info.Mode().IsRegular() {
		return nil, errors.New("root arkzen.json must be a regular file")
	}
	data, err := os.ReadFile(registryPath)
	if err != nil {
		return nil, fmt.Errorf("read root registry: %w", err)
	}
	var registry map[string]json.RawMessage
	if err := json.Unmarshal(data, &registry); err != nil {
		return nil, fmt.Errorf("decode root registry: %w", err)
	}
	if registry == nil {
		return nil, errors.New("root arkzen.json must contain a JSON object")
	}
	if value, ok := readRegistryString(registry, "project"); ok {
		metadata["project"] = value
	} else {
		metadata["project"] = filepath.Base(absolute)
	}
	for _, field := range []string{"activeStack", "activeBackend", "activeDatabase"} {
		if value, ok := readRegistryString(registry, field); ok {
			metadata[field] = value
		}
	}
	if activeBackend, ok := metadata["activeBackend"].(string); !ok || strings.TrimSpace(activeBackend) == "" {
		metadata["activeBackend"] = "go"
	}
	return metadata, nil
}

func enrichRegistryModules(root string, registrations []Registration, activeBackend string) ([]map[string]any, error) {
	modules, err := sourceHubModules(root, activeBackend)
	if err != nil {
		return nil, err
	}
	modulesByName := make(map[string]int, len(modules)+len(registrations))
	for index, module := range modules {
		modulesByName[module["name"].(string)] = index
	}
	for _, registration := range registrations {
		encoded, err := json.Marshal(registration)
		if err != nil {
			return nil, fmt.Errorf("encode module %q for Hub registry: %w", registration.Name, err)
		}
		var module map[string]any
		if err := json.Unmarshal(encoded, &module); err != nil {
			return nil, fmt.Errorf("decode module %q for Hub registry: %w", registration.Name, err)
		}
		if index, exists := modulesByName[registration.Name]; exists {
			module["frontend"] = modules[index]["frontend"]
			module["backend"] = modules[index]["backend"]
			merged := make(map[string]any, len(modules[index])+len(module))
			for key, value := range modules[index] {
				merged[key] = value
			}
			for key, value := range module {
				merged[key] = value
			}
			modules[index] = merged
		} else {
			frontend, backend, err := moduleCompatibility(root, registration.Name, activeBackend)
			if err != nil {
				return nil, err
			}
			module["frontend"] = frontend
			module["backend"] = backend
			modulesByName[registration.Name] = len(modules)
			modules = append(modules, module)
		}
	}
	return modules, nil
}

func sourceHubModules(root, activeBackend string) ([]map[string]any, error) {
	if root == "" {
		return []map[string]any{}, nil
	}
	directory := filepath.Join(root, "tatemonos")
	entries, err := os.ReadDir(directory)
	if errors.Is(err, os.ErrNotExist) {
		return []map[string]any{}, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read Tatemono directory for Hub registry: %w", err)
	}
	modules := make([]map[string]any, 0, len(entries))
	for _, entry := range entries {
		if !entry.IsDir() {
			continue
		}
		relativePath := filepath.Join("tatemonos", entry.Name(), "core.tsx")
		filePath := filepath.Join(root, relativePath)
		info, err := os.Stat(filePath)
		if errors.Is(err, os.ErrNotExist) {
			continue
		}
		if err != nil {
			return nil, fmt.Errorf("inspect Tatemono source %q for Hub registry: %w", filePath, err)
		}
		if !info.Mode().IsRegular() {
			continue
		}
		sourceBytes, err := os.ReadFile(filePath)
		if err != nil {
			return nil, fmt.Errorf("read Tatemono source %q for Hub registry: %w", filePath, err)
		}
		source := string(sourceBytes)
		name := hubMetaField(source, "name")
		if name == "" {
			continue
		}
		registered := info.ModTime().UTC().Format(time.RFC3339Nano)
		frontend, backend := moduleCompatibilityFromSource(source, activeBackend)
		modules = append(modules, map[string]any{
			"name":        name,
			"version":     nonEmptyHubValue(hubMetaField(source, "version"), "1.0.0"),
			"status":      "active",
			"filePath":    filepath.ToSlash(relativePath),
			"pages":       hubPageNames(source),
			"registered":  registered,
			"lastUpdated": registered,
			"auth":        strings.EqualFold(hubMetaField(source, "auth"), "true"),
			"frontend":    frontend,
			"backend":     backend,
		})
	}
	return modules, nil
}

func moduleCompatibility(root, name, activeBackend string) ([]string, []string, error) {
	if root == "" {
		return []string{}, []string{}, nil
	}
	filePath := filepath.Join(root, "tatemonos", name, "core.tsx")
	sourceBytes, err := os.ReadFile(filePath)
	if errors.Is(err, os.ErrNotExist) {
		return []string{}, []string{}, nil
	}
	if err != nil {
		return nil, nil, fmt.Errorf("read Tatemono source %q for Hub compatibility: %w", filePath, err)
	}
	frontend, backend := moduleCompatibilityFromSource(string(sourceBytes), activeBackend)
	return frontend, backend, nil
}

func moduleCompatibilityFromSource(source, activeBackend string) ([]string, []string) {
	frontend := make([]string, 0, 11)
	hasWeb := hubWebPattern.MatchString(source)
	if hasWeb {
		frontend = append(frontend, "Next.js", "React + Vite", "React + Inertia", "Astro", "TanStack Start")
	}
	if hubHasAppPage(source) {
		frontend = append(frontend, "Expo", "React Native")
	}
	if hubLynxPattern.MatchString(source) {
		frontend = append(frontend, "Lynx")
	}
	if hasWeb || hubDesktopPattern.MatchString(source) {
		frontend = append(frontend, "Tauri", "Electron")
	}

	backend := make([]string, 0, 3)
	seen := make(map[string]struct{})
	for _, match := range hubVariantBlockPattern.FindAllStringSubmatchIndex(source, -1) {
		marker := source[match[2]:match[3]]
		variant := "php"
		if match[4] >= 0 {
			variant = source[match[4]:match[5]]
		}
		nameStart, nameEnd := match[6], match[7]
		blockEnd := source[match[1]:]
		if strings.Contains(blockEnd, "*/") && strings.TrimSpace(source[match[1]:match[1]+strings.Index(blockEnd, "*/")]) == "" {
			continue
		}
		closingTag := fmt.Sprintf("/* @arkzen:%s:%s:%s:end */", marker, variant, source[nameStart:nameEnd])
		if variant == "php" && match[4] < 0 {
			closingTag = fmt.Sprintf("/* @arkzen:%s:%s:end */", marker, source[nameStart:nameEnd])
		}
		closeIndex := strings.Index(source[match[1]:], closingTag)
		if closeIndex < 0 || strings.TrimSpace(source[match[1]:match[1]+closeIndex]) == "" {
			continue
		}
		if label := hubVariantLabels[variant]; label != "" {
			appendHubLabel(&backend, seen, label)
		}
	}

	metaBackend := hubMetaField(source, "backend")
	targetLabel := hubBackendLabels[metaBackend]
	if targetLabel != "" {
		appendHubLabel(&backend, seen, targetLabel)
	} else if len(backend) == 0 && hubBackendPattern.MatchString(source) {
		fallback := hubBackendLabels[activeBackend]
		if fallback == "" {
			fallback = "Laravel"
		}
		appendHubLabel(&backend, seen, fallback)
	}
	return frontend, backend
}

func hubPageNames(source string) []string {
	names := make([]string, 0)
	seen := make(map[string]struct{})
	for _, match := range hubPagePattern.FindAllStringSubmatch(source, -1) {
		name := match[1]
		if name == "end" || name == "layout" {
			continue
		}
		if _, exists := seen[name]; exists {
			continue
		}
		seen[name] = struct{}{}
		names = append(names, name)
	}
	return names
}

func nonEmptyHubValue(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func hubHasAppPage(source string) bool {
	for _, match := range hubAppPattern.FindAllStringSubmatch(source, -1) {
		if match[1] == "" {
			return true
		}
	}
	return false
}

var hubBackendLabels = map[string]string{
	"laravel": "Laravel", "laravel-inertia": "Laravel", "express": "Express",
	"fastapi": "FastAPI / Django", "django": "FastAPI / Django", "spring-boot": "Spring Boot",
	"aspnet": "ASP.NET", "go": "Go", "rust": "Rust",
}

var hubVariantLabels = map[string]string{
	"php": "Laravel", "ts": "Express", "py": "FastAPI / Django",
	"java": "Spring Boot", "cs": "ASP.NET", "go": "Go", "rs": "Rust",
}

func appendHubLabel(labels *[]string, seen map[string]struct{}, label string) {
	if _, exists := seen[label]; exists {
		return
	}
	seen[label] = struct{}{}
	*labels = append(*labels, label)
}

func hubMetaField(source, field string) string {
	metaStart := strings.Index(source, "/* @arkzen:meta")
	if metaStart < 0 {
		return ""
	}
	metaEnd := strings.Index(source[metaStart:], "*/")
	if metaEnd < 0 {
		return ""
	}
	for _, line := range strings.Split(source[metaStart:metaStart+metaEnd], "\n") {
		key, value, found := strings.Cut(strings.TrimSpace(line), ":")
		if found && strings.TrimSpace(key) == field {
			return strings.Trim(strings.TrimSpace(value), `"'`)
		}
	}
	return ""
}

func readExpoRegistry(root string) (map[string]any, error) {
	emptyRegistry := map[string]any{
		"engine":  "1.0.0",
		"project": "expo",
		"modules": []any{},
	}
	if root == "" {
		return emptyRegistry, nil
	}
	absolute, err := filepath.Abs(root)
	if err != nil {
		return nil, fmt.Errorf("resolve registry root: %w", err)
	}
	rootInfo, err := os.Stat(absolute)
	if err != nil {
		return nil, fmt.Errorf("inspect PLUFF_ROOT: %w", err)
	}
	if !rootInfo.IsDir() {
		return nil, errors.New("PLUFF_ROOT must refer to a directory")
	}
	registryPath := filepath.Join(absolute, "engine", "frontend", "expo", "expo-registry.json")
	info, err := os.Lstat(registryPath)
	if errors.Is(err, os.ErrNotExist) {
		return emptyRegistry, nil
	}
	if err != nil {
		return nil, fmt.Errorf("inspect Expo registry: %w", err)
	}
	if !info.Mode().IsRegular() {
		return nil, errors.New("Expo registry must be a regular file")
	}
	data, err := os.ReadFile(registryPath)
	if err != nil {
		return nil, fmt.Errorf("read Expo registry: %w", err)
	}
	var registry map[string]any
	if err := json.Unmarshal(data, &registry); err != nil {
		return nil, fmt.Errorf("decode Expo registry: %w", err)
	}
	if registry == nil {
		return nil, errors.New("Expo registry must contain a JSON object")
	}
	if _, ok := registry["modules"]; !ok {
		registry["modules"] = []any{}
	}
	return registry, nil
}

func readRegistryString(registry map[string]json.RawMessage, field string) (string, bool) {
	raw, exists := registry[field]
	if !exists {
		return "", false
	}
	var value string
	if err := json.Unmarshal(raw, &value); err != nil || strings.TrimSpace(value) == "" {
		return "", false
	}
	return value, true
}
