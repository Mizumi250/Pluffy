// Package modulespec is the compile-time contract between generated tatemono
// modules and the engine. Generated packages import ONLY this package (plus
// net/http and the chi router), never internal/backend — so the engine can
// evolve without breaking stored generated modules.
package modulespec

import "net/http"

// EndpointSpec describes one endpoint of an api block, CRUD or custom.
// Operation is "index"/"show"/"store"/"update"/"destroy" for CRUD, or the
// DSL operation name for body-injected endpoints (Body set). Type carries
// engine capability kinds (job_dispatch, mail_send, command_run,
// event_fire, broadcast, notification_trigger); empty for plain endpoints.
type EndpointSpec struct {
	Operation     string
	Method        string
	Path          string
	Paginated     bool
	Validation    map[string]string
	Body          string // base64 :go endpoint body; empty for CRUD
	Type          string
	ResponseType  string
	ResponseValue string
}

// APIModule identifies the owning module for a route call: its isolated
// database module name, primary table, DSL middleware, soft-delete flag,
// and policy snippets.
type APIModule struct {
	Name        string
	Table       string
	Middleware  []string
	SoftDeletes bool
	Policies    map[string]string // action ("update"/"delete") → base64 Go expression
}

// Services is the engine-facing interface handed to generated modules at
// install time. Every method registers compiled routes on the live chi
// router — no runtime path dispatch happens for module routes anymore.
type Services interface {
	// CRUD handlers — compiled routes delegate here; semantics come from
	// the endpoint spec captured at generation time.
	List(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)
	Read(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)
	Create(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)
	Modify(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)
	Remove(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)

	// Custom executes a base64 :go endpoint/handler body on the engine's
	// yaegi runtime with the standard binding surface.
	Custom(w http.ResponseWriter, r *http.Request, module APIModule, spec EndpointSpec)

	// BroadcastPoll serves GET /api/<module>/sse-poll/{channelType} for
	// modules that declare broadcast-type endpoints.
	BroadcastPoll(w http.ResponseWriter, r *http.Request, module APIModule)

	// Fallback answers requests that match no compiled module route. It
	// serves engine-owned dynamic paths (module auth routes) and otherwise
	// writes the standard 404 JSON envelope.
	Fallback(w http.ResponseWriter, r *http.Request)
}
