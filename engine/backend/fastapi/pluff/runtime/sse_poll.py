"""Lynx realtime poll: GET /api/<slug>/sse-poll/<public|private|presence>?after_id=N

Same contract as Laravel's LynxSseBridgeController::poll(): 404 for an unknown channel type, 401 for
private/presence without a user, public = channel_type 'public' or NULL, private/presence = exact
match, ordered by id, 50 rows max, response {"messages": [{"event", "data"}], "last_id"}.
"""
from __future__ import annotations

__all__ = ["poll_broadcast_messages"]

_CHANNEL_TYPES = ("public", "private", "presence")


def _after_id(raw) -> int:
    try:
        return max(int(raw or 0), 0)
    except (TypeError, ValueError):
        return 0                                   # PHP (int) cast: junk becomes 0


async def poll_broadcast_messages(request, response, model, events: dict, channel_type: str):
    if channel_type not in _CHANNEL_TYPES:
        return response.json({"message": "Not Found"}, 404)
    if channel_type != "public" and not await request.auth_user():
        return response.json({"message": "Unauthenticated."}, 401)

    after_id = _after_id(request.query("after_id", 0))
    query = model.query()
    if channel_type == "public":
        query = query.where(lambda group: group.where("channel_type", "public").or_where("channel_type", None))
    else:
        query = query.where("channel_type", channel_type)
    rows = await query.where("id", ">", after_id).order_by("id").limit(50).get()

    data = [row.to_json() for row in rows]
    last_id = int(data[-1]["id"]) if data else after_id
    return response.json({
        "messages": [{"event": events.get(channel_type), "data": row} for row in data],
        "last_id": last_id,
    })
