# ARKZEN GENERATED JOBS: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog


class ProcessDataJob(Job):
    tatemono = "fastapi-test"
    queue = "default"
    tries = 2
    timeout = 20
    async def handle(self):
        Log.info('[Arkzen Job] Running: ProcessDataJob', self.data)


class RecordResultJob(Job):
    tatemono = "fastapi-test"
    queue = "default"
    tries = 2
    timeout = 20
    async def handle(self):
        mode = (self.data or {}).get('mode', 'default')
        await JobResult.create({'job_name': 'record-result', 'status': 'completed:' + mode})


