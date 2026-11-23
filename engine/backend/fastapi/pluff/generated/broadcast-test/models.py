# ARKZEN GENERATED MODELS: broadcast-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("broadcast-test")


class Message(Model):
    table = "broadcast_test_messages"
    connection_name = "broadcast-test"
    fillable = ['user_id', 'content', 'channel_type']
    casts = {'id': 'integer', 'user_id': 'integer'}
    timestamps = True
    soft_deletes = False



