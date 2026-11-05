package dtr_geofencing

const ModuleName = "dtr-geofencing"

type Employee struct {
	Avatar    *string `json:"avatar" db:"avatar"`
	Email     string  `json:"email" db:"email"`
	Id        int64   `json:"id" db:"id"`
	IsActive  bool    `json:"is_active" db:"is_active"`
	Name      string  `json:"name" db:"name"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

type TimeRecord struct {
	EmployeeId     int64    `json:"employee_id" db:"employee_id"`
	Id             int64    `json:"id" db:"id"`
	Latitude       *float64 `json:"latitude" db:"latitude"`
	Longitude      *float64 `json:"longitude" db:"longitude"`
	Notes          *string  `json:"notes" db:"notes"`
	Timestamp      string   `json:"timestamp" db:"timestamp"`
	Type           string   `json:"type" db:"type"`
	WithinGeofence bool     `json:"within_geofence" db:"within_geofence"`
	CreatedAt      string   `json:"created_at" db:"created_at"`
	UpdatedAt      string   `json:"updated_at" db:"updated_at"`
}

type DtrSetting struct {
	Id        int64   `json:"id" db:"id"`
	Key       string  `json:"key" db:"key"`
	Value     *string `json:"value" db:"value"`
	CreatedAt string  `json:"created_at" db:"created_at"`
	UpdatedAt string  `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"Employee", "TimeRecord", "DtrSetting"}
