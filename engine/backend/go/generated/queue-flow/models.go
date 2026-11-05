package queue_flow

const ModuleName = "queue-flow"

type Queue struct {
	AvgWaitMinutes int64   `json:"avg_wait_minutes" db:"avg_wait_minutes"`
	Description    *string `json:"description" db:"description"`
	Id             int64   `json:"id" db:"id"`
	IsActive       bool    `json:"is_active" db:"is_active"`
	Name           string  `json:"name" db:"name"`
	Prefix         string  `json:"prefix" db:"prefix"`
	CreatedAt      string  `json:"created_at" db:"created_at"`
	UpdatedAt      string  `json:"updated_at" db:"updated_at"`
}

type Ticket struct {
	CalledAt     *string `json:"called_at" db:"called_at"`
	CustomerName *string `json:"customer_name" db:"customer_name"`
	Id           int64   `json:"id" db:"id"`
	Position     int64   `json:"position" db:"position"`
	QueueId      int64   `json:"queue_id" db:"queue_id"`
	ServedAt     *string `json:"served_at" db:"served_at"`
	Status       string  `json:"status" db:"status"`
	TicketNumber string  `json:"ticket_number" db:"ticket_number"`
	CreatedAt    string  `json:"created_at" db:"created_at"`
	UpdatedAt    string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Queue", "Ticket"}
