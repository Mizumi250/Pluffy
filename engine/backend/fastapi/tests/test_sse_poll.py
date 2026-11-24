"""End-to-end test for the Lynx realtime poll route (GET /api/<slug>/sse-poll/<type>?after_id=N).
Runs the real generator, routes and database. Contract = Laravel's LynxSseBridgeController::poll().

    cd engine/backend/fastapi && python -m pytest tests/test_sse_poll.py -q
"""
import asyncio
import json
import os
import pathlib

import pytest

os.environ.setdefault("ARKZEN_DB_DRIVER", "sqlite")

from fastapi.testclient import TestClient          # noqa: E402

from pluff.engine.build import build_tatemono, remove_tatemono   # noqa: E402
from pluff.runtime.database import drop_database                  # noqa: E402
from pluff.server import app                                      # noqa: E402

SLUG = "sse-poll-selftest"
POLL = f"/api/{SLUG}/sse-poll"
MESSAGES = f"/api/{SLUG}/messages"


@pytest.fixture(scope="module")
def client():
    payload = json.loads(pathlib.Path(__file__).with_name("broadcast-payload.json").read_text())
    payload["backend"], payload["backendVariant"] = "fastapi", "py"
    raw = json.dumps(payload).replace("broadcast-test", SLUG)
    status, body = asyncio.run(build_tatemono(json.loads(raw)))
    assert status == 200, body
    with TestClient(app, base_url="http://testserver") as c:
        yield c
    asyncio.run(remove_tatemono({"name": SLUG}))
    drop_database(SLUG)


def _token(client):
    res = client.post(f"/api/{SLUG}/auth/register", json={
        "name": "Poller", "email": "poller@example.test", "password": "hunter2hunter2",
        "password_confirmation": "hunter2hunter2"})
    assert res.status_code in (200, 201), res.text
    return res.json()["token"]


def test_poll_contract(client):
    token = _token(client)
    auth = {"Authorization": f"Bearer {token}", "Accept": "application/json"}

    # unknown channel type -> 404, private/presence without a user -> 401
    assert client.get(f"{POLL}/nope").status_code == 404
    assert client.get(f"{POLL}/private").status_code == 401
    assert client.get(f"{POLL}/presence").status_code == 401

    # empty public poll
    empty = client.get(f"{POLL}/public").json()
    assert empty == {"messages": [], "last_id": 0}

    for content, channel in (("a", "public"), ("b", "private"), ("c", "public")):
        res = client.post(MESSAGES, json={"content": content, "channel_type": channel}, headers=auth)
        assert res.status_code == 201, res.text

    public = client.get(f"{POLL}/public").json()
    assert [m["data"]["content"] for m in public["messages"]] == ["a", "c"]
    assert public["messages"][0]["event"] == f"{SLUG}.message-sent-public"
    assert public["last_id"] == public["messages"][-1]["data"]["id"]

    # after_id skips what the client already has; junk after_id behaves like 0
    after = client.get(f"{POLL}/public?after_id={public['messages'][0]['data']['id']}").json()
    assert [m["data"]["content"] for m in after["messages"]] == ["c"]
    assert len(client.get(f"{POLL}/public?after_id=junk").json()["messages"]) == 2

    # private = exact match, needs the token
    private = client.get(f"{POLL}/private", headers=auth).json()
    assert [m["data"]["content"] for m in private["messages"]] == ["b"]
    assert private["messages"][0]["event"] == f"{SLUG}.message-sent-private"
