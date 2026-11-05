package main

import (
	"fmt"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

func try(name string, statements []string, calls []string) {
	i := interp.New(interp.Options{})
	i.Use(stdlib.Symbols)
	for _, source := range statements {
		if _, err := i.Eval(source); err != nil {
			fmt.Printf("[%s] EVAL ERROR on %q: %v\n", name, source, err)
			return
		}
	}
	for _, call := range calls {
		if _, err := i.Eval(call + "()"); err != nil {
			fmt.Printf("[%s] RUN ERROR %s: %v\n", name, call, err)
			return
		}
	}
	fmt.Printf("[%s] ALL OK\n", name)
}

func common() []string {
	return []string{
		`import "fmt"`,
		`type ProfileRecord struct { ID int; Name string }`,
		`func (r *ProfileRecord) SetName(value string) { r.Name = value }`,
		`type ProfileScope struct{}`,
		`func (s *ProfileScope) Get() ([]*ProfileRecord, error) { return []*ProfileRecord{{ID: 1, Name: "a"}}, nil }`,
	}
}

func main() {
	// Pattern 1: alias + facade var
	try("1", append(common(),
		`type Profile = ProfileRecord`,
		`func (s *ProfileScope) First() (*Profile, error) { return &ProfileRecord{ID: 2}, nil }`,
		`type ProfileFacadeT struct{}`,
		`func (f ProfileFacadeT) Query() *ProfileScope { return &ProfileScope{} }`,
		`var Profile = ProfileFacadeT{}`,
		`func c1a() { l, _ := Profile.Query().Get(); fmt.Println("get ok", len(l)) }`,
		`func c1b() { m := make(map[string]*Profile, 1); rec, _ := Profile.Query().First(); m["x"] = rec; fmt.Println("map ok", m["x"].Name) }`,
		`func c1c() { rec, _ := Profile.Query().First(); var v interface{} = rec; typed, ok := v.(*Profile); fmt.Println("assert ok", ok, typed.ID) }`,
		`func c1d() { l, _ := Profile.Query().Get(); for _, r := range l { r.SetName("z"); fmt.Println("range ok", r.Name) } }`,
	), []string{"c1a", "c1b", "c1c", "c1d"})

	// Pattern 2: facade var with Query method, NO alias; record referenced as ProfileRecord
	try("2", append(common(),
		`func (s *ProfileScope) First() (*ProfileRecord, error) { return &ProfileRecord{ID: 2}, nil }`,
		`type ProfileFacadeT struct{}`,
		`func (f ProfileFacadeT) Query() *ProfileScope { return &ProfileScope{} }`,
		`var Profile = ProfileFacadeT{}`,
		`func c2a() { m := make(map[string]*ProfileRecord, 1); rec, _ := Profile.Query().First(); m["x"] = rec; fmt.Println("map ok", m["x"].Name) }`,
		`func c2b() { rec, _ := Profile.Query().First(); var v interface{} = rec; typed, ok := v.(*ProfileRecord); fmt.Println("assert ok", ok, typed.ID) }`,
		`func c2c() { l, _ := Profile.Query().Get(); for _, r := range l { r.SetName("z"); fmt.Println("range ok", r.Name) } }`,
	), []string{"c2a", "c2b", "c2c"})
}
