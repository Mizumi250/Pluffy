# ARKZEN GENERATED NOTIFICATIONS: express-test-2
from pluff.runtime import *


class RecordAlertNotification(Notification):
    tatemono = "express-test-2"
    channels = ['database', 'mail', 'broadcast']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "A record needs your attention", 'type': "RecordAlertNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject("Record alert").line("A record needs your attention")


notification_classes = {"record-alert": RecordAlertNotification}
