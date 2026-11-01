# ARKZEN GENERATED ROUTES: express-test-2
from pluff.runtime import *
from .models import User, TestRecord, UploadedFile, CommandRun, JobResult, EventLog, SendLog
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "express-test-2"
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

    register_auth_routes(r, S, "/api/express-test-2", {'express-test-2-public': {'type': 'public', 'auth': 'authenticated'}, 'express-test-2.{id}': {'type': 'private', 'auth': 'owner'}})
    r.add("GET", "/api/express-test-2/records", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.index))
    r.add("POST", "/api/express-test-2/records", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.store))
    r.add("GET", "/api/express-test-2/records/{id}", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.show))
    r.add("PUT", "/api/express-test-2/records/{id}", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.update))
    r.add("DELETE", "/api/express-test-2/records/{id}", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.destroy))
    r.add("GET", "/api/express-test-2/records/stats", [mw("auth:sanctum"), mw("jsonOnly")], handle(S, C.RecordController.stats))
    r.add("GET", "/api/express-test-2/files", [mw("auth:sanctum")], handle(S, C.UploadedFileController.index))
    r.add("POST", "/api/express-test-2/files", [mw("auth:sanctum")], handle(S, C.UploadedFileController.store))
    r.add("DELETE", "/api/express-test-2/files/{id}", [mw("auth:sanctum")], handle(S, C.UploadedFileController.destroy))
    r.add("GET", "/api/express-test-2/files/{id}/url", [mw("auth:sanctum")], handle(S, C.UploadedFileController.fileUrl))
    r.add("GET", "/api/express-test-2/commands", [mw("auth:sanctum")], handle(S, C.CommandController.index))
    r.add("POST", "/api/express-test-2/commands/run", [mw("auth:sanctum")], handle(S, C.CommandController.store))
    r.add("POST", "/api/express-test-2/jobs/dispatch", [mw("auth:sanctum")], handle(S, C.DispatchController.store))
    r.add("POST", "/api/express-test-2/events/fire", [mw("auth:sanctum")], handle(S, C.EventController.store))
    r.add("POST", "/api/express-test-2/broadcast", [mw("auth:sanctum")], handle(S, C.MessagingController.broadcast))
    r.add("POST", "/api/express-test-2/mail", [mw("auth:sanctum")], handle(S, C.MessagingController.sendMail))
    r.add("POST", "/api/express-test-2/notify", [mw("auth:sanctum")], handle(S, C.MessagingController.notify))
    r.add("GET", "/api/express-test-2/health/{name}", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.ExpressParityController.health(rq, rs, *rq.route().values())))
    r.add("POST", "/api/express-test-2/echo", [mw("auth:sanctum")], handle(S, lambda rq, rs: C.ExpressParityController.echo(rq, rs, *rq.route().values())))
    return r
