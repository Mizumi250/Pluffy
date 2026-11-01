# ARKZEN GENERATED JOBS: job-test
from pluff.runtime import *
from .models import JobResult


class ProcessDataJob(Job):
    tatemono = "job-test"
    queue = "default"
    tries = 3
    timeout = 30
    async def handle(self):
        import asyncio

        loop = asyncio.get_running_loop()
        start = loop.time()
        await asyncio.sleep(2)
        await JobResult.create({
            'job_name': 'process-data',
            'status': 'completed',
            'result': f'Data processed successfully in {round((loop.time() - start) * 1000)}ms',
            'processed_at': now(),
        })


class HeavyComputationJob(Job):
    tatemono = "job-test"
    queue = "heavy"
    tries = 1
    timeout = 120
    async def handle(self):
        import asyncio

        loop = asyncio.get_running_loop()
        start = loop.time()
        await asyncio.sleep(5)
        await JobResult.create({
            'job_name': 'heavy-computation',
            'status': 'completed',
            'result': f'Heavy computation completed in {round((loop.time() - start) * 1000)}ms',
            'processed_at': now(),
        })


class AlwaysFailsJob(Job):
    tatemono = "job-test"
    queue = "default"
    tries = 2
    timeout = 10
    async def handle(self):
        raise Exception('This job always fails')


