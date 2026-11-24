package backend

import "testing"

func TestNotificationChannelsFollowTheModuleSlug(t *testing.T) {
	if got := notificationBroadcastChannel("fastapi-test", "public", 7); got != "fastapi-test.notifications" {
		t.Fatalf("public channel = %q", got)
	}
	if got := notificationBroadcastChannel("fastapi-test", "private", 7); got != "private-fastapi-test.7" {
		t.Fatalf("private channel = %q", got)
	}

	registration := Registration{Name: "fastapi-test", Auth: true, Notifications: []string{"db-ping:\n  channels: [broadcast]\n  channel_type: private"}}
	if !notificationChannelAuthorized(registration, "private", "fastapi-test.7", 7) {
		t.Fatal("owner should be authorized on their own notification channel")
	}
	if notificationChannelAuthorized(registration, "private", "fastapi-test.8", 7) {
		t.Fatal("another user's channel must be rejected")
	}
	if notificationChannelAuthorized(registration, "presence", "fastapi-test.7", 7) {
		t.Fatal("presence is not declared, must be rejected")
	}
	registration.Auth = false
	if notificationChannelAuthorized(registration, "private", "fastapi-test.7", 7) {
		t.Fatal("modules without auth must be rejected")
	}
}
