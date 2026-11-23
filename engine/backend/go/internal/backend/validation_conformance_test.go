package backend

import (
	"encoding/json"
	"os"
	"testing"
)

// TestValidationConformanceVectors runs the shared Laravel/Express-derived vectors
// (engine/backend/conformance/validation-vectors.json) against the Go validator.
func TestValidationConformanceVectors(t *testing.T) {
	raw, err := os.ReadFile("testdata/validation-vectors.json")
	if err != nil {
		t.Fatal(err)
	}
	var vectors []map[string]json.RawMessage
	if err := json.Unmarshal(raw, &vectors); err != nil {
		t.Fatal(err)
	}
	failures := 0
	for _, vector := range vectors {
		var rule string
		var want bool
		if err := json.Unmarshal(vector["rule"], &rule); err != nil {
			t.Fatal(err)
		}
		if err := json.Unmarshal(vector["pass"], &want); err != nil {
			t.Fatal(err)
		}
		data := map[string]any{}
		if rawData, ok := vector["data"]; ok {
			if err := json.Unmarshal(rawData, &data); err != nil {
				t.Fatal(err)
			}
		}
		// A present-but-null value must stay distinguishable from a missing one.
		if rawValue, ok := vector["value"]; ok {
			var value any
			if err := json.Unmarshal(rawValue, &value); err != nil {
				t.Fatal(err)
			}
			data["field"] = value
		}
		errs, lookupErr := validateRules(data, map[string]string{"field": rule}, nil)
		if lookupErr != nil {
			t.Fatalf("%s: lookup error %v", rule, lookupErr)
		}
		if passed := !errs.any(); passed != want {
			failures++
			t.Errorf("rule %q data=%v: passed=%v, want %v", rule, data, passed, want)
		}
	}
	t.Logf("go: %d/%d vectors agree", len(vectors)-failures, len(vectors))
}
