# ARKZEN GENERATED ROUTES: jo-payroll
from pluff.runtime import *
from .models import JobOrder
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "jo-payroll"
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

    r.add("GET", "/api/jo-payroll/job-orders", [], handle(S, C.JobOrderController.index))
    r.add("POST", "/api/jo-payroll/job-orders", [], handle(S, C.JobOrderController.store))
    r.add("GET", "/api/jo-payroll/job-orders/{id}", [], handle(S, C.JobOrderController.show))
    r.add("PUT", "/api/jo-payroll/job-orders/{id}", [], handle(S, C.JobOrderController.update))
    r.add("DELETE", "/api/jo-payroll/job-orders/{id}", [], handle(S, C.JobOrderController.destroy))
    r.add("GET", "/api/jo-payroll/job-orders/stats/summary", [], handle(S, C.JobOrderController.summary))
    r.add("GET", "/api/jo-payroll/job-orders/group/{group}", [], handle(S, C.JobOrderController.byGroup))
    r.add("GET", "/api/jo-payroll/job-orders/appointments/list", [], handle(S, C.JobOrderController.appointments))
    return r
