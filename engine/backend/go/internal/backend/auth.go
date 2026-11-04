package backend

import (
	"crypto/rand"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"net/http"
	"net/mail"
	"strconv"
	"strings"
	"time"
	"unicode/utf8"

	"golang.org/x/crypto/bcrypt"
)

type authUser struct {
	ID              int64   `json:"id"`
	Name            string  `json:"name"`
	Email           string  `json:"email"`
	Role            string  `json:"role"`
	EmailVerifiedAt *string `json:"email_verified_at"`
	CreatedAt       string  `json:"created_at"`
	UpdatedAt       string  `json:"updated_at"`
}

func (h *Handler) serveAuthRoute(w http.ResponseWriter, r *http.Request, registration Registration, path string) bool {
	prefix := "/api/" + registration.Name + "/auth/"
	if !registration.Auth || !strings.HasPrefix(path, prefix) {
		return false
	}

	switch strings.TrimPrefix(path, prefix) {
	case "register":
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return true
		}
		h.registerAuthUser(w, r, registration.Name)
	case "login":
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return true
		}
		h.loginAuthUser(w, r, registration.Name)
	case "me":
		if r.Method != http.MethodGet {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return true
		}
		user, _, ok, err := h.resolveAuthUser(r, registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
			return true
		}
		if !ok {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
			return true
		}
		writeJSON(w, http.StatusOK, user)
	case "logout":
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return true
		}
		_, tokenID, ok, err := h.resolveAuthUser(r, registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
			return true
		}
		if !ok {
			writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
			return true
		}
		db, err := openModuleDatabase(h.service.storageDir, registration.Name)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open auth database"})
			return true
		}
		defer db.Close()
		if _, err := db.Exec(`DELETE FROM "personal_access_tokens" WHERE "id" = ?`, tokenID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to revoke access token"})
			return true
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": "Logged out successfully"})
	case "broadcasting/auth":
		if r.Method != http.MethodPost {
			writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"message": "Method not allowed"})
			return true
		}
		h.authorizeBroadcastChannel(w, r, registration)
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"message": "Not Found"})
	}
	return true
}

func (h *Handler) registerAuthUser(w http.ResponseWriter, r *http.Request, module string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	name, nameOK := input["name"].(string)
	email, emailOK := input["email"].(string)
	password, passwordOK := input["password"].(string)
	confirmation, confirmationOK := input["password_confirmation"].(string)
	var errorsByField = make(map[string][]string)
	if !nameOK || strings.TrimSpace(name) == "" {
		errorsByField["name"] = []string{"The name field is required."}
	} else if len([]rune(name)) > 255 {
		errorsByField["name"] = []string{"The name may not be greater than 255 characters."}
	}
	if !emailOK || !validAuthEmail(email) {
		errorsByField["email"] = []string{"The email must be a valid email address."}
	}
	if !passwordOK || utf8.RuneCountInString(password) < 8 {
		errorsByField["password"] = []string{"The password must be at least 8 characters."}
	}
	if passwordOK && len(password) > 72 {
		errorsByField["password"] = append(errorsByField["password"], "The password must not exceed 72 bytes.")
	}
	if !confirmationOK || password != confirmation {
		errorsByField["password"] = append(errorsByField["password"], "The password confirmation does not match.")
	}
	if len(errorsByField) > 0 {
		writeAuthValidationError(w, errorsByField)
		return
	}

	passwordHash, err := hashPassword(password)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to hash password"})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, module)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open auth database"})
		return
	}
	defer db.Close()
	now := time.Now().UTC().Format(time.RFC3339Nano)
	insert := `INSERT INTO "users" ("name","email","password","role","created_at","updated_at") VALUES (?,?,?,'user',?,?)`
	var userID int64
	if configuredDialect() == postgresDialect {
		err = db.QueryRow(insert+` RETURNING "id"`,
			strings.TrimSpace(name), strings.TrimSpace(email), passwordHash, now, now).Scan(&userID)
	} else {
		var result sql.Result
		result, err = db.Exec(insert, strings.TrimSpace(name), strings.TrimSpace(email), passwordHash, now, now)
		if err == nil {
			userID, err = result.LastInsertId()
		}
	}
	if err != nil {
		if strings.Contains(strings.ToLower(err.Error()), "unique") || strings.Contains(strings.ToLower(err.Error()), "constraint") {
			writeAuthValidationError(w, map[string][]string{"email": {"The email has already been taken."}})
			return
		}
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to create user"})
		return
	}
	user := authUser{ID: userID, Name: strings.TrimSpace(name), Email: strings.TrimSpace(email), Role: "user", CreatedAt: now, UpdatedAt: now}
	h.writeAuthToken(w, db, user, http.StatusCreated)
}

func (h *Handler) loginAuthUser(w http.ResponseWriter, r *http.Request, module string) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	email, emailOK := input["email"].(string)
	password, passwordOK := input["password"].(string)
	if !emailOK || !validAuthEmail(email) || !passwordOK || password == "" {
		writeAuthValidationError(w, map[string][]string{"email": {"The provided credentials are incorrect."}})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, module)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open auth database"})
		return
	}
	defer db.Close()
	var user authUser
	var passwordHash string
	err = db.QueryRow(`SELECT "id","name","email","role","email_verified_at","created_at","updated_at","password" FROM "users" WHERE "email" = ?`, strings.TrimSpace(email)).
		Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt, &passwordHash)
	if errors.Is(err, sql.ErrNoRows) || (err == nil && !verifyPassword(password, passwordHash)) {
		writeAuthValidationError(w, map[string][]string{"email": {"The provided credentials are incorrect."}})
		return
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read user credentials"})
		return
	}
	if _, err := db.Exec(`DELETE FROM "personal_access_tokens" WHERE "tokenable_id" = ?`, user.ID); err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to replace access token"})
		return
	}
	h.writeAuthToken(w, db, user, http.StatusOK)
}

func writeAuthValidationError(w http.ResponseWriter, fieldErrors map[string][]string) {
	writeJSON(w, http.StatusUnprocessableEntity, map[string]any{
		"message": "The given data was invalid.",
		"errors":  fieldErrors,
	})
}

func (h *Handler) writeAuthToken(w http.ResponseWriter, db *sql.DB, user authUser, status int) {
	token, err := randomToken()
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to create access token"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)
	insert := `INSERT INTO "personal_access_tokens" ("tokenable_type","tokenable_id","name","token","abilities","created_at","updated_at") VALUES ('user',?,'arkzen-token',?,'["*"]',?,?)`
	var tokenID int64
	if configuredDialect() == postgresDialect {
		err = db.QueryRow(insert+` RETURNING "id"`, user.ID, hashToken(token), now, now).Scan(&tokenID)
	} else {
		var result sql.Result
		result, err = db.Exec(insert, user.ID, hashToken(token), now, now)
		if err == nil {
			tokenID, err = result.LastInsertId()
		}
	}
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to persist access token"})
		return
	}
	writeJSON(w, status, map[string]any{"user": user, "token": fmt.Sprintf("%d|%s", tokenID, token)})
}

func (h *Handler) resolveAuthUser(r *http.Request, module string) (authUser, int64, bool, error) {
	token := bearerToken(r)
	if token == "" {
		if cookie, err := r.Cookie("arkzen-auth-" + module); err == nil {
			token = cookie.Value
		}
	}
	if token == "" {
		return authUser{}, 0, false, nil
	}
	tokenID := int64(0)
	plainToken := token
	if id, plain, found := strings.Cut(token, "|"); found {
		parsedID, err := strconv.ParseInt(id, 10, 64)
		if err != nil || parsedID < 1 || plain == "" {
			return authUser{}, 0, false, nil
		}
		tokenID = parsedID
		plainToken = plain
	}
	db, err := openModuleDatabase(h.service.storageDir, module)
	if err != nil {
		return authUser{}, 0, false, err
	}
	defer db.Close()
	var user authUser
	var storedHash string
	var storedTokenID int64
	query := `SELECT u."id",u."name",u."email",u."role",u."email_verified_at",u."created_at",u."updated_at",t."token",t."id"
		FROM "personal_access_tokens" t JOIN "users" u ON u."id" = t."tokenable_id"
		WHERE t."token" = ? AND (t."expires_at" IS NULL OR t."expires_at" > ?)`
	args := []any{hashToken(plainToken), time.Now().UTC().Format(time.RFC3339Nano)}
	if tokenID > 0 {
		query += ` AND t."id" = ?`
		args = append(args, tokenID)
	}
	err = db.QueryRow(query, args...).
		Scan(&user.ID, &user.Name, &user.Email, &user.Role, &user.EmailVerifiedAt, &user.CreatedAt, &user.UpdatedAt, &storedHash, &storedTokenID)
	if errors.Is(err, sql.ErrNoRows) {
		return authUser{}, 0, false, nil
	}
	if err != nil {
		return authUser{}, 0, false, err
	}
	return user, storedTokenID, true, nil
}

func bearerToken(r *http.Request) string {
	value := strings.TrimSpace(r.Header.Get("Authorization"))
	scheme, token, found := strings.Cut(value, " ")
	if !found || !strings.EqualFold(scheme, "Bearer") {
		return ""
	}
	return strings.TrimSpace(token)
}

func validAuthEmail(value string) bool {
	value = strings.TrimSpace(value)
	parsed, err := mail.ParseAddress(value)
	return err == nil && parsed.Address == value
}

func randomToken() (string, error) {
	value := make([]byte, 20)
	if _, err := rand.Read(value); err != nil {
		return "", err
	}
	return hex.EncodeToString(value), nil
}

func hashToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return fmt.Sprintf("%x", sum)
}

func hashPassword(password string) (string, error) {
	hash, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func verifyPassword(password, encoded string) bool {
	return bcrypt.CompareHashAndPassword([]byte(encoded), []byte(password)) == nil
}
