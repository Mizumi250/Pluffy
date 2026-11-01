# ARKZEN GENERATED MAIL: body-mail-notification
from pluff.runtime import *


class WelcomeMail(Mailable):
    subject = "Welcome to Arkzen — blade_body injection test"
    template = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #f8fafc; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; box-shadow: 0 2px 12px rgba(0,0,0,.08); }\r\n    h1 { font-size: 22px; color: #1e293b; margin-bottom: 8px; }\r\n    p { color: #475569; line-height: 1.6; }\r\n    .badge { display: inline-block; background: #0f172a; color: #fff; border-radius: 6px; padding: 4px 12px; font-size: 12px; margin-top: 16px; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>Welcome, {{ name }}!</h1>\r\n    <p>You are now part of <strong>{{ app_name }}</strong>. This email was generated from a <code>blade_body</code> block injected via the Arkzen DSL — no manually created Blade file required.</p>\r\n    <span class=\"badge\">✓ blade_body injection works</span>\r\n  </div>\r\n</body>\r\n</html>"

    def __init__(self, name=None, app_name=None):
        super().__init__({"name": name, "app_name": app_name})


class ReceiptMail(Mailable):
    subject = "Your receipt — blade_body injection test"
    template = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #f0fdf4; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border: 1px solid #bbf7d0; }\r\n    h1 { color: #15803d; font-size: 20px; }\r\n    table { width: 100%; border-collapse: collapse; margin-top: 16px; }\r\n    td { padding: 8px 0; border-bottom: 1px solid #f0fdf4; color: #374151; }\r\n    td:last-child { text-align: right; font-weight: 600; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>🧾 Receipt #{{ order_id }}</h1>\r\n    <table>\r\n      <tr><td>Item</td><td>{{ item_name }}</td></tr>\r\n      <tr><td>Amount</td><td>{{ amount }}</td></tr>\r\n      <tr><td>Status</td><td>✅ Paid</td></tr>\r\n    </table>\r\n    <p style=\"margin-top:16px;font-size:12px;color:#6b7280;\">blade_body injected receipt — no stub used.</p>\r\n  </div>\r\n</body>\r\n</html>"

    def __init__(self, order_id=None, amount=None, item_name=None):
        super().__init__({"order_id": order_id, "amount": amount, "item_name": item_name})


class AlertMail(Mailable):
    subject = "⚠ Action Required — blade_body injection test"
    template = "<!DOCTYPE html>\r\n<html lang=\"en\">\r\n<head>\r\n  <meta charset=\"UTF-8\">\r\n  <style>\r\n    body { font-family: sans-serif; background: #fff7ed; margin: 0; padding: 32px; }\r\n    .card { background: #fff; border-radius: 12px; padding: 32px; max-width: 520px; margin: auto; border-left: 4px solid #f97316; }\r\n    h1 { color: #c2410c; font-size: 18px; }\r\n    p { color: #374151; }\r\n    a { display: inline-block; margin-top: 16px; background: #f97316; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none; font-weight: 600; }\r\n  </style>\r\n</head>\r\n<body>\r\n  <div class=\"card\">\r\n    <h1>⚠ Action Required</h1>\r\n    <p>{{ alert_message }}</p>\r\n    <a href=\"{{ action_url }}\">Take Action</a>\r\n    <p style=\"margin-top:16px;font-size:12px;color:#9ca3af;\">Injected via blade_body — MailBuilder v3.1 test.</p>\r\n  </div>\r\n</body>\r\n</html>"

    def __init__(self, alert_message=None, action_url=None):
        super().__init__({"alert_message": alert_message, "action_url": action_url})


mail_classes = {"welcome": WelcomeMail, "receipt": ReceiptMail, "alert": AlertMail}
