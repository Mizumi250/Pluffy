package main

import (
	"fmt"
	"reflect"

	"github.com/traefik/yaegi/interp"
	"github.com/traefik/yaegi/stdlib"
)

type Box struct{ N int }

func (b *Box) Double() int { return b.N * 2 }

type Resp struct{}

func (r *Resp) JSON(args ...any) string { return fmt.Sprint(args...) }

func Take(value any) string {
	reflected := reflect.ValueOf(value)
	if reflected.Kind() == reflect.Pointer && !reflected.IsNil() {
		return fmt.Sprintf("ptr to %d", reflected.Elem().Field(0).Int())
	}
	return fmt.Sprintf("raw %v", value)
}

func main() {
	i := interp.New(interp.Options{})
	i.Use(stdlib.Symbols)
	i.Use(interp.Exports{
		"arkzen/rt/rt": {
			"Box":       reflect.ValueOf((*Box)(nil)),
			"Resp":      reflect.ValueOf((*Resp)(nil)),
			"Take":      reflect.ValueOf(Take),
			"ToGeneric": reflect.ValueOf(func(v any) (map[string]any, error) { return map[string]any{"x": 1}, nil }),
		},
	})
	for _, source := range []string{
		`import "fmt"`,
		`import "database/sql"`,
		`import "arkzen/rt"`,
		`resp := &rt.Resp{}`,
		`type ItemRecord struct { ID int ` + "`" + `json:"id" db:"id"` + "`" + `; Extras map[string]interface{} ` + "`" + `json:"-"` + "`" + ` }`,
		`type Item = ItemRecord`,
		`type Items []*ItemRecord`,
		`type ItemFacade struct{}`,
		`type ItemScope struct{}`,
		`func Item() *ItemScope { return &ItemScope{} }`,
		`func (s *ItemScope) Get() (Items, error) { return Items{{ID: 1}}, nil }`,
		`type AltFacade struct{ Query func() *ItemScope }`,
		`var Alt = AltFacade{Query: func() *ItemScope { return &ItemScope{} }}`,
		`func (r *ItemRecord) ToMap() map[string]interface{} { object, _ := rt.ToGeneric(r); return object }`,
		`func aliases() { list, _ := Item.Query().Get(); for _, it := range list { fmt.Println("item", it.ID, len(it.ToMap())) }; var v interface{} = list[0]; typed, ok := v.(*Item); fmt.Println("assert alias", ok, typed.ID); typed2, ok2 := list[0].(*ItemRecord); fmt.Println("range elem assert", ok2, typed2.ID) }`,
		`func sqlrow() { _, err := sql.Open("nope", ""); fmt.Println("sql import ok:", err != nil) }`,
		`func run() { aliases(); sqlrow(); fmt.Println("alt facade ok:", Alt.Query() != nil, Item.Query() != nil); fmt.Println(resp.JSON(201, "x")); b := &rt.Box{N: 5}; fmt.Println(b.Double()); fmt.Println(rt.Take(b)) }`,
	} {
		if _, err := i.Eval(source); err != nil {
			fmt.Printf("ERROR on %q: %v\n", source, err)
			return
		}
	}
	if _, err := i.Eval("run()"); err != nil {
		fmt.Println("ERROR run():", err)
		return
	}
	fmt.Println("ALL OK")
}
