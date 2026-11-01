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
        validated = await request.validate({
            'content': 'required|string|max:500',
            'channel_type': 'sometimes|string|max:50',
        })
        channel_type = validated.get('channel_type') or 'public'
        event_class = MessageSentEvents.get(channel_type)
        if event_class is None:
            raise HttpException(422, 'channel_type must be public, private, or presence.')
        message = await Message.create({**validated, 'channel_type': channel_type})
        user = await request.auth_user()
        broadcast_event = event_class(message.to_json())
        broadcast_event.user_id = user.id if user else None
        broadcast(broadcast_event)
        return response.json(message, 201)

    @staticmethod
    async def destroy(request, response):
        message = await Message.find_or_fail(request.route('id'))
        await message.delete()
        return response.json({'message': "Message deleted"})


