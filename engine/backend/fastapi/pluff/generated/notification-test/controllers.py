# ARKZEN GENERATED CONTROLLERS: notification-test
from pluff.runtime import *
from .models import User
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class NotificationController:
    @staticmethod
    async def index(request, response):
        user = request.user()
        db = connection(request.slug)
        table = prefixed_table(request.slug, 'notifications')
        records = await db.table(table).where('notifiable_type', 'user').where('notifiable_id', user.id).latest().get()
        for record in records:
            record['data'] = json.loads(record['data']) if isinstance(record.get('data'), str) else record.get('data', {})
        return response.json({'data': records})

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'notification': 'required|string'})
        user = request.user()
        Cls = notification_classes.get(validated['notification'])
        if Cls is None:
            raise Exception('Unknown notification type: ' + str(validated['notification']))
        await notify(user, Cls(user))
        return response.json({'message': 'Notification triggered successfully', 'type': validated['notification']}, 201)

    @staticmethod
    async def destroy(request, response):
        user = request.user()
        db = connection(request.slug)
        table = prefixed_table(request.slug, 'notifications')
        record = await db.table(table).where('id', request.route('id')).where('notifiable_type', 'user').where('notifiable_id', user.id).first()
        if record is None:
            raise ModelNotFoundException('Notification')
        await db.table(table).where('id', record['id']).delete()
        return response.json({'message': 'Notification deleted'})

    @staticmethod
    async def readAll(request, response):
        user = request.user()
        db = connection(request.slug)
        table = prefixed_table(request.slug, 'notifications')
        db.execute(f'UPDATE {qi(table)} SET {qi("read_at")} = :now WHERE {qi("notifiable_type")} = :kind AND {qi("notifiable_id")} = :user_id AND {qi("read_at")} IS NULL', {'now': sql_now(), 'kind': 'user', 'user_id': user.id})
        return response.json({'message': 'All notifications marked as read'})


