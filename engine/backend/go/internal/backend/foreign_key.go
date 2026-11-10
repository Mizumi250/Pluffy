package backend

import (
	"fmt"
	"sort"
	"strings"
)

// foreignKeyResolver turns a column's `foreign:` value into the table that
// exists inside a tatemono's isolated database. The Go backend creates tables
// with their declared names, so a reference may be written either as the
// declared table (employees.id) or with the tatemono prefix other backends use
// (queue_flow_queues.id). Both resolve to the declared table.
type foreignKeyResolver struct {
	prefix   string
	declared map[string]struct{}
}

func newForeignKeyResolver(module string, definitions []DatabaseDefinition) *foreignKeyResolver {
	declared := make(map[string]struct{}, len(definitions))
	for _, definition := range definitions {
		declared[definition.Table] = struct{}{}
	}
	return &foreignKeyResolver{
		prefix:   strings.ReplaceAll(module, "-", "_"),
		declared: declared,
	}
}

// resolve returns the referenced table and column. skip is true when there is
// nothing to constrain: no reference, or a reference to the built-in auth
// users table, which is created after the declared tables.
func (r *foreignKeyResolver) resolve(reference string) (table, column string, skip bool, err error) {
	reference = strings.TrimSpace(reference)
	if reference == "" {
		return "", "", true, nil
	}
	parts := strings.Split(reference, ".")
	if len(parts) > 2 || parts[0] == "" || (len(parts) == 2 && parts[1] == "") {
		return "", "", false, fmt.Errorf("invalid foreign key reference %q", reference)
	}
	table = parts[0]
	column = "id"
	if len(parts) == 2 {
		column = parts[1]
	}
	if !sqlNamePattern.MatchString(table) || !sqlNamePattern.MatchString(column) {
		return "", "", false, fmt.Errorf("invalid foreign key reference %q", reference)
	}
	if _, found := r.declared[table]; found {
		return table, column, false, nil
	}
	if stripped := strings.TrimPrefix(table, r.prefix+"_"); stripped != table {
		if _, found := r.declared[stripped]; found {
			return stripped, column, false, nil
		}
	}
	if table == "users" || table == r.prefix+"_users" {
		return "", "", true, nil
	}
	return "", "", false, fmt.Errorf("foreign key %q references unknown table %q", reference, table)
}

// clause returns the inline REFERENCES clause for a column, or "" when the
// column has no foreign key to create.
func (r *foreignKeyResolver) clause(column ColumnDefinition) (string, error) {
	if r == nil || strings.TrimSpace(column.Foreign) == "" {
		return "", nil
	}
	table, target, skip, err := r.resolve(column.Foreign)
	if err != nil {
		return "", err
	}
	if skip {
		return "", nil
	}
	action, err := foreignKeyAction(column.OnDelete)
	if err != nil {
		return "", err
	}
	return "REFERENCES " + quoteIdentifier(table) + " (" + quoteIdentifier(target) + ") ON DELETE " + action, nil
}

func foreignKeyAction(onDelete string) (string, error) {
	switch strings.ToLower(strings.TrimSpace(onDelete)) {
	case "", "cascade":
		return "CASCADE", nil
	case "restrict":
		return "RESTRICT", nil
	case "set null":
		return "SET NULL", nil
	case "no action":
		return "NO ACTION", nil
	default:
		return "", fmt.Errorf("unsupported foreign key onDelete action %q", onDelete)
	}
}

// orderDefinitionsByForeignKeys returns the definitions with every parent table
// before the tables that reference it, keeping the declared order otherwise.
// Circular references are an error, matching the other backends.
func orderDefinitionsByForeignKeys(resolver *foreignKeyResolver, definitions []DatabaseDefinition) ([]DatabaseDefinition, error) {
	if resolver == nil {
		return definitions, nil
	}
	index := make(map[string]int, len(definitions))
	for position, definition := range definitions {
		index[definition.Table] = position
	}

	const (
		unvisited = iota
		visiting
		done
	)
	state := make([]int, len(definitions))
	ordered := make([]DatabaseDefinition, 0, len(definitions))

	var visit func(position int) error
	visit = func(position int) error {
		switch state[position] {
		case done:
			return nil
		case visiting:
			return fmt.Errorf("circular foreign key dependency involving table %q", definitions[position].Table)
		}
		state[position] = visiting
		definition := definitions[position]

		names := make([]string, 0, len(definition.Columns))
		for name := range definition.Columns {
			names = append(names, name)
		}
		sort.Strings(names)

		for _, name := range names {
			table, _, skip, err := resolver.resolve(definition.Columns[name].Foreign)
			if err != nil {
				return fmt.Errorf("table %q column %q: %w", definition.Table, name, err)
			}
			if skip || table == definition.Table {
				continue
			}
			if parent, found := index[table]; found {
				if err := visit(parent); err != nil {
					return err
				}
			}
		}

		state[position] = done
		ordered = append(ordered, definition)
		return nil
	}

	for position := range definitions {
		if err := visit(position); err != nil {
			return nil, err
		}
	}
	return ordered, nil
}
