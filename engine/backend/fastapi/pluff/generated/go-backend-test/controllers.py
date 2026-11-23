# ARKZEN GENERATED CONTROLLERS: go-backend-test
from pluff.runtime import *
from .models import Note
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class NoteController:
    @staticmethod
    async def index(request, response):
        query = Note.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 10), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'title': 'required|string|max:120', 'body': 'sometimes|nullable|string'})
        note = await Note.create(validated)
        return response.json(note, 201)

    @staticmethod
    async def show(request, response):
        note = await Note.find_or_fail(request.route('id'))
        return response.json(note)

    @staticmethod
    async def update(request, response):
        note = await Note.find_or_fail(request.route('id'))
        validated = await request.validate({'title': 'sometimes|required|string|max:120', 'body': 'sometimes|nullable|string'})
        await note.update(validated)
        return response.json(note)

    @staticmethod
    async def destroy(request, response):
        note = await Note.find_or_fail(request.route('id'))
        await note.delete()
        return response.json({'message': "Note deleted successfully"})


