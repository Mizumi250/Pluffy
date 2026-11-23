# ARKZEN GENERATED MODELS: queue-flow (FastAPI). Do not edit.
from pluff.runtime import *

class Queue(Model):
    table = "queue_flow_queues"
    connection_name = "queue-flow"
    fillable = ['name', 'description', 'prefix', 'is_active', 'avg_wait_minutes']
    casts = {'id': 'integer', 'is_active': 'boolean', 'avg_wait_minutes': 'integer'}
    timestamps = True
    soft_deletes = False

    def queues(self):
        return self.has_many(Ticket, "queue_id")


class Ticket(Model):
    table = "queue_flow_tickets"
    connection_name = "queue-flow"
    fillable = ['queue_id', 'ticket_number', 'customer_name', 'status', 'position', 'called_at', 'served_at']
    casts = {'id': 'integer', 'position': 'integer', 'called_at': 'datetime', 'served_at': 'datetime'}
    timestamps = True
    soft_deletes = False

    def queue(self):
        return self.belongs_to(Queue, "queue_id")


