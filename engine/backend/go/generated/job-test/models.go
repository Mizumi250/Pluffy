package job_test

const ModuleName = "job-test"

type JobResult struct {
	Id          int64   `json:"id" db:"id"`
	JobName     string  `json:"job_name" db:"job_name"`
	ProcessedAt *string `json:"processed_at" db:"processed_at"`
	Result      *string `json:"result" db:"result"`
	Status      string  `json:"status" db:"status"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"JobResult"}
