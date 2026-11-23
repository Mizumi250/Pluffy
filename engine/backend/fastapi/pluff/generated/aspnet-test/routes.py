# ARKZEN GENERATED ROUTES: aspnet-test
from pluff.runtime import *
from .models import User, Check, AuditLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "aspnet-test"
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

    register_auth_routes(r, S, "/api/aspnet-test", {})
    r.add("GET", "/api/aspnet-test/checks", [mw("auth:sanctum")], handle(S, C.CheckController.index))
    r.add("POST", "/api/aspnet-test/checks", [mw("auth:sanctum")], handle(S, C.CheckController.store))
    r.add("GET", "/api/aspnet-test/stats", [mw("auth:sanctum")], handle(S, C.CheckController.stats))
    r.add("GET", "/api/aspnet-test/checks/{id}", [mw("auth:sanctum")], handle(S, C.CheckController.show))
    r.add("PUT", "/api/aspnet-test/checks/{id}", [mw("auth:sanctum")], handle(S, C.CheckController.update))
    r.add("DELETE", "/api/aspnet-test/checks/{id}", [mw("auth:sanctum")], handle(S, C.CheckController.destroy))
    r.add("POST", "/api/aspnet-test/checks/{id}/pass", [mw("auth:sanctum")], handle(S, C.CheckController.pass))
    r.add("GET", "/api/aspnet-test/health", [], handle(S, C.PublicController.health))
    r.add("GET", "/api/aspnet-test/ping", [mw("requireJson")], handle(S, C.PingController.ping))
    r.add("GET", "/api/aspnet-test/admin/audit", [mw("auth:sanctum"), mw("role:admin")], handle(S, C.AdminController.audit))
    r.add("GET", "/api/aspnet-test/probe/{name}", [], handle(S, lambda rq, rs: C.ProbeController.probe(rq, rs, *rq.route().values())))
    return r
