# ARKZEN GENERATED CONTROLLERS: kairo
from pluff.runtime import *
from .models import Chip
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ChipController:
    @staticmethod
    async def index(request, response):
        query = Chip.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 100), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:60', 'author': 'sometimes|string|max:60', 'note': 'sometimes|string|max:160', 'blueprint': 'required|string'})
        chip = await Chip.create(validated)
        return response.json(chip, 201)


