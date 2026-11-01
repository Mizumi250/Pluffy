# ARKZEN GENERATED MODELS: body-endpoint-handler (FastAPI). Do not edit.
from pluff.runtime import *

class ProbeResult(Model):
    table = "body_endpoint_handler_probe_results"
    connection_name = "body-endpoint-handler"
    fillable = ['source', 'probe', 'payload', 'result', 'ok']
    casts = {'id': 'integer', 'ok': 'boolean'}
    timestamps = True
    soft_deletes = False



