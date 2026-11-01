# ARKZEN GENERATED CONTROLLERS: events-test
from pluff.runtime import *
from .models import EventLog
import json
import time
from urllib.parse import quote
from . import events as GeneratedEvents
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class EventLogController:
    @staticmethod
    async def index(request, response):
        results = await EventLog.query().latest().paginate(
            request.input('per_page', 100),
            request.input('page', 1),
            request.url(),
        )
        return response.json(results)

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'event': 'required|string', 'payload': 'nullable|array'})
        event_class = {"user-signed-up": GeneratedEvents.UserSignedUp, "order-placed": GeneratedEvents.OrderPlaced, "data-exported": GeneratedEvents.DataExported}.get(str(validated['event']).replace('_', '-'))
        if event_class is None:
            return response.json({'message': 'Unknown event: ' + str(validated['event'])}, 400)
        await event(event_class(validated.get('payload') or {}))
        return response.json({'message': 'Event fired'}, 202)

    @staticmethod
    async def clearLog(request, response):
        await EventLog.query().delete()
        return response.json({'message': 'Log cleared'})


