import json
# ARKZEN GENERATED EVENTS + LISTENERS: events-test
from pluff.runtime import *
from .models import EventLog

from . import models as _models


class UserSignedUp(Event):
    tatemono = "events-test"


class SendWelcomeEmail(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'UserSignedUp',
            'listener_name': 'SendWelcomeEmail',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class UpdateUserStats(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'UserSignedUp',
            'listener_name': 'UpdateUserStats',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class NotifyAdmins(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'UserSignedUp',
            'listener_name': 'NotifyAdmins',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class OrderPlaced(Event):
    tatemono = "events-test"


class ProcessPayment(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'OrderPlaced',
            'listener_name': 'ProcessPayment',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class UpdateInventory(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'OrderPlaced',
            'listener_name': 'UpdateInventory',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class SendOrderConfirmation(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'OrderPlaced',
            'listener_name': 'SendOrderConfirmation',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class DataExported(Event):
    tatemono = "events-test"


class LogExportActivity(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'DataExported',
            'listener_name': 'LogExportActivity',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


class CleanupTempFiles(Listener):
    async def handle(self, event):
        await EventLog.create({
            'event_name': 'DataExported',
            'listener_name': 'CleanupTempFiles',
            'status': 'completed',
            'payload': json.dumps(event.data),
        })


