# ARKZEN GENERATED ROUTES: body-endpoint-handler
from pluff.runtime import *
from .models import ProbeResult
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "body-endpoint-handler"
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

    r.add("GET", "/api/body-endpoint-handler/probes", [], handle(S, C.ProbeResultController.index))
    r.add("POST", "/api/body-endpoint-handler/probes", [], handle(S, C.ProbeResultController.store))
    r.add("POST", "/api/body-endpoint-handler/echo", [], handle(S, C.ProbeResultController.echo))
    r.add("GET", "/api/body-endpoint-handler/stats", [], handle(S, C.ProbeResultController.stats))
    r.add("DELETE", "/api/body-endpoint-handler/probes/{id}", [], handle(S, C.ProbeResultController.destroy))
    r.add("GET", "/api/body-endpoint-handler/ping", [], handle(S, lambda rq, rs: C.ProbeUtilController.ping(rq, rs, *rq.route().values())))
    r.add("POST", "/api/body-endpoint-handler/record-handler", [], handle(S, lambda rq, rs: C.ProbeUtilController.recordHandler(rq, rs, *rq.route().values())))
    r.add("GET", "/api/body-endpoint-handler/latest", [], handle(S, lambda rq, rs: C.ProbeUtilController.latest(rq, rs, *rq.route().values())))
    return r
