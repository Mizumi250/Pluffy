# ARKZEN GENERATED ROUTES: a2ui-lab
from pluff.runtime import *
from .models import Service, RepairTicket, Booking, UnmetRequest
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "a2ui-lab"
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

    r.add("GET", "/api/a2ui-lab/services", [], handle(S, C.ServiceController.index))
    r.add("GET", "/api/a2ui-lab/tickets", [], handle(S, C.RepairTicketController.index))
    r.add("POST", "/api/a2ui-lab/bookings", [], handle(S, C.BookingController.store))
    r.add("POST", "/api/a2ui-lab/plan", [], handle(S, C.AssistantController.plan))
    return r
