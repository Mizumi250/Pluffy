# ARKZEN GENERATED MODELS: a2ui-lab (FastAPI). Do not edit.
from pluff.runtime import *

class Service(Model):
    table = "a2ui_lab_services"
    connection_name = "a2ui-lab"
    fillable = ['name', 'price_idr', 'minutes', 'note']
    casts = {'price_idr': 'integer', 'minutes': 'integer'}
    timestamps = True
    soft_deletes = False



class RepairTicket(Model):
    table = "a2ui_lab_repair_tickets"
    connection_name = "a2ui-lab"
    fillable = ['code', 'customer', 'bike', 'status', 'note', 'ready_by']
    casts = {}
    timestamps = True
    soft_deletes = False



class Booking(Model):
    table = "a2ui_lab_bookings"
    connection_name = "a2ui-lab"
    fillable = ['name', 'service', 'day', 'slot']
    casts = {}
    timestamps = True
    soft_deletes = False



class UnmetRequest(Model):
    table = "a2ui_lab_unmet_requests"
    connection_name = "a2ui-lab"
    fillable = ['message', 'source']
    casts = {}
    timestamps = True
    soft_deletes = False



