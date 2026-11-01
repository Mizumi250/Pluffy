# ARKZEN GENERATED MODELS: events-test (FastAPI). Do not edit.
from pluff.runtime import *

class EventLog(Model):
    table = "events_test_event_log"
    connection_name = "events-test"
    fillable = ['event_name', 'listener_name', 'status', 'payload', 'duration_ms']
    casts = {'id': 'integer', 'duration_ms': 'integer'}
    timestamps = True
    soft_deletes = False



