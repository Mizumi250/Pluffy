# ARKZEN GENERATED CONTROLLERS: events-test
from pluff.runtime import *
from .models import EventLog
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class EventLogController:
    @staticmethod
    async def index(request, response):
        query = EventLog.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'event': 'required|string', 'payload': 'nullable|array'})
        event_log = await EventLog.create(validated)
        return response.json(event_log, 201)

    @staticmethod
    async def clearLog(request, response):
        # Custom endpoint: clearLog
        # Add @arkzen:endpoint:py:clearLog ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint clearLog is not implemented yet"}, 501)


