# ARKZEN GENERATED NOTIFICATIONS: fastapi-test
from pluff.runtime import *


class DbPingNotification(Notification):
    tatemono = "fastapi-test"
    channels = ['database']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "You have a new database notification", 'type': "DbPingNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject("DB Ping").line("You have a new database notification")


notification_classes = {"db-ping": DbPingNotification}
