# ARKZEN GENERATED POLICIES: express-test-2
from pluff.runtime import *
from .models import User, TestRecord, UploadedFile, CommandRun, JobResult, EventLog, SendLog


class TestRecordPolicy:
    def view_any(self, user):
        return True

    def view(self, user, test_record):
        return True

    def create(self, user):
        return True

    async def update(self, user, test_record):
        return (user is not None and user.id == test_record.user_id) or (user is not None and user.role == 'admin')

    async def delete(self, user, test_record):
        return (user is not None and user.id == test_record.user_id) or (user is not None and user.role == 'admin')


