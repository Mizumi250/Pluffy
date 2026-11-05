package backend

import (
	"os"
	"path/filepath"
	"testing"
)

func TestWriteGeneratedModuleRewritesExistingDirectory(t *testing.T) {
	root := t.TempDir()
	moduleDir := filepath.Join(root, "sample")
	if err := os.MkdirAll(moduleDir, 0o755); err != nil {
		t.Fatal(err)
	}
	stalePath := filepath.Join(moduleDir, "stale.go")
	if err := os.WriteFile(stalePath, []byte("package sample\n"), 0o644); err != nil {
		t.Fatal(err)
	}

	files := map[string][]byte{
		"models.go": []byte("package sample\nconst Version = 1\n"),
		"module.go": []byte("package sample\n"),
	}
	if err := writeGeneratedModule(root, "sample", files); err != nil {
		t.Fatalf("write generated module: %v", err)
	}
	if _, err := os.Stat(stalePath); !os.IsNotExist(err) {
		t.Fatalf("stale generated source still exists: %v", err)
	}

	files["models.go"] = []byte("package sample\nconst Version = 2\n")
	if err := writeGeneratedModule(root, "sample", files); err != nil {
		t.Fatalf("rewrite generated module: %v", err)
	}
	content, err := os.ReadFile(filepath.Join(moduleDir, "models.go"))
	if err != nil {
		t.Fatal(err)
	}
	if string(content) != string(files["models.go"]) {
		t.Fatalf("generated source = %q, want %q", content, files["models.go"])
	}
}

func TestRegenerateRegistryRewritesExistingFile(t *testing.T) {
	root := t.TempDir()
	generatedDir := filepath.Join(root, "generated")
	if err := os.MkdirAll(generatedDir, 0o755); err != nil {
		t.Fatal(err)
	}
	registryPath := filepath.Join(generatedDir, "registry.go")
	if err := os.WriteFile(registryPath, []byte("package generated\n// stale\n"), 0o644); err != nil {
		t.Fatal(err)
	}
	store, err := OpenStore(filepath.Join(root, "storage"))
	if err != nil {
		t.Fatal(err)
	}
	if err := store.Register(Registration{Name: "sample"}); err != nil {
		t.Fatal(err)
	}
	service := &Service{generatedDir: generatedDir, store: store}
	if err := service.regenerateRegistry(); err != nil {
		t.Fatalf("regenerate registry: %v", err)
	}
	content, err := os.ReadFile(registryPath)
	if err != nil {
		t.Fatal(err)
	}
	if string(content) == "package generated\n// stale\n" {
		t.Fatal("stale generated registry was not replaced")
	}
}
