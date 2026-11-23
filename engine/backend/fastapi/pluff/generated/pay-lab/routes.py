# ARKZEN GENERATED ROUTES: pay-lab
from pluff.runtime import *
from .models import Product, Order, OrderItem, WebhookEvent
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "pay-lab"
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

    r.add("GET", "/api/pay-lab/products", [], handle(S, C.ProductController.index))
    r.add("POST", "/api/pay-lab/checkout", [], handle(S, C.OrderController.checkout))
    r.add("GET", "/api/pay-lab/status", [], handle(S, C.OrderController.status))
    r.add("POST", "/api/pay-lab/webhook", [], handle(S, C.OrderController.webhook))
    return r
