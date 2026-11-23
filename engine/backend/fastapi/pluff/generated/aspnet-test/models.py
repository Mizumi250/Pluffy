# ARKZEN GENERATED MODELS: aspnet-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("aspnet-test")


class Check(Model):
    table = "aspnet_test_checks"
    connection_name = "aspnet-test"
    fillable = ['user_id', 'name', 'status', 'priority', 'done']
    casts = {'id': 'integer', 'priority': 'integer', 'done': 'boolean'}
    timestamps = True
    soft_deletes = False



class AuditLog(Model):
    table = "aspnet_test_audit_logs"
    connection_name = "aspnet-test"
    fillable = ['action', 'check_id', 'actor', 'detail']
    casts = {'id': 'integer', 'check_id': 'integer'}
    timestamps = True
    soft_deletes = False



