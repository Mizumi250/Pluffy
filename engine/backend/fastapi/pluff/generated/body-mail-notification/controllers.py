# ARKZEN GENERATED CONTROLLERS: body-mail-notification
from pluff.runtime import *
from .models import User, SendLog
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class SendLogController:
    @staticmethod
    async def index(request, response):
        query = SendLog.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def sendMail(request, response):
        validated = await request.validate({
            'mail': 'required|string|in:welcome,receipt,alert',
            'to': 'required|email',
        })
        mail_key = validated['mail']
        mail_class = mail_classes.get(mail_key)
        if mail_class is None:
            return response.json({'message': 'Unknown mail type: ' + mail_key}, 422)
        mail_data = {
            'welcome': ['Test User', 'Arkzen'],
            'receipt': ['ORD-001', '$9.99', 'Arkzen Test Item'],
            'alert': ['This is a test alert from Arkzen.', '/'],
        }
        user = await request.auth_user()
        try:
            await Mail.to(validated['to']).send(mail_class(*mail_data[mail_key]))
            log = await SendLog.create({
                'user_id': user.id if user else None,
                'to_email': validated['to'],
                'subject': mail_key,
                'mail_class': mail_class.__name__,
                'kind': 'mail',
                'status': 'sent',
            })
            return response.json(log, 201)
        except Exception as exc:
            log = await SendLog.create({
                'user_id': user.id if user else None,
                'to_email': validated['to'],
                'subject': mail_key,
                'mail_class': mail_class.__name__,
                'kind': 'mail',
                'status': 'failed',
                'error': str(exc),
            })
            return response.json(log, 201)

    @staticmethod
    async def notify(request, response):
        validated = await request.validate({
            'notification': 'required|string|in:action-required,summary',
            'message': 'sometimes|string|max:255',
        })
        user = await request.auth_user()
        notification_class = notification_classes.get(validated['notification'])
        if notification_class is None:
            return response.json({'message': 'Unknown notification type: ' + validated['notification']}, 422)
        try:
            notification = notification_class(user)
            if 'message' in validated:
                notification.message = validated['message']
                notification.data['message'] = validated['message']
                notification.to_database = lambda _notifiable: {
                    'message': notification.message,
                    'type': type(notification).__name__,
                }
            await notify(user, notification)
            log = await SendLog.create({
                'user_id': user.id if user else None,
                'to_email': user.email if user else None,
                'subject': validated['notification'],
                'mail_class': notification_class.__name__,
                'kind': 'notification',
                'status': 'sent',
            })
            return response.json(log, 201)
        except Exception as exc:
            log = await SendLog.create({
                'user_id': user.id if user else None,
                'to_email': user.email if user else None,
                'subject': validated['notification'],
                'mail_class': notification_class.__name__,
                'kind': 'notification',
                'status': 'failed',
                'error': str(exc),
            })
            return response.json(log, 201)

    @staticmethod
    async def clearLog(request, response):
        user = await request.auth_user()
        await SendLog.where('user_id', user.id if user else None).delete()
        return response.json({'message': 'Log cleared'})


