# ARKZEN GENERATED MODELS: express-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("express-test")


class Ticket(Model):
    table = "express_test_tickets"
    connection_name = "express-test"
    fillable = ['user_id', 'title', 'status', 'priority', 'done']
    casts = {'priority': 'integer', 'done': 'boolean'}
    timestamps = True
    soft_deletes = False



class EventLog(Model):
    table = "express_test_event_log"
    connection_name = "express-test"
    fillable = ['event_name', 'listener', 'payload']
    casts = {}
    timestamps = True
    soft_deletes = False



class JobResult(Model):
    table = "express_test_job_results"
    connection_name = "express-test"
    fillable = ['job_name', 'status']
    casts = {}
    timestamps = True
    soft_deletes = False



