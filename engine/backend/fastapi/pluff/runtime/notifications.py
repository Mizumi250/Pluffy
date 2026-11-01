"""Notifications: database (Laravel-compatible table), mail and broadcast channels."""
from __future__ import annotations

import html as _html
import json
import uuid

from .broadcast import broadcast_to
from .database import connection
from .mail import Mailable, render_template, send_mail
from .support import prefixed_table, sql_now

__all__ = ["MailMessage", "Notification", "notify"]


class MailMessage:
    def __init__(self):
        self.subject_ = ""
        self.intro_lines: list[str] = []
        self.outro_lines: list[str] = []
        self.greeting_: str | None = None
        self.salutation_: str | None = None
        self.action_text = ""
        self.action_url = ""
        self._after_action = False

    def subject(self, s: str):
        self.subject_ = s
        return self

    def greeting(self, s: str):
        self.greeting_ = s
        return self

    def line(self, s: str):
        (self.outro_lines if self._after_action else self.intro_lines).append(s)
        return self

    def action(self, text: str, url: str):
        self.action_text, self.action_url = text, url
        self._after_action = True
        return self

    def salutation(self, s: str):
        self.salutation_ = s
        return self

    def html(self) -> str:
        out = f"<p>{self.greeting_}</p>" if self.greeting_ else ""
        out += "".join(f"<p>{line}</p>" for line in self.intro_lines)
        if self.action_url:
            out += (f'<p><a href="{_html.escape(self.action_url, quote=True)}">'
                    f'{_html.escape(self.action_text)}</a></p>')
        out += "".join(f"<p>{line}</p>" for line in self.outro_lines)
        if self.salutation_:
            out += f"<p>{self.salutation_}</p>"
        return out


class Notification:
    tatemono = ""
    channels: list[str] = ["database"]
    channel_type = "private"
    subject = ""
    template = ""

    def __init__(self, notifiable=None, data: dict | None = None):
        self.notifiable = notifiable
        self.data = data or {}

    def via(self, notifiable) -> list[str]:
        return type(self).channels

    def to_mail(self, notifiable):
        C = type(self)
        if not C.template and not C.subject:
            return None
        body = render_template(C.template, {**self.data, "name": getattr(notifiable, "name", None), "email": getattr(notifiable, "email", None)})
        return MailMessage().subject(C.subject).line(body)

    def to_database(self, notifiable) -> dict:
        return {"type": type(self).__name__, **self.data}

    def to_broadcast(self, notifiable) -> dict:
        return self.to_database(notifiable)


async def notify(notifiable, n: Notification) -> None:
    """$user->notify(new X($user)) equivalent. Table: <prefix>_notifications (Laravel-compatible shape)."""
    slug = type(n).tatemono
    for ch in n.via(notifiable):
        if ch == "database":
            db = connection(slug)
            t = prefixed_table(slug, "notifications")
            if db.has_table(t):
                ts = sql_now()
                db.insert(t, {"id": str(uuid.uuid4()), "type": type(n).__name__, "notifiable_type": "user",
                              "notifiable_id": notifiable.id, "data": json.dumps(n.to_database(notifiable), separators=(",", ":")),
                              "read_at": None, "created_at": ts, "updated_at": ts}, pk="id")
        elif ch == "mail":
            m = n.to_mail(notifiable)
            if m and getattr(notifiable, "email", None):
                class _Built(Mailable):
                    def build(self_inner):                       # noqa: N805
                        return {"subject": m.subject_, "html": m.html()}
                await send_mail(notifiable.email, _Built({}))
        elif ch == "broadcast":
            channel_type = getattr(type(n), "channel_type", "private")
            channel = (f"{slug}.notifications" if channel_type == "public"
                       else f"{channel_type}-{slug}.{notifiable.id}")
            broadcast_to(channel, "Illuminate\\Notifications\\Events\\BroadcastNotificationCreated",
                         n.to_broadcast(notifiable))
