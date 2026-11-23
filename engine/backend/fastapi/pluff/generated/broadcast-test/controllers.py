# ARKZEN GENERATED CONTROLLERS: broadcast-test
from pluff.runtime import *
from .models import User, Message
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class MessageController:
    @staticmethod
    async def index(request, response):
        query = Message.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'content': 'required|string|max:500', 'channel_type': 'sometimes|string|max:50'})
        message = await Message.create(validated)
        channel_type = validated.get('channel_type') or 'public'
        _u = await request.auth_user()
        ev = MessageSentEvents[channel_type](message.to_json())
        ev.user_id = _u.id if _u else None
        broadcast(ev)
        return response.json(message, 201)

    @staticmethod
    async def destroy(request, response):
        message = await Message.find_or_fail(request.route('id'))
        await message.delete()
        return response.json({'message': "Message deleted"})


