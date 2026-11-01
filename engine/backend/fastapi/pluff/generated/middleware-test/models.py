# ARKZEN GENERATED MODELS: middleware-test (FastAPI). Do not edit.
from pluff.runtime import *

class PingLog(Model):
    table = "middleware_test_ping_logs"
    connection_name = "middleware-test"
    fillable = ['message', 'headers_ok']
    casts = {'headers_ok': 'boolean'}
    timestamps = True
    soft_deletes = False



