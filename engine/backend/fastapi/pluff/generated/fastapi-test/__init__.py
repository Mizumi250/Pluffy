# ARKZEN GENERATED MODULE ENTRY: fastapi-test
from .routes import build_router
from .jobs import ProcessDataJob, RecordResultJob
from .events import TicketCreated, LogTicket, CountTicket
from .commands import Ping

name = "fastapi-test"
router = build_router()
jobs = {"ProcessDataJob": ProcessDataJob, "RecordResultJob": RecordResultJob}
listeners = {"LogTicket": LogTicket, "CountTicket": CountTicket}
events = {"TicketCreated": TicketCreated}
listener_map = {'TicketCreated': ['LogTicket', 'CountTicket']}
commands = [Ping]
