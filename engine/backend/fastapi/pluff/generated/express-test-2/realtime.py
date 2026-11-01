# ARKZEN GENERATED REALTIME: express-test-2
from pluff.runtime import *


class RecordCreated(BroadcastEvent):
    tatemono = "express-test-2"
    channel_type = "public"
    channel = "express-test-2-public"
    event_name = "express-test-2.record-created"


MessageSentEvents = {"public": RecordCreated}
