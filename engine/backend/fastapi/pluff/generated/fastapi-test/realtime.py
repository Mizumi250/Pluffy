# ARKZEN GENERATED REALTIME: fastapi-test
from pluff.runtime import *


class MessageSentPublic(BroadcastEvent):
    tatemono = "fastapi-test"
    channel_type = "public"
    channel = "fastapi-test-public"
    channel_has_id = False
    event_name = "fastapi-test.message-sent-public"


MessageSentEvents = {"public": MessageSentPublic}
