# ARKZEN GENERATED NOTIFICATIONS: body-mail-notification
from pluff.runtime import *


class ActionRequiredNotification(Notification):
    tatemono = "body-mail-notification"
    channels = ['mail', 'database']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "You have a pending action that requires your attention.", 'type': "ActionRequiredNotification"}

    def to_mail(self, notifiable):
        import html

        message = getattr(self, 'message', None)
        if message is None:
            message = 'You have a pending action that requires your attention.'
        return (
            MailMessage()
            .subject('⚠ Action Required — toMail_body injection test')
            .greeting('Hello!')
            .line(html.escape(str(message)))
            .line('This toMail() body was injected via the Arkzen DSL — not a stub.')
            .action('Review Now', '/')
            .line('NotificationBuilder v3.9 toMail_body injection confirmed ✓')
        )


class SummaryNotification(Notification):
    tatemono = "body-mail-notification"
    channels = ['mail', 'database']
    channel_type = "private"

    def to_database(self, notifiable):
        return {'message': "Here is your activity summary.", 'type': "SummaryNotification"}

    def to_mail(self, notifiable):
        import html

        message = getattr(self, 'message', None)
        if message is None:
            message = 'Here is your latest activity summary.'
        return (
            MailMessage()
            .subject('📊 Activity Summary — toMail_body injection test')
            .greeting('Hi there!')
            .line(html.escape(str(message)))
            .line('Notifications: 2 unread | Mails: 3 sent | Status: All healthy')
            .action('View Dashboard', '/')
            .salutation('Cheers, Arkzen Engine')
        )


notification_classes = {"action-required": ActionRequiredNotification, "summary": SummaryNotification}
