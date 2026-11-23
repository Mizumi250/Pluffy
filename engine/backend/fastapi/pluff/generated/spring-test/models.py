# ARKZEN GENERATED MODELS: spring-test (FastAPI). Do not edit.
from pluff.runtime import *

class Note(Model):
    table = "spring_test_notes"
    connection_name = "spring-test"
    fillable = ['title', 'body', 'pinned']
    casts = {'id': 'integer', 'pinned': 'boolean'}
    timestamps = True
    soft_deletes = False



