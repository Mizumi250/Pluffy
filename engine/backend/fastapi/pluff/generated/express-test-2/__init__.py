# ARKZEN GENERATED MODULE ENTRY: express-test-2
from .routes import build_router
from .events import RecordCreated, LogRecordCreated, CountRecords

name = "express-test-2"
router = build_router()
jobs = {}
listeners = {"LogRecordCreated": LogRecordCreated, "CountRecords": CountRecords}
events = {"RecordCreated": RecordCreated}
listener_map = {'RecordCreated': ['LogRecordCreated', 'CountRecords']}
commands = []
