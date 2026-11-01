# ARKZEN GENERATED MODELS: job-test (FastAPI). Do not edit.
from pluff.runtime import *

class JobResult(Model):
    table = "job_test_job_results"
    connection_name = "job-test"
    fillable = ['job_name', 'status', 'result', 'processed_at']
    casts = {'id': 'integer', 'processed_at': 'datetime'}
    timestamps = True
    soft_deletes = False



