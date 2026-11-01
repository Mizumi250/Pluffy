# ARKZEN GENERATED MIDDLEWARE: fastapi-test
from pluff.runtime import *
from .models import User, Ticket, JobResult, EventLog


async def _mw_0(request, response, next):
    if not request.is_json():
        return response.json({'message': 'Content-Type: application/json is required.'}, 415)
    return await next()


middleware_fns = {"requireJson": _mw_0}
