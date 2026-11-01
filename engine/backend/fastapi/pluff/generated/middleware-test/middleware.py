# ARKZEN GENERATED MIDDLEWARE: middleware-test
from pluff.runtime import *
from .models import PingLog


async def _mw_0(request, response, next):
    if not request.is_json():
        return response.json({
            'message': 'Content-Type: application/json is required for this endpoint.',
            'hint': 'Set the Content-Type header to application/json',
        }, 415)
    return await next()


middleware_fns = {"requireJson": _mw_0}
