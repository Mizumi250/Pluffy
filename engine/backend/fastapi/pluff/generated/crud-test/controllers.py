# ARKZEN GENERATED CONTROLLERS: crud-test
from pluff.runtime import *
from .models import Item
import json
import time
from urllib.parse import quote
from .policies import ItemPolicy
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ItemController:
    @staticmethod
    async def index(request, response):
        query = Item.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        await authorize(request, ItemPolicy, "create")
        validated = await request.validate({'name': 'required|string|max:255', 'description': 'nullable|string', 'status': 'sometimes|string|in:active,pending,archived', 'priority': 'sometimes|integer|min:0', 'tags': 'nullable|string'})
        item = await Item.create(validated)
        return response.json(item, 201)

    @staticmethod
    async def show(request, response):
        item = await Item.find_or_fail(request.route('id'))
        return response.json(item)

    @staticmethod
    async def update(request, response):
        item = await Item.find_or_fail(request.route('id'))
        await authorize(request, ItemPolicy, "update", item)
        validated = await request.validate({'name': 'sometimes|string|max:255', 'description': 'nullable|string', 'status': 'sometimes|string|in:active,pending,archived', 'priority': 'sometimes|integer|min:0', 'tags': 'nullable|string'})
        await item.update(validated)
        return response.json(item)

    @staticmethod
    async def destroy(request, response):
        item = await Item.find_or_fail(request.route('id'))
        await authorize(request, ItemPolicy, "delete", item)
        await item.delete()
        return response.json({'message': "Item deleted"})


