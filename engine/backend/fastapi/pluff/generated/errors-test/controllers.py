# ARKZEN GENERATED CONTROLLERS: errors-test
from pluff.runtime import *
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class SimulateController:
    @staticmethod
    async def simulate(request, response, *params):
        return response.json({'message': "Handler simulate is not implemented yet"}, 501)


