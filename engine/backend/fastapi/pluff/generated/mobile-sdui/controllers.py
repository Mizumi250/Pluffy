# ARKZEN GENERATED CONTROLLERS: mobile-sdui
from pluff.runtime import *
from .models import UiRelease
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class UiReleaseController:
    @staticmethod
    async def index(request, response):
        query = UiRelease.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 100), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'configuration': 'required|string|max:10000', 'activate_at': 'required|string|max:40'})
        ui_release = await UiRelease.create(validated)
        return response.json(ui_release, 201)


