# ARKZEN GENERATED MAIL: mail-test
from pluff.runtime import *


class WelcomeMail(Mailable):
    subject = "Welcome to Arkzen"
    template = "<p>Welcome, {{ username }}!</p>\r\n<p>Thanks for joining {{ app_name }}.</p>"

    def __init__(self, username=None, app_name=None):
        super().__init__({"username": username, "app_name": app_name})


class OrderConfirmationMail(Mailable):
    subject = "Your order has been confirmed"
    template = "<p>Hi {{ customer_name }},</p>\r\n<p>Your order {{ order_id }} has been confirmed.</p>\r\n<p>Total: {{ total }}</p>"

    def __init__(self, order_id=None, total=None, customer_name=None):
        super().__init__({"order_id": order_id, "total": total, "customer_name": customer_name})


class PasswordResetMail(Mailable):
    subject = "Reset your password"
    template = "<p>Use this link to reset your password:</p>\r\n<p><a href=\"{{ reset_link }}\">Reset password</a></p>\r\n<p>This link expires in {{ expires_in }}.</p>"

    def __init__(self, reset_link=None, expires_in=None):
        super().__init__({"reset_link": reset_link, "expires_in": expires_in})


mail_classes = {"welcome-mail": WelcomeMail, "order-confirmation": OrderConfirmationMail, "password-reset": PasswordResetMail}
