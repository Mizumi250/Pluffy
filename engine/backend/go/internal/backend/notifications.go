package backend

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"
	"time"
)

func (h *Handler) serveNotificationTestAction(w http.ResponseWriter, r *http.Request, match matchedEndpoint) {
	user, _, authenticated, err := h.resolveAuthUser(r, match.registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	db, err := openModuleDatabase(h.service.storageDir, match.registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to open notification database"})
		return
	}
	defer db.Close()

	switch match.operation {
	case "index":
		rows, err := db.Query(`SELECT * FROM "notifications" WHERE "notifiable_type" = 'user' AND "notifiable_id" = ? ORDER BY "created_at" DESC`, user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to load notifications"})
			return
		}
		records, err := scanRecords(rows)
		_ = rows.Close()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to read notifications"})
			return
		}
		writeJSON(w, http.StatusOK, map[string]any{"data": records})
	case "store":
		h.triggerNotification(w, r, db, match.registration, user)
	case "readAll":
		now := time.Now().UTC().Format(time.RFC3339Nano)
		if _, err := db.Exec(`UPDATE "notifications" SET "read_at" = ?, "updated_at" = ? WHERE "notifiable_type" = 'user' AND "notifiable_id" = ? AND "read_at" IS NULL`, now, now, user.ID); err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to mark notifications as read"})
			return
		}
		message := match.endpoint.Response.Value
		if message == "" {
			message = "All notifications marked as read"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
	case "destroy":
		result, err := db.Exec(`DELETE FROM "notifications" WHERE "id" = ? AND "notifiable_type" = 'user' AND "notifiable_id" = ?`, match.id, user.ID)
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to delete notification"})
			return
		}
		affected, err := result.RowsAffected()
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to verify notification deletion"})
			return
		}
		if affected == 0 {
			writeJSON(w, http.StatusNotFound, map[string]string{"message": "Notification not found"})
			return
		}
		message := match.endpoint.Response.Value
		if message == "" {
			message = "Notification deleted"
		}
		writeJSON(w, http.StatusOK, map[string]string{"message": message})
	}
}

func (h *Handler) triggerNotification(w http.ResponseWriter, r *http.Request, db *sql.DB, registration Registration, user authUser) {
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	key, valid := input["notification"].(string)
	if !valid || strings.TrimSpace(key) == "" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notification is required and must be a string"}})
		return
	}
	var definition *realtimeSection
	for _, section := range parseRealtimeSections(registration.Notifications) {
		if section.name == key {
			selected := section
			definition = &selected
			break
		}
	}
	if definition == nil {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notification must name a declared notification"}})
		return
	}

	channels := notificationChannels(definition.values["channels"])
	if len(channels) == 0 {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]any{"message": "Validation failed", "errors": []string{"notification has no supported delivery channels"}})
		return
	}
	for _, channel := range channels {
		if channel != "database" && channel != "mail" && channel != "broadcast" {
			writeJSON(w, http.StatusNotImplemented, map[string]string{"message": fmt.Sprintf("Notification channel %q is not supported", channel)})
			return
		}
	}
	message := definition.values["message"]
	if message == "" {
		message = key
	}
	subject := definition.values["subject"]
	if subject == "" {
		subject = key
	}
	data := map[string]any{
		"type":     "NotificationTest\\" + goClassName(key) + "Notification",
		"message":  message,
		"tatemono": registration.Name,
	}
	encodedData, err := json.Marshal(data)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to encode notification data"})
		return
	}
	now := time.Now().UTC().Format(time.RFC3339Nano)

	for _, channel := range channels {
		switch channel {
		case "database":
			id, err := newNotificationID()
			if err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to create notification id"})
				return
			}
			if _, err := db.Exec(`INSERT INTO "notifications" ("id","type","notifiable_type","notifiable_id","data","read_at","created_at","updated_at") VALUES (?, ?, 'user', ?, ?, NULL, ?, ?)`,
				id, data["type"], user.ID, string(encodedData), now, now); err != nil {
				writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to store database notification"})
				return
			}
		case "mail":
			body := `<p>` + htmlEscape(message) + `</p>`
			if err := sendRenderedMail(user.Email, subject, body); err != nil {
				writeJSON(w, http.StatusBadGateway, map[string]string{"message": "Notification email delivery failed: " + err.Error()})
				return
			}
		case "broadcast":
			channelType := definition.values["channel_type"]
			channelName := "notification-test.notifications"
			if channelType == "private" || channelType == "presence" {
				channelName = channelType + "-notification-test." + strconv.FormatInt(user.ID, 10)
			}
			eventData := map[string]any{"message": message, "data": map[string]any{}}
			h.realtime.BroadcastTo(channelName, "notification-test.notification", eventData)
		}
	}
	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "Notification triggered successfully",
		"type":    key,
	})
}

func notificationChannels(raw string) []string {
	raw = strings.TrimSpace(strings.Trim(raw, "[]"))
	if raw == "" {
		return nil
	}
	values := strings.Split(raw, ",")
	channels := make([]string, 0, len(values))
	for _, value := range values {
		value = strings.TrimSpace(strings.Trim(value, `"'`))
		if value != "" {
			channels = append(channels, value)
		}
	}
	return channels
}

func newNotificationID() (string, error) {
	var id [16]byte
	if _, err := rand.Read(id[:]); err != nil {
		return "", err
	}
	id[6] = (id[6] & 0x0f) | 0x40
	id[8] = (id[8] & 0x3f) | 0x80
	encoded := hex.EncodeToString(id[:])
	return encoded[:8] + "-" + encoded[8:12] + "-" + encoded[12:16] + "-" + encoded[16:20] + "-" + encoded[20:], nil
}

func htmlEscape(value string) string {
	var escaped strings.Builder
	for _, character := range value {
		switch character {
		case '&':
			escaped.WriteString("&amp;")
		case '<':
			escaped.WriteString("&lt;")
		case '>':
			escaped.WriteString("&gt;")
		case '"':
			escaped.WriteString("&#34;")
		case '\'':
			escaped.WriteString("&#39;")
		default:
			escaped.WriteRune(character)
		}
	}
	return escaped.String()
}
