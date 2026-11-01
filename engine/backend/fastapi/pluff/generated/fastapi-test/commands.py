# ARKZEN GENERATED COMMANDS: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog


class Ping(Command):
    signature = "fastapi-test:ping"
    description = "Writes a job_results row"
    schedule = '* * * * *'
    async def handle(self):
        await JobResult.create({'job_name': 'ping', 'status': 'ran'})
        self.info('[fastapi-test] ping done')
        return Command.SUCCESS


