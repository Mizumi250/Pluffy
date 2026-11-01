# ARKZEN GENERATED MODELS: roles-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("roles-test")


class RoleAuditLog(Model):
    table = "roles_test_role_audit_logs"
    connection_name = "roles-test"
    fillable = ['user_id', 'action', 'role_required', 'granted']
    casts = {'user_id': 'integer', 'granted': 'boolean'}
    timestamps = True
    soft_deletes = False



