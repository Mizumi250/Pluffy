# ARKZEN GENERATED MODELS: rust-backend-test (FastAPI). Do not edit.
from pluff.runtime import *

class Note(Model):
    table = "rust_backend_test_notes"
    connection_name = "rust-backend-test"
    fillable = ['title', 'body']
    casts = {}
    timestamps = True
    soft_deletes = False



