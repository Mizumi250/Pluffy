# ARKZEN GENERATED ROUTES: roles-test
from pluff.runtime import *
from .models import User, RoleAuditLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "roles-test"
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

    register_auth_routes(r, S, "/api/roles-test", {})
    r.add("GET", "/api/roles-test/logs", [mw("auth")], handle(S, C.RoleAuditLogController.index))
    r.add("GET", "/api/roles-test/admin-only", [mw("auth")], handle(S, C.RoleAuditLogController.adminOnly))
    r.add("GET", "/api/roles-test/user-only", [mw("auth")], handle(S, C.RoleAuditLogController.userOnly))
    r.add("POST", "/api/roles-test/promote", [mw("auth")], handle(S, C.RoleAuditLogController.promote))
    r.add("POST", "/api/roles-test/demote", [mw("auth")], handle(S, C.RoleAuditLogController.demote))
    return r
