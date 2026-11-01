# ARKZEN GENERATED ROUTES: dtr-geofencing
from pluff.runtime import *
from .models import Employee, TimeRecord, DtrSetting
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "dtr-geofencing"
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

    r.add("GET", "/api/dtr/employees", [], handle(S, C.EmployeeController.index))
    r.add("GET", "/api/dtr/employees/{id}", [], handle(S, C.EmployeeController.show))
    r.add("GET", "/api/dtr/records", [], handle(S, C.TimeRecordController.index))
    r.add("GET", "/api/dtr/my-records/{employee_id}", [], handle(S, C.TimeRecordController.my_records))
    r.add("POST", "/api/dtr/check-in", [], handle(S, C.TimeRecordController.check_in))
    r.add("POST", "/api/dtr/check-out", [], handle(S, C.TimeRecordController.check_out))
    r.add("GET", "/api/dtr/settings", [], handle(S, C.DtrSettingController.index))
    r.add("POST", "/api/dtr/settings/toggle-geofencing", [], handle(S, C.DtrSettingController.toggle_geofencing))
    r.add("POST", "/api/dtr/settings/office", [], handle(S, C.DtrSettingController.update_office))
    return r
