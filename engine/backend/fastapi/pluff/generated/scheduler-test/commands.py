# ARKZEN GENERATED COMMANDS: scheduler-test
from pluff.runtime import *
from .models import CommandRun


class CleanupTemp(Command):
    signature = "scheduler-test:cleanup-temp"
    description = "Deletes temporary files older than 24h"
    schedule = '0 * * * *'
    async def handle(self):
        import time

        start = time.perf_counter()
        self.info('[Arkzen:scheduler-test] Running cleanup-temp...')
        await CommandRun.create({
            'command_name': 'cleanup-temp',
            'signature': 'scheduler-test:cleanup-temp',
            'exit_code': 0,
            'output': 'Cleanup completed successfully.',
            'triggered_by': 'schedule',
            'duration_ms': int((time.perf_counter() - start) * 1000),
        })
        self.info('[Arkzen:scheduler-test] ✓ Done')
        return Command.SUCCESS


class GenerateReport(Command):
    signature = "scheduler-test:generate-report"
    description = "Generates a daily activity report"
    schedule = '0 8 * * *'
    async def handle(self):
        import time

        start = time.perf_counter()
        self.info('[Arkzen:scheduler-test] Generating report...')
        await CommandRun.create({
            'command_name': 'generate-report',
            'signature': 'scheduler-test:generate-report',
            'exit_code': 0,
            'output': 'Daily report generated successfully.',
            'triggered_by': 'schedule',
            'duration_ms': int((time.perf_counter() - start) * 1000),
        })
        self.info('[Arkzen:scheduler-test] ✓ Done')
        return Command.SUCCESS


class PingHealth(Command):
    signature = "scheduler-test:ping-health"
    description = "Pings all services and records health status"
    schedule = '0-59/5 * * * *'
    async def handle(self):
        import time

        start = time.perf_counter()
        self.info('[Arkzen:scheduler-test] Pinging services...')
        await CommandRun.create({
            'command_name': 'ping-health',
            'signature': 'scheduler-test:ping-health',
            'exit_code': 0,
            'output': 'All services healthy.',
            'triggered_by': 'schedule',
            'duration_ms': int((time.perf_counter() - start) * 1000),
        })
        self.info('[Arkzen:scheduler-test] ✓ Done')
        return Command.SUCCESS


class SyncData(Command):
    signature = "scheduler-test:sync-data"
    description = "Syncs data from external source"
    schedule = '0-59/15 * * * *'
    async def handle(self):
        import time

        start = time.perf_counter()
        self.info('[Arkzen:scheduler-test] Syncing data...')
        await CommandRun.create({
            'command_name': 'sync-data',
            'signature': 'scheduler-test:sync-data',
            'exit_code': 0,
            'output': 'Data synced successfully.',
            'triggered_by': 'schedule',
            'duration_ms': int((time.perf_counter() - start) * 1000),
        })
        self.info('[Arkzen:scheduler-test] ✓ Done')
        return Command.SUCCESS


