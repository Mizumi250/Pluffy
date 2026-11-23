# ARKZEN GENERATED MODELS: spring-ledger (FastAPI). Do not edit.
from pluff.runtime import *

class Account(Model):
    table = "spring_ledger_accounts"
    connection_name = "spring-ledger"
    fillable = ['name', 'balance']
    casts = {'id': 'integer', 'balance': 'decimal:2'}
    timestamps = True
    soft_deletes = False

    def from_accounts(self):
        return self.has_many(Transfer, "from_account_id")

    def to_accounts(self):
        return self.has_many(Transfer, "to_account_id")


class Transfer(Model):
    table = "spring_ledger_transfers"
    connection_name = "spring-ledger"
    fillable = ['from_account_id', 'to_account_id', 'amount', 'status']
    casts = {'id': 'integer', 'amount': 'decimal:2'}
    timestamps = True
    soft_deletes = False

    def from_account(self):
        return self.belongs_to(Account, "from_account_id")

    def to_account(self):
        return self.belongs_to(Account, "to_account_id")


