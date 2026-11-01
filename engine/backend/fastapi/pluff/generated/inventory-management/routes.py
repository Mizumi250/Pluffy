# ARKZEN GENERATED ROUTES: inventory-management
from pluff.runtime import *
from .models import Inventory
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "inventory-management"
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

    r.add("GET", "/api/inventories", [], handle(S, C.InventoryController.index))
    r.add("GET", "/api/inventories/low-stock", [], handle(S, C.InventoryController.lowStock))
    r.add("GET", "/api/inventories/{id}", [], handle(S, C.InventoryController.show))
    r.add("POST", "/api/inventories", [], handle(S, C.InventoryController.store))
    r.add("PUT", "/api/inventories/{id}", [], handle(S, C.InventoryController.update))
    r.add("DELETE", "/api/inventories/{id}", [], handle(S, C.InventoryController.destroy))
    return r
