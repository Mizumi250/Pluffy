# ARKZEN GENERATED ROUTES: body-mail-notification
from pluff.runtime import *
from .models import User, SendLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "body-mail-notification"
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

    register_auth_routes(r, S, "/api/body-mail-notification", {'body-mail-notification.{id}': {'type': 'private', 'auth': 'owner'}})
    r.add("GET", "/api/body-mail-notification/log", [mw("auth")], handle(S, C.SendLogController.index))
    r.add("POST", "/api/body-mail-notification/send-mail", [mw("auth")], handle(S, C.SendLogController.sendMail))
    r.add("POST", "/api/body-mail-notification/notify", [mw("auth")], handle(S, C.SendLogController.notify))
    r.add("DELETE", "/api/body-mail-notification/log/clear", [mw("auth")], handle(S, C.SendLogController.clearLog))
    return r
