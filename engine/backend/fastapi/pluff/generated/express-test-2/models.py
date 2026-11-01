# ARKZEN GENERATED MODELS: express-test-2 (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("express-test-2")


class TestRecord(Model):
    table = "express_test_2_records"
    connection_name = "express-test-2"
    fillable = ['user_id', 'title', 'status', 'priority', 'done']
    casts = {'priority': 'integer', 'done': 'boolean'}
    timestamps = True
    soft_deletes = True



class UploadedFile(Model):
    table = "express_test_2_uploaded_files"
    connection_name = "express-test-2"
    fillable = ['user_id', 'original_name', 'stored_name', 'mime_type', 'size_bytes', 'disk_path', 'is_image']
    casts = {'size_bytes': 'integer', 'is_image': 'boolean'}
    timestamps = True
    soft_deletes = False



class CommandRun(Model):
    table = "express_test_2_command_runs"
    connection_name = "express-test-2"
    fillable = ['command_name', 'signature', 'exit_code', 'output', 'triggered_by', 'duration_ms']
    casts = {'exit_code': 'integer', 'duration_ms': 'integer'}
    timestamps = True
    soft_deletes = False



class JobResult(Model):
    table = "express_test_2_job_results"
    connection_name = "express-test-2"
    fillable = ['job_name', 'status', 'result']
    casts = {}
    timestamps = True
    soft_deletes = False



class EventLog(Model):
    table = "express_test_2_event_log"
    connection_name = "express-test-2"
    fillable = ['event_name', 'listener', 'payload']
    casts = {}
    timestamps = True
    soft_deletes = False



class SendLog(Model):
    table = "express_test_2_send_log"
    connection_name = "express-test-2"
    fillable = ['user_id', 'channel', 'target', 'status']
    casts = {}
    timestamps = True
    soft_deletes = False



