package roles_test

const ModuleName = "roles-test"

type RoleAuditLog struct {
	Action       string `json:"action" db:"action"`
	Granted      bool   `json:"granted" db:"granted"`
	RoleRequired string `json:"role_required" db:"role_required"`
	UserId       *int64 `json:"user_id" db:"user_id"`
	CreatedAt    string `json:"created_at" db:"created_at"`
	UpdatedAt    string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"RoleAuditLog"}
