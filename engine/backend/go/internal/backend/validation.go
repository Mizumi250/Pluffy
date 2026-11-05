package backend

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"math"
	"net"
	"net/http"
	"net/url"
	"reflect"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"
)

// validation.go implements Laravel's validation rule strings
// ("required|string|max:255") for the Go engine. Laravel is the reference
// backend, so the behavior and messages here follow Laravel and the Express
// engine (engine/backend/express/src/runtime/validation.ts):
//
//   - failures answer 422 {"message": "<first error> (and N more errors)",
//     "errors": {"field": ["The field ..."]}}
//   - only keys that have rules are kept (like Laravel's validated())
//   - unknown or protected keys are ignored, never rejected
//
// Rules that need uploaded files (file, image, mimes, mimetypes) are no-ops
// because the Go CRUD routes only receive JSON bodies.

// validationErrors collects messages per field and remembers the order the
// fields first failed in so the summary line is deterministic.
type validationErrors struct {
	order    []string
	messages map[string][]string
}

func newValidationErrors() *validationErrors {
	return &validationErrors{messages: map[string][]string{}}
}

func (v *validationErrors) add(key, message string) {
	if _, seen := v.messages[key]; !seen {
		v.order = append(v.order, key)
	}
	v.messages[key] = append(v.messages[key], message)
}

func (v *validationErrors) any() bool {
	return v != nil && len(v.messages) > 0
}

// summary mirrors Laravel's ValidationException message.
func (v *validationErrors) summary() string {
	var all []string
	for _, key := range v.order {
		all = append(all, v.messages[key]...)
	}
	if len(all) == 0 {
		return "The given data was invalid."
	}
	if extra := len(all) - 1; extra > 0 {
		suffix := "s"
		if extra == 1 {
			suffix = ""
		}
		return fmt.Sprintf("%s (and %d more error%s)", all[0], extra, suffix)
	}
	return all[0]
}

// writeValidationErrors answers with Laravel's 422 JSON shape.
func writeValidationErrors(w http.ResponseWriter, errs *validationErrors) {
	writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
		"message": errs.summary(),
		"errors":  errs.messages,
	})
}

// validationLookup answers unique/exists questions against the module
// database. kind is "unique" or "exists". found reports whether a row
// matches; ignoreColumn/ignoreValue exclude one row (unique:...,ignore,idCol).
type validationLookup func(kind, table, column string, value any, ignoreColumn, ignoreValue string) (found bool, err error)

var validationMessages = map[string]string{
	"required":          "The :attribute field is required.",
	"present":           "The :attribute field must be present.",
	"prohibited":        "The :attribute field is prohibited.",
	"string":            "The :attribute field must be a string.",
	"integer":           "The :attribute field must be an integer.",
	"numeric":           "The :attribute field must be a number.",
	"boolean":           "The :attribute field must be true or false.",
	"email":             "The :attribute field must be a valid email address.",
	"url":               "The :attribute field must be a valid URL.",
	"array":             "The :attribute field must be an array.",
	"date":              "The :attribute field must be a valid date.",
	"json":              "The :attribute field must be a valid JSON string.",
	"uuid":              "The :attribute field must be a valid UUID.",
	"alpha":             "The :attribute field must only contain letters.",
	"alpha_num":         "The :attribute field must only contain letters and numbers.",
	"alpha_dash":        "The :attribute field must only contain letters, numbers, dashes, and underscores.",
	"in":                "The selected :attribute is invalid.",
	"not_in":            "The selected :attribute is invalid.",
	"exists":            "The selected :attribute is invalid.",
	"unique":            "The :attribute has already been taken.",
	"regex":             "The :attribute field format is invalid.",
	"not_regex":         "The :attribute field format is invalid.",
	"confirmed":         "The :attribute field confirmation does not match.",
	"same":              "The :attribute field and :other must match.",
	"different":         "The :attribute field and :other must be different.",
	"accepted":          "The :attribute field must be accepted.",
	"declined":          "The :attribute field must be declined.",
	"filled":            "The :attribute field must have a value.",
	"digits":            "The :attribute field must be :digits digits.",
	"ip":                "The :attribute field must be a valid IP address.",
	"ipv4":              "The :attribute field must be a valid IPv4 address.",
	"ipv6":              "The :attribute field must be a valid IPv6 address.",
	"distinct":          "The :attribute field has a duplicate value.",
	"lowercase":         "The :attribute field must be lowercase.",
	"uppercase":         "The :attribute field must be uppercase.",
	"starts_with":       "The :attribute field must start with one of the following: :values.",
	"ends_with":         "The :attribute field must end with one of the following: :values.",
	"doesnt_start_with": "The :attribute field must not start with one of the following: :values.",
	"doesnt_end_with":   "The :attribute field must not end with one of the following: :values.",
	"decimal":           "The :attribute field must have the specified number of decimal places.",
}

// rulesWithoutChecks are handled by the presence logic, not by checkRule.
var rulesWithoutChecks = map[string]bool{
	"required": true, "nullable": true, "sometimes": true, "bail": true, "filled": true,
	"present": true, "required_if": true, "required_unless": true, "required_with": true,
	"required_with_all": true, "required_without": true, "required_without_all": true,
	"prohibited": true, "prohibited_if": true, "prohibited_unless": true,
}

var (
	emailPattern = regexp.MustCompile(`^[^\s@]+@[^\s@]+\.[^\s@]+$`)
	uuidPattern  = regexp.MustCompile(`(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$`)
	alphaPattern = regexp.MustCompile(`^[A-Za-z]+$`)
	alnumPattern = regexp.MustCompile(`^[A-Za-z0-9]+$`)
	dashPattern  = regexp.MustCompile(`^[A-Za-z0-9_-]+$`)
	intPattern   = regexp.MustCompile(`^-?\d+$`)
	regexLiteral = regexp.MustCompile(`(?s)^/(.*)/([a-z]*)$`)
	dateLayouts  = []string{time.RFC3339, time.RFC3339Nano, "2006-01-02", "2006-01-02 15:04:05", "2006-01-02T15:04:05", "2006-01-02 15:04", "01/02/2006", "January 2, 2006"}
)

type parsedRule struct {
	name   string
	params []string
}

func parseRules(spec string) []parsedRule {
	var parsed []parsedRule
	for _, raw := range strings.Split(spec, "|") {
		raw = strings.TrimSpace(raw)
		if raw == "" {
			continue
		}
		if index := strings.Index(raw, ":"); index >= 0 {
			parsed = append(parsed, parsedRule{name: raw[:index], params: strings.Split(raw[index+1:], ",")})
		} else {
			parsed = append(parsed, parsedRule{name: raw})
		}
	}
	return parsed
}

func ruleNames(parsed []parsedRule) map[string]bool {
	names := map[string]bool{}
	for _, rule := range parsed {
		names[rule.name] = true
	}
	return names
}

func attributeName(key string) string {
	key = strings.ReplaceAll(key, ".*", "")
	key = strings.ReplaceAll(key, "_", " ")
	return strings.ReplaceAll(key, ".", " ")
}

func isEmptyValue(value any) bool {
	switch typed := value.(type) {
	case nil:
		return true
	case string:
		return strings.TrimSpace(typed) == ""
	case []any:
		return len(typed) == 0
	}
	return false
}

// lookupPath walks dotted keys through maps and slices. found is false when
// any segment is missing, which is how "not sent" differs from an explicit null.
func lookupPath(data any, path string) (value any, found bool) {
	current := data
	for _, segment := range strings.Split(path, ".") {
		switch typed := current.(type) {
		case map[string]any:
			next, exists := typed[segment]
			if !exists {
				return nil, false
			}
			current = next
		case []any:
			index, err := strconv.Atoi(segment)
			if err != nil || index < 0 || index >= len(typed) {
				return nil, false
			}
			current = typed[index]
		default:
			return nil, false
		}
	}
	return current, true
}

// expandRules turns wildcard keys ("items.*.name") into concrete keys for the
// data that was actually sent.
func expandRules(rules map[string]string, data map[string]any) (keys []string, specs map[string]string) {
	specs = map[string]string{}
	names := make([]string, 0, len(rules))
	for key := range rules {
		names = append(names, key)
	}
	sort.Strings(names)
	for _, key := range names {
		if !strings.Contains(key, "*") {
			keys = append(keys, key)
			specs[key] = rules[key]
			continue
		}
		var walk func(prefix string, rest []string, current any)
		walk = func(prefix string, rest []string, current any) {
			if len(rest) == 0 {
				keys = append(keys, prefix)
				specs[prefix] = rules[key]
				return
			}
			head, tail := rest[0], rest[1:]
			join := func(segment string) string {
				if prefix == "" {
					return segment
				}
				return prefix + "." + segment
			}
			if head == "*" {
				if list, ok := current.([]any); ok {
					for index, item := range list {
						walk(join(strconv.Itoa(index)), tail, item)
					}
				}
				return
			}
			var next any
			if object, ok := current.(map[string]any); ok {
				next = object[head]
			}
			walk(join(head), tail, next)
		}
		walk("", strings.Split(key, "."), data)
	}
	return keys, specs
}

func toNumber(value any) (float64, bool) {
	switch typed := value.(type) {
	case float64:
		return typed, true
	case float32:
		return float64(typed), true
	case int:
		return float64(typed), true
	case int64:
		return float64(typed), true
	case json.Number:
		number, err := typed.Float64()
		return number, err == nil
	}
	return 0, false
}

// toNumeric also accepts numeric strings, like PHP's is_numeric.
func toNumeric(value any) (float64, bool) {
	if number, ok := toNumber(value); ok {
		return number, true
	}
	if text, ok := value.(string); ok {
		trimmed := strings.TrimSpace(text)
		if trimmed == "" {
			return 0, false
		}
		number, err := strconv.ParseFloat(trimmed, 64)
		return number, err == nil && !math.IsNaN(number)
	}
	return 0, false
}

func sizeOf(value any, numeric bool) float64 {
	if number, ok := toNumber(value); ok {
		return number
	}
	if numeric {
		if number, ok := toNumeric(value); ok {
			return number
		}
	}
	switch typed := value.(type) {
	case []any:
		return float64(len(typed))
	case map[string]any:
		return float64(len(typed))
	case string:
		return float64(utf8.RuneCountInString(typed))
	case nil:
		return 0
	}
	return float64(utf8.RuneCountInString(fmt.Sprint(value)))
}

func sizeMessage(rule string, value any, numeric bool, key string, params []string) string {
	kind := "string"
	switch {
	case isSlice(value):
		kind = "array"
	case isNumberValue(value) || numeric:
		kind = "numeric"
	}
	unit := map[string]string{"numeric": "", "string": " characters", "array": " items"}[kind]
	attribute := attributeName(key)
	first := ""
	if len(params) > 0 {
		first = params[0]
	}
	switch rule {
	case "min":
		return fmt.Sprintf("The %s field must be at least %s%s.", attribute, first, unit)
	case "max":
		return fmt.Sprintf("The %s field must not be greater than %s%s.", attribute, first, unit)
	case "size":
		return fmt.Sprintf("The %s field must be %s%s.", attribute, first, unit)
	case "between":
		second := ""
		if len(params) > 1 {
			second = params[1]
		}
		return fmt.Sprintf("The %s field must be between %s and %s%s.", attribute, first, second, unit)
	}
	return ""
}

func isSlice(value any) bool {
	_, ok := value.([]any)
	return ok
}

func isNumberValue(value any) bool {
	_, ok := toNumber(value)
	return ok
}

func failureMessage(rule, key string) string {
	template, known := validationMessages[rule]
	if !known {
		template = "The :attribute field is invalid."
	}
	return strings.Replace(template, ":attribute", attributeName(key), 1)
}

func valuesEqual(left, right any) bool {
	if reflect.DeepEqual(left, right) {
		return true
	}
	leftNumber, leftOK := toNumber(left)
	rightNumber, rightOK := toNumber(right)
	return leftOK && rightOK && leftNumber == rightNumber
}

func parseRegexLiteral(params []string) (*regexp.Regexp, bool) {
	match := regexLiteral.FindStringSubmatch(strings.Join(params, ","))
	if match == nil {
		return nil, false
	}
	pattern := match[1]
	var flags string
	for _, flag := range match[2] {
		if flag == 'i' || flag == 'm' || flag == 's' {
			flags += string(flag)
		}
	}
	if flags != "" {
		pattern = "(?" + flags + ")" + pattern
	}
	compiled, err := regexp.Compile(pattern)
	if err != nil {
		return nil, false
	}
	return compiled, true
}

func parseDate(text string) bool {
	text = strings.TrimSpace(text)
	for _, layout := range dateLayouts {
		if _, err := time.Parse(layout, text); err == nil {
			return true
		}
	}
	return false
}

// checkRule returns a failure message, or "" when the value passes.
func checkRule(rule parsedRule, value any, key string, data map[string]any, numeric bool, lookup validationLookup, lookupErr *error) string {
	fail := func() string { return failureMessage(rule.name, key) }
	text := fmt.Sprint(value)
	params := rule.params
	param := func(index int) string {
		if index < len(params) {
			return params[index]
		}
		return ""
	}

	switch rule.name {
	case "string":
		if _, ok := value.(string); ok {
			return ""
		}
		return fail()
	case "integer":
		if number, ok := toNumber(value); ok {
			if number == math.Trunc(number) && !math.IsInf(number, 0) {
				return ""
			}
			return fail()
		}
		if str, ok := value.(string); ok && intPattern.MatchString(str) {
			return ""
		}
		return fail()
	case "numeric":
		if _, ok := value.(bool); ok {
			return fail()
		}
		if _, ok := toNumeric(value); ok {
			return ""
		}
		return fail()
	case "boolean":
		switch typed := value.(type) {
		case bool:
			return ""
		case float64:
			if typed == 0 || typed == 1 {
				return ""
			}
		case string:
			switch typed {
			case "1", "0", "true", "false":
				return ""
			}
		}
		return fail()
	case "accepted":
		switch typed := value.(type) {
		case bool:
			if typed {
				return ""
			}
		case float64:
			if typed == 1 {
				return ""
			}
		case string:
			switch typed {
			case "yes", "on", "1", "true":
				return ""
			}
		}
		return fail()
	case "declined":
		switch typed := value.(type) {
		case bool:
			if !typed {
				return ""
			}
		case float64:
			if typed == 0 {
				return ""
			}
		case string:
			switch typed {
			case "no", "off", "0", "false":
				return ""
			}
		}
		return fail()
	case "email":
		if emailPattern.MatchString(text) {
			return ""
		}
		return fail()
	case "url":
		if parsed, err := url.Parse(text); err == nil && parsed.Scheme != "" && parsed.Host != "" {
			return ""
		}
		return fail()
	case "array":
		switch value.(type) {
		case []any, map[string]any:
			return ""
		}
		return fail()
	case "date":
		if _, isString := value.(string); isString && parseDate(text) {
			return ""
		}
		return fail()
	case "json":
		if json.Valid([]byte(text)) {
			return ""
		}
		return fail()
	case "uuid":
		if uuidPattern.MatchString(text) {
			return ""
		}
		return fail()
	case "alpha":
		if alphaPattern.MatchString(text) {
			return ""
		}
		return fail()
	case "alpha_num":
		if alnumPattern.MatchString(text) {
			return ""
		}
		return fail()
	case "alpha_dash":
		if dashPattern.MatchString(text) {
			return ""
		}
		return fail()
	case "ip", "ipv4", "ipv6":
		address := net.ParseIP(text)
		switch {
		case address == nil:
			return fail()
		case rule.name == "ipv4" && !(address.To4() != nil && !strings.Contains(text, ":")):
			return fail()
		case rule.name == "ipv6" && !strings.Contains(text, ":"):
			return fail()
		}
		return ""
	case "lowercase":
		if text == strings.ToLower(text) {
			return ""
		}
		return fail()
	case "uppercase":
		if text == strings.ToUpper(text) {
			return ""
		}
		return fail()
	case "starts_with", "ends_with", "doesnt_start_with", "doesnt_end_with":
		matches := false
		for _, candidate := range params {
			switch rule.name {
			case "starts_with", "doesnt_start_with":
				if strings.HasPrefix(text, candidate) {
					matches = true
				}
			default:
				if strings.HasSuffix(text, candidate) {
					matches = true
				}
			}
		}
		if strings.HasPrefix(rule.name, "doesnt_") {
			matches = !matches
		}
		if matches {
			return ""
		}
		return strings.Replace(fail(), ":values", strings.Join(params, ", "), 1)
	case "decimal":
		if _, ok := toNumeric(value); !ok {
			return fail()
		}
		places := 0
		if dot := strings.Index(text, "."); dot >= 0 {
			places = len(text) - dot - 1
		}
		minimum, _ := strconv.Atoi(param(0))
		if places < minimum {
			return fail()
		}
		if len(params) > 1 {
			if maximum, err := strconv.Atoi(params[1]); err == nil && places > maximum {
				return fail()
			}
		}
		return ""
	case "digits":
		count, _ := strconv.Atoi(param(0))
		if matched, _ := regexp.MatchString(fmt.Sprintf(`^\d{%d}$`, count), text); matched {
			return ""
		}
		return strings.Replace(fail(), ":digits", param(0), 1)
	case "min", "max", "size", "between":
		limit, err := strconv.ParseFloat(param(0), 64)
		if err != nil {
			return ""
		}
		size := sizeOf(value, numeric)
		ok := false
		switch rule.name {
		case "min":
			ok = size >= limit
		case "max":
			ok = size <= limit
		case "size":
			ok = size == limit
		case "between":
			upper, upperErr := strconv.ParseFloat(param(1), 64)
			ok = upperErr != nil || (size >= limit && size <= upper)
		}
		if ok {
			return ""
		}
		return sizeMessage(rule.name, value, numeric, key, params)
	case "gt", "gte", "lt", "lte":
		other, otherOK := toNumeric(param(0))
		if !otherOK {
			if referenced, found := lookupPath(data, param(0)); found {
				other, _ = toNumeric(referenced)
			}
		}
		number, _ := toNumeric(value)
		ok := false
		switch rule.name {
		case "gt":
			ok = number > other
		case "gte":
			ok = number >= other
		case "lt":
			ok = number < other
		case "lte":
			ok = number <= other
		}
		if ok {
			return ""
		}
		words := map[string]string{"gt": "greater than", "gte": "greater than or equal to", "lt": "less than", "lte": "less than or equal to"}
		return fmt.Sprintf("The %s field must be %s %s.", attributeName(key), words[rule.name], param(0))
	case "in", "not_in":
		listed := false
		for _, option := range params {
			if option == text {
				listed = true
			}
		}
		if listed == (rule.name == "in") {
			return ""
		}
		return fail()
	case "regex", "not_regex":
		compiled, ok := parseRegexLiteral(params)
		if !ok {
			return fail()
		}
		if compiled.MatchString(text) == (rule.name == "regex") {
			return ""
		}
		return fail()
	case "distinct":
		parts := strings.Split(key, ".")
		index := -1
		for position, part := range parts {
			if intPattern.MatchString(part) {
				index = position
			}
		}
		if index == -1 {
			return ""
		}
		siblings, found := lookupPath(data, strings.Join(parts[:index], "."))
		list, isList := siblings.([]any)
		if !found || !isList {
			return ""
		}
		field := strings.Join(parts[index+1:], ".")
		canonical := func(item any) any {
			if param(0) == "ignore_case" {
				if str, ok := item.(string); ok {
					return strings.ToLower(str)
				}
			}
			return item
		}
		matches := 0
		for _, item := range list {
			candidate := item
			if field != "" {
				candidate, _ = lookupPath(item, field)
			}
			if valuesEqual(canonical(candidate), canonical(value)) {
				matches++
			}
		}
		if matches > 1 {
			return fail()
		}
		return ""
	case "confirmed":
		confirmation, found := lookupPath(data, key+"_confirmation")
		if found && valuesEqual(value, confirmation) {
			return ""
		}
		return fail()
	case "same", "different":
		other, _ := lookupPath(data, param(0))
		if valuesEqual(value, other) == (rule.name == "same") {
			return ""
		}
		return strings.Replace(fail(), ":other", param(0), 1)
	case "unique":
		if lookup == nil {
			return ""
		}
		table := param(0)
		column := param(1)
		if column == "" {
			parts := strings.Split(key, ".")
			column = parts[len(parts)-1]
		}
		ignoreValue := ""
		if ignored := param(2); ignored != "" && ignored != "NULL" {
			ignoreValue = ignored
		}
		idColumn := param(3)
		if idColumn == "" {
			idColumn = "id"
		}
		found, err := lookup("unique", table, column, value, idColumn, ignoreValue)
		if err != nil {
			*lookupErr = err
			return ""
		}
		if found {
			return fail()
		}
		return ""
	case "exists":
		if lookup == nil {
			return ""
		}
		table := param(0)
		column := param(1)
		if column == "" {
			parts := strings.Split(key, ".")
			column = parts[len(parts)-1]
		}
		found, err := lookup("exists", table, column, value, "", "")
		if err != nil {
			*lookupErr = err
			return ""
		}
		if found {
			return ""
		}
		return fail()
	}
	// Unknown rules and the upload rules (file, image, mimes, mimetypes) pass.
	return ""
}

// validateRules runs Laravel rule strings against data. The returned errors
// are empty when the data is valid. lookupErr is set when a unique/exists
// query itself failed, which callers should surface as a 500.
func validateRules(data map[string]any, rules map[string]string, lookup validationLookup) (errs *validationErrors, lookupErr error) {
	errs = newValidationErrors()
	keys, specs := expandRules(rules, data)

	for _, key := range keys {
		parsed := parseRules(specs[key])
		names := ruleNames(parsed)
		value, sent := lookupPath(data, key)

		if names["sometimes"] && !sent {
			continue
		}

		missing := isEmptyValue(value)
		find := func(name string) (parsedRule, bool) {
			for _, rule := range parsed {
				if rule.name == name {
					return rule, true
				}
			}
			return parsedRule{}, false
		}
		dependencyIs := func(rule parsedRule) bool {
			if len(rule.params) < 2 {
				return false
			}
			other, _ := lookupPath(data, rule.params[0])
			for _, expected := range rule.params[1:] {
				if fmt.Sprint(other) == expected {
					return true
				}
			}
			return false
		}
		presence := func(rule parsedRule) []bool {
			result := make([]bool, len(rule.params))
			for index, field := range rule.params {
				other, _ := lookupPath(data, field)
				result[index] = !isEmptyValue(other)
			}
			return result
		}
		anyOf := func(flags []bool, want bool) bool {
			for _, flag := range flags {
				if flag == want {
					return true
				}
			}
			return false
		}
		allOf := func(flags []bool, want bool) bool {
			for _, flag := range flags {
				if flag != want {
					return false
				}
			}
			return true
		}

		mustHave := names["required"]
		if rule, ok := find("required_if"); ok && dependencyIs(rule) {
			mustHave = true
		}
		if rule, ok := find("required_unless"); ok && !dependencyIs(rule) {
			mustHave = true
		}
		if rule, ok := find("required_with"); ok && anyOf(presence(rule), true) {
			mustHave = true
		}
		if rule, ok := find("required_with_all"); ok && allOf(presence(rule), true) {
			mustHave = true
		}
		if rule, ok := find("required_without"); ok && anyOf(presence(rule), false) {
			mustHave = true
		}
		if rule, ok := find("required_without_all"); ok && allOf(presence(rule), false) {
			mustHave = true
		}
		acceptedIf := false
		if rule, ok := find("accepted_if"); ok && dependencyIs(rule) {
			mustHave = true
			acceptedIf = true
		}

		prohibited := names["prohibited"]
		if rule, ok := find("prohibited_if"); ok && dependencyIs(rule) {
			prohibited = true
		}
		if rule, ok := find("prohibited_unless"); ok && !dependencyIs(rule) {
			prohibited = true
		}

		if names["present"] && !sent {
			errs.add(key, failureMessage("present", key))
			continue
		}
		if prohibited && !missing {
			errs.add(key, failureMessage("prohibited", key))
			continue
		}
		if missing {
			if mustHave {
				errs.add(key, failureMessage("required", key))
			} else if names["filled"] && sent {
				errs.add(key, failureMessage("filled", key))
			}
			continue
		}

		numeric := names["numeric"] || names["integer"]
		for _, rule := range parsed {
			if rulesWithoutChecks[rule.name] {
				continue
			}
			effective := rule
			if rule.name == "accepted_if" {
				if !acceptedIf {
					continue
				}
				effective = parsedRule{name: "accepted"}
			}
			var queryErr error
			message := checkRule(effective, value, key, data, numeric, lookup, &queryErr)
			if queryErr != nil {
				return errs, queryErr
			}
			if message != "" {
				errs.add(key, message)
				if names["bail"] {
					break
				}
			}
		}
	}
	return errs, nil
}

// protectedColumns can never be mass-assigned from a request body.
func protectedColumn(name, primary string) bool {
	return name == primary || name == "id" || name == "created_at" || name == "updated_at" || name == "deleted_at"
}

// validatedInput mirrors Laravel's validated(): it keeps only keys that have
// rules (or, when an endpoint declares no rules, every writable column) and
// that exist as table columns. Everything else is dropped silently.
func validatedInput(input map[string]any, rules map[string]string, columns map[string]struct{}, primary string) map[string]any {
	declared := map[string]bool{}
	for key := range rules {
		declared[strings.SplitN(key, ".", 2)[0]] = true
	}
	kept := map[string]any{}
	for name, value := range input {
		if _, exists := columns[name]; !exists || protectedColumn(name, primary) {
			continue
		}
		if len(declared) > 0 && !declared[name] {
			continue
		}
		kept[name] = value
	}
	return kept
}

// validateCRUDInput validates a store/update body against the endpoint rules
// and returns the writable fields. exceptID is the record being updated, so a
// unique rule does not collide with itself.
func validateCRUDInput(db *sql.DB, table string, input map[string]any, rules map[string]string, columns map[string]struct{}, primary, exceptID string) (map[string]any, *validationErrors, error) {
	lookup := func(kind, lookupTable, column string, value any, ignoreColumn, ignoreValue string) (bool, error) {
		target := table
		sameTable := true
		if strings.TrimSpace(lookupTable) != "" {
			target = quoteIdentifier(lookupTable)
			sameTable = target == table
		}
		query := "SELECT 1 FROM " + target + " WHERE " + quoteIdentifier(column) + " = ?"
		args := []any{value}
		if kind == "unique" {
			if ignoreValue == "" && exceptID != "" && sameTable {
				ignoreColumn, ignoreValue = primary, exceptID
			}
			if ignoreValue != "" {
				query += " AND " + quoteIdentifier(ignoreColumn) + " != ?"
				args = append(args, ignoreValue)
			}
		}
		var found int
		err := db.QueryRow(query, args...).Scan(&found)
		if err == sql.ErrNoRows {
			return false, nil
		}
		if err != nil {
			return false, err
		}
		return true, nil
	}
	errs, err := validateRules(input, rules, lookup)
	if err != nil {
		return nil, nil, err
	}
	if errs.any() {
		return nil, errs, nil
	}
	return validatedInput(input, rules, columns, primary), nil, nil
}

func (v *validationErrors) has(key string) bool {
	return len(v.messages[key]) > 0
}

// writeValidationMessage answers 422 for a single field message.
func writeValidationMessage(w http.ResponseWriter, field, message string) {
	errs := newValidationErrors()
	errs.add(field, message)
	writeValidationErrors(w, errs)
}
