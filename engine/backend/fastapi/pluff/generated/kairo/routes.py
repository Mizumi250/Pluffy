# ARKZEN GENERATED ROUTES: kairo
from pluff.runtime import *
from .models import Chip
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "kairo"
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

    r.add("GET", "/api/kairo/chips", [], handle(S, C.ChipController.index))
    r.add("POST", "/api/kairo/chips", [], handle(S, C.ChipController.store))
    return r
