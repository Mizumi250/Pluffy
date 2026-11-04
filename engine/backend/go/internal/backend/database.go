package backend

import (
	"context"
	"database/sql"
	"database/sql/driver"
	"fmt"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/lib/pq"
)

type databaseDialect string

const (
	sqliteDialect   databaseDialect = "sqlite"
	postgresDialect databaseDialect = "postgres"
)

func configuredDialect() databaseDialect {
	switch strings.ToLower(strings.TrimSpace(envOr("ARKZEN_DB_DRIVER", "sqlite"))) {
	case "postgres", "postgresql", "pgsql":
		return postgresDialect
	default:
		return sqliteDialect
	}
}

func moduleDatabaseName(module string) string {
	prefix := strings.Trim(strings.TrimSpace(envOr("ARKZEN_DB_PREFIX", "")), "_")
	name := strings.ReplaceAll(module, "-", "_")
	if prefix == "" {
		return name
	}
	return prefix + "_" + name
}

func postgresConnectionString(databaseName string) string {
	host := envOr("DB_HOST", "127.0.0.1")
	port := envOr("DB_PORT", "5432")
	if _, err := strconv.Atoi(port); err != nil {
		port = "5432"
	}
	query := url.Values{}
	query.Set("sslmode", envOr("DB_SSLMODE", "prefer"))
	u := &url.URL{
		Scheme:   "postgres",
		User:     url.UserPassword(envOr("DB_USERNAME", ""), envOr("DB_PASSWORD", "")),
		Host:     net.JoinHostPort(host, port),
		Path:     "/" + databaseName,
		RawQuery: query.Encode(),
	}
	return u.String()
}

func postgresIdentifier(name string) string {
	return `"` + strings.ReplaceAll(name, `"`, `""`) + `"`
}

func ensurePostgresDatabase(module string) error {
	admin, err := sql.Open("arkzen-postgres", postgresConnectionString("postgres"))
	if err != nil {
		return err
	}
	defer admin.Close()
	if err := admin.Ping(); err != nil {
		return err
	}
	name := moduleDatabaseName(module)
	var exists bool
	if err := admin.QueryRow(`SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = ?)`, name).Scan(&exists); err != nil {
		return err
	}
	if exists {
		return nil
	}
	_, err = admin.Exec("CREATE DATABASE " + postgresIdentifier(name))
	return err
}

func removePostgresDatabase(module string) error {
	admin, err := sql.Open("arkzen-postgres", postgresConnectionString("postgres"))
	if err != nil {
		return err
	}
	defer admin.Close()
	if err := admin.Ping(); err != nil {
		return err
	}
	name := moduleDatabaseName(module)
	rows, err := admin.Query(`SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = ? AND pid <> pg_backend_pid()`, name)
	if err != nil {
		return err
	}
	if err := rows.Close(); err != nil {
		return err
	}
	_, err = admin.Exec("DROP DATABASE IF EXISTS " + postgresIdentifier(name))
	return err
}

func postgresPlaceholders(query string) string {
	var out strings.Builder
	out.Grow(len(query) + 8)
	parameter := 0
	var quote byte
	lineComment, blockComment := false, false
	for i := 0; i < len(query); i++ {
		char := query[i]
		if lineComment {
			out.WriteByte(char)
			if char == '\n' {
				lineComment = false
			}
			continue
		}
		if blockComment {
			out.WriteByte(char)
			if char == '*' && i+1 < len(query) && query[i+1] == '/' {
				out.WriteByte(query[i+1])
				i++
				blockComment = false
			}
			continue
		}
		if quote != 0 {
			out.WriteByte(char)
			if char == quote {
				if i+1 < len(query) && query[i+1] == quote {
					out.WriteByte(query[i+1])
					i++
				} else {
					quote = 0
				}
			} else if char == '\\' && quote == '\'' && i+1 < len(query) {
				out.WriteByte(query[i+1])
				i++
			}
			continue
		}
		if char == '-' && i+1 < len(query) && query[i+1] == '-' {
			out.WriteString("--")
			i++
			lineComment = true
			continue
		}
		if char == '/' && i+1 < len(query) && query[i+1] == '*' {
			out.WriteString("/*")
			i++
			blockComment = true
			continue
		}
		if char == '\'' || char == '"' {
			quote = char
			out.WriteByte(char)
			continue
		}
		if char == '?' {
			parameter++
			out.WriteByte('$')
			out.WriteString(strconv.Itoa(parameter))
			continue
		}
		out.WriteByte(char)
	}
	return out.String()
}

func init() {
	sql.Register("arkzen-postgres", placeholderDriver{driver: &pq.Driver{}})
}

type placeholderDriver struct{ driver driver.Driver }

func (d placeholderDriver) Open(name string) (driver.Conn, error) {
	conn, err := d.driver.Open(name)
	if err != nil {
		return nil, err
	}
	return placeholderConn{Conn: conn}, nil
}

type placeholderConn struct{ driver.Conn }

func (c placeholderConn) Prepare(query string) (driver.Stmt, error) {
	return c.Conn.Prepare(postgresPlaceholders(query))
}

func (c placeholderConn) PrepareContext(ctx context.Context, query string) (driver.Stmt, error) {
	if conn, ok := c.Conn.(driver.ConnPrepareContext); ok {
		return conn.PrepareContext(ctx, postgresPlaceholders(query))
	}
	return c.Prepare(query)
}

func (c placeholderConn) ExecContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Result, error) {
	conn, ok := c.Conn.(driver.ExecerContext)
	if !ok {
		return nil, driver.ErrSkip
	}
	return conn.ExecContext(ctx, postgresPlaceholders(query), args)
}

func (c placeholderConn) QueryContext(ctx context.Context, query string, args []driver.NamedValue) (driver.Rows, error) {
	conn, ok := c.Conn.(driver.QueryerContext)
	if !ok {
		return nil, driver.ErrSkip
	}
	return conn.QueryContext(ctx, postgresPlaceholders(query), args)
}

func (c placeholderConn) BeginTx(ctx context.Context, opts driver.TxOptions) (driver.Tx, error) {
	if conn, ok := c.Conn.(driver.ConnBeginTx); ok {
		return conn.BeginTx(ctx, opts)
	}
	if opts.Isolation != driver.IsolationLevel(0) || opts.ReadOnly {
		return nil, fmt.Errorf("postgres driver does not support requested transaction options")
	}
	return c.Conn.Begin()
}

func (c placeholderConn) Ping(ctx context.Context) error {
	if conn, ok := c.Conn.(driver.Pinger); ok {
		return conn.Ping(ctx)
	}
	return nil
}

func (c placeholderConn) CheckNamedValue(value *driver.NamedValue) error {
	if conn, ok := c.Conn.(driver.NamedValueChecker); ok {
		return conn.CheckNamedValue(value)
	}
	return driver.ErrSkip
}
