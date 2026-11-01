import json
# ARKZEN GENERATED EVENTS + LISTENERS: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog

from . import models as _models


class TicketCreated(Event):
    tatemono = "fastapi-test"


class LogTicket(Listener):
    async def handle(self, event):
        await EventLog.create({'event_name': 'ticket-created', 'listener': 'LogTicket', 'payload': json.dumps(event.data)})


class CountTicket(Listener):
    async def handle(self, event):
        await EventLog.create({'event_name': 'ticket-created', 'listener': 'CountTicket', 'payload': str(await Ticket.count())})


