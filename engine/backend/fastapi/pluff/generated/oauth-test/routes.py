# ARKZEN GENERATED ROUTES: oauth-test
from pluff.runtime import *
from .models import User
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "oauth-test"
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

    register_auth_routes(r, S, "/api/oauth-test", {})
    register_oauth_routes(r, S, "/api/oauth-test", {'providers': ['google', 'github', 'twitter', 'apple', 'microsoft', 'facebook', 'instagram', 'discord'], 'redirect': '/oauth-test/dashboard', 'errorRedirect': '/oauth-test/login', 'linkVerifiedEmail': True})
    return r
