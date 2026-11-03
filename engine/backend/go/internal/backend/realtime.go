package backend

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net"
	"net/http"
	"regexp"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/gorilla/websocket"
)

type RealtimeHub struct {
	appKey   string
	secret   string
	mu       sync.RWMutex
	clients  map[*realtimeClient]struct{}
	channels map[string]map[*realtimeClient]struct{}
}

type realtimeClient struct {
	id       string
	socket   *websocket.Conn
	hub      *RealtimeHub
	writeMu  sync.Mutex
	channels map[string]struct{}
	presence map[string]map[string]any
}

type realtimeSection struct {
	name   string
	values map[string]string
}

func NewRealtimeHub(appKey, secret string) *RealtimeHub {
	return &RealtimeHub{
		appKey: appKey, secret: secret,
		clients:  make(map[*realtimeClient]struct{}),
		channels: make(map[string]map[*realtimeClient]struct{}),
	}
}

func (h *Handler) StartRealtime(port int) (*http.Server, error) {
	if port < 1 || port > 65535 {
		return nil, errors.New("realtime port must be an integer from 1 to 65535")
	}
	listener, err := net.Listen("tcp", fmt.Sprintf(":%d", port))
	if err != nil {
		return nil, fmt.Errorf("listen for realtime connections on port %d: %w", port, err)
	}
	server := &http.Server{
		Handler: h.realtime, ReadHeaderTimeout: 5 * time.Second,
	}
	go func() {
		if err := server.Serve(listener); err != nil && !errors.Is(err, http.ErrServerClosed) {
			log.Printf("serve realtime connections: %v", err)
		}
	}()
	return server, nil
}

func (h *RealtimeHub) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	expectedPath := "/app/" + h.appKey
	if r.URL.Path != expectedPath {
		http.NotFound(w, r)
		return
	}
	if !websocket.IsWebSocketUpgrade(r) {
		http.Error(w, "WebSocket upgrade required", http.StatusBadRequest)
		return
	}
	upgrader := websocket.Upgrader{CheckOrigin: func(*http.Request) bool { return true }}
	socket, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	id, err := newSocketID()
	if err != nil {
		_ = socket.Close()
		return
	}
	client := &realtimeClient{
		id: id, socket: socket, hub: h,
		channels: make(map[string]struct{}),
		presence: make(map[string]map[string]any),
	}
	h.mu.Lock()
	h.clients[client] = struct{}{}
	h.mu.Unlock()
	if err := client.send("pusher:connection_established", map[string]any{
		"socket_id": id, "activity_timeout": 30,
	}, ""); err != nil {
		h.drop(client)
		_ = socket.Close()
		return
	}

	socket.SetReadLimit(64 << 10)
	_ = socket.SetReadDeadline(time.Now().Add(90 * time.Second))
	socket.SetPongHandler(func(string) error {
		return socket.SetReadDeadline(time.Now().Add(90 * time.Second))
	})
	for {
		_, payload, readErr := socket.ReadMessage()
		if readErr != nil {
			break
		}
		_ = socket.SetReadDeadline(time.Now().Add(90 * time.Second))
		client.handleMessage(payload)
	}
	h.drop(client)
	_ = socket.Close()
}

func (c *realtimeClient) send(event string, data any, channel string) error {
	dataJSON, err := json.Marshal(data)
	if err != nil {
		return err
	}
	envelope := map[string]any{"event": event, "data": string(dataJSON)}
	if channel != "" {
		envelope["channel"] = channel
	}
	payload, err := json.Marshal(envelope)
	if err != nil {
		return err
	}
	c.writeMu.Lock()
	defer c.writeMu.Unlock()
	return c.socket.WriteMessage(websocket.TextMessage, payload)
}

func (c *realtimeClient) handleMessage(payload []byte) {
	var envelope struct {
		Event string          `json:"event"`
		Data  json.RawMessage `json:"data"`
	}
	if err := json.Unmarshal(payload, &envelope); err != nil {
		return
	}
	var data map[string]any
	if err := json.Unmarshal(envelope.Data, &data); err != nil {
		var encoded string
		if json.Unmarshal(envelope.Data, &encoded) != nil || json.Unmarshal([]byte(encoded), &data) != nil {
			return
		}
	}
	switch envelope.Event {
	case "pusher:ping":
		_ = c.send("pusher:pong", map[string]any{}, "")
	case "pusher:subscribe":
		c.subscribe(data)
	case "pusher:unsubscribe":
		if channel, ok := data["channel"].(string); ok {
			c.hub.unsubscribe(c, channel)
		}
	}
}

func (c *realtimeClient) subscribe(data map[string]any) {
	channel, ok := data["channel"].(string)
	if !ok || channel == "" {
		return
	}
	isPrivate := strings.HasPrefix(channel, "private-")
	isPresence := strings.HasPrefix(channel, "presence-")
	channelData, _ := data["channel_data"].(string)
	if (isPrivate || isPresence) && !c.hub.validChannelSignature(c.id, channel, channelData, data["auth"]) {
		_ = c.send("pusher:error", map[string]any{"code": 4009, "message": "Connection is unauthorized"}, channel)
		return
	}

	var presenceData map[string]any
	if isPresence && channelData != "" {
		_ = json.Unmarshal([]byte(channelData), &presenceData)
	}
	c.hub.mu.Lock()
	subscribers := c.hub.channels[channel]
	if subscribers == nil {
		subscribers = make(map[*realtimeClient]struct{})
		c.hub.channels[channel] = subscribers
	}
	existing := make([]*realtimeClient, 0, len(subscribers))
	for subscriber := range subscribers {
		existing = append(existing, subscriber)
	}
	subscribers[c] = struct{}{}
	c.channels[channel] = struct{}{}
	if presenceData != nil {
		c.presence[channel] = presenceData
	}
	members := c.hub.presenceMembersLocked(channel)
	c.hub.mu.Unlock()

	if isPresence {
		_ = c.send("pusher_internal:subscription_succeeded", members, channel)
		for _, subscriber := range existing {
			_ = subscriber.send("pusher_internal:member_added", presenceData, channel)
		}
		return
	}
	_ = c.send("pusher_internal:subscription_succeeded", map[string]any{}, channel)
}

func (h *RealtimeHub) presenceMembersLocked(channel string) map[string]any {
	ids := make([]string, 0)
	hash := make(map[string]any)
	for client := range h.channels[channel] {
		info := client.presence[channel]
		if info == nil {
			continue
		}
		id := fmt.Sprint(info["user_id"])
		ids = append(ids, id)
		hash[id] = info["user_info"]
	}
	return map[string]any{"presence": map[string]any{"count": len(ids), "ids": ids, "hash": hash}}
}

func (h *RealtimeHub) unsubscribe(client *realtimeClient, channel string) {
	h.mu.Lock()
	if subscribers := h.channels[channel]; subscribers != nil {
		delete(subscribers, client)
		if len(subscribers) == 0 {
			delete(h.channels, channel)
		}
	}
	delete(client.channels, channel)
	delete(client.presence, channel)
	h.mu.Unlock()
}

func (h *RealtimeHub) drop(client *realtimeClient) {
	h.mu.Lock()
	removedPresence := make(map[string]any)
	recipients := make(map[string][]*realtimeClient)
	for channel := range client.channels {
		if info := client.presence[channel]; info != nil {
			removedPresence[channel] = map[string]any{"user_id": info["user_id"]}
		}
		subscribers := h.channels[channel]
		delete(subscribers, client)
		for subscriber := range subscribers {
			recipients[channel] = append(recipients[channel], subscriber)
		}
		if len(subscribers) == 0 {
			delete(h.channels, channel)
		}
	}
	delete(h.clients, client)
	h.mu.Unlock()
	for channel, data := range removedPresence {
		for _, recipient := range recipients[channel] {
			_ = recipient.send("pusher_internal:member_removed", data, channel)
		}
	}
}

func (h *RealtimeHub) validChannelSignature(socketID, channel, channelData string, supplied any) bool {
	signature, ok := supplied.(string)
	if !ok {
		return false
	}
	message := socketID + ":" + channel
	if strings.HasPrefix(channel, "presence-") {
		message += ":" + channelData
	}
	mac := hmac.New(sha256.New, []byte(h.secret))
	_, _ = mac.Write([]byte(message))
	expected := h.appKey + ":" + hex.EncodeToString(mac.Sum(nil))
	return hmac.Equal([]byte(signature), []byte(expected))
}

func (h *RealtimeHub) BroadcastTo(channel, event string, data any) {
	h.mu.RLock()
	recipients := make([]*realtimeClient, 0, len(h.channels[channel]))
	for client := range h.channels[channel] {
		recipients = append(recipients, client)
	}
	h.mu.RUnlock()
	for _, client := range recipients {
		if err := client.send(event, data, channel); err != nil {
			h.drop(client)
			_ = client.socket.Close()
		}
	}
}

func newSocketID() (string, error) {
	randomNumber := func() (uint64, error) {
		var bytes [8]byte
		if _, err := rand.Read(bytes[:]); err != nil {
			return 0, err
		}
		return binaryUint64(bytes[:]) % 1_000_000_000, nil
	}
	first, err := randomNumber()
	if err != nil {
		return "", err
	}
	second, err := randomNumber()
	if err != nil {
		return "", err
	}
	return strconv.FormatUint(first, 10) + "." + strconv.FormatUint(second, 10), nil
}

func binaryUint64(value []byte) uint64 {
	var out uint64
	for _, b := range value {
		out = out<<8 | uint64(b)
	}
	return out
}

func parseRealtimeSections(rawSections []string) []realtimeSection {
	sections := make([]realtimeSection, 0, len(rawSections))
	for _, raw := range rawSections {
		section := realtimeSection{values: make(map[string]string)}
		for index, line := range strings.Split(raw, "\n") {
			line = strings.TrimSpace(line)
			if line == "" {
				continue
			}
			key, value, found := strings.Cut(line, ":")
			if !found {
				continue
			}
			key = strings.TrimSpace(key)
			value = strings.Trim(strings.TrimSpace(value), `"'`)
			if index == 0 {
				section.name = strings.TrimSpace(key)
			} else {
				section.values[key] = value
			}
		}
		if section.name != "" {
			sections = append(sections, section)
		}
	}
	return sections
}

func (h *Handler) authorizeBroadcastChannel(w http.ResponseWriter, r *http.Request, registration Registration) {
	if !registration.Auth {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	input, ok := readObjectBody(w, r)
	if !ok {
		return
	}
	socketID, socketOK := input["socket_id"].(string)
	channel, channelOK := input["channel_name"].(string)
	if !socketOK || !channelOK || strings.TrimSpace(socketID) == "" || strings.TrimSpace(channel) == "" {
		writeJSON(w, http.StatusUnprocessableEntity, map[string]string{"message": "Missing socket_id or channel_name."})
		return
	}
	user, _, authenticated, err := h.resolveAuthUser(r, registration.Name)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to resolve authenticated user"})
		return
	}
	if !authenticated {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"message": "Unauthenticated."})
		return
	}
	channelType := ""
	switch {
	case strings.HasPrefix(channel, "private-"):
		channelType = "private"
	case strings.HasPrefix(channel, "presence-"):
		channelType = "presence"
	default:
		writeJSON(w, http.StatusForbidden, map[string]string{"message": "Forbidden."})
		return
	}
	channelName := strings.TrimPrefix(channel, channelType+"-")
	allowed := registration.Name == "notification-test" &&
		channelType == "private" &&
		channelName == "notification-test."+strconv.FormatInt(user.ID, 10)
	for _, section := range parseRealtimeSections(registration.Realtimes) {
		if section.values["type"] != channelType || section.values["channel"] != "" {
			continue
		}
		matches, captures := matchRealtimeChannel(section.name, channelName)
		if !matches {
			continue
		}
		switch section.values["auth"] {
		case "owner":
			allowed = len(captures) > 0 && captures[0] == strconv.FormatInt(user.ID, 10)
		case "admin":
			allowed = strings.EqualFold(user.Role, "admin")
		default:
			allowed = true
		}
		if allowed {
			break
		}
	}
	if !allowed {
		writeJSON(w, http.StatusForbidden, map[string]string{"message": "Forbidden."})
		return
	}
	var channelData string
	if channelType == "presence" {
		channelDataBytes, err := json.Marshal(map[string]any{
			"user_id":   user.ID,
			"user_info": map[string]any{"name": presenceName(user)},
		})
		if err != nil {
			writeJSON(w, http.StatusInternalServerError, map[string]string{"message": "Unable to encode presence data"})
			return
		}
		channelData = string(channelDataBytes)
	}
	message := socketID + ":" + channel
	if channelData != "" {
		message += ":" + channelData
	}
	mac := hmac.New(sha256.New, []byte(h.realtime.secret))
	_, _ = mac.Write([]byte(message))
	response := map[string]any{"auth": h.realtime.appKey + ":" + hex.EncodeToString(mac.Sum(nil))}
	if channelData != "" {
		response["channel_data"] = channelData
	}
	writeJSON(w, http.StatusOK, response)
}

func presenceName(user authUser) string {
	if user.Name != "" {
		return user.Name
	}
	return user.Email
}

var realtimePlaceholder = regexp.MustCompile(`\{[^}]+\}`)

func matchRealtimeChannel(pattern, channel string) (bool, []string) {
	placeholders := realtimePlaceholder.FindAllString(pattern, -1)
	if len(placeholders) == 0 {
		return pattern == channel, nil
	}
	var expression strings.Builder
	captures := make([]string, 0, len(placeholders))
	offset := 0
	for _, placeholder := range placeholders {
		position := strings.Index(pattern[offset:], placeholder)
		if position < 0 {
			return false, nil
		}
		position += offset
		expression.WriteString(regexp.QuoteMeta(pattern[offset:position]))
		expression.WriteString("([^.]+)")
		offset = position + len(placeholder)
	}
	expression.WriteString(regexp.QuoteMeta(pattern[offset:]))
	matcher, err := regexp.Compile("^" + expression.String() + "$")
	if err != nil {
		return false, nil
	}
	matches := matcher.FindStringSubmatch(channel)
	if matches == nil {
		return false, nil
	}
	captures = append(captures, matches[1:]...)
	return true, captures
}

func resolveBroadcastEvent(registration Registration, channelType string, userID int64) (string, string, bool) {
	for _, section := range parseRealtimeSections(registration.Realtimes) {
		channel := section.values["channel"]
		if channel == "" || section.values["type"] != channelType {
			continue
		}
		resolvedChannel := realtimePlaceholder.ReplaceAllStringFunc(channel, func(placeholder string) string {
			switch strings.Trim(placeholder, "{}") {
			case "id", "user_id":
				if userID > 0 {
					return strconv.FormatInt(userID, 10)
				}
			}
			return ""
		})
		if resolvedChannel == "" || realtimePlaceholder.MatchString(resolvedChannel) {
			continue
		}
		prefix := ""
		if channelType == "private" || channelType == "presence" {
			prefix = channelType + "-"
		}
		return prefix + resolvedChannel, registration.Name + "." + section.name, true
	}
	return "", "", false
}

func (h *Handler) broadcastRealtime(registration Registration, channelType string, userID int64, data any) {
	channel, event, found := resolveBroadcastEvent(registration, channelType, userID)
	if found {
		h.realtime.BroadcastTo(channel, event, data)
	}
}

func nullableString(value string, ok bool) any {
	if !ok {
		return nil
	}
	return value
}
