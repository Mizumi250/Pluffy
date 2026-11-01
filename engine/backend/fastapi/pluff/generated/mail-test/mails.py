# ARKZEN GENERATED MAIL: mail-test
from pluff.runtime import *


class WelcomeMailMail(Mailable):
    subject = "Welcome to Arkzen"
    template = "<p>Welcome to Arkzen</p><p>{{ username }}</p><p>{{ app_name }}</p>"

    def __init__(self, username=None, app_name=None):
        super().__init__({"username": username, "app_name": app_name})


class OrderConfirmationMail(Mailable):
    subject = "Your order has been confirmed"
    template = "<p>Your order has been confirmed</p><p>{{ order_id }}</p><p>{{ total }}</p><p>{{ customer_name }}</p>"

    def __init__(self, order_id=None, total=None, customer_name=None):
        super().__init__({"order_id": order_id, "total": total, "customer_name": customer_name})


class PasswordResetMail(Mailable):
    subject = "Reset your password"
    template = "<p>Reset your password</p><p>{{ reset_link }}</p><p>{{ expires_in }}</p>"

    def __init__(self, reset_link=None, expires_in=None):
        super().__init__({"reset_link": reset_link, "expires_in": expires_in})


mail_classes = {"welcome-mail": WelcomeMailMail, "order-confirmation": OrderConfirmationMail, "password-reset": PasswordResetMail}
