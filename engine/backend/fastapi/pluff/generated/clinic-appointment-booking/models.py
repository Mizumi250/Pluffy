# ARKZEN GENERATED MODELS: clinic-appointment-booking (FastAPI). Do not edit.
from pluff.runtime import *

class Patient(Model):
    table = "clinic_appointment_booking_patients"
    connection_name = "clinic-appointment-booking"
    fillable = ['first_name', 'last_name', 'email', 'phone_number']
    casts = {'id': 'integer'}
    timestamps = True
    soft_deletes = False



class Appointment(Model):
    table = "clinic_appointment_booking_appointments"
    connection_name = "clinic-appointment-booking"
    fillable = ['patient_id', 'doctor_name', 'date_time', 'status']
    casts = {'id': 'integer', 'date_time': 'datetime'}
    timestamps = True
    soft_deletes = False

    def patient(self):
        return self.belongs_to(ClinicAppointmentBookingPatient, "patient_id")


