# ARKZEN GENERATED CONTROLLERS: aspnet-ledger
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
    async def accounts(request, response):
        # Custom endpoint: accounts
        # Add @arkzen:endpoint:py:accounts ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint accounts is not implemented yet"}, 501)

    @staticmethod
    async def open(request, response):
        # Custom endpoint: open
        # Add @arkzen:endpoint:py:open ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint open is not implemented yet"}, 501)

    @staticmethod
    async def transfer(request, response):
        # Custom endpoint: transfer
        # Add @arkzen:endpoint:py:transfer ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint transfer is not implemented yet"}, 501)

    @staticmethod
    async def crash(request, response):
        # Custom endpoint: crash
        # Add @arkzen:endpoint:py:crash ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint crash is not implemented yet"}, 501)

    @staticmethod
    async def transfers(request, response):
        # Custom endpoint: transfers
        # Add @arkzen:endpoint:py:transfers ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint transfers is not implemented yet"}, 501)

    @staticmethod
    async def summary(request, response):
        # Custom endpoint: summary
        # Add @arkzen:endpoint:py:summary ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint summary is not implemented yet"}, 501)


