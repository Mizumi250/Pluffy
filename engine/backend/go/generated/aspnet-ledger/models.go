package aspnet_ledger

const ModuleName = "aspnet-ledger"

type Account struct {
	Balance   float64 `json:"balance" db:"balance"`
	Id        int64   `json:"id" db:"id"`
	Owner     string  `json:"owner" db:"owner"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

type Transfer struct {
	Amount        float64 `json:"amount" db:"amount"`
	FromAccountId int64   `json:"from_account_id" db:"from_account_id"`
	Id            int64   `json:"id" db:"id"`
	Memo          *string `json:"memo" db:"memo"`
	Status        string  `json:"status" db:"status"`
	ToAccountId   int64   `json:"to_account_id" db:"to_account_id"`
	CreatedAt     string  `json:"created_at" db:"created_at"`
	UpdatedAt     string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Account", "Transfer"}
