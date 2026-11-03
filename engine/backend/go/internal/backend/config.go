package backend

import (
	"fmt"
	"os"
	"path/filepath"
	"strconv"
)

const defaultEngineSecret = "arkzen-engine-secret"

type Config struct {
	Port       int
	Secret     string
	StorageDir string
	RootDir    string
}

func LoadConfig() (Config, error) {
	port := 8000
	if value := os.Getenv("PORT"); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil || parsed < 1 || parsed > 65535 {
			return Config{}, fmt.Errorf("PORT must be an integer from 1 to 65535")
		}
		port = parsed
	}

	secret := os.Getenv("ARKZEN_ENGINE_SECRET")
	if secret == "" {
		secret = defaultEngineSecret
	}
	storageDir := os.Getenv("PLUFF_STORAGE_DIR")
	if storageDir == "" {
		storageDir = "storage"
	}
	rootDir := os.Getenv("PLUFF_ROOT")
	if rootDir != "" {
		absolute, err := filepath.Abs(rootDir)
		if err != nil {
			return Config{}, fmt.Errorf("resolve PLUFF_ROOT: %w", err)
		}
		rootDir = absolute
	}

	return Config{Port: port, Secret: secret, StorageDir: storageDir, RootDir: rootDir}, nil
}

func (c Config) Address() string {
	return fmt.Sprintf(":%d", c.Port)
}
