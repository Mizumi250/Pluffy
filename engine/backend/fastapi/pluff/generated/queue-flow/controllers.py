# ARKZEN GENERATED CONTROLLERS: queue-flow
from pluff.runtime import *
from .models import Queue, Ticket
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class QueueController:
    @staticmethod
    async def index(request, response):
        query = Queue.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def show(request, response):
        queue = await Queue.find_or_fail(request.route('id'))
        return response.json(queue)

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'name': 'required|string|max:255', 'description': 'nullable|string', 'prefix': 'required|string|max:5', 'avg_wait_minutes': 'sometimes|integer|min:1'})
        queue = await Queue.create(validated)
        return response.json(queue, 201)

    @staticmethod
    async def update(request, response):
        queue = await Queue.find_or_fail(request.route('id'))
        validated = await request.validate({'name': 'sometimes|string|max:255', 'is_active': 'sometimes|boolean', 'avg_wait_minutes': 'sometimes|integer|min:1'})
        await queue.update(validated)
        return response.json(queue)

    @staticmethod
    async def destroy(request, response):
        queue = await Queue.find_or_fail(request.route('id'))
        await queue.delete()
        return response.json({'message': "Queue deleted"})


class TicketController:
    @staticmethod
    async def index(request, response):
        query = Ticket.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'queue_id': 'required|integer|exists:queues,id', 'customer_name': 'nullable|string|max:255'})
        ticket = await Ticket.create(validated)
        return response.json(ticket, 201)

    @staticmethod
    async def update(request, response):
        ticket = await Ticket.find_or_fail(request.route('id'))
        validated = await request.validate({'status': 'sometimes|in:waiting,serving,done,skipped'})
        await ticket.update(validated)
        return response.json(ticket)


class QueueController:
    @staticmethod
    async def join_queue(request, response, *params):
        queue_id = request.input('queue_id')
        customer_name = request.input('customer_name', 'Guest')
        queue = await Queue.find_or_fail(queue_id)
        last_position = await Ticket.where('queue_id', queue_id).where_in('status', ['waiting', 'serving']).max('position')
        position = int(last_position or 0) + 1
        ticket = await Ticket.create({
            'queue_id': queue_id,
            'ticket_number': f'{queue.prefix}-{position:03d}',
            'customer_name': customer_name,
            'status': 'waiting',
            'position': position,
        })
        waiting = await Ticket.where('queue_id', queue_id).where('status', 'waiting').where('position', '<', ticket.position).count()
        avg_wait = queue.avg_wait_minutes if queue.avg_wait_minutes is not None else 5
        try:
            broadcast_to('queue-flow.' + str(queue_id), 'queue-flow.queue-updated', {
                'queue_id': queue_id,
                'action': 'joined',
                'ticket': ticket.to_json(),
            }, except_socket_id=request.header('X-Socket-ID'))
        except Exception as exc:
            Log.warn('[QueueFlow] broadcast failed: ' + str(exc))
        return response.json({
            'ticket': ticket,
            'position': waiting + 1,
            'estimated_wait': waiting * avg_wait,
        })

    @staticmethod
    async def call_next(request, response, *params):
        queue_id = request.input('queue_id')
        await Ticket.where('queue_id', queue_id).where('status', 'serving').update({
            'status': 'done',
            'served_at': now(),
        })
        next_ticket = await Ticket.where('queue_id', queue_id).where('status', 'waiting').order_by('position').first()
        if next_ticket is None:
            return response.json({'message': 'No more tickets in queue', 'ticket': None})
        await next_ticket.update({'status': 'serving', 'called_at': now()})
        try:
            broadcast_to('queue-flow.' + str(queue_id), 'queue-flow.queue-updated', {
                'queue_id': queue_id,
                'action': 'called',
                'ticket': next_ticket.to_json(),
            }, except_socket_id=request.header('X-Socket-ID'))
        except Exception as exc:
            Log.warn('[QueueFlow] broadcast failed: ' + str(exc))
        return response.json({'ticket': next_ticket})

    @staticmethod
    async def queue_status(request, response, *params):
        queue_id = params[0] if params else None
        queue = await Queue.find_or_fail(queue_id)
        serving = await Ticket.where('queue_id', queue_id).where('status', 'serving').first()
        waiting = await Ticket.where('queue_id', queue_id).where('status', 'waiting').order_by('position').get()
        done_count = await Ticket.where('queue_id', queue_id).where('status', 'done').count()
        return response.json({
            'queue': queue,
            'serving': serving,
            'waiting': waiting,
            'done_count': done_count,
            'total_waiting': len(waiting),
        })

    @staticmethod
    async def my_ticket(request, response, *params):
        queue_id = params[0] if len(params) > 0 else None
        ticket_number = params[1] if len(params) > 1 else None
        ticket = await Ticket.where('ticket_number', ticket_number).where('queue_id', queue_id).first_or_fail()
        ahead = await Ticket.where('queue_id', queue_id).where('status', 'waiting').where('position', '<', ticket.position).count()
        queue = await Queue.find(queue_id)
        avg_wait = queue.avg_wait_minutes if queue and queue.avg_wait_minutes is not None else 5
        return response.json({
            'ticket': ticket,
            'position': ahead + 1 if ticket.status == 'waiting' else 0,
            'estimated_wait': ahead * avg_wait,
            'is_serving': ticket.status == 'serving',
            'is_done': ticket.status == 'done',
        })


