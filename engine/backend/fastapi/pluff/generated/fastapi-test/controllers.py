# ARKZEN GENERATED CONTROLLERS: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog
import json
import time
from urllib.parse import quote
from .policies import TicketPolicy
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class TicketController:
    @staticmethod
    async def index(request, response):
        query = Ticket.query()
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
        await authorize(request, TicketPolicy, "create")
        validated = await request.validate({'title': 'required|string|max:255', 'status': 'sometimes|string|in:open,closed', 'priority': 'sometimes|integer|min:1', 'done': 'sometimes|boolean', 'user_id': 'sometimes|integer'})
        ticket = await Ticket.create(validated)
        return response.json(ticket, 201)

    @staticmethod
    async def show(request, response):
        ticket = await Ticket.find_or_fail(request.route('id'))
        return response.json(ticket)

    @staticmethod
    async def update(request, response):
        ticket = await Ticket.find_or_fail(request.route('id'))
        await authorize(request, TicketPolicy, "update", ticket)
        validated = await request.validate({'title': 'sometimes|string|max:255', 'status': 'sometimes|string|in:open,closed'})
        await ticket.update(validated)
        return response.json(ticket)

    @staticmethod
    async def destroy(request, response):
        ticket = await Ticket.find_or_fail(request.route('id'))
        await authorize(request, TicketPolicy, "delete", ticket)
        await ticket.delete()
        return response.json({'message': "Ticket deleted"})

    @staticmethod
    async def stats(request, response):
        total = await Ticket.count()
        open_count = await Ticket.where('status', 'open').count()
        return response.json({'total': total, 'open': open_count, 'closed': total - open_count, 'by': request.user().email})


class PingController:
    @staticmethod
    async def index(request, response):
        query = JobResult.query()
        return response.json(await query.order_by('created_at', 'desc').get())


class ProbeController:
    @staticmethod
    async def probe(request, response, *params):
        return response.json({'probe': request.route('name'), 'params': list(params), 'at': 'fastapi'})


