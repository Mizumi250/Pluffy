# ARKZEN GENERATED MODELS: mobile-sdui (FastAPI). Do not edit.
from pluff.runtime import *

class UiRelease(Model):
    table = "mobile_sdui_ui_releases"
    connection_name = "mobile-sdui"
    fillable = ['configuration', 'activate_at']
    casts = {'id': 'integer'}
    timestamps = True
    soft_deletes = False



