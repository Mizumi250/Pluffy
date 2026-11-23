# ARKZEN GENERATED MODELS: aspnet-ledger (FastAPI). Do not edit.
from pluff.runtime import *

class Account(Model):
    table = "aspnet_ledger_accounts"
    connection_name = "aspnet-ledger"
    fillable = ['owner', 'balance']
    casts = {'id': 'integer', 'balance': 'decimal:2'}
    timestamps = True
    soft_deletes = False



class Transfer(Model):
    table = "aspnet_ledger_transfers"
    connection_name = "aspnet-ledger"
    fillable = ['from_account_id', 'to_account_id', 'amount', 'status', 'memo']
    casts = {'id': 'integer', 'from_account_id': 'integer', 'to_account_id': 'integer', 'amount': 'decimal:2'}
    timestamps = True
    soft_deletes = False



