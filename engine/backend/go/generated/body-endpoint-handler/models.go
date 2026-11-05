package body_endpoint_handler

const ModuleName = "body-endpoint-handler"

type ProbeResult struct {
	Id        int64   `json:"id" db:"id"`
	Ok        bool    `json:"ok" db:"ok"`
	Payload   *string `json:"payload" db:"payload"`
	Probe     string  `json:"probe" db:"probe"`
	Result    *string `json:"result" db:"result"`
	Source    string  `json:"source" db:"source"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"ProbeResult"}
