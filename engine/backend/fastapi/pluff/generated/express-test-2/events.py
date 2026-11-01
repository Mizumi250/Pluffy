import json
# ARKZEN GENERATED EVENTS + LISTENERS: express-test-2
from pluff.runtime import *
from .models import User, TestRecord, UploadedFile, CommandRun, JobResult, EventLog, SendLog

from . import models as _models


class RecordCreated(Event):
    tatemono = "express-test-2"


class LogRecordCreated(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "record-created", 'listener': "LogRecordCreated", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] LogRecordCreated', event.data)


class CountRecords(Listener):
    async def handle(self, event):
        EventLog = getattr(_models, 'EventLog', None)
        if EventLog:
            await EventLog.create({'event_name': "record-created", 'listener': "CountRecords", 'payload': json.dumps(event.data)})
        else:
            Log.info('[Arkzen Listener] CountRecords', event.data)


