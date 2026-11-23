# ARKZEN GENERATED MODELS: go-concurrency-lab (FastAPI). Do not edit.
from pluff.runtime import *

class Task(Model):
    table = "go_concurrency_lab_tasks"
    connection_name = "go-concurrency-lab"
    fillable = ['title', 'priority', 'status']
    casts = {'priority': 'integer'}
    timestamps = True
    soft_deletes = False



