package backend

import (
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"sync"
	"time"
)

type Service struct {
	storageDir      string
	generatedDir    string
	store           *Store
	mu              sync.Mutex
	runtimes        map[string]*moduleRuntime
	registryChanged bool
	bootFingerprint string
	broadcast       func(module, section string, target any, payload map[string]any) error
	logMessage      func(level, module, message string, meta map[string]any)
}

var errModuleNotRegistered = errors.New("module is not registered")

func NewService(config Config) (*Service, error) {
	store, err := OpenStore(config.StorageDir)
	if err != nil {
		return nil, err
	}
	service := &Service{
		storageDir:   config.StorageDir,
		generatedDir: config.GeneratedDir,
		store:        store,
	}
	for _, registration := range store.List() {
		generated, err := generateGoModule(registration)
		if err != nil {
			return nil, fmt.Errorf("generate Go module %q: %w", registration.Name, err)
		}
		registration.GeneratedRoutes = generated.Routes
		registration.GeneratedFiles = generatedFileNames(generated.Files)
		if err := writeGeneratedModule(service.generatedDir, registration.Name, generated.Files); err != nil {
			return nil, fmt.Errorf("write generated Go module %q: %w", registration.Name, err)
		}
		if err := store.Register(registration); err != nil {
			return nil, fmt.Errorf("update generated Go module registration %q: %w", registration.Name, err)
		}
	}
	if err := service.regenerateRegistry(); err != nil {
		return nil, err
	}
	service.bootFingerprint = generatedFingerprint(service.generatedDir)
	return service, nil
}

// generatedFingerprint hashes every generated .go file so the handler can
// tell whether the running binary is still current without recompiling.
func generatedFingerprint(generatedDir string) string {
	hash := sha256.New()
	_ = filepath.WalkDir(generatedDir, func(path string, entry os.DirEntry, err error) error {
		if err != nil || entry.IsDir() || !strings.HasSuffix(path, ".go") {
			return nil
		}
		relative, relErr := filepath.Rel(generatedDir, path)
		if relErr != nil {
			return nil
		}
		content, readErr := os.ReadFile(path)
		if readErr != nil {
			return nil
		}
		fmt.Fprintf(hash, "%s\x00%x\x00", filepath.ToSlash(relative), content)
		return nil
	})
	return hex.EncodeToString(hash.Sum(nil))
}

// generatedChanged reports whether the on-disk generated tree differs from
// the code the running binary was compiled from.
func (s *Service) generatedChanged() bool {
	return generatedFingerprint(s.generatedDir) != s.bootFingerprint
}

// markCompiled records the current generated tree as compiled; used when the
// compile gate passes but no supervisor restart follows (tests/manual runs).
func (s *Service) markCompiled() {
	s.bootFingerprint = generatedFingerprint(s.generatedDir)
}

// regenerateRegistry rewrites generated/registry.go so the compiled binary
// installs exactly the currently registered tatemono modules.
func (s *Service) regenerateRegistry() error {
	names := make([]string, 0)
	for _, registration := range s.store.List() {
		names = append(names, registration.Name)
	}
	source := generateRegistrySource(names)
	if err := os.MkdirAll(s.generatedDir, 0o755); err != nil {
		return fmt.Errorf("create generated directory: %w", err)
	}
	target := filepath.Join(s.generatedDir, "registry.go")
	if existing, readErr := os.ReadFile(target); readErr == nil && string(existing) == source {
		return nil
	}
	s.registryChanged = true
	temporary, err := os.CreateTemp(s.generatedDir, "registry-*.go")
	if err != nil {
		return fmt.Errorf("stage generated registry: %w", err)
	}
	defer os.Remove(temporary.Name())
	if _, err := temporary.WriteString(source); err != nil {
		_ = temporary.Close()
		return fmt.Errorf("write generated registry: %w", err)
	}
	if err := temporary.Close(); err != nil {
		return fmt.Errorf("write generated registry: %w", err)
	}
	if err := os.Rename(temporary.Name(), target); err != nil {
		return fmt.Errorf("install generated registry: %w", err)
	}
	return nil
}

// verifyCompiledModules compiles the engine tree (including the freshly
// written generated packages) so a restart can never boot a broken binary.
// It is a no-op when generatedDir sits outside a Go module (for example the
// temporary storage directories used by tests).
func (s *Service) verifyCompiledModules() error {
	moduleRoot := filepath.Dir(s.generatedDir)
	if _, err := os.Stat(filepath.Join(moduleRoot, "go.mod")); err != nil {
		return nil
	}
	build := exec.Command("go", "build", "./...")
	build.Dir = moduleRoot
	output, err := build.CombinedOutput()
	if err != nil {
		return fmt.Errorf("compiled generated modules failed: %s", strings.TrimSpace(string(output)))
	}
	return nil
}

func (s *Service) Registrations() []Registration {
	return s.store.List()
}

func (s *Service) Build(payload BuildPayload) (Registration, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	problems := ValidateBuild(payload)
	if len(problems) > 0 {
		return Registration{}, fmt.Errorf("validation failed: %v", problems)
	}
	hasNotifications := len(payload.Notifications) > 0
	if err := ensureModuleSchema(s.storageDir, payload.Name, payload.Databases, payload.Auth, payload.AuthSeed, hasNotifications); err != nil {
		return Registration{}, fmt.Errorf("initialize isolated %s database: %w", configuredDialect(), err)
	}
	tables := make([]string, 0, len(payload.Databases))
	databaseByTable := make(map[string]DatabaseDefinition, len(payload.Databases))
	for _, database := range payload.Databases {
		tables = append(tables, database.Table)
		databaseByTable[database.Table] = database
	}
	if hasNotifications {
		tables = append(tables, "notifications")
		databaseByTable["notifications"] = DatabaseDefinition{Table: "notifications", SoftDeletes: false}
	}
	sort.Strings(tables)
	apis := make([]APIBlock, 0, len(payload.APIs))
	for _, api := range payload.APIs {
		api.Table = resolveAPITable(api, payload.Databases, hasNotifications)
		if api.Prefix == "" {
			api.Prefix = "/api/" + payload.Name
		}
		api.Prefix = normalizeRoutePath(api.Prefix)
		api.SoftDeletes = databaseByTable[api.Table].SoftDeletes
		if api.Endpoints == nil {
			api.Endpoints = defaultEndpoints()
		}
		apis = append(apis, api)
	}
	registration := Registration{
		Name:           payload.Name,
		BackendVariant: "go",
		Auth:           payload.Auth,
		Tables:         tables,
		Databases:      payload.Databases,
		APIs:           apis,
		CustomRoutes:   payload.CustomRoutes,
		Realtimes:      payload.Realtimes,
		Events:         runtimeDSLSections(payload.Events, "listeners", "listener_bodies"),
		Jobs:           runtimeDSLSections(payload.Jobs, "queue", "tries", "timeout"),
		Notifications:  runtimeDSLSections(payload.Notifications, "channels", "channel_type", "message", "subject", "toMail_body"),
		Consoles:       runtimeDSLSections(payload.Consoles, "signature", "schedule"),
		Mails:          runtimeDSLSections(payload.Mails, "subject", "blade_body"),
		PolicySnippets: payload.PolicySnippets,
		RegisteredAt:   time.Now().UTC(),
	}
	generated, err := generateGoModule(registration)
	if err != nil {
		return Registration{}, fmt.Errorf("generate Go module sources: %w", err)
	}
	registration.GeneratedRoutes = generated.Routes
	registration.GeneratedFiles = generatedFileNames(generated.Files)
	if err := writeGeneratedModule(s.generatedDir, payload.Name, generated.Files); err != nil {
		return Registration{}, fmt.Errorf("write Go module sources: %w", err)
	}
	if err := s.store.Register(registration); err != nil {
		return Registration{}, fmt.Errorf("persist module registration: %w", err)
	}
	if err := s.regenerateRegistry(); err != nil {
		return Registration{}, fmt.Errorf("refresh generated registry: %w", err)
	}
	s.invalidateModuleRuntime(payload.Name)
	return registration, nil
}

func (s *Service) Remove(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !moduleNamePattern.MatchString(name) {
		return fmt.Errorf("invalid tatemono name %q", name)
	}
	known := false
	for _, registration := range s.store.List() {
		if registration.Name == name {
			known = true
			break
		}
	}
	if !known {
		return errModuleNotRegistered
	}
	if err := s.store.Unregister(name); err != nil {
		return fmt.Errorf("remove module registration: %w", err)
	}
	if configuredDialect() == postgresDialect {
		if err := removePostgresDatabase(name); err != nil {
			return fmt.Errorf("remove isolated PostgreSQL database: %w", err)
		}
	} else if err := removeSQLiteDatabase(filepath.Join(s.storageDir, "databases", name+".sqlite")); err != nil {
		return fmt.Errorf("remove isolated SQLite database: %w", err)
	}
	if err := removeGeneratedModule(s.generatedDir, name); err != nil {
		return err
	}
	if err := s.regenerateRegistry(); err != nil {
		return fmt.Errorf("refresh generated registry: %w", err)
	}
	s.invalidateModuleRuntime(name)
	sharedModuleDatabases.Delete(name)
	return nil
}

func moduleDatabasePath(storageDir, module string) string {
	return filepath.Join(storageDir, "databases", module+".sqlite")
}

func removeSQLiteDatabase(path string) error {
	err := os.Remove(path)
	if errors.Is(err, os.ErrNotExist) {
		return nil
	}
	return err
}
