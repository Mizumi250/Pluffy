package go_backend_test

const ModuleName = "go-backend-test"

type Note struct {
	Body      *string `json:"body" db:"body"`
	Title     string  `json:"title" db:"title"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Note"}
