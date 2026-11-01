# ARKZEN GENERATED NOTIFICATIONS: notification-test
from pluff.runtime import *


class DatabasePingNotification(Notification):
    tatemono = "notification-test"
    channels = ['database']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "You have a new database notification", 'type': "DatabasePingNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject('Database Ping').line('You have a new database notification')


class MailPingNotification(Notification):
    tatemono = "notification-test"
    channels = ['mail']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "This is a test mail notification", 'type': "MailPingNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject('Mail Ping from Arkzen').line('This is a test mail notification')


class BroadcastPingNotification(Notification):
    tatemono = "notification-test"
    channels = ['broadcast', 'database']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "Real-time notification received on your private channel!", 'type': "BroadcastPingNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject('Broadcast Ping (Private)').line('Real-time notification received on your private channel!')


class BroadcastPingPublicNotification(Notification):
    tatemono = "notification-test"
    channels = ['broadcast', 'database']
    channel_type = "public"

    def to_database(self, notifiable):
        return {'message': "This broadcast went to the public notification channel!", 'type': "BroadcastPingPublicNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject('Broadcast Ping (Public)').line('This broadcast went to the public notification channel!')


class AllChannelsNotification(Notification):
    tatemono = "notification-test"
    channels = ['database', 'mail', 'broadcast']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "This notification was sent to all three channels simultaneously", 'type': "AllChannelsNotification"}

    def to_mail(self, notifiable):
        return MailMessage().subject('All Channels Test').line('This notification was sent to all three channels simultaneously')


notification_classes = {"database-ping": DatabasePingNotification, "mail-ping": MailPingNotification, "broadcast-ping": BroadcastPingNotification, "broadcast-ping-public": BroadcastPingPublicNotification, "all-channels": AllChannelsNotification}
