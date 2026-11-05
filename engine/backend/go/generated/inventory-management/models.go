package inventory_management

const ModuleName = "inventory-management"

type Inventory struct {
	Category    *string `json:"category" db:"category"`
	Description *string `json:"description" db:"description"`
	Id          int64   `json:"id" db:"id"`
	Name        string  `json:"name" db:"name"`
	Price       float64 `json:"price" db:"price"`
	Quantity    int64   `json:"quantity" db:"quantity"`
	Sku         string  `json:"sku" db:"sku"`
	CreatedAt   string  `json:"created_at" db:"created_at"`
	UpdatedAt   string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Inventory"}
