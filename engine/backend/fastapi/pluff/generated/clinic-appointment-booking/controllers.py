# ARKZEN GENERATED CONTROLLERS: clinic-appointment-booking
from pluff.runtime import *
from .models import Patient, Appointment
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class PatientController:
    @staticmethod
    async def index(request, response):
        query = Patient.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'first_name': 'required|string|max:255', 'last_name': 'required|string|max:255', 'email': 'required|email|unique:patients,email', 'phone_number': 'sometimes|string|max:15'})
        patient = await Patient.create(validated)
        return response.json(patient, 201)

    @staticmethod
    async def update(request, response):
        patient = await Patient.find_or_fail(request.route('id'))
        validated = await request.validate({'first_name': 'sometimes|string|max:255', 'last_name': 'sometimes|string|max:255', 'email': 'sometimes|email|unique:patients,email', 'phone_number': 'sometimes|string|max:15'})
        await patient.update(validated)
        return response.json(patient)

    @staticmethod
    async def destroy(request, response):
        patient = await Patient.find_or_fail(request.route('id'))
        await patient.delete()
        return response.json({'message': "Patient deleted"})


class AppointmentController:
    @staticmethod
    async def index(request, response):
        query = Appointment.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'patient_id': 'required|integer|exists:patients,id', 'doctor_name': 'required|string|max:255', 'date_time': 'required|date_format:Y-m-d H:i:s', 'status': 'sometimes|string|in:pending,completed,cancelled'})
        appointment = await Appointment.create(validated)
        return response.json(appointment, 201)

    @staticmethod
    async def update(request, response):
        appointment = await Appointment.find_or_fail(request.route('id'))
        validated = await request.validate({'doctor_name': 'nullable|string|max:255', 'date_time': 'nullable|date_format:Y-m-d H:i:s', 'status': 'nullable|string|in:pending,completed,cancelled'})
        await appointment.update(validated)
        return response.json(appointment)

    @staticmethod
    async def destroy(request, response):
        appointment = await Appointment.find_or_fail(request.route('id'))
        await appointment.delete()
        return response.json({'message': "Appointment deleted"})


