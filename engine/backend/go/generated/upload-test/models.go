package upload_test

const ModuleName = "upload-test"

type UploadedFile struct {
	DiskPath     string `json:"disk_path" db:"disk_path"`
	Id           int64  `json:"id" db:"id"`
	IsImage      bool   `json:"is_image" db:"is_image"`
	MimeType     string `json:"mime_type" db:"mime_type"`
	OriginalName string `json:"original_name" db:"original_name"`
	SizeBytes    int64  `json:"size_bytes" db:"size_bytes"`
	StoredName   string `json:"stored_name" db:"stored_name"`
	UserId       *int64 `json:"user_id" db:"user_id"`
	CreatedAt    string `json:"created_at" db:"created_at"`
	UpdatedAt    string `json:"updated_at" db:"updated_at"`
}

var GeneratedModelNames = []string{"UploadedFile"}
