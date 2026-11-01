# ARKZEN GENERATED CONTROLLERS: express-test-2
from pluff.runtime import *
from .models import User, TestRecord, UploadedFile, CommandRun, JobResult, EventLog, SendLog
import json
import time
from urllib.parse import quote
from .policies import TestRecordPolicy
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class RecordController:
    @staticmethod
    async def index(request, response):
        query = TestRecord.query()
        if request.filled('search'):
            term = '%' + str(request.input('search')) + '%'
            def _search(w):
                w.or_where('name', 'like', term)
                w.or_where('description', 'like', term)
            query.where(_search)
        if request.filled("status"):
            query.where("status", request.input("status"))
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 10), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        await authorize(request, TestRecordPolicy, "create")
        validated = await request.validate({'title': 'required|string|max:255', 'status': 'sometimes|string|in:open,closed', 'priority': 'sometimes|integer|min:1', 'done': 'sometimes|boolean'})
        test_record = await TestRecord.create(validated)
        return response.json(test_record, 201)

    @staticmethod
    async def show(request, response):
        test_record = await TestRecord.find_or_fail(request.route('id'))
        return response.json(test_record)

    @staticmethod
    async def update(request, response):
        test_record = await TestRecord.find_or_fail(request.route('id'))
        await authorize(request, TestRecordPolicy, "update", test_record)
        validated = await request.validate({'title': 'sometimes|string|max:255', 'status': 'sometimes|string|in:open,closed'})
        await test_record.update(validated)
        return response.json(test_record)

    @staticmethod
    async def destroy(request, response):
        test_record = await TestRecord.find_or_fail(request.route('id'))
        await authorize(request, TestRecordPolicy, "delete", test_record)
        await test_record.delete()
        return response.json({'message': "TestRecord deleted"})

    @staticmethod
    async def stats(request, response):
        # Custom endpoint: stats
        # Add @arkzen:endpoint:py:stats ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint stats is not implemented yet"}, 501)


class UploadedFileController:
    @staticmethod
    async def index(request, response):
        records = await UploadedFile.latest().get()
        for record in records:
            record.url = '/storage/' + str(record.disk_path).lstrip('/') if record.is_image else None
        return response.json({'data': records})

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'files': 'required|array', 'files.*': 'file|max:10240'})
        user = request.user() or await request.auth_user()
        uploaded = []
        for file in request.files('files'):
            stored_name = Storage.put("arkzen/express-test-2", file)
            is_image = str(file.get('mimetype', '')).startswith('image/')
            record = await UploadedFile.create({'user_id': user.id if user else None, 'original_name': file['originalname'], 'stored_name': stored_name.rsplit('/', 1)[-1], 'mime_type': file.get('mimetype', 'application/octet-stream'), 'size_bytes': file['size'], 'disk_path': stored_name, 'is_image': is_image})
            if is_image:
                record.url = '/storage/' + stored_name.lstrip('/')
            uploaded.append(record)
        return response.json({'data': uploaded}, 201)

    @staticmethod
    async def destroy(request, response):
        uploaded_file = await UploadedFile.find_or_fail(request.route('id'))
        Storage.delete(uploaded_file.disk_path)
        await uploaded_file.delete()
        return response.json({'message': 'File deleted'})

    @staticmethod
    async def fileUrl(request, response):
        uploaded_file = await UploadedFile.find_or_fail(request.route('id'))
        disk_path = uploaded_file.disk_path
        if not Storage.exists(disk_path):
            return response.json({'message': 'File not found'}, 404)
        return RawResponse(Storage.read(disk_path), headers={'Content-Type': uploaded_file.mime_type or 'application/octet-stream', 'Content-Disposition': 'attachment; filename*=UTF-8\'\'' + quote(uploaded_file.original_name or 'download', safe='')})


class CommandController:
    @staticmethod
    async def index(request, response):
        query = CommandRun.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'command': 'required|string', 'triggered_by': 'sometimes|string'})
        signature = {}.get(validated['command'])
        entry = commands.get(signature) if signature else None
        if entry is None or entry[0] != "express-test-2":
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


class DispatchController:
    @staticmethod
    async def store(request, response):
        validated = await request.validate({'job': 'required|string'})
        job_result = await JobResult.create(validated)
        return response.json(job_result, 201)


class EventController:
    @staticmethod
    async def store(request, response):
        validated = await request.validate({'event': 'required|string', 'payload': 'sometimes|array'})
        event_log = await EventLog.create(validated)
        return response.json(event_log, 201)


class MessagingController:
    @staticmethod
    async def broadcast(request, response):
        # Custom endpoint: broadcast
        # Add @arkzen:endpoint:py:broadcast ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint broadcast is not implemented yet"}, 501)

    @staticmethod
    async def sendMail(request, response):
        # Custom endpoint: sendMail
        # Add @arkzen:endpoint:py:sendMail ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint sendMail is not implemented yet"}, 501)

    @staticmethod
    async def notify(request, response):
        # Custom endpoint: notify
        # Add @arkzen:endpoint:py:notify ... :end to your tatemono to inject logic.
        return response.json({'message': "Endpoint notify is not implemented yet"}, 501)


class ExpressParityController:
    @staticmethod
    async def health(request, response, *params):
        return response.json({'message': "Handler health is not implemented yet"}, 501)

    @staticmethod
    async def echo(request, response, *params):
        return response.json({'message': "Handler echo is not implemented yet"}, 501)


