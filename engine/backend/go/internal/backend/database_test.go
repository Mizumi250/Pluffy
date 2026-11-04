package backend

import (
	"net/url"
	"testing"
)

func TestConfiguredDatabaseDialect(t *testing.T) {
	tests := []struct {
		driver  string
		dialect databaseDialect
	}{
		{"", sqliteDialect},
		{"sqlite", sqliteDialect},
		{"pgsql", postgresDialect},
		{"postgres", postgresDialect},
		{"postgresql", postgresDialect},
		{"unknown", sqliteDialect},
	}
	for _, test := range tests {
		t.Run(test.driver, func(t *testing.T) {
			t.Setenv("ARKZEN_DB_DRIVER", test.driver)
			if got := configuredDialect(); got != test.dialect {
				t.Fatalf("configuredDialect() = %q, want %q", got, test.dialect)
			}
		})
	}
}

func TestModuleDatabaseNameUsesConfiguredPrefix(t *testing.T) {
	t.Setenv("ARKZEN_DB_PREFIX", "pluff")
	if got := moduleDatabaseName("inventory"); got != "pluff_inventory" {
		t.Fatalf("moduleDatabaseName() = %q", got)
	}
	if got := moduleDatabaseName("queue-flow"); got != "pluff_queue_flow" {
		t.Fatalf("moduleDatabaseName() for slug = %q", got)
	}
	t.Setenv("ARKZEN_DB_PREFIX", "pluff_")
	if got := moduleDatabaseName("inventory"); got != "pluff_inventory" {
		t.Fatalf("moduleDatabaseName() with trailing separator = %q", got)
	}
	t.Setenv("ARKZEN_DB_PREFIX", "")
	if got := moduleDatabaseName("inventory"); got != "inventory" {
		t.Fatalf("moduleDatabaseName() without prefix = %q", got)
	}
}

func TestPostgresConnectionStringUsesDatabaseSettings(t *testing.T) {
	t.Setenv("DB_HOST", "db.example.test")
	t.Setenv("DB_PORT", "5444")
	t.Setenv("DB_USERNAME", "app user")
	t.Setenv("DB_PASSWORD", "p@ss/word")
	t.Setenv("DB_SSLMODE", "require")
	parsed, err := url.Parse(postgresConnectionString("pluff_inventory"))
	if err != nil {
		t.Fatal(err)
	}
	if parsed.Scheme != "postgres" || parsed.Host != "db.example.test:5444" || parsed.Path != "/pluff_inventory" {
		t.Fatalf("unexpected PostgreSQL endpoint: %s", parsed)
	}
	if parsed.User.Username() != "app user" {
		t.Fatalf("username = %q", parsed.User.Username())
	}
	password, ok := parsed.User.Password()
	if !ok || password != "p@ss/word" {
		t.Fatalf("password = %q, present = %v", password, ok)
	}
	if parsed.Query().Get("sslmode") != "require" {
		t.Fatalf("sslmode = %q", parsed.Query().Get("sslmode"))
	}
}

func TestPostgresPlaceholderTranslation(t *testing.T) {
	query := `SELECT ?, '?' AS literal, "?" AS identifier -- ?
FROM items WHERE name = ? /* ? */ AND value = 'it''s ?'`
	want := `SELECT $1, '?' AS literal, "?" AS identifier -- ?
FROM items WHERE name = $2 /* ? */ AND value = 'it''s ?'`
	if got := postgresPlaceholders(query); got != want {
		t.Fatalf("postgresPlaceholders() = %q, want %q", got, want)
	}
}

func TestPostgresSchemaDialectHelpers(t *testing.T) {
	for input, want := range map[string]string{
		"integer": "INTEGER", "biginteger": "BIGINT", "boolean": "BOOLEAN",
		"float": "DOUBLE PRECISION", "decimal": "NUMERIC", "datetime": "TIMESTAMP",
		"blob": "BYTEA",
	} {
		got, err := databaseType(input, postgresDialect)
		if err != nil || got != want {
			t.Errorf("databaseType(%q) = %q, %v; want %q", input, got, err, want)
		}
	}
	if got := postgresIdentifier(`a"b`); got != `"a""b"` {
		t.Fatalf("postgresIdentifier() = %q", got)
	}
}
