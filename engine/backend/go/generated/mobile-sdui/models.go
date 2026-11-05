package mobile_sdui

const ModuleName = "mobile-sdui"

type UiRelease struct {
	ActivateAt    string `json:"activate_at" db:"activate_at"`
	Configuration string `json:"configuration" db:"configuration"`
	Id            int64  `json:"id" db:"id"`
	CreatedAt     string `json:"created_at" db:"created_at"`
	UpdatedAt     string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"UiRelease"}
