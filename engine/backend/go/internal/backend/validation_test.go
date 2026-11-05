package backend

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func decode(t *testing.T, body string) map[string]any {
	t.Helper()
	var out map[string]any
	if err := json.Unmarshal([]byte(body), &out); err != nil {
		t.Fatalf("decode %q: %v", body, err)
	}
	return out
}

func TestValidationRequiredAndTypes(t *testing.T) {
	rules := map[string]string{"title": "required|string|max:5", "quantity": "integer|min:0", "email": "email"}
	data := decode(t, `{"title":"","quantity":-1,"email":"nope"}`)
	errs, err := validateRules(data, rules, nil)
	if err != nil || !errs.any() {
		t.Fatalf("expected errors, got %#v (%v)", errs, err)
	}
	if got := errs.messages["title"]; len(got) != 1 || got[0] != "The title field is required." {
		t.Fatalf("title errors = %#v", got)
	}
	if got := errs.messages["quantity"]; len(got) != 1 || got[0] != "The quantity field must be at least 0." {
		t.Fatalf("quantity errors = %#v", got)
	}
	if got := errs.messages["email"]; len(got) != 1 || got[0] != "The email field must be a valid email address." {
		t.Fatalf("email errors = %#v", got)
	}
	if want := "The email field must be a valid email address. (and 2 more errors)"; errs.summary() != want {
		t.Fatalf("summary = %q, want %q", errs.summary(), want)
	}
}

func TestValidationStringSizeMessages(t *testing.T) {
	errs, _ := validateRules(decode(t, `{"title":"too long"}`), map[string]string{"title": "string|max:5"}, nil)
	if got := errs.messages["title"]; len(got) != 1 || got[0] != "The title field must not be greater than 5 characters." {
		t.Fatalf("title errors = %#v", got)
	}
}

func TestValidationSometimesNullableAndPresence(t *testing.T) {
	rules := map[string]string{"title": "sometimes|required|string", "note": "nullable|string", "code": "required_if:kind,x"}
	errs, _ := validateRules(decode(t, `{"note":null,"kind":"y"}`), rules, nil)
	if errs.any() {
		t.Fatalf("unexpected errors %#v", errs.messages)
	}
	errs, _ = validateRules(decode(t, `{"title":"","kind":"x"}`), rules, nil)
	if !errs.has("title") || !errs.has("code") {
		t.Fatalf("expected title and code errors, got %#v", errs.messages)
	}
}

func TestValidationMoreRules(t *testing.T) {
	cases := []struct {
		rule, body string
		ok         bool
	}{
		{"boolean", `{"f":true}`, true}, {"boolean", `{"f":"yes"}`, false},
		{"url", `{"f":"https://a.test/x"}`, true}, {"url", `{"f":"nope"}`, false},
		{"date", `{"f":"2026-11-05"}`, true}, {"date", `{"f":"soon"}`, false},
		{"uuid", `{"f":"123e4567-e89b-12d3-a456-426614174000"}`, true}, {"uuid", `{"f":"1"}`, false},
		{"between:1,3", `{"f":2}`, true}, {"between:1,3", `{"f":9}`, false},
		{"in:a,b", `{"f":"a"}`, true}, {"in:a,b", `{"f":"c"}`, false},
		{"regex:/^[a-z]+$/", `{"f":"abc"}`, true}, {"regex:/^[a-z]+$/", `{"f":"ABC"}`, false},
		{"array", `{"f":[1]}`, true}, {"array", `{"f":"x"}`, false},
		{"integer", `{"f":1.5}`, false}, {"integer", `{"f":"7"}`, true},
		{"digits:4", `{"f":"1234"}`, true}, {"digits:4", `{"f":"12"}`, false},
		{"confirmed", `{"f":"a","f_confirmation":"a"}`, true}, {"confirmed", `{"f":"a","f_confirmation":"b"}`, false},
	}
	for _, c := range cases {
		errs, _ := validateRules(decode(t, c.body), map[string]string{"f": c.rule}, nil)
		if errs.any() == c.ok {
			t.Errorf("rule %q on %s: ok=%v but errors=%#v", c.rule, c.body, c.ok, errs.messages)
		}
	}
}

func TestValidationWildcardAndDeterministicOrder(t *testing.T) {
	rules := map[string]string{"items.*.name": "required|string", "b": "required", "a": "required"}
	errs, _ := validateRules(decode(t, `{"items":[{"name":"x"},{"name":""}]}`), rules, nil)
	if !errs.has("items.1.name") || errs.has("items.0.name") {
		t.Fatalf("wildcard errors = %#v", errs.messages)
	}
	if strings.Join(errs.order, ",") != "a,b,items.1.name" {
		t.Fatalf("order = %v", errs.order)
	}
}

func TestValidationUniqueAndExists(t *testing.T) {
	var kinds []string
	lookup := func(kind, table, column string, value any, ignoreColumn, ignoreValue string) (bool, error) {
		kinds = append(kinds, kind+":"+column)
		return true, nil
	}
	errs, _ := validateRules(decode(t, `{"sku":"a","owner":3}`), map[string]string{"sku": "unique:items,sku", "owner": "exists:users,id"}, lookup)
	if !errs.has("sku") || errs.has("owner") {
		t.Fatalf("errors = %#v", errs.messages)
	}
	if got := errs.messages["sku"][0]; got != "The sku has already been taken." {
		t.Fatalf("sku message = %q", got)
	}
}

func TestValidatedInputDropsUnknownAndProtected(t *testing.T) {
	columns := map[string]struct{}{"id": {}, "title": {}, "quantity": {}, "created_at": {}}
	input := decode(t, `{"id":9,"title":"A","quantity":1,"created_at":"x","bogus":true}`)
	got := validatedInput(input, map[string]string{"title": "required"}, columns, "id")
	if len(got) != 1 || got["title"] != "A" {
		t.Fatalf("with rules = %#v", got)
	}
	got = validatedInput(input, nil, columns, "id")
	if len(got) != 2 || got["title"] != "A" || got["quantity"] == nil {
		t.Fatalf("without rules = %#v", got)
	}
}

func TestWriteValidationErrorsShape(t *testing.T) {
	recorder := httptest.NewRecorder()
	writeValidationMessage(recorder, "title", "The title field is required.")
	if recorder.Code != http.StatusUnprocessableEntity {
		t.Fatalf("status = %d", recorder.Code)
	}
	body := decode(t, recorder.Body.String())
	if body["message"] != "The title field is required." {
		t.Fatalf("message = %v", body["message"])
	}
	fields, ok := body["errors"].(map[string]any)
	if !ok || len(fields["title"].([]any)) != 1 {
		t.Fatalf("errors = %#v", body["errors"])
	}
}
