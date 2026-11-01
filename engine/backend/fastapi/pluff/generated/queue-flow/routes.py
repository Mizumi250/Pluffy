# ARKZEN GENERATED ROUTES: queue-flow
from pluff.runtime import *
from .models import Queue, Ticket
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "queue-flow"
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

    r.add("GET", "/api/queue-flow/queues", [], handle(S, C.QueueController.index))
    r.add("POST", "/api/queue-flow/queues", [], handle(S, C.QueueController.store))
    r.add("GET", "/api/queue-flow/queues/{id}", [], handle(S, C.QueueController.show))
    r.add("PUT", "/api/queue-flow/queues/{id}", [], handle(S, C.QueueController.update))
    r.add("DELETE", "/api/queue-flow/queues/{id}", [], handle(S, C.QueueController.destroy))
    r.add("GET", "/api/queue-flow/tickets", [], handle(S, C.TicketController.index))
    r.add("POST", "/api/queue-flow/tickets", [], handle(S, C.TicketController.store))
    r.add("PUT", "/api/queue-flow/tickets/{id}", [], handle(S, C.TicketController.update))
    r.add("POST", "/api/queue-flow/join", [], handle(S, lambda rq, rs: C.QueueControllerCustomRoutes.join_queue(rq, rs, *rq.route().values())))
    r.add("POST", "/api/queue-flow/call-next", [], handle(S, lambda rq, rs: C.QueueControllerCustomRoutes.call_next(rq, rs, *rq.route().values())))
    r.add("GET", "/api/queue-flow/status/{queue_id}", [], handle(S, lambda rq, rs: C.QueueControllerCustomRoutes.queue_status(rq, rs, *rq.route().values())))
    r.add("GET", "/api/queue-flow/my-ticket/{queue_id}/{ticket_number}", [], handle(S, lambda rq, rs: C.QueueControllerCustomRoutes.my_ticket(rq, rs, *rq.route().values())))
    return r
