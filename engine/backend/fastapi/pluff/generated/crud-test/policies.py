# ARKZEN GENERATED POLICIES: crud-test
from pluff.runtime import *
from .models import Item


class ItemPolicy:
    def view_any(self, user):
        return True

    def view(self, user, item):
        return True

    def create(self, user):
        return True

    async def update(self, user, item):
        return item.status != 'archived'

    async def delete(self, user, item):
        return item.status != 'archived'


