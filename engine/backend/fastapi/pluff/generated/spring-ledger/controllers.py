# ARKZEN GENERATED CONTROLLERS: spring-ledger
from pluff.runtime import *
from .models import Account, Transfer
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class AccountController:
    @staticmethod
    async def index(request, response):
        query = Account.query()
        return response.json(await query.order_by('created_at', 'desc').get())

    @staticmethod
    async def transfer(request, response):
        # Custom endpoint: transfer
        # Add @arkzen:endpoint:py:transfer ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint transfer is not implemented yet"}, 501)


class TransferController:
    @staticmethod
    async def index(request, response):
        query = Transfer.query()
        return response.json(await query.order_by('created_at', 'desc').get())


