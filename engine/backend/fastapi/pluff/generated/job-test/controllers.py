# ARKZEN GENERATED CONTROLLERS: job-test
from pluff.runtime import *
from .models import JobResult
import json
import time
from urllib.parse import quote
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class JobResultController:
    @staticmethod
    async def index(request, response):
        query = JobResult.query()
        return response.json(await query.order_by('created_at', 'desc').paginate(request.input('per_page', 15), request.input('page', 1), request.url()))

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'job': 'required|string'})
        job_result = await JobResult.create(validated)
        return response.json(job_result, 201)


