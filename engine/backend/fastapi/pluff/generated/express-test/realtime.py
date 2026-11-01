# ARKZEN GENERATED REALTIME: express-test
from pluff.runtime import *


class MessageSentPublic(BroadcastEvent):
    tatemono = "express-test"
    channel_type = "public"
    channel = "express-test-public"
    event_name = "express-test.message-sent-public"


MessageSentEvents = {"public": MessageSentPublic}
