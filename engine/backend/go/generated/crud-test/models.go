package crud_test

const ModuleName = "crud-test"

type Item struct {
	Description *string `json:"description" db:"description"`
	Id          int64   `json:"id" db:"id"`
	Name        string  `json:"name" db:"name"`
	Priority    int64   `json:"priority" db:"priority"`
	Status      string  `json:"status" db:"status"`
	Tags        *string `json:"tags" db:"tags"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Item"}
