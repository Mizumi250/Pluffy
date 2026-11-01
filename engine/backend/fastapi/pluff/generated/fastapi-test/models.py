# ARKZEN GENERATED MODELS: fastapi-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("fastapi-test")


class Ticket(Model):
    table = "fastapi_test_tickets"
    connection_name = "fastapi-test"
    fillable = ['user_id', 'title', 'status', 'priority', 'done']
    casts = {'priority': 'integer', 'done': 'boolean'}
    timestamps = True
    soft_deletes = False



class EventLog(Model):
    table = "fastapi_test_event_log"
    connection_name = "fastapi-test"
    fillable = ['event_name', 'listener', 'payload']
    casts = {}
    timestamps = True
    soft_deletes = False



class JobResult(Model):
    table = "fastapi_test_job_results"
    connection_name = "fastapi-test"
    fillable = ['job_name', 'status']
    casts = {}
    timestamps = True
    soft_deletes = False



