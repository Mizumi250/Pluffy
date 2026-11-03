package backend

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type Service struct {
	storageDir string
	store      *Store
	mu         sync.Mutex
}

var errModuleNotRegistered = errors.New("module is not registered")

func NewService(storageDir string) (*Service, error) {
	store, err := OpenStore(storageDir)
	if err != nil {
		return nil, err
	}
	return &Service{storageDir: storageDir, store: store}, nil
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
	if err := ensureSQLiteSchema(s.storageDir, payload.Name, payload.Databases, payload.Auth, payload.AuthSeed, hasNotifications); err != nil {
		return Registration{}, fmt.Errorf("initialize isolated SQLite database: %w", err)
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
	if err := s.store.Register(registration); err != nil {
		return Registration{}, fmt.Errorf("persist module registration: %w", err)
	}
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
	if err := removeSQLiteDatabase(filepath.Join(s.storageDir, "databases", name+".sqlite")); err != nil {
		return fmt.Errorf("remove isolated SQLite database: %w", err)
	}
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
