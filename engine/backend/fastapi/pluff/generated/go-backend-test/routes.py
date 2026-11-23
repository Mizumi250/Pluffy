# ARKZEN GENERATED ROUTES: go-backend-test
from pluff.runtime import *
from .models import Note
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "go-backend-test"
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

    r.add("GET", "/api/go-backend-test/notes", [], handle(S, C.NoteController.index))
    r.add("POST", "/api/go-backend-test/notes", [], handle(S, C.NoteController.store))
    r.add("GET", "/api/go-backend-test/notes/{id}", [], handle(S, C.NoteController.show))
    r.add("PUT", "/api/go-backend-test/notes/{id}", [], handle(S, C.NoteController.update))
    r.add("DELETE", "/api/go-backend-test/notes/{id}", [], handle(S, C.NoteController.destroy))
    return r
