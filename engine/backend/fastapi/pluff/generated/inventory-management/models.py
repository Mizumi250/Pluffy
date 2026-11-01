# ARKZEN GENERATED MODELS: inventory-management (FastAPI). Do not edit.
from pluff.runtime import *

class Inventory(Model):
    table = "inventory_management_inventories"
    connection_name = "inventory-management"
    fillable = ['name', 'sku', 'quantity', 'price', 'category', 'description']
    casts = {'id': 'integer', 'quantity': 'integer', 'price': 'decimal:2'}
    timestamps = True
    soft_deletes = False



