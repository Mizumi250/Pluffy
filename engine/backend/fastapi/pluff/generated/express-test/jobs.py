# ARKZEN GENERATED JOBS: express-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog


class ProcessDataJob(Job):
    tatemono = "express-test"
    queue = "default"
    tries = 2
    timeout = 20
    async def handle(self):
        Log.info('[Arkzen Job] Running: ProcessDataJob', self.data)


