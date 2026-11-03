package backend

import (
	"encoding/base64"
	"testing"
)

func TestGoPolicyExpressionEvaluation(t *testing.T) {
	tests := []struct {
		name string
		body string
		item map[string]any
		want bool
	}{
		{
			name: "archived record denied",
			body: `return item == nil || item.Status != "archived"`,
			item: map[string]any{"status": "archived"},
			want: false,
		},
		{
			name: "active record allowed",
			body: `return item == nil || item.Status != "archived"`,
			item: map[string]any{"status": "active"},
			want: true,
		},
		{
			name: "compound numeric and text condition",
			body: `return item.Priority >= 2 && item.Status != "archived"`,
			item: map[string]any{"priority": int64(2), "status": "active"},
			want: true,
		},
	}
	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			encoded := base64.StdEncoding.EncodeToString([]byte(test.body))
			if !validGoPolicySnippet(encoded) {
				t.Fatal("expected policy body to pass the safe expression validator")
			}
			got, err := evaluateGoPolicy(encoded, test.item)
			if err != nil {
				t.Fatal(err)
			}
			if got != test.want {
				t.Fatalf("evaluateGoPolicy() = %t, want %t", got, test.want)
			}
		})
	}
}

func TestGoPolicyRejectsExecutableStatements(t *testing.T) {
	for _, body := range []string{
		`os.RemoveAll("/")`,
		`x := item.Status; return x != "archived"`,
	} {
		encoded := base64.StdEncoding.EncodeToString([]byte(body))
		if validGoPolicySnippet(encoded) {
			t.Errorf("unsafe or malformed policy body was accepted: %q", body)
		}
	}
}
