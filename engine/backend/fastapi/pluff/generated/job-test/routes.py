# ARKZEN GENERATED ROUTES: job-test
from pluff.runtime import *
from .models import JobResult
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "job-test"
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

    r.add("GET", "/api/job-test/results", [], handle(S, C.JobResultController.index))
    r.add("POST", "/api/job-test/dispatch", [], handle(S, C.JobResultController.store))
    return r
