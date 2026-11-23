# ARKZEN GENERATED MODELS: go-backend-test (FastAPI). Do not edit.
from pluff.runtime import *

class Note(Model):
    table = "go_backend_test_notes"
    connection_name = "go-backend-test"
    fillable = ['title', 'body']
    casts = {}
    timestamps = True
    soft_deletes = False



