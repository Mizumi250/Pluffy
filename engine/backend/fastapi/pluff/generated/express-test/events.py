import json
# ARKZEN GENERATED EVENTS + LISTENERS: express-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog

from . import models as _models


class TicketCreated(Event):
    tatemono = "express-test"


class LogTicket(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "ticket-created", 'listener': "LogTicket", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] LogTicket', event.data)


class CountTicket(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "ticket-created", 'listener': "CountTicket", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] CountTicket', event.data)


