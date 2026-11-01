# ARKZEN GENERATED MODULE ENTRY: job-test
from .routes import build_router
from .jobs import ProcessDataJob, HeavyComputationJob, AlwaysFailsJob

name = "job-test"
router = build_router()
jobs = {"ProcessDataJob": ProcessDataJob, "HeavyComputationJob": HeavyComputationJob, "AlwaysFailsJob": AlwaysFailsJob}
listeners = {}
events = {}
listener_map = {}
commands = []
