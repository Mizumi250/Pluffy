# ARKZEN GENERATED ROUTES: spring-ledger
from pluff.runtime import *
from .models import Account, Transfer
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "spring-ledger"
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

    r.add("GET", "/api/spring-ledger/accounts", [], handle(S, C.AccountController.index))
    r.add("POST", "/api/spring-ledger/accounts/transfer", [], handle(S, C.AccountController.transfer))
    r.add("GET", "/api/spring-ledger/transfers", [], handle(S, C.TransferController.index))
    return r
