package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"sync"
	"time"
)

type Registration struct {
	Name           string    `json:"name"`
	BackendVariant string    `json:"backendVariant"`
	Tables         []string  `json:"tables"`
	APIs           []APIBlock `json:"apis,omitempty"`
	RegisteredAt   time.Time `json:"registeredAt"`
}

type registryFile struct {
	Modules []Registration `json:"modules"`
}

type Store struct {
	mu       sync.RWMutex
	path     string
	modules  map[string]Registration
}

func OpenStore(storageDir string) (*Store, error) {
	if err := os.MkdirAll(storageDir, 0o755); err != nil {
		return nil, fmt.Errorf("create storage directory: %w", err)
	}
	store := &Store{
		path:    filepath.Join(storageDir, "modules.json"),
		modules: make(map[string]Registration),
	}
	data, err := os.ReadFile(store.path)
	if errors.Is(err, os.ErrNotExist) {
		return store, nil
	}
	if err != nil {
		return nil, fmt.Errorf("read module registry: %w", err)
	}
	var persisted registryFile
	if err := json.Unmarshal(data, &persisted); err != nil {
		return nil, fmt.Errorf("decode module registry %q: %w", store.path, err)
	}
	for _, registration := range persisted.Modules {
		if !moduleNamePattern.MatchString(registration.Name) {
			return nil, fmt.Errorf("module registry contains invalid name %q", registration.Name)
		}
		store.modules[registration.Name] = registration
	}
	return store, nil
}

func (s *Store) List() []Registration {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return sortedRegistrations(s.modules)
}

func (s *Store) Register(registration Registration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	next := make(map[string]Registration, len(s.modules)+1)
	for name, current := range s.modules {
		next[name] = current
	}
	next[registration.Name] = registration
	if err := s.persist(next); err != nil {
		return err
	}
	s.modules = next
	return nil
}

func (s *Store) Unregister(name string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, exists := s.modules[name]; !exists {
		return os.ErrNotExist
	}
	next := make(map[string]Registration, len(s.modules)-1)
	for moduleName, current := range s.modules {
		if moduleName != name {
			next[moduleName] = current
		}
	}
	if err := s.persist(next); err != nil {
		return err
	}
	s.modules = next
	return nil
}

func (s *Store) persist(modules map[string]Registration) error {
	data, err := json.MarshalIndent(registryFile{Modules: sortedRegistrations(modules)}, "", "  ")
	if err != nil {
		return fmt.Errorf("encode module registry: %w", err)
	}
	file, err := os.CreateTemp(filepath.Dir(s.path), ".modules-*.json")
	if err != nil {
		return fmt.Errorf("create module registry file: %w", err)
	}
	tempPath := file.Name()
	defer os.Remove(tempPath)
	if _, err := file.Write(data); err != nil {
		_ = file.Close()
		return fmt.Errorf("write module registry: %w", err)
	}
	if err := file.Sync(); err != nil {
		_ = file.Close()
		return fmt.Errorf("sync module registry: %w", err)
	}
	if err := file.Close(); err != nil {
		return fmt.Errorf("close module registry: %w", err)
	}
	if err := os.Rename(tempPath, s.path); err != nil {
		return fmt.Errorf("replace module registry: %w", err)
	}
	return nil
}

func sortedRegistrations(modules map[string]Registration) []Registration {
	result := make([]Registration, 0, len(modules))
	for _, registration := range modules {
		result = append(result, registration)
	}
	sort.Slice(result, func(i, j int) bool { return result[i].Name < result[j].Name })
	return result
}
