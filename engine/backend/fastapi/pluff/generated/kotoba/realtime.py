# ARKZEN GENERATED REALTIME: kotoba
from pluff.runtime import *


class MessageCreated(BroadcastEvent):
    tatemono = "kotoba"
    channel_type = "private"
    channel = "kotoba"
    event_name = "kotoba.message-created"


class AlertCreated(BroadcastEvent):
    tatemono = "kotoba"
    channel_type = "private"
    channel = "kotoba"
    event_name = "kotoba.alert-created"


MessageSentEvents = {"private": MessageCreated}
