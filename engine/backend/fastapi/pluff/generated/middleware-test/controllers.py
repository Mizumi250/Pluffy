# ARKZEN GENERATED CONTROLLERS: middleware-test
from pluff.runtime import *
from .models import PingLog
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class PingLogController:
    @staticmethod
    async def index(request, response):
        query = PingLog.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'message': 'required|string|max:255', 'headers_ok': 'sometimes|boolean'})
        ping_log = await PingLog.create(validated)
        return response.json(ping_log, 201)


