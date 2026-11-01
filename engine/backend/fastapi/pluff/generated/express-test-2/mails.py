# ARKZEN GENERATED MAIL: express-test-2
from pluff.runtime import *


class WelcomeMail(Mailable):
    subject = "Welcome to Express parity"
    template = "<p>Welcome to Express parity</p><p>{{ username }}</p><p>{{ app_name }}</p>"

    def __init__(self, username=None, app_name=None):
        super().__init__({"username": username, "app_name": app_name})


mail_classes = {"welcome": WelcomeMail}
