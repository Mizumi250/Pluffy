package backend

import (
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
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
