# ARKZEN GENERATED ROUTES: scheduler-test
from pluff.runtime import *
from .models import CommandRun
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "scheduler-test"
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

    r.add("GET", "/api/scheduler-test/runs", [], handle(S, C.CommandRunController.index))
    r.add("POST", "/api/scheduler-test/run", [], handle(S, C.CommandRunController.store))
    r.add("DELETE", "/api/scheduler-test/runs", [], handle(S, C.CommandRunController.destroy))
    return r
