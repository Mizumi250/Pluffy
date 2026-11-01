# ARKZEN GENERATED CONTROLLERS: inventory-management
from pluff.runtime import *
from .models import Inventory
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class InventoryController:
    @staticmethod
    async def index(request, response):
        query = Inventory.query()
        if request.filled('search'):
            term = '%' + str(request.input('search')) + '%'
            def _search(w):
                w.or_where('name', 'like', term)
                w.or_where('description', 'like', term)
            query.where(_search)
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def show(request, response):
        inventory = await Inventory.find_or_fail(request.route('id'))
        return response.json(inventory)

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:255', 'sku': 'required|string|unique:inventories', 'quantity': 'required|integer|min:0', 'price': 'required|numeric|min:0', 'category': 'nullable|string|max:100', 'description': 'nullable|string'})
        inventory = await Inventory.create(validated)
        return response.json(inventory, 201)

    @staticmethod
    async def update(request, response):
        inventory = await Inventory.find_or_fail(request.route('id'))
        validated = await request.validate({'name': 'sometimes|string|max:255', 'quantity': 'sometimes|integer|min:0', 'price': 'sometimes|numeric|min:0', 'category': 'nullable|string|max:100', 'description': 'nullable|string'})
        await inventory.update(validated)
        return response.json(inventory)

    @staticmethod
    async def destroy(request, response):
        inventory = await Inventory.find_or_fail(request.route('id'))
        await inventory.delete()
        return response.json({'message': "Item deleted successfully"})


