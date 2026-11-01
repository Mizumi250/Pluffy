# ARKZEN GENERATED CONTROLLERS: roles-test
from pluff.runtime import *
from .models import User, RoleAuditLog
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class RoleAuditLogController:
    @staticmethod
    async def index(request, response):
        query = RoleAuditLog.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def adminOnly(request, response):
        user = request.user()
        granted = bool(user) and user.role == 'admin'
        await RoleAuditLog.create({'user_id': user.id if user else None, 'action': 'GET /admin-only', 'role_required': 'admin', 'granted': granted})
        if not granted:
            return response.json({'message': '\u2717 Access denied \u2014 admin role required'}, 403)
        return response.json({'message': '\u2713 Access granted \u2014 you are admin'})

    @staticmethod
    async def userOnly(request, response):
        user = request.user()
        await RoleAuditLog.create({'user_id': user.id if user else None, 'action': 'GET /user-only', 'role_required': 'user', 'granted': True})
        return response.json({'message': '\u2713 Access granted \u2014 open to all authenticated users'})

    @staticmethod
    async def promote(request, response):
        user = request.user()
        await user.update({'role': 'admin'})
        return response.json({'message': 'Promoted to admin', 'user': await user.fresh()})

    @staticmethod
    async def demote(request, response):
        user = request.user()
        await user.update({'role': 'user'})
        return response.json({'message': 'Demoted to user', 'user': await user.fresh()})


