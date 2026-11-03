package backend

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	_ "modernc.org/sqlite"
)

func ensureSQLiteSchema(storageDir, module string, definitions []DatabaseDefinition) error {
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
	}
	if err := tx.Commit(); err != nil {
		return fmt.Errorf("commit SQLite schema: %w", err)
	}
	committed = true
	return nil
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
