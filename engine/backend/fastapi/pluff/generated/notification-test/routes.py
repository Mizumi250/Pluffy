# ARKZEN GENERATED ROUTES: notification-test
from pluff.runtime import *
from .models import User
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "notification-test"
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

    register_auth_routes(r, S, "/api/notification-test", {'notification-test.{id}': {'type': 'private', 'auth': 'owner'}})
    r.add("GET", "/api/notification-test/inbox", [mw("auth")], handle(S, C.NotificationController.index))
    r.add("POST", "/api/notification-test/trigger", [mw("auth")], handle(S, C.NotificationController.store))
    r.add("POST", "/api/notification-test/inbox/read-all", [mw("auth")], handle(S, C.NotificationController.readAll))
    r.add("DELETE", "/api/notification-test/inbox/{id}", [mw("auth")], handle(S, C.NotificationController.destroy))
    return r
