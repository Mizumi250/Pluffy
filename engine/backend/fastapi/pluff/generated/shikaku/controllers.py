# ARKZEN GENERATED CONTROLLERS: shikaku
from pluff.runtime import *
from .models import User, ShikakuProject, ShikakuSave
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ShikakuProjectController:
    @staticmethod
    async def index(request, response):
        query = ShikakuProject.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:255', 'width': 'required|integer|in:8,16,32,64,128', 'height': 'required|integer|in:8,16,32,64,128'})
        shikaku_project = await ShikakuProject.create(validated)
        return response.json(shikaku_project, 201)

    @staticmethod
    async def show(request, response):
        shikaku_project = await ShikakuProject.find_or_fail(request.route('id'))
        return response.json(shikaku_project)

    @staticmethod
    async def update(request, response):
        shikaku_project = await ShikakuProject.find_or_fail(request.route('id'))
        validated = await request.validate({'name': 'sometimes|string|max:255', 'thumbnail': 'sometimes|nullable|string'})
        await shikaku_project.update(validated)
        return response.json(shikaku_project)

    @staticmethod
    async def destroy(request, response):
        shikaku_project = await ShikakuProject.find_or_fail(request.route('id'))
        await shikaku_project.delete()
        return response.json({'message': "Project deleted"})


class ShikakuSaveController:
    @staticmethod
    async def save(request, response):
        # Custom endpoint: save
        # Add @arkzen:endpoint:py:save ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint save is not implemented yet"}, 501)

    @staticmethod
    async def latest(request, response):
        # Custom endpoint: latest
        # Add @arkzen:endpoint:py:latest ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint latest is not implemented yet"}, 501)


