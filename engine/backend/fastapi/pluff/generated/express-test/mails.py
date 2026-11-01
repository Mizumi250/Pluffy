# ARKZEN GENERATED MAIL: express-test
from pluff.runtime import *


class WelcomeMailMail(Mailable):
    subject = "Welcome to Pluff"
    template = "<p>Welcome to Pluff</p><p>{{ username }}</p><p>{{ app_name }}</p>"

    def __init__(self, username=None, app_name=None):
        super().__init__({"username": username, "app_name": app_name})


mail_classes = {"welcome-mail": WelcomeMailMail}
