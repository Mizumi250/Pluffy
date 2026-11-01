# ARKZEN GENERATED MODELS: crud-test (FastAPI). Do not edit.
from pluff.runtime import *

class Item(Model):
    table = "crud_test_items"
    connection_name = "crud-test"
    fillable = ['name', 'description', 'status', 'priority', 'tags']
    casts = {'id': 'integer', 'priority': 'integer'}
    timestamps = True
    soft_deletes = False



