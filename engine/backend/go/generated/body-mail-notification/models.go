package body_mail_notification

const ModuleName = "body-mail-notification"

type SendLog struct {
	Error     *string `json:"error" db:"error"`
	Id        int64   `json:"id" db:"id"`
	Kind      string  `json:"kind" db:"kind"`
	MailClass *string `json:"mail_class" db:"mail_class"`
	Status    string  `json:"status" db:"status"`
	Subject   *string `json:"subject" db:"subject"`
	ToEmail   *string `json:"to_email" db:"to_email"`
	UserId    *int64  `json:"user_id" db:"user_id"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"SendLog"}
