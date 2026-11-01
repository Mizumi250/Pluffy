# ARKZEN GENERATED ROUTES: broadcast-test
from pluff.runtime import *
from .models import User, Message
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "broadcast-test"
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

    register_auth_routes(r, S, "/api/broadcast-test", {'broadcast-test-public': {'type': 'public', 'auth': 'authenticated'}, 'broadcast-test.{id}': {'type': 'private', 'auth': 'authenticated'}, 'broadcast-test-presence': {'type': 'presence', 'auth': 'authenticated'}})
    r.add("GET", "/api/broadcast-test/messages", [], handle(S, C.MessageController.index))
    r.add("POST", "/api/broadcast-test/messages", [optional_auth(S)], handle(S, C.MessageController.store))
    r.add("DELETE", "/api/broadcast-test/messages/{id}", [], handle(S, C.MessageController.destroy))
    return r
