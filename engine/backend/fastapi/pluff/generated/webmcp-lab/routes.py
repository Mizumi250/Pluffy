# ARKZEN GENERATED ROUTES: webmcp-lab
from pluff.runtime import *
from .models import Service, RepairTicket, Booking
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "webmcp-lab"
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

    r.add("GET", "/api/webmcp-lab/services", [], handle(S, C.ServiceController.index))
    r.add("GET", "/api/webmcp-lab/tickets", [], handle(S, C.RepairTicketController.index))
    r.add("POST", "/api/webmcp-lab/bookings", [], handle(S, C.BookingController.store))
    return r
