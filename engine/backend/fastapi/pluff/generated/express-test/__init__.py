# ARKZEN GENERATED MODULE ENTRY: express-test
from .routes import build_router
from .jobs import ProcessDataJob
from .events import TicketCreated, LogTicket, CountTicket

name = "express-test"
router = build_router()
jobs = {"ProcessDataJob": ProcessDataJob}
listeners = {"LogTicket": LogTicket, "CountTicket": CountTicket}
events = {"TicketCreated": TicketCreated}
listener_map = {'TicketCreated': ['LogTicket', 'CountTicket']}
commands = []
