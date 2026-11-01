# ARKZEN GENERATED MODELS: body-mail-notification (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("body-mail-notification")


class SendLog(Model):
    table = "body_mail_notification_send_log"
    connection_name = "body-mail-notification"
    fillable = ['user_id', 'to_email', 'subject', 'mail_class', 'kind', 'status', 'error']
    casts = {'id': 'integer', 'user_id': 'integer'}
    timestamps = True
    soft_deletes = False



