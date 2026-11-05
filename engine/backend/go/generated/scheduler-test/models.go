package scheduler_test

const ModuleName = "scheduler-test"

type CommandRun struct {
	CommandName string  `json:"command_name" db:"command_name"`
	DurationMs  *int64  `json:"duration_ms" db:"duration_ms"`
	ExitCode    int64   `json:"exit_code" db:"exit_code"`
	Id          int64   `json:"id" db:"id"`
	Output      *string `json:"output" db:"output"`
	Signature   string  `json:"signature" db:"signature"`
	TriggeredBy string  `json:"triggered_by" db:"triggered_by"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"CommandRun"}
