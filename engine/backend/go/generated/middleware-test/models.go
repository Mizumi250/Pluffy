package middleware_test

const ModuleName = "middleware-test"

type PingLog struct {
	HeadersOk bool   `json:"headers_ok" db:"headers_ok"`
	Message   string `json:"message" db:"message"`
	CreatedAt string `json:"created_at" db:"created_at"`
	UpdatedAt string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"PingLog"}
