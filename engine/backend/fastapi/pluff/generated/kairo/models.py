# ARKZEN GENERATED MODELS: kairo (FastAPI). Do not edit.
from pluff.runtime import *

class Chip(Model):
    table = "kairo_chips"
    connection_name = "kairo"
    fillable = ['name', 'author', 'note', 'blueprint']
    casts = {}
    timestamps = True
    soft_deletes = False



