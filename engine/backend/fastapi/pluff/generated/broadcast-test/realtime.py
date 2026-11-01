# ARKZEN GENERATED REALTIME: broadcast-test
from pluff.runtime import *


class MessageSentPublic(BroadcastEvent):
    tatemono = "broadcast-test"
    channel_type = "public"
    channel = "broadcast-test-public"
    channel_has_id = False
    event_name = "broadcast-test.message-sent-public"


class MessageSentPrivate(BroadcastEvent):
    tatemono = "broadcast-test"
    channel_type = "private"
    channel = "broadcast-test"
    channel_has_id = True
    event_name = "broadcast-test.message-sent-private"


class MessageSentPresence(BroadcastEvent):
    tatemono = "broadcast-test"
    channel_type = "presence"
    channel = "broadcast-test-presence"
    channel_has_id = False
    event_name = "broadcast-test.message-sent-presence"


MessageSentEvents = {"public": MessageSentPublic, "private": MessageSentPrivate, "presence": MessageSentPresence}
