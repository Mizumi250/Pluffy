# ARKZEN GENERATED ROUTES: shikaku
from pluff.runtime import *
from .models import User, ShikakuProject, ShikakuSave
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "shikaku"
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

    register_auth_routes(r, S, "/api/shikaku", {})
    r.add("GET", "/api/shikaku/projects/", [mw("auth:sanctum")], handle(S, C.ShikakuProjectController.index))
    r.add("POST", "/api/shikaku/projects/", [mw("auth:sanctum")], handle(S, C.ShikakuProjectController.store))
    r.add("GET", "/api/shikaku/projects/{id}", [mw("auth:sanctum")], handle(S, C.ShikakuProjectController.show))
    r.add("PUT", "/api/shikaku/projects/{id}", [mw("auth:sanctum")], handle(S, C.ShikakuProjectController.update))
    r.add("DELETE", "/api/shikaku/projects/{id}", [mw("auth:sanctum")], handle(S, C.ShikakuProjectController.destroy))
    r.add("POST", "/api/shikaku/projects/{project_id}/save", [mw("auth:sanctum")], handle(S, C.ShikakuSaveController.save))
    r.add("GET", "/api/shikaku/projects/{project_id}/latest", [mw("auth:sanctum")], handle(S, C.ShikakuSaveController.latest))
    return r
