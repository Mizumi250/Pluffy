import json
# ARKZEN GENERATED EVENTS + LISTENERS: events-test
from pluff.runtime import *
from .models import EventLog

from . import models as _models


class UserSignedUp(Event):
    tatemono = "events-test"


class SendWelcomeEmail(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "user-signed-up", 'listener': "SendWelcomeEmail", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] SendWelcomeEmail', event.data)


class UpdateUserStats(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "user-signed-up", 'listener': "UpdateUserStats", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] UpdateUserStats', event.data)


class NotifyAdmins(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "user-signed-up", 'listener': "NotifyAdmins", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] NotifyAdmins', event.data)


class OrderPlaced(Event):
    tatemono = "events-test"


class ProcessPayment(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "order-placed", 'listener': "ProcessPayment", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] ProcessPayment', event.data)


class UpdateInventory(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "order-placed", 'listener': "UpdateInventory", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] UpdateInventory', event.data)


class SendOrderConfirmation(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "order-placed", 'listener': "SendOrderConfirmation", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] SendOrderConfirmation', event.data)


class DataExported(Event):
    tatemono = "events-test"


class LogExportActivity(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "data-exported", 'listener': "LogExportActivity", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] LogExportActivity', event.data)


class CleanupTempFiles(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "data-exported", 'listener': "CleanupTempFiles", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] CleanupTempFiles', event.data)


