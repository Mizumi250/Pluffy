package spring_test

const ModuleName = "spring-test"

type Note struct {
	Body      *string `json:"body" db:"body"`
	Id        int64   `json:"id" db:"id"`
	Pinned    bool    `json:"pinned" db:"pinned"`
	Title     string  `json:"title" db:"title"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Note"}
