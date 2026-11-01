# ARKZEN GENERATED ROUTES: clinic-appointment-booking
from pluff.runtime import *
from .models import Patient, Appointment
from . import controllers as C
from .middleware import middleware_fns


def build_router():
    S = "clinic-appointment-booking"
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

    r.add("GET", "/api/clinic-appointment-booking/patients/", [], handle(S, C.PatientController.index))
    r.add("POST", "/api/clinic-appointment-booking/patients/", [], handle(S, C.PatientController.store))
    r.add("PUT", "/api/clinic-appointment-booking/patients/{id}", [], handle(S, C.PatientController.update))
    r.add("DELETE", "/api/clinic-appointment-booking/patients/{id}", [], handle(S, C.PatientController.destroy))
    r.add("GET", "/api/clinic-appointment-booking/appointments/", [], handle(S, C.AppointmentController.index))
    r.add("POST", "/api/clinic-appointment-booking/appointments/", [], handle(S, C.AppointmentController.store))
    r.add("PUT", "/api/clinic-appointment-booking/appointments/{id}", [], handle(S, C.AppointmentController.update))
    r.add("DELETE", "/api/clinic-appointment-booking/appointments/{id}", [], handle(S, C.AppointmentController.destroy))
    return r
