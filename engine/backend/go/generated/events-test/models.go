package events_test

const ModuleName = "events-test"

type EventLog struct {
	DurationMs   *int64  `json:"duration_ms" db:"duration_ms"`
	EventName    string  `json:"event_name" db:"event_name"`
	Id           int64   `json:"id" db:"id"`
	ListenerName string  `json:"listener_name" db:"listener_name"`
	Payload      *string `json:"payload" db:"payload"`
	Status       string  `json:"status" db:"status"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"EventLog"}
