# ARKZEN GENERATED ROUTES: aspnet-ledger
from pluff.runtime import *
from .models import Account, Transfer
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "aspnet-ledger"
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

    r.add("GET", "/api/aspnet-ledger/accounts", [], handle(S, C.AccountController.accounts))
    r.add("POST", "/api/aspnet-ledger/accounts", [], handle(S, C.AccountController.open))
    r.add("POST", "/api/aspnet-ledger/transfer", [], handle(S, C.AccountController.transfer))
    r.add("POST", "/api/aspnet-ledger/transfer/crash", [], handle(S, C.AccountController.crash))
    r.add("GET", "/api/aspnet-ledger/transfers", [], handle(S, C.AccountController.transfers))
    r.add("GET", "/api/aspnet-ledger/summary", [], handle(S, C.AccountController.summary))
    return r
