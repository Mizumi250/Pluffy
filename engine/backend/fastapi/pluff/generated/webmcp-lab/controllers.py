# ARKZEN GENERATED CONTROLLERS: webmcp-lab
from pluff.runtime import *
from .models import Service, RepairTicket, Booking
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ServiceController:
    @staticmethod
    async def index(request, response):
        query = Service.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 50), request.input('page', 1), request.url()))


class RepairTicketController:
    @staticmethod
    async def index(request, response):
        query = RepairTicket.query()
        if request.filled("code"):
            query.where("code", request.input("code"))
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 5), request.input('page', 1), request.url()))


class BookingController:
    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:80', 'service': 'required|string|max:80', 'day': 'required|string|max:10', 'slot': 'required|string|max:5'})
        booking = await Booking.create(validated)
        return response.json(booking, 201)


