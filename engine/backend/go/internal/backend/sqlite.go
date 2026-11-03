package backend

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
	"time"

	_ "modernc.org/sqlite"
)

func ensureSQLiteSchema(storageDir, module string, definitions []DatabaseDefinition, auth bool, authSeed *AuthSeed) error {
	databaseDir := filepath.Join(storageDir, "databases")
	if err := os.MkdirAll(databaseDir, 0o755); err != nil {
		return fmt.Errorf("create database directory: %w", err)
	}
	filename := filepath.Join(databaseDir, module+".sqlite")
	db, err := sql.Open("sqlite", filename)
	if err != nil {
		return fmt.Errorf("open SQLite database: %w", err)
	}
	defer db.Close()
	if _, err := db.Exec("PRAGMA foreign_keys = ON"); err != nil {
		return fmt.Errorf("enable SQLite foreign keys: %w", err)
	}

	tx, err := db.Begin()
	if err != nil {
		return fmt.Errorf("begin schema transaction: %w", err)
	}
	committed := false
	defer func() {
		if !committed {
			_ = tx.Rollback()
		}
	}()

	for _, definition := range definitions {
		if err := ensureTable(tx, definition); err != nil {
			return fmt.Errorf("configure table %q: %w", definition.Table, err)
		}
		if definition.Seeder != nil && len(definition.Seeder.Data) > 0 {
			if err := seedTable(tx, definition); err != nil {
				return fmt.Errorf("seed table %q: %w", definition.Table, err)
			}
		}
	}
	if auth {
		if err := ensureAuthTables(tx); err != nil {
			return fmt.Errorf("configure auth tables: %w", err)
		}
		if err := seedAuthUsers(tx, authSeed); err != nil {
			return fmt.Errorf("seed auth users: %w", err)
		}
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit SQLite schema: %w", err)
	}
	committed = true
	return nil
}

func ensureAuthTables(tx *sql.Tx) error {
	_, err := tx.Exec(`CREATE TABLE IF NOT EXISTS "users" (
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"name" TEXT NOT NULL,
		"email" TEXT NOT NULL UNIQUE,
		"email_verified_at" TEXT NULL,
		"password" TEXT NOT NULL,
		"role" TEXT NOT NULL DEFAULT 'user',
		"remember_token" TEXT NULL,
		"created_at" TEXT NULL,
		"updated_at" TEXT NULL
	)`)
	if err != nil {
		return err
	}
	for _, column := range []struct {
		name string
		kind string
	}{
		{name: "email_verified_at", kind: "TEXT NULL"},
		{name: "remember_token", kind: "TEXT NULL"},
	} {
		var count int
		if err := tx.QueryRow(`SELECT COUNT(*) FROM pragma_table_info('users') WHERE name = ?`, column.name).Scan(&count); err != nil {
			return fmt.Errorf("inspect auth user column %q: %w", column.name, err)
		}
		if count == 0 {
			if _, err := tx.Exec(`ALTER TABLE "users" ADD COLUMN ` + quoteIdentifier(column.name) + " " + column.kind); err != nil {
				return fmt.Errorf("add auth user column %q: %w", column.name, err)
			}
		}
	}
	_, err = tx.Exec(`CREATE TABLE IF NOT EXISTS "personal_access_tokens" (
		"id" INTEGER PRIMARY KEY AUTOINCREMENT,
		"tokenable_type" TEXT NOT NULL,
		"tokenable_id" INTEGER NOT NULL,
		"name" TEXT NOT NULL,
		"token" TEXT NOT NULL UNIQUE,
		"abilities" TEXT NULL,
		"last_used_at" TEXT NULL,
		"expires_at" TEXT NULL,
		"created_at" TEXT NULL,
		"updated_at" TEXT NULL
	)`)
	return err
}

func seedAuthUsers(tx *sql.Tx, seed *AuthSeed) error {
	if seed == nil {
		return nil
	}
	for index, user := range seed.Users {
		if strings.TrimSpace(user.Email) == "" {
			continue
		}
		seedPassword := user.Password
		if seedPassword == "" {
			seedPassword = "password"
		}
		password, err := hashPassword(seedPassword)
		if err != nil {
			return fmt.Errorf("hash seeded user %d password: %w", index+1, err)
		}
		name := user.Name
		if name == "" {
			name = user.Email
		}
		role := user.Role
		if role == "" {
			role = "user"
		}
		now := time.Now().UTC().Format(time.RFC3339Nano)
		_, err = tx.Exec(`INSERT INTO "users" ("name","email","password","role","created_at","updated_at")
			VALUES (?,?,?,?,?,?)
			ON CONFLICT("email") DO UPDATE SET "name"=excluded."name","password"=excluded."password","role"=excluded."role","updated_at"=excluded."updated_at"`,
			name, user.Email, password, role, now, now)
		if err != nil {
			return fmt.Errorf("seed user %q: %w", user.Email, err)
		}
	}
	return nil
}

func seedTable(tx *sql.Tx, definition DatabaseDefinition) error {
	table := quoteIdentifier(definition.Table)
	if _, err := tx.Exec("DELETE FROM " + table); err != nil {
		return err
	}

	var sequenceTable string
	if err := tx.QueryRow("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'sqlite_sequence'").Scan(&sequenceTable); err == nil {
		if _, err := tx.Exec("DELETE FROM sqlite_sequence WHERE name = ?", definition.Table); err != nil {
			return fmt.Errorf("reset auto-increment sequence: %w", err)
		}
	} else if err != sql.ErrNoRows {
		return fmt.Errorf("inspect auto-increment sequence: %w", err)
	}

	timestamp := time.Now().UTC().Format(time.RFC3339Nano)
	for rowIndex, seed := range definition.Seeder.Data {
		values := make(map[string]any, len(seed)+2)
		for name, raw := range seed {
			value, err := seedValue(raw)
			if err != nil {
				return fmt.Errorf("row %d column %q: %w", rowIndex+1, name, err)
			}
			values[name] = value
		}
		if definition.Timestamps == nil || *definition.Timestamps {
			if _, exists := values["created_at"]; !exists {
				values["created_at"] = timestamp
			}
			if _, exists := values["updated_at"]; !exists {
				values["updated_at"] = timestamp
			}
		}

		names := make([]string, 0, len(values))
		for name := range values {
			names = append(names, name)
		}
		sort.Strings(names)

		query := "INSERT INTO " + table
		if len(names) == 0 {
			query += " DEFAULT VALUES"
		} else {
			columns := make([]string, len(names))
			placeholders := make([]string, len(names))
			args := make([]any, len(names))
			for index, name := range names {
				columns[index] = quoteIdentifier(name)
				placeholders[index] = "?"
				args[index] = values[name]
			}
			query += " (" + strings.Join(columns, ", ") + ") VALUES (" + strings.Join(placeholders, ", ") + ")"
			if _, err := tx.Exec(query, args...); err != nil {
				return fmt.Errorf("insert row %d: %w", rowIndex+1, err)
			}
			continue
		}
		if _, err := tx.Exec(query); err != nil {
			return fmt.Errorf("insert row %d: %w", rowIndex+1, err)
		}
	}
	return nil
}

func seedValue(raw json.RawMessage) (any, error) {
	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return nil, err
	}
	switch typed := value.(type) {
	case nil, string, bool:
		return typed, nil
	case float64:
		return typed, nil
	default:
		return nil, fmt.Errorf("seed value must be a scalar")
	}
}

func ensureTable(tx *sql.Tx, definition DatabaseDefinition) error {
	columns := make(map[string]ColumnDefinition, len(definition.Columns)+3)
	for name, column := range definition.Columns {
		columns[name] = column
	}
	hasPrimary := false
	for _, column := range columns {
		if column.Primary {
			hasPrimary = true
			break
		}
	}
	if !hasPrimary {
		if id, hasID := columns["id"]; hasID {
			id.Primary = true
			if id.AutoIncrement == nil {
				autoIncrement := true
				id.AutoIncrement = &autoIncrement
			}
			columns["id"] = id
		} else {
			autoIncrement := true
			columns["id"] = ColumnDefinition{Type: "integer", Primary: true, AutoIncrement: &autoIncrement}
		}
	}
	if definition.Timestamps == nil || *definition.Timestamps {
		for _, name := range []string{"created_at", "updated_at"} {
			if _, exists := columns[name]; !exists {
				columns[name] = ColumnDefinition{Type: "datetime", Nullable: boolPointer(true)}
			}
		}
	}
	if definition.SoftDeletes {
		if _, exists := columns["deleted_at"]; !exists {
			columns["deleted_at"] = ColumnDefinition{Type: "datetime", Nullable: boolPointer(true)}
		}
	}

	names := make([]string, 0, len(columns))
	for name := range columns {
		names = append(names, name)
	}
	// SQLite accepts any column order; sorting keeps migration output stable.
	sort.Strings(names)

	parts := make([]string, 0, len(names))
	for _, name := range names {
		column := columns[name]
		kind, err := sqliteType(column.Type)
		if err != nil {
			return err
		}
		part := quoteIdentifier(name) + " " + kind
		autoIncrement := column.AutoIncrement == nil || *column.AutoIncrement
		if column.Primary {
			part += " PRIMARY KEY"
			if autoIncrement && kind == "INTEGER" {
				part += " AUTOINCREMENT"
			}
		}
		if column.Nullable != nil && !*column.Nullable && !column.Primary {
			part += " NOT NULL"
		}
		if column.Unique && !column.Primary {
			part += " UNIQUE"
		}
		if len(column.Default) > 0 {
			value, err := sqliteDefault(column.Default)
			if err != nil {
				return fmt.Errorf("invalid default for column %q: %w", name, err)
			}
			part += " DEFAULT " + value
		}
		parts = append(parts, part)
	}

	table := quoteIdentifier(definition.Table)
	if _, err := tx.Exec("CREATE TABLE IF NOT EXISTS " + table + " (" + strings.Join(parts, ", ") + ")"); err != nil {
		return err
	}

	rows, err := tx.Query("PRAGMA table_info(" + table + ")")
	if err != nil {
		return fmt.Errorf("inspect existing table: %w", err)
	}
	existing := make(map[string]struct{})
	for rows.Next() {
		var cid, notNull, primaryKey int
		var name, dataType string
		var defaultValue any
		if err := rows.Scan(&cid, &name, &dataType, &notNull, &defaultValue, &primaryKey); err != nil {
			_ = rows.Close()
			return fmt.Errorf("read existing table columns: %w", err)
		}
		existing[name] = struct{}{}
	}
	if err := rows.Err(); err != nil {
		_ = rows.Close()
		return fmt.Errorf("read existing table columns: %w", err)
	}
	if err := rows.Close(); err != nil {
		return fmt.Errorf("close table inspection: %w", err)
	}
	for _, name := range names {
		if _, found := existing[name]; found {
			continue
		}
		column := columns[name]
		kind, _ := sqliteType(column.Type)
		statement := "ALTER TABLE " + table + " ADD COLUMN " + quoteIdentifier(name) + " " + kind
		if len(column.Default) > 0 {
			value, err := sqliteDefault(column.Default)
			if err != nil {
				return fmt.Errorf("invalid default for column %q: %w", name, err)
			}
			statement += " DEFAULT " + value
		}
		if _, err := tx.Exec(statement); err != nil {
			return fmt.Errorf("add column %q: %w", name, err)
		}
	}
	return nil
}

func sqliteType(input string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(input)) {
	case "", "string", "text", "longtext", "varchar", "uuid":
		return "TEXT", nil
	case "integer", "int", "biginteger", "foreignid":
		return "INTEGER", nil
	case "boolean", "bool":
		return "INTEGER", nil
	case "float", "double", "decimal", "numeric":
		return "REAL", nil
	case "date", "datetime", "timestamp", "json":
		return "TEXT", nil
	case "blob", "binary":
		return "BLOB", nil
	default:
		return "", fmt.Errorf("unsupported SQLite type %q", input)
	}
}

func boolPointer(value bool) *bool {
	return &value
}

func sqliteDefault(raw json.RawMessage) (string, error) {
	var value any
	if err := json.Unmarshal(raw, &value); err != nil {
		return "", err
	}
	switch typed := value.(type) {
	case nil:
		return "NULL", nil
	case bool:
		if typed {
			return "1", nil
		}
		return "0", nil
	case float64:
		return fmt.Sprintf("%v", typed), nil
	case string:
		return "'" + strings.ReplaceAll(typed, "'", "''") + "'", nil
	default:
		return "", fmt.Errorf("default must be a scalar")
	}
}

func quoteIdentifier(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}
