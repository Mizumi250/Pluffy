# ARKZEN GENERATED MODELS: mail-test (FastAPI). Do not edit.
from pluff.runtime import *

User = user_model_for("mail-test")


class MailLog(Model):
    table = "mail_test_mail_logs"
    connection_name = "mail-test"
    fillable = ['user_id', 'to_email', 'subject', 'mail_class', 'status', 'error']
    casts = {'id': 'integer', 'user_id': 'integer'}
    timestamps = True
    soft_deletes = False



