# ARKZEN GENERATED CONTROLLERS: body-endpoint-handler
from pluff.runtime import *
from .models import ProbeResult
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class ProbeResultController:
    @staticmethod
    async def index(request, response):
        query = ProbeResult.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'source': 'required|string|max:50', 'probe': 'required|string|max:100', 'payload': 'nullable|string'})
        probe_result = await ProbeResult.create(validated)
        return response.json(probe_result, 201)

    @staticmethod
    async def echo(request, response):
        input_data = request.all()
        field_count = len(input_data)
        record = await ProbeResult.create({
            'source': 'endpoint-body',
            'probe': 'echo',
            'payload': json.dumps(input_data, ensure_ascii=False),
            'result': f'Echoed {field_count} field(s) — ControllerBuilder v7.0 body injection ✓',
            'ok': True,
        })
        return response.json({
            'injected': True,
            'builder': 'ControllerBuilder v7.0',
            'method': 'echo',
            'field_count': field_count,
            'echo': input_data,
            'probe_id': record.id,
        })

    @staticmethod
    async def stats(request, response):
        total = await ProbeResult.count()
        passed = await ProbeResult.where('ok', True).count()
        failed = await ProbeResult.where('ok', False).count()
        sources = list(dict.fromkeys(await ProbeResult.query().pluck('source')))
        return response.json({
            'injected': True,
            'builder': 'ControllerBuilder v7.0',
            'method': 'stats',
            'total': total,
            'passed': passed,
            'failed': failed,
            'sources': sources,
        })

    @staticmethod
    async def destroy(request, response):
        probe_result = await ProbeResult.find_or_fail(request.route('id'))
        await probe_result.delete()
        return response.json({'message': "Probe deleted"})


class ProbeUtilController:
    @staticmethod
    async def ping(request, response, *params):
        return response.json({
            'injected': True,
            'builder': 'CustomRouteBuilder v2.0',
            'handler': 'ping',
            'status': 'ok',
            'timestamp': now().isoformat(timespec='seconds'),
            'message': 'CustomRouteBuilder handler body injection confirmed ✓',
        })

    @staticmethod
    async def recordHandler(request, response, *params):
        validated = await request.validate({
            'probe': 'required|string|max:100',
            'payload': 'nullable|string',
            'ok': 'sometimes|boolean',
        })
        record = await ProbeResult.create({
            'source': 'handler-body',
            'probe': validated['probe'],
            'payload': validated.get('payload'),
            'result': 'Recorded via CustomRouteBuilder handler body injection ✓',
            'ok': validated.get('ok') if validated.get('ok') is not None else True,
        })
        return response.json({
            'injected': True,
            'builder': 'CustomRouteBuilder v2.0',
            'handler': 'recordHandler',
            'probe_id': record.id,
            'probe': record.probe,
        })

    @staticmethod
    async def latest(request, response, *params):
        latest = await ProbeResult.latest().take(5).get()
        return response.json({
            'injected': True,
            'builder': 'CustomRouteBuilder v2.0',
            'handler': 'latest',
            'count': len(latest),
            'results': latest,
        })


