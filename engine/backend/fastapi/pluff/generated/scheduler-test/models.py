# ARKZEN GENERATED MODELS: scheduler-test (FastAPI). Do not edit.
from pluff.runtime import *

class CommandRun(Model):
    table = "scheduler_test_command_runs"
    connection_name = "scheduler-test"
    fillable = ['command_name', 'signature', 'exit_code', 'output', 'triggered_by', 'duration_ms']
    casts = {'id': 'integer', 'exit_code': 'integer', 'duration_ms': 'integer'}
    timestamps = True
    soft_deletes = False



