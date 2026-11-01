"""Pusher-protocol websocket hub (what Laravel Reverb provides), so laravel-echo / pusher-js frontends
connect unchanged. Public, private (HMAC-signed) and presence channels."""
from __future__ import annotations

import asyncio
import hashlib
import hmac
import json
import random
from http import HTTPStatus

from .support import Log, env

__all__ = ["sign_channel", "broadcast_to", "BroadcastEvent", "broadcast", "start_realtime"]


class _Client:
    def __init__(self, ws):
        self.ws = ws
        self.id = f"{random.randint(0, 10**9 - 1)}.{random.randint(0, 10**9 - 1)}"
        self.channels: set[str] = set()
        self.info: dict[str, dict] = {}


_clients: dict = {}
_channels: dict[str, set[_Client]] = {}
_server = None


def _key() -> str:
    return env("REVERB_APP_KEY", "pluff-key") or "pluff-key"


def _secret() -> str:
    return env("REVERB_APP_SECRET", "pluff-secret") or "pluff-secret"


def sign_channel(socket_id: str, channel: str, channel_data: str | None = None) -> str:
    msg = f"{socket_id}:{channel}:{channel_data}" if channel_data else f"{socket_id}:{channel}"
    return f"{_key()}:{hmac.new(_secret().encode(), msg.encode(), hashlib.sha256).hexdigest()}"


async def _out(ws, event: str, data, channel: str | None = None) -> None:
    msg = {"event": event, **({"channel": channel} if channel else {}), "data": data if isinstance(data, str) else json.dumps(data, separators=(",", ":"))}
    try:
        await ws.send(json.dumps(msg, separators=(",", ":")))
    except Exception:                                    # noqa: BLE001 - closed socket
        pass


def _members(channel: str) -> dict:
    ids, hash_ = [], {}
    for c in _channels.get(channel, ()):
        info = c.info.get(channel)
        if info:
            ids.append(str(info["user_id"]))
            hash_[str(info["user_id"])] = info.get("user_info")
    return {"presence": {"count": len(ids), "ids": ids, "hash": hash_}}


async def _subscribe(c: _Client, msg: dict) -> None:
    ch: str = msg.get("channel", "")
    is_private, is_presence = ch.startswith("private-"), ch.startswith("presence-")
    if is_private or is_presence:
        expected = sign_channel(c.id, ch, msg.get("channel_data") if is_presence else None)
        if msg.get("auth") != expected:
            return await _out(c.ws, "pusher:error", {"code": 4009, "message": "Connection is unauthorized"})
    _channels.setdefault(ch, set()).add(c)
    c.channels.add(ch)
    if is_presence:
        try:
            c.info[ch] = json.loads(msg.get("channel_data"))
        except (TypeError, ValueError):
            pass
        await _out(c.ws, "pusher_internal:subscription_succeeded", _members(ch), ch)
        for o in list(_channels[ch]):
            if o is not c:
                await _out(o.ws, "pusher_internal:member_added", c.info.get(ch), ch)
    else:
        await _out(c.ws, "pusher_internal:subscription_succeeded", {}, ch)


async def _drop(c: _Client) -> None:
    for ch in list(c.channels):
        _channels.get(ch, set()).discard(c)
        if ch.startswith("presence-") and c.info.get(ch):
            for o in list(_channels.get(ch, ())):
                await _out(o.ws, "pusher_internal:member_removed", {"user_id": c.info[ch]["user_id"]}, ch)
        if not _channels.get(ch):
            _channels.pop(ch, None)
    _clients.pop(c.ws, None)


def broadcast_to(channel: str, event: str, data, except_socket_id: str | None = None) -> None:
    targets = [c for c in _channels.get(channel, ()) if c.id != except_socket_id]
    if not targets:
        return
    try:
        loop = asyncio.get_running_loop()
    except RuntimeError:
        Log.warn("broadcast skipped: no running event loop")
        return
    for c in targets:
        loop.create_task(_out(c.ws, event, data, channel))


class BroadcastEvent:
    tatemono = ""
    channel_type = "public"
    channel = ""
    event_name = ""
    user_id = None

    def __init__(self, data: dict | None = None):
        self.data = data or {}


def broadcast(e: BroadcastEvent) -> None:
    """broadcast(SomeEvent(data))"""
    if e.channel_type == "public":
        name = e.channel
    else:
        name = f"{e.channel_type}-{e.channel}" + (f".{e.user_id}" if e.user_id is not None else "")
    broadcast_to(name, e.event_name, e.data)


async def _handler(ws) -> None:
    path = getattr(getattr(ws, "request", None), "path", "") or ""
    if not path.startswith("/app/"):
        await ws.close()
        return
    c = _Client(ws)
    _clients[ws] = c
    await _out(ws, "pusher:connection_established", {"socket_id": c.id, "activity_timeout": 30})
    try:
        async for raw in ws:
            try:
                m = json.loads(raw)
            except ValueError:
                continue
            ev = m.get("event")
            if ev == "pusher:ping":
                await _out(ws, "pusher:pong", {})
            elif ev == "pusher:subscribe":
                await _subscribe(c, m.get("data") or {})
            elif ev == "pusher:unsubscribe":
                ch = (m.get("data") or {}).get("channel")
                _channels.get(ch, set()).discard(c)
                c.channels.discard(ch)
    finally:
        await _drop(c)


def _plain_http(connection, request):
    if request.headers.get("Upgrade", "").lower() != "websocket":
        return connection.respond(HTTPStatus.OK, "pluff realtime\n")
    return None


async def start_realtime() -> None:
    """Starts the hub on REVERB_PORT inside the running event loop (idempotent)."""
    global _server
    if _server is not None:
        return
    try:
        from websockets.asyncio.server import serve
    except ImportError:
        Log.warn("Realtime server not started: install 'websockets'")
        return
    port = int(env("REVERB_PORT", "8080") or 8080)
    try:
        _server = await serve(_handler, "0.0.0.0", port, process_request=_plain_http)
        Log.info(f"Realtime (Pusher protocol) on :{port}")
    except OSError as e:
        Log.warn(f"Realtime server not started: {e}")
