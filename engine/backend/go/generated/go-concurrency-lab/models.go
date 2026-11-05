package go_concurrency_lab

const ModuleName = "go-concurrency-lab"

type Task struct {
	Priority  int64  `json:"priority" db:"priority"`
	Status    string `json:"status" db:"status"`
	Title     string `json:"title" db:"title"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Task"}
