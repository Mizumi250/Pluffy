# ARKZEN GENERATED REALTIME: queue-flow
from pluff.runtime import *


class QueueUpdated(BroadcastEvent):
    tatemono = "queue-flow"
    channel_type = "public"
    channel = "queue-flow.{queueId}"
    event_name = "queue-flow.queue-updated"


MessageSentEvents = {"public": QueueUpdated}
