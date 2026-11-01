# ARKZEN GENERATED ROUTES: middleware-test
from pluff.runtime import *
from .models import PingLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "middleware-test"
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

    r.add("GET", "/api/middleware-test/ping", [mw("requireJson")], handle(S, C.PingLogController.index))
    r.add("POST", "/api/middleware-test/ping", [mw("requireJson")], handle(S, C.PingLogController.store))
    return r
