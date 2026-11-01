# ARKZEN GENERATED ROUTES: crud-test
from pluff.runtime import *
from .models import Item
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "crud-test"
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

    r.add("GET", "/api/crud-test/items", [], handle(S, C.ItemController.index))
    r.add("POST", "/api/crud-test/items", [], handle(S, C.ItemController.store))
    r.add("GET", "/api/crud-test/items/{id}", [], handle(S, C.ItemController.show))
    r.add("PUT", "/api/crud-test/items/{id}", [], handle(S, C.ItemController.update))
    r.add("DELETE", "/api/crud-test/items/{id}", [], handle(S, C.ItemController.destroy))
    return r
