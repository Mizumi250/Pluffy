# ARKZEN GENERATED CONTROLLERS: go-concurrency-lab
from pluff.runtime import *
from .models import Task
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class TaskController:
    @staticmethod
    async def index(request, response):
        query = Task.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'title': 'required|string|max:120', 'priority': 'required|integer|min:1|max:5', 'status': 'required|in:queued,done'})
        task = await Task.create(validated)
        return response.json(task, 201)


