# ARKZEN GENERATED CONTROLLERS: aspnet-test
from pluff.runtime import *
from .models import User, Check, AuditLog
import json
import time
from urllib.parse import quote
from .policies import CheckPolicy
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class CheckController:
    @staticmethod
    async def index(request, response):
        query = Check.query()
        if request.filled('search'):
            term = '%' + str(request.input('search')) + '%'
            def _search(w):
                w.or_where('name', 'like', term)
                w.or_where('description', 'like', term)
            query.where(_search)
        if request.filled("status"):
            query.where("status", request.input("status"))
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 10), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        await authorize(request, CheckPolicy, "create")
        validated = await request.validate({'name': 'required|string|max:120', 'status': 'sometimes|string|in:pending,passed,failed', 'priority': 'sometimes|integer|min:1', 'done': 'sometimes|boolean', 'user_id': 'sometimes|integer'})
        check = await Check.create(validated)
        return response.json(check, 201)

    @staticmethod
    async def show(request, response):
        check = await Check.find_or_fail(request.route('id'))
        return response.json(check)

    @staticmethod
    async def update(request, response):
        check = await Check.find_or_fail(request.route('id'))
        await authorize(request, CheckPolicy, "update", check)
        validated = await request.validate({'name': 'sometimes|string|max:120', 'status': 'sometimes|string|in:pending,passed,failed', 'priority': 'sometimes|integer|min:1', 'done': 'sometimes|boolean'})
        await check.update(validated)
        return response.json(check)

    @staticmethod
    async def destroy(request, response):
        check = await Check.find_or_fail(request.route('id'))
        await authorize(request, CheckPolicy, "delete", check)
        await check.delete()
        return response.json({'message': "Check deleted successfully"})

    @staticmethod
    async def pass(request, response):
        # Custom endpoint: pass
        # Add @arkzen:endpoint:py:pass ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint pass is not implemented yet"}, 501)

    @staticmethod
    async def stats(request, response):
        # Custom endpoint: stats
        # Add @arkzen:endpoint:py:stats ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint stats is not implemented yet"}, 501)


class PublicController:
    @staticmethod
    async def health(request, response):
        # Custom endpoint: health
        # Add @arkzen:endpoint:py:health ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint health is not implemented yet"}, 501)


class PingController:
    @staticmethod
    async def ping(request, response):
        # Custom endpoint: ping
        # Add @arkzen:endpoint:py:ping ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint ping is not implemented yet"}, 501)


class AdminController:
    @staticmethod
    async def audit(request, response):
        # Custom endpoint: audit
        # Add @arkzen:endpoint:py:audit ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint audit is not implemented yet"}, 501)


class ProbeController:
    @staticmethod
    async def probe(request, response, *params):
        return response.json({'message': "Handler probe is not implemented yet"}, 501)


