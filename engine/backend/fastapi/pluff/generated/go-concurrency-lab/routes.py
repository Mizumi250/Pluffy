# ARKZEN GENERATED ROUTES: go-concurrency-lab
from pluff.runtime import *
from .models import Task
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "go-concurrency-lab"
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

    r.add("GET", "/api/go-concurrency-lab/tasks", [], handle(S, C.TaskController.index))
    r.add("POST", "/api/go-concurrency-lab/tasks", [], handle(S, C.TaskController.store))
    return r
