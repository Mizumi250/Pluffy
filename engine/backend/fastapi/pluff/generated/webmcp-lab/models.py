# ARKZEN GENERATED MODELS: webmcp-lab (FastAPI). Do not edit.
from pluff.runtime import *

class Service(Model):
    table = "webmcp_lab_services"
    connection_name = "webmcp-lab"
    fillable = ['name', 'price_idr', 'minutes', 'note']
    casts = {'price_idr': 'integer', 'minutes': 'integer'}
    timestamps = True
    soft_deletes = False



class RepairTicket(Model):
    table = "webmcp_lab_repair_tickets"
    connection_name = "webmcp-lab"
    fillable = ['code', 'customer', 'bike', 'status', 'note', 'ready_by']
    casts = {}
    timestamps = True
    soft_deletes = False



class Booking(Model):
    table = "webmcp_lab_bookings"
    connection_name = "webmcp-lab"
    fillable = ['name', 'service', 'day', 'slot']
    casts = {}
    timestamps = True
    soft_deletes = False



