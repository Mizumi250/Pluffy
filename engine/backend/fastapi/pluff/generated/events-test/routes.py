# ARKZEN GENERATED ROUTES: events-test
from pluff.runtime import *
from .models import EventLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "events-test"
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

    r.add("GET", "/api/events-test/log", [], handle(S, C.EventLogController.index))
    r.add("POST", "/api/events-test/fire", [], handle(S, C.EventLogController.store))
    r.add("POST", "/api/events-test/log/clear", [], handle(S, C.EventLogController.clearLog))
    return r
