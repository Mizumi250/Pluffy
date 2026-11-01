# ARKZEN GENERATED CONTROLLERS: job-test
from pluff.runtime import *
from .models import JobResult
import json
import time
from urllib.parse import quote
from .jobs import ProcessDataJob, HeavyComputationJob, AlwaysFailsJob
from .mails import mail_classes
from .notifications import notification_classes
from .realtime import MessageSentEvents


class JobResultController:
    @staticmethod
    async def index(request, response):
        query = JobResult.query().order_by('created_at', 'desc')
        results = await query.paginate(
            request.input('per_page', 15),
            request.input('page', 1),
            request.url(),
        )
        return response.json(results)

    @staticmethod
    async def store(request, response):
        validated = await request.validate({'job': 'required|string'})
        job_class_name = {'process-data': 'ProcessDataJob', 'heavy-computation': 'HeavyComputationJob', 'always-fails': 'AlwaysFailsJob'}.get(str(validated['job']).replace('_', '-'))
        job_class = globals().get(job_class_name) if job_class_name else None
        if job_class is None:
            return response.json({'message': 'Unknown job: ' + str(validated['job'])}, 400)
        job = job_class(request.input('data', {}))
        await dispatch(job)
        return response.json({'message': 'Job dispatched'}, 202)


