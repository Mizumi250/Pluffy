# ARKZEN GENERATED POLICIES: aspnet-test
from pluff.runtime import *
from .models import User, Check, AuditLog


class CheckPolicy:
    def view_any(self, user):
        return True

    def view(self, user, check):
        return True

    def create(self, user):
        return True

    async def update(self, user, check):
        return (user is not None and user.id == check.user_id) or (user is not None and user.role == 'admin')

    async def delete(self, user, check):
        return (user is not None and user.id == check.user_id) or (user is not None and user.role == 'admin')


