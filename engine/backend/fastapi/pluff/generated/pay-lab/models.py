# ARKZEN GENERATED MODELS: pay-lab (FastAPI). Do not edit.
from pluff.runtime import *

class Product(Model):
    table = "pay_lab_products"
    connection_name = "pay-lab"
    fillable = ['slug', 'name', 'region', 'notes', 'roast', 'price_cents', 'accent', 'ink']
    casts = {'roast': 'integer', 'price_cents': 'integer'}
    timestamps = True
    soft_deletes = False



class Order(Model):
    table = "pay_lab_orders"
    connection_name = "pay-lab"
    fillable = ['public_id', 'status', 'total_cents', 'currency', 'idempotency_key', 'fingerprint', 'provider_session_id', 'checkout_url']
    casts = {'total_cents': 'integer'}
    timestamps = True
    soft_deletes = False



class OrderItem(Model):
    table = "pay_lab_order_items"
    connection_name = "pay-lab"
    fillable = ['order_id', 'product_slug', 'name', 'unit_cents', 'quantity']
    casts = {'order_id': 'integer', 'unit_cents': 'integer', 'quantity': 'integer'}
    timestamps = True
    soft_deletes = False



class WebhookEvent(Model):
    table = "pay_lab_webhook_events"
    connection_name = "pay-lab"
    fillable = ['event_id', 'type', 'order_public_id']
    casts = {}
    timestamps = True
    soft_deletes = False



