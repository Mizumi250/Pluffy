package broadcast_test

const ModuleName = "broadcast-test"

type Message struct {
	ChannelType *string `json:"channel_type" db:"channel_type"`
	Content     string  `json:"content" db:"content"`
	Id          int64   `json:"id" db:"id"`
	UserId      *int64  `json:"user_id" db:"user_id"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Message"}
