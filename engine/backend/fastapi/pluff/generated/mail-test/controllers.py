# ARKZEN GENERATED CONTROLLERS: mail-test
from pluff.runtime import *
from .models import User, MailLog
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class MailLogController:
    @staticmethod
    async def index(request, response):
        query = MailLog.query()
        return response.json(await query.order_by('created_at', 'desc').get())

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'mail': 'required|string', 'to': 'required|email', 'data': 'array'})
        user = await request.auth_user()
        Cls = mail_classes.get(validated['mail'])
        if Cls is None:
            raise Exception('Unknown mail type: ' + str(validated['mail']))
        await Mail.to(validated['to']).send(Cls(*list((validated.get('data') or {}).values())))
        mail_log = await MailLog.create({'user_id': user.id if user else None, 'to_email': validated['to'], 'subject': Cls.subject or validated['mail'], 'mail_class': Cls.__name__, 'status': 'sent'})
        return response.json(mail_log, 201)


