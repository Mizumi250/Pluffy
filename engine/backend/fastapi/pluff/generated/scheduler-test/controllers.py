# ARKZEN GENERATED CONTROLLERS: scheduler-test
from pluff.runtime import *
from .models import CommandRun
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class CommandRunController:
    @staticmethod
    async def index(request, response):
        query = CommandRun.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'command': 'required|string', 'triggered_by': 'sometimes|string'})
        signature = {'cleanup-temp': 'scheduler-test:cleanup-temp', 'generate-report': 'scheduler-test:generate-report', 'ping-health': 'scheduler-test:ping-health', 'sync-data': 'scheduler-test:sync-data'}.get(validated['command'])
        entry = commands.get(signature) if signature else None
        if entry is None or entry[0] != "scheduler-test":
            return response.json({'message': 'Invalid command'}, 400)
        started = time.perf_counter()
        output = ''
        try:
            exit_code = await run_command(signature)
        except Exception as exc:
            exit_code = Command.FAILURE
            output = str(exc)
            Log.error(f'{signature}: {exc}')
        command_run = await CommandRun.create({'command_name': validated['command'], 'signature': signature, 'exit_code': exit_code, 'output': output, 'triggered_by': validated.get('triggered_by', 'manual'), 'duration_ms': int((time.perf_counter() - started) * 1000)})
        return response.json(command_run, 201)

    @staticmethod
    async def destroy(request, response):
        command_run = await CommandRun.find_or_fail(request.route('id'))
        await command_run.delete()
        return response.json({'message': "Runs cleared"})


