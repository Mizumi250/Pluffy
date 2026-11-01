# ARKZEN GENERATED ROUTES: ollama-studio
from pluff.runtime import *
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "ollama-studio"
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

    r.add("POST", "/api/ollama-studio/chat", [], handle(S, C.AssistantController.chat))
    return r
