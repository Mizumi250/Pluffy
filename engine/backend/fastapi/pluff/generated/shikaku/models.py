# ARKZEN GENERATED MODELS: shikaku (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("shikaku")


class ShikakuProject(Model):
    table = "shikaku_projects"
    connection_name = "shikaku"
    fillable = ['user_id', 'name', 'width', 'height', 'thumbnail']
    casts = {'id': 'integer', 'user_id': 'integer', 'width': 'integer', 'height': 'integer'}
    timestamps = True
    soft_deletes = False



class ShikakuSave(Model):
    table = "shikaku_saves"
    connection_name = "shikaku"
    fillable = ['project_id', 'frames_json', 'version']
    casts = {'id': 'integer', 'project_id': 'integer', 'version': 'integer'}
    timestamps = True
    soft_deletes = False



