# ARKZEN GENERATED ROUTES: upload-test
from pluff.runtime import *
from .models import UploadedFile
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "upload-test"
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

    r.add("GET", "/api/upload-test/files", [], handle(S, C.UploadedFileController.index))
    r.add("POST", "/api/upload-test/files", [], handle(S, C.UploadedFileController.store))
    r.add("DELETE", "/api/upload-test/files/{id}", [], handle(S, C.UploadedFileController.destroy))
    r.add("GET", "/api/upload-test/files/{id}/url", [], handle(S, C.UploadedFileController.fileUrl))
    return r
