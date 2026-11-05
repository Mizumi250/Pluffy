package shikaku

const ModuleName = "shikaku"

type ShikakuProject struct {
	Height    int64   `json:"height" db:"height"`
	Id        int64   `json:"id" db:"id"`
	Name      string  `json:"name" db:"name"`
	Thumbnail *string `json:"thumbnail" db:"thumbnail"`
	UserId    int64   `json:"user_id" db:"user_id"`
	Width     int64   `json:"width" db:"width"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

type ShikakuSave struct {
	FramesJson string `json:"frames_json" db:"frames_json"`
	Id         int64  `json:"id" db:"id"`
	ProjectId  int64  `json:"project_id" db:"project_id"`
	Version    int64  `json:"version" db:"version"`
	CreatedAt  string `json:"created_at" db:"created_at"`
	UpdatedAt  string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"ShikakuProject", "ShikakuSave"}
