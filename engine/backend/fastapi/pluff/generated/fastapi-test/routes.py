# ARKZEN GENERATED ROUTES: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "fastapi-test"
    r = Router(S)

    def mw(name):
        if name == 'auth' or name.startswith('auth:'):
            return auth_middleware(S)
        if name.startswith('role:'):
            return role_middleware(*name[5:].split(','))
        fn = middleware_fns.get(name)
        if fn is None:
            raise Exception('Unknown middleware: ' + name)
        return middleware(S, fn)

    register_auth_routes(r, S, "/api/fastapi-test", {'fastapi-test-public': {'type': 'public', 'auth': 'authenticated'}, 'fastapi-test.{id}': {'type': 'private', 'auth': 'owner'}})
    r.add("GET", "/api/fastapi-test/tickets", [mw("auth:sanctum")], handle(S, C.TicketController.index))
    r.add("POST", "/api/fastapi-test/tickets", [mw("auth:sanctum")], handle(S, C.TicketController.store))
    r.add("GET", "/api/fastapi-test/stats", [mw("auth:sanctum")], handle(S, C.TicketController.stats))
    r.add("GET", "/api/fastapi-test/tickets/{id}", [mw("auth:sanctum")], handle(S, C.TicketController.show))
    r.add("PUT", "/api/fastapi-test/tickets/{id}", [mw("auth:sanctum")], handle(S, C.TicketController.update))
    r.add("DELETE", "/api/fastapi-test/tickets/{id}", [mw("auth:sanctum")], handle(S, C.TicketController.destroy))
    r.add("GET", "/api/fastapi-test/ping", [mw("requireJson")], handle(S, C.PingController.index))
    r.add("GET", "/api/fastapi-test/probe/{name}", [], handle(S, lambda rq, rs: C.ProbeController.probe(rq, rs, *rq.route().values())))
    return r
