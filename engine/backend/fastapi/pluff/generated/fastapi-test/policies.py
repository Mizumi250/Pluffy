# ARKZEN GENERATED POLICIES: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog


class TicketPolicy:
    def view_any(self, user):
        return True

    def view(self, user, ticket):
        return True

    def create(self, user):
        return True

    async def update(self, user, ticket):
        return (user is not None and user.id == ticket.user_id) or (user is not None and user.role == 'admin')

    async def delete(self, user, ticket):
        return user is not None and user.role == 'admin'


